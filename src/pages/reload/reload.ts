import { Component } from '@angular/core';
import { ActivatedRoute, Router,} from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'reload-page',
  template: ''
})
export class ReloadPage {
  url : string = null;
  constructor(activated: ActivatedRoute,
              private router: Router,
              location: Location
  ) {
    activated.params.subscribe( param => {
      //console.log("Reload::constructor::subscribe()")
      if ( param['url'] !== void 0 ) {
        location.back();
      }
      else{
        this.router.navigateByUrl( '/' ); // fail safe.
      }
    } );
  }
}
