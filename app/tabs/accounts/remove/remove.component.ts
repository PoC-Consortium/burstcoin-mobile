/*
    Copyright 2017 icewave.org
*/

import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { TranslateService } from 'ng2-translate';

import { Account } from "../../../lib/model";
import { AccountService, DatabaseService, NotificationService } from "../../../lib/services";

@Component({
    selector: "remove",
    moduleId: module.id,
    templateUrl: "./remove.component.html",
    styleUrls: ["./remove.component.css"]
})
export class RemoveComponent implements OnInit {

    loading: boolean;
    remove: Account;

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private params: ModalDialogParams,
        private notificationService: NotificationService,
        private page: Page,
        private router: RouterExtensions,
        private translateService: TranslateService
    ) {
        this.remove = params.context;
        this.page.on("unloaded", () => {
            this.params.closeCallback(false);
        });
    }

    public ngOnInit() {

    }

    public onTapNo() {
        this.params.closeCallback(false);
    }

    public onTapOk() {
        this.loading = true;
        this.accountService.removeAccount(this.remove)
            .then(success => {
                this.params.closeCallback(success);
            })
            .catch(error => {
                this.translateService.get("NOTIFICATIONS.ERRORS.REMOVE").subscribe((res: string) => {
                    this.notificationService.info(res);
                });
                this.params.closeCallback(false);
            })
    }
}
