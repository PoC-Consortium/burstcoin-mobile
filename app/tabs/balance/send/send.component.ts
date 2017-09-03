import { Component, OnInit, ViewChild } from "@angular/core";

import { BurstAddress, Wallet } from "../../../lib/model";
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

    constructor(
        private barcodeScanner: BarcodeScanner,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {
        this.step = 1;
        this.recipient = "BURST-1111-1111-1111-11111";
        this.amount = 1;
        this.fee = 1;
    }

    ngOnInit(): void {
        if (this.walletService.currentWallet.value != undefined) {
            this.wallet = this.walletService.currentWallet.value;
            this.balance = this.marketService.getPriceBurstcoin(this.wallet.balance);
        } else {
            // TODO
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

    public onTapDone() {
        
    }

    public formatRecipient() {
        this.recipient = this.recipient.toUpperCase();
    }
}
