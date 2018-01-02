/*
    Copyright 2017 icewave.org
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptUISideDrawerModule } from "nativescript-pro-ui/sidedrawer/angular";
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { SharedModule } from "../../lib/shared.module";

import { SendRoutingModule } from "./send.routing";
import { SendService } from "./send.service";

import { SendComponent } from "./send.component";
import { InputComponent } from "./input/input.component";
import { ContactComponent } from "./input/contact/contact.component";
import { FiatComponent } from "./input/fiat/fiat.component";
import { VerifyComponent } from "./verify/verify.component";

export function createBarcodeScanner() {
  return new BarcodeScanner();
}

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        NativeScriptUISideDrawerModule,
        SharedModule,
        SendRoutingModule
    ],
    declarations: [
        ContactComponent,
        FiatComponent,
        InputComponent,
        SendComponent,
        VerifyComponent
    ],
    providers: [
        [{provide: BarcodeScanner, useFactory: (createBarcodeScanner)}],
        SendService
    ],
    entryComponents: [
        ContactComponent,
        FiatComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SendModule { }
