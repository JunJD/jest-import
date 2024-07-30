import AntiBan from "./AntiBan.js";
import Logger from "./Logger.js";
import MockClient from "./MockClient.js";
import MockFetch from "./MockFetch.js";
import BatchRun from "./BatchRun.js";
class Crawler {
  #client;
  #antiBan;
  #fetcher;
  #logger;
  vals = []
  constructor() {
    this.#client = new MockClient();
    this.#antiBan = new AntiBan();
    this.#fetcher = new MockFetch(this.#client, this.#antiBan);
    this.#logger = new Logger();
    // this.database = new Database();
  }
  
  async start(accounts) {
    this.#logger.info('Starting crawler...')
    for (const account of accounts) {
      const cookie = await this.#fetcher.updateCookie();
      this.#client.updateSession(cookie)
      this.#logger.info(`${account} Updating cookie...`)
      const { s, k, as } = await this.#fetcher.getInit();
      const token = await this.#fetcher.getToken();
      this.#logger.info(`${account} Starting ing...`)
      this.#logger.info(`${account} Cookie: ${cookie}`)
      this.#logger.info(`${account} S: ${s}`)
      this.#logger.info(`${account} K: ${k}`)
      this.#logger.info(`${account} AS: ${as}`)
      const batchRun = new BatchRun(account, {
        cookie,
        s,
        k,
        as,
        token,
        fetcher: this.#fetcher
      });
      for (const val of this.vals) {
        batchRun.run(val)
      }
    }    
  }

  registerVals(vals) {
    this.vals = vals
  }
}

export default Crawler
