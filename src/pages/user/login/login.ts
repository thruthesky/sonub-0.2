import { Component } from '@angular/core';
//import { AppRouter } from '../../../app/app.router';
import { Router } from '@angular/router';
import { formProcess } from '../../../etc/share';
import { Member, MEMBER_LOGIN_DATA } from '../../../api/philgo-api/v2/member';
import { App } from '../../../providers/app';
import { LanguagePipe } from '../../../pipes/language/language.pipe';

@Component({
    selector: 'login-page',
    templateUrl: 'login.html'
})
export class LoginPage {
    title: string = "Login";
    form = < MEMBER_LOGIN_DATA > {};
    process = formProcess.reset();
    constructor(
        private member: Member,
        private ln: LanguagePipe,
        private router: Router,
        public app: App
    ) {



    }
    onClickLogin() {
        // console.log("LoginPage::onClickLogin()");
        if( ! this.form.id ) return this.process.setError( this.ln.t( 'Please input user ID' ) );
        if( ! this.form.password ) return this.process.setError( this.ln.t('Please enter password.') );
        this.login();
    }

    login() {
       this.process.startLoader();

        this.member.login( this.form,
            login => {
                this.router.navigateByUrl('/');
            },
            er => {
                setTimeout(()=>this.process.setError( this.ln.t ( er ) ), 345);
            },
            () => {
                // console.log('philgo login complete!');
            }
        );

    }

}
