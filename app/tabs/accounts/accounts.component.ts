import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Image } from "ui/image"

import { BurstAddress, Currency, Wallet } from "../../lib/model";

import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";

import { registerElement } from "nativescript-angular/element-registry";
registerElement("AccountsRefresh", () => require("nativescript-pulltorefresh").PullToRefresh);


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
        this.walletService.currentWallet.subscribe((wallet: Wallet) => {
            if (wallet != undefined) {
                this.databaseService.getAllWallets()
                    .then(wallets => {
                        this.wallets = wallets;
                        if (this.marketService.currency != undefined) {
                            this.wallets.map(wallet => {
                                wallet.balanceStringBTC = this.marketService.getPriceBTC(wallet.balance);
                                wallet.balanceStringCur = this.marketService.getPriceFiatCurrency(wallet.balance);
                            })
                        }
                    })
                    .catch(err => {
                        console.log("No wallets found: " + err);
                    })
            }
        });

        this.marketService.currency.subscribe((currency: Currency) => {
            if (currency != undefined) {
                this.wallets.map(wallet => {
                    wallet.balanceStringBTC = this.marketService.getPriceBTC(wallet.balance);
                    wallet.balanceStringCur = this.marketService.getPriceFiatCurrency(wallet.balance);
                })
            }
        });
    }

    public selectWallet(wallet: Wallet) {
        this.walletService.selectWallet(wallet)
            .then(wallet => {
                this.marketService.setCurrency(this.marketService.currency.value);
                this.notificationService.info("Selected wallet: " + wallet.address + "!");
            })
    }

    public refresh(args) {
        var pullRefresh = args.object;
        let wallet = this.walletService.currentWallet.value;
        this.walletService.synchronizeWallet(wallet)
            .then(wallet => {
                this.walletService.setCurrentWallet(wallet);
                this.marketService.updateCurrency()
                    .then(currency => {
                        pullRefresh.refreshing = false;
                    })
                    .catch(error => {
                        pullRefresh.refreshing = false;
                    });
            })
    }


}
