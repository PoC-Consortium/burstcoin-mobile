/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { TranslateService } from "ng2-translate";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { Fees } from "../../../../lib/model";
import { AccountService, MarketService, NotificationService } from "../../../../lib/services";

@Component({
    moduleId: module.id,
    templateUrl: "./fees.component.html",
    styleUrls: ["./fees.component.css"]
})
export class FeesComponent {
    private fees: Fees;

    constructor(
        private accountService: AccountService,
        private marketService: MarketService,
        private params: ModalDialogParams,
        private page: Page,
        private notificationService: NotificationService,
        private translateService: TranslateService
    ) {
        this.fees = this.params.context;
    }

    public onTapCheap() {
        this.params.closeCallback(this.fees.cheap);
    }

    public onTapStandard() {
        this.params.closeCallback(this.fees.standard);
    }

    public onTapPriority() {
        this.params.closeCallback(this.fees.priority);
    }
}
