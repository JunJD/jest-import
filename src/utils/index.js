import crypto from 'crypto';
import CryptoJS from 'crypto-js';
const getGid = () => crypto.randomBytes(16).toString('hex');
const getTime = () => new Date().getTime().toString();
const getCallback = () => `callback${Math.floor(Math.random() * 10000)}`;

const getFuid = (userInfo = obj) => {
    const _str = JSON.stringify(userInfo);
    const key = 'FfdsnvsootJmvNfl';

    // 创建 AES 加密对象，使用 ECB 模式
    const plaintextBytes = CryptoJS.enc.Utf8.parse(_str);
    const paddedPlaintext = CryptoJS.pad.Pkcs7.pad(plaintextBytes);

    // 加密
    const ciphertext = CryptoJS.AES.encrypt(paddedPlaintext, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
    });

    // 返回 Base64 编码的密文
    return ciphertext.ciphertext.toString(CryptoJS.enc.Base64);
}

export {
    getGid,
    getTime,
    getCallback,
    getFuid
}




const obj = {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    canvas: "27c6869e5cc63262093ab8e664a87406",
    language: "zh-CN",
    colorDepth: "24",
    deviceMemory: "8",
    hardwareConcurrency: "12",
    screenResolution: "1920,1080",
    availableScreenResolution: "1040,1920",
    timezoneOffset: "-480",
    timezone: "",
    sessionStorage: "true",
    localStorage: "true",
    indexedDb: "true",
    addBehavior: "false",
    openDatabase: "false",
    cpuClass: "",
    platform: "Win32",
    plugins: "undefined",
    webgl: "547ec9734e89849aa4b8d41b836c1f80",
    webglVendorAndRenderer: "Google Inc. (Intel)~ANGLE (Intel, Intel(R) UHD Graphics 630 (0x00009BC5) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    adBlock: "false",
    hasLiedLanguages: "false",
    hasLiedResolution: "false",
    hasLiedOs: "false",
    hasLiedBrowser: "false",
    touchSupport: "0,false,false",
    fonts: "33",
    audio: "undefined"
};