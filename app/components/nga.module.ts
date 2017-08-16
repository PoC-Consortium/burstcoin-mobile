import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { SmallAccountComponent } from "./small-account/small-account.component";

@NgModule({
    imports: [
        NativeScriptModule
    ],
    declarations: [
        SmallAccountComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class NgaModule { }
