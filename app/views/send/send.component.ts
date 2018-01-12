/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from 'ng2-translate';
import { Account, BurstAddress, Transaction } from "../../lib/model";
import { AccountService, MarketService, NotificationService } from "../../lib/services";
import { BarcodeScanner, ScanOptions } from 'nativescript-barcodescanner';

@Component({
    moduleId: module.id,
    selector: "send",
    templateUrl: "./send.component.html"
})
export class SendComponent implements OnInit {
    step: number;
    account: Account;
    balance: string;
    recipient: string;
    amount: number;
    fee: number;
    pin: string;
    total: number;
    processing: boolean;

    constructor(
        private accountService: AccountService,
        private barcodeScanner: BarcodeScanner,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private route: ActivatedRoute,
        private translateService: TranslateService
    ) {
        this.step = 1;
        if (this.route.snapshot.params['address'] != undefined) {
            this.recipient = this.route.snapshot.params['address'];
        } else {
            this.recipient = "BURST-";
        }
        this.amount = undefined;
        this.fee = 1;
        this.total = 1;
        this.processing = false;
    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value != undefined) {
            this.account = this.accountService.currentAccount.value;
            if (this.account.keys == undefined) {
                this.router.navigate(['/tabs']);
            }
            this.balance = this.marketService.formatBurstcoin(this.account.balance);
        }
    }

    public onTapScan() {
        let options: ScanOptions = {
            formats: "QR_CODE"
        }

        this.barcodeScanner.scan(options).then((result) => {
            this.recipient = result.text;
        }, (errorMessage) => {
            this.translateService.get('NOTIFICATIONS.ERRORS.QR_CODE').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        });
    }

    public onTapVerify() {
        if (this.accountService.isBurstcoinAddress(this.recipient)) {
            if (this.amount > 0 && !isNaN(Number(this.amount))) {
                if (this.fee >= 1 && !isNaN(Number(this.fee))) {
                    if (parseFloat(this.amount.toString()) + parseFloat(this.fee.toString()) <= this.account.balance) {
                        this.step = 2;
                    } else {
                        this.translateService.get('NOTIFICATIONS.EXCEED').subscribe((res: string) => {
                            this.notificationService.info(res);
                        });
                    }
                } else {
                    this.translateService.get('NOTIFICATIONS.DECIMAL_FEE').subscribe((res: string) => {
                        this.notificationService.info(res);
                    });
                }
            } else {
                this.translateService.get('NOTIFICATIONS.DECIMAL_AMOUNT').subscribe((res: string) => {
                    this.notificationService.info(res);
                });
            }
        } else {
            this.translateService.get('NOTIFICATIONS.ADDRESS').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public onTapAccept() {
        if (this.accountService.checkPin(this.pin)) {
            this.processing = true;
            let account = this.accountService.currentAccount.value;
            let transaction = new Transaction();
            transaction.recipientAddress = this.recipient;
            transaction.amountNQT = this.amount;
            transaction.feeNQT = this.fee;
            transaction.senderPublicKey = account.keypair.publicKey;
            this.accountService.doTransaction(transaction, account.keypair.privateKey, this.pin)
                .then(transaction => {
                    this.translateService.get('NOTIFICATIONS.TRANSACTION').subscribe((res: string) => {
                        this.notificationService.info(res);
                    });
                    this.router.navigate(['/tabs']);
                }).catch(error => {
                    this.processing = false;
                    this.notificationService.info(error);
                })
        } else {
            this.translateService.get('NOTIFICATIONS.WRONG_PIN').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public verifyInputs(input: string) {
        let aNumber;
        let fNumber;
        if (this.amount != undefined) {
            aNumber = parseFloat(this.amount.toString());
        }
        if (this.fee != undefined) {
            fNumber = parseFloat(this.fee.toString());
        }
        if (isNaN(aNumber)) {
            aNumber = 0;
        }
        if (isNaN(fNumber)) {
            fNumber = 0;
        }
        if (aNumber + fNumber > this.account.balance) {
            if (input == "amount") {
                this.amount = this.account.balance - fNumber;
            } else {
                this.fee = this.account.balance - aNumber;
            }
        }
        this.total = aNumber + fNumber;
    }

    public formatRecipient() {
        this.recipient = this.recipient.toUpperCase();
    }

}
