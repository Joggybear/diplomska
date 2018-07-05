import { AwsContainer } from "./aws";
import { CommentService } from "../services";

export const container = new AwsContainer()
    .publish(CommentService);

export const lambda = container.export();
