import { NgModule, ModuleWithProviders } from '@angular/core';
import { NativeScriptHttpModule } from "nativescript-angular/http";

import {
    CryptoService,
    DatabaseService,
    MarketService,
    NotificationService,
    WalletService
} from './services';

const SHARED_SERVICES = [
    CryptoService,
    DatabaseService,
    MarketService,
    NotificationService,
    WalletService
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
