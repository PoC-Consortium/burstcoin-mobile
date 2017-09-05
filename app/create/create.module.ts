import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { SharedModule } from "../lib/shared.module";
import { CreateRoutingModule } from "./create.routing";
import { CreateComponent } from "./create.component";

import { CryptoService, NotificationService, WalletService } from "../lib/services";

//import { NgaModule } from "../lib/nga.module";

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        SharedModule,
        CreateRoutingModule
    ],
    declarations: [
        CreateComponent
    ],
    providers: [

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class CreateModule { }
