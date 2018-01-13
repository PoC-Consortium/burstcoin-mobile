/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { TranslateService } from "ng2-translate";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { Page } from "ui/page";
import { AccountService, MarketService, NotificationService } from "../../../../lib/services";

@Component({
    moduleId: module.id,
    templateUrl: "./fiat.component.html",
    styleUrls: ["./fiat.component.css"]
})
export class FiatComponent {
    private amount: string;
    private burstcoins: number;

    constructor(
        private accountService: AccountService,
        private marketService: MarketService,
        private params: ModalDialogParams,
        private page: Page,
        private notificationService: NotificationService,
        private translateService: TranslateService
    ) {
        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
    }

    public calculateBurstcoins() {
        let aNumber: number;
        let burstString: string;
        if (this.amount != undefined) {
            aNumber = parseFloat(this.amount.toString());
            if (isNaN(aNumber)) {
                this.burstcoins = 0;
            } else {
                this.burstcoins = this.marketService.convertFiatCurrencyToBurstcoin(aNumber)
                // to fixed 8 if decimal values
                if (this.burstcoins % 1 == 0) {
                    burstString = this.burstcoins.toString();
                } else {
                    burstString = this.burstcoins.toFixed(8);
                }
                this.burstcoins = parseFloat(burstString);
            }
        }
    }

    public onTapOk() {
        this.params.closeCallback(this.burstcoins);
    }
}
