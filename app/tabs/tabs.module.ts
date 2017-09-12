import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { ModalDialogService } from "nativescript-angular/modal-dialog";
import { BarcodeScanner } from 'nativescript-barcodescanner';

import { TabsRoutingModule } from "./tabs.routing";
import { TabsComponent } from "./tabs.component";

import { AccountsComponent } from "./accounts/accounts.component";
import { ActivateComponent } from "./accounts/activate/activate.component";
import { AddComponent } from "./accounts/add/add.component";
import { RemoveComponent } from "./accounts/remove/remove.component";

import { BalanceComponent } from "./balance/balance.component";
import { ReceiveComponent } from "./balance/receive/receive.component";
import { SendComponent } from "./balance/send/send.component";

import { NoteComponent } from "./note/note.component";

import { TransactionsComponent } from "./transactions/transactions.component";

import { SettingsComponent } from "./settings/settings.component";
import { AboutComponent } from "./settings/about/about.component";
import { CurrencyComponent } from "./settings/currency/currency.component";
import { NodeComponent } from "./settings/node/node.component";

import { SharedModule } from "../lib/shared.module";

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        SharedModule,
        TabsRoutingModule
    ],
    declarations: [
        TabsComponent,
        BalanceComponent,
        ReceiveComponent,
        SendComponent,
        TransactionsComponent,
        AccountsComponent,
        ActivateComponent,
        AddComponent,
        RemoveComponent,
        SettingsComponent,
        AboutComponent,
        CurrencyComponent,
        NodeComponent,
        NoteComponent
    ],
    providers: [
        BarcodeScanner,
        ModalDialogService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    entryComponents: [
        AboutComponent,
        AddComponent,
        CurrencyComponent,
        NodeComponent,
        NoteComponent,
        RemoveComponent
    ]
})
export class TabsModule { }
