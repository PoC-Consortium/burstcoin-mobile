/*
* Copyright 2018 PoC-Consortium
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { ModalDialogService } from "nativescript-angular/modal-dialog";
import { NativeScriptUIListViewModule } from "nativescript-pro-ui/listview/angular";
import { BarcodeScanner } from 'nativescript-barcodescanner';

import { TabsRoutingModule } from "./tabs.routing";
import { TabsComponent } from "./tabs.component";

import { AccountsComponent } from "./accounts/accounts.component";
import { AddComponent } from "./accounts/add/add.component";
import { RemoveComponent } from "./accounts/remove/remove.component";

import { BalanceComponent } from "./balance/balance.component";

import { TransactionsComponent } from "./transactions/transactions.component";
import { DecryptComponent } from "./transactions/decrypt/decrypt.component";

import { SettingsComponent } from "./settings/settings.component";
import { AboutComponent } from "./settings/about/about.component";
import { CurrencyComponent } from "./settings/currency/currency.component";
import { LanguageComponent } from "./settings/language/language.component";
import { NodeComponent } from "./settings/node/node.component";
import { SupportComponent } from "./settings/support/support.component";

import { SharedModule } from "../../lib/shared.module";

export function createBarcodeScanner() {
  return new BarcodeScanner();
}

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptFormsModule,
        SharedModule,
        TabsRoutingModule,
        NativeScriptUIListViewModule
    ],
    declarations: [
        AboutComponent,
        AccountsComponent,
        AddComponent,
        BalanceComponent,
        CurrencyComponent,
        DecryptComponent,
        LanguageComponent,
        NodeComponent,
        RemoveComponent,
        SettingsComponent,
        SupportComponent,
        TabsComponent,
        TransactionsComponent
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
        DecryptComponent,
        LanguageComponent,
        NodeComponent,
        RemoveComponent,
        SupportComponent
    ]
})
export class TabsModule { }
