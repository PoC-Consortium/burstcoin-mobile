import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { HttpModule } from "@angular/http";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { BalanceComponent } from "./balance/balance.component";
import { TabsRoutingModule } from "./tabs-routing.module";
import { TabsComponent } from "./tabs.component";

import { CryptoService, DatabaseService, NotificationService, WalletService } from "../lib/services";

@NgModule({
    imports: [
        HttpModule,
        NativeScriptModule,
        TabsRoutingModule
    ],
    declarations: [
        TabsComponent,
        BalanceComponent
    ],
    providers: [
        CryptoService,
        DatabaseService,
        NotificationService,
        WalletService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class TabsModule { }
