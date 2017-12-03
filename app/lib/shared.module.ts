/*
    Copyright 2017 icewave.org
*/

import { NgModule, ModuleWithProviders } from '@angular/core';
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { TranslateModule } from 'ng2-translate';

import {
    AccountService,
    CryptoService,
    DatabaseService,
    MarketService,
    NotificationService,
    TabsService
} from './services';

const SHARED_SERVICES = [
    AccountService,
    CryptoService,
    DatabaseService,
    MarketService,
    NotificationService,
    TabsService
];

@NgModule({
  imports:      [ NativeScriptHttpModule ],
  declarations: [ ],
  exports:      [ TranslateModule ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ ...SHARED_SERVICES ]
    };
  }
}
