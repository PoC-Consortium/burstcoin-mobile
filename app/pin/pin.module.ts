import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { PinRoutingModule } from "./pin.routing";
import { PinComponent } from "./pin.component";

import { CryptoService } from "../lib/services";

//import { NgaModule } from "../lib/nga.module";

@NgModule({
    imports: [
        NativeScriptModule,
        PinRoutingModule
    ],
    declarations: [
        PinComponent
    ],
    providers: [
        CryptoService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class PinModule { }
