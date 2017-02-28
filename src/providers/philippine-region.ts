import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the Location provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class PhilippineRegion {

  constructor(public http: Http) {
    console.log('Location::constructor');
  }

  get_province( successCallback, errorCallback) {
    this.http.get( 'http://hello.philgo.com/etc/location/philippines/json.php' )
        .subscribe( data => {
            try {
                let re = JSON.parse( data['_body'] );
                if ( re['code'] ) return errorCallback( re['message'] );
                successCallback( re );
            }
            catch( e ){
                errorCallback( data['_body']);
            }
        });
  }

    get_cities( data, successCallback, errorCallback) {
        this.http.get( 'http://hello.philgo.com/etc/location/philippines/json.php?province='+data )
            .subscribe( data => {
                try {
                    let re = JSON.parse( data['_body'] );
                    if ( re['code'] ) return errorCallback( re['message'] );
                    successCallback( re );
                }
                catch( e ){
                    errorCallback( data['_body']);
                }
            });
    }

}
