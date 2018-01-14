/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "ui/page";
import { TranslateService } from "ng2-translate";
import { constants } from "../../../../lib/model";
import { AccountService, NotificationService } from "../../../../lib/services";

import * as utils from "utils/utils";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./support.component.html",
    styleUrls: ["./support.component.css"]
})
export class SupportComponent implements OnInit {

    constructor(
        private accountService: AccountService,
        private params: ModalDialogParams,
        private page: Page,
        private router: RouterExtensions,
        private notificationService: NotificationService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    public onTapSupport() {
        if (this.accountService.currentAccount.value.type == "active") {
            this.params.closeCallback();
            this.router.navigate(['/send', constants.donate]);
        } else {
            this.params.closeCallback();
            this.translateService.get('NOTIFICATIONS.ERRORS.REDIRECT').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public onTapGithub() {
        utils.openUrl(constants.supportUrl);
    }

    public onTapNo() {
        this.params.closeCallback();
    }
}
