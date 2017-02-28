import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'mobile-upload-modal',
  template: `
    <div class="modal-body">
        <div class="title">Image Upload...
        <button type="button" class="close" (click)="activeModal.dismiss('cross')">
          <span aria-hidden="true">&times;</span>
        </button></div>
        <hr>
        <div class="camera option" (click)="activeModal.close('camera')"><i class="fa fa-camera"></i><div class="text">CAMERA</div></div>
        <div class="photo option" (click)="activeModal.close('photo')"><i class="fa fa-picture-o"></i><div class="text">PHOTOS</div></div>
    </div>
    `
})
export class MobileUploadModal {
  constructor( public activeModal: NgbActiveModal) {}
}
