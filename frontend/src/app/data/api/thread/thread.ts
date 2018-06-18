import { Observable as Promise } from 'rxjs/Observable';

import {
    CommentItem
} from './comment';

export interface ThreadItem {
    threadId: string;
    title: string;
    content: string;
    lastDate: string;
    lastUser: string;
    creator?: string;
    creatorId?: string;
    commentCount?: number;
    version: number;
    created?: string;
    updated?: string;
}

export interface ThreadList {
    query: Record<string, string>;
    items: ThreadItem[];
}

export interface ThreadRequest {
    threadId: string;
}

export interface ThreadOverview {
    threadId: string;
    title: string;
    content: string;
    lastDate: string;
    lastUser: string;
    creatorId: string;
    creator?: string;
    comments?: CommentItem[];
    commentCount?: number;
    version: number;
    created?: string;
    updated?: string;
}

export interface ThreadCreateCommand {
    title: string;
    content: string;
    creatorId: string;
    creator?: string;
    threadId?: string;
}

export interface ThreadUpdateCommand {
    threadId: string;
    title: string;
    content: string;
    creatorId: string;
    creator?: string;
    version: number;
}

export interface ThreadDeleteCommand {
    threadId: string;
}

export interface ThreadApi {

    /**
     * GET: /threads
     */
    search(query: Record<string, string>): Promise<ThreadList>;

    /**
     * GET: /threads/{threadId}
     */
    overview(request: ThreadRequest): Promise<ThreadOverview>;

    /**
     * POST: /threads
     */
    create(request: ThreadCreateCommand): Promise<ThreadCreateCommand>;

    /**
     * PUT: /threads/{threadId}
     */
    update(thread: ThreadUpdateCommand): Promise<ThreadUpdateCommand>;

    /**
     * DELETE: /threads/{threadId}
     */
    delete(request: ThreadDeleteCommand): Promise<ThreadDeleteCommand>;
}
