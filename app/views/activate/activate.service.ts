
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Account, BurstAddress, Transaction } from "../../lib/model";
import { AccountService } from "../../lib/services";

@Injectable()
export class ActivateService {

    public constructor(
        private accountService: AccountService
    ) {

    }

    public getPassword(): string {
        return undefined;
    }
}
