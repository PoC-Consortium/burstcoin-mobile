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
    templateUrl: "./language.component.html",
})
export class LanguageComponent implements OnInit {
    private picked: string;
    private index: number;
    private languageNames: string[];

    constructor(
        private databaseService: DatabaseService,
        private params: ModalDialogParams,
        private page: Page
    ) {}

    ngOnInit() {
        // search for sleected language index
        this.index = constants.languages.findIndex(i => i.code === this.params.context);
        // get only lnaguage names for listpicker
        this.languageNames = [];
        constants.languages.map(lang => this.languageNames.push(lang.name))
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    public selectedIndexChanged(args) {
        let picker = <ListPicker>args.object;
        this.picked = constants.languages[picker.selectedIndex].code;
    }

    public onTapOk() {
        this.params.closeCallback(this.picked);
    }

    public onTapNo() {
        this.params.closeCallback();
    }
}
