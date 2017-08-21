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

    @test generatePublicKey() {
        let cs = new CryptoService();

        let passPhrase = "radios tariff nvidia opponent pasta muscles serum wrapped swift runtime inbox goal";

        return cs.generateMasterPublicAndPrivateKey(passPhrase).then(keys => {
            expect(keys[0].length).to.equal(64);
            expect(keys[0]).to.equals("38c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43");
            expect(keys[1].length).to.equal(128);
            expect(keys[1]).to.equals("34306951463caaca27fd6f0696ae5747e89a6af55d7b53c1dfac08d02266fdb438c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43")
        });
    }

}
