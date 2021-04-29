import PropertiesCaseInsensitive from './propertiesCaseInsensitive.mjs'


let dateToString = function ($) {

    ///date to string with formater
    let getPaddedComp = (comp, len = 2) => {
            if (len < 1) len = 1;
            comp = "" + comp;
            let paddedLen = len - ("" + comp).length;
            if (paddedLen > 0) {
                return [...Array(paddedLen).fill("0"), ...comp].join("");
            } else return comp;
        },
        o = {
            "[y|Y]{4}": (date) => date.getFullYear(), // year
            "[y|Y]{2}": (date) => date.getFullYear().toString().slice(2), // year
            MM: (date) => getPaddedComp(date.getMonth() + 1), //month
            M: (date) => date.getMonth() + 1, //month
            "[d|D]{2}": (date) => getPaddedComp(date.getDate()), //day
            "[d|D]{1}": (date) => date.getDate(), //day
            "h{2}": (date) => getPaddedComp(date.getHours() > 12 ? date.getHours() % 12 : date.getHours()), //hour
            "h{1}": (date) => (date.getHours() > 12 ? date.getHours() % 12 : date.getHours()), //hour
            "H{2}": (date) => getPaddedComp(date.getHours()), //hour
            "H{1}": (date) => date.getHours(), //hour
            "m{2}": (date) => getPaddedComp(date.getMinutes()), //minute
            "m{1}": (date) => date.getMinutes(), //minute
            "s+": (date) => getPaddedComp(date.getSeconds()), //second
            "f+": (date) => getPaddedComp(date.getMilliseconds(), 3), //millisecond,
            "f{1}": (date) => getPaddedComp(date.getMilliseconds(), 0), //millisecond,
            "b+": (date) => (date.getHours() >= 12 ? "PM" : "AM"),
        };
    $.extend(Date.prototype, {
        toString: function (format) {
            let formattedDate = format;
            for (let k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    formattedDate = formattedDate.replace(RegExp.$1, o[k](this));
                }
            }
            return formattedDate;
        },
    });
};
//扩展基本类型方法 array.clean(val), Number.toString(len),String.toFloat, String.toInt,String.startsWtih,String.endsWith, ** String.replaceAll区别育默认的string.replace
let typeToString = function ($) {
    $.extend(Array.prototype, {
        clean: function (deleteValue = "") {
            for (let i = 0; i < this.length; i++) {
                if (this[i] == deleteValue) {
                    this.splice(i, 1);
                    i--;
                }
            }
            return this;
        },
    });
    $.extend(Number.prototype, {
        toString: function (num) {
            if (isNaN(num)) num = 2;
            return this.toFixed(num);
        },
    });
    $.extend(String.prototype, {
        toFloat: function () {
            return parseFloat(this);
        },
        toInt: function () {
            return parseInt(this);
        },
        startsWith: function (str) {
            return this.slice(0, str.length) == str;
        },
        endsWith: function (str) {
            return this.slice(-str.length) == str;
        },
        includes: function (str) {
            return this.indexOf(str) > -1;
        },
        replaceAll: function (search, replacement) {
            let target = this;
            return target.replace(new RegExp(search, "g"), replacement);
        },
    });
};

///extend method parameters of window, get parameter's value with key case-insensitive
let querytoObj = function ($) {

    $.extend(window, {
        parameters: function (url) {
            // get query string from url (optional) or window
            let queryString = url ? url.split("?")[1] : window.location.search.slice(1);
            let cachedkey = "urlparameters" + queryString;
            let obj = $(window).data(cachedkey);
            if (obj == undefined) {
                obj = new Proxy({}, PropertiesCaseInsensitive);
                $(window).data(cachedkey, obj);
            } else return obj;
            // we'll store the parameters here
            // if query string exists
            if (queryString) {
                // stuff after # is not part of query string, so get rid of it
                queryString = queryString.split("#")[0];
                // split our query string into its component parts
                let arr = queryString.split("&");
                for (let i = 0; i < arr.length; i++) {
                    // separate the keys and the values
                    let a = arr[i].split("=");
                    // set parameter name and value (use 'true' if empty)
                    let paramName = a[0];
                    let paramValue = typeof a[1] === "undefined" ? true : a[1];
                    // if the paramName ends with square brackets, e.g. colors[] or colors[2]
                    if (paramName.match(/\[(\d+)?\]$/)) {
                        // create key if it doesn't exist
                        let key = paramName.replace(/\[(\d+)?\]/, "");
                        if (!obj[key]) obj[key] = [];
                        // if it's an indexed array e.g. colors[2]
                        if (paramName.match(/\[\d+\]$/)) {
                            // get the index value and add the entry at the appropriate position
                            let index = /\[(\d+)\]/.exec(paramName)[1];
                            obj[key][index] = paramValue;
                        } else {
                            // otherwise add the value to the end of the array
                            obj[key].push(paramValue);
                        }
                    } else {
                        // we're dealing with a string
                        if (!obj[paramName]) {
                            // if it doesn't exist, create property
                            obj[paramName] = paramValue;
                        } else if (obj[paramName] && typeof obj[paramName] === "string") {
                            // if property does exist and it's a string, convert it to an array
                            obj[paramName] = [obj[paramName]];
                            obj[paramName].push(paramValue);
                        } else {
                            // otherwise add the property
                            obj[paramName].push(paramValue);
                        }
                    }
                }
            }
            return obj;
        },
    });
};
export default function ($) {
    dateToString($);
    typeToString($);
    querytoObj($);
}