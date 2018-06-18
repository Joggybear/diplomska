import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { ModalDirective } from 'ngx-bootstrap';
import { CommentBackend } from '../../../data/comment/comment-backend';
import { ErrorComponent } from '../../../shared/error/error.component';
import { CommentItem } from '../../../data/api/index';

@Component({
    selector: 'app-create-comment-modal',
    templateUrl: './create-comment.component.html',
    styleUrls: ['./create-comment.component.scss'],
    exportAs: 'bs-modal'
})
export class CreateCommentComponent implements OnInit {
    @ViewChild('mdModal')
    public mdModal: ModalDirective;
    @ViewChild('error')
    public errorComponent: ErrorComponent;

    public inputForm: FormGroup;
    public isSubmitted = false;
    constructor(
        private fb: FormBuilder,
        private commentService: CommentBackend
    ) { }


    ngOnInit() {
        this.inputForm = this.fb.group({
            threadId: '',
            commentId: '',
            content: ['', Validators.required],
            creator: undefined,
            creatorId: localStorage.getItem('creatorId')
        });
    }

    submitForm() {
        if (this.inputForm.valid) {
            this.inputForm.get('commentId').value === '' ? this.createComment() : this.updateComment();
        } else {
            this.isSubmitted = true;
        }
    }

    createComment() {
        this.commentService.create(this.inputForm.value).take(1).subscribe(res => {
            this.mdModal.hide();
        }, (err: any) => {
            this.errorComponent.show(err.message, err.status);
            this.errorComponent.smModal.onHide.subscribe((reason: string) => {
                this.mdModal.hide();
            });
        });
    }

    updateComment() {
        this.commentService.update(this.inputForm.value).take(1).subscribe(res => {
            this.mdModal.hide();
        }, (err: any) => {
            this.errorComponent.show(err.message, err.status);
            this.errorComponent.smModal.onHide.subscribe((reason: string) => {
                this.mdModal.hide();
            });
        });
    }

    show(threadId: string, comment?: CommentItem) {
        this.inputForm.patchValue({
            threadId: threadId,
            commentId: comment ? comment.commentId : '',
            content: comment ? comment.content : '',
            creator: comment ? comment.creator : undefined
        });
        this.mdModal.show();
    }
}
