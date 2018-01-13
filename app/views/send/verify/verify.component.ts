/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from 'ng2-translate';
import { Account, BurstAddress, Transaction } from "../../../lib/model";
import { UnknownAccountError } from "../../../lib/model/error"
import { AccountService, MarketService, NotificationService } from "../../../lib/services";
import { BarcodeScanner, ScanOptions } from 'nativescript-barcodescanner';

import { SendService } from "../send.service";

@Component({
    moduleId: module.id,
    selector: "verify",
    styleUrls: ["./verify.component.css"],
    templateUrl: "./verify.component.html"
})
export class VerifyComponent implements OnInit {
    private account: Account;
    private balance: string
    private loading: boolean;
    private pin: string;
    private total: number;

    constructor(
        private accountService: AccountService,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private route: ActivatedRoute,
        private sendService: SendService,
        private translateService: TranslateService
    ) {
    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value != undefined) {
            this.account = this.accountService.currentAccount.value;
            this.balance = this.marketService.formatBurstcoin(this.account.balance);
        }
        this.total = Number(this.sendService.getAmount()) + Number(this.sendService.getFee());
    }

    public onTapAccept() {
        if (this.accountService.checkPin(this.pin)) {
            this.loading = true;
            this.sendService.createTransaction(this.account.keys, this.pin).then(transaction => {
                this.accountService.doTransaction(transaction, this.account.keys.signPrivateKey, this.pin)
                    .then(transaction => {
                        this.translateService.get('NOTIFICATIONS.TRANSACTION').subscribe((res: string) => {
                            this.notificationService.info(res);
                        });
                        this.sendService.reset();
                        this.router.navigate(['/tabs'], { clearHistory: true });
                    }).catch(error => {
                        this.loading = false;
                        this.notificationService.info(error);
                    })
            }).catch(error => {
                this.loading = false;
                if (error instanceof UnknownAccountError) {
                    this.translateService.get('NOTIFICATIONS.ERRORS.NO_PUBLIC_KEY').subscribe((res: string) => {
                        this.notificationService.info(res);
                    });
                }
            })
        } else {
            this.translateService.get('NOTIFICATIONS.WRONG_PIN').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public onTapBack() {
        this.router.navigate(['/send/input']);
    }
}
