import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView, TabViewItem } from "ui/tab-view";
import { Label } from "ui/label";
import { Progress } from "ui/progress";
import { TouchGestureEventData } from "ui/gestures";
import { Button } from "ui/button";
import { TextField } from "ui/text-field";
import { EventData } from "data/observable";

import { AccountService, CryptoService, NotificationService } from "../lib/services";
import { PassPhraseGenerator } from "../lib/util/crypto";

@Component({
    selector: "create",
    moduleId: module.id,
    templateUrl: "./create.component.html",
    styleUrls: ["./create.component.css"]
})
export class CreateComponent implements OnInit {

    private readonly seedLimit: number = 256;
    private step: number;
    private seed: any[];
    private passPhrase: string[];
    private retypePassPhrase: string[];
    private word: number;
    private try: string;
    private pin: string;
    private textField: TextField;

    /*
    Step 0: Loading screen
    Step 1: Start screen
    Step 2: Seed creation
    Step 3: Passphrase display
    Step 4: Retype passphrase
    Step 5: Create Burst Account and redirect
    */

    constructor(
        private accountService: AccountService,
        private cryptoService: CryptoService,
        private notificationService: NotificationService,
        private router: RouterExtensions
    ) {
        this.step = 1;
        this.seed = [];
        this.passPhrase = [];
        this.retypePassPhrase = [];
        this.word = 0;
        this.try = "";
    }

    ngOnInit(): void {

    }

    /*
    * Handler for taps and swipes on the seed area
    */
    public onTouch(args: TouchGestureEventData) {
        // take seed from seed Area
        this.seed.push([args.getX(), args.getY(), new Date()]);
    }

    public onTapSeedNext(e) {
        // set to loading screen while passphrase creation
        this.step = 0;
        this.cryptoService.generatePassPhrase(this.seed)
            .then(phrase => {
                this.passPhrase = phrase.split(" ");
                this.step = 2;
            }
        );
    }

    /*
    * Used to go back to seed generation step
    */
    public onTapGenerateAgain(e) {
        // reset
        this.seed = [];
        this.passPhrase = [];
        // init seed process again
        this.step = 1;
        this.try = "";
        this.retypePassPhrase = [];
    }

    /*
    * This method is responssible for showing changing the index of the passphrase
    * one by one to show the user all 12 words in the right order
    */
    public onTapNext(e) {
        this.word++;
        if (this.word >= 12) {
            this.step = 3;
            this.word = 0;
        }
    }

    /*
    * This method is called when the onput of the textfield changes and updates
    * the shown possibilities matching the current input
    */
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

    /*
    * This method is called if a possibility gets tapped if the tapped
    * possibility is the matching word of the passphrase then go on to the
    * next word. If all 12 words were repeated correctly go to step 5
    */
    public onTapPossibility(args: EventData) {
        let button = <Button>args.object;
        if (button.text == this.passPhrase[this.word]) {
            this.word++;
            this.textField.text = "";
            this.retypePassPhrase = [];
            this.try = "";

            if (this.word >= 12) {
                // correctly retyped all 12 words
                this.step = 4;
            }
        }
    }

    public onTapDone(args: EventData) {
        if (this.accountService.isPin(this.pin)) {
            this.step = 0;
            this.accountService.createActiveAccount(this.passPhrase.join(" "), this.pin)
                .then(account => {
                    this.accountService.selectAccount(account)
                        .then(account => {
                            this.router.navigate(['tabs']);
                        })
                })
                .catch(err => {
                    this.router.navigate(['start']);
                })
        } else {
            this.notificationService.info("PIN must be a six-digit number!")
        }
    }

}
