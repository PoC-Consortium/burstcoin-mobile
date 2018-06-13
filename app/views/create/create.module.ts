/*
* Copyright 2018 PoC-Consortium
*/

import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { SharedModule } from "../../lib/shared.module";
import { CreateRoutingModule } from "./create.routing";

import { CreateService } from "./create.service";
import { CreateComponent } from "./create.component";
import { RecordComponent } from "./record/record.component";
import { ReproduceComponent } from "./reproduce/reproduce.component";
import { SeedComponent } from "./seed/seed.component";
import { VerifyComponent } from "./verify/verify.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptFormsModule,
        SharedModule,
        CreateRoutingModule
    ],
    declarations: [
        CreateComponent,
        RecordComponent,
        ReproduceComponent,
        SeedComponent,
        VerifyComponent
    ],
    providers: [
        CreateService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class CreateModule { }
