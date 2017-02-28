import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';

import { App } from '../providers/app';
import { PageScroll } from '../providers/page-scroll';

import { HomePage } from '../pages/home/home';
import { HelpPage } from '../pages/help/help';

import { NoticeModalContent } from '../components/modals/notice/notice';
import { BootstrapModule } from "../providers/bootstrap/bootstrap";
import { PhilippineRegion } from "../providers/philippine-region";
import { LanguagePipeModule } from "../pipes/language/language.pipe.module";
import { PhilgoApiModule } from "../api/philgo-api/v2/philgo-api-module";
import { JobPostPage } from "../pages/job-post/job-post";
import { JobViewPage } from "../pages/job-view/job-view";
import { FileNotFoundPage } from "../pages/file-not-found/file-not-found";

const appRoutes: Routes = [
  { path: "post/:idx", component: JobPostPage },
  { path: "post", component: JobPostPage },
  { path: "view/:idx", component: JobViewPage },
  { path: 'help', component: HelpPage },
  { path: '', component: HomePage },


  /** Default Base Pages **/
  { path: '**', component: FileNotFoundPage }
];

@NgModule({
  declarations: [
    AppComponent,
    HomePage,
    HelpPage,
    JobPostPage,
    JobViewPage,
    FileNotFoundPage,
    NoticeModalContent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    BootstrapModule,
    LanguagePipeModule,
    PhilgoApiModule,
    RouterModule.forRoot( appRoutes, { useHash: !history.pushState }),
    NgbModule.forRoot()
  ],
  bootstrap: [ AppComponent ],
  providers: [ App, PageScroll, PhilippineRegion, NgbActiveModal ],
  entryComponents: [ NoticeModalContent ]
})
export class AppModule {}


