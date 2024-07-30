import fetch from 'node-fetch';
import userAgentPool from './userAgentPool.js';
import HttpsProxyAgent from 'https-proxy-agent';

export const referUrl = "https://www.baidu.com"
// export const referUrl = "https://wappass.baidu.com"

class MockClient {
    constructor() {
        this.userAgentPool = userAgentPool; // 用户代理池
        this.proxyPool = []; // IP 代理池
        this.session = new Map(); // 会话信息
    }

    getRandomUserAgent() {
        // 随机获取一个用户代理
        return this.userAgentPool[
            Math.floor(Math.random() * this.userAgentPool.length)
        ];
    }

    getRandomProxy() {
        if (this.proxyPool.length === 0) return null;
        // 随机获取一个代理
        return this.proxyPool[Math.floor(Math.random() * this.proxyPool.length)];
    }
    createHeaders() {
        // 创建请求头
        return {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'User-Agent': this.getRandomUserAgent(),
            'sec-ch-ua-platform': '"macOS"',
            Origin: referUrl,
            Referer: referUrl + '/',
            Cookie: this.session.get('cookie') || '',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'iframe',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
            'sec-ch-ua-mobile': '?0',
        };
    }

    async request(url, options = {}) {
        // 发送请求
        const defaultHeaders = this.createHeaders();
        const proxy = this.getRandomProxy();

        // 合并默认 headers 和 用户传入的 headers
        options.headers = {
            ...defaultHeaders,
            ...(options.headers || {})
        };

        // 如果有代理，使用代理
        if (proxy) {
            options.agent = new HttpsProxyAgent(proxy);
        }

        // 发起请求
        const response = await fetch(url, options);
        return response;
    }

    updateSession(cookie) {
        // 更新会话信息
        this.session.set('cookie', cookie);
    }
}

export default MockClient;