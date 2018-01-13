/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { AccountService } from "../../lib/services";

@Component({
    moduleId: module.id,
    selector: "send",
    templateUrl: "./send.component.html"
})
export class SendComponent implements OnInit {

    constructor(
        private accountService: AccountService,
        private router: RouterExtensions
    ) {}

    ngOnInit(): void {
        if (this.accountService.currentAccount.value != undefined) {
            if (this.accountService.currentAccount.value.keys == undefined) {
                this.router.navigate(['/tabs']);
            }
        }
    }
}
