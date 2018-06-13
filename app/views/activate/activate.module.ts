/*
* Copyright 2018 PoC-Consortium
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { SharedModule } from "../../lib/shared.module";

import { ActivateRoutingModule } from "./activate.routing";
import { ActivateComponent } from "./activate.component";
import { PasswordComponent } from "./password/password.component";
import { PinComponent } from "./pin/pin.component";
import { ActivateService } from "./activate.service"

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptFormsModule,
        SharedModule,
        ActivateRoutingModule
    ],
    declarations: [
        ActivateComponent,
        PasswordComponent,
        PinComponent
    ],
    providers: [
        ActivateService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class ActivateModule { }
