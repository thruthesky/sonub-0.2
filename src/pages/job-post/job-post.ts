import { Component, NgZone } from '@angular/core';
import { PhilippineRegion } from  '../../providers/philippine-region'
import { Post, POST_DATA } from '../../api/philgo-api/v2/post';
import { Member, MEMBER_LOGIN } from '../../api/philgo-api/v2/member';
import { Data, FILE_UPLOAD_RESPONSE, FILE_UPLOAD_DATA, DATA_UPLOAD_OPTIONS } from '../../api/philgo-api/v2/data';
import { Router, ActivatedRoute } from '@angular/router';
import { App } from '../../providers/app';
import * as _ from 'lodash';

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
    varchar_5: '2010-01-25', //birthday
    varchar_6: '', //Personal Content
    int_1: '0', //work experience
    int_2: '', //year
    int_3: '', //month
    int_4: '', //day
    photos: []
  };
  loader: boolean = false;
  errorOnPost = null;
  numbers = Array.from(new Array(20), (x,i) => i+1);
  provinces: Array<string> = [];
  cities = [];
  showCities: boolean = false;
  login: MEMBER_LOGIN = null;
  gid: string = null;

  urlDefault: string = "assets/img/anonymous.gif";
  urlPhoto: string = this.urlDefault;
  files: Array<FILE_UPLOAD_DATA> = <Array<FILE_UPLOAD_DATA>>[];
  showProgress: boolean = false;
  progress: number = 0;
  widthProgress: any;
  inputFileValue: string = null;
  cordova: boolean = false;

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
      console.log('error location.get_province::', e);
    });

    this.login = member.getLoginData();
    this.form.gid = data.uniqid(); // for file upload of new post
    let idx = this.route.snapshot.params['idx'];
    if( idx ){ //if idx exist then edit
      //this.post.debug = true;
      this.post.load(idx, re=> {
        console.log('re data',re.post);
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
        console.log('error on getting idx', e);
      })
    }
  }

  get cityKeys() {
    return Object.keys( this.cities );
  }

  ngOnInit() {
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
      console.log('cities', re);
      if(re) {
        this.cities = re;
        this.showCities = true;
      }
    }, e => {
      console.log('error location.get_cities::', e);
    });
  }


  onClickSubmit(){
    console.log("onClickSubmit:: ", this.form);
    if( ! this.login ) {
      this.app.notice('Please Login first...')
      this.router.navigateByUrl( '/user/login' )
      return;
    }


    if( ! this.form.text_1 ) return this.app.notice('Please Input Name...');
    if( ! this.form.text_2 ) return this.app.notice('Please Input Middle Name...');
    if( ! this.form.text_3 ) return this.app.notice('Please Input Last Name...');


    if( ! this.form.varchar_4 ) return this.app.notice('Please Input Mobile...');
    if( ! this.form.varchar_1 ) return this.app.notice('Please Input Address');
    if( this.form.varchar_2 == 'all' ) return this.app.notice('Please Select Province...');
    //if( this.form.varchar_3 ) return this.app.notice('Please Input Mobile...');
    if( ! this.form.sub_category ) return this.app.notice('Please Select Work Profession...');
    if( ! this.form.varchar_6 ) return this.app.notice('Please Input Personal Message...');


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
    if(this.form.idx) {
      this.updatePost();
    }
    else {
      this.createPost();
    }
  }

  createPost() {
    console.log('createPost:: ', this.form);
    this.post.debug =true;
    this.post.create( this.form, data => {
        console.log("post create success: ", data);
        this.openConfirmation('Success::Your post has been Posted.');
        this.loader = false;
        this.clearInputs();
      },
      error => this.post.error( error ),
      () => {}
    )
  }

  openConfirmation(msg) {
    this.app.notice(msg);
  }

  updatePost() {
    console.log('UpdatePost::');
    this.post.update( this.form, data => {
      console.log("post update : ", data);
      this.loader = false;
      this.openConfirmation('Success::Your post has been Updated.');
      this.router.navigate( [ '/job/view/'+ data.idx ] );
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
    this.data.uploadPostFile( this.form.gid, event,
      s => this.onSuccessFileUpload(s),
      f => this.onFailureFileUpload(f),
      c => this.onCompleteFileUpload(c),
      p => this.onProgressFileUpload(p)
    );
  }

  onSuccessFileUpload (re: FILE_UPLOAD_RESPONSE) {
    console.log('re.data: ', re.data);
    this.deleteFile( this.form.photos[0] );
    //this.form.photos =  re.data;

    // Edited by Mr. Song. this.form.photos is an Array but re.data is an Object.
    this.form.photos.push( re.data );
    this.urlPhoto = re.data.url_thumbnail;
    this.showProgress = false;
    this.renderPage();
  }

  onFailureFileUpload ( error ) {
    this.showProgress = false;
    this.post.error( error );
  }

  onCompleteFileUpload( completeCode ) {
    console.log("completeCode: ", completeCode);
  }
  onProgressFileUpload( percentage ) {
    console.log("percentag uploaded: ", percentage);
    this.progress = percentage;
    this.renderPage();
  }

  onClickDeleteFile() {
    let re = confirm("Do you want to delete?");
    if ( re == false ) return;

    this.deleteFile( this.form.photos[0] );

  }

  deleteFile( file? ){
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
  }

  renderPage() {
    this.ngZone.run(() => {
      console.log('ngZone.run()');
    });
  }

}
