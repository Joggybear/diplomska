import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';

import { ErrorComponent } from './error/error.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    ErrorComponent
  ],
  declarations: [
    ErrorComponent
  ],
  providers: [
  ]
})
export class SharedModule { }
