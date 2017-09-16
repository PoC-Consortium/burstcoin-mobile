import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Border } from "ui/border";
import { GestureEventData } from "ui/gestures";
import { registerElement } from "nativescript-angular/element-registry";

import { Account, Transaction } from "../../lib/model";
import { Converter } from "../../lib/util";

import { AccountService, DatabaseService, MarketService, NotificationService } from "../../lib/services";

import * as SocialShare from "nativescript-social-share";
let clipboard = require("nativescript-clipboard");

registerElement("TransactionsRefresh", () => require("nativescript-pulltorefresh").PullToRefresh);

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
        private accountService: AccountService
    ) {
        this.ownId = "";
        this.transactions = [];
    }

    ngOnInit(): void {
        this.accountService.currentAccount.subscribe((account: Account) => {
            if (account != undefined) {
                this.transactions = account.transactions;
                this.ownId = this.accountService.currentAccount.value.id;
            }
        });
    }

    public onDoubleTap(address: string) {
        clipboard.setText(address);
        this.notificationService.info('Copied address "' + address + '" to clipboard!');
    }

    public onLongPress(address: string) {
        SocialShare.shareText(address);
    }

    public convertTimestamp(timestamp: number) {
        return Converter.convertTimestampToDateString(timestamp);
    }

    public refresh(args) {
        var pullRefresh = args.object;
        let account = this.accountService.currentAccount.value;
        this.accountService.synchronizeAccount(account)
            .then(account => {
                this.transactions = account.transactions;
                this.accountService.setCurrentAccount(account);
                this.marketService.updateCurrency()
                    .then(currency => {
                        pullRefresh.refreshing = false;
                    })
                    .catch(error => {
                        pullRefresh.refreshing = false;
                    });
            })
            .catch(account => {
                pullRefresh.refreshing = false;
            })
    }
}
