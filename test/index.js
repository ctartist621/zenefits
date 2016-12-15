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
var nockBack = require("nock").back;
nockBack.fixtures = __dirname + "/nockFixtures";
nockBack.setMode("record");
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
var isEmployment = function (p) {
    expect(p).to.contain.any.keys([
        "person",
        "hire_date",
        "termination_date",
        "termination_type",
        "employment_type",
        "comp_type",
        "annual_salary",
        "pay_rate",
        "working_hours_per_week",
    ]);
};
describe("Core API", function () {
    after(hookAfter);
    describe("#Companies", function () {
        it("should get a list of companies", function (done) {
            nockBack("CompaniesFixture.json", function (nockDone) {
                client.companies(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp).to.be.instanceof(Array);
                    _.forEach(resp, function (r) {
                        isCompany(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single company", function (done) {
            nockBack("CompaniesFixture.json", function (nockDone1) {
                client.companies(function (err, companies) {
                    nockBack("CompanyFixture.json", function (nockDone2) {
                        client.company(_.head(companies).id, function (err, resp) {
                            expect(err).not.exist;
                            isCompany(resp);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#People", function () {
        it("should get a list of people", function (done) {
            nockBack("PeopleFixture.json", function (nockDone) {
                client.people(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp).to.be.instanceof(Array);
                    _.forEach(resp, function (r) {
                        isPerson(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single person", function (done) {
            nockBack("PeopleFixture.json", function (nockDone1) {
                client.people(function (err, people) {
                    nockBack("PersonFixture.json", function (nockDone2) {
                        client.person(_.head(people).id, function (err, resp) {
                            expect(err).not.exist;
                            isPerson(resp);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("#Employments", function () {
        it("should get a list of employments", function (done) {
            nockBack("EmploymentsFixture.json", function (nockDone) {
                client.employments(function (err, resp) {
                    expect(err).not.exist;
                    expect(resp).to.be.instanceof(Array);
                    _.forEach(resp, function (r) {
                        isEmployment(r);
                    });
                    nockDone();
                    done();
                });
            });
        });
        it("should get a single employment", function (done) {
            nockBack("EmploymentsFixture.json", function (nockDone1) {
                client.employments(function (err, employments) {
                    nockBack("EmploymentFixture.json", function (nockDone2) {
                        client.employment(_.head(employments).id, function (err, resp) {
                            expect(err).not.exist;
                            isEmployment(resp);
                            nockDone1();
                            nockDone2();
                            done();
                        });
                    });
                });
            });
        });
    });
});
