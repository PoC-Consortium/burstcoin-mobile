import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { BrowseComponent } from "./browse/browse.component";
import { FeaturedComponent } from "./featured/featured.component";
import { HomeComponent } from "./home/home.component";
import { SearchComponent } from "./search/search.component";
import { SettingsComponent } from "./settings/settings.component";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DashboardComponent } from "./dashboard.component";

@NgModule({
    imports: [
        NativeScriptModule,
        DashboardRoutingModule
    ],
    declarations: [
        DashboardComponent,
        HomeComponent,
        BrowseComponent,
        SearchComponent,
        FeaturedComponent,
        SettingsComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class DashboardModule { }
