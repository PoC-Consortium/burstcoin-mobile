import { Injectable } from '@angular/core';
import { Converter } from "../util";
import { PassPhraseGenerator, ECKCDSA } from "../util/crypto";
import { BurstAddress, Keypair } from "../model";

let CryptoJS = require("crypto-js");
let BN = require('bn.js');

@Injectable()
export class CryptoService {

    private passPhraseGenerator: PassPhraseGenerator;

    constructor() {
        this.passPhraseGenerator = new PassPhraseGenerator();
    }

    /*
    * Generate a passphrase with the help of the PassPhraseGenerator
    * pass optional seed for seeding generation
    */
    public generatePassPhrase(seed: any[] = []): Promise<string> {
        return new Promise((resolve, reject) => {
            this.passPhraseGenerator.reSeed(seed);
            resolve(this.passPhraseGenerator.generatePassPhrase());
        });
    }

    /*
    * Generate the Master Public Key and Master Private Key for a new passphrase
    * Ed25519 sign key pair. Public key can be converted to curve25519 public key (Burst Address)
    * Private Key can be converted to curve25519 private key for checking transactions
    */
    public generateMasterPublicAndPrivateKey(passPhrase: string): Promise<Keypair> {
        return new Promise((resolve, reject) => {
            // hash passphrase with sha256
            let hashedPassPhrase = CryptoJS.SHA256(passPhrase);
            // use ec-kcdsa to generate keypair from passphrase
            let keys = ECKCDSA.keygen(Converter.convertWordArrayToByteArray(hashedPassPhrase));
            let keypair: Keypair = new Keypair({
                "publicKey": Converter.convertByteArrayToHexString(keys.p),
                "privateKey": Converter.convertByteArrayToHexString(keys.s)
            });
            resolve(keypair);
        });
    }

    /*
    *   Convert hex string of the public key to the account id
    */
    public getAccountIdFromPublicKey(publicKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // hash with SHA 256
            let hash = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
            let bytes = Converter.convertWordArrayToByteArray(hash);
            // slice away first 8 bytes of SHA256 string
            let slice = bytes.slice(0, 8);
            // order it from lowest bit to highest / little-endian first / reverse
            slice = slice.reverse();
            // convert each byte into a number with radix 10
            let numbers = slice.map(byte => byte.toString(10));
            // create a biginteger based on the reversed byte/number array
            let id = new BN(numbers, 256); // base 256 for byte
            resolve(id.toString()); // return big integer in string
        });
    }

    /*
    * Convert the account id to the appropriate Burst address
    */
    public getBurstAddressFromAccountId(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: refactor shitty nxt address resolution
            resolve(BurstAddress.encode(id));
        });
    }

    /*
    * Convert Burst Address back to account id
    */
    public getAccountIdFromBurstAddress(address: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: refactor shitty nxt address resolution
            resolve(BurstAddress.decode(address));
        });
    }

    /*
    * Encrypt a derived hd private key with a given pin and return it in Base64 form
    */
    public encryptAES(text: string, key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let encrypted = CryptoJS.AES.encrypt(text, key);
            resolve(encrypted.toString()); // Base 64
        });
    }
    /*
    * Decrypt a derived hd private key with a given pin
    */
    public decryptAES(encryptedBase64: string, key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let decrypted = CryptoJS.AES.decrypt(encryptedBase64, key);
            resolve(decrypted.toString(CryptoJS.enc.Utf8));
        });
    }

    /*
    *
    */
    public hashSHA256(input: string): string {
        return CryptoJS.SHA256(input).toString();
    }

    /*
    * Generate signature for transaction
    */
    public generateSignature(transactionHex: string, encryptedPrivateKey: string, pinHash: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.decryptAES(encryptedPrivateKey, pinHash)
                .then(privateKey => {
                    let s = Converter.convertHexStringToByteArray(privateKey);
                    let m = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(transactionHex)));
                    let m_s = m.concat(s);
                    let x = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(Converter.convertByteArrayToWordArray(m_s)));
                    let y = ECKCDSA.keygen(x).p;
                    let m_y = m.concat(y);
                    let h = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(Converter.convertByteArrayToWordArray(m_y)));
                    let v = ECKCDSA.sign(h, x, s);
                    resolve(Converter.convertByteArrayToHexString([].concat(v, h)));
                })
        });
    }


    /*
    * Verify signature for transaction
    */
    public verifySignature(signature: string, transactionHex: string, publicKey: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let signatureBytes = Converter.convertHexStringToByteArray(signature);
            let publicKeyBytes = Converter.convertHexStringToByteArray(publicKey);
            let v = signatureBytes.slice(0, 32);
            let h1 = signatureBytes.slice(32);
            let y = ECKCDSA.verify(v, h1, publicKeyBytes);

            let m = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(CryptoJS.enc.Hex.parse(transactionHex)));
            let m_y  = m.concat(y);
            let h2 = Converter.convertWordArrayToByteArray(CryptoJS.SHA256(Converter.convertByteArrayToWordArray(m_y)));

            let h1hex = Converter.convertByteArrayToHexString(h1);
            let h2hex = Converter.convertByteArrayToHexString(h2);

            resolve(h1hex == h2hex);
        });
    }

    public generateSignedTransactionBytes(unsignedTransactionHex: string, signature: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: verification, omg
            resolve(unsignedTransactionHex.substr(0, 192) + signature + unsignedTransactionHex.substr(320))
        });
    }
}
