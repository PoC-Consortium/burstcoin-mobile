import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { DashboardComponent } from "./dashboard.component";
import { OverviewComponent } from "./overview/overview.component";
import { ReceiveComponent } from "./receive/receive.component";
import { SendComponent } from "./send/send.component";

export const routes: Routes = [
    {
        path: "",
        component: DashboardComponent,
        children: [
            { path: "", redirectTo: "overview", pathMatch: 'full' },
            { path: "overview", component: OverviewComponent },
            { path: "receive", component: ReceiveComponent },
            { path: "send", component: SendComponent }
        ]
    }
];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class DashboardRoutingModule { }
