import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { ImportRoutingModule } from "./import.routing";
import { ImportComponent } from "./import.component";


@NgModule({
    imports: [
        NativeScriptModule,
        ImportRoutingModule
    ],
    declarations: [
        ImportComponent
    ],
    providers: [

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class ImportModule { }
