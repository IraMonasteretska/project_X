(typeof navigator !== "undefined") && (function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(function () {
            return factory(root);
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(root);
    } else {
        root.lottie = factory(root);
        root.bodymovin = root.lottie;
    }
}((window || {}), function (window) {
    "use strict";
    var svgNS = "http://www.w3.org/2000/svg",
        locationHref = "",
        initialDefaultFrame = -999999,
        subframeEnabled = !0,
        expressionsPlugin, isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        cachedColors = {},
        bm_rounder = Math.round,
        bm_rnd, bm_pow = Math.pow,
        bm_sqrt = Math.sqrt,
        bm_abs = Math.abs,
        bm_floor = Math.floor,
        bm_max = Math.max,
        bm_min = Math.min,
        blitter = 10,
        BMMath = {};

    function ProjectInterface() {
        return {}
    } ! function () {
        var t, e = ["abs", "acos", "acosh", "asin", "asinh", "atan", "atanh", "atan2", "ceil", "cbrt",
            "expm1", "clz32", "cos", "cosh", "exp", "floor", "fround", "hypot", "imul", "log",
            "log1p", "log2", "log10", "max", "min", "pow", "random", "round", "sign", "sin", "sinh",
            "sqrt", "tan", "tanh", "trunc", "E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2",
            "SQRT2"
        ],
            r = e.length;
        for (t = 0; t < r; t += 1) BMMath[e[t]] = Math[e[t]]
    }(), BMMath.random = Math.random, BMMath.abs = function (t) {
        if ("object" === typeof t && t.length) {
            var e, r = createSizedArray(t.length),
                i = t.length;
            for (e = 0; e < i; e += 1) r[e] = Math.abs(t[e]);
            return r
        }
        return Math.abs(t)
    };
    var defaultCurveSegments = 150,
        degToRads = Math.PI / 180,
        roundCorner = .5519;

    function roundValues(t) {
        bm_rnd = t ? Math.round : function (t) {
            return t
        }
    }

    function styleDiv(t) {
        t.style.position = "absolute", t.style.top = 0, t.style.left = 0, t.style.display = "block", t
            .style.transformOrigin = t.style.webkitTransformOrigin = "0 0", t.style.backfaceVisibility =
            t.style.webkitBackfaceVisibility = "visible", t.style.transformStyle = t.style
                .webkitTransformStyle = t.style.mozTransformStyle = "preserve-3d"
    }

    function BMEnterFrameEvent(t, e, r, i) {
        this.type = t, this.currentTime = e, this.totalTime = r, this.direction = i < 0 ? -1 : 1
    }

    function BMCompleteEvent(t, e) {
        this.type = t, this.direction = e < 0 ? -1 : 1
    }

    function BMCompleteLoopEvent(t, e, r, i) {
        this.type = t, this.currentLoop = r, this.totalLoops = e, this.direction = i < 0 ? -1 : 1
    }

    function BMSegmentStartEvent(t, e, r) {
        this.type = t, this.firstFrame = e, this.totalFrames = r
    }

    function BMDestroyEvent(t, e) {
        this.type = t, this.target = e
    }

    function BMRenderFrameErrorEvent(t, e) {
        this.type = "renderFrameError", this.nativeError = t, this.currentTime = e
    }

    function BMConfigErrorEvent(t) {
        this.type = "configError", this.nativeError = t
    }

    function BMAnimationConfigErrorEvent(t, e) {
        this.type = t, this.nativeError = e, this.currentTime = currentTime
    }
    roundValues(!1);
    var createElementID = (G = 0, function () {
        return "__lottie_element_" + ++G
    }),
        G;

    function HSVtoRGB(t, e, r) {
        var i, s, a, n, o, h, l, p;
        switch (h = r * (1 - e), l = r * (1 - (o = 6 * t - (n = Math.floor(6 * t))) * e), p = r * (1 - (
            1 - o) * e), n % 6) {
            case 0:
                i = r, s = p, a = h;
                break;
            case 1:
                i = l, s = r, a = h;
                break;
            case 2:
                i = h, s = r, a = p;
                break;
            case 3:
                i = h, s = l, a = r;
                break;
            case 4:
                i = p, s = h, a = r;
                break;
            case 5:
                i = r, s = h, a = l
        }
        return [i, s, a]
    }

    function RGBtoHSV(t, e, r) {
        var i, s = Math.max(t, e, r),
            a = Math.min(t, e, r),
            n = s - a,
            o = 0 === s ? 0 : n / s,
            h = s / 255;
        switch (s) {
            case a:
                i = 0;
                break;
            case t:
                i = e - r + n * (e < r ? 6 : 0), i /= 6 * n;
                break;
            case e:
                i = r - t + 2 * n, i /= 6 * n;
                break;
            case r:
                i = t - e + 4 * n, i /= 6 * n
        }
        return [i, o, h]
    }

    function addSaturationToRGB(t, e) {
        var r = RGBtoHSV(255 * t[0], 255 * t[1], 255 * t[2]);
        return r[1] += e, 1 < r[1] ? r[1] = 1 : r[1] <= 0 && (r[1] = 0), HSVtoRGB(r[0], r[1], r[2])
    }

    function addBrightnessToRGB(t, e) {
        var r = RGBtoHSV(255 * t[0], 255 * t[1], 255 * t[2]);
        return r[2] += e, 1 < r[2] ? r[2] = 1 : r[2] < 0 && (r[2] = 0), HSVtoRGB(r[0], r[1], r[2])
    }

    function addHueToRGB(t, e) {
        var r = RGBtoHSV(255 * t[0], 255 * t[1], 255 * t[2]);
        return r[0] += e / 360, 1 < r[0] ? r[0] -= 1 : r[0] < 0 && (r[0] += 1), HSVtoRGB(r[0], r[1], r[
            2])
    }
    var rgbToHex = function () {
        var t, e, i = [];
        for (t = 0; t < 256; t += 1) e = t.toString(16), i[t] = 1 == e.length ? "0" + e : e;
        return function (t, e, r) {
            return t < 0 && (t = 0), e < 0 && (e = 0), r < 0 && (r = 0), "#" + i[t] + i[e] + i[
                r]
        }
    }();

    function BaseEvent() { }
    BaseEvent.prototype = {
        triggerEvent: function (t, e) {
            if (this._cbs[t])
                for (var r = this._cbs[t].length, i = 0; i < r; i++) this._cbs[t][i](e)
        },
        addEventListener: function (t, e) {
            return this._cbs[t] || (this._cbs[t] = []), this._cbs[t].push(e),
                function () {
                    this.removeEventListener(t, e)
                }.bind(this)
        },
        removeEventListener: function (t, e) {
            if (e) {
                if (this._cbs[t]) {
                    for (var r = 0, i = this._cbs[t].length; r < i;) this._cbs[t][r] === e && (
                        this._cbs[t].splice(r, 1), r -= 1, i -= 1), r += 1;
                    this._cbs[t].length || (this._cbs[t] = null)
                }
            } else this._cbs[t] = null
        }
    };
    var createTypedArray = "function" == typeof Uint8ClampedArray && "function" == typeof Float32Array ?
        function (t, e) {
            return "float32" === t ? new Float32Array(e) : "int16" === t ? new Int16Array(e) :
                "uint8c" === t ? new Uint8ClampedArray(e) : void 0
        } : function (t, e) {
            var r, i = 0,
                s = [];
            switch (t) {
                case "int16":
                case "uint8c":
                    r = 1;
                    break;
                default:
                    r = 1.1
            }
            for (i = 0; i < e; i += 1) s.push(r);
            return s
        };

    function createSizedArray(t) {
        return Array.apply(null, {
            length: t
        })
    }

    function createNS(t) {
        return document.createElementNS(svgNS, t)
    }

    function createTag(t) {
        return document.createElement(t)
    }

    function DynamicPropertyContainer() { }
    DynamicPropertyContainer.prototype = {
        addDynamicProperty: function (t) {
            -1 === this.dynamicProperties.indexOf(t) && (this.dynamicProperties.push(t), this
                .container.addDynamicProperty(this), this._isAnimated = !0)
        },
        iterateDynamicProperties: function () {
            this._mdf = !1;
            var t, e = this.dynamicProperties.length;
            for (t = 0; t < e; t += 1) this.dynamicProperties[t].getValue(), this
                .dynamicProperties[t]._mdf && (this._mdf = !0)
        },
        initDynamicPropertyContainer: function (t) {
            this.container = t, this.dynamicProperties = [], this._mdf = !1, this
                ._isAnimated = !1
        }
    };
    var getBlendMode = (Pa = {
        0: "source-over",
        1: "multiply",
        2: "screen",
        3: "overlay",
        4: "darken",
        5: "lighten",
        6: "color-dodge",
        7: "color-burn",
        8: "hard-light",
        9: "soft-light",
        10: "difference",
        11: "exclusion",
        12: "hue",
        13: "saturation",
        14: "color",
        15: "luminosity"
    }, function (t) {
        return Pa[t] || ""
    }),
        Pa, Matrix = function () {
            var s = Math.cos,
                a = Math.sin,
                n = Math.tan,
                i = Math.round;

            function t() {
                return this.props[0] = 1, this.props[1] = 0, this.props[2] = 0, this.props[3] = 0, this
                    .props[4] = 0, this.props[5] = 1, this.props[6] = 0, this.props[7] = 0, this.props[
                    8] = 0, this.props[9] = 0, this.props[10] = 1, this.props[11] = 0, this.props[
                    12] = 0, this.props[13] = 0, this.props[14] = 0, this.props[15] = 1, this
            }

            function e(t) {
                if (0 === t) return this;
                var e = s(t),
                    r = a(t);
                return this._t(e, -r, 0, 0, r, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
            }

            function r(t) {
                if (0 === t) return this;
                var e = s(t),
                    r = a(t);
                return this._t(1, 0, 0, 0, 0, e, -r, 0, 0, r, e, 0, 0, 0, 0, 1)
            }

            function o(t) {
                if (0 === t) return this;
                var e = s(t),
                    r = a(t);
                return this._t(e, 0, r, 0, 0, 1, 0, 0, -r, 0, e, 0, 0, 0, 0, 1)
            }

            function h(t) {
                if (0 === t) return this;
                var e = s(t),
                    r = a(t);
                return this._t(e, -r, 0, 0, r, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
            }

            function l(t, e) {
                return this._t(1, e, t, 1, 0, 0)
            }

            function p(t, e) {
                return this.shear(n(t), n(e))
            }

            function m(t, e) {
                var r = s(e),
                    i = a(e);
                return this._t(r, i, 0, 0, -i, r, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(1, 0, 0, 0, n(t), 1,
                    0, 0, 0, 0, 1, 0, 0, 0, 0, 1)._t(r, -i, 0, 0, i, r, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                        1)
            }

            function f(t, e, r) {
                return r || 0 === r || (r = 1), 1 === t && 1 === e && 1 === r ? this : this._t(t, 0, 0,
                    0, 0, e, 0, 0, 0, 0, r, 0, 0, 0, 0, 1)
            }

            function c(t, e, r, i, s, a, n, o, h, l, p, m, f, c, d, u) {
                return this.props[0] = t, this.props[1] = e, this.props[2] = r, this.props[3] = i, this
                    .props[4] = s, this.props[5] = a, this.props[6] = n, this.props[7] = o, this.props[
                    8] = h, this.props[9] = l, this.props[10] = p, this.props[11] = m, this.props[
                    12] = f, this.props[13] = c, this.props[14] = d, this.props[15] = u, this
            }

            function d(t, e, r) {
                return r = r || 0, 0 !== t || 0 !== e || 0 !== r ? this._t(1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                    1, 0, t, e, r, 1) : this
            }

            function u(t, e, r, i, s, a, n, o, h, l, p, m, f, c, d, u) {
                var y = this.props;
                if (1 === t && 0 === e && 0 === r && 0 === i && 0 === s && 1 === a && 0 === n && 0 ===
                    o && 0 === h && 0 === l && 1 === p && 0 === m) return y[12] = y[12] * t + y[15] * f,
                        y[13] = y[13] * a + y[15] * c, y[14] = y[14] * p + y[15] * d, y[15] = y[15] * u,
                        this._identityCalculated = !1, this;
                var g = y[0],
                    v = y[1],
                    b = y[2],
                    E = y[3],
                    x = y[4],
                    P = y[5],
                    S = y[6],
                    _ = y[7],
                    A = y[8],
                    C = y[9],
                    T = y[10],
                    k = y[11],
                    M = y[12],
                    D = y[13],
                    w = y[14],
                    F = y[15];
                return y[0] = g * t + v * s + b * h + E * f, y[1] = g * e + v * a + b * l + E * c, y[
                    2] = g * r + v * n + b * p + E * d, y[3] = g * i + v * o + b * m + E * u, y[4] =
                    x *
                    t + P * s + S * h + _ * f, y[5] = x * e + P * a + S * l + _ * c, y[6] = x * r + P *
                    n + S * p + _ * d, y[7] = x * i + P * o + S * m + _ * u, y[8] = A * t + C * s + T *
                    h + k * f, y[9] = A * e + C * a + T * l + k * c, y[10] = A * r + C * n + T * p + k *
                    d, y[11] = A * i + C * o + T * m + k * u, y[12] = M * t + D * s + w * h + F * f, y[
                    13] = M * e + D * a + w * l + F * c, y[14] = M * r + D * n + w * p + F * d, y[
                    15] = M * i + D * o + w * m + F * u, this._identityCalculated = !1, this
            }

            function y() {
                return this._identityCalculated || (this._identity = !(1 !== this.props[0] || 0 !== this
                    .props[1] || 0 !== this.props[2] || 0 !== this.props[3] || 0 !== this.props[
                    4] || 1 !== this.props[5] || 0 !== this.props[6] || 0 !== this.props[
                    7] || 0 !== this.props[8] || 0 !== this.props[9] || 1 !== this.props[
                    10] ||
                    0 !== this.props[11] || 0 !== this.props[12] || 0 !== this.props[13] ||
                    0 !== this.props[14] || 1 !== this.props[15]), this._identityCalculated = !
                    0), this._identity
            }

            function g(t) {
                for (var e = 0; e < 16;) {
                    if (t.props[e] !== this.props[e]) return !1;
                    e += 1
                }
                return !0
            }

            function v(t) {
                var e;
                for (e = 0; e < 16; e += 1) t.props[e] = this.props[e]
            }

            function b(t) {
                var e;
                for (e = 0; e < 16; e += 1) this.props[e] = t[e]
            }

            function E(t, e, r) {
                return {
                    x: t * this.props[0] + e * this.props[4] + r * this.props[8] + this.props[12],
                    y: t * this.props[1] + e * this.props[5] + r * this.props[9] + this.props[13],
                    z: t * this.props[2] + e * this.props[6] + r * this.props[10] + this.props[14]
                }
            }

            function x(t, e, r) {
                return t * this.props[0] + e * this.props[4] + r * this.props[8] + this.props[12]
            }

            function P(t, e, r) {
                return t * this.props[1] + e * this.props[5] + r * this.props[9] + this.props[13]
            }

            function S(t, e, r) {
                return t * this.props[2] + e * this.props[6] + r * this.props[10] + this.props[14]
            }

            function _() {
                var t = this.props[0] * this.props[5] - this.props[1] * this.props[4],
                    e = this.props[5] / t,
                    r = -this.props[1] / t,
                    i = -this.props[4] / t,
                    s = this.props[0] / t,
                    a = (this.props[4] * this.props[13] - this.props[5] * this.props[12]) / t,
                    n = -(this.props[0] * this.props[13] - this.props[1] * this.props[12]) / t,
                    o = new Matrix;
                return o.props[0] = e, o.props[1] = r, o.props[4] = i, o.props[5] = s, o.props[12] = a,
                    o.props[13] = n, o
            }

            function A(t) {
                return this.getInverseMatrix().applyToPointArray(t[0], t[1], t[2] || 0)
            }

            function C(t) {
                var e, r = t.length,
                    i = [];
                for (e = 0; e < r; e += 1) i[e] = A(t[e]);
                return i
            }

            function T(t, e, r) {
                var i = createTypedArray("float32", 6);
                if (this.isIdentity()) i[0] = t[0], i[1] = t[1], i[2] = e[0], i[3] = e[1], i[4] = r[0],
                    i[5] = r[1];
                else {
                    var s = this.props[0],
                        a = this.props[1],
                        n = this.props[4],
                        o = this.props[5],
                        h = this.props[12],
                        l = this.props[13];
                    i[0] = t[0] * s + t[1] * n + h, i[1] = t[0] * a + t[1] * o + l, i[2] = e[0] * s + e[
                        1] * n + h, i[3] = e[0] * a + e[1] * o + l, i[4] = r[0] * s + r[1] * n + h,
                        i[5] = r[0] * a + r[1] * o + l
                }
                return i
            }

            function k(t, e, r) {
                return this.isIdentity() ? [t, e, r] : [t * this.props[0] + e * this.props[4] + r * this
                    .props[8] + this.props[12], t * this.props[1] + e * this.props[5] + r * this
                        .props[9] + this.props[13], t * this.props[2] + e * this.props[6] + r * this
                            .props[10] + this.props[14]
                ]
            }

            function M(t, e) {
                if (this.isIdentity()) return t + "," + e;
                var r = this.props;
                return Math.round(100 * (t * r[0] + e * r[4] + r[12])) / 100 + "," + Math.round(100 * (
                    t * r[1] + e * r[5] + r[13])) / 100
            }

            function D() {
                for (var t = 0, e = this.props, r = "matrix3d("; t < 16;) r += i(1e4 * e[t]) / 1e4, r +=
                    15 === t ? ")" : ",", t += 1;
                return r
            }

            function w(t) {
                return t < 1e-6 && 0 < t || -1e-6 < t && t < 0 ? i(1e4 * t) / 1e4 : t
            }

            function F() {
                var t = this.props;
                return "matrix(" + w(t[0]) + "," + w(t[1]) + "," + w(t[4]) + "," + w(t[5]) + "," + w(t[
                    12]) + "," + w(t[13]) + ")"
            }
            return function () {
                this.reset = t, this.rotate = e, this.rotateX = r, this.rotateY = o, this.rotateZ =
                    h, this.skew = p, this.skewFromAxis = m, this.shear = l, this.scale = f, this
                        .setTransform = c, this.translate = d, this.transform = u, this.applyToPoint =
                    E, this.applyToX = x, this.applyToY = P, this.applyToZ = S, this
                        .applyToPointArray = k, this.applyToTriplePoints = T, this
                            .applyToPointStringified = M, this.toCSS = D, this.to2dCSS = F, this.clone = v,
                    this.cloneFromProps = b, this.equals = g, this.inversePoints = C, this
                        .inversePoint = A, this.getInverseMatrix = _, this._t = this.transform, this
                            .isIdentity = y, this._identity = !0, this._identityCalculated = !1, this
                                .props = createTypedArray("float32", 16), this.reset()
            }
        }();
    ! function (o, h) {
        var l, p = this,
            m = 256,
            f = 6,
            c = "random",
            d = h.pow(m, f),
            u = h.pow(2, 52),
            y = 2 * u,
            g = m - 1;

        function v(t) {
            var e, r = t.length,
                n = this,
                i = 0,
                s = n.i = n.j = 0,
                a = n.S = [];
            for (r || (t = [r++]); i < m;) a[i] = i++;
            for (i = 0; i < m; i++) a[i] = a[s = g & s + t[i % r] + (e = a[i])], a[s] = e;
            n.g = function (t) {
                for (var e, r = 0, i = n.i, s = n.j, a = n.S; t--;) e = a[i = g & i + 1], r = r *
                    m + a[g & (a[i] = a[s = g & s + e]) + (a[s] = e)];
                return n.i = i, n.j = s, r
            }
        }

        function b(t, e) {
            return e.i = t.i, e.j = t.j, e.S = t.S.slice(), e
        }

        function E(t, e) {
            for (var r, i = t + "", s = 0; s < i.length;) e[g & s] = g & (r ^= 19 * e[g & s]) + i
                .charCodeAt(s++);
            return x(e)
        }

        function x(t) {
            return String.fromCharCode.apply(0, t)
        }
        h["seed" + c] = function (t, e, r) {
            var i = [],
                s = E(function t(e, r) {
                    var i, s = [],
                        a = typeof e;
                    if (r && "object" == a)
                        for (i in e) try {
                            s.push(t(e[i], r - 1))
                        } catch (t) { }
                    return s.length ? s : "string" == a ? e : e + "\0"
                }((e = !0 === e ? {
                    entropy: !0
                } : e || {}).entropy ? [t, x(o)] : null === t ? function () {
                    try {
                        if (l) return x(l.randomBytes(m));
                        var t = new Uint8Array(m);
                        return (p.crypto || p.msCrypto).getRandomValues(t), x(t)
                    } catch (t) {
                        var e = p.navigator,
                            r = e && e.plugins;
                        return [+new Date, p, r, p.screen, x(o)]
                    }
                }() : t, 3), i),
                a = new v(i),
                n = function () {
                    for (var t = a.g(f), e = d, r = 0; t < u;) t = (t + r) * m, e *= m, r = a.g(1);
                    for (; y <= t;) t /= 2, e /= 2, r >>>= 1;
                    return (t + r) / e
                };
            return n.int32 = function () {
                return 0 | a.g(4)
            }, n.quick = function () {
                return a.g(4) / 4294967296
            }, n.double = n, E(x(a.S), o), (e.pass || r || function (t, e, r, i) {
                return i && (i.S && b(i, a), t.state = function () {
                    return b(a, {})
                }), r ? (h[c] = t, e) : t
            })(n, s, "global" in e ? e.global : this == h, e.state)
        }, E(h.random(), o)
    }([], BMMath);
    var BezierFactory = function () {
        var t = {
            getBezierEasing: function (t, e, r, i, s) {
                var a = s || ("bez_" + t + "_" + e + "_" + r + "_" + i).replace(/\./g, "p");
                if (o[a]) return o[a];
                var n = new h([t, e, r, i]);
                return o[a] = n
            }
        },
            o = {};
        var l = 11,
            p = 1 / (l - 1),
            e = "function" == typeof Float32Array;

        function i(t, e) {
            return 1 - 3 * e + 3 * t
        }

        function s(t, e) {
            return 3 * e - 6 * t
        }

        function a(t) {
            return 3 * t
        }

        function m(t, e, r) {
            return ((i(e, r) * t + s(e, r)) * t + a(e)) * t
        }

        function f(t, e, r) {
            return 3 * i(e, r) * t * t + 2 * s(e, r) * t + a(e)
        }

        function h(t) {
            this._p = t, this._mSampleValues = e ? new Float32Array(l) : new Array(l), this
                ._precomputed = !1, this.get = this.get.bind(this)
        }
        return h.prototype = {
            get: function (t) {
                var e = this._p[0],
                    r = this._p[1],
                    i = this._p[2],
                    s = this._p[3];
                return this._precomputed || this._precompute(), e === r && i === s ? t :
                    0 === t ? 0 : 1 === t ? 1 : m(this._getTForX(t), r, s)
            },
            _precompute: function () {
                var t = this._p[0],
                    e = this._p[1],
                    r = this._p[2],
                    i = this._p[3];
                this._precomputed = !0, t === e && r === i || this._calcSampleValues()
            },
            _calcSampleValues: function () {
                for (var t = this._p[0], e = this._p[2], r = 0; r < l; ++r) this
                    ._mSampleValues[r] = m(r * p, t, e)
            },
            _getTForX: function (t) {
                for (var e = this._p[0], r = this._p[2], i = this._mSampleValues, s = 0, a =
                    1, n = l - 1; a !== n && i[a] <= t; ++a) s += p;
                var o = s + (t - i[--a]) / (i[a + 1] - i[a]) * p,
                    h = f(o, e, r);
                return .001 <= h ? function (t, e, r, i) {
                    for (var s = 0; s < 4; ++s) {
                        var a = f(e, r, i);
                        if (0 === a) return e;
                        e -= (m(e, r, i) - t) / a
                    }
                    return e
                }(t, o, e, r) : 0 === h ? o : function (t, e, r, i, s) {
                    for (var a, n, o = 0; 0 < (a = m(n = e + (r - e) / 2, i, s) - t) ?
                        r = n : e = n, 1e-7 < Math.abs(a) && ++o < 10;);
                    return n
                }(t, s, s + p, e, r)
            }
        }, t
    }();

    function extendPrototype(t, e) {
        var r, i, s = t.length;
        for (r = 0; r < s; r += 1)
            for (var a in i = t[r].prototype) i.hasOwnProperty(a) && (e.prototype[a] = i[a])
    }

    function getDescriptor(t, e) {
        return Object.getOwnPropertyDescriptor(t, e)
    }

    function createProxyFunction(t) {
        function e() { }
        return e.prototype = t, e
    }

    function bezFunction() {
        Math;

        function y(t, e, r, i, s, a) {
            var n = t * i + e * s + r * a - s * i - a * t - r * e;
            return -.001 < n && n < .001
        }
        var p = function (t, e, r, i) {
            var s, a, n, o, h, l, p = defaultCurveSegments,
                m = 0,
                f = [],
                c = [],
                d = bezier_length_pool.newElement();
            for (n = r.length, s = 0; s < p; s += 1) {
                for (h = s / (p - 1), a = l = 0; a < n; a += 1) o = bm_pow(1 - h, 3) * t[a] + 3 *
                    bm_pow(1 - h, 2) * h * r[a] + 3 * (1 - h) * bm_pow(h, 2) * i[a] + bm_pow(h, 3) *
                    e[a], f[a] = o, null !== c[a] && (l += bm_pow(f[a] - c[a], 2)), c[a] = f[a];
                l && (m += l = bm_sqrt(l)), d.percents[s] = h, d.lengths[s] = m
            }
            return d.addedLength = m, d
        };

        function g(t) {
            this.segmentLength = 0, this.points = new Array(t)
        }

        function v(t, e) {
            this.partialLength = t, this.point = e
        }
        var b, t = (b = {}, function (t, e, r, i) {
            var s = (t[0] + "_" + t[1] + "_" + e[0] + "_" + e[1] + "_" + r[0] + "_" + r[1] +
                "_" + i[0] + "_" + i[1]).replace(/\./g, "p");
            if (!b[s]) {
                var a, n, o, h, l, p, m, f = defaultCurveSegments,
                    c = 0,
                    d = null;
                2 === t.length && (t[0] != e[0] || t[1] != e[1]) && y(t[0], t[1], e[0], e[1], t[
                    0] + r[0], t[1] + r[1]) && y(t[0], t[1], e[0], e[1], e[0] + i[0], e[1] +
                        i[1]) && (f = 2);
                var u = new g(f);
                for (o = r.length, a = 0; a < f; a += 1) {
                    for (m = createSizedArray(o), l = a / (f - 1), n = p = 0; n < o; n += 1) h =
                        bm_pow(1 - l, 3) * t[n] + 3 * bm_pow(1 - l, 2) * l * (t[n] + r[n]) + 3 *
                        (1 - l) * bm_pow(l, 2) * (e[n] + i[n]) + bm_pow(l, 3) * e[n], m[n] = h,
                        null !== d && (p += bm_pow(m[n] - d[n], 2));
                    c += p = bm_sqrt(p), u.points[a] = new v(p, m), d = m
                }
                u.segmentLength = c, b[s] = u
            }
            return b[s]
        });

        function M(t, e) {
            var r = e.percents,
                i = e.lengths,
                s = r.length,
                a = bm_floor((s - 1) * t),
                n = t * e.addedLength,
                o = 0;
            if (a === s - 1 || 0 === a || n === i[a]) return r[a];
            for (var h = i[a] > n ? -1 : 1, l = !0; l;)
                if (i[a] <= n && i[a + 1] > n ? (o = (n - i[a]) / (i[a + 1] - i[a]), l = !1) : a += h,
                    a < 0 || s - 1 <= a) {
                    if (a === s - 1) return r[a];
                    l = !1
                } return r[a] + (r[a + 1] - r[a]) * o
        }
        var D = createTypedArray("float32", 8);
        return {
            getSegmentsLength: function (t) {
                var e, r = segments_length_pool.newElement(),
                    i = t.c,
                    s = t.v,
                    a = t.o,
                    n = t.i,
                    o = t._length,
                    h = r.lengths,
                    l = 0;
                for (e = 0; e < o - 1; e += 1) h[e] = p(s[e], s[e + 1], a[e], n[e + 1]), l += h[e]
                    .addedLength;
                return i && o && (h[e] = p(s[e], s[0], a[e], n[0]), l += h[e].addedLength), r
                    .totalLength = l, r
            },
            getNewSegment: function (t, e, r, i, s, a, n) {
                var o, h = M(s = s < 0 ? 0 : 1 < s ? 1 : s, n),
                    l = M(a = 1 < a ? 1 : a, n),
                    p = t.length,
                    m = 1 - h,
                    f = 1 - l,
                    c = m * m * m,
                    d = h * m * m * 3,
                    u = h * h * m * 3,
                    y = h * h * h,
                    g = m * m * f,
                    v = h * m * f + m * h * f + m * m * l,
                    b = h * h * f + m * h * l + h * m * l,
                    E = h * h * l,
                    x = m * f * f,
                    P = h * f * f + m * l * f + m * f * l,
                    S = h * l * f + m * l * l + h * f * l,
                    _ = h * l * l,
                    A = f * f * f,
                    C = l * f * f + f * l * f + f * f * l,
                    T = l * l * f + f * l * l + l * f * l,
                    k = l * l * l;
                for (o = 0; o < p; o += 1) D[4 * o] = Math.round(1e3 * (c * t[o] + d * r[o] + u * i[
                    o] + y * e[o])) / 1e3, D[4 * o + 1] = Math.round(1e3 * (g * t[o] + v * r[
                        o] + b * i[o] + E * e[o])) / 1e3, D[4 * o + 2] = Math.round(1e3 * (x * t[
                            o] + P * r[o] + S * i[o] + _ * e[o])) / 1e3, D[4 * o + 3] = Math.round(1e3 *
                                (A * t[o] + C * r[o] + T * i[o] + k * e[o])) / 1e3;
                return D
            },
            getPointInSegment: function (t, e, r, i, s, a) {
                var n = M(s, a),
                    o = 1 - n;
                return [Math.round(1e3 * (o * o * o * t[0] + (n * o * o + o * n * o + o * o * n) *
                    r[0] + (n * n * o + o * n * n + n * o * n) * i[0] + n * n * n * e[0]
                )) / 1e3, Math.round(1e3 * (o * o * o * t[1] + (n * o * o + o * n * o +
                    o * o * n) * r[1] + (n * n * o + o * n * n + n * o * n) * i[1] +
                    n * n * n * e[1])) / 1e3]
            },
            buildBezierData: t,
            pointOnLine2D: y,
            pointOnLine3D: function (t, e, r, i, s, a, n, o, h) {
                if (0 === r && 0 === a && 0 === h) return y(t, e, i, s, n, o);
                var l, p = Math.sqrt(Math.pow(i - t, 2) + Math.pow(s - e, 2) + Math.pow(a - r, 2)),
                    m = Math.sqrt(Math.pow(n - t, 2) + Math.pow(o - e, 2) + Math.pow(h - r, 2)),
                    f = Math.sqrt(Math.pow(n - i, 2) + Math.pow(o - s, 2) + Math.pow(h - a, 2));
                return -1e-4 < (l = m < p ? f < p ? p - m - f : f - m - p : m < f ? f - m - p : m -
                    p - f) && l < 1e-4
            }
        }
    } ! function () {
        for (var a = 0, t = ["ms", "moz", "webkit", "o"], e = 0; e < t.length && !window
            .requestAnimationFrame; ++e) window.requestAnimationFrame = window[t[e] +
                "RequestAnimationFrame"], window.cancelAnimationFrame = window[t[e] +
                "CancelAnimationFrame"] || window[t[e] + "CancelRequestAnimationFrame"];
        window.requestAnimationFrame || (window.requestAnimationFrame = function (t, e) {
            var r = (new Date).getTime(),
                i = Math.max(0, 16 - (r - a)),
                s = setTimeout(function () {
                    t(r + i)
                }, i);
            return a = r + i, s
        }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function (t) {
            clearTimeout(t)
        })
    }();
    var bez = bezFunction();

    function dataFunctionManager() {
        function m(t, e, r) {
            var i, s, a, n, o, h, l = t.length;
            for (s = 0; s < l; s += 1)
                if ("ks" in (i = t[s]) && !i.completed) {
                    if (i.completed = !0, i.tt && (t[s - 1].td = i.tt), [], -1, i.hasMask) {
                        var p = i.masksProperties;
                        for (n = p.length, a = 0; a < n; a += 1)
                            if (p[a].pt.k.i) d(p[a].pt.k);
                            else
                                for (h = p[a].pt.k.length, o = 0; o < h; o += 1) p[a].pt.k[o].s && d(p[
                                    a].pt.k[o].s[0]), p[a].pt.k[o].e && d(p[a].pt.k[o].e[0])
                    }
                    0 === i.ty ? (i.layers = f(i.refId, e), m(i.layers, e, r)) : 4 === i.ty ? c(i
                        .shapes) : 5 == i.ty && u(i, r)
                }
        }

        function f(t, e) {
            for (var r = 0, i = e.length; r < i;) {
                if (e[r].id === t) return e[r].layers.__used ? JSON.parse(JSON.stringify(e[r].layers)) :
                    (e[r].layers.__used = !0, e[r].layers);
                r += 1
            }
        }

        function c(t) {
            var e, r, i;
            for (e = t.length - 1; 0 <= e; e -= 1)
                if ("sh" == t[e].ty) {
                    if (t[e].ks.k.i) d(t[e].ks.k);
                    else
                        for (i = t[e].ks.k.length, r = 0; r < i; r += 1) t[e].ks.k[r].s && d(t[e].ks.k[
                            r].s[0]), t[e].ks.k[r].e && d(t[e].ks.k[r].e[0]);
                    !0
                } else "gr" == t[e].ty && c(t[e].it)
        }

        function d(t) {
            var e, r = t.i.length;
            for (e = 0; e < r; e += 1) t.i[e][0] += t.v[e][0], t.i[e][1] += t.v[e][1], t.o[e][0] += t.v[
                e][0], t.o[e][1] += t.v[e][1]
        }

        function o(t, e) {
            var r = e ? e.split(".") : [100, 100, 100];
            return t[0] > r[0] || !(r[0] > t[0]) && (t[1] > r[1] || !(r[1] > t[1]) && (t[2] > r[2] || !(
                r[2] > t[2]) && void 0))
        }
        var h, r = function () {
            var i = [4, 4, 14];

            function s(t) {
                var e, r, i, s = t.length;
                for (e = 0; e < s; e += 1) 5 === t[e].ty && (r = t[e], void 0, i = r.t.d, r.t.d = {
                    k: [{
                        s: i,
                        t: 0
                    }]
                })
            }
            return function (t) {
                if (o(i, t.v) && (s(t.layers), t.assets)) {
                    var e, r = t.assets.length;
                    for (e = 0; e < r; e += 1) t.assets[e].layers && s(t.assets[e].layers)
                }
            }
        }(),
            i = (h = [4, 7, 99], function (t) {
                if (t.chars && !o(h, t.v)) {
                    var e, r, i, s, a, n = t.chars.length;
                    for (e = 0; e < n; e += 1)
                        if (t.chars[e].data && t.chars[e].data.shapes)
                            for (i = (a = t.chars[e].data.shapes[0].it).length, r = 0; r < i; r +=
                                1)(s = a[r].ks.k).__converted || (d(a[r].ks.k), s.__converted = !0)
                }
            }),
            s = function () {
                var i = [4, 1, 9];

                function a(t) {
                    var e, r, i, s = t.length;
                    for (e = 0; e < s; e += 1)
                        if ("gr" === t[e].ty) a(t[e].it);
                        else if ("fl" === t[e].ty || "st" === t[e].ty)
                            if (t[e].c.k && t[e].c.k[0].i)
                                for (i = t[e].c.k.length, r = 0; r < i; r += 1) t[e].c.k[r].s && (t[e].c.k[
                                    r].s[0] /= 255, t[e].c.k[r].s[1] /= 255, t[e].c.k[r].s[2] /=
                                    255, t[e].c.k[r].s[3] /= 255), t[e].c.k[r].e && (t[e].c.k[r].e[0] /=
                                        255, t[e].c.k[r].e[1] /= 255, t[e].c.k[r].e[2] /= 255, t[e].c.k[r]
                                            .e[3] /= 255);
                            else t[e].c.k[0] /= 255, t[e].c.k[1] /= 255, t[e].c.k[2] /= 255, t[e].c.k[3] /=
                                255
                }

                function s(t) {
                    var e, r = t.length;
                    for (e = 0; e < r; e += 1) 4 === t[e].ty && a(t[e].shapes)
                }
                return function (t) {
                    if (o(i, t.v) && (s(t.layers), t.assets)) {
                        var e, r = t.assets.length;
                        for (e = 0; e < r; e += 1) t.assets[e].layers && s(t.assets[e].layers)
                    }
                }
            }(),
            a = function () {
                var i = [4, 4, 18];

                function l(t) {
                    var e, r, i;
                    for (e = t.length - 1; 0 <= e; e -= 1)
                        if ("sh" == t[e].ty) {
                            if (t[e].ks.k.i) t[e].ks.k.c = t[e].closed;
                            else
                                for (i = t[e].ks.k.length, r = 0; r < i; r += 1) t[e].ks.k[r].s && (t[e]
                                    .ks.k[r].s[0].c = t[e].closed), t[e].ks.k[r].e && (t[e].ks.k[r]
                                        .e[0].c = t[e].closed);
                            !0
                        } else "gr" == t[e].ty && l(t[e].it)
                }

                function s(t) {
                    var e, r, i, s, a, n, o = t.length;
                    for (r = 0; r < o; r += 1) {
                        if ((e = t[r]).hasMask) {
                            var h = e.masksProperties;
                            for (s = h.length, i = 0; i < s; i += 1)
                                if (h[i].pt.k.i) h[i].pt.k.c = h[i].cl;
                                else
                                    for (n = h[i].pt.k.length, a = 0; a < n; a += 1) h[i].pt.k[a].s && (
                                        h[i].pt.k[a].s[0].c = h[i].cl), h[i].pt.k[a].e && (h[i].pt
                                            .k[a].e[0].c = h[i].cl)
                        }
                        4 === e.ty && l(e.shapes)
                    }
                }
                return function (t) {
                    if (o(i, t.v) && (s(t.layers), t.assets)) {
                        var e, r = t.assets.length;
                        for (e = 0; e < r; e += 1) t.assets[e].layers && s(t.assets[e].layers)
                    }
                }
            }();

        function u(t, e) {
            0 !== t.t.a.length || "m" in t.t.p || (t.singleShape = !0)
        }
        var t = {
            completeData: function (t, e) {
                t.__complete || (s(t), r(t), i(t), a(t), m(t.layers, t.assets, e), t
                    .__complete = !0)
            }
        };
        return t.checkColors = s, t.checkChars = i, t.checkShapes = a, t.completeLayers = m, t
    }
    var dataManager = dataFunctionManager(),
        FontManager = function () {
            var a = {
                w: 0,
                size: 0,
                shapes: []
            },
                t = [];

            function u(t, e) {
                var r = createTag("span");
                r.style.fontFamily = e;
                var i = createTag("span");
                i.innerHTML = "giItT1WQy@!-/#", r.style.position = "absolute", r.style.left =
                    "-10000px", r.style.top = "-10000px", r.style.fontSize = "300px", r.style
                        .fontVariant = "normal", r.style.fontStyle = "normal", r.style.fontWeight =
                    "normal", r.style.letterSpacing = "0", r.appendChild(i), document.body.appendChild(
                        r);
                var s = i.offsetWidth;
                return i.style.fontFamily = t + ", " + e, {
                    node: i,
                    w: s,
                    parent: r
                }
            }
            t = t.concat([2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366, 2367, 2368, 2369, 2370,
                2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383,
                2387, 2388, 2389, 2390, 2391, 2402, 2403
            ]);
            var e = function () {
                this.fonts = [], this.chars = null, this.typekitLoaded = 0, this.isLoaded = !1, this
                    .initTime = Date.now()
            };
            return e.getCombinedCharacterCodes = function () {
                return t
            }, e.prototype.addChars = function (t) {
                if (t) {
                    this.chars || (this.chars = []);
                    var e, r, i, s = t.length,
                        a = this.chars.length;
                    for (e = 0; e < s; e += 1) {
                        for (r = 0, i = !1; r < a;) this.chars[r].style === t[e].style && this
                            .chars[r].fFamily === t[e].fFamily && this.chars[r].ch === t[e].ch && (
                                i = !0), r += 1;
                        i || (this.chars.push(t[e]), a += 1)
                    }
                }
            }, e.prototype.addFonts = function (t, e) {
                if (t) {
                    if (this.chars) return this.isLoaded = !0, void (this.fonts = t.list);
                    var r, i, s, a, n = t.list,
                        o = n.length,
                        h = o;
                    for (r = 0; r < o; r += 1) {
                        var l, p, m = !0;
                        if (n[r].loaded = !1, n[r].monoCase = u(n[r].fFamily, "monospace"), n[r]
                            .sansCase = u(n[r].fFamily, "sans-serif"), n[r].fPath) {
                            if ("p" === n[r].fOrigin || 3 === n[r].origin) {
                                if (0 < (l = document.querySelectorAll(
                                    'style[f-forigin="p"][f-family="' + n[r].fFamily +
                                    '"], style[f-origin="3"][f-family="' + n[r].fFamily +
                                    '"]')).length && (m = !1), m) {
                                    var f = createTag("style");
                                    f.setAttribute("f-forigin", n[r].fOrigin), f.setAttribute(
                                        "f-origin", n[r].origin), f.setAttribute("f-family", n[
                                            r].fFamily), f.type = "text/css", f.innerHTML =
                                        "@font-face {font-family: " + n[r].fFamily +
                                        "; font-style: normal; src: url('" + n[r].fPath + "');}", e
                                            .appendChild(f)
                                }
                            } else if ("g" === n[r].fOrigin || 1 === n[r].origin) {
                                for (l = document.querySelectorAll(
                                    'link[f-forigin="g"], link[f-origin="1"]'), p = 0; p < l
                                        .length; p++) - 1 !== l[p].href.indexOf(n[r].fPath) && (m = !1);
                                if (m) {
                                    var c = createTag("link");
                                    c.setAttribute("f-forigin", n[r].fOrigin), c.setAttribute(
                                        "f-origin", n[r].origin), c.type = "text/css", c.rel =
                                        "stylesheet", c.href = n[r].fPath, document.body
                                            .appendChild(c)
                                }
                            } else if ("t" === n[r].fOrigin || 2 === n[r].origin) {
                                for (l = document.querySelectorAll(
                                    'script[f-forigin="t"], script[f-origin="2"]'), p = 0; p < l
                                        .length; p++) n[r].fPath === l[p].src && (m = !1);
                                if (m) {
                                    var d = createTag("link");
                                    d.setAttribute("f-forigin", n[r].fOrigin), d.setAttribute(
                                        "f-origin", n[r].origin), d.setAttribute("rel",
                                            "stylesheet"), d.setAttribute("href", n[r].fPath), e
                                                .appendChild(d)
                                }
                            }
                        } else n[r].loaded = !0, h -= 1;
                        n[r].helper = (i = e, s = n[r], a = void 0, (a = createNS("text")).style
                            .fontSize = "100px", a.setAttribute("font-family", s.fFamily), a
                                .setAttribute("font-style", s.fStyle), a.setAttribute("font-weight",
                                    s.fWeight), a.textContent = "1", s.fClass ? (a.style
                                        .fontFamily = "inherit", a.setAttribute("class", s.fClass)) : a
                                            .style.fontFamily = s.fFamily, i.appendChild(a), createTag("canvas")
                                                .getContext("2d").font = s.fWeight + " " + s.fStyle + " 100px " + s
                                                    .fFamily, a), n[r].cache = {}, this.fonts.push(n[r])
                    }
                    0 === h ? this.isLoaded = !0 : setTimeout(this.checkLoadedFonts.bind(this), 100)
                } else this.isLoaded = !0
            }, e.prototype.getCharData = function (t, e, r) {
                for (var i = 0, s = this.chars.length; i < s;) {
                    if (this.chars[i].ch === t && this.chars[i].style === e && this.chars[i]
                        .fFamily === r) return this.chars[i];
                    i += 1
                }
                return ("string" == typeof t && 13 !== t.charCodeAt(0) || !t) && console && console
                    .warn && console.warn("Missing character from exported characters list: ", t, e,
                        r), a
            }, e.prototype.getFontByName = function (t) {
                for (var e = 0, r = this.fonts.length; e < r;) {
                    if (this.fonts[e].fName === t) return this.fonts[e];
                    e += 1
                }
                return this.fonts[0]
            }, e.prototype.measureText = function (t, e, r) {
                var i = this.getFontByName(e),
                    s = t.charCodeAt(0);
                if (!i.cache[s + 1]) {
                    var a = i.helper;
                    if (" " === t) {
                        a.textContent = "|" + t + "|";
                        var n = a.getComputedTextLength();
                        a.textContent = "||";
                        var o = a.getComputedTextLength();
                        i.cache[s + 1] = (n - o) / 100
                    } else a.textContent = t, i.cache[s + 1] = a.getComputedTextLength() / 100
                }
                return i.cache[s + 1] * r
            }, e.prototype.checkLoadedFonts = function () {
                var t, e, r, i = this.fonts.length,
                    s = i;
                for (t = 0; t < i; t += 1) this.fonts[t].loaded ? s -= 1 : "n" === this.fonts[t]
                    .fOrigin || 0 === this.fonts[t].origin ? this.fonts[t].loaded = !0 : (e = this
                        .fonts[t].monoCase.node, r = this.fonts[t].monoCase.w, e.offsetWidth !== r ?
                            (s -= 1, this.fonts[t].loaded = !0) : (e = this.fonts[t].sansCase.node, r =
                                this.fonts[t].sansCase.w, e.offsetWidth !== r && (s -= 1, this.fonts[t]
                                    .loaded = !0)), this.fonts[t].loaded && (this.fonts[t].sansCase
                                        .parent.parentNode.removeChild(this.fonts[t].sansCase.parent), this
                                            .fonts[t].monoCase.parent.parentNode.removeChild(this.fonts[t].monoCase
                                                .parent)));
                0 !== s && Date.now() - this.initTime < 5e3 ? setTimeout(this.checkLoadedFonts.bind(
                    this), 20) : setTimeout(function () {
                        this.isLoaded = !0
                    }.bind(this), 0)
            }, e.prototype.loaded = function () {
                return this.isLoaded
            }, e
        }(),
        PropertyFactory = function () {
            var m = initialDefaultFrame,
                s = Math.abs;

            function f(t, e) {
                var r, i = this.offsetTime;
                "multidimensional" === this.propType && (r = createTypedArray("float32", this.pv
                    .length));
                for (var s, a, n, o, h, l, p, m, f = e.lastIndex, c = f, d = this.keyframes.length - 1,
                    u = !0; u;) {
                    if (s = this.keyframes[c], a = this.keyframes[c + 1], c === d - 1 && t >= a.t - i) {
                        s.h && (s = a), f = 0;
                        break
                    }
                    if (a.t - i > t) {
                        f = c;
                        break
                    }
                    c < d - 1 ? c += 1 : (f = 0, u = !1)
                }
                var y, g, v, b, E, x, P, S, _, A, C = a.t - i,
                    T = s.t - i;
                if (s.to) {
                    s.bezierData || (s.bezierData = bez.buildBezierData(s.s, a.s || s.e, s.to, s.ti));
                    var k = s.bezierData;
                    if (C <= t || t < T) {
                        var M = C <= t ? k.points.length - 1 : 0;
                        for (o = k.points[M].point.length, n = 0; n < o; n += 1) r[n] = k.points[M]
                            .point[n]
                    } else {
                        s.__fnct ? m = s.__fnct : (m = BezierFactory.getBezierEasing(s.o.x, s.o.y, s.i
                            .x, s.i.y, s.n).get, s.__fnct = m), h = m((t - T) / (C - T));
                        var D, w = k.segmentLength * h,
                            F = e.lastFrame < t && e._lastKeyframeIndex === c ? e._lastAddedLength : 0;
                        for (p = e.lastFrame < t && e._lastKeyframeIndex === c ? e._lastPoint : 0, u = !
                            0, l = k.points.length; u;) {
                            if (F += k.points[p].partialLength, 0 === w || 0 === h || p === k.points
                                .length - 1) {
                                for (o = k.points[p].point.length, n = 0; n < o; n += 1) r[n] = k
                                    .points[p].point[n];
                                break
                            }
                            if (F <= w && w < F + k.points[p + 1].partialLength) {
                                for (D = (w - F) / k.points[p + 1].partialLength, o = k.points[p].point
                                    .length, n = 0; n < o; n += 1) r[n] = k.points[p].point[n] + (k
                                        .points[p + 1].point[n] - k.points[p].point[n]) * D;
                                break
                            }
                            p < l - 1 ? p += 1 : u = !1
                        }
                        e._lastPoint = p, e._lastAddedLength = F - k.points[p].partialLength, e
                            ._lastKeyframeIndex = c
                    }
                } else {
                    var I, V, R, B, L;
                    if (d = s.s.length, y = a.s || s.e, this.sh && 1 !== s.h)
                        if (C <= t) r[0] = y[0], r[1] = y[1], r[2] = y[2];
                        else if (t <= T) r[0] = s.s[0], r[1] = s.s[1], r[2] = s.s[2];
                        else {
                            var G = N(s.s),
                                z = N(y);
                            g = r, v = function (t, e, r) {
                                var i, s, a, n, o, h = [],
                                    l = t[0],
                                    p = t[1],
                                    m = t[2],
                                    f = t[3],
                                    c = e[0],
                                    d = e[1],
                                    u = e[2],
                                    y = e[3];
                                (s = l * c + p * d + m * u + f * y) < 0 && (s = -s, c = -c, d = -d,
                                    u = -u, y = -y);
                                o = 1e-6 < 1 - s ? (i = Math.acos(s), a = Math.sin(i), n = Math.sin((1 -
                                    r) * i) / a, Math.sin(r * i) / a) : (n = 1 - r, r);
                                return h[0] = n * l + o * c, h[1] = n * p + o * d, h[2] = n * m + o * u,
                                    h[3] = n * f + o * y, h
                            }(G, z, (t - T) / (C - T)), b = v[0], E = v[1], x = v[2], P = v[3], S = Math
                                .atan2(2 * E * P - 2 * b * x, 1 - 2 * E * E - 2 * x * x), _ = Math.asin(2 *
                                    b * E + 2 * x * P), A = Math.atan2(2 * b * P - 2 * E * x, 1 - 2 * b *
                                        b - 2 * x * x), g[0] = S / degToRads, g[1] = _ / degToRads, g[2] = A /
                                        degToRads
                        } else
                        for (c = 0; c < d; c += 1) 1 !== s.h && (h = C <= t ? 1 : t < T ? 0 : (s.o.x
                            .constructor === Array ? (s.__fnct || (s.__fnct = []), s.__fnct[c] ?
                                m = s.__fnct[c] : (I = void 0 === s.o.x[c] ? s.o.x[0] : s.o.x[
                                    c], V = void 0 === s.o.y[c] ? s.o.y[0] : s.o.y[c], R =
                                    void 0 === s.i.x[c] ? s.i.x[0] : s.i.x[c], B = void 0 === s
                                        .i.y[c] ? s.i.y[0] : s.i.y[c], m = BezierFactory
                                            .getBezierEasing(I, V, R, B).get, s.__fnct[c] = m)) : s
                                                .__fnct ? m = s.__fnct : (I = s.o.x, V = s.o.y, R = s.i.x, B = s.i
                                                    .y, m = BezierFactory.getBezierEasing(I, V, R, B).get, s
                                                        .__fnct = m), m((t - T) / (C - T)))), y = a.s || s.e, L = 1 === s
                                                            .h ? s.s[c] : s.s[c] + (y[c] - s.s[c]) * h, "multidimensional" === this
                                                                .propType ? r[c] = L : r = L
                }
                return e.lastIndex = f, r
            }

            function N(t) {
                var e = t[0] * degToRads,
                    r = t[1] * degToRads,
                    i = t[2] * degToRads,
                    s = Math.cos(e / 2),
                    a = Math.cos(r / 2),
                    n = Math.cos(i / 2),
                    o = Math.sin(e / 2),
                    h = Math.sin(r / 2),
                    l = Math.sin(i / 2);
                return [o * h * n + s * a * l, o * a * n + s * h * l, s * h * n - o * a * l, s * a * n -
                    o * h * l
                ]
            }

            function c() {
                var t = this.comp.renderedFrame - this.offsetTime,
                    e = this.keyframes[0].t - this.offsetTime,
                    r = this.keyframes[this.keyframes.length - 1].t - this.offsetTime;
                if (!(t === this._caching.lastFrame || this._caching.lastFrame !== m && (this._caching
                    .lastFrame >= r && r <= t || this._caching.lastFrame < e && t < e))) {
                    this._caching.lastFrame >= t && (this._caching._lastKeyframeIndex = -1, this
                        ._caching.lastIndex = 0);
                    var i = this.interpolateValue(t, this._caching);
                    this.pv = i
                }
                return this._caching.lastFrame = t, this.pv
            }

            function d(t) {
                var e;
                if ("unidimensional" === this.propType) e = t * this.mult, 1e-5 < s(this.v - e) && (this
                    .v = e, this._mdf = !0);
                else
                    for (var r = 0, i = this.v.length; r < i;) e = t[r] * this.mult, 1e-5 < s(this.v[
                        r] - e) && (this.v[r] = e, this._mdf = !0), r += 1
            }

            function u() {
                if (this.elem.globalData.frameId !== this.frameId && this.effectsSequence.length)
                    if (this.lock) this.setVValue(this.pv);
                    else {
                        this.lock = !0, this._mdf = this._isFirstFrame;
                        var t, e = this.effectsSequence.length,
                            r = this.kf ? this.pv : this.data.k;
                        for (t = 0; t < e; t += 1) r = this.effectsSequence[t](r);
                        this.setVValue(r), this._isFirstFrame = !1, this.lock = !1, this.frameId = this
                            .elem.globalData.frameId
                    }
            }

            function y(t) {
                this.effectsSequence.push(t), this.container.addDynamicProperty(this)
            }

            function n(t, e, r, i) {
                this.propType = "unidimensional", this.mult = r || 1, this.data = e, this.v = r ? e.k *
                    r : e.k, this.pv = e.k, this._mdf = !1, this.elem = t, this.container = i, this
                        .comp = t.comp, this.k = !1, this.kf = !1, this.vel = 0, this.effectsSequence = [],
                    this._isFirstFrame = !0, this.getValue = u, this.setVValue = d, this.addEffect = y
            }

            function o(t, e, r, i) {
                this.propType = "multidimensional", this.mult = r || 1, this.data = e, this._mdf = !1,
                    this.elem = t, this.container = i, this.comp = t.comp, this.k = !1, this.kf = !1,
                    this.frameId = -1;
                var s, a = e.k.length;
                this.v = createTypedArray("float32", a), this.pv = createTypedArray("float32", a);
                createTypedArray("float32", a);
                for (this.vel = createTypedArray("float32", a), s = 0; s < a; s += 1) this.v[s] = e.k[
                    s] * this.mult, this.pv[s] = e.k[s];
                this._isFirstFrame = !0, this.effectsSequence = [], this.getValue = u, this.setVValue =
                    d, this.addEffect = y
            }

            function h(t, e, r, i) {
                this.propType = "unidimensional", this.keyframes = e.k, this.offsetTime = t.data.st,
                    this.frameId = -1, this._caching = {
                        lastFrame: m,
                        lastIndex: 0,
                        value: 0,
                        _lastKeyframeIndex: -1
                    }, this.k = !0, this.kf = !0, this.data = e, this.mult = r || 1, this.elem = t, this
                        .container = i, this.comp = t.comp, this.v = m, this.pv = m, this._isFirstFrame = !
                        0, this.getValue = u, this.setVValue = d, this.interpolateValue = f, this
                            .effectsSequence = [c.bind(this)], this.addEffect = y
            }

            function l(t, e, r, i) {
                this.propType = "multidimensional";
                var s, a, n, o, h, l = e.k.length;
                for (s = 0; s < l - 1; s += 1) e.k[s].to && e.k[s].s && e.k[s + 1] && e.k[s + 1].s && (
                    a = e.k[s].s, n = e.k[s + 1].s, o = e.k[s].to, h = e.k[s].ti, (2 === a.length &&
                        (a[0] !== n[0] || a[1] !== n[1]) && bez.pointOnLine2D(a[0], a[1], n[0], n[
                            1], a[0] + o[0], a[1] + o[1]) && bez.pointOnLine2D(a[0], a[1], n[0], n[
                                1], n[0] + h[0], n[1] + h[1]) || 3 === a.length && (a[0] !== n[0] || a[
                                    1] !== n[1] || a[2] !== n[2]) && bez.pointOnLine3D(a[0], a[1], a[2], n[
                                        0], n[1], n[2], a[0] + o[0], a[1] + o[1], a[2] + o[2]) && bez
                                            .pointOnLine3D(a[0], a[1], a[2], n[0], n[1], n[2], n[0] + h[0], n[1] + h[1],
                                                n[2] + h[2])) && (e.k[s].to = null, e.k[s].ti = null), a[0] === n[0] &&
                                                a[1] === n[1] && 0 === o[0] && 0 === o[1] && 0 === h[0] && 0 === h[1] && (2 ===
                                                    a.length || a[2] === n[2] && 0 === o[2] && 0 === h[2]) && (e.k[s].to = null,
                                                        e.k[s].ti = null));
                this.effectsSequence = [c.bind(this)], this.keyframes = e.k, this.offsetTime = t.data
                    .st, this.k = !0, this.kf = !0, this._isFirstFrame = !0, this.mult = r || 1, this
                        .elem = t, this.container = i, this.comp = t.comp, this.getValue = u, this
                            .setVValue = d, this.interpolateValue = f, this.frameId = -1;
                var p = e.k[0].s.length;
                for (this.v = createTypedArray("float32", p), this.pv = createTypedArray("float32", p),
                    s = 0; s < p; s += 1) this.v[s] = m, this.pv[s] = m;
                this._caching = {
                    lastFrame: m,
                    lastIndex: 0,
                    value: createTypedArray("float32", p)
                }, this.addEffect = y
            }
            return {
                getProp: function (t, e, r, i, s) {
                    var a;
                    if (e.k.length)
                        if ("number" == typeof e.k[0]) a = new o(t, e, i, s);
                        else switch (r) {
                            case 0:
                                a = new h(t, e, i, s);
                                break;
                            case 1:
                                a = new l(t, e, i, s)
                        } else a = new n(t, e, i, s);
                    return a.effectsSequence.length && s.addDynamicProperty(a), a
                }
            }
        }(),
        TransformPropertyFactory = function () {
            var n = [0, 0];

            function i(t, e, r) {
                if (this.elem = t, this.frameId = -1, this.propType = "transform", this.data = e, this
                    .v = new Matrix, this.pre = new Matrix, this.appliedTransformations = 0, this
                        .initDynamicPropertyContainer(r || t), e.p && e.p.s ? (this.px = PropertyFactory
                            .getProp(t, e.p.x, 0, 0, this), this.py = PropertyFactory.getProp(t, e.p.y, 0,
                                0, this), e.p.z && (this.pz = PropertyFactory.getProp(t, e.p.z, 0, 0, this))
                        ) : this.p = PropertyFactory.getProp(t, e.p || {
                            k: [0, 0, 0]
                        }, 1, 0, this), e.rx) {
                    if (this.rx = PropertyFactory.getProp(t, e.rx, 0, degToRads, this), this.ry =
                        PropertyFactory.getProp(t, e.ry, 0, degToRads, this), this.rz = PropertyFactory
                            .getProp(t, e.rz, 0, degToRads, this), e.or.k[0].ti) {
                        var i, s = e.or.k.length;
                        for (i = 0; i < s; i += 1) e.or.k[i].to = e.or.k[i].ti = null
                    }
                    this.or = PropertyFactory.getProp(t, e.or, 1, degToRads, this), this.or.sh = !0
                } else this.r = PropertyFactory.getProp(t, e.r || {
                    k: 0
                }, 0, degToRads, this);
                e.sk && (this.sk = PropertyFactory.getProp(t, e.sk, 0, degToRads, this), this.sa =
                    PropertyFactory.getProp(t, e.sa, 0, degToRads, this)), this.a = PropertyFactory
                        .getProp(t, e.a || {
                            k: [0, 0, 0]
                        }, 1, 0, this), this.s = PropertyFactory.getProp(t, e.s || {
                            k: [100, 100, 100]
                        }, 1, .01, this), e.o ? this.o = PropertyFactory.getProp(t, e.o, 0, .01, t) : this
                            .o = {
                            _mdf: !1,
                            v: 1
                        }, this._isDirty = !0, this.dynamicProperties.length || this.getValue(!0)
            }
            return i.prototype = {
                applyToMatrix: function (t) {
                    var e = this._mdf;
                    this.iterateDynamicProperties(), this._mdf = this._mdf || e, this.a && t
                        .translate(-this.a.v[0], -this.a.v[1], this.a.v[2]), this.s && t.scale(
                            this.s.v[0], this.s.v[1], this.s.v[2]), this.sk && t.skewFromAxis(-
                                this.sk.v, this.sa.v), this.r ? t.rotate(-this.r.v) : t.rotateZ(-
                                    this.rz.v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or.v[
                                        2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this.data.p.s ?
                            this.data.p.z ? t.translate(this.px.v, this.py.v, -this.pz.v) : t
                                .translate(this.px.v, this.py.v, 0) : t.translate(this.p.v[0], this.p.v[
                                    1], -this.p.v[2])
                },
                getValue: function (t) {
                    if (this.elem.globalData.frameId !== this.frameId) {
                        if (this._isDirty && (this.precalculateMatrix(), this._isDirty = !1),
                            this.iterateDynamicProperties(), this._mdf || t) {
                            if (this.v.cloneFromProps(this.pre.props), this
                                .appliedTransformations < 1 && this.v.translate(-this.a.v[0], -
                                    this.a.v[1], this.a.v[2]), this.appliedTransformations <
                                    2 && this.v.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this
                                        .sk && this.appliedTransformations < 3 && this.v.skewFromAxis(-
                                            this.sk.v, this.sa.v), this.r && this
                                                .appliedTransformations < 4 ? this.v.rotate(-this.r.v) : !this
                                                    .r && this.appliedTransformations < 4 && this.v.rotateZ(-this.rz
                                                        .v).rotateY(this.ry.v).rotateX(this.rx.v).rotateZ(-this.or
                                                            .v[2]).rotateY(this.or.v[1]).rotateX(this.or.v[0]), this
                                    .autoOriented) {
                                var e, r, i = this.elem.globalData.frameRate;
                                if (this.p && this.p.keyframes && this.p.getValueAtTime) r =
                                    this.p._caching.lastFrame + this.p.offsetTime <= this.p
                                        .keyframes[0].t ? (e = this.p.getValueAtTime((this.p
                                            .keyframes[0].t + .01) / i, 0), this.p
                                                .getValueAtTime(this.p.keyframes[0].t / i, 0)) : this.p
                                                    ._caching.lastFrame + this.p.offsetTime >= this.p.keyframes[
                                                        this.p.keyframes.length - 1].t ? (e = this.p
                                                            .getValueAtTime(this.p.keyframes[this.p.keyframes
                                                                .length - 1].t / i, 0), this.p.getValueAtTime((this
                                                                    .p.keyframes[this.p.keyframes.length - 1].t -
                                                                    .05) / i, 0)) : (e = this.p.pv, this.p
                                                                        .getValueAtTime((this.p._caching.lastFrame + this.p
                                                                            .offsetTime - .01) / i, this.p.offsetTime));
                                else if (this.px && this.px.keyframes && this.py.keyframes &&
                                    this.px.getValueAtTime && this.py.getValueAtTime) {
                                    e = [], r = [];
                                    var s = this.px,
                                        a = this.py;
                                    s._caching.lastFrame + s.offsetTime <= s.keyframes[0].t ? (
                                        e[0] = s.getValueAtTime((s.keyframes[0].t + .01) /
                                            i, 0), e[1] = a.getValueAtTime((a.keyframes[0]
                                                .t + .01) / i, 0), r[0] = s.getValueAtTime(s
                                                    .keyframes[0].t / i, 0), r[1] = a
                                                        .getValueAtTime(a.keyframes[0].t / i, 0)) : s
                                                            ._caching.lastFrame + s.offsetTime >= s.keyframes[s
                                                                .keyframes.length - 1].t ? (e[0] = s.getValueAtTime(
                                                                    s.keyframes[s.keyframes.length - 1].t / i, 0),
                                                                    e[1] = a.getValueAtTime(a.keyframes[a.keyframes
                                                                        .length - 1].t / i, 0), r[0] = s.getValueAtTime(
                                                                            (s.keyframes[s.keyframes.length - 1].t - .01) /
                                                                            i, 0), r[1] = a.getValueAtTime((a.keyframes[a
                                                                                .keyframes.length - 1].t - .01) / i, 0)) : (
                                        e = [s.pv, a.pv], r[0] = s.getValueAtTime((s
                                            ._caching.lastFrame + s.offsetTime - .01) /
                                            i, s.offsetTime), r[1] = a.getValueAtTime((a
                                                ._caching.lastFrame + a.offsetTime - .01) /
                                                i, a.offsetTime))
                                } else e = r = n;
                                this.v.rotate(-Math.atan2(e[1] - r[1], e[0] - r[0]))
                            }
                            this.data.p && this.data.p.s ? this.data.p.z ? this.v.translate(this
                                .px.v, this.py.v, -this.pz.v) : this.v.translate(this.px.v,
                                    this.py.v, 0) : this.v.translate(this.p.v[0], this.p.v[1], -
                                        this.p.v[2])
                        }
                        this.frameId = this.elem.globalData.frameId
                    }
                },
                precalculateMatrix: function () {
                    if (!this.a.k && (this.pre.translate(-this.a.v[0], -this.a.v[1], this.a.v[
                        2]), this.appliedTransformations = 1, !this.s.effectsSequence
                            .length)) {
                        if (this.pre.scale(this.s.v[0], this.s.v[1], this.s.v[2]), this
                            .appliedTransformations = 2, this.sk) {
                            if (this.sk.effectsSequence.length || this.sa.effectsSequence
                                .length) return;
                            this.pre.skewFromAxis(-this.sk.v, this.sa.v), this
                                .appliedTransformations = 3
                        }
                        if (this.r) {
                            if (this.r.effectsSequence.length) return;
                            this.pre.rotate(-this.r.v), this.appliedTransformations = 4
                        } else this.rz.effectsSequence.length || this.ry.effectsSequence
                            .length || this.rx.effectsSequence.length || this.or.effectsSequence
                                .length || (this.pre.rotateZ(-this.rz.v).rotateY(this.ry.v).rotateX(
                                    this.rx.v).rotateZ(-this.or.v[2]).rotateY(this.or.v[1])
                                    .rotateX(this.or.v[0]), this.appliedTransformations = 4)
                    }
                },
                autoOrient: function () { }
            }, extendPrototype([DynamicPropertyContainer], i), i.prototype.addDynamicProperty =
                function (t) {
                    this._addDynamicProperty(t), this.elem.addDynamicProperty(t), this._isDirty = !0
                }, i.prototype._addDynamicProperty = DynamicPropertyContainer.prototype
                    .addDynamicProperty, {
                getTransformProperty: function (t, e, r) {
                    return new i(t, e, r)
                }
            }
        }();

    function ShapePath() {
        this.c = !1, this._length = 0, this._maxLength = 8, this.v = createSizedArray(this._maxLength),
            this.o = createSizedArray(this._maxLength), this.i = createSizedArray(this._maxLength)
    }
    ShapePath.prototype.setPathData = function (t, e) {
        this.c = t, this.setLength(e);
        for (var r = 0; r < e;) this.v[r] = point_pool.newElement(), this.o[r] = point_pool
            .newElement(), this.i[r] = point_pool.newElement(), r += 1
    }, ShapePath.prototype.setLength = function (t) {
        for (; this._maxLength < t;) this.doubleArrayLength();
        this._length = t
    }, ShapePath.prototype.doubleArrayLength = function () {
        this.v = this.v.concat(createSizedArray(this._maxLength)), this.i = this.i.concat(
            createSizedArray(this._maxLength)), this.o = this.o.concat(createSizedArray(this
                ._maxLength)), this._maxLength *= 2
    }, ShapePath.prototype.setXYAt = function (t, e, r, i, s) {
        var a;
        switch (this._length = Math.max(this._length, i + 1), this._length >= this._maxLength &&
        this.doubleArrayLength(), r) {
            case "v":
                a = this.v;
                break;
            case "i":
                a = this.i;
                break;
            case "o":
                a = this.o
        }(!a[i] || a[i] && !s) && (a[i] = point_pool.newElement()), a[i][0] = t, a[i][1] = e
    }, ShapePath.prototype.setTripleAt = function (t, e, r, i, s, a, n, o) {
        this.setXYAt(t, e, "v", n, o), this.setXYAt(r, i, "o", n, o), this.setXYAt(s, a, "i", n, o)
    }, ShapePath.prototype.reverse = function () {
        var t = new ShapePath;
        t.setPathData(this.c, this._length);
        var e = this.v,
            r = this.o,
            i = this.i,
            s = 0;
        this.c && (t.setTripleAt(e[0][0], e[0][1], i[0][0], i[0][1], r[0][0], r[0][1], 0, !1), s =
            1);
        var a, n = this._length - 1,
            o = this._length;
        for (a = s; a < o; a += 1) t.setTripleAt(e[n][0], e[n][1], i[n][0], i[n][1], r[n][0], r[n][
            1
        ], a, !1), n -= 1;
        return t
    };
    var ShapePropertyFactory = function () {
        var s = -999999;

        function t(t, e, r) {
            var i, s, a, n, o, h, l, p, m, f = r.lastIndex,
                c = this.keyframes;
            if (t < c[0].t - this.offsetTime) i = c[0].s[0], a = !0, f = 0;
            else if (t >= c[c.length - 1].t - this.offsetTime) i = c[c.length - 1].s ? c[c.length -
                1].s[0] : c[c.length - 2].e[0], a = !0;
            else {
                for (var d, u, y = f, g = c.length - 1, v = !0; v && (d = c[y], !((u = c[y + 1]).t -
                    this.offsetTime > t));) y < g - 1 ? y += 1 : v = !1;
                if (f = y, !(a = 1 === d.h)) {
                    if (t >= u.t - this.offsetTime) p = 1;
                    else if (t < d.t - this.offsetTime) p = 0;
                    else {
                        var b;
                        d.__fnct ? b = d.__fnct : (b = BezierFactory.getBezierEasing(d.o.x, d.o.y, d
                            .i.x, d.i.y).get, d.__fnct = b), p = b((t - (d.t - this
                                .offsetTime)) / (u.t - this.offsetTime - (d.t - this
                                    .offsetTime)))
                    }
                    s = u.s ? u.s[0] : d.e[0]
                }
                i = d.s[0]
            }
            for (h = e._length, l = i.i[0].length, r.lastIndex = f, n = 0; n < h; n += 1)
                for (o = 0; o < l; o += 1) m = a ? i.i[n][o] : i.i[n][o] + (s.i[n][o] - i.i[n][o]) *
                    p, e.i[n][o] = m, m = a ? i.o[n][o] : i.o[n][o] + (s.o[n][o] - i.o[n][o]) * p, e
                        .o[n][o] = m, m = a ? i.v[n][o] : i.v[n][o] + (s.v[n][o] - i.v[n][o]) * p, e.v[
                        n][o] = m
        }

        function a() {
            this.paths = this.localShapeCollection
        }

        function e(t) {
            (function (t, e) {
                if (t._length !== e._length || t.c !== e.c) return !1;
                var r, i = t._length;
                for (r = 0; r < i; r += 1)
                    if (t.v[r][0] !== e.v[r][0] || t.v[r][1] !== e.v[r][1] || t.o[r][0] !== e.o[
                        r][0] || t.o[r][1] !== e.o[r][1] || t.i[r][0] !== e.i[r][0] || t.i[
                        r][1] !== e.i[r][1]) return !1;
                return !0
            })(this.v, t) || (this.v = shape_pool.clone(t), this.localShapeCollection
                .releaseShapes(), this.localShapeCollection.addShape(this.v), this._mdf = !0, this
                    .paths = this.localShapeCollection)
        }

        function r() {
            if (this.elem.globalData.frameId !== this.frameId)
                if (this.effectsSequence.length)
                    if (this.lock) this.setVValue(this.pv);
                    else {
                        this.lock = !0, this._mdf = !1;
                        var t, e = this.kf ? this.pv : this.data.ks ? this.data.ks.k : this.data.pt
                            .k,
                            r = this.effectsSequence.length;
                        for (t = 0; t < r; t += 1) e = this.effectsSequence[t](e);
                        this.setVValue(e), this.lock = !1, this.frameId = this.elem.globalData
                            .frameId
                    }
                else this._mdf = !1
        }

        function n(t, e, r) {
            this.propType = "shape", this.comp = t.comp, this.container = t, this.elem = t, this
                .data = e, this.k = !1, this.kf = !1, this._mdf = !1;
            var i = 3 === r ? e.pt.k : e.ks.k;
            this.v = shape_pool.clone(i), this.pv = shape_pool.clone(this.v), this
                .localShapeCollection = shapeCollection_pool.newShapeCollection(), this.paths = this
                    .localShapeCollection, this.paths.addShape(this.v), this.reset = a, this
                        .effectsSequence = []
        }

        function i(t) {
            this.effectsSequence.push(t), this.container.addDynamicProperty(this)
        }

        function o(t, e, r) {
            this.propType = "shape", this.comp = t.comp, this.elem = t, this.container = t, this
                .offsetTime = t.data.st, this.keyframes = 3 === r ? e.pt.k : e.ks.k, this.k = !0,
                this.kf = !0;
            var i = this.keyframes[0].s[0].i.length;
            this.keyframes[0].s[0].i[0].length;
            this.v = shape_pool.newElement(), this.v.setPathData(this.keyframes[0].s[0].c, i), this
                .pv = shape_pool.clone(this.v), this.localShapeCollection = shapeCollection_pool
                    .newShapeCollection(), this.paths = this.localShapeCollection, this.paths.addShape(
                        this.v), this.lastFrame = s, this.reset = a, this._caching = {
                            lastFrame: s,
                            lastIndex: 0
                        }, this.effectsSequence = [function () {
                            var t = this.comp.renderedFrame - this.offsetTime,
                                e = this.keyframes[0].t - this.offsetTime,
                                r = this.keyframes[this.keyframes.length - 1].t - this.offsetTime,
                                i = this._caching.lastFrame;
                            return i !== s && (i < e && t < e || r < i && r < t) || (this._caching
                                .lastIndex = i < t ? this._caching.lastIndex : 0, this
                                    .interpolateShape(t, this.pv, this._caching)), this._caching
                                        .lastFrame = t, this.pv
                        }.bind(this)]
        }
        n.prototype.interpolateShape = t, n.prototype.getValue = r, n.prototype.setVValue = e, n
            .prototype.addEffect = i, o.prototype.getValue = r, o.prototype.interpolateShape = t, o
                .prototype.setVValue = e, o.prototype.addEffect = i;
        var h = function () {
            var n = roundCorner;

            function t(t, e) {
                this.v = shape_pool.newElement(), this.v.setPathData(!0, 4), this
                    .localShapeCollection = shapeCollection_pool.newShapeCollection(), this
                        .paths = this.localShapeCollection, this.localShapeCollection.addShape(this
                            .v), this.d = e.d, this.elem = t, this.comp = t.comp, this.frameId = -1,
                    this.initDynamicPropertyContainer(t), this.p = PropertyFactory.getProp(t, e
                        .p, 1, 0, this), this.s = PropertyFactory.getProp(t, e.s, 1, 0, this),
                    this.dynamicProperties.length ? this.k = !0 : (this.k = !1, this
                        .convertEllToPath())
            }
            return t.prototype = {
                reset: a,
                getValue: function () {
                    this.elem.globalData.frameId !== this.frameId && (this.frameId =
                        this.elem.globalData.frameId, this
                            .iterateDynamicProperties(), this._mdf && this
                                .convertEllToPath())
                },
                convertEllToPath: function () {
                    var t = this.p.v[0],
                        e = this.p.v[1],
                        r = this.s.v[0] / 2,
                        i = this.s.v[1] / 2,
                        s = 3 !== this.d,
                        a = this.v;
                    a.v[0][0] = t, a.v[0][1] = e - i, a.v[1][0] = s ? t + r : t - r, a
                        .v[1][1] = e, a.v[2][0] = t, a.v[2][1] = e + i, a.v[3][0] = s ?
                            t - r : t + r, a.v[3][1] = e, a.i[0][0] = s ? t - r * n : t +
                                r * n, a.i[0][1] = e - i, a.i[1][0] = s ? t + r : t - r, a.i[1][
                                1
                                ] = e - i * n, a.i[2][0] = s ? t + r * n : t - r * n, a.i[2][
                                1
                                ] = e + i, a.i[3][0] = s ? t - r : t + r, a.i[3][1] = e + i *
                                n, a.o[0][0] = s ? t + r * n : t - r * n, a.o[0][1] = e - i, a
                                    .o[1][0] = s ? t + r : t - r, a.o[1][1] = e + i * n, a.o[2][0] =
                        s ? t - r * n : t + r * n, a.o[2][1] = e + i, a.o[3][0] = s ?
                            t - r : t + r, a.o[3][1] = e - i * n
                }
            }, extendPrototype([DynamicPropertyContainer], t), t
        }(),
            l = function () {
                function t(t, e) {
                    this.v = shape_pool.newElement(), this.v.setPathData(!0, 0), this.elem = t, this
                        .comp = t.comp, this.data = e, this.frameId = -1, this.d = e.d, this
                            .initDynamicPropertyContainer(t), 1 === e.sy ? (this.ir = PropertyFactory
                                .getProp(t, e.ir, 0, 0, this), this.is = PropertyFactory.getProp(t, e
                                    .is, 0, .01, this), this.convertToPath = this.convertStarToPath) :
                            this.convertToPath = this.convertPolygonToPath, this.pt = PropertyFactory
                                .getProp(t, e.pt, 0, 0, this), this.p = PropertyFactory.getProp(t, e.p, 1,
                                    0, this), this.r = PropertyFactory.getProp(t, e.r, 0, degToRads, this),
                        this.or = PropertyFactory.getProp(t, e.or, 0, 0, this), this.os =
                        PropertyFactory.getProp(t, e.os, 0, .01, this), this.localShapeCollection =
                        shapeCollection_pool.newShapeCollection(), this.localShapeCollection
                            .addShape(this.v), this.paths = this.localShapeCollection, this
                                .dynamicProperties.length ? this.k = !0 : (this.k = !1, this
                                    .convertToPath())
                }
                return t.prototype = {
                    reset: a,
                    getValue: function () {
                        this.elem.globalData.frameId !== this.frameId && (this.frameId =
                            this.elem.globalData.frameId, this
                                .iterateDynamicProperties(), this._mdf && this
                                    .convertToPath())
                    },
                    convertStarToPath: function () {
                        var t, e, r, i, s = 2 * Math.floor(this.pt.v),
                            a = 2 * Math.PI / s,
                            n = !0,
                            o = this.or.v,
                            h = this.ir.v,
                            l = this.os.v,
                            p = this.is.v,
                            m = 2 * Math.PI * o / (2 * s),
                            f = 2 * Math.PI * h / (2 * s),
                            c = -Math.PI / 2;
                        c += this.r.v;
                        var d = 3 === this.data.d ? -1 : 1;
                        for (t = this.v._length = 0; t < s; t += 1) {
                            r = n ? l : p, i = n ? m : f;
                            var u = (e = n ? o : h) * Math.cos(c),
                                y = e * Math.sin(c),
                                g = 0 === u && 0 === y ? 0 : y / Math.sqrt(u * u + y * y),
                                v = 0 === u && 0 === y ? 0 : -u / Math.sqrt(u * u + y * y);
                            u += +this.p.v[0], y += +this.p.v[1], this.v.setTripleAt(u, y,
                                u - g * i * r * d, y - v * i * r * d, u + g * i * r * d,
                                y + v * i * r * d, t, !0), n = !n, c += a * d
                        }
                    },
                    convertPolygonToPath: function () {
                        var t, e = Math.floor(this.pt.v),
                            r = 2 * Math.PI / e,
                            i = this.or.v,
                            s = this.os.v,
                            a = 2 * Math.PI * i / (4 * e),
                            n = -Math.PI / 2,
                            o = 3 === this.data.d ? -1 : 1;
                        for (n += this.r.v, t = this.v._length = 0; t < e; t += 1) {
                            var h = i * Math.cos(n),
                                l = i * Math.sin(n),
                                p = 0 === h && 0 === l ? 0 : l / Math.sqrt(h * h + l * l),
                                m = 0 === h && 0 === l ? 0 : -h / Math.sqrt(h * h + l * l);
                            h += +this.p.v[0], l += +this.p.v[1], this.v.setTripleAt(h, l,
                                h - p * a * s * o, l - m * a * s * o, h + p * a * s * o,
                                l + m * a * s * o, t, !0), n += r * o
                        }
                        this.paths.length = 0, this.paths[0] = this.v
                    }
                }, extendPrototype([DynamicPropertyContainer], t), t
            }(),
            p = function () {
                function t(t, e) {
                    this.v = shape_pool.newElement(), this.v.c = !0, this.localShapeCollection =
                        shapeCollection_pool.newShapeCollection(), this.localShapeCollection
                            .addShape(this.v), this.paths = this.localShapeCollection, this.elem = t,
                        this.comp = t.comp, this.frameId = -1, this.d = e.d, this
                            .initDynamicPropertyContainer(t), this.p = PropertyFactory.getProp(t, e.p,
                                1, 0, this), this.s = PropertyFactory.getProp(t, e.s, 1, 0, this), this
                                    .r = PropertyFactory.getProp(t, e.r, 0, 0, this), this.dynamicProperties
                                        .length ? this.k = !0 : (this.k = !1, this.convertRectToPath())
                }
                return t.prototype = {
                    convertRectToPath: function () {
                        var t = this.p.v[0],
                            e = this.p.v[1],
                            r = this.s.v[0] / 2,
                            i = this.s.v[1] / 2,
                            s = bm_min(r, i, this.r.v),
                            a = s * (1 - roundCorner);
                        this.v._length = 0, 2 === this.d || 1 === this.d ? (this.v
                            .setTripleAt(t + r, e - i + s, t + r, e - i + s, t + r, e -
                                i + a, 0, !0), this.v.setTripleAt(t + r, e + i - s, t +
                                    r, e + i - a, t + r, e + i - s, 1, !0), 0 !== s ? (this
                                        .v.setTripleAt(t + r - s, e + i, t + r - s, e + i, t +
                                            r - a, e + i, 2, !0), this.v.setTripleAt(t - r + s,
                                                e + i, t - r + a, e + i, t - r + s, e + i, 3, !0),
                                        this.v.setTripleAt(t - r, e + i - s, t - r, e + i - s,
                                            t - r, e + i - a, 4, !0), this.v.setTripleAt(t - r,
                                                e - i + s, t - r, e - i + a, t - r, e - i + s, 5, !0
                                            ), this.v.setTripleAt(t - r + s, e - i, t - r + s,
                                                e - i, t - r + a, e - i, 6, !0), this.v.setTripleAt(
                                                    t + r - s, e - i, t + r - a, e - i, t + r - s, e -
                                                i, 7, !0)) : (this.v.setTripleAt(t - r, e + i, t -
                                                    r + a, e + i, t - r, e + i, 2), this.v.setTripleAt(
                                                        t - r, e - i, t - r, e - i + a, t - r, e - i, 3))) : (
                            this.v.setTripleAt(t + r, e - i + s, t + r, e - i + a, t +
                                r, e - i + s, 0, !0), 0 !== s ? (this.v.setTripleAt(t +
                                    r - s, e - i, t + r - s, e - i, t + r - a, e - i, 1,
                                    !0), this.v.setTripleAt(t - r + s, e - i, t - r + a,
                                        e - i, t - r + s, e - i, 2, !0), this.v.setTripleAt(
                                            t - r, e - i + s, t - r, e - i + s, t - r, e - i +
                                        a, 3, !0), this.v.setTripleAt(t - r, e + i - s, t -
                                            r, e + i - a, t - r, e + i - s, 4, !0), this.v
                                                .setTripleAt(t - r + s, e + i, t - r + s, e + i, t - r +
                                                    a, e + i, 5, !0), this.v.setTripleAt(t + r - s, e +
                                                        i, t + r - a, e + i, t + r - s, e + i, 6, !0), this
                                                            .v.setTripleAt(t + r, e + i - s, t + r, e + i - s, t +
                                                                r, e + i - a, 7, !0)) : (this.v.setTripleAt(t - r,
                                                                    e - i, t - r + a, e - i, t - r, e - i, 1, !0), this
                                                                        .v.setTripleAt(t - r, e + i, t - r, e + i - a, t - r,
                                                                            e + i, 2, !0), this.v.setTripleAt(t + r, e + i, t +
                                                                                r - a, e + i, t + r, e + i, 3, !0)))
                    },
                    getValue: function (t) {
                        this.elem.globalData.frameId !== this.frameId && (this.frameId =
                            this.elem.globalData.frameId, this
                                .iterateDynamicProperties(), this._mdf && this
                                    .convertRectToPath())
                    },
                    reset: a
                }, extendPrototype([DynamicPropertyContainer], t), t
            }();
        var m = {
            getShapeProp: function (t, e, r) {
                var i;
                return 3 === r || 4 === r ? i = (3 === r ? e.pt : e.ks).k.length ? new o(t,
                    e, r) : new n(t, e, r) : 5 === r ? i = new p(t, e) : 6 === r ? i =
                        new h(t, e) : 7 === r && (i = new l(t, e)), i.k && t.addDynamicProperty(
                            i), i
            },
            getConstructorFunction: function () {
                return n
            },
            getKeyframedConstructorFunction: function () {
                return o
            }
        };
        return m
    }(),
        ShapeModifiers = ($r = {}, _r = {}, $r.registerModifier = function (t, e) {
            _r[t] || (_r[t] = e)
        }, $r.getModifier = function (t, e, r) {
            return new _r[t](e, r)
        }, $r),
        $r, _r;

    function ShapeModifier() { }

    function TrimModifier() { }

    function RoundCornersModifier() { }

    function RepeaterModifier() { }

    function ShapeCollection() {
        this._length = 0, this._maxLength = 4, this.shapes = createSizedArray(this._maxLength)
    }

    function DashProperty(t, e, r, i) {
        this.elem = t, this.frameId = -1, this.dataProps = createSizedArray(e.length), this.renderer =
            r, this.k = !1, this.dashStr = "", this.dashArray = createTypedArray("float32", e.length ? e
                .length - 1 : 0), this.dashoffset = createTypedArray("float32", 1), this
                    .initDynamicPropertyContainer(i);
        var s, a, n = e.length || 0;
        for (s = 0; s < n; s += 1) a = PropertyFactory.getProp(t, e[s].v, 0, 0, this), this.k = a.k ||
            this.k, this.dataProps[s] = {
                n: e[s].n,
                p: a
            };
        this.k || this.getValue(!0), this._isAnimated = this.k
    }

    function GradientProperty(t, e, r) {
        this.data = e, this.c = createTypedArray("uint8c", 4 * e.p);
        var i = e.k.k[0].s ? e.k.k[0].s.length - 4 * e.p : e.k.k.length - 4 * e.p;
        this.o = createTypedArray("float32", i), this._cmdf = !1, this._omdf = !1, this._collapsable =
            this.checkCollapsable(), this._hasOpacity = i, this.initDynamicPropertyContainer(r), this
                .prop = PropertyFactory.getProp(t, e.k, 1, null, this), this.k = this.prop.k, this.getValue(
                    !0)
    }
    ShapeModifier.prototype.initModifierProperties = function () { }, ShapeModifier.prototype
        .addShapeToModifier = function () { }, ShapeModifier.prototype.addShape = function (t) {
            if (!this.closed) {
                t.sh.container.addDynamicProperty(t.sh);
                var e = {
                    shape: t.sh,
                    data: t,
                    localShapeCollection: shapeCollection_pool.newShapeCollection()
                };
                this.shapes.push(e), this.addShapeToModifier(e), this._isAnimated && t.setAsAnimated()
            }
        }, ShapeModifier.prototype.init = function (t, e) {
            this.shapes = [], this.elem = t, this.initDynamicPropertyContainer(t), this
                .initModifierProperties(t, e), this.frameId = initialDefaultFrame, this.closed = !1,
                this.k = !1, this.dynamicProperties.length ? this.k = !0 : this.getValue(!0)
        }, ShapeModifier.prototype.processKeys = function () {
            this.elem.globalData.frameId !== this.frameId && (this.frameId = this.elem.globalData
                .frameId, this.iterateDynamicProperties())
        }, extendPrototype([DynamicPropertyContainer], ShapeModifier), extendPrototype([ShapeModifier],
            TrimModifier), TrimModifier.prototype.initModifierProperties = function (t, e) {
                this.s = PropertyFactory.getProp(t, e.s, 0, .01, this), this.e = PropertyFactory.getProp(t,
                    e.e, 0, .01, this), this.o = PropertyFactory.getProp(t, e.o, 0, 0, this), this
                        .sValue = 0, this.eValue = 0, this.getValue = this.processKeys, this.m = e.m, this
                            ._isAnimated = !!this.s.effectsSequence.length || !!this.e.effectsSequence.length || !!
                            this.o.effectsSequence.length
            }, TrimModifier.prototype.addShapeToModifier = function (t) {
                t.pathsData = []
            }, TrimModifier.prototype.calculateShapeEdges = function (t, e, r, i, s) {
                var a = [];
                e <= 1 ? a.push({
                    s: t,
                    e: e
                }) : 1 <= t ? a.push({
                    s: t - 1,
                    e: e - 1
                }) : (a.push({
                    s: t,
                    e: 1
                }), a.push({
                    s: 0,
                    e: e - 1
                }));
                var n, o, h = [],
                    l = a.length;
                for (n = 0; n < l; n += 1) {
                    var p, m;
                    if ((o = a[n]).e * s < i || o.s * s > i + r);
                    else p = o.s * s <= i ? 0 : (o.s * s - i) / r, m = o.e * s >= i + r ? 1 : (o.e * s -
                        i) / r, h.push([p, m])
                }
                return h.length || h.push([0, 0]), h
            }, TrimModifier.prototype.releasePathsData = function (t) {
                var e, r = t.length;
                for (e = 0; e < r; e += 1) segments_length_pool.release(t[e]);
                return t.length = 0, t
            }, TrimModifier.prototype.processShapes = function (t) {
                var e, r, i;
                if (this._mdf || t) {
                    var s = this.o.v % 360 / 360;
                    if (s < 0 && (s += 1), e = (1 < this.s.v ? 1 : this.s.v < 0 ? 0 : this.s.v) + s, (r = (
                        1 < this.e.v ? 1 : this.e.v < 0 ? 0 : this.e.v) + s) < e) {
                        var a = e;
                        e = r, r = a
                    }
                    e = 1e-4 * Math.round(1e4 * e), r = 1e-4 * Math.round(1e4 * r), this.sValue = e, this
                        .eValue = r
                } else e = this.sValue, r = this.eValue;
                var n, o, h, l, p, m, f = this.shapes.length,
                    c = 0;
                if (r === e)
                    for (n = 0; n < f; n += 1) this.shapes[n].localShapeCollection.releaseShapes(), this
                        .shapes[n].shape._mdf = !0, this.shapes[n].shape.paths = this.shapes[n]
                            .localShapeCollection;
                else if (1 === r && 0 === e || 0 === r && 1 === e) {
                    if (this._mdf)
                        for (n = 0; n < f; n += 1) this.shapes[n].pathsData.length = 0, this.shapes[n].shape
                            ._mdf = !0
                } else {
                    var d, u, y = [];
                    for (n = 0; n < f; n += 1)
                        if ((d = this.shapes[n]).shape._mdf || this._mdf || t || 2 === this.m) {
                            if (h = (i = d.shape.paths)._length, m = 0, !d.shape._mdf && d.pathsData.length)
                                m = d.totalShapeLength;
                            else {
                                for (l = this.releasePathsData(d.pathsData), o = 0; o < h; o += 1) p = bez
                                    .getSegmentsLength(i.shapes[o]), l.push(p), m += p.totalLength;
                                d.totalShapeLength = m, d.pathsData = l
                            }
                            c += m, d.shape._mdf = !0
                        } else d.shape.paths = d.localShapeCollection;
                    var g, v = e,
                        b = r,
                        E = 0;
                    for (n = f - 1; 0 <= n; n -= 1)
                        if ((d = this.shapes[n]).shape._mdf) {
                            for ((u = d.localShapeCollection).releaseShapes(), 2 === this.m && 1 < f ? (g =
                                this.calculateShapeEdges(e, r, d.totalShapeLength, E, c), E += d
                                    .totalShapeLength) : g = [
                                        [v, b]
                                    ], h = g.length, o = 0; o < h; o += 1) {
                                v = g[o][0], b = g[o][1], y.length = 0, b <= 1 ? y.push({
                                    s: d.totalShapeLength * v,
                                    e: d.totalShapeLength * b
                                }) : 1 <= v ? y.push({
                                    s: d.totalShapeLength * (v - 1),
                                    e: d.totalShapeLength * (b - 1)
                                }) : (y.push({
                                    s: d.totalShapeLength * v,
                                    e: d.totalShapeLength
                                }), y.push({
                                    s: 0,
                                    e: d.totalShapeLength * (b - 1)
                                }));
                                var x = this.addShapes(d, y[0]);
                                if (y[0].s !== y[0].e) {
                                    if (1 < y.length)
                                        if (d.shape.paths.shapes[d.shape.paths._length - 1].c) {
                                            var P = x.pop();
                                            this.addPaths(x, u), x = this.addShapes(d, y[1], P)
                                        } else this.addPaths(x, u), x = this.addShapes(d, y[1]);
                                    this.addPaths(x, u)
                                }
                            }
                            d.shape.paths = u
                        }
                }
            }, TrimModifier.prototype.addPaths = function (t, e) {
                var r, i = t.length;
                for (r = 0; r < i; r += 1) e.addShape(t[r])
            }, TrimModifier.prototype.addSegment = function (t, e, r, i, s, a, n) {
                s.setXYAt(e[0], e[1], "o", a), s.setXYAt(r[0], r[1], "i", a + 1), n && s.setXYAt(t[0], t[1],
                    "v", a), s.setXYAt(i[0], i[1], "v", a + 1)
            }, TrimModifier.prototype.addSegmentFromArray = function (t, e, r, i) {
                e.setXYAt(t[1], t[5], "o", r), e.setXYAt(t[2], t[6], "i", r + 1), i && e.setXYAt(t[0], t[4],
                    "v", r), e.setXYAt(t[3], t[7], "v", r + 1)
            }, TrimModifier.prototype.addShapes = function (t, e, r) {
                var i, s, a, n, o, h, l, p, m = t.pathsData,
                    f = t.shape.paths.shapes,
                    c = t.shape.paths._length,
                    d = 0,
                    u = [],
                    y = !0;
                for (p = r ? (o = r._length, r._length) : (r = shape_pool.newElement(), o = 0), u.push(r),
                    i = 0; i < c; i += 1) {
                    for (h = m[i].lengths, r.c = f[i].c, a = f[i].c ? h.length : h.length + 1, s = 1; s <
                        a; s += 1)
                        if (d + (n = h[s - 1]).addedLength < e.s) d += n.addedLength, r.c = !1;
                        else {
                            if (d > e.e) {
                                r.c = !1;
                                break
                            }
                            e.s <= d && e.e >= d + n.addedLength ? (this.addSegment(f[i].v[s - 1], f[i].o[
                                s - 1], f[i].i[s], f[i].v[s], r, o, y), y = !1) : (l = bez
                                    .getNewSegment(f[i].v[s - 1], f[i].v[s], f[i].o[s - 1], f[i].i[s], (e
                                        .s - d) / n.addedLength, (e.e - d) / n.addedLength, h[s - 1]), this
                                            .addSegmentFromArray(l, r, o, y), y = !1, r.c = !1), d += n.addedLength,
                                o += 1
                        } if (f[i].c && h.length) {
                            if (n = h[s - 1], d <= e.e) {
                                var g = h[s - 1].addedLength;
                                e.s <= d && e.e >= d + g ? (this.addSegment(f[i].v[s - 1], f[i].o[s - 1], f[i]
                                    .i[0], f[i].v[0], r, o, y), y = !1) : (l = bez.getNewSegment(f[i].v[s -
                                        1], f[i].v[0], f[i].o[s - 1], f[i].i[0], (e.s - d) / g, (e.e -
                                            d) / g, h[s - 1]), this.addSegmentFromArray(l, r, o, y), y = !1, r
                                                .c = !1)
                            } else r.c = !1;
                            d += n.addedLength, o += 1
                        }
                    if (r._length && (r.setXYAt(r.v[p][0], r.v[p][1], "i", p), r.setXYAt(r.v[r._length - 1][
                        0
                    ], r.v[r._length - 1][1], "o", r._length - 1)), d > e.e) break;
                    i < c - 1 && (r = shape_pool.newElement(), y = !0, u.push(r), o = 0)
                }
                return u
            }, ShapeModifiers.registerModifier("tm", TrimModifier), extendPrototype([ShapeModifier],
                RoundCornersModifier), RoundCornersModifier.prototype.initModifierProperties = function (t,
                    e) {
                    this.getValue = this.processKeys, this.rd = PropertyFactory.getProp(t, e.r, 0, null, this),
                        this._isAnimated = !!this.rd.effectsSequence.length
                }, RoundCornersModifier.prototype.processPath = function (t, e) {
                    var r = shape_pool.newElement();
                    r.c = t.c;
                    var i, s, a, n, o, h, l, p, m, f, c, d, u, y = t._length,
                        g = 0;
                    for (i = 0; i < y; i += 1) s = t.v[i], n = t.o[i], a = t.i[i], s[0] === n[0] && s[1] === n[
                        1] && s[0] === a[0] && s[1] === a[1] ? 0 !== i && i !== y - 1 || t.c ? (o = 0 ===
                            i ? t.v[y - 1] : t.v[i - 1], l = (h = Math.sqrt(Math.pow(s[0] - o[0], 2) + Math.pow(
                                s[1] - o[1], 2))) ? Math.min(h / 2, e) / h : 0, p = d = s[0] + (o[0] - s[0]) *
                                l, m = u = s[1] - (s[1] - o[1]) * l, f = p - (p - s[0]) * roundCorner, c = m - (m -
                                    s[1]) * roundCorner, r.setTripleAt(p, m, f, c, d, u, g), g += 1, o = i === y -
                                        1 ? t.v[0] : t.v[i + 1], l = (h = Math.sqrt(Math.pow(s[0] - o[0], 2) + Math.pow(s[
                                            1] - o[1], 2))) ? Math.min(h / 2, e) / h : 0, p = f = s[0] + (o[0] - s[0]) * l,
                            m = c = s[1] + (o[1] - s[1]) * l, d = p - (p - s[0]) * roundCorner, u = m - (m - s[
                                1]) * roundCorner, r.setTripleAt(p, m, f, c, d, u, g)) : r.setTripleAt(s[0], s[
                                    1], n[0], n[1], a[0], a[1], g) : r.setTripleAt(t.v[i][0], t.v[i][1], t.o[i][0], t.o[
                                        i][1], t.i[i][0], t.i[i][1], g), g += 1;
                    return r
                }, RoundCornersModifier.prototype.processShapes = function (t) {
                    var e, r, i, s, a, n, o = this.shapes.length,
                        h = this.rd.v;
                    if (0 !== h)
                        for (r = 0; r < o; r += 1) {
                            if ((a = this.shapes[r]).shape.paths, n = a.localShapeCollection, a.shape._mdf ||
                                this._mdf || t)
                                for (n.releaseShapes(), a.shape._mdf = !0, e = a.shape.paths.shapes, s = a.shape
                                    .paths._length, i = 0; i < s; i += 1) n.addShape(this.processPath(e[i], h));
                            a.shape.paths = a.localShapeCollection
                        }
                    this.dynamicProperties.length || (this._mdf = !1)
                }, ShapeModifiers.registerModifier("rd", RoundCornersModifier), extendPrototype([ShapeModifier],
                    RepeaterModifier), RepeaterModifier.prototype.initModifierProperties = function (t, e) {
                        this.getValue = this.processKeys, this.c = PropertyFactory.getProp(t, e.c, 0, null, this),
                            this.o = PropertyFactory.getProp(t, e.o, 0, null, this), this.tr =
                            TransformPropertyFactory.getTransformProperty(t, e.tr, this), this.so = PropertyFactory
                                .getProp(t, e.tr.so, 0, .01, this), this.eo = PropertyFactory.getProp(t, e.tr.eo, 0,
                                    .01, this), this.data = e, this.dynamicProperties.length || this.getValue(!0), this
                                        ._isAnimated = !!this.dynamicProperties.length, this.pMatrix = new Matrix, this
                                            .rMatrix = new Matrix, this.sMatrix = new Matrix, this.tMatrix = new Matrix, this
                                                .matrix = new Matrix
                    }, RepeaterModifier.prototype.applyTransforms = function (t, e, r, i, s, a) {
                        var n = a ? -1 : 1,
                            o = i.s.v[0] + (1 - i.s.v[0]) * (1 - s),
                            h = i.s.v[1] + (1 - i.s.v[1]) * (1 - s);
                        t.translate(i.p.v[0] * n * s, i.p.v[1] * n * s, i.p.v[2]), e.translate(-i.a.v[0], -i.a.v[1],
                            i.a.v[2]), e.rotate(-i.r.v * n * s), e.translate(i.a.v[0], i.a.v[1], i.a.v[2]), r
                                .translate(-i.a.v[0], -i.a.v[1], i.a.v[2]), r.scale(a ? 1 / o : o, a ? 1 / h : h), r
                                    .translate(i.a.v[0], i.a.v[1], i.a.v[2])
                    }, RepeaterModifier.prototype.init = function (t, e, r, i) {
                        this.elem = t, this.arr = e, this.pos = r, this.elemsData = i, this._currentCopies = 0, this
                            ._elements = [], this._groups = [], this.frameId = -1, this
                                .initDynamicPropertyContainer(t), this.initModifierProperties(t, e[r]);
                        for (; 0 < r;) r -= 1, this._elements.unshift(e[r]), 1;
                        this.dynamicProperties.length ? this.k = !0 : this.getValue(!0)
                    }, RepeaterModifier.prototype.resetElements = function (t) {
                        var e, r = t.length;
                        for (e = 0; e < r; e += 1) t[e]._processed = !1, "gr" === t[e].ty && this.resetElements(t[e]
                            .it)
                    }, RepeaterModifier.prototype.cloneElements = function (t) {
                        t.length;
                        var e = JSON.parse(JSON.stringify(t));
                        return this.resetElements(e), e
                    }, RepeaterModifier.prototype.changeGroupRender = function (t, e) {
                        var r, i = t.length;
                        for (r = 0; r < i; r += 1) t[r]._render = e, "gr" === t[r].ty && this.changeGroupRender(t[r]
                            .it, e)
                    }, RepeaterModifier.prototype.processShapes = function (t) {
                        var e, r, i, s, a;
                        if (this._mdf || t) {
                            var n, o = Math.ceil(this.c.v);
                            if (this._groups.length < o) {
                                for (; this._groups.length < o;) {
                                    var h = {
                                        it: this.cloneElements(this._elements),
                                        ty: "gr"
                                    };
                                    h.it.push({
                                        a: {
                                            a: 0,
                                            ix: 1,
                                            k: [0, 0]
                                        },
                                        nm: "Transform",
                                        o: {
                                            a: 0,
                                            ix: 7,
                                            k: 100
                                        },
                                        p: {
                                            a: 0,
                                            ix: 2,
                                            k: [0, 0]
                                        },
                                        r: {
                                            a: 1,
                                            ix: 6,
                                            k: [{
                                                s: 0,
                                                e: 0,
                                                t: 0
                                            }, {
                                                s: 0,
                                                e: 0,
                                                t: 1
                                            }]
                                        },
                                        s: {
                                            a: 0,
                                            ix: 3,
                                            k: [100, 100]
                                        },
                                        sa: {
                                            a: 0,
                                            ix: 5,
                                            k: 0
                                        },
                                        sk: {
                                            a: 0,
                                            ix: 4,
                                            k: 0
                                        },
                                        ty: "tr"
                                    }), this.arr.splice(0, 0, h), this._groups.splice(0, 0, h), this
                                        ._currentCopies += 1
                                }
                                this.elem.reloadShapes()
                            }
                            for (i = a = 0; i <= this._groups.length - 1; i += 1) n = a < o, this._groups[i]
                                ._render = n, this.changeGroupRender(this._groups[i].it, n), a += 1;
                            this._currentCopies = o;
                            var l = this.o.v,
                                p = l % 1,
                                m = 0 < l ? Math.floor(l) : Math.ceil(l),
                                f = (this.tr.v.props, this.pMatrix.props),
                                c = this.rMatrix.props,
                                d = this.sMatrix.props;
                            this.pMatrix.reset(), this.rMatrix.reset(), this.sMatrix.reset(), this.tMatrix.reset(),
                                this.matrix.reset();
                            var u, y, g = 0;
                            if (0 < l) {
                                for (; g < m;) this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this
                                    .tr, 1, !1), g += 1;
                                p && (this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, p, !
                                    1), g += p)
                            } else if (l < 0) {
                                for (; m < g;) this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this
                                    .tr, 1, !0), g -= 1;
                                p && (this.applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, -p, !
                                    0), g -= p)
                            }
                            for (i = 1 === this.data.m ? 0 : this._currentCopies - 1, s = 1 === this.data.m ? 1 : -
                                1, a = this._currentCopies; a;) {
                                if (y = (r = (e = this.elemsData[i].it)[e.length - 1].transform.mProps.v.props)
                                    .length, e[e.length - 1].transform.mProps._mdf = !0, e[e.length - 1].transform
                                        .op._mdf = !0, e[e.length - 1].transform.op.v = this.so.v + (this.eo.v - this.so
                                            .v) * (i / (this._currentCopies - 1)), 0 !== g) {
                                    for ((0 !== i && 1 === s || i !== this._currentCopies - 1 && -1 === s) && this
                                        .applyTransforms(this.pMatrix, this.rMatrix, this.sMatrix, this.tr, 1, !1),
                                        this.matrix.transform(c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8],
                                            c[9], c[10], c[11], c[12], c[13], c[14], c[15]), this.matrix.transform(
                                                d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9], d[10], d[
                                            11], d[12], d[13], d[14], d[15]), this.matrix.transform(f[0], f[1],
                                                f[
                                                2], f[3], f[4], f[5], f[6], f[7], f[8], f[9], f[10], f[11], f[12],
                                                f[
                                                13], f[14], f[15]), u = 0; u < y; u += 1) r[u] = this.matrix.props[
                                                    u];
                                    this.matrix.reset()
                                } else
                                    for (this.matrix.reset(), u = 0; u < y; u += 1) r[u] = this.matrix.props[u];
                                g += 1, a -= 1, i += s
                            }
                        } else
                            for (a = this._currentCopies, i = 0, s = 1; a;) r = (e = this.elemsData[i].it)[e
                                .length - 1].transform.mProps.v.props, e[e.length - 1].transform.mProps._mdf = !
                                1, e[e.length - 1].transform.op._mdf = !1, a -= 1, i += s
                    }, RepeaterModifier.prototype.addShape = function () { }, ShapeModifiers.registerModifier("rp",
                        RepeaterModifier), ShapeCollection.prototype.addShape = function (t) {
                            this._length === this._maxLength && (this.shapes = this.shapes.concat(createSizedArray(this
                                ._maxLength)), this._maxLength *= 2), this.shapes[this._length] = t, this._length +=
                                1
                        }, ShapeCollection.prototype.releaseShapes = function () {
                            var t;
                            for (t = 0; t < this._length; t += 1) shape_pool.release(this.shapes[t]);
                            this._length = 0
                        }, DashProperty.prototype.getValue = function (t) {
                            if ((this.elem.globalData.frameId !== this.frameId || t) && (this.frameId = this.elem
                                .globalData.frameId, this.iterateDynamicProperties(), this._mdf = this._mdf || t,
                                this._mdf)) {
                                var e = 0,
                                    r = this.dataProps.length;
                                for ("svg" === this.renderer && (this.dashStr = ""), e = 0; e < r; e += 1) "o" != this
                                    .dataProps[e].n ? "svg" === this.renderer ? this.dashStr += " " + this.dataProps[e]
                                        .p.v : this.dashArray[e] = this.dataProps[e].p.v : this.dashoffset[0] = this
                                            .dataProps[e].p.v
                            }
                        }, extendPrototype([DynamicPropertyContainer], DashProperty), GradientProperty.prototype
                            .comparePoints = function (t, e) {
                                for (var r = 0, i = this.o.length / 2; r < i;) {
                                    if (.01 < Math.abs(t[4 * r] - t[4 * e + 2 * r])) return !1;
                                    r += 1
                                }
                                return !0
                            }, GradientProperty.prototype.checkCollapsable = function () {
                                if (this.o.length / 2 != this.c.length / 4) return !1;
                                if (this.data.k.k[0].s)
                                    for (var t = 0, e = this.data.k.k.length; t < e;) {
                                        if (!this.comparePoints(this.data.k.k[t].s, this.data.p)) return !1;
                                        t += 1
                                    } else if (!this.comparePoints(this.data.k.k, this.data.p)) return !1;
                                return !0
                            }, GradientProperty.prototype.getValue = function (t) {
                                if (this.prop.getValue(), this._mdf = !1, this._cmdf = !1, this._omdf = !1, this.prop
                                    ._mdf || t) {
                                    var e, r, i, s = 4 * this.data.p;
                                    for (e = 0; e < s; e += 1) r = e % 4 == 0 ? 100 : 255, i = Math.round(this.prop.v[e] *
                                        r), this.c[e] !== i && (this.c[e] = i, this._cmdf = !t);
                                    if (this.o.length)
                                        for (s = this.prop.v.length, e = 4 * this.data.p; e < s; e += 1) r = e % 2 == 0 ?
                                            100 : 1, i = e % 2 == 0 ? Math.round(100 * this.prop.v[e]) : this.prop.v[e],
                                            this.o[e - 4 * this.data.p] !== i && (this.o[e - 4 * this.data.p] = i, this
                                                ._omdf = !t);
                                    this._mdf = !t
                                }
                            }, extendPrototype([DynamicPropertyContainer], GradientProperty);
    var buildShapeString = function (t, e, r, i) {
        if (0 === e) return "";
        var s, a = t.o,
            n = t.i,
            o = t.v,
            h = " M" + i.applyToPointStringified(o[0][0], o[0][1]);
        for (s = 1; s < e; s += 1) h += " C" + i.applyToPointStringified(a[s - 1][0], a[s - 1][1]) +
            " " + i.applyToPointStringified(n[s][0], n[s][1]) + " " + i.applyToPointStringified(o[s]
            [0], o[s][1]);
        return r && e && (h += " C" + i.applyToPointStringified(a[s - 1][0], a[s - 1][1]) + " " + i
            .applyToPointStringified(n[0][0], n[0][1]) + " " + i.applyToPointStringified(o[0][
                0
            ], o[0][1]), h += "z"), h
    },
        ImagePreloader = function () {
            var s = function () {
                var t = createTag("canvas");
                t.width = 1, t.height = 1;
                var e = t.getContext("2d");
                return e.fillStyle = "rgba(0,0,0,0)", e.fillRect(0, 0, 1, 1), t
            }();

            function t() {
                this.loadedAssets += 1, this.loadedAssets === this.totalImages && this.imagesLoadedCb &&
                    this.imagesLoadedCb(null)
            }

            function e(t) {
                var e = function (t, e, r) {
                    var i = "";
                    if (t.e) i = t.p;
                    else if (e) {
                        var s = t.p; - 1 !== s.indexOf("images/") && (s = s.split("/")[1]), i = e +
                            s
                    } else i = r, i += t.u ? t.u : "", i += t.p;
                    return i
                }(t, this.assetsPath, this.path),
                    r = createTag("img");
                r.crossOrigin = "anonymous", r.addEventListener("load", this._imageLoaded.bind(this), !
                    1), r.addEventListener("error", function () {
                        i.img = s, this._imageLoaded()
                    }.bind(this), !1), r.src = e;
                var i = {
                    img: r,
                    assetData: t
                };
                return i
            }

            function r(t, e) {
                this.imagesLoadedCb = e;
                var r, i = t.length;
                for (r = 0; r < i; r += 1) t[r].layers || (this.totalImages += 1, this.images.push(this
                    ._createImageData(t[r])))
            }

            function i(t) {
                this.path = t || ""
            }

            function a(t) {
                this.assetsPath = t || ""
            }

            function n(t) {
                for (var e = 0, r = this.images.length; e < r;) {
                    if (this.images[e].assetData === t) return this.images[e].img;
                    e += 1
                }
            }

            function o() {
                this.imagesLoadedCb = null, this.images.length = 0
            }

            function h() {
                return this.totalImages === this.loadedAssets
            }
            return function () {
                this.loadAssets = r, this.setAssetsPath = a, this.setPath = i, this.loaded = h, this
                    .destroy = o, this.getImage = n, this._createImageData = e, this._imageLoaded =
                    t, this.assetsPath = "", this.path = "", this.totalImages = 0, this
                        .loadedAssets = 0, this.imagesLoadedCb = null, this.images = []
            }
        }(),
        featureSupport = (sw = {
            maskType: !0
        }, (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) ||
            /rv:11.0/i.test(navigator.userAgent) || /Edge\/\d./i.test(navigator.userAgent)) && (sw
                .maskType = !1), sw),
        sw, filtersFactory = (tw = {}, tw.createFilter = function (t) {
            var e = createNS("filter");
            return e.setAttribute("id", t), e.setAttribute("filterUnits", "objectBoundingBox"), e
                .setAttribute("x", "0%"), e.setAttribute("y", "0%"), e.setAttribute("width",
                    "100%"), e.setAttribute("height", "100%"), e
        }, tw.createAlphaToLuminanceFilter = function () {
            var t = createNS("feColorMatrix");
            return t.setAttribute("type", "matrix"), t.setAttribute("color-interpolation-filters",
                "sRGB"), t.setAttribute("values", "0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 1"),
                t
        }, tw),
        tw, assetLoader = function () {
            function a(t) {
                return t.response && "object" == typeof t.response ? t.response : t.response &&
                    "string" == typeof t.response ? JSON.parse(t.response) : t.responseText ? JSON
                        .parse(t.responseText) : void 0
            }
            return {
                load: function (t, e, r) {
                    var i, s = new XMLHttpRequest;
                    s.open("GET", t, !0);
                    try {
                        s.responseType = "json"
                    } catch (t) { }
                    s.send(), s.onreadystatechange = function () {
                        if (4 == s.readyState)
                            if (200 == s.status) i = a(s), e(i);
                            else try {
                                i = a(s), e(i)
                            } catch (t) {
                                r && r(t)
                            }
                    }
                }
            }
        }();

    function TextAnimatorProperty(t, e, r) {
        this._isFirstFrame = !0, this._hasMaskedPath = !1, this._frameId = -1, this._textData = t, this
            ._renderType = e, this._elem = r, this._animatorsData = createSizedArray(this._textData.a
                .length), this._pathData = {}, this._moreOptions = {
                    alignment: {}
                }, this.renderedLetters = [], this.lettersChangedFlag = !1, this
                    .initDynamicPropertyContainer(r)
    }

    function TextAnimatorDataProperty(t, e, r) {
        var i = {
            propType: !1
        },
            s = PropertyFactory.getProp,
            a = e.a;
        this.a = {
            r: a.r ? s(t, a.r, 0, degToRads, r) : i,
            rx: a.rx ? s(t, a.rx, 0, degToRads, r) : i,
            ry: a.ry ? s(t, a.ry, 0, degToRads, r) : i,
            sk: a.sk ? s(t, a.sk, 0, degToRads, r) : i,
            sa: a.sa ? s(t, a.sa, 0, degToRads, r) : i,
            s: a.s ? s(t, a.s, 1, .01, r) : i,
            a: a.a ? s(t, a.a, 1, 0, r) : i,
            o: a.o ? s(t, a.o, 0, .01, r) : i,
            p: a.p ? s(t, a.p, 1, 0, r) : i,
            sw: a.sw ? s(t, a.sw, 0, 0, r) : i,
            sc: a.sc ? s(t, a.sc, 1, 0, r) : i,
            fc: a.fc ? s(t, a.fc, 1, 0, r) : i,
            fh: a.fh ? s(t, a.fh, 0, 0, r) : i,
            fs: a.fs ? s(t, a.fs, 0, .01, r) : i,
            fb: a.fb ? s(t, a.fb, 0, .01, r) : i,
            t: a.t ? s(t, a.t, 0, 0, r) : i
        }, this.s = TextSelectorProp.getTextSelectorProp(t, e.s, r), this.s.t = e.s.t
    }

    function LetterProps(t, e, r, i, s, a) {
        this.o = t, this.sw = e, this.sc = r, this.fc = i, this.m = s, this.p = a, this._mdf = {
            o: !0,
            sw: !!e,
            sc: !!r,
            fc: !!i,
            m: !0,
            p: !0
        }
    }

    function TextProperty(t, e) {
        this._frameId = initialDefaultFrame, this.pv = "", this.v = "", this.kf = !1, this
            ._isFirstFrame = !0, this._mdf = !1, this.data = e, this.elem = t, this.comp = this.elem
                .comp, this.keysIndex = 0, this.canResize = !1, this.minimumFontSize = 1, this
                    .effectsSequence = [], this.currentData = {
                        ascent: 0,
                        boxWidth: this.defaultBoxWidth,
                        f: "",
                        fStyle: "",
                        fWeight: "",
                        fc: "",
                        j: "",
                        justifyOffset: "",
                        l: [],
                        lh: 0,
                        lineWidths: [],
                        ls: "",
                        of: "",
                        s: "",
                        sc: "",
                        sw: 0,
                        t: 0,
                        tr: 0,
                        sz: 0,
                        ps: null,
                        fillColorAnim: !1,
                        strokeColorAnim: !1,
                        strokeWidthAnim: !1,
                        yOffset: 0,
                        finalSize: 0,
                        finalText: [],
                        finalLineHeight: 0,
                        __complete: !1
                    }, this.copyData(this.currentData, this.data.d.k[0].s), this.searchProperty() || this
                        .completeTextData(this.currentData)
    }
    TextAnimatorProperty.prototype.searchProperties = function () {
        var t, e, r = this._textData.a.length,
            i = PropertyFactory.getProp;
        for (t = 0; t < r; t += 1) e = this._textData.a[t], this._animatorsData[t] =
            new TextAnimatorDataProperty(this._elem, e, this);
        this._textData.p && "m" in this._textData.p ? (this._pathData = {
            f: i(this._elem, this._textData.p.f, 0, 0, this),
            l: i(this._elem, this._textData.p.l, 0, 0, this),
            r: this._textData.p.r,
            m: this._elem.maskManager.getMaskProperty(this._textData.p.m)
        }, this._hasMaskedPath = !0) : this._hasMaskedPath = !1, this._moreOptions.alignment =
            i(this._elem, this._textData.m.a, 1, 0, this)
    }, TextAnimatorProperty.prototype.getMeasures = function (t, e) {
        if (this.lettersChangedFlag = e, this._mdf || this._isFirstFrame || e || this
            ._hasMaskedPath && this._pathData.m._mdf) {
            this._isFirstFrame = !1;
            var r, i, s, a, n, o, h, l, p, m, f, c, d, u, y, g, v, b, E, x = this._moreOptions
                .alignment.v,
                P = this._animatorsData,
                S = this._textData,
                _ = this.mHelper,
                A = this._renderType,
                C = this.renderedLetters.length,
                T = (this.data, t.l);
            if (this._hasMaskedPath) {
                if (E = this._pathData.m, !this._pathData.n || this._pathData._mdf) {
                    var k, M = E.v;
                    for (this._pathData.r && (M = M.reverse()), n = {
                        tLength: 0,
                        segments: []
                    }, a = M._length - 1, s = g = 0; s < a; s += 1) k = bez.buildBezierData(M.v[
                        s], M.v[s + 1], [M.o[s][0] - M.v[s][0], M.o[s][1] - M.v[s][1]], [M
                            .i[s + 1][0] - M.v[s + 1][0], M.i[s + 1][1] - M.v[s + 1][1]
                    ]), n.tLength += k.segmentLength, n.segments.push(k), g += k.segmentLength;
                    s = a, E.v.c && (k = bez.buildBezierData(M.v[s], M.v[0], [M.o[s][0] - M.v[s][0],
                    M.o[s][1] - M.v[s][1]
                    ], [M.i[0][0] - M.v[0][0], M.i[0][1] - M.v[0][1]]), n.tLength += k
                        .segmentLength, n.segments.push(k), g += k.segmentLength), this
                            ._pathData.pi = n
                }
                if (n = this._pathData.pi, o = this._pathData.f.v, m = 1, p = !(l = f = 0), u = n
                    .segments, o < 0 && E.v.c)
                    for (n.tLength < Math.abs(o) && (o = -Math.abs(o) % n.tLength), m = (d = u[f = u
                        .length - 1].points).length - 1; o < 0;) o += d[m].partialLength, (m -=
                            1) < 0 && (m = (d = u[f -= 1].points).length - 1);
                c = (d = u[f].points)[m - 1], y = (h = d[m]).partialLength
            }
            a = T.length, i = r = 0;
            var D, w, F, I, V = 1.2 * t.finalSize * .714,
                R = !0;
            F = P.length;
            var B, L, G, z, N, O, H, j, q, W, Y, X, $, K = -1,
                U = o,
                J = f,
                Z = m,
                Q = -1,
                tt = "",
                et = this.defaultPropsArray;
            if (2 === t.j || 1 === t.j) {
                var rt = 0,
                    it = 0,
                    st = 2 === t.j ? -.5 : -1,
                    at = 0,
                    nt = !0;
                for (s = 0; s < a; s += 1)
                    if (T[s].n) {
                        for (rt && (rt += it); at < s;) T[at].animatorJustifyOffset = rt, at += 1;
                        nt = !(rt = 0)
                    } else {
                        for (w = 0; w < F; w += 1)(D = P[w].a).t.propType && (nt && 2 === t.j && (
                            it += D.t.v * st), (B = P[w].s.getMult(T[s].anIndexes[w], S.a[w]
                                .s.totalChars)).length ? rt += D.t.v * B[0] * st : rt += D.t.v *
                                B * st);
                        nt = !1
                    } for (rt && (rt += it); at < s;) T[at].animatorJustifyOffset = rt, at += 1
            }
            for (s = 0; s < a; s += 1) {
                if (_.reset(), N = 1, T[s].n) r = 0, i += t.yOffset, i += R ? 1 : 0, o = U, R = !1,
                    0, this._hasMaskedPath && (m = Z, c = (d = u[f = J].points)[m - 1], y = (h = d[
                        m]).partialLength, l = 0), $ = W = X = tt = "", et = this.defaultPropsArray;
                else {
                    if (this._hasMaskedPath) {
                        if (Q !== T[s].line) {
                            switch (t.j) {
                                case 1:
                                    o += g - t.lineWidths[T[s].line];
                                    break;
                                case 2:
                                    o += (g - t.lineWidths[T[s].line]) / 2
                            }
                            Q = T[s].line
                        }
                        K !== T[s].ind && (T[K] && (o += T[K].extra), o += T[s].an / 2, K = T[s]
                            .ind), o += x[0] * T[s].an / 200;
                        var ot = 0;
                        for (w = 0; w < F; w += 1)(D = P[w].a).p.propType && ((B = P[w].s.getMult(T[
                            s].anIndexes[w], S.a[w].s.totalChars)).length ? ot += D.p.v[0] *
                            B[0] : ot += D.p.v[0] * B), D.a.propType && ((B = P[w].s.getMult(T[
                                s].anIndexes[w], S.a[w].s.totalChars)).length ? ot += D.a.v[0] *
                                B[0] : ot += D.a.v[0] * B);
                        for (p = !0; p;) o + ot <= l + y || !d ? (v = (o + ot - l) / h
                            .partialLength, G = c.point[0] + (h.point[0] - c.point[0]) * v, z =
                            c.point[1] + (h.point[1] - c.point[1]) * v, _.translate(-x[0] * T[s]
                                .an / 200, -x[1] * V / 100), p = !1) : d && (l += h
                                    .partialLength, (m += 1) >= d.length && (m = 0, d = u[f += 1] ? u[f]
                                        .points : E.v.c ? u[f = m = 0].points : (l -= h.partialLength,
                                            null)), d && (c = h, y = (h = d[m]).partialLength));
                        L = T[s].an / 2 - T[s].add, _.translate(-L, 0, 0)
                    } else L = T[s].an / 2 - T[s].add, _.translate(-L, 0, 0), _.translate(-x[0] * T[
                        s].an / 200, -x[1] * V / 100, 0);
                    for (T[s].l / 2, w = 0; w < F; w += 1)(D = P[w].a).t.propType && (B = P[w].s
                        .getMult(T[s].anIndexes[w], S.a[w].s.totalChars), 0 === r && 0 === t
                            .j || (this._hasMaskedPath ? B.length ? o += D.t.v * B[0] : o += D.t.v *
                                B : B.length ? r += D.t.v * B[0] : r += D.t.v * B));
                    for (T[s].l / 2, t.strokeWidthAnim && (H = t.sw || 0), t.strokeColorAnim && (O =
                        t.sc ? [t.sc[0], t.sc[1], t.sc[2]] : [0, 0, 0]), t.fillColorAnim && t
                            .fc && (j = [t.fc[0], t.fc[1], t.fc[2]]), w = 0; w < F; w += 1)(D = P[w].a)
                                .a.propType && ((B = P[w].s.getMult(T[s].anIndexes[w], S.a[w].s.totalChars))
                                    .length ? _.translate(-D.a.v[0] * B[0], -D.a.v[1] * B[1], D.a.v[2] * B[
                                        2]) : _.translate(-D.a.v[0] * B, -D.a.v[1] * B, D.a.v[2] * B));
                    for (w = 0; w < F; w += 1)(D = P[w].a).s.propType && ((B = P[w].s.getMult(T[s]
                        .anIndexes[w], S.a[w].s.totalChars)).length ? _.scale(1 + (D.s.v[
                            0] - 1) * B[0], 1 + (D.s.v[1] - 1) * B[1], 1) : _.scale(1 + (D.s.v[
                                0] - 1) * B, 1 + (D.s.v[1] - 1) * B, 1));
                    for (w = 0; w < F; w += 1) {
                        if (D = P[w].a, B = P[w].s.getMult(T[s].anIndexes[w], S.a[w].s.totalChars),
                            D.sk.propType && (B.length ? _.skewFromAxis(-D.sk.v * B[0], D.sa.v * B[
                                1]) : _.skewFromAxis(-D.sk.v * B, D.sa.v * B)), D.r.propType && (B
                                    .length ? _.rotateZ(-D.r.v * B[2]) : _.rotateZ(-D.r.v * B)), D.ry
                                        .propType && (B.length ? _.rotateY(D.ry.v * B[1]) : _.rotateY(D.ry.v *
                                            B)), D.rx.propType && (B.length ? _.rotateX(D.rx.v * B[0]) : _
                                                .rotateX(D.rx.v * B)), D.o.propType && (B.length ? N += (D.o.v * B[
                                                    0] - N) * B[0] : N += (D.o.v * B - N) * B), t.strokeWidthAnim && D
                                                        .sw.propType && (B.length ? H += D.sw.v * B[0] : H += D.sw.v * B), t
                                                            .strokeColorAnim && D.sc.propType)
                            for (q = 0; q < 3; q += 1) B.length ? O[q] = O[q] + (D.sc.v[q] - O[q]) *
                                B[0] : O[q] = O[q] + (D.sc.v[q] - O[q]) * B;
                        if (t.fillColorAnim && t.fc) {
                            if (D.fc.propType)
                                for (q = 0; q < 3; q += 1) B.length ? j[q] = j[q] + (D.fc.v[q] - j[
                                    q]) * B[0] : j[q] = j[q] + (D.fc.v[q] - j[q]) * B;
                            D.fh.propType && (j = B.length ? addHueToRGB(j, D.fh.v * B[0]) :
                                addHueToRGB(j, D.fh.v * B)), D.fs.propType && (j = B.length ?
                                    addSaturationToRGB(j, D.fs.v * B[0]) : addSaturationToRGB(j, D
                                        .fs.v * B)), D.fb.propType && (j = B.length ?
                                            addBrightnessToRGB(j, D.fb.v * B[0]) : addBrightnessToRGB(j, D
                                                .fb.v * B))
                        }
                    }
                    for (w = 0; w < F; w += 1)(D = P[w].a).p.propType && (B = P[w].s.getMult(T[s]
                        .anIndexes[w], S.a[w].s.totalChars), this._hasMaskedPath ? B
                            .length ? _.translate(0, D.p.v[1] * B[0], -D.p.v[2] * B[1]) : _
                                .translate(0, D.p.v[1] * B, -D.p.v[2] * B) : B.length ? _.translate(D.p
                                    .v[0] * B[0], D.p.v[1] * B[1], -D.p.v[2] * B[2]) : _.translate(D.p
                                        .v[0] * B, D.p.v[1] * B, -D.p.v[2] * B));
                    if (t.strokeWidthAnim && (W = H < 0 ? 0 : H), t.strokeColorAnim && (Y = "rgb(" +
                        Math.round(255 * O[0]) + "," + Math.round(255 * O[1]) + "," + Math
                            .round(255 * O[2]) + ")"), t.fillColorAnim && t.fc && (X = "rgb(" + Math
                                .round(255 * j[0]) + "," + Math.round(255 * j[1]) + "," + Math.round(
                                    255 * j[2]) + ")"), this._hasMaskedPath) {
                        if (_.translate(0, -t.ls), _.translate(0, x[1] * V / 100 + i, 0), S.p.p) {
                            b = (h.point[1] - c.point[1]) / (h.point[0] - c.point[0]);
                            var ht = 180 * Math.atan(b) / Math.PI;
                            h.point[0] < c.point[0] && (ht += 180), _.rotate(-ht * Math.PI / 180)
                        }
                        _.translate(G, z, 0), o -= x[0] * T[s].an / 200, T[s + 1] && K !== T[s + 1]
                            .ind && (o += T[s].an / 2, o += t.tr / 1e3 * t.finalSize)
                    } else {
                        switch (_.translate(r, i, 0), t.ps && _.translate(t.ps[0], t.ps[1] + t
                            .ascent, 0), t.j) {
                            case 1:
                                _.translate(T[s].animatorJustifyOffset + t.justifyOffset + (t
                                    .boxWidth - t.lineWidths[T[s].line]), 0, 0);
                                break;
                            case 2:
                                _.translate(T[s].animatorJustifyOffset + t.justifyOffset + (t
                                    .boxWidth - t.lineWidths[T[s].line]) / 2, 0, 0)
                        }
                        _.translate(0, -t.ls), _.translate(L, 0, 0), _.translate(x[0] * T[s].an /
                            200, x[1] * V / 100, 0), r += T[s].l + t.tr / 1e3 * t.finalSize
                    }
                    "html" === A ? tt = _.toCSS() : "svg" === A ? tt = _.to2dCSS() : et = [_.props[
                        0], _.props[1], _.props[2], _.props[3], _.props[4], _.props[5], _
                            .props[6], _.props[7], _.props[8], _.props[9], _.props[10], _.props[11],
                    _.props[12], _.props[13], _.props[14], _.props[15]
                    ], $ = N
                }
                this.lettersChangedFlag = C <= s ? (I = new LetterProps($, W, Y, X, tt, et), this
                    .renderedLetters.push(I), C += 1, !0) : (I = this.renderedLetters[s])
                        .update($, W, Y, X, tt, et) || this.lettersChangedFlag
            }
        }
    }, TextAnimatorProperty.prototype.getValue = function () {
        this._elem.globalData.frameId !== this._frameId && (this._frameId = this._elem.globalData
            .frameId, this.iterateDynamicProperties())
    }, TextAnimatorProperty.prototype.mHelper = new Matrix, TextAnimatorProperty.prototype
        .defaultPropsArray = [], extendPrototype([DynamicPropertyContainer], TextAnimatorProperty),
        LetterProps.prototype.update = function (t, e, r, i, s, a) {
            this._mdf.o = !1, this._mdf.sw = !1, this._mdf.sc = !1, this._mdf.fc = !1, this._mdf.m = !1;
            var n = this._mdf.p = !1;
            return this.o !== t && (this.o = t, n = this._mdf.o = !0), this.sw !== e && (this.sw = e,
                n = this._mdf.sw = !0), this.sc !== r && (this.sc = r, n = this._mdf.sc = !0), this
                    .fc !== i && (this.fc = i, n = this._mdf.fc = !0), this.m !== s && (this.m = s, n = this
                        ._mdf.m = !0), !a.length || this.p[0] === a[0] && this.p[1] === a[1] && this.p[
                        4] === a[4] && this.p[5] === a[5] && this.p[12] === a[12] && this.p[13] === a[13] ||
                (
                    this.p = a, n = this._mdf.p = !0), n
        }, TextProperty.prototype.defaultBoxWidth = [0, 0], TextProperty.prototype.copyData = function (
            t, e) {
            for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
            return t
        }, TextProperty.prototype.setCurrentData = function (t) {
            t.__complete || this.completeTextData(t), this.currentData = t, this.currentData.boxWidth =
                this.currentData.boxWidth || this.defaultBoxWidth, this._mdf = !0
        }, TextProperty.prototype.searchProperty = function () {
            return this.searchKeyframes()
        }, TextProperty.prototype.searchKeyframes = function () {
            return this.kf = 1 < this.data.d.k.length, this.kf && this.addEffect(this.getKeyframeValue
                .bind(this)), this.kf
        }, TextProperty.prototype.addEffect = function (t) {
            this.effectsSequence.push(t), this.elem.addDynamicProperty(this)
        }, TextProperty.prototype.getValue = function (t) {
            if (this.elem.globalData.frameId !== this.frameId && this.effectsSequence.length || t) {
                this.currentData.t = this.data.d.k[this.keysIndex].s.t;
                var e = this.currentData,
                    r = this.keysIndex;
                if (this.lock) this.setCurrentData(this.currentData);
                else {
                    this.lock = !0, this._mdf = !1;
                    var i, s = this.effectsSequence.length,
                        a = t || this.data.d.k[this.keysIndex].s;
                    for (i = 0; i < s; i += 1) a = r !== this.keysIndex ? this.effectsSequence[i](a, a
                        .t) : this.effectsSequence[i](this.currentData, a.t);
                    e !== a && this.setCurrentData(a), this.pv = this.v = this.currentData, this
                        .lock = !1, this.frameId = this.elem.globalData.frameId
                }
            }
        }, TextProperty.prototype.getKeyframeValue = function () {
            for (var t = this.data.d.k, e = this.elem.comp.renderedFrame, r = 0, i = t.length; r <= i -
                1 && (t[r].s, !(r === i - 1 || t[r + 1].t > e));) r += 1;
            return this.keysIndex !== r && (this.keysIndex = r), this.data.d.k[this.keysIndex].s
        }, TextProperty.prototype.buildFinalText = function (t) {
            for (var e, r = FontManager.getCombinedCharacterCodes(), i = [], s = 0, a = t.length; s <
                a;) e = t.charCodeAt(s), -1 !== r.indexOf(e) ? i[i.length - 1] += t.charAt(s) : 55296 <=
                    e && e <= 56319 && 56320 <= (e = t.charCodeAt(s + 1)) && e <= 57343 ? (i.push(t.substr(
                        s, 2)), ++s) : i.push(t.charAt(s)), s += 1;
            return i
        }, TextProperty.prototype.completeTextData = function (t) {
            t.__complete = !0;
            var e, r, i, s, a, n, o, h = this.elem.globalData.fontManager,
                l = this.data,
                p = [],
                m = 0,
                f = l.m.g,
                c = 0,
                d = 0,
                u = 0,
                y = [],
                g = 0,
                v = 0,
                b = h.getFontByName(t.f),
                E = 0,
                x = b.fStyle ? b.fStyle.split(" ") : [],
                P = "normal",
                S = "normal";
            for (r = x.length, e = 0; e < r; e += 1) switch (x[e].toLowerCase()) {
                case "italic":
                    S = "italic";
                    break;
                case "bold":
                    P = "700";
                    break;
                case "black":
                    P = "900";
                    break;
                case "medium":
                    P = "500";
                    break;
                case "regular":
                case "normal":
                    P = "400";
                    break;
                case "light":
                case "thin":
                    P = "200"
            }
            t.fWeight = b.fWeight || P, t.fStyle = S, t.finalSize = t.s, t.finalText = this
                .buildFinalText(t.t), r = t.finalText.length, t.finalLineHeight = t.lh;
            var _, A = t.tr / 1e3 * t.finalSize;
            if (t.sz)
                for (var C, T, k = !0, M = t.sz[0], D = t.sz[1]; k;) {
                    g = C = 0, r = (T = this.buildFinalText(t.t)).length, A = t.tr / 1e3 * t.finalSize;
                    var w = -1;
                    for (e = 0; e < r; e += 1) _ = T[e].charCodeAt(0), i = !1, " " === T[e] ? w = e :
                        13 !== _ && 3 !== _ || (i = !(g = 0), C += t.finalLineHeight || 1.2 * t
                            .finalSize), M < g + (E = h.chars ? (o = h.getCharData(T[e], b.fStyle, b
                                .fFamily), i ? 0 : o.w * t.finalSize / 100) : h.measureText(T[e], t.f, t
                                    .finalSize)) && " " !== T[e] ? (-1 === w ? r += 1 : e = w, C += t
                                        .finalLineHeight || 1.2 * t.finalSize, T.splice(e, w === e ? 1 : 0, "\r"),
                                        w = -1, g = 0) : (g += E, g += A);
                    C += b.ascent * t.finalSize / 100, this.canResize && t.finalSize > this
                        .minimumFontSize && D < C ? (t.finalSize -= 1, t.finalLineHeight = t.finalSize *
                            t.lh / t.s) : (t.finalText = T, r = t.finalText.length, k = !1)
                }
            g = -A;
            var F, I = E = 0;
            for (e = 0; e < r; e += 1)
                if (i = !1, _ = (F = t.finalText[e]).charCodeAt(0), " " === F ? s = "\xa0" : 13 === _ ||
                    3 === _ ? (I = 0, y.push(g), v = v < g ? g : v, g = -2 * A, i = !(s = ""), u += 1) :
                    s = t.finalText[e], E = h.chars ? (o = h.getCharData(F, b.fStyle, h.getFontByName(t
                        .f).fFamily), i ? 0 : o.w * t.finalSize / 100) : h.measureText(s, t.f, t
                            .finalSize), " " === F ? I += E + A : (g += E + A + I, I = 0), p.push({
                                l: E,
                                an: E,
                                add: c,
                                n: i,
                                anIndexes: [],
                                val: s,
                                line: u,
                                animatorJustifyOffset: 0
                            }), 2 == f) {
                    if (c += E, "" === s || "\xa0" === s || e === r - 1) {
                        for ("" !== s && "\xa0" !== s || (c -= E); d <= e;) p[d].an = c, p[d].ind = m,
                            p[d].extra = E, d += 1;
                        m += 1, c = 0
                    }
                } else if (3 == f) {
                    if (c += E, "" === s || e === r - 1) {
                        for ("" === s && (c -= E); d <= e;) p[d].an = c, p[d].ind = m, p[d].extra = E, d +=
                            1;
                        c = 0, m += 1
                    }
                } else p[m].ind = m, p[m].extra = 0, m += 1;
            if (t.l = p, v = v < g ? g : v, y.push(g), t.sz) t.boxWidth = t.sz[0], t.justifyOffset = 0;
            else switch (t.boxWidth = v, t.j) {
                case 1:
                    t.justifyOffset = -t.boxWidth;
                    break;
                case 2:
                    t.justifyOffset = -t.boxWidth / 2;
                    break;
                default:
                    t.justifyOffset = 0
            }
            t.lineWidths = y;
            var V, R, B = l.a;
            n = B.length;
            var L, G, z = [];
            for (a = 0; a < n; a += 1) {
                for ((V = B[a]).a.sc && (t.strokeColorAnim = !0), V.a.sw && (t.strokeWidthAnim = !0), (V
                    .a.fc || V.a.fh || V.a.fs || V.a.fb) && (t.fillColorAnim = !0), G = 0, L = V.s
                        .b, e = 0; e < r; e += 1)(R = p[e]).anIndexes[a] = G, (1 == L && "" !== R.val ||
                            2 == L && "" !== R.val && "\xa0" !== R.val || 3 == L && (R.n || "\xa0" == R
                                .val || e == r - 1) || 4 == L && (R.n || e == r - 1)) && (1 === V.s.rn && z
                                    .push(G), G += 1);
                l.a[a].s.totalChars = G;
                var N, O = -1;
                if (1 === V.s.rn)
                    for (e = 0; e < r; e += 1) O != (R = p[e]).anIndexes[a] && (O = R.anIndexes[a], N =
                        z.splice(Math.floor(Math.random() * z.length), 1)[0]), R.anIndexes[a] = N
            }
            t.yOffset = t.finalLineHeight || 1.2 * t.finalSize, t.ls = t.ls || 0, t.ascent = b.ascent *
                t.finalSize / 100
        }, TextProperty.prototype.updateDocumentData = function (t, e) {
            e = void 0 === e ? this.keysIndex : e;
            var r = this.copyData({}, this.data.d.k[e].s);
            r = this.copyData(r, t), this.data.d.k[e].s = r, this.recalculate(e), this.elem
                .addDynamicProperty(this)
        }, TextProperty.prototype.recalculate = function (t) {
            var e = this.data.d.k[t].s;
            e.__complete = !1, this.keysIndex = 0, this._isFirstFrame = !0, this.getValue(e)
        }, TextProperty.prototype.canResizeFont = function (t) {
            this.canResize = t, this.recalculate(this.keysIndex), this.elem.addDynamicProperty(this)
        }, TextProperty.prototype.setMinimumFontSize = function (t) {
            this.minimumFontSize = Math.floor(t) || 1, this.recalculate(this.keysIndex), this.elem
                .addDynamicProperty(this)
        };
    var TextSelectorProp = function () {
        var c = Math.max,
            d = Math.min,
            u = Math.floor;

        function i(t, e) {
            this._currentTextLength = -1, this.k = !1, this.data = e, this.elem = t, this.comp = t
                .comp, this.finalS = 0, this.finalE = 0, this.initDynamicPropertyContainer(t), this
                    .s = PropertyFactory.getProp(t, e.s || {
                        k: 0
                    }, 0, 0, this), this.e = "e" in e ? PropertyFactory.getProp(t, e.e, 0, 0, this) : {
                        v: 100
                    }, this.o = PropertyFactory.getProp(t, e.o || {
                        k: 0
                    }, 0, 0, this), this.xe = PropertyFactory.getProp(t, e.xe || {
                        k: 0
                    }, 0, 0, this), this.ne = PropertyFactory.getProp(t, e.ne || {
                        k: 0
                    }, 0, 0, this), this.a = PropertyFactory.getProp(t, e.a, 0, .01, this), this
                        .dynamicProperties.length || this.getValue()
        }
        return i.prototype = {
            getMult: function (t) {
                this._currentTextLength !== this.elem.textProperty.currentData.l.length &&
                    this.getValue();
                var e = 0,
                    r = 0,
                    i = 1,
                    s = 1;
                0 < this.ne.v ? e = this.ne.v / 100 : r = -this.ne.v / 100, 0 < this.xe.v ?
                    i = 1 - this.xe.v / 100 : s = 1 + this.xe.v / 100;
                var a = BezierFactory.getBezierEasing(e, r, i, s).get,
                    n = 0,
                    o = this.finalS,
                    h = this.finalE,
                    l = this.data.sh;
                if (2 === l) n = a(n = h === o ? h <= t ? 1 : 0 : c(0, d(.5 / (h - o) + (t -
                    o) / (h - o), 1)));
                else if (3 === l) n = a(n = h === o ? h <= t ? 0 : 1 : 1 - c(0, d(.5 / (h -
                    o) + (t - o) / (h - o), 1)));
                else if (4 === l) h === o ? n = 0 : (n = c(0, d(.5 / (h - o) + (t - o) / (
                    h - o), 1))) < .5 ? n *= 2 : n = 1 - 2 * (n - .5), n = a(n);
                else if (5 === l) {
                    if (h === o) n = 0;
                    else {
                        var p = h - o,
                            m = -p / 2 + (t = d(c(0, t + .5 - o), h - o)),
                            f = p / 2;
                        n = Math.sqrt(1 - m * m / (f * f))
                    }
                    n = a(n)
                } else n = 6 === l ? a(n = h === o ? 0 : (t = d(c(0, t + .5 - o), h - o), (
                    1 + Math.cos(Math.PI + 2 * Math.PI * t / (h - o))) / 2)) : (t >= u(
                        o) && (n = c(0, d(t - o < 0 ? d(h, 1) - (o - t) : h - t, 1))),
                        a(n));
                return n * this.a.v
            },
            getValue: function (t) {
                this.iterateDynamicProperties(), this._mdf = t || this._mdf, this
                    ._currentTextLength = this.elem.textProperty.currentData.l.length || 0,
                    t && 2 === this.data.r && (this.e.v = this._currentTextLength);
                var e = 2 === this.data.r ? 1 : 100 / this.data.totalChars,
                    r = this.o.v / e,
                    i = this.s.v / e + r,
                    s = this.e.v / e + r;
                if (s < i) {
                    var a = i;
                    i = s, s = a
                }
                this.finalS = i, this.finalE = s
            }
        }, extendPrototype([DynamicPropertyContainer], i), {
            getTextSelectorProp: function (t, e, r) {
                return new i(t, e, r)
            }
        }
    }(),
        pool_factory = function (t, e, r, i) {
            var s = 0,
                a = t,
                n = createSizedArray(a);

            function o() {
                return s ? n[s -= 1] : e()
            }
            return {
                newElement: o,
                release: function (t) {
                    s === a && (n = pooling.double(n), a *= 2), r && r(t), n[s] = t, s += 1
                }
            }
        },
        pooling = {
            double: function (t) {
                return t.concat(createSizedArray(t.length))
            }
        },
        point_pool = pool_factory(8, function () {
            return createTypedArray("float32", 2)
        }),
        shape_pool = (KA = pool_factory(4, function () {
            return new ShapePath
        }, function (t) {
            var e, r = t._length;
            for (e = 0; e < r; e += 1) point_pool.release(t.v[e]), point_pool.release(t.i[e]),
                point_pool.release(t.o[e]), t.v[e] = null, t.i[e] = null, t.o[e] = null;
            t._length = 0, t.c = !1
        }), KA.clone = function (t) {
            var e, r = KA.newElement(),
                i = void 0 === t._length ? t.v.length : t._length;
            for (r.setLength(i), r.c = t.c, e = 0; e < i; e += 1) r.setTripleAt(t.v[e][0], t.v[e][
                1
            ], t.o[e][0], t.o[e][1], t.i[e][0], t.i[e][1], e);
            return r
        }, KA),
        KA, shapeCollection_pool = (TA = {
            newShapeCollection: function () {
                var t;
                t = UA ? WA[UA -= 1] : new ShapeCollection;
                return t
            },
            release: function (t) {
                var e, r = t._length;
                for (e = 0; e < r; e += 1) shape_pool.release(t.shapes[e]);
                t._length = 0, UA === VA && (WA = pooling.double(WA), VA *= 2);
                WA[UA] = t, UA += 1
            }
        }, UA = 0, VA = 4, WA = createSizedArray(VA), TA),
        TA, UA, VA, WA, segments_length_pool = pool_factory(8, function () {
            return {
                lengths: [],
                totalLength: 0
            }
        }, function (t) {
            var e, r = t.lengths.length;
            for (e = 0; e < r; e += 1) bezier_length_pool.release(t.lengths[e]);
            t.lengths.length = 0
        }),
        bezier_length_pool = pool_factory(8, function () {
            return {
                addedLength: 0,
                percents: createTypedArray("float32", defaultCurveSegments),
                lengths: createTypedArray("float32", defaultCurveSegments)
            }
        });

    function BaseRenderer() { }

    function SVGRenderer(t, e) {
        this.animationItem = t, this.layers = null, this.renderedFrame = -1, this.svgElement = createNS(
            "svg");
        var r = "";
        if (e && e.title) {
            var i = createNS("title"),
                s = createElementID();
            i.setAttribute("id", s), i.textContent = e.title, this.svgElement.appendChild(i), r += s
        }
        if (e && e.description) {
            var a = createNS("desc"),
                n = createElementID();
            a.setAttribute("id", n), a.textContent = e.description, this.svgElement.appendChild(a), r +=
                " " + n
        }
        r && this.svgElement.setAttribute("aria-labelledby", r);
        var o = createNS("defs");
        this.svgElement.appendChild(o);
        var h = createNS("g");
        this.svgElement.appendChild(h), this.layerElement = h, this.renderConfig = {
            preserveAspectRatio: e && e.preserveAspectRatio || "xMidYMid meet",
            imagePreserveAspectRatio: e && e.imagePreserveAspectRatio || "xMidYMid slice",
            progressiveLoad: e && e.progressiveLoad || !1,
            hideOnTransparent: !e || !1 !== e.hideOnTransparent,
            viewBoxOnly: e && e.viewBoxOnly || !1,
            viewBoxSize: e && e.viewBoxSize || !1,
            className: e && e.className || "",
            id: e && e.id || "",
            focusable: e && e.focusable
        }, this.globalData = {
            _mdf: !1,
            frameNum: -1,
            defs: o,
            renderConfig: this.renderConfig
        }, this.elements = [], this.pendingElements = [], this.destroyed = !1, this.rendererType =
            "svg"
    }

    function CanvasRenderer(t, e) {
        this.animationItem = t, this.renderConfig = {
            clearCanvas: !e || void 0 === e.clearCanvas || e.clearCanvas,
            context: e && e.context || null,
            progressiveLoad: e && e.progressiveLoad || !1,
            preserveAspectRatio: e && e.preserveAspectRatio || "xMidYMid meet",
            imagePreserveAspectRatio: e && e.imagePreserveAspectRatio || "xMidYMid slice",
            className: e && e.className || "",
            id: e && e.id || ""
        }, this.renderConfig.dpr = e && e.dpr || 1, this.animationItem.wrapper && (this.renderConfig
            .dpr = e && e.dpr || window.devicePixelRatio || 1), this.renderedFrame = -1, this
                .globalData = {
                frameNum: -1,
                _mdf: !1,
                renderConfig: this.renderConfig,
                currentGlobalAlpha: -1
            }, this.contextData = new CVContextData, this.elements = [], this.pendingElements = [], this
                .transformMat = new Matrix, this.completeLayers = !1, this.rendererType = "canvas"
    }

    function HybridRenderer(t, e) {
        this.animationItem = t, this.layers = null, this.renderedFrame = -1, this.renderConfig = {
            className: e && e.className || "",
            imagePreserveAspectRatio: e && e.imagePreserveAspectRatio || "xMidYMid slice",
            hideOnTransparent: !e || !1 !== e.hideOnTransparent
        }, this.globalData = {
            _mdf: !1,
            frameNum: -1,
            renderConfig: this.renderConfig
        }, this.pendingElements = [], this.elements = [], this.threeDElements = [], this
            .destroyed = !1, this.camera = null, this.supports3d = !0, this.rendererType = "html"
    }

    function MaskElement(t, e, r) {
        this.data = t, this.element = e, this.globalData = r, this.storedData = [], this
            .masksProperties = this.data.masksProperties || [], this.maskElement = null;
        var i, s = this.globalData.defs,
            a = this.masksProperties ? this.masksProperties.length : 0;
        this.viewData = createSizedArray(a), this.solidPath = "";
        var n, o, h, l, p, m, f, c = this.masksProperties,
            d = 0,
            u = [],
            y = createElementID(),
            g = "clipPath",
            v = "clip-path";
        for (i = 0; i < a; i++)
            if (("a" !== c[i].mode && "n" !== c[i].mode || c[i].inv || 100 !== c[i].o.k || c[i].o.x) &&
                (v = g = "mask"), "s" != c[i].mode && "i" != c[i].mode || 0 !== d ? l = null : ((l =
                    createNS("rect")).setAttribute("fill", "#ffffff"), l.setAttribute("width", this
                        .element.comp.data.w || 0), l.setAttribute("height", this.element.comp.data.h ||
                            0), u.push(l)), n = createNS("path"), "n" != c[i].mode) {
                var b;
                if (d += 1, n.setAttribute("fill", "s" === c[i].mode ? "#000000" : "#ffffff"), n
                    .setAttribute("clip-rule", "nonzero"), 0 !== c[i].x.k ? (v = g = "mask", f =
                        PropertyFactory.getProp(this.element, c[i].x, 0, null, this.element), b =
                        createElementID(), (p = createNS("filter")).setAttribute("id", b), (m =
                            createNS("feMorphology")).setAttribute("operator", "erode"), m.setAttribute(
                                "in", "SourceGraphic"), m.setAttribute("radius", "0"), p.appendChild(m), s
                                    .appendChild(p), n.setAttribute("stroke", "s" === c[i].mode ? "#000000" :
                                        "#ffffff")) : f = m = null, this.storedData[i] = {
                                            elem: n,
                                            x: f,
                                            expan: m,
                                            lastPath: "",
                                            lastOperator: "",
                                            filterId: b,
                                            lastRadius: 0
                                        }, "i" == c[i].mode) {
                    h = u.length;
                    var E = createNS("g");
                    for (o = 0; o < h; o += 1) E.appendChild(u[o]);
                    var x = createNS("mask");
                    x.setAttribute("mask-type", "alpha"), x.setAttribute("id", y + "_" + d), x
                        .appendChild(n), s.appendChild(x), E.setAttribute("mask", "url(" +
                            locationHref + "#" + y + "_" + d + ")"), u.length = 0, u.push(E)
                } else u.push(n);
                c[i].inv && !this.solidPath && (this.solidPath = this.createLayerSolidPath()), this
                    .viewData[i] = {
                    elem: n,
                    lastPath: "",
                    op: PropertyFactory.getProp(this.element, c[i].o, 0, .01, this.element),
                    prop: ShapePropertyFactory.getShapeProp(this.element, c[i], 3),
                    invRect: l
                }, this.viewData[i].prop.k || this.drawPath(c[i], this.viewData[i].prop.v, this
                    .viewData[i])
            } else this.viewData[i] = {
                op: PropertyFactory.getProp(this.element, c[i].o, 0, .01, this.element),
                prop: ShapePropertyFactory.getShapeProp(this.element, c[i], 3),
                elem: n,
                lastPath: ""
            }, s.appendChild(n);
        for (this.maskElement = createNS(g), a = u.length, i = 0; i < a; i += 1) this.maskElement
            .appendChild(u[i]);
        0 < d && (this.maskElement.setAttribute("id", y), this.element.maskedElement.setAttribute(v,
            "url(" + locationHref + "#" + y + ")"), s.appendChild(this.maskElement)), this.viewData
                .length && this.element.addRenderableComponent(this)
    }

    function HierarchyElement() { }

    function FrameElement() { }

    function TransformElement() { }

    function RenderableElement() { }

    function RenderableDOMElement() { }

    function ProcessedElement(t, e) {
        this.elem = t, this.pos = e
    }

    function SVGStyleData(t, e) {
        this.data = t, this.type = t.ty, this.d = "", this.lvl = e, this._mdf = !1, this.closed = !0 ===
            t.hd, this.pElem = createNS("path"), this.msElem = null
    }

    function SVGShapeData(t, e, r) {
        this.caches = [], this.styles = [], this.transformers = t, this.lStr = "", this.sh = r, this
            .lvl = e, this._isAnimated = !!r.k;
        for (var i = 0, s = t.length; i < s;) {
            if (t[i].mProps.dynamicProperties.length) {
                this._isAnimated = !0;
                break
            }
            i += 1
        }
    }

    function SVGTransformData(t, e, r) {
        this.transform = {
            mProps: t,
            op: e,
            container: r
        }, this.elements = [], this._isAnimated = this.transform.mProps.dynamicProperties.length ||
        this.transform.op.effectsSequence.length
    }

    function SVGStrokeStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.o =
            PropertyFactory.getProp(t, e.o, 0, .01, this), this.w = PropertyFactory.getProp(t, e.w, 0,
                null, this), this.d = new DashProperty(t, e.d || {}, "svg", this), this.c =
            PropertyFactory.getProp(t, e.c, 1, 255, this), this.style = r, this._isAnimated = !!this
                ._isAnimated
    }

    function SVGFillStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.o =
            PropertyFactory.getProp(t, e.o, 0, .01, this), this.c = PropertyFactory.getProp(t, e.c, 1,
                255, this), this.style = r
    }

    function SVGGradientFillStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this
            .initGradientData(t, e, r)
    }

    function SVGGradientStrokeStyleData(t, e, r) {
        this.initDynamicPropertyContainer(t), this.getValue = this.iterateDynamicProperties, this.w =
            PropertyFactory.getProp(t, e.w, 0, null, this), this.d = new DashProperty(t, e.d || {},
                "svg", this), this.initGradientData(t, e, r), this._isAnimated = !!this._isAnimated
    }

    function ShapeGroupData() {
        this.it = [], this.prevViewData = [], this.gr = createNS("g")
    }
    BaseRenderer.prototype.checkLayers = function (t) {
        var e, r, i = this.layers.length;
        for (this.completeLayers = !0, e = i - 1; 0 <= e; e--) this.elements[e] || (r = this.layers[
            e]).ip - r.st <= t - this.layers[e].st && r.op - r.st > t - this.layers[e].st &&
            this.buildItem(e), this.completeLayers = !!this.elements[e] && this.completeLayers;
        this.checkPendingElements()
    }, BaseRenderer.prototype.createItem = function (t) {
        switch (t.ty) {
            case 2:
                return this.createImage(t);
            case 0:
                return this.createComp(t);
            case 1:
                return this.createSolid(t);
            case 3:
                return this.createNull(t);
            case 4:
                return this.createShape(t);
            case 5:
                return this.createText(t);
            case 13:
                return this.createCamera(t)
        }
        return this.createNull(t)
    }, BaseRenderer.prototype.createCamera = function () {
        throw new Error("You're using a 3d camera. Try the html renderer.")
    }, BaseRenderer.prototype.buildAllItems = function () {
        var t, e = this.layers.length;
        for (t = 0; t < e; t += 1) this.buildItem(t);
        this.checkPendingElements()
    }, BaseRenderer.prototype.includeLayers = function (t) {
        this.completeLayers = !1;
        var e, r, i = t.length,
            s = this.layers.length;
        for (e = 0; e < i; e += 1)
            for (r = 0; r < s;) {
                if (this.layers[r].id == t[e].id) {
                    this.layers[r] = t[e];
                    break
                }
                r += 1
            }
    }, BaseRenderer.prototype.setProjectInterface = function (t) {
        this.globalData.projectInterface = t
    }, BaseRenderer.prototype.initItems = function () {
        this.globalData.progressiveLoad || this.buildAllItems()
    }, BaseRenderer.prototype.buildElementParenting = function (t, e, r) {
        for (var i = this.elements, s = this.layers, a = 0, n = s.length; a < n;) s[a].ind == e && (
            i[a] && !0 !== i[a] ? (r.push(i[a]), i[a].setAsParent(), void 0 !== s[a].parent ?
                this.buildElementParenting(t, s[a].parent, r) : t.setHierarchy(r)) : (this
                    .buildItem(a), this.addPendingElement(t))), a += 1
    }, BaseRenderer.prototype.addPendingElement = function (t) {
        this.pendingElements.push(t)
    }, BaseRenderer.prototype.searchExtraCompositions = function (t) {
        var e, r = t.length;
        for (e = 0; e < r; e += 1)
            if (t[e].xt) {
                var i = this.createComp(t[e]);
                i.initExpressions(), this.globalData.projectInterface.registerComposition(i)
            }
    }, BaseRenderer.prototype.setupGlobalData = function (t, e) {
        this.globalData.fontManager = new FontManager, this.globalData.fontManager.addChars(t
            .chars), this.globalData.fontManager.addFonts(t.fonts, e), this.globalData
                .getAssetData = this.animationItem.getAssetData.bind(this.animationItem), this
                    .globalData.getAssetsPath = this.animationItem.getAssetsPath.bind(this.animationItem),
            this.globalData.imageLoader = this.animationItem.imagePreloader, this.globalData
                .frameId = 0, this.globalData.frameRate = t.fr, this.globalData.nm = t.nm, this
                    .globalData.compSize = {
                w: t.w,
                h: t.h
            }
    }, extendPrototype([BaseRenderer], SVGRenderer), SVGRenderer.prototype.createNull = function (
        t) {
        return new NullElement(t, this.globalData, this)
    }, SVGRenderer.prototype.createShape = function (t) {
        return new SVGShapeElement(t, this.globalData, this)
    }, SVGRenderer.prototype.createText = function (t) {
        return new SVGTextElement(t, this.globalData, this)
    }, SVGRenderer.prototype.createImage = function (t) {
        return new IImageElement(t, this.globalData, this)
    }, SVGRenderer.prototype.createComp = function (t) {
        return new SVGCompElement(t, this.globalData, this)
    }, SVGRenderer.prototype.createSolid = function (t) {
        return new ISolidElement(t, this.globalData, this)
    }, SVGRenderer.prototype.configAnimation = function (t) {
        this.svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg"), this.renderConfig
            .viewBoxSize ? this.svgElement.setAttribute("viewBox", this.renderConfig.viewBoxSize) :
            this.svgElement.setAttribute("viewBox", "0 0 " + t.w + " " + t.h), this.renderConfig
                .viewBoxOnly || (this.svgElement.setAttribute("width", t.w), this.svgElement
                    .setAttribute("height", t.h), this.svgElement.style.width = "100%", this.svgElement
                        .style.height = "100%", this.svgElement.style.transform = "translate3d(0,0,0)"),
            this.renderConfig.className && this.svgElement.setAttribute("class", this.renderConfig
                .className), this.renderConfig.id && this.svgElement.setAttribute("id", this
                    .renderConfig.id), void 0 !== this.renderConfig.focusable && this.svgElement
                        .setAttribute("focusable", this.renderConfig.focusable), this.svgElement.setAttribute(
                            "preserveAspectRatio", this.renderConfig.preserveAspectRatio), this.animationItem
                                .wrapper.appendChild(this.svgElement);
        var e = this.globalData.defs;
        this.setupGlobalData(t, e), this.globalData.progressiveLoad = this.renderConfig
            .progressiveLoad, this.data = t;
        var r = createNS("clipPath"),
            i = createNS("rect");
        i.setAttribute("width", t.w), i.setAttribute("height", t.h), i.setAttribute("x", 0), i
            .setAttribute("y", 0);
        var s = createElementID();
        r.setAttribute("id", s), r.appendChild(i), this.layerElement.setAttribute("clip-path",
            "url(" + locationHref + "#" + s + ")"), e.appendChild(r), this.layers = t.layers,
            this.elements = createSizedArray(t.layers.length)
    }, SVGRenderer.prototype.destroy = function () {
        this.animationItem.wrapper.innerHTML = "", this.layerElement = null, this.globalData.defs =
            null;
        var t, e = this.layers ? this.layers.length : 0;
        for (t = 0; t < e; t++) this.elements[t] && this.elements[t].destroy();
        this.elements.length = 0, this.destroyed = !0, this.animationItem = null
    }, SVGRenderer.prototype.updateContainerSize = function () { }, SVGRenderer.prototype.buildItem =
        function (t) {
            var e = this.elements;
            if (!e[t] && 99 != this.layers[t].ty) {
                e[t] = !0;
                var r = this.createItem(this.layers[t]);
                e[t] = r, expressionsPlugin && (0 === this.layers[t].ty && this.globalData
                    .projectInterface.registerComposition(r), r.initExpressions()), this
                        .appendElementInPos(r, t), this.layers[t].tt && (this.elements[t - 1] && !0 !== this
                            .elements[t - 1] ? r.setMatte(e[t - 1].layerId) : (this.buildItem(t - 1), this
                                .addPendingElement(r)))
            }
        }, SVGRenderer.prototype.checkPendingElements = function () {
            for (; this.pendingElements.length;) {
                var t = this.pendingElements.pop();
                if (t.checkParenting(), t.data.tt)
                    for (var e = 0, r = this.elements.length; e < r;) {
                        if (this.elements[e] === t) {
                            t.setMatte(this.elements[e - 1].layerId);
                            break
                        }
                        e += 1
                    }
            }
        }, SVGRenderer.prototype.renderFrame = function (t) {
            if (this.renderedFrame !== t && !this.destroyed) {
                null === t ? t = this.renderedFrame : this.renderedFrame = t, this.globalData.frameNum =
                    t, this.globalData.frameId += 1, this.globalData.projectInterface.currentFrame = t,
                    this.globalData._mdf = !1;
                var e, r = this.layers.length;
                for (this.completeLayers || this.checkLayers(t), e = r - 1; 0 <= e; e--)(this
                    .completeLayers || this.elements[e]) && this.elements[e].prepareFrame(t - this
                        .layers[e].st);
                if (this.globalData._mdf)
                    for (e = 0; e < r; e += 1)(this.completeLayers || this.elements[e]) && this
                        .elements[e].renderFrame()
            }
        }, SVGRenderer.prototype.appendElementInPos = function (t, e) {
            var r = t.getBaseElement();
            if (r) {
                for (var i, s = 0; s < e;) this.elements[s] && !0 !== this.elements[s] && this.elements[
                    s].getBaseElement() && (i = this.elements[s].getBaseElement()), s += 1;
                i ? this.layerElement.insertBefore(r, i) : this.layerElement.appendChild(r)
            }
        }, SVGRenderer.prototype.hide = function () {
            this.layerElement.style.display = "none"
        }, SVGRenderer.prototype.show = function () {
            this.layerElement.style.display = "block"
        }, extendPrototype([BaseRenderer], CanvasRenderer), CanvasRenderer.prototype.createShape =
        function (t) {
            return new CVShapeElement(t, this.globalData, this)
        }, CanvasRenderer.prototype.createText = function (t) {
            return new CVTextElement(t, this.globalData, this)
        }, CanvasRenderer.prototype.createImage = function (t) {
            return new CVImageElement(t, this.globalData, this)
        }, CanvasRenderer.prototype.createComp = function (t) {
            return new CVCompElement(t, this.globalData, this)
        }, CanvasRenderer.prototype.createSolid = function (t) {
            return new CVSolidElement(t, this.globalData, this)
        }, CanvasRenderer.prototype.createNull = SVGRenderer.prototype.createNull, CanvasRenderer
            .prototype.ctxTransform = function (t) {
                if (1 !== t[0] || 0 !== t[1] || 0 !== t[4] || 1 !== t[5] || 0 !== t[12] || 0 !== t[13])
                    if (this.renderConfig.clearCanvas) {
                        this.transformMat.cloneFromProps(t);
                        var e = this.contextData.cTr.props;
                        this.transformMat.transform(e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7], e[8], e[
                            9], e[10], e[11], e[12], e[13], e[14], e[15]), this.contextData.cTr
                                .cloneFromProps(this.transformMat.props);
                        var r = this.contextData.cTr.props;
                        this.canvasContext.setTransform(r[0], r[1], r[4], r[5], r[12], r[13])
                    } else this.canvasContext.transform(t[0], t[1], t[4], t[5], t[12], t[13])
            }, CanvasRenderer.prototype.ctxOpacity = function (t) {
                if (!this.renderConfig.clearCanvas) return this.canvasContext.globalAlpha *= t < 0 ? 0 : t,
                    void (this.globalData.currentGlobalAlpha = this.contextData.cO);
                this.contextData.cO *= t < 0 ? 0 : t, this.globalData.currentGlobalAlpha !== this
                    .contextData.cO && (this.canvasContext.globalAlpha = this.contextData.cO, this
                        .globalData.currentGlobalAlpha = this.contextData.cO)
            }, CanvasRenderer.prototype.reset = function () {
                this.renderConfig.clearCanvas ? this.contextData.reset() : this.canvasContext.restore()
            }, CanvasRenderer.prototype.save = function (t) {
                if (this.renderConfig.clearCanvas) {
                    t && this.canvasContext.save();
                    var e = this.contextData.cTr.props;
                    this.contextData._length <= this.contextData.cArrPos && this.contextData.duplicate();
                    var r, i = this.contextData.saved[this.contextData.cArrPos];
                    for (r = 0; r < 16; r += 1) i[r] = e[r];
                    this.contextData.savedOp[this.contextData.cArrPos] = this.contextData.cO, this
                        .contextData.cArrPos += 1
                } else this.canvasContext.save()
            }, CanvasRenderer.prototype.restore = function (t) {
                if (this.renderConfig.clearCanvas) {
                    t && (this.canvasContext.restore(), this.globalData.blendMode = "source-over"), this
                        .contextData.cArrPos -= 1;
                    var e, r = this.contextData.saved[this.contextData.cArrPos],
                        i = this.contextData.cTr.props;
                    for (e = 0; e < 16; e += 1) i[e] = r[e];
                    this.canvasContext.setTransform(r[0], r[1], r[4], r[5], r[12], r[13]), r = this
                        .contextData.savedOp[this.contextData.cArrPos], this.contextData.cO = r, this
                            .globalData.currentGlobalAlpha !== r && (this.canvasContext.globalAlpha = r, this
                                .globalData.currentGlobalAlpha = r)
                } else this.canvasContext.restore()
            }, CanvasRenderer.prototype.configAnimation = function (t) {
                this.animationItem.wrapper ? (this.animationItem.container = createTag("canvas"), this
                    .animationItem.container.style.width = "100%", this.animationItem.container.style
                        .height = "100%", this.animationItem.container.style.transformOrigin = this
                            .animationItem.container.style.mozTransformOrigin = this.animationItem.container
                                .style.webkitTransformOrigin = this.animationItem.container.style[
                                "-webkit-transform"] = "0px 0px 0px", this.animationItem.wrapper.appendChild(
                                    this.animationItem.container), this.canvasContext = this.animationItem.container
                                        .getContext("2d"), this.renderConfig.className && this.animationItem.container
                                            .setAttribute("class", this.renderConfig.className), this.renderConfig.id && this
                                                .animationItem.container.setAttribute("id", this.renderConfig.id)) : this
                                                    .canvasContext = this.renderConfig.context, this.data = t, this.layers = t.layers, this
                                                        .transformCanvas = {
                        w: t.w,
                        h: t.h,
                        sx: 0,
                        sy: 0,
                        tx: 0,
                        ty: 0
                    }, this.setupGlobalData(t, document.body), this.globalData.canvasContext = this
                        .canvasContext, (this.globalData.renderer = this).globalData.isDashed = !1, this
                            .globalData.progressiveLoad = this.renderConfig.progressiveLoad, this.globalData
                                .transformCanvas = this.transformCanvas, this.elements = createSizedArray(t.layers
                                    .length), this.updateContainerSize()
            }, CanvasRenderer.prototype.updateContainerSize = function () {
                var t, e, r, i;
                if (this.reset(), this.animationItem.wrapper && this.animationItem.container ? (t = this
                    .animationItem.wrapper.offsetWidth, e = this.animationItem.wrapper.offsetHeight,
                    this.animationItem.container.setAttribute("width", t * this.renderConfig.dpr), this
                        .animationItem.container.setAttribute("height", e * this.renderConfig.dpr)) : (t =
                            this.canvasContext.canvas.width * this.renderConfig.dpr, e = this.canvasContext
                                .canvas.height * this.renderConfig.dpr), -1 !== this.renderConfig
                                    .preserveAspectRatio.indexOf("meet") || -1 !== this.renderConfig.preserveAspectRatio
                                        .indexOf("slice")) {
                    var s = this.renderConfig.preserveAspectRatio.split(" "),
                        a = s[1] || "meet",
                        n = s[0] || "xMidYMid",
                        o = n.substr(0, 4),
                        h = n.substr(4);
                    r = t / e, i = this.transformCanvas.w / this.transformCanvas.h, this.transformCanvas
                        .sy = r < i && "meet" === a || i < r && "slice" === a ? (this.transformCanvas.sx =
                            t / (this.transformCanvas.w / this.renderConfig.dpr), t / (this.transformCanvas
                                .w / this.renderConfig.dpr)) : (this.transformCanvas.sx = e / (this
                                    .transformCanvas.h / this.renderConfig.dpr), e / (this.transformCanvas.h /
                                        this.renderConfig.dpr)), this.transformCanvas.tx = "xMid" === o && (i < r &&
                                            "meet" === a || r < i && "slice" === a) ? (t - this.transformCanvas.w * (e /
                                                this.transformCanvas.h)) / 2 * this.renderConfig.dpr : "xMax" === o && (i < r &&
                                                    "meet" === a || r < i && "slice" === a) ? (t - this.transformCanvas.w * (e /
                                                        this.transformCanvas.h)) * this.renderConfig.dpr : 0, this.transformCanvas.ty =
                        "YMid" === h && (r < i && "meet" === a || i < r && "slice" === a) ? (e - this
                            .transformCanvas.h * (t / this.transformCanvas.w)) / 2 * this.renderConfig.dpr :
                            "YMax" === h && (r < i && "meet" === a || i < r && "slice" === a) ? (e - this
                                .transformCanvas.h * (t / this.transformCanvas.w)) * this.renderConfig.dpr : 0
                } else "none" == this.renderConfig.preserveAspectRatio ? (this.transformCanvas.sx = t / (
                    this.transformCanvas.w / this.renderConfig.dpr), this.transformCanvas.sy = e / (
                        this.transformCanvas.h / this.renderConfig.dpr)) : (this.transformCanvas.sx = this
                            .renderConfig.dpr, this.transformCanvas.sy = this.renderConfig.dpr), this
                                .transformCanvas.tx = 0, this.transformCanvas.ty = 0;
                this.transformCanvas.props = [this.transformCanvas.sx, 0, 0, 0, 0, this.transformCanvas.sy,
                    0, 0, 0, 0, 1, 0, this.transformCanvas.tx, this.transformCanvas.ty, 0, 1
                ], this.ctxTransform(this.transformCanvas.props), this.canvasContext.beginPath(), this
                    .canvasContext.rect(0, 0, this.transformCanvas.w, this.transformCanvas.h), this
                        .canvasContext.closePath(), this.canvasContext.clip(), this.renderFrame(this
                            .renderedFrame, !0)
            }, CanvasRenderer.prototype.destroy = function () {
                var t;
                for (this.renderConfig.clearCanvas && (this.animationItem.wrapper.innerHTML = ""), t = (this
                    .layers ? this.layers.length : 0) - 1; 0 <= t; t -= 1) this.elements[t] && this
                        .elements[t].destroy();
                this.elements.length = 0, this.globalData.canvasContext = null, this.animationItem
                    .container = null, this.destroyed = !0
            }, CanvasRenderer.prototype.renderFrame = function (t, e) {
                if ((this.renderedFrame !== t || !0 !== this.renderConfig.clearCanvas || e) && !this
                    .destroyed && -1 !== t) {
                    this.renderedFrame = t, this.globalData.frameNum = t - this.animationItem._isFirstFrame,
                        this.globalData.frameId += 1, this.globalData._mdf = !this.renderConfig
                            .clearCanvas || e, this.globalData.projectInterface.currentFrame = t;
                    var r, i = this.layers.length;
                    for (this.completeLayers || this.checkLayers(t), r = 0; r < i; r++)(this
                        .completeLayers || this.elements[r]) && this.elements[r].prepareFrame(t - this
                            .layers[r].st);
                    if (this.globalData._mdf) {
                        for (!0 === this.renderConfig.clearCanvas ? this.canvasContext.clearRect(0, 0, this
                            .transformCanvas.w, this.transformCanvas.h) : this.save(), r = i - 1; 0 <=
                            r; r -= 1)(this.completeLayers || this.elements[r]) && this.elements[r]
                                .renderFrame();
                        !0 !== this.renderConfig.clearCanvas && this.restore()
                    }
                }
            }, CanvasRenderer.prototype.buildItem = function (t) {
                var e = this.elements;
                if (!e[t] && 99 != this.layers[t].ty) {
                    var r = this.createItem(this.layers[t], this, this.globalData);
                    (e[t] = r).initExpressions()
                }
            }, CanvasRenderer.prototype.checkPendingElements = function () {
                for (; this.pendingElements.length;) {
                    this.pendingElements.pop().checkParenting()
                }
            }, CanvasRenderer.prototype.hide = function () {
                this.animationItem.container.style.display = "none"
            }, CanvasRenderer.prototype.show = function () {
                this.animationItem.container.style.display = "block"
            }, extendPrototype([BaseRenderer], HybridRenderer), HybridRenderer.prototype.buildItem =
        SVGRenderer.prototype.buildItem, HybridRenderer.prototype.checkPendingElements = function () {
            for (; this.pendingElements.length;) {
                this.pendingElements.pop().checkParenting()
            }
        }, HybridRenderer.prototype.appendElementInPos = function (t, e) {
            var r = t.getBaseElement();
            if (r) {
                var i = this.layers[e];
                if (i.ddd && this.supports3d) this.addTo3dContainer(r, e);
                else if (this.threeDElements) this.addTo3dContainer(r, e);
                else {
                    for (var s, a, n = 0; n < e;) this.elements[n] && !0 !== this.elements[n] && this
                        .elements[n].getBaseElement && (a = this.elements[n], s = (this.layers[n].ddd ?
                            this.getThreeDContainerByPos(n) : a.getBaseElement()) || s), n += 1;
                    s ? i.ddd && this.supports3d || this.layerElement.insertBefore(r, s) : i.ddd && this
                        .supports3d || this.layerElement.appendChild(r)
                }
            }
        }, HybridRenderer.prototype.createShape = function (t) {
            return this.supports3d ? new HShapeElement(t, this.globalData, this) : new SVGShapeElement(
                t, this.globalData, this)
        }, HybridRenderer.prototype.createText = function (t) {
            return this.supports3d ? new HTextElement(t, this.globalData, this) : new SVGTextElement(t,
                this.globalData, this)
        }, HybridRenderer.prototype.createCamera = function (t) {
            return this.camera = new HCameraElement(t, this.globalData, this), this.camera
        }, HybridRenderer.prototype.createImage = function (t) {
            return this.supports3d ? new HImageElement(t, this.globalData, this) : new IImageElement(t,
                this.globalData, this)
        }, HybridRenderer.prototype.createComp = function (t) {
            return this.supports3d ? new HCompElement(t, this.globalData, this) : new SVGCompElement(t,
                this.globalData, this)
        }, HybridRenderer.prototype.createSolid = function (t) {
            return this.supports3d ? new HSolidElement(t, this.globalData, this) : new ISolidElement(t,
                this.globalData, this)
        }, HybridRenderer.prototype.createNull = SVGRenderer.prototype.createNull, HybridRenderer
            .prototype.getThreeDContainerByPos = function (t) {
                for (var e = 0, r = this.threeDElements.length; e < r;) {
                    if (this.threeDElements[e].startPos <= t && this.threeDElements[e].endPos >= t)
                        return this.threeDElements[e].perspectiveElem;
                    e += 1
                }
            }, HybridRenderer.prototype.createThreeDContainer = function (t, e) {
                var r = createTag("div");
                styleDiv(r);
                var i = createTag("div");
                styleDiv(i), "3d" === e && (r.style.width = this.globalData.compSize.w + "px", r.style
                    .height = this.globalData.compSize.h + "px", r.style.transformOrigin = r.style
                        .mozTransformOrigin = r.style.webkitTransformOrigin = "50% 50%", i.style.transform =
                    i.style.webkitTransform = "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)"), r
                        .appendChild(i);
                var s = {
                    container: i,
                    perspectiveElem: r,
                    startPos: t,
                    endPos: t,
                    type: e
                };
                return this.threeDElements.push(s), s
            }, HybridRenderer.prototype.build3dContainers = function () {
                var t, e, r = this.layers.length,
                    i = "";
                for (t = 0; t < r; t += 1) this.layers[t].ddd && 3 !== this.layers[t].ty ? "3d" !== i && (
                    i = "3d", e = this.createThreeDContainer(t, "3d")) : "2d" !== i && (i = "2d", e =
                        this.createThreeDContainer(t, "2d")), e.endPos = Math.max(e.endPos, t);
                for (t = (r = this.threeDElements.length) - 1; 0 <= t; t--) this.resizerElem.appendChild(
                    this.threeDElements[t].perspectiveElem)
            }, HybridRenderer.prototype.addTo3dContainer = function (t, e) {
                for (var r = 0, i = this.threeDElements.length; r < i;) {
                    if (e <= this.threeDElements[r].endPos) {
                        for (var s, a = this.threeDElements[r].startPos; a < e;) this.elements[a] && this
                            .elements[a].getBaseElement && (s = this.elements[a].getBaseElement()), a += 1;
                        s ? this.threeDElements[r].container.insertBefore(t, s) : this.threeDElements[r]
                            .container.appendChild(t);
                        break
                    }
                    r += 1
                }
            }, HybridRenderer.prototype.configAnimation = function (t) {
                var e = createTag("div"),
                    r = this.animationItem.wrapper;
                e.style.width = t.w + "px", e.style.height = t.h + "px", styleDiv(this.resizerElem = e), e
                    .style.transformStyle = e.style.webkitTransformStyle = e.style.mozTransformStyle =
                    "flat", this.renderConfig.className && e.setAttribute("class", this.renderConfig
                        .className), r.appendChild(e), e.style.overflow = "hidden";
                var i = createNS("svg");
                i.setAttribute("width", "1"), i.setAttribute("height", "1"), styleDiv(i), this.resizerElem
                    .appendChild(i);
                var s = createNS("defs");
                i.appendChild(s), this.data = t, this.setupGlobalData(t, i), this.globalData.defs = s, this
                    .layers = t.layers, this.layerElement = this.resizerElem, this.build3dContainers(), this
                        .updateContainerSize()
            }, HybridRenderer.prototype.destroy = function () {
                this.animationItem.wrapper.innerHTML = "", this.animationItem.container = null, this
                    .globalData.defs = null;
                var t, e = this.layers ? this.layers.length : 0;
                for (t = 0; t < e; t++) this.elements[t].destroy();
                this.elements.length = 0, this.destroyed = !0, this.animationItem = null
            }, HybridRenderer.prototype.updateContainerSize = function () {
                var t, e, r, i, s = this.animationItem.wrapper.offsetWidth,
                    a = this.animationItem.wrapper.offsetHeight;
                i = s / a < this.globalData.compSize.w / this.globalData.compSize.h ? (t = s / this
                    .globalData.compSize.w, e = s / this.globalData.compSize.w, r = 0, (a - this
                        .globalData.compSize.h * (s / this.globalData.compSize.w)) / 2) : (t = a / this
                            .globalData.compSize.h, e = a / this.globalData.compSize.h, r = (s - this.globalData
                                .compSize.w * (a / this.globalData.compSize.h)) / 2, 0), this.resizerElem.style
                                    .transform = this.resizerElem.style.webkitTransform = "matrix3d(" + t + ",0,0,0,0," +
                                    e + ",0,0,0,0,1,0," + r + "," + i + ",0,1)"
            }, HybridRenderer.prototype.renderFrame = SVGRenderer.prototype.renderFrame, HybridRenderer
                .prototype.hide = function () {
                    this.resizerElem.style.display = "none"
                }, HybridRenderer.prototype.show = function () {
                    this.resizerElem.style.display = "block"
                }, HybridRenderer.prototype.initItems = function () {
                    if (this.buildAllItems(), this.camera) this.camera.setup();
                    else {
                        var t, e = this.globalData.compSize.w,
                            r = this.globalData.compSize.h,
                            i = this.threeDElements.length;
                        for (t = 0; t < i; t += 1) this.threeDElements[t].perspectiveElem.style.perspective =
                            this.threeDElements[t].perspectiveElem.style.webkitPerspective = Math.sqrt(Math.pow(
                                e, 2) + Math.pow(r, 2)) + "px"
                    }
                }, HybridRenderer.prototype.searchExtraCompositions = function (t) {
                    var e, r = t.length,
                        i = createTag("div");
                    for (e = 0; e < r; e += 1)
                        if (t[e].xt) {
                            var s = this.createComp(t[e], i, this.globalData.comp, null);
                            s.initExpressions(), this.globalData.projectInterface.registerComposition(s)
                        }
                }, MaskElement.prototype.getMaskProperty = function (t) {
                    return this.viewData[t].prop
                }, MaskElement.prototype.renderFrame = function (t) {
                    var e, r = this.element.finalTransform.mat,
                        i = this.masksProperties.length;
                    for (e = 0; e < i; e++)
                        if ((this.viewData[e].prop._mdf || t) && this.drawPath(this.masksProperties[e], this
                            .viewData[e].prop.v, this.viewData[e]), (this.viewData[e].op._mdf || t) && this
                                .viewData[e].elem.setAttribute("fill-opacity", this.viewData[e].op.v), "n" !== this
                                    .masksProperties[e].mode && (this.viewData[e].invRect && (this.element
                                        .finalTransform.mProp._mdf || t) && this.viewData[e].invRect.setAttribute(
                                            "transform", r.getInverseMatrix().to2dCSS()), this.storedData[e].x && (this
                                                .storedData[e].x._mdf || t))) {
                            var s = this.storedData[e].expan;
                            this.storedData[e].x.v < 0 ? ("erode" !== this.storedData[e].lastOperator && (this
                                .storedData[e].lastOperator = "erode", this.storedData[e].elem
                                    .setAttribute("filter", "url(" + locationHref + "#" + this.storedData[e]
                                        .filterId + ")")), s.setAttribute("radius", -this.storedData[e].x
                                            .v)) : ("dilate" !== this.storedData[e].lastOperator && (this.storedData[e]
                                                .lastOperator = "dilate", this.storedData[e].elem.setAttribute("filter",
                                                    null)), this.storedData[e].elem.setAttribute("stroke-width", 2 *
                                                        this.storedData[e].x.v))
                        }
                }, MaskElement.prototype.getMaskelement = function () {
                    return this.maskElement
                }, MaskElement.prototype.createLayerSolidPath = function () {
                    var t = "M0,0 ";
                    return t += " h" + this.globalData.compSize.w, t += " v" + this.globalData.compSize.h, t +=
                        " h-" + this.globalData.compSize.w, t += " v-" + this.globalData.compSize.h + " "
                }, MaskElement.prototype.drawPath = function (t, e, r) {
                    var i, s, a = " M" + e.v[0][0] + "," + e.v[0][1];
                    for (s = e._length, i = 1; i < s; i += 1) a += " C" + e.o[i - 1][0] + "," + e.o[i - 1][1] +
                        " " + e.i[i][0] + "," + e.i[i][1] + " " + e.v[i][0] + "," + e.v[i][1];
                    if (e.c && 1 < s && (a += " C" + e.o[i - 1][0] + "," + e.o[i - 1][1] + " " + e.i[0][0] +
                        "," + e.i[0][1] + " " + e.v[0][0] + "," + e.v[0][1]), r.lastPath !== a) {
                        var n = "";
                        r.elem && (e.c && (n = t.inv ? this.solidPath + a : a), r.elem.setAttribute("d", n)), r
                            .lastPath = a
                    }
                }, MaskElement.prototype.destroy = function () {
                    this.element = null, this.globalData = null, this.maskElement = null, this.data = null, this
                        .masksProperties = null
                }, HierarchyElement.prototype = {
                    initHierarchy: function () {
                        this.hierarchy = [], this._isParent = !1, this.checkParenting()
                    },
                    setHierarchy: function (t) {
                        this.hierarchy = t
                    },
                    setAsParent: function () {
                        this._isParent = !0
                    },
                    checkParenting: function () {
                        void 0 !== this.data.parent && this.comp.buildElementParenting(this, this.data
                            .parent, [])
                    }
                }, FrameElement.prototype = {
                    initFrame: function () {
                        this._isFirstFrame = !1, this.dynamicProperties = [], this._mdf = !1
                    },
                    prepareProperties: function (t, e) {
                        var r, i = this.dynamicProperties.length;
                        for (r = 0; r < i; r += 1)(e || this._isParent && "transform" === this
                            .dynamicProperties[r].propType) && (this.dynamicProperties[r].getValue(),
                                this.dynamicProperties[r]._mdf && (this.globalData._mdf = !0, this._mdf = !
                                    0))
                    },
                    addDynamicProperty: function (t) {
                        -1 === this.dynamicProperties.indexOf(t) && this.dynamicProperties.push(t)
                    }
                }, TransformElement.prototype = {
                    initTransform: function () {
                        this.finalTransform = {
                            mProp: this.data.ks ? TransformPropertyFactory.getTransformProperty(this,
                                this.data.ks, this) : {
                                o: 0
                            },
                            _matMdf: !1,
                            _opMdf: !1,
                            mat: new Matrix
                        }, this.data.ao && (this.finalTransform.mProp.autoOriented = !0), this.data.ty
                    },
                    renderTransform: function () {
                        if (this.finalTransform._opMdf = this.finalTransform.mProp.o._mdf || this
                            ._isFirstFrame, this.finalTransform._matMdf = this.finalTransform.mProp._mdf ||
                            this._isFirstFrame, this.hierarchy) {
                            var t, e = this.finalTransform.mat,
                                r = 0,
                                i = this.hierarchy.length;
                            if (!this.finalTransform._matMdf)
                                for (; r < i;) {
                                    if (this.hierarchy[r].finalTransform.mProp._mdf) {
                                        this.finalTransform._matMdf = !0;
                                        break
                                    }
                                    r += 1
                                }
                            if (this.finalTransform._matMdf)
                                for (t = this.finalTransform.mProp.v.props, e.cloneFromProps(t), r = 0; r <
                                    i; r += 1) t = this.hierarchy[r].finalTransform.mProp.v.props, e
                                        .transform(t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9],
                                            t[10], t[11], t[12], t[13], t[14], t[15])
                        }
                    },
                    globalToLocal: function (t) {
                        var e = [];
                        e.push(this.finalTransform);
                        for (var r = !0, i = this.comp; r;) i.finalTransform ? (i.data.hasMask && e.splice(
                            0, 0, i.finalTransform), i = i.comp) : r = !1;
                        var s, a, n = e.length;
                        for (s = 0; s < n; s += 1) a = e[s].mat.applyToPointArray(0, 0, 0), t = [t[0] - a[
                            0], t[1] - a[1], 0];
                        return t
                    },
                    mHelper: new Matrix
                }, RenderableElement.prototype = {
                    initRenderable: function () {
                        this.isInRange = !1, this.hidden = !1, this.isTransparent = !1, this
                            .renderableComponents = []
                    },
                    addRenderableComponent: function (t) {
                        -1 === this.renderableComponents.indexOf(t) && this.renderableComponents.push(t)
                    },
                    removeRenderableComponent: function (t) {
                        -1 !== this.renderableComponents.indexOf(t) && this.renderableComponents.splice(this
                            .renderableComponents.indexOf(t), 1)
                    },
                    prepareRenderableFrame: function (t) {
                        this.checkLayerLimits(t)
                    },
                    checkTransparency: function () {
                        this.finalTransform.mProp.o.v <= 0 ? !this.isTransparent && this.globalData
                            .renderConfig.hideOnTransparent && (this.isTransparent = !0, this.hide()) : this
                                .isTransparent && (this.isTransparent = !1, this.show())
                    },
                    checkLayerLimits: function (t) {
                        this.data.ip - this.data.st <= t && this.data.op - this.data.st > t ? !0 !== this
                            .isInRange && (this.globalData._mdf = !0, this._mdf = !0, this.isInRange = !0,
                                this.show()) : !1 !== this.isInRange && (this.globalData._mdf = !0, this
                                    .isInRange = !1, this.hide())
                    },
                    renderRenderable: function () {
                        var t, e = this.renderableComponents.length;
                        for (t = 0; t < e; t += 1) this.renderableComponents[t].renderFrame(this
                            ._isFirstFrame)
                    },
                    sourceRectAtTime: function () {
                        return {
                            top: 0,
                            left: 0,
                            width: 100,
                            height: 100
                        }
                    },
                    getLayerSize: function () {
                        return 5 === this.data.ty ? {
                            w: this.data.textData.width,
                            h: this.data.textData.height
                        } : {
                            w: this.data.width,
                            h: this.data.height
                        }
                    }
                }, extendPrototype([RenderableElement, createProxyFunction({
                    initElement: function (t, e, r) {
                        this.initFrame(), this.initBaseData(t, e, r), this.initTransform(t, e,
                            r), this.initHierarchy(), this.initRenderable(), this
                                .initRendererElement(), this.createContainerElements(), this
                                    .createRenderableComponents(), this.createContent(), this.hide()
                    },
                    hide: function () {
                        this.hidden || this.isInRange && !this.isTransparent || ((this
                            .baseElement || this.layerElement).style.display = "none",
                            this.hidden = !0)
                    },
                    show: function () {
                        this.isInRange && !this.isTransparent && (this.data.hd || ((this
                            .baseElement || this.layerElement).style.display =
                            "block"), this.hidden = !1, this._isFirstFrame = !0)
                    },
                    renderFrame: function () {
                        this.data.hd || this.hidden || (this.renderTransform(), this
                            .renderRenderable(), this.renderElement(), this
                                .renderInnerContent(), this._isFirstFrame && (this
                                    ._isFirstFrame = !1))
                    },
                    renderInnerContent: function () { },
                    prepareFrame: function (t) {
                        this._mdf = !1, this.prepareRenderableFrame(t), this.prepareProperties(
                            t, this.isInRange), this.checkTransparency()
                    },
                    destroy: function () {
                        this.innerElem = null, this.destroyBaseElement()
                    }
                })], RenderableDOMElement), SVGStyleData.prototype.reset = function () {
                    this.d = "", this._mdf = !1
                }, SVGShapeData.prototype.setAsAnimated = function () {
                    this._isAnimated = !0
                }, extendPrototype([DynamicPropertyContainer], SVGStrokeStyleData), extendPrototype([
                    DynamicPropertyContainer
                ], SVGFillStyleData), SVGGradientFillStyleData.prototype.initGradientData = function (t, e, r) {
                    this.o = PropertyFactory.getProp(t, e.o, 0, .01, this), this.s = PropertyFactory.getProp(t,
                        e.s, 1, null, this), this.e = PropertyFactory.getProp(t, e.e, 1, null, this), this
                            .h = PropertyFactory.getProp(t, e.h || {
                                k: 0
                            }, 0, .01, this), this.a = PropertyFactory.getProp(t, e.a || {
                                k: 0
                            }, 0, degToRads, this), this.g = new GradientProperty(t, e.g, this), this.style = r,
                        this.stops = [], this.setGradientData(r.pElem, e), this.setGradientOpacity(e, r), this
                            ._isAnimated = !!this._isAnimated
                }, SVGGradientFillStyleData.prototype.setGradientData = function (t, e) {
                    var r = createElementID(),
                        i = createNS(1 === e.t ? "linearGradient" : "radialGradient");
                    i.setAttribute("id", r), i.setAttribute("spreadMethod", "pad"), i.setAttribute(
                        "gradientUnits", "userSpaceOnUse");
                    var s, a, n, o = [];
                    for (n = 4 * e.g.p, a = 0; a < n; a += 4) s = createNS("stop"), i.appendChild(s), o.push(s);
                    t.setAttribute("gf" === e.ty ? "fill" : "stroke", "url(" + locationHref + "#" + r + ")"),
                        this.gf = i, this.cst = o
                }, SVGGradientFillStyleData.prototype.setGradientOpacity = function (t, e) {
                    if (this.g._hasOpacity && !this.g._collapsable) {
                        var r, i, s, a = createNS("mask"),
                            n = createNS("path");
                        a.appendChild(n);
                        var o = createElementID(),
                            h = createElementID();
                        a.setAttribute("id", h);
                        var l = createNS(1 === t.t ? "linearGradient" : "radialGradient");
                        l.setAttribute("id", o), l.setAttribute("spreadMethod", "pad"), l.setAttribute(
                            "gradientUnits", "userSpaceOnUse"), s = t.g.k.k[0].s ? t.g.k.k[0].s.length : t.g
                                .k.k.length;
                        var p = this.stops;
                        for (i = 4 * t.g.p; i < s; i += 2)(r = createNS("stop")).setAttribute("stop-color",
                            "rgb(255,255,255)"), l.appendChild(r), p.push(r);
                        n.setAttribute("gf" === t.ty ? "fill" : "stroke", "url(" + locationHref + "#" + o +
                            ")"), this.of = l, this.ms = a, this.ost = p, this.maskId = h, e.msElem = n
                    }
                }, extendPrototype([DynamicPropertyContainer], SVGGradientFillStyleData), extendPrototype([
                    SVGGradientFillStyleData, DynamicPropertyContainer
                ], SVGGradientStrokeStyleData);
    var SVGElementsRenderer = function () {
        var y = new Matrix,
            g = new Matrix;

        function e(t, e, r) {
            (r || e.transform.op._mdf) && e.transform.container.setAttribute("opacity", e.transform
                .op.v), (r || e.transform.mProps._mdf) && e.transform.container.setAttribute(
                    "transform", e.transform.mProps.v.to2dCSS())
        }

        function r(t, e, r) {
            var i, s, a, n, o, h, l, p, m, f, c, d = e.styles.length,
                u = e.lvl;
            for (h = 0; h < d; h += 1) {
                if (n = e.sh._mdf || r, e.styles[h].lvl < u) {
                    for (p = g.reset(), f = u - e.styles[h].lvl, c = e.transformers.length - 1; !
                        n && 0 < f;) n = e.transformers[c].mProps._mdf || n, f--, c--;
                    if (n)
                        for (f = u - e.styles[h].lvl, c = e.transformers.length - 1; 0 < f;) m = e
                            .transformers[c].mProps.v.props, p.transform(m[0], m[1], m[2], m[3], m[
                                4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[
                            14], m[15]), f--, c--
                } else p = y;
                if (s = (l = e.sh.paths)._length, n) {
                    for (a = "", i = 0; i < s; i += 1)(o = l.shapes[i]) && o._length && (a +=
                        buildShapeString(o, o._length, o.c, p));
                    e.caches[h] = a
                } else a = e.caches[h];
                e.styles[h].d += !0 === t.hd ? "" : a, e.styles[h]._mdf = n || e.styles[h]._mdf
            }
        }

        function i(t, e, r) {
            var i = e.style;
            (e.c._mdf || r) && i.pElem.setAttribute("fill", "rgb(" + bm_floor(e.c.v[0]) + "," +
                bm_floor(e.c.v[1]) + "," + bm_floor(e.c.v[2]) + ")"), (e.o._mdf || r) && i.pElem
                    .setAttribute("fill-opacity", e.o.v)
        }

        function s(t, e, r) {
            a(t, e, r), n(t, e, r)
        }

        function a(t, e, r) {
            var i, s, a, n, o, h = e.gf,
                l = e.g._hasOpacity,
                p = e.s.v,
                m = e.e.v;
            if (e.o._mdf || r) {
                var f = "gf" === t.ty ? "fill-opacity" : "stroke-opacity";
                e.style.pElem.setAttribute(f, e.o.v)
            }
            if (e.s._mdf || r) {
                var c = 1 === t.t ? "x1" : "cx",
                    d = "x1" === c ? "y1" : "cy";
                h.setAttribute(c, p[0]), h.setAttribute(d, p[1]), l && !e.g._collapsable && (e.of
                    .setAttribute(c, p[0]), e.of.setAttribute(d, p[1]))
            }
            if (e.g._cmdf || r) {
                i = e.cst;
                var u = e.g.c;
                for (a = i.length, s = 0; s < a; s += 1)(n = i[s]).setAttribute("offset", u[4 * s] +
                    "%"), n.setAttribute("stop-color", "rgb(" + u[4 * s + 1] + "," + u[4 * s +
                        2] + "," + u[4 * s + 3] + ")")
            }
            if (l && (e.g._omdf || r)) {
                var y = e.g.o;
                for (a = (i = e.g._collapsable ? e.cst : e.ost).length, s = 0; s < a; s += 1) n = i[
                    s], e.g._collapsable || n.setAttribute("offset", y[2 * s] + "%"), n
                        .setAttribute("stop-opacity", y[2 * s + 1])
            }
            if (1 === t.t) (e.e._mdf || r) && (h.setAttribute("x2", m[0]), h.setAttribute("y2", m[
                1]), l && !e.g._collapsable && (e.of.setAttribute("x2", m[0]), e.of
                    .setAttribute("y2", m[1])));
            else if ((e.s._mdf || e.e._mdf || r) && (o = Math.sqrt(Math.pow(p[0] - m[0], 2) + Math
                .pow(p[1] - m[1], 2)), h.setAttribute("r", o), l && !e.g._collapsable && e
                    .of.setAttribute("r", o)), e.e._mdf || e.h._mdf || e.a._mdf || r) {
                o || (o = Math.sqrt(Math.pow(p[0] - m[0], 2) + Math.pow(p[1] - m[1], 2)));
                var g = Math.atan2(m[1] - p[1], m[0] - p[0]),
                    v = o * (1 <= e.h.v ? .99 : e.h.v <= -1 ? -.99 : e.h.v),
                    b = Math.cos(g + e.a.v) * v + p[0],
                    E = Math.sin(g + e.a.v) * v + p[1];
                h.setAttribute("fx", b), h.setAttribute("fy", E), l && !e.g._collapsable && (e.of
                    .setAttribute("fx", b), e.of.setAttribute("fy", E))
            }
        }

        function n(t, e, r) {
            var i = e.style,
                s = e.d;
            s && (s._mdf || r) && s.dashStr && (i.pElem.setAttribute("stroke-dasharray", s.dashStr),
                i.pElem.setAttribute("stroke-dashoffset", s.dashoffset[0])), e.c && (e.c._mdf ||
                    r) && i.pElem.setAttribute("stroke", "rgb(" + bm_floor(e.c.v[0]) + "," +
                        bm_floor(e.c.v[1]) + "," + bm_floor(e.c.v[2]) + ")"), (e.o._mdf || r) && i.pElem
                            .setAttribute("stroke-opacity", e.o.v), (e.w._mdf || r) && (i.pElem.setAttribute(
                                "stroke-width", e.w.v), i.msElem && i.msElem.setAttribute("stroke-width", e
                                    .w.v))
        }
        return {
            createRenderFunction: function (t) {
                t.ty;
                switch (t.ty) {
                    case "fl":
                        return i;
                    case "gf":
                        return a;
                    case "gs":
                        return s;
                    case "st":
                        return n;
                    case "sh":
                    case "el":
                    case "rc":
                    case "sr":
                        return r;
                    case "tr":
                        return e
                }
            }
        }
    }();

    function ShapeTransformManager() {
        this.sequences = {}, this.sequenceList = [], this.transform_key_count = 0
    }

    function CVShapeData(t, e, r, i) {
        this.styledShapes = [], this.tr = [0, 0, 0, 0, 0, 0];
        var s = 4;
        "rc" == e.ty ? s = 5 : "el" == e.ty ? s = 6 : "sr" == e.ty && (s = 7), this.sh =
            ShapePropertyFactory.getShapeProp(t, e, s, t);
        var a, n, o = r.length;
        for (a = 0; a < o; a += 1) r[a].closed || (n = {
            transforms: i.addTransformSequence(r[a].transforms),
            trNodes: []
        }, this.styledShapes.push(n), r[a].elements.push(n))
    }

    function BaseElement() { }

    function NullElement(t, e, r) {
        this.initFrame(), this.initBaseData(t, e, r), this.initFrame(), this.initTransform(t, e, r),
            this.initHierarchy()
    }

    function SVGBaseElement() { }

    function IShapeElement() { }

    function ITextElement() { }

    function ICompElement() { }

    function IImageElement(t, e, r) {
        this.assetData = e.getAssetData(t.refId), this.initElement(t, e, r), this.sourceRect = {
            top: 0,
            left: 0,
            width: this.assetData.w,
            height: this.assetData.h
        }
    }

    function ISolidElement(t, e, r) {
        this.initElement(t, e, r)
    }

    function SVGCompElement(t, e, r) {
        this.layers = t.layers, this.supports3d = !0, this.completeLayers = !1, this
            .pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) :
                [], this.initElement(t, e, r), this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, e
                    .frameRate, this) : {
                    _placeholder: !0
                }
    }

    function SVGTextElement(t, e, r) {
        this.textSpans = [], this.renderType = "svg", this.initElement(t, e, r)
    }

    function SVGShapeElement(t, e, r) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.shapeModifiers = [],
            this.itemsData = [], this.processedElements = [], this.animatedContents = [], this
                .initElement(t, e, r), this.prevViewData = []
    }

    function SVGTintFilter(t, e) {
        this.filterManager = e;
        var r = createNS("feColorMatrix");
        if (r.setAttribute("type", "matrix"), r.setAttribute("color-interpolation-filters",
            "linearRGB"), r.setAttribute("values",
                "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"),
            r.setAttribute("result", "f1"), t.appendChild(r), (r = createNS("feColorMatrix"))
                .setAttribute("type", "matrix"), r.setAttribute("color-interpolation-filters", "sRGB"), r
                    .setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), r.setAttribute("result",
                        "f2"), t.appendChild(r), this.matrixFilter = r, 100 !== e.effectElements[2].p.v || e
                            .effectElements[2].p.k) {
            var i, s = createNS("feMerge");
            t.appendChild(s), (i = createNS("feMergeNode")).setAttribute("in", "SourceGraphic"), s
                .appendChild(i), (i = createNS("feMergeNode")).setAttribute("in", "f2"), s.appendChild(
                    i)
        }
    }

    function SVGFillFilter(t, e) {
        this.filterManager = e;
        var r = createNS("feColorMatrix");
        r.setAttribute("type", "matrix"), r.setAttribute("color-interpolation-filters", "sRGB"), r
            .setAttribute("values", "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"), t.appendChild(r), this
                .matrixFilter = r
    }

    function SVGGaussianBlurEffect(t, e) {
        t.setAttribute("x", "-100%"), t.setAttribute("y", "-100%"), t.setAttribute("width", "300%"), t
            .setAttribute("height", "300%"), this.filterManager = e;
        var r = createNS("feGaussianBlur");
        t.appendChild(r), this.feGaussianBlur = r
    }

    function SVGStrokeEffect(t, e) {
        this.initialized = !1, this.filterManager = e, this.elem = t, this.paths = []
    }

    function SVGTritoneFilter(t, e) {
        this.filterManager = e;
        var r = createNS("feColorMatrix");
        r.setAttribute("type", "matrix"), r.setAttribute("color-interpolation-filters", "linearRGB"), r
            .setAttribute("values",
                "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"),
            r.setAttribute("result", "f1"), t.appendChild(r);
        var i = createNS("feComponentTransfer");
        i.setAttribute("color-interpolation-filters", "sRGB"), t.appendChild(i), this.matrixFilter = i;
        var s = createNS("feFuncR");
        s.setAttribute("type", "table"), i.appendChild(s), this.feFuncR = s;
        var a = createNS("feFuncG");
        a.setAttribute("type", "table"), i.appendChild(a), this.feFuncG = a;
        var n = createNS("feFuncB");
        n.setAttribute("type", "table"), i.appendChild(n), this.feFuncB = n
    }

    function SVGProLevelsFilter(t, e) {
        this.filterManager = e;
        var r = this.filterManager.effectElements,
            i = createNS("feComponentTransfer");
        (r[10].p.k || 0 !== r[10].p.v || r[11].p.k || 1 !== r[11].p.v || r[12].p.k || 1 !== r[12].p.v ||
            r[13].p.k || 0 !== r[13].p.v || r[14].p.k || 1 !== r[14].p.v) && (this.feFuncR = this
                .createFeFunc("feFuncR", i)), (r[17].p.k || 0 !== r[17].p.v || r[18].p.k || 1 !== r[18].p
                    .v || r[19].p.k || 1 !== r[19].p.v || r[20].p.k || 0 !== r[20].p.v || r[21].p.k || 1 !== r[
                        21].p.v) && (this.feFuncG = this.createFeFunc("feFuncG", i)), (r[24].p.k || 0 !== r[24]
                            .p.v || r[25].p.k || 1 !== r[25].p.v || r[26].p.k || 1 !== r[26].p.v || r[27].p.k || 0 !==
                            r[27].p.v || r[28].p.k || 1 !== r[28].p.v) && (this.feFuncB = this.createFeFunc("feFuncB",
                                i)), (r[31].p.k || 0 !== r[31].p.v || r[32].p.k || 1 !== r[32].p.v || r[33].p.k || 1 !== r[
                                    33].p.v || r[34].p.k || 0 !== r[34].p.v || r[35].p.k || 1 !== r[35].p.v) && (this.feFuncA =
                                        this.createFeFunc("feFuncA", i)), (this.feFuncR || this.feFuncG || this.feFuncB || this
                                            .feFuncA) && (i.setAttribute("color-interpolation-filters", "sRGB"), t.appendChild(i), i =
                                                createNS("feComponentTransfer")), (r[3].p.k || 0 !== r[3].p.v || r[4].p.k || 1 !== r[4].p
                                                    .v || r[5].p.k || 1 !== r[5].p.v || r[6].p.k || 0 !== r[6].p.v || r[7].p.k || 1 !== r[7].p.v
                                                ) && (i.setAttribute("color-interpolation-filters", "sRGB"), t.appendChild(i), this
                                                    .feFuncRComposed = this.createFeFunc("feFuncR", i), this.feFuncGComposed = this
                                                        .createFeFunc("feFuncG", i), this.feFuncBComposed = this.createFeFunc("feFuncB", i))
    }

    function SVGDropShadowEffect(t, e) {
        t.setAttribute("x", "-100%"), t.setAttribute("y", "-100%"), t.setAttribute("width", "400%"), t
            .setAttribute("height", "400%"), this.filterManager = e;
        var r = createNS("feGaussianBlur");
        r.setAttribute("in", "SourceAlpha"), r.setAttribute("result", "drop_shadow_1"), r.setAttribute(
            "stdDeviation", "0"), this.feGaussianBlur = r, t.appendChild(r);
        var i = createNS("feOffset");
        i.setAttribute("dx", "25"), i.setAttribute("dy", "0"), i.setAttribute("in", "drop_shadow_1"), i
            .setAttribute("result", "drop_shadow_2"), this.feOffset = i, t.appendChild(i);
        var s = createNS("feFlood");
        s.setAttribute("flood-color", "#00ff00"), s.setAttribute("flood-opacity", "1"), s.setAttribute(
            "result", "drop_shadow_3"), this.feFlood = s, t.appendChild(s);
        var a = createNS("feComposite");
        a.setAttribute("in", "drop_shadow_3"), a.setAttribute("in2", "drop_shadow_2"), a.setAttribute(
            "operator", "in"), a.setAttribute("result", "drop_shadow_4"), t.appendChild(a);
        var n, o = createNS("feMerge");
        t.appendChild(o), n = createNS("feMergeNode"), o.appendChild(n), (n = createNS("feMergeNode"))
            .setAttribute("in", "SourceGraphic"), this.feMergeNode = n, this.feMerge = o, this
                .originalNodeAdded = !1, o.appendChild(n)
    }
    ShapeTransformManager.prototype = {
        addTransformSequence: function (t) {
            var e, r = t.length,
                i = "_";
            for (e = 0; e < r; e += 1) i += t[e].transform.key + "_";
            var s = this.sequences[i];
            return s || (s = {
                transforms: [].concat(t),
                finalTransform: new Matrix,
                _mdf: !1
            }, this.sequences[i] = s, this.sequenceList.push(s)), s
        },
        processSequence: function (t, e) {
            for (var r, i = 0, s = t.transforms.length, a = e; i < s && !e;) {
                if (t.transforms[i].transform.mProps._mdf) {
                    a = !0;
                    break
                }
                i += 1
            }
            if (a)
                for (t.finalTransform.reset(), i = s - 1; 0 <= i; i -= 1) r = t.transforms[i]
                    .transform.mProps.v.props, t.finalTransform.transform(r[0], r[1], r[2], r[
                        3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13],
                        r[
                        14], r[15]);
            t._mdf = a
        },
        processSequences: function (t) {
            var e, r = this.sequenceList.length;
            for (e = 0; e < r; e += 1) this.processSequence(this.sequenceList[e], t)
        },
        getNewKey: function () {
            return "_" + this.transform_key_count++
        }
    }, CVShapeData.prototype.setAsAnimated = SVGShapeData.prototype.setAsAnimated, BaseElement
        .prototype = {
            checkMasks: function () {
                if (!this.data.hasMask) return !1;
                for (var t = 0, e = this.data.masksProperties.length; t < e;) {
                    if ("n" !== this.data.masksProperties[t].mode && !1 !== this.data
                        .masksProperties[t].cl) return !0;
                    t += 1
                }
                return !1
            },
            initExpressions: function () {
                this.layerInterface = LayerExpressionInterface(this), this.data.hasMask && this
                    .maskManager && this.layerInterface.registerMaskInterface(this.maskManager);
                var t = EffectsExpressionInterface.createEffectsInterface(this, this
                    .layerInterface);
                this.layerInterface.registerEffectsInterface(t), 0 === this.data.ty || this.data
                    .xt ? this.compInterface = CompExpressionInterface(this) : 4 === this.data.ty ?
                    (this.layerInterface.shapeInterface = ShapeExpressionInterface(this.shapesData,
                        this.itemsData, this.layerInterface), this.layerInterface.content = this
                            .layerInterface.shapeInterface) : 5 === this.data.ty && (this.layerInterface
                                .textInterface = TextExpressionInterface(this), this.layerInterface.text =
                                this.layerInterface.textInterface)
            },
            setBlendMode: function () {
                var t = getBlendMode(this.data.bm);
                (this.baseElement || this.layerElement).style["mix-blend-mode"] = t
            },
            initBaseData: function (t, e, r) {
                this.globalData = e, this.comp = r, this.data = t, this.layerId = createElementID(),
                    this.data.sr || (this.data.sr = 1), this.effectsManager = new EffectsManager(
                        this.data, this, this.dynamicProperties)
            },
            getType: function () {
                return this.type
            },
            sourceRectAtTime: function () { }
        }, NullElement.prototype.prepareFrame = function (t) {
            this.prepareProperties(t, !0)
        }, NullElement.prototype.renderFrame = function () { }, NullElement.prototype.getBaseElement =
        function () {
            return null
        }, NullElement.prototype.destroy = function () { }, NullElement.prototype.sourceRectAtTime =
        function () { }, NullElement.prototype.hide = function () { }, extendPrototype([BaseElement,
            TransformElement, HierarchyElement, FrameElement
        ], NullElement), SVGBaseElement.prototype = {
            initRendererElement: function () {
                this.layerElement = createNS("g")
            },
            createContainerElements: function () {
                this.matteElement = createNS("g"), this.transformedElement = this.layerElement, this
                    .maskedElement = this.layerElement, this._sizeChanged = !1;
                var t, e, r, i = null;
                if (this.data.td) {
                    if (3 == this.data.td || 1 == this.data.td) {
                        var s = createNS("mask");
                        s.setAttribute("id", this.layerId), s.setAttribute("mask-type", 3 == this
                            .data.td ? "luminance" : "alpha"), s.appendChild(this.layerElement),
                            i = s, this.globalData.defs.appendChild(s), featureSupport.maskType ||
                            1 != this.data.td || (s.setAttribute("mask-type", "luminance"), t =
                                createElementID(), e = filtersFactory.createFilter(t), this
                                    .globalData.defs.appendChild(e), e.appendChild(filtersFactory
                                        .createAlphaToLuminanceFilter()), (r = createNS("g"))
                                            .appendChild(this.layerElement), i = r, s.appendChild(r), r
                                                .setAttribute("filter", "url(" + locationHref + "#" + t + ")"))
                    } else if (2 == this.data.td) {
                        var a = createNS("mask");
                        a.setAttribute("id", this.layerId), a.setAttribute("mask-type", "alpha");
                        var n = createNS("g");
                        a.appendChild(n), t = createElementID(), e = filtersFactory.createFilter(t);
                        var o = createNS("feComponentTransfer");
                        o.setAttribute("in", "SourceGraphic"), e.appendChild(o);
                        var h = createNS("feFuncA");
                        h.setAttribute("type", "table"), h.setAttribute("tableValues", "1.0 0.0"), o
                            .appendChild(h), this.globalData.defs.appendChild(e);
                        var l = createNS("rect");
                        l.setAttribute("width", this.comp.data.w), l.setAttribute("height", this
                            .comp.data.h), l.setAttribute("x", "0"), l.setAttribute("y", "0"), l
                                .setAttribute("fill", "#ffffff"), l.setAttribute("opacity", "0"), n
                                    .setAttribute("filter", "url(" + locationHref + "#" + t + ")"), n
                                        .appendChild(l), n.appendChild(this.layerElement), i = n, featureSupport
                                            .maskType || (a.setAttribute("mask-type", "luminance"), e.appendChild(
                                                filtersFactory.createAlphaToLuminanceFilter()), r = createNS(
                                                    "g"), n.appendChild(l), r.appendChild(this.layerElement), i = r,
                                                n.appendChild(r)), this.globalData.defs.appendChild(a)
                    }
                } else this.data.tt ? (this.matteElement.appendChild(this.layerElement), i = this
                    .matteElement, this.baseElement = this.matteElement) : this.baseElement =
                this.layerElement;
                if (this.data.ln && this.layerElement.setAttribute("id", this.data.ln), this.data
                    .cl && this.layerElement.setAttribute("class", this.data.cl), 0 === this.data
                        .ty && !this.data.hd) {
                    var p = createNS("clipPath"),
                        m = createNS("path");
                    m.setAttribute("d", "M0,0 L" + this.data.w + ",0 L" + this.data.w + "," + this
                        .data.h + " L0," + this.data.h + "z");
                    var f = createElementID();
                    if (p.setAttribute("id", f), p.appendChild(m), this.globalData.defs.appendChild(
                        p), this.checkMasks()) {
                        var c = createNS("g");
                        c.setAttribute("clip-path", "url(" + locationHref + "#" + f + ")"), c
                            .appendChild(this.layerElement), this.transformedElement = c, i ? i
                                .appendChild(this.transformedElement) : this.baseElement = this
                                    .transformedElement
                    } else this.layerElement.setAttribute("clip-path", "url(" + locationHref + "#" +
                        f + ")")
                }
                0 !== this.data.bm && this.setBlendMode()
            },
            renderElement: function () {
                this.finalTransform._matMdf && this.transformedElement.setAttribute("transform",
                    this.finalTransform.mat.to2dCSS()), this.finalTransform._opMdf && this
                        .transformedElement.setAttribute("opacity", this.finalTransform.mProp.o.v)
            },
            destroyBaseElement: function () {
                this.layerElement = null, this.matteElement = null, this.maskManager.destroy()
            },
            getBaseElement: function () {
                return this.data.hd ? null : this.baseElement
            },
            createRenderableComponents: function () {
                this.maskManager = new MaskElement(this.data, this, this.globalData), this
                    .renderableEffectsManager = new SVGEffects(this)
            },
            setMatte: function (t) {
                this.matteElement && this.matteElement.setAttribute("mask", "url(" + locationHref +
                    "#" + t + ")")
            }
        }, IShapeElement.prototype = {
            addShapeToModifiers: function (t) {
                var e, r = this.shapeModifiers.length;
                for (e = 0; e < r; e += 1) this.shapeModifiers[e].addShape(t)
            },
            isShapeInAnimatedModifiers: function (t) {
                for (var e = this.shapeModifiers.length; 0 < e;)
                    if (this.shapeModifiers[0].isAnimatedWithShape(t)) return !0;
                return !1
            },
            renderModifiers: function () {
                if (this.shapeModifiers.length) {
                    var t, e = this.shapes.length;
                    for (t = 0; t < e; t += 1) this.shapes[t].sh.reset();
                    for (t = (e = this.shapeModifiers.length) - 1; 0 <= t; t -= 1) this
                        .shapeModifiers[t].processShapes(this._isFirstFrame)
                }
            },
            lcEnum: {
                1: "butt",
                2: "round",
                3: "square"
            },
            ljEnum: {
                1: "miter",
                2: "round",
                3: "bevel"
            },
            searchProcessedElement: function (t) {
                for (var e = this.processedElements, r = 0, i = e.length; r < i;) {
                    if (e[r].elem === t) return e[r].pos;
                    r += 1
                }
                return 0
            },
            addProcessedElement: function (t, e) {
                for (var r = this.processedElements, i = r.length; i;)
                    if (r[i -= 1].elem === t) return void (r[i].pos = e);
                r.push(new ProcessedElement(t, e))
            },
            prepareFrame: function (t) {
                this.prepareRenderableFrame(t), this.prepareProperties(t, this.isInRange)
            }
        }, ITextElement.prototype.initElement = function (t, e, r) {
            this.lettersChangedFlag = !0, this.initFrame(), this.initBaseData(t, e, r), this
                .textProperty = new TextProperty(this, t.t, this.dynamicProperties), this.textAnimator =
                new TextAnimatorProperty(t.t, this.renderType, this), this.initTransform(t, e, r), this
                    .initHierarchy(), this.initRenderable(), this.initRendererElement(), this
                        .createContainerElements(), this.createRenderableComponents(), this.createContent(),
                this.hide(), this.textAnimator.searchProperties(this.dynamicProperties)
        }, ITextElement.prototype.prepareFrame = function (t) {
            this._mdf = !1, this.prepareRenderableFrame(t), this.prepareProperties(t, this.isInRange), (
                this.textProperty._mdf || this.textProperty._isFirstFrame) && (this.buildNewText(),
                    this.textProperty._isFirstFrame = !1, this.textProperty._mdf = !1)
        }, ITextElement.prototype.createPathShape = function (t, e) {
            var r, i, s = e.length,
                a = "";
            for (r = 0; r < s; r += 1) i = e[r].ks.k, a += buildShapeString(i, i.i.length, !0, t);
            return a
        }, ITextElement.prototype.updateDocumentData = function (t, e) {
            this.textProperty.updateDocumentData(t, e)
        }, ITextElement.prototype.canResizeFont = function (t) {
            this.textProperty.canResizeFont(t)
        }, ITextElement.prototype.setMinimumFontSize = function (t) {
            this.textProperty.setMinimumFontSize(t)
        }, ITextElement.prototype.applyTextPropertiesToMatrix = function (t, e, r, i, s) {
            switch (t.ps && e.translate(t.ps[0], t.ps[1] + t.ascent, 0), e.translate(0, -t.ls, 0), t
                .j) {
                case 1:
                    e.translate(t.justifyOffset + (t.boxWidth - t.lineWidths[r]), 0, 0);
                    break;
                case 2:
                    e.translate(t.justifyOffset + (t.boxWidth - t.lineWidths[r]) / 2, 0, 0)
            }
            e.translate(i, s, 0)
        }, ITextElement.prototype.buildColor = function (t) {
            return "rgb(" + Math.round(255 * t[0]) + "," + Math.round(255 * t[1]) + "," + Math.round(
                255 * t[2]) + ")"
        }, ITextElement.prototype.emptyProp = new LetterProps, ITextElement.prototype.destroy =
        function () { }, extendPrototype([BaseElement, TransformElement, HierarchyElement, FrameElement,
            RenderableDOMElement
        ], ICompElement), ICompElement.prototype.initElement = function (t, e, r) {
            this.initFrame(), this.initBaseData(t, e, r), this.initTransform(t, e, r), this
                .initRenderable(), this.initHierarchy(), this.initRendererElement(), this
                    .createContainerElements(), this.createRenderableComponents(), !this.data.xt && e
                        .progressiveLoad || this.buildAllItems(), this.hide()
        }, ICompElement.prototype.prepareFrame = function (t) {
            if (this._mdf = !1, this.prepareRenderableFrame(t), this.prepareProperties(t, this
                .isInRange), this.isInRange || this.data.xt) {
                if (this.tm._placeholder) this.renderedFrame = t / this.data.sr;
                else {
                    var e = this.tm.v;
                    e === this.data.op && (e = this.data.op - 1), this.renderedFrame = e
                }
                var r, i = this.elements.length;
                for (this.completeLayers || this.checkLayers(this.renderedFrame), r = i - 1; 0 <=
                    r; r -= 1)(this.completeLayers || this.elements[r]) && (this.elements[r]
                        .prepareFrame(this.renderedFrame - this.layers[r].st), this.elements[r]._mdf &&
                        (this._mdf = !0))
            }
        }, ICompElement.prototype.renderInnerContent = function () {
            var t, e = this.layers.length;
            for (t = 0; t < e; t += 1)(this.completeLayers || this.elements[t]) && this.elements[t]
                .renderFrame()
        }, ICompElement.prototype.setElements = function (t) {
            this.elements = t
        }, ICompElement.prototype.getElements = function () {
            return this.elements
        }, ICompElement.prototype.destroyElements = function () {
            var t, e = this.layers.length;
            for (t = 0; t < e; t += 1) this.elements[t] && this.elements[t].destroy()
        }, ICompElement.prototype.destroy = function () {
            this.destroyElements(), this.destroyBaseElement()
        }, extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement,
            FrameElement, RenderableDOMElement
        ], IImageElement), IImageElement.prototype.createContent = function () {
            var t = this.globalData.getAssetsPath(this.assetData);
            this.innerElem = createNS("image"), this.innerElem.setAttribute("width", this.assetData.w +
                "px"), this.innerElem.setAttribute("height", this.assetData.h + "px"), this
                    .innerElem.setAttribute("preserveAspectRatio", this.assetData.pr || this.globalData
                        .renderConfig.imagePreserveAspectRatio), this.innerElem.setAttributeNS(
                            "http://www.w3.org/1999/xlink", "href", t), this.layerElement.appendChild(this
                                .innerElem)
        }, IImageElement.prototype.sourceRectAtTime = function () {
            return this.sourceRect
        }, extendPrototype([IImageElement], ISolidElement), ISolidElement.prototype.createContent =
        function () {
            var t = createNS("rect");
            t.setAttribute("width", this.data.sw), t.setAttribute("height", this.data.sh), t
                .setAttribute("fill", this.data.sc), this.layerElement.appendChild(t)
        }, extendPrototype([SVGRenderer, ICompElement, SVGBaseElement], SVGCompElement),
        extendPrototype([BaseElement, TransformElement, SVGBaseElement, HierarchyElement, FrameElement,
            RenderableDOMElement, ITextElement
        ], SVGTextElement), SVGTextElement.prototype.createContent = function () {
            this.data.singleShape && !this.globalData.fontManager.chars && (this.textContainer =
                createNS("text"))
        }, SVGTextElement.prototype.buildTextContents = function (t) {
            for (var e = 0, r = t.length, i = [], s = ""; e < r;) t[e] === String.fromCharCode(13) || t[
                e] === String.fromCharCode(3) ? (i.push(s), s = "") : s += t[e], e += 1;
            return i.push(s), i
        }, SVGTextElement.prototype.buildNewText = function () {
            var t, e, r = this.textProperty.currentData;
            this.renderedLetters = createSizedArray(r ? r.l.length : 0), r.fc ? this.layerElement
                .setAttribute("fill", this.buildColor(r.fc)) : this.layerElement.setAttribute("fill",
                    "rgba(0,0,0,0)"), r.sc && (this.layerElement.setAttribute("stroke", this.buildColor(
                        r.sc)), this.layerElement.setAttribute("stroke-width", r.sw)), this.layerElement
                            .setAttribute("font-size", r.finalSize);
            var i = this.globalData.fontManager.getFontByName(r.f);
            if (i.fClass) this.layerElement.setAttribute("class", i.fClass);
            else {
                this.layerElement.setAttribute("font-family", i.fFamily);
                var s = r.fWeight,
                    a = r.fStyle;
                this.layerElement.setAttribute("font-style", a), this.layerElement.setAttribute(
                    "font-weight", s)
            }
            this.layerElement.setAttribute("aria-label", r.t);
            var n, o = r.l || [],
                h = !!this.globalData.fontManager.chars;
            e = o.length;
            var l, p = this.mHelper,
                m = "",
                f = this.data.singleShape,
                c = 0,
                d = 0,
                u = !0,
                y = r.tr / 1e3 * r.finalSize;
            if (!f || h || r.sz) {
                var g, v, b = this.textSpans.length;
                for (t = 0; t < e; t += 1) h && f && 0 !== t || (n = t < b ? this.textSpans[t] :
                    createNS(h ? "path" : "text"), b <= t && (n.setAttribute("stroke-linecap",
                        "butt"), n.setAttribute("stroke-linejoin", "round"), n.setAttribute(
                            "stroke-miterlimit", "4"), this.textSpans[t] = n, this.layerElement
                                .appendChild(n)), n.style.display = "inherit"), p.reset(), p.scale(r
                                    .finalSize / 100, r.finalSize / 100), f && (o[t].n && (c = -y, d += r.yOffset,
                                        d += u ? 1 : 0, u = !1), this.applyTextPropertiesToMatrix(r, p, o[t].line,
                                            c, d), c += o[t].l || 0, c += y), h ? (l = (g = (v = this.globalData.fontManager
                                                .getCharData(r.finalText[t], i.fStyle, this.globalData.fontManager
                                                    .getFontByName(r.f).fFamily)) && v.data || {}).shapes ? g.shapes[0].it :
                                                [], f ? m += this.createPathShape(p, l) : n.setAttribute("d", this
                                                    .createPathShape(p, l))) : (f && n.setAttribute("transform", "translate(" +
                                                        p.props[12] + "," + p.props[13] + ")"), n.textContent = o[t].val, n
                                                            .setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve")
                    );
                f && n && n.setAttribute("d", m)
            } else {
                var E = this.textContainer,
                    x = "start";
                switch (r.j) {
                    case 1:
                        x = "end";
                        break;
                    case 2:
                        x = "middle"
                }
                E.setAttribute("text-anchor", x), E.setAttribute("letter-spacing", y);
                var P = this.buildTextContents(r.finalText);
                for (e = P.length, d = r.ps ? r.ps[1] + r.ascent : 0, t = 0; t < e; t += 1)(n = this
                    .textSpans[t] || createNS("tspan")).textContent = P[t], n.setAttribute("x", 0),
                    n.setAttribute("y", d), n.style.display = "inherit", E.appendChild(n), this
                        .textSpans[t] = n, d += r.finalLineHeight;
                this.layerElement.appendChild(E)
            }
            for (; t < this.textSpans.length;) this.textSpans[t].style.display = "none", t += 1;
            this._sizeChanged = !0
        }, SVGTextElement.prototype.sourceRectAtTime = function (t) {
            if (this.prepareFrame(this.comp.renderedFrame - this.data.st), this.renderInnerContent(),
                this._sizeChanged) {
                this._sizeChanged = !1;
                var e = this.layerElement.getBBox();
                this.bbox = {
                    top: e.y,
                    left: e.x,
                    width: e.width,
                    height: e.height
                }
            }
            return this.bbox
        }, SVGTextElement.prototype.renderInnerContent = function () {
            if (!this.data.singleShape && (this.textAnimator.getMeasures(this.textProperty.currentData,
                this.lettersChangedFlag), this.lettersChangedFlag || this.textAnimator
                    .lettersChangedFlag)) {
                var t, e;
                this._sizeChanged = !0;
                var r, i, s = this.textAnimator.renderedLetters,
                    a = this.textProperty.currentData.l;
                for (e = a.length, t = 0; t < e; t += 1) a[t].n || (r = s[t], i = this.textSpans[t], r
                    ._mdf.m && i.setAttribute("transform", r.m), r._mdf.o && i.setAttribute(
                        "opacity", r.o), r._mdf.sw && i.setAttribute("stroke-width", r.sw), r._mdf
                            .sc && i.setAttribute("stroke", r.sc), r._mdf.fc && i.setAttribute("fill", r.fc)
                )
            }
        }, extendPrototype([BaseElement, TransformElement, SVGBaseElement, IShapeElement,
            HierarchyElement, FrameElement, RenderableDOMElement
        ], SVGShapeElement), SVGShapeElement.prototype.initSecondaryElement = function () { },
        SVGShapeElement.prototype.identityMatrix = new Matrix, SVGShapeElement.prototype
            .buildExpressionInterface = function () { }, SVGShapeElement.prototype.createContent =
        function () {
            this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.layerElement, 0,
                [], !0), this.filterUniqueShapes()
        }, SVGShapeElement.prototype.filterUniqueShapes = function () {
            var t, e, r, i, s = this.shapes.length,
                a = this.stylesList.length,
                n = [],
                o = !1;
            for (r = 0; r < a; r += 1) {
                for (i = this.stylesList[r], o = !1, t = n.length = 0; t < s; t += 1) - 1 !== (e = this
                    .shapes[t]).styles.indexOf(i) && (n.push(e), o = e._isAnimated || o);
                1 < n.length && o && this.setShapesAsAnimated(n)
            }
        }, SVGShapeElement.prototype.setShapesAsAnimated = function (t) {
            var e, r = t.length;
            for (e = 0; e < r; e += 1) t[e].setAsAnimated()
        }, SVGShapeElement.prototype.createStyleElement = function (t, e) {
            var r, i = new SVGStyleData(t, e),
                s = i.pElem;
            if ("st" === t.ty) r = new SVGStrokeStyleData(this, t, i);
            else if ("fl" === t.ty) r = new SVGFillStyleData(this, t, i);
            else if ("gf" === t.ty || "gs" === t.ty) {
                r = new ("gf" === t.ty ? SVGGradientFillStyleData : SVGGradientStrokeStyleData)(this, t,
                    i), this.globalData.defs.appendChild(r.gf), r.maskId && (this.globalData.defs
                        .appendChild(r.ms), this.globalData.defs.appendChild(r.of), s.setAttribute(
                            "mask", "url(" + locationHref + "#" + r.maskId + ")"))
            }
            return "st" !== t.ty && "gs" !== t.ty || (s.setAttribute("stroke-linecap", this.lcEnum[t
                .lc] || "round"), s.setAttribute("stroke-linejoin", this.ljEnum[t.lj] ||
                    "round"), s.setAttribute("fill-opacity", "0"), 1 === t.lj && s.setAttribute(
                        "stroke-miterlimit", t.ml)), 2 === t.r && s.setAttribute("fill-rule", "evenodd"), t
                            .ln && s.setAttribute("id", t.ln), t.cl && s.setAttribute("class", t.cl), t.bm && (s
                                .style["mix-blend-mode"] = getBlendMode(t.bm)), this.stylesList.push(i), this
                                    .addToAnimatedContents(t, r), r
        }, SVGShapeElement.prototype.createGroupElement = function (t) {
            var e = new ShapeGroupData;
            return t.ln && e.gr.setAttribute("id", t.ln), t.cl && e.gr.setAttribute("class", t.cl), t
                .bm && (e.gr.style["mix-blend-mode"] = getBlendMode(t.bm)), e
        }, SVGShapeElement.prototype.createTransformElement = function (t, e) {
            var r = TransformPropertyFactory.getTransformProperty(this, t, this),
                i = new SVGTransformData(r, r.o, e);
            return this.addToAnimatedContents(t, i), i
        }, SVGShapeElement.prototype.createShapeElement = function (t, e, r) {
            var i = 4;
            "rc" === t.ty ? i = 5 : "el" === t.ty ? i = 6 : "sr" === t.ty && (i = 7);
            var s = new SVGShapeData(e, r, ShapePropertyFactory.getShapeProp(this, t, i, this));
            return this.shapes.push(s), this.addShapeToModifiers(s), this.addToAnimatedContents(t, s), s
        }, SVGShapeElement.prototype.addToAnimatedContents = function (t, e) {
            for (var r = 0, i = this.animatedContents.length; r < i;) {
                if (this.animatedContents[r].element === e) return;
                r += 1
            }
            this.animatedContents.push({
                fn: SVGElementsRenderer.createRenderFunction(t),
                element: e,
                data: t
            })
        }, SVGShapeElement.prototype.setElementStyles = function (t) {
            var e, r = t.styles,
                i = this.stylesList.length;
            for (e = 0; e < i; e += 1) this.stylesList[e].closed || r.push(this.stylesList[e])
        }, SVGShapeElement.prototype.reloadShapes = function () {
            this._isFirstFrame = !0;
            var t, e = this.itemsData.length;
            for (t = 0; t < e; t += 1) this.prevViewData[t] = this.itemsData[t];
            for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this
                .layerElement, 0, [], !0), this.filterUniqueShapes(), e = this.dynamicProperties
                    .length, t = 0; t < e; t += 1) this.dynamicProperties[t].getValue();
            this.renderModifiers()
        }, SVGShapeElement.prototype.searchShapes = function (t, e, r, i, s, a, n) {
            var o, h, l, p, m, f, c = [].concat(a),
                d = t.length - 1,
                u = [],
                y = [];
            for (o = d; 0 <= o; o -= 1) {
                if ((f = this.searchProcessedElement(t[o])) ? e[o] = r[f - 1] : t[o]._render = n,
                    "fl" == t[o].ty || "st" == t[o].ty || "gf" == t[o].ty || "gs" == t[o].ty) f ? e[o]
                        .style.closed = !1 : e[o] = this.createStyleElement(t[o], s), t[o]._render && i
                            .appendChild(e[o].style.pElem), u.push(e[o].style);
                else if ("gr" == t[o].ty) {
                    if (f)
                        for (l = e[o].it.length, h = 0; h < l; h += 1) e[o].prevViewData[h] = e[o].it[
                            h];
                    else e[o] = this.createGroupElement(t[o]);
                    this.searchShapes(t[o].it, e[o].it, e[o].prevViewData, e[o].gr, s + 1, c, n), t[o]
                        ._render && i.appendChild(e[o].gr)
                } else "tr" == t[o].ty ? (f || (e[o] = this.createTransformElement(t[o], i)), p = e[o]
                    .transform, c.push(p)) : "sh" == t[o].ty || "rc" == t[o].ty || "el" == t[o]
                        .ty || "sr" == t[o].ty ? (f || (e[o] = this.createShapeElement(t[o], c, s)), this
                            .setElementStyles(e[o])) : "tm" == t[o].ty || "rd" == t[o].ty || "ms" == t[o]
                                .ty ? (f ? (m = e[o]).closed = !1 : ((m = ShapeModifiers.getModifier(t[o].ty)).init(
                                    this, t[o]), e[o] = m, this.shapeModifiers.push(m)), y.push(m)) : "rp" == t[o]
                                        .ty && (f ? (m = e[o]).closed = !0 : (m = ShapeModifiers.getModifier(t[o].ty), (e[
                                            o] = m).init(this, t, o, e), this.shapeModifiers.push(m), n = !1), y.push(
                                                m));
                this.addProcessedElement(t[o], o + 1)
            }
            for (d = u.length, o = 0; o < d; o += 1) u[o].closed = !0;
            for (d = y.length, o = 0; o < d; o += 1) y[o].closed = !0
        }, SVGShapeElement.prototype.renderInnerContent = function () {
            this.renderModifiers();
            var t, e = this.stylesList.length;
            for (t = 0; t < e; t += 1) this.stylesList[t].reset();
            for (this.renderShape(), t = 0; t < e; t += 1)(this.stylesList[t]._mdf || this
                ._isFirstFrame) && (this.stylesList[t].msElem && (this.stylesList[t].msElem
                    .setAttribute("d", this.stylesList[t].d), this.stylesList[t].d = "M0 0" + this
                        .stylesList[t].d), this.stylesList[t].pElem.setAttribute("d", this.stylesList[t]
                            .d || "M0 0"))
        }, SVGShapeElement.prototype.renderShape = function () {
            var t, e, r = this.animatedContents.length;
            for (t = 0; t < r; t += 1) e = this.animatedContents[t], (this._isFirstFrame || e.element
                ._isAnimated) && !0 !== e.data && e.fn(e.data, e.element, this._isFirstFrame)
        }, SVGShapeElement.prototype.destroy = function () {
            this.destroyBaseElement(), this.shapesData = null, this.itemsData = null
        }, SVGTintFilter.prototype.renderFrame = function (t) {
            if (t || this.filterManager._mdf) {
                var e = this.filterManager.effectElements[0].p.v,
                    r = this.filterManager.effectElements[1].p.v,
                    i = this.filterManager.effectElements[2].p.v / 100;
                this.matrixFilter.setAttribute("values", r[0] - e[0] + " 0 0 0 " + e[0] + " " + (r[1] -
                    e[1]) + " 0 0 0 " + e[1] + " " + (r[2] - e[2]) + " 0 0 0 " + e[2] +
                    " 0 0 0 " + i + " 0")
            }
        }, SVGFillFilter.prototype.renderFrame = function (t) {
            if (t || this.filterManager._mdf) {
                var e = this.filterManager.effectElements[2].p.v,
                    r = this.filterManager.effectElements[6].p.v;
                this.matrixFilter.setAttribute("values", "0 0 0 0 " + e[0] + " 0 0 0 0 " + e[1] +
                    " 0 0 0 0 " + e[2] + " 0 0 0 " + r + " 0")
            }
        }, SVGGaussianBlurEffect.prototype.renderFrame = function (t) {
            if (t || this.filterManager._mdf) {
                var e = .3 * this.filterManager.effectElements[0].p.v,
                    r = this.filterManager.effectElements[1].p.v,
                    i = 3 == r ? 0 : e,
                    s = 2 == r ? 0 : e;
                this.feGaussianBlur.setAttribute("stdDeviation", i + " " + s);
                var a = 1 == this.filterManager.effectElements[2].p.v ? "wrap" : "duplicate";
                this.feGaussianBlur.setAttribute("edgeMode", a)
            }
        }, SVGStrokeEffect.prototype.initialize = function () {
            var t, e, r, i, s = this.elem.layerElement.children || this.elem.layerElement.childNodes;
            for (1 === this.filterManager.effectElements[1].p.v ? (i = this.elem.maskManager
                .masksProperties.length, r = 0) : i = (r = this.filterManager.effectElements[0].p
                    .v - 1) + 1, (e = createNS("g")).setAttribute("fill", "none"), e.setAttribute(
                        "stroke-linecap", "round"), e.setAttribute("stroke-dashoffset", 1); r < i; r += 1)
                t = createNS("path"), e.appendChild(t), this.paths.push({
                    p: t,
                    m: r
                });
            if (3 === this.filterManager.effectElements[10].p.v) {
                var a = createNS("mask"),
                    n = createElementID();
                a.setAttribute("id", n), a.setAttribute("mask-type", "alpha"), a.appendChild(e), this
                    .elem.globalData.defs.appendChild(a);
                var o = createNS("g");
                for (o.setAttribute("mask", "url(" + locationHref + "#" + n + ")"); s[0];) o
                    .appendChild(s[0]);
                this.elem.layerElement.appendChild(o), this.masker = a, e.setAttribute("stroke", "#fff")
            } else if (1 === this.filterManager.effectElements[10].p.v || 2 === this.filterManager
                .effectElements[10].p.v) {
                if (2 === this.filterManager.effectElements[10].p.v)
                    for (s = this.elem.layerElement.children || this.elem.layerElement.childNodes; s
                        .length;) this.elem.layerElement.removeChild(s[0]);
                this.elem.layerElement.appendChild(e), this.elem.layerElement.removeAttribute("mask"), e
                    .setAttribute("stroke", "#fff")
            }
            this.initialized = !0, this.pathMasker = e
        }, SVGStrokeEffect.prototype.renderFrame = function (t) {
            this.initialized || this.initialize();
            var e, r, i, s = this.paths.length;
            for (e = 0; e < s; e += 1)
                if (-1 !== this.paths[e].m && (r = this.elem.maskManager.viewData[this.paths[e].m], i =
                    this.paths[e].p, (t || this.filterManager._mdf || r.prop._mdf) && i
                        .setAttribute("d", r.lastPath), t || this.filterManager.effectElements[9].p
                            ._mdf || this.filterManager.effectElements[4].p._mdf || this.filterManager
                                .effectElements[7].p._mdf || this.filterManager.effectElements[8].p._mdf || r
                                    .prop._mdf)) {
                    var a;
                    if (0 !== this.filterManager.effectElements[7].p.v || 100 !== this.filterManager
                        .effectElements[8].p.v) {
                        var n = Math.min(this.filterManager.effectElements[7].p.v, this.filterManager
                            .effectElements[8].p.v) / 100,
                            o = Math.max(this.filterManager.effectElements[7].p.v, this.filterManager
                                .effectElements[8].p.v) / 100,
                            h = i.getTotalLength();
                        a = "0 0 0 " + h * n + " ";
                        var l, p = h * (o - n),
                            m = 1 + 2 * this.filterManager.effectElements[4].p.v * this.filterManager
                                .effectElements[9].p.v / 100,
                            f = Math.floor(p / m);
                        for (l = 0; l < f; l += 1) a += "1 " + 2 * this.filterManager.effectElements[4]
                            .p.v * this.filterManager.effectElements[9].p.v / 100 + " ";
                        a += "0 " + 10 * h + " 0 0"
                    } else a = "1 " + 2 * this.filterManager.effectElements[4].p.v * this.filterManager
                        .effectElements[9].p.v / 100;
                    i.setAttribute("stroke-dasharray", a)
                } if ((t || this.filterManager.effectElements[4].p._mdf) && this.pathMasker
                    .setAttribute("stroke-width", 2 * this.filterManager.effectElements[4].p.v), (t || this
                        .filterManager.effectElements[6].p._mdf) && this.pathMasker.setAttribute("opacity",
                            this.filterManager.effectElements[6].p.v), (1 === this.filterManager.effectElements[
                                10].p.v || 2 === this.filterManager.effectElements[10].p.v) && (t || this
                                    .filterManager.effectElements[3].p._mdf)) {
                var c = this.filterManager.effectElements[3].p.v;
                this.pathMasker.setAttribute("stroke", "rgb(" + bm_floor(255 * c[0]) + "," + bm_floor(
                    255 * c[1]) + "," + bm_floor(255 * c[2]) + ")")
            }
        }, SVGTritoneFilter.prototype.renderFrame = function (t) {
            if (t || this.filterManager._mdf) {
                var e = this.filterManager.effectElements[0].p.v,
                    r = this.filterManager.effectElements[1].p.v,
                    i = this.filterManager.effectElements[2].p.v,
                    s = i[0] + " " + r[0] + " " + e[0],
                    a = i[1] + " " + r[1] + " " + e[1],
                    n = i[2] + " " + r[2] + " " + e[2];
                this.feFuncR.setAttribute("tableValues", s), this.feFuncG.setAttribute("tableValues",
                    a), this.feFuncB.setAttribute("tableValues", n)
            }
        }, SVGProLevelsFilter.prototype.createFeFunc = function (t, e) {
            var r = createNS(t);
            return r.setAttribute("type", "table"), e.appendChild(r), r
        }, SVGProLevelsFilter.prototype.getTableValue = function (t, e, r, i, s) {
            for (var a, n, o = 0, h = Math.min(t, e), l = Math.max(t, e), p = Array.call(null, {
                length: 256
            }), m = 0, f = s - i, c = e - t; o <= 256;) n = (a = o / 256) <= h ? c < 0 ? s : i :
                l <= a ? c < 0 ? i : s : i + f * Math.pow((a - t) / c, 1 / r), p[m++] = n, o += 256 /
                255;
            return p.join(" ")
        }, SVGProLevelsFilter.prototype.renderFrame = function (t) {
            if (t || this.filterManager._mdf) {
                var e, r = this.filterManager.effectElements;
                this.feFuncRComposed && (t || r[3].p._mdf || r[4].p._mdf || r[5].p._mdf || r[6].p
                    ._mdf || r[7].p._mdf) && (e = this.getTableValue(r[3].p.v, r[4].p.v, r[5].p.v,
                        r[6].p.v, r[7].p.v), this.feFuncRComposed.setAttribute("tableValues", e),
                        this.feFuncGComposed.setAttribute("tableValues", e), this.feFuncBComposed
                            .setAttribute("tableValues", e)), this.feFuncR && (t || r[10].p._mdf || r[11].p
                                ._mdf || r[12].p._mdf || r[13].p._mdf || r[14].p._mdf) && (e = this
                                    .getTableValue(r[10].p.v, r[11].p.v, r[12].p.v, r[13].p.v, r[14].p.v), this
                                        .feFuncR.setAttribute("tableValues", e)), this.feFuncG && (t || r[17].p._mdf ||
                                            r[18].p._mdf || r[19].p._mdf || r[20].p._mdf || r[21].p._mdf) && (e = this
                                                .getTableValue(r[17].p.v, r[18].p.v, r[19].p.v, r[20].p.v, r[21].p.v), this
                                                    .feFuncG.setAttribute("tableValues", e)), this.feFuncB && (t || r[24].p._mdf ||
                                                        r[25].p._mdf || r[26].p._mdf || r[27].p._mdf || r[28].p._mdf) && (e = this
                                                            .getTableValue(r[24].p.v, r[25].p.v, r[26].p.v, r[27].p.v, r[28].p.v), this
                                                                .feFuncB.setAttribute("tableValues", e)), this.feFuncA && (t || r[31].p._mdf ||
                                                                    r[32].p._mdf || r[33].p._mdf || r[34].p._mdf || r[35].p._mdf) && (e = this
                                                                        .getTableValue(r[31].p.v, r[32].p.v, r[33].p.v, r[34].p.v, r[35].p.v), this
                                                                            .feFuncA.setAttribute("tableValues", e))
            }
        }, SVGDropShadowEffect.prototype.renderFrame = function (t) {
            if (t || this.filterManager._mdf) {
                if ((t || this.filterManager.effectElements[4].p._mdf) && this.feGaussianBlur
                    .setAttribute("stdDeviation", this.filterManager.effectElements[4].p.v / 4), t ||
                    this.filterManager.effectElements[0].p._mdf) {
                    var e = this.filterManager.effectElements[0].p.v;
                    this.feFlood.setAttribute("flood-color", rgbToHex(Math.round(255 * e[0]), Math
                        .round(255 * e[1]), Math.round(255 * e[2])))
                }
                if ((t || this.filterManager.effectElements[1].p._mdf) && this.feFlood.setAttribute(
                    "flood-opacity", this.filterManager.effectElements[1].p.v / 255), t || this
                        .filterManager.effectElements[2].p._mdf || this.filterManager.effectElements[3].p
                        ._mdf) {
                    var r = this.filterManager.effectElements[3].p.v,
                        i = (this.filterManager.effectElements[2].p.v - 90) * degToRads,
                        s = r * Math.cos(i),
                        a = r * Math.sin(i);
                    this.feOffset.setAttribute("dx", s), this.feOffset.setAttribute("dy", a)
                }
            }
        };
    var _svgMatteSymbols = [];

    function SVGMatte3Effect(t, e, r) {
        this.initialized = !1, this.filterManager = e, this.filterElem = t, (this.elem = r)
            .matteElement = createNS("g"), r.matteElement.appendChild(r.layerElement), r.matteElement
                .appendChild(r.transformedElement), r.baseElement = r.matteElement
    }

    function SVGEffects(t) {
        var e, r, i = t.data.ef ? t.data.ef.length : 0,
            s = createElementID(),
            a = filtersFactory.createFilter(s),
            n = 0;
        for (this.filters = [], e = 0; e < i; e += 1) r = null, 20 === t.data.ef[e].ty ? (n += 1, r =
            new SVGTintFilter(a, t.effectsManager.effectElements[e])) : 21 === t.data.ef[e].ty ? (
                n += 1, r = new SVGFillFilter(a, t.effectsManager.effectElements[e])) : 22 === t.data
                    .ef[e].ty ? r = new SVGStrokeEffect(t, t.effectsManager.effectElements[e]) : 23 === t.data
                        .ef[e].ty ? (n += 1, r = new SVGTritoneFilter(a, t.effectsManager.effectElements[e])) :
            24 === t.data.ef[e].ty ? (n += 1, r = new SVGProLevelsFilter(a, t.effectsManager
                .effectElements[e])) : 25 === t.data.ef[e].ty ? (n += 1, r = new SVGDropShadowEffect(a,
                    t.effectsManager.effectElements[e])) : 28 === t.data.ef[e].ty ? r = new SVGMatte3Effect(
                        a, t.effectsManager.effectElements[e], t) : 29 === t.data.ef[e].ty && (n += 1, r =
                            new SVGGaussianBlurEffect(a, t.effectsManager.effectElements[e])), r && this.filters
                                .push(r);
        n && (t.globalData.defs.appendChild(a), t.layerElement.setAttribute("filter", "url(" +
            locationHref + "#" + s + ")")), this.filters.length && t.addRenderableComponent(this)
    }

    function CVContextData() {
        this.saved = [], this.cArrPos = 0, this.cTr = new Matrix, this.cO = 1;
        var t;
        for (this.savedOp = createTypedArray("float32", 15), t = 0; t < 15; t += 1) this.saved[t] =
            createTypedArray("float32", 16);
        this._length = 15
    }

    function CVBaseElement() { }

    function CVImageElement(t, e, r) {
        this.assetData = e.getAssetData(t.refId), this.img = e.imageLoader.getImage(this.assetData),
            this.initElement(t, e, r)
    }

    function CVCompElement(t, e, r) {
        this.completeLayers = !1, this.layers = t.layers, this.pendingElements = [], this.elements =
            createSizedArray(this.layers.length), this.initElement(t, e, r), this.tm = t.tm ?
                PropertyFactory.getProp(this, t.tm, 0, e.frameRate, this) : {
                    _placeholder: !0
                }
    }

    function CVMaskElement(t, e) {
        this.data = t, this.element = e, this.masksProperties = this.data.masksProperties || [], this
            .viewData = createSizedArray(this.masksProperties.length);
        var r, i = this.masksProperties.length,
            s = !1;
        for (r = 0; r < i; r++) "n" !== this.masksProperties[r].mode && (s = !0), this.viewData[r] =
            ShapePropertyFactory.getShapeProp(this.element, this.masksProperties[r], 3);
        (this.hasMasks = s) && this.element.addRenderableComponent(this)
    }

    function CVShapeElement(t, e, r) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.itemsData = [], this
            .prevViewData = [], this.shapeModifiers = [], this.processedElements = [], this
                .transformsManager = new ShapeTransformManager, this.initElement(t, e, r)
    }

    function CVSolidElement(t, e, r) {
        this.initElement(t, e, r)
    }

    function CVTextElement(t, e, r) {
        this.textSpans = [], this.yOffset = 0, this.fillColorAnim = !1, this.strokeColorAnim = !1, this
            .strokeWidthAnim = !1, this.stroke = !1, this.fill = !1, this.justifyOffset = 0, this
                .currentRender = null, this.renderType = "canvas", this.values = {
                    fill: "rgba(0,0,0,0)",
                    stroke: "rgba(0,0,0,0)",
                    sWidth: 0,
                    fValue: ""
                }, this.initElement(t, e, r)
    }

    function CVEffects() { }

    function HBaseElement(t, e, r) { }

    function HSolidElement(t, e, r) {
        this.initElement(t, e, r)
    }

    function HCompElement(t, e, r) {
        this.layers = t.layers, this.supports3d = !t.hasMask, this.completeLayers = !1, this
            .pendingElements = [], this.elements = this.layers ? createSizedArray(this.layers.length) :
                [], this.initElement(t, e, r), this.tm = t.tm ? PropertyFactory.getProp(this, t.tm, 0, e
                    .frameRate, this) : {
                    _placeholder: !0
                }
    }

    function HShapeElement(t, e, r) {
        this.shapes = [], this.shapesData = t.shapes, this.stylesList = [], this.shapeModifiers = [],
            this.itemsData = [], this.processedElements = [], this.animatedContents = [], this
                .shapesContainer = createNS("g"), this.initElement(t, e, r), this.prevViewData = [], this
                    .currentBBox = {
                x: 999999,
                y: -999999,
                h: 0,
                w: 0
            }
    }

    function HTextElement(t, e, r) {
        this.textSpans = [], this.textPaths = [], this.currentBBox = {
            x: 999999,
            y: -999999,
            h: 0,
            w: 0
        }, this.renderType = "svg", this.isMasked = !1, this.initElement(t, e, r)
    }

    function HImageElement(t, e, r) {
        this.assetData = e.getAssetData(t.refId), this.initElement(t, e, r)
    }

    function HCameraElement(t, e, r) {
        this.initFrame(), this.initBaseData(t, e, r), this.initHierarchy();
        var i = PropertyFactory.getProp;
        if (this.pe = i(this, t.pe, 0, 0, this), t.ks.p.s ? (this.px = i(this, t.ks.p.x, 1, 0, this),
            this.py = i(this, t.ks.p.y, 1, 0, this), this.pz = i(this, t.ks.p.z, 1, 0, this)) : this
                .p = i(this, t.ks.p, 1, 0, this), t.ks.a && (this.a = i(this, t.ks.a, 1, 0, this)), t.ks.or
                    .k.length && t.ks.or.k[0].to) {
            var s, a = t.ks.or.k.length;
            for (s = 0; s < a; s += 1) t.ks.or.k[s].to = null, t.ks.or.k[s].ti = null
        }
        this.or = i(this, t.ks.or, 1, degToRads, this), this.or.sh = !0, this.rx = i(this, t.ks.rx, 0,
            degToRads, this), this.ry = i(this, t.ks.ry, 0, degToRads, this), this.rz = i(this, t.ks
                .rz, 0, degToRads, this), this.mat = new Matrix, this._prevMat = new Matrix, this
                    ._isFirstFrame = !0, this.finalTransform = {
                        mProp: this
                    }
    }

    function HEffects() { }
    SVGMatte3Effect.prototype.findSymbol = function (t) {
        for (var e = 0, r = _svgMatteSymbols.length; e < r;) {
            if (_svgMatteSymbols[e] === t) return _svgMatteSymbols[e];
            e += 1
        }
        return null
    }, SVGMatte3Effect.prototype.replaceInParent = function (t, e) {
        var r = t.layerElement.parentNode;
        if (r) {
            for (var i, s = r.children, a = 0, n = s.length; a < n && s[a] !== t.layerElement;) a +=
                1;
            a <= n - 2 && (i = s[a + 1]);
            var o = createNS("use");
            o.setAttribute("href", "#" + e), i ? r.insertBefore(o, i) : r.appendChild(o)
        }
    }, SVGMatte3Effect.prototype.setElementAsMask = function (t, e) {
        if (!this.findSymbol(e)) {
            var r = createElementID(),
                i = createNS("mask");
            i.setAttribute("id", e.layerId), i.setAttribute("mask-type", "alpha"), _svgMatteSymbols
                .push(e);
            var s = t.globalData.defs;
            s.appendChild(i);
            var a = createNS("symbol");
            a.setAttribute("id", r), this.replaceInParent(e, r), a.appendChild(e.layerElement), s
                .appendChild(a);
            var n = createNS("use");
            n.setAttribute("href", "#" + r), i.appendChild(n), e.data.hd = !1, e.show()
        }
        t.setMatte(e.layerId)
    }, SVGMatte3Effect.prototype.initialize = function () {
        for (var t = this.filterManager.effectElements[0].p.v, e = this.elem.comp.elements, r = 0,
            i = e.length; r < i;) e[r] && e[r].data.ind === t && this.setElementAsMask(this
                .elem, e[r]), r += 1;
        this.initialized = !0
    }, SVGMatte3Effect.prototype.renderFrame = function () {
        this.initialized || this.initialize()
    }, SVGEffects.prototype.renderFrame = function (t) {
        var e, r = this.filters.length;
        for (e = 0; e < r; e += 1) this.filters[e].renderFrame(t)
    }, CVContextData.prototype.duplicate = function () {
        var t = 2 * this._length,
            e = this.savedOp;
        this.savedOp = createTypedArray("float32", t), this.savedOp.set(e);
        var r = 0;
        for (r = this._length; r < t; r += 1) this.saved[r] = createTypedArray("float32", 16);
        this._length = t
    }, CVContextData.prototype.reset = function () {
        this.cArrPos = 0, this.cTr.reset(), this.cO = 1
    }, CVBaseElement.prototype = {
        createElements: function () { },
        initRendererElement: function () { },
        createContainerElements: function () {
            this.canvasContext = this.globalData.canvasContext, this.renderableEffectsManager =
                new CVEffects(this)
        },
        createContent: function () { },
        setBlendMode: function () {
            var t = this.globalData;
            if (t.blendMode !== this.data.bm) {
                t.blendMode = this.data.bm;
                var e = getBlendMode(this.data.bm);
                t.canvasContext.globalCompositeOperation = e
            }
        },
        createRenderableComponents: function () {
            this.maskManager = new CVMaskElement(this.data, this)
        },
        hideElement: function () {
            this.hidden || this.isInRange && !this.isTransparent || (this.hidden = !0)
        },
        showElement: function () {
            this.isInRange && !this.isTransparent && (this.hidden = !1, this._isFirstFrame = !0,
                this.maskManager._isFirstFrame = !0)
        },
        renderFrame: function () {
            if (!this.hidden && !this.data.hd) {
                this.renderTransform(), this.renderRenderable(), this.setBlendMode();
                var t = 0 === this.data.ty;
                this.globalData.renderer.save(t), this.globalData.renderer.ctxTransform(this
                    .finalTransform.mat.props), this.globalData.renderer.ctxOpacity(this
                        .finalTransform.mProp.o.v), this.renderInnerContent(), this.globalData
                            .renderer.restore(t), this.maskManager.hasMasks && this.globalData.renderer
                                .restore(!0), this._isFirstFrame && (this._isFirstFrame = !1)
            }
        },
        destroy: function () {
            this.canvasContext = null, this.data = null, this.globalData = null, this
                .maskManager.destroy()
        },
        mHelper: new Matrix
    }, CVBaseElement.prototype.hide = CVBaseElement.prototype.hideElement, CVBaseElement.prototype
        .show = CVBaseElement.prototype.showElement, extendPrototype([BaseElement, TransformElement,
            CVBaseElement, HierarchyElement, FrameElement, RenderableElement
        ], CVImageElement), CVImageElement.prototype.initElement = SVGShapeElement.prototype
            .initElement, CVImageElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame,
        CVImageElement.prototype.createContent = function () {
            if (this.img.width && (this.assetData.w !== this.img.width || this.assetData.h !== this.img
                .height)) {
                var t = createTag("canvas");
                t.width = this.assetData.w, t.height = this.assetData.h;
                var e, r, i = t.getContext("2d"),
                    s = this.img.width,
                    a = this.img.height,
                    n = s / a,
                    o = this.assetData.w / this.assetData.h,
                    h = this.assetData.pr || this.globalData.renderConfig.imagePreserveAspectRatio;
                o < n && "xMidYMid slice" === h || n < o && "xMidYMid slice" !== h ? e = (r = a) * o :
                    r = (e = s) / o, i.drawImage(this.img, (s - e) / 2, (a - r) / 2, e, r, 0, 0, this
                        .assetData.w, this.assetData.h), this.img = t
            }
        }, CVImageElement.prototype.renderInnerContent = function (t) {
            this.canvasContext.drawImage(this.img, 0, 0)
        }, CVImageElement.prototype.destroy = function () {
            this.img = null
        }, extendPrototype([CanvasRenderer, ICompElement, CVBaseElement], CVCompElement), CVCompElement
            .prototype.renderInnerContent = function () {
                var t, e = this.canvasContext;
                for (e.beginPath(), e.moveTo(0, 0), e.lineTo(this.data.w, 0), e.lineTo(this.data.w, this
                    .data.h), e.lineTo(0, this.data.h), e.lineTo(0, 0), e.clip(), t = this.layers
                        .length - 1; 0 <= t; t -= 1)(this.completeLayers || this.elements[t]) && this.elements[
                            t].renderFrame()
            }, CVCompElement.prototype.destroy = function () {
                var t;
                for (t = this.layers.length - 1; 0 <= t; t -= 1) this.elements[t] && this.elements[t]
                    .destroy();
                this.layers = null, this.elements = null
            }, CVMaskElement.prototype.renderFrame = function () {
                if (this.hasMasks) {
                    var t, e, r, i, s = this.element.finalTransform.mat,
                        a = this.element.canvasContext,
                        n = this.masksProperties.length;
                    for (a.beginPath(), t = 0; t < n; t++)
                        if ("n" !== this.masksProperties[t].mode) {
                            this.masksProperties[t].inv && (a.moveTo(0, 0), a.lineTo(this.element.globalData
                                .compSize.w, 0), a.lineTo(this.element.globalData.compSize.w, this
                                    .element.globalData.compSize.h), a.lineTo(0, this.element.globalData
                                        .compSize.h), a.lineTo(0, 0)), i = this.viewData[t].v, e = s
                                            .applyToPointArray(i.v[0][0], i.v[0][1], 0), a.moveTo(e[0], e[1]);
                            var o, h = i._length;
                            for (o = 1; o < h; o++) r = s.applyToTriplePoints(i.o[o - 1], i.i[o], i.v[o]), a
                                .bezierCurveTo(r[0], r[1], r[2], r[3], r[4], r[5]);
                            r = s.applyToTriplePoints(i.o[o - 1], i.i[0], i.v[0]), a.bezierCurveTo(r[0], r[
                                1], r[2], r[3], r[4], r[5])
                        } this.element.globalData.renderer.save(!0), a.clip()
                }
            }, CVMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty,
        CVMaskElement.prototype.destroy = function () {
            this.element = null
        }, extendPrototype([BaseElement, TransformElement, CVBaseElement, IShapeElement,
            HierarchyElement, FrameElement, RenderableElement
        ], CVShapeElement), CVShapeElement.prototype.initElement = RenderableDOMElement.prototype
            .initElement, CVShapeElement.prototype.transformHelper = {
                opacity: 1,
                _opMdf: !1
            }, CVShapeElement.prototype.dashResetter = [], CVShapeElement.prototype.createContent =
        function () {
            this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, !0, [])
        }, CVShapeElement.prototype.createStyleElement = function (t, e) {
            var r = {
                data: t,
                type: t.ty,
                preTransforms: this.transformsManager.addTransformSequence(e),
                transforms: [],
                elements: [],
                closed: !0 === t.hd
            },
                i = {};
            if ("fl" == t.ty || "st" == t.ty ? (i.c = PropertyFactory.getProp(this, t.c, 1, 255, this),
                i.c.k || (r.co = "rgb(" + bm_floor(i.c.v[0]) + "," + bm_floor(i.c.v[1]) + "," +
                    bm_floor(i.c.v[2]) + ")")) : "gf" !== t.ty && "gs" !== t.ty || (i.s =
                        PropertyFactory.getProp(this, t.s, 1, null, this), i.e = PropertyFactory.getProp(
                            this, t.e, 1, null, this), i.h = PropertyFactory.getProp(this, t.h || {
                                k: 0
                            }, 0, .01, this), i.a = PropertyFactory.getProp(this, t.a || {
                                k: 0
                            }, 0, degToRads, this), i.g = new GradientProperty(this, t.g, this)), i.o =
                PropertyFactory.getProp(this, t.o, 0, .01, this), "st" == t.ty || "gs" == t.ty) {
                if (r.lc = this.lcEnum[t.lc] || "round", r.lj = this.ljEnum[t.lj] || "round", 1 == t
                    .lj && (r.ml = t.ml), i.w = PropertyFactory.getProp(this, t.w, 0, null, this), i.w
                        .k || (r.wi = i.w.v), t.d) {
                    var s = new DashProperty(this, t.d, "canvas", this);
                    i.d = s, i.d.k || (r.da = i.d.dashArray, r.do = i.d.dashoffset[0])
                }
            } else r.r = 2 === t.r ? "evenodd" : "nonzero";
            return this.stylesList.push(r), i.style = r, i
        }, CVShapeElement.prototype.createGroupElement = function (t) {
            return {
                it: [],
                prevViewData: []
            }
        }, CVShapeElement.prototype.createTransformElement = function (t) {
            return {
                transform: {
                    opacity: 1,
                    _opMdf: !1,
                    key: this.transformsManager.getNewKey(),
                    op: PropertyFactory.getProp(this, t.o, 0, .01, this),
                    mProps: TransformPropertyFactory.getTransformProperty(this, t, this)
                }
            }
        }, CVShapeElement.prototype.createShapeElement = function (t) {
            var e = new CVShapeData(this, t, this.stylesList, this.transformsManager);
            return this.shapes.push(e), this.addShapeToModifiers(e), e
        }, CVShapeElement.prototype.reloadShapes = function () {
            this._isFirstFrame = !0;
            var t, e = this.itemsData.length;
            for (t = 0; t < e; t += 1) this.prevViewData[t] = this.itemsData[t];
            for (this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, !0, []), e = this
                .dynamicProperties.length, t = 0; t < e; t += 1) this.dynamicProperties[t].getValue();
            this.renderModifiers(), this.transformsManager.processSequences(this._isFirstFrame)
        }, CVShapeElement.prototype.addTransformToStyleList = function (t) {
            var e, r = this.stylesList.length;
            for (e = 0; e < r; e += 1) this.stylesList[e].closed || this.stylesList[e].transforms.push(
                t)
        }, CVShapeElement.prototype.removeTransformFromStyleList = function () {
            var t, e = this.stylesList.length;
            for (t = 0; t < e; t += 1) this.stylesList[t].closed || this.stylesList[t].transforms.pop()
        }, CVShapeElement.prototype.closeStyles = function (t) {
            var e, r = t.length;
            for (e = 0; e < r; e += 1) t[e].closed = !0
        }, CVShapeElement.prototype.searchShapes = function (t, e, r, i, s) {
            var a, n, o, h, l, p, m = t.length - 1,
                f = [],
                c = [],
                d = [].concat(s);
            for (a = m; 0 <= a; a -= 1) {
                if ((h = this.searchProcessedElement(t[a])) ? e[a] = r[h - 1] : t[a]._shouldRender = i,
                    "fl" == t[a].ty || "st" == t[a].ty || "gf" == t[a].ty || "gs" == t[a].ty) h ? e[a]
                        .style.closed = !1 : e[a] = this.createStyleElement(t[a], d), f.push(e[a].style);
                else if ("gr" == t[a].ty) {
                    if (h)
                        for (o = e[a].it.length, n = 0; n < o; n += 1) e[a].prevViewData[n] = e[a].it[
                            n];
                    else e[a] = this.createGroupElement(t[a]);
                    this.searchShapes(t[a].it, e[a].it, e[a].prevViewData, i, d)
                } else "tr" == t[a].ty ? (h || (p = this.createTransformElement(t[a]), e[a] = p), d
                    .push(e[a]), this.addTransformToStyleList(e[a])) : "sh" == t[a].ty || "rc" == t[
                        a].ty || "el" == t[a].ty || "sr" == t[a].ty ? h || (e[a] = this
                            .createShapeElement(t[a])) : "tm" == t[a].ty || "rd" == t[a].ty ? (h ? (l = e[
                                a]).closed = !1 : ((l = ShapeModifiers.getModifier(t[a].ty)).init(this, t[
                                    a]), e[a] = l, this.shapeModifiers.push(l)), c.push(l)) : "rp" == t[a].ty && (
                                        h ? (l = e[a]).closed = !0 : (l = ShapeModifiers.getModifier(t[a].ty), (e[a] =
                                            l).init(this, t, a, e), this.shapeModifiers.push(l), i = !1), c.push(l));
                this.addProcessedElement(t[a], a + 1)
            }
            for (this.removeTransformFromStyleList(), this.closeStyles(f), m = c.length, a = 0; a <
                m; a += 1) c[a].closed = !0
        }, CVShapeElement.prototype.renderInnerContent = function () {
            this.transformHelper.opacity = 1, this.transformHelper._opMdf = !1, this.renderModifiers(),
                this.transformsManager.processSequences(this._isFirstFrame), this.renderShape(this
                    .transformHelper, this.shapesData, this.itemsData, !0)
        }, CVShapeElement.prototype.renderShapeTransform = function (t, e) {
            (t._opMdf || e.op._mdf || this._isFirstFrame) && (e.opacity = t.opacity, e.opacity *= e.op
                .v, e._opMdf = !0)
        }, CVShapeElement.prototype.drawLayer = function () {
            var t, e, r, i, s, a, n, o, h, l = this.stylesList.length,
                p = this.globalData.renderer,
                m = this.globalData.canvasContext;
            for (t = 0; t < l; t += 1)
                if (("st" !== (o = (h = this.stylesList[t]).type) && "gs" !== o || 0 !== h.wi) && h.data
                    ._shouldRender && 0 !== h.coOp && 0 !== this.globalData.currentGlobalAlpha) {
                    for (p.save(), a = h.elements, "st" === o || "gs" === o ? (m.strokeStyle = "st" ===
                        o ? h.co : h.grd, m.lineWidth = h.wi, m.lineCap = h.lc, m.lineJoin = h.lj, m
                            .miterLimit = h.ml || 0) : m.fillStyle = "fl" === o ? h.co : h.grd, p
                                .ctxOpacity(h.coOp), "st" !== o && "gs" !== o && m.beginPath(), p.ctxTransform(h
                                    .preTransforms.finalTransform.props), r = a.length, e = 0; e < r; e += 1) {
                        for ("st" !== o && "gs" !== o || (m.beginPath(), h.da && (m.setLineDash(h.da), m
                            .lineDashOffset = h.do)), s = (n = a[e].trNodes).length, i = 0; i <
                            s; i += 1) "m" == n[i].t ? m.moveTo(n[i].p[0], n[i].p[1]) : "c" == n[i].t ?
                                m.bezierCurveTo(n[i].pts[0], n[i].pts[1], n[i].pts[2], n[i].pts[3], n[i]
                                    .pts[4], n[i].pts[5]) : m.closePath();
                        "st" !== o && "gs" !== o || (m.stroke(), h.da && m.setLineDash(this
                            .dashResetter))
                    }
                    "st" !== o && "gs" !== o && m.fill(h.r), p.restore()
                }
        }, CVShapeElement.prototype.renderShape = function (t, e, r, i) {
            var s, a;
            for (a = t, s = e.length - 1; 0 <= s; s -= 1) "tr" == e[s].ty ? (a = r[s].transform, this
                .renderShapeTransform(t, a)) : "sh" == e[s].ty || "el" == e[s].ty || "rc" == e[s]
                    .ty || "sr" == e[s].ty ? this.renderPath(e[s], r[s]) : "fl" == e[s].ty ? this
                        .renderFill(e[s], r[s], a) : "st" == e[s].ty ? this.renderStroke(e[s], r[s], a) :
                "gf" == e[s].ty || "gs" == e[s].ty ? this.renderGradientFill(e[s], r[s], a) : "gr" == e[
                    s].ty ? this.renderShape(a, e[s].it, r[s].it) : e[s].ty;
            i && this.drawLayer()
        }, CVShapeElement.prototype.renderStyledShape = function (t, e) {
            if (this._isFirstFrame || e._mdf || t.transforms._mdf) {
                var r, i, s, a = t.trNodes,
                    n = e.paths,
                    o = n._length;
                a.length = 0;
                var h = t.transforms.finalTransform;
                for (s = 0; s < o; s += 1) {
                    var l = n.shapes[s];
                    if (l && l.v) {
                        for (i = l._length, r = 1; r < i; r += 1) 1 === r && a.push({
                            t: "m",
                            p: h.applyToPointArray(l.v[0][0], l.v[0][1], 0)
                        }), a.push({
                            t: "c",
                            pts: h.applyToTriplePoints(l.o[r - 1], l.i[r], l.v[r])
                        });
                        1 === i && a.push({
                            t: "m",
                            p: h.applyToPointArray(l.v[0][0], l.v[0][1], 0)
                        }), l.c && i && (a.push({
                            t: "c",
                            pts: h.applyToTriplePoints(l.o[r - 1], l.i[0], l.v[0])
                        }), a.push({
                            t: "z"
                        }))
                    }
                }
                t.trNodes = a
            }
        }, CVShapeElement.prototype.renderPath = function (t, e) {
            if (!0 !== t.hd && t._shouldRender) {
                var r, i = e.styledShapes.length;
                for (r = 0; r < i; r += 1) this.renderStyledShape(e.styledShapes[r], e.sh)
            }
        }, CVShapeElement.prototype.renderFill = function (t, e, r) {
            var i = e.style;
            (e.c._mdf || this._isFirstFrame) && (i.co = "rgb(" + bm_floor(e.c.v[0]) + "," + bm_floor(e.c
                .v[1]) + "," + bm_floor(e.c.v[2]) + ")"), (e.o._mdf || r._opMdf || this
                    ._isFirstFrame) && (i.coOp = e.o.v * r.opacity)
        }, CVShapeElement.prototype.renderGradientFill = function (t, e, r) {
            var i = e.style;
            if (!i.grd || e.g._mdf || e.s._mdf || e.e._mdf || 1 !== t.t && (e.h._mdf || e.a._mdf)) {
                var s = this.globalData.canvasContext,
                    a = e.s.v,
                    n = e.e.v;
                if (1 === t.t) f = s.createLinearGradient(a[0], a[1], n[0], n[1]);
                else var o = Math.sqrt(Math.pow(a[0] - n[0], 2) + Math.pow(a[1] - n[1], 2)),
                    h = Math.atan2(n[1] - a[1], n[0] - a[0]),
                    l = o * (1 <= e.h.v ? .99 : e.h.v <= -1 ? -.99 : e.h.v),
                    p = Math.cos(h + e.a.v) * l + a[0],
                    m = Math.sin(h + e.a.v) * l + a[1],
                    f = s.createRadialGradient(p, m, 0, a[0], a[1], o);
                var c, d = t.g.p,
                    u = e.g.c,
                    y = 1;
                for (c = 0; c < d; c += 1) e.g._hasOpacity && e.g._collapsable && (y = e.g.o[2 * c +
                    1]), f.addColorStop(u[4 * c] / 100, "rgba(" + u[4 * c + 1] + "," + u[4 * c +
                        2] +
                        "," + u[4 * c + 3] + "," + y + ")");
                i.grd = f
            }
            i.coOp = e.o.v * r.opacity
        }, CVShapeElement.prototype.renderStroke = function (t, e, r) {
            var i = e.style,
                s = e.d;
            s && (s._mdf || this._isFirstFrame) && (i.da = s.dashArray, i.do = s.dashoffset[0]), (e.c
                ._mdf || this._isFirstFrame) && (i.co = "rgb(" + bm_floor(e.c.v[0]) + "," +
                    bm_floor(e.c.v[1]) + "," + bm_floor(e.c.v[2]) + ")"), (e.o._mdf || r._opMdf || this
                        ._isFirstFrame) && (i.coOp = e.o.v * r.opacity), (e.w._mdf || this._isFirstFrame) &&
                (i.wi = e.w.v)
        }, CVShapeElement.prototype.destroy = function () {
            this.shapesData = null, this.globalData = null, this.canvasContext = null, this.stylesList
                .length = 0, this.itemsData.length = 0
        }, extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement,
            FrameElement, RenderableElement
        ], CVSolidElement), CVSolidElement.prototype.initElement = SVGShapeElement.prototype
            .initElement, CVSolidElement.prototype.prepareFrame = IImageElement.prototype.prepareFrame,
        CVSolidElement.prototype.renderInnerContent = function () {
            var t = this.canvasContext;
            t.fillStyle = this.data.sc, t.fillRect(0, 0, this.data.sw, this.data.sh)
        }, extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement,
            FrameElement, RenderableElement, ITextElement
        ], CVTextElement), CVTextElement.prototype.tHelper = createTag("canvas").getContext("2d"),
        CVTextElement.prototype.buildNewText = function () {
            var t = this.textProperty.currentData;
            this.renderedLetters = createSizedArray(t.l ? t.l.length : 0);
            var e = !1;
            t.fc ? (e = !0, this.values.fill = this.buildColor(t.fc)) : this.values.fill =
                "rgba(0,0,0,0)", this.fill = e;
            var r = !1;
            t.sc && (r = !0, this.values.stroke = this.buildColor(t.sc), this.values.sWidth = t.sw);
            var i, s, a = this.globalData.fontManager.getFontByName(t.f),
                n = t.l,
                o = this.mHelper;
            this.stroke = r, this.values.fValue = t.finalSize + "px " + this.globalData.fontManager
                .getFontByName(t.f).fFamily, s = t.finalText.length;
            var h, l, p, m, f, c, d, u, y, g, v = this.data.singleShape,
                b = t.tr / 1e3 * t.finalSize,
                E = 0,
                x = 0,
                P = !0,
                S = 0;
            for (i = 0; i < s; i += 1) {
                for (l = (h = this.globalData.fontManager.getCharData(t.finalText[i], a.fStyle, this
                    .globalData.fontManager.getFontByName(t.f).fFamily)) && h.data || {}, o.reset(),
                    v && n[i].n && (E = -b, x += t.yOffset, x += P ? 1 : 0, P = !1), d = (f = l.shapes ?
                        l.shapes[0].it : []).length, o.scale(t.finalSize / 100, t.finalSize / 100), v &&
                    this.applyTextPropertiesToMatrix(t, o, n[i].line, E, x), y = createSizedArray(d),
                    c = 0; c < d; c += 1) {
                    for (m = f[c].ks.k.i.length, u = f[c].ks.k, g = [], p = 1; p < m; p += 1) 1 == p &&
                        g.push(o.applyToX(u.v[0][0], u.v[0][1], 0), o.applyToY(u.v[0][0], u.v[0][1],
                            0)), g.push(o.applyToX(u.o[p - 1][0], u.o[p - 1][1], 0), o.applyToY(u.o[p -
                                1][
                                0
                            ], u.o[p - 1][1], 0), o.applyToX(u.i[p][0], u.i[p][1], 0), o.applyToY(u
                                .i[p][0], u.i[p][1], 0), o.applyToX(u.v[p][0], u.v[p][1], 0), o
                                    .applyToY(u.v[p][0], u.v[p][1], 0));
                    g.push(o.applyToX(u.o[p - 1][0], u.o[p - 1][1], 0), o.applyToY(u.o[p - 1][0], u.o[
                        p - 1][1], 0), o.applyToX(u.i[0][0], u.i[0][1], 0), o.applyToY(u.i[0][
                            0
                        ], u.i[0][1], 0), o.applyToX(u.v[0][0], u.v[0][1], 0), o.applyToY(u.v[
                            0][0], u.v[0][1], 0)), y[c] = g
                }
                v && (E += n[i].l, E += b), this.textSpans[S] ? this.textSpans[S].elem = y : this
                    .textSpans[S] = {
                    elem: y
                }, S += 1
            }
        }, CVTextElement.prototype.renderInnerContent = function () {
            var t, e, r, i, s, a, n = this.canvasContext;
            this.finalTransform.mat.props;
            n.font = this.values.fValue, n.lineCap = "butt", n.lineJoin = "miter", n.miterLimit = 4,
                this.data.singleShape || this.textAnimator.getMeasures(this.textProperty.currentData,
                    this.lettersChangedFlag);
            var o, h = this.textAnimator.renderedLetters,
                l = this.textProperty.currentData.l;
            e = l.length;
            var p, m, f = null,
                c = null,
                d = null;
            for (t = 0; t < e; t += 1)
                if (!l[t].n) {
                    if ((o = h[t]) && (this.globalData.renderer.save(), this.globalData.renderer
                        .ctxTransform(o.p), this.globalData.renderer.ctxOpacity(o.o)), this.fill) {
                        for (o && o.fc ? f !== o.fc && (f = o.fc, n.fillStyle = o.fc) : f !== this
                            .values.fill && (f = this.values.fill, n.fillStyle = this.values.fill), i =
                            (p = this.textSpans[t].elem).length, this.globalData.canvasContext
                                .beginPath(), r = 0; r < i; r += 1)
                            for (a = (m = p[r]).length, this.globalData.canvasContext.moveTo(m[0], m[
                                1]), s = 2; s < a; s += 6) this.globalData.canvasContext
                                    .bezierCurveTo(
                                        m[s], m[s + 1], m[s + 2], m[s + 3], m[s + 4], m[s + 5]);
                        this.globalData.canvasContext.closePath(), this.globalData.canvasContext.fill()
                    }
                    if (this.stroke) {
                        for (o && o.sw ? d !== o.sw && (d = o.sw, n.lineWidth = o.sw) : d !== this
                            .values.sWidth && (d = this.values.sWidth, n.lineWidth = this.values
                                .sWidth), o && o.sc ? c !== o.sc && (c = o.sc, n.strokeStyle = o.sc) :
                                c !==
                                this.values.stroke && (c = this.values.stroke, n.strokeStyle = this.values
                                    .stroke), i = (p = this.textSpans[t].elem).length, this.globalData
                                        .canvasContext.beginPath(), r = 0; r < i; r += 1)
                            for (a = (m = p[r]).length, this.globalData.canvasContext.moveTo(m[0], m[
                                1]), s = 2; s < a; s += 6) this.globalData.canvasContext
                                    .bezierCurveTo(
                                        m[s], m[s + 1], m[s + 2], m[s + 3], m[s + 4], m[s + 5]);
                        this.globalData.canvasContext.closePath(), this.globalData.canvasContext
                            .stroke()
                    }
                    o && this.globalData.renderer.restore()
                }
        }, CVEffects.prototype.renderFrame = function () { }, HBaseElement.prototype = {
            checkBlendMode: function () { },
            initRendererElement: function () {
                this.baseElement = createTag(this.data.tg || "div"), this.data.hasMask ? (this
                    .svgElement = createNS("svg"), this.layerElement = createNS("g"), this
                        .maskedElement = this.layerElement, this.svgElement.appendChild(this
                            .layerElement), this.baseElement.appendChild(this.svgElement)) : this
                                .layerElement = this.baseElement, styleDiv(this.baseElement)
            },
            createContainerElements: function () {
                this.renderableEffectsManager = new CVEffects(this), this.transformedElement = this
                    .baseElement, this.maskedElement = this.layerElement, this.data.ln && this
                        .layerElement.setAttribute("id", this.data.ln), this.data.cl && this
                            .layerElement.setAttribute("class", this.data.cl), 0 !== this.data.bm && this
                                .setBlendMode()
            },
            renderElement: function () {
                this.finalTransform._matMdf && (this.transformedElement.style.transform = this
                    .transformedElement.style.webkitTransform = this.finalTransform.mat.toCSS()
                ), this.finalTransform._opMdf && (this.transformedElement.style.opacity =
                    this.finalTransform.mProp.o.v)
            },
            renderFrame: function () {
                this.data.hd || this.hidden || (this.renderTransform(), this.renderRenderable(),
                    this.renderElement(), this.renderInnerContent(), this._isFirstFrame && (this
                        ._isFirstFrame = !1))
            },
            destroy: function () {
                this.layerElement = null, this.transformedElement = null, this.matteElement && (this
                    .matteElement = null), this.maskManager && (this.maskManager.destroy(), this
                        .maskManager = null)
            },
            createRenderableComponents: function () {
                this.maskManager = new MaskElement(this.data, this, this.globalData)
            },
            addEffects: function () { },
            setMatte: function () { }
        }, HBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement, HBaseElement
            .prototype.destroyBaseElement = HBaseElement.prototype.destroy, HBaseElement.prototype
                .buildElementParenting = HybridRenderer.prototype.buildElementParenting, extendPrototype([
                    BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement,
                    RenderableDOMElement
                ], HSolidElement), HSolidElement.prototype.createContent = function () {
                    var t;
                    this.data.hasMask ? ((t = createNS("rect")).setAttribute("width", this.data.sw), t
                        .setAttribute("height", this.data.sh), t.setAttribute("fill", this.data.sc), this
                            .svgElement.setAttribute("width", this.data.sw), this.svgElement.setAttribute(
                                "height", this.data.sh)) : ((t = createTag("div")).style.width = this.data.sw +
                                    "px", t.style.height = this.data.sh + "px", t.style.backgroundColor = this.data.sc),
                        this.layerElement.appendChild(t)
                }, extendPrototype([HybridRenderer, ICompElement, HBaseElement], HCompElement), HCompElement
                    .prototype._createBaseContainerElements = HCompElement.prototype.createContainerElements,
        HCompElement.prototype.createContainerElements = function () {
            this._createBaseContainerElements(), this.data.hasMask ? (this.svgElement.setAttribute(
                "width", this.data.w), this.svgElement.setAttribute("height", this.data.h), this
                    .transformedElement = this.baseElement) : this.transformedElement = this
                        .layerElement
        }, HCompElement.prototype.addTo3dContainer = function (t, e) {
            for (var r, i = 0; i < e;) this.elements[i] && this.elements[i].getBaseElement && (r = this
                .elements[i].getBaseElement()), i += 1;
            r ? this.layerElement.insertBefore(t, r) : this.layerElement.appendChild(t)
        }, extendPrototype([BaseElement, TransformElement, HSolidElement, SVGShapeElement, HBaseElement,
            HierarchyElement, FrameElement, RenderableElement
        ], HShapeElement), HShapeElement.prototype._renderShapeFrame = HShapeElement.prototype
            .renderInnerContent, HShapeElement.prototype.createContent = function () {
                var t;
                if (this.baseElement.style.fontSize = 0, this.data.hasMask) this.layerElement.appendChild(
                    this.shapesContainer), t = this.svgElement;
                else {
                    t = createNS("svg");
                    var e = this.comp.data ? this.comp.data : this.globalData.compSize;
                    t.setAttribute("width", e.w), t.setAttribute("height", e.h), t.appendChild(this
                        .shapesContainer), this.layerElement.appendChild(t)
                }
                this.searchShapes(this.shapesData, this.itemsData, this.prevViewData, this.shapesContainer,
                    0, [], !0), this.filterUniqueShapes(), this.shapeCont = t
            }, HShapeElement.prototype.getTransformedPoint = function (t, e) {
                var r, i = t.length;
                for (r = 0; r < i; r += 1) e = t[r].mProps.v.applyToPointArray(e[0], e[1], 0);
                return e
            }, HShapeElement.prototype.calculateShapeBoundingBox = function (t, e) {
                var r, i, s, a, n, o = t.sh.v,
                    h = t.transformers,
                    l = o._length;
                if (!(l <= 1)) {
                    for (r = 0; r < l - 1; r += 1) i = this.getTransformedPoint(h, o.v[r]), s = this
                        .getTransformedPoint(h, o.o[r]), a = this.getTransformedPoint(h, o.i[r + 1]), n =
                        this.getTransformedPoint(h, o.v[r + 1]), this.checkBounds(i, s, a, n, e);
                    o.c && (i = this.getTransformedPoint(h, o.v[r]), s = this.getTransformedPoint(h, o.o[
                        r]), a = this.getTransformedPoint(h, o.i[0]), n = this.getTransformedPoint(
                            h, o
                                .v[0]), this.checkBounds(i, s, a, n, e))
                }
            }, HShapeElement.prototype.checkBounds = function (t, e, r, i, s) {
                this.getBoundsOfCurve(t, e, r, i);
                var a = this.shapeBoundingBox;
                s.x = bm_min(a.left, s.x), s.xMax = bm_max(a.right, s.xMax), s.y = bm_min(a.top, s.y), s
                    .yMax = bm_max(a.bottom, s.yMax)
            }, HShapeElement.prototype.shapeBoundingBox = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }, HShapeElement.prototype.tempBoundingBox = {
                x: 0,
                xMax: 0,
                y: 0,
                yMax: 0,
                width: 0,
                height: 0
            }, HShapeElement.prototype.getBoundsOfCurve = function (t, e, r, i) {
                for (var s, a, n, o, h, l, p, m = [
                    [t[0], i[0]],
                    [t[1], i[1]]
                ], f = 0; f < 2; ++f)
                    if (a = 6 * t[f] - 12 * e[f] + 6 * r[f], s = -3 * t[f] + 9 * e[f] - 9 * r[f] + 3 * i[f],
                        n = 3 * e[f] - 3 * t[f], a |= 0, n |= 0, 0 !== (s |= 0)) (h = a * a - 4 * n * s) <
                            0 || (0 < (l = (-a + bm_sqrt(h)) / (2 * s)) && l < 1 && m[f].push(this.calculateF(l,
                                t, e, r, i, f)), 0 < (p = (-a - bm_sqrt(h)) / (2 * s)) && p < 1 && m[f]
                                    .push(this.calculateF(p, t, e, r, i, f)));
                    else {
                        if (0 === a) continue;
                        0 < (o = -n / a) && o < 1 && m[f].push(this.calculateF(o, t, e, r, i, f))
                    } this.shapeBoundingBox.left = bm_min.apply(null, m[0]), this.shapeBoundingBox.top =
                        bm_min.apply(null, m[1]), this.shapeBoundingBox.right = bm_max.apply(null, m[0]), this
                            .shapeBoundingBox.bottom = bm_max.apply(null, m[1])
            }, HShapeElement.prototype.calculateF = function (t, e, r, i, s, a) {
                return bm_pow(1 - t, 3) * e[a] + 3 * bm_pow(1 - t, 2) * t * r[a] + 3 * (1 - t) * bm_pow(t,
                    2) * i[a] + bm_pow(t, 3) * s[a]
            }, HShapeElement.prototype.calculateBoundingBox = function (t, e) {
                var r, i = t.length;
                for (r = 0; r < i; r += 1) t[r] && t[r].sh ? this.calculateShapeBoundingBox(t[r], e) : t[
                    r] && t[r].it && this.calculateBoundingBox(t[r].it, e)
            }, HShapeElement.prototype.currentBoxContains = function (t) {
                return this.currentBBox.x <= t.x && this.currentBBox.y <= t.y && this.currentBBox.width +
                    this.currentBBox.x >= t.x + t.width && this.currentBBox.height + this.currentBBox.y >= t
                        .y + t.height
            }, HShapeElement.prototype.renderInnerContent = function () {
                if (this._renderShapeFrame(), !this.hidden && (this._isFirstFrame || this._mdf)) {
                    var t = this.tempBoundingBox,
                        e = 999999;
                    if (t.x = e, t.xMax = -e, t.y = e, t.yMax = -e, this.calculateBoundingBox(this
                        .itemsData, t), t.width = t.xMax < t.x ? 0 : t.xMax - t.x, t.height = t.yMax < t
                            .y ? 0 : t.yMax - t.y, this.currentBoxContains(t)) return;
                    var r = !1;
                    this.currentBBox.w !== t.width && (this.currentBBox.w = t.width, this.shapeCont
                        .setAttribute("width", t.width), r = !0), this.currentBBox.h !== t.height && (
                            this.currentBBox.h = t.height, this.shapeCont.setAttribute("height", t.height),
                            r = !0), (r || this.currentBBox.x !== t.x || this.currentBBox.y !== t.y) && (
                                this.currentBBox.w = t.width, this.currentBBox.h = t.height, this.currentBBox
                                    .x = t.x, this.currentBBox.y = t.y, this.shapeCont.setAttribute("viewBox", this
                                        .currentBBox.x + " " + this.currentBBox.y + " " + this.currentBBox.w + " " +
                                        this.currentBBox.h), this.shapeCont.style.transform = this.shapeCont.style
                                            .webkitTransform = "translate(" + this.currentBBox.x + "px," + this.currentBBox
                                                .y + "px)")
                }
            }, extendPrototype([BaseElement, TransformElement, HBaseElement, HierarchyElement, FrameElement,
                RenderableDOMElement, ITextElement
            ], HTextElement), HTextElement.prototype.createContent = function () {
                if (this.isMasked = this.checkMasks(), this.isMasked) {
                    this.renderType = "svg", this.compW = this.comp.data.w, this.compH = this.comp.data.h,
                        this.svgElement.setAttribute("width", this.compW), this.svgElement.setAttribute(
                            "height", this.compH);
                    var t = createNS("g");
                    this.maskedElement.appendChild(t), this.innerElem = t
                } else this.renderType = "html", this.innerElem = this.layerElement;
                this.checkParenting()
            }, HTextElement.prototype.buildNewText = function () {
                var t = this.textProperty.currentData;
                this.renderedLetters = createSizedArray(t.l ? t.l.length : 0);
                var e = this.innerElem.style;
                e.color = e.fill = t.fc ? this.buildColor(t.fc) : "rgba(0,0,0,0)", t.sc && (e.stroke = this
                    .buildColor(t.sc), e.strokeWidth = t.sw + "px");
                var r, i, s = this.globalData.fontManager.getFontByName(t.f);
                if (!this.globalData.fontManager.chars)
                    if (e.fontSize = t.finalSize + "px", e.lineHeight = t.finalSize + "px", s.fClass) this
                        .innerElem.className = s.fClass;
                    else {
                        e.fontFamily = s.fFamily;
                        var a = t.fWeight,
                            n = t.fStyle;
                        e.fontStyle = n, e.fontWeight = a
                    } var o, h, l, p = t.l;
                i = p.length;
                var m, f = this.mHelper,
                    c = "",
                    d = 0;
                for (r = 0; r < i; r += 1) {
                    if (this.globalData.fontManager.chars ? (this.textPaths[d] ? o = this.textPaths[d] : ((
                        o = createNS("path")).setAttribute("stroke-linecap", "butt"), o
                            .setAttribute("stroke-linejoin", "round"), o.setAttribute(
                                "stroke-miterlimit", "4")), this.isMasked || (this.textSpans[d] ? l = (
                                    h = this.textSpans[d]).children[0] : ((h = createTag("div")).style
                                        .lineHeight = 0, (l = createNS("svg")).appendChild(o), styleDiv(h)))) : this
                                            .isMasked ? o = this.textPaths[d] ? this.textPaths[d] : createNS("text") : this
                                                .textSpans[d] ? (h = this.textSpans[d], o = this.textPaths[d]) : (styleDiv(h =
                                                    createTag("span")), styleDiv(o = createTag("span")), h.appendChild(o)), this
                                                        .globalData.fontManager.chars) {
                        var u, y = this.globalData.fontManager.getCharData(t.finalText[r], s.fStyle, this
                            .globalData.fontManager.getFontByName(t.f).fFamily);
                        if (u = y ? y.data : null, f.reset(), u && u.shapes && (m = u.shapes[0].it, f.scale(
                            t.finalSize / 100, t.finalSize / 100), c = this.createPathShape(f, m), o
                                .setAttribute("d", c)), this.isMasked) this.innerElem.appendChild(o);
                        else {
                            if (this.innerElem.appendChild(h), u && u.shapes) {
                                document.body.appendChild(l);
                                var g = l.getBBox();
                                l.setAttribute("width", g.width + 2), l.setAttribute("height", g.height +
                                    2), l.setAttribute("viewBox", g.x - 1 + " " + (g.y - 1) + " " + (g
                                        .width + 2) + " " + (g.height + 2)), l.style.transform = l.style
                                            .webkitTransform = "translate(" + (g.x - 1) + "px," + (g.y - 1) + "px)",
                                    p[r].yOffset = g.y - 1
                            } else l.setAttribute("width", 1), l.setAttribute("height", 1);
                            h.appendChild(l)
                        }
                    } else o.textContent = p[r].val, o.setAttributeNS(
                        "http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"), this
                            .isMasked ? this.innerElem.appendChild(o) : (this.innerElem.appendChild(h), o.style
                                .transform = o.style.webkitTransform = "translate3d(0," + -t.finalSize / 1.2 +
                                "px,0)");
                    this.isMasked ? this.textSpans[d] = o : this.textSpans[d] = h, this.textSpans[d].style
                        .display = "block", this.textPaths[d] = o, d += 1
                }
                for (; d < this.textSpans.length;) this.textSpans[d].style.display = "none", d += 1
            }, HTextElement.prototype.renderInnerContent = function () {
                if (this.data.singleShape) {
                    if (!this._isFirstFrame && !this.lettersChangedFlag) return;
                    this.isMasked && this.finalTransform._matMdf && (this.svgElement.setAttribute("viewBox",
                        -this.finalTransform.mProp.p.v[0] + " " + -this.finalTransform.mProp.p.v[
                        1] + " " + this.compW + " " + this.compH), this.svgElement.style
                            .transform =
                        this.svgElement.style.webkitTransform = "translate(" + -this.finalTransform
                            .mProp.p.v[0] + "px," + -this.finalTransform.mProp.p.v[1] + "px)")
                }
                if (this.textAnimator.getMeasures(this.textProperty.currentData, this.lettersChangedFlag),
                    this.lettersChangedFlag || this.textAnimator.lettersChangedFlag) {
                    var t, e, r, i, s, a = 0,
                        n = this.textAnimator.renderedLetters,
                        o = this.textProperty.currentData.l;
                    for (e = o.length, t = 0; t < e; t += 1) o[t].n ? a += 1 : (i = this.textSpans[t], s =
                        this.textPaths[t], r = n[a], a += 1, r._mdf.m && (this.isMasked ? i
                            .setAttribute("transform", r.m) : i.style.transform = i.style
                                .webkitTransform = r.m), i.style.opacity = r.o, r.sw && r._mdf.sw && s
                                    .setAttribute("stroke-width", r.sw), r.sc && r._mdf.sc && s.setAttribute(
                                        "stroke", r.sc), r.fc && r._mdf.fc && (s.setAttribute("fill", r.fc), s.style
                                            .color = r.fc));
                    if (this.innerElem.getBBox && !this.hidden && (this._isFirstFrame || this._mdf)) {
                        var h = this.innerElem.getBBox();
                        this.currentBBox.w !== h.width && (this.currentBBox.w = h.width, this.svgElement
                            .setAttribute("width", h.width)), this.currentBBox.h !== h.height && (this
                                .currentBBox.h = h.height, this.svgElement.setAttribute("height", h.height));
                        this.currentBBox.w === h.width + 2 && this.currentBBox.h === h.height + 2 && this
                            .currentBBox.x === h.x - 1 && this.currentBBox.y === h.y - 1 || (this
                                .currentBBox.w = h.width + 2, this.currentBBox.h = h.height + 2, this
                                    .currentBBox.x = h.x - 1, this.currentBBox.y = h.y - 1, this.svgElement
                                        .setAttribute("viewBox", this.currentBBox.x + " " + this.currentBBox.y +
                                            " " + this.currentBBox.w + " " + this.currentBBox.h), this.svgElement
                                                .style.transform = this.svgElement.style.webkitTransform = "translate(" +
                                                this.currentBBox.x + "px," + this.currentBBox.y + "px)")
                    }
                }
            }, extendPrototype([BaseElement, TransformElement, HBaseElement, HSolidElement,
                HierarchyElement, FrameElement, RenderableElement
            ], HImageElement), HImageElement.prototype.createContent = function () {
                var t = this.globalData.getAssetsPath(this.assetData),
                    e = new Image;
                this.data.hasMask ? (this.imageElem = createNS("image"), this.imageElem.setAttribute(
                    "width", this.assetData.w + "px"), this.imageElem.setAttribute("height", this
                        .assetData.h + "px"), this.imageElem.setAttributeNS(
                            "http://www.w3.org/1999/xlink", "href", t), this.layerElement.appendChild(this
                                .imageElem), this.baseElement.setAttribute("width", this.assetData.w), this
                                    .baseElement.setAttribute("height", this.assetData.h)) : this.layerElement
                                        .appendChild(e), e.src = t, this.data.ln && this.baseElement.setAttribute("id", this
                                            .data.ln)
            }, extendPrototype([BaseElement, FrameElement, HierarchyElement], HCameraElement),
        HCameraElement.prototype.setup = function () {
            var t, e, r = this.comp.threeDElements.length;
            for (t = 0; t < r; t += 1) "3d" === (e = this.comp.threeDElements[t]).type && (e
                .perspectiveElem.style.perspective = e.perspectiveElem.style.webkitPerspective =
                this.pe.v + "px", e.container.style.transformOrigin = e.container.style
                    .mozTransformOrigin = e.container.style.webkitTransformOrigin = "0px 0px 0px", e
                        .perspectiveElem.style.transform = e.perspectiveElem.style.webkitTransform =
                "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)")
        }, HCameraElement.prototype.createElements = function () { }, HCameraElement.prototype.hide =
        function () { }, HCameraElement.prototype.renderFrame = function () {
            var t, e, r = this._isFirstFrame;
            if (this.hierarchy)
                for (e = this.hierarchy.length, t = 0; t < e; t += 1) r = this.hierarchy[t]
                    .finalTransform.mProp._mdf || r;
            if (r || this.pe._mdf || this.p && this.p._mdf || this.px && (this.px._mdf || this.py
                ._mdf || this.pz._mdf) || this.rx._mdf || this.ry._mdf || this.rz._mdf || this.or
                    ._mdf || this.a && this.a._mdf) {
                if (this.mat.reset(), this.hierarchy)
                    for (t = e = this.hierarchy.length - 1; 0 <= t; t -= 1) {
                        var i = this.hierarchy[t].finalTransform.mProp;
                        this.mat.translate(-i.p.v[0], -i.p.v[1], i.p.v[2]), this.mat.rotateX(-i.or.v[0])
                            .rotateY(-i.or.v[1]).rotateZ(i.or.v[2]), this.mat.rotateX(-i.rx.v).rotateY(-
                                i.ry.v).rotateZ(i.rz.v), this.mat.scale(1 / i.s.v[0], 1 / i.s.v[1], 1 /
                                    i.s.v[2]), this.mat.translate(i.a.v[0], i.a.v[1], i.a.v[2])
                    }
                if (this.p ? this.mat.translate(-this.p.v[0], -this.p.v[1], this.p.v[2]) : this.mat
                    .translate(-this.px.v, -this.py.v, this.pz.v), this.a) {
                    var s;
                    s = this.p ? [this.p.v[0] - this.a.v[0], this.p.v[1] - this.a.v[1], this.p.v[2] -
                        this.a.v[2]
                    ] : [this.px.v - this.a.v[0], this.py.v - this.a.v[1], this.pz.v - this.a.v[2]];
                    var a = Math.sqrt(Math.pow(s[0], 2) + Math.pow(s[1], 2) + Math.pow(s[2], 2)),
                        n = [s[0] / a, s[1] / a, s[2] / a],
                        o = Math.sqrt(n[2] * n[2] + n[0] * n[0]),
                        h = Math.atan2(n[1], o),
                        l = Math.atan2(n[0], -n[2]);
                    this.mat.rotateY(l).rotateX(-h)
                }
                this.mat.rotateX(-this.rx.v).rotateY(-this.ry.v).rotateZ(this.rz.v), this.mat.rotateX(-
                    this.or.v[0]).rotateY(-this.or.v[1]).rotateZ(this.or.v[2]), this.mat.translate(
                        this.globalData.compSize.w / 2, this.globalData.compSize.h / 2, 0), this.mat
                            .translate(0, 0, this.pe.v);
                var p = !this._prevMat.equals(this.mat);
                if ((p || this.pe._mdf) && this.comp.threeDElements) {
                    var m;
                    for (e = this.comp.threeDElements.length, t = 0; t < e; t += 1) "3d" === (m = this
                        .comp.threeDElements[t]).type && (p && (m.container.style.transform = m
                            .container.style.webkitTransform = this.mat.toCSS()), this.pe._mdf && (m
                                .perspectiveElem.style.perspective = m.perspectiveElem.style
                                    .webkitPerspective = this.pe.v + "px"));
                    this.mat.clone(this._prevMat)
                }
            }
            this._isFirstFrame = !1
        }, HCameraElement.prototype.prepareFrame = function (t) {
            this.prepareProperties(t, !0)
        }, HCameraElement.prototype.destroy = function () { }, HCameraElement.prototype.getBaseElement =
        function () {
            return null
        }, HEffects.prototype.renderFrame = function () { };
    var animationManager = function () {
        var t = {},
            s = [],
            i = 0,
            a = 0,
            n = 0,
            o = !0,
            h = !1;

        function r(t) {
            for (var e = 0, r = t.target; e < a;) s[e].animation === r && (s.splice(e, 1), e -= 1,
                a -= 1, r.isPaused || m()), e += 1
        }

        function l(t, e) {
            if (!t) return null;
            for (var r = 0; r < a;) {
                if (s[r].elem == t && null !== s[r].elem) return s[r].animation;
                r += 1
            }
            var i = new AnimationItem;
            return f(i, t), i.setData(t, e), i
        }

        function p() {
            n += 1, d()
        }

        function m() {
            n -= 1
        }

        function f(t, e) {
            t.addEventListener("destroy", r), t.addEventListener("_active", p), t.addEventListener(
                "_idle", m), s.push({
                    elem: e,
                    animation: t
                }), a += 1
        }

        function c(t) {
            var e, r = t - i;
            for (e = 0; e < a; e += 1) s[e].animation.advanceTime(r);
            i = t, n && !h ? window.requestAnimationFrame(c) : o = !0
        }

        function e(t) {
            i = t, window.requestAnimationFrame(c)
        }

        function d() {
            !h && n && o && (window.requestAnimationFrame(e), o = !1)
        }
        return t.registerAnimation = l, t.loadAnimation = function (t) {
            var e = new AnimationItem;
            return f(e, null), e.setParams(t), e
        }, t.setSpeed = function (t, e) {
            var r;
            for (r = 0; r < a; r += 1) s[r].animation.setSpeed(t, e)
        }, t.setDirection = function (t, e) {
            var r;
            for (r = 0; r < a; r += 1) s[r].animation.setDirection(t, e)
        }, t.play = function (t) {
            var e;
            for (e = 0; e < a; e += 1) s[e].animation.play(t)
        }, t.pause = function (t) {
            var e;
            for (e = 0; e < a; e += 1) s[e].animation.pause(t)
        }, t.stop = function (t) {
            var e;
            for (e = 0; e < a; e += 1) s[e].animation.stop(t)
        }, t.togglePause = function (t) {
            var e;
            for (e = 0; e < a; e += 1) s[e].animation.togglePause(t)
        }, t.searchAnimations = function (t, e, r) {
            var i, s = [].concat([].slice.call(document.getElementsByClassName("lottie")), []
                .slice.call(document.getElementsByClassName("bodymovin"))),
                a = s.length;
            for (i = 0; i < a; i += 1) r && s[i].setAttribute("data-bm-type", r), l(s[i], t);
            if (e && 0 === a) {
                r || (r = "svg");
                var n = document.getElementsByTagName("body")[0];
                n.innerHTML = "";
                var o = createTag("div");
                o.style.width = "100%", o.style.height = "100%", o.setAttribute("data-bm-type",
                    r), n.appendChild(o), l(o, t)
            }
        }, t.resize = function () {
            var t;
            for (t = 0; t < a; t += 1) s[t].animation.resize()
        }, t.goToAndStop = function (t, e, r) {
            var i;
            for (i = 0; i < a; i += 1) s[i].animation.goToAndStop(t, e, r)
        }, t.destroy = function (t) {
            var e;
            for (e = a - 1; 0 <= e; e -= 1) s[e].animation.destroy(t)
        }, t.freeze = function () {
            h = !0
        }, t.unfreeze = function () {
            h = !1, d()
        }, t.getRegisteredAnimations = function () {
            var t, e = s.length,
                r = [];
            for (t = 0; t < e; t += 1) r.push(s[t].animation);
            return r
        }, t
    }(),
        AnimationItem = function () {
            this._cbs = [], this.name = "", this.path = "", this.isLoaded = !1, this.currentFrame = 0,
                this.currentRawFrame = 0, this.totalFrames = 0, this.frameRate = 0, this.frameMult = 0,
                this.playSpeed = 1, this.playDirection = 1, this.playCount = 0, this.animationData = {},
                this.assets = [], this.isPaused = !0, this.autoplay = !1, this.loop = !0, this
                    .renderer = null, this.animationID = createElementID(), this.assetsPath = "", this
                        .timeCompleted = 0, this.segmentPos = 0, this.subframeEnabled = subframeEnabled, this
                            .segments = [], this._idle = !0, this._completedLoop = !1, this.projectInterface =
                ProjectInterface(), this.imagePreloader = new ImagePreloader
        };
    extendPrototype([BaseEvent], AnimationItem), AnimationItem.prototype.setParams = function (t) {
        t.context && (this.context = t.context), (t.wrapper || t.container) && (this.wrapper = t
            .wrapper || t.container);
        var e = t.animType ? t.animType : t.renderer ? t.renderer : "svg";
        switch (e) {
            case "canvas":
                this.renderer = new CanvasRenderer(this, t.rendererSettings);
                break;
            case "svg":
                this.renderer = new SVGRenderer(this, t.rendererSettings);
                break;
            default:
                this.renderer = new HybridRenderer(this, t.rendererSettings)
        }
        this.renderer.setProjectInterface(this.projectInterface), this.animType = e, "" === t
            .loop || null === t.loop || (!1 === t.loop ? this.loop = !1 : !0 === t.loop ? this
                .loop = !0 : this.loop = parseInt(t.loop)), this.autoplay = !("autoplay" in t) || t
                    .autoplay, this.name = t.name ? t.name : "", this.autoloadSegments = !t.hasOwnProperty(
                        "autoloadSegments") || t.autoloadSegments, this.assetsPath = t.assetsPath, t
                            .animationData ? this.configAnimation(t.animationData) : t.path && (-1 !== t.path
                                .lastIndexOf("\\") ? this.path = t.path.substr(0, t.path.lastIndexOf("\\") + 1) :
                                this.path = t.path.substr(0, t.path.lastIndexOf("/") + 1), this.fileName = t.path
                                    .substr(t.path.lastIndexOf("/") + 1), this.fileName = this.fileName.substr(0, this
                                        .fileName.lastIndexOf(".json")), assetLoader.load(t.path, this.configAnimation
                                            .bind(this),
                                            function () {
                                                this.trigger("data_failed")
                                            }.bind(this)))
    }, AnimationItem.prototype.setData = function (t, e) {
        var r = {
            wrapper: t,
            animationData: e ? "object" == typeof e ? e : JSON.parse(e) : null
        },
            i = t.attributes;
        r.path = i.getNamedItem("data-animation-path") ? i.getNamedItem("data-animation-path")
            .value : i.getNamedItem("data-bm-path") ? i.getNamedItem("data-bm-path").value : i
                .getNamedItem("bm-path") ? i.getNamedItem("bm-path").value : "", r.animType = i
                    .getNamedItem("data-anim-type") ? i.getNamedItem("data-anim-type").value : i
                        .getNamedItem("data-bm-type") ? i.getNamedItem("data-bm-type").value : i.getNamedItem(
                            "bm-type") ? i.getNamedItem("bm-type").value : i.getNamedItem("data-bm-renderer") ?
                    i.getNamedItem("data-bm-renderer").value : i.getNamedItem("bm-renderer") ? i
                        .getNamedItem("bm-renderer").value : "canvas";
        var s = i.getNamedItem("data-anim-loop") ? i.getNamedItem("data-anim-loop").value : i
            .getNamedItem("data-bm-loop") ? i.getNamedItem("data-bm-loop").value : i.getNamedItem(
                "bm-loop") ? i.getNamedItem("bm-loop").value : "";
        "" === s || (r.loop = "false" !== s && ("true" === s || parseInt(s)));
        var a = i.getNamedItem("data-anim-autoplay") ? i.getNamedItem("data-anim-autoplay").value :
            i.getNamedItem("data-bm-autoplay") ? i.getNamedItem("data-bm-autoplay").value : !i
                .getNamedItem("bm-autoplay") || i.getNamedItem("bm-autoplay").value;
        r.autoplay = "false" !== a, r.name = i.getNamedItem("data-name") ? i.getNamedItem(
            "data-name").value : i.getNamedItem("data-bm-name") ? i.getNamedItem("data-bm-name")
                .value : i.getNamedItem("bm-name") ? i.getNamedItem("bm-name").value : "", "false" === (
                    i.getNamedItem("data-anim-prerender") ? i.getNamedItem("data-anim-prerender")
                        .value : i.getNamedItem("data-bm-prerender") ? i.getNamedItem("data-bm-prerender")
                            .value : i.getNamedItem("bm-prerender") ? i.getNamedItem("bm-prerender").value : ""
                ) && (r.prerender = !1), this.setParams(r)
    }, AnimationItem.prototype.includeLayers = function (t) {
        t.op > this.animationData.op && (this.animationData.op = t.op, this.totalFrames = Math
            .floor(t.op - this.animationData.ip));
        var e, r, i = this.animationData.layers,
            s = i.length,
            a = t.layers,
            n = a.length;
        for (r = 0; r < n; r += 1)
            for (e = 0; e < s;) {
                if (i[e].id == a[r].id) {
                    i[e] = a[r];
                    break
                }
                e += 1
            }
        if ((t.chars || t.fonts) && (this.renderer.globalData.fontManager.addChars(t.chars), this
            .renderer.globalData.fontManager.addFonts(t.fonts, this.renderer.globalData.defs)),
            t.assets)
            for (s = t.assets.length, e = 0; e < s; e += 1) this.animationData.assets.push(t.assets[
                e]);
        this.animationData.__complete = !1, dataManager.completeData(this.animationData, this
            .renderer.globalData.fontManager), this.renderer.includeLayers(t.layers),
            expressionsPlugin && expressionsPlugin.initExpressions(this), this.loadNextSegment()
    }, AnimationItem.prototype.loadNextSegment = function () {
        var t = this.animationData.segments;
        if (!t || 0 === t.length || !this.autoloadSegments) return this.trigger("data_ready"), void (
            this.timeCompleted = this.totalFrames);
        var e = t.shift();
        this.timeCompleted = e.time * this.frameRate;
        var r = this.path + this.fileName + "_" + this.segmentPos + ".json";
        this.segmentPos += 1, assetLoader.load(r, this.includeLayers.bind(this), function () {
            this.trigger("data_failed")
        }.bind(this))
    }, AnimationItem.prototype.loadSegments = function () {
        this.animationData.segments || (this.timeCompleted = this.totalFrames), this
            .loadNextSegment()
    }, AnimationItem.prototype.imagesLoaded = function () {
        this.trigger("loaded_images"), this.checkLoaded()
    }, AnimationItem.prototype.preloadImages = function () {
        this.imagePreloader.setAssetsPath(this.assetsPath), this.imagePreloader.setPath(this.path),
            this.imagePreloader.loadAssets(this.animationData.assets, this.imagesLoaded.bind(this))
    }, AnimationItem.prototype.configAnimation = function (t) {
        if (this.renderer) try {
            this.animationData = t, this.totalFrames = Math.floor(this.animationData.op - this
                .animationData.ip), this.renderer.configAnimation(t), t.assets || (t
                    .assets = []), this.assets = this.animationData.assets, this.frameRate =
                this.animationData.fr, this.firstFrame = Math.round(this.animationData.ip), this
                    .frameMult = this.animationData.fr / 1e3, this.renderer.searchExtraCompositions(
                        t.assets), this.trigger("config_ready"), this.preloadImages(), this
                            .loadSegments(), this.updaFrameModifier(), this.waitForFontsLoaded()
        } catch (t) {
            this.triggerConfigError(t)
        }
    }, AnimationItem.prototype.waitForFontsLoaded = function () {
        this.renderer && (this.renderer.globalData.fontManager.loaded() ? this.checkLoaded() :
            setTimeout(this.waitForFontsLoaded.bind(this), 20))
    }, AnimationItem.prototype.checkLoaded = function () {
        this.isLoaded || !this.renderer.globalData.fontManager.loaded() || !this.imagePreloader
            .loaded() && "canvas" === this.renderer.rendererType || (this.isLoaded = !0, dataManager
                .completeData(this.animationData, this.renderer.globalData.fontManager),
                expressionsPlugin && expressionsPlugin.initExpressions(this), this.renderer
                    .initItems(), setTimeout(function () {
                        this.trigger("DOMLoaded")
                    }.bind(this), 0), this.gotoFrame(), this.autoplay && this.play())
    }, AnimationItem.prototype.resize = function () {
        this.renderer.updateContainerSize()
    }, AnimationItem.prototype.setSubframe = function (t) {
        this.subframeEnabled = !!t
    }, AnimationItem.prototype.gotoFrame = function () {
        this.currentFrame = this.subframeEnabled ? this.currentRawFrame : ~~this.currentRawFrame,
            this.timeCompleted !== this.totalFrames && this.currentFrame > this.timeCompleted && (
                this.currentFrame = this.timeCompleted), this.trigger("enterFrame"), this
                    .renderFrame()
    }, AnimationItem.prototype.renderFrame = function () {
        if (!1 !== this.isLoaded) try {
            this.renderer.renderFrame(this.currentFrame + this.firstFrame)
        } catch (t) {
            this.triggerRenderFrameError(t)
        }
    }, AnimationItem.prototype.play = function (t) {
        t && this.name != t || !0 === this.isPaused && (this.isPaused = !1, this._idle && (this
            ._idle = !1, this.trigger("_active")))
    }, AnimationItem.prototype.pause = function (t) {
        t && this.name != t || !1 === this.isPaused && (this.isPaused = !0, this._idle = !0, this
            .trigger("_idle"))
    }, AnimationItem.prototype.togglePause = function (t) {
        t && this.name != t || (!0 === this.isPaused ? this.play() : this.pause())
    }, AnimationItem.prototype.stop = function (t) {
        t && this.name != t || (this.pause(), this.playCount = 0, this._completedLoop = !1, this
            .setCurrentRawFrameValue(0))
    }, AnimationItem.prototype.goToAndStop = function (t, e, r) {
        r && this.name != r || (e ? this.setCurrentRawFrameValue(t) : this.setCurrentRawFrameValue(
            t * this.frameModifier), this.pause())
    }, AnimationItem.prototype.goToAndPlay = function (t, e, r) {
        this.goToAndStop(t, e, r), this.play()
    }, AnimationItem.prototype.advanceTime = function (t) {
        if (!0 !== this.isPaused && !1 !== this.isLoaded) {
            var e = this.currentRawFrame + t * this.frameModifier,
                r = !1;
            e >= this.totalFrames - 1 && 0 < this.frameModifier ? this.loop && this.playCount !==
                this.loop ? e >= this.totalFrames ? (this.playCount += 1, this.checkSegments(e %
                    this.totalFrames) || (this.setCurrentRawFrameValue(e % this.totalFrames),
                        this._completedLoop = !0, this.trigger("loopComplete"))) : this
                            .setCurrentRawFrameValue(e) : this.checkSegments(e > this.totalFrames ? e % this
                                .totalFrames : 0) || (r = !0, e = this.totalFrames - 1) : e < 0 ? this
                                    .checkSegments(e % this.totalFrames) || (!this.loop || this.playCount-- <= 0 && !
                                        0 !== this.loop ? (r = !0, e = 0) : (this.setCurrentRawFrameValue(this
                                            .totalFrames + e % this.totalFrames), this._completedLoop ? this
                                                .trigger("loopComplete") : this._completedLoop = !0)) : this
                                                    .setCurrentRawFrameValue(e), r && (this.setCurrentRawFrameValue(e), this.pause(),
                                                        this.trigger("complete"))
        }
    }, AnimationItem.prototype.adjustSegment = function (t, e) {
        this.playCount = 0, t[1] < t[0] ? (0 < this.frameModifier && (this.playSpeed < 0 ? this
            .setSpeed(-this.playSpeed) : this.setDirection(-1)), this.timeCompleted = this
                .totalFrames = t[0] - t[1], this.firstFrame = t[1], this.setCurrentRawFrameValue(
                    this.totalFrames - .001 - e)) : t[1] > t[0] && (this.frameModifier < 0 && (this
                        .playSpeed < 0 ? this.setSpeed(-this.playSpeed) : this.setDirection(1)), this
                            .timeCompleted = this.totalFrames = t[1] - t[0], this.firstFrame = t[0], this
                                .setCurrentRawFrameValue(.001 + e)), this.trigger("segmentStart")
    }, AnimationItem.prototype.setSegment = function (t, e) {
        var r = -1;
        this.isPaused && (this.currentRawFrame + this.firstFrame < t ? r = t : this
            .currentRawFrame + this.firstFrame > e && (r = e - t)), this.firstFrame = t, this
                .timeCompleted = this.totalFrames = e - t, -1 !== r && this.goToAndStop(r, !0)
    }, AnimationItem.prototype.playSegments = function (t, e) {
        if (e && (this.segments.length = 0), "object" == typeof t[0]) {
            var r, i = t.length;
            for (r = 0; r < i; r += 1) this.segments.push(t[r])
        } else this.segments.push(t);
        this.segments.length && e && this.adjustSegment(this.segments.shift(), 0), this.isPaused &&
            this.play()
    }, AnimationItem.prototype.resetSegments = function (t) {
        this.segments.length = 0, this.segments.push([this.animationData.ip, this.animationData
            .op
        ]), t && this.checkSegments(0)
    }, AnimationItem.prototype.checkSegments = function (t) {
        return !!this.segments.length && (this.adjustSegment(this.segments.shift(), t), !0)
    }, AnimationItem.prototype.destroy = function (t) {
        t && this.name != t || !this.renderer || (this.renderer.destroy(), this.imagePreloader
            .destroy(), this.trigger("destroy"), this._cbs = null, this.onEnterFrame = this
                .onLoopComplete = this.onComplete = this.onSegmentStart = this.onDestroy = null,
            this.renderer = null)
    }, AnimationItem.prototype.setCurrentRawFrameValue = function (t) {
        this.currentRawFrame = t, this.gotoFrame()
    }, AnimationItem.prototype.setSpeed = function (t) {
        this.playSpeed = t, this.updaFrameModifier()
    }, AnimationItem.prototype.setDirection = function (t) {
        this.playDirection = t < 0 ? -1 : 1, this.updaFrameModifier()
    }, AnimationItem.prototype.updaFrameModifier = function () {
        this.frameModifier = this.frameMult * this.playSpeed * this.playDirection
    }, AnimationItem.prototype.getPath = function () {
        return this.path
    }, AnimationItem.prototype.getAssetsPath = function (t) {
        var e = "";
        if (t.e) e = t.p;
        else if (this.assetsPath) {
            var r = t.p; - 1 !== r.indexOf("images/") && (r = r.split("/")[1]), e = this
                .assetsPath + r
        } else e = this.path, e += t.u ? t.u : "", e += t.p;
        return e
    }, AnimationItem.prototype.getAssetData = function (t) {
        for (var e = 0, r = this.assets.length; e < r;) {
            if (t == this.assets[e].id) return this.assets[e];
            e += 1
        }
    }, AnimationItem.prototype.hide = function () {
        this.renderer.hide()
    }, AnimationItem.prototype.show = function () {
        this.renderer.show()
    }, AnimationItem.prototype.getDuration = function (t) {
        return t ? this.totalFrames : this.totalFrames / this.frameRate
    }, AnimationItem.prototype.trigger = function (t) {
        if (this._cbs && this._cbs[t]) switch (t) {
            case "enterFrame":
                this.triggerEvent(t, new BMEnterFrameEvent(t, this.currentFrame, this
                    .totalFrames, this.frameModifier));
                break;
            case "loopComplete":
                this.triggerEvent(t, new BMCompleteLoopEvent(t, this.loop, this.playCount, this
                    .frameMult));
                break;
            case "complete":
                this.triggerEvent(t, new BMCompleteEvent(t, this.frameMult));
                break;
            case "segmentStart":
                this.triggerEvent(t, new BMSegmentStartEvent(t, this.firstFrame, this
                    .totalFrames));
                break;
            case "destroy":
                this.triggerEvent(t, new BMDestroyEvent(t, this));
                break;
            default:
                this.triggerEvent(t)
        }
        "enterFrame" === t && this.onEnterFrame && this.onEnterFrame.call(this,
            new BMEnterFrameEvent(t, this.currentFrame, this.totalFrames, this.frameMult)),
            "loopComplete" === t && this.onLoopComplete && this.onLoopComplete.call(this,
                new BMCompleteLoopEvent(t, this.loop, this.playCount, this.frameMult)),
            "complete" === t && this.onComplete && this.onComplete.call(this, new BMCompleteEvent(t,
                this.frameMult)), "segmentStart" === t && this.onSegmentStart && this.onSegmentStart
                    .call(this, new BMSegmentStartEvent(t, this.firstFrame, this.totalFrames)),
            "destroy" === t && this.onDestroy && this.onDestroy.call(this, new BMDestroyEvent(t,
                this))
    }, AnimationItem.prototype.triggerRenderFrameError = function (t) {
        var e = new BMRenderFrameErrorEvent(t, this.currentFrame);
        this.triggerEvent("error", e), this.onError && this.onError.call(this, e)
    }, AnimationItem.prototype.triggerConfigError = function (t) {
        var e = new BMConfigErrorEvent(t, this.currentFrame);
        this.triggerEvent("error", e), this.onError && this.onError.call(this, e)
    };
    var Expressions = (HW = {}, HW.initExpressions = function (t) {
        var e = 0,
            r = [];

        function i() {
            var t, e = r.length;
            for (t = 0; t < e; t += 1) r[t].release();
            r.length = 0
        }
        t.renderer.compInterface = CompExpressionInterface(t.renderer), t.renderer.globalData
            .projectInterface.registerComposition(t.renderer), t.renderer.globalData
                .pushExpression = function () {
                    e += 1
                }, t.renderer.globalData.popExpression = function () {
                    0 == (e -= 1) && i()
                }, t.renderer.globalData.registerExpressionProperty = function (t) {
                    -1 === r.indexOf(t) && r.push(t)
                }
    }, HW),
        HW;
    expressionsPlugin = Expressions;
    var ExpressionManager = function () {
        var ob = {},
            Math = BMMath,
            window = null,
            document = null;

        function $bm_isInstanceOfArray(t) {
            return t.constructor === Array || t.constructor === Float32Array
        }

        function isNumerable(t, e) {
            return "number" === t || "boolean" === t || "string" === t || e instanceof Number
        }

        function $bm_neg(t) {
            var e = typeof t;
            if ("number" === e || "boolean" === e || t instanceof Number) return -t;
            if ($bm_isInstanceOfArray(t)) {
                var r, i = t.length,
                    s = [];
                for (r = 0; r < i; r += 1) s[r] = -t[r];
                return s
            }
            return t.propType ? t.v : void 0
        }
        var easeInBez = BezierFactory.getBezierEasing(.333, 0, .833, .833, "easeIn").get,
            easeOutBez = BezierFactory.getBezierEasing(.167, .167, .667, 1, "easeOut").get,
            easeInOutBez = BezierFactory.getBezierEasing(.33, 0, .667, 1, "easeInOut").get;

        function sum(t, e) {
            var r = typeof t,
                i = typeof e;
            if ("string" === r || "string" === i) return t + e;
            if (isNumerable(r, t) && isNumerable(i, e)) return t + e;
            if ($bm_isInstanceOfArray(t) && isNumerable(i, e)) return (t = t.slice(0))[0] = t[0] +
                e, t;
            if (isNumerable(r, t) && $bm_isInstanceOfArray(e)) return (e = e.slice(0))[0] = t + e[
                0], e;
            if ($bm_isInstanceOfArray(t) && $bm_isInstanceOfArray(e)) {
                for (var s = 0, a = t.length, n = e.length, o = []; s < a || s < n;)("number" ==
                    typeof t[s] || t[s] instanceof Number) && ("number" == typeof e[s] || e[
                        s] instanceof Number) ? o[s] = t[s] + e[s] : o[s] = void 0 === e[s] ? t[s] :
                            t[s] || e[s], s += 1;
                return o
            }
            return 0
        }
        var add = sum;

        function sub(t, e) {
            var r = typeof t,
                i = typeof e;
            if (isNumerable(r, t) && isNumerable(i, e)) return "string" === r && (t = parseInt(t)),
                "string" === i && (e = parseInt(e)), t - e;
            if ($bm_isInstanceOfArray(t) && isNumerable(i, e)) return (t = t.slice(0))[0] = t[0] -
                e, t;
            if (isNumerable(r, t) && $bm_isInstanceOfArray(e)) return (e = e.slice(0))[0] = t - e[
                0], e;
            if ($bm_isInstanceOfArray(t) && $bm_isInstanceOfArray(e)) {
                for (var s = 0, a = t.length, n = e.length, o = []; s < a || s < n;)("number" ==
                    typeof t[s] || t[s] instanceof Number) && ("number" == typeof e[s] || e[
                        s] instanceof Number) ? o[s] = t[s] - e[s] : o[s] = void 0 === e[s] ? t[s] :
                            t[s] || e[s], s += 1;
                return o
            }
            return 0
        }

        function mul(t, e) {
            var r, i, s, a = typeof t,
                n = typeof e;
            if (isNumerable(a, t) && isNumerable(n, e)) return t * e;
            if ($bm_isInstanceOfArray(t) && isNumerable(n, e)) {
                for (s = t.length, r = createTypedArray("float32", s), i = 0; i < s; i += 1) r[i] =
                    t[i] * e;
                return r
            }
            if (isNumerable(a, t) && $bm_isInstanceOfArray(e)) {
                for (s = e.length, r = createTypedArray("float32", s), i = 0; i < s; i += 1) r[i] =
                    t * e[i];
                return r
            }
            return 0
        }

        function div(t, e) {
            var r, i, s, a = typeof t,
                n = typeof e;
            if (isNumerable(a, t) && isNumerable(n, e)) return t / e;
            if ($bm_isInstanceOfArray(t) && isNumerable(n, e)) {
                for (s = t.length, r = createTypedArray("float32", s), i = 0; i < s; i += 1) r[i] =
                    t[i] / e;
                return r
            }
            if (isNumerable(a, t) && $bm_isInstanceOfArray(e)) {
                for (s = e.length, r = createTypedArray("float32", s), i = 0; i < s; i += 1) r[i] =
                    t / e[i];
                return r
            }
            return 0
        }

        function mod(t, e) {
            return "string" == typeof t && (t = parseInt(t)), "string" == typeof e && (e = parseInt(
                e)), t % e
        }
        var $bm_sum = sum,
            $bm_sub = sub,
            $bm_mul = mul,
            $bm_div = div,
            $bm_mod = mod;

        function clamp(t, e, r) {
            if (r < e) {
                var i = r;
                r = e, e = i
            }
            return Math.min(Math.max(t, e), r)
        }

        function radiansToDegrees(t) {
            return t / degToRads
        }
        var radians_to_degrees = radiansToDegrees;

        function degreesToRadians(t) {
            return t * degToRads
        }
        var degrees_to_radians = radiansToDegrees,
            helperLengthArray = [0, 0, 0, 0, 0, 0];

        function length(t, e) {
            if ("number" == typeof t || t instanceof Number) return e = e || 0, Math.abs(t - e);
            e || (e = helperLengthArray);
            var r, i = Math.min(t.length, e.length),
                s = 0;
            for (r = 0; r < i; r += 1) s += Math.pow(e[r] - t[r], 2);
            return Math.sqrt(s)
        }

        function normalize(t) {
            return div(t, length(t))
        }

        function rgbToHsl(t) {
            var e, r, i = t[0],
                s = t[1],
                a = t[2],
                n = Math.max(i, s, a),
                o = Math.min(i, s, a),
                h = (n + o) / 2;
            if (n == o) e = r = 0;
            else {
                var l = n - o;
                switch (r = .5 < h ? l / (2 - n - o) : l / (n + o), n) {
                    case i:
                        e = (s - a) / l + (s < a ? 6 : 0);
                        break;
                    case s:
                        e = (a - i) / l + 2;
                        break;
                    case a:
                        e = (i - s) / l + 4
                }
                e /= 6
            }
            return [e, r, h, t[3]]
        }

        function hue2rgb(t, e, r) {
            return r < 0 && (r += 1), 1 < r && (r -= 1), r < 1 / 6 ? t + 6 * (e - t) * r : r < .5 ?
                e : r < 2 / 3 ? t + (e - t) * (2 / 3 - r) * 6 : t
        }

        function hslToRgb(t) {
            var e, r, i, s = t[0],
                a = t[1],
                n = t[2];
            if (0 === a) e = r = i = n;
            else {
                var o = n < .5 ? n * (1 + a) : n + a - n * a,
                    h = 2 * n - o;
                e = hue2rgb(h, o, s + 1 / 3), r = hue2rgb(h, o, s), i = hue2rgb(h, o, s - 1 / 3)
            }
            return [e, r, i, t[3]]
        }

        function linear(t, e, r, i, s) {
            if (void 0 !== i && void 0 !== s || (i = e, s = r, e = 0, r = 1), r < e) {
                var a = r;
                r = e, e = a
            }
            if (t <= e) return i;
            if (r <= t) return s;
            var n = r === e ? 0 : (t - e) / (r - e);
            if (!i.length) return i + (s - i) * n;
            var o, h = i.length,
                l = createTypedArray("float32", h);
            for (o = 0; o < h; o += 1) l[o] = i[o] + (s[o] - i[o]) * n;
            return l
        }

        function random(t, e) {
            if (void 0 === e && (void 0 === t ? (t = 0, e = 1) : (e = t, t = void 0)), e.length) {
                var r, i = e.length;
                t || (t = createTypedArray("float32", i));
                var s = createTypedArray("float32", i),
                    a = BMMath.random();
                for (r = 0; r < i; r += 1) s[r] = t[r] + a * (e[r] - t[r]);
                return s
            }
            return void 0 === t && (t = 0), t + BMMath.random() * (e - t)
        }

        function createPath(t, e, r, i) {
            var s, a = t.length,
                n = shape_pool.newElement();
            n.setPathData(!!i, a);
            var o, h, l = [0, 0];
            for (s = 0; s < a; s += 1) o = e && e[s] ? e[s] : l, h = r && r[s] ? r[s] : l, n
                .setTripleAt(t[s][0], t[s][1], h[0] + t[s][0], h[1] + t[s][1], o[0] + t[s][0], o[
                    1] + t[s][1], s, !0);
            return n
        }

        function initiateExpression(elem, data, property) {
            var val = data.x,
                needsVelocity = /velocity(?![\w\d])/.test(val),
                _needsRandom = -1 !== val.indexOf("random"),
                elemType = elem.data.ty,
                transform, $bm_transform, content, effect, thisProperty = property;
            thisProperty.valueAtTime = thisProperty.getValueAtTime, Object.defineProperty(
                thisProperty, "value", {
                get: function () {
                    return thisProperty.v
                }
            }), elem.comp.frameDuration = 1 / elem.comp.globalData.frameRate, elem.comp
                .displayStartTime = 0;
            var inPoint = elem.data.ip / elem.comp.globalData.frameRate,
                outPoint = elem.data.op / elem.comp.globalData.frameRate,
                width = elem.data.sw ? elem.data.sw : 0,
                height = elem.data.sh ? elem.data.sh : 0,
                name = elem.data.nm,
                loopIn, loop_in, loopOut, loop_out, smooth, toWorld, fromWorld, fromComp, toComp,
                fromCompToSurface, position, rotation, anchorPoint, scale, thisLayer, thisComp,
                mask, valueAtTime, velocityAtTime, __expression_functions = [],
                scoped_bm_rt;
            if (data.xf) {
                var i, len = data.xf.length;
                for (i = 0; i < len; i += 1) __expression_functions[i] = eval(
                    "(function(){ return " + data.xf[i] + "}())")
            }
            var expression_function = eval("[function _expression_function(){" + val +
                ";scoped_bm_rt=$bm_rt}]")[0],
                numKeys = property.kf ? data.k.length : 0,
                active = !this.data || !0 !== this.data.hd,
                wiggle = function (t, e) {
                    var r, i, s = this.pv.length ? this.pv.length : 1,
                        a = createTypedArray("float32", s);
                    var n = Math.floor(5 * time);
                    for (i = r = 0; r < n;) {
                        for (i = 0; i < s; i += 1) a[i] += -e + 2 * e * BMMath.random();
                        r += 1
                    }
                    var o = 5 * time,
                        h = o - Math.floor(o),
                        l = createTypedArray("float32", s);
                    if (1 < s) {
                        for (i = 0; i < s; i += 1) l[i] = this.pv[i] + a[i] + (-e + 2 * e * BMMath
                            .random()) * h;
                        return l
                    }
                    return this.pv + a[0] + (-e + 2 * e * BMMath.random()) * h
                }.bind(this);

            function loopInDuration(t, e) {
                return loopIn(t, e, !0)
            }

            function loopOutDuration(t, e) {
                return loopOut(t, e, !0)
            }
            thisProperty.loopIn && (loopIn = thisProperty.loopIn.bind(thisProperty), loop_in =
                loopIn), thisProperty.loopOut && (loopOut = thisProperty.loopOut.bind(
                    thisProperty), loop_out = loopOut), thisProperty.smooth && (smooth =
                        thisProperty.smooth.bind(thisProperty)), this.getValueAtTime && (valueAtTime =
                            this.getValueAtTime.bind(this)), this.getVelocityAtTime && (velocityAtTime =
                                this.getVelocityAtTime.bind(this));
            var comp = elem.comp.globalData.projectInterface.bind(elem.comp.globalData
                .projectInterface),
                time, velocity, value, text, textIndex, textTotal, selectorValue;

            function lookAt(t, e) {
                var r = [e[0] - t[0], e[1] - t[1], e[2] - t[2]],
                    i = Math.atan2(r[0], Math.sqrt(r[1] * r[1] + r[2] * r[2])) / degToRads;
                return [-Math.atan2(r[1], r[2]) / degToRads, i, 0]
            }

            function easeOut(t, e, r, i, s) {
                return applyEase(easeOutBez, t, e, r, i, s)
            }

            function easeIn(t, e, r, i, s) {
                return applyEase(easeInBez, t, e, r, i, s)
            }

            function ease(t, e, r, i, s) {
                return applyEase(easeInOutBez, t, e, r, i, s)
            }

            function applyEase(t, e, r, i, s, a) {
                void 0 === s ? (s = r, a = i) : e = (e - r) / (i - r);
                var n = t(e = 1 < e ? 1 : e < 0 ? 0 : e);
                if ($bm_isInstanceOfArray(s)) {
                    var o, h = s.length,
                        l = createTypedArray("float32", h);
                    for (o = 0; o < h; o += 1) l[o] = (a[o] - s[o]) * n + s[o];
                    return l
                }
                return (a - s) * n + s
            }

            function nearestKey(t) {
                var e, r, i, s = data.k.length;
                if (data.k.length && "number" != typeof data.k[0])
                    if (r = -1, (t *= elem.comp.globalData.frameRate) < data.k[0].t) r = 1, i = data
                        .k[0].t;
                    else {
                        for (e = 0; e < s - 1; e += 1) {
                            if (t === data.k[e].t) {
                                r = e + 1, i = data.k[e].t;
                                break
                            }
                            if (t > data.k[e].t && t < data.k[e + 1].t) {
                                i = t - data.k[e].t > data.k[e + 1].t - t ? (r = e + 2, data.k[e +
                                    1].t) : (r = e + 1, data.k[e].t);
                                break
                            }
                        } - 1 === r && (r = e + 1, i = data.k[e].t)
                    }
                else i = r = 0;
                var a = {};
                return a.index = r, a.time = i / elem.comp.globalData.frameRate, a
            }

            function key(t) {
                var e, r, i;
                if (!data.k.length || "number" == typeof data.k[0]) throw new Error(
                    "The property has no keyframe at index " + t);
                t -= 1, e = {
                    time: data.k[t].t / elem.comp.globalData.frameRate,
                    value: []
                };
                var s = data.k[t].hasOwnProperty("s") ? data.k[t].s : data.k[t - 1].e;
                for (i = s.length, r = 0; r < i; r += 1) e[r] = s[r], e.value[r] = s[r];
                return e
            }

            function framesToTime(t, e) {
                return e || (e = elem.comp.globalData.frameRate), t / e
            }

            function timeToFrames(t, e) {
                return t || 0 === t || (t = time), e || (e = elem.comp.globalData.frameRate), t * e
            }

            function seedRandom(t) {
                BMMath.seedrandom(randSeed + t)
            }

            function sourceRectAtTime() {
                return elem.sourceRectAtTime()
            }

            function substring(t, e) {
                return "string" == typeof value ? void 0 === e ? value.substring(t) : value
                    .substring(t, e) : ""
            }

            function substr(t, e) {
                return "string" == typeof value ? void 0 === e ? value.substr(t) : value.substr(t,
                    e) : ""
            }

            function posterizeTime(t) {
                time = 0 === t ? 0 : Math.floor(time * t) / t, value = valueAtTime(time)
            }
            var index = elem.data.ind,
                hasParent = !(!elem.hierarchy || !elem.hierarchy.length),
                parent, randSeed = Math.floor(1e6 * Math.random()),
                globalData = elem.globalData;

            function executeExpression(t) {
                return value = t, _needsRandom && seedRandom(randSeed), this.frameExpressionId ===
                    elem.globalData.frameId && "textSelector" !== this.propType ? value : (
                    "textSelector" === this.propType && (textIndex = this.textIndex, textTotal =
                        this.textTotal, selectorValue = this.selectorValue), thisLayer || (
                            text = elem.layerInterface.text, thisLayer = elem.layerInterface,
                            thisComp = elem.comp.compInterface, toWorld = thisLayer.toWorld.bind(
                                thisLayer), fromWorld = thisLayer.fromWorld.bind(thisLayer),
                            fromComp = thisLayer.fromComp.bind(thisLayer), toComp = thisLayer.toComp
                                .bind(thisLayer), mask = thisLayer.mask ? thisLayer.mask.bind(
                                    thisLayer) : null, fromCompToSurface = fromComp), transform || (
                                        transform = elem.layerInterface("ADBE Transform Group"), (
                                            $bm_transform = transform) && (anchorPoint = transform.anchorPoint)
                                    ), 4 !== elemType || content || (content = thisLayer(
                                        "ADBE Root Vectors Group")), effect || (effect = thisLayer(4)), (
                                            hasParent = !(!elem.hierarchy || !elem.hierarchy.length)) && !parent &&
                    (parent = elem.hierarchy[0].layerInterface), time = this.comp
                        .renderedFrame / this.comp.globalData.frameRate, needsVelocity && (
                            velocity = velocityAtTime(time)), expression_function(), this
                                .frameExpressionId = elem.globalData.frameId, "shape" === scoped_bm_rt
                                    .propType && (scoped_bm_rt = scoped_bm_rt.v), scoped_bm_rt)
            }
            return executeExpression
        }
        return ob.initiateExpression = initiateExpression, ob
    }(),
        expressionHelpers = {
            searchExpressions: function (t, e, r) {
                e.x && (r.k = !0, r.x = !0, r.initiateExpression = ExpressionManager
                    .initiateExpression, r.effectsSequence.push(r.initiateExpression(t, e, r)
                        .bind(r)))
            },
            getSpeedAtTime: function (t) {
                var e = this.getValueAtTime(t),
                    r = this.getValueAtTime(t + -.01),
                    i = 0;
                if (e.length) {
                    var s;
                    for (s = 0; s < e.length; s += 1) i += Math.pow(r[s] - e[s], 2);
                    i = 100 * Math.sqrt(i)
                } else i = 0;
                return i
            },
            getVelocityAtTime: function (t) {
                if (void 0 !== this.vel) return this.vel;
                var e, r, i = this.getValueAtTime(t),
                    s = this.getValueAtTime(t + -.001);
                if (i.length)
                    for (e = createTypedArray("float32", i.length), r = 0; r < i.length; r += 1) e[
                        r] = (s[r] - i[r]) / -.001;
                else e = (s - i) / -.001;
                return e
            },
            getValueAtTime: function (t) {
                return t *= this.elem.globalData.frameRate, (t -= this.offsetTime) !== this
                    ._cachingAtTime.lastFrame && (this._cachingAtTime.lastIndex = this
                        ._cachingAtTime.lastFrame < t ? this._cachingAtTime.lastIndex : 0, this
                            ._cachingAtTime.value = this.interpolateValue(t, this._cachingAtTime), this
                                ._cachingAtTime.lastFrame = t), this._cachingAtTime.value
            },
            getStaticValueAtTime: function () {
                return this.pv
            },
            setGroupProperty: function (t) {
                this.propertyGroup = t
            }
        };
    ! function () {
        function o(t, e, r) {
            if (!this.k || !this.keyframes) return this.pv;
            t = t ? t.toLowerCase() : "";
            var i, s, a, n, o, h = this.comp.renderedFrame,
                l = this.keyframes,
                p = l[l.length - 1].t;
            if (h <= p) return this.pv;
            if (r ? s = p - (i = e ? Math.abs(p - elem.comp.globalData.frameRate * e) : Math.max(0, p -
                this.elem.data.ip)) : ((!e || e > l.length - 1) && (e = l.length - 1), i = p - (s =
                    l[l.length - 1 - e].t)), "pingpong" === t) {
                if (Math.floor((h - s) / i) % 2 != 0) return this.getValueAtTime((i - (h - s) % i + s) /
                    this.comp.globalData.frameRate, 0)
            } else {
                if ("offset" === t) {
                    var m = this.getValueAtTime(s / this.comp.globalData.frameRate, 0),
                        f = this.getValueAtTime(p / this.comp.globalData.frameRate, 0),
                        c = this.getValueAtTime(((h - s) % i + s) / this.comp.globalData.frameRate, 0),
                        d = Math.floor((h - s) / i);
                    if (this.pv.length) {
                        for (n = (o = new Array(m.length)).length, a = 0; a < n; a += 1) o[a] = (f[a] -
                            m[a]) * d + c[a];
                        return o
                    }
                    return (f - m) * d + c
                }
                if ("continue" === t) {
                    var u = this.getValueAtTime(p / this.comp.globalData.frameRate, 0),
                        y = this.getValueAtTime((p - .001) / this.comp.globalData.frameRate, 0);
                    if (this.pv.length) {
                        for (n = (o = new Array(u.length)).length, a = 0; a < n; a += 1) o[a] = u[a] + (
                            u[a] - y[a]) * ((h - p) / this.comp.globalData.frameRate) / 5e-4;
                        return o
                    }
                    return u + (h - p) / .001 * (u - y)
                }
            }
            return this.getValueAtTime(((h - s) % i + s) / this.comp.globalData.frameRate, 0)
        }

        function h(t, e, r) {
            if (!this.k) return this.pv;
            t = t ? t.toLowerCase() : "";
            var i, s, a, n, o, h = this.comp.renderedFrame,
                l = this.keyframes,
                p = l[0].t;
            if (p <= h) return this.pv;
            if (r ? s = p + (i = e ? Math.abs(elem.comp.globalData.frameRate * e) : Math.max(0, this
                .elem.data.op - p)) : ((!e || e > l.length - 1) && (e = l.length - 1), i = (s = l[e]
                    .t) - p), "pingpong" === t) {
                if (Math.floor((p - h) / i) % 2 == 0) return this.getValueAtTime(((p - h) % i + p) /
                    this.comp.globalData.frameRate, 0)
            } else {
                if ("offset" === t) {
                    var m = this.getValueAtTime(p / this.comp.globalData.frameRate, 0),
                        f = this.getValueAtTime(s / this.comp.globalData.frameRate, 0),
                        c = this.getValueAtTime((i - (p - h) % i + p) / this.comp.globalData.frameRate,
                            0),
                        d = Math.floor((p - h) / i) + 1;
                    if (this.pv.length) {
                        for (n = (o = new Array(m.length)).length, a = 0; a < n; a += 1) o[a] = c[a] - (
                            f[a] - m[a]) * d;
                        return o
                    }
                    return c - (f - m) * d
                }
                if ("continue" === t) {
                    var u = this.getValueAtTime(p / this.comp.globalData.frameRate, 0),
                        y = this.getValueAtTime((p + .001) / this.comp.globalData.frameRate, 0);
                    if (this.pv.length) {
                        for (n = (o = new Array(u.length)).length, a = 0; a < n; a += 1) o[a] = u[a] + (
                            u[a] - y[a]) * (p - h) / .001;
                        return o
                    }
                    return u + (u - y) * (p - h) / .001
                }
            }
            return this.getValueAtTime((i - (p - h) % i + p) / this.comp.globalData.frameRate, 0)
        }

        function l(t, e) {
            if (!this.k) return this.pv;
            if (t = .5 * (t || .4), (e = Math.floor(e || 5)) <= 1) return this.pv;
            var r, i, s = this.comp.renderedFrame / this.comp.globalData.frameRate,
                a = s - t,
                n = 1 < e ? (s + t - a) / (e - 1) : 1,
                o = 0,
                h = 0;
            for (r = this.pv.length ? createTypedArray("float32", this.pv.length) : 0; o < e;) {
                if (i = this.getValueAtTime(a + o * n), this.pv.length)
                    for (h = 0; h < this.pv.length; h += 1) r[h] += i[h];
                else r += i;
                o += 1
            }
            if (this.pv.length)
                for (h = 0; h < this.pv.length; h += 1) r[h] /= e;
            else r /= e;
            return r
        }
        var s = TransformPropertyFactory.getTransformProperty;
        TransformPropertyFactory.getTransformProperty = function (t, e, r) {
            var i = s(t, e, r);
            return i.dynamicProperties.length ? i.getValueAtTime = function (t) {
                console.warn("Transform at time not supported")
            }.bind(i) : i.getValueAtTime = function (t) { }.bind(i), i.setGroupProperty =
                expressionHelpers.setGroupProperty, i
        };
        var p = PropertyFactory.getProp;
        PropertyFactory.getProp = function (t, e, r, i, s) {
            var a = p(t, e, r, i, s);
            a.kf ? a.getValueAtTime = expressionHelpers.getValueAtTime.bind(a) : a.getValueAtTime =
                expressionHelpers.getStaticValueAtTime.bind(a), a.setGroupProperty =
                expressionHelpers.setGroupProperty, a.loopOut = o, a.loopIn = h, a.smooth = l, a
                    .getVelocityAtTime = expressionHelpers.getVelocityAtTime.bind(a), a.getSpeedAtTime =
                expressionHelpers.getSpeedAtTime.bind(a), a.numKeys = 1 === e.a ? e.k.length : 0, a
                    .propertyIndex = e.ix;
            var n = 0;
            return 0 !== r && (n = createTypedArray("float32", 1 === e.a ? e.k[0].s.length : e.k
                .length)), a._cachingAtTime = {
                    lastFrame: initialDefaultFrame,
                    lastIndex: 0,
                    value: n
                }, expressionHelpers.searchExpressions(t, e, a), a.k && s.addDynamicProperty(a), a
        };
        var t = ShapePropertyFactory.getConstructorFunction(),
            e = ShapePropertyFactory.getKeyframedConstructorFunction();

        function r() { }
        r.prototype = {
            vertices: function (t, e) {
                this.k && this.getValue();
                var r = this.v;
                void 0 !== e && (r = this.getValueAtTime(e, 0));
                var i, s = r._length,
                    a = r[t],
                    n = r.v,
                    o = createSizedArray(s);
                for (i = 0; i < s; i += 1) o[i] = "i" === t || "o" === t ? [a[i][0] - n[i][0],
                a[i][1] - n[i][1]
                ] : [a[i][0], a[i][1]];
                return o
            },
            points: function (t) {
                return this.vertices("v", t)
            },
            inTangents: function (t) {
                return this.vertices("i", t)
            },
            outTangents: function (t) {
                return this.vertices("o", t)
            },
            isClosed: function () {
                return this.v.c
            },
            pointOnPath: function (t, e) {
                var r = this.v;
                void 0 !== e && (r = this.getValueAtTime(e, 0)), this._segmentsLength || (this
                    ._segmentsLength = bez.getSegmentsLength(r));
                for (var i, s = this._segmentsLength, a = s.lengths, n = s.totalLength * t, o =
                    0, h = a.length, l = 0; o < h;) {
                    if (l + a[o].addedLength > n) {
                        var p = o,
                            m = r.c && o === h - 1 ? 0 : o + 1,
                            f = (n - l) / a[o].addedLength;
                        i = bez.getPointInSegment(r.v[p], r.v[m], r.o[p], r.i[m], f, a[o]);
                        break
                    }
                    l += a[o].addedLength, o += 1
                }
                return i || (i = r.c ? [r.v[0][0], r.v[0][1]] : [r.v[r._length - 1][0], r.v[r
                    ._length - 1][1]]), i
            },
            vectorOnPath: function (t, e, r) {
                t = 1 == t ? this.v.c ? 0 : .999 : t;
                var i = this.pointOnPath(t, e),
                    s = this.pointOnPath(t + .001, e),
                    a = s[0] - i[0],
                    n = s[1] - i[1],
                    o = Math.sqrt(Math.pow(a, 2) + Math.pow(n, 2));
                return 0 === o ? [0, 0] : "tangent" === r ? [a / o, n / o] : [-n / o, a / o]
            },
            tangentOnPath: function (t, e) {
                return this.vectorOnPath(t, e, "tangent")
            },
            normalOnPath: function (t, e) {
                return this.vectorOnPath(t, e, "normal")
            },
            setGroupProperty: expressionHelpers.setGroupProperty,
            getValueAtTime: expressionHelpers.getStaticValueAtTime
        }, extendPrototype([r], t), extendPrototype([r], e), e.prototype.getValueAtTime = function (
            t) {
            return this._cachingAtTime || (this._cachingAtTime = {
                shapeValue: shape_pool.clone(this.pv),
                lastIndex: 0,
                lastTime: initialDefaultFrame
            }), t *= this.elem.globalData.frameRate, (t -= this.offsetTime) !== this
                ._cachingAtTime.lastTime && (this._cachingAtTime.lastIndex = this._cachingAtTime
                    .lastTime < t ? this._caching.lastIndex : 0, this._cachingAtTime.lastTime = t,
                    this.interpolateShape(t, this._cachingAtTime.shapeValue, this._cachingAtTime)),
                this._cachingAtTime.shapeValue
        }, e.prototype.initiateExpression = ExpressionManager.initiateExpression;
        var n = ShapePropertyFactory.getShapeProp;
        ShapePropertyFactory.getShapeProp = function (t, e, r, i, s) {
            var a = n(t, e, r, i, s);
            return a.propertyIndex = e.ix, a.lock = !1, 3 === r ? expressionHelpers
                .searchExpressions(t, e.pt, a) : 4 === r && expressionHelpers.searchExpressions(t, e
                    .ks, a), a.k && t.addDynamicProperty(a), a
        }
    }(), TextProperty.prototype.getExpressionValue = function (t, e) {
        var r = this.calculateExpression(e);
        if (t.t === r) return t;
        var i = {};
        return this.copyData(i, t), i.t = r.toString(), i.__complete = !1, i
    }, TextProperty.prototype.searchProperty = function () {
        var t = this.searchKeyframes(),
            e = this.searchExpressions();
        return this.kf = t || e, this.kf
    }, TextProperty.prototype.searchExpressions = function () {
        if (this.data.d.x) return this.calculateExpression = ExpressionManager.initiateExpression
            .bind(this)(this.elem, this.data.d, this), this.addEffect(this.getExpressionValue
                .bind(this)), !0
    };
    var ShapeExpressionInterface = function () {
        function m(t, e, r) {
            var i, s = [],
                a = t ? t.length : 0;
            for (i = 0; i < a; i += 1) "gr" == t[i].ty ? s.push(n(t[i], e[i], r)) : "fl" == t[i]
                .ty ? s.push(o(t[i], e[i], r)) : "st" == t[i].ty ? s.push(h(t[i], e[i], r)) :
                "tm" == t[i].ty ? s.push(l(t[i], e[i], r)) : "tr" == t[i].ty || ("el" == t[i].ty ? s
                    .push(p(t[i], e[i], r)) : "sr" == t[i].ty ? s.push(f(t[i], e[i], r)) : "sh" ==
                        t[i].ty ? s.push(y(t[i], e[i], r)) : "rc" == t[i].ty ? s.push(c(t[i], e[i],
                            r)) : "rd" == t[i].ty ? s.push(d(t[i], e[i], r)) : "rp" == t[i].ty && s
                                .push(u(
                                    t[i], e[i], r)));
            return s
        }

        function n(t, e, r) {
            var i = function (t) {
                switch (t) {
                    case "ADBE Vectors Group":
                    case "Contents":
                    case 2:
                        return i.content;
                    default:
                        return i.transform
                }
            };
            i.propertyGroup = function (t) {
                return 1 === t ? i : r(t - 1)
            };
            var s, a, n, o, h, l = (s = t, a = e, n = i.propertyGroup, (h = function (t) {
                for (var e = 0, r = o.length; e < r;) {
                    if (o[e]._name === t || o[e].mn === t || o[e].propertyIndex === t ||
                        o[e].ix === t || o[e].ind === t) return o[e];
                    e += 1
                }
                if ("number" == typeof t) return o[t - 1]
            }).propertyGroup = function (t) {
                return 1 === t ? h : n(t - 1)
            }, o = m(s.it, a.it, h.propertyGroup), h.numProperties = o.length, h
                .propertyIndex = s.cix, h._name = s.nm, h),
                p = function (e, t, r) {
                    function i(t) {
                        return 1 == t ? s : r(--t)
                    }
                    t.transform.mProps.o.setGroupProperty(i), t.transform.mProps.p.setGroupProperty(
                        i), t.transform.mProps.a.setGroupProperty(i), t.transform.mProps.s
                            .setGroupProperty(i), t.transform.mProps.r.setGroupProperty(i), t.transform
                                .mProps.sk && (t.transform.mProps.sk.setGroupProperty(i), t.transform.mProps
                                    .sa.setGroupProperty(i));

                    function s(t) {
                        return e.a.ix === t || "Anchor Point" === t ? s.anchorPoint : e.o.ix ===
                            t || "Opacity" === t ? s.opacity : e.p.ix === t || "Position" === t ? s
                                .position : e.r.ix === t || "Rotation" === t ||
                                    "ADBE Vector Rotation" === t ? s.rotation : e.s.ix === t || "Scale" ===
                                        t ? s.scale : e.sk && e.sk.ix === t || "Skew" === t ? s.skew : e.sa && e
                                            .sa.ix === t || "Skew Axis" === t ? s.skewAxis : void 0
                    }
                    return t.transform.op.setGroupProperty(i), Object.defineProperties(s, {
                        opacity: {
                            get: ExpressionPropertyInterface(t.transform.mProps.o)
                        },
                        position: {
                            get: ExpressionPropertyInterface(t.transform.mProps.p)
                        },
                        anchorPoint: {
                            get: ExpressionPropertyInterface(t.transform.mProps.a)
                        },
                        scale: {
                            get: ExpressionPropertyInterface(t.transform.mProps.s)
                        },
                        rotation: {
                            get: ExpressionPropertyInterface(t.transform.mProps.r)
                        },
                        skew: {
                            get: ExpressionPropertyInterface(t.transform.mProps.sk)
                        },
                        skewAxis: {
                            get: ExpressionPropertyInterface(t.transform.mProps.sa)
                        },
                        _name: {
                            value: e.nm
                        }
                    }), s.ty = "tr", s.mn = e.mn, s.propertyGroup = r, s
                }(t.it[t.it.length - 1], e.it[e.it.length - 1], i.propertyGroup);
            return i.content = l, i.transform = p, Object.defineProperty(i, "_name", {
                get: function () {
                    return t.nm
                }
            }), i.numProperties = t.np, i.propertyIndex = t.ix, i.nm = t.nm, i.mn = t.mn, i
        }

        function o(t, e, r) {
            function i(t) {
                return "Color" === t || "color" === t ? i.color : "Opacity" === t || "opacity" ===
                    t ? i.opacity : void 0
            }
            return Object.defineProperties(i, {
                color: {
                    get: ExpressionPropertyInterface(e.c)
                },
                opacity: {
                    get: ExpressionPropertyInterface(e.o)
                },
                _name: {
                    value: t.nm
                },
                mn: {
                    value: t.mn
                }
            }), e.c.setGroupProperty(r), e.o.setGroupProperty(r), i
        }

        function h(t, e, r) {
            function i(t) {
                return 1 === t ? ob : r(t - 1)
            }

            function s(t) {
                return 1 === t ? h : i(t - 1)
            }
            var a, n, o = t.d ? t.d.length : 0,
                h = {};
            for (a = 0; a < o; a += 1) n = a, Object.defineProperty(h, t.d[n].nm, {
                get: ExpressionPropertyInterface(e.d.dataProps[n].p)
            }), e.d.dataProps[a].p.setGroupProperty(s);

            function l(t) {
                return "Color" === t || "color" === t ? l.color : "Opacity" === t || "opacity" ===
                    t ? l.opacity : "Stroke Width" === t || "stroke width" === t ? l.strokeWidth :
                    void 0
            }
            return Object.defineProperties(l, {
                color: {
                    get: ExpressionPropertyInterface(e.c)
                },
                opacity: {
                    get: ExpressionPropertyInterface(e.o)
                },
                strokeWidth: {
                    get: ExpressionPropertyInterface(e.w)
                },
                dash: {
                    get: function () {
                        return h
                    }
                },
                _name: {
                    value: t.nm
                },
                mn: {
                    value: t.mn
                }
            }), e.c.setGroupProperty(i), e.o.setGroupProperty(i), e.w.setGroupProperty(i), l
        }

        function l(e, t, r) {
            function i(t) {
                return 1 == t ? s : r(--t)
            }

            function s(t) {
                return t === e.e.ix || "End" === t || "end" === t ? s.end : t === e.s.ix ? s.start :
                    t === e.o.ix ? s.offset : void 0
            }
            return s.propertyIndex = e.ix, t.s.setGroupProperty(i), t.e.setGroupProperty(i), t.o
                .setGroupProperty(i), s.propertyIndex = e.ix, s.propertyGroup = r, Object
                    .defineProperties(s, {
                        start: {
                            get: ExpressionPropertyInterface(t.s)
                        },
                        end: {
                            get: ExpressionPropertyInterface(t.e)
                        },
                        offset: {
                            get: ExpressionPropertyInterface(t.o)
                        },
                        _name: {
                            value: e.nm
                        }
                    }), s.mn = e.mn, s
        }

        function p(e, t, r) {
            function i(t) {
                return 1 == t ? a : r(--t)
            }
            a.propertyIndex = e.ix;
            var s = "tm" === t.sh.ty ? t.sh.prop : t.sh;

            function a(t) {
                return e.p.ix === t ? a.position : e.s.ix === t ? a.size : void 0
            }
            return s.s.setGroupProperty(i), s.p.setGroupProperty(i), Object.defineProperties(a, {
                size: {
                    get: ExpressionPropertyInterface(s.s)
                },
                position: {
                    get: ExpressionPropertyInterface(s.p)
                },
                _name: {
                    value: e.nm
                }
            }), a.mn = e.mn, a
        }

        function f(e, t, r) {
            function i(t) {
                return 1 == t ? a : r(--t)
            }
            var s = "tm" === t.sh.ty ? t.sh.prop : t.sh;

            function a(t) {
                return e.p.ix === t ? a.position : e.r.ix === t ? a.rotation : e.pt.ix === t ? a
                    .points : e.or.ix === t || "ADBE Vector Star Outer Radius" === t ? a
                        .outerRadius : e.os.ix === t ? a.outerRoundness : !e.ir || e.ir.ix !== t &&
                            "ADBE Vector Star Inner Radius" !== t ? e.is && e.is.ix === t ? a
                                .innerRoundness : void 0 : a.innerRadius
            }
            return a.propertyIndex = e.ix, s.or.setGroupProperty(i), s.os.setGroupProperty(i), s.pt
                .setGroupProperty(i), s.p.setGroupProperty(i), s.r.setGroupProperty(i), e.ir && (s
                    .ir.setGroupProperty(i), s.is.setGroupProperty(i)), Object.defineProperties(a, {
                        position: {
                            get: ExpressionPropertyInterface(s.p)
                        },
                        rotation: {
                            get: ExpressionPropertyInterface(s.r)
                        },
                        points: {
                            get: ExpressionPropertyInterface(s.pt)
                        },
                        outerRadius: {
                            get: ExpressionPropertyInterface(s.or)
                        },
                        outerRoundness: {
                            get: ExpressionPropertyInterface(s.os)
                        },
                        innerRadius: {
                            get: ExpressionPropertyInterface(s.ir)
                        },
                        innerRoundness: {
                            get: ExpressionPropertyInterface(s.is)
                        },
                        _name: {
                            value: e.nm
                        }
                    }), a.mn = e.mn, a
        }

        function c(e, t, r) {
            function i(t) {
                return 1 == t ? a : r(--t)
            }
            var s = "tm" === t.sh.ty ? t.sh.prop : t.sh;

            function a(t) {
                return e.p.ix === t ? a.position : e.r.ix === t ? a.roundness : e.s.ix === t ||
                    "Size" === t || "ADBE Vector Rect Size" === t ? a.size : void 0
            }
            return a.propertyIndex = e.ix, s.p.setGroupProperty(i), s.s.setGroupProperty(i), s.r
                .setGroupProperty(i), Object.defineProperties(a, {
                    position: {
                        get: ExpressionPropertyInterface(s.p)
                    },
                    roundness: {
                        get: ExpressionPropertyInterface(s.r)
                    },
                    size: {
                        get: ExpressionPropertyInterface(s.s)
                    },
                    _name: {
                        value: e.nm
                    }
                }), a.mn = e.mn, a
        }

        function d(e, t, r) {
            var i = t;

            function s(t) {
                if (e.r.ix === t || "Round Corners 1" === t) return s.radius
            }
            return s.propertyIndex = e.ix, i.rd.setGroupProperty(function (t) {
                return 1 == t ? s : r(--t)
            }), Object.defineProperties(s, {
                radius: {
                    get: ExpressionPropertyInterface(i.rd)
                },
                _name: {
                    value: e.nm
                }
            }), s.mn = e.mn, s
        }

        function u(e, t, r) {
            function i(t) {
                return 1 == t ? a : r(--t)
            }
            var s = t;

            function a(t) {
                return e.c.ix === t || "Copies" === t ? a.copies : e.o.ix === t || "Offset" === t ?
                    a.offset : void 0
            }
            return a.propertyIndex = e.ix, s.c.setGroupProperty(i), s.o.setGroupProperty(i), Object
                .defineProperties(a, {
                    copies: {
                        get: ExpressionPropertyInterface(s.c)
                    },
                    offset: {
                        get: ExpressionPropertyInterface(s.o)
                    },
                    _name: {
                        value: e.nm
                    }
                }), a.mn = e.mn, a
        }

        function y(t, e, r) {
            var i = e.sh;

            function s(t) {
                if ("Shape" === t || "shape" === t || "Path" === t || "path" === t ||
                    "ADBE Vector Shape" === t || 2 === t) return s.path
            }
            return i.setGroupProperty(function (t) {
                return 1 == t ? s : r(--t)
            }), Object.defineProperties(s, {
                path: {
                    get: function () {
                        return i.k && i.getValue(), i
                    }
                },
                shape: {
                    get: function () {
                        return i.k && i.getValue(), i
                    }
                },
                _name: {
                    value: t.nm
                },
                ix: {
                    value: t.ix
                },
                propertyIndex: {
                    value: t.ix
                },
                mn: {
                    value: t.mn
                }
            }), s
        }
        return function (t, e, r) {
            var i;

            function s(t) {
                if ("number" == typeof t) return i[t - 1];
                for (var e = 0, r = i.length; e < r;) {
                    if (i[e]._name === t) return i[e];
                    e += 1
                }
            }
            return s.propertyGroup = r, i = m(t, e, s), s.numProperties = i.length, s
        }
    }(),
        TextExpressionInterface = function (e) {
            var r;

            function t() { }
            return Object.defineProperty(t, "sourceText", {
                get: function () {
                    e.textProperty.getValue();
                    var t = e.textProperty.currentData.t;
                    return void 0 !== t && (e.textProperty.currentData.t = void 0, (r =
                        new String(t)).value = t || new String(t)), r
                }
            }), t
        },
        LayerExpressionInterface = function () {
            function s(t, e) {
                var r = new Matrix;
                if (r.reset(), this._elem.finalTransform.mProp.applyToMatrix(r), this._elem.hierarchy &&
                    this._elem.hierarchy.length) {
                    var i, s = this._elem.hierarchy.length;
                    for (i = 0; i < s; i += 1) this._elem.hierarchy[i].finalTransform.mProp
                        .applyToMatrix(r);
                    return r.applyToPointArray(t[0], t[1], t[2] || 0)
                }
                return r.applyToPointArray(t[0], t[1], t[2] || 0)
            }

            function a(t, e) {
                var r = new Matrix;
                if (r.reset(), this._elem.finalTransform.mProp.applyToMatrix(r), this._elem.hierarchy &&
                    this._elem.hierarchy.length) {
                    var i, s = this._elem.hierarchy.length;
                    for (i = 0; i < s; i += 1) this._elem.hierarchy[i].finalTransform.mProp
                        .applyToMatrix(r);
                    return r.inversePoint(t)
                }
                return r.inversePoint(t)
            }

            function n(t) {
                var e = new Matrix;
                if (e.reset(), this._elem.finalTransform.mProp.applyToMatrix(e), this._elem.hierarchy &&
                    this._elem.hierarchy.length) {
                    var r, i = this._elem.hierarchy.length;
                    for (r = 0; r < i; r += 1) this._elem.hierarchy[r].finalTransform.mProp
                        .applyToMatrix(e);
                    return e.inversePoint(t)
                }
                return e.inversePoint(t)
            }

            function o() {
                return [1, 1, 1, 1]
            }
            return function (e) {
                var r;

                function i(t) {
                    switch (t) {
                        case "ADBE Root Vectors Group":
                        case "Contents":
                        case 2:
                            return i.shapeInterface;
                        case 1:
                        case 6:
                        case "Transform":
                        case "transform":
                        case "ADBE Transform Group":
                            return r;
                        case 4:
                        case "ADBE Effect Parade":
                        case "effects":
                        case "Effects":
                            return i.effect
                    }
                }
                i.toWorld = s, i.fromWorld = a, i.toComp = s, i.fromComp = n, i.sampleImage = o, i
                    .sourceRectAtTime = e.sourceRectAtTime.bind(e);
                var t = getDescriptor(r = TransformExpressionInterface((i._elem = e).finalTransform
                    .mProp), "anchorPoint");
                return Object.defineProperties(i, {
                    hasParent: {
                        get: function () {
                            return e.hierarchy.length
                        }
                    },
                    parent: {
                        get: function () {
                            return e.hierarchy[0].layerInterface
                        }
                    },
                    rotation: getDescriptor(r, "rotation"),
                    scale: getDescriptor(r, "scale"),
                    position: getDescriptor(r, "position"),
                    opacity: getDescriptor(r, "opacity"),
                    anchorPoint: t,
                    anchor_point: t,
                    transform: {
                        get: function () {
                            return r
                        }
                    },
                    active: {
                        get: function () {
                            return e.isInRange
                        }
                    }
                }), i.startTime = e.data.st, i.index = e.data.ind, i.source = e.data.refId, i
                    .height = 0 === e.data.ty ? e.data.h : 100, i.width = 0 === e.data.ty ? e.data
                        .w : 100, i.inPoint = e.data.ip / e.comp.globalData.frameRate, i.outPoint = e
                            .data.op / e.comp.globalData.frameRate, i._name = e.data.nm, i
                                .registerMaskInterface = function (t) {
                                    i.mask = new MaskManagerInterface(t, e)
                                }, i.registerEffectsInterface = function (t) {
                                    i.effect = t
                                }, i
            }
        }(),
        CompExpressionInterface = function (i) {
            function t(t) {
                for (var e = 0, r = i.layers.length; e < r;) {
                    if (i.layers[e].nm === t || i.layers[e].ind === t) return i.elements[e]
                        .layerInterface;
                    e += 1
                }
                return null
            }
            return Object.defineProperty(t, "_name", {
                value: i.data.nm
            }), (t.layer = t).pixelAspect = 1, t.height = i.data.h || i.globalData.compSize.h, t
                .width = i.data.w || i.globalData.compSize.w, t.pixelAspect = 1, t.frameDuration = 1 / i
                    .globalData.frameRate, t.displayStartTime = 0, t.numLayers = i.layers.length, t
        },
        TransformExpressionInterface = function (t) {
            function e(t) {
                switch (t) {
                    case "scale":
                    case "Scale":
                    case "ADBE Scale":
                    case 6:
                        return e.scale;
                    case "rotation":
                    case "Rotation":
                    case "ADBE Rotation":
                    case "ADBE Rotate Z":
                    case 10:
                        return e.rotation;
                    case "ADBE Rotate X":
                        return e.xRotation;
                    case "ADBE Rotate Y":
                        return e.yRotation;
                    case "position":
                    case "Position":
                    case "ADBE Position":
                    case 2:
                        return e.position;
                    case "ADBE Position_0":
                        return e.xPosition;
                    case "ADBE Position_1":
                        return e.yPosition;
                    case "ADBE Position_2":
                        return e.zPosition;
                    case "anchorPoint":
                    case "AnchorPoint":
                    case "Anchor Point":
                    case "ADBE AnchorPoint":
                    case 1:
                        return e.anchorPoint;
                    case "opacity":
                    case "Opacity":
                    case 11:
                        return e.opacity
                }
            }
            if (Object.defineProperty(e, "rotation", {
                get: ExpressionPropertyInterface(t.r || t.rz)
            }), Object.defineProperty(e, "zRotation", {
                get: ExpressionPropertyInterface(t.rz || t.r)
            }), Object.defineProperty(e, "xRotation", {
                get: ExpressionPropertyInterface(t.rx)
            }), Object.defineProperty(e, "yRotation", {
                get: ExpressionPropertyInterface(t.ry)
            }), Object.defineProperty(e, "scale", {
                get: ExpressionPropertyInterface(t.s)
            }), t.p) var r = ExpressionPropertyInterface(t.p);
            return Object.defineProperty(e, "position", {
                get: function () {
                    return t.p ? r() : [t.px.v, t.py.v, t.pz ? t.pz.v : 0]
                }
            }), Object.defineProperty(e, "xPosition", {
                get: ExpressionPropertyInterface(t.px)
            }), Object.defineProperty(e, "yPosition", {
                get: ExpressionPropertyInterface(t.py)
            }), Object.defineProperty(e, "zPosition", {
                get: ExpressionPropertyInterface(t.pz)
            }), Object.defineProperty(e, "anchorPoint", {
                get: ExpressionPropertyInterface(t.a)
            }), Object.defineProperty(e, "opacity", {
                get: ExpressionPropertyInterface(t.o)
            }), Object.defineProperty(e, "skew", {
                get: ExpressionPropertyInterface(t.sk)
            }), Object.defineProperty(e, "skewAxis", {
                get: ExpressionPropertyInterface(t.sa)
            }), Object.defineProperty(e, "orientation", {
                get: ExpressionPropertyInterface(t.or)
            }), e
        },
        ProjectInterface = function () {
            function e(t) {
                this.compositions.push(t)
            }
            return function () {
                function t(t) {
                    for (var e = 0, r = this.compositions.length; e < r;) {
                        if (this.compositions[e].data && this.compositions[e].data.nm === t)
                            return this.compositions[e].prepareFrame && this.compositions[e].data
                                .xt && this.compositions[e].prepareFrame(this.currentFrame), this
                                    .compositions[e].compInterface;
                        e += 1
                    }
                }
                return t.compositions = [], t.currentFrame = 0, t.registerComposition = e, t
            }
        }(),
        EffectsExpressionInterface = function () {
            function l(s, t, e, r) {
                var i, a = [],
                    n = s.ef.length;
                for (i = 0; i < n; i += 1) 5 === s.ef[i].ty ? a.push(l(s.ef[i], t.effectElements[i], t
                    .effectElements[i].propertyGroup, r)) : a.push(p(t.effectElements[i], s.ef[i]
                        .ty, r, o));

                function o(t) {
                    return 1 === t ? h : e(t - 1)
                }
                var h = function (t) {
                    for (var e = s.ef, r = 0, i = e.length; r < i;) {
                        if (t === e[r].nm || t === e[r].mn || t === e[r].ix) return 5 === e[r].ty ?
                            a[r] : a[r]();
                        r += 1
                    }
                    return a[0]()
                };
                return h.propertyGroup = o, "ADBE Color Control" === s.mn && Object.defineProperty(h,
                    "color", {
                    get: function () {
                        return a[0]()
                    }
                }), Object.defineProperty(h, "numProperties", {
                    get: function () {
                        return s.np
                    }
                }), h.active = h.enabled = 0 !== s.en, h
            }

            function p(t, e, r, i) {
                var s = ExpressionPropertyInterface(t.p);
                return t.p.setGroupProperty && t.p.setGroupProperty(i),
                    function () {
                        return 10 === e ? r.comp.compInterface(t.p.v) : s()
                    }
            }
            return {
                createEffectsInterface: function (s, t) {
                    if (s.effectsManager) {
                        var e, a = [],
                            r = s.data.ef,
                            i = s.effectsManager.effectElements.length;
                        for (e = 0; e < i; e += 1) a.push(l(r[e], s.effectsManager.effectElements[
                            e], t, s));
                        return function (t) {
                            for (var e = s.data.ef || [], r = 0, i = e.length; r < i;) {
                                if (t === e[r].nm || t === e[r].mn || t === e[r].ix) return a[
                                    r];
                                r += 1
                            }
                        }
                    }
                }
            }
        }(),
        MaskManagerInterface = function () {
            function a(t, e) {
                this._mask = t, this._data = e
            }
            Object.defineProperty(a.prototype, "maskPath", {
                get: function () {
                    return this._mask.prop.k && this._mask.prop.getValue(), this._mask.prop
                }
            }), Object.defineProperty(a.prototype, "maskOpacity", {
                get: function () {
                    return this._mask.op.k && this._mask.op.getValue(), 100 * this._mask.op
                        .v
                }
            });
            return function (e, t) {
                var r, i = createSizedArray(e.viewData.length),
                    s = e.viewData.length;
                for (r = 0; r < s; r += 1) i[r] = new a(e.viewData[r], e.masksProperties[r]);
                return function (t) {
                    for (r = 0; r < s;) {
                        if (e.masksProperties[r].nm === t) return i[r];
                        r += 1
                    }
                }
            }
        }(),
        ExpressionPropertyInterface = function () {
            var s = {
                pv: 0,
                v: 0,
                mult: 1
            },
                n = {
                    pv: [0, 0, 0],
                    v: [0, 0, 0],
                    mult: 1
                };

            function o(i, s, a) {
                Object.defineProperty(i, "velocity", {
                    get: function () {
                        return s.getVelocityAtTime(s.comp.currentFrame)
                    }
                }), i.numKeys = s.keyframes ? s.keyframes.length : 0, i.key = function (t) {
                    if (i.numKeys) {
                        var e = "";
                        e = "s" in s.keyframes[t - 1] ? s.keyframes[t - 1].s : "e" in s.keyframes[
                            t - 2] ? s.keyframes[t - 2].e : s.keyframes[t - 2].s;
                        var r = "unidimensional" === a ? new Number(e) : Object.assign({}, e);
                        return r.time = s.keyframes[t - 1].t / s.elem.comp.globalData.frameRate, r
                    }
                    return 0
                }, i.valueAtTime = s.getValueAtTime, i.speedAtTime = s.getSpeedAtTime, i
                    .velocityAtTime = s.getVelocityAtTime, i.propertyGroup = s.propertyGroup
            }

            function e() {
                return s
            }
            return function (t) {
                return t ? "unidimensional" === t.propType ? function (t) {
                    t && "pv" in t || (t = s);
                    var e = 1 / t.mult,
                        r = t.pv * e,
                        i = new Number(r);
                    return i.value = r, o(i, t, "unidimensional"),
                        function () {
                            return t.k && t.getValue(), r = t.v * e, i.value !== r && ((i =
                                new Number(r)).value = r, o(i, t, "unidimensional")), i
                        }
                }(t) : function (e) {
                    e && "pv" in e || (e = n);
                    var r = 1 / e.mult,
                        i = e.pv.length,
                        s = createTypedArray("float32", i),
                        a = createTypedArray("float32", i);
                    return s.value = a, o(s, e, "multidimensional"),
                        function () {
                            e.k && e.getValue();
                            for (var t = 0; t < i; t += 1) s[t] = a[t] = e.v[t] * r;
                            return s
                        }
                }(t) : e
            }
        }(),
        q5, r5;

    function SliderEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r)
    }

    function AngleEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r)
    }

    function ColorEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 1, 0, r)
    }

    function PointEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 1, 0, r)
    }

    function LayerIndexEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r)
    }

    function MaskIndexEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r)
    }

    function CheckboxEffect(t, e, r) {
        this.p = PropertyFactory.getProp(e, t.v, 0, 0, r)
    }

    function NoValueEffect() {
        this.p = {}
    }

    function EffectsManager() { }

    function EffectsManager(t, e) {
        var r = t.ef || [];
        this.effectElements = [];
        var i, s, a = r.length;
        for (i = 0; i < a; i++) s = new GroupEffect(r[i], e), this.effectElements.push(s)
    }

    function GroupEffect(t, e) {
        this.init(t, e)
    }
    q5 = function () {
        function r(t, e) {
            return this.textIndex = t + 1, this.textTotal = e, this.v = this.getValue() * this.mult,
                this.v
        }
        return function (t, e) {
            this.pv = 1, this.comp = t.comp, this.elem = t, this.mult = .01, this.propType =
                "textSelector", this.textTotal = e.totalChars, this.selectorValue = 100, this
                    .lastValue = [1, 1, 1], this.k = !0, this.x = !0, this.getValue =
                ExpressionManager.initiateExpression.bind(this)(t, e, this), this.getMult = r,
                this.getVelocityAtTime = expressionHelpers.getVelocityAtTime, this.kf ? this
                    .getValueAtTime = expressionHelpers.getValueAtTime.bind(this) : this
                        .getValueAtTime = expressionHelpers.getStaticValueAtTime.bind(this), this
                            .setGroupProperty = expressionHelpers.setGroupProperty
        }
    }(), r5 = TextSelectorProp.getTextSelectorProp, TextSelectorProp.getTextSelectorProp =
        function (t, e, r) {
            return 1 === e.t ? new q5(t, e, r) : r5(t, e, r)
        }, extendPrototype([DynamicPropertyContainer], GroupEffect), GroupEffect.prototype.getValue =
        GroupEffect.prototype.iterateDynamicProperties, GroupEffect.prototype.init = function (t, e) {
            this.data = t, this.effectElements = [], this.initDynamicPropertyContainer(e);
            var r, i, s = this.data.ef.length,
                a = this.data.ef;
            for (r = 0; r < s; r += 1) {
                switch (i = null, a[r].ty) {
                    case 0:
                        i = new SliderEffect(a[r], e, this);
                        break;
                    case 1:
                        i = new AngleEffect(a[r], e, this);
                        break;
                    case 2:
                        i = new ColorEffect(a[r], e, this);
                        break;
                    case 3:
                        i = new PointEffect(a[r], e, this);
                        break;
                    case 4:
                    case 7:
                        i = new CheckboxEffect(a[r], e, this);
                        break;
                    case 10:
                        i = new LayerIndexEffect(a[r], e, this);
                        break;
                    case 11:
                        i = new MaskIndexEffect(a[r], e, this);
                        break;
                    case 5:
                        i = new EffectsManager(a[r], e, this);
                        break;
                    default:
                        i = new NoValueEffect(a[r], e, this)
                }
                i && this.effectElements.push(i)
            }
        };
    var lottie = {},
        _isFrozen = !1;

    function setLocationHref(t) {
        locationHref = t
    }

    function searchAnimations() {
        !0 === standalone ? animationManager.searchAnimations(animationData, standalone, renderer) :
            animationManager.searchAnimations()
    }

    function setSubframeRendering(t) {
        subframeEnabled = t
    }

    function loadAnimation(t) {
        return !0 === standalone && (t.animationData = JSON.parse(animationData)), animationManager
            .loadAnimation(t)
    }

    function setQuality(t) {
        if ("string" == typeof t) switch (t) {
            case "high":
                defaultCurveSegments = 200;
                break;
            case "medium":
                defaultCurveSegments = 50;
                break;
            case "low":
                defaultCurveSegments = 10
        } else !isNaN(t) && 1 < t && (defaultCurveSegments = t);
        roundValues(!(50 <= defaultCurveSegments))
    }

    function inBrowser() {
        return "undefined" != typeof navigator
    }

    function installPlugin(t, e) {
        "expressions" === t && (expressionsPlugin = e)
    }

    function getFactory(t) {
        switch (t) {
            case "propertyFactory":
                return PropertyFactory;
            case "shapePropertyFactory":
                return ShapePropertyFactory;
            case "matrix":
                return Matrix
        }
    }

    function checkReady() {
        "complete" === document.readyState && (clearInterval(readyStateCheckInterval),
            searchAnimations())
    }

    function getQueryVariable(t) {
        for (var e = queryString.split("&"), r = 0; r < e.length; r++) {
            var i = e[r].split("=");
            if (decodeURIComponent(i[0]) == t) return decodeURIComponent(i[1])
        }
    }
    lottie.play = animationManager.play, lottie.pause = animationManager.pause, lottie.setLocationHref =
        setLocationHref, lottie.togglePause = animationManager.togglePause, lottie.setSpeed =
        animationManager.setSpeed, lottie.setDirection = animationManager.setDirection, lottie.stop =
        animationManager.stop, lottie.searchAnimations = searchAnimations, lottie.registerAnimation =
        animationManager.registerAnimation, lottie.loadAnimation = loadAnimation, lottie
            .setSubframeRendering = setSubframeRendering, lottie.resize = animationManager.resize, lottie
                .goToAndStop = animationManager.goToAndStop, lottie.destroy = animationManager.destroy, lottie
                    .setQuality = setQuality, lottie.inBrowser = inBrowser, lottie.installPlugin = installPlugin,
        lottie.freeze = animationManager.freeze, lottie.unfreeze = animationManager.unfreeze, lottie
            .getRegisteredAnimations = animationManager.getRegisteredAnimations, lottie.__getFactory =
        getFactory, lottie.version = "5.6.2";
    var standalone = "__[STANDALONE]__",
        animationData = "__[ANIMATIONDATA]__",
        renderer = "";
    if (standalone) {
        var scripts = document.getElementsByTagName("script"),
            index = scripts.length - 1,
            myScript = scripts[index] || {
                src: ""
            },
            queryString = myScript.src.replace(/^[^\?]+\??/, "");
        renderer = getQueryVariable("renderer")
    }
    var readyStateCheckInterval = setInterval(checkReady, 100);
    return lottie;
}));



var animationData = {
    "v": "5.6.2",
    "fr": 29.9700012207031,
    "ip": 0,
    "op": 121.000004928431,
    "w": 1920,
    "h": 1080,
    "nm": "Comp 1",
    "ddd": 0,
    "assets": [{
        "id": "image_0",
        "w": 117,
        "h": 195,
        "u": "",
        "p": "data:image/png;base64,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",
        "e": 1
    }, {
        "id": "image_1",
        "w": 133,
        "h": 147,
        "u": "",
        "p": "data:image/png;base64,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",
        "e": 1
    }, {
        "id": "image_2",
        "w": 211,
        "h": 284,
        "u": "",
        "p": "data:image/png;base64,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",
        "e": 1
    }, {
        "id": "image_3",
        "w": 253,
        "h": 485,
        "u": "",
        "p": "data:image/png;base64,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",
        "e": 1
    }, {
        "id": "image_4",
        "w": 278,
        "h": 252,
        "u": "",
        "p": "data:image/png;base64,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",
        "e": 1
    }, {
        "id": "image_5",
        "w": 205,
        "h": 277,
        "u": "",
        "p": "data:image/png;base64,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",
        "e": 1
    }, {
        "id": "image_6",
        "w": 242,
        "h": 275,
        "u": "",
        "p": "data:image/png;base64,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",
        "e": 1
    }, {
        "id": "image_7",
        "w": 23,
        "h": 15,
        "u": "",
        "p": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAPCAMAAAA4caRkAAAAJHpUWHRDcmVhdG9yAAAImXNMyU9KVXBMK0ktUnBNS0tNLikGAEF6Bs5qehXFAAAACXBIWXMAAAABAAAAAQBPJcTWAAAAYFBMVEVHcEx8qbye2O4AAACp5/+n5/+Rx9sAAABbfo5+rcBvlaZUdIB/rsCIuc1/rcCMwNU9VF1PbHaq5/+n5P9wl6qVy9+p6P+q5/+Gucyr5/+f3/+p5/+Uyt+e2e+Ju89/rb91SmorAAAAG3RSTlMAUO8g3yDlECSAe0Dfn7+/WGe/YGB/75+gfxBb4kiNAAAAgElEQVQY022QWRKDIBAFB0EQ3I2aZR56/1vGlIkEsf+mod4sRAeFyynFTDPDmrMeNX9Qt8iWA/+ouhDc8D/3vY15eo5BLYn6jFOUoBap9ktDQmE9a+ieSFosUTqy7xr5wwNB10WYtNofPLgto806xev2V4vkQHYLdubictK9QvEG/BoSUAfjG+sAAAAASUVORK5CYII=",
        "e": 1
    }, {
        "id": "image_8",
        "w": 82,
        "h": 100,
        "u": "",
        "p": "data:image/png;base64,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",
        "e": 1
    }],
    "layers": [{
        "ddd": 0,
        "ind": 1,
        "ty": 2,
        "nm": "Group 5.png",
        "cl": "png",
        "refId": "image_0",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [976, 288, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [58.5, 97.5, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 2,
        "ty": 2,
        "nm": "Group 6.png",
        "cl": "png",
        "refId": "image_1",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [988, 812, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [66.5, 73.5, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 3,
        "ty": 2,
        "nm": "Group 7.png",
        "cl": "png",
        "refId": "image_2",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [1288, 536, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [105.5, 142, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 4,
        "ty": 2,
        "nm": "Group 8.png",
        "cl": "png",
        "refId": "image_3",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [1664, 540, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [126.5, 242.5, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 5,
        "ty": 2,
        "nm": "Group 9.png",
        "cl": "png",
        "refId": "image_4",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [280, 432, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [139, 126, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 6,
        "ty": 2,
        "nm": "Group 10.png",
        "cl": "png",
        "refId": "image_5",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [275.184, 644, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [102.5, 138.5, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 7,
        "ty": 2,
        "nm": "Group 12.png",
        "cl": "png",
        "refId": "image_6",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [668, 538, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [121, 137.5, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 8,
        "ty": 2,
        "nm": "Group.png",
        "cl": "png",
        "refId": "image_7",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [1028, 660, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [11.5, 7.5, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 9,
        "ty": 2,
        "nm": "Group 4.png",
        "cl": "png",
        "refId": "image_8",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [960, 540, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [41, 50, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }, {
        "ddd": 0,
        "ind": 11,
        "ty": 1,
        "nm": "White Solid 1",
        "sr": 1,
        "ks": {
            "o": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 0,
                    "s": [0]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 29.97,
                    "s": [100]
                }, {
                    "i": {
                        "x": [0.25],
                        "y": [1]
                    },
                    "o": {
                        "x": [0.8],
                        "y": [0]
                    },
                    "t": 67,
                    "s": [100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0]
                }],
                "ix": 11
            },
            "r": {
                "a": 0,
                "k": 0,
                "ix": 10
            },
            "p": {
                "a": 0,
                "k": [960, 540, 0],
                "ix": 2
            },
            "a": {
                "a": 0,
                "k": [960, 540, 0],
                "ix": 1
            },
            "s": {
                "a": 1,
                "k": [{
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 0,
                    "s": [0, 0, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 29.97,
                    "s": [100, 100, 100]
                }, {
                    "i": {
                        "x": [0.25, 0.25, 0.25],
                        "y": [1, 1, 1]
                    },
                    "o": {
                        "x": [0.8, 0.8, 0.8],
                        "y": [0, 0, 0]
                    },
                    "t": 67,
                    "s": [100, 100, 100]
                }, {
                    "t": 96.9700039496691,
                    "s": [0, 0, 100]
                }],
                "ix": 6
            }
        },
        "ao": 0,
        "sw": 1920,
        "sh": 1080,
        "sc": "#ffffff",
        "ip": 0,
        "op": 900.000036657751,
        "st": 0,
        "bm": 0
    }],
    "markers": []
};
var params = {
    container: document.getElementById('lottie'),
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: animationData
};

var anim;

anim = lottie.loadAnimation(params);
