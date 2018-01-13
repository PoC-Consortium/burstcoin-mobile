/*
* Copyright 2018 PoC-Consortium
*/

import { Component } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { CreateService } from './create.service'

@Component({
    selector: "create",
    moduleId: module.id,
    templateUrl: "./create.component.html",
    styleUrls: ["./create.component.css"]
})
export class CreateComponent {

    constructor(
        private createService: CreateService,
        private router: RouterExtensions
    ) {}

    /*
    * Used to go back to seed generation step
    */
    public onTapGenerateAgain(e) {
        this.createService.reset();
        this.router.navigate(['create/seed']);
    }

}
