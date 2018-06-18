import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { ErrorComponent } from '../../shared/error/error.component';
import { CreateThreadComponent } from '../modals/create-thread/create-thread.component';
import { ThreadBackend } from '../../data/thread/thread-backend';
import { CommentBackend } from '../../data/comment/comment-backend';
import {
  ThreadOverview, CommentItem
} from '../../data/api';
import { CreateCommentComponent } from '../modals/create-comment/create-comment.component';
@Component({
  selector: 'app-thread-details',
  templateUrl: './thread-details.component.html',
  styleUrls: ['./thread-details.component.scss']
})
export class ThreadDetailsComponent implements OnInit {
  @ViewChild('error')
  public errorComponent: ErrorComponent;
  @ViewChild('createCommentModal')
  public createCommentComponent: CreateCommentComponent;

  public thread: Observable<ThreadOverview>;

  public inputForm: FormGroup;
  public isSubmitted = false;
  public currentId: string = localStorage.getItem('creatorId');

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private threadService: ThreadBackend,
    private commentService: CommentBackend
  ) { }

  ngOnInit() {
    this.getThread();
    this.createCommentComponent.mdModal.onHide.subscribe((reason: string) => {
      this.getThread();
    });
  }

  getThread() {
    this.thread = this.route.params.switchMap(params => {
      return this.threadService.overview({ threadId: params['id'] }).catch((err: any) => {
        this.errorComponent.show(err.message, err.status);
        return Observable.of(null);
      });
    }).publishReplay().refCount();
  }

  deleteComment(commentId: string, threadId: string) {
    this.commentService.delete({ commentId: commentId, threadId: threadId }).take(1).subscribe(() => {
      this.getThread();
     }, (err: any) => {
      this.errorComponent.show(err.message, err.status);
      return Observable.of(null);
    });
  }

  createComment(comment?: CommentItem) {
    this.thread.take(1).subscribe(t => this.createCommentComponent.show(t.threadId, comment));
  }

}
