import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { Backend } from './backend';
import { ThreadBackend } from './thread/thread-backend';
import { CommentBackend } from './comment/comment-backend';

@NgModule({
  imports: [
    HttpModule
  ],
  declarations: [
  ],
  providers: [
    Backend,
    ThreadBackend,
    CommentBackend
  ]
})

export class DataModule { }
