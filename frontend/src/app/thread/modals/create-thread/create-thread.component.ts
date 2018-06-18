import { Component, ViewChild, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { ModalDirective } from 'ngx-bootstrap';
import { ThreadBackend } from '../../../data/thread/thread-backend';
import { ErrorComponent } from '../../../shared/error/error.component';

@Component({
    selector: 'app-create-thread-modal',
    templateUrl: './create-thread.component.html',
    styleUrls: ['./create-thread.component.scss'],
    exportAs: 'bs-modal'
})
export class CreateThreadComponent implements OnInit {
    @ViewChild('mdModal')
    public mdModal: ModalDirective;
    @ViewChild('error')
    public errorComponent: ErrorComponent;

    public inputForm: FormGroup;
    public isSubmitted = false;
    constructor(
        private fb: FormBuilder,
        private threadService: ThreadBackend
    ) { }


    ngOnInit() {
        this.inputForm = this.fb.group({
            threadId: '',
            title: ['', Validators.required],
            content: ['', Validators.required],
            creator: undefined,
            creatorId: localStorage.getItem('creatorId')
        });
    }

    submitForm() {
        if (this.inputForm.valid) {
            this.inputForm.get('threadId').value === '' ? this.createThread() : this.updateThread();
        } else {
            this.isSubmitted = true;
        }
    }

    createThread() {
        this.threadService.create(this.inputForm.value).take(1).subscribe(res => {
            this.mdModal.hide();
        }, (err: any) => {
            this.errorComponent.show(err.message, err.status);
            this.errorComponent.smModal.onHide.subscribe((reason: string) => {
                this.mdModal.hide();
            });
        });
    }

    updateThread() {
        this.threadService.update(this.inputForm.value).take(1).subscribe(res => {
            this.mdModal.hide();
        }, (err: any) => {
            this.errorComponent.show(err.message, err.status);
            this.errorComponent.smModal.onHide.subscribe((reason: string) => {
                this.mdModal.hide();
            });
        });
    }

    show(thread: any) {
        this.inputForm.patchValue({
            threadId: thread ? thread.threadId : '',
            title: thread ? thread.title : '',
            content: thread ? thread.content : '',
            creator: thread ? thread.creator : undefined
        });
        this.mdModal.show();
    }
}
