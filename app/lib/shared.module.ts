import { NgModule, ModuleWithProviders } from '@angular/core';
import { NativeScriptHttpModule } from "nativescript-angular/http";

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
  exports:      [ ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ ...SHARED_SERVICES ]
    };
  }
}
