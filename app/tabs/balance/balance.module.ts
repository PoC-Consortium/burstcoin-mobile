import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { BalanceRoutingModule } from "./balance.routing";
import { BalanceComponent } from "./balance.component";
import { OverviewComponent } from "./overview/overview.component";
import { ReceiveComponent } from "./receive/receive.component";
import { SendComponent } from "./send/send.component";

import { CryptoService, DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";

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
    providers: [
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
export class BalanceModule { }
