/*
    Copyright 2017 icewave.org
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { StartRoutingModule } from "./start.routing";
import { StartComponent } from "./start.component";

import { SharedModule } from "../../lib/shared.module";

@NgModule({
    imports: [
        NativeScriptModule,
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
