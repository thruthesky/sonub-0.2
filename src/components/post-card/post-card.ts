import { Component, Input } from '@angular/core';
import { Member, MEMBER_LOGIN_DATA } from '../../api/philgo-api/v2/member';
import { App } from "../../providers/app";
import { Router } from '@angular/router';
import { Config } from "../../etc/config";
@Component ({
  selector: 'post-card',
  templateUrl: 'post-card.html'
})
export class PostCard {

  ek = Config.englishOrKorean;
  t = Config.translate;


  @Input() post: any = [];
  login: MEMBER_LOGIN_DATA = <MEMBER_LOGIN_DATA> {};
  constructor(
    public app: App,
    private member: Member,
    private router: Router
  ) {
    member.getLogin( x => this.login = x );
  }



}
