/*
* Copyright 2018 PoC-Consortium
*/

import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { TabsComponent } from "./tabs.component";
import { AddComponent } from "./accounts/add/add.component";
import { ReceiveComponent } from "./balance/receive/receive.component";

const routes: Routes = [
    { path: "", component: TabsComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class TabsRoutingModule { }
