/// <reference types="nock" />
/// <reference types="chai" />
/// <reference types="mocha" />
/// <reference types="lodash" />
/// <reference path="../index.d.ts" />

import _ = require("lodash");
import fs = require("fs");
import path = require("path");
import chai = require("chai");
import { Zenefits } from "../index";
import nock = require("nock");

const expect = chai.expect;

let client: any;

// if (process.env.CIRCLECI) {
//   let client = new Zenefits();
// } else {
//   let client = new Zenefits(require("./testCreds.json"));
// }

let nockBack = require("nock").back;

const hookBefore = function() {
  client = new Zenefits(require("./testCreds.json"));

  nockBack.fixtures = __dirname + "/nockFixtures";
  nockBack.setMode("record");
}

const hookAfter = function() {
};

const isCompany = function(c: any) {
  expect(c).to.contain.any.keys([
    "name",
    "people",
    "url",
    "object",
    "logo_url",
    "id"
  ]);
};

const isPerson = function(p: any) {
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
    "title",
    "id",
    "object",
  ]);
};

const isEmployment = function(p: any) {
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
    "id",
    "object",
  ]);
};

const isCompanyBankAccount = function(p: any) {
  expect(p).to.contain.any.keys([
    "company",
    "account_type",
    "account_number",
    "routing_number",
    "bank_name",
    "id",
    "object",
  ]);
};

const isEmployeeBankAccount = function(p: any) {
  expect(p).to.contain.any.keys([
    "person",
    "account_type",
    "account_number",
    "routing_number",
    "bank_name",
    "id",
    "object",
  ]);
};

const isDepartment = function(p: any) {
  expect(p).to.contain.any.keys([
    "people",
    "id",
    "company",
    "name",
    "object",
  ]);
};

const isLocation = function(p: any) {
  expect(p).to.contain.any.keys([
    "id",
    "city",
    "company",
    "country",
    "name",
    "object",
    "people",
    "state",
    "street1",
    "street2",
    "zip"
  ]);
};

const isAuthedUser = function(p: any) {
  expect(p).to.contain.any.keys([
    "id",
    "object",
    "company",
    "person",
    "scopes",
    "expires",
    "uninstalled",
  ]);
};

describe("Core API", function() {
  this.timeout(6000);
  before(hookBefore);
  after(hookAfter);

  describe("#Companies", function() {
    it("should get a list of companies", function(done: any) {
      nockBack("CompaniesFixture.json", function(nockDone: any) {
        client.companies(function(err: any, resp: Response) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isCompany(r);
          });

          nockDone();
          done();
        });
      });
    });

    it("should get a single company", function(done: any) {
      nockBack("CompaniesFixture.json", function(nockDone1: any) {
        client.companies((err: any, companies: any) => {
          nockBack("CompanyFixture.json", function(nockDone2: any) {
            client.company((<ZenefitsCore.Company>_.head(companies.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isCompany(resp.data);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#People", function() {
    it("should get a list of people", function(done: any) {
      nockBack("PeopleFixture.json", function(nockDone: any) {
        client.people(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isPerson(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single person", function(done: any) {
      nockBack("PeopleFixture.json", function(nockDone1: any) {
        client.people((err: any, people: any) => {
          nockBack("PersonFixture.json", function(nockDone2: any) {
            client.person((<ZenefitsCore.Person>_.head(people.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isPerson(resp.data);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Employments", function() {
    it("should get a list of employments", function(done: any) {
      nockBack("EmploymentsFixture.json", function(nockDone: any) {
        client.employments(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isEmployment(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single employment", function(done: any) {
      nockBack("EmploymentsFixture.json", function(nockDone1: any) {
        client.employments((err: any, employments: any) => {
          nockDone1();
          nockBack("EmploymentFixture.json", function(nockDone2: any) {
            expect(err).not.exist;
            client.employment((<ZenefitsCore.Employment>_.head(employments.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isEmployment(resp.data);
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Company Bank Accounts", function() {
    it("should get a list of company bank accounts", function(done: any) {
      nockBack("CompanyBankAccountsFixture.json", function(nockDone: any) {
        client.companyBankAccounts(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isCompanyBankAccount(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single company bank account", function(done: any) {
      nockBack("CompanyBankAccountsFixture.json", function(nockDone1: any) {
        client.companyBankAccounts((err: any, accounts: any) => {
          nockBack("CompanyBankAccountFixture.json", function(nockDone2: any) {
            client.companyBankAccount((<ZenefitsCore.CompanyBankAccount>_.head(accounts.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isCompanyBankAccount(resp.data);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Employee Bank Accounts", function() {
    it("should get a list of employee bank accounts", function(done: any) {
      nockBack("EmployeeBankAccountsFixture.json", function(nockDone: any) {
        client.employeeBankAccounts(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isEmployeeBankAccount(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single employee bank account", function(done: any) {
      nockBack("EmployeeBankAccountsFixture.json", function(nockDone1: any) {
        client.employeeBankAccounts((err: any, accounts: any) => {
          nockBack("EmployeeBankAccountFixture.json", function(nockDone2: any) {
            client.employeeBankAccount((<ZenefitsCore.EmployeeBankAccount>_.head(accounts.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isEmployeeBankAccount(resp.data);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Departments", function() {
    it("should get a list of departments", function(done: any) {
      nockBack("DepartmentsFixture.json", function(nockDone: any) {
        client.departments(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isDepartment(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single department", function(done: any) {
      nockBack("DepartmentsFixture.json", function(nockDone1: any) {
        client.departments((err: any, departments: any) => {
          nockBack("DepartmentFixture.json", function(nockDone2: any) {
            client.department((<ZenefitsCore.Department>_.head(departments.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isDepartment(resp.data);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Locations", function() {
    it("should get a list of locations", function(done: any) {
      nockBack("LocationsFixture.json", function(nockDone: any) {
        client.locations(function(err: any, resp: any) {
          expect(err).not.exist;
          expect(resp.data).to.be.instanceof(Array);

          _.forEach(resp.data, function(r: any) {
            isLocation(r);
          });
          nockDone();
          done();
        });
      });
    });

    it("should get a single location", function(done: any) {
      nockBack("LocationsFixture.json", function(nockDone1: any) {
        client.locations((err: any, locations: any) => {
          nockBack("LocationFixture.json", function(nockDone2: any) {
            client.location((<ZenefitsCore.Location>_.head(locations.data)).id, (err: any, resp: any) => {
              expect(err).not.exist;
              isLocation(resp.data);
              nockDone1();
              nockDone2();
              done();
            });
          });
        });
      });
    });
  });

  describe("#Me", function() {
    it("should get information about the currently authorized user", function(done: any) {
      nockBack("MeFixture.json", function(nockDone: any) {
        client.currentAuthorizedUser(function(err: any, resp: any) {
          expect(err).not.exist;
          isAuthedUser(resp.data);
          nockDone();
          done();
        });
      });
    });
  });
});
