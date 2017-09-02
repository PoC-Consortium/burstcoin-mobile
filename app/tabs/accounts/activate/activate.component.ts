import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { BurstAddress, Wallet } from "../../../lib/model";
import { CryptoService, NotificationService, WalletService } from "../../../lib/services";

import { BarcodeScanner, ScanOptions } from "nativescript-barcodescanner";

@Component({
    selector: "activate",
    moduleId: module.id,
    templateUrl: "./activate.component.html",
    styleUrls: ["./activate.component.css"]
})
export class ActivateComponent implements OnInit {

    pin: string;
    passphrase: string;
    step: number;

    constructor(
        private cryptoService: CryptoService,
        private notificationService: NotificationService,
        private router: Router,
        private walletService: WalletService
    ) {
        this.step = 1;
        this.passphrase = "";
    }

    ngOnInit(): void {
        if (this.walletService.currentWallet.value.active) {
            this.router.navigate(['tabs']);
        }
    }

    public onTapNext() {
        if (this.passphrase.length > 0) {
            this.step = 0;
            this.cryptoService.generateMasterPublicAndPrivateKey(this.passphrase)
                .then(keypair => {
                    this.cryptoService.getAccountIdFromPublicKey(keypair.publicKey)
                        .then(id => {
                            this.cryptoService.getBurstAddressFromAccountId(id)
                                .then(address => {
                                    if (this.walletService.currentWallet.value.address == address) {
                                        this.step = 2;
                                    } else {
                                        this.step = 1;
                                        this.notificationService.info("Wrong passphrase! The provided passphrase does not generate the public key assigned to your wallet!")
                                    }
                                })
                                .catch(error => {
                                    this.step = 1;
                                    this.notificationService.info("Cannot generate Burst address from account id!")
                                })
                        })
                        .catch(error => {
                            this.step = 1;
                            this.notificationService.info("Cannot generate account id from public key!")
                        })
                })
                .catch(error => {
                    this.step = 1;
                    this.notificationService.info("Failed to generate keypair for passphrase!")
                })
        } else {
            this.notificationService.info("Please enter something!");
        }
    }

    public onTapDone() {
        if (this.walletService.isPin(this.pin)) {
            this.walletService.activateWallet(this.walletService.currentWallet.value, this.passphrase, this.pin)
                .then(wallet => {
                    this.router.navigate['tabs'];
                })
                .catch(error  => {
                    this.notificationService.info("Update of wallet failed!");
                    this.router.navigate['tabs'];
                })
        } else {
            this.notificationService.info("Please enter a six-digit number as Pin!");
        }
    }
}
