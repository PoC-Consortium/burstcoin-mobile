/*
    Copyright 2017 icewave.org
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { ModalDialogService } from "nativescript-angular/modal-dialog";
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { NativeScriptUIListViewModule } from "nativescript-telerik-ui/listview/angular";

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
import { LanguageComponent } from "./settings/language/language.component";
import { NodeComponent } from "./settings/node/node.component";
import { SupportComponent } from "./settings/support/support.component";

import { SharedModule } from "../lib/shared.module";

export function createBarcodeScanner() {
  return new BarcodeScanner();
}

@NgModule({
    imports: [
        NativeScriptModule,
        NativeScriptFormsModule,
        SharedModule,
        TabsRoutingModule,
        NativeScriptUIListViewModule
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
        LanguageComponent,
        NodeComponent,
        SupportComponent,
        NoteComponent
    ],
    providers: [
        [{provide: BarcodeScanner, useFactory: (createBarcodeScanner)}],
        ModalDialogService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    entryComponents: [
        AboutComponent,
        AddComponent,
        CurrencyComponent,
        LanguageComponent,
        NodeComponent,
        NoteComponent,
        RemoveComponent,
        SupportComponent
    ]
})
export class TabsModule { }
