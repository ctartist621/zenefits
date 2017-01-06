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
  autoPagination: boolean;

  constructor(opts: any) {
    this.access_token = opts.access_token;
    this.refresh_token = opts.refresh_token;
    this.client_id = opts.client_id;
    this.client_secret = opts.client_secret;
    this.credentialsRefreshed = false;
    this.autoPagination = false;
    this.platformBaseUrl = "https://api.zenefits.com/platform";
    this.coreBaseUrl = "https://api.zenefits.com/core";
  }

  _request(method: string, url: string, data: any, singleton: boolean, cb: any, pageCB?: any) {
    let options = {
      headers: {
        Authorization: `Bearer ${this.access_token}`,
        "Content-Type": "application/json"
      },
      json: method === "post" ? true : false
    };

    if (method === "post") {
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
      needle.post("https://secure.zenefits.com/oauth2/token/", `grant_type=refresh_token&refresh_token=${this.refresh_token}&client_id=${this.client_id}&client_secret=${this.client_secret}`, {}, (err, resp, body) => {
        if (err || body.error) {
          cb(err || body.error)
        } else {
          this.access_token = body.access_token;
          this.refresh_token = body.refresh_token;
          this.credentialsRefreshed = true;
          this._request(method, url, data, singleton, cb, pageCB);
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
        data: singleton ? _.head(collector) : collector,
        next_url: body.data.next_url
      };
      cb(undefined, ret)
    }

    const handlePage = (body: any, cb: any) => {
      let ret = {
        credentials: {
          access_token: this.access_token,
          refresh_token: this.refresh_token,
          credentialsRefreshed: this.credentialsRefreshed
        },
        data: singleton ? _.head(body.data.data ? body.data.data : body.data) : body.data.data ? body.data.data : body.data,
        next_url: body.data.next_url
      };
      cb(undefined, ret)
    }

    const _req = () => {
      needle.request(method, url, data, options, (err: any, resp: any, body: any) => {
        if (resp && resp.statusCode === 401) {
          renewToken();
        } else if (resp && resp.statusCode >= 400) {
          handleError(err, resp, body, cb)
        } else if (body && body.data) {
          collector = _.concat(collector, body.data.data ? body.data.data : body.data);
          if (pageCB) {
            handlePage(body, pageCB)
          }

          if (this.autoPagination && body.data.next_url) {
            url = body.data.next_url
            _req();
          } else {
            handleData(body, cb)
          }
        } else if (resp && resp.statusCode === 204) {
          handleData({ data: {} }, cb)
        } else {
          handleError(err, resp, body, cb)
        }
      });
    }

    let collector: any[] = [];
    _req();
  }

  core(type: string, id: string, singleton: boolean, cb: any, pageCB?: any) {
    let url = `${this.coreBaseUrl}/${type}/`;

    if (!_.isUndefined(id)) {
      url += id;
    };

    this._request("get", url, undefined, singleton, cb, pageCB)
  }

  platform(method: string, type: string, id: string, data: any, singleton: boolean, cb: any, pageCB?: any) {
    let url = `${this.platformBaseUrl}/${type}/`;
    switch (type) {
      case "company_field_changes":
      url = `${this.platformBaseUrl}/company_installs/${id}/fields_changes/`;
      break;

      case "installationStatus":
      url = `${this.platformBaseUrl}/company_installs/${id}/status_changes/`;
      break;
      case "flows":
      if (id) {
        url = `${this.platformBaseUrl}/person_subscriptions/${id}/flows/`;
      }
      break;
      default:
      if (!_.isUndefined(id)) {
        url += id;
      };
      break;
    }
    this._request(method, url, data, singleton, cb, pageCB);
  }

  companies(cb: any, pageCB?: any) {
    this.core("companies", undefined, false, cb, pageCB);
  }

  company(companyId: string, cb: any, pageCB?: any) {
    this.core("companies", companyId, true, cb, pageCB);
  }

  people(cb: any, pageCB?: any) {
    this.core("people", undefined, false, cb, pageCB);
  }

  person(personId: string, cb: any, pageCB?: any) {
    this.core("people", personId, true, cb, pageCB);
  }

  employments(cb: any, pageCB?: any) {
    this.core("employments", undefined, false, cb, pageCB);
  }

  employment(employmentId: string, cb: any, pageCB?: any) {
    this.core("employments", employmentId, true, cb, pageCB);
  }

  companyBankAccounts(cb: any, pageCB?: any) {
    this.core("company_banks", undefined, false, cb, pageCB);
  }

  companyBankAccount(accountId: string, cb: any, pageCB?: any) {
    this.core("company_banks", accountId, true, cb, pageCB);
  }

  employeeBankAccounts(cb: any, pageCB?: any) {
    this.core("banks", undefined, false, cb, pageCB);
  }

  employeeBankAccount(accountId: string, cb: any, pageCB?: any) {
    this.core("banks", accountId, true, cb, pageCB);
  }

  departments(cb: any, pageCB?: any) {
    this.core("departments", undefined, false, cb, pageCB);
  }

  department(deptId: string, cb: any, pageCB?: any) {
    this.core("departments", deptId, true, cb, pageCB);
  }

  locations(cb: any, pageCB?: any) {
    this.core("locations", undefined, false, cb, pageCB);
  }

  location(locId: string, cb: any, pageCB?: any) {
    this.core("locations", locId, true, cb, pageCB);
  }

  currentAuthorizedUser(cb: any, pageCB?: any) {
    this.core("me", undefined, true, cb, pageCB)
  }

  applications(cb: any, pageCB?: any) {
    this.platform("get", "applications", undefined, undefined, false, cb, pageCB);
  }

  application(applicationId: string, cb: any, pageCB?: any) {
    this.platform("get", "applications", applicationId, undefined, true, cb, pageCB);
  }

  setInstallationCustomFields(fields: any, cb: any, pageCB?: any) {
    console.log(this.installId)
    if (this.installId) {
      this.platform("post", "company_field_changes", this.installId, fields, false, cb, pageCB);
    } else {
      this.installations((err: any, installations: any) => {
        if (err) {
          cb(err);
        } else {
          console.log(installations)
          this.installId = (<ZenefitsPlatform.Installation>_.head(installations.data)).id;
          this.platform("post", "company_field_changes", this.installId, fields, false, cb, pageCB);
        }
      });
    }
  }

  installations(cb: any, pageCB?: any) {
    this.platform("get", "company_installs", undefined, undefined, false, cb, pageCB);
  }

  installation(installId: string, cb: any, pageCB?: any) {
    this.platform("get", "company_installs", installId, undefined, true, cb, pageCB);
  }

  personSubscriptions(cb: any, pageCB?: any) {
    this.platform("get", "person_subscriptions", undefined, undefined, false, cb, pageCB);
  }

  personSubscription(subscriptionId: string, cb: any, pageCB?: any) {
    this.platform("get", "person_subscriptions", subscriptionId, undefined, true, cb, pageCB);
  }

  setInstallationStatusOk(cb: any, pageCB?: any) {
    if (this.installId) {
      this.platform("post", "installationStatus", this.installId, { status: "ok" }, false, cb, pageCB);
    } else {
      this.installations((err: any, installations: any) => {
        if (err) {
          cb(err);
        } else {
          this.installId = (<ZenefitsPlatform.Installation>_.head(installations.data)).id;
          this.platform("post", "installationStatus", this.installId, { status: "ok" }, false, cb, pageCB);
        }
      });
    }
  }

  setInstallationStatusNotEnrolled(cb: any, pageCB?: any) {
    if (this.installId) {
      this.platform("post", "installationStatus", this.installId, { status: "not_enrolled" }, false, cb, pageCB);
    } else {
      this.installations((err: any, installations: any) => {
        if (err) {
          cb(err);
        } else {
          this.installId = (<ZenefitsPlatform.Installation>_.head(installations.data)).id;
          this.platform("post", "installationStatus", this.installId, { status: "not_enrolled" }, false, cb, pageCB);
        }
      });
    }
  }

  allFlows(cb: any, pageCB?: any) {
    this.platform("get", "flows", undefined, undefined, false, cb, pageCB);
  }

  individualFlows(personSubscriptionId: any, cb: any, pageCB?: any) {
    this.platform("get", "flows", personSubscriptionId, undefined, false, cb, pageCB);
  }

  authenticateEvent(payload: any, headers: any, cb: any, pageCB?: any) {
    const hmac = crypto.createHmac("sha256", this.client_secret);
    hmac.update(JSON.stringify(payload));
    const result = hmac.digest("hex");

    if (result === headers.signature) {
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
