/**
 * @file language-english-korean.pipes.ts
 *
 * @see ./README.md for details
 */
import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Config, SETTING_LANGUAGE } from '../../etc/config';

@Pipe({
  name: 'ek'
})
@Injectable()
export class LanguageEnglishKoreanPipe implements PipeTransform {

  transform(code: Array<string>, args?: any): any {


    if ( code === void 0 ) return 'code undefined';


    let str;
    if ( this.language() == 'en' ) str = code[0];
    else str = code[1];
    for( let i in args ) {
      str = str.replace('#' + i, args[i]);
    }
    //console.log('str: ', str);
    return str;

  }


  language() {
    let language_code = Config.language;
    let lc = localStorage.getItem( SETTING_LANGUAGE );
    if ( lc ) language_code = lc;
    return language_code;
  }



}
