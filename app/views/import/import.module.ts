/*
    Copyright 2017 icewave.org
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { SharedModule } from "../../lib/shared.module";

import { ImportRoutingModule } from "./import.routing";
import { ImportComponent } from "./import.component";

import { ShowComponent } from "./show/show.component";

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        SharedModule,
        ImportRoutingModule
    ],
    declarations: [
        ImportComponent,
        ShowComponent
    ],
    providers: [

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    entryComponents: [ ShowComponent ]
})
export class ImportModule { }
