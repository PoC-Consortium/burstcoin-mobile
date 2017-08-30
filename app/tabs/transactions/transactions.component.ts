import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";

import { Transaction } from "../../lib/model";

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

    }

    ngOnInit(): void {
        this.transactions = this.walletService.currentWallet.value.transactions;
        this.ownId = this.walletService.currentWallet.value.id;
    }

    public convertFiat() {

    }

    public onTapItem(e) {

    }
}
