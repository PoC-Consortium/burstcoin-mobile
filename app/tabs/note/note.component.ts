/*
    Copyright 2017 icewave.org
*/

import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";

import * as utils from "utils/utils";

@Component({
    moduleId: module.id,
    templateUrl: "./note.component.html",
})
export class NoteComponent implements OnInit {

    address: string;

    constructor(
        private params: ModalDialogParams,
        private page: Page
    ) {
        this.address = params.context;
        this.page.on("unloaded", () => {
            this.params.closeCallback(false);
        });
    }

    ngOnInit() {

    }

    public onTapAccept() {
        this.params.closeCallback(false);
    }
}
