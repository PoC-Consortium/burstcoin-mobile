import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { BarcodeScanner } from 'nativescript-barcodescanner';

import { TabsRoutingModule } from "./tabs.routing";
import { TabsComponent } from "./tabs.component";

import { AccountsComponent } from "./accounts/accounts.component";

import { BalanceComponent } from "./balance/balance.component";
import { ReceiveComponent } from "./balance/receive/receive.component";
import { SendComponent } from "./balance/send/send.component";

import { SharedModule } from "../lib/shared.module";

@NgModule({
    imports: [
        NativeScriptModule,
        SharedModule,
        TabsRoutingModule
    ],
    declarations: [
        TabsComponent,
        AccountsComponent,
        BalanceComponent,
        ReceiveComponent,
        SendComponent
    ],
    providers: [
        BarcodeScanner
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class TabsModule { }
