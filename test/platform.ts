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


if (process.env.CIRCLECI) {
  let client = new Zenefits();
} else {
  let client = new Zenefits(require("./testCreds.json"));
}

import nock = require("nock");

// nock.recorder.rec({
//   dont_print: true,
//   enable_reqheaders_recording: true,
//   output_objects: true
// });

let nockBack = require("nock").back;

nockBack.fixtures = __dirname + "/nockFixtures";
nockBack.setMode("record");

const hookAfter = function() {
  // console.log("HOOKS - AFTER");
  // console.log(__dirname + "/nockFixtures/fixtures.js");
  // fs.appendFileSync(__dirname + "/nockFixtures/fixtures.js", nock.recorder.play());
};

const isInstallation = function(p: ZenefitsPlatform.Installation) {
  expect(p).to.contain.any.keys(['status',
    'url',
    'fields',
    'company',
    'object',
    'application',
    'person_subscriptions',
    'id'
  ]);
};

describe("Platform API", function() {
  this.timeout(6000);
  after(hookAfter);

  describe("Error Recovery", function() {
    it.only("should recover from a bad access token", function(done: any) {
      client.access_token = "foo"
      client.installations(function(err: any, resp: any) {
        expect(err).not.exist;
        expect(resp.data).to.be.instanceof(Array);

        console.log(err, resp)

        _.forEach(resp.data), function(r: any) {
          isInstallation(r);
        });

        done();
      });
    });
  })
  })

  describe("#Get Company Installations", function() {
    it("should get information about the installations for companies who have added your application", function(done: any) {
      nockBack("CompanyInstallations.json", function(nockDone: any) {
        client.installations(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data), function(r: any) {
            isInstallation(r);
          });

          nockDone();
          done();
        });
      });
    });
  });


  describe("#Set Installation Status", function() {
    nockBack.setMode("wild");
    it("should set installation status to 'ok'", function(done: any) {

      async.auto({
        setToOk: function(autoCallback: any) {
          nockBack("SetCompanyInstallationStatusOk.json", function(nockDone: any) {
              client.setInstallationStatusOk(function(err: any, resp: any) {
                  expect(err).to.be.null;
                  expect(resp.data).to.be.empty;

                  nockDone();
                  autoCallback(err);
              });
          });
        },
        checkOk: ['setToOk', function(results: any, autoCallback: any) {
          nockBack("PostSetCompanyInstallationStatusOk.json", function(nockDone: any) {
            client.installations(function(err: any, resp: any) {
              expect(err).not.exist;
              expect(resp.data).to.be.instanceof(Array);

              _.forEach(resp.data), function(r: any) {
                expect(r.status).to.be.equal('ok');
              });
              nockDone();

              autoCallback(err);

            });
          });
        }]
      }, done)
    });

    it("should set installation status to 'not_enrolled'", function(done: any) {
      this.timeout(6000);

      async.auto({
        setToNotEnrolled: function(autoCallback: any) {
          nockBack("SetCompanyInstallationStatusNotEnrolled.json", function(nockDone: any) {
            client.setInstallationStatusNotEnrolled(function(err: any, resp: any) {
              expect(err).to.be.null;
              expect(resp.data).to.be.empty;

              nockDone();
              autoCallback(err);
            });
          });
        },
        checkNotEnrolled: ['setToNotEnrolled', function(results: any, autoCallback: any) {
          nockBack("PostSetCompanyInstallationStatusNotEnrolled.json", function(nockDone: any) {
            client.installations(function(err: any, resp: any) {
              expect(err).not.exist;
              expect(resp.data).to.be.instanceof(Array);

              _.forEach(resp.data), function(r: any) {
                expect(r.status).to.be.equal('not_enrolled');
              });
              nockDone();
              autoCallback(err);
              });
          });
        }]
      }, done)
    });
  });
});
