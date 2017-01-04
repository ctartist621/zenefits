/// <reference types="lodash" />
/// <reference types="async" />
/// <reference types="needle" />
/// <reference types="node" />
/// <reference path="./index.d.ts" />


import _ = require("lodash");
import async = require("async");
import needle = require("needle");
import crypto = require("crypto");

export default class Zenefits {
  access_token: string;
  refresh_token: string;
  client_id: string;
  client_secret: string;
  urlBase: string;
  platformBaseUrl: string;
  coreBaseUrl: string;
  applicationId: string;
  installId: string;
  set: any;
  credentialsRefreshed: boolean;

  constructor(opts: any) {
    this.access_token = opts.access_token;
    this.refresh_token = opts.refresh_token;
    this.client_id = opts.client_id;
    this.client_secret = opts.client_secret;
    this.credentialsRefreshed = false;
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

    const handleError = function(err: any, resp: any, body: any, cb: any) {
      err = {
        code: resp && resp.statusCode,
        message: resp && resp.statusMessage,
        url: url,
        error: err || (body && body.error)
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
          this.credentialsRefreshed = true;
          this._request(method, url, data, cb);
        }
      })
    }

    const handleData = (body: any, cb: any) => {
      let ret = {
        credentials: {
          access_token: this.access_token,
          refresh_token: this.refresh_token,
          credentialsRefreshed: this.credentialsRefreshed
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
      } else if (resp && resp.statusCode == 204) {
        handleData({ data: {}}, cb)
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
      case "fields_changes":
        url = `${this.platformBaseUrl}/applications/${id}/fields_changes/`;
        break;

      case "installationStatus":
        url = `${this.platformBaseUrl}/company_installs/${id}/status_changes/`;
        break;
      case "flows":
        if(id) {
          url = `${this.platformBaseUrl}/person_subscriptions/${id}/flows/`;
        }
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

  applications(cb: any) {
    this.platform('get', 'applications', undefined, undefined, cb);
  }

  application(applicationId: string, cb: any) {
    this.platform('get', 'applications', applicationId, undefined, cb);
  }

  setApplicationCustomFields(fields: any, cb: any) {
    if (this.applicationId) {
      this.platform('post', 'fields_changes', this.applicationId, fields, cb);
    } else {
      this.applications((err: any, applications: any) => {
        if (err) {
          cb(err);
        } else {
          this.installId = (<ZenefitsPlatform.Application>_.head(applications.data)).id;
          this.platform('post', 'fields_changes', this.applicationId, fields, cb);
        }
      });
    }
  }

  installations(cb: any) {
    this.platform('get', 'company_installs', undefined, undefined, cb);
  }

  installation(installId: string, cb: any) {
    this.platform('get', 'company_installs', installId, undefined, cb);
  }

  personSubscriptions(cb: any) {
    this.platform('get', 'person_subscriptions', undefined, undefined, cb);
  }

  personSubscription(subscriptionId: string, cb: any) {
    this.platform('get', 'person_subscriptions', subscriptionId, undefined, cb);
  }

  setInstallationStatusOk(cb: any) {
      if (this.installId) {
          this.platform('post', 'installationStatus', this.installId, { status: "ok" }, cb);
      } else {
          this.installations((err: any, installations: any) => {
              if (err) {
                  cb(err);
              } else {
                  this.installId = (<ZenefitsPlatform.Installation>_.head(installations.data)).id;
                  this.platform('post', 'installationStatus', this.installId, { status: "ok" }, cb);
              }
          });
      }
  }
  setInstallationStatusNotEnrolled(cb: any) {
      if (this.installId) {
          this.platform('post', 'installationStatus', this.installId, { status: "not_enrolled" }, cb);
      } else {
          this.installations((err: any, installations: any) => {
              if (err) {
                  cb(err);
              } else {
                  this.installId = (<ZenefitsPlatform.Installation>_.head(installations.data)).id;
                  this.platform('post', 'installationStatus', this.installId, { status: "not_enrolled" }, cb);
              }
          });
      }
  }

  allFlows(cb: any) {
    this.platform('get', 'flows', undefined, undefined, cb);
  }

  individualFlows(personSubscriptionId: any, cb: any) {
    this.platform('get', 'flows', personSubscriptionId, undefined, cb);
  }

  authenticateEvent(payload: any, headers: any, cb: any) {
    const hmac = crypto.createHmac('sha256', this.client_secret);
    hmac.update(JSON.stringify(payload));
    const result = hmac.digest('hex');

    if(result === headers.signature) {
      cb(undefined, payload)
    } else {
      cb({
        code: 301,
        signature: headers.signature,
        event: payload,
        error: "UNAUTHORIZED EVENT"
      })
    }
  }
}

export { Zenefits };
