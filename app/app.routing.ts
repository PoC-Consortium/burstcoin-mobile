/*
    Copyright 2017 icewave.org
*/

import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

const routes: Routes = [
    { path: "", redirectTo: "start", pathMatch: "full" },
    { path: "activate", loadChildren: "./views/activate/activate.module#ActivateModule" },
    { path: "create", loadChildren: "./views/create/create.module#CreateModule" },
    { path: "start", loadChildren: "./views/start/start.module#StartModule" },
    { path: "import", loadChildren: "./views/import/import.module#ImportModule" },
    { path: "send", loadChildren: "./views/send/send.module#SendModule"},
    { path: "tabs", loadChildren: "./views/tabs/tabs.module#TabsModule" }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
