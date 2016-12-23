/// <reference types="lodash" />
/// <reference types="async" />
/// <reference types="needle" />
/// <reference path="./index.d.ts" />


import _ = require("lodash");
import async = require("async");
import needle = require("needle");

export default class Zenefits {
  access_token: string;
  refresh_token: string;
  client_id: string;
  client_secret: string;
  urlBase: string;
  platformBaseUrl: string;
  coreBaseUrl: string;
  installId: string;
  set: any;

  constructor(opts: any) {
    this.access_token = opts.access_token;
    this.refresh_token = opts.refresh_token;
    this.client_id = opts.client_id;
    this.client_secret = opts.client_secret;
    this.platformBaseUrl = "https://api.zenefits.com/platform";
    this.coreBaseUrl = "https://api.zenefits.com/core";
  }

  _request(method: string, url: string, data:any, cb: any) {
    let options = {
      headers: {
        Authorization: `Bearer ${this.access_token}`,
        "Content-Type": "application/json"
      },
      json: method === 'post' ? true : false
    };

    if(method === "post") {
      // code...
    } else {
      delete options.headers["Content-Type"];
    }

    const handleError = function(err: any, resp: any, body, cb: any) {
      err = {
        code: resp && resp.statusCode,
        message: resp && resp.statusMessage,
        url: url,
        err: err || (body && body.error)
      };
      cb(err);
    }

    const renewToken = () => {
      needle.post("https://secure.zenefits.com/oauth2/token/", `grant_type=refresh_token&refresh_token=${this.refresh_token}&client_id=${this.client_id}&client_secret=${this.client_secret}`, {}, (err, resp, body) =>{
        if(err || body.error) {
          cb(err || body.error)
        } else {
          this.access_token = body.access_token;
          this.refresh_token = body.refresh_token;
          this._request(method, url, data, cb);
        }
      })
    }

    const handleData = (body: any, cb: any) => {
      console.log('handleData')
      let ret = {
        credentials: {
          access_token: this.access_token,
          refresh_token: this.refresh_token
        },
        data: body.data.data ? body.data.data : body.data
      };
      cb(undefined, ret)
    }

    needle.request(method, url, data, options, (err: any, resp: any, body: any) => {
      if(resp && resp.statusCode === 401) {
        renewToken();
      } else if (resp && resp.statusCode >= 400) {
        handleError(err, resp, body, cb)
      } else if (body && body.data) {
        handleData(body, cb)
      } else {
        handleError(err, resp, body, cb)
      }
    });

  }

  core(type: string, id: string, cb: any) {
    let url = `${this.coreBaseUrl}/${type}/`;

    if (!_.isUndefined(id)) {
      url += id;
    };

    this._request('get', url, undefined, cb)
  }

  platform(method: string, type: string, id: string, data: any, cb?: any) {
    let url = `${this.platformBaseUrl}/${type}/`;
    switch (type) {
      case "installationStatus":
        url = `${this.platformBaseUrl}/company_installs/${id}/status_changes/`;
        break;

      default:
        if (!_.isUndefined(id)) {
          url += id;
        };
        break;
    }
    this._request(method, url, data, cb);
  }

  singleReturn(error: any, response: any, cb: any) {
    if (error) {
      cb(error);
    } else {
     cb(error, _.head(response));
    }
  }

  companies(cb: any) {
    this.core("companies", undefined, cb);
  }

  company(companyId: string, cb: any) {
    this.core("companies", companyId, cb);
  }

  people(cb: any) {
    this.core("people", undefined, cb);
  }

  person(personId: string, cb: any) {
    this.core("people", personId, cb);
  }

  employments(cb: any) {
    this.core("employments", undefined, cb);
  }

  employment(employmentId: string, cb: any) {
    this.core("employments", employmentId, cb);
  }

  companyBankAccounts(cb: any) {
    this.core("company_banks", undefined, cb);
  }

  companyBankAccount(accountId: string, cb: any) {
    this.core("company_banks", accountId, cb);
  }

  employeeBankAccounts(cb: any) {
    this.core("banks", undefined, cb);
  }

  employeeBankAccount(accountId: string, cb: any) {
    this.core("banks", accountId, cb);
  }

  departments(cb: any) {
    this.core("departments", undefined, cb);
  }

  department(deptId: string, cb: any) {
    this.core("departments", deptId, cb);
  }
  locations(cb: any) {
    this.core("locations", undefined, cb);
  }

  location(locId: string, cb: any) {
    this.core("locations", locId, cb);
  }

  currentAuthorizedUser(cb: any) {
    this.core("me", undefined, cb)
  }

  installations(cb: any) {
    this.platform('get', 'company_installs', undefined, undefined, cb);
  }

  installation(installId: string, cb: any) {
    this.platform('get', 'company_installs', installId, undefined, cb);
  }

  setInstallationStatusOk(cb: any) {
      if (this.installId) {
          this.platform('post', 'installationStatus', this.installId, { status: "ok" }, cb);
      } else {
          this.installations((err: any, installations: ZenefitsPlatform.Installation[]) => {
              if (err) {
                  cb(err);
              } else {
                  this.installId = _.head(installations).id;
                  this.platform('post', 'installationStatus', this.installId, { status: "ok" }, cb);
              }
          });
      }
  }
  setInstallationStatusNotEnrolled(cb: any) {
      if (this.installId) {
          this.platform('post', 'installationStatus', this.installId, { status: "not_enrolled" }, cb);
      } else {
          this.installations((err: any, installations: ZenefitsPlatform.Installation[]) => {
              if (err) {
                  cb(err);
              } else {
                  this.installId = _.head(installations).id;
                  this.platform('post', 'installationStatus', this.installId, { status: "not_enrolled" }, cb);
              }
          });
      }
  }
}

export { Zenefits };
