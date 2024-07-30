import { referUrl } from './MockClient.js';
import { gid, ak, fuid } from './lib/constants.js';
import { getCallback, getTime } from './utils/index.js';
import FormData from 'form-data';
class MockFetch {
    Fetch_URL = 'https://passport.baidu.com';
    _cookies = null;
    _traceid = null;
    constructor(client, retryCount = 3, delay = 1000) {
        this.client = client;
        this.retryCount = retryCount; // 最大重试次数
        this.delay = delay; // 限速控制
    }
    get cookies() {
        if (!this._cookies) {
            return this.updateCookie();
        } else {
            return Promise.resolve(this._cookies);
        }
    }
    // setp1 cookie
    async updateCookie() {
        try {
            const response = await this.client.request('http://www.baidu.com', {
                headers: {},
                credentials: 'include', // 确保包含凭据信息
            });

            // 检查响应是否成功
            if (response.ok) {
                const cookies = response.headers.get('set-cookie');
                this._cookies = cookies;
                return cookies;
            } else {
                console.error('请求失败：', response.status);
            }
        } catch (error) {
            console.error('请求错误：', error);
        }
    }
    // step 2 login init
    async getInit() {
        const response = await this.client.request(`${this.Fetch_URL}/cap/init`, {
            method: 'POST',
            headers: {},
            body: new URLSearchParams({
                _: getTime(),
                ak,
                ver: '2',
                qrsign: '',
            }),
        });
        const text = await response.text();

        const jdata = JSON.parse(text.replace(/'/g, '"'));

        return {
            s: jdata.data.ds,
            k: jdata.data.tk,
            as: jdata.data.as
        };
    }

    // setp 3 获取token
    async getToken() {
        const tt = getTime();
        const response = await this.client.request(
            `${this.Fetch_URL
            }/v2/api/?getapi&token=1&tpl=nx&subpro=&apiver=v3&tt=${tt}&class=login&gid=${gid}&logintype=dialogLogin&traceid=&time=${tt}&alg=1&sig=1&elapsed=1&shaOne=1&callback=${getCallback()}`,
            {
                headers: {
                    cookie: await this.cookies,
                },
            }
        );
        const text = await response.text();
        const tokenMatch = text.match(/"token" : "(.*?)"/);
        return tokenMatch ? tokenMatch[1] : null;
    }

    // step 4 tk as
    async getViewLog() {
        const t = getTime();
        const url = `${this.Fetch_URL
            }/viewlog?ak=${ak}&callback=${getCallback()}&v=${Math.floor(
                10000 * Math.random() + 500
            )}&_=${t}`;
        const response = await this.client.request(url, {
            headers: { Cookie: await this.cookies },
        });
        const text = await response.text();
        const json = JSON.parse(text.match(/\((.*)\)/)[1]);
        return json.data;
    }

    // step 5 parse pass
    async fetchPublicKey(token, gid) {
        const tt = getTime();
        const params = {
            token,
            tpl: 'mn',
            subpro: '',
            apiver: 'v3',
            loginversion: 'v5',
            tt,
            time: tt.slice(0, -3),
            sig: '',
            gid,
            traceid: this._traceid ?? '',
        };
        const response = await this.client.request(
            `${this.Fetch_URL}/v2/getpublickey?${new URLSearchParams(
                params
            ).toString()}`,
            { headers: { Cookie: await this.cookies } }
        );
        const text = await response.text();
        const jdata = JSON.parse(text.replace(/'/g, '"'));
        this._traceid = jdata.traceid;
        return {
            publicKey: jdata.pubkey,
            key: jdata.key,
            traceid: jdata.traceid,
        };
    }

    // login 到这里应该结束了
    async login(data) {
        const response = await this.client.request(
            `${this.Fetch_URL}/v2/api/?login`,
            {
                method: 'POST',
                headers: { Cookie: await this.cookies },
                body: new URLSearchParams(data),
            }
        );
        const text = await response.text();
        return {
            success: text.includes('err_no=0') || text.includes('err_no=120021'),
            isRotateImg: text.includes('err_no=50052'),
            passwordError: text.includes('err_no=7'),
            codeString: text.match(/codeString=([^&]+)&/),
            original: text,
        };
    }

    // 获取新的图片
    async getStyle({ tk }) {

        try {
            const response = await this.client.request(`${this.Fetch_URL}/cap/style`, {
                method: 'POST',
                headers: {
                    Cookie: await this.cookies,
                    Origin: `${referUrl}`,
                    Pragma: 'no-cache',
                    Referer: `${referUrl}/`,
                },
                body: new URLSearchParams({
                    _: getTime(),
                    refer: `${referUrl}/`,
                    ak,
                    tk,
                    scene: '',
                    isios: '0',
                    type: '',
                    ver: '2',
                }),
            });
            const styleContent = await response.json();
            return styleContent;
        } catch (error) {
            console.log('getStyle 重试，', error.message);
            return this.getStyle({ tk })
        }
    }

    // 获取图片
    async getImgFile(styleContent) {
        try {
            const img_url = styleContent.data.captchalist[0].source.back.path;
            const response = await this.client.request(img_url, { headers: {} });
            const form = new FormData();
            const imgBuffer = await response.buffer();
            // 读取本地 img_file/demo_aqc.png
            //   const imgBuffer = fs.readFileSync('img_file/demo_aqc.png');

            // save
            // fs.writeFileSync('img_file/demo_aqc.png', imgBuffer);
            // 构建 form-data 并附加 buffer 数据
            form.append('file', imgBuffer, {
                filename: `auto_${getTime()}_auto.png`,
                contentType: 'image/png',
            });

            return form
        } catch (error) {
            console.error('获取图片或处理时出错:', error);
            throw error;
        }
    }

    // 更新log
    async updateDsAndTk({ f2, as, tk }) {
        const url = `${this.Fetch_URL}/cap/log`;
        const data = {
            _: getTime(),
            refer: referUrl + '/#/password_login',
            ak,
            as,
            tk,
            scene: '',
            ver: '2',
            cv: 'submit',
            typeid: 'spin-0',
            fuid,
            fs: f2,
        };

        const response = await this.client.request(url, {
            method: 'POST',
            headers: {
                Cookie: await this.cookies,
            },
            body: new URLSearchParams(data),
        });

        const json = await response.json();

        return json;
    }
}

export default MockFetch;
