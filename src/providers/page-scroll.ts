/**
 * 
 * 
 * @code
    ngOnInit() {
        this.pageScroll.watch( this.renderer, no => this.loadPage() );
    }
    ngOnDestroy() {
        this.pageScroll.stop();
    }
 * @endcode
 */
import { Injectable, Renderer } from '@angular/core';
import { debounce } from 'lodash';
@Injectable()
export class PageScroll {
    scrollNo: number = 0;
    scrollListener: any;
    private renderer: Renderer;
    constructor() {
    }

    watch( renderer: Renderer, callback: (scrollNo: number) => void ) {
        this.renderer = renderer;
        this.scrollListener = this.renderer.listenGlobal( 'document', 'scroll', debounce( () => this.scrolled( callback ), 150));
    }
    
    stop() {
        if ( typeof this.scrollListener == 'function' ) this.scrollListener();
    }

    scrolled( callback: (scrollNo: number) => void ) {
        this.scrollNo ++;
        // console.log("scrolled:", this.scrollNo );
        let pages = document.querySelector("section.content");
        if ( pages === void 0 || ! pages || pages['offsetTop'] === void 0) return; // @attention this is error handling for some reason, especially on first loading of each forum, it creates "'offsetTop' of undefined" error.
        let pagesHeight = pages['offsetTop'] + pages['clientHeight'];
        let pageOffset = window.pageYOffset + window.innerHeight;
        if( pageOffset > pagesHeight - 200) { // page scrolled. the distance to the bottom is within 200 px from
            // console.log("page scroll reaches at bottom: pageOffset=" + pageOffset + ", pagesHeight=" + pagesHeight);
            callback( this.scrollNo );
        }
    }

}