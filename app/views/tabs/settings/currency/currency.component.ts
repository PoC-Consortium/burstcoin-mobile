/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { ListPicker } from "ui/list-picker";
import { constants } from "../../../../lib/model";
import { DatabaseService } from "../../../../lib/services";

@Component({
    moduleId: module.id,
    templateUrl: "./currency.component.html",
})
export class CurrencyComponent implements OnInit {
    private currencyCodes: string[] = constants.currencies;
    private index: number;
    private picked: string;

    constructor(
        private databaseService: DatabaseService,
        private params: ModalDialogParams,
        private page: Page
    ) {}

    ngOnInit() {
        this.index = constants.currencies.indexOf(this.params.context)
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    public selectedIndexChanged(args) {
        let picker = <ListPicker>args.object;
        this.picked = constants.currencies[picker.selectedIndex];
    }

    public onTapOk() {
        this.params.closeCallback(this.picked);
    }
}
