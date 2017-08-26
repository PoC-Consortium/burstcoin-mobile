import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NSNUMKEY_DIRECTIVES } from "nativescript-numeric-keyboard/angular";

import { CreateRoutingModule } from "./create.routing";
import { CreateComponent } from "./create.component";

import { CryptoService } from "../lib/services";

//import { NgaModule } from "../lib/nga.module";

@NgModule({
    imports: [
        NativeScriptModule,
        CreateRoutingModule
    ],
    declarations: [
        CreateComponent,
        NSNUMKEY_DIRECTIVES
    ],
    providers: [
        CryptoService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class CreateModule { }
