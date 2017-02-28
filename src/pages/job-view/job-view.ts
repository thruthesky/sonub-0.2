import { Component } from '@angular/core';
import { Post, POST_DATA } from '../../api/philgo-api/v2/post';
import { FILE_UPLOAD_DATA } from '../../api/philgo-api/v2/data';
import { Router, ActivatedRoute } from '@angular/router';
import { App } from '../../providers/app';
import { Config } from '../../etc/config';

declare var Array;
declare var navigator;
declare var Camera;


@Component({
  selector: 'job-view',
  templateUrl: 'job-view.html'
})
export class JobViewPage {

  today = new Date();
  currentYear = this.today.getFullYear();

  ek = Config.englishOrKorean;
  t = Config.translate;


  form : POST_DATA = <POST_DATA> {
    gid: '',
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
  urlDefault: string = "assets/img/anonymous.gif";
  urlPhoto: string = this.urlDefault;
  files: Array<FILE_UPLOAD_DATA> = <Array<FILE_UPLOAD_DATA>>[];

  constructor(
    private post: Post,
    private router: Router,
    private route: ActivatedRoute,
    public app: App
  ) {
    let idx = this.route.snapshot.params['idx'];
    if( idx ){ //if idx exist then edit
      this.post.load(idx, re=> {
        console.log('re data',re.post);
        if( re.post && re.post.idx ) {
          this.form = re.post;
          re.post.photos.map( e => this.files.push(e) );

          if(re.post.photos.length) {
            this.urlPhoto = re.post.photos[0].url_thumbnail;
          }
        }
        else {
          this.app.notice("Record doesn't Exist");
          this.router.navigate( [ '/' ] );
        }
      }, e => {
        this.app.error(e);
        console.log('error on getting idx', e);
      })
    }
  }

  onClickClose(){
    this.router.navigate( [ '/' ] );
  }

}
