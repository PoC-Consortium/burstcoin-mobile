import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Image } from "ui/image"

import { Account, BurstAddress, Currency } from "../../lib/model";
import { AccountService, DatabaseService, MarketService, NotificationService } from "../../lib/services";
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

    accounts: Account[];

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private vcRef: ViewContainerRef
    ) {
        this.accounts = [];
    }

    ngOnInit(): void {
        this.databaseService.getAllAccounts()
            .then(accounts => {
                this.accounts = accounts;
            })
            .catch(err => {
                console.log("No accounts found: " + err);
            })
    }

    public selectAccount(account: Account) {
        this.accountService.selectAccount(account)
            .then(account => {
                this.notificationService.info("Selected account: " + account.address);
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

    public onTapRemoveAccount(account: Account) {
        this.accountService.removeAccount(account)
            .then(success => {
                let index = this.accounts.indexOf(account);
                if (index > -1) {
                   this.accounts.splice(index, 1);
                }
                if (this.accounts.length <= 0) {
                    this.router.navigate(['start']);
                    return;
                } else {
                    if (account.selected == true) {
                        this.selectAccount(this.accounts[0]);
                    }
                }
            })
            .catch(error => {
                this.notificationService.error("Could not remove account!")
            })
    }

    public refresh(args) {
        var pullRefresh = args.object;
        for (let i = 0; i < this.accounts.length; i++) {
            this.accountService.synchronizeAccount(this.accounts[i])
                .then(account => {
                    if (i == this.accounts.length - 1) {
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
                    if (i == this.accounts.length - 1) {
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
