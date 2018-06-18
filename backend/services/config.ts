import {
    Service,
    BaseConfiguration
} from "tyx";

import {
    ConfigApi,
} from "../api";

@Service(ConfigApi)
export class ConfigService extends BaseConfiguration implements ConfigApi {

    constructor(config?: Record<string, any>) {
        super(config);
    }

    // DynamoDB
    get stage() { return this.config.STAGE; }
}