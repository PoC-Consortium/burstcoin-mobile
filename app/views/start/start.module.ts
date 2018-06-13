/*
* Copyright 2018 PoC-Consortium
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { StartRoutingModule } from "./start.routing";
import { StartComponent } from "./start.component";

import { SharedModule } from "../../lib/shared.module";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        SharedModule,
        StartRoutingModule
    ],
    declarations: [
        StartComponent
    ],
    providers: [

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class StartModule { }
