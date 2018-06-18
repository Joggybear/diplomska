import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Backend } from '../backend';
import {
    CommentApi,
    CommentRequest,
    CommentItem,
    CommentList,
    CommentOverview,
    CommentCreateCommand,
    CommentUpdateCommand,
    CommentDeleteCommand
} from '../api';

@Injectable()
export class CommentBackend extends Backend implements CommentApi {
    constructor(
        public http: Http
    ) {
        super(http);
    }

    search(query: Record<string, string>): Observable<CommentList> {
        return this.getBackend('/comments');
    }

    overview(request: CommentRequest): Observable<CommentOverview> {
        return this.getBackend('/comments/' + request.threadId + '/' + request.commentId);
    }

    create(request: CommentCreateCommand): Observable<CommentCreateCommand> {
        return this.postBackend('/comments', request);
    }

    update(request: CommentUpdateCommand): Observable<CommentUpdateCommand> {
        return this.putBackend('/comments/' + request.threadId + '/' + request.commentId, request);
    }

    delete(request: CommentDeleteCommand): Observable<CommentItem> {
        return this.deleteBackend('/comments/' + request.threadId + '/' + request.commentId);
    }
}
