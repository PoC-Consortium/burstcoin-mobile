import { Component, OnInit } from "@angular/core";
import { Switch } from "ui/switch";
import { Router } from '@angular/router';

import { WalletService } from "../lib/services";

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

    constructor(private walletService: WalletService, private router: Router) {
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
        if (this.active || this.walletService.isBurstcoinAddress(this.input)) {
            this.walletService.importBurstcoinWallet(this.input, this.active);
            this.router.navigate(['tabs']);
        } else {
            // show warning no burstcoin address
        }
    }

}
