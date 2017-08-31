import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
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

    pin: string;

    constructor(
        private marketService: MarketService,
        private route: ActivatedRoute,
        private router: Router,
        private walletService: WalletService
    ) {
        this.pin = this.route.snapshot.params['pin'];
        if (this.pin != undefined) {
            // TODO: show loading
            console.log("p" + this.pin);
            // TODO: generate keys add them to wallet, encrypt with pin code, save pin hash in wallet
        }
    }

    ngOnInit(): void {
        if (this.walletService.currentWallet.value.active) {
            this.router.navigate(['tabs']);
        }
    }

    public onTapNext() {
        this.router.navigate(['pin', 'set', encodeURIComponent('tabs/accounts/activate')]);
    }
}
