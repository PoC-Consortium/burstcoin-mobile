import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { TransactionsComponent } from "./transactions.component";

export const routes: Routes = [
    {
        path: "",
        component: TransactionsComponent
    }
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class TransactionsRoutingModule { }
