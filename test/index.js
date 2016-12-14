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
    expect(c).to.contain.any.keys([
        "name",
        "people",
        "url",
        "object",
        "logo_url",
        "id"
    ]);
};
var isPerson = function (p) {
    expect(p).to.contain.any.keys([
        "company",
        "employments",
        "date_of_birth",
        "department",
        "first_name",
        "last_name",
        "preferred_name",
        "status",
        "location",
        "manager",
        "work_phone",
        "personal_phone",
        "subordinates",
        "banks",
        "work_email",
        "personal_email",
        "street1",
        "street2",
        "city",
        "state",
        "country",
        "postal_code",
        "social_security_number",
        "gender",
        "title"
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
                    expect(err).not.exist;
                    isCompany(resp);
                    done();
                });
            });
        });
    });
    describe("#People", function () {
        after(hookAfter);
        it("should get a list of people", function (done) {
            client.people(function (err, resp) {
                expect(err).not.exist;
                expect(resp).to.be.instanceof(Array);
                _.forEach(resp, function (r) {
                    isPerson(r);
                });
                done();
            });
        });
        it("should get a single person", function (done) {
            client.people(function (err, companies) {
                client.person(_.head(companies).id, function (err, resp) {
                    expect(err).not.exist;
                    isPerson(resp);
                    done();
                });
            });
        });
    });
});
