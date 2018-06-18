import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: 'thread',
        pathMatch: 'full',
      },
      {
        path: 'thread',
        loadChildren: './thread/thread.module#ThreadModule'
      },
      {
        path: '**',
        redirectTo: ''
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
