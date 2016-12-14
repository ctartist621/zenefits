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
        console.log(url);
        needle.get(url, options, function (err, resp, body) {
            var ret = {};
            if (body.data.data) {
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
    return Zenefits;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Zenefits;
