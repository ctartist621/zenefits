/// <reference types="nock" />
/// <reference types="chai" />
/// <reference types="mocha" />
/// <reference types="lodash" />

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
  expect(c).to.contain.all.keys([
    "name",
    "people",
    "url",
    "object",
    "logo_url",
    "id"
  ]);
};

describe("Core API", function() {
  describe("#Companies", function() {
    after(hookAfter);

    it("should get a list of companies", function(done: any) {
      client.companies(function(err: any, resp: any) {
        expect(err).not.exist;
        expect(resp).to.be.instanceof(Array);

        _.forEach(resp, function(r) {
          isCompany(r);
        });

        done();
      });
    });

    it("should get a single company", function(done: any) {
      client.companies((err: any, companies: Company[]) => {
        client.company(_.head(companies).id, (err: any, resp: any) => {
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
