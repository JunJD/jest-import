import { strict as assert } from 'assert';
import Reply, { get_sha3_encrypt } from '../src/Reply.js';

import cryptoJS from 'crypto-js';
// import crypto from 'crypto';

describe('Reply class', () => {
    let reply;

    beforeEach(() => {
        reply = new Reply('someCookie', 'someTk', 'someAs');
    });

    it('should return correct SHA3 hash', () => {
        const data = 'test';
        const outputLength = 256;
        const hash = get_sha3_encrypt(data, outputLength);
        assert.equal(hash, cryptoJS.SHA3(data, { outputLength }).toString(cryptoJS.enc.Hex));
    });

    it('should return correct angle coefficient', () => {
        const angle = 291;
        const result = reply.getAcC(angle);
        assert.equal(result, 0.81);
    });

    it('should return correct mv2 number', () => {
        const num = 0.81;
        const result = reply.get_mv2_num(num);
        assert.equal(result, 5);
    });

    it('should generate correct trajectory', () => {
        const ran2 = 2;
        const totalDistance2 = 226.76111111111112;
        const trajectory2 = reply.generateTrajectory(ran2, totalDistance2);
        assert.equal(JSON.parse(trajectory2).length, 2);

        // 其他检查可以包括坐标的范围和时间戳的递增
    });

    it('should generate correct trajectory spin', () => {
        const numPoints = 4;
        const trajectory = reply.generateTrajectorySpin(numPoints);
        assert.equal(JSON.parse(trajectory).length, 4);
        // 其他检查可以包括坐标的范围和时间戳的递增
    });

    it('should return correct new key', () => {
        const as = 'b6ad867c';
        const newKey = reply.get_new_key(as);
        assert.equal(newKey, '6801a39749b8fbb2');
    });

    it('should return correct AES encrypted string', () => {
        const _str = `{"common":{"cl":[],"mv":[{"t":1722240203404,"fx":831,"fy":664},{"t":1722240204748,"fx":1098,"fy":669}],"sc":[],"kb":[],"sb":[],"sd":[],"sm":[],"cr":{"screenTop":0,"screenLeft":0,"clientWidth":1920,"clientHeight":919,"screenWidth":1920,"screenHeight":1080,"availWidth":1920,"availHeight":1040,"outerWidth":1920,"outerHeight":1040,"scrollWidth":1920,"scrollHeight":1920},"simu":0},"backstr":"8646-Ho+J2o4cpIZH9IO4pjkcmI2LnFugEDOPKZW7PMdNxOeib0APw1ErgYgs8Kj/4AFuxQodgt2Vr4yBlEKnVlE/DAo+VXh9N1hIE6B1H5ZpCPT+kdf02vSGZNL8nejZnxOU783bg/8sIUFAa6E0IbTRbJT8eWOQblWtrOyQ3V6dhC8xNWdJxtFKukrQcIkQlcOiTHaDgmNAIDD8WtvX5bHiowOO38XBgDcj5DIWIGF/ELLdrcsbqYDKy5pEdaKX8WfF4PTpUVbz23N/5H+8AGoeYVQ2ZfAwNPH3WJuGMXQisIHmnouKJBPO+9Wu4YP22aX02o07MgB5q91XnIojzDv3B6YrHGgJeHPZG6ZolRjHcdS57eaPJTmg6RINvklzc7mbRh3jkMkZCwKyAsL5BYAuiYj6HIRgffBL5ZSvRsRNqehFR36XSjwci2RquK/HjaKj9iu9aAGFDHnXrRZdS105WHf3ghG2Qqym1TdBYXE08XEOESce2QmaIMz5/VicJDBRgCcleOc3Psf0iZKY9aChpwWXcV8vGtan7LfbQcsZMNmWzly/plRWup7WHYWcJVeHqOKX6Dzasb92CKmc0iu//xbab9iPFa517J9y4HPe5PU=","captchalist":{"spin-0":{"cr":{"left":815,"top":307,"width":290,"height":280},"back":{"left":884,"top":351,"width":152,"height":152},"mv":[{"t":1722240203404,"fx":892,"fy":569},{"t":1722240203514,"fx":887,"fy":563},{"t":1722240203708,"fx":893,"fy":550},{"t":1722240204004,"fx":898,"fy":554},{"t":1722240204160,"fx":903,"fy":558}],"ac_c":1.0,"p":{}}}}`;
        const key = '891af12d8e86a783';
        const result = reply.aesEncrypt(_str, key);
        assert.equal(result, `yHvSYUSsSqgv0hDKYh9LcDGTYGPbI2+VvTWosjSQmFy7rx0taQWSpotZEGv05s6dQUy3jllV6YujsiuY7NgAMFGud2YgxXolsqufI24ZK54/hJajY9OS/E2baZ0ngS57cjSsuJIVArGEJ2k70tXf+XtSDUgP1x1Iuuc76XnMmz4kazH2xOFOR7odNvmhLMzBy5J4MUlX2Krh9v2XZOq0NPIqZqqoprXV4s9jh07xFAYKsv6aX15TqUpYKxYgFyldmpx/g/y9Achx7ABc/22oEC/YcOkQY/G9YuV/7pj9m4fl26zsGhxKkubmJNSwA2yvYxaqe7Z5g5rTgXEBzlQzW77J6O40DdBS+bNNPqB4z/ZSQugpXskoBkxU6O49i61KIhQXWJDGmfAjhLDp+xp++75zlm0tU7OjmpHH1f0zfllotmu8gNRelC2A5oEASagEC2E+Oa4Od/vuNXCzQFWNPW0BNCK7ZI25b224nX070jOyJQKtZOc6CCDTYy5zmTlQ3XO+TDN/JFTt6iytf/3ZAl6DvoYHqgeSFz1BqtTzQhnDVhw21ZKx1oUzGutTi1WTQhtBDzdWMNUNAT5nUkd6WetmMBvtJMMTx6175tw2IlS6cmHvt0a8LzpZptblZKA1zR32kPg1oZa1kTbROH5/cOAVRoN03xWUpZ5ZP9cBVj7C4PXalpFnKYYUR2tNuanNaUFvtSaoypmJNTEJpO/pumuYuGsnAE0WJRMsiIuLIGWbG43tB97YY8+V9dqpICGy69hhFuGnGMHMKxjLK+i/MOWsKfFlMp2NvQHEAW726zDj3qWel/BfROir9kC1q52ioY9zIXh8PZ9Kp0UYSZKcs8QF45f4EIpmXx0s1C2x+vS3KoROZaUEsYG8hcmGJ0lKKx97vtGpBzPlyg0PBy3gVJYjwBXXjQk1nSzoFb4+Fx9s7i0OdtTHRRKln2tiX1RU3+iSvbi7Dffp8pIOqfFASxv2vi+lVug+XAlM74RRWxrxrMgDWNEtupx/6UtxD3xItdbyx1nN6ht5S5HSjepU2JNV1gOSc2r+Kg1IOK/Xy5Dz+3ykKKhFdqKPSdk4Zko0MKtqpkvWj6NfVvUICN+3IF/wOIExYG4cyCmWvltpPx1hJledTIRg35rsOeNH9UiqNH7T7k6qtgRhwmnWSpCCotkZKMqSwc+rfy8juOkk9lyZV/iFNBV33QLr55OUa5SVtQFbFgTYNbdZSqPaoaSkjfblmzXOCqwhIXcfLXxkxbBNvm/SSudzR/YSmytvWkTHBfvMzMlLMPx5H9YeBAJCv4xqXV+9TcxKS4bpk2UhnXkbbf7WBYqRBCQ4pn7Ags37kGeOHiyMGaPbzNj2hCydrJibklqkXi7ikAVZMCecCFOtkeozcCY3CuN0y+Jgx5E88ebl15MqFrTwGYIcJVko8ongIBX3CfmNhf6J1cidIuBmNMy4mSsWcTxJEypdHJNaBxErCZq6OodNBCA/tIkj78O8kdjq7w5AolPjBtbGPLHKd9VO1aczdZ7hdJ39qCjkkTZzUd/k+Rd8vNK5TOOTl3sXJqcIVInSsDHLjTHdoKPKYWHclmclJm/CTs5RIhjk/VjqazhHslqlAkL2W+WHhXH7MowI2XWj711zU61hhI6YYmYzBhZtZliSfy1H5yQcXMZCQMJfgi2Z/82f5lrWFOkRMCG/K7I2efmh+nc/0Wxrz0pkku/6xKAVuzF3NgBcAVfj3h8MsUNGeTNjULToUzCM7pDvfFC0HU7fTot53HwKnZ6Uf++AESr0DeMIC/GYKr+H7wfw+9sJxCaqXQD+n679Mt+s8NNAzZsSrj6kaCg=`);
    });
});