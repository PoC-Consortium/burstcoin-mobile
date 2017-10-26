import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";

import * as utils from "utils/utils";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./about.component.html",
    styleUrls: ["./about.component.css"]
})
export class AboutComponent implements OnInit {

    public version: string = "0.1.2";

    constructor(private params: ModalDialogParams, private page: Page) {
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    ngOnInit() {

    }

    public onTapTwitter() {
        utils.openUrl("https://twitter.com/PoC_Consortium")
    }

    public onTapNo() {
        this.params.closeCallback();
    }
}
