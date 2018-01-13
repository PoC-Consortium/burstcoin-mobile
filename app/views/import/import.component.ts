/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Switch } from "ui/switch";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { TranslateService } from 'ng2-translate';
import { BurstAddress } from "../../lib/model";
import { AccountService, CryptoService, NotificationService } from "../../lib/services";
import { ShowComponent } from "./show/show.component";

@Component({
    selector: "import",
    moduleId: module.id,
    templateUrl: "./import.component.html",
    styleUrls: ["./import.component.css"]
})
export class ImportComponent implements OnInit {
    private step: number;
    private activeInput: string;
    private offlineInput: string;
    private offlineInputParts: string[];
    private state: string;
    private hint: string;
    private active: boolean;
    private pin: string;

    constructor(
        private accountService: AccountService,
        private cryptoService: CryptoService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private router: RouterExtensions,
        private translateService: TranslateService,
        private vcRef: ViewContainerRef
    ) {}

    public ngOnInit() {
        // TODO: check if account already exists, then redirect to tabs
        this.step = 1;
        this.activeInput = "";
        this.offlineInput = "";
        this.offlineInputParts = [];
        this.hint = "Passphrase";
        this.active = true;
    }

    public onChecked(args) {
        let toggle = <Switch>args.object;
        if (toggle.checked) {
            this.active = true;
        } else {
            this.active = false;
        }
    }

    public onTapImport(e) {
        if (BurstAddress.isBurstcoinAddress(BurstAddress.constructBurstAddress(this.offlineInputParts))) {
            this.step = 0;
            this.accountService.createOfflineAccount(BurstAddress.constructBurstAddress(this.offlineInputParts))
                .then(account => {
                    this.accountService.selectAccount(account)
                        .then(account => {
                            this.router.navigate(['tabs'], { clearHistory: true });
                        });
                })
                .catch(error => {
                    this.step = 1;
                    this.notificationService.info(error);
                });
        } else {
            this.translateService.get("NOTIFICATIONS.ADDRESS").subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }


    public onTapNext() {
        if (this.activeInput.length > 0) {
            if (this.active) {
                this.step = 0;
                this.cryptoService.generateMasterKeys(this.activeInput)
                    .then(keys => {
                        this.cryptoService.getAccountIdFromPublicKey(keys.publicKey)
                            .then(id => {
                                this.cryptoService.getBurstAddressFromAccountId(id)
                                    .then(address => {
                                        const options: ModalDialogOptions = {
                                            viewContainerRef: this.vcRef,
                                            context: address,
                                            fullscreen: false,
                                        };
                                        this.step = 1;
                                        this.modalDialogService.showModal(ShowComponent, options)
                                            .then(result => {
                                                if (result) {
                                                    this.step = 2
                                                }
                                            })
                                            .catch(error => console.log(JSON.stringify(error)));
                                    })
                            })
                    })

                }
            } else {
                this.translateService.get("NOTIFICATIONS.ENTER_SOMETHING").subscribe((res: string) => {
                    this.notificationService.info(res);
                });
            }
    }

    public onTapDone() {
        if (this.accountService.isPin(this.pin)) {
            this.step = 0;
            this.accountService.createActiveAccount(this.activeInput, this.pin)
                .then(account => {
                    this.accountService.selectAccount(account)
                        .then(account => {
                            this.router.navigate(['tabs'], { clearHistory: true })
                        })
                })//
                .catch(error => {
                    this.step = 2;
                    this.notificationService.info(error);
                });
        } else {
            this.translateService.get("NOTIFICATIONS.PIN").subscribe((res: string) => {
                this.notificationService.info(res);
            });
        }
    }

    public formatAddress() {
        for (let i = 0; i < this.offlineInputParts.length; i++) {
            if (this.offlineInputParts[i] != undefined) {
                this.offlineInputParts[i] = this.offlineInputParts[i].toUpperCase()
            }
        }
    }
}
