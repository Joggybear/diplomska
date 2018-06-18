import {
    Service,
    BaseService,
    Inject,
    Public,
    Private,

    Post,
    Put,
    Get,
    Delete,

    Utils,

    BadRequest,
    NotFound
} from "tyx";

import {
    ConfigApi,
    ThreadApi,
    ThreadList,
    ThreadRequest,
    ThreadOverview,
    ThreadCreateCommand,
    ThreadUpdateCommand,
    ThreadDeleteCommand
} from "../../api";

import {
    ThreadRepository,
    CommentRepository
} from './repository';

@Service(ThreadApi)
export class ThreadService extends BaseService implements ThreadApi {

    @Inject(ConfigApi)
    protected config: ConfigApi;

    private threadRepository: ThreadRepository;
    private commentRepository: CommentRepository;

    @Private()
    public async activate() {
        this.threadRepository = new ThreadRepository(this.config.stage);
        this.commentRepository = new CommentRepository(this.config.stage);
    }

    @Public()
    @Get('/threads', (next, ctx, call, path, query) => next(query))
    public async search(query: Record<string, string>): Promise<ThreadList> {
        return await this.threadRepository.query(query);
    }

    @Public()
    @Get('/threads/{threadId}', (next, ctx, call, path) => next({ threadId: path.threadId }))
    public async overview(request: ThreadRequest): Promise<ThreadOverview> {
        if (!request.threadId) throw new BadRequest("Missing required parameter threadId");

        const thread = await this.threadRepository.load(request.threadId);
        if (!thread) throw new NotFound(`Thread with id ${request.threadId} does not exist.`);

        const comments = await this.commentRepository.listComments(request.threadId);
        console.log('COMMENTS = ', comments);
        const result = Object.assign(thread, { comments: comments.items })
        return result;
    }

    @Public()
    @Post('/threads', false, (next, ctx, call) => next(call.json || {}))
    public async create(thread: ThreadCreateCommand): Promise<ThreadCreateCommand> {
        const newThread = {
            threadId: Utils.uuid(),
            title: thread.title,
            content: thread.content,
            creator: thread.creator || 'Anonymous',
            creatorId: thread.creatorId,
            lastDate: new Date().toISOString(),
            lastUser: thread.creator || 'Anonymous',
            version: 0,
            commentCount: 0
        }
        await this.threadRepository.save(newThread);
        return thread;
    }

    @Public()
    @Put("/threads/{threadId}", false, (next, ctx, call, path, query) => next(path.threadId, call.json))
    public async update(threadId: string, thread: ThreadUpdateCommand): Promise<ThreadUpdateCommand> {
        const threadExists = await this.threadRepository.load(thread.threadId);
        if (!threadExists) throw new NotFound(`Thread with id ${thread.threadId} does not exist.`);

        const newThread = Object.assign(thread, {
            commentCount: threadExists.commentCount,
            version: threadExists.version,
            created: threadExists.created,
            lastDate: threadExists.lastDate,
            lastUser: threadExists.lastUser
        });
        newThread.creator = thread.creator || 'Anonymous'
        await this.threadRepository.save(newThread);
        return thread;
    }

    @Public()
    @Delete("/threads/{threadId}", false, (next, ctx, call, path, query) => next({ threadId: path.threadId }))
    public async delete(thread: ThreadDeleteCommand): Promise<ThreadOverview> {
        let result = await this.overview(thread);

        let comments = result.comments;
        comments.forEach(async comment => {
            await this.commentRepository.delete(comment);
        });

        let deleteThread = Object.assign(result, { comments: undefined });
        await this.threadRepository.delete(deleteThread);
        return result;
    }
} 