/// <reference types="async" />
/// <reference types="nock" />
/// <reference types="chai" />
/// <reference types="mocha" />
/// <reference types="lodash" />
/// <reference path="../index.d.ts" />

import _ = require("lodash");
import async = require("async");
import fs = require("fs");
import path = require("path");
import chai = require("chai");
const expect = chai.expect;
import { Zenefits } from "../index";

let client: Zenefits;

// if (process.env.CIRCLECI) {

// } else {
//   client = new Zenefits(require("./testCreds.json"));
// }

import nock = require("nock");

let nockBack = require("nock").back;

const hookBefore = function() {
  client = new Zenefits(require("./testCreds.json"));
  nockBack.fixtures = __dirname + "/nockFixtures";
  nockBack.setMode("record");
  client.client_secret = require('./sampleData/testEventCreds.json').client_secret;
}

const hookAfter = function() {
}

describe.only("Events", function() {
  this.timeout(6000);
  before(hookBefore);
  after(hookAfter);

  describe("authentication", function() {
    it("should authenticate an incoming Zenefits event", function(done: any) {
      const payload = require('./sampleData/testEventPayload.json');
      const headers = require('./sampleData/testEventHeaders.json');
      client.authenticateEvent(payload, headers, function(err: any, p: any) {
        expect(err).not.exist;
        expect(p).to.equal(payload)
        done();
      });
    });

    it("should reject an incoming Zenefits event with no signature", function(done: any) {
      const payload = require('./sampleData/testEventPayload.json');
      const headers = {}
      client.authenticateEvent(payload, headers, function(err: any, p: any) {
        expect(err.error).to.equal("UNAUTHORIZED EVENT")
        expect(p).to.not.exist
        expect(err.event).to.equal(payload)
        done();
      });
    });
  });
});