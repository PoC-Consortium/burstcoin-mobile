/*
* Copyright 2018 PoC-Consortium
*/

import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { StartComponent } from "./start.component";

export const routes: Routes = [
    {
        path: "",
        component: StartComponent
    }
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class StartRoutingModule { }
