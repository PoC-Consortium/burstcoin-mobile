import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { BalanceRoutingModule } from "./balance.routing";
import { BalanceComponent } from "./balance.component";
import { OverviewComponent } from "./overview/overview.component";
import { ReceiveComponent } from "./receive/receive.component";
import { SendComponent } from "./send/send.component";

//import { NgaModule } from "../lib/nga.module";

@NgModule({
    imports: [
        NativeScriptModule,
        //NgaModule,
        BalanceRoutingModule
    ],
    declarations: [
        BalanceComponent,
        OverviewComponent,
        ReceiveComponent,
        SendComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class BalanceModule { }
