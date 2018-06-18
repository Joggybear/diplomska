import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Backend } from '../backend';
import {
    ThreadApi,
    ThreadList,
    ThreadRequest,
    ThreadOverview,
    ThreadCreateCommand,
    ThreadUpdateCommand,
    ThreadDeleteCommand
} from '../api';

@Injectable()
export class ThreadBackend extends Backend implements ThreadApi {
    constructor(
        public http: Http
    ) {
        super(http);
    }

    search(query: Record<string, string>): Observable<ThreadList> {
        return this.getBackend('/threads');
    }

    overview(request: ThreadRequest): Observable<ThreadOverview> {
        return this.getBackend('/threads/' + request.threadId);
    }

    create(request: ThreadCreateCommand): Observable<ThreadCreateCommand> {
        return this.postBackend('/threads', request);
    }

    update(request: ThreadUpdateCommand): Observable<ThreadUpdateCommand> {
        return this.putBackend('/threads/' + request.threadId, request);
    }

    delete(request: ThreadDeleteCommand): Observable<ThreadDeleteCommand> {
        return this.deleteBackend('/threads/' + request.threadId);
    }

}
