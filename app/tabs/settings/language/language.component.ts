import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { ListPicker } from "ui/list-picker";
import { DatabaseService } from "../../../lib/services";

@Component({
    moduleId: module.id,
    templateUrl: "./language.component.html",
})
export class LanguageComponent implements OnInit {

    picked: string;
    languageNames: string[] = ["Deutsch", "English", "Français", "Slovenský", "中文"]
    languages: string[] = ["de", "en", "fr", "sk", "zh"]
    index: number;

    constructor(
        private databaseService: DatabaseService,
        private params: ModalDialogParams,
        private page: Page
    ) {
        this.index = this.languages.indexOf(params.context)
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    ngOnInit() {

    }

    public selectedIndexChanged(args) {
        let picker = <ListPicker>args.object;
        this.picked = this.languages[picker.selectedIndex];
    }

    public onTapOk() {
        this.params.closeCallback(this.picked);
    }
}
