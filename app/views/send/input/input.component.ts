/*
    Copyright 2017 icewave.org
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
            this.recipientParts = this.accountService.splitBurstAddress(this.route.snapshot.params['address']);
        } else {
            this.recipientParts = this.accountService.splitBurstAddress(this.sendService.getRecipient());
        }
        this.amount = this.sendService.getAmount() != 0 ? this.sendService.getAmount() : undefined;
        this.fee = this.sendService.getFee();
        this.total = this.sendService.getAmount() + this.sendService.getFee();

        this.message = this.sendService.getMessage();
        this.messageEnabled = this.sendService.getMessageEnabled();
        this.messageEncrypted = this.sendService.getMessageEncrypted();
    }

    ngOnInit(): void {
        if (this.accountService.currentAccount.value != undefined) {
            this.account = this.accountService.currentAccount.value;
            this.balance = this.marketService.getPriceBurstcoin(this.account.balance);
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
        this.recipientParts = this.accountService.splitBurstAddress(contact)
        this.drawer.closeDrawer();
        this.amountField.nativeElement.focus();
    }

    public onTapContacts() {
        this.drawer.showDrawer();
    }

    public onTapMessage() {
        this.messageEnabled = !this.messageEnabled
    }

    public onDoubleTapRecipient() {
        clipboard.getText().then(text => {
            if (this.accountService.isBurstcoinAddress(text)) {
                this.recipientParts = this.accountService.splitBurstAddress(text)
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
            this.recipientParts = this.accountService.splitBurstAddress(result.text);
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
                        this.sendService.setRecipient(this.accountService.constructBurstAddress(this.recipientParts))
                        this.sendService.setAmount(this.amount)
                        this.sendService.setFee(this.fee)
                        this.sendService.setMessageEnabled(this.messageEnabled)
                        this.sendService.setMessage(this.message)
                        this.sendService.setMessageEncrypted(this.messageEncrypted)
                        this.router.navigate(['/send/verify'])
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
        return this.accountService.isBurstcoinAddress(this.accountService.constructBurstAddress(this.recipientParts))
    }

    public verifyAmount(): boolean {
        return this.amount > 0 && !isNaN(Number(this.amount))
    }

    public verifyFee() {
        return this.fee >= 1 && !isNaN(Number(this.fee))
    }

    public verifyTotal(): boolean {
        return parseFloat(this.amount.toString()) + parseFloat(this.fee.toString()) <= this.account.balance
    }

    public calculateTotal(input: string) {
        let aNumber;
        let fNumber;
        if (this.amount != undefined) {
            aNumber = parseFloat(this.amount.toString());
        }
        if (this.fee != undefined) {
            fNumber = parseFloat(this.fee.toString());
        }
        if (isNaN(aNumber)) {
            aNumber = 0;
        }
        if (isNaN(fNumber)) {
            fNumber = 0;
        }
        if (aNumber + fNumber > this.account.balance) {
            if (input == "amount") {
                this.amount = this.account.balance - fNumber;
            } else {
                this.fee = this.account.balance - aNumber;
            }
        }
        this.total = aNumber + fNumber;
    }

    public formatRecipient() {
        for (let i = 0; i < this.recipientParts.length; i++) {
            this.recipientParts[i] = this.recipientParts[i].toUpperCase()
        }
    }
}
