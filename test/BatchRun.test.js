import { assert, expect } from 'chai';
import sinon from 'sinon';
import BatchRun from '../src/BatchRun.js'; // 确保路径正确
import Logger from '../src/Logger.js'; // 确保路径正确

describe('BatchRun', () => {
    let batchRun;
    let fetcherMock;
    let loggerStub;

    beforeEach(() => {
        fetcherMock = {
            getViewLog: sinon.stub(),
            fetchPublicKey: sinon.stub(),
            login: sinon.stub(),
            getStyle: sinon.stub(),
            getImgFile: sinon.stub(),
            updateDsAndTk: sinon.stub(),
        };
        loggerStub = sinon.stub(Logger.prototype, 'info'); // 禁用日志输出
        batchRun = new BatchRun('testUser', {
            s: 's_value',
            k: 'k_value',
            token: 'token_value',
            as: 'as_value',
            cookie: 'cookie_value',
            fetcher: fetcherMock,
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should encrypt password correctly', async () => {
        const publicKey = `-----BEGIN PUBLIC KEY-----
        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDeQYZZmglkNqhWBStVDMO0XAqr
        FFdwWjw30WZ5C52qmGVUZW/CKwrFbZim+EBx6H+5HFLWv010Ox8DMO7Tqv6mlL+T
        gZJ4rw4Xj4od3MLIJUkzDqxBxn1FdOwfXCoFvt309gERWEkUBg+C4E9jbB/oEyIj
        G7Bh1fKgke/SRWVgmQIDAQAB
        -----END PUBLIC KEY-----`;
        const password = '021014';
        fetcherMock.fetchPublicKey.resolves({ publicKey, key: 'key', traceid: 'traceid' });

        const encryptedPassword = batchRun.encryptPassword(password, publicKey);
        assert.equal(encryptedPassword.length, "YoHRSOSZWd21sLO05kV7SwRStr4vJo6I+J53qP+V84ot7lQMJg2iXm6esXmlFFSr+Hg/qDYGv8DRr2+Ctc74uuPVbI0JQdV0VQ8iNS9DXnb4s42mypYvycITcBf8YEfC2LVySDc9pbtjHk0z0eIodgYuqFplVPpfEBQ2lYDEMJk=".length);

    });

    it('should return correct login data', () => {
        const encryptedPassword = 'encryptedPassword';
        const key = 'key';
        const traceid = 'traceid';
        const tk = 'tk';
        const ds = 'ds';

        const data = batchRun.getLoginData({ encryptedPassword, key, traceid, tk, ds });

        expect(data).to.include({
            username: 'testUser',
            password: encryptedPassword,
            s: 's_value',
            k: 'k_value',
            tk,
            ds,
        });
        // 可以添加更多的字段检查
    });

    // it('should run successfully with correct credentials', async () => {
    //     fetcherMock.getViewLog.resolves({ tk: 'tk_value', ds: 'ds_value' });
    //     fetcherMock.fetchPublicKey.resolves({ publicKey: 'publicKey', key: 'key', traceid: 'traceid' });
    //     fetcherMock.login.resolves({ success: true });

    //     await batchRun.run('testPassword');

    //     expect(loggerStub.calledWith('【run】["testUser","testPassword"]')).to.be.true;
    //     expect(loggerStub.calledWith('【success】 ["testUser","testPassword"]')).to.be.true;
    // });

    // it('should handle isRotateImg scenario', async () => {
    //     fetcherMock.getViewLog.resolves({ tk: 'tk_value', ds: 'ds_value' });
    //     fetcherMock.fetchPublicKey.resolves({ publicKey: 'publicKey', key: 'key', traceid: 'traceid' });
    //     fetcherMock.login.resolves({ isRotateImg: true });
    //     fetcherMock.getStyle.resolves({ data: { backstr: 'backstr_value' } });
    //     fetcherMock.getImgFile.resolves('form_data');
    //     batchRun.predict = sinon.stub().resolves({ predicted_angle: 45 });

    //     await batchRun.run('testPassword');

    //     expect(fetcherMock.getStyle.calledOnce).to.be.true;
    //     expect(fetcherMock.getImgFile.calledOnce).to.be.true;
    //     expect(batchRun.predict.calledOnce).to.be.true;
    //     // 检查其他关键步骤
    // });

    // 其他测试用例...
});