import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Account, Attachment, BurstAddress, Transaction } from "../../lib/model";
import { AccountService, CryptoService } from "../../lib/services";

@Injectable()
export class CreateService {
    private passphrase: string[];
    private progress: number;

    constructor() {
        this.reset();
    }

    public setPassphrase(passphrase: string[]) {
        this.passphrase = passphrase;
    }

    public getPassPhrase(): string[] {
        return this.passphrase;
    }

    public getPassphrasePart(index: number): string {
        return this.passphrase[index];
    }

    public getCompletePassphrase(): string {
        return this.passphrase.join(" ");
    }

    public setProgress(progress: number) {
        this.progress = progress;
    }

    public getProgress(): number {
        return this.progress;
    }

    public reset() {
        this.passphrase = [];
        this.progress = 0;
    }

}
