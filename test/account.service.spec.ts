// Reference mocha-typescript's global definitions:
/// <reference path="../node_modules/mocha-typescript/globals.d.ts" />
import 'zone.js';
import 'reflect-metadata';
import { expect } from 'chai';
import { Converter } from '../app/lib/util';

import { WalletService } from "../app/lib/services";

@suite(timeout(3000), slow(1000))
class WalletServiceSuite {

    service: any;
    passphrase: string;
    publicKey: string;
    privateKey: string;
    pin: number;
    id: string;
    address: string;


    @timeout(100) before() {
        this.service = new WalletService();
        this.passphrase = "radios tariff nvidia opponent pasta muscles serum wrapped swift runtime inbox goal";
        this.publicKey = "38c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43";
        this.privateKey = "34306951463caaca27fd6f0696ae5747e89a6af55d7b53c1dfac08d02266fdb438c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43";
        this.pin = 777666;
        this.id = "6779331401231193177";
        this.address = "BURST-LP4T-ZQSJ-9XMS-77A7W";
    }

    @test isBurstAddress() {
        expect(this.service.isBurstcoinAddress(this.address)).to.equal(true);
    }
    
}
