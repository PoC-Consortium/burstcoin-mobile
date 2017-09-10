import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Image } from "ui/image"

import { BurstAddress, Currency, Wallet } from "../../lib/model";

import { DatabaseService, MarketService, NotificationService, WalletService } from "../../lib/services";

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

    wallet: Wallet;

    address: string;
    balance: string;
    confirmed: boolean;
    loading: boolean;
    qrcode: Image;
    zx: any;

    constructor(
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private notificationService: NotificationService,
        private walletService: WalletService
    ) {
        this.zx = new ZXing();
        this.confirmed = true;
        this.loading = true;
    }

    ngOnInit(): void {
        this.walletService.currentWallet.subscribe((wallet: Wallet) => {
            if (wallet != undefined) {
                // update information
                this.update(wallet);
                // reset
                this.loading = false;
            }
        });
    }

    public update(wallet: Wallet) {
        this.wallet = wallet;
        // generate qr code image
        this.qrcode = this.zx.createBarcode({ encode: wallet.address, height: 400, width: 400, format: ZXing.QR_CODE });
        this.address = wallet.type == 'offline' ? wallet.address + " (" + wallet.type + ")" : wallet.address;
        this.balance = this.marketService.getPriceBurstcoin(wallet.balance);
        this.confirmed = wallet.balance == wallet.unconfirmedBalance;
    }

    public refresh(args) {
        let pullRefresh = args.object;
        let wallet = this.walletService.currentWallet.value;
        this.walletService.synchronizeWallet(wallet)
            .then(wallet => {
                this.balance = this.marketService.getPriceBurstcoin(wallet.balance);
                this.walletService.setCurrentWallet(wallet);
                this.marketService.updateCurrency()
                    .then(currency => {
                        pullRefresh.refreshing = false;
                    })
                    .catch(error => {
                        pullRefresh.refreshing = false;
                    });
            })
            .catch(wallet => {
                pullRefresh.refreshing = false;
            })
    }

}
