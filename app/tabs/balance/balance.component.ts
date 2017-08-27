import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";

import { BurstAddress, Wallet } from "../../lib/model";

import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";

@Component({
    selector: "balance",
    moduleId: module.id,
    templateUrl: "./balance.component.html",
    styleUrls: ["./balance.component.css"]
})
export class BalanceComponent implements OnInit {

    wallet: Wallet;

    address: string;
    balance: string;
    balanceBTC: string;
    balanceCur: string;

    constructor(
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {

    }

    ngOnInit(): void {
        this.walletService.currentWallet.subscribe((wallet: Wallet) => this.update(wallet));
    }

    public update(wallet: Wallet) {
        console.log("last" + JSON.stringify(wallet));
        this.wallet = wallet;
        this.address = wallet.address;
        this.balance = wallet.balance.toFixed(8);
        this.marketService.getCurrency()
            .then(currency => {
                this.balanceBTC = (wallet.balance * currency.priceBTC).toString() + " BTC";
                this.balanceCur = (wallet.balance * currency.priceCur).toString() + " " + currency.currency;
            })
        // TODO: update qr code here
    }

}
