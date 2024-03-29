function AstroMath() {}

function Projection(t, e) {
    this.PROJECTION = Projection.PROJ_TAN, this.ROT = this.tr_oR(t, e)
}

function Coo(t, e, i) {
    this.lon = t, this.lat = e, this.prec = i, this.frame = null, this.computeDirCos()
}

function Tokenizer(t, e) {
    this.string = Strings.trim(t, e), this.sep = e, this.pos = 0
}

function Strings() {}

function Numbers() {}

function relMouseCoords(t) {
    if (t.offsetX) return {
        x: t.offsetX,
        y: t.offsetY
    };
    if (!Utils.cssScale) {
        var e = window.getComputedStyle(document.body, null),
            i = e.getPropertyValue("-webkit-transform") || e.getPropertyValue("-moz-transform") || e.getPropertyValue("-ms-transform") || e.getPropertyValue("-o-transform") || e.getPropertyValue("transform"),
            r = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/,
            o = i.match(r);
        Utils.cssScale = o ? parseFloat(o[1]) : 1
    }
    var s = t;
    s.target;
    var a = s.target || s.srcElement,
        n = a.currentStyle || window.getComputedStyle(a, null),
        h = parseInt(n.borderLeftWidth, 10),
        l = parseInt(n.borderTopWidth, 10),
        c = a.getBoundingClientRect(),
        u = s.clientX - h - c.left,
        d = s.clientY - l - c.top;
    return {
        x: parseInt(u / Utils.cssScale),
        y: parseInt(d / Utils.cssScale)
    }
}
var cds = cds || {}, A = A || {};
"object" != typeof JSON && (JSON = {}),
function() {
    "use strict";

    function f(t) {
        return 10 > t ? "0" + t : t
    }

    function quote(t) {
        return escapable.lastIndex = 0, escapable.test(t) ? '"' + t.replace(escapable, function(t) {
            var e = meta[t];
            return "string" == typeof e ? e : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + t + '"'
    }

    function str(t, e) {
        var i, r, o, s, a, n = gap,
            h = e[t];
        switch (h && "object" == typeof h && "function" == typeof h.toJSON && (h = h.toJSON(t)), "function" == typeof rep && (h = rep.call(e, t, h)), typeof h) {
            case "string":
                return quote(h);
            case "number":
                return isFinite(h) ? h + "" : "null";
            case "boolean":
            case "null":
                return h + "";
            case "object":
                if (!h) return "null";
                if (gap += indent, a = [], "[object Array]" === Object.prototype.toString.apply(h)) {
                    for (s = h.length, i = 0; s > i; i += 1) a[i] = str(i, h) || "null";
                    return o = 0 === a.length ? "[]" : gap ? "[\n" + gap + a.join(",\n" + gap) + "\n" + n + "]" : "[" + a.join(",") + "]", gap = n, o
                }
                if (rep && "object" == typeof rep)
                    for (s = rep.length, i = 0; s > i; i += 1) "string" == typeof rep[i] && (r = rep[i], o = str(r, h), o && a.push(quote(r) + (gap ? ": " : ":") + o));
                else
                    for (r in h) Object.prototype.hasOwnProperty.call(h, r) && (o = str(r, h), o && a.push(quote(r) + (gap ? ": " : ":") + o));
                return o = 0 === a.length ? "{}" : gap ? "{\n" + gap + a.join(",\n" + gap) + "\n" + n + "}" : "{" + a.join(",") + "}", gap = n, o
        }
    }
    "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function() {
        return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
    }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function() {
        return this.valueOf()
    });
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            "\b": "\\b",
            "	": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        }, rep;
    "function" != typeof JSON.stringify && (JSON.stringify = function(t, e, i) {
        var r;
        if (gap = "", indent = "", "number" == typeof i)
            for (r = 0; i > r; r += 1) indent += " ";
        else "string" == typeof i && (indent = i); if (rep = e, e && "function" != typeof e && ("object" != typeof e || "number" != typeof e.length)) throw Error("JSON.stringify");
        return str("", {
            "": t
        })
    }), "function" != typeof JSON.parse && (JSON.parse = function(text, reviver) {
        function walk(t, e) {
            var i, r, o = t[e];
            if (o && "object" == typeof o)
                for (i in o) Object.prototype.hasOwnProperty.call(o, i) && (r = walk(o, i), void 0 !== r ? o[i] = r : delete o[i]);
            return reviver.call(t, e, o)
        }
        var j;
        if (text += "", cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, function(t) {
            return "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
        })), /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({
            "": j
        }, "") : j;
        throw new SyntaxError("JSON.parse")
    })
}(), Logger = {}, Logger.log = function(t, e) {
    try {
        var i = "http://alasky.u-strasbg.fr/cgi/AladinLiteLogger/log.py",
            r = "";
        e && (r = JSON.stringify(e)), $.ajax({
            url: i,
            data: {
                action: t,
                params: r,
                pageUrl: window.location.href,
                referer: document.referrer ? document.referrer : ""
            },
            method: "GET",
            dataType: "json"
        })
    } catch (o) {
        window.console && console.log("Exception: " + o)
    }
},
function(t) {
    "function" == typeof define && define.amd ? define(["jquery"], t) : "object" == typeof exports ? module.exports = t : t(jQuery)
}(function(t) {
    function e(e) {
        var a = e || window.event,
            n = h.call(arguments, 1),
            l = 0,
            u = 0,
            d = 0,
            p = 0,
            f = 0,
            g = 0;
        if (e = t.event.fix(a), e.type = "mousewheel", "detail" in a && (d = -1 * a.detail), "wheelDelta" in a && (d = a.wheelDelta), "wheelDeltaY" in a && (d = a.wheelDeltaY), "wheelDeltaX" in a && (u = -1 * a.wheelDeltaX), "axis" in a && a.axis === a.HORIZONTAL_AXIS && (u = -1 * d, d = 0), l = 0 === d ? u : d, "deltaY" in a && (d = -1 * a.deltaY, l = d), "deltaX" in a && (u = a.deltaX, 0 === d && (l = -1 * u)), 0 !== d || 0 !== u) {
            if (1 === a.deltaMode) {
                var v = t.data(this, "mousewheel-line-height");
                l *= v, d *= v, u *= v
            } else if (2 === a.deltaMode) {
                var m = t.data(this, "mousewheel-page-height");
                l *= m, d *= m, u *= m
            }
            if (p = Math.max(Math.abs(d), Math.abs(u)), (!s || s > p) && (s = p, r(a, p) && (s /= 40)), r(a, p) && (l /= 40, u /= 40, d /= 40), l = Math[l >= 1 ? "floor" : "ceil"](l / s), u = Math[u >= 1 ? "floor" : "ceil"](u / s), d = Math[d >= 1 ? "floor" : "ceil"](d / s), c.settings.normalizeOffset && this.getBoundingClientRect) {
                var y = this.getBoundingClientRect();
                f = e.clientX - y.left, g = e.clientY - y.top
            }
            return e.deltaX = u, e.deltaY = d, e.deltaFactor = s, e.offsetX = f, e.offsetY = g, e.deltaMode = 0, n.unshift(e, l, u, d), o && clearTimeout(o), o = setTimeout(i, 200), (t.event.dispatch || t.event.handle).apply(this, n)
        }
    }

    function i() {
        s = null
    }

    function r(t, e) {
        return c.settings.adjustOldDeltas && "mousewheel" === t.type && 0 === e % 120
    }
    var o, s, a = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
        n = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
        h = Array.prototype.slice;
    if (t.event.fixHooks)
        for (var l = a.length; l;) t.event.fixHooks[a[--l]] = t.event.mouseHooks;
    var c = t.event.special.mousewheel = {
        version: "3.1.12",
        setup: function() {
            if (this.addEventListener)
                for (var i = n.length; i;) this.addEventListener(n[--i], e, !1);
            else this.onmousewheel = e;
            t.data(this, "mousewheel-line-height", c.getLineHeight(this)), t.data(this, "mousewheel-page-height", c.getPageHeight(this))
        },
        teardown: function() {
            if (this.removeEventListener)
                for (var i = n.length; i;) this.removeEventListener(n[--i], e, !1);
            else this.onmousewheel = null;
            t.removeData(this, "mousewheel-line-height"), t.removeData(this, "mousewheel-page-height")
        },
        getLineHeight: function(e) {
            var i = t(e),
                r = i["offsetParent" in t.fn ? "offsetParent" : "parent"]();
            return r.length || (r = t("body")), parseInt(r.css("fontSize"), 10) || parseInt(i.css("fontSize"), 10) || 16
        },
        getPageHeight: function(e) {
            return t(e).height()
        },
        settings: {
            adjustOldDeltas: !0,
            normalizeOffset: !0
        }
    };
    t.fn.extend({
        mousewheel: function(t) {
            return t ? this.bind("mousewheel", t) : this.trigger("mousewheel")
        },
        unmousewheel: function(t) {
            return this.unbind("mousewheel", t)
        }
    })
}), window.requestAnimFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(t) {
        window.setTimeout(t, 1e3 / 60)
    }
}();
var Stats = function() {
    function t(t, e, i) {
        var r, o, s;
        for (o = 0; 30 > o; o++)
            for (r = 0; 73 > r; r++) s = 4 * (r + 74 * o), t[s] = t[s + 4], t[s + 1] = t[s + 5], t[s + 2] = t[s + 6];
        for (o = 0; 30 > o; o++) s = 4 * (73 + 74 * o), e > o ? (t[s] = P[i].bg.r, t[s + 1] = P[i].bg.g, t[s + 2] = P[i].bg.b) : (t[s] = P[i].fg.r, t[s + 1] = P[i].fg.g, t[s + 2] = P[i].fg.b)
    }
    var e, i, r, o, s, a, n, h, l, c, u, d, p, f, g = 0,
        v = 2,
        m = 0,
        y = (new Date).getTime(),
        w = y,
        C = y,
        S = 0,
        x = 1e3,
        M = 0,
        b = 0,
        T = 1e3,
        I = 0,
        A = 0,
        R = 1e3,
        O = 0,
        P = {
            fps: {
                bg: {
                    r: 16,
                    g: 16,
                    b: 48
                },
                fg: {
                    r: 0,
                    g: 255,
                    b: 255
                }
            },
            ms: {
                bg: {
                    r: 16,
                    g: 48,
                    b: 16
                },
                fg: {
                    r: 0,
                    g: 255,
                    b: 0
                }
            },
            mb: {
                bg: {
                    r: 48,
                    g: 16,
                    b: 26
                },
                fg: {
                    r: 255,
                    g: 0,
                    b: 128
                }
            }
        };
    e = document.createElement("div"), e.style.cursor = "pointer", e.style.width = "80px", e.style.opacity = "0.9", e.style.zIndex = "10001", e.addEventListener("click", function() {
        switch (g++, g == v && (g = 0), i.style.display = "none", n.style.display = "none", u.style.display = "none", g) {
            case 0:
                i.style.display = "block";
                break;
            case 1:
                n.style.display = "block";
                break;
            case 2:
                u.style.display = "block"
        }
    }, !1), i = document.createElement("div"), i.style.backgroundColor = "rgb(" + Math.floor(P.fps.bg.r / 2) + "," + Math.floor(P.fps.bg.g / 2) + "," + Math.floor(P.fps.bg.b / 2) + ")", i.style.padding = "2px 0px 3px 0px", e.appendChild(i), r = document.createElement("div"), r.style.fontFamily = "Helvetica, Arial, sans-serif", r.style.textAlign = "left", r.style.fontSize = "9px", r.style.color = "rgb(" + P.fps.fg.r + "," + P.fps.fg.g + "," + P.fps.fg.b + ")", r.style.margin = "0px 0px 1px 3px", r.innerHTML = '<span style="font-weight:bold">FPS</span>', i.appendChild(r), o = document.createElement("canvas"), o.width = 74, o.height = 30, o.style.display = "block", o.style.marginLeft = "3px", i.appendChild(o), s = o.getContext("2d"), s.fillStyle = "rgb(" + P.fps.bg.r + "," + P.fps.bg.g + "," + P.fps.bg.b + ")", s.fillRect(0, 0, o.width, o.height), a = s.getImageData(0, 0, o.width, o.height), n = document.createElement("div"), n.style.backgroundColor = "rgb(" + Math.floor(P.ms.bg.r / 2) + "," + Math.floor(P.ms.bg.g / 2) + "," + Math.floor(P.ms.bg.b / 2) + ")", n.style.padding = "2px 0px 3px 0px", n.style.display = "none", e.appendChild(n), h = document.createElement("div"), h.style.fontFamily = "Helvetica, Arial, sans-serif", h.style.textAlign = "left", h.style.fontSize = "9px", h.style.color = "rgb(" + P.ms.fg.r + "," + P.ms.fg.g + "," + P.ms.fg.b + ")", h.style.margin = "0px 0px 1px 3px", h.innerHTML = '<span style="font-weight:bold">MS</span>', n.appendChild(h), o = document.createElement("canvas"), o.width = 74, o.height = 30, o.style.display = "block", o.style.marginLeft = "3px", n.appendChild(o), l = o.getContext("2d"), l.fillStyle = "rgb(" + P.ms.bg.r + "," + P.ms.bg.g + "," + P.ms.bg.b + ")", l.fillRect(0, 0, o.width, o.height), c = l.getImageData(0, 0, o.width, o.height);
    try {
        performance && performance.memory && performance.memory.totalJSHeapSize && (v = 3)
    } catch (E) {}
    return u = document.createElement("div"), u.style.backgroundColor = "rgb(" + Math.floor(P.mb.bg.r / 2) + "," + Math.floor(P.mb.bg.g / 2) + "," + Math.floor(P.mb.bg.b / 2) + ")", u.style.padding = "2px 0px 3px 0px", u.style.display = "none", e.appendChild(u), d = document.createElement("div"), d.style.fontFamily = "Helvetica, Arial, sans-serif", d.style.textAlign = "left", d.style.fontSize = "9px", d.style.color = "rgb(" + P.mb.fg.r + "," + P.mb.fg.g + "," + P.mb.fg.b + ")", d.style.margin = "0px 0px 1px 3px", d.innerHTML = '<span style="font-weight:bold">MB</span>', u.appendChild(d), o = document.createElement("canvas"), o.width = 74, o.height = 30, o.style.display = "block", o.style.marginLeft = "3px", u.appendChild(o), p = o.getContext("2d"), p.fillStyle = "#301010", p.fillRect(0, 0, o.width, o.height), f = p.getImageData(0, 0, o.width, o.height), {
        domElement: e,
        update: function() {
            m++, y = (new Date).getTime(), b = y - w, T = Math.min(T, b), I = Math.max(I, b), t(c.data, Math.min(30, 30 - 30 * (b / 200)), "ms"), h.innerHTML = '<span style="font-weight:bold">' + b + " MS</span> (" + T + "-" + I + ")", l.putImageData(c, 0, 0), w = y, y > C + 1e3 && (S = Math.round(1e3 * m / (y - C)), x = Math.min(x, S), M = Math.max(M, S), t(a.data, Math.min(30, 30 - 30 * (S / 100)), "fps"), r.innerHTML = '<span style="font-weight:bold">' + S + " FPS</span> (" + x + "-" + M + ")", s.putImageData(a, 0, 0), 3 == v && (A = 9.54e-7 * performance.memory.usedJSHeapSize, R = Math.min(R, A), O = Math.max(O, A), t(f.data, Math.min(30, 30 - A / 2), "mb"), d.innerHTML = '<span style="font-weight:bold">' + Math.round(A) + " MB</span> (" + Math.round(R) + "-" + Math.round(O) + ")", p.putImageData(f, 0, 0)), C = y, m = 0)
        }
    }
};
Constants = {}, Constants.PI = Math.PI, Constants.C_PR = Math.PI / 180, Constants.VLEV = 2, Constants.EPS = 1e-7, Constants.c = .105, Constants.LN10 = Math.log(10), Constants.PIOVER2 = Math.PI / 2, Constants.TWOPI = 2 * Math.PI, Constants.TWOTHIRD = 2 / 3, Constants.ARCSECOND_RADIAN = 484813681109536e-20, SpatialVector = function() {
    function t(t, e, i) {
        "use strict";
        this.x = t, this.y = e, this.z = i, this.ra_ = 0, this.dec_ = 0, this.okRaDec_ = !1
    }
    return t.prototype.setXYZ = function(t, e, i) {
        this.x = t, this.y = e, this.z = i, this.okRaDec_ = !1
    }, t.prototype.length = function() {
        "use strict";
        return Math.sqrt(this.lengthSquared())
    }, t.prototype.lengthSquared = function() {
        "use strict";
        return this.x * this.x + this.y * this.y + this.z * this.z
    }, t.prototype.normalized = function() {
        "use strict";
        var t = this.length();
        this.x /= t, this.y /= t, this.z /= t
    }, t.prototype.set = function(t, e) {
        "use strict";
        this.ra_ = t, this.dec_ = e, this.okRaDec_ = !0, this.updateXYZ()
    }, t.prototype.angle = function(t) {
        "use strict";
        var e = this.y * t.z - this.z * t.y,
            i = this.z * t.x - this.x * t.z,
            r = this.x * t.y - this.y * t.x,
            o = Math.sqrt(e * e + i * i + r * r);
        return Math.abs(Math.atan2(o, dot(t)))
    }, t.prototype.get = function() {
        "use strict";
        return [x, y, z]
    }, t.prototype.toString = function() {
        "use strict";
        return "SpatialVector[" + this.x + ", " + this.y + ", " + this.z + "]"
    }, t.prototype.cross = function(e) {
        "use strict";
        return new t(this.y * e.z - e.y * this.z, this.z * e.x - e.z * this.x, this.x * e.y - e.x() * this.y)
    }, t.prototype.equal = function(t) {
        "use strict";
        return this.x == t.x && this.y == t.y && this.z == t.z() ? !0 : !1
    }, t.prototype.mult = function(e) {
        "use strict";
        return new t(e * this.x, e * this.y, e * this.z)
    }, t.prototype.dot = function(t) {
        "use strict";
        return this.x * t.x + this.y * t.y + this.z * t.z
    }, t.prototype.add = function(e) {
        "use strict";
        return new t(this.x + e.x, this.y + e.y, this.z + e.z)
    }, t.prototype.sub = function(e) {
        "use strict";
        return new t(this.x - e.x, this.y - e.y, this.z - e.z)
    }, t.prototype.dec = function() {
        "use strict";
        return this.okRaDec_ || (this.normalized(), this.updateRaDec()), this.dec_
    }, t.prototype.ra = function() {
        "use strict";
        return this.okRaDec_ || (this.normalized(), this.updateRaDec()), this.ra_
    }, t.prototype.updateXYZ = function() {
        "use strict";
        var t = Math.cos(this.dec_ * Constants.C_PR);
        this.x = Math.cos(this.ra_ * Constants.C_PR) * t, this.y = Math.sin(this.ra_ * Constants.C_PR) * t, this.z = Math.sin(this.dec_ * Constants.C_PR)
    }, t.prototype.updateRaDec = function() {
        "use strict";
        this.dec_ = Math.asin(this.z) / Constants.C_PR;
        var t = Math.cos(this.dec_ * Constants.C_PR);
        this.ra_ = t > Constants.EPS || -Constants.EPS > t ? this.y > Constants.EPS || this.y < -Constants.EPS ? 0 > this.y ? 360 - Math.acos(this.x / t) / Constants.C_PR : Math.acos(this.x / t) / Constants.C_PR : 0 > this.x ? 180 : 0 : 0, this.okRaDec_ = !0
    }, t.prototype.toRaRadians = function() {
        "use strict";
        var t = 0;
        return (0 != this.x || 0 != this.y) && (t = Math.atan2(this.y, this.x)), 0 > t && (t += 2 * Math.PI), t
    }, t.prototype.toDeRadians = function() {
        var t = z / this.length(),
            e = Math.acos(t);
        return Math.PI / 2 - e
    }, t
}(), AngularPosition = function() {
    return AngularPosition = function(t, e) {
        "use strict";
        this.theta = t, this.phi = e
    }, AngularPosition.prototype.toString = function() {
        "use strict";
        return "theta: " + this.theta + ", phi: " + this.phi
    }, AngularPosition
}(), LongRangeSetBuilder = function() {
    function t() {
        this.items = []
    }
    return t.prototype.appendRange = function(t, e) {
        for (var i = t; e >= i; i++) i in this.items || this.items.push(i)
    }, t
}(), HealpixIndex = function() {
    function t(t) {
        "use strict";
        this.nside = t
    }
    return t.NS_MAX = 8192, t.ORDER_MAX = 13, t.NSIDELIST = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192], t.JRLL = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4], t.JPLL = [1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7], t.XOFFSET = [-1, -1, 0, 1, 1, 1, 0, -1], t.YOFFSET = [0, 1, 1, 1, 0, -1, -1, -1], t.FACEARRAY = [
        [8, 9, 10, 11, -1, -1, -1, -1, 10, 11, 8, 9],
        [5, 6, 7, 4, 8, 9, 10, 11, 9, 10, 11, 8],
        [-1, -1, -1, -1, 5, 6, 7, 4, -1, -1, -1, -1],
        [4, 5, 6, 7, 11, 8, 9, 10, 11, 8, 9, 10],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        [1, 2, 3, 0, 0, 1, 2, 3, 5, 6, 7, 4],
        [-1, -1, -1, -1, 7, 4, 5, 6, -1, -1, -1, -1],
        [3, 0, 1, 2, 3, 0, 1, 2, 4, 5, 6, 7],
        [2, 3, 0, 1, -1, -1, -1, -1, 0, 1, 2, 3]
    ], t.SWAPARRAY = [
        [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0]
    ], t.Z0 = Constants.TWOTHIRD, t.prototype.init = function() {
        "use strict";
        var e = 256;
        this.ctab = Array(e), this.utab = Array(e);
        for (var i = 0; 256 > i; ++i) this.ctab[i] = 1 & i | (2 & i) << 7 | (4 & i) >> 1 | (8 & i) << 6 | (16 & i) >> 2 | (32 & i) << 5 | (64 & i) >> 3 | (128 & i) << 4, this.utab[i] = 1 & i | (2 & i) << 1 | (4 & i) << 2 | (8 & i) << 3 | (16 & i) << 4 | (32 & i) << 5 | (64 & i) << 6 | (128 & i) << 7;
        this.nl2 = 2 * this.nside, this.nl3 = 3 * this.nside, this.nl4 = 4 * this.nside, this.npface = this.nside * this.nside, this.ncap = 2 * this.nside * (this.nside - 1), this.npix = 12 * this.npface, this.fact2 = 4 / this.npix, this.fact1 = (this.nside << 1) * this.fact2, this.order = t.nside2order(this.nside)
    }, t.calculateNSide = function(e) {
        for (var i = 0, r = e * e, o = 180 / Constants.PI, s = 5184e4 * Constants.PI * o * o, a = Utils.castToInt(s / r), n = a / 12, h = Math.sqrt(n), l = t.NS_MAX, c = 0, u = 0; t.NSIDELIST.length > u; u++)
            if (l >= Math.abs(h - t.NSIDELIST[u]) && (l = Math.abs(h - t.NSIDELIST[u]), i = t.NSIDELIST[u], c = u), h > i && t.NS_MAX > h && (i = t.NSIDELIST[c + 1]), h > t.NS_MAX) return console.log("nside cannot be bigger than " + t.NS_MAX), t.NS_MAX;
        return i
    }, t.nside2order = function(e) {
        "use strict";
        return (e & e - 1) > 0 ? -1 : Utils.castToInt(t.log2(e))
    }, t.log2 = function(t) {
        "use strict";
        return Math.log(t) / Math.log(2)
    }, t.prototype.ang2pix_nest = function(e, i) {
        "use strict";
        var r, o, s, a, n, h, l, c, u, d, p, f, g;
        if (i >= Constants.TWOPI && (i -= Constants.TWOPI), 0 > i && (i += Constants.TWOPI), e > Constants.PI || 0 > e) throw {
            name: "Illegal argument",
            message: "theta must be between 0 and " + Constants.PI
        };
        if (i > Constants.TWOPI || 0 > i) throw {
            name: "Illegal argument",
            message: "phi must be between 0 and " + Constants.TWOPI
        };
        if (o = Math.cos(e), s = Math.abs(o), a = i / Constants.PIOVER2, t.Z0 >= s) {
            var v = this.nside * (.5 + a),
                m = .75 * this.nside * o,
                c = v - m,
                u = v + m;
            h = c >> this.order, l = u >> this.order, p = h == l ? 4 == h ? 4 : h + 4 : l > h ? h : l + 8, f = Utils.castToInt(u & this.nside - 1), g = Utils.castToInt(this.nside - (c & this.nside - 1) - 1)
        } else {
            d = Utils.castToInt(a), d >= 4 && (d = 3), n = a - d;
            var y = this.nside * Math.sqrt(3 * (1 - s));
            c = Utils.castToInt(n * y), u = Utils.castToInt((1 - n) * y), c = Math.min(t.NS_MAX - 1, c), u = Math.min(t.NS_MAX - 1, u), o >= 0 ? (p = d, f = Utils.castToInt(this.nside - u - 1), g = Utils.castToInt(this.nside - c - 1)) : (p = d + 8, f = c, g = u)
        }
        return r = this.xyf2nest(f, g, p)
    }, t.prototype.xyf2nest = function(t, e, i) {
        "use strict";
        return (i << 2 * this.order) + (this.utab[255 & t] | this.utab[255 & t >> 8] << 16 | this.utab[255 & t >> 16] << 32 | this.utab[255 & t >> 24] << 48 | this.utab[255 & e] << 1 | this.utab[255 & e >> 8] << 17 | this.utab[255 & e >> 16] << 33 | this.utab[255 & e >> 24] << 49)
    }, t.prototype.nest2xyf = function(t) {
        "use strict";
        var e = {};
        e.face_num = t >> 2 * this.order;
        var i = t & this.npface - 1,
            r = (93823560581120 & i) >> 16 | (614882086624428e4 & i) >> 31 | 21845 & i | (1431633920 & i) >> 15;
        return e.ix = this.ctab[255 & r] | this.ctab[255 & r >> 8] << 4 | this.ctab[255 & r >> 16] << 16 | this.ctab[255 & r >> 24] << 20, i >>= 1, r = (93823560581120 & i) >> 16 | (614882086624428e4 & i) >> 31 | 21845 & i | (1431633920 & i) >> 15, e.iy = this.ctab[255 & r] | this.ctab[255 & r >> 8] << 4 | this.ctab[255 & r >> 16] << 16 | this.ctab[255 & r >> 24] << 20, e
    }, t.prototype.pix2ang_nest = function(e) {
        "use strict";
        if (0 > e || e > this.npix - 1) throw {
            name: "Illegal argument",
            message: "ipix out of range"
        };
        var i, r, o, s = this.nest2xyf(e),
            a = s.ix,
            n = s.iy,
            h = s.face_num,
            l = (t.JRLL[h] << this.order) - a - n - 1;
        this.nside > l ? (i = l, r = 1 - i * i * this.fact2, o = 0) : l > this.nl3 ? (i = this.nl4 - l, r = i * i * this.fact2 - 1, o = 0) : (i = this.nside, r = (this.nl2 - l) * this.fact1, o = 1 & l - this.nside);
        var c = Math.acos(r),
            u = (t.JPLL[h] * i + a - n + 1 + o) / 2;
        u > this.nl4 && (u -= this.nl4), 1 > u && (u += this.nl4);
        var d = (u - .5 * (o + 1)) * (Constants.PIOVER2 / i);
        return {
            theta: c,
            phi: d
        }
    }, t.nside2Npix = function(e) {
        "use strict";
        if (0 > e || (e & -e) != e || e > t.NS_MAX) throw {
            name: "Illegal argument",
            message: "nside should be >0, power of 2, <" + t.NS_MAX
        };
        var i = 12 * e * e;
        return i
    }, t.prototype.xyf2ring = function(e, i, r) {
        "use strict";
        var o, s, a, n = t.JRLL[r] * this.nside - e - i - 1;
        this.nside > n ? (o = n, a = 2 * o * (o - 1), s = 0) : n > 3 * this.nside ? (o = this.nl4 - n, a = this.npix - 2 * (o + 1) * o, s = 0) : (o = this.nside, a = this.ncap + (n - this.nside) * this.nl4, s = 1 & n - this.nside);
        var h = (t.JPLL[r] * o + e - i + 1 + s) / 2;
        return h > this.nl4 ? h -= this.nl4 : 1 > h && (h += this.nl4), a + h - 1
    }, t.prototype.nest2ring = function(t) {
        "use strict";
        var e = this.nest2xyf(t),
            i = this.xyf2ring(e.ix, e.iy, e.face_num);
        return i
    }, t.prototype.corners_nest = function(t, e) {
        "use strict";
        var i = this.nest2ring(t);
        return this.corners_ring(i, e)
    }, t.prototype.pix2ang_ring = function(t) {
        "use strict";
        var e, i, r, o, s, a, n, h, l;
        if (0 > t || t > this.npix - 1) throw {
            name: "Illegal argument",
            message: "ipix out of range"
        };
        return a = t + 1, this.ncap >= a ? (h = a / 2, l = Utils.castToInt(h), r = Utils.castToInt(Math.sqrt(h - Math.sqrt(l))) + 1, o = a - 2 * r * (r - 1), e = Math.acos(1 - r * r * this.fact2), i = (o - .5) * Constants.PI / (2 * r)) : this.npix - this.ncap > t ? (s = t - this.ncap, r = s / this.nl4 + this.nside, o = s % this.nl4 + 1, n = (1 & r + this.nside) > 0 ? 1 : .5, e = Math.acos((this.nl2 - r) * this.fact1), i = (o - n) * Constants.PI / this.nl2) : (s = this.npix - t, r = Utils.castToInt(.5 * (1 + Math.sqrt(2 * s - 1))), o = 4 * r + 1 - (s - 2 * r * (r - 1)), e = Math.acos(-1 + Math.pow(r, 2) * this.fact2), i = (o - .5) * Constants.PI / (2 * r)), [e, i]
    }, t.prototype.ring = function(t) {
        "use strict";
        var e, i, r = 0,
            o = t + 1,
            s = 0;
        return this.ncap >= o ? (i = o / 2, s = Utils.castToInt(i), r = Utils.castToInt(Math.sqrt(i - Math.sqrt(s))) + 1) : this.nl2 * (5 * this.nside + 1) >= o ? (e = Utils.castToInt(o - this.ncap - 1), r = Utils.castToInt(e / this.nl4 + this.nside)) : (e = this.npix - o + 1, i = e / 2, s = Utils.castToInt(i), r = Utils.castToInt(Math.sqrt(i - Math.sqrt(s))) + 1, r = this.nl4 - r), r
    }, t.prototype.integration_limits_in_costh = function(t) {
        "use strict";
        var e, i, r, o;
        return o = 1 * this.nside, this.nside >= t ? (i = 1 - Math.pow(t, 2) / 3 / this.npface, r = 1 - Math.pow(t - 1, 2) / 3 / this.npface, e = t == this.nside ? 2 * (this.nside - 1) / 3 / o : 1 - Math.pow(t + 1, 2) / 3 / this.npface) : this.nl3 > t ? (i = 2 * (2 * this.nside - t) / 3 / o, r = 2 * (2 * this.nside - t + 1) / 3 / o, e = 2 * (2 * this.nside - t - 1) / 3 / o) : (r = t == this.nl3 ? 2 * (-this.nside + 1) / 3 / o : -1 + Math.pow(4 * this.nside - t + 1, 2) / 3 / this.npface, e = -1 + Math.pow(this.nl4 - t - 1, 2) / 3 / this.npface, i = -1 + Math.pow(this.nl4 - t, 2) / 3 / this.npface), [r, i, e]
    }, t.prototype.pixel_boundaries = function(t, e, i, r) {
        var o, s, a, n, h, l, c, u, d = 1 * this.nside;
        if (Math.abs(r) >= 1 - 1 / 3 / this.npface) return c = i * Constants.PIOVER2, u = (i + 1) * Constants.PIOVER2, [c, u];
        if (1.5 * r >= 1) o = Math.sqrt(3 * (1 - r)), s = 1 / d / o, a = e, n = a - 1, h = t - e, l = h + 1, c = Constants.PIOVER2 * (Math.max(n * s, 1 - l * s) + i), u = Constants.PIOVER2 * (Math.min(1 - h * s, a * s) + i);
        else if (1.5 * r > -1) {
            var p = .5 * (1 - 1.5 * r),
                f = p + 1,
                g = this.nside + t % 2;
            a = e - (g - t) / 2, n = a - 1, h = (g + t) / 2 - e, l = h + 1, c = Constants.PIOVER2 * (Math.max(f - l / d, -p + n / d) + i), u = Constants.PIOVER2 * (Math.min(f - h / d, -p + a / d) + i)
        } else {
            o = Math.sqrt(3 * (1 + r)), s = 1 / d / o;
            var v = 2 * this.nside;
            a = t - v + e, n = a - 1, h = v - e, l = h + 1, c = Constants.PIOVER2 * (Math.max(1 - (v - n) * s, (v - l) * s) + i), u = Constants.PIOVER2 * (Math.min(1 - (v - a) * s, (v - h) * s) + i)
        }
        return [c, u]
    }, t.vector = function(t, e) {
        "use strict";
        var i = 1 * Math.sin(t) * Math.cos(e),
            r = 1 * Math.sin(t) * Math.sin(e),
            o = 1 * Math.cos(t);
        return new SpatialVector(i, r, o)
    }, t.prototype.corners_ring = function(e, i) {
        "use strict";
        var r = 2 * i + 2,
            o = Array(r),
            s = this.pix2ang_ring(e),
            a = Math.cos(s[0]),
            n = s[0],
            h = s[1],
            l = Utils.castToInt(h / Constants.PIOVER2),
            c = this.ring(e),
            u = Math.min(c, Math.min(this.nside, this.nl4 - c)),
            d = 0,
            p = Constants.PIOVER2 / u;
        d = c >= this.nside && this.nl3 >= c ? Utils.castToInt(h / p + c % 2 / 2) + 1 : Utils.castToInt(h / p) + 1, d -= l * u;
        var f = r / 2,
            g = this.integration_limits_in_costh(c),
            v = Math.acos(g[0]),
            m = Math.acos(g[2]),
            y = this.pixel_boundaries(c, d, l, g[0]);
        if (o[0] = d > u / 2 ? t.vector(v, y[1]) : t.vector(v, y[0]), y = this.pixel_boundaries(c, d, l, g[2]), o[f] = d > u / 2 ? t.vector(m, y[1]) : t.vector(m, y[0]), 1 == i) {
            var w = Math.acos(g[1]);
            y = this.pixel_boundaries(c, d, l, g[1]), o[1] = t.vector(w, y[0]), o[3] = t.vector(w, y[1])
        } else
            for (var C = g[2] - g[0], S = C / (i + 1), x = 1; i >= x; x++) a = g[0] + S * x, n = Math.acos(a), y = this.pixel_boundaries(c, d, l, a), o[x] = t.vector(n, y[0]), o[r - x] = t.vector(n, y[1]);
        return o
    }, t.vec2Ang = function(t) {
        "use strict";
        var e = t.z / t.length(),
            i = Math.acos(e),
            r = 0;
        return (0 != t.x || 0 != t.y) && (r = Math.atan2(t.y, t.x)), 0 > r && (r += 2 * Math.PI), [i, r]
    }, t.prototype.queryDisc = function(e, i, r, o) {
        "use strict";
        if (0 > i || i > Constants.PI) throw {
            name: "Illegal argument",
            message: "angular radius is in RADIAN and should be in [0,pi]"
        };
        var s, a, n, h, l, c, u, d, p, f, g, v, m, y, w, C, S, x, M, b = new LongRangeSetBuilder,
            T = null,
            l = i;
        if (o && (l += Constants.PI / this.nl4), T = t.vec2Ang(e), c = T[0], u = T[1], g = this.fact2, v = this.fact1, h = Math.cos(c), M = 1 / Math.sqrt((1 - h) * (1 + h)), y = c - l, w = c + l, d = Math.cos(l), S = Math.cos(y), s = this.ringAbove(S) + 1, C = Math.cos(w), a = this.ringAbove(C), s > a && 0 == a && (a = s), 0 >= y)
            for (var I = 1; s > I; ++I) this.inRing(I, 0, Math.PI, b);
        for (n = s; a >= n; ++n) x = this.nside > n ? 1 - n * n * g : this.nl3 >= n ? (this.nl2 - n) * v : -1 + (this.nl4 - n) * (this.nl4 - n) * g, p = (d - x * h) * M, f = 1 - x * x - p * p, m = Math.atan2(Math.sqrt(f), p), isNaN(m) && (m = l), this.inRing(n, u, m, b);
        if (w >= Math.PI)
            for (var I = a + 1; this.nl4 > I; ++I) this.inRing(I, 0, Math.PI, b, !1);
        var A;
        if (r) {
            for (var R = b.items, O = [], P = 0; R.length > P; P++) {
                var E = this.ring2nest(R[P]);
                O.indexOf(E) >= 0 || O.push(E)
            }
            A = O
        } else A = b.items;
        return A
    }, t.prototype.inRing = function(t, e, i, r, o) {
        "use strict";
        var s, a, n, h, l = !1,
            c = !1,
            u = 1e-12,
            d = 0,
            p = 0,
            f = 0,
            g = 0,
            v = (e - i) % Constants.TWOPI - u,
            m = e + i + u,
            y = (e + i) % Constants.TWOPI + u;
        if (u > Math.abs(i - Constants.PI) && (l = !0), t >= this.nside && this.nl3 >= t ? (p = t - this.nside + 1, n = this.ncap + this.nl4 * (p - 1), h = n + this.nl4 - 1, s = p % 2, a = this.nl4) : (this.nside > t ? (p = t, n = 2 * p * (p - 1), h = n + 4 * p - 1) : (p = 4 * this.nside - t, n = this.npix - 2 * p * (p + 1), h = n + 4 * p - 1), a = 4 * p, s = 1), l) return r.appendRange(n, h), void 0;
        if (d = s / 2, o) f = Math.round(a * v / Constants.TWOPI - d), g = Math.round(a * m / Constants.TWOPI - d), f %= a, g > a && (g %= a);
        else {
            if (f = Math.ceil(a * v / Constants.TWOPI - d), g = Utils.castToInt(a * y / Constants.TWOPI - d), f > g && 1 == t && (g = Utils.castToInt(a * m / Constants.TWOPI - d)), f == g + 1 && (f = g), 1 == f - g && Constants.PI > i * a) return console.log("the interval is too small and avay from center"), void 0;
            f = Math.min(f, a - 1), g = Math.max(g, 0)
        } if (f > g && (c = !0), c) f += n, g += n, r.appendRange(n, g), r.appendRange(f, h);
        else {
            if (0 > f) return f = Math.abs(f), r.appendRange(n, n + g), r.appendRange(h - f + 1, h), void 0;
            f += n, g += n, r.appendRange(f, g)
        }
    }, t.prototype.ringAbove = function(t) {
        "use strict";
        var e = Math.abs(t);
        if (e > Constants.TWOTHIRD) {
            var i = Utils.castToInt(this.nside * Math.sqrt(3 * (1 - e)));
            return t > 0 ? i : 4 * this.nside - i - 1
        }
        return Utils.castToInt(this.nside * (2 - 1.5 * t))
    }, t.prototype.ring2nest = function(t) {
        "use strict";
        var e = this.ring2xyf(t);
        return this.xyf2nest(e.ix, e.iy, e.face_num)
    }, t.prototype.ring2xyf = function(e) {
        "use strict";
        var i, r, o, s, a = {};
        if (this.ncap > e) {
            i = Utils.castToInt(.5 * (1 + Math.sqrt(1 + 2 * e))), r = e + 1 - 2 * i * (i - 1), o = 0, s = i, a.face_num = 0;
            var n = r - 1;
            n >= 2 * i && (a.face_num = 2, n -= 2 * i), n >= i && ++a.face_num
        } else if (this.npix - this.ncap > e) {
            var h = e - this.ncap;
            this.order >= 0 ? (i = (h >> this.order + 2) + this.nside, r = (h & this.nl4 - 1) + 1) : (i = h / this.nl4 + this.nside, r = h % this.nl4 + 1), o = 1 & i + this.nside, s = this.nside;
            var l, c, u = i - this.nside + 1,
                d = this.nl2 + 2 - u;
            this.order >= 0 ? (l = r - Utils.castToInt(u / 2) + this.nside - 1 >> this.order, c = r - Utils.castToInt(d / 2) + this.nside - 1 >> this.order) : (l = (r - Utils.castToInt(u / 2) + this.nside - 1) / this.nside, c = (r - Utils.castToInt(d / 2) + this.nside - 1) / this.nside), a.face_num = c == l ? 4 == c ? 4 : Utils.castToInt(c) + 4 : l > c ? Utils.castToInt(c) : Utils.castToInt(l) + 8
        } else {
            var h = this.npix - e;
            i = Utils.castToInt(.5 * (1 + Math.sqrt(2 * h - 1))), r = 4 * i + 1 - (h - 2 * i * (i - 1)), o = 0, s = i, i = 2 * this.nl2 - i, a.face_num = 8;
            var n = r - 1;
            n >= 2 * s && (a.face_num = 10, n -= 2 * s), n >= s && ++a.face_num
        }
        var p = i - t.JRLL[a.face_num] * this.nside + 1,
            f = 2 * r - t.JPLL[a.face_num] * s - o - 1;
        return f >= this.nl2 && (f -= 8 * this.nside), a.ix = f - p >> 1, a.iy = -(f + p) >> 1, a
    }, t
}(), Utils = function() {}, Utils.radecToPolar = function(t, e) {
    return {
        theta: Math.PI / 2 - e / 180 * Math.PI,
        phi: t / 180 * Math.PI
    }
}, Utils.polarToRadec = function(t, e) {
    return {
        ra: 180 * e / Math.PI,
        dec: 180 * (Math.PI / 2 - t) / Math.PI
    }
}, Utils.castToInt = function(t) {
    return t > 0 ? Math.floor(t) : Math.ceil(t)
}, AstroMath.D2R = Math.PI / 180, AstroMath.R2D = 180 / Math.PI, AstroMath.sign = function(t) {
    return t > 0 ? 1 : 0 > t ? -1 : 0
}, AstroMath.cosd = function(t) {
    if (0 == t % 90) {
        var e = Math.abs(Math.floor(t / 90 + .5)) % 4;
        switch (e) {
            case 0:
                return 1;
            case 1:
                return 0;
            case 2:
                return -1;
            case 3:
                return 0
        }
    }
    return Math.cos(t * AstroMath.D2R)
}, AstroMath.sind = function(t) {
    if (0 === t % 90) {
        var e = Math.abs(Math.floor(t / 90 - .5)) % 4;
        switch (e) {
            case 0:
                return 1;
            case 1:
                return 0;
            case 2:
                return -1;
            case 3:
                return 0
        }
    }
    return Math.sin(t * AstroMath.D2R)
}, AstroMath.tand = function(t) {
    var e;
    return e = t % 360, 0 == e || 180 == Math.abs(e) ? 0 : 45 == e || 225 == e ? 1 : -135 == e || -315 == e ? -1 : Math.tan(t * AstroMath.D2R)
}, AstroMath.asind = function(t) {
    return Math.asin(t) * AstroMath.R2D
}, AstroMath.acosd = function(t) {
    return Math.acos(t) * AstroMath.R2D
}, AstroMath.atand = function(t) {
    return Math.atan(t) * AstroMath.R2D
}, AstroMath.atan2 = function(t, e) {
    if (0 == t) return e > 0 ? 0 : 0 > e ? Math.PI : 0 / 0;
    var i = AstroMath.sign(t);
    if (0 == e) return Math.PI / 2 * i;
    var r = Math.atan(Math.abs(t / e));
    return e > 0 ? r * i : 0 > e ? (Math.PI - r) * i : void 0
}, AstroMath.atan2d = function(t, e) {
    return AstroMath.atan2(t, e) * AstroMath.R2D
}, AstroMath.cosh = function(t) {
    return (Math.exp(t) + Math.exp(-t)) / 2
}, AstroMath.sinh = function(t) {
    return (Math.exp(t) - Math.exp(-t)) / 2
}, AstroMath.tanh = function(t) {
    return (Math.exp(t) - Math.exp(-t)) / (Math.exp(t) + Math.exp(-t))
}, AstroMath.acosh = function(t) {
    return Math.log(t + Math.sqrt(t * t - 1))
}, AstroMath.asinh = function(t) {
    return Math.log(t + Math.sqrt(t * t + 1))
}, AstroMath.atanh = function(t) {
    return .5 * Math.log((1 + t) / (1 - t))
}, AstroMath.sinc = function(t) {
    var e, i = Math.abs(t);
    return .001 >= i ? (i *= i, e = 1 - i * (1 - i / 20) / 6) : e = Math.sin(i) / i, e
}, AstroMath.asinc = function(t) {
    var e, i = Math.abs(t);
    return .001 >= i ? (i *= i, e = 1 + i * (6 + .45 * i) / 6) : e = Math.asin(i) / i, e
}, AstroMath.hypot = function(t, e) {
    return Math.sqrt(t * t + e * e)
}, AstroMath.eulerMatrix = function(t, e, i) {
    var r = Array(3);
    r[0] = Array(3), r[1] = Array(3), r[2] = Array(3);
    var o = AstroMath.cosd(t),
        s = AstroMath.sind(t),
        a = AstroMath.cosd(e),
        n = AstroMath.sind(e),
        h = AstroMath.cosd(i),
        l = AstroMath.sind(i);
    return r[0][0] = h * a * o - l * s, r[0][1] = -l * a * o - h * s, r[0][2] = -n * o, r[1][0] = h * a * s + l * o, r[1][1] = -l * a * s + h * o, r[1][2] = -n * s, r[2][0] = -n * h, r[2][1] = -n * o, r[2][2] = a, r
}, AstroMath.displayMatrix = function(t) {
    for (var e = t.length, i = 0, r = 0; e > r; r++) t[r].length > i && (i = t[r].length);
    for (var o = "<table>\n", r = 0; e > r; r++) {
        o += "<tr>";
        for (var s = 0; e > s; s++) o += "<td>", t[r].length > r && (o += "" + t[r][s]), o += "</td>";
        o += "</td>\n"
    }
    return o += "</table>\n"
}, Projection.PROJ_TAN = 1, Projection.PROJ_TAN2 = 2, Projection.PROJ_STG = 2, Projection.PROJ_SIN = 3, Projection.PROJ_SIN2 = 4, Projection.PROJ_ZEA = 4, Projection.PROJ_ARC = 5, Projection.PROJ_SCHMIDT = 5, Projection.PROJ_AITOFF = 6, Projection.PROJ_AIT = 6, Projection.PROJ_GLS = 7, Projection.PROJ_MERCATOR = 8, Projection.PROJ_MER = 8, Projection.PROJ_LAM = 9, Projection.PROJ_LAMBERT = 9, Projection.PROJ_TSC = 10, Projection.PROJ_QSC = 11, Projection.PROJ_LIST = ["Mercator", Projection.PROJ_MERCATOR, "Gnomonic", Projection.PROJ_TAN, "Stereographic", Projection.PROJ_TAN2, "Orthographic", Projection.PROJ_SIN, "Zenithal", Projection.PROJ_ZEA, "Schmidt", Projection.PROJ_SCHMIDT, "Aitoff", Projection.PROJ_AITOFF, "Lambert", Projection.PROJ_LAMBERT], Projection.PROJ_NAME = ["-", "Gnomonic", "Stereographic", "Orthographic", "Equal-area", "Schmidt plates", "Aitoff", "Global sin", "Mercator", "Lambert"], Projection.prototype = {
    setCenter: function(t, e) {
        this.ROT = this.tr_oR(t, e)
    },
    setProjection: function(t) {
        this.PROJECTION = t
    },
    project: function(t, e) {
        var i = this.tr_ou(t, e),
            r = this.tr_uu(i, this.ROT),
            o = this.tr_up(this.PROJECTION, r);
        return null == o ? null : {
            X: -o[0],
            Y: -o[1]
        }
    },
    unproject: function(t, e) {
        t = -t, e = -e;
        var i = this.tr_pu(this.PROJECTION, t, e),
            r = this.tr_uu1(i, this.ROT),
            o = this.tr_uo(r);
        return {
            ra: o[0],
            dec: o[1]
        }
    },
    tr_up: function(t, e) {
        var i, r, o, s, a, n = e[0],
            h = e[1],
            l = e[2];
        if (i = AstroMath.hypot(n, h), 0 == i && 0 == l) return null;
        switch (t) {
            default: o = null;
            break;
            case Projection.PROJ_AITOFF:
                r = Math.sqrt(i * (i + n) / 2), s = Math.sqrt(2 * i * (i - n)), r = Math.sqrt((1 + r) / 2), s /= r, a = l / r, 0 > h && (s = -s), o = [s, a];
                break;
            case Projection.PROJ_GLS:
                a = Math.asin(l), s = 0 != i ? Math.atan2(h, n) * i : 0, o = [s, a];
                break;
            case Projection.PROJ_MERCATOR:
                0 != i ? (s = Math.atan2(h, n), a = AstroMath.atanh(l), o = [s, a]) : o = null;
                break;
            case Projection.PROJ_TAN:
                n > 0 ? (s = h / n, a = l / n, o = [s, a]) : o = null;
                break;
            case Projection.PROJ_TAN2:
                r = (1 + n) / 2, r > 0 ? (s = h / r, a = l / r, o = [s, a]) : o = null;
                break;
            case Projection.PROJ_ARC:
                -1 >= n ? (s = Math.PI, a = 0) : (i = AstroMath.hypot(h, l), r = n > 0 ? AstroMath.asinc(i) : Math.acos(n) / i, s = h * r, a = l * r), o = [s, a];
                break;
            case Projection.PROJ_SIN:
                n >= 0 ? (s = h, a = l, o = [s, a]) : o = null;
                break;
            case Projection.PROJ_SIN2:
                r = Math.sqrt((1 + n) / 2), 0 != r ? (s = h / r, a = l / r) : (s = 2, a = 0), o = [s, a];
                break;
            case Projection.PROJ_LAMBERT:
                a = l, s = 0, 0 != i && (s = Math.atan2(h, n)), o = [s, a]
        }
        return o
    },
    tr_pu: function(t, e, i) {
        var r, o, s, a, n;
        switch (t) {
            default: return null;
            case Projection.PROJ_AITOFF:
                if (r = e * e / 8 + i * i / 2, r > 1) return null;
                s = 1 - r, o = Math.sqrt(1 - r / 2), a = e * o / 2, n = i * o, r = AstroMath.hypot(s, a), 0 != r && (o = s, s = (o * o - a * a) / r, a = 2 * o * a / r);
                break;
            case Projection.PROJ_GLS:
                if (n = Math.sin(i), r = 1 - n * n, 0 > r) return null;
                r = Math.sqrt(r), o = 0 != r ? e / r : 0, s = r * Math.cos(o), a = r * Math.sin(o);
                break;
            case Projection.PROJ_MERCATOR:
                n = AstroMath.tanh(i), r = 1 / AstroMath.cosh(i), s = r * Math.cos(e), a = r * Math.sin(e);
                break;
            case Projection.PROJ_LAMBERT:
                if (n = i, r = 1 - n * n, 0 > r) return null;
                r = Math.sqrt(r), s = r * Math.cos(e), a = r * Math.sin(e);
                break;
            case Projection.PROJ_TAN:
                s = 1 / Math.sqrt(1 + e * e + i * i), a = e * s, n = i * s;
                break;
            case Projection.PROJ_TAN2:
                r = (e * e + i * i) / 4, o = 1 + r, s = (1 - r) / o, a = e / o, n = i / o;
                break;
            case Projection.PROJ_ARC:
                if (r = AstroMath.hypot(e, i), r > Math.PI) return null;
                o = AstroMath.sinc(r), s = Math.cos(r), a = o * e, n = o * i;
                break;
            case Projection.PROJ_SIN:
                if (o = 1 - e * e - i * i, 0 > o) return null;
                s = Math.sqrt(o), a = e, n = i;
                break;
            case Projection.PROJ_SIN2:
                if (r = (e * e + i * i) / 4, r > 1) return null;
                o = Math.sqrt(1 - r), s = 1 - 2 * r, a = o * e, n = o * i
        }
        return [s, a, n]
    },
    tr_oR: function(t, e) {
        var i = Array(3);
        return i[0] = Array(3), i[1] = Array(3), i[2] = Array(3), i[2][2] = AstroMath.cosd(e), i[0][2] = AstroMath.sind(e), i[1][1] = AstroMath.cosd(t), i[1][0] = -AstroMath.sind(t), i[1][2] = 0, i[0][0] = i[2][2] * i[1][1], i[0][1] = -i[2][2] * i[1][0], i[2][0] = -i[0][2] * i[1][1], i[2][1] = i[0][2] * i[1][0], i
    },
    tr_ou: function(t, e) {
        var i = Array(3),
            r = AstroMath.cosd(e);
        return i[0] = r * AstroMath.cosd(t), i[1] = r * AstroMath.sind(t), i[2] = AstroMath.sind(e), i
    },
    tr_uu: function(t, e) {
        var i = Array(3),
            r = t[0],
            o = t[1],
            s = t[2];
        return i[0] = e[0][0] * r + e[0][1] * o + e[0][2] * s, i[1] = e[1][0] * r + e[1][1] * o + e[1][2] * s, i[2] = e[2][0] * r + e[2][1] * o + e[2][2] * s, i
    },
    tr_uu1: function(t, e) {
        var i = Array(3),
            r = t[0],
            o = t[1],
            s = t[2];
        return i[0] = e[0][0] * r + e[1][0] * o + e[2][0] * s, i[1] = e[0][1] * r + e[1][1] * o + e[2][1] * s, i[2] = e[0][2] * r + e[1][2] * o + e[2][2] * s, i
    },
    tr_uo: function(t) {
        var e, i, r = t[0],
            o = t[1],
            s = t[2],
            a = r * r + o * o;
        if (0 == a) {
            if (0 == s) return null;
            e = 0, i = s > 0 ? 90 : -90
        } else i = AstroMath.atand(s / Math.sqrt(a)), e = AstroMath.atan2d(o, r), 0 > e && (e += 360);
        return [e, i]
    }
}, Coo.factor = [3600, 60, 1], Coo.prototype = {
    setFrame: function(t) {
        this.frame = t
    },
    computeDirCos: function() {
        var t = AstroMath.cosd(this.lat);
        this.x = t * AstroMath.cosd(this.lon), this.y = t * AstroMath.sind(this.lon), this.z = AstroMath.sind(this.lat)
    },
    computeLonLat: function() {
        var t = this.x * this.x + this.y * this.y;
        this.lon = 0, 0 == t ? 0 == this.z ? (this.lon = 0 / 0, this.lat = 0 / 0) : this.lat = this.z > 0 ? 90 : -90 : (this.lon = AstroMath.atan2d(this.y, this.x), this.lat = AstroMath.atan2d(this.z, Math.sqrt(t)), 0 > this.lon && (this.lon += 360))
    },
    dist2: function(t) {
        var e = t.x - this.x,
            i = e * e;
        return e = t.y - this.y, i += e * e, e = t.z - this.z, i += e * e
    },
    distance: function(t) {
        return 0 == t.x && 0 == t.y && 0 == t.z ? 0 / 0 : 0 == this.x && 0 == this.y && 0 == this.z ? 0 / 0 : 2 * AstroMath.asind(.5 * Math.sqrt(this.dist2(t)))
    },
    convertTo: function(t) {
        this.frame.equals(t) || (this.frame.toICRS(this.coo), t.fromICRS(this.coo), this.frame = t, this.lon = this.lat = 0 / 0)
    },
    rotate: function(t) {
        var e, i, r;
        t != Umatrix3 && (e = t[0][0] * this.x + t[0][1] * this.y + t[0][2] * this.z, i = t[1][0] * this.x + t[1][1] * this.y + t[1][2] * this.z, r = t[2][0] * this.x + t[2][1] * this.y + t[2][2] * this.z, this.x = e, this.y = i, this.z = r, this.lon = this.lat = 0 / 0)
    },
    rotate_1: function(t) {
        var e, i, r;
        t != Umatrix3 && (e = t[0][0] * this.x + t[1][0] * this.y + t[2][0] * this.z, i = t[0][1] * this.x + t[1][1] * this.y + t[2][1] * this.z, r = t[0][2] * this.x + t[1][2] * this.y + t[2][2] * this.z, this.x = e, this.y = i, this.z = r, this.lon = this.lat = 0 / 0)
    },
    equals: function(t) {
        return this.x == t.x && this.y == t.y && this.z == t.z
    },
    parse: function(t) {
        var e = t.indexOf("+");
        if (0 > e && (e = t.indexOf("-")), 0 > e && (e = t.indexOf(" ")), 0 > e) return this.lon = 0 / 0, this.lat = 0 / 0, this.prec = 0, !1;
        var i = t.substring(0, e),
            r = t.substring(e);
        return this.lon = this.parseLon(i), this.lat = this.parseLat(r), !0
    },
    parseLon: function(t) {
        var t = t.trim();
        if (t = t.replace(/:/g, " "), 0 > t.indexOf(" ")) {
            var e = t.indexOf(".");
            return this.prec = 0 > e ? 0 : t.length - e - 1, parseFloat(t)
        }
        for (var i = new Tokenizer(t, " "), r = 0, o = 0, s = 0; i.hasMore();) {
            var a = i.nextToken(),
                n = a.indexOf(".");
            switch (o += parseFloat(a) * Coo.factor[r], r) {
                case 0:
                    s = 0 > n ? 1 : 2;
                    break;
                case 1:
                    s = 0 > n ? 3 : 4;
                    break;
                case 2:
                    s = 0 > n ? 5 : 4 + a.length - n;
                default:
            }
            r++
        }
        return this.prec = s, 15 * o / 3600
    },
    parseLat: function(t) {
        var t = t.trim();
        t = t.replace(/:/g, " ");
        var e;
        if ("-" == t.charAt(0) ? (e = -1, t = t.substring(1)) : "-" == t.charAt(0) ? (e = 1, t = t.substring(1)) : e = 1, 0 > t.indexOf(" ")) {
            var i = t.indexOf(".");
            return this.prec = 0 > i ? 0 : t.length - i - 1, parseFloat(t) * e
        }
        for (var r = new Tokenizer(t, " "), o = 0, s = 0, a = 0; r.hasMore();) {
            var n = r.nextToken(),
                h = n.indexOf(".");
            switch (s += parseFloat(n) * Coo.factor[o], o) {
                case 0:
                    a = 0 > h ? 1 : 2;
                    break;
                case 1:
                    a = 0 > h ? 3 : 4;
                    break;
                case 2:
                    a = 0 > h ? 5 : 4 + n.length - h;
                default:
            }
            o++
        }
        return this.prec = a, s * e / 3600
    },
    format: function(t) {
        isNaN(this.lon) && this.computeLonLat();
        var e = "",
            i = "";
        if (t.indexOf("d") >= 0) e = Numbers.format(this.lon, this.prec), i = Numbers.format(this.lat, this.prec);
        else var r = this.lon / 15,
        e = Numbers.toSexagesimal(r, this.prec + 1, !1), i = Numbers.toSexagesimal(this.lat, this.prec, !1);
        return this.lat > 0 && (i = "+" + i), t.indexOf("/") >= 0 ? e + " " + i : t.indexOf("2") >= 0 ? [e, i] : e + i
    }
}, Tokenizer.prototype = {
    hasMore: function() {
        return this.pos < this.string.length
    },
    nextToken: function() {
        for (var t = this.pos; this.string.length > t && this.string.charAt(t) == this.sep;) t++;
        for (var e = t; this.string.length > e && this.string.charAt(e) != this.sep;) e++;
        return this.pos = e, this.string.substring(t, e)
    }
}, Strings.trim = function(t, e) {
    for (var i = 0, r = t.length - 1; t.length > i && t.charAt(i) == e;) i++;
    if (i == t.length) return "";
    for (; r > i && t.charAt(r) == e;) r--;
    return t.substring(i, r + 1)
}, Numbers.pow10 = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14], Numbers.rndval = [.5, .05, .005, 5e-4, 5e-5, 5e-6, 5e-7, 5e-8, 5e-9, 5e-10, 5e-11, 5e-12, 5e-13, 5e-14, 5e-14], Numbers.format = function(t, e) {
    if (0 >= e) return "" + Math.round(t);
    var i = "" + t,
        r = i.indexOf("."),
        o = r >= 0 ? i.length - r - 1 : 0;
    if (e >= o) {
        0 > r && (i += ".");
        for (var s = 0; e - o > s; s++) i += "0";
        return i
    }
    return i = "" + (t + Numbers.rndval[e]), i.substr(0, r + e + 1)
}, Numbers.toSexagesimal = function(t, e, i) {
    var r = 0 > t ? "-" : i ? "+" : "",
        o = Math.abs(t);
    switch (e) {
        case 1:
            var s = Math.round(o);
            return r + ("" + s);
        case 2:
            return r + Numbers.format(o, 1);
        case 3:
            var s = Math.floor(o),
                a = Math.round(60 * (o - s));
            return r + s + " " + a;
        case 4:
            var s = Math.floor(o),
                a = 60 * (o - s);
            return r + s + " " + Numbers.format(a, 1);
        case 5:
            var s = Math.floor(o),
                a = 60 * (o - s),
                n = Math.floor(a),
                h = Math.round(60 * (a - n));
            return r + s + " " + n + " " + h;
        case 6:
        case 7:
        case 8:
            var s = Math.floor(o);
            10 > s && (s = "0" + s);
            var a = 60 * (o - s),
                n = Math.floor(a);
            10 > n && (n = "0" + n);
            var h = 60 * (a - n);
            return r + s + " " + n + " " + Numbers.format(h, e - 5);
        default:
            return r + Numbers.format(o, 1)
    }
}, CooConversion = function() {
    var t = {};
    return t.GALACTIC_TO_J2000 = [-.0548755604024359, .4941094279435681, -.867666148981161, -.8734370902479237, -.4448296299195045, -.1980763734646737, -.4838350155267381, .7469822444763707, .4559837762325372], t.J2000_TO_GALACTIC = [-.0548755604024359, -.873437090247923, -.4838350155267381, .4941094279435681, -.4448296299195045, .7469822444763707, -.867666148981161, -.1980763734646737, .4559837762325372], t.Transform = function(t, e) {
        t[0] = t[0] * Math.PI / 180, t[1] = t[1] * Math.PI / 180;
        var i = [Math.cos(t[0]) * Math.cos(t[1]), Math.sin(t[0]) * Math.cos(t[1]), Math.sin(t[1])],
            r = [i[0] * e[0] + i[1] * e[1] + i[2] * e[2], i[0] * e[3] + i[1] * e[4] + i[2] * e[5], i[0] * e[6] + i[1] * e[7] + i[2] * e[8]],
            o = Math.sqrt(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]),
            s = [0, 0];
        s[1] = Math.asin(r[2] / o);
        var a = r[0] / o / Math.cos(s[1]),
            n = r[1] / o / Math.cos(s[1]);
        return s[0] = Math.atan2(n, a), 0 > s[0] && (s[0] = s[0] + 2 * Math.PI), s[0] = 180 * s[0] / Math.PI, s[1] = 180 * s[1] / Math.PI, s
    }, t.GalacticToJ2000 = function(e) {
        return t.Transform(e, t.GALACTIC_TO_J2000)
    }, t.J2000ToGalactic = function(e) {
        return t.Transform(e, t.J2000_TO_GALACTIC)
    }, t
}(), Sesame = function() {
    return Sesame = {}, Sesame.cache = {}, Sesame.getTargetRADec = function(t, e, i) {
        if (e) {
            var r = /[a-zA-Z]/.test(t);
            if (r) Sesame.resolve(t, function(t) {
                e({
                    ra: t.Target.Resolver.jradeg,
                    dec: t.Target.Resolver.jdedeg
                })
            }, function() {
                i && i()
            });
            else {
                var o = new Coo;
                o.parse(t), e && e({
                    ra: o.lon,
                    dec: o.lat
                })
            }
        }
    }, Sesame.resolve = function(t, e, i) {
        var r = "http://cds.u-strasbg.fr/cgi-bin/nph-sesame.jsonp?";
        $.ajax({
            url: r,
            data: {
                object: t
            },
            method: "GET",
            dataType: "jsonp",
            success: function(t) {
                t.Target && t.Target.Resolver && t.Target.Resolver ? e(t) : i(t)
            },
            error: i
        })
    }, Sesame
}(), HealpixCache = function() {
    var t = {};
    return t.staticCache = {
        corners: {
            nside8: []
        }
    }, t.dynamicCache = {}, t.lastNside = 8, t.hpxIdxCache = null, t.init = function() {
        var e = new HealpixIndex(8);
        e.init();
        for (var i = HealpixIndex.nside2Npix(8), r = 0; i > r; r++) t.staticCache.corners.nside8[r] = e.corners_nest(r, 1);
        t.hpxIdxCache = e
    }, t.corners_nest = function(e, i) {
        return 8 == i ? t.staticCache.corners.nside8[e] : (i != t.lastNside && (t.hpxIdxCache = new HealpixIndex(i), t.hpxIdxCache.init(), t.lastNside = i), t.hpxIdxCache.corners_nest(e, 1))
    }, t
}(), Utils = Utils || {}, Utils.cssScale = void 0, HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords, Function.prototype.bind || (Function.prototype.bind = function(t) {
    if ("function" != typeof this) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    var e = [].slice,
        i = e.call(arguments, 1),
        r = this,
        o = function() {}, s = function() {
            return r.apply(this instanceof o ? this : t || {}, i.concat(e.call(arguments)))
        };
    return s.prototype = this.prototype, s
}), $ = $ || jQuery, $.urlParam = function(t, e) {
    return void 0 === e && (e = location.search), decodeURIComponent((RegExp("[?|&]" + t + "=" + "([^&;]+?)(&|#|;|$)").exec(e) || [, ""])[1].replace(/\+/g, "%20")) || null
}, Utils.isNumber = function(t) {
    return !isNaN(parseFloat(t)) && isFinite(t)
}, Utils.debounce = function(t, e) {
    var i = null;
    return function() {
        var r = this,
            o = arguments;
        clearTimeout(i), i = setTimeout(function() {
            t.apply(r, o)
        }, e)
    }
}, Utils.LRUCache = function(t) {
    this._keys = [], this._items = {}, this._expires = {}, this._size = 0, this._maxsize = t || 1024
}, Utils.LRUCache.prototype = {
    set: function(t, e) {
        var i = this._keys,
            r = this._items,
            o = this._expires,
            s = this._size,
            a = this._maxsize;
        s >= a && (i.sort(function(t, e) {
            return o[t] > o[e] ? -1 : o[t] < o[e] ? 1 : 0
        }), s--, delete o[i[s]], delete r[i[s]]), i[s] = t, r[t] = e, o[t] = Date.now(), s++, this._keys = i, this._items = r, this._expires = o, this._size = s
    },
    get: function(t) {
        var e = this._items[t];
        return e && (this._expires[t] = Date.now()), e
    },
    keys: function() {
        return this._keys
    }
}, URLBuilder = function() {
    return URLBuilder = {
        buildSimbadCSURL: function(t, e) {
            if (t && "object" == typeof t && "ra" in t && "dec" in t) {
                var i = new Coo(t.ra, t.dec, 7);
                t = i.format("s")
            }
            return "http://alasky.u-strasbg.fr/cgi/simbad-flat/simbad-cs.py?target=" + encodeURIComponent(t) + "&SR=" + e + "&format=votable&SRUNIT=deg&SORTBY=nbref"
        },
        buildNEDPositionCSURL: function(t, e, i) {
            return "http://nedwww.ipac.caltech.edu/cgi-bin/nph-objsearch?search_type=Near+Position+Search&of=xml_main&RA=" + t + "&DEC=" + e + "&SR=" + i
        },
        buildNEDObjectCSURL: function(t, e) {
            return "http://ned.ipac.caltech.edu/cgi-bin/nph-objsearch?search_type=Near+Name+Search&radius=" + 60 * e + "&of=xml_main&objname=" + t
        },
        buildVizieRCSURL: function(t, e, i) {
            if (e && "object" == typeof e && "ra" in e && "dec" in e) {
                var r = new Coo(e.ra, e.dec, 7);
                e = r.format("s")
            }
            return "http://vizier.u-strasbg.fr/viz-bin/votable?-source=" + t + "&-c=" + encodeURIComponent(e) + "&-out.max=999999&-c.rd=" + i
        }
    }
}(), MeasurementTable = function() {
    return MeasurementTable = function(t) {
        this.isShowing = !1, this.divEl = $('<div class="aladin-measurement-div"></div>'), $(t).append(this.divEl)
    }, MeasurementTable.prototype.showMeasurement = function(t) {
        this.divEl.empty();
        var e = "<thead><tr>",
            i = "<tr>";
        for (key in t.data) e += "<th>" + key + "</th>", i += "<td>" + t.data[key] + "</td>";
        e += "</tr></thead>", i += "</tr>", this.divEl.append("<table>" + e + i + "</table>"), this.show()
    }, MeasurementTable.prototype.show = function() {
        this.divEl.show()
    }, MeasurementTable.prototype.hide = function() {
        this.divEl.hide()
    }, MeasurementTable
}(), Color = function() {
    return Color = {}, Color.curIdx = 0, Color.colors = ["#ff0000", "#0000ff", "#99cc00", "#ffff00", "#000066", "#00ffff", "#9900cc", "#0099cc", "#cc9900", "#cc0099", "#00cc99", "#663333", "#ffcc9a", "#ff9acc", "#ccff33", "#660000", "#ffcc33", "#ff00ff", "#00ff00", "#ffffff"], Color.getNextColor = function() {
        var t = Color.colors[Color.curIdx % Color.colors.length];
        return Color.curIdx++, t
    }, Color.getLabelColorForBackground = function(t) {
        var e = "#eee",
            i = "#111";
        if (rgb = t.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/), null == rgb) return i;
        r = parseInt(rgb[1]), g = parseInt(rgb[2]), b = parseInt(rgb[3]);
        var o = 1 - (.299 * r + .587 * g + .114 * b) / 255;
        return .5 > o ? i : e
    }, Color
}(), AladinUtils = function() {
    return {
        xyToView: function(t, e, i, r, o, s, a) {
            return void 0 == a && (a = !1), a ? {
                vx: o / 2 * (1 + s * t) - (o - i) / 2,
                vy: o / 2 * (1 + s * e) - (o - r) / 2
            } : {
                vx: AladinUtils.myRound(o / 2 * (1 + s * t) - (o - i) / 2),
                vy: AladinUtils.myRound(o / 2 * (1 + s * e) - (o - r) / 2)
            }
        },
        viewToXy: function(t, e, i, r, o, s) {
            return {
                x: ((2 * t + (o - i)) / o - 1) / s,
                y: ((2 * e + (o - r)) / o - 1) / s
            }
        },
        radecToViewXy: function(t, e, i, r, o, s, a, n) {
            var h;
            if (r != CooFrameEnum.J2000) {
                var l = CooConversion.J2000ToGalactic([t, e]);
                h = i.project(l[0], l[1])
            } else h = i.project(t, e);
            return h ? AladinUtils.xyToView(h.X, h.Y, o, s, a, n, !0) : null
        },
        myRound: function(t) {
            return 0 > t ? -1 * (0 | -t) : 0 | t
        },
        isHpxPixVisible: function(t, e, i) {
            for (var r = 0; t.length > r; r++)
                if (t[r].vx >= -20 && e + 20 > t[r].vx && t[r].vy >= -20 && i + 20 > t[r].vy) return !0;
            return !1
        },
        ipixToIpix: function(t, e, i) {},
        getZoomFactorForAngle: function(t, e) {
            var i = {
                ra: 0,
                dec: 0
            }, r = {
                    ra: t,
                    dec: 0
                }, o = new Projection(t / 2, 0);
            o.setProjection(e);
            var s = o.project(i.ra, i.dec),
                a = o.project(r.ra, r.dec),
                n = 1 / (s.X - a.Y);
            return n
        }
    }
}(), ProjectionEnum = {
    SIN: Projection.PROJ_SIN,
    AITOFF: Projection.PROJ_AITOFF
}, CooFrameEnum = function() {
    return {
        J2000: "J2000",
        GAL: "Galactic"
    }
}(), CooFrameEnum.fromString = function(t, e) {
    return t ? (t = t.toLowerCase().replace(/^\s+|\s+$/g, ""), 0 == t.indexOf("j2000") || 0 == t.indexOf("icrs") ? CooFrameEnum.J2000 : 0 == t.indexOf("gal") ? CooFrameEnum.GAL : e ? e : null) : e ? e : null
}, CooFrameEnum.shortName = function(t) {
    return t == CooFrameEnum.J2000 ? "J2000" : t == CooFrameEnum.GAL ? "GAL" : null
}, Downloader = function() {
    var t = 4,
        e = !1,
        i = 700,
        r = function(t) {
            this.view = t, this.nbDownloads = 0, this.dlQueue = [], this.urlsInQueue = {}
        };
    return r.prototype.requestDownload = function(t, e, i) {
        e in this.urlsInQueue || (this.dlQueue.push({
            img: t,
            url: e,
            cors: i
        }), this.urlsInQueue[e] = 1, this.tryDownload())
    }, r.prototype.tryDownload = function() {
        for (; this.dlQueue.length > 0 && t > this.nbDownloads;) this.startDownloadNext()
    }, r.prototype.startDownloadNext = function() {
        var t = this.dlQueue.shift();
        if (t) {
            this.nbDownloads++;
            var e = this;
            t.img.onload = function() {
                e.completeDownload(this, !0)
            }, t.img.onerror = function() {
                e.completeDownload(this, !1)
            }, t.cors ? t.img.crossOrigin = "anonymous" : void 0 !== t.img.crossOrigin && delete t.img.crossOrigin, t.img.src = t.url
        }
    }, r.prototype.completeDownload = function(t, r) {
        if (delete this.urlsInQueue[t.src], t.onerror = null, t.onload = null, this.nbDownloads--, r) {
            if (e) {
                var o = (new Date).getTime();
                t.fadingStart = o, t.fadingEnd = o + i
            }
            this.view.requestRedraw()
        } else t.dlError = !0;
        this.tryDownload()
    }, r
}(),
function() {
    var t, e, i, r, o, s, a, n, h, l, c, u, d, p, f, g, v = {}.hasOwnProperty,
        m = function(t, e) {
            function i() {
                this.constructor = t
            }
            for (var r in e) v.call(e, r) && (t[r] = e[r]);
            return i.prototype = e.prototype, t.prototype = new i, t.__super__ = e.prototype, t
        }, y = [].slice;
    null == this.astro && (this.astro = {}), t = function() {
        function t() {}
        return t.include = function(t) {
            var e, i;
            for (e in t) i = t[e], this.prototype[e] = i;
            return this
        }, t.extend = function(t) {
            var e, i;
            for (e in t) i = t[e], this[e] = i;
            return this
        }, t.prototype.proxy = function(t) {
            var e = this;
            return function() {
                return t.apply(e, arguments)
            }
        }, t.prototype.invoke = function(t, e, i) {
            var r;
            return r = null != (null != e ? e.context : void 0) ? e.context : this, null != t ? t.call(r, i, e) : void 0
        }, t
    }(), u = function(t) {
        function e(t, e, i) {
            var r, o = this;
            this.arg = t, this.callback = e, this.opts = i, this.hdus = [], this.blockCount = 0, this.begin = 0, this.end = this.BLOCKLENGTH, this.offset = 0, this.headerStorage = new Uint8Array, "string" == typeof this.arg ? (this.readNextBlock = this._readBlockFromBuffer, r = new XMLHttpRequest, r.open("GET", this.arg), r.responseType = "arraybuffer", r.onload = function() {
                return 200 !== r.status ? (o.invoke(o.callback, o.opts), void 0) : (o.arg = r.response, o.length = o.arg.byteLength, o.readFromBuffer())
            }, r.send()) : (this.length = this.arg.size, this.readNextBlock = this._readBlockFromFile, this.readFromFile())
        }
        return m(e, t), e.prototype.LINEWIDTH = 80, e.prototype.BLOCKLENGTH = 2880, File.prototype.slice = File.prototype.slice || File.prototype.webkitSlice, Blob.prototype.slice = Blob.prototype.slice || Blob.prototype.webkitSlice, e.prototype.readFromBuffer = function() {
            var t;
            return t = this.arg.slice(this.begin + this.offset, this.end + this.offset), this.readBlock(t)
        }, e.prototype.readFromFile = function() {
            var t, e = this;
            return this.reader = new FileReader, this.reader.onloadend = function(t) {
                return e.readBlock(t.target.result)
            }, t = this.arg.slice(this.begin + this.offset, this.end + this.offset), this.reader.readAsArrayBuffer(t)
        }, e.prototype.readBlock = function(t) {
            var e, i, r, o, s, h, l, c, u, d, p, f, g;
            for (e = new Uint8Array(t), u = new Uint8Array(this.headerStorage), this.headerStorage = new Uint8Array(this.end), this.headerStorage.set(u, 0), this.headerStorage.set(e, this.begin), h = this.BLOCKLENGTH / this.LINEWIDTH; h--;)
                if (s = h * this.LINEWIDTH, 32 !== e[s]) {
                    if (69 === e[s] && 78 === e[s + 1] && 68 === e[s + 2] && 32 === e[s + 3]) {
                        for (l = "", g = this.headerStorage, p = 0, f = g.length; f > p; p++) d = g[p], l += String.fromCharCode(d);
                        return o = new n(l), this.start = this.end + this.offset, i = o.getDataLength(), c = this.arg.slice(this.start, this.start + i), o.hasDataUnit() && (r = this.createDataUnit(o, c)), this.hdus.push(new a(o, r)), this.offset += this.end + i + this.excessBytes(i), this.offset === this.length ? (this.headerStorage = null, this.invoke(this.callback, this.opts, this), void 0) : (this.blockCount = 0, this.begin = this.blockCount * this.BLOCKLENGTH, this.end = this.begin + this.BLOCKLENGTH, this.headerStorage = new Uint8Array, t = this.arg.slice(this.begin + this.offset, this.end + this.offset), this.readNextBlock(t), void 0)
                    }
                    break
                }
            this.blockCount += 1, this.begin = this.blockCount * this.BLOCKLENGTH, this.end = this.begin + this.BLOCKLENGTH, t = this.arg.slice(this.begin + this.offset, this.end + this.offset), this.readNextBlock(t)
        }, e.prototype._readBlockFromBuffer = function(t) {
            return this.readBlock(t)
        }, e.prototype._readBlockFromFile = function(t) {
            return this.reader.readAsArrayBuffer(t)
        }, e.prototype.createDataUnit = function(t, e) {
            var i;
            return i = t.getDataType(), new astro.FITS[i](t, e)
        }, e.prototype.excessBytes = function(t) {
            return (this.BLOCKLENGTH - t % this.BLOCKLENGTH) % this.BLOCKLENGTH
        }, e.prototype.isEOF = function() {
            return this.offset === this.length ? !0 : !1
        }, e
    }(t), s = function(t) {
        function e(t, e, i) {
            var r, o = this;
            this.arg = t, r = new u(this.arg, function() {
                return o.hdus = r.hdus, o.invoke(e, i, o)
            })
        }
        return m(e, t), e.prototype.getHDU = function(t) {
            var e, i, r, o;
            if (null != t && null != this.hdus[t]) return this.hdus[t];
            for (o = this.hdus, i = 0, r = o.length; r > i; i++)
                if (e = o[i], e.hasData()) return e
        }, e.prototype.getHeader = function(t) {
            return this.getHDU(t).header
        }, e.prototype.getDataUnit = function(t) {
            return this.getHDU(t).data
        }, e
    }(t), s.version = "0.6.5", this.astro.FITS = s, r = function(t) {
        function e(t, e) {
            e instanceof ArrayBuffer ? this.buffer = e : this.blob = e
        }
        return m(e, t), e.swapEndian = {
            B: function(t) {
                return t
            },
            I: function(t) {
                return t << 8 | t >> 8
            },
            J: function(t) {
                return (255 & t) << 24 | (65280 & t) << 8 | 65280 & t >> 8 | 255 & t >> 24
            }
        }, e.swapEndian[8] = e.swapEndian.B, e.swapEndian[16] = e.swapEndian.I, e.swapEndian[32] = e.swapEndian.J, e
    }(t), this.astro.FITS.DataUnit = r, h = {
        verifyOrder: function(t, e) {
            return e !== this.cardIndex ? console.warn("" + t + " should appear at index " + this.cardIndex + " in the FITS header") : void 0
        },
        verifyBetween: function(t, e, i, r) {
            if (!(e >= i && r >= e)) throw "The " + t + " value of " + e + " is not between " + i + " and " + r
        },
        verifyBoolean: function(t) {
            return "T" === t ? !0 : !1
        },
        VerifyFns: {
            SIMPLE: function() {
                var t, e;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = arguments[0], this.primary = !0, this.verifyOrder("SIMPLE", 0), this.verifyBoolean(e)
            },
            XTENSION: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], this.extension = !0, this.extensionType = arguments[0], this.verifyOrder("XTENSION", 0), this.extensionType
            },
            BITPIX: function() {
                var t, e, i;
                if (t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = "BITPIX", i = parseInt(arguments[0]), this.verifyOrder(e, 1), 8 !== i && 16 !== i && 32 !== i && -32 !== i && -64 !== i) throw "" + e + " value " + i + " is not permitted";
                return i
            },
            NAXIS: function() {
                var t, e, i, r, o, s;
                if (t = arguments.length >= 1 ? y.call(arguments, 0) : [], i = "NAXIS", o = parseInt(arguments[0]), e = arguments[1], !e && (this.verifyOrder(i, 2), this.verifyBetween(i, o, 0, 999), this.isExtension() && ("TABLE" === (s = this.extensionType) || "BINTABLE" === s) && (r = 2, o !== r))) throw "" + i + " must be " + r + " for TABLE and BINTABLE extensions";
                return o
            },
            PCOUNT: function() {
                var t, e, i, r, o, s;
                if (t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = "PCOUNT", o = parseInt(arguments[0]), i = 3 + this.get("NAXIS"), this.verifyOrder(e, i), this.isExtension() && ("IMAGE" === (s = this.extensionType) || "TABLE" === s) && (r = 0, o !== r)) throw "" + e + " must be " + r + " for the " + this.extensionType + " extensions";
                return o
            },
            GCOUNT: function() {
                var t, e, i, r, o, s;
                if (t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = "GCOUNT", o = parseInt(arguments[0]), i = 3 + this.get("NAXIS") + 1, this.verifyOrder(e, i), this.isExtension() && ("IMAGE" === (s = this.extensionType) || "TABLE" === s || "BINTABLE" === s) && (r = 1, o !== r)) throw "" + e + " must be " + r + " for the " + this.extensionType + " extensions";
                return o
            },
            EXTEND: function() {
                var t, e;
                if (t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = arguments[0], !this.isPrimary()) throw "EXTEND must only appear in the primary header";
                return this.verifyBoolean(e)
            },
            BSCALE: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseFloat(arguments[0])
            },
            BZERO: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseFloat(arguments[0])
            },
            BLANK: function() {
                var t, e;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = arguments[0], this.get("BITPIX") > 0 || console.warn("BLANK is not to be used for BITPIX = " + this.get("BITPIX")), parseInt(e)
            },
            DATAMIN: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseFloat(arguments[0])
            },
            DATAMAX: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseFloat(arguments[0])
            },
            EXTVER: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseInt(arguments[0])
            },
            EXTLEVEL: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseInt(arguments[0])
            },
            TFIELDS: function() {
                var t, e;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = parseInt(arguments[0]), this.verifyBetween("TFIELDS", e, 0, 999), e
            },
            TBCOL: function() {
                var t, e, i;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], i = arguments[0], e = arguments[2], this.verifyBetween("TBCOL", e, 0, this.get("TFIELDS")), i
            },
            ZIMAGE: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], this.verifyBoolean(arguments[0])
            },
            ZCMPTYPE: function() {
                var t, e;
                if (t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = arguments[0], "GZIP_1" !== e && "RICE_1" !== e && "PLIO_1" !== e && "HCOMPRESS_1" !== e) throw "ZCMPTYPE value " + e + " is not permitted";
                if ("RICE_1" !== e) throw "Compress type " + e + " is not yet implement";
                return e
            },
            ZBITPIX: function() {
                var t, e;
                if (t = arguments.length >= 1 ? y.call(arguments, 0) : [], e = parseInt(arguments[0]), 8 !== e && 16 !== e && 32 !== e && 64 !== e && -32 !== e && -64 !== e) throw "ZBITPIX value " + e + " is not permitted";
                return e
            },
            ZNAXIS: function() {
                var t, e, i;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], i = parseInt(arguments[0]), e = arguments[1], i = i, e || this.verifyBetween("ZNAXIS", i, 0, 999), i
            },
            ZTILE: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseInt(arguments[0])
            },
            ZSIMPLE: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], "T" === arguments[0] ? !0 : !1
            },
            ZPCOUNT: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseInt(arguments[0])
            },
            ZGCOUNT: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseInt(arguments[0])
            },
            ZDITHER0: function() {
                var t;
                return t = arguments.length >= 1 ? y.call(arguments, 0) : [], parseInt(arguments[0])
            }
        }
    }, this.astro.FITS.HeaderVerify = h, n = function(t) {
        function e(t) {
            var e, i, r;
            this.primary = !1, this.extension = !1, this.verifyCard = {}, r = this.VerifyFns;
            for (i in r) e = r[i], this.verifyCard[i] = this.proxy(e);
            this.cards = {}, this.cards.COMMENT = [], this.cards.HISTORY = [], this.cardIndex = 0, this.block = t, this.readBlock(t)
        }
        return m(e, t), e.include(h), e.prototype.arrayPattern = /(\D+)(\d+)/, e.prototype.maxLines = 600, e.prototype.get = function(t) {
            return this.contains(t) ? this.cards[t].value : null
        }, e.prototype.set = function(t, e, i) {
            return i = i || "", this.cards[t] = {
                index: this.cardIndex,
                value: e,
                comment: i
            }, this.cardIndex += 1
        }, e.prototype.contains = function(t) {
            return this.cards.hasOwnProperty(t)
        }, e.prototype.readLine = function(t) {
            var e, i, r, o, s, a, n;
            return s = t.slice(0, 8).trim(), (e = "" === s) ? void 0 : (o = t.slice(8, 10), a = t.slice(10), "= " !== o ? (("COMMENT" === s || "HISTORY" === s) && this.cards[s].push(a.trim()), void 0) : (n = a.split(" /"), a = n[0], i = n[1], a = a.trim(), r = a[0], "'" === r ? a = a.slice(1, -1).trim() : "T" !== a && "F" !== a && (a = parseFloat(a)), a = this.validate(s, a), this.set(s, a, i)))
        }, e.prototype.validate = function(t, e) {
            var i, r, o, s, a;
            return r = null, i = t, o = this.arrayPattern.test(t), o && (s = this.arrayPattern.exec(t), a = s.slice(1), i = a[0], r = a[1]), i in this.verifyCard && (e = this.verifyCard[i](e, o, r)), e
        }, e.prototype.readBlock = function(t) {
            var e, i, r, o, s, a, n;
            for (r = 80, o = t.length / r, o = this.maxLines > o ? o : this.maxLines, n = [], e = s = 0, a = o - 1; a >= 0 ? a >= s : s >= a; e = a >= 0 ? ++s : --s) i = t.slice(e * r, (e + 1) * r), n.push(this.readLine(i));
            return n
        }, e.prototype.hasDataUnit = function() {
            return 0 === this.get("NAXIS") ? !1 : !0
        }, e.prototype.getDataLength = function() {
            var t, e, i, r, o;
            if (!this.hasDataUnit()) return 0;
            for (i = [], t = r = 1, o = this.get("NAXIS"); o >= 1 ? o >= r : r >= o; t = o >= 1 ? ++r : --r) i.push(this.get("NAXIS" + t));
            return e = i.reduce(function(t, e) {
                return t * e
            }) * Math.abs(this.get("BITPIX")) / 8, e += this.get("PCOUNT")
        }, e.prototype.getDataType = function() {
            switch (this.extensionType) {
                case "BINTABLE":
                    return this.contains("ZIMAGE") ? "CompressedImage" : "BinaryTable";
                case "TABLE":
                    return "Table";
                default:
                    return this.hasDataUnit() ? "Image" : null
            }
        }, e.prototype.isPrimary = function() {
            return this.primary
        }, e.prototype.isExtension = function() {
            return this.extension
        }, e
    }(t), this.astro.FITS.Header = n, c = {
        getExtent: function(t) {
            var e, i, r, o;
            for (e = t.length; e--;)
                if (o = t[e], !isNaN(o)) {
                    r = i = o;
                    break
                }
            if (-1 === e) return [0 / 0, 0 / 0];
            for (; e--;) o = t[e], isNaN(o) || (r > o && (r = o), o > i && (i = o));
            return [r, i]
        },
        getPixel: function(t, e, i) {
            return t[i * this.width + e]
        }
    }, this.astro.FITS.ImageUtils = c, l = function(t) {
        function e(t) {
            var i, r, o, s, a, n, h;
            for (e.__super__.constructor.apply(this, arguments), s = t.get("NAXIS"), this.bitpix = t.get("BITPIX"), this.naxis = [], o = a = 1; s >= 1 ? s >= a : a >= s; o = s >= 1 ? ++a : --a) this.naxis.push(t.get("NAXIS" + o));
            for (this.width = t.get("NAXIS1"), this.height = t.get("NAXIS2") || 1, this.depth = t.get("NAXIS3") || 1, this.bzero = t.get("BZERO") || 0, this.bscale = t.get("BSCALE") || 1, this.bytes = Math.abs(this.bitpix) / 8, this.length = this.naxis.reduce(function(t, e) {
                return t * e
            }) * Math.abs(this.bitpix) / 8, this.frame = 0, this.frameOffsets = [], this.frameLength = this.bytes * this.width * this.height, this.nBuffers = null != this.buffer ? 1 : 2, o = n = 0, h = this.depth - 1; h >= 0 ? h >= n : n >= h; o = h >= 0 ? ++n : --n) i = o * this.frameLength, r = {
                begin: i
            }, null != this.buffer && (r.buffers = [this.buffer.slice(i, i + this.frameLength)]), this.frameOffsets.push(r)
        }
        return m(e, t), e.include(c), e.prototype.allocationSize = 16777216, e.prototype._getFrame = function(t, e, i, r) {
            var o, s, a, n, h, l, c, u;
            if (s = Math.abs(e) / 8, h = n = t.byteLength / s, a = Math.abs(e), e > 0) {
                switch (e) {
                    case 8:
                        c = new Uint8Array(t), c = new Uint16Array(c), l = function(t) {
                            return t
                        };
                        break;
                    case 16:
                        c = new Int16Array(t), l = function(t) {
                            return (255 & t) << 8 | 255 & t >> 8
                        };
                        break;
                    case 32:
                        c = new Int32Array(t), l = function(t) {
                            return (255 & t) << 24 | (65280 & t) << 8 | 65280 & t >> 8 | 255 & t >> 24
                        }
                }
                for (o = parseInt(i) !== i || parseInt(r) !== r ? new Float32Array(c.length) : c; h--;) c[h] = l(c[h]), o[h] = i + r * c[h]
            } else {
                for (o = new Uint32Array(t), l = function(t) {
                    return (255 & t) << 24 | (65280 & t) << 8 | 65280 & t >> 8 | 255 & t >> 24
                }; n--;) u = o[n], o[n] = l(u);
                for (o = new Float32Array(t); h--;) o[h] = i + r * o[h]
            }
            return o
        }, e.prototype._getFrameAsync = function(t, e, i) {
            var r, o, s, a, n, h, l, c, u, d, p, f, g, v, m = this;
            u = function(t) {
                var e, i, r, o, s, a, n;
                return a = t.data, o = a.buffer, i = a.bitpix, s = a.bzero, r = a.bscale, n = a.url, importScripts(n), e = _getFrame(o, i, s, r), postMessage(e)
            }, a = ("" + u).replace("return postMessage", "postMessage"), a = "onmessage = " + a, n = "" + this._getFrame, n = n.replace("function", "function _getFrame"), l = "application/javascript", s = new Blob([a], {
                type: l
            }), o = new Blob([n], {
                type: l
            }), r = window.URL || window.webkitURL, g = r.createObjectURL(s), f = r.createObjectURL(o), v = new Worker(g), c = {
                buffer: t[0],
                bitpix: this.bitpix,
                bzero: this.bzero,
                bscale: this.bscale,
                url: f
            }, h = 0, d = null, p = 0, v.onmessage = function(o) {
                var s;
                return s = o.data, null == d && (d = new s.constructor(m.width * m.height)), d.set(s, p), p += s.length, h += 1, h === m.nBuffers ? (m.invoke(e, i, d), r.revokeObjectURL(g), r.revokeObjectURL(f), v.terminate()) : (c.buffer = t[h], v.postMessage(c, [t[h]]))
            }, v.postMessage(c, [t[0]])
        }, e.prototype.getFrame = function(t, e, i) {
            var r, o, s, a, n, h, l, c, u, d, p, f, g = this;
            if (this.frame = t || this.frame, h = this.frameOffsets[this.frame], a = h.buffers, (null != a ? a.length : void 0) === this.nBuffers) return this._getFrameAsync(a, e, i);
            for (this.frameOffsets[this.frame].buffers = [], r = h.begin, o = this.blob.slice(r, r + this.frameLength), s = [], c = Math.floor(this.height / this.nBuffers), n = c * this.bytes * this.width, l = p = 0, f = this.nBuffers - 1; f >= 0 ? f >= p : p >= f; l = f >= 0 ? ++p : --p) d = l * n, l === this.nBuffers - 1 ? s.push(o.slice(d)) : s.push(o.slice(d, d + n));
            return a = [], u = new FileReader, u.frame = this.frame, l = 0, u.onloadend = function(r) {
                var o;
                return t = r.target.frame, o = r.target.result, g.frameOffsets[t].buffers.push(o), l += 1, l === g.nBuffers ? g.getFrame(t, e, i) : u.readAsArrayBuffer(s[l])
            }, u.readAsArrayBuffer(s[0])
        }, e.prototype.getFrames = function(t, e, i, r) {
            var o, s = this;
            return o = function(r, a) {
                return s.invoke(i, a, r), e -= 1, t += 1, e ? s.getFrame(t, o, a) : void 0
            }, this.getFrame(t, o, r)
        }, e.prototype.isDataCube = function() {
            return this.naxis.length > 2 ? !0 : !1
        }, e
    }(r), this.astro.FITS.Image = l, p = function(t) {
        function e(t) {
            e.__super__.constructor.apply(this, arguments), this.rowByteSize = t.get("NAXIS1"), this.rows = t.get("NAXIS2"), this.cols = t.get("TFIELDS"), this.length = this.rowByteSize * this.rows, this.heapLength = t.get("PCOUNT"), this.columns = this.getColumns(t), null != this.buffer ? (this.rowsInMemory = this._rowsInMemoryBuffer, this.heap = this.buffer.slice(this.length, this.length + this.heapLength)) : (this.rowsInMemory = this._rowsInMemoryBlob, this.firstRowInBuffer = this.lastRowInBuffer = 0, this.nRowsInBuffer = Math.floor(this.maxMemory / this.rowByteSize)), this.accessors = [], this.descriptors = [], this.elementByteLengths = [], this.setAccessors(t)
        }
        return m(e, t), e.prototype.maxMemory = 1048576, e.prototype._rowsInMemoryBuffer = function() {
            return !0
        }, e.prototype._rowsInMemoryBlob = function(t, e) {
            return this.firstRowInBuffer > t ? !1 : e > this.lastRowInBuffer ? !1 : !0
        }, e.prototype.getColumns = function(t) {
            var e, i, r, o, s;
            for (e = [], i = o = 1, s = this.cols; s >= 1 ? s >= o : o >= s; i = s >= 1 ? ++o : --o) {
                if (r = "TTYPE" + i, !t.contains(r)) return null;
                e.push(t.get(r))
            }
            return e
        }, e.prototype.getColumn = function(t, e, i) {
            var r, o, s, a, n, h, l, c, u, d, p, f = this;
            return null != this.blob ? (u = this.columns.indexOf(t), a = this.descriptors[u], r = this.accessors[u], n = this.elementByteLengths[u], h = this.elementByteLengths.slice(0, u), h = 0 === h.length ? 0 : h.reduce(function(t, e) {
                return t + e
            }), s = null != this.typedArray[a] ? new this.typedArray[a](this.rows) : [], p = ~~ (this.maxMemory / this.rowByteSize), p = Math.min(p, this.rows), l = this.rows / p, d = Math.floor(l) === l ? l : Math.floor(l) + 1, c = 0, u = 0, o = function(t, i) {
                var a, n, l, g;
                for (a = t.byteLength / f.rowByteSize, g = new DataView(t), n = h; a--;) s[c] = r(g, n)[0], c += 1, n += f.rowByteSize;
                return d -= 1, u += 1, d ? (l = u * p, f.getTableBuffer(l, p, o, i)) : (f.invoke(e, i, s), void 0)
            }, this.getTableBuffer(0, p, o, i)) : (o = function(i, r) {
                return s = i.map(function(e) {
                    return e[t]
                }), f.invoke(e, r, s)
            }, this.getRows(0, this.rows, o, i))
        }, e.prototype.getTableBuffer = function(t, e, i, r) {
            var o, s, a, n, h = this;
            return e = Math.min(this.rows - t, e), o = t * this.rowByteSize, a = o + e * this.rowByteSize, s = this.blob.slice(o, a), n = new FileReader, n.row = t, n.number = e, n.onloadend = function(t) {
                return h.invoke(i, r, t.target.result)
            }, n.readAsArrayBuffer(s)
        }, e.prototype.getRows = function(t, e, i, r) {
            var o, s, a, n, h, l, c = this;
            return this.rowsInMemory(t, t + e) ? (null != this.blob ? a = this.buffer : (o = t * this.rowByteSize, n = o + e * this.rowByteSize, a = this.buffer.slice(o, n)), l = this._getRows(a, e), this.invoke(i, r, l), l) : (o = t * this.rowByteSize, n = o + Math.max(this.nRowsInBuffer * this.rowByteSize, e * this.rowByteSize), s = this.blob.slice(o, n), h = new FileReader, h.row = t, h.number = e, h.onloadend = function(o) {
                var s;
                return s = o.target, c.buffer = s.result, c.firstRowInBuffer = c.lastRowInBuffer = s.row, c.lastRowInBuffer += s.number, c.getRows(t, e, i, r)
            }, h.readAsArrayBuffer(s))
        }, e
    }(r), this.astro.FITS.Tabular = p, d = function(t) {
        function e() {
            return f = e.__super__.constructor.apply(this, arguments)
        }
        return m(e, t), e.prototype.dataAccessors = {
            A: function(t) {
                return t.trim()
            },
            I: function(t) {
                return parseInt(t)
            },
            F: function(t) {
                return parseFloat(t)
            },
            E: function(t) {
                return parseFloat(t)
            },
            D: function(t) {
                return parseFloat(t)
            }
        }, e.prototype.setAccessors = function(t) {
            var e, i, r, o, s, a, n, h, l, c = this;
            for (s = /([AIFED])(\d+)\.*(\d+)*/, l = [], r = n = 1, h = this.cols; h >= 1 ? h >= n : n >= h; r = h >= 1 ? ++n : --n) i = t.get("TFORM" + r), a = t.get("TTYPE" + r), o = s.exec(i), e = o[1], l.push(function(t) {
                var e;
                return e = function(e) {
                    return c.dataAccessors[t](e)
                }, c.accessors.push(e)
            }(e));
            return l
        }, e.prototype._getRows = function(t) {
            var e, i, r, o, s, a, n, h, l, c, u, d, p, f, g, v, m, y, w;
            for (h = t.byteLength / this.rowByteSize, i = new Uint8Array(t), c = [], s = p = 0, y = h - 1; y >= 0 ? y >= p : p >= y; s = y >= 0 ? ++p : --p) {
                for (r = s * this.rowByteSize, o = r + this.rowByteSize, u = i.subarray(r, o), n = "", f = 0, v = u.length; v > f; f++) d = u[f], n += String.fromCharCode(d);
                for (n = n.trim().split(/\s+/), l = {}, w = this.accessors, a = g = 0, m = w.length; m > g; a = ++g) e = w[a], d = n[a], l[this.columns[a]] = e(d);
                c.push(l)
            }
            return c
        }, e
    }(p), this.astro.FITS.Table = d, e = function(t) {
        function e() {
            return g = e.__super__.constructor.apply(this, arguments)
        }
        return m(e, t), e.prototype.typedArray = {
            B: Uint8Array,
            I: Uint16Array,
            J: Uint32Array,
            E: Float32Array,
            D: Float64Array,
            1: Uint8Array,
            2: Uint16Array,
            4: Uint32Array
        }, e.offsets = {
            L: 1,
            B: 1,
            I: 2,
            J: 4,
            K: 8,
            A: 1,
            E: 4,
            D: 8,
            C: 8,
            M: 16
        }, e.prototype.dataAccessors = {
            L: function(t, e) {
                var i, r;
                return r = t.getInt8(e), e += 1, i = 84 === r ? !0 : !1, [i, e]
            },
            B: function(t, e) {
                var i;
                return i = t.getUint8(e), e += 1, [i, e]
            },
            I: function(t, e) {
                var i;
                return i = t.getInt16(e), e += 2, [i, e]
            },
            J: function(t, e) {
                var i;
                return i = t.getInt32(e), e += 4, [i, e]
            },
            K: function(t, e) {
                var i, r, o, s, a;
                return r = Math.abs(t.getInt32(e)), e += 4, o = Math.abs(t.getInt32(e)), e += 4, s = r % 10, i = s ? -1 : 1, r -= s, a = i * (r << 32 | o), [a, e]
            },
            A: function(t, e) {
                var i;
                return i = t.getUint8(e), i = String.fromCharCode(i), e += 1, [i, e]
            },
            E: function(t, e) {
                var i;
                return i = t.getFloat32(e), e += 4, [i, e]
            },
            D: function(t, e) {
                var i;
                return i = t.getFloat64(e), e += 8, [i, e]
            },
            C: function(t, e) {
                var i, r, o;
                return r = t.getFloat32(e), e += 4, o = t.getFloat32(e), e += 4, i = [r, o], [i, e]
            },
            M: function(t, e) {
                var i, r, o;
                return r = t.getFloat64(e), e += 8, o = t.getFloat64(e), e += 8, i = [r, o], [i, e]
            }
        }, e.prototype.toBits = function(t) {
            var e, i;
            for (e = [], i = 128; i >= 1;) e.push(t & i ? 1 : 0), i /= 2;
            return e
        }, e.prototype.getFromHeap = function(t, e, i) {
            var r, o, s, a, n;
            for (n = t.getInt32(e), e += 4, o = t.getInt32(e), e += 4, s = this.heap.slice(o, o + n), r = new this.typedArray[i](s), a = r.length; a--;) r[a] = this.constructor.swapEndian[i](r[a]);
            return [r, e]
        }, e.prototype.setAccessors = function(t) {
            var e, i, r, s, a, n, h, l, c, u, d, p = this;
            for (h = /(\d*)([P|Q]*)([L|X|B|I|J|K|A|E|D|C|M]{1})/, d = [], s = c = 1, u = this.cols; u >= 1 ? u >= c : c >= u; s = u >= 1 ? ++c : --c) r = t.get("TFORM" + s), l = t.get("TTYPE" + s), n = h.exec(r), e = parseInt(n[1]) || 1, a = n[2], i = n[3], d.push(function(t, e) {
                var i, r;
                if (p.descriptors.push(t), p.elementByteLengths.push(p.constructor.offsets[t] * e), a) switch (l) {
                    case "COMPRESSED_DATA":
                        i = function(e, i) {
                            var r, s, a;
                            return a = p.getFromHeap(e, i, t), r = a[0], i = a[1], s = new p.typedArray[p.algorithmParameters.BYTEPIX](p.ztile[0]), o.Rice(r, p.algorithmParameters.BLOCKSIZE, p.algorithmParameters.BYTEPIX, s, p.ztile[0], o.RiceSetup), [s, i]
                        };
                        break;
                    case "GZIP_COMPRESSED_DATA":
                        i = function(t, e) {
                            var i;
                            for (i = new Float32Array(p.width), s = i.length; s--;) i[s] = 0 / 0;
                            return [i, e]
                        };
                        break;
                    default:
                        i = function(e, i) {
                            return p.getFromHeap(e, i, t)
                        }
                } else 1 === e ? i = function(e, i) {
                    var r, o;
                    return o = p.dataAccessors[t](e, i), r = o[0], i = o[1], [r, i]
                } : "X" === t ? (r = Math.log(e) / Math.log(2), i = function(t, i) {
                    var o, s, a, n, h, l, c;
                    for (a = t.buffer.slice(i, i + r), h = new Uint8Array(a), s = [], l = 0, c = h.length; c > l; l++) n = h[l], o = p.toBits(n), s = s.concat(o);
                    return i += r, [s.slice(0, +(e - 1) + 1 || 9e9), i]
                }) : i = "A" === t ? function(t, i) {
                    var r, o, s, a, n, h;
                    for (o = t.buffer.slice(i, i + e), r = new Uint8Array(o), s = "", n = 0, h = r.length; h > n; n++) a = r[n], s += String.fromCharCode(a);
                    return s = s.trim(), i += e, [s, i]
                } : function(i, r) {
                    var o, a, n;
                    for (s = e, o = []; s--;) n = p.dataAccessors[t](i, r), a = n[0], r = n[1], o.push(a);
                    return [o, r]
                };
                return p.accessors.push(i)
            }(i, e));
            return d
        }, e.prototype._getRows = function(t, e) {
            var i, r, o, s, a, n, h, l, c, u, d;
            for (h = new DataView(t), o = 0, a = []; e--;) {
                for (s = {}, u = this.accessors, r = l = 0, c = u.length; c > l; r = ++l) i = u[r], d = i(h, o), n = d[0], o = d[1], s[this.columns[r]] = n;
                a.push(s)
            }
            return a
        }, e
    }(p), this.astro.FITS.BinaryTable = e, o = {
        RiceSetup: {
            1: function(t) {
                var e, i, r, o;
                return o = 1, e = 3, i = 6, r = t[0], [e, i, r, o]
            },
            2: function(t) {
                var e, i, r, o, s;
                return s = 2, i = 4, r = 14, o = 0, e = t[0], o |= e << 8, e = t[1], o |= e, [i, r, o, s]
            },
            4: function(t) {
                var e, i, r, o, s;
                return s = 4, i = 5, r = 25, o = 0, e = t[0], o |= e << 24, e = t[1], o |= e << 16, e = t[2], o |= e << 8, e = t[3], o |= e, [i, r, o, s]
            }
        },
        Rice: function(t, e, i, r, o, s) {
            var a, n, h, l, c, u, d, p, f, g, v, m, y, w, C, S;
            for (n = 1 << c, C = s[i](t), c = C[0], u = C[1], g = C[2], w = C[3], m = new Uint8Array(256), y = 8, S = [128, 255], f = S[0], d = S[1]; d >= 0;) {
                for (; d >= f;) m[d] = y, d -= 1;
                f /= 2, y -= 1
            }
            for (m[0] = 0, a = t[w++], v = 8, d = 0; o > d;) {
                for (v -= c; 0 > v;) a = a << 8 | t[w++], v += 8;
                if (l = (a >> v) - 1, a &= (1 << v) - 1, p = d + e, p > o && (p = o), 0 > l)
                    for (; p > d;) r[d] = g, d += 1;
                else if (l === u)
                    for (; p > d;) {
                        for (f = n - v, h = a << f, f -= 8; f >= 0;) a = t[w++], h |= a << f, f -= 8;
                        v > 0 ? (a = t[w++], h |= a >> -f, a &= (1 << v) - 1) : a = 0, 0 === (1 & h) ? h >>= 1 : h = ~ (h >> 1), r[d] = h + g, g = r[d], d++
                    } else
                        for (; p > d;) {
                            for (; 0 === a;) v += 8, a = t[w++];
                            for (y = v - m[a], v -= y + 1, a ^= 1 << v, v -= l; 0 > v;) a = a << 8 | t[w++], v += 8;
                            h = y << l | a >> v, a &= (1 << v) - 1, 0 === (1 & h) ? h >>= 1 : h = ~ (h >> 1), r[d] = h + g, g = r[d], d++
                        }
            }
            return r
        }
    }, this.astro.FITS.Decompress = o, i = function(t) {
        function e(t) {
            var i, r, o, s, a, n;
            for (e.__super__.constructor.apply(this, arguments), this.zcmptype = t.get("ZCMPTYPE"), this.zbitpix = t.get("ZBITPIX"), this.znaxis = t.get("ZNAXIS"), this.zblank = t.get("ZBLANK"), this.blank = t.get("BLANK"), this.zdither = t.get("ZDITHER0") || 0, this.ztile = [], i = a = 1, n = this.znaxis; n >= 1 ? n >= a : a >= n; i = n >= 1 ? ++a : --a) s = t.contains("ZTILE" + i) ? t.get("ZTILE" + i) : 1 === i ? t.get("ZNAXIS1") : 1, this.ztile.push(s);
            for (this.width = t.get("ZNAXIS1"), this.height = t.get("ZNAXIS2") || 1, this.algorithmParameters = {}, "RICE_1" === this.zcmptype && (this.algorithmParameters.BLOCKSIZE = 32, this.algorithmParameters.BYTEPIX = 4), i = 1;;) {
                if (r = "ZNAME" + i, !t.contains(r)) break;
                o = "ZVAL" + i, this.algorithmParameters[t.get(r)] = t.get(o), i += 1
            }
            this.zmaskcmp = t.get("ZMASKCMP"), this.zquantiz = t.get("ZQUANTIZ") || "LINEAR_SCALING", this.bzero = t.get("BZERO") || 0, this.bscale = t.get("BSCALE") || 1
        }
        return m(e, t), e.include(c), e.extend(o), e.randomGenerator = function() {
            var t, e, i, r, o, s, a;
            for (t = 16807, i = 2147483647, o = 1, r = new Float32Array(1e4), e = a = 0; 9999 >= a; e = ++a) s = t * o, o = s - i * parseInt(s / i), r[e] = o / i;
            return r
        }, e.randomSequence = e.randomGenerator(), e.prototype._getRows = function(t, e) {
            var i, r, o, s, a, n, h, l, c, u, d, p, f, g, v, m, y, w, C, S, x, M, b;
            for (m = new DataView(t), l = 0, r = new Float32Array(this.width * this.height); e--;) {
                for (d = {}, M = this.accessors, n = w = 0, S = M.length; S > w; n = ++w) i = M[n], b = i(m, l), v = b[0], l = b[1], d[this.columns[n]] = v;
                for (s = d.COMPRESSED_DATA || d.UNCOMPRESSED_DATA || d.GZIP_COMPRESSED_DATA, o = d.ZBLANK || this.zblank, p = d.ZSCALE || this.bscale, y = d.ZZERO || this.bzero, h = this.height - e, f = h + this.zdither - 1, g = (f - 1) % 1e4, u = parseInt(500 * this.constructor.randomSequence[g]), n = C = 0, x = s.length; x > C; n = ++C) v = s[n], a = (h - 1) * this.width + n, -2147483647 === v ? r[a] = 0 / 0 : -2147483646 === v ? r[a] = 0 : (c = this.constructor.randomSequence[u], r[a] = (v - c + .5) * p + y), u += 1, 1e4 === u && (g = (g + 1) % 1e4, u = parseInt(500 * this.randomSequence[g]))
            }
            return r
        }, e.prototype.getFrame = function(t, e, i) {
            var r, o, s = this;
            return this.heap ? (this.frame = t || this.frame, this.getRows(0, this.rows, e, i)) : (r = this.blob.slice(this.length, this.length + this.heapLength), o = new FileReader, o.onloadend = function(r) {
                return s.heap = r.target.result, s.getFrame(t, e, i)
            }, o.readAsArrayBuffer(r))
        }, e
    }(e), this.astro.FITS.CompressedImage = i, a = function() {
        function t(t, e) {
            this.header = t, this.data = e
        }
        return t.prototype.hasData = function() {
            return null != this.data ? !0 : !1
        }, t
    }(), this.astro.FITS.HDU = a
}.call(this), MOC = function() {
    function t(t) {
        return Math.log(t) / Math.LN2
    }
    MOC = function(t) {
        this.norder = void 0, this._highResCells = {}, this._lowResCells = {}, t = t || {}, this.name = t.name || "MOC", this.color = t.color || Color.getNextColor(), this.lineWidth = t.lineWidth || 1, this.isShowing = !0
    }, MOC.MAX_NORDER = 13, MOC.LOWRES_MAXORDER = 5, MOC.HIGHRES_MAXORDER = 11, MOC.PIVOT_FOV = 20, MOC.prototype.dataFromURL = function(e, i) {
        var r = this,
            o = function() {
                var e;
                try {
                    e = this.getHeader(0)
                } catch (o) {
                    return console.err("Could not get header of extension #0"), void 0
                }
                var s = this.getHeader(1);
                if (e.contains("HPXMOC")) r.order = e.get("HPXMOC");
                else if (e.contains("MOCORDER")) r.order = e.get("MOCORDER");
                else if (s.contains("HPXMOC")) r.order = s.get("HPXMOC");
                else {
                    if (!s.contains("MOCORDER")) return console.err("Can not find MOC order in FITS file"), void 0;
                    r.order = s.get("MOCORDER")
                }
                var a = this.getDataUnit(1),
                    n = a.columns[0];
                a.getRows(0, a.rows, function(e) {
                    for (var i = 0; e.length > i; i++) {
                        var o = e[i][n],
                            s = Math.floor(Math.floor(t(Math.floor(o / 4))) / 2),
                            a = o - 4 * Math.pow(4, s);
                        if (MOC.LOWRES_MAXORDER >= s) s in r._lowResCells || (r._lowResCells[s] = [], r._highResCells[s] = []), r._lowResCells[s].push(a), r._highResCells[s].push(a);
                        else if (MOC.HIGHRES_MAXORDER >= s) {
                            s in r._highResCells || (r._highResCells[s] = []), r._highResCells[s].push(a);
                            var h = MOC.LOWRES_MAXORDER,
                                l = Math.floor(a / Math.pow(4, s - h));
                            h in r._lowResCells || (r._lowResCells = []), r._lowResCells[h].push(l)
                        } else {
                            var h = MOC.LOWRES_MAXORDER,
                                l = Math.floor(a / Math.pow(4, s - h));
                            h in r._lowResCells || (r._lowResCells = []), r._lowResCells[h].push(l), h = MOC.HIGHRES_MAXORDER, l = Math.floor(a / Math.pow(4, s - h)), h in r._highResCells || (r._highResCells = []), r._highResCells[h].push(l)
                        }
                    }
                }), a = null, i && i()
            };
        this.dataURL = e;
        var s = Aladin.JSONP_PROXY + "?url=" + encodeURIComponent(this.dataURL);
        new astro.FITS(s, o)
    }, MOC.prototype.setView = function(t) {
        this.view = t
    }, MOC.prototype.draw = function(t, e, i, r, o, s, a, n) {
        if (this.isShowing) {
            var h = n > MOC.PIVOT_FOV ? this._lowResCells : this._highResCells;
            this._drawCells(t, h, n, e, i, CooFrameEnum.J2000, r, o, s, a)
        }
    }, MOC.prototype._drawCells = function(t, r, o, s, a, n, h, l, c, u) {
        t.lineWidth = this.lineWidth, t.strokeStyle = this.color, t.beginPath();
        var d = [];
        for (key in r) d.push(key);
        d.sort();
        var p, f, g;
        if (o > 80)
            for (var v, m = 0; d.length > m; m++) {
                v = parseInt(d[m]), p = 1 << v;
                for (var y = 0; r[v].length > y; y++)
                    if (g = r[v][y], v >= 3) f = i(p, g, a, n, h, l, c, u, s), f && e(t, f);
                    else
                        for (var w = Math.pow(4, 3 - v), C = g * w, S = 0; w > S; S++) f = i(8, C + S, a, n, h, l, c, u, s), f && e(t, f)
            } else {
                this.view.getVisiblePixList(3, CooFrameEnum.J2000);
                for (var x = {}, M = parseInt(d[d.length - 1]), v = 1; M >= v; v++)
                    if (p = 1 << v, 3 >= v)
                        for (var y = 0; r[v].length > y; y++) {
                            g = r[v][y];
                            for (var w = Math.pow(4, 3 - v), C = g * w, S = 0; w > S; S++) norder3Ipix = C + S, f = i(8, norder3Ipix, a, n, h, l, c, u, s), f && e(t, f), x[norder3Ipix] = 1
                        } else
                            for (var y = 0; r[v].length > y; y++) {
                                g = r[v][y];
                                var b = Math.floor(g / Math.pow(4, v - 3));
                                b in x || (f = i(p, g, a, n, h, l, c, u, s), f && e(t, f))
                            }
            }
        t.stroke()
    };
    var e = function(t, e) {
        t.moveTo(e[0].vx, e[0].vy), t.lineTo(e[1].vx, e[1].vy), t.lineTo(e[2].vx, e[2].vy), t.lineTo(e[3].vx, e[3].vy), t.lineTo(e[0].vx, e[0].vy)
    }, i = function(t, e, i, r, o, s, a, n, h) {
            for (var l = [], c = [], u = new SpatialVector, d = HealpixCache.corners_nest(e, t), p = 0; 4 > p; p++) {
                if (u.setXYZ(d[p].x, d[p].y, d[p].z), r && r != i) {
                    if (r == CooFrameEnum.J2000) {
                        var f = CooConversion.J2000ToGalactic([u.ra(), u.dec()]);
                        lon = f[0], lat = f[1]
                    } else if (r == CooFrameEnum.GAL) {
                        var f = CooConversion.GalacticToJ2000([u.ra(), u.dec()]);
                        lon = f[0], lat = f[1]
                    }
                } else lon = u.ra(), lat = u.dec();
                c[p] = h.project(lon, lat)
            }
            if (null == c[0] || null == c[1] || null == c[2] || null == c[3]) return null;
            for (var p = 0; 4 > p; p++) l[p] = AladinUtils.xyToView(c[p].X, c[p].Y, o, s, a, n);
            return 0 > l[0].vx && 0 > l[1].vx && 0 > l[2].vx && 0 > l[3].vx ? null : 0 > l[0].vy && 0 > l[1].vy && 0 > l[2].vy && 0 > l[3].vy ? null : l[0].vx >= o && l[1].vx >= o && l[2].vx >= o && l[3].vx >= o ? null : l[0].vy >= s && l[1].vy >= s && l[2].vy >= s && l[3].vy >= s ? null : l
        };
    return MOC.prototype.reportChange = function() {
        this.view.requestRedraw()
    }, MOC.prototype.show = function() {
        this.isShowing || (this.isShowing = !0, this.reportChange())
    }, MOC.prototype.hide = function() {
        this.isShowing && (this.isShowing = !1, this.reportChange())
    }, MOC
}(), CooGrid = function() {
    function t(t, e, i, r, o, s, a) {
        var n, h = AladinUtils.viewToXy(e, i, r, o, s, a);
        try {
            n = t.unproject(h.x, h.y)
        } catch (l) {
            return null
        }
        return {
            lon: n.ra,
            lat: n.dec
        }
    }
    var e = function() {};
    return e.prototype.redraw = function(e, i, r, o, s, a, n, h) {
        if (!(h > 60)) {
            var l = 0,
                c = 359.9999,
                u = -90,
                d = 90,
                p = t(i, 0, 0, o, s, a, n),
                f = t(i, o - 1, s - 1, o, s, a, n);
            c = Math.min(p.lon, f.lon), l = Math.max(p.lon, f.lon), d = Math.min(p.lat, f.lat), u = Math.max(p.lat, f.lat);
            var g = t(i, 0, s - 1, o, s, a, n);
            c = Math.min(c, g.lon), l = Math.max(l, g.lon), d = Math.min(d, g.lat), u = Math.max(u, g.lat);
            var v = t(i, o - 1, 0, o, s, a, n);
            c = Math.min(c, v.lon), l = Math.max(l, v.lon), d = Math.min(d, v.lat), u = Math.max(u, v.lat);
            var m, y, w = l - c,
                C = u - d;
            h > 10 ? (m = 4, y = 4) : h > 1 ? (m = 1, y = 1) : h > .1 ? (m = .1, y = .1) : (m = .01, y = .01);
            var S = Math.round(c % m) * m,
                x = Math.round(d % y) * y;
            e.lineWidth = 1, e.strokeStyle = "rgb(120,120,255)";
            for (var M = x; u + y > M; M += y) {
                e.beginPath();
                var b;
                if (b = AladinUtils.radecToViewXy(c, M, i, CooFrameEnum.J2000, o, s, a, n)) {
                    e.moveTo(b.vx, b.vy);
                    for (var T = 0, I = c; l + m > I; I += w / 10) T++, b = AladinUtils.radecToViewXy(I, M, i, CooFrameEnum.J2000, o, s, a, n), e.lineTo(b.vx, b.vy), 3 == T && e.strokeText(M.toFixed(2), b.vx, b.vy - 2);
                    e.stroke()
                }
            }
            for (var I = S; l + m > I; I += m) {
                e.beginPath();
                var b;
                if (b = AladinUtils.radecToViewXy(I, d, i, CooFrameEnum.J2000, o, s, a, n)) {
                    e.moveTo(b.vx, b.vy);
                    for (var T = 0, M = d; u + y > M; M += C / 10) T++, b = AladinUtils.radecToViewXy(I, M, i, CooFrameEnum.J2000, o, s, a, n), e.lineTo(b.vx, b.vy), 3 == T && e.strokeText(I.toFixed(2), b.vx, b.vy - 2);
                    e.stroke()
                }
            }
        }
    }, e
}(), Footprint = function() {
    return Footprint = function(t) {
        this.polygons = t, this.overlay = null, this.isShowing = !0, this.isSelected = !1
    }, Footprint.prototype.setOverlay = function(t) {
        this.overlay = t
    }, Footprint.prototype.show = function() {
        this.isShowing || (this.isShowing = !0, this.overlay && this.overlay.reportChange())
    }, Footprint.prototype.hide = function() {
        this.isShowing && (this.isShowing = !1, this.overlay && this.overlay.reportChange())
    }, Footprint.prototype.select = function() {
        this.isSelected || (this.isSelected = !0, this.overlay && this.overlay.reportChange())
    }, Footprint.prototype.deselect = function() {
        this.isSelected && (this.isSelected = !1, this.overlay && this.overlay.reportChange())
    }, Footprint
}(), Popup = function() {
    return Popup = function(t) {
        this.domEl = $('<div class="aladin-popup-container"><div class="aladin-popup"><a class="aladin-closeBtn">&times;</a><div class="aladin-popupTitle"></div><div class="aladin-popupText"></div></div><div class="aladin-popup-arrow"></div></div>'), this.domEl.appendTo(t);
        var e = this;
        this.domEl.find(".aladin-closeBtn").click(function() {
            e.hide()
        })
    }, Popup.prototype.hide = function() {
        this.domEl.hide()
    }, Popup.prototype.show = function() {
        this.domEl.show()
    }, Popup.prototype.setTitle = function(t) {
        this.domEl.find(".aladin-popupTitle").html(t || "")
    }, Popup.prototype.setText = function(t) {
        this.domEl.find(".aladin-popupText").html(t || ""), this.w = this.domEl.outerWidth(), this.h = this.domEl.outerHeight()
    }, Popup.prototype.setSource = function(t) {
        this.source && (this.source.popup = null), t.popup = this, this.source = t, this.setPosition(t.x, t.y)
    }, Popup.prototype.setPosition = function(t, e) {
        var i = t - this.w / 2,
            r = e - this.h + this.source.catalog.sourceSize / 2;
        this.domEl[0].style.left = i + "px", this.domEl[0].style.top = r + "px"
    }, Popup
}(), Circle = function() {
    return Circle = function(t, e, i) {
        i = i || {}, this.color = i.color || void 0, this.setCenter(t), this.setRadius(e), this.overlay = null, this.isShowing = !0, this.isSelected = !1
    }, Circle.prototype.setOverlay = function(t) {
        this.overlay = t
    }, Circle.prototype.show = function() {
        this.isShowing || (this.isShowing = !0, this.overlay && this.overlay.reportChange())
    }, Circle.prototype.hide = function() {
        this.isShowing && (this.isShowing = !1, this.overlay && this.overlay.reportChange())
    }, Circle.prototype.select = function() {
        this.isSelected || (this.isSelected = !0, this.overlay && this.overlay.reportChange())
    }, Circle.prototype.deselect = function() {
        this.isSelected && (this.isSelected = !1, this.overlay && this.overlay.reportChange())
    }, Circle.prototype.setCenter = function(t) {
        this.centerRaDec = t, this.overlay && this.overlay.reportChange()
    }, Circle.prototype.setRadius = function(t) {
        this.radiusDegrees = t, this.overlay && this.overlay.reportChange()
    }, Circle.prototype.draw = function(t, e, i, r, o, s, a) {
        if (this.isShowing) {
            var n;
            if (i != CooFrameEnum.J2000) {
                var h = CooConversion.J2000ToGalactic([this.centerRaDec[0], this.centerRaDec[1]]);
                n = e.project(h[0], h[1])
            } else n = e.project(this.centerRaDec[0], this.centerRaDec[1]); if (n) {
                var l, c = AladinUtils.xyToView(n.X, n.Y, r, o, s, a, !0),
                    u = this.centerRaDec[0],
                    d = this.centerRaDec[1] + (u > 0 ? -this.radiusDegrees : this.radiusDegrees);
                if (i != CooFrameEnum.J2000) {
                    var h = CooConversion.J2000ToGalactic([u, d]);
                    l = e.project(h[0], h[1])
                } else l = e.project(u, d); if (l) {
                    var p = AladinUtils.xyToView(l.X, l.Y, r, o, s, a, !0),
                        f = p.vx - c.vx,
                        g = p.vy - c.vy,
                        v = Math.sqrt(f * f + g * g);
                    this.color && (t.strokeStyle = this.color), t.beginPath(), t.arc(c.vx, c.vy, v, 0, 2 * Math.PI, !1), t.stroke()
                }
            }
        }
    }, Circle
}(), Polyline = function() {
    return Polyline = function(t, e) {
        e = e || {}, this.color = e.color || void 0, this.radecArray = t, this.overlay = null, this.isShowing = !0, this.isSelected = !1
    }, Polyline.prototype.setOverlay = function(t) {
        this.overlay = t
    }, Polyline.prototype.show = function() {
        this.isShowing || (this.isShowing = !0, this.overlay && this.overlay.reportChange())
    }, Polyline.prototype.hide = function() {
        this.isShowing && (this.isShowing = !1, this.overlay && this.overlay.reportChange())
    }, Polyline.prototype.select = function() {
        this.isSelected || (this.isSelected = !0, this.overlay && this.overlay.reportChange())
    }, Polyline.prototype.deselect = function() {
        this.isSelected && (this.isSelected = !1, this.overlay && this.overlay.reportChange())
    }, Polyline.prototype.draw = function(t, e, i, r, o, s, a) {
        if (this.isShowing && this.radecArray && !(2 > this.radecArray.length)) {
            this.color && (t.strokeStyle = this.color);
            var n = AladinUtils.radecToViewXy(this.radecArray[0][0], this.radecArray[0][1], e, i, r, o, s, a);
            if (n) {
                t.moveTo(n.vx, n.vy);
                for (var h, l = 1; this.radecArray.length > l && (h = AladinUtils.radecToViewXy(this.radecArray[l][0], this.radecArray[l][1], e, i, r, o, s, a), h); l++) t.lineTo(h.vx, h.vy);
                t.stroke()
            }
        }
    }, Polyline
}(), Overlay = function() {
    return Overlay = function(t) {
        t = t || {}, this.name = t.name || "overlay", this.color = t.color || Color.getNextColor(), this.lineWidth = t.lineWidth || 2, this.overlays = [], this.overlay_items = [], this.isShowing = !0
    }, Overlay.prototype.show = function() {
        this.isShowing || (this.isShowing = !0, this.reportChange())
    }, Overlay.prototype.hide = function() {
        this.isShowing && (this.isShowing = !1, this.reportChange())
    }, Overlay.parseSTCS = function(t) {
        for (var e, i = [], r = t.match(/\S+/g), o = 0, s = r.length; s > o;) {
            var a = r[o].toLowerCase();
            if ("polygon" == a && (e = [], o++, frame = r[o].toLowerCase(), "icrs" == frame || "j2000" == frame)) {
                for (; s > o + 2;) {
                    var n = parseFloat(r[o + 1]);
                    if (isNaN(n)) break;
                    var h = parseFloat(r[o + 2]);
                    e.push([n, h]), o += 2
                }
                e.push(e[0]), i.push(e)
            }
            o++
        }
        return i
    }, Overlay.prototype.addFootprints = function(t) {
        this.overlays = this.overlays.concat(t);
        for (var e = 0, i = t.length; i > e; e++) t[e].setOverlay(this);
        this.view.requestRedraw()
    }, Overlay.prototype.add = function(t) {
        this.overlay_items.push(t), t.setOverlay(this), this.view.requestRedraw()
    }, Overlay.prototype.getFootprint = function(t) {
        return this.footprints.length > t ? this.footprints[t] : null
    }, Overlay.prototype.setView = function(t) {
        this.view = t
    }, Overlay.prototype.removeAll = function() {
        this.overlays = [], this.overlay_items = []
    }, Overlay.prototype.draw = function(t, e, i, r, o, s, a) {
        if (this.isShowing) {
            t.strokeStyle = this.color, t.lineWidth = this.lineWidth, t.beginPath(), xyviews = [];
            for (var n = 0, h = this.overlays.length; h > n; n++) xyviews.push(this.drawFootprint(this.overlays[n], t, e, i, r, o, s, a));
            t.stroke(), t.strokeStyle = Overlay.increase_brightness(this.color, 80), t.beginPath();
            for (var n = 0, h = this.overlays.length; h > n; n++) this.overlays[n].isSelected && this.drawFootprintSelected(t, xyviews[n]);
            t.stroke();
            for (var n = 0; this.overlay_items.length > n; n++) this.overlay_items[n].draw(t, e, i, r, o, s, a)
        }
    }, Overlay.increase_brightness = function(t, e) {
        t = t.replace(/^\s*#|\s*$/g, ""), 3 == t.length && (t = t.replace(/(.)/g, "$1$1"));
        var i = parseInt(t.substr(0, 2), 16),
            r = parseInt(t.substr(2, 2), 16),
            o = parseInt(t.substr(4, 2), 16);
        return "#" + (0 | 256 + i + (256 - i) * e / 100).toString(16).substr(1) + (0 | 256 + r + (256 - r) * e / 100).toString(16).substr(1) + (0 | 256 + o + (256 - o) * e / 100).toString(16).substr(1)
    }, Overlay.prototype.drawFootprint = function(t, e, i, r, o, s, a, n) {
        if (!t.isShowing) return null;
        for (var h = [], l = !1, c = t.polygons, u = 0, d = c.length; d > u; u++) {
            var p;
            if (r != CooFrameEnum.J2000) {
                var f = CooConversion.J2000ToGalactic([c[u][0], c[u][1]]);
                p = i.project(f[0], f[1])
            } else p = i.project(c[u][0], c[u][1]); if (!p) return null;
            var g = AladinUtils.xyToView(p.X, p.Y, o, s, a, n);
            h.push(g), !l && o > g.vx && g.vx >= 0 && s >= g.vy && g.vy >= 0 && (l = !0)
        }
        if (l) {
            e.moveTo(h[0].vx, h[0].vy);
            for (var u = 1, d = h.length; d > u; u++) e.lineTo(h[u].vx, h[u].vy)
        }
        return h
    }, Overlay.prototype.drawFootprintSelected = function(t, e) {
        if (e) {
            var i = e;
            t.moveTo(i[0].vx, i[0].vy);
            for (var r = 1, o = i.length; o > r; r++) t.lineTo(i[r].vx, i[r].vy)
        }
    }, Overlay.prototype.reportChange = function() {
        this.view.requestRedraw()
    }, Overlay
}(), cds.Source = function() {
    return cds.Source = function(t, e, i, r) {
        this.ra = t, this.dec = e, this.data = i, this.catalog = null, this.marker = r && r.marker || !1, this.marker && (this.popupTitle = r && r.popupTitle ? r.popupTitle : "", this.popupDesc = r && r.popupDesc ? r.popupDesc : ""), this.isShowing = !0, this.isSelected = !1
    }, cds.Source.prototype.setCatalog = function(t) {
        this.catalog = t
    }, cds.Source.prototype.show = function() {
        this.isShowing || (this.isShowing = !0, this.catalog && this.catalog.reportChange())
    }, cds.Source.prototype.hide = function() {
        this.isShowing && (this.isShowing = !1, this.catalog && this.catalog.reportChange())
    }, cds.Source.prototype.select = function() {
        this.isSelected || (this.isSelected = !0, this.catalog && this.catalog.reportChange())
    }, cds.Source.prototype.deselect = function() {
        this.isSelected && (this.isSelected = !1, this.catalog && this.catalog.reportChange())
    }, cds.Source.prototype.actionClicked = function() {
        if (this.catalog && this.catalog.onClick) {
            var t = this.catalog.view;
            if ("showTable" == this.catalog.onClick) t.aladin.measurementTable.showMeasurement(this), this.select();
            else if ("showPopup" == this.catalog.onClick) {
                t.popup.setTitle("<br><br>");
                var e = '<div class="aladin-marker-measurement">';
                e += "<table>";
                for (var i in this.data) e += "<tr><td>" + i + "</td><td>" + this.data[i] + "</td></tr>";
                e += "</table>", e += "</div>", t.popup.setText(e), t.popup.setSource(this), t.popup.show()
            }
        }
    }, cds.Source.prototype.actionOtherObjectClicked = function() {
        this.catalog && this.catalog.onClick && "showTable" == this.catalog.onClick && this.deselect()
    }, cds.Source
}(), ProgressiveCat = function() {
    function t(t, e) {
        var i = ["name", "ID", "ucd", "utype", "unit", "datatype", "arraysize", "width", "precision"],
            r = [],
            o = 0;
        return t.keyRa = t.keyDec = null, $(e).find("FIELD").each(function() {
            for (var e = {}, s = 0; i.length > s; s++) {
                var a = i[s];
                $(this).attr(a) && (e[a] = $(this).attr(a))
            }
            e.ID || (e.ID = "col_" + o), t.keyRa || !e.ucd || 0 != e.ucd.indexOf("pos.eq.ra") && 0 != e.ucd.indexOf("POS_EQ_RA") || (t.keyRa = e.name ? e.name : e.ID), t.keyDec || !e.ucd || 0 != e.ucd.indexOf("pos.eq.dec") && 0 != e.ucd.indexOf("POS_EQ_DEC") || (t.keyDec = e.name ? e.name : e.ID), r.push(e), o++
        }), r
    }

    function e(t, e, i) {
        if (!t.keyRa || !t.keyDec) return [];
        lines = e.split("\n");
        for (var r = [], o = 0; i.length > o; o++) i[o].name ? r.push(i[o].name) : r.push(i[o].ID);
        for (var s = [], a = new Coo, n = 2; lines.length > n; n++) {
            var h = {}, l = lines[n].split("	");
            if (!(l.length < r.length)) {
                for (var c = 0; r.length > c; c++) h[r[c]] = l[c];
                var u, d;
                Utils.isNumber(h[t.keyRa]) && Utils.isNumber(h[t.keyDec]) ? (u = parseFloat(h[t.keyRa]), d = parseFloat(h[t.keyDec])) : (a.parse(h[t.keyRa] + " " + h[t.keyDec]), u = a.lon, d = a.lat), s.push(new cds.Source(u, d, h))
            }
        }
        return s
    }
    return ProgressiveCat = function(t, e, i, r) {
        r = r || {}, this.type = "progressivecat", this.rootUrl = t, this.frame = CooFrameEnum.fromString(e) || CooFrameEnum.J2000, this.maxOrder = i, this.isShowing = !0, this.name = r.name || "progressive-cat", this.color = r.color || Color.getNextColor(), this.sourceSize = r.sourceSize || 10, this.sourcesCache = new Utils.LRUCache(100), this.cacheCanvas = document.createElement("canvas"), this.cacheCanvas.width = this.sourceSize, this.cacheCanvas.height = this.sourceSize;
        var o = this.cacheCanvas.getContext("2d");
        o.beginPath(), o.strokeStyle = this.color, o.lineWidth = 2, o.moveTo(0, 0), o.lineTo(0, this.sourceSize), o.lineTo(this.sourceSize, this.sourceSize), o.lineTo(this.sourceSize, 0), o.lineTo(0, 0), o.stroke()
    }, ProgressiveCat.prototype = {
        init: function(t) {
            this.view = t, this.level3Sources || this.loadLevel2Sources()
        },
        loadLevel2Sources: function() {
            var i = this;
            $.ajax({
                url: i.rootUrl + "/" + "Norder2/Allsky.xml",
                method: "GET",
                success: function(r) {
                    i.fields = t(i, r), i.level2Sources = e(i, $(r).find("CSV").text(), i.fields), i.loadLevel3Sources()
                },
                error: function(t) {
                    console.log("Something went wrong: " + t)
                }
            })
        },
        loadLevel3Sources: function() {
            var t = this;
            $.ajax({
                url: t.rootUrl + "/" + "Norder3/Allsky.xml",
                method: "GET",
                success: function(i) {
                    t.level3Sources = e(t, $(i).find("CSV").text(), t.fields), t.view.requestRedraw()
                },
                error: function(t) {
                    console.log("Something went wrong: " + t)
                }
            })
        },
        draw: function(t, e, i, r, o, s, a) {
            if (this.isShowing && this.level3Sources && (this.drawSources(this.level2Sources, t, e, i, r, o, s, a), this.drawSources(this.level3Sources, t, e, i, r, o, s, a), this.tilesInView))
                for (var n, h, l, c = 0; this.tilesInView.length > c; c++) l = this.tilesInView[c], h = l[0] + "-" + l[1], n = this.sourcesCache.get(h), n && this.drawSources(n, t, e, i, r, o, s, a)
        },
        drawSources: function(t, e, i, r, o, s, a, n) {
            for (var h = 0, l = t.length; l > h; h++) this.drawSource(t[h], e, i, r, o, s, a, n)
        },
        getSources: function() {
            var t = [];
            if (this.level2Sources && (t = t.concat(this.level2Sources)), this.level3Sources && (t = t.concat(this.level3Sources)), this.tilesInView)
                for (var e, i, r, o = 0; this.tilesInView.length > o; o++) r = this.tilesInView[o], i = r[0] + "-" + r[1], e = this.sourcesCache.get(i), e && (t = t.concat(e));
            return t
        },
        drawSource: function(t, e, i, r, o, s, a, n) {
            if (t.isShowing) {
                var h, l = this.sourceSize;
                if (r != CooFrameEnum.J2000) {
                    var c = CooConversion.J2000ToGalactic([t.ra, t.dec]);
                    h = i.project(c[0], c[1])
                } else h = i.project(t.ra, t.dec); if (h) {
                    var u = AladinUtils.xyToView(h.X, h.Y, o, s, a, n);
                    if (u) {
                        if (u.vx > o + l || 0 - l > u.vx || u.vy > s + l || 0 - l > u.vy) return t.x = t.y = void 0, void 0;
                        t.x = u.vx, t.y = u.vy, e.drawImage(this.cacheCanvas, t.x - l / 2, t.y - l / 2)
                    }
                }
            }
        },
        deselectAll: function() {
            for (var t = 0; this.level2Sources.length > t; t++) this.level2Sources[t].deselect();
            for (var t = 0; this.level3Sources.length > t; t++) this.level3Sources[t].deselect();
            var e = this.sourcesCache.keys();
            for (key in e)
                if (this.sourcesCache[key])
                    for (var i = this.sourcesCache[key], t = 0; i.length > t; t++) i[t].deselect()
        },
        show: function() {
            this.isShowing || (this.isShowing = !0, this.reportChange())
        },
        hide: function() {
            this.isShowing && (this.isShowing = !1, this.reportChange())
        },
        reportChange: function() {
            this.view.requestRedraw()
        },
        getTileURL: function(t, e) {
            var i = 1e4 * Math.floor(e / 1e4);
            return this.rootUrl + "/" + "Norder" + t + "/Dir" + i + "/Npix" + e + ".tsv"
        },
        loadNeededTiles: function() {
            this.tilesInView = [], this.otherSources = [];
            var t = this.view.realNorder;
            if (t > this.maxOrder && (t = this.maxOrder), !(3 >= t)) {
                for (var i, r, o = this.view.getVisibleCells(t, this.frame), s = 4; t >= s; s++) {
                    i = [];
                    for (var a = 0; o.length > a; a++) r = Math.floor(o[a].ipix / Math.pow(4, t - s)), 0 > i.indexOf(r) && i.push(r);
                    for (var n = 0; i.length > n; n++) this.tilesInView.push([s, i[n]])
                }
                for (var h, l, a = 0; this.tilesInView.length > a; a++) h = this.tilesInView[a], l = h[0] + "-" + h[1], this.sourcesCache.get(l) || function(t, i, r) {
                    var o = i + "-" + r;
                    $.ajax({
                        url: t.getTileURL(i, r),
                        method: "GET",
                        success: function(i) {
                            t.sourcesCache.set(o, e(t, i, t.fields)), t.view.requestRedraw()
                        },
                        error: function() {
                            t.sourcesCache.set(o, [])
                        }
                    })
                }(this, h[0], h[1])
            }
        }
    }, ProgressiveCat
}(), cds.Catalog = function() {
    return cds.Catalog = function(t) {
        t = t || {}, this.type = "catalog", this.name = t.name || "catalog", this.color = t.color || Color.getNextColor(), this.sourceSize = t.sourceSize || 6, this.markerSize = t.sourceSize || 12, this.shape = t.shape || "square", this.maxNbSources = t.limit || void 0, this.onClick = t.onClick || void 0, this.displayLabel = t.displayLabel || !1, this.labelColor = t.labelColor || this.color, this.labelFont = t.labelFont || "10px sans-serif", this.displayLabel && (this.labelColumn = t.labelColumn, this.labelColumn || (this.displayLabel = !1)), this.shape instanceof Image && (this.sourceSize = this.shape.width), this.selectSize = this.sourceSize + 2, this.isShowing = !0, this.indexationNorder = 5, this.sources = [], this.hpxIdx = new HealpixIndex(this.indexationNorder), this.hpxIdx.init(), this.selectionColor = "#00ff00", this.cacheCanvas = cds.Catalog.createShape(this.shape, this.color, this.sourceSize), this.cacheMarkerCanvas = document.createElement("canvas"), this.cacheMarkerCanvas.width = this.markerSize, this.cacheMarkerCanvas.height = this.markerSize;
        var e = this.cacheMarkerCanvas.getContext("2d");
        e.fillStyle = this.color, e.beginPath();
        var i = this.markerSize / 2;
        e.arc(i, i, i - 2, 0, 2 * Math.PI, !1), e.fill(), e.lineWidth = 2, e.strokeStyle = "#ccc", e.stroke(), this.cacheSelectCanvas = document.createElement("canvas"), this.cacheSelectCanvas.width = this.selectSize, this.cacheSelectCanvas.height = this.selectSize;
        var r = this.cacheSelectCanvas.getContext("2d");
        r.beginPath(), r.strokeStyle = this.selectionColor, r.lineWidth = 2, r.moveTo(0, 0), r.lineTo(0, this.selectSize), r.lineTo(this.selectSize, this.selectSize), r.lineTo(this.selectSize, 0), r.lineTo(0, 0), r.stroke()
    }, cds.Catalog.createShape = function(t, e, i) {
        if (t instanceof Image) return t;
        var r = document.createElement("canvas");
        r.width = r.height = i;
        var o = r.getContext("2d");
        return o.beginPath(), o.strokeStyle = e, o.lineWidth = 2, "plus" == t ? (o.moveTo(i / 2, 0), o.lineTo(i / 2, i), o.stroke(), o.moveTo(0, i / 2), o.lineTo(i, i / 2), o.stroke()) : "cross" == t ? (o.moveTo(0, 0), o.lineTo(i - 1, i - 1), o.stroke(), o.moveTo(i - 1, 0), o.lineTo(0, i - 1), o.stroke()) : "rhomb" == t ? (o.moveTo(i / 2, 0), o.lineTo(0, i / 2), o.lineTo(i / 2, i), o.lineTo(i, i / 2), o.lineTo(i / 2, 0), o.stroke()) : "triangle" == t ? (o.moveTo(i / 2, 0), o.lineTo(0, i - 1), o.lineTo(i - 1, i - 1), o.lineTo(i / 2, 0), o.stroke()) : (o.moveTo(0, 0), o.lineTo(0, i), o.lineTo(i, i), o.lineTo(i, 0), o.lineTo(0, 0), o.stroke()), r
    }, cds.Catalog.parseVOTable = function(t, e, i) {
        function r(t, e) {
            t = t.replace(/^\s+/g, "");
            var r = ["name", "ID", "ucd", "utype", "unit", "datatype", "arraysize", "width", "precision"],
                o = [],
                s = 0;
            $(t).find("FIELD").each(function() {
                for (var t = {}, e = 0; r.length > e; e++) {
                    var i = r[e];
                    $(this).attr(i) && (t[i] = $(this).attr(i))
                }
                t.ID || (t.ID = "col_" + s), o.push(t), s++
            });
            var a, n;
            a = n = null;
            for (var h = 0, l = o.length; l > h; h++) {
                var c = o[h];
                if (!a && (c.ucd || c.name) ) {
                    var u = (c.ucd)?c.ucd.toLowerCase(): c.name.toLowerCase();
                    if (u.indexOf("pos.eq.ra") >= 0 || u.indexOf("pos_eq_ra") >= 0 || u == "raj2000") {
                        a = h;
                        continue;
                    }
                }
                if (!n && (c.ucd || c.name) ) {
                   var u = (c.ucd)?c.ucd.toLowerCase(): c.name.toLowerCase();
                   if (u.indexOf("pos.eq.dec") >= 0 || u.indexOf("pos_eq_dec") >= 0 || u == "dej2000") {
                        n = h;
                        continue;
                    }
              }
            }
            var d, p, f = [],
                g = new Coo;
            $(t).find("TR").each(function() {
                var t = {}, e = 0;
                $(this).find("TD").each(function() {
                    var i = o[e].name ? o[e].name : o[e].id;
                    t[i] = $(this).text(), e++
                });
                var r = o[a].name ? o[a].name : o[a].id,
                    s = o[n].name ? o[n].name : o[n].id;
                return Utils.isNumber(t[r]) && Utils.isNumber(t[s]) ? (d = parseFloat(t[r]), p = parseFloat(t[s])) : (g.parse(t[r] + " " + t[s]), d = g.lon, p = g.lat), f.push(new cds.Source(d, p, t)), i && f.length == i ? !1 : void 0
            }), e && e(f)
        }
        $.ajax({
            url: Aladin.JSONP_PROXY,
            data: {
                url: t
            },
            method: "GET",
            dataType: "text",
            success: function(t) {
                r(t, e)
            }
        })
    }, cds.Catalog.prototype.addSources = function(t) {
        this.sources = this.sources.concat(t);
        for (var e = 0, i = t.length; i > e; e++) t[e].setCatalog(this);
        this.view.requestRedraw()
    }, cds.Catalog.prototype.getSources = function() {
        return this.sources
    }, cds.Catalog.prototype.selectAll = function() {
        if (this.sources)
            for (var t = 0; this.sources.length > t; t++) this.sources[t].select()
    }, cds.Catalog.prototype.deselectAll = function() {
        if (this.sources)
            for (var t = 0; this.sources.length > t; t++) this.sources[t].deselect()
    }, cds.Catalog.prototype.getSource = function(t) {
        return this.sources.length > t ? this.sources[t] : null
    }, cds.Catalog.prototype.setView = function(t) {
        this.view = t
    }, cds.Catalog.prototype.removeAll = cds.Catalog.prototype.clear = function() {
        this.sources = []
    }, cds.Catalog.prototype.draw = function(t, e, i, r, o, s, a) {
        if (this.isShowing) {
            for (var n = 0, h = this.sources.length; h > n; n++) this.drawSource(this.sources[n], t, e, i, r, o, s, a);
            t.strokeStyle = this.selectionColor;
            for (var n = 0, h = this.sources.length; h > n; n++) this.sources[n].isSelected && this.drawSourceSelection(this.sources[n], t);
            if (this.displayLabel) {
                t.fillStyle = this.labelColor, t.font = this.labelFont;
                for (var n = 0, h = this.sources.length; h > n; n++) this.drawSourceLabel(this.sources[n], t)
            }
        }
    }, cds.Catalog.prototype.drawSource = function(t, e, i, r, o, s, a, n) {
        if (t.isShowing) {
            var h, l = this.sourceSize;
            if (r != CooFrameEnum.J2000) {
                var c = CooConversion.J2000ToGalactic([t.ra, t.dec]);
                h = i.project(c[0], c[1])
            } else h = i.project(t.ra, t.dec); if (h) {
                var u = AladinUtils.xyToView(h.X, h.Y, o, s, a, n),
                    d = t.popup ? 100 : t.sourceSize;
                if (u) {
                    if (u.vx > o + d || 0 - d > u.vx || u.vy > s + d || 0 - d > u.vy) return t.x = t.y = void 0, void 0;
                    t.x = u.vx, t.y = u.vy, t.marker ? e.drawImage(this.cacheMarkerCanvas, t.x - l / 2, t.y - l / 2) : e.drawImage(this.cacheCanvas, t.x - this.cacheCanvas.width / 2, t.y - this.cacheCanvas.height / 2), t.popup && t.popup.setPosition(t.x, t.y)
                }
            }
        }
    }, cds.Catalog.prototype.drawSourceSelection = function(t, e) {
        if (t && t.isShowing && t.x && t.y) {
            var i = this.selectSize;
            e.drawImage(this.cacheSelectCanvas, t.x - i / 2, t.y - i / 2)
        }
    }, cds.Catalog.prototype.drawSourceLabel = function(t, e) {
        if (t && t.isShowing && t.x && t.y) {
            var i = t.data[this.labelColumn];
            i && e.fillText(i, t.x, t.y)
        }
    }, cds.Catalog.prototype.reportChange = function() {
        this.view.requestRedraw()
    }, cds.Catalog.prototype.show = function() {
        this.isShowing || (this.isShowing = !0, this.reportChange())
    }, cds.Catalog.prototype.hide = function() {
        this.isShowing && (this.isShowing = !1, this.view && this.view.popup && this.view.popup.source && this.view.popup.source.catalog == this && this.view.popup.hide(), this.reportChange())
    }, cds.Catalog
}(), Tile = function() {
    function t(t, e) {
        this.img = t, this.url = e
    }
    return t.isImageOk = function(t) {
        return t.allSkyTexture ? !0 : t.src ? t.complete ? t.naturalWidth !== void 0 && 0 == t.naturalWidth ? !1 : !0 : !1 : !1
    }, t
}(), TileBuffer = function() {
    function t() {
        this.pointer = 0, this.tilesMap = {}, this.tilesArray = Array(e);
        for (var t = 0; e > t; t++) this.tilesArray[t] = new Tile(new Image, null)
    }
    var e = 800;
    return t.prototype.addTile = function(t) {
        if (this.getTile(t)) return null;
        var i = this.tilesArray[this.pointer];
        return null != i.url && (i.img.src = null, delete this.tilesMap[i.url]), this.tilesArray[this.pointer].url = t, this.tilesMap[t] = this.tilesArray[this.pointer], this.pointer++, this.pointer >= e && (this.pointer = 0), this.tilesMap[t]
    }, t.prototype.getTile = function(t) {
        return this.tilesMap[t]
    }, t
}(), ColorMap = function() {
    return ColorMap = function(t) {
        this.view = t, this.reversed = !1, this.map = "native", this.sig = this.signature()
    }, ColorMap.MAPS = {}, ColorMap.MAPS.eosb = {
        name: "Eos B",
        r: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 18, 27, 36, 45, 49, 57, 72, 81, 91, 100, 109, 118, 127, 136, 131, 139, 163, 173, 182, 191, 200, 209, 218, 227, 213, 221, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 253, 251, 249, 247, 245, 243, 241, 215, 214, 235, 234, 232, 230, 228, 226, 224, 222, 198, 196, 216, 215, 213, 211, 209, 207, 205, 203, 181, 179, 197, 196, 194, 192, 190, 188, 186, 184, 164, 162, 178, 176, 175, 173, 171, 169, 167, 165, 147, 145, 159, 157, 156, 154, 152, 150, 148, 146, 130, 128, 140, 138, 137, 135, 133, 131, 129, 127, 113, 111, 121, 119, 117, 117],
        g: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 15, 23, 31, 39, 47, 55, 57, 64, 79, 87, 95, 103, 111, 119, 127, 135, 129, 136, 159, 167, 175, 183, 191, 199, 207, 215, 200, 207, 239, 247, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 255, 255, 255, 255, 255, 255, 255, 229, 229, 255, 250, 246, 242, 238, 233, 229, 225, 198, 195, 212, 208, 204, 199, 195, 191, 187, 182, 160, 156, 169, 165, 161, 157, 153, 148, 144, 140, 122, 118, 127, 125, 123, 121, 119, 116, 114, 112, 99, 97, 106, 104, 102, 99, 97, 95, 93, 91, 80, 78, 84, 82, 80, 78, 76, 74, 72, 70, 61, 59, 63, 61, 59, 57, 55, 53, 50, 48, 42, 40, 42, 40, 38, 36, 33, 31, 29, 27, 22, 21, 21, 19, 16, 14, 12, 13, 8, 6, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        b: [116, 121, 127, 131, 136, 140, 144, 148, 153, 157, 145, 149, 170, 174, 178, 182, 187, 191, 195, 199, 183, 187, 212, 216, 221, 225, 229, 233, 238, 242, 221, 225, 255, 247, 239, 231, 223, 215, 207, 199, 172, 164, 175, 167, 159, 151, 143, 135, 127, 119, 100, 93, 95, 87, 79, 71, 63, 55, 47, 39, 28, 21, 15, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }, ColorMap.MAPS.rainbow = {
        name: "Rainbow",
        r: [0, 4, 9, 13, 18, 22, 27, 31, 36, 40, 45, 50, 54, 58, 61, 64, 68, 69, 72, 74, 77, 79, 80, 82, 83, 85, 84, 86, 87, 88, 86, 87, 87, 87, 85, 84, 84, 84, 83, 79, 78, 77, 76, 71, 70, 68, 66, 60, 58, 55, 53, 46, 43, 40, 36, 33, 25, 21, 16, 12, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 12, 21, 25, 29, 33, 42, 46, 51, 55, 63, 67, 72, 76, 80, 89, 93, 97, 101, 110, 114, 119, 123, 131, 135, 140, 144, 153, 157, 161, 165, 169, 178, 182, 187, 191, 199, 203, 208, 212, 221, 225, 229, 233, 242, 246, 250, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
        g: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 16, 21, 25, 29, 38, 42, 46, 51, 55, 63, 67, 72, 76, 84, 89, 93, 97, 106, 110, 114, 119, 127, 131, 135, 140, 144, 152, 157, 161, 165, 174, 178, 182, 187, 195, 199, 203, 208, 216, 220, 225, 229, 233, 242, 246, 250, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 250, 242, 238, 233, 229, 221, 216, 212, 208, 199, 195, 191, 187, 178, 174, 170, 165, 161, 153, 148, 144, 140, 131, 127, 123, 119, 110, 106, 102, 97, 89, 85, 80, 76, 72, 63, 59, 55, 51, 42, 38, 34, 29, 21, 17, 12, 8, 0],
        b: [0, 3, 7, 10, 14, 19, 23, 28, 32, 38, 43, 48, 53, 59, 63, 68, 72, 77, 81, 86, 91, 95, 100, 104, 109, 113, 118, 122, 127, 132, 136, 141, 145, 150, 154, 159, 163, 168, 173, 177, 182, 186, 191, 195, 200, 204, 209, 214, 218, 223, 227, 232, 236, 241, 245, 250, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 246, 242, 238, 233, 225, 220, 216, 212, 203, 199, 195, 191, 187, 178, 174, 170, 165, 157, 152, 148, 144, 135, 131, 127, 123, 114, 110, 106, 102, 97, 89, 84, 80, 76, 67, 63, 59, 55, 46, 42, 38, 34, 25, 21, 16, 12, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }, ColorMap.MAPS_CUSTOM = ["rainbow", "eosb"], ColorMap.MAPS_NAMES = ["native", "grayscale"].concat(ColorMap.MAPS_CUSTOM), ColorMap.prototype.reverse = function(t) {
        this.reversed = t ? t : !this.reversed, this.sig = this.signature(), this.view.requestRedraw()
    }, ColorMap.prototype.signature = function() {
        var t = this.map;
        return this.reversed && (t += " reversed"), t
    }, ColorMap.prototype.update = function(t) {
        this.map = t, this.sig = this.signature(), this.view.requestRedraw()
    }, ColorMap.prototype.apply = function(t) {
        if ("native" == this.sig) return t;
        if (t.cmSig == this.sig) return t.cmImg;
        var e = document.createElement("canvas");
        e.width = t.width, e.height = t.height;
        var i = e.getContext("2d");
        i.drawImage(t, 0, 0);
        var r, o, s, a = i.getImageData(0, 0, e.width, e.height),
            n = a.data,
            h = n.length,
            l = 3;
        "grayscale" == this.map ? l = 1 : ColorMap.MAPS_CUSTOM.indexOf(this.map) >= 0 && (l = 2);
        for (var c = 0; h > c; c += 4) {
            switch (l) {
                case 1:
                    r = o = s = AladinUtils.myRound((n[c] + n[c + 1] + n[c + 2]) / 3);
                    break;
                case 2:
                    this.reversed ? (r = ColorMap.MAPS[this.map].r[255 - n[c]], o = ColorMap.MAPS[this.map].g[255 - n[c + 1]], s = ColorMap.MAPS[this.map].b[255 - n[c + 2]]) : (r = ColorMap.MAPS[this.map].r[n[c]], o = ColorMap.MAPS[this.map].g[n[c + 1]], s = ColorMap.MAPS[this.map].b[n[c + 2]]);
                    break;
                default:
                    r = n[c], o = n[c + 1], s = n[c + 2]
            }
            2 != l && this.reversed && (r = 255 - r, o = 255 - o, s = 255 - s), n[c] = r, n[c + 1] = o, n[c + 2] = s
        }
        return a.data = n, i.putImageData(a, 0, 0), t.cmSig = this.sig, t.cmImg = e, t.cmImg
    }, ColorMap
}(), HpxImageSurvey = function() {
    function t(t, e, i, r, o, s, a, n, h, l, c, u, d, p, f, g, v, m) {
        g = g || 0, v = v || 0, m || (m = !1), h += g, c += g, d += g, l += v, u += v, p += v;
        var y = (i + o + a) / 3,
            w = (r + s + n) / 3,
            y = (i + o + a) / 3,
            w = (r + s + n) / 3;
        t.save(), f && (t.globalAlpha = f);
        var C = .01;
        m && (C = .01), t.beginPath(), t.moveTo((1 + C) * i - y * C, (1 + C) * r - w * C), t.lineTo((1 + C) * o - y * C, (1 + C) * s - w * C), t.lineTo((1 + C) * a - y * C, (1 + C) * n - w * C), t.closePath(), t.clip(), m && (C = .03, i = (1 + C) * i - y * C, r = (1 + C) * r - w * C, o = (1 + C) * o - y * C, s = (1 + C) * s - w * C, a = (1 + C) * a - y * C, n = (1 + C) * n - w * C);
        var S = 1 / (h * (p - u) - c * p + d * u + (c - d) * l);
        t.transform(-(l * (a - o) - u * a + p * o + (u - p) * i) * S, (u * n + l * (s - n) - p * s + (p - u) * r) * S, (h * (a - o) - c * a + d * o + (c - d) * i) * S, -(c * n + h * (s - n) - d * s + (d - c) * r) * S, (h * (p * o - u * a) + l * (c * a - d * o) + (d * u - c * p) * i) * S, (h * (p * s - u * n) + l * (c * n - d * s) + (d * u - c * p) * r) * S), t.drawImage(e, 0, 0), t.restore()
    }
    var e = function(t, i, r, o, s, a) {
        this.id = t, this.name = i, this.rootUrl = "/" === r.slice(-1) ? r.substr(0, r.length - 1) : r, a = a || {}, this.imgFormat = a.imgFormat || "jpg", this.minOrder = a.minOrder || null, this.cooFrame = CooFrameEnum.fromString(o, CooFrameEnum.J2000), this.rootUrl.indexOf("/glimpse360/aladin/data") >= 0 && (this.cooFrame = CooFrameEnum.J2000), this.maxOrder = s, this.allskyTexture = null, this.alpha = 0, this.allskyTextureSize = 0, this.lastUpdateDateNeededTiles = 0;
        for (var n = !1, h = 0; e.SURVEYS.length > h; h++) e.SURVEYS[h].id == this.id && (n = !0);
        n || e.SURVEYS.push({
            id: this.id,
            url: this.rootUrl,
            name: this.name,
            maxOrder: this.maxOrder,
            frame: this.cooFrame
        }), e.SURVEYS_OBJECTS[this.id] = this
    };
    e.UPDATE_NEEDED_TILES_DELAY = 1e3, e.prototype.init = function(t, e) {
        this.view = t, this.cm || (this.cm = new ColorMap(this.view)), this.tileBuffer = this.view.tileBuffer, this.useCors = !1;
        var i = this;
        $.support.cors ? $.ajax({
            type: "GET",
            url: this.rootUrl + "/properties",
            contentType: "text/plain",
            xhrFields: {},
            headers: {},
            success: function() {
                i.useCors = !0, i.retrieveAllskyTextures(), e && e()
            },
            error: function() {
                i.retrieveAllskyTextures(), e && e()
            }
        }) : (this.retrieveAllskyTextures(), e())
    }, e.DEFAULT_SURVEY_ID = "P/DSS2/color", e.SURVEYS_OBJECTS = {}, e.SURVEYS = [{
        id: "P/2MASS/color",
        url: "http://alasky.u-strasbg.fr/2MASS/Color",
        name: "2MASS colored",
        maxOrder: 9,
        frame: "equatorial",
        format: "jpeg"
    }, {
        id: "P/DSS2/color",
        url: "http://alasky.u-strasbg.fr/DSS/DSSColor",
        name: "DSS colored",
        maxOrder: 9,
        frame: "equatorial",
        format: "jpeg"
    }, {
        id: "P/DSS2/red",
        url: "http://alasky.u-strasbg.fr/DSS/DSS2Merged",
        name: "DSS2 Red (F+R)",
        maxOrder: 9,
        frame: "equatorial",
        format: "jpeg fits"
    }, {
        id: "P/Fermi/color",
        url: "http://alasky.u-strasbg.fr/Fermi/Color",
        name: "Fermi color",
        maxOrder: 3,
        frame: "equatorial",
        format: "jpeg"
    }, {
        id: "P/Finkbeiner",
        url: "http://alasky.u-strasbg.fr/FinkbeinerHalpha",
        maxOrder: 3,
        frame: "galactic",
        format: "jpeg fits",
        name: "Halpha"
    }, {
        id: "P/GALEXGR6/AIS/color",
        url: "http://alasky.u-strasbg.fr/GALEX/GR6-02-Color",
        name: "GALEX Allsky Imaging Survey colored",
        maxOrder: 8,
        frame: "equatorial",
        format: "jpeg"
    }, {
        id: "P/IRIS/color",
        url: "http://alasky.u-strasbg.fr/IRISColor",
        name: "IRIS colored",
        maxOrder: 3,
        frame: "galactic",
        format: "jpeg"
    }, {
        id: "P/Mellinger/color",
        url: "http://alasky.u-strasbg.fr/MellingerRGB",
        name: "Mellinger colored",
        maxOrder: 4,
        frame: "galactic",
        format: "jpeg"
    }, {
        id: "P/SDSS9/color",
        url: "http://alasky.u-strasbg.fr/SDSS/DR9/color",
        name: "SDSS9 colored",
        maxOrder: 10,
        frame: "equatorial",
        format: "jpeg"
    }, {
        id: "P/SPITZER/color",
        url: "http://alasky.u-strasbg.fr/SpitzerI1I2I4color",
        name: "IRAC color I1,I2,I4 - (GLIMPSE, SAGE, SAGE-SMC, SINGS)",
        maxOrder: 9,
        frame: "galactic",
        format: "jpeg"
    }, {
        id: "P/VTSS/Ha",
        url: "http://alasky.u-strasbg.fr/VTSS/Ha",
        maxOrder: 3,
        frame: "galactic",
        format: "png jpeg fits",
        name: "VTSS-Ha"
    }, {
        id: "P/XMM/EPIC",
        url: "http://saada.u-strasbg.fr/xmmallsky",
        name: "XMM-Newton stacked EPIC images (no phot. normalization)",
        maxOrder: 7,
        frame: "equatorial",
        format: "png jpeg fits"
    }, {
        id: "P/XMM/PN/color",
        url: "http://saada.unistra.fr/xmmpnsky",
        name: "XMM PN colored",
        maxOrder: 7,
        frame: "equatorial",
        format: "png jpeg"
    }, {
        id: "P/allWISE/color",
        url: "http://alasky.u-strasbg.fr/AllWISE/RGB-W4-W2-W1/",
        name: "AllWISE color",
        maxOrder: 8,
        frame: "equatorial",
        format: "jpeg"
    }, {
        id: "P/GLIMPSE360",
        url: "http://www.spitzer.caltech.edu/glimpse360/aladin/data",
        name: "GLIMPSE360",
        maxOrder: 9,
        frame: "equatorial",
        format: "jpeg"
    }], e.getAvailableSurveys = function() {
        return e.SURVEYS
    }, e.getSurveyInfoFromId = function(t) {
        for (var i = e.getAvailableSurveys(), r = 0; i.length > r; r++)
            if (i[r].id == t) return i[r];
        return null
    }, e.getSurveyFromId = function(t) {
        if (e.SURVEYS_OBJECTS[t]) return e.SURVEYS_OBJECTS[t];
        var i = e.getSurveyInfoFromId(t);
        return i ? new e(i.id, i.name, i.url, i.frame, i.maxOrder) : null
    }, e.prototype.getTileURL = function(t, e) {
        var i = 1e4 * Math.floor(e / 1e4);
        return this.rootUrl + "/" + "Norder" + t + "/Dir" + i + "/Npix" + e + "." + this.imgFormat
    }, e.prototype.retrieveAllskyTextures = function() {
        var t = new Image;
        this.useCors && (t.crossOrigin = "anonymous");
        var e = this;
        t.onload = function() {
            e.allskyTextureSize = t.width / 27, e.allskyTexture = t, e.view.requestRedraw()
        }, t.src = this.rootUrl + "/Norder3/Allsky." + this.imgFormat
    }, e.prototype.redrawAllsky = function(t, e, i) {
        if (!(this.view.curNorder > 6) && this.allskyTexture)
            for (var r, o, s, a = 0, n = 0, h = e.length; h > n; n++)
                if (r = e[n], s = r.ipix, this.allskyTexture && Tile.isImageOk(this.allskyTexture)) {
                    var l = this.allskyTextureSize * Math.floor(s / 27),
                        c = this.allskyTextureSize * (s - 27 * Math.floor(s / 27));
                    if (i > 40) {
                        a = .02, a = 0, o = {
                            x: (r[0].vx + r[2].vx) / 2,
                            y: (r[0].vy + r[2].vy) / 2
                        };
                        for (var u = 0; 4 > u; u++) {
                            var d = {
                                x: r[u].vx - o.x,
                                y: r[u].vy - o.y
                            };
                            r[u].vx += a * d.x, r[u].vy += a * d.y
                        }
                    }
                    this.drawOneTile(t, this.allskyTexture, r, this.allskyTextureSize, null, c, l, !0)
                }
    }, e.prototype.getColorMap = function() {
        return this.cm
    };
    var i = !0;
    return e.prototype.redrawHighres = function(t, r, o) {
        if (0 != r.length) {
            i = !i;
            var s, a, n, h, l, c, u, d, p = (new Date).getTime(),
                f = p - this.lastUpdateDateNeededTiles > e.UPDATE_NEEDED_TILES_DELAY,
                g = o - 1,
                v = [],
                m = [],
                y = {}, w = !1,
                C = [],
                S = [];
            if (f) {
                var x = [(r[0][0].vx + r[0][1].vx) / 2, (r[0][0].vy + r[0][1].vy) / 2],
                    M = r.sort(function(t, e) {
                        var i = [(t[0].vx + t[2].vx) / 2, (t[0].vy + t[2].vy) / 2],
                            r = [(e[0].vx + e[2].vx) / 2, (e[0].vy + e[2].vy) / 2],
                            o = (i[0] - x[0]) * (i[0] - x[0]) + (i[1] - x[1]) * (i[1] - x[1]),
                            s = (r[0] - x[0]) * (r[0] - x[0]) + (r[1] - x[1]) * (r[1] - x[1]);
                        return o - s
                    });
                r = M
            }
            for (var b = 0, T = r.length; T > b; b++)
                if (l = r[b], d = l.ipix, u = ~~ (d / 4), h = this.getTileURL(g, u), f && g >= 3 && (n = this.tileBuffer.addTile(h), n && S.push({
                    img: n.img,
                    url: h
                })), a = this.getTileURL(o, d), s = this.tileBuffer.getTile(a)) Tile.isImageOk(s.img) ? v.push({
                    img: s.img,
                    corners: l
                }) : (w = !0, f && !s.img.dlError && C.push({
                    img: s.img,
                    url: a
                }), g >= 3 && !y[u] && (n = this.tileBuffer.getTile(h), n && Tile.isImageOk(n.img) && (c = this.view.getPositionsInView(u, g), c && m.push({
                    img: n.img,
                    corners: c,
                    ipix: u
                })), y[u] = 1));
                else {
                    if (w = !0, f) {
                        var s = this.tileBuffer.addTile(a);
                        s && C.push({
                            img: s.img,
                            url: a
                        })
                    }
                    g >= 3 && !y[u] && (n = this.tileBuffer.getTile(h), n && Tile.isImageOk(n.img) && (c = this.view.getPositionsInView(u, g), c && m.push({
                        img: n.img,
                        corners: c,
                        ipix: u
                    })), y[u] = 1)
                }
            for (var b = 0, T = m.length; T > b; b++) this.drawOneTile(t, m[b].img, m[b].corners, m[b].img.width);
            for (var b = 0, T = v.length; T > b; b++) {
                var I = null,
                    A = v[b].img;
                A.fadingStart && A.fadingEnd && A.fadingEnd > p && (I = .2 + .8 * ((p - A.fadingStart) / (A.fadingEnd - A.fadingStart))), this.drawOneTile(t, A, v[b].corners, A.width, I)
            }
            if (f) {
                for (var b = 0, T = C.length; T > b; b++) this.view.downloader.requestDownload(C[b].img, C[b].url, this.useCors);
                for (var b = 0, T = S.length; T > b; b++) this.view.downloader.requestDownload(S[b].img, S[b].url, this.useCors);
                this.lastUpdateDateNeededTiles = p
            }
            w && this.view.requestRedrawAtDate(p + e.UPDATE_NEEDED_TILES_DELAY + 10)
        }
    }, e.prototype.drawOneTile = function(e, i, r, o, s, a, n, h) {
        var l = this.useCors ? this.cm.apply(i) : i;
        t(e, l, r[0].vx, r[0].vy, r[1].vx, r[1].vy, r[3].vx, r[3].vy, o - 1, o - 1, o - 1, 0, 0, o - 1, s, a, n, h), t(e, l, r[1].vx, r[1].vy, r[3].vx, r[3].vy, r[2].vx, r[2].vy, o - 1, 0, 0, o - 1, 0, 0, s, a, n, h)
    }, e.prototype.setAlpha = function(t) {
        t = +t, this.alpha = Math.max(0, Math.min(t, 1)), this.view.requestRedraw()
    }, e.prototype.getAlpha = function() {
        return this.alpha
    }, e
}(), HealpixGrid = function() {
    var t = function() {};
    return t.prototype.redraw = function(t, e, i, r) {
        t.lineWidth = 1, t.strokeStyle = "rgb(150,150,220)", t.beginPath();
        for (var o, s = 0, a = e.length; a > s; s++) o = e[s], ipix = o.ipix, t.moveTo(o[0].vx, o[0].vy), t.lineTo(o[1].vx, o[1].vy), t.lineTo(o[2].vx, o[2].vy);
        t.stroke(), t.strokeStyle = "#FFDDDD", t.beginPath();
        for (var s = 0, a = e.length; a > s; s++) o = e[s], ipix = o.ipix, t.strokeText(r + "/" + ipix, (o[0].vx + o[2].vx) / 2, (o[0].vy + o[2].vy) / 2);
        t.stroke()
    }, t
}(), Location = function() {
    return Location = function(t) {
        this.div = $(t)
    }, Location.prototype.update = function(t, e, i) {
        var r = new Coo(t, e, 7);
        i == CooFrameEnum.J2000 ? this.div.html(r.format("s/")) : this.div.html(r.format("d/"))
    }, Location
}(), View = function() {
    function t(e, i, r, o, s) {
        this.aladin = e, this.options = e.options, this.aladinDiv = this.aladin.aladinDiv, this.popup = new Popup(this.aladinDiv), this.createCanvases(), this.location = i, this.fovDiv = r, this.mustClearCatalog = !0, this.mustRedrawReticle = !0, this.mode = t.PAN, this.minFOV = this.maxFOV = null, this.healpixGrid = new HealpixGrid(this.imageCanvas), this.cooFrame = o ? o : CooFrameEnum.GAL;
        var a, n;
        a = n = 0, this.projectionMethod = ProjectionEnum.SIN, this.projection = new Projection(a, n), this.projection.setProjection(this.projectionMethod), this.zoomLevel = 0, this.zoomFactor = this.computeZoomFactor(this.zoomLevel), this.viewCenter = {
            lon: a,
            lat: n
        }, s && this.setZoom(s), this.imageSurvey = null, this.catalogs = [], this.overlays = [], this.mocs = [], this.tileBuffer = new TileBuffer, this.fixLayoutDimensions(), this.curNorder = 1, this.realNorder = 1, this.curOverlayNorder = 1, this.dragging = !1, this.dragx = null, this.dragy = null, this.needRedraw = !0, this.downloader = new Downloader(this), this.flagForceRedraw = !1, this.fadingLatestUpdate = null, this.dateRequestRedraw = null, this.showGrid = !1, init(this), this.resizeTimer = null;
        var h = this;
        $(window).resize(function() {
            clearTimeout(h.resizeTimer), h.resizeTimer = setTimeout(function() {
                h.fixLayoutDimensions(h)
            }, 100)
        })
    }

    function e(t, e, i, r) {
        if (t.projection) {
            var o, s = AladinUtils.viewToXy(e, i, t.width, t.height, t.largestDim, t.zoomFactor);
            try {
                o = t.projection.unproject(s.x, s.y)
            } catch (a) {}
            o && t.location.update(o.ra, o.dec, t.cooFrame, r)
        }
    }
    t.PAN = 0, t.SELECT = 1, t.DRAW_SOURCES_WHILE_DRAGGING = !0, t.DRAW_MOCS_WHILE_DRAGGING = !0, t.prototype.createCanvases = function() {
        var t = $(this.aladinDiv);
        t.find(".aladin-imageCanvas").remove(), t.find(".aladin-catalogCanvas").remove(), t.find(".aladin-reticleCanvas").remove(), this.imageCanvas = $("<canvas class='aladin-imageCanvas'></canvas>").appendTo(this.aladinDiv)[0], this.catalogCanvas = $("<canvas class='aladin-catalogCanvas'></canvas>").appendTo(this.aladinDiv)[0], this.reticleCanvas = $("<canvas class='aladin-reticleCanvas'></canvas>").appendTo(this.aladinDiv)[0]
    }, t.prototype.fixLayoutDimensions = function() {
        Utils.cssScale = void 0, this.width = $(this.aladinDiv).width(), this.height = $(this.aladinDiv).height(), this.width = Math.max(this.width, 1), this.height = Math.max(this.height, 1), this.cx = this.width / 2, this.cy = this.height / 2, this.largestDim = Math.max(this.width, this.height), this.smallestDim = Math.min(this.width, this.height), this.ratio = this.largestDim / this.smallestDim, this.mouseMoveIncrement = 160 / this.largestDim, this.imageCtx = this.imageCanvas.getContext("2d"), this.catalogCtx = this.catalogCanvas.getContext("2d"), this.reticleCtx = this.reticleCanvas.getContext("2d"), this.imageCtx.canvas.width = this.width, this.catalogCtx.canvas.width = this.width, this.reticleCtx.canvas.width = this.width, this.imageCtx.canvas.height = this.height, this.catalogCtx.canvas.height = this.height, this.reticleCtx.canvas.height = this.height, this.computeNorder(), this.requestRedraw()
    }, t.prototype.setMode = function(e) {
        this.mode = e, this.mode == t.SELECT ? this.setCursor("crosshair") : this.setCursor("default")
    }, t.prototype.setCursor = function(t) {
        this.reticleCanvas.style.cursor != t && (this.reticleCanvas.style.cursor = t)
    }, t.prototype.getCanvasDataURL = function(t) {
        t = t || "image/png";
        var e = document.createElement("canvas");
        e.width = this.width, e.height = this.height;
        var i = e.getContext("2d");
        return i.drawImage(this.imageCanvas, 0, 0), i.drawImage(this.catalogCanvas, 0, 0), i.drawImage(this.reticleCanvas, 0, 0), e.toDataURL(t)
    }, computeFov = function(t) {
        var e = doComputeFov(t, t.zoomFactor);
        return t.mouseMoveIncrement = e / t.imageCanvas.width, e
    }, doComputeFov = function(t, e) {
        if (1 > t.zoomFactor) fov = 180;
        else {
            var i = AladinUtils.viewToXy(0, t.cy, t.width, t.height, t.largestDim, e),
                r = t.projection.unproject(i.x, i.y),
                o = AladinUtils.viewToXy(t.imageCanvas.width - 1, t.cy, t.width, t.height, t.largestDim, e),
                s = t.projection.unproject(o.x, o.y);
            fov = new Coo(r.ra, r.dec).distance(new Coo(s.ra, s.dec))
        }
        return fov
    }, updateFovDiv = function(t) {
        if (isNaN(t.fov)) return t.fovDiv.html("FoV:"), void 0;
        var e;
        e = t.fov > 1 ? Math.round(100 * t.fov) / 100 + "Â°" : 60 * t.fov > 1 ? Math.round(100 * 60 * t.fov) / 100 + "'" : Math.round(100 * 3600 * t.fov) / 100 + '"', t.fovDiv.html("FoV: " + e)
    }, createListeners = function(i) {
        var r = !1;
        "ontouchstart" in window && (r = !0), onDblClick = function(t) {
            var e = i.imageCanvas.relMouseCoords(t),
                r = AladinUtils.viewToXy(e.x, e.y, i.width, i.height, i.largestDim, i.zoomFactor);
            try {
                var o = i.projection.unproject(r.x, r.y)
            } catch (s) {
                return
            }
            radec = [], radec = i.cooFrame == CooFrameEnum.GAL ? CooConversion.GalacticToJ2000([o.ra, o.dec]) : [o.ra, o.dec], i.pointTo(radec[0], radec[1])
        }, r || $(i.reticleCanvas).dblclick(onDblClick), $(i.reticleCanvas).bind("mousedown touchstart", function(e) {
            var r = i.imageCanvas.relMouseCoords(e);
            return e.originalEvent && e.originalEvent.targetTouches ? (i.dragx = e.originalEvent.targetTouches[0].clientX, i.dragy = e.originalEvent.targetTouches[0].clientY) : (i.dragx = r.x, i.dragy = r.y), i.dragging = !0, i.mode == t.PAN ? i.setCursor("move") : i.mode == t.SELECT && (i.selectStartCoo = {
                x: i.dragx,
                y: i.dragy
            }), !1
        });
        var o;
        $(i.reticleCanvas).bind("mouseup mouseout touchend", function(e) {
            if (i.mode == t.SELECT && i.dragging && i.aladin.fire("selectend", i.getObjectsInBBox(i.selectStartCoo.x, i.selectStartCoo.y, i.dragx - i.selectStartCoo.x, i.dragy - i.selectStartCoo.y)), i.dragging && (i.setCursor("default"), i.dragging = !1), i.mustClearCatalog = !0, i.mustRedrawReticle = !0, i.dragx = i.dragy = null, "mouseout" === e.type) return i.requestRedraw(), void 0;
            var r = i.imageCanvas.relMouseCoords(e),
                s = i.closestObjects(r.x, r.y, 5);
            if (s) {
                var a = s[0];
                a.marker ? (i.popup.setTitle(a.popupTitle), i.popup.setText(a.popupDesc), i.popup.setSource(a), i.popup.show()) : (i.aladin.objClickedFunction ? i.aladin.objClickedFunction(a) : (o && o.actionOtherObjectClicked(), a.actionClicked()), o = a)
            } else o && (i.aladin.measurementTable.hide(), o.actionOtherObjectClicked(), o = null, i.aladin.objClickedFunction && i.aladin.objClickedFunction(null));
            i.refreshProgressiveCats(), i.requestRedraw()
        });
        var s;
        $(i.reticleCanvas).bind("mousemove touchmove", function(o) {
            o.preventDefault();
            var a = i.imageCanvas.relMouseCoords(o);
            if (!i.dragging || r) {
                if (e(i, a.x, a.y, !0), !i.dragging && !i.mode == t.SELECT) {
                    var n = i.closestObjects(a.x, a.y, 5);
                    n ? (i.setCursor("pointer"), i.aladin.objHoveredFunction && n[0] != s && i.aladin.objHoveredFunction(n[0]), s = n[0]) : (i.setCursor("default"), i.aladin.objHoveredFunction && s && (s = null, i.aladin.objHoveredFunction(null)))
                }
                if (!r) return
            }
            var h, l, c, u;
            if (o.originalEvent && o.originalEvent.targetTouches) {
                h = o.originalEvent.targetTouches[0].clientX - i.dragx, l = o.originalEvent.targetTouches[0].clientY - i.dragy;
                var d = AladinUtils.viewToXy(o.originalEvent.targetTouches[0].clientX, o.originalEvent.targetTouches[0].clientY, i.width, i.height, i.largestDim, i.zoomFactor),
                    p = AladinUtils.viewToXy(i.dragx, i.dragy, i.width, i.height, i.largestDim, i.zoomFactor);
                c = i.projection.unproject(d.x, d.y), u = i.projection.unproject(p.x, p.y)
            } else {
                h = a.x - i.dragx, l = a.y - i.dragy;
                var d = AladinUtils.viewToXy(a.x, a.y, i.width, i.height, i.largestDim, i.zoomFactor),
                    p = AladinUtils.viewToXy(i.dragx, i.dragy, i.width, i.height, i.largestDim, i.zoomFactor);
                c = i.projection.unproject(d.x, d.y), u = i.projection.unproject(p.x, p.y)
            }
            return o.originalEvent && o.originalEvent.targetTouches ? (i.dragx = o.originalEvent.targetTouches[0].clientX, i.dragy = o.originalEvent.targetTouches[0].clientY) : (i.dragx = a.x, i.dragy = a.y), i.mode == t.SELECT ? (i.requestRedraw(), void 0) : (i.viewCenter.lon += u.ra - c.ra, i.viewCenter.lat += u.dec - c.dec, i.viewCenter.lat > 90 ? i.viewCenter.lat = 90 : -90 > i.viewCenter.lat && (i.viewCenter.lat = -90), 0 > i.viewCenter.lon ? i.viewCenter.lon = 360 + i.viewCenter.lon : i.viewCenter.lon > 360 && (i.viewCenter.lon = i.viewCenter.lon % 360), i.requestRedraw(), void 0)
        }), $(i.aladinDiv).onselectstart = function() {
            return !1
        }, $(i.reticleCanvas).on("mousewheel", function(t) {
            t.preventDefault(), t.stopPropagation();
            var e = i.zoomLevel,
                r = t.deltaY;
            return r > 0 ? e += 1 : e -= 1, i.setZoomLevel(e), !1
        })
    }, init = function(t) {
        var e = new Stats;
        e.domElement.style.top = "50px", $("#aladin-statsDiv").length > 0 && $("#aladin-statsDiv")[0].appendChild(e.domElement), t.stats = e, createListeners(t), t.displayHpxGrid = !1, t.displaySurvey = !0, t.displayCatalog = !1, t.displayReticle = !0, t.fov = computeFov(t), updateFovDiv(t), t.redraw()
    }, t.prototype.requestRedrawAtDate = function(t) {
        this.dateRequestDraw = t
    }, t.prototype.redraw = function() {
        var e = this.needRedraw;
        requestAnimFrame(this.redraw.bind(this));
        var i = (new Date).getTime();
        if (this.dateRequestDraw && i > this.dateRequestDraw) this.dateRequestDraw = null;
        else if (!this.needRedraw) {
            if (!this.flagForceRedraw) return;
            this.flagForceRedraw = !1
        }
        this.stats.update();
        var r = this.imageCtx;
        r.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height), this.projectionMethod == ProjectionEnum.SIN && (this.fov > 80 ? (r.fillStyle = "rgb(0,0,0)", r.beginPath(), r.arc(this.cx, this.cy, this.cx * this.zoomFactor, 0, 2 * Math.PI, !0), r.fill()) : 60 > this.fov && (r.fillStyle = "rgb(0,0,0)", r.fillRect(0, 0, this.imageCanvas.width, this.imageCanvas.height))), this.projection ? this.projection.setCenter(this.viewCenter.lon, this.viewCenter.lat) : this.projection = new Projection(this.viewCenter.lon, this.viewCenter.lat), this.projection.setProjection(this.projectionMethod);
        var o = this.getVisibleCells(3),
            s = null;
        if (this.curNorder >= 3 && (s = 3 == this.curNorder ? o : this.getVisibleCells(this.curNorder)), this.imageSurvey && this.imageSurvey.isReady && this.displaySurvey && (this.imageSurvey.redrawAllsky(r, o, this.fov, this.curNorder), this.curNorder >= 3 && this.imageSurvey.redrawHighres(r, s, this.curNorder)), this.overlayImageSurvey && this.overlayImageSurvey.isReady) {
            if (r.globalAlpha = this.overlayImageSurvey.getAlpha(), this.fov > 50 && this.overlayImageSurvey.redrawAllsky(r, o, this.fov, this.curOverlayNorder), this.curOverlayNorder >= 3) {
                var a = Math.min(this.curOverlayNorder, this.overlayImageSurvey.maxOrder);
                a != this.curNorder && (s = this.getVisibleCells(a)), this.overlayImageSurvey.redrawHighres(r, s, a)
            }
            r.globalAlpha = 1
        }
        this.displayHpxGrid && (s && this.curNorder > 3 ? this.healpixGrid.redraw(r, s, this.fov, this.curNorder) : this.healpixGrid.redraw(r, o, this.fov, 3)), this.showGrid && (null == this.cooGrid && (this.cooGrid = new CooGrid), this.cooGrid.redraw(r, this.projection, this.cooFrame, this.width, this.height, this.largestDim, this.zoomFactor, this.fov));
        var n = this.catalogCtx,
            h = !1;
        if (this.mustClearCatalog && (n.clearRect(0, 0, this.width, this.height), h = !0, this.mustClearCatalog = !1), this.catalogs && this.catalogs.length > 0 && this.displayCatalog && (!this.dragging || t.DRAW_SOURCES_WHILE_DRAGGING)) {
            h || (n.clearRect(0, 0, this.width, this.height), h = !0);
            for (var l = 0; this.catalogs.length > l; l++) this.catalogs[l].draw(n, this.projection, this.cooFrame, this.width, this.height, this.largestDim, this.zoomFactor)
        }
        var c = this.catalogCtx;
        if (this.overlays && this.overlays.length > 0 && (!this.dragging || t.DRAW_SOURCES_WHILE_DRAGGING)) {
            h || (n.clearRect(0, 0, this.width, this.height), h = !0);
            for (var l = 0; this.overlays.length > l; l++) this.overlays[l].draw(c, this.projection, this.cooFrame, this.width, this.height, this.largestDim, this.zoomFactor)
        }
        var u = this.catalogCtx;
        if (this.mocs && this.mocs.length > 0 && (!this.dragging || t.DRAW_MOCS_WHILE_DRAGGING)) {
            h || (n.clearRect(0, 0, this.width, this.height), h = !0);
            for (var l = 0; this.mocs.length > l; l++) this.mocs[l].draw(u, this.projection, this.cooFrame, this.width, this.height, this.largestDim, this.zoomFactor, this.fov)
        }
        this.mode == t.SELECT && (mustRedrawReticle = !0);
        var d = this.reticleCtx;
        if ((this.mustRedrawReticle || this.mode == t.SELECT) && d.clearRect(0, 0, this.width, this.height), this.displayReticle) {
            if (!this.reticleCache) {
                var p = document.createElement("canvas"),
                    f = this.options.reticleSize;
                p.width = f, p.height = f;
                var g = p.getContext("2d");
                g.lineWidth = 2, g.strokeStyle = this.options.reticleColor, g.beginPath(), g.moveTo(f / 2, f / 2 + (f / 2 - 1)), g.lineTo(f / 2, f / 2 + 2), g.moveTo(f / 2, f / 2 - (f / 2 - 1)), g.lineTo(f / 2, f / 2 - 2), g.moveTo(f / 2 + (f / 2 - 1), f / 2), g.lineTo(f / 2 + 2, f / 2), g.moveTo(f / 2 - (f / 2 - 1), f / 2), g.lineTo(f / 2 - 2, f / 2), g.stroke(), this.reticleCache = p
            }
            d.drawImage(this.reticleCache, this.width / 2 - this.reticleCache.width / 2, this.height / 2 - this.reticleCache.height / 2), this.mustRedrawReticle = !1
        }
        if (this.mode == t.SELECT && this.dragging) {
            d.fillStyle = "rgba(100, 240, 110, 0.25)";
            var v = this.dragx - this.selectStartCoo.x,
                m = this.dragy - this.selectStartCoo.y;
            d.fillRect(this.selectStartCoo.x, this.selectStartCoo.y, v, m)
        }
        e == this.needRedraw && (this.needRedraw = !1), this.dragging || this.updateObjectsLookup()
    }, t.prototype.forceRedraw = function() {
        this.flagForceRedraw = !0
    }, t.prototype.refreshProgressiveCats = function() {
        if (this.catalogs)
            for (var t = 0; this.catalogs.length > t; t++) "progressivecat" == this.catalogs[t].type && this.catalogs[t].loadNeededTiles()
    }, t.prototype.getVisiblePixList = function(t, e) {
        var i, r = Math.pow(2, t),
            o = HealpixIndex.nside2Npix(r);
        if (this.fov > 80) {
            i = [];
            for (var s = 0; o > s; s++) i.push(s)
        } else {
            var a = new HealpixIndex(r);
            a.init();
            var n = new SpatialVector,
                h = AladinUtils.viewToXy(this.cx, this.cy, this.width, this.height, this.largestDim, this.zoomFactor),
                l = this.projection.unproject(h.x, h.y),
                c = [];
            e && e != this.cooFrame ? e == CooFrameEnum.J2000 ? c = CooConversion.GalacticToJ2000([l.ra, l.dec]) : e == CooFrameEnum.GAL && (c = CooConversion.J2000ToGalactic([l.ra, l.dec])) : c = [l.ra, l.dec], n.set(c[0], c[1]);
            var u = .5 * this.fov * this.ratio;
            u *= this.fov > 60 ? 1.6 : this.fov > 12 ? 1.45 : 1.1, i = a.queryDisc(n, u * Math.PI / 180, !0, !0);
            var d = Utils.radecToPolar(c[0], c[1]);
            ipixCenter = a.ang2pix_nest(d.theta, d.phi), i.unshift(ipixCenter)
        }
        return i
    }, t.prototype.getVisibleCells = function(t, e) {
        !e && this.imageSurvey && (e = this.imageSurvey.cooFrame);
        var i, r = [],
            o = [],
            s = new SpatialVector,
            a = Math.pow(2, t),
            n = HealpixIndex.nside2Npix(a),
            h = null;
        if (this.fov > 80) {
            i = [];
            for (var l = 0; n > l; l++) i.push(l)
        } else {
            var c = new HealpixIndex(a);
            c.init();
            var u = new SpatialVector,
                d = AladinUtils.viewToXy(this.cx, this.cy, this.width, this.height, this.largestDim, this.zoomFactor),
                p = this.projection.unproject(d.x, d.y),
                f = [];
            e && e != this.cooFrame ? e == CooFrameEnum.J2000 ? f = CooConversion.GalacticToJ2000([p.ra, p.dec]) : e == CooFrameEnum.GAL && (f = CooConversion.J2000ToGalactic([p.ra, p.dec])) : f = [p.ra, p.dec], u.set(f[0], f[1]);
            var g = .5 * this.fov * this.ratio;
            g *= this.fov > 60 ? 1.6 : this.fov > 12 ? 1.45 : 1.1, i = c.queryDisc(u, g * Math.PI / 180, !0, !0);
            var v = Utils.radecToPolar(f[0], f[1]);
            h = c.ang2pix_nest(v.theta, v.phi), i.unshift(h)
        }
        for (var l, m, y, w = 0, C = i.length; C > w; w++)
            if (l = i[w], !(l == h && w > 0)) {
                var S = [];
                corners = HealpixCache.corners_nest(l, a);
                for (var x = 0; 4 > x; x++) {
                    if (s.setXYZ(corners[x].x, corners[x].y, corners[x].z), e && e != this.cooFrame) {
                        if (e == CooFrameEnum.J2000) {
                            var p = CooConversion.J2000ToGalactic([s.ra(), s.dec()]);
                            m = p[0], y = p[1]
                        } else if (e == CooFrameEnum.GAL) {
                            var p = CooConversion.GalacticToJ2000([s.ra(), s.dec()]);
                            m = p[0], y = p[1]
                        }
                    } else m = s.ra(), y = s.dec();
                    o[x] = this.projection.project(m, y)
                }
                if (null != o[0] && null != o[1] && null != o[2] && null != o[3]) {
                    for (var x = 0; 4 > x; x++) S[x] = AladinUtils.xyToView(o[x].X, o[x].Y, this.width, this.height, this.largestDim, this.zoomFactor);
                    if (!(0 > S[0].vx && 0 > S[1].vx && 0 > S[2].vx && 0 > S[3].vx || 0 > S[0].vy && 0 > S[1].vy && 0 > S[2].vy && 0 > S[3].vy || S[0].vx >= this.width && S[1].vx >= this.width && S[2].vx >= this.width && S[3].vx >= this.width || S[0].vy >= this.height && S[1].vy >= this.height && S[2].vy >= this.height && S[3].vy >= this.height)) {
                        if (this.projection.PROJECTION == ProjectionEnum.AITOFF) {
                            var M = S[0].vx - S[2].vx,
                                b = S[0].vy - S[2].vy,
                                T = Math.sqrt(M * M + b * b);
                            if (T > this.largestDim / 5) continue;
                            if (M = S[1].vx - S[3].vx, b = S[1].vy - S[3].vy, T = Math.sqrt(M * M + b * b), T > this.largestDim / 5) continue
                        }
                        S.ipix = l, r.push(S)
                    }
                }
            }
        return r
    }, t.prototype.getPositionsInView = function(t, e) {
        for (var i, r, o = [], s = new SpatialVector, a = Math.pow(2, e), n = [], h = HealpixCache.corners_nest(t, a), l = 0; 4 > l; l++) {
            if (s.setXYZ(h[l].x, h[l].y, h[l].z), this.imageSurvey && this.imageSurvey.cooFrame != this.cooFrame) {
                if (this.imageSurvey.cooFrame == CooFrameEnum.J2000) {
                    var c = CooConversion.J2000ToGalactic([s.ra(), s.dec()]);
                    i = c[0], r = c[1]
                } else if (this.imageSurvey.cooFrame == CooFrameEnum.GAL) {
                    var c = CooConversion.GalacticToJ2000([s.ra(), s.dec()]);
                    i = c[0], r = c[1]
                }
            } else i = s.ra(), r = s.dec();
            o[l] = this.projection.project(i, r)
        }
        if (null == o[0] || null == o[1] || null == o[2] || null == o[3]) return null;
        for (var l = 0; 4 > l; l++) n[l] = AladinUtils.xyToView(o[l].X, o[l].Y, this.width, this.height, this.largestDim, this.zoomFactor);
        return n
    }, t.prototype.computeZoomFactor = function(t) {
        return t > 0 ? AladinUtils.getZoomFactorForAngle(180 / Math.pow(1.15, t), this.projectionMethod) : 1 + .1 * t
    }, t.prototype.setZoom = function(t) {
        if (!(0 > t || t > 180)) {
            var e = Math.log(180 / t) / Math.log(1.15);
            this.setZoomLevel(e)
        }
    }, t.prototype.setShowGrid = function(t) {
        this.showGrid = t, this.requestRedraw()
    }, t.prototype.setZoomLevel = function(t) {
        if (this.minFOV || this.maxFOV) {
            var e = doComputeFov(this, this.computeZoomFactor(Math.max(-2, t)));
            if (this.maxFOV && e > this.maxFOV || this.minFOV && this.minFOV > e) return
        }
        if (this.zoomLevel = this.projectionMethod == ProjectionEnum.SIN ? this.aladin.options.allowFullZoomout === !0 ? this.width / this.height > 2 ? Math.max(-7, t) : .5 > this.width / this.height ? Math.max(-2, t) : Math.max(-6, t) : Math.max(-2, t) : Math.max(-7, t), this.zoomFactor = this.computeZoomFactor(this.zoomLevel), this.fov = computeFov(this), updateFovDiv(this), this.computeNorder(), this.forceRedraw(), this.requestRedraw(), !this.debounceProgCatOnZoom) {
            var i = this;
            this.debounceProgCatOnZoom = Utils.debounce(function() {
                i.refreshProgressiveCats()
            }, 300)
        }
        this.debounceProgCatOnZoom()
    }, t.prototype.computeNorder = function() {
        var t = this.fov / this.largestDim,
            e = 512,
            i = HealpixIndex.calculateNSide(3600 * e * t),
            r = Math.log(i) / Math.log(2);
        r = Math.max(r, 1), this.realNorder = r, 50 >= this.fov && 2 >= r && (r = 3), this.imageSurvey && 2 >= r && this.imageSurvey.minOrder > 2 && (r = this.imageSurvey.minOrder);
        var o = r;
        this.imageSurvey && r > this.imageSurvey.maxOrder && (r = this.imageSurvey.maxOrder), this.overlayImageSurvey && o > this.overlayImageSurvey.maxOrder && (o = this.overlayImageSurvey.maxOrder), r > HealpixIndex.ORDER_MAX && (r = HealpixIndex.ORDER_MAX), o > HealpixIndex.ORDER_MAX && (o = HealpixIndex.ORDER_MAX), this.curNorder = r, this.curOverlayNorder = o
    }, t.prototype.untaintCanvases = function() {
        this.createCanvases(), createListeners(this), this.fixLayoutDimensions()
    }, t.prototype.setOverlayImageSurvey = function(t, e) {
        if (!t) return this.overlayImageSurvey = null, this.requestRedraw(), void 0;
        $.support.cors && this.overlayImageSurvey && !this.overlayImageSurvey.useCors && this.untaintCanvases();
        var i;
        "string" == typeof t ? (i = HpxImageSurvey.getSurveyFromId(t), i || (i = HpxImageSurvey.getSurveyFromId(HpxImageSurvey.DEFAULT_SURVEY_ID))) : i = t, i.isReady = !1, this.overlayImageSurvey = i;
        var r = this;
        i.init(this, function() {
            r.computeNorder(), i.isReady = !0, r.requestRedraw(), r.updateObjectsLookup(), e && e()
        })
    }, t.prototype.setUnknownSurveyIfNeeded = function() {
        i && (this.setImageSurvey(i), i = void 0)
    };
    var i = void 0;
    return t.prototype.setImageSurvey = function(t, e) {
        if (t) {
            $.support.cors && this.imageSurvey && !this.imageSurvey.useCors && this.untaintCanvases();
            var r;
            "string" == typeof t ? (r = HpxImageSurvey.getSurveyFromId(t), r || (r = HpxImageSurvey.getSurveyFromId(HpxImageSurvey.DEFAULT_SURVEY_ID), i = t, console.log(i))) : r = t, this.tileBuffer = new TileBuffer, r.isReady = !1, this.imageSurvey = r;
            var o = this;
            r.init(this, function() {
                o.computeNorder(), r.isReady = !0, o.requestRedraw(), o.updateObjectsLookup(), e && e()
            })
        }
    }, t.prototype.requestRedraw = function() {
        this.needRedraw = !0
    }, t.prototype.changeProjection = function(t) {
        this.projectionMethod = t, this.requestRedraw()
    }, t.prototype.changeFrame = function(t) {
        if (this.cooFrame = t, this.cooFrame == CooFrameEnum.GAL) {
            var e = CooConversion.J2000ToGalactic([this.viewCenter.lon, this.viewCenter.lat]);
            this.viewCenter.lon = e[0], this.viewCenter.lat = e[1]
        } else if (this.cooFrame == CooFrameEnum.J2000) {
            var i = CooConversion.GalacticToJ2000([this.viewCenter.lon, this.viewCenter.lat]);
            this.viewCenter.lon = i[0], this.viewCenter.lat = i[1]
        }
        this.requestRedraw()
    }, t.prototype.showHealpixGrid = function(t) {
        this.displayHpxGrid = t, this.requestRedraw()
    }, t.prototype.showSurvey = function(t) {
        this.displaySurvey = t, this.requestRedraw()
    }, t.prototype.showCatalog = function(t) {
        this.displayCatalog = t, this.displayCatalog || (this.mustClearCatalog = !0), this.requestRedraw()
    }, t.prototype.showReticle = function(t) {
        this.displayReticle = t, this.mustRedrawReticle = !0, this.requestRedraw()
    }, t.prototype.pointTo = function(t, e) {
        if (t = parseFloat(t), e = parseFloat(e), !isNaN(t) && !isNaN(e)) {
            if (this.cooFrame == CooFrameEnum.J2000) this.viewCenter.lon = t, this.viewCenter.lat = e;
            else if (this.cooFrame == CooFrameEnum.GAL) {
                var i = CooConversion.J2000ToGalactic([t, e]);
                this.viewCenter.lon = i[0], this.viewCenter.lat = i[1]
            }
            this.forceRedraw(), this.requestRedraw();
            var r = this;
            setTimeout(function() {
                r.refreshProgressiveCats()
            }, 1e3)
        }
    }, t.prototype.makeUniqLayerName = function(t) {
        if (!this.layerNameExists(t)) return t;
        for (var e = 1;; ++e) {
            var i = t + "_" + e;
            if (!this.layerNameExists(i)) return i
        }
    }, t.prototype.layerNameExists = function(t) {
        for (var e = this.catalogs, i = 0; e.length > i; i++)
            if (t == e[i].name) return !0;
        return !1
    }, t.prototype.removeLayers = function() {
        this.catalogs = [], this.overlays = [], this.requestRedraw()
    }, t.prototype.addCatalog = function(t) {
        t.name = this.makeUniqLayerName(t.name), this.catalogs.push(t), "catalog" == t.type ? t.setView(this) : "progressivecat" == t.type && t.init(this)
    }, t.prototype.addOverlay = function(t) {
        this.overlays.push(t), t.setView(this)
    }, t.prototype.addMOC = function(t) {
        this.mocs.push(t), t.setView(this)
    }, t.prototype.getObjectsInBBox = function(t, e, i, r) {
        0 > i && (t += i, i = -i), 0 > r && (e += r, r = -r);
        var o, s, a, n = [];
        if (this.catalogs)
            for (var h = 0; this.catalogs.length > h; h++)
                if (o = this.catalogs[h], o.isShowing) {
                    s = o.getSources();
                    for (var l = 0; s.length > l; l++) a = s[l], a.isShowing && a.x && a.y && a.x >= t && t + i >= a.x && a.y >= e && e + r >= a.y && n.push(a)
                }
        return n
    }, t.prototype.updateObjectsLookup = function() {
        this.objLookup = [];
        var t, e, i, r, o;
        if (this.catalogs)
            for (var s = 0; this.catalogs.length > s; s++)
                if (t = this.catalogs[s], t.isShowing) {
                    e = t.getSources();
                    for (var a = 0; e.length > a; a++) i = e[a], i.isShowing && i.x && i.y && (r = i.x, o = i.y, this.objLookup[r] || (this.objLookup[r] = []), this.objLookup[r][o] || (this.objLookup[r][o] = []), this.objLookup[r][o].push(i))
                }
    }, t.prototype.closestObjects = function(t, e, i) {
        if (!this.objLookup) return null;
        for (var r, o, s = 0; i >= s; s++) {
            r = o = null;
            for (var a = -i; i >= a; a++)
                if (this.objLookup[t + a])
                    for (var n = -i; i >= n; n++)
                        if (this.objLookup[t + a][e + n])
                            if (r) {
                                var h = a * a + n * n;
                                o > h && (o = h, r = this.objLookup[t + a][e + n])
                            } else r = this.objLookup[t + a][e + n];
            if (r) return r
        }
        return null
    }, t
}(), Aladin = function() {
    var t = function(e, i) {
        if (0 == $(e).length) return console.log("Could not find div " + e + ". Aborting creation of Aladin Lite instance"), void 0;
        HealpixCache.init();
        var r = this;
        if (void 0 === i && (i = this.getOptionsFromQueryString()), i = i || {}, "zoom" in i) {
            var o = i.zoom;
            delete i.zoom, i.fov = o
        }
        var s = {};
        for (var a in t.DEFAULT_OPTIONS) s[a] = void 0 !== i[a] ? i[a] : t.DEFAULT_OPTIONS[a];
        for (var a in i) void 0 === t.DEFAULT_OPTIONS[a] && (s[a] = i[a]);
        this.options = s, this.aladinDiv = e, $(e).addClass("aladin-container");
        var n = CooFrameEnum.fromString(s.cooFrame, CooFrameEnum.J2000),
            h = n == CooFrameEnum.J2000,
            l = $('<div class="aladin-location">' + (s.showFrame ? '<select class="aladin-frameChoice"><option value="' + CooFrameEnum.J2000 + '" ' + (h ? 'selected="selected"' : "") + '>J2000</option><option value="' + CooFrameEnum.GAL + '" ' + (h ? "" : 'selected="selected"') + ">GAL</option></select>" : "") + '<span class="aladin-location-text"></span></div>').appendTo(e),
            c = $('<div class="aladin-fov"></div>').appendTo(e);
        s.showZoomControl && $('<div class="aladin-zoomControl"><a href="#" class="zoomPlus" title="Zoom in">+</a><a href="#" class="zoomMinus" title="Zoom out">&ndash;</a></div>').appendTo(e), s.showFullscreenControl && $('<div class="aladin-fullscreenControl aladin-maximize" title="Full screen"></div>').appendTo(e), this.fullScreenBtn = $(e).find(".aladin-fullscreenControl"), this.fullScreenBtn.click(function() {
            r.toggleFullscreen()
        }), $("<div class='aladin-logo-container'><a href='http://aladin.u-strasbg.fr/' title='Powered by Aladin Lite' target='_blank'><div class='aladin-logo'></div></a></div>").appendTo(e), this.boxes = [], this.measurementTable = new MeasurementTable(e);
        var u = new Location(l.find(".aladin-location-text"));
        if (this.view = new View(this, u, c, n, s.fov), this.view.setShowGrid(s.showCooGrid), $.ajax({
            url: "http://aladin.u-strasbg.fr/java/nph-aladin.pl",
            data: {
                frame: "aladinLiteDic"
            },
            method: "GET",
            dataType: "jsonp",
            success: function(t) {
                for (var e = {}, i = 0; t.length > i; i++) e[t[i].id] = !0;
                for (var i = 0; HpxImageSurvey.SURVEYS.length > i; i++) e[HpxImageSurvey.SURVEYS[i].id] || t.push(HpxImageSurvey.SURVEYS[i]);
                HpxImageSurvey.SURVEYS = t, r.view.setUnknownSurveyIfNeeded()
            },
            error: function() {}
        }), s.showLayersControl) {
            var d = $('<div class="aladin-layersControl-container" title="Manage layers"><div class="aladin-layersControl"></div></div>');
            d.appendTo(e);
            var p = $('<div class="aladin-box aladin-layerBox aladin-cb-list"></div>');
            p.appendTo(e), this.boxes.push(p), d.click(function() {
                return r.hideBoxes(), r.showLayerBox(), !1
            })
        }
        if (s.showGotoControl) {
            var d = $('<div class="aladin-gotoControl-container" title="Go to position"><div class="aladin-gotoControl"></div></div>');
            d.appendTo(e);
            var f = $('<div class="aladin-box aladin-gotoBox"><a class="aladin-closeBtn">&times;</a><div style="clear: both;"></div><form class="aladin-target-form">Go to: <input type="text" placeholder="Object name/position" /></form></div>');
            f.appendTo(e), this.boxes.push(f);
            var g = f.find(".aladin-target-form input");
            g.on("paste keydown", function() {
                $(this).removeClass("aladin-unknownObject")
            }), d.click(function() {
                return r.hideBoxes(), g.val(""), g.removeClass("aladin-unknownObject"), f.show(), g.focus(), !1
            }), f.find(".aladin-closeBtn").click(function() {
                return r.hideBoxes(), !1
            })
        }
        if (s.showShareControl) {
            var d = $('<div class="aladin-shareControl-container" title="Share current view"><div class="aladin-shareControl"></div></div>');
            d.appendTo(e);
            var v = $('<div class="aladin-box aladin-shareBox"><a class="aladin-closeBtn">&times;</a><div style="clear: both;"></div><b>Share</b><input type="text" class="aladin-shareInput" /></div>');
            v.appendTo(e), this.boxes.push(v), d.click(function() {
                return r.hideBoxes(), v.show(), !1
            }), v.find(".aladin-closeBtn").click(function() {
                return r.hideBoxes(), !1
            })
        }
        if (this.gotoObject(s.target), s.log) {
            var m = i;
            m.version = t.VERSION, Logger.log("startup", m)
        }
        if (this.showReticle(s.showReticle), s.catalogUrls)
            for (var y = 0, w = s.catalogUrls.length; w > y; y++) this.createCatalogFromVOTable(s.catalogUrls[y]);
        this.setImageSurvey(s.survey), this.view.showCatalog(s.showCatalog);
        var C = this;
        $(e).find(".aladin-frameChoice").change(function() {
            C.setFrame($(this).val())
        }), $("#projectionChoice").change(function() {
            C.setProjection($(this).val())
        }), $(e).find(".aladin-target-form").submit(function() {
            return C.gotoObject($(this).find("input").val(), function() {
                $(e).find(".aladin-target-form input").addClass("aladin-unknownObject")
            }), !1
        });
        var S = $(e).find(".zoomPlus");
        S.click(function() {
            return C.increaseZoom(), !1
        }), S.bind("mousedown", function(t) {
            t.preventDefault()
        });
        var x = $(e).find(".zoomMinus");
        x.click(function() {
            return C.decreaseZoom(), !1
        }), x.bind("mousedown", function(t) {
            t.preventDefault()
        }), s.fullScreen && window.setTimeout(function() {
            r.toggleFullscreen()
        }, 1e3)
    };
    t.VERSION = "2015-10-16", t.JSONP_PROXY = "http://alasky.u-strasbg.fr/cgi/JSONProxy", t.DEFAULT_OPTIONS = {
        target: "0 +0",
        cooFrame: "J2000",
        survey: "P/DSS2/color",
        fov: 60,
        showReticle: !0,
        showZoomControl: !0,
        showFullscreenControl: !0,
        showLayersControl: !0,
        showGotoControl: !0,
        showShareControl: !1,
        showCatalog: !0,
        showFrame: !0,
        showCooGrid: !1,
        fullScreen: !1,
        reticleColor: "rgb(178, 50, 178)",
        reticleSize: 22,
        log: !0,
        allowFullZoomout: !1
    }, t.prototype.toggleFullscreen = function() {
        this.fullScreenBtn.toggleClass("aladin-maximize aladin-restore");
        var t = this.fullScreenBtn.hasClass("aladin-restore");
        this.fullScreenBtn.attr("title", t ? "Restore original size" : "Full screen"), $(this.aladinDiv).toggleClass("aladin-fullscreen"), this.view.fixLayoutDimensions()
    }, t.prototype.updateSurveysDropdownList = function(t) {
        t = t.sort(function(t, e) {
            return t.order ? t.order && t.order > e.order ? 1 : -1 : t.id > e.id
        });
        var e = $(this.aladinDiv).find(".aladin-surveySelection");
        e.empty();
        for (var i = 0; t.length > i; i++) {
            var r = this.view.imageSurvey.id == t[i].id;
            e.append($("<option />").attr("selected", r).val(t[i].id).text(t[i].name))
        }
    }, t.prototype.getOptionsFromQueryString = function() {
        var t = {}, e = $.urlParam("target");
        e && (t.target = e);
        var i = $.urlParam("frame");
        i && CooFrameEnum[i] && (t.frame = i);
        var r = $.urlParam("survey");
        r && HpxImageSurvey.getSurveyInfoFromId(r) && (t.survey = r);
        var o = $.urlParam("zoom");
        o && o > 0 && 180 > o && (t.zoom = o);
        var s = $.urlParam("showReticle");
        s && (t.showReticle = "true" == s.toLowerCase());
        var a = $.urlParam("cooFrame");
        a && (t.cooFrame = a);
        var n = $.urlParam("fullScreen");
        return void 0 !== n && (t.fullScreen = n), t
    }, t.prototype.setZoom = function(t) {
        this.view.setZoom(t)
    }, t.prototype.setFoV = function(t) {
        this.view.setZoom(t)
    }, t.prototype.setFrame = function(t) {
        if (t) {
            var e = CooFrameEnum.fromString(t, CooFrameEnum.J2000);
            e != this.view.cooFrame && (this.view.changeFrame(e), $(this.aladinDiv).find(".aladin-frameChoice").val(e))
        }
    }, t.prototype.setProjection = function(t) {
        if (t) switch (t = t.toLowerCase()) {
            case "aitoff":
                this.view.changeProjection(ProjectionEnum.AITOFF);
                break;
            case "sinus":
            default:
                this.view.changeProjection(ProjectionEnum.SIN)
        }
    }, t.prototype.gotoObject = function(t, e) {
        var i = /[a-zA-Z]/.test(t);
        if (i) {
            var r = this;
            Sesame.resolve(t, function(t) {
                var e = t.Target.Resolver.jradeg,
                    i = t.Target.Resolver.jdedeg;
                r.view.pointTo(e, i)
            }, function(i) {
                console && (console.log("Could not resolve object name " + t), console.log(i)), e && e()
            })
        } else {
            var o = new Coo;
            o.parse(t);
            var s = [o.lon, o.lat];
            this.view.cooFrame == CooFrameEnum.GAL && (s = CooConversion.GalacticToJ2000(s)), this.view.pointTo(s[0], s[1])
        }
    }, t.prototype.gotoPosition = function(t, e) {
        var i;
        i = this.view.cooFrame == CooFrameEnum.GAL ? CooConversion.GalacticToJ2000([t, e]) : [t, e], this.view.pointTo(i[0], i[1])
    };
    var e = function(t) {
        var i = t.animationParams;
        if (null != i) {
            var r = (new Date).getTime();
            if (r > i.end) return t.gotoRaDec(i.raEnd, i.decEnd), i.complete && i.complete(), void 0;
            var o = i.raStart + (i.raEnd - i.raStart) * (r - i.start) / (i.end - i.start),
                s = i.decStart + (i.decEnd - i.decStart) * (r - i.start) / (i.end - i.start);
            t.gotoRaDec(o, s), setTimeout(function() {
                e(t)
            }, 50)
        }
    };
    return t.prototype.animateToRaDec = function(t, i, r, o) {
        r = r || 5, this.animationParams = null, e(this);
        var s = {};
        s.start = (new Date).getTime(), s.end = (new Date).getTime() + 1e3 * r;
        var a = this.getRaDec();
        s.raStart = a[0], s.decStart = a[1], s.raEnd = t, s.decEnd = i, s.complete = o, this.animationParams = s, e(this)
    }, t.prototype.getRaDec = function() {
        if (this.view.cooFrame == CooFrameEnum.J2000) return [this.view.viewCenter.lon, this.view.viewCenter.lat];
        var t = CooConversion.GalacticToJ2000([this.view.viewCenter.lon, this.view.viewCenter.lat]);
        return t
    }, t.prototype.gotoRaDec = function(t, e) {
        this.view.pointTo(t, e)
    }, t.prototype.showHealpixGrid = function(t) {
        this.view.showHealpixGrid(t)
    }, t.prototype.showSurvey = function(t) {
        this.view.showSurvey(t)
    }, t.prototype.showCatalog = function(t) {
        this.view.showCatalog(t)
    }, t.prototype.showReticle = function(t) {
        this.view.showReticle(t), $("#displayReticle").attr("checked", t)
    }, t.prototype.removeLayers = function() {
        this.view.removeLayers()
    }, t.prototype.addCatalog = function(t) {
        this.view.addCatalog(t)
    }, t.prototype.addOverlay = function(t) {
        this.view.addOverlay(t)
    }, t.prototype.addMOC = function(t) {
        this.view.addMOC(t)
    }, t.prototype.createImageSurvey = function(t, e, i, r, o, s) {
        return new HpxImageSurvey(t, e, i, r, o, s)
    }, t.prototype.getBaseImageLayer = function() {
        return this.view.imageSurvey
    }, t.prototype.setImageSurvey = function(t, e) {
        if (this.view.setImageSurvey(t, e), this.updateSurveysDropdownList(HpxImageSurvey.getAvailableSurveys()), this.options.log) {
            var i = t;
            "string" != typeof t && (i = t.rootUrl), Logger.log("changeImageSurvey", i)
        }
    }, t.prototype.setBaseImageLayer = t.prototype.setImageSurvey, t.prototype.getOverlayImageLayer = function() {
        return this.view.overlayImageSurvey
    }, t.prototype.setOverlayImageLayer = function(t, e) {
        this.view.setOverlayImageSurvey(t, e)
    }, t.prototype.increaseZoom = function(t) {
        t || (t = 5), this.view.setZoomLevel(this.view.zoomLevel + t)
    }, t.prototype.decreaseZoom = function(t) {
        t || (t = 5), this.view.setZoomLevel(this.view.zoomLevel - t)
    }, t.prototype.createCatalog = function(t) {
        return A.catalog(t)
    }, t.prototype.createProgressiveCatalog = function(t, e, i, r) {
        return new ProgressiveCat(t, e, i, r)
    }, t.prototype.createSource = function(t, e, i) {
        return new cds.Source(t, e, i)
    }, t.prototype.createMarker = function(t, e, i, r) {
        return i = i || {}, i.marker = !0, new cds.Source(t, e, r, i)
    }, t.prototype.createOverlay = function(t) {
        return new Overlay(t)
    }, t.prototype.createFootprintsFromSTCS = function(t) {
        for (var e = Overlay.parseSTCS(t), i = [], r = 0, o = e.length; o > r; r++) i.push(new Footprint(e[r]));
        return i
    }, A.MOCFromURL = function(t, e, i) {
        var r = new MOC(e);
        return r.dataFromURL(t, i), r
    }, t.prototype.createCatalogFromVOTable = function(t, e) {
        return A.catalogFromURL(t, e)
    }, A.catalogFromURL = function(t, e, i) {
        var r = A.catalog(e);
        return cds.Catalog.parseVOTable(t, function(t) {
            r.addSources(t), i && i(t)
        }, r.maxNbSources), r
    }, A.catalogFromSimbad = function(t, e, i, r) {
        i = i || {}, "name" in i || (i.name = "Simbad");
        var o = URLBuilder.buildSimbadCSURL(t, e);
        return A.catalogFromURL(o, i, r)
    }, A.catalogFromNED = function(t, e, i, r) {
        i = i || {}, "name" in i || (i.name = "NED");
        var o;
        if (t && "object" == typeof t) "ra" in t && "dec" in t && (o = URLBuilder.buildNEDPositionCSURL(t.ra, t.dec, e));
        else {
            var s = /[a-zA-Z]/.test(t);
            if (s) o = URLBuilder.buildNEDObjectCSURL(t, e);
            else {
                var a = new Coo;
                a.parse(t), o = URLBuilder.buildNEDPositionCSURL(a.lon, a.lat, e)
            }
        }
        return A.catalogFromURL(o, i, r)
    }, A.catalogFromVizieR = function(t, e, i, r, o) {
        r = r || {}, "name" in r || (r.name = "VizieR:" + t);
        var s = URLBuilder.buildVizieRCSURL(t, e, i);
        return A.catalogFromURL(s, r, o)
    }, t.prototype.on = function(t, e) {
        "select" === t ? this.selectFunction = e : "objectClicked" == t ? this.objClickedFunction = e : "objectHovered" == t && (this.objHoveredFunction = e)
    }, t.prototype.select = function() {
        this.fire("selectstart")
    }, t.prototype.fire = function(t, e) {
        "selectstart" === t ? this.view.setMode(View.SELECT) : "selectend" === t && (this.view.setMode(View.PAN), this.selectFunction && this.selectFunction(e))
    }, t.prototype.hideBoxes = function() {
        if (this.boxes)
            for (var t = 0; this.boxes.length > t; t++) this.boxes[t].hide()
    }, t.prototype.updateCM = function() {}, t.prototype.showLayerBox = function() {
        var t = this,
            e = $(this.aladinDiv).find(".aladin-layerBox");
        e.empty(), e.append('<a class="aladin-closeBtn">&times;</a><div style="clear: both;"></div><div class="aladin-label">Base image layer</div><select class="aladin-surveySelection"></select><div class="aladin-cmap">Color map:<div><select class="aladin-cmSelection"></select><button class="aladin-btn aladin-btn-small aladin-reverseCm" type="button">Reverse</button></div></div><div class="aladin-box-separator"></div><div class="aladin-label">Overlay layers</div>');
        for (var i = e.find(".aladin-cmap"), r = e.find(".aladin-cmSelection"), o = 0; ColorMap.MAPS_NAMES.length > o; o++) r.append($("<option />").text(ColorMap.MAPS_NAMES[o]));
        r.val(t.getBaseImageLayer().getColorMap().map);
        for (var s = this.view.catalogs, a = "<ul>", o = s.length - 1; o >= 0; o--) {
            var n = s[o].name,
                h = "";
            s[o].isShowing && (h = 'checked="checked"');
            var l = s[o].getSources().length,
                c = l + " source" + (l > 1 ? "s" : ""),
                u = s[o].color,
                d = $("<div></div>").css("color", u).css("color"),
                p = Color.getLabelColorForBackground(d);
            a += '<li><div class="aladin-layerIcon" style="background: ' + u + ';"></div><input type="checkbox" ' + h + ' id="aladin_lite_' + n + '"></input><label for="aladin_lite_' + n + '" class="aladin-layer-label" style="background: ' + u + "; color:" + p + ';" title="' + c + '">' + n + "</label></li>"
        }
        a += "</ul>", e.append(a), e.append('<div class="aladin-blank-separator"></div>');
        var h = "";
        this.view.displayReticle && (h = 'checked="checked"');
        var f = $('<input type="checkbox" ' + h + ' id="displayReticle" />');
        e.append(f).append('<label for="displayReticle">Reticle</label><br/>'), f.change(function() {
            t.showReticle($(this).is(":checked"))
        }), h = "", this.view.displayHpxGrid && (h = 'checked="checked"');
        var g = $('<input type="checkbox" ' + h + ' id="displayHpxGrid"/>');
        e.append(g).append('<label for="displayHpxGrid">HEALPix grid</label><br/>'), g.change(function() {
            t.showHealpixGrid($(this).is(":checked"))
        }), e.append('<div class="aladin-box-separator"></div><div class="aladin-label">Tools</div>');
        var v = $('<button class="aladin-btn" type="button">Export view as PNG</button>');
        e.append(v), v.click(function() {
            t.exportAsPNG()
        }), e.find(".aladin-closeBtn").click(function() {
            return t.hideBoxes(), !1
        }), this.updateSurveysDropdownList(HpxImageSurvey.getAvailableSurveys());
        var m = $(this.aladinDiv).find(".aladin-surveySelection");
        m.change(function() {
            var e = HpxImageSurvey.getAvailableSurveys()[$(this)[0].selectedIndex];
            t.setImageSurvey(e.id, function() {
                var e = t.getBaseImageLayer();
                e.useCors ? (r.val(e.getColorMap().map), i.show(), v.show()) : (i.hide(), v.hide())
            })
        }), i.find(".aladin-cmSelection").change(function() {
            var e = $(this).find(":selected").val();
            t.getBaseImageLayer().getColorMap().update(e)
        }), i.find(".aladin-reverseCm").click(function() {
            t.getBaseImageLayer().getColorMap().reverse()
        }), this.getBaseImageLayer().useCors ? (i.show(), v.show()) : (i.hide(), v.hide()), e.find(".aladin-reverseCm").parent().attr("disabled", !0), $(this.aladinDiv).find(".aladin-layerBox ul input").change(function() {
            var e = $(this).attr("id").substr(12),
                i = t.layerByName(e);
            $(this).is(":checked") ? i.show() : i.hide()
        }), e.show()
    }, t.prototype.layerByName = function(t) {
        for (var e = this.view.catalogs, i = 0; this.view.catalogs.length > i; i++)
            if (t == e[i].name) return e[i];
        return null
    }, t.prototype.exportAsPNG = function() {
        window.open(this.getViewDataURL(), "Aladin Lite snapshot")
    }, t.prototype.getViewDataURL = function(t) {
        return this.view.getCanvasDataURL(t)
    }, t.prototype.setFOVRange = function(t, e) {
        if (t > e) {
            var i = t;
            t = e, e = i
        }
        this.view.minFOV = t, this.view.maxFOV = e
    }, t.prototype.pix2world = function(t, e) {
        var i, r = AladinUtils.viewToXy(t, e, this.view.width, this.view.height, this.view.largestDim, this.view.zoomFactor),
            o = this.view.projection.unproject(r.x, r.y);
        return i = this.view.cooFrame == CooFrameEnum.GAL ? CooConversion.GalacticToJ2000([o.ra, o.dec]) : [o.ra, o.dec]
    }, t.prototype.world2pix = function(t, e) {
        var i;
        if (this.view.cooFrame == CooFrameEnum.GAL) {
            var r = CooConversion.J2000ToGalactic([t, e]);
            i = this.view.projection.project(r[0], r[1])
        } else i = this.view.projection.project(t, e); if (i) {
            var o = AladinUtils.xyToView(i.X, i.Y, this.view.width, this.view.height, this.view.largestDim, this.view.zoomFactor);
            return [o.vx, o.vy]
        }
        return null
    }, t.prototype.getFovCorners = function(t) {
        (!t || 1 > t) && (t = 1);
        for (var e, i, r, o, s = [], a = 0; 4 > a; a++) {
            e = 0 == a || 3 == a ? 0 : this.view.width - 1, i = 2 > a ? 0 : this.view.height - 1, r = 2 > a ? this.view.width - 1 : 0, o = 1 == a || 2 == a ? this.view.height - 1 : 0;
            for (var n = 0; t > n; n++) s.push(this.pix2world(e + n / t * (r - e), i + n / t * (o - i)))
        }
        return s
    }, t.prototype.getFov = function() {
        var t = this.view.fov,
            e = this.getSize(),
            i = e[1] / e[0] * t;
        return t = Math.min(t, 180), i = Math.min(i, 180), [t, i]
    }, t.prototype.getSize = function() {
        return [this.view.width, this.view.height]
    }, t.prototype.getParentDiv = function() {
        return $(this.aladinDiv)
    }, t
}(), A.aladin = function(t, e) {
    return new Aladin($(t)[0], e)
}, A.imageLayer = function(t, e, i, r) {
    return new HpxImageSurvey(t, e, i, null, null, r)
}, A.source = function(t, e, i, r) {
    return new cds.Source(t, e, i, r)
}, A.marker = function(t, e, i, r) {
    return i = i || {}, i.marker = !0, A.source(t, e, r, i)
}, A.polygon = function(t) {
    var e = t.length;
    return e > 0 && (t[0][0] != t[e - 1][0] || t[0][1] != t[e - 1][1]) && t.push([t[0][0], t[0][1]]), new Footprint(t)
}, A.polyline = function(t, e) {
    return new Polyline(t, e)
}, A.circle = function(t, e, i, r) {
    return new Circle([t, e], i, r)
}, A.graphicOverlay = function(t) {
    return new Overlay(t)
}, A.catalog = function(t) {
    return new cds.Catalog(t)
}, Aladin.prototype.displayFITS = function(t, e) {
    e = e || {};
    var i = {
        url: t
    };
    e.color && (i.color = !0), e.outputFormat && (i.format = e.outputFormat), e.order && (i.order = e.order), e.nocache && (i.nocache = e.nocache), $.ajax({
        url: "http://alasky.u-strasbg.fr/cgi/fits2HiPS",
        data: i,
        method: "GET",
        dataType: "json",
        success: function(t) {
            if ("success" != t.status) return alert("An error occured: " + t.message), void 0;
            var i = e.label || "FITS image";
            aladin.setOverlayImageLayer(aladin.createImageSurvey(i, i, t.data.url, "equatorial", t.data.meta.max_norder, {
                imgFormat: "png"
            })), aladin.setFoV(t.data.meta.fov), aladin.gotoRaDec(t.data.meta.ra, t.data.meta.dec);
            var r = e && e.transparency || 1;
            aladin.getOverlayImageLayer().setAlpha(r)
        }
    })
}, Aladin.prototype.displayJPG = Aladin.prototype.displayPNG = function(t, e) {
    e = e || {}, e.color = !0, e.label = "JPG/PNG image", e.outputFormat = "png", this.displayFITS(t, e)
}, $ && ($.aladin = A.aladin);
