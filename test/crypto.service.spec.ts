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

        return cs.generatePublicKey(passPhrase).then(pk => {
            expect(pk.length).to.equal(64);
            expect(pk).to.equals("38c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43");
        });
    }

}
