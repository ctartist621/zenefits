"use strict";
var _ = require("lodash");
var chai = require("chai");
var expect = chai.expect;
var index_1 = require("../index");
var client = new index_1.default();
if (process.env.CIRCLECI) {
}
else {
    client.bearerKey = require("./testCreds.json").bearerKey;
}
var hookAfter = function () {
};
var isCompany = function (c) {
    expect(c).to.contain.all.keys([
        "name",
        "people",
        "url",
        "object",
        "logo_url",
        "id"
    ]);
};
describe("Core API", function () {
    describe("#Companies", function () {
        after(hookAfter);
        it("should get a list of companies", function (done) {
            client.companies(function (err, resp) {
                expect(err).not.exist;
                expect(resp).to.be.instanceof(Array);
                _.forEach(resp, function (r) {
                    isCompany(r);
                });
                done();
            });
        });
        it("should get a single company", function (done) {
            client.companies(function (err, companies) {
                client.company(_.head(companies).id, function (err, resp) {
                    console.log(err);
                    console.log(resp);
                    expect(err).not.exist;
                    isCompany(resp);
                    done();
                });
            });
        });
    });
});
