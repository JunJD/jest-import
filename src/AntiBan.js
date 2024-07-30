class AntiBan {
    constructor() {
        this.lastRequestTime = 0;
        this.minDelay = 1000; // 最小延迟时间
        this.maxDelay = 5000; // 最大延迟时间
    }

    async randomDelay() {
        // 在请求之间加入随机延迟，模拟人类操作
        const delay =
            Math.floor(Math.random() * (this.maxDelay - this.minDelay + 1)) +
            this.minDelay;
        await this.sleep(delay);
    }

    sleep(ms) {
        // 延迟函数
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    changeRequestPattern(headers) {
        // 改变请求头的顺序和方式，增加多样性
        const keys = Object.keys(headers);
        const shuffledKeys = keys.sort(() => Math.random() - 0.5);
        const shuffledHeaders = {};
        shuffledKeys.forEach((key) => {
            shuffledHeaders[key] = headers[key];
        });
        return shuffledHeaders;
    }

    shouldAdjustStrategy(response) {
        // 根据响应状态码和内容，判断是否需要调整策略
        const status = response.status;
        if (status === 429 || status === 403) {
            // 429 Too Many Requests 或 403 Forbidden
            return true;
        }
        return false;
    }
}

export default AntiBan;
