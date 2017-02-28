import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '../providers/app';

declare let navigator;

@Component({
  selector: `app-component`,
  template: `
    <router-outlet></router-outlet>
    <template ngbModalContainer></template>
    <div class="toast" [ngClass]="['toast', toast.class]" (click)="onClickHideToast()" [attr.active]="toast.active">{{toast.content}}</div>
  `
})
export class AppComponent {
  @ViewChild('alertModal') alertModal = null;
  url: string = null; // url of current page.
  prevUrl: string = null; // previous page url.
  toast: { class: string; active: boolean; content: string; } = { class: '', active: false, content: null };
  
  constructor( private router: Router,
               public app: App) {
    app.appComponent = this;
    router.events.subscribe(event => {
      // console.log(event);
      this.prevUrl = this.url;
      this.url = event.url;
    });
    document.addEventListener("deviceready", () => this.onDevinceReady(), false);
  }

  onDevinceReady() {
    console.log("yes, I am running in cordova.");
    this.backButton();
  }

  backButton() {
    //this.app.addBackButtonEventListener();

    document.addEventListener("backbutton", () => {
      console.log("backbutton clicked: prevUrl: " + this.prevUrl + ", this.url: ", this.url );
      if ( this.prevUrl == '/' ) {
        navigator.app.exitApp();
      }
      else {
        navigator.app.backHistory();
      }
    }, false );
  }

  onClickHideToast(){
    this.toast.active = false;
  }
  
}
