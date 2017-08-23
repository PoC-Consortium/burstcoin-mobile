// Reference mocha-typescript's global definitions:
/// <reference path="../node_modules/mocha-typescript/globals.d.ts" />
import 'zone.js';
import 'reflect-metadata';
import { expect } from 'chai';
import { Converter } from '../app/lib/util';

import { CryptoService } from "../app/lib/services";

@suite(timeout(3000), slow(1000))
class CryptoServiceSuite {
    @test generatePassPhrase() {
        let cs = new CryptoService();

        return cs.generatePassPhrase().then(passPhrase => {
            expect(passPhrase.split(" ").length).to.equal(12);
        });
    }

    @test generateMasterPublicAndPrivateKey() {
        let cs = new CryptoService();
        let passPhrase = "radios tariff nvidia opponent pasta muscles serum wrapped swift runtime inbox goal";

        return cs.generateMasterPublicAndPrivateKey(passPhrase)
            .then(keys => {
                expect(keys[0].length).to.equal(64);
                expect(keys[0]).to.equals("38c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43");
                expect(keys[1].length).to.equal(128);
                expect(keys[1]).to.equals("34306951463caaca27fd6f0696ae5747e89a6af55d7b53c1dfac08d02266fdb438c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43")
            });
    }

    @test encryptDecryptAES() {
        let cs = new CryptoService();
        let text = "34306951463caaca27fd6f0696ae5747e89a6af55d7b53c1dfac08d02266fdb438c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43";
        let pin = 777666;

        let en;
        return cs.encryptAES(text, pin.toString())
            .then(enc => {
                cs.decryptAES(enc, pin.toString())
                    .then(dec => {
                        expect(dec).to.equal(text);
                    });
            });
    }

    @test getAccountIdFromPublicKey() {
        let cs = new CryptoService();
        let pk = "38c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43";

        return cs.getAccountIdFromPublicKey(pk)
            .then(id => {
                expect(id).to.equal("6779331401231193177");
            })
    }

    @test getBurstAddressFromAccountId() {
        let cs = new CryptoService();
        let id = "6779331401231193177";

        return cs.getBurstAddressFromAccountId(id)
            .then(address => {
                expect(address).to.equal("BURST-LP4T-ZQSJ-9XMS-77A7W");
           })
    }

    @test getAccountIdFromBurstAddress() {
        let cs = new CryptoService();
        let address = "BURST-LP4T-ZQSJ-9XMS-77A7W";

        return cs.getAccountIdFromBurstAddress(address)
            .then(id => {
                expect(id).to.equal("6779331401231193177");
           })
    }

}
