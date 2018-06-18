import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ErrorComponent } from '../shared/error/error.component';
import { CreateThreadComponent } from './modals/create-thread/create-thread.component';
import { ThreadBackend } from '../data/thread/thread-backend';
import {
  ThreadItem
} from '../data/api';

@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss']
})
export class ThreadComponent implements OnInit {
  @ViewChild('error')
  public errorComponent: ErrorComponent;
  @ViewChild('createThreadComponent')
  public createThreadComponent: CreateThreadComponent;

  public threads: Observable<boolean | ThreadItem[]>;
  public currentId: string = localStorage.getItem('creatorId');

  constructor(
    private threadService: ThreadBackend,
  ) { }

  ngOnInit() {
    this.getThreads();
    this.createThreadComponent.mdModal.onHide.subscribe((reason: string) => {
      this.getThreads();
    });
  }

  getThreads() {
    this.threads = this.threadService.search({}).map(res => res.items).publishReplay(1).refCount().catch((err: any) => {
      this.errorComponent.show(err.message, err.status);
      return Observable.of(null);
    });
  }

  deleteThread(threadId: string) {
    this.threadService.delete({ threadId: threadId }).take(1).subscribe(() => {
      this.getThreads();
    }, (err: any) => {
      this.errorComponent.show(err.message, err.status);
      return Observable.of(null);
    });
  }
}
