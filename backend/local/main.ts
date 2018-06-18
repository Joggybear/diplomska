import {
    ExpressContainer
} from "tyx";

import {
    ConfigService,
    
    ThreadService,
    CommentService
} from "../services";

import { Config } from "./dev.env";

let exp = new ExpressContainer('TINO')
    .register(ConfigService, Config)
    .publish(ThreadService)
    .publish(CommentService)

exp.start(5055);

