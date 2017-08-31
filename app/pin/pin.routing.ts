import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { PinComponent } from "./pin.component";

export const routes: Routes = [
    {
        path: ":type/:return",
        component: PinComponent
    }
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class PinRoutingModule { }
