import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";

import { BalanceComponent } from "./balance/balance.component";
import { TabsRoutingModule } from "./tabs-routing.module";
import { TabsComponent } from "./tabs.component";

import { CryptoService, DatabaseService, MarketService, NotificationService, WalletService } from "../lib/services";

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptHttpModule,
        TabsRoutingModule
    ],
    declarations: [
        TabsComponent,
        BalanceComponent
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
export class TabsModule { }
