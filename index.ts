/// <reference types="lodash" />
/// <reference types="async" />
/// <reference types="needle" />
/// <reference path="./index.d.ts" />


import _ = require("lodash");
import async = require("async");
import needle = require("needle");

interface ZenefitsInterface {
  companies(cb: any): void;
  company(companyId: string, cb: any): void;
  people(cb: any): void;
  person(personId: string, cb: any): void;
}

export default class Zenefits implements ZenefitsInterface {
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
    let url = "";
    switch (type) {
      case "companies": {
        url = `${this.coreBaseUrl}/${type}/`;
        break;
      }
      case "people": {
        url = `${this.coreBaseUrl}/${type}/`;
        break;
      }
      default: {
        throw new Error("Request Type not defined");
      }
    }

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
      if (err) {
        cb(err);
      } else if (body.data.data) {
        ret = body.data.data;
      } else if (body.data) {
        ret = body.data;
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

}
