import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { EventData } from "data/observable";

import { CryptoService } from "../lib/services";
import { PassPhraseGenerator } from "../lib/util/crypto";

@Component({
    selector: "register",
    moduleId: module.id,
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {

    private readonly seedLimit: number = 10;
    private step: number;
    private seed: any[];
    private passPhrase: string[];
    private retypePassPhrase: string[];
    private word: number;
    private try: string;
    private textField: TextField;

    /*
    Step 0: Loading screen
    Step 1: Start screen
    Step 2: Seed creation
    Step 3: Passphrase display
    Step 4: Retype passphrase
    Step 5: Create Burst Wallet and redirect
    */

    constructor(private cryptoService: CryptoService) {
        this.step = 1;
        this.seed = [];
        this.passPhrase = [];
        this.retypePassPhrase = [];
        this.word = 0;
        this.try = "";
    }

    ngOnInit(): void {

    }

    public onTapStart(e) {
        // start seed process
        this.step = 2;
    }

    public onTouch(args: TouchGestureEventData) {
        // take seed from seed Area
        this.seed.push([args.getX(), args.getY(), new Date()]);
        if (this.seed.length >= this.seedLimit) {
            // set to loading screen while passphrase creation
            this.step = 0;
            this.cryptoService.generatePassPhrase(this.seed)
                .then(phrase => {
                    this.passPhrase = phrase.split(" ");
                    this.step = 3;
                }
            );
        }
    }

    public onTapGenerateAgain(e) {
        // reset
        this.seed = [];
        this.passPhrase = [];
        // init seed process again
        this.step = 2;
    }

    public onTapNext(e) {
        this.word++;
        if (this.word >= 12) {
            this.step = 4;
            this.word = 0;
        }
    }

    public onChange(args: EventData) {
        this.textField = <TextField>args.object;
        let text = this.textField.text.toLowerCase();
        let possibilities = PassPhraseGenerator.words.filter(w => w.startsWith(text));
        if (possibilities.length >= 3) {
            this.retypePassPhrase = possibilities.slice(0, 3);
        } else {
            this.retypePassPhrase = possibilities;
        }
        if (this.textField.text == "") {
            this.retypePassPhrase = [];
        }
    }

    public onTapPossibility(args: EventData) {
        let button = <Button>args.object;
        if (button.text == this.passPhrase[this.word]) {
            this.word++;
            this.textField.text = "";
            this.retypePassPhrase = [];
        } else {
            console.log("wrong word");
        }
    }

}
