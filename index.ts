/// <reference types="lodash" />
/// <reference types="async" />
/// <reference types="needle" />
/// <reference path="./index.d.ts" />


import _ = require("lodash");
import async = require("async");
import needle = require("needle");

export default class Zenefits {
  bearerKey: string;
  urlBase: string;
  platformBaseUrl: string;
  coreBaseUrl: string;

  constructor(bearerKey?: string) {
    this.bearerKey = bearerKey;
    this.platformBaseUrl = "https://api.zenefits.com/platform";
    this.coreBaseUrl = "https://api.zenefits.com/core";
  }

  get(type: string, id: string, cb?: any) {
    let url = `${this.coreBaseUrl}/${type}/`;

    if (!_.isUndefined(id)) {
      url += id;
    };

    const options = {
      headers: {
        Authorization: `Bearer ${this.bearerKey}`
      }
    };

    needle.get(url, options, function(err: any, resp: any, body: any) {
      let ret = {};
      if (body && body.data.data) {
        ret = body.data.data;
      } else if (body && body.data) {
        ret = body.data;
      } else {
        err = {
          code: resp && resp.statusCode,
          message: resp && resp.statusMessage,
          url: url,
          err: err || (body && body.error)
        };
      }
      cb(err, ret);
    });
  }

  singleReturn(error: any, response: any, cb: any) {
    if (error) {
      cb(error);
    } else {
     cb(error, _.head(response));
    }
  }

  companies(cb: any) {
    this.get("companies", undefined, cb);
  }

  company(companyId: string, cb: any) {
    this.get("companies", companyId, cb);
  }

  people(cb: any) {
    this.get("people", undefined, cb);
  }

  person(personId: string, cb: any) {
    this.get("people", personId, cb);
  }

  employments(cb: any) {
    this.get("employments", undefined, cb);
  }

  employment(employmentId: string, cb: any) {
    this.get("employments", employmentId, cb);
  }

  companyBankAccounts(cb: any) {
    this.get("company_banks", undefined, cb);
  }

  companyBankAccount(accountId: string, cb: any) {
    this.get("company_banks", accountId, cb);
  }

  employeeBankAccounts(cb: any) {
    this.get("banks", undefined, cb);
  }

  employeeBankAccount(accountId: string, cb: any) {
    this.get("banks", accountId, cb);
  }

  departments(cb: any) {
    this.get("departments", undefined, cb);
  }

  department(deptId: string, cb: any) {
    this.get("departments", deptId, cb);
  }
  locations(cb: any) {
    this.get("locations", undefined, cb);
  }

  location(locId: string, cb: any) {
    this.get("locations", locId, cb);
  }

  currentAuthorizedUser(cb: any) {
    this.get("me", undefined, cb)
  }
}

export { Zenefits };
