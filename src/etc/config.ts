/**
 * 동적으로 변하는 값을 여기에 기록하지 않는다.
 * 또한 여기서 설정하는 값은 동적으로 변경시키지 않는다.
 * 
 */
declare let navigator;
let language = navigator.languages && navigator.languages[0] || // Chrome / Firefox
               navigator.language ||   // All browsers
               navigator.userLanguage; // IE <= 10


export const SETTING_LANGUAGE = 'setting.language';
export const SETTING_FORUM_LIST_STYLE = 'setting.forum-list-style';

let lang = language.substr( 0, 2 );
if ( lang != 'ko' ) lang = 'en';

import { languageText } from './language-text';
export let Config = {
    language: lang,     // default user language. it is either 'ko' or 'en'.
    // urlPhilgoServer: 'http://test.philgo.com/index.php' // For test server.
    // urlPhilgoServer: 'https://www.philgo.com/index.php' // For real server.


    /**
     * 
     * @attention it accesses localStorage.
     */
    getLanguage() : string {
            let language_code = Config.language;
            let lc = localStorage.getItem( SETTING_LANGUAGE );
            if ( lc ) language_code = lc;
            return language_code;
        },

    translate(code: string, args?: any): string {
      if ( code === void 0 ) return 'code undefined';
      let text = languageText;
      //console.log(text);
      let language = Config.getLanguage();
      //console.log(language);
      // if ( ! language ) language = 'en';
      if ( text[code] === void 0 ) return code;
      if ( text[code][language] === void 0 ) return code;
      let str = text[code][language];
      for( let i in args ) {
        str = str.replace('#' + i, args[i]);
      }
      //console.log('str: ', str);
      return str;

    },


    englishOrKorean( en: string, ko: string, args?: any ) : string {

      let language = Config.getLanguage();
      let str;
      if ( language == 'ko' ) str = ko;
      else str = en;

      for( let i in args ) {
        str = str.replace('#' + i, args[i]);
      }
      
      return str;
    }




};


