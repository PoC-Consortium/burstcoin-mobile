/*
    Copyright 2017 icewave.org
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { SharedModule } from "../../lib/shared.module";

import { SendRoutingModule } from "./send.routing";

import { SendComponent } from "./send.component";
import { InputComponent } from "./input/input.component";
import { VerifyComponent } from "./verify/verify.component";

import { SendService } from "./send.service";

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        SharedModule,
        SendRoutingModule
    ],
    declarations: [
        InputComponent,
        SendComponent,
        VerifyComponent
    ],
    providers: [
        SendService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SendModule { }
