/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { AccountService } from "../../lib/services";

@Component({
    selector: "activate",
    moduleId: module.id,
    templateUrl: "./activate.component.html",
    styleUrls: ["./activate.component.css"]
})
export class ActivateComponent implements OnInit {

    constructor(
        private accountService: AccountService,
        private router: RouterExtensions
    ) {}

    ngOnInit(): void {
        if (this.accountService.currentAccount.value.active) {
            this.router.navigateByUrl('tabs')
        }
    }
}
