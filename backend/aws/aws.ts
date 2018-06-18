import { LambdaContainer } from "tyx";
import { ConfigService } from "../services/config";

export class AwsContainer extends LambdaContainer {
    constructor(config?: any) {
        super('TINO');
        this.register(ConfigService, config);
    }
}