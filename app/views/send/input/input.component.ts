/*
* Copyright 2018 PoC-Consortium
*/

import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "ng2-translate";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { RadSideDrawerComponent, SideDrawerType } from "nativescript-pro-ui/sidedrawer/angular";
import { RadSideDrawer } from "nativescript-pro-ui/sidedrawer";
import { Switch } from "ui/switch";
import { TextField } from "ui/text-field";
import { BarcodeScanner, ScanOptions } from 'nativescript-barcodescanner';

import { Account, BurstAddress, Settings, Transaction } from "../../../lib/model";
import { AccountService, DatabaseService, MarketService, NotificationService } from "../../../lib/services";
import { SendService } from "../send.service";

import { ContactComponent } from "./contact/contact.component"
import { FiatComponent } from "./fiat/fiat.component"

let clipboard = require("nativescript-clipboard");

@Component({
    moduleId: module.id,
    selector: "input",
    styleUrls: ["./input.component.css"],
    templateUrl: "./input.component.html"
})
export class InputComponent implements OnInit {
    account: Account;
    balance: string;
    recipientParts: string[];
    amount: number;
    fee: number;
    pin: string;
    total: number;

    @ViewChild("amountField")
    public amountField: ElementRef;

    @ViewChild(RadSideDrawerComponent)
    public drawerComponent: RadSideDrawerComponent;

    private drawer: RadSideDrawer;

    settings: Settings;

    messageEnabled: boolean
    message: string
    messageEncrypted: boolean

    constructor(
        private accountService: AccountService,
        private barcodeScanner: BarcodeScanner,
        private changeDetectionRef: ChangeDetectorRef,
        private databaseService: DatabaseService,
        private marketService: MarketService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private route: ActivatedRoute,
        private sendService: SendService,
        private translateService: TranslateService,
        private vcRef: ViewContainerRef
    ) {
        if (this.route.snapshot.params['address'] != undefined) {
            this.recipientParts = BurstAddress.splitBurstAddress(this.route.snapshot.params['address']);
        } else {
            this.recipientParts = BurstAddress.splitBurstAddress(this.sendService.getRecipient());
        }
    }

    ngOnInit(): void {
        this.amount = this.sendService.getAmount() != 0 ? this.sendService.getAmount() : undefined;
        this.fee = this.sendService.getFee();
        this.total = this.sendService.getAmount() + this.sendService.getFee();

        this.message = this.sendService.getMessage();
        this.messageEnabled = this.sendService.getMessageEnabled();
        this.messageEncrypted = this.sendService.getMessageEncrypted();

        if (this.accountService.currentAccount.value != undefined) {
            this.account = this.accountService.currentAccount.value;
            this.balance = this.marketService.formatBurstcoin(this.account.balance);
        }

        if (this.databaseService.settings.value != undefined) {
            this.settings = this.databaseService.settings.value;
        }
    }

    ngAfterViewInit() {
        this.drawer = this.drawerComponent.sideDrawer;
        this.changeDetectionRef.detectChanges();
    }

    public onCheckedEncryption(args) {
        let encryptionSwitch = <Switch>args.object;
        if (encryptionSwitch.checked) {
            this.messageEncrypted = true
        } else {
            this.messageEncrypted = false
        }
    }

    public onTapAddContact() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };
        this.modalDialogService.showModal(ContactComponent, options)
            .then(address => {
                if (address != undefined) {
                    this.settings.contacts.push(address);
                    this.databaseService.saveSettings(this.settings)
                        .then(settings => {
                            this.databaseService.setSettings(settings);
                        })
                        .catch(error => {
                            this.translateService.get('NOTIFICATIONS.ERRORS.CONTACT').subscribe((res: string) => {
                                this.notificationService.info(res);
                            });
                        })
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapContact(contact: string) {
        this.recipientParts = BurstAddress.splitBurstAddress(contact)
        this.drawer.closeDrawer();
        this.amountField.nativeElement.focus();
    }

    public onTapContacts() {
        this.drawer.showDrawer();
    }

    public onTapFiat() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };
        this.modalDialogService.showModal(FiatComponent, options)
            .then(amount => {
                if (amount != undefined) {
                    this.amount = amount
                    if (!this.verifyTotal()) {
                        this.translateService.get('NOTIFICATIONS.EXCEED').subscribe((res: string) => {
                            this.notificationService.info(res);
                        });
                    }
                    this.calculateTotal('amount')
                }
            })
            .catch(error => console.log(JSON.stringify(error)));
    }

    public onTapMessage() {
        this.messageEnabled = !this.messageEnabled
    }

    public onDoubleTapRecipient() {
        clipboard.getText().then(text => {
            if (BurstAddress.isBurstcoinAddress(text)) {
                this.recipientParts = BurstAddress.splitBurstAddress(text)
            }
        })
    }

    public onTapRemoveContact(index: number) {
        this.settings.contacts.splice(index, 1);
        this.databaseService.saveSettings(this.settings)
            .then(settings => {
                this.databaseService.setSettings(settings);
            })
    }

    public onTapScan() {
        let options: ScanOptions = {
            formats: "QR_CODE"
        }
        this.barcodeScanner.scan(options).then((result) => {
            this.recipientParts = BurstAddress.splitBurstAddress(result.text);
            this.amountField.nativeElement.focus();
        }, (errorMessage) => {
            this.translateService.get('NOTIFICATIONS.ERRORS.QR_CODE').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        });
    }

    public onTapVerify() {
        if (this.verifyRecipient()) {
            if (this.verifyAmount()) {
                if (this.verifyFee()) {
                    if (this.verifyTotal()) {
                        this.sendService.setRecipient(BurstAddress.constructBurstAddress(this.recipientParts))
                        this.sendService.setAmount(this.amount)
                        this.sendService.setFee(this.fee)
                        this.sendService.setMessageEnabled(this.messageEnabled)
                        this.sendService.setMessage(this.message)
                        this.sendService.setMessageEncrypted(this.messageEncrypted)
                        this.router.navigate(['send', 'verify'])
                    } else {
                        this.translateService.get('NOTIFICATIONS.EXCEED').subscribe((res: string) => {
                            this.notificationService.info(res);
                        });
                    }
                } else {
                    this.translateService.get('NOTIFICATIONS.DECIMAL_FEE').subscribe((res: string) => {
                        this.notificationService.info(res);
                    });
                }
            } else {
                this.translateService.get('NOTIFICATIONS.DECIMAL_AMOUNT').subscribe((res: string) => {
                    this.notificationService.info(res);
                });
            }
        } else {
            this.translateService.get('NOTIFICATIONS.ADDRESS').subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public verifyRecipient(): boolean {
        return BurstAddress.isBurstcoinAddress(BurstAddress.constructBurstAddress(this.recipientParts))
    }

    public verifyAmount(): boolean {
        return this.amount != undefined && this.amount >= 0
    }

    public verifyFee() {
        return this.fee != undefined && this.fee >= 1
    }

    public verifyTotal(): boolean {
        return Number(this.amount) + Number(this.fee) <= this.account.balance
    }

    public calculateTotal(input: string) {
        if (this.amount < 0) {
            this.amount = undefined;
        }
        if (this.fee < 1) {
            this.fee = 1;
        }
        if (this.amount != undefined && !this.verifyTotal()) {
            this.amount = this.account.balance - Number(this.fee);
            if (this.amount < 0) {
                this.amount = 0;
                this.translateService.get('NOTIFICATIONS.EXCEED').subscribe((res: string) => {
                    this.notificationService.info(res);
                });
            }
        }
        if (this.amount == undefined) {
            this.total = Number(this.fee);
        } else {
            this.total = Number(this.amount) + Number(this.fee);
        }
    }

    public formatRecipient() {
        for (let i = 0; i < this.recipientParts.length; i++) {
            if (this.recipientParts[i] != undefined) {
                this.recipientParts[i] = this.recipientParts[i].toUpperCase()
            }
        }
    }
}
