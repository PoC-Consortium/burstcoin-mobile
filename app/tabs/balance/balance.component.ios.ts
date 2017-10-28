import { Component, OnInit, ViewChild } from "@angular/core";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { SwipeGestureEventData } from "ui/gestures";
import { Image } from "ui/image"
import { TranslateService } from 'ng2-translate';
import { Account, BurstAddress, Currency } from "../../lib/model";
import { AccountService, DatabaseService, MarketService, NotificationService, TabsService } from "../../lib/services";
import { RadListViewComponent } from "nativescript-telerik-ui/listview/angular";

import * as SocialShare from "nativescript-social-share";

let clipboard = require("nativescript-clipboard");
let ZXing = require('nativescript-zxing');

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

    @ViewChild('radListView') radListView: RadListViewComponent;

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        public marketService: MarketService,
        private notificationService: NotificationService,
        private tabsService: TabsService,
        private translateService: TranslateService
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
                this.radListView.listView.notifyPullToRefreshFinished(); // workaround https://github.com/NativeScript/nativescript-angular/issues/872
            }
        });
    }

    public update(account: Account) {
        this.account = account;
        // generate qr code image
        this.qrcode = this.zx.createBarcode({ encode: account.address, height: 400, width: 400, format: ZXing.QR_CODE });
        this.address = account.address;
        this.balance = this.marketService.getPriceBurstcoin(account.balance);
        this.confirmed = account.balance == account.unconfirmedBalance;
    }

    public onDoubleTapBalance() {
        clipboard.setText(this.account.address);
        this.translateService.get('NOTIFICATIONS.COPIED', {value: this.account.address}).subscribe((res: string) => {
            this.notificationService.info(res);
        });
    }

    public onLongPressBalance() {
        SocialShare.shareText(this.account.address);
    }

    public onSwipeBalance(args: SwipeGestureEventData) {
        if (args.direction == 2) {
                this.tabsService.changeTab(1);
        }
    }

    public refresh(args) {
        let listView = args.object;
        let account = this.accountService.currentAccount.value;
        this.accountService.synchronizeAccount(account)
            .then(account => {
                this.balance = this.marketService.getPriceBurstcoin(account.balance);
                this.accountService.setCurrentAccount(account);
                this.marketService.updateCurrency()
                    .then(currency => {
                        listView.notifyPullToRefreshFinished();
                    })
                    .catch(error => {
                        this.translateService.get(error.message).subscribe((res: string) => {
                            this.notificationService.info(res);
                        });
                        listView.notifyPullToRefreshFinished();
                    });
            })
            .catch(error => {
                this.translateService.get(error.message).subscribe((res: string) => {
                    this.notificationService.info(res);
                });
                listView.notifyPullToRefreshFinished();
            })
    }

}
