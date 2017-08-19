let bigInt = require("big-integer");

declare function escape(s:string): string;
declare function unescape(s:string): string;

export class Converter {

    private static charToNibble: any = {};
    private static nibbleToChar: any = [];

    static initialize() {
        for (let i = 0; i <= 9; ++i) {
            let character = i.toString();
            Converter.charToNibble[character] = i;
            Converter.nibbleToChar.push(character);
        }

        for (let i = 10; i <= 15; ++i) {
            let lowerChar = String.fromCharCode('a'.charCodeAt(0) + i - 10);
            let upperChar = String.fromCharCode('A'.charCodeAt(0) + i - 10);

            Converter.charToNibble[lowerChar] = i;
            Converter.charToNibble[upperChar] = i;
            Converter.nibbleToChar.push(lowerChar);
        }
    }

    public static byteArrayToHexString(bytes) {
        let str = '';
        for (let i = 0; i < bytes.length; ++i) {
            if (bytes[i] < 0) {
                bytes[i] += 256;
            }
            str += Converter.nibbleToChar[bytes[i] >> 4] + Converter.nibbleToChar[bytes[i] & 0x0F];
        }

        return str;
    }


    public static stringToByteArray(str) {
        str = unescape(encodeURIComponent(str)); //temporary

        let bytes = new Array(str.length);
        for (let i = 0; i < str.length; ++i)
            bytes[i] = str.charCodeAt(i);

        return bytes;
    }

    public static hexStringToByteArray(str) {
        let bytes = [];
        let i = 0;
        if (0 !== str.length % 2) {
            bytes.push(Converter.charToNibble[str.charAt(0)]);
            ++i;
        }

        for (; i < str.length - 1; i += 2)
            bytes.push((Converter.charToNibble[str.charAt(i)] << 4) + Converter.charToNibble[str.charAt(i + 1)]);

        return bytes;
    }

    public static stringToHexString(str) {
        return Converter.byteArrayToHexString(Converter.stringToByteArray(str));
    }

    public static hexStringToString(hex) {
        return Converter.byteArrayToString(Converter.hexStringToByteArray(hex));
    }

    public static checkBytesToIntInput(bytes, numBytes, opt_startIndex) {
        let startIndex = opt_startIndex || 0;
        if (startIndex < 0) {
            throw new Error('Start index should not be negative');
        }

        if (bytes.length < startIndex + numBytes) {
            throw new Error('Need at least ' + (numBytes) + ' bytes to convert to an integer');
        }
        return startIndex;
    }

    public static byteArrayToSignedShort(bytes, opt_startIndex) {
        let index = this.checkBytesToIntInput(bytes, 2, opt_startIndex);
        let value = bytes[index];
        value += bytes[index + 1] << 8;
        return value;
    }

    public static byteArrayToSignedInt32(bytes, opt_startIndex) {
        let value;
        let index = this.checkBytesToIntInput(bytes, 4, opt_startIndex);
        value = bytes[index];
        value += bytes[index + 1] << 8;
        value += bytes[index + 2] << 16;
        value += bytes[index + 3] << 24;
        return value;
    }

    public static byteArrayToBigInteger(bytes, opt_startIndex) {
        let index = this.checkBytesToIntInput(bytes, 8, opt_startIndex);

        let value = bigInt.bigInt("0", 10);

        let temp1, temp2;

        for (let i = 7; i >= 0; i--) {
            temp1 = value.multiply(bigInt.bigInt("256", 10));
            temp2 = temp1.add(bigInt.bigInt(bytes[opt_startIndex + i].toString(10), 10));
            value = temp2;
        }

        return value;
    }

    // create a wordArray that is Big-Endian
    public static byteArrayToWordArray(byteArray) {
        let i = 0,
            offset = 0,
            word = 0,
            len = byteArray.length;
        let words = new Uint32Array(((len / 4) | 0) + (len % 4 == 0 ? 0 : 1));

        while (i < (len - (len % 4))) {
            words[offset++] = (byteArray[i++] << 24) | (byteArray[i++] << 16) | (byteArray[i++] << 8) | (byteArray[i++]);
        }
        if (len % 4 != 0) {
            word = byteArray[i++] << 24;
            if (len % 4 > 1) {
                word = word | byteArray[i++] << 16;
            }
            if (len % 4 > 2) {
                word = word | byteArray[i++] << 8;
            }
            words[offset] = word;
        }
        let wordArray = {};
        wordArray['sigBytes'] = len;
        wordArray['words'] = words;

        return wordArray;
    }

    // assumes wordArray is Big-Endian
    public static wordArrayToByteArray(wordArray) {
        let len = wordArray.words.length;
        if (len == 0) {
            return new Array(0);
        }
        let byteArray = new Array(wordArray.sigBytes);
        let offset = 0,
            word, i;
        for (i = 0; i < len - 1; i++) {
            word = wordArray.words[i];
            byteArray[offset++] = word >> 24;
            byteArray[offset++] = (word >> 16) & 0xff;
            byteArray[offset++] = (word >> 8) & 0xff;
            byteArray[offset++] = word & 0xff;
        }
        word = wordArray.words[len - 1];
        byteArray[offset++] = word >> 24;
        if (wordArray.sigBytes % 4 == 0) {
            byteArray[offset++] = (word >> 16) & 0xff;
            byteArray[offset++] = (word >> 8) & 0xff;
            byteArray[offset++] = word & 0xff;
        }
        if (wordArray.sigBytes % 4 > 1) {
            byteArray[offset++] = (word >> 16) & 0xff;
        }
        if (wordArray.sigBytes % 4 > 2) {
            byteArray[offset++] = (word >> 8) & 0xff;
        }
        return byteArray;
    }

    public static byteArrayToString(bytes, opt_startIndex = 0, length = 0) {
        if (length == 0) {
            return "";
        }

        if (opt_startIndex && length) {
            let index = this.checkBytesToIntInput(bytes, parseInt(length.toString(), 10), parseInt(opt_startIndex.toString(), 10));

            bytes = bytes.slice(opt_startIndex, opt_startIndex + length);
        }

        return decodeURIComponent(escape(String.fromCharCode.apply(null, bytes)));
    }

    public static byteArrayToShortArray(byteArray) {
        let shortArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let i;
        for (i = 0; i < 16; i++) {
            shortArray[i] = byteArray[i * 2] | byteArray[i * 2 + 1] << 8;
        }
        return shortArray;
    }

    public static shortArrayToByteArray(shortArray) {
        let byteArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let i;
        for (i = 0; i < 16; i++) {
            byteArray[2 * i] = shortArray[i] & 0xff;
            byteArray[2 * i + 1] = shortArray[i] >> 8;
        }

        return byteArray;
    }

    public static shortArrayToHexString(ary) {
        let res = "";
        for (let i = 0; i < ary.length; i++) {
            res += Converter.nibbleToChar[(ary[i] >> 4) & 0x0f] + Converter.nibbleToChar[ary[i] & 0x0f] + Converter.nibbleToChar[(ary[i] >> 12) & 0x0f] + Converter.nibbleToChar[(ary[i] >> 8) & 0x0f];
        }
        return res;
    }

    /**
     * Produces an array of the specified number of bytes to represent the integer
     * value. Default output encodes ints in little endian format. Handles signed
     * as well as unsigned integers. Due to limitations in JavaScript's number
     * format, x cannot be a true 64 bit integer (8 bytes).
     */
    public static intToBytes_(x, numBytes, unsignedMax, opt_bigEndian) {
        let signedMax = Math.floor(unsignedMax / 2);
        let negativeMax = (signedMax + 1) * -1;
        if (x != Math.floor(x) || x < negativeMax || x > unsignedMax) {
            throw new Error(
                x + ' is not a ' + (numBytes * 8) + ' bit integer');
        }
        let bytes = [];
        let current;
        // Number type 0 is in the positive int range, 1 is larger than signed int,
        // and 2 is negative int.
        let numberType = x >= 0 && x <= signedMax ? 0 :
            x > signedMax && x <= unsignedMax ? 1 : 2;
        if (numberType == 2) {
            x = (x * -1) - 1;
        }
        for (let i = 0; i < numBytes; i++) {
            if (numberType == 2) {
                current = 255 - (x % 256);
            } else {
                current = x % 256;
            }

            if (opt_bigEndian) {
                bytes.unshift(current);
            } else {
                bytes.push(current);
            }

            if (numberType == 1) {
                x = Math.floor(x / 256);
            } else {
                x = x >> 8;
            }
        }
        return bytes;

    }

    public static int32ToBytes(x, opt_bigEndian) {
        return Converter.intToBytes_(x, 4, 4294967295, opt_bigEndian);
    }
}
