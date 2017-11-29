import { Component, OnInit, NgModule } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "ui/page";
import { TranslateService } from 'ng2-translate';
import { AccountService, NotificationService } from "../../../lib/services";

import * as utils from "utils/utils";

// >> passing-parameters
@Component({
    moduleId: module.id,
    templateUrl: "./support.component.html",
    styleUrls: ["./support.component.css"]
})
export class SupportComponent implements OnInit {

    private donateAddress: string = "BURST-RTEY-HUSA-BJG4-EZW9E";

    constructor(
        private accountService: AccountService,
        private params: ModalDialogParams,
        private page: Page,
        private router: RouterExtensions,
        private notificationService: NotificationService,
        private translateService: TranslateService
        ) {
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    ngOnInit() {

    }

    public onTapSupport() {
        if (this.accountService.currentAccount.value.type == "active") {
            this.params.closeCallback();
            this.router.navigate(['/tabs/balance/send', this.donateAddress]);
        } else {
            this.params.closeCallback();
            this.translateService.get('NOTIFICATIONS.ERRORS.REDIRECT').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public onTapGithub() {
        utils.openUrl("https://github.com/poc-consortium/burstcoin-mobile-doc/issues");
    }

    public onTapNo() {
        this.params.closeCallback();
    }
}
