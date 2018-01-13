/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { TranslateService } from "ng2-translate";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { BurstAddress } from "../../../../lib/model";
import { AccountService, NotificationService } from "../../../../lib/services";

@Component({
    moduleId: module.id,
    templateUrl: "./contact.component.html",
    styleUrls: ["./contact.component.css"]
})
export class ContactComponent implements OnInit {
    private addressParts: string[];

    constructor(
        private accountService: AccountService,
        private params: ModalDialogParams,
        private page: Page,
        private notificationService: NotificationService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this.addressParts = [];
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    public onTapOk() {
        if (BurstAddress.isBurstcoinAddress(BurstAddress.constructBurstAddress(this.addressParts))) {
            this.params.closeCallback(BurstAddress.constructBurstAddress(this.addressParts));
        } else {
            this.translateService.get('NOTIFICATIONS.ADDRESS').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public formatAddress() {
        for (let i = 0; i < this.addressParts.length; i++) {
            if (this.addressParts[i] != undefined) {
                this.addressParts[i] = this.addressParts[i].toUpperCase()
            }
        }
    }
}
