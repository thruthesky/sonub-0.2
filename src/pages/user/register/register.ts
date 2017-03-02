import { Component, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
//import { AppRouter } from '../../../app/app.router';
import { formProcess } from '../../../etc/share';
import { Member, MEMBER_DATA, MEMBER_REGISTER_DATA, MEMBER_LOGIN } from '../../../api/philgo-api/v2/member';
import { Data, FILE_UPLOAD_RESPONSE, FILE_UPLOAD_DATA, DATA_UPLOAD_OPTIONS, CODE_PRIMARY_PHOTO } from '../../../api/philgo-api/v2/data';
import { App } from '../../../providers/app';

declare var navigator;
declare var Camera;

@Component({
    selector: 'register-page',
    templateUrl: 'register.html'
})
export class RegisterPage {
    title: string = "Register";

    login: MEMBER_LOGIN = null;
    memberData: MEMBER_DATA = null;

    form = < MEMBER_REGISTER_DATA > {};
    process = formProcess.reset();

    urlDefault: string = "assets/img/anonymous.gif";
    urlPhoto: string = this.urlDefault;
    uploadData: FILE_UPLOAD_DATA;
    gid: string = null;

    showProgress: boolean = false;
    progress: number = 0;
    widthProgress: any;
    inputFileValue: string = null;

    cordova: boolean = false;

    // delete
    inDeleting: boolean = false;
    constructor(
        private member: Member,
        private data: Data,
        private router: Router,
        private sanitizer: DomSanitizer,
        private ngZone: NgZone,
        public app: App
    ) {
        this.cordova = app.isCordova();
        this.gid = data.uniqid();
        member.getLogin( x => {
            this.login = x;
            this.gid = this.login.id;
        });
        this.loadFormData();

        setTimeout( () => {
        // this.fileTransfer( 'file:///storage/emulated/0/Android/data/com.ionicframework.hack2778871/cache/1481039907916.jpg' );

        }, 3000);
    }


    renderPage() {
        this.ngZone.run(() => {
            console.log('ngZone.run()');
        });
    }
    loadFormData() {
        // don't check login here since, login is non-blocking code.
        this.member.data( (data:MEMBER_DATA) => {
            console.log(data);
            this.memberData = data;
            if ( data.user_url_primary_photo ) this.urlPhoto = data.user_url_primary_photo;
            this.form.name = data.name;
            this.form.email = data.email;
            this.form.gender = data.gender;
            this.form.mobile = data.mobile;
            this.form.birthday = this.member.getBirthdayFormValue( data );
        }, error => {
            console.log('error: ', error);
        });

    }
    setTemporaryValues(pre='') {
        let f = this.form;
        let d = new Date();
        f.id = "temp-" + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();

        if ( ! pre ) f.password = 'pass-' + f.id;

        f.name = pre + 'name-' + f.id;
        if ( pre == '' ) f.nickname = 'nickname-' + f.id;
        else f.nickname = '';
        f.email = pre + 'email-' + f.id + '@gmail.com';
        f.mobile = pre + '10123456789';
        f.gender = pre ? 'M' : 'F';
        f.birthday = '1973-10-16';
    }

    onClickRegister() {
      if( ! this.form.id ) return this.process.setError( 'Please input user ID...' );
      if( ! this.form.password ) return this.process.setError( 'Please enter password...' );
      if( ! this.form.name ) return this.process.setError( 'Please input name...' );
      if( ! this.form.email ) return this.process.setError( 'Please enter email...' );
      if( ! this.form.mobile ) return this.process.setError( 'Please input mobile number...' );
      if( ! this.form.gender ) return this.process.setError( 'Please select gender...' );
      if( ! this.form.birthday ) return this.process.setError( 'Please input birthday...' );
        this.register();
    }

    register() {
        this.process.begin();
        this.form.nickname = this.form.name;
        this.member.register( this.form, (login) => {
            // register success
            console.log('onClickRegister(), registration sucess: ', login );
            //
            if ( this.photoUploaded() ) {
                // if user uploaded primary photo on register, then update the file.idx_member
                this.data.updateMemberIdx( this.gid, re => {
                    console.log("file 'idx_member' update success: ", re );
                    this.router.navigateByUrl('/');
                }, error => this.member.error( 'file idx_member update error: ' + error ) );
            }
            else this.router.navigateByUrl('/');
        },
        e => {
            console.log("onClickRegister() error: " + e);
            setTimeout(()=>this.process.setError( e ),345);
        });
    }

    onClickUpdate() {
        this.process.begin();
        this.member.update( this.form, login => {
            this.app.notice("User profile updated!");
        },
        error => {
            this.member.error('error on update user profile: ' + error );
        },
        () => {
            this.process.loader = false;

        })
    }

    onChangeFile(event, value) {
        this.showProgress = true;
        // if not logged in, then delete previous primary photo. If logged in, automatically deleted.
        if ( this.login == null ) this.deletePrimaryPhoto( true ); // delete only when user did not logged in. when a user logged in, the primary photo will be automatically deleted.
        if ( this.login ) {
            this.data.uploadPrimaryPhoto( event, // without gid.
                x => this.successPrimaryPhotoUpload( x ),
                e => this.failurePrimaryPhotoUpload( e ),
                c => this.completePrimaryPhotoUpload( c ),
                p => this.progressPrimaryPhotoUpload( p )
            );
        }
        else {
            this.data.uploadAnonymousPrimaryPhoto( this.gid, event, // with gid.
                x => this.successPrimaryPhotoUpload( x ),
                e => this.failurePrimaryPhotoUpload( e ),
                c => this.completePrimaryPhotoUpload( c ),
                p => this.progressPrimaryPhotoUpload( p )
            );
        }
    }

    onClickPrimaryPhoto() {
        if ( ! this.cordova ) return;
        console.log("in cordova, onClickPrimaryPhoto(): ");

        navigator.notification.confirm(
          'Please select how you want to take photo.', // message
          i => this.onCameraConfirm( i ),
          'Take Photo',           // title
          ['Camera','Cancel', 'Gallery']     // buttonLabels
        );
    }

    onCameraConfirm( index ) {
      // console.log("confirm: index: ", index);
      if ( index == 2 ) return;
      let type = null;
      if ( index == 1 ) { // get the picture from camera.
        type = Camera.PictureSourceType.CAMERA;
      }
      else { // get the picture from library.
        type = Camera.PictureSourceType.PHOTOLIBRARY
      }
      // console.log("in cordova, type: ", type);
      let options = {
        quality: 80,
        sourceType: type
      };
      navigator.camera.getPicture( path => {
        // console.log('photo: ', path);
        this.fileTransfer( path ); // transfer the photo to the server.
      }, e => {
        // console.error( 'camera error: ', e );
        this.app.error("EditComponent::onCameraConfirm() : camera error");
      }, options);
    }



    fileTransfer( fileURL: string ) {
        this.showProgress = true;
        let options: DATA_UPLOAD_OPTIONS = {
            module_name: 'member',
            code: CODE_PRIMARY_PHOTO
        };
        if ( this.login == null ) {
            options.gid = this.gid,
            options.finish = '0';
            options.login = 'pass';
            // if not logged in, then delete previous primary photo. If logged in, automatically deleted.
            this.deletePrimaryPhoto( true ); // delete only when user did not logged in. when a user logged in, the primary photo will be automatically deleted.
        }
        else {
            options.gid = this.login.id;
            options.finish = '1';
        }

        this.data.transfer( options,
            fileURL,
            x => this.successPrimaryPhotoUpload( x ),
            e => this.failurePrimaryPhotoUpload( e ),
            c => this.completePrimaryPhotoUpload( c ),
            p => this.progressPrimaryPhotoUpload( p )
        );
    }



    successPrimaryPhotoUpload( re: FILE_UPLOAD_RESPONSE ) {
        console.log("data.upload() success: re: ", re);
        this.uploadData = re.data;
        this.urlPhoto = re.data.url_thumbnail;
        this.progress = 0;
        this.showProgress = false;
        setTimeout( () => this.renderPage(), 200 );
    }

    failurePrimaryPhotoUpload( e ) {
        this.showProgress = false;
        this.member.error( "An error has occured while uploading: Code = " + e );
    }

    progressPrimaryPhotoUpload( p ) {
        this.progress = p;
        this.widthProgress = this.sanitizer.bypassSecurityTrustStyle('width:'  + p + '%' );
        this.renderPage();
    }

    completePrimaryPhotoUpload( c ) {
      this.showProgress = false;
      console.log("completeCode: ", c)
    }

    onDeletePhoto() {
        this.deletePrimaryPhoto();
    }

    deletePrimaryPhoto( silent?: boolean ) {
        try {
            let idx = this.photoUploaded();
            if ( idx ) {

                console.log("deletePrimaryPhoto(). idx: ", idx );
                let data = {
                    idx: idx,
                    gid: this.gid
                };

                this.inDeleting = true;
                this.data.delete( data, (re) => {
                    this.inDeleting = false;
                    console.log("file deleted: idx: ", re.data.idx);
                    if ( silent === void 0 || silent !== true ) {
                        this.progress = 0;
                        this.urlPhoto = this.urlDefault;
                        this.inputFileValue = '';
                    }
                    this.uploadData = null;
                }, error => {
                    this.inDeleting = false;
                    this.member.error( error );
                } );
            }
        }
        catch ( e ) {
            console.error("failed on deleting file: ", e);
        }
    }


    /**
     * Returns file.idx of primary photo if the user has photo.
     */
    photoUploaded() : number {
        if ( this.uploadData && this.uploadData.idx ) return this.uploadData.idx;
        if ( this.memberData && this.memberData.user_url_primary_photo ) return this.data.getIdxFromUrl( this.memberData.user_url_primary_photo );
        return 0;
    }



}


