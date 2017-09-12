import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Image } from "ui/image"

import { BurstAddress, Currency, Wallet } from "../../lib/model";
import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";
import { AddComponent } from "./add/add.component";

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
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private vcRef: ViewContainerRef,
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

    public selectWallet(wallet: Wallet) {
        this.walletService.selectWallet(wallet)
            .then(wallet => {
                this.notificationService.info("Selected wallet: " + wallet.address);
                this.marketService.setCurrency(this.marketService.currency.value);
            })
    }

    public onTapAddAccount() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };
        this.modalDialogService.showModal(AddComponent, options)
            .then(result => { })
            .catch(error => { });
    }

    public onTapRemoveAccount(wallet: Wallet) {
        this.walletService.removeWallet(wallet)
            .then(success => {
                let index = this.wallets.indexOf(wallet);
                if (index > -1) {
                   this.wallets.splice(index, 1);
                }
                if (this.wallets.length <= 0) {
                    this.router.navigate(['start']);
                    return;
                } else {
                    if (wallet.selected == true) {
                        this.selectWallet(this.wallets[0]);
                    }
                }
            })
            .catch(error => {
                this.notificationService.error("Could not remove account!")
            })
    }

    public refresh(args) {
        var pullRefresh = args.object;
        for (let i = 0; i < this.wallets.length; i++) {
            this.walletService.synchronizeWallet(this.wallets[i])
                .then(wallet => {
                    if (i == this.wallets.length - 1) {
                        this.marketService.updateCurrency()
                            .then(currency => {
                                pullRefresh.refreshing = false;
                            })
                            .catch(error => {
                                pullRefresh.refreshing = false;
                                this.notificationService.info("Could not fetch currency information!")
                            });
                    }
                })
                .catch(error => {
                    if (i == this.wallets.length - 1) {
                        this.marketService.updateCurrency()
                            .then(currency => {
                                pullRefresh.refreshing = false;
                            })
                            .catch(error => {
                                pullRefresh.refreshing = false;
                                this.notificationService.info("Could not fetch currency information!")
                            });
                    }
                })
        }
    }


}
