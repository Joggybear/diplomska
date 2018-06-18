import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ThreadComponent } from './thread.component';
import { ThreadDetailsComponent } from './thread-details/thread-details.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ThreadComponent
            },
            {
                path: ':id',
                component: ThreadDetailsComponent
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class ThreadRoutingModule { }
