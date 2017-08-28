import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Image } from "ui/image"

import { BurstAddress, Wallet } from "../../lib/model";

import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";

@Component({
    selector: "accounts",
    moduleId: module.id,
    templateUrl: "./accounts.component.html",
    styleUrls: ["./accounts.component.css"]
})
export class AccountsComponent implements OnInit {

    wallets: Wallet[];

    constructor(
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {
        this.wallets = [];
    }

    ngOnInit(): void {
        this.databaseService.getAllWallets()
            .then(wallets => {
                this.wallets = wallets;
            })
            .catch(err => {
                console.log("No wallets found: " + err);
            })
    }

}
