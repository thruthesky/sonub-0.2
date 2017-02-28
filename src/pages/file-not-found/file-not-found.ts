import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { App } from '../../providers/app';
import { Config } from '../../etc/config';
@Component({
    selector: 'file-not-found-page',
    templateUrl: 'file-not-found.html'
})
export class FileNotFoundPage {

    title: string = 'Page Not Found';
    url: string = null;
    t = Config.translate;
    constructor(
        private router: Router,
        public app: App
    ) {
        this.url = window.location.href;
    }

    onClickBack() {
        this.router.navigate( [ '/' ] );
    }

}
