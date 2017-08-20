// Reference mocha-typescript's global definitions:
/// <reference path="../node_modules/mocha-typescript/globals.d.ts" />
import 'zone.js';
import 'reflect-metadata';
import { expect } from 'chai';

//import { Converter } from ''
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

        return cs.generatePassPhrase().then(passPhrase => {
            cs.generatePublicKey(passPhrase).then(pk => {
                expect(pk.length).to.equal(64);
            });
        });
    }
}
