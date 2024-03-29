import { Component, Input } from '@angular/core';
import { Member } from '../../api/philgo-api/v2/member';
import { App } from "../../providers/app";
import { Router } from '@angular/router';
import {MEMBER_LOGIN} from "../../api/philgo-api/v2/philgo-api-interface";
@Component ({
  selector: 'job-header',
  templateUrl: 'job-header.html'
})
export class JobHeader {
  isAllMenuActive: boolean = false;
  @Input() title: string = '';
  login: MEMBER_LOGIN = null;
  constructor(
    public app: App,
    private member: Member,
    private router: Router
  ) {
    member.getLogin( x => this.login = x );
  }

  onClickHeader() {
    window.scrollTo( 0, 0 );
    if ( this.app.menu ) this.app.menu = false;
  }
  onClickLogout() {
    this.login = null;
    this.member.logout();
  }

  onClickMenu( event ) {
    event.stopPropagation();
    window.scrollTo( 0, 0 );
    this.app.menu = ! this.app.menu;
  }

  onClickRoute( url ) {
    //console.log('#########activeroute', url);
    let active = this.router.isActive( url, true);
    if(active) {
      this.router.navigate( ['reload',  url] );
    }
    else {
      this.router.navigateByUrl( url );
    }

  }
}
