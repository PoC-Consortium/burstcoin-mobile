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

    wallet: Wallet;
    balance: string;

    constructor(
        private barcodeScanner: BarcodeScanner,
        private marketService: MarketService,
        private walletService: WalletService) {

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
            // Note that this Promise is never invoked when a 'continuousScanCallback' function is provided
            alert({
                title: "Scan result",
                message: "Format: " + result.format + ",\nValue: " + result.text,
                okButtonText: "OK"
            });
        }, (errorMessage) => {
            console.log("No scan. " + errorMessage);
        });
    }
}
