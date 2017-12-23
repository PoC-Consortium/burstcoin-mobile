
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Account, BurstAddress, Transaction } from "../../lib/model";
import { AccountService } from "../../lib/services";

@Injectable()
export class SendService {

    private amount: number
    private fee: number;
    private recipient: string

    public constructor(
        private accountService: AccountService
    ) {

    }

    public setRecipient(recipient: string) {
        this.recipient = recipient
    }

    public setFee(fee: number) {
        this.fee = fee;
    }

    public setAmount(amount: number) {
        this.amount = amount
    }

    public createTransaction(): Transaction {
        let transaction = new Transaction()
        transaction.senderPublicKey = this.accountService.currentAccount.value;
        transaction.amountNQT = this.amount;
        transaction.feeNQT = this.fee;
        return transaction;
    }

}
