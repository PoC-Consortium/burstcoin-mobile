/*
* Copyright 2018 PoC-Consortium
*/

import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { CreateComponent } from "./create.component";
import { RecordComponent } from "./record/record.component";
import { ReproduceComponent } from "./reproduce/reproduce.component";
import { SeedComponent } from "./seed/seed.component";
import { VerifyComponent } from "./verify/verify.component";

export const routes: Routes = [
    {
        path: "",
        component: CreateComponent,
        children: [
            { path: '', redirectTo: 'seed', pathMatch: 'full' },
            { path: 'record', component: RecordComponent },
            { path: 'reproduce', component: ReproduceComponent },
            { path: 'seed', component: SeedComponent },
            { path: 'verify', component: VerifyComponent }
        ]
    }
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class CreateRoutingModule { }
