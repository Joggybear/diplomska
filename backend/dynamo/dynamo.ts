import {
    Logger,
    NotFound,
    InternalServerError
} from "tyx";

import { DynamoDB } from "aws-sdk";

import Marshaler = require("dynamodb-marshaler");

type FieldTag = true | false | string;
type FieldDef = { map?: string, req: boolean };
type HashDef = { hash: true, map?: string };
type RangeDef = { range: true, map?: string };
type ObjectSchema = Record<string, FieldType>;
type ObjectDef = { map?: string, req: boolean, schema: ObjectSchema };

export type FieldType =
    | { S: HashDef | RangeDef }
    | { N: HashDef | RangeDef }
    | { S: FieldTag | FieldDef }
    | { N: FieldTag | FieldDef }
    | { BOOL: FieldTag | FieldDef }
    | { NULL: FieldTag | FieldDef }
    | { ANY: FieldTag | FieldDef }
    | { M: ObjectSchema | ObjectDef };

export interface Schema {
    [field: string]: FieldType;
}

export interface RecordSchema extends Schema {
    // System segment
    Version?: { N: true };
    Created?: { S: true };
    Updated?: { S: false };
}

export interface SchemaField {
    map: string;
    req: boolean;
    hash?: true;
    range?: true;
    schema?: ObjectSchema;
}

export interface HashInfo { name: string; type: string; def: HashDef; }
export interface RangeInfo { name: string; type: string; def: RangeDef; }

export type DynamoType = any;
export type DeleteResult = DynamoDB.DeleteItemOutput;
export type SaveResult = DynamoDB.PutItemOutput;

export class SchemaError extends InternalServerError {
    constructor(path: string, message: string) {
        super(`Invalid schema [${path}]: ${message}`);
    }
}

export class MarshalError extends InternalServerError {
    constructor(path: string, message: string) {
        super(`Invalid object [${path}]: ${message}`);
    }
}

interface BaseRecord {
    version: number;
    created?: string;
    updated?: string;
    deleted?: boolean;
}

export abstract class Repository<T extends BaseRecord, H extends (string | number), R extends (string | number | void)> {
    protected log: Logger;

    protected readonly db: DynamoDB;
    public readonly stage: string;
    public readonly table: string;
    public readonly tableName: string;
    public readonly schema: Schema;

    public readonly hashKey: HashInfo;
    public readonly rangeKey: RangeInfo;

    constructor(stage: string, table: string, schema: RecordSchema) {
        this.db = new DynamoDB();
        this.log = Logger.get("dynamo", this);

        this.stage = stage;
        this.table = table;
        this.tableName = stage + "-" + table;
        try {
            this.schema = JSON.parse(JSON.stringify(schema));
            Object.assign(this.schema, {
                Version: { N: true },
                Created: { S: true },
                Updated: { S: false },
                Deleted: { BOOL: false }
            });
        } catch (e) {
            throw new SchemaError("", "Schema must be valid JSON");
        }
        let keys = Repository.validate(this.schema);

        this.hashKey = keys.hash;
        this.rangeKey = keys.range;
    }

    public marshal(json: T): any {
        return Repository.marshal(this.schema, json);
    }

    public unmarshal(data: DynamoType): T {
        return Repository.unmarshal<T>(this.schema, data);
    }

    public static nextVer(): number {
        return Date.now() * 10000 + Math.floor((process.hrtime()[1] % 1000000) / 100);
    }

    protected async _load(hash: H, range: R): Promise<T> {
        // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#getItem-property

        let key = {};
        key[this.hashKey.name] = { [this.hashKey.type]: hash };
        if (this.rangeKey) key[this.rangeKey.name] = { [this.rangeKey.type]: range };
        console.log('KEY = ', key);
        console.log('HASH = ', hash);
        console.log('RANGE = ', range);
        console.log('TABLE NAME = ', this.tableName);
        console.log("SCHEMA = ", this.schema);
        let res = await this.db.getItem({
            TableName: this.tableName,
            Key: key,
        }).promise();

        let item = res && res.Item;
        console.log('ITEM = ', item);
        if (!item) throw new NotFound(this.rangeKey
            ? `${this.table} Hash: [${hash}], Range: [${range}] not found`
            : `${this.table} Hash: [${hash}] not found`);

        let result: T = this.unmarshal(res.Item);

        return result;
    }

    protected async _save(json: T): Promise<SaveResult> {
        // TODO: Version check and update timestamp
        if (!json.version) {
            json.created = new Date().toISOString();
            json.updated = null;
        } else {
            json.updated = new Date().toISOString();
        }

        json.version = Repository.nextVer();

        let item = this.marshal(json);

        // TODO: Check keys are not null
        let res: SaveResult = await this.db.putItem({
            TableName: this.tableName,
            // TODO: Version check
            Item: item
        }).promise();

        return res;
    }

    protected async _delete(json: T): Promise<DeleteResult> {
        let hash = json[this.hashKey.def.map];
        let range = (this.rangeKey) ? json[this.rangeKey.def.map] : undefined;

        // TODO: Check version
        // let version = json.version;

        let key;

        if (this.rangeKey) {
            key = {
                [this.hashKey.name]: { [this.hashKey.type]: hash },
                [this.rangeKey.name]: { [this.rangeKey.type]: range }
            };
        } else {
            key = { [this.hashKey.name]: { [this.hashKey.type]: hash } };
        }

        let res: DeleteResult = await this.db.deleteItem({
            TableName: this.tableName,
            Key: key,
            ReturnValues: "ALL_OLD"
        }).promise();

        return res;
    }


    // ==== Static ===========================================================

    // TODO: Types for dynamo object

    public static marshal<T>(schema: Schema, json: T, data?: DynamoType): DynamoType {
        data = data || {};

        // TODO: Optional params
        // Check for required ...
        // Type check, e.g. string for num or bool
        for (let name in schema) {
            let field: FieldType = schema[name];
            let type: string = field["$type"];
            let path: string = field["$jpath"];
            let def: SchemaField = field[type];

            let value = json[def.map];
            if (value === "") value = null;
            let result = value;

            if (def.req && !value && value !== false && value !== 0)
                throw new MarshalError(path, `Required property missing value [${value}]`);

            // Skip properties that are not part of the input
            if (!def.req && value === undefined) continue;

            if (type === "M" && value) {
                result = Repository.marshal(def.schema, value, {});
                result = { M: result };
            } else if (type === "M" && !value) {
                result = { NULL: true };
            } else {
                result = Marshaler.marshal(value);
            }

            let resType = Object.keys(result)[0];
            let expType = type; // type === "ANY" ? "ANY" : type;
            // let resVal = result[expType];

            if (expType !== "ANY" && expType !== resType && resType !== "NULL")
                throw new MarshalError(path, `Type mismatch, expexted [${type}] found [${resType}]`);

            // TODO: Type conversion ????
            // TODO: List all exceptions ..... ????

            data[name] = result;
        }
        return data;
    }

    public static unmarshal<T>(schema: Schema, data: DynamoType, json?: T): T {
        json = json || {} as T;

        // TODO: Optional params
        // Check for required ...
        // Type check, e.g. string for num or bool
        for (let name in schema) {
            let value = data[name];
            if (value === undefined) continue;

            let field: FieldType = schema[name];
            let type: string = field["$type"];
            // let path: string = field["$spath"];
            let def: SchemaField = field[type];
            let map = def.map;

            if (type === "M" && value[type]) {
                value = Repository.unmarshal(def.schema, value[type], {});
                json[map] = value;
                continue;
            }

            value = Marshaler.unmarshal(value);
            // TODO Check constraints ....
            json[map] = value;
        }
        return json;
    }

    public static validate(schema: Schema, schemaPath?: string, jsonPath?: string): { hash: HashInfo, range: RangeInfo } {
        let hash: HashInfo;
        let range: RangeInfo;

        for (let name in schema) {
            let spath = schemaPath ? schemaPath + "." + name : name;
            let field: (FieldType & any) = schema[name];

            let keys = Object.getOwnPropertyNames(field);
            if (keys.length !== 1) throw new SchemaError(spath, "Single attribute expected");
            let type = keys[0];
            switch (type) {
                case "S":
                case "N":
                case "BOOL":
                case "NULL":
                case "M":
                case "ANY":
                    break;
                default: throw new SchemaError(spath, `Unknown type [${type}]`);
            }

            let def = field[type];

            if (type !== "M" && def === true) def = { map: null, req: true };
            else if (type !== "M" && def === false) def = { map: null, req: false };
            else if (type !== "M" && typeof def === "string") def = { map: def, req: true };
            else if (type === "M" && typeof def !== "object") new SchemaError(spath, "Object defintion expected");
            else if (type === "M" && !def.schema) def = { map: null, req: true, schema: def };

            if (!def.map) def.map = name.substring(0, 1).toLowerCase() + name.substring(1);
            if (def.req === undefined) def.req = true;
            field[type] = def;

            let jpath = jsonPath ? jsonPath + "." + def.map : def.map;

            // Hidden helper property
            Object.defineProperty(field, "$type", { enumerable: false, value: type });
            Object.defineProperty(field, "$spath", { enumerable: false, value: spath });
            Object.defineProperty(field, "$jpath", { enumerable: false, value: jpath });

            if (type === "S" || type === "N") {
                if (def.hash) {
                    def.req = true;
                    if (schemaPath) throw new SchemaError(spath, "HASH key definition allowed on top level only");
                    if (hash) throw new SchemaError(spath, "Duplicate HASH key definition");
                    hash = { name, type, def };
                }
                if (def.range) {
                    def.req = true;
                    if (schemaPath) throw new SchemaError(spath, "RANGE key definition allowed on top level only");
                    if (range) throw new SchemaError(spath, "Duplicate RANGE key definition");
                    range = { name, type, def };
                }
            }

            if (def.schema)
                Repository.validate(def.schema, spath, jpath);
        }

        if (schemaPath) return undefined;

        if (!hash) throw new SchemaError("/", "HASH key must be defiened");
        if (range && !hash) throw new SchemaError("/", "RANGE key defined without HASH key");

        return { hash, range };
    }
}

export abstract class HashRepository<
    T extends BaseRecord,
    H extends (string | number)
    > extends Repository<T, H, void> {

    public async load(hash: H): Promise<T> {
        return this._load(hash, undefined);
    }

    public async save(json: T): Promise<SaveResult> {
        return this._save(json);
    }

    public async delete(json: T): Promise<DeleteResult> {
        return this._delete(json);
    }
}

export abstract class RangeRepository<
    T extends BaseRecord,
    H extends (string | number),
    R extends (string | number)
    > extends Repository<T, H, R> {

    public async load(hash: H, range: R): Promise<T> {
        return this._load(hash, range);
    }

    public async save(json: T): Promise<SaveResult> {
        return this._save(json);
    }

    public async delete(json: T): Promise<DeleteResult> {
        return this._delete(json);
    }
}
