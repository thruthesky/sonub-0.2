import { Component, Input } from '@angular/core';
import { Member, MEMBER_LOGIN_DATA } from '../../api/philgo-api/v2/member';
import { App } from "../../providers/app";
import { Router } from '@angular/router';
@Component ({
  selector: 'job-header',
  templateUrl: 'job-header.html'
})
export class JobHeader {
  isAllMenuActive: boolean = false;
  @Input() title: string = '';
  login: MEMBER_LOGIN_DATA = <MEMBER_LOGIN_DATA> {};
  constructor(
    public app: App,
    private member: Member,
    private router: Router
  ) {
    app.menu = false;
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
