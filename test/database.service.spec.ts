// Reference mocha-typescript's global definitions:
/// <reference path="../node_modules/mocha-typescript/globals.d.ts" />
import 'zone.js';
import 'reflect-metadata';
import { expect } from 'chai';
import { Converter } from '../app/lib/util';
import { Wallet } from "../app/lib/model";

import { DatabaseService } from "../app/lib/services";

@suite(timeout(10000), slow(1000))
class DatabaseServiceSuite {
    publicKey: string;
    privateKey: string;
    service: any;

    before(done) {
        this.service = new DatabaseService();
        this.publicKey = "34306951463caaca27fd6f0696ae5747e89a6af55d7b53c1dfac08d02266fdb438c0962fe6ccb06d26a948e92b43fc87bb702a7ab29d22c8a672e0fc6e570e43";
        this.privateKey = "U2FsdGVkX1+j1XRjUZ9L0WPjfGSzRwZKdsXd8IJy3SsgyrqO8svwVDXDgsyhbrUcLD1kPMPpt2I4Ff7OfRIb6wb5cONeXfptLayb339Wi9uuMq+T6Q0+C9DkepJus7Cq+QtGUZWdc17J8iwwdsLOSHfstOPUZVnmX6cjbTHKUMGwPu6tcwtZmU7V24ufnL4g87tSlk9BgOPb6Bmx3bnA0Q==";
        
        setTimeout(function() {
            done();
        }, 500);
    }

    @test saveWallet(done) {
        let wallet = new Wallet();
        wallet.id = "6779331401231193177"
        wallet.type = "offline";
        wallet.address = "BURST-LP4T-ZQSJ-9XMS-77A7W";
        wallet.selected = true;

        this.service.saveWallet(wallet)
            .then(success => {
                expect(success).to.equal(true);
            })
            .catch(err => {
                console.log(err);
            });

        this.service.findWallet(wallet.id)
            .then(rs => {
                console.log(rs);
                //expect(rs[0].pk).to.equal(this.publicKey);
                //expect(rs[0].sk).to.equal(this.privateKey);
            })
            .catch(err => {
                console.log("pk " + this.publicKey + " not found")
            });

        setTimeout(function() {
            done();
        }, 100);
    }

/*
    @test removeWallet() {
        let wallet = new Wallet();
        wallet.id = "6779331401231193177"
        wallet.type = "offline";
        wallet.address = "BURST-LP4T-ZQSJ-9XMS-77A7W";
        wallet.selected = true;

        this.service.removeKeys(wallet.id)
            .then(success => {
                expect(success).to.equal(true);
            })
            .catch(err => {
                console.log("pk " + this.publicKey + " not found")
            });

        this.service.findWallet(wallet.id)
            .then(rs => {
                expect(rs.length).to.equal(0);
             })
            .catch(err => {
                console.log("pk " + this.publicKey + " not found")
            });
    }
    */

}
