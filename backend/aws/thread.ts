import { AwsContainer } from "./aws";
import { ThreadService } from "../services";

export const container = new AwsContainer()
    .publish(ThreadService);

export const lambda = container.export();
