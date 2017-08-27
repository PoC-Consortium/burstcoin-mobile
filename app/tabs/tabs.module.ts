import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { BarcodeScanner } from 'nativescript-barcodescanner';

import { TabsRoutingModule } from "./tabs.routing";
import { TabsComponent } from "./tabs.component";

import { BalanceComponent } from "./balance/balance.component";
import { ReceiveComponent } from "./balance/receive/receive.component";
import { SendComponent } from "./balance/send/send.component";

import { CryptoService, DatabaseService, MarketService, NotificationService, WalletService } from "../lib/services";

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptHttpModule,
        TabsRoutingModule
    ],
    declarations: [
        TabsComponent,
        BalanceComponent,
        ReceiveComponent,
        SendComponent
    ],
    providers: [
        BarcodeScanner,
        CryptoService,
        DatabaseService,
        MarketService,
        NotificationService,
        WalletService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class TabsModule { }
