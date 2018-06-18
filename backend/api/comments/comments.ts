import {
    Service
} from "tyx";

export const CommentApi = "comment";

export interface CommentItem {
    threadId: string;
    content: string;
    creatorId: string;
    creator?: string;
    commentId?: string;
    version: number;
    created?: string;
    updated?: string;
}

export interface CommentList {
    query: Record<string, string>;
    items: CommentItem[];
}

export interface CommentRequest {
    commentId: string;
    threadId: string;
}

export interface CommentOverview {
    commentId?: string;
    content: string;
    creator?: string;
    version: number;
    created?: string;
    updated?: string;
}

export interface CommentCreateCommand {
    threadId: string;
    content: string;
    creatorId: string;
    creator?: string;
    commentId?: string;
}

export interface CommentUpdateCommand {
    threadId: string;
    commentId: string;
    content: string;
    creatorId: string;
    creator?: string;
    version: number;
}

export interface CommentDeleteCommand {
    commentId: string;
    threadId: string;
}

export interface CommentApi extends Service {

    /**
     * GET: /comments
     */
    search(query: Record<string, string>): Promise<CommentList>;

    /**
     * GET: /comments/{commentId}
     */
    overview(request: CommentRequest): Promise<CommentOverview>;

    /**
     * POST: /comments
     */
    create(request: CommentCreateCommand): Promise<CommentCreateCommand>;

    /**
     * PUT: /comments/{commentId} [update]
     */
    update(commentId: string, request: CommentUpdateCommand): Promise<CommentUpdateCommand>;

    /**
     * DELETE: /comments/{commentId}
     */
    delete(request: CommentDeleteCommand): Promise<CommentItem>;
}