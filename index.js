"use strict";
var _ = require("lodash");
var needle = require("needle");
var Zenefits = (function () {
    function Zenefits(bearerKey) {
        this.bearerKey = bearerKey;
        this.platformBaseUrl = "https://api.zenefits.com/platform";
        this.coreBaseUrl = "https://api.zenefits.com/core";
    }
    Zenefits.prototype.get = function (type, id, cb) {
        var url = "";
        switch (type) {
            case "companies": {
                url = this.coreBaseUrl + "/" + type + "/";
                break;
            }
            case "people": {
                url = this.coreBaseUrl + "/" + type + "/";
                break;
            }
            case "employments": {
                url = this.coreBaseUrl + "/" + type + "/";
                break;
            }
            default: {
                throw new Error("Request Type not defined");
            }
        }
        if (!_.isUndefined(id)) {
            url += id;
        }
        ;
        var options = {
            headers: {
                Authorization: "Bearer " + this.bearerKey
            }
        };
        needle.get(url, options, function (err, resp, body) {
            var ret = {};
            if (err) {
                cb(err);
            }
            else if (body.data.data) {
                ret = body.data.data;
            }
            else if (body.data) {
                ret = body.data;
            }
            cb(err, ret);
        });
    };
    Zenefits.prototype.singleReturn = function (error, response, cb) {
        if (error) {
            cb(error);
        }
        else {
            cb(error, _.head(response));
        }
    };
    Zenefits.prototype.companies = function (cb) {
        this.get("companies", undefined, cb);
    };
    Zenefits.prototype.company = function (companyId, cb) {
        this.get("companies", companyId, cb);
    };
    Zenefits.prototype.people = function (cb) {
        this.get("people", undefined, cb);
    };
    Zenefits.prototype.person = function (personId, cb) {
        this.get("people", personId, cb);
    };
    Zenefits.prototype.employments = function (cb) {
        this.get("employments", undefined, cb);
    };
    Zenefits.prototype.employment = function (employmentId, cb) {
        this.get("employments", employmentId, cb);
    };
    return Zenefits;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Zenefits;
