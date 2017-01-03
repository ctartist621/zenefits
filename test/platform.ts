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

let client = new Zenefits(require("./testCreds.json"));

// if (process.env.CIRCLECI) {

// } else {
//   client = new Zenefits(require("./testCreds.json"));
// }

import nock = require("nock");

// nock.recorder.rec({
//   dont_print: true,
//   enable_reqheaders_recording: true,
//   output_objects: true
// });

let nockBack = require("nock").back;

const hookBefore = function() {
  nockBack.fixtures = __dirname + "/nockFixtures";
  nockBack.setMode("record");
}

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

const isApplication = function(p: ZenefitsPlatform.Application) {
  expect(p).to.contain.any.keys([
    'url',
    'fields',
    'object',
    'id'
  ]);
};

describe.only("Platform API", function() {
  this.timeout(6000);
  before(hookBefore);
  after(hookAfter);

  describe("Error Recovery", function() {
    it.skip("should recover from a bad access token", function(done: any) {
      client.access_token = "foo";
      client.installations(function(err: any, resp: any) {
        expect(err).not.exist;
        expect(resp.data).to.be.instanceof(Array);

        _.forEach(resp.data, function(r: any) {
          isInstallation(r);
        });

        done();
      });
    });
  });

  describe("#Get Applications", function() {
    it("should get information about the applications", function(done: any) {
      nockBack("ApplicationsFixture.json", function(nockDone: any) {
        client.applications(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isApplication(r);
          });

          nockDone();
          done();
        });
      });
    });

    it("should get a single application", function(done: any) {
      nockBack("ApplicationsFixture.json", function(nockDone1: any) {
        client.applications((err: any, applications: any) => {
          nockDone1();
          nockBack("ApplicationFixture.json", function(nockDone2: any) {
            client.application((<ZenefitsPlatform.Application>_.head(applications.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isApplication(resp.data);
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe.skip("#Set Application Custom Fields", function(){
    it("should set Application Custom Fields", function(done: any) {
      async.auto({
        setField: function(autoCallback: any) {
          nockBack("SetApplicationCustomFieldsFixture.json", function(nockDone: any) {
            client.setApplicationCustomFields({ foo: "bar" }, function(err: any, resp: any) {
              console.log(err)
              expect(err).to.not.exist;
              expect(resp.data).to.be.empty;

              nockDone();
              autoCallback(err);
            });
          });
        },
        checkField: ['setField', function(results: any, autoCallback: any) {
          nockBack("PostApplicationCustomFieldsFixture.json", function(nockDone: any) {
            client.applications(function(err: any, resp: any) {
              expect(err).not.exist;
              expect(resp.data).to.be.instanceof(Array);
              console.log(resp)
              _.forEach(resp.data, function(r: any) {
                expect(r.status).to.be.equal('ok');
              });
              nockDone();
              autoCallback(err);
            });
          });
        }]
      }, Infinity, done);
    });
  });

  describe("#Get Company Installations", function() {
    it("should get information about the installations for companies who have added your application", function(done: any) {
      nockBack("CompanyInstallationsFixture.json", function(nockDone: any) {
        client.installations(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isInstallation(r);
          });

          nockDone();
          done();
        });
      });
    });

    it("should get a single Company Installation", function(done: any) {
      nockBack("CompanyInstallationsFixture.json", function(nockDone1: any) {
        client.installations((err: any, installations: any) => {
          nockDone1();
          nockBack("CompanyInstallationFixture.json", function(nockDone2: any) {
            client.installation((<ZenefitsPlatform.Installation>_.head(installations.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isInstallation(resp.data);
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Set Installation Status", function() {
    it("should set installation status to 'ok'", function(done: any) {
      async.auto({
          setToOk: function(autoCallback: any) {
            nockBack("SetCompanyInstallationStatusOkFixture.json", function(nockDone: any) {
                  client.setInstallationStatusOk(function(err: any, resp: any) {
                      expect(err).to.not.exist;
                      expect(resp.data).to.be.empty;

                      nockDone();
                      autoCallback(err);
                  });
              });
          },
          checkOk: ['setToOk', function(results: any, autoCallback: any) {
              nockBack("PostSetCompanyInstallationStatusOkFixture.json", function(nockDone: any) {
                  client.installations(function(err: any, resp: any) {
                      expect(err).not.exist;
                      expect(resp.data).to.be.instanceof(Array);

                      _.forEach(resp.data, function(r: any) {
                          expect(r.status).to.be.equal('ok');
                      });
                      nockDone();

                      autoCallback(err);

                  });
              });
          }]
      }, Infinity, done);
    });

    it("should set installation status to 'not_enrolled'", function(done: any) {
      this.timeout(6000);

      async.auto({
        setToNotEnrolled: function(autoCallback: any) {
          nockBack("SetCompanyInstallationStatusNotEnrolledFixture.json", function(nockDone: any) {
            client.setInstallationStatusNotEnrolled(function(err: any, resp: any) {
              expect(err).to.not.exist;
              expect(resp.data).to.be.empty;

              nockDone();
              autoCallback(err);
            });
          });
        },
        checkNotEnrolled: ['setToNotEnrolled', function(results: any, autoCallback: any) {
          nockBack("PostSetCompanyInstallationStatusNotEnrolledFixture.json", function(nockDone: any) {
            client.installations(function(err: any, resp: any) {
              expect(err).not.exist;
              expect(resp.data).to.be.instanceof(Array);

              _.forEach(resp.data, function(r: any) {
                expect(r.status).to.be.equal('not_enrolled');
              });
              nockDone();
              autoCallback(err);
            });
          });
        }]
      }, Infinity, done)
    });
  });
});