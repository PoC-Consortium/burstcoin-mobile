import { Component, OnInit } from "@angular/core";
import { TranslateService } from 'ng2-translate';

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent {

    constructor(translateService: TranslateService) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translateService.setDefaultLang('en');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translateService.use('en');
    }

}
