import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Router } from '@angular/router';

@Component({
    selector: 'app-error-modal',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss'],
    exportAs: 'bs-modal'
})
export class ErrorComponent {
    @ViewChild('smModal')
    public smModal: ModalDirective;

    public errorMessage: string;
    public statusCode: number;
    constructor(
        private router: Router,
    ) { }

    show(errorMessage: string, statusCode: number) {
        this.errorMessage = errorMessage;
        this.statusCode = statusCode;
        this.smModal.show();
    }

    hide() {
        if (this.statusCode === 401) {
            // this.router.navigate(['/auth'], { queryParams: { passthrough: state.url } });
            // TO DO PASSTROUGH
            this.router.navigate(['/auth']);
        }
        this.smModal.hide();
    }
}
