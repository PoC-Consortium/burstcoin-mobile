/*
    Copyright 2017 icewave.org
*/

import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { ActivateComponent } from "./activate.component";
import { PasswordComponent } from "./password/password.component";
import { PinComponent } from "./pin/pin.component";

export const routes: Routes = [
    {
        path: "",
        component: ActivateComponent,
        children: [
            { path: '', redirectTo: 'password', pathMatch: 'full' },
            { path: 'password', component: PasswordComponent },
            { path: 'pin', component: PinComponent }
        ]
    }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class ActivateRoutingModule { }
