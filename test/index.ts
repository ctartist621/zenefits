/// <reference types="nock" />
/// <reference types="chai" />
/// <reference types="mocha" />
/// <reference types="lodash" />
/// <reference path="../index.d.ts" />

import _ = require("lodash");
import fs = require("fs");
import path = require("path");
import chai = require("chai");
const expect = chai.expect;
import Zenefits from "../index";

let client = new Zenefits();

if (process.env.CIRCLECI) {
} else {
  client.bearerKey = require("./testCreds.json").bearerKey;
}

// import nock = require("nock");
// nock.enableNetConnect();
//
// nock.recorder.rec({
//   dont_print: true,
//   enable_reqheaders_recording: true,
// });

// const nockBack = require("nock").back;
//
// nockBack.fixtures = __dirname + "/nockFixtures/fixtures.js";
// nockBack.setMode("record");

const hookAfter = function() {
  // console.log("HOOKS - AFTER");
  // console.log(__dirname + "/nockFixtures/fixtures.js");
  // fs.appendFileSync(__dirname + "/nockFixtures/fixtures.js", nock.recorder.play());
};

const isCompany = function(c: Company) {
  expect(c).to.contain.any.keys([
    "name",
    "people",
    "url",
    "object",
    "logo_url",
    "id"
  ]);
};

const isPerson = function(p: Person) {
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

describe("Core API", function() {
  describe("#Companies", function() {
    after(hookAfter);

    it("should get a list of companies", function(done: any) {
      client.companies(function(err: any, resp: Zenefits.Company[]) {
        expect(err).not.exist;
        expect(resp).to.be.instanceof(Array);

        _.forEach(resp, function(r) {
          isCompany(r);
        });

        done();
      });
    });

    it("should get a single company", function(done: any) {
      client.companies((err: any, companies: Zenefits.Company[]) => {
        client.company(_.head(companies).id, (err: any, resp: any) => {
          expect(err).not.exist;
          isCompany(resp);
          done();
        });
      });
    });
  });

  describe("#People", function() {
    after(hookAfter);

    it("should get a list of people", function(done: any) {
      client.people(function(err: any, resp: Zenefits.Person[]) {
        expect(err).not.exist;
        expect(resp).to.be.instanceof(Array);

        _.forEach(resp, function(r) {
          isPerson(r);
        });

        done();
      });
    });

    it("should get a single person", function(done: any) {
      client.people((err: any, companies: Zenefits.Person[]) => {
        client.person(_.head(companies).id, (err: any, resp: any) => {
          expect(err).not.exist;
          isPerson(resp);
          done();
        });
      });
    });
  });

});
