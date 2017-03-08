import { Component, NgZone } from '@angular/core';
import { PhilippineRegion } from  '../../providers/philippine-region'
import { Post, POST_DATA } from '../../api/philgo-api/v2/post';
import { Member, MEMBER_LOGIN } from '../../api/philgo-api/v2/member';
import { Data, FILE_UPLOAD_RESPONSE, FILE_UPLOAD_DATA, DATA_UPLOAD_OPTIONS } from '../../api/philgo-api/v2/data';
import { Router, ActivatedRoute } from '@angular/router';
import { App } from '../../providers/app';
import * as _ from 'lodash';
import { MEMBER_REGISTER_DATA } from "../../api/philgo-api/v2/philgo-api-interface";

declare var Array;
declare var navigator;
declare var Camera;


@Component({
  selector: 'job-post',
  templateUrl: 'job-post.html'
})
export class JobPostPage{


  form : POST_DATA = <POST_DATA> {
    gid: '',
    subject: 'Job Post Title',
    content: 'Job Post Content',
    post_id: 'jobs',
    sub_category: '', //sub_category profession
    text_1: '', //first name
    text_2: '', //middle name
    text_3: '', //last name
    char_1: 'M', //Gender
    varchar_1: '', //address
    varchar_2: 'all', //province
    varchar_3: 'all', //city
    varchar_4: '', //mobile
    varchar_5: '1999-01-25', //birthday
    varchar_6: '', //Personal Content
    int_1: '0', //work experience
    int_2: '', //year
    int_3: '', //month
    int_4: '', //day
    photos: []
  };


  regForm = < MEMBER_REGISTER_DATA > {};

  ln: string = null;
  loader: boolean = false;
  errorOnPost = null;
  numbers = Array.from(new Array(20), (x,i) => i+1);
  provinces: Array<string> = [];
  cities = [];
  showCities: boolean = false;
  login: MEMBER_LOGIN = null;

  urlDefault: string = "assets/img/anonymous.gif";
  urlPhoto: string = this.urlDefault;
  files: Array<FILE_UPLOAD_DATA> = <Array<FILE_UPLOAD_DATA>>[];

  inDeleting: boolean = false;

  showProgress: boolean = false;
  progress: number = 0;
  widthProgress: any;
  inputFileValue: string = null;
  cordova: boolean = false;


  today = new Date();
  currentYear = this.today.getFullYear();

  constructor(
    private region: PhilippineRegion,
    private post: Post,
    private data: Data,
    private member: Member,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    public app: App
  ) {
    this.cordova = app.isCordova();
    region.get_province( re => {
      this.provinces = re;
    }, e => {
      //console.log('error location.get_province::', e);
    });
    this.ln = post.languageCode;
    this.login = member.getLoginData();
    this.form.gid = data.uniqid(); // for file upload of new post
    let idx = this.route.snapshot.params['idx'];
    if( idx ){ //if idx exist then edit
      //this.post.debug = true;
      if ( ! this.login ) {
        this.app.notice('Not Authorize Access...');
        this.router.navigateByUrl('/');
        return;
      }
      this.post.load(idx, re => {
        //console.log('re data',re.post);
        if(re.post) {
          this.form = re.post;
          re.post.photos.map( e => this.files.push(e) );
          if(re.post.photos.length) {
            this.urlPhoto = re.post.photos[0].url_thumbnail;
          }
          this.getCities();
        }
      }, e => {
        this.app.error( e );
        //console.log('error on getting idx', e);
      })
    }
  }

  get cityKeys() {
    return Object.keys( this.cities );
  }

  onClickProvince() {
    if( this.form.varchar_2 != 'all') {
      this.form.varchar_3 = this.form.varchar_2;
      this.getCities();
    }
    else {
      this.form.varchar_3 = 'all';
      this.showCities = false;
    }
  }

  getCities() {
    this.region.get_cities( this.form.varchar_2, re => {
      //console.log('cities', re);
      if(re) {
        this.cities = re;
        this.showCities = true;
      }
    }, e => {
      //console.log('error location.get_cities::', e);
    });
  }


  onClickSubmit(){
    //console.log("onClickSubmit:: ", this.form);

    if( ! this.form.text_1 ) return this.app.notice('Please Input Name...');
    if( ! this.form.text_2 ) return this.app.notice('Please Input Middle Name...');
    if( ! this.form.text_3 ) return this.app.notice('Please Input Last Name...');
    if( ! this.form.varchar_4 ) return this.app.notice('Please Input Mobile...');
    if( ! this.form.varchar_1 ) return this.app.notice('Please Input Address');
    if( this.form.varchar_2 == 'all' ) return this.app.notice('Please Select Province...');
    if( ! this.form.sub_category ) return this.app.notice('Please Select Work Profession...');
    if( ! this.form.varchar_6 ) return this.app.notice('Please Input Personal Message...');
    if( ! this.regForm.password && ! this.login ) return this.app.notice('Please Input Password');

    this.loader = true;
    this.errorOnPost = null;

    if(this.form['varchar_5']) {
      let str = this.form['varchar_5'].split('-');

      // this.form['int_2'] = parseInt(str[0]); //year
      // this.form['int_3'] = parseInt(str[1]); //month
      // this.form['int_4'] = parseInt(str[2]); //day

      // edited by Mr. Song. Type conversion error. int_2 is actually a string. not a number.
      this.form['int_2'] = str[0]; //year
      this.form['int_3'] = str[1]; //month
      this.form['int_4'] = str[2]; //day
    }
    this.form.subject = this.form.sub_category + '-'  //profession
      + ( this.form.char_1 == 'M' ? 'Male' : 'Female' ) + '-'   //gender
      + this.form.varchar_2 + '-'   //province
      + ( this.currentYear - parseInt( this.form.int_2 ) ) + 'yrs old-'
      + this.form.varchar_4;  //mobile number
    this.form.content = this.form.subject;


    this.regForm.id = 'job' + this.form.text_1 + this.form.varchar_4;
    this.regForm.name = this.form.text_1;
    this.regForm.nickname = this.regForm.id;
    this.regForm.email = this.form.text_1 + this.form.varchar_4 + '@job.sonub.com';
    this.regForm.mobile = this.form.varchar_4;


    if( this.form.idx ) {
      this.updatePost();
    }
    else {
      this.register();
    }
  }

  register() {
    //console.log("register:: ", this.regForm);
    this.member.register( this.regForm, (login) => {
        //console.log('onClickRegister(), registration success: ', login )
        //this.createPost();

        // if ( this.photoUploaded() ) {
        //   console.log("gid: ", this.form.gid);
        //   this.data.updateMemberIdx( this.form.gid, re => {
        //     console.log("file 'idx_member' update success: ", re );
        //     this.createPost();
        //   }, error => this.member.error( 'file idx_member update error: ' + error ) );
        // }
        // else
        this.createPost();

      },
      e => {
        this.app.notice(e);
        this.loader = false;
        //console.log("onClickRegister() error: " + e);
      });
  }

  openConfirmation(msg) {
    this.app.notice(msg);
  }


  createPost() {
    //console.log('createPost:: ', this.form);
    //this.post.debug =true;
    this.post.create( this.form, data => {
        //console.log("post create success: ", data);
        this.loader = false;
        this.logout();
        this.openConfirmation('Success::Your post has been Posted.');
        this.router.navigateByUrl('/');
      },
      error => this.post.error( error ),
      () => {}
    )
  }

  updatePost() {
    //console.log('UpdatePost::', this.form);
    this.post.update( this.form, data => {
      //console.log("post update : ", data);
      this.loader = false;
      this.logout();
      this.openConfirmation('Success::Your post has been Updated.');
      this.router.navigate( [ '/view/'+ data.idx ] );
    }, er => this.post.error( er ));
  }

  clearInputs(){
    this.form = {
      gid : this.data.uniqid(),
      subject: 'Job Post Title',
      content: 'Job Post Content',
      post_id: 'jobs',
      sub_category: '', //sub_category
      text_1: '', //first name
      text_2: '', //middle name
      text_3: '', //last name
      char_1: 'M', //Gender
      varchar_1: '', //address
      varchar_2: 'all', //province
      varchar_3: 'all', //city
      varchar_4: '', //mobile
      varchar_5: '2010-01-25', //birthday
      varchar_6: '', //Personal Content
      int_1: '0', //work experience
      int_2: '', //year
      int_3: '', //month
      int_4: '', //day
      photos: []
    };
    this.urlPhoto = this.urlDefault;
    this.showCities = false;
  }

  // for camera.
  onClickFileUploadButton() {
    if ( ! this.cordova ) return;
    // console.log("onClickFileUploadButton()");

    let message = 'Please select how you want to take photo.';
    let camera = 'Camera';
    let gallery = 'Gallery';
    let cancel = 'Cancel';
    let title = 'Take Photo';
    if ( this.ln == 'ko' ) {
      message = '카메라에서 사진 찍기 또는 갤러리에서 가져오기를 선택하세요.';
      camera = '카메라';
      gallery = '갤러리';
      cancel = '취소';
      title = '사진 선택';
    }

    navigator.notification.confirm(
      message,
      i => this.onCameraConfirm( i ),
      title,           // title
      [camera, cancel, gallery]     // buttonLabels
    );
  }

  onCameraConfirm( index ) {
    //console.log("confirm: index: ", index);
    if ( index == 2 ) return;
    let type = null;
    if ( index == 1 ) { // get the picture from camera.
      type = Camera.PictureSourceType.CAMERA;
    }
    else { // get the picture from library.
      type = Camera.PictureSourceType.PHOTOLIBRARY
    }
    //console.log("in cordova, type: ", type);
    let options = {
      quality: 80,
      sourceType: type
    };
    navigator.camera.getPicture( path => {
      //console.log('photo: ', path);
      this.fileTransfer( path ); // transfer the photo to the server.
    }, e => {
      //console.error( 'camera error: ', e );
      //this.post.error("EditComponent::onCameraConfirm() : camera error");
    }, options);
  }


  fileTransfer( fileURL: string ) {
    this.showProgress = true;
    let options: DATA_UPLOAD_OPTIONS = {
      module_name: 'post',
      gid: this.form.gid
    };
    this.data.transfer( options,
      fileURL,
      s => this.onSuccessFileUpload(s),
      f => this.onFailureFileUpload(f),
      c => this.onCompleteFileUpload(c),
      p => this.onProgressFileUpload(p)
    );
  }


  onChangeFile( event ) {
    this.showProgress = true;
    /**
      this.data.uploadPostFile( this.form.gid, event,
      s => this.onSuccessFileUpload(s),
      f => this.onFailureFileUpload(f),
      c => this.onCompleteFileUpload(c),
      p => this.onProgressFileUpload(p)
    );
    **/
    this.showProgress = true;
    // if not logged in, then delete previous primary photo. If logged in, automatically deleted.
    if ( this.login == null ) this.deletePrimaryPhoto( true ); // delete only when user did not logged in. when a user logged in, the primary photo will be automatically deleted.
    if ( this.login ) {
      this.data.uploadPostFile( this.form.gid, event,
        s => this.onSuccessFileUpload(s),
        f => this.onFailureFileUpload(f),
        c => this.onCompleteFileUpload(c),
        p => this.onProgressFileUpload(p)
      );
    }
    else {
      this.data.uploadPostFileAnonymous( this.form.gid, event,
        s => this.onSuccessFileUpload(s),
        f => this.onFailureFileUpload(f),
        c => this.onCompleteFileUpload(c),
        p => this.onProgressFileUpload(p)
      );
    }
  }

  onSuccessFileUpload (re: FILE_UPLOAD_RESPONSE) {
    //console.log('re.data: ', re.data);
    //this.deleteFile( this.form.photos[0] );
    //this.form.photos =  re.data;

    // Edited by Mr. Song. this.form.photos is an Array but re.data is an Object.
    this.form.photos.push( re.data );
    //console.log('this.form::', this.form);
    this.urlPhoto = re.data.url_thumbnail;
    this.showProgress = false;
    this.renderPage();
  }

  onFailureFileUpload ( f ) {
    this.showProgress = false;
    this.post.error( f );
  }

  onCompleteFileUpload( c ) {
    this.showProgress = false;
    //console.log("completeCode: ", c);
  }
  onProgressFileUpload( p ) {
    //console.log("percentag uploaded: ", p);
    this.progress = p;
    this.renderPage();
  }

  onClickDeleteFile() {
    let re = confirm("Do you want to delete?");
    if ( re == false ) return;

    this.deletePrimaryPhoto();

  }
/**
  deleteFile(){
    if( ! file ) return;
    console.log("onClickDeleteFile: ", file);
    let data = {
      idx: file.idx
    };
    this.data.delete( data, (re) => {
      console.log("file deleted: ", re);
      _.remove( this.form.photos , x => {
        console.log('x:', x);
        return x.idx == data.idx;
      } );
      this.urlPhoto = this.urlDefault;
      console.log( 'this.files' , this.form );
    }, error => {
      this.post.error( error );
    } );

   this.deletePrimaryPhoto();
  }
**/

  deletePrimaryPhoto( silent?: boolean ) {
    try {
      let idx = this.photoUploaded();
      if ( idx ) {
        let data = {
          idx: idx,
          gid: this.form.gid
        };

        this.inDeleting = true;
        this.data.delete( data, (re) => {
          this.inDeleting = false;
          //console.log("file deleted: idx: ", re.data.idx);
          _.remove( this.form.photos , x => {
            //console.log('x:', x);
            return x.idx == data.idx;
          } );

          if ( silent === void 0 || silent !== true ) {
            this.progress = 0;
            this.urlPhoto = this.urlDefault;
            this.inputFileValue = '';
          }
        }, error => {
          this.inDeleting = false;
          //this.post.error( error );
        } );
      }
    }
    catch ( e ) {
      //console.error("failed on deleting file: ", e);
    }
  }

  photoUploaded() : number {
    if ( this.form.photos[0] && this.form.photos[0].idx ) return this.form.photos[0].idx;
   //if ( this.memberData && this.memberData.user_url_primary_photo ) return this.data.getIdxFromUrl( this.memberData.user_url_primary_photo );
    return 0;
  }



  renderPage() {
    this.ngZone.run(() => {
      //console.log('ngZone.run()');
    });
  }


  logout() {
    this.login = null;
    this.member.logout();
  }


  onClickDelete() {
    let re = confirm("Are you sure you want to delete this post?");
    if ( re ) {
      this.post.delete( this.form.idx, re => {
          this.app.notice("Successful on Deleting this post...");
          this.router.navigateByUrl('/');
        },
        error => this.post.error("delete error: " + error )
      );
    }
    else {
      //console.log('delete Was Canceled');
    }
  }
}
