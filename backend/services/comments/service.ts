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
    CommentApi,
    CommentItem,
    CommentList,
    CommentCreateCommand,
    CommentUpdateCommand,
    CommentDeleteCommand,
    CommentRequest,
    CommentOverview
} from '../../api';

import {
    CommentRepository,
    ThreadRepository
} from './repository';

@Service(CommentApi)
export class CommentService extends BaseService implements CommentApi {

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
    @Get('/comments', (next, ctx, call, path, query) => next(query))
    public async search(query: Record<string, string>): Promise<CommentList> {
        return await this.commentRepository.query(query);
    }

    @Public()
    @Get('/comments/{threadId}/{commentId}', (next, ctx, call, path) => next({ threadId: path.threadId, commentId: path.commentId }))
    public async overview(request: CommentRequest): Promise<CommentOverview> {
        if (!request.commentId) throw new BadRequest("Missing required parameter commentId");

        let comment = this.commentRepository.load(request.commentId, request.threadId);
        if (!comment) throw new NotFound(`Comment with id ${request.commentId} does not exist.`);

        return comment;
    }

    @Public()
    @Post('/comments', false, (next, ctx, call) => next(call.json || {}))
    public async create(comment: CommentCreateCommand): Promise<CommentCreateCommand> {
        let thread = await this.threadRepository.load(comment.threadId);
        if (!thread) throw new NotFound(`Thread with id ${comment.threadId} does not exist.`);

        const newComment = {
            threadId: comment.threadId,
            commentId: Utils.uuid(),
            content: comment.content,
            creator: comment.creator || 'Anonymous',
            creatorId: comment.creatorId,
            version: 0,
        }
        await this.commentRepository.save(newComment);
        await this.threadRepository.onCommentChange(newComment, 'ADD', thread.commentCount);

        return comment;
    }

    @Public()
    @Put("/comments/{threadId}/{commentId}", false, (next, ctx, call, path, query) => next(path.commentId, call.json))
    public async update(commentId: string, comment: CommentUpdateCommand): Promise<CommentUpdateCommand> {
        const commentExists = await this.commentRepository.load(comment.commentId, comment.threadId);
        if (!commentExists) throw new NotFound(`Thread with id ${comment.commentId} does not exist.`);

        let newComment = Object.assign(comment, { version: commentExists.version, created: commentExists.created });
        newComment.creator = comment.creator || 'Anonymous';
        await this.commentRepository.save(comment);
        return comment;
    }

    @Public()
    @Delete("/comments/{threadId}/{commentId}", false, (next, ctx, call, path, query) => next({ threadId: path.threadId, commentId: path.commentId }))
    public async delete(comment: CommentDeleteCommand): Promise<CommentItem> {
        let result = await this.commentRepository.load(comment.commentId, comment.threadId);
        if (!result) throw new NotFound(`Comment with id ${comment.commentId} does not exist.`);

        await this.commentRepository.delete(result);

        let thread = await this.threadRepository.load(result.threadId);
        let lastComment = await this.commentRepository.getLastComment(result.threadId);
        await this.threadRepository.onCommentChange(lastComment || thread, 'REMOVE', thread.commentCount);

        return result;
    }
} 