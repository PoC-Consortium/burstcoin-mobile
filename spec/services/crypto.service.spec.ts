import { CryptoService } from '../../app/lib/services';

describe('CryptoService', () => {
    it('should generate a passphrase and corresponding public key', () => {
        let cs = new CryptoService();

        cs.generatePassPhrase()
            .then(pp => {
                // check if passphrase are 12 words seperated by space
                let words = pp.split(" ");
                expect(words.length).toEqual(12);

                // generate the public key for the passphrase
                cs.generatePublicKey(pp)
                .then(pk => {

                    console.log(pk);
                })
            })
    });
});
