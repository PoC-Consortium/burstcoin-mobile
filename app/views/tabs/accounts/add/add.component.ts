/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { topmost } from "ui/frame";

@Component({
    selector: "add",
    moduleId: module.id,
    templateUrl: "./add.component.html",
    styleUrls: ["./add.component.css"]
})
export class AddComponent implements OnInit {

    constructor(
        private params: ModalDialogParams,
        private page: Page,
        private router: Router
    ) {}

    public ngOnInit() {
        this.page.on("unloaded", () => {
            // using the unloaded event to close the modal when there is user interaction
            // e.g. user taps outside the modal page
            this.params.closeCallback();
        });
    }

    public onTapImport() {
        this.router.navigate(['/import']);
        this.params.closeCallback();
    }

    public onTapCreate() {
        this.router.navigate(['/create']);
        this.params.closeCallback();
    }

    public onTapNo() {
        this.params.closeCallback();
    }
}
