import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import { BurstAddress, Wallet } from "../../../lib/model";
import { MarketService, NotificationService, WalletService } from "../../../lib/services";

import { BarcodeScanner, ScanOptions } from "nativescript-barcodescanner";

@Component({
    selector: "activate",
    moduleId: module.id,
    templateUrl: "./activate.component.html",
    styleUrls: ["./activate.component.css"]
})
export class ActivateComponent implements OnInit {

    constructor(
        private barcodeScanner: BarcodeScanner,
        private marketService: MarketService,
        private router: Router,
        private walletService: WalletService
    ) {

    }

    ngOnInit(): void {
        if (this.walletService.currentWallet.value.active) {
            this.router.navigate(['tabs']);
        }
    }

    public onTapActivate() {

    }
}
