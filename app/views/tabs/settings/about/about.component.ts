/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { constants } from "../../../../lib/model";

import * as utils from "utils/utils";

@Component({
    moduleId: module.id,
    templateUrl: "./about.component.html",
    styleUrls: ["./about.component.css"]
})
export class AboutComponent implements OnInit {
    private version: string = constants.version;

    constructor(
        private params: ModalDialogParams,
        private page: Page
    ) {}

    ngOnInit() {
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    public onTapTwitter() {
        utils.openUrl(constants.twitter)
    }

    public onTapNo() {
        this.params.closeCallback();
    }
}
