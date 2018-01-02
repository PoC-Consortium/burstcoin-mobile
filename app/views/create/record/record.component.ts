/*
    Copyright 2017 icewave.org
*/

import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { CryptoService, NotificationService } from "../../../lib/services";
import { CreateService } from "../create.service"

@Component({
    selector: "record",
    moduleId: module.id,
    templateUrl: "./record.component.html",
    styleUrls: ["./record.component.css"]
})
export class RecordComponent implements OnInit {

    private index: number;

    constructor(
        private createService: CreateService,
        private router: RouterExtensions
    ) {}

    ngOnInit() {
        this.index = 0;
    }

    /*
    * This method is responssible for changing the index of the passphrase
    * one by one to show the user all 12 words in the right order
    */
    public onTapNext(e) {
        this.index++;
        if (this.index >= 12) {
            this.index = 0;
            this.createService.setProgress(2)
            this.router.navigate(['create/reproduce'])
        }
    }

}
