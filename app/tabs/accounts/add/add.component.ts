import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";

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
        private router: RouterExtensions
    ) {
        this.page.on("unloaded", () => {
            // using the unloaded event to close the modal when there is user interaction
            // e.g. user taps outside the modal page
            this.params.closeCallback();
        });
    }

    public ngOnInit() {

    }

    public onTapImport() {
        this.params.closeCallback();
        this.router.navigate(['/import']);
    }

    public onTapCreate() {
        this.params.closeCallback();
        this.router.navigate(['/create']);
    }
}
