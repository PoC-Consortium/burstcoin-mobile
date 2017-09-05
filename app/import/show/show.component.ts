import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";

@Component({
    moduleId: module.id,
    templateUrl: "./show.component.html",
})
export class ShowComponent implements OnInit {

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

    public onTapNo() {
        this.params.closeCallback(false);
    }

    public onTapOk() {
        this.params.closeCallback(true);
    }
}
