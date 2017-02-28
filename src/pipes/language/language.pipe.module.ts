import { NgModule } from '@angular/core';
import { LanguagePipe } from './language.pipe';
import { LanguageEnglishKoreanPipe } from './language-english-korean.pipe';
@NgModule({
    declarations: [ LanguagePipe, LanguageEnglishKoreanPipe ],
    exports: [ LanguagePipe, LanguageEnglishKoreanPipe ],
    providers: [ LanguagePipe, LanguageEnglishKoreanPipe ]
})
export class LanguagePipeModule {}