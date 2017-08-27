import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

const routes: Routes = [
    { path: "", redirectTo: "import", pathMatch: "full" },
    { path: "create", loadChildren: "./create/create.module#CreateModule" },
    { path: "start", loadChildren: "./start/start.module#StartModule" },
    { path: "import", loadChildren: "./import/import.module#ImportModule" },
    { path: "tabs", loadChildren: "./tabs/tabs.module#TabsModule" }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
