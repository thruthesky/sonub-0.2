import { Component, Renderer } from '@angular/core';
import { Router } from "@angular/router";

import { Member, MEMBER_LOGIN } from '../../api/philgo-api/v2/member';
import {PAGES, SEARCH_QUERY_DATA} from "../../api/philgo-api/v2/philgo-api-interface";
import { PhilippineRegion } from "../../providers/philippine-region";
import { App } from "../../providers/app";
import { PageScroll } from "../../providers/page-scroll";
import { Post } from "../../api/philgo-api/v2/post";
import { Config } from "../../etc/config";
import * as _ from 'lodash';


@Component( {
    selector: 'home-page',
    templateUrl: 'home.html'
})
export class HomePage {

    ek = Config.englishOrKorean;
    t = Config.translate;

    sharePath = 'view';

  login: MEMBER_LOGIN = null;

    /** Search Query */
    query = {
        sub_category: 'all',
        name: '',
        varchar_2: 'all', //province
        varchar_3: 'all', //city
        int_1: 'all', //work experience
        gender: 'all',
        male: false,
        female: false
    };

    page_no: number = 0;
    limit: number = 6;

    /** Work Experience Variable*/
    numbers = Array.from(new Array(20), (x,i) => i+1);

    /** Min and Max Age Variables*/
    minAge: number = 1;
    maxAge: number = 60;
    minAgeRange = Array.from(new Array( this.maxAge - this.minAge), (x,i) => i+1);
    maxAgeRange = this.minAgeRange;
    minAgeSelected: number = this.minAge;
    maxAgeSelected: number = this.maxAge;
    betweenAge: number = this.minAge -1;

    provinces: Array<string> = [];
    cities = [];
    showCities: boolean = false;
    pages: PAGES;
    condition: string = '';
    urlDefault: string = "assets/img/anonymous.gif";
    urlPhoto: string = this.urlDefault;

    inPageLoading: boolean = false; // true while loading a page of posts.
    noMorePosts: boolean = false; //
    myPost: boolean = false;
    searchAll: boolean = true;
    searchWithAge : boolean = false;
    searchPattern : boolean  = false;
    searchBy: { location?, profession?, more? } = {};


    /** Getting Age by subtracting birth year to current year*/
    today = new Date();
    currentYear = this.today.getFullYear();



    constructor(
        private region: PhilippineRegion,
        private post: Post,
        private member: Member,
        private renderer: Renderer,
        private pageScroll: PageScroll,
        public app: App,
        private router: Router ) {
        member.getLogin( x => {
            this.login = x;
        });

        region.get_province( re => {
            this.provinces = re;
        }, e => {

        });
        this.search();
    }

    ngOnInit() {
        this.pageScroll.watch( this.renderer, no => {
            if ( this.page_no == 0 ) {
                this.page_no ++; // since 1st page has been loaded in constructor()
            }
            this.doSearch();
        } );
    }

    ngOnDestroy() {
        this.pageScroll.stop();
    }

    get cityKeys() {
        return Object.keys( this.cities );
    }


    searchClear(){
        this.searchBy = {};
        this.searchAll = true;
        this.showCities = false;
        this.searchWithAge = false;
        this.query.sub_category = 'all';
        this.query.varchar_2 = 'all';
        this.query.varchar_3 = 'all';
        this.query.int_1 = 'all';
        this.query.name = '';
        this.query.male = false;
        this.query.female = false;
        this.search();
    }

    searchOption(){
        this.searchPattern = false;
        this.inPageLoading = true;
        this.noMorePosts = false;
        this.condition = '';
        this.pages = [];
        this.page_no = 1;
    }

    search( filter: boolean = false ) {
        if ( this.inPageLoading ) {
            //console.info("in page loading");
            return;
        }
        if ( filter && this.searchAll == true ) {
            this.searchAll = false;
        }
        this.searchOption();
        this.myPost = false;



        if( this.searchWithAge ) {
            let min = this.currentYear - this.minAgeSelected;
            let max = this.currentYear - this.maxAgeSelected;
            //ageRange
            this.condition += " AND int_2 <= '" + min + "'"; //min age
            this.condition += " AND int_2 >= '" + max + "'"; //max age
        }

        //profession
        if( this.query.sub_category != 'all') this.condition += " AND sub_category = '"+ this.query.sub_category +"'";
        //province
        if( this.query.varchar_2 != 'all') this.condition += " AND varchar_2 = '"+ this.query.varchar_2 +"'";
        //city
        if( this.query.varchar_3 != 'all' && this.query.varchar_2 == this.query.varchar_3 ) {
            this.condition += " AND varchar_3 LIKE '%"+ this.query.varchar_3 +"%'";
        }
        else if( this.query.varchar_3 != 'all') {
            this.condition += " AND varchar_3 = '"+ this.query.varchar_3 +"'";
        }
        //work experience
        if( this.query.int_1 != 'all') this.condition += " AND int_1 = '"+ this.query.int_1 +"'";
        //name
        if( this.query.name ) this.condition += " AND text_1 LIKE '%"+ this.query.name +"%'";

        //gender
        if( this.query.gender != 'all' ) {
            this.condition += " AND char_1 = '"+ this.query.gender +"'";
        }


        this.debounceDoSearch();
        //this.doSearch();
    }

    private debounceDoSearch = _.debounce( () => this.doSearch(), 1000);

    doSearch() {
        //console.log('###############doSearch###############');
        let page = this.page_no++;
        let data = <SEARCH_QUERY_DATA> {};
        data.fields = "deleted,idx,stamp,idx_member,gid,sub_category,post_id,text_1,text_2,text_3,int_1,int_2,int_3,int_4,char_1,varchar_1,varchar_2,varchar_3,varchar_4,varchar_6";
        data.from = "sf_post_data";
        data.where = "post_id = 'jobs' AND idx_parent=0" + this.condition;
        data.limit = this.limit.toString();
        data.orderby = "idx desc";
        data.page = page;
        data.post = 1;
        //this.post.debug = true;
        this.post.search( data, re => {
            //console.log("search result: ", re);
            this.displayPosts( re );
        }, error => this.app.error("error on search: " + error ) );
    }

    displayPosts( page ) {
        this.inPageLoading = false;
        this.searchPattern = true;
        if ( page.search.length == 0 ) {
            this.noMorePosts = true;
            this.app.renderPage();
            //this.endScroll();
            return;
        }

        this.chunkPage( page );


//        if ( page.page == 1 ) this.pages[0] = page;
//        else this.pages.push( page );



//        setTimeout( () => this.lazyProcess( page ), 100 );
    }

    chunkPage( page ) {

      let posts = page.search;


      for( let i = 0; i < posts.length; i = i + 3 ) {
        setTimeout( () => {
          this.pages.push( this.pres(posts.slice( i, i+3 )) );
          this.app.renderPage();
        }, i * 30 ); // lazy call
      }


    }


    pres( arr: any ) {
      //console.log('pres:', arr);

      return arr.map( e => this.pre(e) );
    }
    pre( post ) {
      post['date'] = this.post.getDateTime( post.stamp );
      if ( post.comments !== void 0 ) post.comments.map( comment => comment['date'] = this.post.getDateTime( comment.stamp ) );

      post['link'] = this.post.getPermalink( post, this.sharePath )

      return post;
    }

  showPages(){
    console.log('showPages::this.pages', this.pages);
  }

    /*
    lazyProcess( page ) {
        if ( page.search.length == 0 ) {
            return;
        }
        // for date.
        page.search.map( post => {
            post['date'] = this.post.getDateTime( post.stamp );
            if ( post.comments === void 0 ) return;
            post.comments.map( comment => comment['date'] = this.post.getDateTime( comment.stamp ) );
        });

        // for link
        page.search.map( post => post['link'] = this.post.getPermalink( post, this.sharePath ) );


        //redraw
        this.app.renderPage();
    }
*/

    onClickProvince() {
        if( this.query.varchar_2 != 'all') {
            this.query.varchar_3 = this.query.varchar_2;
            this.region.get_cities( this.query.varchar_2, re => {
                //console.log('cities', re);
                if(re) {
                    this.cities = re;
                    //console.log(re);
                    this.showCities = true;
                }
            }, e => {
                //console.log('error location.get_cities::', e);
            });
        }
        else {
            this.query.varchar_3 = 'all';
            this.showCities = false;
        }
        this.search(true);
    }

    onChange() {
        console.log('onChange::')
        this.searchAll = false;
        this.search(true);
    }

    minRangeChange(){
        //console.log('minRangeChange::');
        this.searchWithAge = true;
        this.betweenAge = this.minAgeSelected - 1;
        this.maxAgeRange = this.getRange( this.minAgeSelected, this.maxAge);
        this.search(true);
    }
    maxRangeChange(){
        //console.log('maxRangeChange');
        this.searchWithAge = true;
        this.minAgeRange = this.getRange( this.minAge, this.maxAgeSelected);
        this.search(true);
    }
    getRange(min , max) {
        return Array.from(new Array( max - min), (x,i) => i+1);
    }

    onClickShowMyPost() {
        //console.log('onClickShowMyPost',this.login);
        this.searchOption();
        this.searchBy = {} ;
        this.myPost = true;
        this.condition = " AND user_id = '" + this.login.id + "'";
        this.debounceDoSearch();
    }



    onClickRoute( url ) {
        console.log('#########activeroute', url);


        let active = this.router.isActive( url, true);
        if(active) {
            this.router.navigate( ['reload',  url] );
        }
        else {
            this.router.navigateByUrl( url );
        }

    }

}
