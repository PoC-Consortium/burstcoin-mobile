import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { HttpModule} from '@angular/http';
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { ImportRoutingModule } from "./import.routing";
import { ImportComponent } from "./import.component";

import { CryptoService, DatabaseService, NotificationService, WalletService } from "../lib/services";


@NgModule({
    imports: [
        NativeScriptModule,
        ImportRoutingModule,
        HttpModule
    ],
    declarations: [
        ImportComponent
    ],
    providers: [
        CryptoService,
        DatabaseService,
        NotificationService,
        WalletService,

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class ImportModule { }
