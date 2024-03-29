import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
@Pipe({
    name: 'safeHtml'
})
@Injectable()
export class SafeHTMLPipe implements PipeTransform {
constructor(private sanitized: DomSanitizer) {}
    transform(value) {
        //console.log(this.sanitized.bypassSecurityTrustHtml(value))
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}
