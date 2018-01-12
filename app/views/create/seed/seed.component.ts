/*
* Copyright 2018 PoC-Consortium
*/

import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { TouchGestureEventData } from "ui/gestures";
import { CryptoService } from "../../../lib/services";
import { PassPhraseGenerator } from "../../../lib/util/crypto";
import { CreateService } from "../create.service"

@Component({
    selector: "seed",
    moduleId: module.id,
    templateUrl: "./seed.component.html",
    styleUrls: ["./seed.component.css"]
})
export class SeedComponent implements OnInit {

    readonly seedLimit: number = 256;
    private seed: any[];

    constructor(
        private createService: CreateService,
        private cryptoService: CryptoService,
        private router: RouterExtensions
    ) {}

    ngOnInit() {
        this.seed = [];
    }

    /*
    * Handler for taps and swipes on the seed area
    */
    public onTouch(args: TouchGestureEventData) {
        // take seed from seed Area
        this.seed.push([args.getX(), args.getY(), new Date()]);
    }

    public onTapSeedNext(e) {
        this.cryptoService.generatePassPhrase(this.seed)
            .then(phrase => {
                this.createService.setPassphrase(phrase);
                this.createService.setProgress(1)
                this.router.navigate(['create/record']);
            }
        );
    }

}
