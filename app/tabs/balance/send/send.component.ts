import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import { BurstAddress, Transaction, Wallet } from "../../../lib/model";
import { MarketService, NotificationService, WalletService } from "../../../lib/services";

import { BarcodeScanner, ScanOptions } from "nativescript-barcodescanner";

@Component({
    selector: "send",
    moduleId: module.id,
    templateUrl: "./send.component.html",
    styleUrls: ["./send.component.css"]
})
export class SendComponent implements OnInit {
    step: number;
    wallet: Wallet;
    balance: string;
    recipient: string;
    amount: number;
    fee: number;
    pin: string;

    constructor(
        private barcodeScanner: BarcodeScanner,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private router: Router,
        private walletService: WalletService
    ) {
        this.step = 1;
        this.recipient = "BURST-";
        this.amount = 0;
        this.fee = 1;
    }

    ngOnInit(): void {
        if (this.walletService.currentWallet.value != undefined) {
            this.wallet = this.walletService.currentWallet.value;
            this.balance = this.marketService.getPriceBurstcoin(this.wallet.balance);
        } 
    }

    public onTapScan() {
        let options: ScanOptions = {
            formats: "QR_CODE"
        }
        this.barcodeScanner.scan(options).then((result) => {
            this.recipient = result.text;
        }, (errorMessage) => {
            this.notificationService.info("Error scanning for QR code!")
        });
    }

    public onTapVerify() {
        if (this.walletService.isBurstcoinAddress(this.recipient)) {
            if (this.amount > 0 && !isNaN(Number(this.amount))) {
                if (this.fee >= 1 && !isNaN(Number(this.fee))) {
                    this.step = 2;
                } else {
                    this.notificationService.info("Please enter a decimal number as fee!")
                }
            } else {
                this.notificationService.info("Please enter a decimal number for the amount of BURST you want to send!")
            }
        } else {
            this.notificationService.info("Please enter a valid Burst address!")
        }
    }

    public onTapAccept() {
        if (this.walletService.checkPin(this.pin)) {
            let wallet = this.walletService.currentWallet.value;
            let transaction = new Transaction();
            transaction.recipientAddress = this.recipient;
            transaction.amountNQT = this.amount;
            transaction.feeNQT = this.fee;
            transaction.senderPublicKey = wallet.keypair.publicKey;
            this.walletService.doTransaction(transaction, wallet.keypair.privateKey, this.walletService.hashPin(this.pin))
                .then(transaction => {
                    this.router.navigate(['tabs'])
                })
        } else {
            this.notificationService.info("The provided pin does not match the pin code of the wallet!")
        }
    }

    public formatRecipient() {
        this.recipient = this.recipient.toUpperCase();
    }
}
