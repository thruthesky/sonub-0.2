import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'; // (click)="activeModal.close('message')" 와 같이 할 때, 필요하다.
@Component({
    selector: 'alert-content',
    template: `
    <div class="modal-header">
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
      <h4 class="modal-title">{{ title }}</h4>
    </div>
    <div class="modal-body">
      <p>{{ content }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close('Close click')">Close</button>
    </div>
    `
})
export class AlertContent {
  title: string = "Modal Title !";
  content: string = "Modal Content";
  constructor(public activeModal: NgbActiveModal) {}
}
