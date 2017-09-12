import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { CreateComponent } from "./create.component";

export const routes: Routes = [
    {
        path: "",
        component: CreateComponent
    }
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class CreateRoutingModule { }
