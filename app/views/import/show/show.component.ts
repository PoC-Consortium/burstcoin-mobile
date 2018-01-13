/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";

@Component({
    moduleId: module.id,
    templateUrl: "./show.component.html",
})
export class ShowComponent implements OnInit {
    private address: string;

    constructor(
        private params: ModalDialogParams,
        private page: Page
    ) {}

    ngOnInit() {
        this.address = this.params.context;
        this.page.on("unloaded", () => {
            this.params.closeCallback(false);
        });
    }

    public onTapNo() {
        this.params.closeCallback(false);
    }

    public onTapOk() {
        this.params.closeCallback(true);
    }
}
