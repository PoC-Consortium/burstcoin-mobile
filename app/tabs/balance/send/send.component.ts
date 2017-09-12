import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Account, BurstAddress, Transaction } from "../../../lib/model";
import { AccountService, MarketService, NotificationService } from "../../../lib/services";

import { BarcodeScanner, ScanOptions } from "nativescript-barcodescanner";

@Component({
    selector: "send",
    moduleId: module.id,
    templateUrl: "./send.component.html",
    styleUrls: ["./send.component.css"]
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
        private router: RouterExtensions
    ) {
        this.step = 1;
        this.recipient = "BURST-";
        this.amount = undefined;
        this.fee = 1;
        this.total = 1;
        this.processing = false;
    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value != undefined) {
            this.account = this.accountService.currentAccount.value;
            this.balance = this.marketService.getPriceBurstcoin(this.account.balance);
        }
    }

    public onTapScan() {
        let options: ScanOptions = {
            formats: "QR_CODE"
        }
        this.barcodeScanner.scan(options).then((result) => {
            this.recipient = result.text;
        }, (errorMessage) => {
            this.notificationService.info("Could not scan QR code!")
        });
    }

    public onTapVerify() {
        if (this.accountService.isBurstcoinAddress(this.recipient)) {
            if (this.amount > 0 && !isNaN(Number(this.amount))) {
                if (this.fee >= 1 && !isNaN(Number(this.fee))) {
                    this.step = 2;
                } else {
                    this.notificationService.info("Please enter a decimal number (atleast 1) as fee!")
                }
            } else {
                this.notificationService.info("Please enter a decimal number for the amount of BURST you want to send!")
            }
        } else {
            this.notificationService.info("Please enter a valid Burstcoin address!")
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
                    this.notificationService.info("Transaction successful!");
                    setTimeout(t => {
                        this.router.navigate(['/tabs']);
                    }, 500);
                }).catch(error => {
                    this.processing = false;
                    this.notificationService.info(error);
                })
        } else {
            this.notificationService.info("Wrong PIN!")
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
