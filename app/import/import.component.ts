import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Switch } from "ui/switch";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";

import { CryptoService, NotificationService, WalletService } from "../lib/services";
import { ShowComponent } from "./show/show.component";

@Component({
    selector: "import",
    moduleId: module.id,
    templateUrl: "./import.component.html",
    styleUrls: ["./import.component.css"]
})
export class ImportComponent implements OnInit {
    private step: number;
    private input: string;
    private state: string;
    private hint: string;
    private active: boolean;
    private pin: string;
    private description: string;

    constructor(
        private cryptoService: CryptoService,
        private modalDialogService: ModalDialogService,
        private notificationService: NotificationService,
        private vcRef: ViewContainerRef,
        private walletService: WalletService,
        private router: RouterExtensions
    ) {
        this.step = 1;
        this.input = "";
        this.state = "Active Wallet";
        this.hint = "Passphrase";
        this.active = true;
        this.description = "An active wallet offers full functionaility. You can send and receive Burstcoins. In addition, you can check your balance and see the history of your transactions.";
    }

    public ngOnInit() {
        // TODO: check if wallet already exists, then redirect to tabs
    }

    public onChecked(args) {
        let toggle = <Switch>args.object;
        if (toggle.checked) {
            this.state = "Active Wallet";
            this.hint = "Passphrase";
            this.active = true;
            this.description = "An active wallet offers full functionaility. You can send and receive Burstcoins. In addition, you can check your balance and see the history of your transactions.";
        } else {
            this.state = "Offline Wallet";
            this.hint = "BURST-XXXX-XXXX-XXXX-XXXXX";
            this.active = false;
            this.description = "An offline wallet offers the same functionaility than an active wallet, except you cannot send Burstcoins to another address.";
        }
    }

    public onTapImport(e) {
        if (this.input.length > 0) {
            if (this.walletService.isBurstcoinAddress(this.input)) {
                this.walletService.createOfflineWallet(this.input)
                    .then(wallet => {
                        this.walletService.selectWallet(wallet)
                            .then(wallet => {
                                this.router.navigate(['tabs']);
                            });
                    })
                    .catch(error => {
                        this.notificationService.info(error);
                    });
            } else {
                this.notificationService.info("Input is not a Burstcoin address");
            }
        } else {
            this.notificationService.info("Please enter something!");
        }
    }


    public onTapNext() {
        if (this.input.length > 0) {
            if (this.active) {
                this.cryptoService.generateMasterPublicAndPrivateKey(this.input)
                    .then(keypair => {
                        this.cryptoService.getAccountIdFromPublicKey(keypair.publicKey)
                            .then(id => {
                                this.cryptoService.getBurstAddressFromAccountId(id)
                                    .then(address => {
                                        const options: ModalDialogOptions = {
                                            viewContainerRef: this.vcRef,
                                            context: address,
                                            fullscreen: false,
                                        };
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
                this.notificationService.info("Please enter something!");
            }
    }

    public onTapDone() {
        if (this.walletService.isPin(this.pin)) {
            this.walletService.createActiveWallet(this.input, this.pin)
                .then(wallet => {
                    this.walletService.selectWallet(wallet)
                        .then(wallet => {
                            this.router.navigate(['tabs'])
                        })
                })
                .catch(error => {
                    this.notificationService.info(error);
                });
        } else {
            this.notificationService.info("Please enter a six-digit number as Pin!");
        }
    }

    public formatAddress() {
        if (!this.active) {
            this.input = this.input.toUpperCase();
        }
    }

}
