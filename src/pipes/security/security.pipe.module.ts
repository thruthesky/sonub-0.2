import { NgModule } from '@angular/core';
import { SafeHTMLPipe } from './safe-html.pipe';
@NgModule({
    declarations: [ SafeHTMLPipe ],
    exports: [ SafeHTMLPipe ],
    providers: [ SafeHTMLPipe ]
})
export class SafeHTMLPipeModule {}
