import {
    RecordSchema,
    HashRepository,
    RangeRepository
} from '../../dynamo';

import {
    CommentItem,
    CommentList,
    ThreadItem
} from '../../api';


const threadSchema: RecordSchema = {
    ThreadId: { S: { hash: true } },
    Title: { S: true },
    Content: { S: true },
    CommentCount: { N: true },
    Creator: { S: true },
    CreatorId: { S: true }
}

const commentSchema: RecordSchema = {
    CommentId: { S: { hash: true } },
    ThreadId: { S: { range: true } },
    Content: { S: true },
    Creator: { S: true },
    CreatorId: { S: true }
}

export class CommentRepository extends RangeRepository<CommentItem, string, string> {
    constructor(stage: string) {
        super(stage, 'Comment', commentSchema);
    }

    public async query(query: Record<string, string>): Promise<CommentList> {
        let queryIndexParams: any = {
            TableName: this.tableName
        }

        if (query && query.search) {
            queryIndexParams.FilterExpression = "contains(#content, :s)"
            queryIndexParams.ExpressionAttributeNames = {
                "#content": "Content"
            }
            queryIndexParams.ExpressionAttributeValues = {
                ":s": { S: query.search }
            }
        }

        let queryRes = await this.db.scan(queryIndexParams).promise();
        let result: CommentList = {
            query,
            items: queryRes.Items.map((item: any) => {
                let comment: CommentItem = this.unmarshal(item);
                return comment;
            })
        };

        return result;
    }
    public async getLastComment(threadId: string): Promise<CommentItem> {

        let queryParams = {
            TableName: this.tableName,
            IndexName: "Thread-index",
            KeyConditionExpression: "ThreadId = :threadId",
            ScanIndexForward: true,
            ExpressionAttributeValues: { ":threadId": { S: threadId } }
        };

        let queryRes = await this.db.query(queryParams).promise();

        let comments = queryRes.Items.map((res: any) => {
            let comment: CommentItem = this.unmarshal(res);
            return comment;
        });

        comments.sort((a, b) => {
            return +new Date(b.created) - +new Date(a.created);
        });

        return comments ? comments[0] : null;
    }
}

export class ThreadRepository extends HashRepository<ThreadItem, string> {
    constructor(stage: string) {
        super(stage, 'Thread', threadSchema);
    }

    public async onCommentChange(comment: CommentItem, operation: string, count: number): Promise<ThreadItem> {

        if (operation === "ADD") count += 1;
        else if (operation === "REMOVE") count -= 1;

        let updateParams: any = {
            TableName: this.tableName,
            Key: { ThreadId: { S: comment.threadId } },
            UpdateExpression: "SET #commentCount = :commentCount, #lastDate = :lastDate, #lastUser = :lastUser",
            ExpressionAttributeNames: {
                "#commentCount": "CommentCount",
                "#lastDate": "LastDate",
                "#lastUser": "LastUser"
            },
            ExpressionAttributeValues: {
                ":commentCount": {
                    N: count.toString()
                },
                ":lastDate": {
                    S: comment.created
                },
                ":lastUser": {
                    S: comment.creator
                }
            },
            ReturnValues: "ALL_NEW"
        };

        let updated = await this.db.updateItem(updateParams).promise();
        let thread = await this.unmarshal(updated.Attributes);

        return thread;
    }
}
