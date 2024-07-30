import Crawler from "./src/Crawler.js";
import data from "./node_modules/test-json-import/data.json" assert { type: "json" };
import { showMeTheData } from "test-json-import/index.js";
const crawler = new Crawler()

//生成 8-14位数的随机密码
function generateRandomPassword() {
	return (
		Math.random().toString(36).substring(2, 15)
	);
}

crawler.registerVals([
	...Array.from({ length: 20 }).map(() => (generateRandomPassword())),
	"021014",
])

crawler.start(['天平地成'])

export { showMeTheData };