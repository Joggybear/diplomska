import {
    Service,
    Configuration
} from "tyx";

export const ConfigApi = Configuration;

export interface ConfigApi extends Service, Configuration {

    // DynamoDB
    stage: string;
}
