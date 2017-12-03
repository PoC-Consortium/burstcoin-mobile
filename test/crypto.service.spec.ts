/*
    Copyright 2017 icewave.org
*/

// Reference mocha-typescript's global definitions:
/// <reference path="../node_modules/mocha-typescript/globals.d.ts" />
import 'zone.js';
import 'reflect-metadata';
import { expect } from 'chai';
import { Converter } from '../app/lib/util';

import { CryptoService } from "../app/lib/services";

@suite(timeout(3000), slow(1000))
class CryptoServiceSuite {

    service: any;
    passphrase: string;
    publicKey: string;
    privateKey: string;
    pin: number;
    id: string;
    address: string;

    @timeout(100) before() {
        this.service = new CryptoService();
        this.passphrase = "radios tariff nvidia opponent pasta muscles serum wrapped swift runtime inbox goal";
        this.publicKey = "38c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43";
        this.privateKey = "34306951463caaca27fd6f0696ae5747e89a6af55d7b53c1dfac08d02266fdb438c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43";
        this.pin = 777666;
        this.id = "6779331401231193177";
        this.address = "BURST-LP4T-ZQSJ-9XMS-77A7W";
    }

    @test generatePassPhrase() {
        return this.service.generatePassPhrase().then(passPhrase => {
            expect(passPhrase.split(" ").length).to.equal(12);
        });
    }

    @test generateMasterPublicAndPrivateKey() {
        return this.service.generateMasterPublicAndPrivateKey(this.passphrase)
            .then(keys => {
                expect(keys[0].length).to.equal(64);
                expect(keys[0]).to.equals(this.publicKey);
                expect(keys[1].length).to.equal(128);
                expect(keys[1]).to.equals(this.privateKey)
            });
    }

    @test encryptDecryptAES() {
        let en;
        return this.service.encryptAES(this.privateKey, this.pin.toString())
            .then(enc => {
                this.service.decryptAES(enc, this.pin.toString())
                    .then(dec => {
                        expect(dec).to.equal(this.privateKey);
                    });
            });
    }

    @test getAccountIdFromPublicKey() {
        return this.service.getAccountIdFromPublicKey(this.publicKey)
            .then(id => {
                expect(id).to.equal(this.id);
            })
    }

    @test getBurstAddressFromAccountId() {
        return this.service.getBurstAddressFromAccountId(this.id)
            .then(address => {
                expect(address).to.equal(this.address);
           })
    }

    @test getAccountIdFromBurstAddress() {
        return this.service.getAccountIdFromBurstAddress(this.address)
            .then(id => {
                expect(id).to.equal(this.id);
           })
    }

}
