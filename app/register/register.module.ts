import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { RegisterRoutingModule } from "./register.routing";
import { RegisterComponent } from "./register.component";

import { CryptoService } from "../lib/services";

//import { NgaModule } from "../lib/nga.module";

@NgModule({
    imports: [
        NativeScriptModule,
        RegisterRoutingModule
    ],
    declarations: [
        RegisterComponent
    ],
    providers: [
        CryptoService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class RegisterModule { }
