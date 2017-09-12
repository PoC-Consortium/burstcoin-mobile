import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Image } from "ui/image"

import { Account, BurstAddress, Currency } from "../../lib/model";

import { AccountService, DatabaseService, MarketService, NotificationService } from "../../lib/services";

let ZXing = require('nativescript-zxing');

import { registerElement } from "nativescript-angular/element-registry";
registerElement("BalanceRefresh", () => require("nativescript-pulltorefresh").PullToRefresh);


@Component({
    selector: "balance",
    moduleId: module.id,
    templateUrl: "./balance.component.html",
    styleUrls: ["./balance.component.css"]
})
export class BalanceComponent implements OnInit {

    account: Account;

    address: string;
    balance: string;
    confirmed: boolean;
    loading: boolean;
    qrcode: Image;
    zx: any;

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private notificationService: NotificationService
    ) {
        this.zx = new ZXing();
        this.confirmed = true;
        this.loading = true;
    }

    ngOnInit(): void {
        this.accountService.currentAccount.subscribe((account: Account) => {
            if (account != undefined) {
                // update information
                this.update(account);
                // reset
                this.loading = false;
            }
        });
    }

    public update(account: Account) {
        this.account = account;
        // generate qr code image
        this.qrcode = this.zx.createBarcode({ encode: account.address, height: 400, width: 400, format: ZXing.QR_CODE });
        this.address = account.type == 'offline' ? account.address + " (" + account.type + ")" : account.address;
        this.balance = this.marketService.getPriceBurstcoin(account.balance);
        this.confirmed = account.balance == account.unconfirmedBalance;
    }

    public refresh(args) {
        let pullRefresh = args.object;
        let account = this.accountService.currentAccount.value;
        this.accountService.synchronizeAccount(account)
            .then(account => {
                this.balance = this.marketService.getPriceBurstcoin(account.balance);
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
