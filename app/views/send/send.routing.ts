/*
    Copyright 2017 icewave.org
*/

import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { SendComponent } from "./send.component";
import { InputComponent } from "./input/input.component";
import { VerifyComponent } from "./verify/verify.component";

export const routes: Routes = [
    {
        path: "",
        component: SendComponent,
        children: [
            { path: '', redirectTo: 'input', pathMatch: 'full' },
            { path: ':address', component: InputComponent },
            { path: 'input', component: InputComponent },
            { path: 'verify', component: VerifyComponent }
        ]
    }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class SendRoutingModule { }
