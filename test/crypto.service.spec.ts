// Reference mocha-typescript's global definitions:
/// <reference path="../node_modules/mocha-typescript/globals.d.ts" />
import 'zone.js';
import 'reflect-metadata';
import { expect } from 'chai';

import { CryptoService } from "../app/lib/services";

@suite(timeout(3000), slow(1000))
class CryptoServiceSuite {
    @test generatePassPhrase() {
        let cs = new CryptoService();

        return cs.generatePassPhrase().then(function(passPhrase) {
            expect(passPhrase.length).to.equal(12);
        });
    }
}
