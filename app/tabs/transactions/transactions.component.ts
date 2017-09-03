import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Border } from "ui/border";

import { Transaction, Wallet } from "../../lib/model";

import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";


@Component({
    selector: "transactions",
    moduleId: module.id,
    templateUrl: "./transactions.component.html",
    styleUrls: ["./transactions.component.css"]
})
export class TransactionsComponent implements OnInit {

    transactions: Transaction[];
    ownId: string;

    constructor(
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {
        this.ownId = "";
        this.transactions = [];
    }

    ngOnInit(): void {
        /*
        if (this.walletService.currentWallet.value != undefined) {
            this.transactions = this.walletService.currentWallet.value.transactions;
            this.ownId = this.walletService.currentWallet.value.id;
        }
        */

        this.walletService.currentWallet.subscribe((wallet: Wallet) => {
            if (wallet != undefined) {
                this.transactions = wallet.transactions;
                this.ownId = this.walletService.currentWallet.value.id;
            }
        });
    }

    public convertFiat() {

    }

    public onTapItem(e) {

    }

    public refresh() {

    }
}
