import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'image-modal',
  template: `
    <div class="modal-body">
      <img [src]="url" (click)="activeModal.close('image click')" />
    </div>
    `
})
export class ImageModal {
  url : string = null;
  constructor( public activeModal: NgbActiveModal) {}
}
