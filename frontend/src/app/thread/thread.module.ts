import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { ThreadRoutingModule } from './thread.routing.module';

import { ThreadComponent } from './thread.component';
import { ThreadDetailsComponent } from './thread-details/thread-details.component';
import { CreateThreadComponent } from './modals/create-thread/create-thread.component';
import { CreateCommentComponent } from './modals/create-comment/create-comment.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ThreadRoutingModule
  ],
  declarations: [
    ThreadComponent,
    ThreadDetailsComponent,
    CreateThreadComponent,
    CreateCommentComponent
  ]
})
export class ThreadModule { }
