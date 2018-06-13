
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ActivateService {
    private passphrase: string;

    public getPassphrase(): string {
        return this.passphrase;
    }

    public setPassphrase(passphrase: string) {
        this.passphrase = passphrase;
    }
}
