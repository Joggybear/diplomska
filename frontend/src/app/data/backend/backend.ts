import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environment';

const BACKEND_URL = environment.backendUrl;

@Injectable()
export class Backend {

    constructor(public http: Http) { }

    getBackend(query: string): Observable<any> {
        const headers = this.getDefHeaders();
        const options = new RequestOptions({ headers: headers });
        return this.http.get(BACKEND_URL + query, options)
            .map(this.extractJson)
            .catch(error => this.handleError(error));
    }

    postBackend(query: string, data: any): Observable<any> {
        const body = JSON.stringify(data);
        const headers = this.getDefHeaders();
        const options = new RequestOptions({ headers: headers });
        return this.http.post(BACKEND_URL + query, body, options)
            .map(this.extractJson)
            .catch(error => this.handleError(error));
    }

    putBackend(query: string, data: any): Observable<any> {
        const body = JSON.stringify(data);
        const headers = this.getDefHeaders();
        const options = new RequestOptions({ headers: headers });
        return this.http.put(BACKEND_URL + query, body, options)
            .map(this.extractJson)
            .catch(error => this.handleError(error));
    }

    deleteBackend(query: string, data?: any): Observable<any> {
        const body = JSON.stringify(data);
        const headers = this.getDefHeaders();
        const options = new RequestOptions({ headers: headers, body: body });
        return this.http.delete(BACKEND_URL + query, options)
            .map(this.extractJson)
            .catch(error => this.handleError(error));
    }

    private getDefHeaders(model?: string) {
        return new Headers({
            // 'Authorization': this.token ? 'Bearer ' + this.token : undefined,
            'Content-Type': 'application/json' + (model ? '; domain-model=' + model : '')
        });
    }

    private extractJson(res: Response) {
        const json = res.json();
        if (json) {
            return json;
        } else {
            return Observable.throw('No response');
        }
    }

    private handleError(error: any) {
        const err = JSON.parse(error._body);
        console.log(err);
        return Observable.throw(err);
    }
}
