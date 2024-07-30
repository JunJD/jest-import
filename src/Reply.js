import crypto from 'crypto';
import cryptoJS from 'crypto-js';
import { referUrl } from './MockClient.js';
import { getTime } from './utils/index.js';

export function get_sha3_encrypt(data, outputLengthNum) {
    const hash = cryptoJS.SHA3(data, { outputLength: outputLengthNum });
    const r = {
        words: hash.words,
        sigBytes: hash.sigBytes,
    };
    return _stringify(r);
}

function _stringify(e) {
    for (var t = e.words, n = e.sigBytes, r = [], i = 0; i < n; i++) {
        var o = (t[i >>> 2] >>> (24 - (i % 4) * 8)) & 255;
        r.push((o >>> 4).toString(16)), r.push((15 & o).toString(16));
    }
    return r.join('');
}

class Reply {
    count = 0;
    cookie;
    tk;
    as;
    constructor(cookie, tk, as) {
        this.cookie = cookie;
        this.tk = tk;
        this.as = as;
    }

    getAcC(angle) {
        const distance = angle / 360;
        const finalResult = parseFloat(distance.toFixed(2));
        return finalResult;
    }

    get_mv2_num(ac_c) {
        if (ac_c < 0.33) {
            return 3;
        } else if (0.33 <= ac_c && ac_c < 0.66) {
            return 4;
        } else {
            return 5;
        }
    }

    generateTrajectorySpin(numPoints) {
        if (numPoints === 0) {
            return [];
        }

        // 初始化时间戳和坐标
        var startTime = Date.now();
        var fxValues = [];
        var fyValues = [];
        var trajectory = [];

        // 生成 fx 和 fy 值
        for (var i = 0; i < numPoints; i++) {
            var fx, fy;
            if (i === 0) {
                fx = Math.floor(Math.random() * (900 - 880 + 1)) + 880;
            } else if (i < Math.floor(numPoints / 2)) {
                fx =
                    fxValues[fxValues.length - 1] -
                    Math.floor(Math.random() * (6 - 5 + 1)) +
                    5;
            } else {
                fx =
                    fxValues[fxValues.length - 1] +
                    Math.floor(Math.random() * (6 - 5 + 1)) +
                    5;
            }

            fy = Math.floor(Math.random() * (570 - 550 + 1)) + 550;
            fxValues.push(fx);
            fyValues.push(fy);
        }

        // 生成轨迹点
        for (var i = 0; i < numPoints; i++) {
            trajectory.push({
                t: startTime + i * (Math.floor(Math.random() * (200 - 100 + 1)) + 100), // 模拟时间滑动
                fx: Math.round(fxValues[i]),
                fy: Math.round(fyValues[i]),
            });
        }

        return JSON.stringify(trajectory).replace(' ', '');
    }

    generateTrajectory(numPoints, totalDistance) {
        const currentTime = Number(getTime());
        const result = [];

        if (numPoints === 0) {
            return JSON.stringify(result);
        } else if (numPoints === 1) {
            const fx = Math.floor(Math.random() * 26) + 828 + totalDistance; // 828 到 853 之间的随机数，加上 totalDistance
            result.push({
                t: currentTime,
                fx: Math.round(fx),
                fy: Math.floor(Math.random() * 21) + 660 // 660 到 680 之间的随机数
            });
        } else {
            const averageDistance = totalDistance / (numPoints - 1);
            let fxStart = Math.floor(Math.random() * 26) + 828;
            let fxCurrent = fxStart;
            let fy = Math.floor(Math.random() * 6) + 660;
            let currentTimeOffset = currentTime;

            for (let i = 0; i < numPoints; i++) {
                let fx;

                if (i === 0) {
                    fx = fxStart;
                } else {
                    // 生成每段的距离，确保每段距离不相等
                    const segmentDistance = averageDistance + (Math.random() * 0.4 - 0.2) * averageDistance;
                    fxCurrent += segmentDistance;
                    fx = Math.floor(fxCurrent);
                    fy += Math.floor(Math.random() * 4) + 2; // 逐步递增 fy
                }

                result.push({
                    t: currentTimeOffset,
                    fx: Math.round(fx),
                    fy: Math.round(fy)
                });

                currentTimeOffset += Math.floor(Math.random() * 3801) + 200; // 增加时间戳 200到4000之间的随机数
            }
        }
        return JSON.stringify(result.map((item=>({
            ...item,
            t: Number(item.t)
        }))));
    }

    get_new_key(_as) {
        const mode_dict = {
            DZ: ['0', '1', '2', '3', '4'],
            FB: [
                'A',
                'B',
                'C',
                'D',
                'E',
                'F',
                'G',
                'a',
                'b',
                'c',
                'd',
                'e',
                'f',
                'g',
            ],
            GU: 'appsapi2',
            JQ: ['O', 'P', 'Q', 'R', 'S', 'T', 'o', 'p', 'q', 'r', 's', 't'],
            NZ: ['5', '6', '7', '8', '9'],
            eR: [
                'H',
                'I',
                'J',
                'K',
                'L',
                'M',
                'N',
                'h',
                'i',
                'j',
                'k',
                'l',
                'm',
                'n',
            ],
            px: `${referUrl}/static/touch/js/lib/fingerprint.js`,
            o: ['U', 'V', 'W', 'X', 'Y', 'Z', 'u', 'v', 'w', 'x', 'y', 'z'],
            q4: 2,
        };

        let r = _as[_as.length - 1];
        let data = `${_as}${mode_dict['GU']}`;

        let mess;
        if (mode_dict['FB'].includes(r)) {
            mess = cryptoJS.MD5(data).toString();
        } else if (mode_dict['eR'].includes(r)) {
            mess = cryptoJS.SHA1(data).toString();
        } else if (mode_dict['JQ'].includes(r)) {
            mess = cryptoJS.SHA256(data).toString();
        } else if (mode_dict['o'].includes(r)) {
            mess = cryptoJS.SHA512(data).toString();
        } else if (mode_dict['DZ'].includes(r)) {
            mess = get_sha3_encrypt(data, 256);
        } else if (mode_dict['NZ'].includes(r)) {
            mess = get_sha3_encrypt(data, 512);
        } else {
            return null;
        }
        return mess.substring(0, 16);
    }

    zeroPad(buffer, blockSize) {
        if (typeof blockSize !== 'number' || isNaN(blockSize) || blockSize <= 0) {
            throw new Error('Invalid block size');
        }

        const padLength = blockSize - (buffer.length % blockSize);
        if (isNaN(padLength)) {
            throw new Error('Calculated pad length is NaN');
        }

        const padding = Buffer.alloc(padLength, 0);
        return Buffer.concat([buffer, padding]);
    }

    aesEncrypt(_str, key) {
        const plaintextBytes = Buffer.from(_str, 'utf-8');
        const cipher = crypto.createCipheriv(
            'aes-128-ecb',
            Buffer.from(key, 'utf-8'),
            null
        );
        cipher.setAutoPadding(false); // Disable auto padding

        const blockSize = 16; // AES block size
        const paddedPlaintext = this.zeroPad(plaintextBytes, blockSize);

        const ciphertext = Buffer.concat([
            cipher.update(paddedPlaintext),
            cipher.final(),
        ]);
        const encodedCiphertext = ciphertext.toString('base64');
        return encodedCiphertext;
    }
}

export default Reply;
