import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { TransactionsRoutingModule } from "./transactions.routing";
import { TransactionsComponent } from "./transactions.component";

//import { NgaModule } from "../lib/nga.module";

@NgModule({
    imports: [
        NativeScriptModule,
        //NgaModule,
        TransactionsRoutingModule
    ],
    declarations: [
        TransactionsComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class TransactionsModule { }
