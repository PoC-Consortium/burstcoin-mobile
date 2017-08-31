import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { TabsComponent } from "./tabs.component";
import { ActivateComponent } from "./accounts/activate/activate.component";
import { ReceiveComponent } from "./balance/receive/receive.component";
import { SendComponent } from "./balance/send/send.component";

const routes: Routes = [
    { path: "", component: TabsComponent },
    { path: "accounts/activate", component: ActivateComponent },
    { path: "accounts/activate/:pin", component: ActivateComponent },
    { path: "balance/receive", component: ReceiveComponent },
    { path: "balance/send", component: SendComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class TabsRoutingModule { }
