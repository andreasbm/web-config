import { MY_NUMBER } from "./my-number";

const expect = chai.expect;

describe("test", () => {
	it("the test should be run", async () => {
		expect(MY_NUMBER).to.be.lessThan(10);
	});
});
