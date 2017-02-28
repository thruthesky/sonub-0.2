import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Config, SETTING_LANGUAGE } from '../../etc/config';
import { languageText as text } from '../../etc/language-text';

/**
 * 
 */
@Pipe({
  name: 'ln'
})
@Injectable()
export class LanguagePipe implements PipeTransform {

  transform(code: any, args?: any): any {
    if ( code === void 0 ) return 'code undefined';
    
    let language = this.language();

    if ( text[code] === void 0 ) return code;
    if ( text[code][language] === void 0 ) return code;
    let str = text[code][language];
    for( let i in args ) {
      str = str.replace('#' + i, args[i]);
    }
    //console.log('str: ', str);
    return str;

  }


  t (code: any, args?: any): any {
    return this.transform( code, args );
  }

  language() {
    let language_code = Config.language;
    let lc = localStorage.getItem( SETTING_LANGUAGE );
    if ( lc ) language_code = lc;
    return lc;
  }



}
