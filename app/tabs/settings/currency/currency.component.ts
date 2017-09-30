import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { ListPicker } from "ui/list-picker";
import { DatabaseService } from "../../../lib/services";

@Component({
    moduleId: module.id,
    templateUrl: "./currency.component.html",
})
export class CurrencyComponent implements OnInit {

    picked: string;
    currencies: string[] = ["CAD", "CHF", "CNY", "EUR", "GBP", "INR", "JPY", "RUB", "USD"];
    index: number;

    constructor(
        private databaseService: DatabaseService,
        private params: ModalDialogParams,
        private page: Page
    ) {
        this.index = this.currencies.indexOf(params.context)
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    ngOnInit() {

    }

    public selectedIndexChanged(args) {
        let picker = <ListPicker>args.object;
        this.picked = this.currencies[picker.selectedIndex];
    }

    public onTapOk() {
        this.params.closeCallback(this.picked);
    }
}
