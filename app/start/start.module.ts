import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { StartRoutingModule } from "./start.routing";
import { StartComponent } from "./start.component";


@NgModule({
    imports: [
        NativeScriptModule,
        StartRoutingModule
    ],
    declarations: [
        StartComponent
    ],
    providers: [

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class StartModule { }
