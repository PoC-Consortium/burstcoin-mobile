import { Component, OnInit } from "@angular/core";
import { Switch } from "ui/switch";
import { Router } from '@angular/router';
import { SnackBar, SnackBarOptions } from "nativescript-snackbar";

import { NotificationService, WalletService } from "../lib/services";

@Component({
    selector: "import",
    moduleId: module.id,
    templateUrl: "./import.component.html",
    styleUrls: ["./import.component.css"]
})
export class ImportComponent implements OnInit {
    private input: string;
    private state: string;
    private hint: string;
    private active: boolean;
    private description: string;
    private snackbar: SnackBar;

    constructor(private notificationService: NotificationService, private walletService: WalletService, private router: Router) {
        this.input = "";
        this.state = "Active Wallet";
        this.hint = "Passphrase";
        this.active = true;
        this.description = "An active wallet offers full functionaility. You can send and receive Burstcoins. In addition, you can check your balance and see the history of your transactions.";
        this.snackbar = new SnackBar();
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
        this.input = "BURST-KE7T-AA9D-5X6B-FKALA";
        this.active = false;
        if (this.input.length > 0) {
            if (!this.active && !this.walletService.isBurstcoinAddress(this.input)) {
                this.snackbar.simple("Input is not a Burstcoin address");
            } else {
                this.walletService.importBurstcoinWallet(this.input, this.active).then(wallet => {
                    this.router.navigate(['tabs']);
                })
                .catch(error => {
                    this.notificationService.info(error);
                });
            }
        } else {
            this.notificationService.info("Please enter something!");
        }
    }

}
