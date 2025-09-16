!function() {
    "use strict";
    // 定义日志级别常量
    var t = {
            log: "log",
            debug: "debug",
            info: "info",
            warn: "warn",
            error: "error"
        }
        , e = console // 获取控制台对象
        , n = {}; // 创建空对象存储日志方法
    Object.keys(t).forEach((function(t) {
        n[t] = e[t];
    } // 遍历日志级别并绑定到控制台方法
    ));
    // SDK前缀标识："GUANCE Browser SDK:"
    var r, i = "GUANCE Browser SDK:", o = { //// 0创建日志对象,包装console方法
        debug: n.debug.bind(e, i),
        log: n.log.bind(e, i),
        info: n.info.bind(e, i),
        warn: n.warn.bind(e, i),
        error: n.error.bind(e, i)
    };
    // 获取Zone相关symbol
    function a(t, e) {
        var n, r = window;
        // 检查是否存在Zone并获取symbol
        return r.Zone && "function" == typeof r.Zone.__symbol__ && (n = t[r.Zone.__symbol__(e)]),
        n || (n = t[e]),
        n;
    }
    // 调试模式标志
    var s = !1;
    // 设置调试模式
    function u(t) {
        s = t;
    }
    // 包装函数,添加错误处理
    function c(t) {
        return function() {
            return l(t, this, arguments);
        };
    }
    // 执行函数并处理错误
    function l(t, e, n) {
        try {
            return t.apply(e, n);
        } catch (t) {
            // 错误处理
            if (f(t),
            r)
                try {
                    r(t);
                } catch (t) {
                    f(t);
                }
        }
    }
    // 错误日志记录
    function f() {
        var t = [].slice.call(arguments);
        s && o.error.apply(null, ["[MONITOR]"].concat(t));
    }
    // 包装函数添加错误处理和日志
    function d(t, e) {
        return function() {
            var n = [].slice.call(arguments);
            try {
                return t.apply(this, n);
            } catch (t) {
                o.error(e, t);
            }
        };
    }
    // 类型判断函数
    function p(t) {
        return p = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        ,
        p(t);
    }
    // 获取全局对象
    function v() {
        if ("object" === ("undefined" == typeof globalThis ? "undefined" : p(globalThis)))
            return globalThis;
        // 通过临时属性获取全局对象
        Object.defineProperty(Object.prototype, "_gc_temp_", {
            get: function() {
                return this;
            },
            configurable: !0
        });
        var t = _gc_temp_;
        return delete Object.prototype._gc_temp_,

        "object" !== p(t) && (t = "object" === ("undefined" == typeof self ? "undefined" : p(self)) ? self : "object" === ("undefined" == typeof window ? "undefined" : p(window)) ? window : {}),
        t;
        // 降级处理
    }
    /* 
    日志系统的封装
    错误处理机制
    全局对象获取
   类型判断工具
    函数包装器
    主要：
    浏览器端SDK的初始化
   错误监控和日志记录
全局状态管理
类型安全处理 END
    */

    // 包装 setTimeout，添加错误处理
    function h(t, e) {
        return a(v(), "setTimeout")(c(t), e);
    }
    // 包装 clearTimeout
    function _(t) {
        a(v(), "clearTimeout")(t);
    }
    // 包装 setInterval，添加错误处理
    function g(t, e) {
        return a(v(), "setInterval")(c(t), e);
    }
    // 包装 clearInterval
    function m(t) {
        a(v(), "clearInterval")(t);
    }
    //类型判断函数
    function y(t) {
        return y = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        ,
        y(t);//类型闭包
    }
    // 获取原型对象引用
    var b = Array.prototype
        , E = (Function.prototype,
        Object.prototype)
        , w = b.slice
        , S = E.toString
        , T = E.hasOwnProperty
        , C = b.forEach //获取数组 forEach 方法引用  
        , I = Array.isArray // 获取 Array.isArray 方法引用
        , O = !1 // 标记位
        , A = function(t, e, n) { //forEach 实现
            if (null === t)
                return !1;
            if (C && t.forEach === C) //使用原生 forEach
                t.forEach(e, n);
            else if (t.length === +t.length) { //类数组对象遍历
                for (var r = 0, i = t.length; r < i; r++)
                    if (r in t && e.call(n, t[r], r, t) === O)
                        return !1;
            } else // 对象遍历
                for (var o in t)
                    if (T.call(t, o) && e.call(n, t[o], o, t) === O)
                        return !1;
        };
        //合并对象，对象的浅拷贝
    function x(t) {
        return A(w.call(arguments, 1), (function(e) {
            for (var n in e)
                Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
        }
        )),
        t;
    }
    // 对象克隆
    function R(t) {
        return x({}, t);
    }
    // 对象合并,忽略undefined值
    var k = function(t) {
            return A(w.call(arguments, 1), (function(e) {
                for (var n in e)
                    void 0 !== e[n] && (t[n] = e[n]);
            }
            )),
            t;
        }
        , N = function(t) { // 深度合并对象
            return A(w.call(arguments, 1), (function(e) {
                for (var n in e)
                    void 0 !== e[n] && (j(e[n]) && j(t[n]) ? k(t[n], e[n]) : t[n] = e[n]);
            }
            )),
            t;
        }
        , L = I || function(t) {// 数组判断
            return "[object Array]" === S.call(t);
        }
        , D = function(t) { // 函数判断
            if (!t)
                return !1;
            try {
                return /^\s*\bfunction\b/.test(t);
            } catch (t) {
                return !1;
            }
        }
        , P = function(t) { // 转换为数组
            return t ? t.toArray ? t.toArray() : L(t) ? w.call(t) : (e = t) && T.call(e, "callee") ? w.call(t) : M(t) : [];
            var e;
        }
        , M = function(t) { // 将对象转换为数组
            var e = [];
            return null === t || A(t, (function(t) {
                e[e.length] = t;
            }
            )),
            e;
        }
        , U = function(t) {// 获取对象的键数组
            var e = [];
            return null === t || A(t, (function(t, n) {
                e[e.length] = n;
            }
            )),
            e;
        }/* 定时器方法的包装和错误处理
数组和对象的工具方法:
遍历方法
对象合并
类型判断
数组转换
原型方法的引用和包装
这些都是SDK的基础工具方法，用于:
安全的定时器操作
数据结构的处理和转换
类型安全的对象操作 end */
        , V = function(t, e, n) {//// 数组过滤方法
            if (t.filter)
                return t.filter(e); // 使用原生 filter 如果可用
            for (var r = [], i = 0; i < t.length; i++)// 手动实现过滤
                if (T.call(t, i)) {
                    var o = t[i];
                    e.call(n, o, i, t) && r.push(o);// 调用回调函数判断是否保留元素
                }
            return r;
        }
        , B = function(t, e, n) {// 数组映射方法
            if (t.map)
                return t.map(e);  // 使用原生 map 如果可用
            for (var r = [], i = 0; i < t.length; i++)  // 手动实现映射
                if (T.call(t, i)) {
                    var o = t[i];
                    r.push(e.call(n, o, i, t));
                }
            return r;
        }
        , z = function(t, e, n) { // 数组some方法实现
            if (t.some)
                return t.some(e);  // 使用原生 some 如果可用
            for (var r = !1, i = 0; i < t.length; i++)  // 手动实现some
                if (T.call(t, i)) {// 检查索引是否存在
                    var o = t[i];// 获取当前元素
                    if (e.call(n, o, i, t)) { // 调用回调函数判断是否满足条件
                        r = !0;// 设置标志位
                        break;
                    }
                }
            return r;
        }
        , H = function(t, e, n) {// 数组every方法实现
            if (t.every)
                return t.every(e);// 使用原生 every 如果可用
            for (var r = !0, i = 0; i < t.length; i++)// 手动实现every
                if (T.call(t, i)) {
                    var o = t[i];// 获取当前元素
                    if (!e.call(n, o, i, t)) {////   调用回调函数判断是否满足条件
                        r = !1;
                        break;
                    }
                }
            return r;
        }
        , F = function(t, e, n) {// 数组查找方法
            return void 0 === n && (n = !1),// 默认值
            z(t, (function(t) {// 遍历数组
                try {
                    if ("function" == typeof t)// 函数类型
                        return t(e);
                    if (t instanceof RegExp)// 正则表达式类型
                        return t.test(e);// 测试是否匹配
                    if ("string" == typeof t)// 字符串类型
                        return n ? jt(e, t) : t === e;// 是否严格匹配
                } catch (t) {
                    o.error(t);
                }
                return !1;
            }
            ));
        }
        , W = function(t) {// 字符串转义 // CSS转义函数
            return t += "",// 添加空字符串
            // 使用CSS.escape方法转义字符串
            window.CSS && window.CSS.escape ? window.CSS.escape(t) : t.replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g, (function(t, e) {// 替换特殊字符
                return e ? "\0" === t ? "�" : t.slice(0, -1) + "\\" + t.charCodeAt(t.length - 1).toString(16) + " " : "\\" + t; 
            }// 替换特殊字符
            ));
        }
        , j = function(t) {// 对象判断
            return null !== t && "[object Object]" === S.call(t);
        }
        , G = function(t) { // 判断对象是否为空
            if (j(t)) {
                for (var e in t)
                    if (T.call(t, e))
                        return !1;
                return !0;
            }
            return !1;
        }
        , $ = function(t) { // 将对象转换为键值对数组  
            var e = [];
            return A(t, (function(t, n) {
                e.push([n, t]);
            }
            )),
            e;
        }
        , K = function(t) { // 判断是否为字符串
            return "[object String]" === S.call(t);
        }
        , q = function(t) {// 判断是否为布尔值
            return "[object Boolean]" === S.call(t);
        }
        , Z = function(t) { // 判断是否为数字
            return "[object Number]" === S.call(t) && /[\d\.]+/.test(String(t));
        }
        , Y = (Date.now,
        function(t, e, n) {// 节流函数
            var r, i, o = !n || void 0 === n.leading || n.leading,// 是否立即执行
                a = !n || void 0 === n.trailing || n.trailing, // 是否在最后执行
                s = !1, // 是否执行过
                u = this; //  上下文
            return {
                throttled: function() {// 节流函数
                    s ? r = arguments : (o ? t.apply(u, arguments) : r = arguments,
                    s = !0,
                    i = h((function() {// 执行节流函数
                        a && r && t.apply(u, r),
                        s = !1,
                        r = void 0;
                    }
                    ), e));
                },
                cancel: function() {// 取消节流
                    _(i),
                    s = !1,
                    r = void 0;
                }
            };
        }
        )
        /* 数组操作方法的兼容实现：
filter (过滤)
map (映射)
some (任一满足)
every (全部满足)
类型判断工具：
字符串判断
布尔值判断
数字判断
对象判断
功能性工具方法：
CSS转义
对象转换
节流控制
这些都是SDK的核心工具方法，用于：
数据处理和转换
类型安全检查
性能优化
兼容性处理 end */
        , X = function(t) {// Base64编码实现
            // 如果有原生btoa方法则使用
            if ("function" == typeof btoa)
                return btoa(encodeURIComponent(t).replace(/%([0-9A-F]{2})/g, (function(t, e) {
                    return String.fromCharCode("0x" + e);
                }
                )));
                // 如果没有原生btoa方法则使用自定义实现  // 手动实现Base64编码
            var e, n, r, i, o, a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", s = 0, u = 0, c = "", l = []; //  // Base64字符表
            if (!(t = String(t))) // 如果t不是字符串则返回t
                return t;
            t = function(t) { // 手动实现Base64编码  // UTF-8编码处理
                var e, n, r, i, o = "";
                for (e = n = 0,
                r = (t = (t + "").replace(/\r\n/g, "\n").replace(/\r/g, "\n")).length,
                i = 0; i < r; i++) {
                    var a = t.charCodeAt(i)
                        , s = null;
                    a < 128 ? n++ : s = a > 127 && a < 2048 ? String.fromCharCode(a >> 6 | 192, 63 & a | 128) : String.fromCharCode(a >> 12 | 224, a >> 6 & 63 | 128, 63 & a | 128),
                    null !== s && (n > e && (o += t.substring(e, n)),
                    o += s,
                    e = n = i + 1);
                }
                return n > e && (o += t.substring(e, t.length)),
                o;
            }(t);
            // Base64编码主循环
            do {
                e = (o = t.charCodeAt(s++) << 16 | t.charCodeAt(s++) << 8 | t.charCodeAt(s++)) >> 18 & 63,
                n = o >> 12 & 63,
                r = o >> 6 & 63,
                i = 63 & o,
                l[u++] = a.charAt(e) + a.charAt(n) + a.charAt(r) + a.charAt(i);
            } while (s < t.length);
            // 根据字符串长度处理Base64编码结果  处理结尾补位
            switch (c = l.join(""),
            t.length % 3) {
                case 1:
                    c = c.slice(0, -2) + "==";
                    break;
                case 2:
                    c = c.slice(0, -1) + "=";
            }
            return c;
        };
        // 生成UUID
    function Q(t) {
        return t ? (parseInt(t, 10) ^ 16 * Math.random() >> parseInt(t, 10) / 4).toString(16) : "".concat(1e7, "-", 1e3, "-", 4e3, "-", 8e3, "-", 1e11).replace(/[018]/g, Q);
    }
    // 路径规范化
    function J(t) {
        var e = "";
        return t && (e = t.replace(/\/([^\/]*)\d([^\/]*)/g, "/?").replace(/\/$/g, "")),
        e || "/";
    }
    // URL解析器
    var tt = function(t) {
        var e = function(t) {
            // 定义URL各部分字段索引
            this._fields = {
                Username: 4, // 用户名
                Password: 5,// 密码
                Port: 7,// 端口
                Protocol: 2,// 协议
                Host: 6,// 主机
                Path: 8,// 路径
                URL: 0,// URL
                QueryString: 9,// 查询字符串
                Fragment: 10
            },
            this._values = {},
            this._regex = null,
            // 定义URL解析正则表达式
            this._regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/,
            void 0 !== t && this._parse(t);
        };
        // 设置URL
        return e.prototype.setUrl = function(t) {// 设置URL
            this._parse(t);
        }
        ,
        // 初始化URL各部分字段
        e.prototype._initValues = function() {
            for (var t in this._fields)
                this._values[t] = "";
        }
        ,
        // 添加查询字符串
        e.prototype.addQueryString = function(t) {// 添加查询字符串
            if ("object" !== y(t))
                return !1;
            var e = this._values.QueryString || "";
            for (var n in t)
                e = new RegExp(n + "[^&]+").test(e) ? e.replace(new RegExp(n + "[^&]+"), n + "=" + t[n]) : "&" === e.slice(-1) ? e + n + "=" + t[n] : "" === e ? n + "=" + t[n] : e + "&" + n + "=" + t[n];
            this._values.QueryString = e;
        }
        ,
        e.prototype.getParse = function() {// 获取解析后的URL各部分字段
            return this._values;
        }
        ,
        e.prototype.getUrl = function() {// 获取URL
            var t = "";
            return t += this._values.Origin,
            t += this._values.Path,
            t += this._values.QueryString ? "?" + this._values.QueryString : "";
        }
        ,
        e.prototype._parse = function(t) {
            this._initValues();
            var e = this._regex.exec(t);
            if (!e)
                throw "DPURLParser::_parse -> Invalid URL";
            for (var n in this._fields)
                void 0 !== e[this._fields[n]] && (this._values[n] = e[this._fields[n]]);
            this._values.Path = this._values.Path || "/", // 路径   
            this._values.Hostname = this._values.Host.replace(/:\d+$/, ""), // 主机
            this._values.Origin = this._values.Protocol + "://" + this._values.Hostname + (this._values.Port ? ":" + this._values.Port : ""); // 源
        }
        ,
        new e(t);// 初始化URL解析器
    };
    /* Base64编码：
支持原生btoa
自实现编码逻辑
UTF-8字符处理
UUID生成器：
随机UUID生成
基于输入的UUID变体
URL处理工具：
URL解析器
路径规范化
查询参数处理
这些是SDK中的编码、解析和标识符生成工具，用于：
数据编码和传输
唯一标识生成
URL解析和处理 END */
    var et = function(t) {// 解析查询字符串
            var e = {}
                , n = t.split("?")[1] || "";// 
            return n && (e = nt("?" + n)),
            e;
        }
        , nt = function(t) {//
            // 解码函数
            for (var e = function(t) {
                    return decodeURIComponent(t);// 解码
                }, n = {}, r = (t = t || "").substring(1).split("&"), i = 0; i < r.length; i++) {
                var o = r[i].indexOf("=");
                if (-1 !== o) {
                    var a = r[i].substring(0, o)
                        , s = r[i].substring(o + 1);
                    a = e(a),
                    s = e(s),
                    n[a] = s;
                }
            }
            return n;
        };
    function rt(t) {// 类型判断
        return null === t ? "null" : Array.isArray(t) ? "array" : y(t);
    }
    function it(t, e, n) {// 深度克隆
        if (void 0 === n && (n = function() {
            if ("undefined" != typeof WeakSet) {
                var t = new WeakSet;
                return {
                    hasAlreadyBeenSeen: function(e) {// 是否已经访问过
                        var n = t.has(e);
                        return n || t.add(e),
                        n;
                    }
                };
            }
            var e = [];
            return {
                hasAlreadyBeenSeen: function(t) {// 是否已经访问过
                    var n = e.indexOf(t) >= 0;
                    return n || e.push(t),
                    n;
                }
            };
        }()),
        void 0 === e)
            return t;
        if ("object" !== y(e) || null === e)
            return e;
        if (e instanceof Date)
            return new Date(e.getTime());
        if (e instanceof RegExp) {
            var r = e.flags || [e.global ? "g" : "", e.ignoreCase ? "i" : "", e.multiline ? "m" : "", e.sticky ? "y" : "", e.unicode ? "u" : ""].join("");
            return new RegExp(e.source,r);
        }
        if (!n.hasAlreadyBeenSeen(e)) {
            if (Array.isArray(e)) {// 数组
                for (var i = Array.isArray(t) ? t : [], o = 0; o < e.length; ++o)
                    i[o] = it(i[o], e[o], n);
                return i;
            }
            i = "object" === rt(t) ? t : {};
            for (var a in e)
                Object.prototype.hasOwnProperty.call(e, a) && (i[a] = it(i[a], e[a], n));
            return i;
        }
    }
    function ot(t) {// 深度克隆
        return it(void 0, t);
    }
    function at(t) {// 字符串处理
        return t ? String(t).substr(0, 1) + String(t).substr(1).replace(/\d*/g, "x") : 0 === t ? void 0 : t;
    }
    function st() {}
    var ut, ct = 1e3, lt = 60 * ct, ft = 60 * lt, dt = 365 * (24 * ft);// 时间常量
    function pt(t) {// 随机数
        return 0 !== t && 100 * Math.random() <= t;
    }
    function vt(t, e) {// 小数处理
        return +t.toFixed(e);
    }
    function ht(t) {// 数字处理
        return "number" != typeof t ? t : vt(1e6 * t, 0);
    }
    function _t(t) {// 数字处理
        return Z(t) ? vt(1e6 * t, 0) : t;
    }
    function gt(t) {// 时间处理
        return t - At();
    }
    function mt(t) {// 时间处理
        return Math.round(At() + t);
    }
    function yt() {// 时间处理
        return performance.now();
    }
    function bt() {// 时间处理
        return {
            relative: yt(),
            timeStamp: Et()
        };
    }
    function Et() {// 时间处理
        return wt();
    }
    function wt() {// 时间处理
        return (new Date).getTime();
    }
    function St(t, e) {// 时间处理
        return e - t;
    }
    function Tt() {// 时间处理
        return {
            relative: 0,
            timeStamp: At()
        };
    }
    function Ct(t) {// 时间处理
        return {
            relative: t,
            timeStamp: Ot(t)
        };
    }
    function It(t, e) {// 时间处理
        return t + e;
    }
    function Ot(t) {// 时间处理
        var e = wt() - performance.now();
        return e > At() ? Math.round(e + t) : mt(t);
    }
    function At() {// 时间处理
        return void 0 === ut && (ut = performance.timing.navigationStart),
        ut;
    }
    var xt = /([\w-]+)\s*=\s*([^;]+)/g;
    function Rt(t, e) {// 时间处理
        for (var n = e.split("."); n.length; ) {
            var r = n.shift();
            if (!(t && j(t) && r in t && T.call(t, r)))
                return;
            t = t[r];
        }
        return t;
    }
    function kt(t, e) {// 字符串处理
        var n = t.charCodeAt(e - 1);
        return n >= 55296 && n <= 56319 ? t.slice(0, e + 1) : t.slice(0, e);
    }
    function Nt(t) {// 字符串处理
        var e = rt(t);
        return "string" === e || "function" === e || t instanceof RegExp;
    }
    function Lt(t, e) {// 字符串处理
        return -1 !== t.indexOf(e);
    }
    function Dt(t, e) {// 字符串处理
        for (var n = 0; n < t.length; n += 1) {
            var r = t[n];
            if (e(r, n, t))
                return r;
        }
    }
    function Pt(t) {// 数组处理
        if (Array.from)
            return Array.from(t);
        var e = [];
        if (t instanceof Set)
            t.forEach((function(t) {
                e.push(t);
            }
            ));
        else
            for (var n = 0; n < t.length; n++)
                e.push(t[n]);
        return e;
    }
    function Mt(t) {// 数字处理
        return Z(t) && t >= 0 && t <= 100;
    }
    var Ut, Vt = {
        IE: 0,
        CHROMIUM: 1,
        SAFARI: 2,
        OTHER: 3
    };
    function Bt() {// 浏览器类型处理
        return Wt(Ut, Ut = function(t) {
            var e;
            void 0 === t && (t = window);
            var n = t.navigator.userAgent;
            if (t.chrome || /HeadlessChrome/.test(n))
                return Vt.CHROMIUM;
            if (0 === (null === (e = t.navigator.vendor) || void 0 === e ? void 0 : e.indexOf("Apple")) || /safari/i.test(n) && !/chrome|android/i.test(n))
                return Vt.SAFARI;
            if (t.document.documentMode)
                return Vt.IE;
            return Vt.OTHER;
        }());
    }
    function zt(t) {// 字符串处理
        if (t.origin && "null" !== t.origin)
            return t.origin;
        var e = t.host.replace(/(:80|:443)$/, "");
        return t.protocol + "//" + e;
    }
    function Ht(t) {// 字符串处理
        var e = {};
        return A(t, (function(t, n) {
            var r;
            e[(r = n,
            r.replace(/[A-Z]/g, (function(t, e) {
                return (0 !== e ? "_" : "") + t.toLowerCase();
            }
            )).replace(/-/g, "_"))] = Ft(t);
        }
        )),
        e;
    }
    function Ft(t) {// 字符串处理
        return L(t) ? B(t, (function(t) {
            return Ft(t);
        }
        )) : "object" === y(t) && null !== t ? Ht(t) : t;
    }
    function Wt(t, e) {// 字符串处理
        return null != t ? t : e;
    }
    function jt(t, e) {// 字符串处理
        return t.slice(0, e.length) === e;
    }
    // 字符串处理
    function Gt(t, e) {// 字符串处理
        var n = t.indexOf(e);
        n >= 0 && t.splice(n, 1);
    }
    // 字符串处理
    function $t(t) {// 字符串处理
        var e = t.substr(1);
        return !!e && !!document.getElementById(e);
    }
    // 字符串处理
    function Kt(t) {// 字符串处理
        var e = t.indexOf("?");
        return e < 0 ? t : t.slice(0, e);
    }
    // 数字处理
    function qt(t) {// 字符串处理
        return Z(t) && t < 0 ? void 0 : t;
    }
    var Zt = 500;

    // 缓存
    function Yt() {// 数组处理
        var t = []
            , e = function(e) {
                t.push(e) > Zt && t.splice(0, 1);
            };
        return {
            add: e,
            remove: e,
            drain: function(e) {
                t.forEach((function(t) {
                    t(e);
                }
                )),
                t.length = 0;
            }
        };
    }
    var Xt = 1 / 0
        , Qt = lt;
    // 缓存
    function Jt(t) {// 数组处理
        var e = t.expireDelay
            , n = t.maxEntries
            , r = []
            , i = g((function() {
                return function() {
                    var t = yt() - e;
                    for (; r.length > 0 && r[r.length - 1].endTime < t; )
                        r.pop();
                }();
            }
            ), Qt);
        return {
            // 
            add: function(t, e) {// 数组处理
                var i = {
                    value: t,
                    startTime: e,
                    endTime: Xt,
                    remove: function() {
                        Gt(r, i);
                    },
                    close: function(t) {// 数组处理
                        i.endTime = t;
                    }
                };
                return n && r.length >= n && r.pop(),
                r.unshift(i),
                i;
            },
            // 查找
            find: function(t, e) {// 数组处理
                void 0 === t && (t = Xt),
                void 0 === e && (e = {
                    returnInactive: !1
                });
                for (var n = 0, i = r; n < i.length; n++) {
                    var o = i[n];
                    if (o.startTime <= t) {
                        if (e.returnInactive || t <= o.endTime)
                            return o.value;
                        break;
                    }
                }
            },
            // 关闭活动
            closeActive: function(t) {// 数组处理
                var e = r[0];
                e && e.endTime === Xt && e.close(t);
            },
            //
            findAll: function(t, e) {// 数组处理
                void 0 === t && (t = Xt),
                void 0 === e && (e = 0);
                var n = It(t, e);
                return r.filter((function(e) {
                    return e.startTime <= n && t <= e.endTime;
                }
                )).map((function(t) {
                    return t.value;
                }
                ));
            },
            //
            reset: function() {// 数组处理
                r = [];
            },
            //
            stop: function() {// 数组处理
                m(i);
            }
        };
    }
    // 浏览器信息
    var te = {
            navigator: "undefined" != typeof window && void 0 !== window.navigator ? window.navigator : {},
            infoMap: {// 浏览器信息
                engine: ["WebKit", "Trident", "Gecko", "Presto"],// 引擎
                browser: ["Safari", "Chrome", "Edge", "IE", "IE 11", "IE 10", "IE 9", "IE 8", "IE 7", "Firefox", "Firefox Focus", "Chromium", "Opera", "Vivaldi", "Yandex", "Arora", "Lunascape", "QupZilla", "Coc Coc", "Kindle", "Iceweasel", "Konqueror", "Iceape", "SeaMonkey", "Epiphany", "360", "360SE", "360EE", "UC", "QQBrowser", "QQ", "Baidu", "Maxthon", "Sogou", "LBBROWSER", "2345Explorer", "TheWorld", "XiaoMi", "Quark", "Qiyu", "Wechat", , "WechatWork", "Taobao", "Alipay", "Weibo", "Douban", "Suning", "iQiYi"],// 浏览器
                os: ["Windows", "Linux", "Mac OS", "Android", "Ubuntu", "FreeBSD", "Debian", "iOS", "Windows Phone", "BlackBerry", "MeeGo", "Symbian", "Chrome OS", "WebOS"],// 操作系统
                device: ["Mobile", "Tablet", "iPad"]
            }
        }
        , ee = {
            // 匹配
            getMatchMap: c((function(t) { // 字符串处理
                return {
                    Trident: t.indexOf("Trident") > -1 || t.indexOf("NET CLR") > -1,
                    Presto: t.indexOf("Presto") > -1,// 
                    WebKit: t.indexOf("AppleWebKit") > -1,// 
                    Gecko: t.indexOf("Gecko/") > -1,// 
                    Safari: t.indexOf("Safari") > -1,// 
                    Chrome: t.indexOf("Chrome") > -1 || t.indexOf("CriOS") > -1,// 
                    IE: t.indexOf("MSIE") > -1 || t.indexOf("Trident") > -1,
                    Edge: t.indexOf("Edge") > -1 || t.indexOf("Edg") > -1,
                    Firefox: t.indexOf("Firefox") > -1 || t.indexOf("FxiOS") > -1,
                    "Firefox Focus": t.indexOf("Focus") > -1,
                    Chromium: t.indexOf("Chromium") > -1,
                    Opera: t.indexOf("Opera") > -1 || t.indexOf("OPR") > -1,
                    Vivaldi: t.indexOf("Vivaldi") > -1,
                    Yandex: t.indexOf("YaBrowser") > -1,
                    Arora: t.indexOf("Arora") > -1,
                    Lunascape: t.indexOf("Lunascape") > -1,
                    QupZilla: t.indexOf("QupZilla") > -1,
                    "Coc Coc": t.indexOf("coc_coc_browser") > -1,
                    Kindle: t.indexOf("Kindle") > -1 || t.indexOf("Silk/") > -1,
                    Iceweasel: t.indexOf("Iceweasel") > -1,
                    Konqueror: t.indexOf("Konqueror") > -1,
                    Iceape: t.indexOf("Iceape") > -1,
                    SeaMonkey: t.indexOf("SeaMonkey") > -1,
                    Epiphany: t.indexOf("Epiphany") > -1,
                    360: t.indexOf("QihooBrowser") > -1 || t.indexOf("QHBrowser") > -1,
                    "360EE": t.indexOf("360EE") > -1,
                    "360SE": t.indexOf("360SE") > -1,
                    UC: t.indexOf("UC") > -1 || t.indexOf(" UBrowser") > -1,
                    QQBrowser: t.indexOf("QQBrowser") > -1,
                    QQ: t.indexOf("QQ/") > -1,
                    Baidu: t.indexOf("Baidu") > -1 || t.indexOf("BIDUBrowser") > -1,
                    Maxthon: t.indexOf("Maxthon") > -1,
                    Sogou: t.indexOf("MetaSr") > -1 || t.indexOf("Sogou") > -1,
                    LBBROWSER: t.indexOf("LBBROWSER") > -1,
                    "2345Explorer": t.indexOf("2345Explorer") > -1,
                    TheWorld: t.indexOf("TheWorld") > -1,
                    XiaoMi: t.indexOf("MiuiBrowser") > -1,
                    Quark: t.indexOf("Quark") > -1,
                    Qiyu: t.indexOf("Qiyu") > -1,
                    Wechat: t.indexOf("MicroMessenger") > -1,
                    Taobao: t.indexOf("AliApp(TB") > -1,
                    Alipay: t.indexOf("AliApp(AP") > -1,
                    Weibo: t.indexOf("Weibo") > -1,
                    Douban: t.indexOf("com.douban.frodo") > -1,
                    Suning: t.indexOf("SNEBUY-APP") > -1,
                    iQiYi: t.indexOf("IqiyiApp") > -1,
                    Windows: t.indexOf("Windows") > -1,
                    Linux: t.indexOf("Linux") > -1 || t.indexOf("X11") > -1,
                    "Mac OS": t.indexOf("Macintosh") > -1,
                    Android: t.indexOf("Android") > -1 || t.indexOf("Adr") > -1,
                    Ubuntu: t.indexOf("Ubuntu") > -1,
                    FreeBSD: t.indexOf("FreeBSD") > -1,
                    Debian: t.indexOf("Debian") > -1,
                    "Windows Phone": t.indexOf("IEMobile") > -1 || t.indexOf("Windows Phone") > -1,
                    BlackBerry: t.indexOf("BlackBerry") > -1 || t.indexOf("RIM") > -1,
                    MeeGo: t.indexOf("MeeGo") > -1,
                    Symbian: t.indexOf("Symbian") > -1,
                    iOS: t.indexOf("like Mac OS X") > -1,
                    "Chrome OS": t.indexOf("CrOS") > -1,
                    WebOS: t.indexOf("hpwOS") > -1,
                    Mobile: t.indexOf("Mobi") > -1 || t.indexOf("iPh") > -1 || t.indexOf("480") > -1,
                    Tablet: t.indexOf("Tablet") > -1 || t.indexOf("Nexus 7") > -1,
                    iPad: t.indexOf("iPad") > -1
                };
            }
            )),
            // 匹配
            matchInfoMap: c((function(t) {
                var e = te.navigator.userAgent || ""
                    , n = ee.getMatchMap(e);
                for (var r in te.infoMap)
                    for (var i = 0; i < te.infoMap[r].length; i++) {
                        var o = te.infoMap[r][i];
                        n[o] && (t[r] = o);
                    }
            }
            )),
            // 获取操作系统
            getOS: c((function() {//
                return ee.matchInfoMap(this),
                this.os || "Unknown";
            }
            )),
            // 获取操作系统版本
            getOSVersion: c((function() {
                var t = this
                    , e = te.navigator.userAgent || "";
                t.osVersion = "",
                t.osMajor = "";
                var n = {
                    Windows: function() {
                        var t = e.replace(/^.*Windows NT ([\d.]+);.*$/, "$1");
                        return {
                            6.4: "10",
                            6.3: "8.1",
                            6.2: "8",
                            6.1: "7",
                            "6.0": "Vista",
                            5.2: "XP",
                            5.1: "XP",
                            "5.0": "2000"
                        }[t] || t;
                    },
                    Android: function() {
                        return e.replace(/^.*Android ([\d.]+);.*$/, "$1");
                    },
                    iOS: function() {
                        return e.replace(/^.*OS ([\d_]+) like.*$/, "$1").replace(/_/g, ".");
                    },
                    Debian: function() {
                        return e.replace(/^.*Debian\/([\d.]+).*$/, "$1");
                    },
                    "Windows Phone": function() {
                        return e.replace(/^.*Windows Phone( OS)? ([\d.]+);.*$/, "$2");
                    },
                    "Mac OS": function() {
                        return e.replace(/^.*Mac OS X ([\d_]+).*$/, "$1").replace(/_/g, ".");
                    },
                    WebOS: function() {
                        return e.replace(/^.*hpwOS\/([\d.]+);.*$/, "$1");
                    }
                };
                return n[t.os] && (t.osVersion = n[t.os](),
                t.osVersion === e && (t.osVersion = "")),
                t.osVersion && (t.osMajor = t.osVersion.split(".").length && t.osVersion.split(".")[0]),
                {
                    version: t.osVersion,
                    osMajor: t.osMajor
                };
            }
            )),
            // 获取屏幕方向
            getOrientationStatu: c((function() {
                return window.matchMedia("(orientation: portrait)").matches ? "竖屏" : "横屏";
            }
            )),
            // 获取设备类型
            getDeviceType: c((function() {
                var t = this;
                return t.device = "PC",
                ee.matchInfoMap(t),
                t.device;
            }
            )),
            // 获取网络类型
            getNetwork: c((function() {
                var t = window.navigator.connection || window.navigator.mozConnection || window.navigator.webkitConnection
                    , e = "unknown"
                    , n = t ? t.type || t.effectiveType : null;
                if (n && "string" == typeof n)
                    switch (n) {
                        case "bluetooth":
                        case "cellular":
                        case "slow-2g":
                        case "2g":
                        case "3g":
                            e = "cellular";
                            break;
                        case "none":
                            e = "none";
                            break;
                        case "ethernet":
                        case "wifi":
                        case "wimax":
                        case "4g":
                            e = "wifi";
                            break;
                        case "other":
                        case "unknown":
                            e = "unknown";
                    }
                return e;
            }
            )),
            // 获取语言
            getLanguage: c((function() {
                var t;
                return this.language = ((t = (te.navigator.browserLanguage || te.navigator.language || "").split("-"))[1] && (t[1] = t[1].toUpperCase()),
                t.join("_")),
                this.language;
            }
            )),
            // 获 取浏览器信息
            getBrowserInfo: c((function() {
                var t = this;
                ee.matchInfoMap(t);
                var e = te.navigator.userAgent || ""
                    , n = function(t, e) {
                        var n = te.navigator.mimeTypes;
                        for (var r in n)
                            if (n[r][t] == e)
                                return !0;
                        return !1;
                    }
                    , r = ee.getMatchMap(e)
                    , i = !1;
                if ("undefined" != typeof window && window.chrome) {
                    var o = e.replace(/^.*Chrome\/([\d]+).*$/, "$1");
                    o > 36 && window.showModalDialog ? i = !0 : o > 45 && (i = n("type", "application/vnd.chromium.remoting-viewer"));
                }
                if (r.Baidu && r.Opera && (r.Baidu = !1),
                r.Mobile && (r.Mobile = !(e.indexOf("iPad") > -1)),
                i && (n("type", "application/gameplugin") || te.navigator && te.navigator.connection && void 0 === te.navigator.connection.saveData ? r["360SE"] = !0 : r["360EE"] = !0),
                r.IE || r.Edge)
                    switch (window.screenTop - window.screenY) {
                        case 71:
                        case 74:
                        case 99:
                        case 75:
                        case 74:
                        case 105:
                        default:
                            break;
                        case 102:
                            r["360EE"] = !0;
                            break;
                        case 104:
                            r["360SE"] = !0;
                    }
                var a = {
                    Safari: function() {
                        return e.replace(/^.*Version\/([\d.]+).*$/, "$1");
                    },
                    Chrome: function() {
                        return e.replace(/^.*Chrome\/([\d.]+).*$/, "$1").replace(/^.*CriOS\/([\d.]+).*$/, "$1");
                    },
                    IE: function() {
                        return e.replace(/^.*MSIE ([\d.]+).*$/, "$1").replace(/^.*rv:([\d.]+).*$/, "$1");
                    },
                    Edge: function() {
                        return e.replace(/^.*Edge?\/([\d.]+).*$/, "$1");
                    },
                    Firefox: function() {
                        return e.replace(/^.*Firefox\/([\d.]+).*$/, "$1").replace(/^.*FxiOS\/([\d.]+).*$/, "$1");
                    },
                    "Firefox Focus": function() {
                        return e.replace(/^.*Focus\/([\d.]+).*$/, "$1");
                    },
                    Chromium: function() {
                        return e.replace(/^.*Chromium\/([\d.]+).*$/, "$1");
                    },
                    Opera: function() {
                        return e.replace(/^.*Opera\/([\d.]+).*$/, "$1").replace(/^.*OPR\/([\d.]+).*$/, "$1");
                    },
                    Vivaldi: function() {
                        return e.replace(/^.*Vivaldi\/([\d.]+).*$/, "$1");
                    },
                    Yandex: function() {
                        return e.replace(/^.*YaBrowser\/([\d.]+).*$/, "$1");
                    },
                    Arora: function() {
                        return e.replace(/^.*Arora\/([\d.]+).*$/, "$1");
                    },
                    Lunascape: function() {
                        return e.replace(/^.*Lunascape[\/\s]([\d.]+).*$/, "$1");
                    },
                    QupZilla: function() {
                        return e.replace(/^.*QupZilla[\/\s]([\d.]+).*$/, "$1");
                    },
                    "Coc Coc": function() {
                        return e.replace(/^.*coc_coc_browser\/([\d.]+).*$/, "$1");
                    },
                    Kindle: function() {
                        return e.replace(/^.*Version\/([\d.]+).*$/, "$1");
                    },
                    Iceweasel: function() {
                        return e.replace(/^.*Iceweasel\/([\d.]+).*$/, "$1");
                    },
                    Konqueror: function() {
                        return e.replace(/^.*Konqueror\/([\d.]+).*$/, "$1");
                    },
                    Iceape: function() {
                        return e.replace(/^.*Iceape\/([\d.]+).*$/, "$1");
                    },
                    SeaMonkey: function() {
                        return e.replace(/^.*SeaMonkey\/([\d.]+).*$/, "$1");
                    },
                    Epiphany: function() {
                        return e.replace(/^.*Epiphany\/([\d.]+).*$/, "$1");
                    },
                    360: function() {
                        return e.replace(/^.*QihooBrowser\/([\d.]+).*$/, "$1");
                    },
                    "360SE": function() {
                        return {
                            63: "10.0",
                            55: "9.1",
                            45: "8.1",
                            42: "8.0",
                            31: "7.0",
                            21: "6.3"
                        }[e.replace(/^.*Chrome\/([\d]+).*$/, "$1")] || "";
                    },
                    "360EE": function() {
                        return {
                            69: "11.0",
                            63: "9.5",
                            55: "9.0",
                            50: "8.7",
                            30: "7.5"
                        }[e.replace(/^.*Chrome\/([\d]+).*$/, "$1")] || "";
                    },
                    Maxthon: function() {
                        return e.replace(/^.*Maxthon\/([\d.]+).*$/, "$1");
                    },
                    QQBrowser: function() {
                        return e.replace(/^.*QQBrowser\/([\d.]+).*$/, "$1");
                    },
                    QQ: function() {
                        return e.replace(/^.*QQ\/([\d.]+).*$/, "$1");
                    },
                    Baidu: function() {
                        return e.replace(/^.*BIDUBrowser[\s\/]([\d.]+).*$/, "$1");
                    },
                    UC: function() {
                        return e.replace(/^.*UC?Browser\/([\d.]+).*$/, "$1");
                    },
                    Sogou: function() {
                        return e.replace(/^.*SE ([\d.X]+).*$/, "$1").replace(/^.*SogouMobileBrowser\/([\d.]+).*$/, "$1");
                    },
                    // 浏览器
                    LBBROWSER: function() {// 浏览器
                        var t = "";
                        e.indexOf("LieBaoFast") > -1 && (t = e.replace(/^.*LieBaoFast\/([\d.]+).*$/, "$1"));
                        var n = e.replace(/^.*Chrome\/([\d]+).*$/, "$1");
                        return t || {
                            57: "6.5",
                            49: "6.0",
                            46: "5.9",
                            42: "5.3",
                            39: "5.2",
                            34: "5.0",
                            29: "4.5",
                            21: "4.0"
                        }[n] || "";
                    },
                    "2345Explorer": function() {
                        return e.replace(/^.*2345Explorer\/([\d.]+).*$/, "$1");
                    },
                    TheWorld: function() {
                        return e.replace(/^.*TheWorld ([\d.]+).*$/, "$1");
                    },
                    XiaoMi: function() {
                        return e.replace(/^.*MiuiBrowser\/([\d.]+).*$/, "$1");
                    },
                    Quark: function() {
                        return e.replace(/^.*Quark\/([\d.]+).*$/, "$1");
                    },
                    Qiyu: function() {
                        return e.replace(/^.*Qiyu\/([\d.]+).*$/, "$1");
                    },
                    Wechat: function() {
                        return e.replace(/^.*MicroMessenger\/([\d.]+).*$/, "$1");
                    },
                    WechatWork: function() {
                        return e.replace(/^.*wxwork\/([\d.]+).*$/, "$1");
                    },
                    Taobao: function() {
                        return e.replace(/^.*AliApp\(TB\/([\d.]+).*$/, "$1");
                    },
                    Alipay: function() {
                        return e.replace(/^.*AliApp\(AP\/([\d.]+).*$/, "$1");
                    },
                    Weibo: function() {
                        return e.replace(/^.*weibo__([\d.]+).*$/, "$1");
                    },
                    Douban: function() {
                        return e.replace(/^.*com.douban.frodo\/([\d.]+).*$/, "$1");
                    },
                    Suning: function() {
                        return e.replace(/^.*SNEBUY-APP([\d.]+).*$/, "$1");
                    },
                    iQiYi: function() {
                        return e.replace(/^.*IqiyiVersion\/([\d.]+).*$/, "$1");
                    }
                };
                return t.browserVersion = "",
                t.browserMajor = "",
                a[t.browser] && (t.browserVersion = a[t.browser](),
                t.browserVersion == e && (t.browserVersion = "")),
                "Chrome" == t.browser && e.match(/\S+Browser/) && (t.browser = e.match(/\S+Browser/)[0],
                t.version = e.replace(/^.*Browser\/([\d.]+).*$/, "$1")),
                "Edge" == t.browser && (t.version > "75" ? t.engine = "Blink" : t.engine = "EdgeHTML"),
                ("Chrome" == t.browser && parseInt(t.browserVersion) > 27 || r.Chrome && "WebKit" == t.engine && parseInt(t.browserVersion) > 27 || "Opera" == t.browser && parseInt(t.version) > 12 || "Yandex" == t.browser) && (t.engine = "Blink"),
                t.browserVersion && (t.browserMajor = t.browserVersion.split(".").length && this.browserVersion.split(".")[0]),
                {
                    browser: t.browser,
                    browserVersion: t.browserVersion,
                    engine: t.engine,
                    browserMajor: t.browserMajor
                };
            }
            )),
            // 获取地理位置
            getGeoPostion: c((function(t) {
                navigator && navigator.geolocation && navigator.geolocation.getCurrentPosition((function(e) {
                    t(e);
                }
                ), (function(t) {
                    o.warn(t);
                }
                ));
            }
            ))
        }
        , ne = {};
    "undefined" != typeof window && (ne = {
        os: ee.getOS(),
        osVersion: ee.getOSVersion().version,
        osVersionMajor: ee.getOSVersion().osMajor,
        browser: ee.getBrowserInfo().browser,
        browserVersion: ee.getBrowserInfo().browserVersion,
        browserVersionMajor: ee.getBrowserInfo().browserMajor,
        screenSize: window.screen.width + "*" + window.screen.height,
        networkType: ee.getNetwork(),
        device: ee.getDeviceType()
    });
    var re = ne
        , ie = {
            BEFORE_UNLOAD: "beforeunload",
            CLICK: "click",
            DBL_CLICK: "dblclick",
            KEY_DOWN: "keydown",
            LOAD: "load",
            POP_STATE: "popstate",
            SCROLL: "scroll",
            TOUCH_START: "touchstart",
            TOUCH_END: "touchend",
            TOUCH_MOVE: "touchmove",
            VISIBILITY_CHANGE: "visibilitychange",
            PAGE_SHOW: "pageshow",
            FREEZE: "freeze",
            RESUME: "resume",
            DOM_CONTENT_LOADED: "DOMContentLoaded",
            POINTER_DOWN: "pointerdown",
            POINTER_UP: "pointerup",
            POINTER_CANCEL: "pointercancel",
            HASH_CHANGE: "hashchange",
            PAGE_HIDE: "pagehide",
            MOUSE_DOWN: "mousedown",
            MOUSE_UP: "mouseup",
            MOUSE_MOVE: "mousemove",
            FOCUS: "focus",
            BLUR: "blur",
            CONTEXT_MENU: "contextmenu",
            RESIZE: "resize",
            CHANGE: "change",
            INPUT: "input",
            PLAY: "play",
            PAUSE: "pause",
            SECURITY_POLICY_VIOLATION: "securitypolicyviolation",
            SELECTION_CHANGE: "selectionchange",
            STORAGE: "storage"
        }
        , oe = {
            DOCUMENT: "document",
            XHR: "xhr",
            BEACON: "beacon",
            FETCH: "fetch",
            CSS: "css",
            JS: "js",
            IMAGE: "image",
            FONT: "font",
            MEDIA: "media",
            OTHER: "other"
        }
        , ae = {
            CLICK: "click",
            CUSTOM: "custom"
        }
        , se = {
            RAGE_CLICK: "rage_click",
            ERROR_CLICK: "error_click",
            DEAD_CLICK: "dead_click"
        }
        , ue = {
            ACTION: "action",
            ERROR: "error",
            LONG_TASK: "long_task",
            VIEW: "view",
            RESOURCE: "resource",
            LOGGER: "logger"
        }
        , ce = {
            LONG_TASK: "long-task",
            LONG_ANIMATION_FRAME: "long-animation-frame"
        }
        , le = {
            INITIAL_LOAD: "initial_load",
            ROUTE_CHANGE: "route_change"
        }
        , fe = {
            FETCH: oe.FETCH,
            XHR: oe.XHR
        }
        , de = {
            DDTRACE: "ddtrace",
            ZIPKIN_MULTI_HEADER: "zipkin",
            ZIPKIN_SINGLE_HEADER: "zipkin_single_header",
            W3C_TRACEPARENT: "w3c_traceparent",
            W3C_TRACEPARENT_64: "w3c_traceparent_64bit",
            SKYWALKING_V3: "skywalking_v3",
            JAEGER: "jaeger"
        }
        , pe = {
            HANDLED: "handled",
            UNHANDLED: "unhandled"
        }
        , ve = {
            UNCAUGHT: "Uncaught",
            PROVIDED: "Provided"
        };
    function he(t) {
        return he = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        ,
        he(t);
    }
    function _e(t, e, n) {
        if ("object" !== he(t) || null === t)
            return JSON.stringify(t);
        var r = ge(Object.prototype)
            , i = ge(Array.prototype)
            , o = ge(Object.getPrototypeOf(t))
            , a = ge(t);
        try {
            return JSON.stringify(t, e, n);
        } catch (t) {
            return "<error: unable to serialize object>";
        } finally {
            r(),
            i(),
            o(),
            a();
        }
    }
    // 字符串处理
    function ge(t) {
        var e = t
            , n = e.toJSON;
        return n ? (delete e.toJSON,
        function() {
            e.toJSON = n;
        }
        ) : st;
    }
    function me(t) {
        return me = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        ,
        me(t);
    }
    var ye = "?";
    function be(t) {
        var e = []
            , n = xe(t, "stack")
            , r = String(t);
        return n && n.startsWith(r) && (n = n.slice(r.length)),
        n && A(n.split("\n"), (function(t) {
            var n = function(t) {
                var e = Se.exec(t);
                if (!e)
                    return;
                var n = e[2] && 0 === e[2].indexOf("native")
                    , r = e[2] && 0 === e[2].indexOf("eval")
                    , i = Te.exec(e[2]);
                r && i && (e[2] = i[1],
                e[3] = i[2],
                e[4] = i[3]);
                return {
                    args: n ? [e[2]] : [],
                    column: e[4] ? +e[4] : void 0,
                    func: e[1] || ye,
                    line: e[3] ? +e[3] : void 0,
                    url: n ? void 0 : e[2]
                };
            }(t) || function(t) {
                var e = Ce.exec(t);
                if (!e)
                    return;
                return {
                    args: [],
                    column: e[3] ? +e[3] : void 0,
                    func: ye,
                    line: e[2] ? +e[2] : void 0,
                    url: e[1]
                };
            }(t) || function(t) {
                var e = Ie.exec(t);
                if (!e)
                    return;
                return {
                    args: [],
                    column: e[4] ? +e[4] : void 0,
                    func: e[1] || ye,
                    line: +e[3],
                    url: e[2]
                };
            }(t) || function(t) {
                var e = Oe.exec(t);
                if (!e)
                    return;
                var n = e[3] && e[3].indexOf(" > eval") > -1
                    , r = Ae.exec(e[3]);
                n && r && (e[3] = r[1],
                e[4] = r[2],
                e[5] = void 0);
                return {
                    args: e[2] ? e[2].split(",") : [],
                    column: e[5] ? +e[5] : void 0,
                    func: e[1] || ye,
                    line: e[4] ? +e[4] : void 0,
                    url: e[3]
                };
            }(t);
            n && (!n.func && n.line && (n.func = ye),
            e.push(n));
        }
        )),
        {
            message: xe(t, "message"),
            name: xe(t, "name"),
            stack: e
        };
    }
    var Ee = "((?:file|https?|blob|chrome-extension|electron|native|eval|webpack|<anonymous>|\\w+\\.|\\/).*?)"
        , we = "(?::(\\d+))"
        , Se = new RegExp("^\\s*at (.*?) ?\\(" + Ee + we + "?" + we + "?\\)?\\s*$","i")
        , Te = new RegExp("\\((\\S*)" + we + we + "\\)");
    var Ce = new RegExp("^\\s*at ?" + Ee + we + "?" + we + "??\\s*$","i");
    var Ie = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    var Oe = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|capacitor|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i
        , Ae = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    function xe(t, e) {
        if ("object" === me(t) && t && e in t) {
            var n = t[e];
            return "string" == typeof n ? n : void 0;
        }
    }
    var Re = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?([\s\S]*)$/;
    function ke(t) {
        var e = function(t) {
                return Xe(window, "onerror", (function(e) {
                    var n, r = e.parameters, i = r[0], o = r[1], a = r[2], s = r[3], u = r[4];
                    if (u instanceof Error)
                        n = be(u);
                    else {
                        var c = {
                                url: o,
                                column: s,
                                line: a
                            }
                            , l = function(t) {
                                var e, n;
                                if ("[object String]" === {}.toString.call(t)) {
                                    var r = Re.exec(t);
                                    r && (e = r[1],
                                    n = r[2]);
                                }
                                return {
                                    name: e,
                                    message: n
                                };
                            }(i);
                        n = {
                            name: l.name,
                            message: l.message,
                            stack: [c]
                        };
                    }
                    t(n, Wt(u, i));
                }
                ));
            }(t)
            , n = function(t) {
                return Xe(window, "onunhandledrejection", (function(e) {
                    var n = e.parameters[0].reason || "Empty reason"
                        , r = be(n);
                    t(r, n);
                }
                ));
            }(t);
        return {
            stop: function() {
                e.stop(),
                n.stop();
            }
        };
    }
    var Ne = 1024
        , Le = 1024 * Ne
        , De = /[^\u0000-\u007F]/;
    function Pe(t) {
        return De.test(t) ? void 0 !== window.TextEncoder ? (new TextEncoder).encode(t).length : new Blob([t]).size : t.length;
    }
    function Me(t) {
        return Me = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        ,
        Me(t);
    }
    var Ue = 220 * Ne // 最大字符串长度 
        , Ve = "$" // 根对象
        , Be = 3; // 最大嵌套层数
    function ze(t, e) {
        void 0 === e && (e = Ue);
        var n = ge(Object.prototype)
            , r = ge(Array.prototype)
            , i = []
            , o = new WeakMap // 弱映射
            , a = He(t, Ve, void 0, i, o)
            , s = JSON.stringify(a) && JSON.stringify(a).length || 0;
        if (!(s > e)) {
            for (; i.length > 0 && s < e; ) {
                var u = i.shift()
                    , c = 0;
                if (Array.isArray(u.source))
                    for (var l = 0; l < u.source.length; l++) {
                        if (s += void 0 !== (f = He(u.source[l], u.path, l, i, o)) ? JSON.stringify(f).length : 4,
                        s += c,
                        c = 1,
                        s > e) {
                            We(e, "truncated", t);
                            break;
                        }
                        u.target[l] = f;
                    }
                else
                    for (var l in u.source)
                        if (Object.prototype.hasOwnProperty.call(u.source, l)) {
                            var f;
                            if (void 0 !== (f = He(u.source[l], u.path, l, i, o)) && (s += JSON.stringify(f).length + c + l.length + Be,
                            c = 1),
                            s > e) {
                                We(e, "truncated", t);
                                break;
                            }
                            u.target[l] = f;
                        }
            }
            return n(),
            r(),
            a;
        }
        We(e, "discarded", t);
    }
    // 序列化对象
    function He(t, e, n, r, i) {
        var o = function(t) {
            var e = t;
            if (e && "function" == typeof e.toJSON)
                try {
                    return e.toJSON();
                } catch (t) {}
            return t;
        }(t);
        if (!o || "object" !== Me(o))
            return function(t) {
                if ("bigint" == typeof t)
                    return "[BigInt] " + t.toString();
                if ("function" == typeof t)
                    return "[Function] " + t.name || 0;
                if ("symbol" === Me(t))
                    return "[Symbol] " + t.description || 0;
                return t;
            }(o);
        var a = Fe(o);
        if ("[Object]" !== a && "[Array]" !== a && "[Error]" !== a)
            return a;
        var s = t;
        if (i.has(s))
            return "[Reference seen at " + i.get(s) + "]";
        var u = void 0 !== n ? e + "." + n : e
            , c = Array.isArray(o) ? [] : {};
        return i.set(s, u),
        r.push({
            source: o,
            target: c,
            path: u
        }),
        c;
    }
    // 序列化对象
    function Fe(t) {
        try {
            if (t instanceof Event)
                return {
                    type: (n = t).type,
                    isTrusted: n.isTrusted,
                    currentTarget: n.currentTarget ? Fe(n.currentTarget) : null,
                    target: n.target ? Fe(n.target) : null
                };
            if (t instanceof RegExp)
                return "[RegExp] ".concat(t.toString());
            var e = Object.prototype.toString.call(t).match(/\[object (.*)\]/);
            if (e && e[1])
                return "[" + e[1] + "]";
        } catch (t) {}
        var n;
        return "[Unserializable]";
    }
    function We(t, e, n) {
        o.warn("The data provided has been " + e + " as it is over the limit of " + t + " characters:", n);
    }
    var je = "No stack, consider using an instance of Error"
        , Ge = {
            AGENT: "agent", // 代理
            CONSOLE: "console", // 控制台 // 控制台
            NETWORK: "network", // 网络 // 网络
            SOURCE: "source", // 源 // 源
            LOGGER: "logger", // 日志 // 日志
            CUSTOM: "custom" // 自定义 // 自定义
        };
    // 处理错误
    function $e(t) {
        var e = t.stackTrace // 堆栈跟踪
            , n = t.originalError // 原始错误
            , r = t.handlingStack // 处理堆栈
            , i = t.startClocks // 开始时钟
            , o = t.nonErrorPrefix // 非错误前缀
            , a = t.source // 源
            , s = t.handling
            , u = n instanceof Error
            , c = function(t, e, n, r) {
                return t && t.message && t && t.name ? t.message : e ? "Empty message" : n + " " + _e(ze(r));
            }(e, u, o, n)
            , l = function(t, e) {
                if (void 0 === e)
                    return !1;
                if (t)
                    return !0;
                return e.stack.length > 0 && (e.stack.length > 1 || void 0 !== e.stack[0].url);
            }(u, e) ? qe(e) : je
            , f = u ? Ye(n, a) : void 0;
        return {
            startClocks: i,
            source: a,
            handling: s,
            originalError: n,
            message: c,
            stack: l,
            handlingStack: r,
            type: e && e.name,
            causes: f
        };
    }
    // 获取堆栈跟踪
    function Ke() {
        var t, e = new Error;
        if (!e.stack)
            try {
                throw e;
            } catch (t) {}
        return l((function() {
            var n = be(e);
            n.stack = n.stack.slice(2),
            t = qe(n);
        }
        )),
        t;
    }
    // 获取堆栈跟踪
    function qe(t) {
        var e = Ze(t);
        return A(t.stack, (function(t) {// 堆栈跟踪
            var n = "?" === t.func ? "<anonymous>" : t.func
                , r = t.args && t.args.length > 0 ? "(" + t.args.join(", ") + ")" : ""
                , i = t.line ? ":" + t.line : ""// 行号
                , o = t.line && t.column ? ":" + t.column : "";// 列号
            e += "\n  at " + n + r + " @ " + t.url + i + o;// 堆栈跟踪
        }
        )),
        e;
    }
    function Ze(t) {
        return (t.name || "Error") + ": " + t.message;
    }
    function Ye(t, e) {
        for (var n = t, r = []; n && n.cause instanceof Error && r.length < 10; ) {
            var i = be(n.cause);
            r.push({
                message: n.cause.message,
                source: e,
                type: i && i.name,
                stack: i && qe(i)
            }),
            n = n.cause;
        }
        return r.length ? r : void 0;
    }
    // 处理错误
    function Xe(t, e, n, r) {
        var i = r && r.computeHandlingStack // 计算处理堆栈
            , o = t[e]; // 获取处理函数
        if ("function" != typeof o) {
            if (!jt(e, "on"))
                return {
                    stop: st
                };
            o = st;
        }
        var a = !1
            , s = function() {
                if (a)
                    return o.apply(this, arguments);
                var t, e = Pt(arguments);
                l(n, null, [{
                    target: this,
                    parameters: e,
                    onPostCall: function(e) {
                        t = e;
                    },
                    handlingStack: i ? Ke() : void 0
                }]);
                var r = o.apply(this, e);
                return t && l(t, null, [r]),
                r;
            };
        return t[e] = s,
        {
            stop: function() {
                a = !0,
                t[e] === s && (t[e] = o);
            }
        };
    }
    // 设置属性
    function Qe(t, e, n) {
        var r = Object.getOwnPropertyDescriptor(t, e); // 获取属性描述符
        if (!r || !r.set || !r.configurable) // 如果属性描述符不存在，或者没有设置，或者不可配置
            return {
                stop: st
            };
        var i = st
            , o = function(t, e) {
                h((function() {
                    o !== i && n(t, e);
                }
                ), 0);
            }
            , a = function(t) {
                r.set.call(this, t),
                o(this, t);
            };
        return Object.defineProperty(t, e, {
            set: a
        }),
        {
            stop: function() {
                Object.getOwnPropertyDescriptor(t, e) && Object.getOwnPropertyDescriptor(t, e).set === a && Object.defineProperty(t, e, r),
                o = i;
            }
        };
    }
    var Je = function(t) {
        this.observers = [],
        this.onLastUnsubscribe = void 0,
        this.onFirstSubscribe = t;
    };
    Je.prototype = {
        subscribe: function(t) {
            this.observers.push(t),
            1 === this.observers.length && this.onFirstSubscribe && (this.onLastUnsubscribe = this.onFirstSubscribe(this) || void 0);
            var e = this;
            return {
                unsubscribe: function() {
                    e.observers = V(e.observers, (function(e) {
                        return t !== e;
                    }
                    )),
                    !e.observers.length && e.onLastUnsubscribe && e.onLastUnsubscribe();
                }
            };
        },
        notify: function(t) {
            A(this.observers, (function(e) {
                e(t);
            }
            ));
        }
    };
    var tn = Je;
    function en() {
        var t = [].slice.call(arguments);
        return new tn((function(e) {
            var n = B(t, (function(t) {
                return t.subscribe((function(t) {
                    return e.notify(t);
                }
                ));
            }
            ));
            return function() {
                return A(n, (function(t) {
                    return t.unsubscribe();
                }
                ));
            };
        }
        ));
    }
    var nn = {};
    // 处理错误
    function rn(e) {
        var n = B(e, (function(e) {
            return nn[e] || (nn[e] = function(e) {
                return new tn((function(n) {
                    var r = console[e];
                    return console[e] = function() {
                        var i = [].slice.call(arguments);
                        r.apply(console, arguments);
                        var o = Ke();
                        l((function() {
                            n.notify(function(e, n, r) {
                                var i, o = B(e, (function(t) {
                                    return function(t) {
                                        if ("string" == typeof t)
                                            return t;
                                        if (t instanceof Error)
                                            return Ze(be(t));
                                        return _e(t, void 0, 2);
                                    }(t);
                                }
                                )).join(" ");
                                if (n === t.error) {
                                    var a = Dt(e, (function(t) {
                                        return t instanceof Error;
                                    }
                                    ));
                                    i = {
                                        stack: a ? qe(be(a)) : void 0,
                                        causes: a ? Ye(a, "console") : void 0,
                                        startClocks: bt(),
                                        message: o,
                                        source: Ge.CONSOLE,
                                        handling: pe.HANDLED,
                                        handlingStack: r
                                    };
                                }
                                return {
                                    api: n,
                                    message: o,
                                    error: i,
                                    handlingStack: r
                                };
                            }(i, e, o));
                        }
                        ));
                    }
                    ,
                    function() {
                        console[e] = r;
                    };
                }
                ));
            }(e)),
            nn[e];
        }
        ));
        return en.apply(this, n);
    }
    function on(t, e, n, r) {// 添加事件监听
        return an(t, [e], n, r);// 添加事件监听
    }
    function an(t, e, n, r) {// 添加事件监听
        var i = c(r && r.once ? function(t) {
            s(),
            n(t);
        }
            : n);
        r = r && r.passive ? {
            capture: r.capture,
            passive: r.passive
        } : r && r.capture;
        var o = a(t, "addEventListener");
        A(e, (function(e) {
            o.call(t, e, i, r);
        }
        ));
        var s = function() {
            var n = a(t, "removeEventListener");
            A(e, (function(e) {
                n.call(t, e, i, r);
            }
            ));
        };
        return {
            stop: s
        };
    }
    var sn = {
        intervention: "intervention", // 干预
        deprecation: "deprecation", // 弃用
        cspViolation: "csp_violation" // CSP 违规
    };
    function un(t, e) {// 添加 CSP 违规事件监听
        var n = [];
        Lt(e, sn.cspViolation) && n.push(new tn((function(t) {
            return on(document, ie.SECURITY_POLICY_VIOLATION, (function(e) {
                t.notify(function(t) {// 通知错误信息
                    var e = "'" + t.blockedURI + "' blocked by '" + t.effectiveDirective + "' directive";
                    return cn({// 构建错误信息
                        type: t.effectiveDirective, // 类型
                        message: sn.cspViolation + ": " + e, // 消息
                        originalError: t, // 原始错误
                        csp: { // CSP
                            disposition: t.disposition
                        },
                        stack: ln(t.effectiveDirective, t.originalPolicy ? "".concat(e, ' of the policy "').concat(kt(t.originalPolicy, 100), '"') : "no policy", t.sourceFile, t.lineNumber, t.columnNumber)
                    });
                }(e));
            }
            )).stop;
        }
        )));
        // 过滤 CSP 违规事件
        var r = V(e, (function(t) {
            return t !== sn.cspViolation;
        }
        ));
        // 如果存在 CSP 违规事件，则添加事件监听
        return r.length && n.push(function(t) {
            return new tn((function(e) {
                if (window.ReportingObserver) {
                    var n = c((function(t) {
                            A(t, (function(t) {
                                e.notify(function(t) {
                                    var e = t.body
                                        , n = t.type;
                                    return cn({
                                        type: e.id,
                                        message: n + ": " + e.message,
                                        originalError: t,
                                        stack: ln(e.id, e.message, e.sourceFile, e.lineNumber, e.columnNumber)
                                    });
                                }(t));
                            }
                            ));
                        }
                        ))
                        , r = new window.ReportingObserver(n,{
                            types: t,
                            buffered: !0
                        });
                    return r.observe(),
                    function() {
                        r.disconnect();
                    };
                }
            }
            ));
        }(r)),
        en.apply(this, n);
    }
    // 构建错误信息
    function cn(t) {
        return x({// 构建错误信息
            startClocks: bt(), // 开始时钟
            source: ErrorSource.REPORT, // 错误来源
            handling: ErrorHandling.UNHANDLED // 错误处理
        }, t);
    }
    // 构建堆栈跟踪
    function ln(t, e, n, r, i) {
        return n && qe({// 构建堆栈跟踪
            name: t,// 名称
            message: e,// 消息
            stack: [{
                func: "?",// 函数
                url: n,
                line: r,
                column: i
            }]
        });
    }
    var fn = function() {
        this._events = [],
        this.pendingEvents = [];
    };
    // 事件发射器
    fn.prototype = {
        emit: function(t) {// 发射事件
            var e = [].slice.call(arguments, 1);
            A(this._events, (function(n) {
                if (n.type !== t)
                    return !1;
                n.callback.apply(n.context, e);
            }
            ));
        },
        on: function(t, e, n) {
            "function" == typeof e && this._events.push({
                type: t,
                callback: e,
                context: n || this
            });
        }
    };
    new fn;
    var dn, pn = {
        AUTO_ACTION_COMPLETED: "AUTO_ACTION_COMPLETED",// 自动动作完成
        BEFORE_VIEW_CREATED: "BEFORE_VIEW_CREATED",// 视图创建之前
        VIEW_CREATED: "VIEW_CREATED",// 视图创建
        VIEW_UPDATED: "VIEW_UPDATED",// 视图更新
        BEFORE_VIEW_UPDATED: "BEFORE_VIEW_UPDATED",// 视图更新之前
        VIEW_ENDED: "VIEW_ENDED",// 视图结束
        AFTER_VIEW_ENDED: "AFTER_VIEW_ENDED",// 视图结束之后
        SESSION_RENEWED: "SESSION_RENEWED",// 会话刷新
        SESSION_EXPIRED: "SESSION_EXPIRED",// 会话过期
        PAGE_EXITED: "PAGE_EXITED",// 页面退出
        REQUEST_STARTED: "REQUEST_STARTED",// 请求开始
        REQUEST_COMPLETED: "REQUEST_COMPLETED",// 请求完成
        RAW_RUM_EVENT_COLLECTED: "RAW_RUM_EVENT_COLLECTED",// 原始 RUM 事件收集
        RUM_EVENT_COLLECTED: "RUM_EVENT_COLLECTED",// RUM 事件收集
        RAW_ERROR_COLLECTED: "RAW_ERROR_COLLECTED",// 原始错误收集
        RAW_LOG_COLLECTED: "RAW_LOG_COLLECTED",// 原始日志收集
        LOG_COLLECTED: "LOG_COLLECTED"// 日志收集
    };
    function vn() {
        this.callbacks = {};
    }
    function hn(t) {
        return bn(t) || function(t) {
            if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"])
                return Array.from(t);
        }(t) || mn(t) || gn();
    }
    function _n(t, e) {
        return bn(t) || function(t, e) {
            var n = null == t ? null : "undefined" != typeof Symbol && t[Symbol.iterator] || t["@@iterator"];
            if (null != n) {
                var r, i, o, a, s = [], u = !0, c = !1;
                try {
                    if (o = (n = n.call(t)).next,
                    0 === e) {
                        if (Object(n) !== n)
                            return;
                        u = !1;
                    } else
                        for (; !(u = (r = o.call(n)).done) && (s.push(r.value),
                        s.length !== e); u = !0)
                            ;
                } catch (t) {
                    c = !0,
                    i = t;
                } finally {
                    try {
                        if (!u && null != n.return && (a = n.return(),
                        Object(a) !== a))
                            return;
                    } finally {
                        if (c)
                            throw i;
                    }
                }
                return s;
            }
        }(t, e) || mn(t, e) || gn();
    }
    function gn() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function mn(t, e) {
        if (t) {
            if ("string" == typeof t)
                return yn(t, e);
            var n = Object.prototype.toString.call(t).slice(8, -1);
            return "Object" === n && t.constructor && (n = t.constructor.name),
            "Map" === n || "Set" === n ? Array.from(t) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? yn(t, e) : void 0;
        }
    }
    // 将对象转换为数组
    function yn(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var n = 0, r = new Array(e); n < e; n++)
            r[n] = t[n];
        return r;
    }
    // 判断是否为数组
    function bn(t) {
        if (Array.isArray(t))
            return t;
    }
    // 将对象转换为数组
    function En(t, e, n) {
        var r = ot(t)
            , i = n(r);
        return $(e).forEach((function(e) {
            var n = _n(e, 2)
                , i = n[0]
                , o = n[1];
            return wn(t, r, i.split(/\.|(?=\[\])/), o);
        }
        )),
        i;
    }
    // 将对象转换为数组
    function wn(t, e, n, r) {
        var i = hn(n)
            , o = i[0]
            , a = i.slice(1);
        if ("[]" !== o) {
            if (Sn(t) && Sn(e))
                return a.length > 0 ? wn(t[o], e[o], a, r) : void function(t, e, n, r) {
                    var i = rt(n);
                    i === r ? t[e] = ze(n) : "object" !== r || "undefined" !== i && "null" !== i || (t[e] = {});
                }(t, o, e[o], r);
        } else
            Array.isArray(t) && Array.isArray(e) && t.forEach((function(t, n) {
                return wn(t, e[n], a, r);
            }
            ));
    }

    // 判断是否为对象
    function Sn(t) {
        return "object" === rt(t);
    }
    // 创建一个对象，用于限制某个操作的频率
    function Tn(t, e, n) {
        var r = 0
            , i = !1;
        return {
            isLimitReached: function() {// 判断是否达到限制
                if (0 === r && h((function() {
                    r = 0;
                }
                ), lt),
                (r += 1) <= e || i)
                    return i = !1,
                    !1;
                if (r === e + 1) {
                    i = !0;
                    try {
                        n({
                            message: "Reached max number of " + t + "s by minute: " + e,// 消息
                            source: Ge.AGENT,// 来源
                            startClocks: bt()// 开始时钟
                        });
                    } finally {
                        i = !1;
                    }
                }
                return !0;
            }
        };
    }
    // 获取 URL
    function Cn(t) {
        return On(t, zt(window.location)).href;
    }
    function In(t) {
        return zt(On(t));
    }
    // 获取 URL
    function On(t, e) {
        if (function() {
            if (void 0 !== dn)
                return dn;
            try {
                // 创建一个 URL 对象
                var t = new URL("http://test/path");
                return dn = "http://test/path" === t.href;
            } catch (t) {
                dn = !1;
            }
            return dn;
        }())
            return void 0 !== e ? new URL(t,e) : new URL(t);
        if (void 0 === e && !/:/.test(t))
            throw new Error("Invalid URL: " + t);
        var n = document
            , r = n.createElement("a");
        if (void 0 !== e) {
            var i = (n = document.implementation.createHTMLDocument("")).createElement("base");
            i.href = e,
            n.head.appendChild(i),
            n.body.appendChild(r);
        }
        return r.href = t,
        r;
    }
    vn.prototype = {
        notify: function(t, e) {
            var n = this.callbacks[t];
            n && A(n, (function(t) {
                t(e);
            }
            ));
        },
        subscribe: function(t, e) {
            this.callbacks[t] || (this.callbacks[t] = []),
            this.callbacks[t].push(e);
            var n = this;
            return {
                unsubscribe: function() {
                    n.callbacks[t] = V(n.callbacks[t], (function(t) {
                        return t !== e;
                    }
                    ));
                }
            };
        }
    };
    var An = navigator.userAgent.toLowerCase()
        , xn = function() {
            return /iphone os/.test(An);
        };
    function Rn(t, e) {
        if (window.requestIdleCallback && window.cancelIdleCallback) {
            var n = window.requestIdleCallback(c(t), e);
            return function() {
                return window.cancelIdleCallback(n);
            };
        }
        return function(t) {
            var e = wt()
                , n = h((function() {
                    t({
                        didTimeout: !1,
                        timeRemaining: function() {
                            return Math.max(0, kn - (wt() - e));
                        }
                    });
                }
                ), 0);
            return function() {
                return _(n);
            };
        }(t);
    }
    var kn = 50;
    var Nn = ct
        , Ln = 30;
    var Dn, Pn = /^\s+|\s+$/g, Mn = {
        rum: "/rum",// RUM
        log: "/logging",// 日志
        sessionReplay: "/rum/replay"// 会话回放
    };
    function Un(t, e) {
        var n = Mn[e];
        if (!n)
            return "";
        var r = t.datakitOrigin || t.datakitUrl || t.site;
        0 === r.indexOf("/") && (r = location.origin + Vn(r));
        var i = r;
        return i = r.lastIndexOf("/") === r.length - 1 ? Vn(r) + "v1/write" + n : Vn(r) + "/v1/write" + n,
        t.site && t.clientToken && (i = i + "?token=" + t.clientToken + "&to_headless=true"),
        i;
    }
    function Vn(t) {
        return t.replace(Pn, "");
    }
    function Bn(t, e) {
        return "".concat(t, "_").concat(e && e.crossSite ? "cs1" : "cs0", "_").concat(e && e.domain ? "d1" : "d0", "_").concat(e && e.secure ? "sec1" : "sec0", "_").concat(e && e.partitioned ? "part1" : "part0");
    }
    function zn(t, e, n, r) {
        var i = new Date;
        i.setTime(i.getTime() + n);
        var o = "expires=" + i.toUTCString()
            , a = r && r.crossSite ? "none" : "strict"
            , s = r && r.domain ? ";domain=" + r.domain : ""
            , u = r && r.secure ? ";secure" : ""
            , c = r && r.partitioned ? ";partitioned" : "";
        document.cookie = Bn(t, r) + "=" + e + ";" + o + ";path=/;samesite=" + a + s + u + c;
    }
    function Hn(t, e) {
        return function(t, e) {
            for (xt.lastIndex = 0; ; ) {
                var n = xt.exec(t);
                if (!n)
                    break;
                if (n[1] === e)
                    return n[2];
            }
        }(document.cookie, Bn(t, e));
    }
    function Fn(t, e) {
        zn(t, "", 0, e);
    }
    var Wn = 4 * ft
        , jn = 15 * lt
        , Gn = "_gc_s";
    function $n(t, e) {
        return function(t) {
            if (Array.isArray(t))
                return t;
        }(t) || function(t, e) {
            var n = null == t ? null : "undefined" != typeof Symbol && t[Symbol.iterator] || t["@@iterator"];
            if (null != n) {
                var r, i, o, a, s = [], u = !0, c = !1;
                try {
                    if (o = (n = n.call(t)).next,
                    0 === e) {
                        if (Object(n) !== n)
                            return;
                        u = !1;
                    } else
                        for (; !(u = (r = o.call(n)).done) && (s.push(r.value),
                        s.length !== e); u = !0)
                            ;
                } catch (t) {
                    c = !0,
                    i = t;
                } finally {
                    try {
                        if (!u && null != n.return && (a = n.return(),
                        Object(a) !== a))
                            return;
                    } finally {
                        if (c)
                            throw i;
                    }
                }
                return s;
            }
        }(t, e) || function(t, e) {
            if (!t)
                return;
            if ("string" == typeof t)
                return Kn(t, e);
            var n = Object.prototype.toString.call(t).slice(8, -1);
            "Object" === n && t.constructor && (n = t.constructor.name);
            if ("Map" === n || "Set" === n)
                return Array.from(t);
            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                return Kn(t, e);
        }(t, e) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }();
    }
    function Kn(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var n = 0, r = new Array(e); n < e; n++)
            r[n] = t[n];
        return r;
    }
    var qn = /^([a-zA-Z]+)=([a-z0-9-]+)$/
        , Zn = "&"
        , Yn = "1";
    function Xn() {
        return {
            isExpired: Yn
        };
    }
    function Qn(t) {
        return G(t);
    }
    function Jn(t) {
        return void 0 !== t.isExpired || !((void 0 === (e = t).created || wt() - Number(e.created) < Wn) && (void 0 === e.expire || wt() < Number(e.expire)));
        var e;
    }
    function tr(t) {
        return B($(t), (function(t) {
            return t[0] + "=" + t[1];
        }
        )).join(Zn);
    }
    function er(t) {
        var e = {};
        return function(t) {
            return !!t && (-1 !== t.indexOf(Zn) || qn.test(t));
        }(t) && t.split(Zn).forEach((function(t) {
            var n = qn.exec(t);
            if (null !== n) {
                var r = $n(n, 3)
                    , i = r[1]
                    , o = r[2];
                e[i] = o;
            }
        }
        )),
        e;
    }
    function nr(t) {
        var e = function(t) {
            var e = {};
            e.secure = !!t.useSecureSessionCookie || !!t.usePartitionedCrossSiteSessionCookie || !!t.useCrossSiteSessionCookie,
            e.crossSite = !!t.usePartitionedCrossSiteSessionCookie || !!t.useCrossSiteSessionCookie,
            e.partitioned = !!t.usePartitionedCrossSiteSessionCookie,
            t.trackSessionAcrossSubdomains && (e.domain = function() {
                if (void 0 === Dn) {
                    for (var t = "gc_site_test_".concat(Q()), e = window.location.hostname.split("."), n = e.pop(); e.length && !Hn(t); )
                        n = "".concat(e.pop(), ".").concat(n),
                        zn(t, "test", ct, {
                            domain: n
                        });
                    Fn(t, {
                        domain: n
                    }),
                    Dn = n;
                }
                return Dn;
            }());
            return e;
        }(t);
        return function(t) {
            if (void 0 === document.cookie || null === document.cookie)
                return !1;
            try {
                var e = "gc_cookie_test_".concat(Q())
                    , n = "test";
                zn(e, n, lt, t);
                var r = Hn(e, t) === n;
                return Fn(e, t),
                r;
            } catch (t) {
                return !1;
            }
        }(e) ? {
                type: "Cookie",
                cookieOptions: e
            } : void 0;
    }
    function rr(t) {
        var e;
        return {
            isLockEnabled: Bt() === Vt.CHROMIUM,
            persistSession: (e = t,
            function(t) {
                zn(Gn, tr(t), jn, e);
            }
            ),
            retrieveSession: ir(t),
            expireSession: function() {
                return function(t) {
                    zn(Gn, tr(Xn()), Wn, t);
                }(t);
            }
        };
    }
    function ir(t) {
        return function() {
            return er(Hn(Gn, t));
        };
    }
    var or = "_gc_test_";
    function ar(t) {
        localStorage.setItem(Gn, tr(t));
    }
    function sr() {
        return er(localStorage.getItem(Gn));
    }
    function ur() {
        ar(Xn());
    }
    var cr, lr = 10, fr = 100, dr = [];
    function pr(t, e) {
        var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0
            , r = e.isLockEnabled
            , i = e.persistSession
            , o = e.expireSession
            , a = function(t) {
                return i(x({}, t, {
                    lock: u
                }));
            }
            , s = function() {
                var t = e.retrieveSession()
                    , n = t.lock;
                return t.lock && delete t.lock,
                {
                    session: t,
                    lock: n
                };
            };
        if (cr || (cr = t),
        t === cr)
            if (r && n >= fr)
                hr(e);
            else {
                var u, c = s();
                if (r) {
                    if (c.lock && !Qn(c.session))
                        return void vr(t, e, n);
                    if (u = Q(),
                    a(c.session),
                    (c = s()).lock !== u && !Qn(c.session))
                        return void vr(t, e, n);
                }
                var l = t.process(c.session);
                if (!r || (c = s()).lock === u || Qn(c.session)) {
                    if (l && (Jn(l) ? o() : (l.expire = String(wt() + jn),
                    r ? a(l) : i(l))),
                    r && (!l || !Jn(l))) {
                        if ((c = s()).lock !== u && !Qn(c.session))
                            return void vr(t, e, n);
                        i(c.session),
                        l = c.session;
                    }
                    t.after && t.after(l || c.session),
                    hr(e);
                } else
                    vr(t, e, n);
            }
        else
            dr.push(t);
    }
    function vr(t, e, n) {
        h((function() {
            pr(t, e, n + 1);
        }
        ), lr);
    }
    function hr(t) {
        cr = void 0;
        var e = dr.shift();
        e && pr(e, t);
    }
    var _r = ct;
    function gr(t) {
        var e = nr(t);
        return !e && t.allowFallbackToLocalStorage && (e = function() {
            try {
                var t = Q()
                    , e = "".concat(or).concat(t);
                localStorage.setItem(e, t);
                var n = localStorage.getItem(e);
                return localStorage.removeItem(e),
                t === n ? {
                    type: "LocalStorage"
                } : void 0;
            } catch (t) {
                return;
            }
        }()),
        e;
    }
    function mr(t, e, n) {
        var r, i = new tn, o = new tn, a = new tn, s = "Cookie" === t.type ? rr(t.cookieOptions) : {
                isLockEnabled: !1,
                persistSession: ar,
                retrieveSession: sr,
                expireSession: ur
            }, u = s.expireSession, c = g((function() {
                pr({
                    process: function(t) {
                        return Jn(t) ? Xn() : void 0;
                    },
                    after: p
                }, s);
            }
            ), _r);
        v();
        var l = Y((function() {
                pr({
                    process: function(t) {
                        if (!Qn(t)) {
                            var r = p(t);
                            return function(t) {
                                if (Qn(t))
                                    return !1;
                                var r = n(t[e])
                                    , i = r.trackingType
                                    , o = r.isTracked;
                                t[e] = i,
                                delete t.isExpired,
                                o && !t.id && (t.id = Q(),
                                t.created = String(wt()));
                            }(r),
                            r;
                        }
                    },
                    after: function(t) {
                        Qn(t) || h() || function(t) {
                            r = t,
                            i.notify();
                        }(t),
                        r = t;
                    }
                }, s);
            }
            ), _r)
            , f = l.throttled
            , d = l.cancel;
        function p(t) {
            return Jn(t) && (t = Xn()),
            h() && (!function(t) {
                return r.id !== t.id || r[e] !== t[e];
            }(t) ? (a.notify({
                    previousState: r,
                    newState: t
                }),
                r = t) : (r = Xn(),
                o.notify())),
            t;
        }
        function v() {
            pr({
                process: function(t) {
                    if (Qn(t))
                        return Xn();
                },
                after: function(t) {
                    r = t;
                }
            }, s);
        }
        function h() {
            return void 0 !== r[e];
        }
        return {
            expandOrRenewSession: f,
            expandSession: function() {
                pr({
                    process: function(t) {
                        return h() ? p(t) : void 0;
                    }
                }, s);
            },
            getSession: function() {
                return r || {};
            },
            renewObservable: i,
            expireObservable: o,
            sessionStateUpdateObservable: a,
            restartSession: v,
            expire: function() {
                d(),
                u(),
                p(Xn());
            },
            stop: function() {
                m(c);
            },
            updateSessionState: function(t) {
                pr({
                    process: function(e) {
                        return x({}, e, t);
                    },
                    after: p
                }, s);
            }
        };
    }
    var yr, br, Er = {
        ALLOW: "allow",
        MASK: "mask",
        MASK_USER_INPUT: "mask-user-input"
    };
    function wr(t) {
        if (void 0 === t.sampleRate || Mt(t.sampleRate))
            if (void 0 === t.sessionSampleRate || Mt(t.sessionSampleRate)) {
                if (void 0 === t.telemetrySampleRate || Mt(t.telemetrySampleRate)) {
                    var e = Wt(t.sessionSampleRate, t.sampleRate);
                    return x({
                        beforeSend: t.beforeSend && d(t.beforeSend, "beforeSend threw an error:"),
                        sessionStoreStrategyType: gr(t),
                        sessionSampleRate: Wt(e, 100),
                        service: t.service,
                        version: t.version,
                        env: t.env,
                        telemetrySampleRate: Wt(t.telemetrySampleRate, 100),
                        telemetryEnabled: Wt(t.telemetryEnabled, !1),
                        silentMultipleInit: !!t.silentMultipleInit,
                        batchBytesLimit: 16 * Ne,
                        eventRateLimiterThreshold: 3e3,
                        maxTelemetryEventsPerPage: 15,
                        flushTimeout: 30 * ct,
                        batchMessagesLimit: 50,
                        messageBytesLimit: 256 * Ne,
                        resourceUrlLimit: 5 * Ne,
                        storeContextsToLocal: !!t.storeContextsToLocal,
                        storeContextsKey: t.storeContextsKey,
                        sendContentTypeByJson: !!t.sendContentTypeByJson,
                        retryMaxSize: Wt(t.retryMaxSize, -1)
                    }, function(t) {
                        var e = function(t) {
                            return !1;
                        };
                        "isIntakeUrl"in t && D(t.isIntakeUrl) && q(t.isIntakeUrl()) && (e = t.isIntakeUrl);
                        var n = function(t) {
                            return !1;
                        };
                        return "isServerError"in t && D(t.isServerError) && q(t.isServerError()) && (n = t.isServerError),
                        {
                            rumEndpoint: Un(t, "rum"),
                            logsEndpoint: Un(t, "log"),
                            sessionReplayEndPoint: Un(t, "sessionReplay"),
                            isIntakeUrl: e,
                            isServerError: n
                        };
                    }(t));
                }
                o.error("Telemetry Sample Rate should be a number between 0 and 100");
            } else
                o.error("Sample Rate should be a number between 0 and 100");
        else
            o.error("Sample Rate should be a number between 0 and 100");
    }
    function Sr() {
        return yr || (yr = new tn((function(t) {
            if (window.fetch) {
                var e = Xe(window, "fetch", (function(e) {
                    return function(t, e) {
                        var n = t.parameters
                            , r = t.onPostCall
                            , i = t.handlingStack
                            , o = n[0]
                            , a = n[1]
                            , s = a && a.method;
                        void 0 === s && o instanceof Request && (s = o.method);
                        var u = void 0 !== s ? String(s).toUpperCase() : "GET"
                            , l = o instanceof Request ? o.url : Cn(String(o))
                            , f = bt()
                            , d = {
                                state: "start",
                                init: a,
                                input: o,
                                method: u,
                                startClocks: f,
                                url: l,
                                handlingStack: i
                            };
                        e.notify(d),
                        n[0] = d.input,
                        n[1] = d.init,
                        r((function(t) {
                            return function(t, e, n) {
                                var r = n
                                    , i = function(e) {
                                        r.state = "resolve",
                                        x(r, e),
                                        t.notify(r);
                                    };
                                e.then(c((function(t) {
                                    var e = "";
                                    try {
                                        e = t.constructor === Response && t.type || "";
                                    } catch (t) {
                                        e = "";
                                    }
                                    i({
                                        response: t,
                                        responseType: e,
                                        status: t.status,
                                        isAborted: !1
                                    });
                                }
                                )), c((function(t) {
                                    i({
                                        status: 0,
                                        isAborted: r.init && r.init.signal && r.init.signal.aborted || t instanceof DOMException && t.code === DOMException.ABORT_ERR,
                                        error: t
                                    });
                                }
                                )));
                            }(e, t, d);
                        }
                        ));
                    }(e, t);
                }
                ), {
                    computeHandlingStack: !0
                });
                return e.stop;
            }
        }
        ))),
        yr;
    }
    var Tr = new WeakMap;
    function Cr() {
        return br || (br = new tn((function(t) {
            var e = Xe(XMLHttpRequest.prototype, "open", Ir)
                , n = Xe(XMLHttpRequest.prototype, "send", (function(e) {
                    !function(t, e) {
                        var n = t.target
                            , r = t.handlingStack
                            , i = Tr.get(n);
                        if (i) {
                            var o = i;
                            o.state = "start",
                            o.startClocks = bt(),
                            o.isAborted = !1,
                            o.xhr = n,
                            o.handlingStack = r;
                            var a = !1
                                , s = Xe(n, "onreadystatechange", (function() {
                                    n.readyState === XMLHttpRequest.DONE && u();
                                }
                                )).stop
                                , u = function() {
                                    if (c(),
                                    s(),
                                    !a) {
                                        a = !0;
                                        var t = i;
                                        t.state = "complete",
                                        t.duration = St(o.startClocks.timeStamp, Et()),
                                        t.status = n.status,
                                        e.notify(R(t));
                                    }
                                }
                                , c = on(n, "loadend", u).stop;
                            e.notify(o);
                        }
                    }(e, t);
                }
                ), {
                    computeHandlingStack: !0
                })
                , r = Xe(XMLHttpRequest.prototype, "abort", Or);
            return function() {
                e.stop(),
                n.stop(),
                r.stop();
            };
        }
        ))),
        br;
    }
    function Ir(t) {
        var e = t.target
            , n = t.parameters[0]
            , r = t.parameters[1];
        Tr.set(e, {
            state: "open",
            method: String(n).toUpperCase(),
            url: Cn(String(r))
        });
    }
    function Or(t) {
        var e = t.target
            , n = Tr.get(e);
        n && (n.isAborted = !0);
    }
    var Ar = {
        HIDDEN: "visibility_hidden",
        UNLOADING: "before_unload",
        PAGEHIDE: "page_hide",
        FROZEN: "page_frozen"
    };
    function xr(t) {
        return Lt(M(Ar), t);
    }
    function Rr(t) {
        return t.nodeType === Node.ELEMENT_NODE;
    }
    function kr(t) {
        return Rr(t) && Boolean(t.shadowRoot);
    }
    function Nr(t) {
        var e = t;
        return !!e.host && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE && Rr(e.host);
    }
    function Lr(t, e) {
        for (var n = t.firstChild; n; )
            e(n),
            n = n.nextSibling;
        kr(t) && e(t.shadowRoot);
    }
    function Dr(t) {
        return Nr(t) ? t.host : t.parentNode;
    }
    function Pr(t, e) {
        if (document.readyState === t || "complete" === document.readyState)
            return e(),
            {
                stop: st
            };
        var n = "complete" === t ? ie.LOAD : ie.DOM_CONTENT_LOADED;
        return on(window, n, e, {
            once: !0
        });
    }
    function Mr() {
        var t, e = window.visualViewport;
        return t = e ? e.pageLeft - e.offsetLeft : void 0 !== window.scrollX ? window.scrollX : window.pageXOffset || 0,
        Math.round(t);
    }
    function Ur() {
        var t, e = window.visualViewport;
        return t = e ? e.pageTop - e.offsetTop : void 0 !== window.scrollY ? window.scrollY : window.pageYOffset || 0,
        Math.round(t);
    }
    var Vr = {
            sdk_name: "_gc.sdk_name",// SDK 名称
            sdk_version: "_gc.sdk_version",// SDK 版本
            app_id: "application.id",// 应用 ID
            env: "env",// 环境
            service: "service",// 服务
            version: "version",// 版本
            source: "source",// 来源
            userid: "user.id",// 用户 ID
            user_email: "user.email",// 用户邮箱
            user_name: "user.name",// 用户名
            session_id: "session.id",// 会话 ID
            session_type: "session.type",// 会话类型
            session_sampling: "session.is_sampling",// 会话采样
            is_signin: "user.is_signin",// 是否登录
            os: "device.os",// 操作系统
            os_version: "device.os_version",// 操作系统版本
            os_version_major: "device.os_version_major",// 操作系统版本主版本
            browser: "device.browser",// 浏览器
            browser_version: "device.browser_version",// 浏览器版本
            browser_version_major: "device.browser_version_major",// 浏览器版本主版本
            screen_size: "device.screen_size",// 屏幕大小
            network_type: "device.network_type",// 网络类型
            device: "device.device",// 设备
            view_id: "view.id",// 视图 ID
            view_referrer: "view.referrer",// 视图 referrer
            view_url: "view.url",// 视图 URL
            view_host: "view.host",// 视图 host
            view_path: "view.path",// 视图 path
            view_name: "view.name",// 视图 name
            view_path_group: "view.path_group"// 视图 path 组
        }
        , Br = {
            view_url_query: "view.url_query",// 视图 URL 查询
            action_id: "action.id",// 动作 ID       
            action_ids: "action.ids",// 动作 IDs
            view_in_foreground: "view.in_foreground",// 视图在前台
            display: "display",// 显示
            session_has_replay: "session.has_replay",// 会话有回放
            is_login: "user.is_login",// 用户是否登录
            page_states: "_gc.page_states",// 页面状态              
            session_sample_rate: "_gc.configuration.session_sample_rate",// 会话采样率          
            session_replay_sample_rate: "_gc.configuration.session_replay_sample_rate",// 会话回放采样率
            drift: "_gc.drift"// 漂移
        }
        , zr = {
            view: {
                type: ue.VIEW,// 视图
                tags: {
                    view_loading_type: "view.loading_type",// 视图加载类型
                    view_apdex_level: "view.apdex_level",// 视图 APDEX 级别
                    view_privacy_replay_level: "privacy.replay_level"// 隐私回放级别
                },
                fields: {
                    sampled_for_replay: "session.sampled_for_replay",// 回放采样
                    is_active: "view.is_active",// 视图是否活跃
                    session_replay_stats: "_gc.replay_stats",// 回放统计
                    session_is_active: "session.is_active",// 会话是否活跃
                    view_error_count: "view.error.count",// 视图错误数量
                    view_resource_count: "view.resource.count",// 视图资源数量
                    view_long_task_count: "view.long_task.count",// 视图长任务数量
                    view_action_count: "view.action.count",// 视图动作数量
                    first_contentful_paint: "view.first_contentful_paint",// 首次内容绘制
                    largest_contentful_paint: "view.largest_contentful_paint",// 最大内容绘制
                    largest_contentful_paint_element_selector: "view.largest_contentful_paint_element_selector",// 最大内容绘制元素选择器
                    cumulative_layout_shift: "view.cumulative_layout_shift",// 累积布局偏移
                    cumulative_layout_shift_time: "view.cumulative_layout_shift_time",// 累积布局偏移时间
                    cumulative_layout_shift_target_selector: "view.cumulative_layout_shift_target_selector",// 累积布局偏移目标选择器
                    first_input_delay: "view.first_input_delay",// 首次输入延迟
                    loading_time: "view.loading_time",// 加载时间
                    dom_interactive: "view.dom_interactive",// DOM 交互
                    dom_content_loaded: "view.dom_content_loaded",// DOM 内容加载
                    dom_complete: "view.dom_complete",// DOM 完成
                    load_event: "view.load_event",// 加载事件
                    first_input_time: "view.first_input_time",// 首次输入时间
                    first_input_target_selector: "view.first_input_target_selector",// 首次输入目标选择器
                    first_paint_time: "view.fpt",// 首次绘制时间
                    interaction_to_next_paint: "view.interaction_to_next_paint",// 交互到下一个绘制
                    interaction_to_next_paint_target_selector: "view.interaction_to_next_paint_target_selector",// 交互到下一个绘制目标选择器
                    resource_load_time: "view.resource_load_time",// 资源加载时间
                    time_to_interactive: "view.tti",// 交互时间
                    dom: "view.dom",// DOM
                    dom_ready: "view.dom_ready",// DOM 准备
                    time_spent: "view.time_spent",// 花费时间
                    first_byte: "view.first_byte",// 首次字节
                    frustration_count: "view.frustration.count",// 挫败次数
                    custom_timings: "view.custom_timings"// 自定义计时
                }
            },
            resource: {
                type: ue.RESOURCE,// 资源
                tags: {
                    trace_id: "_gc.trace_id",// 跟踪 ID
                    span_id: "_gc.span_id",// 跨度 ID
                    resource_id: "resource.id",// 资源 ID
                    resource_status: "resource.status",// 资源状态
                    resource_status_group: "resource.status_group",// 资源状态组
                    resource_method: "resource.method"// 资源方法
                },
                fields: {
                    duration: "resource.duration",// 持续时间
                    resource_size: "resource.size",// 资源大小
                    resource_url: "resource.url",// 资源 URL
                    resource_url_host: "resource.url_host",// 资源 URL 主机
                    resource_url_path: "resource.url_path",// 资源 URL 路径
                    resource_url_path_group: "resource.url_path_group",// 资源 URL 路径组
                    resource_url_query: "resource.url_query",// 资源 URL 查询
                    resource_delivery_type: "resource.delivery_type",// 资源交付类型
                    resource_type: "resource.type",// 资源类型
                    resource_protocol: "resource.protocol",// 资源协议
                    resource_encode_size: "resource.encoded_body_size",// 资源编码大小
                    resource_decode_size: "resource.decoded_body_size",// 资源解码大小
                    resource_transfer_size: "resource.transfer_size",// 资源传输大小
                    resource_render_blocking_status: "resource.render_blocking_status",// 资源渲染阻塞状态
                    resource_dns: "resource.dns",// 资源 DNS
                    resource_tcp: "resource.tcp",// 资源 TCP
                    resource_ssl: "resource.ssl",// 资源 SSL
                    resource_ttfb: "resource.ttfb",// 资源 TTFB
                    resource_trans: "resource.trans",// 资源传输
                    resource_redirect: "resource.redirect",// 资源重定向
                    resource_first_byte: "resource.firstbyte",// 资源首次字节   
                    resource_dns_time: "resource.dns_time",// 资源 DNS 时间// 资源 DNS 时间// 资源 DNS 时间
                    resource_download_time: "resource.download_time",// 资源下载时间// 资源下载时间// 资源下载时间
                    resource_first_byte_time: "resource.first_byte_time",// 资源首次字节时间// 资源首次字节时间// 资源首次字节时间
                    resource_connect_time: "resource.connect_time",// 资源连接时间  
                    resource_ssl_time: "resource.ssl_time",// 资源 SSL 时间
                    resource_redirect_time: "resource.redirect_time"// 资源重定向时间
                }
            },
            error: {
                type: ue.ERROR,// 错误 错误
                tags: {
                    error_id: "error.id",// 错误 ID// 错误 ID
                    trace_id: "_gc.trace_id",// 跟踪 ID// 跟踪 ID
                    span_id: "_gc.span_id",// 跨度 ID// 跨度 ID
                    error_source: "error.source",// 错误来源// 错误来源
                    error_type: "error.type",// 错误类型// 错误类型
                    error_handling: "error.handling"// 错误处理
                },
                fields: {
                    error_message: ["string", "error.message"],// 错误消息      
                    error_stack: ["string", "error.stack"],// 错误堆栈
                    error_causes: ["string", "error.causes"],// 错误原因
                    error_handling_stack: ["string", "error.handling_stack"]// 错误处理堆栈
                }
            },
            long_task: {
                type: ue.LONG_TASK,// 长任务 长任务
                tags: {
                    long_task_id: "long_task.id"// 长任务 ID
                },
                fields: {
                    duration: "long_task.duration",// 持续时间
                    blocking_duration: "long_task.blocking_duration",// 阻塞持续时间
                    first_ui_event_timestamp: "long_task.first_ui_event_timestamp",// 首次 UI 事件时间戳
                    render_start: "long_task.render_start",// 渲染开始
                    style_and_layout_start: "long_task.style_and_layout_start",// 样式和布局开始
                    long_task_start_time: "long_task.start_time",// 长任务开始时间
                    scripts: ["string", "long_task.scripts"]// 脚本
                }
            },
            action: {
                type: ue.ACTION,// 动作 动作
                tags: {
                    action_type: "action.type"// 动作类型
                },
                fields: {
                    action_name: "action.target.name",// 动作名称
                    duration: "action.loading_time",// 持续时间
                    action_error_count: "action.error.count",// 动作错误数量
                    action_resource_count: "action.resource.count",// 动作资源数量
                    action_frustration_types: "action.frustration.type",// 动作挫败类型
                    action_long_task_count: "action.long_task.count",// 动作长任务数量
                    action_target: "_gc.action.target",// 动作目标
                    action_position: "_gc.action.position"// 动作位置
                }
            },
            telemetry: {
                type: "telemetry",// 遥测 遥测
                fields: {
                    status: "telemetry.status",// 状态
                    message: ["string", "telemetry.message"],// 消息
                    type: "telemetry.type",// 类型
                    error_stack: ["string", "telemetry.error.stack"],// 错误堆栈
                    error_kind: ["string", "telemetry.error.kind"],// 错误类型
                    connectivity: ["string", "telemetry.connectivity"],// 连接
                    runtime_env: ["string", "telemetry.runtime_env"],// 运行环境
                    usage: ["string", "telemetry.usage"],// 使用
                    configuration: ["string", "telemetry.configuration"]// 配置
                }
            },
            browser_log: {
                type: ue.LOGGER,// 浏览器日志 浏览器日志
                tags: {
                    error_source: "error.source",// 错误来源
                    error_type: "error.type",// 错误类型
                    error_resource_url: "http.url",// 错误资源 URL
                    error_resource_url_host: "http.url_host",// 错误资源 URL 主机
                    error_resource_url_path: "http.url_path",// 错误资源 URL 路径
                    error_resource_url_path_group: "http.url_path_group",// 错误资源 URL 路径组
                    error_resource_status: "http.status_code",// 错误资源状态
                    error_resource_status_group: "http.status_group",// 错误资源状态组
                    error_resource_method: "http.method",// 错误资源方法
                    action_id: "user_action.id",// 动作 ID
                    service: "service",// 服务
                    status: "status"// 状态
                },
                fields: {
                    message: ["string", "message"],// 消息
                    error_message: ["string", "error.message"],// 错误消息
                    error_stack: ["string", "error.stack"]// 错误堆栈
                }   
            }
        }
        , Hr = lt
        , Fr = Wn
        , Wr = [];
    function jr(t, e, n) {
        var r = new tn
            , i = new tn
            , o = mr(t.sessionStoreStrategyType, e, n);
        Wr.push((function() {
            return o.stop();
        }
        ));
        var a, s, u = Jt({
            expireDelay: Fr
        });
        function c() {
            return {
                id: o.getSession().id,
                trackingType: o.getSession()[e]
            };
        }
        return Wr.push((function() {
            return u.stop();
        }
        )),
        o.renewObservable.subscribe((function() {
            u.add(c(), yt()),
            r.notify();
        }
        )),
        o.expireObservable.subscribe((function() {
            i.notify(),
            u.closeActive(yt());
        }
        )),
        o.expandOrRenewSession(),
        u.add(c(), Tt().relative),
        a = function() {
            o.expandOrRenewSession();
        }
        ,
        s = an(window, [ie.CLICK, ie.TOUCH_START, ie.KEY_DOWN, ie.SCROLL], a, {
            capture: !0,
            passive: !0
        }).stop,
        Wr.push(s),
        function(t) {
            var e = function() {
                    "visible" === document.visibilityState && t();
                }
                , n = on(document, ie.VISIBILITY_CHANGE, e).stop;
            Wr.push(n);
            var r = g(e, Hr);
            Wr.push((function() {
                m(r);
            }
            ));
        }((function() {
            return o.expandSession();
        }
        )),
        function(t) {
            var e = on(window, ie.RESUME, t, {
                capture: !0
            }).stop;
            Wr.push(e);
        }((function() {
            o.restartSession();
        }
        )),
        {
            findSession: function(t, e) {
                return u.find(t, e);
            },
            renewObservable: r,
            expireObservable: i,
            sessionStateUpdateObservable: o.sessionStateUpdateObservable,
            expire: o.expire,
            updateSessionState: o.updateSessionState // 更新会话状态        
        };
    }
    var Gr = 80 * Ne
        , $r = 32
        , Kr = 3 * Le
        , qr = 256 * ct
        , Zr = ct
        , Yr = {
            UP: 0,
            FAILURE_DETECTED: 1,
            DOWN: 2
        }
        , Xr = {
            AFTER_SUCCESS: 0,
            AFTER_RESUME: 1
        };
        // 发送请求
    function Qr(t, e, n, r, i) {
        e.transportStatus === Yr.UP && 0 === e.queuedPayloads.size() && e.bandwidthMonitor.canHandle(t) ? ti(t, e, n, {
            onSuccess: function() {
                return ei(Xr.AFTER_SUCCESS, e, n, r, i);
            },
            onFailure: function() {
                e.queuedPayloads.enqueue(t),
                Jr(e, n, r, i);
            }
        }) : e.queuedPayloads.enqueue(t);
    }
    function Jr(t, e, n, r) {
        t.transportStatus === Yr.DOWN && h((function() {
            ti(t.queuedPayloads.first(), t, e, {
                onSuccess: function() {
                    t.queuedPayloads.dequeue(),
                    t.currentBackoffTime = Zr,
                    ei(Xr.AFTER_RESUME, t, e, n, r);
                },
                onFailure: function() {
                    t.currentBackoffTime = Math.min(qr, 2 * t.currentBackoffTime),
                    Jr(t, e, n, r);
                }
            });
        }
        ), t.currentBackoffTime);
    }
    function ti(t, e, n, r) {
        var i = r.onSuccess
            , o = r.onFailure;
        e.bandwidthMonitor.add(t),
        n(t, (function(n) {
            e.bandwidthMonitor.remove(t),
            !function(t, e, n) {
                return !(e.retryMaxSize > -1 && n.retry && n.retry.count > e.retryMaxSize) && ("opaque" !== t.type && (0 === t.status && !navigator.onLine || 408 === t.status || 429 === t.status || t.status >= 500));
            }(n, e, t) ? (e.transportStatus = Yr.UP,
                i()) : (e.transportStatus = e.bandwidthMonitor.ongoingRequestCount > 0 ? Yr.FAILURE_DETECTED : Yr.DOWN,
                t.retry = {
                    count: t.retry ? t.retry.count + 1 : 1,
                    lastFailureStatus: n.status
                },
                o());
        }
        ));
    }
    function ei(t, e, n, r, i) {
        t === Xr.AFTER_SUCCESS && e.queuedPayloads.isFull() && !e.queueFullReported && (i({
            message: "Reached max " + r + " events size queued for upload: " + Kr / Le + "MiB",
            source: Ge.AGENT,
            startClocks: bt()
        }),
        e.queueFullReported = !0);
        var o = e.queuedPayloads;
        for (e.queuedPayloads = ni(); o.size() > 0; )
            Qr(o.dequeue(), e, n, r, i);
    }
    function ni() {
        var t = [];
        return {
            bytesCount: 0,
            enqueue: function(e) {
                this.isFull() || (t.push(e),
                this.bytesCount += e.bytesCount);
            },
            first: function() {
                return t[0];
            },
            dequeue: function() {
                var e = t.shift();
                return e && (this.bytesCount -= e.bytesCount),
                e;
            },
            size: function() {
                return t.length;
            },
            isFull: function() {
                return this.bytesCount >= Kr;
            }
        };
    }
    function ri() {
        var t, e = window.navigator;
        return {
            status: e.onLine ? "connected" : "not_connected",
            interfaces: e.connection && e.connection.type ? [e.connection.type] : void 0,
            effective_type: null === (t = e.connection) || void 0 === t ? void 0 : t.effectiveType
        };
    }
    // 日志类型
    var ii = {
            log: "log",// 日志
            configuration: "configuration",// 配置
            usage: "usage"// 使用
        }

        // 日志级别 
        , oi = {
            debug: "debug",// 调试
            error: "error"// 错误
        }
        // 匿名
        , ai = ["https://static.guance.com", "http://localhost", "<anonymous>"]
        // 数据流类型
        , si = {
            LOGS: "browser-logs-sdk",// 浏览器日志
            RUM: "browser-rum-sdk"// 浏览器 RUM
        }
        , ui = Yt()
        // 添加日志     
        , ci = function(t) {
            ui.add((function() {    
                ci(t);
            }
            ));
        };
        // 日志
    function li(t, e) {
        var n, i = new tn, o = new Set, a = e.telemetryEnabled && pt(e.telemetrySampleRate), s = {
            is_local_file: "file:" === window.location.protocol,// 是否是本地文件
            is_worker: "WorkerGlobalScope"in self// 是否是 Web Worker
        };
        // 添加日志
        return ci = function(r) { // 添加日志
            var u = _e(r); // 获取日志
            if (a && o.size < e.maxTelemetryEventsPerPage && !o.has(u)) { // 如果日志数量小于最大日志数量并且没有重复
                var c = function(t, e, r) { // 添加日志
                    return N({
                        type: "telemetry",// 类型
                        date: Et(),// 时间戳
                        service: t,// 服务
                        version: "3.2.16",// 版本
                        source: "browser",// 来源
                        telemetry: N(e, {
                            runtime_env: r,
                            connectivity: ri()
                        })
                    }, void 0 !== n ? n() : {});
                }(t, r, s);
                i.notify(c),// 通知
                o.add(u);// 添加日志
            }
        }
        ,
        r = di,// 设置上下文提供者
        {
            setContextProvider: function(t) {// 设置上下文提供者
                n = t;
            },
            observable: i,// 观察者
            enabled: a// 启用
        };
    }
    // 日志     
    function fi(t, e) { 
        f(t, e),// 添加日志
        ci(x({
            type: ii.log,// 类型
            message: t,// 消息
            status: oi.debug// 状态
        }, e));
    }
    // 日志     
    function di(t, e) {
        ci(x({
            type: ii.log,// 类型
            status: oi.error// 状态     
        }, function(t) {
            if (t instanceof Error) {
                var e = be(t);
                return {
                    error: {// 错误
                        kind: e.name,// 类型
                        stack: qe(vi(e))// 堆栈
                    },
                    message: e.message// 消息
                };
            }
            return {
                error: {// 错误
                    stack: je// 堆栈
                },              
                message: ve.UNCAUGHT + " " + _e(t)// 消息
            };
        }(t), e));
    }
    // 使用
    function pi(t) {
        ci({// 添加日志
            type: ii.usage,// 类型
            usage: t// 使用
        });
    }
    
    function vi(t) {
        return t.stack = t.stack.filter((function(t) {
            return !t.url || ai.some((function(e) {// 如果 URL 不是匿名
                return jt(t.url, e);// 判断 URL 是否在匿名列表中
            }
            ));
        }
        )),
        t;// 返回堆栈
    }
    // 编码
    function hi(t, e) {
        return t ? (t = t + (-1 === t.indexOf("?") ? "?" : "&") + "precision=ms",
        e && (t = t + "&encoding=" + e),// 如果编码不为空，则添加编码
        t) : t;
    }
    function _i(t, e, n, r) {
        void 0 === n && (n = -1);
        var i = function(t) {
                return {
                    transportStatus: Yr.UP,
                    currentBackoffTime: Zr,
                    bandwidthMonitor: {
                        ongoingRequestCount: 0,
                        ongoingByteCount: 0,
                        canHandle: function(t) {// 是否可以处理
                            return 0 === this.ongoingRequestCount || this.ongoingByteCount + t.bytesCount <= Gr && this.ongoingRequestCount < $r;
                        },
                        add: function(t) {
                            this.ongoingRequestCount += 1,
                            this.ongoingByteCount += t.bytesCount;
                        },
                        remove: function(t) {// 移除
                            this.ongoingRequestCount -= 1,
                            this.ongoingByteCount -= t.bytesCount;
                        }
                    },
                    queuedPayloads: ni(),// 队列负载
                    queueFullReported: !1,// 队列满报告
                    retryMaxSize: t// 重试最大大小
                };
            }(n)
            , 
            // 发送请求
            o = function(n, r) {// 发送请求
                return function(t, e, n, r) {
                    var i = n.data// 数据
                        , o = n.bytesCount// 字节数
                        , a = hi(t, n.encoding)// 编码
                        , s = function() {// 是否可以发送
                            try {// 尝试
                                return window.Request && "keepalive"in new Request("http://a");// 是否可以发送
                            } catch (t) {
                                return !1;
                            }
                        }() && o < e;
                    if (s) {
                        var u = {// 请求
                            method: "POST",// 方法
                            body: i,// 数据
                            keepalive: !0,// 保持活跃
                            mode: "cors"// 模式
                        };
                        n.type && (u.headers = {// 如果类型不为空，则添加头部
                            "Content-Type": n.type// 内容类型
                        }),
                        fetch(a, u).then(c((function(t) {
                            "function" == typeof r && r({// 如果回调函数不为空，则调用回调函数  
                                status: t.status,// 状态
                                type: t.type// 类型
                            });
                        }
                        )), c((function() {
                            mi(a, n, r);
                        }
                        )));
                    } else
                        mi(a, n, r);
                }(t, e, n, r);
            };
        return {// 返回对象
            send: function(e) {
                Qr(e, i, o, t, r);// 发送请求   
            },
            sendOnExit: function(n) {
                !function(t, e, n) {
                    var r = n.data// 数据
                        , i = n.bytesCount// 字节数
                        , o = hi(t, n.encoding)// 编码
                        , a = !!navigator.sendBeacon && i < e;// 是否可以发送
                    if (a)
                        try {
                            var s;
                            if (s = n.type ? new Blob([r],{// 如果类型不为空，则创建 Blob
                                type: n.type
                            }) : r,
                            navigator.sendBeacon(o, s))// 发送请求
                                return;
                        } catch (t) {
                            !function(t) {// 记录错误
                                gi || (gi = !0,
                                di(t));// 记录错误
                            }(t);
                        }
                    mi(o, n);// 发送请求
                }(t, e, n);// 发送请求
            }
        };
    }
    var gi = !1;
    // 发送请求
    function mi(t, e, n) {
        var r = e.data// 数据
            , i = new XMLHttpRequest;// 创建 XMLHttpRequest
        i.open("POST", t, !0),// 打开请求
        r instanceof Blob ? i.setRequestHeader("Content-Type", r.type) : e.type && i.setRequestHeader("Content-Type", e.type),
        on(i, "loadend", (function() {// 监听请求结束
            "function" == typeof n && n({
                status: i.status
            });
        }
        ), {
            once: !0
        }),
        i.send(r);
    }
    // 类型
    function yi(t) {
        // 类型
        return yi = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        ,
        yi(t);// 类型
    }
    // 编码
    function bi(t) {
        if ("object" === yi(t) && t)
            t = _e(t);
        else if (!K(t))
            return t;
        return String(t).replace(/[\s=,"]/g, (function(t) {
            return "\\" + t;
        }
        ));
    }
    // 编码
    function Ei(t, e) {
        return "object" === yi(t) && t ? t = _e(t) : e && (t = "" + t),
        t;
    }
    function wi(t) {
        return '"' + t.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
    }
    function Si(t) {
        return "object" === yi(t) && t ? wi(_e(t)) : K(t) ? wi(t) : t;
    }
    var Ti = "custom_keys"
        , Ci = function(t) { // 构建日志
            if (!t || !t.type)
                return {
                    rowStr: "",// 日志字符串
                    rowData: void 0
                };
            var e = {
                    tags: {},
                    fields: {}
                }
                , n = !1
                , r = "";
            return A(zr, (function(i, o) {
                if (i.type === t.type) {
                    r += o + ",",
                    e.measurement = o;
                    var a = []
                        , s = k({}, Vr, i.tags)
                        , u = ["date", "type", Ti];
                    A(s, (function(n, r) {
                        var i = Rt(t, n);
                        u.push(r),
                        (i || Z(i)) && (e.tags[r] = Ei(i, !0),
                        a.push(bi(r) + "=" + bi(i)));
                    }
                    ));
                    var c = []
                        , l = k({}, Br, i.fields);
                    if (A(l, (function(n, r) {// 如果字段不为空
                        if (L(n) && 2 === n.length) {// 如果字段长度为2
                            var i = n[1]// 字段值
                                , o = Rt(t, i);// 如果字段值不为空
                            u.push(r),
                            u.push(r),
                            null != o && (e.fields[r] = Ei(o),
                            c.push(bi(r) + "=" + Si(o)));
                        } else if (K(n)) {
                            o = Rt(t, n);
                            u.push(r),
                            null != o && (e.fields[r] = Ei(o),
                            c.push(bi(r) + "=" + Si(o)));
                        }
                    }
                    )),
                    t.context && j(t.context) && !G(t.context)) {
                        var f = [];
                        A(t.context, (function(t, n) {
                            u.indexOf(n) > -1 || (u.push(n),
                            null != t && (f.push(n),
                            e.fields[n] = Ei(t),
                            c.push(bi(n) + "=" + Si(t))));
                        }
                        )),
                        f.length && (e.fields[Ti] = Ei(f),
                        c.push(bi(Ti) + "=" + Si(f)));
                    }
                    t.type === ue.LOGGER && A(t, (function(t, n) {
                        -1 === u.indexOf(n) && null != t && (e.fields[n] = Ei(t),
                        c.push(bi(n) + "=" + Si(t)));
                    }
                    )),
                    a.length && (r += a.join(",")),
                    c.length && (r += " ",
                    r += c.join(","),
                    n = !0),
                    r = r + " " + t.date,
                    e.time = t.date;
                }
            }
            )),
            {
                rowStr: n ? r : "",
                rowData: n ? e : void 0
            };
        };
        // 发送日志
    function Ii(t) {
        var e = t.encoder// 编码器
            , n = t.request// 请求
            , r = t.messageBytesLimit// 消息字节限制
            , i = t.sendContentTypeByJson// 发送内容类型
            , a = t.flushController// 刷新控制器
            , s = {}
            , u = a.flushObservable.subscribe((function(t) {
                !function(t) {
                    var r = M(s).join(i ? "," : "\n");//
                    s = {};
                    var o = xr(t.reason)// 原因
                        , a = o ? n.sendOnExit : n.send;// 发送
                    if (o && e.isAsync) {
                        var u = e.finishSync();// 同步完成
                        u.outputBytesCount && a(Oi(u, i));// 发送
                        var l = [u.pendingData, r].filter(Boolean).join("\n");// 日志字符串
                        l && a({
                            data: l,
                            bytesCount: Pe(l)
                        });
                    } else {// 如果异步
                        if (r) {// 如果消息字节限制不为空
                            var f = c([r], e.isEmpty());// 创建日志字符串
                            i && (f += "]"),// 如果发送内容类型不为空，则添加右括号
                            e.write(f);// 写入日志
                        } else  
                            i && e.write("]");
                        e.finish((function(t) {
                            a(Oi(t));
                        }
                        ));
                    }
                }(t);
            }
            ));
        function c(t) {
            var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
            return i ? e ? "[" + t.join(",") : "," + t.join(",") : e ? t.join("\n") : "\n" + t.join("\n");
        }
        function l(t, n) {
            var u = function(t) {
                    return i ? _e(Ci(t).rowData) : Ci(t).rowStr;
                }(t)
                , l = e.estimateEncodedBytesCount(u);
            l >= r ? o.warn("Discarded a message whose size was bigger than the maximum allowed size ".concat(r, "KB.")) : (function(t) {
                return void 0 !== t && void 0 !== s[t];
            }(n) && function(t) {
                var n = s[t];
                delete s[t];
                var r = e.estimateEncodedBytesCount(n);// 估计编码字节数
                a.notifyAfterRemoveMessage(r);// 通知移除消息
            }(n),
            function(t, n, r) {
                a.notifyBeforeAddMessage(n),// 通知添加消息
                void 0 !== r ? (s[r] = t,// 如果字段不为空，则添加字段
                a.notifyAfterAddMessage()) : e.write(c([t], e.isEmpty()), (function(t) {
                    a.notifyAfterAddMessage(t - n);// 通知添加消息
                }
                ));
            }(u, l, n));
        }
        return {
            flushController: a,
            add: l,
            upsert: l,
            stop: u.unsubscribe
        };
    }
    function Oi(t, e) {// 发送日志
        return {
            data: "string" == typeof t.output ? t.output : new Blob([t.output],{
                type: "text/plain"
            }),
            type: e ? "application/json;UTF-8" : void 0,
            bytesCount: t.outputBytesCount,
            encoding: t.encoding
        };
    }
    function Ai(t) {// 刷新控制器
        var e = t.messagesLimit// 消息限制
            , n = t.bytesLimit// 字节限制
            , r = t.durationLimit// 时长限制
            , i = t.pageExitObservable// 页面退出观察者
            , o = t.sessionExpireObservable;// 会话过期观察者
        i.subscribe((function(t) {
            return l(t.reason);
        }
        )),
        o.subscribe((function() {// 会话过期
            return l("session_expire");
        }
        ));
        // 页面退出订阅
        var a, s = new tn((function() {
                return function() {
                    pageExitSubscription.unsubscribe(),
                    sessionExpireSubscription.unsubscribe();
                };
            }
            )), u = 0, c = 0;
        // 刷新
        function l(t) {
            if (0 !== c) {
                var e = c
                    , n = u;
                c = 0,
                u = 0,
                f(),
                s.notify({// 通知
                    reason: t,// 原因
                    messagesCount: e,// 消息数量
                    bytesCount: n// 字节数量
                });
            }
        }
        // 刷新
        function f() {
            _(a),
            a = void 0;
        }
        return {
            flushObservable: s,// 刷新观察者
            getMessagesCount: function() {
                return c;// 获取消息数量
            },
            // 通知添加消息
            notifyBeforeAddMessage: function(t) {
                u + t >= n && l("bytes_limit"),// 如果字节数量大于字节限制，则通知
                c += 1,// 增加消息数量
                u += t,// 增加字节数量
                void 0 === a && (a = h((function() {
                    l("duration_limit");// 通知时长限制         
                }
                ), r));
            },
            // 通知添加消息
            notifyAfterAddMessage: function(t) {
                void 0 === t && (t = 0),
                u += t,
                c >= e ? l("messages_limit") : u >= n && l("bytes_limit");
            },
            // 通知移除消息
            notifyAfterRemoveMessage: function(t) {
                u -= t,
                0 === (c -= 1) && f();
            }
        };
    }
    // 发送事件     
    function xi() {
        var t = v().FTWebViewJavascriptBridge;// 获取 WebViewJavascriptBridge
        if (t)
            return {
                send: function(e, n) {// 发送事件
                    t.sendEvent(JSON.stringify({
                        name: e,
                        data: n
                    }));
                }
            };
    }
    function Ri() {
        return !!xi();
    }
    var ki = "guance-synthetics-injects-rum";
    function Ni(t) {// 类型
        return Ni = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        ,
        Ni(t);
    }
    function Li(t, e) {// 数组      
        return function(t) {
            if (Array.isArray(t))
                return t;
        }(t) || function(t, e) {
            var n = null == t ? null : "undefined" != typeof Symbol && t[Symbol.iterator] || t["@@iterator"];
            if (null != n) {
                var r, i, o, a, s = [], u = !0, c = !1;
                try {
                    if (o = (n = n.call(t)).next,
                    0 === e) {
                        if (Object(n) !== n)
                            return;
                        u = !1;
                    } else
                        for (; !(u = (r = o.call(n)).done) && (s.push(r.value),
                        s.length !== e); u = !0)
                            ;
                } catch (t) {
                    c = !0,
                    i = t;
                } finally {
                    try {
                        if (!u && null != n.return && (a = n.return(),
                        Object(a) !== a))
                            return;
                    } finally {
                        if (c)
                            throw i;
                    }
                }
                return s;
            }
        }(t, e) || function(t, e) {
            if (!t)
                return;
            if ("string" == typeof t)
                return Di(t, e);
            var n = Object.prototype.toString.call(t).slice(8, -1);
            "Object" === n && t.constructor && (n = t.constructor.name);
            if ("Map" === n || "Set" === n)
                return Array.from(t);
            if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
                return Di(t, e);
        }(t, e) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }();
    }
    
    function Di(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var n = 0, r = new Array(e); n < e; n++)
            r[n] = t[n];
        return r;
    }
    // 对象 
    function Pi(t, e) {
        var n = Object.keys(t);// 获取对象键
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(t);// 获取对象符号
            e && (r = r.filter((function(e) {
                return Object.getOwnPropertyDescriptor(t, e).enumerable;
            }
            ))),
            n.push.apply(n, r);// 添加符号  
        }
        return n;
    }
    // 对象         
    function Mi(t, e, n) {
        return (e = function(t) {
            var e = function(t, e) {
                if ("object" !== Ni(t) || null === t)
                    return t;
                var n = t[Symbol.toPrimitive];
                if (void 0 !== n) {
                    var r = n.call(t, e || "default");
                    if ("object" !== Ni(r))
                        return r;
                    throw new TypeError("@@toPrimitive must return a primitive value.");
                }
                return ("string" === e ? String : Number)(t);
            }(t, "string");
            return "symbol" === Ni(e) ? e : String(e);
        }(e))in t ? Object.defineProperty(t, e, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : t[e] = n,
        t;
    }
    function Ui(t, e, n) {
        for (var r = function(t) {
                for (var e = 1; e < arguments.length; e++) {
                    var n = null != arguments[e] ? arguments[e] : {};
                    e % 2 ? Pi(Object(n), !0).forEach((function(e) {
                        Mi(t, e, n[e]);
                    }
                    )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Pi(Object(n)).forEach((function(e) {
                        Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
                    }
                    ));
                }
                return t;
            }({}, t), i = 0, a = Object.entries(e); i < a.length; i++) {
            var s = Li(a[i], 2)
                , u = s[0]
                , c = s[1]
                , l = c.required;
            "string" === c.type && u in r && (r[u] = String(r[u])),
            l && !(u in t) && o.warn("The property ".concat(u, " of ").concat(n, " context is required; context will not be sent to the intake."));
        }
        return r;
    }
    // 对象
    function Vi() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : ""
            , e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
            , n = e.customerDataTracker
            , r = e.propertiesConfig
            , i = void 0 === r ? {} : r
            , o = {}
            , a = new tn
            , s = {
                getContext: function() {
                    return ot(o);
                },
                setContext: function(e) {
                    "object" === rt(e) ? (o = ze(Ui(e, i, t)),
                    null == n || n.updateCustomerData(o)) : s.clearContext(),
                    a.notify();
                },
                setContextProperty: function(e, r) {
                    o[e] = ze(Ui(Mi({}, e, r), i, t)[e]),
                    null == n || n.updateCustomerData(o),
                    a.notify();
                },
                removeContextProperty: function(e) {
                    delete o[e],
                    null == n || n.updateCustomerData(o),
                    Ui(o, i, t),
                    a.notify();
                },
                clearContext: function() {
                    o = {},
                    null == n || n.resetCustomerData(),
                    a.notify();
                },
                changeObservable: a
            };
        return s;
    }
    var Bi = "user"
        , zi = "global context"
        , Hi = "view"
        , Fi = "_gc_s"
        , Wi = [];
    function ji(t, e, n, r) {
        var i = function(t, e, n) {
            return t.storeContextsKey && K(t.storeContextsKey) ? Fi + "_" + e + "_" + n + "_" + t.storeContextsKey : Fi + "_" + e + "_" + n;
        }(t, n, r);
        function o() {
            var t = localStorage.getItem(i);
            return null !== t ? JSON.parse(t) : {};
        }
        return Wi.push(on(window, ie.STORAGE, (function(t) {
            i === t.key && e.setContext(o());
        }
        ))),
        e.changeObservable.subscribe((function() {
            localStorage.setItem(i, JSON.stringify(e.getContext()));
        }
        )),
        e.setContext(N(o(), e.getContext())),
        e;
    }
    var Gi = 3 * Ne // 3KiB
        , $i = 16 * Ne // 16KiB
        , Ki = 200 // 200KiB
        , qi = {
            Unknown: 0,
            Enabled: 1,
            Disabled: 2
        };
    // 压缩
    function Zi() {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : qi.Disabled
            , e = new Map
            , n = !1;
        function r() {
            var r = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0;
            if (!n && t !== qi.Unknown) {
                var i = t === qi.Disabled ? Gi : $i// 压缩限制
                    , a = r;
                e.forEach((function(t) {
                    a += t.getBytesCount();// 累加字节数量
                }
                )),
                a > i && (!function(t) {
                    o.warn("Customer data exceeds the recommended ".concat(t / Ne, "KiB threshold."));
                }(i),
                n = !0);
            }
        }
        return {
            createDetachedTracker: function() {// 创建分离的跟踪器
                var t = Yi((function() {
                    return r(t.getBytesCount());
                }
                ));
                return t;
            },
            getOrCreateTracker: function(t) {// 获取或创建跟踪器
                return e.has(t) || e.set(t, Yi(r)),
                e.get(t);
            },
            setCompressionStatus: function(e) {// 设置压缩状态
                t === qi.Unknown && (t = e,
                r());
            },
            getCompressionStatus: function() {// 获取压缩状态
                return t;
            },
            stop: function() {// 停止
                e.forEach((function(t) {
                    return t.stop();
                }
                )),
                e.clear();
            }
        };
    }
    // 压缩
    function Yi(t) {
        var e = 0
            , n = Y((function(n) {
                e = Pe(_e(n)),
                t();
            }
            ), Ki)
            , r = n.throttled
            , i = n.cancel
            , o = function() {
                i(),
                e = 0;
            };
        return {
            updateCustomerData: function(t) { // 更新客户数据
                G(t) ? o() : r(t);
            },
            resetCustomerData: o,// 重置客户数据
            getBytesCount: function() {// 获取字节数量  
                return e;
            },
            stop: function() {// 停止
                i();
            }
        };
    }
    // 压缩
    function Xi() {
        var t = ""
            , e = 0;
        return {
            isAsync: !1,
            isEmpty: function() {
                return !t;
            },
            write: function(n, r) {
                var i = Pe(n);
                e += i,
                t += n,
                r && r(i);
            },
            finish: function(t) {
                t(this.finishSync());
            },
            finishSync: function() {
                var n = {
                    output: t,// 输出
                    outputBytesCount: e,// 输出字节数量
                    rawBytesCount: e,// 原始字节数量
                    pendingData: ""// 挂起数据
                };
                return t = "",
                e = 0,
                n;
            },
            estimateEncodedBytesCount: function(t) {
                return t.length;// 估计编码字节数量 估计编码字节数量
            }
        };
    }
    //  
    function Qi(t) {
        var e = x({}, t);
        return A(["id", "name", "email"], (function(t) {
            t in e && (e[t] = String(e[t]));
        }
        )),
        e;
    }
    function Ji(t) {
        this.map = new WeakMap,
        t && t.forEach((function(t) {
            this.map.set(t, 1);
        }
        ));
    }
    function to(t, e) {
        e.silentMultipleInit || o.error(t + " is already initialized.");
    }
    Ji.prototype.add = function(t) {
        return this.map.set(t, 1),
        this;
    }
    ,
    Ji.prototype.delete = function(t) {
        return this.map.delete(t);
    }
    ,
    Ji.prototype.has = function(t) {
        return this.map.has(t);
    }
    ;
    var eo = "rum"
        , no = {
            WITHOUT_SESSION_REPLAY: 1,
            WITH_SESSION_REPLAY: 2
        }
        , ro = {
            NOT_TRACKED: "0",
            TRACKED_WITH_SESSION_REPLAY: "1",
            TRACKED_WITHOUT_SESSION_REPLAY: "2"
        };
    function io(t, e) {
        var n = jr(t, eo, (function(e) {
            return function(t, e) {
                var n;
                n = function(t) {
                    return t === ro.NOT_TRACKED || t === ro.TRACKED_WITH_SESSION_REPLAY || t === ro.TRACKED_WITHOUT_SESSION_REPLAY;
                }(e) ? e : pt(t.sessionSampleRate) ? pt(t.sessionReplaySampleRate) ? ro.TRACKED_WITH_SESSION_REPLAY : ro.TRACKED_WITHOUT_SESSION_REPLAY : ro.NOT_TRACKED;
                return {
                    trackingType: n,
                    isTracked: oo(n)
                };
            }(t, e);
        }
        ));
        return n.expireObservable.subscribe((function() {
            e.notify(pn.SESSION_EXPIRED);
        }
        )),
        n.renewObservable.subscribe((function() {
            e.notify(pn.SESSION_RENEWED);
        }
        )),
        {
            findTrackedSession: function(t) {
                var e = n.findSession(t);
                if (e && oo(e.trackingType)) {
                    var r = e.trackingType === ro.TRACKED_WITH_SESSION_REPLAY ? no.WITH_SESSION_REPLAY : no.WITHOUT_SESSION_REPLAY;
                    return {
                        id: e.id,
                        plan: r,
                        sessionReplayAllowed: r === no.WITH_SESSION_REPLAY
                    };
                }
            },
            expire: n.expire,
            expireObservable: n.expireObservable
        };
    }
    function oo(t) {
        return t === ro.TRACKED_WITHOUT_SESSION_REPLAY || t === ro.TRACKED_WITH_SESSION_REPLAY;
    }
    var ao = "_gc_usr_id"
        , so = 1440 * ft;
    var uo = function(t) {
        var e;
        if (t.sessionStoreStrategyType)
            return e = "Cookie" === t.sessionStoreStrategyType.type ? function(t) {
                var e = Hn(ao, t);
                return e || (e = Q(),
                zn(ao, e, so, t)),
                e;
            }(t.sessionStoreStrategyType.cookieOptions) : function() {
                var t = localStorage.getItem(ao);
                return t || (t = Q(),
                localStorage.setItem(ao, t)),
                t;
            }(),
            {
                getId: function() {
                    return e;
                }
            };
    };
    function co() {
        var t, e = window;
        if (e.Zone && (t = a(e, "MutationObserver"),
        e.MutationObserver && t === e.MutationObserver)) {
            var n = a(new e.MutationObserver(st), "originalInstance");
            t = n && n.constructor;
        }
        return t || (t = e.MutationObserver),
        t;
    }
    function lo(t) {
        var e = R(t);
        return new tn((function(n) {
            var r, i, o, a, s, u = (r = l,
                i = Xe(History.prototype, "pushState", (function(t) {
                    (0,
                    t.onPostCall)(r);
                }
                )),
                o = Xe(History.prototype, "replaceState", (function(t) {
                    (0,
                    t.onPostCall)(r);
                }
                )),
                a = on(window, ie.POP_STATE, r),
                {
                    stop: function() {
                        i.stop(),
                        o.stop(),
                        a.stop();
                    }
                }), c = (s = l,
                on(window, ie.HASH_CHANGE, s));
            function l() {
                if (e.href !== t.href) {
                    var r = R(t);
                    n.notify({
                        newLocation: r,
                        oldLocation: e
                    }),
                    e = r;
                }
            }
            return function() {
                u.stop(),
                c.stop();
            };
        }
        ));
    }
    var fo = "initial_document"
        , po = [[oe.DOCUMENT, function(t) {
            return fo === t;
        }
        ], [oe.XHR, function(t) {
            return "xmlhttprequest" === t;
        }
        ], [oe.FETCH, function(t) {
            return "fetch" === t;
        }
        ], [oe.BEACON, function(t) {
            return "beacon" === t;
        }
        ], [oe.CSS, function(t, e) {
            return null !== e.match(/\.css$/i);
        }
        ], [oe.JS, function(t, e) {
            return null !== e.match(/\.js$/i);
        }
        ], [oe.IMAGE, function(t, e) {
            return Lt(["image", "img", "icon"], t) || null !== e.match(/\.(gif|jpg|jpeg|tiff|png|svg|ico)$/i);
        }
        ], [oe.FONT, function(t, e) {
            return null !== e.match(/\.(woff|eot|woff2|ttf)$/i);
        }
        ], [oe.MEDIA, function(t, e) {
            return Lt(["audio", "video"], t) || null !== e.match(/\.(mp3|mp4)$/i);
        }
        ]];
    function vo(t) {
        var e = t.name;
        if (!function(t) {
            try {
                return !!On(t);
            } catch (t) {
                return !1;
            }
        }(e))
            return oe.OTHER;
        var n = function(t) {
                var e = On(t).pathname;
                return "/" === e[0] ? e : "/" + e;
            }(e)
            , r = oe.OTHER;
        return A(po, (function(e) {
            var i = e[0];
            if ((0,
            e[1])(t.initiatorType, n))
                return r = i,
                !1;
        }
        )),
        r;
    }
    function ho() {
        for (var t = P(arguments), e = 1; e < t.length; e += 1)
            if (t[e - 1] > t[e])
                return !1;
        return !0;
    }
    function _o(t) {
        return "" === t.deliveryType ? "other" : t.deliveryType;
    }
    function go(t) {
        return "" === t.nextHopProtocol ? void 0 : t.nextHopProtocol;
    }
    var mo = /[^\u0000-\u007F]/;
    function yo(t, e) {
        return n = t,
        (mo.test(n) ? void 0 !== window.TextEncoder ? (new TextEncoder).encode(n).length : new Blob([n]).size : n.length) > e;
        var n;
    }
    function bo(t) {
        return 0 === t.duration && t.startTime < t.responseEnd ? ht(t.responseEnd - t.startTime) : ht(t.duration);
    }
    function Eo(t) {
        if (So(t)) {
            var e = t.startTime
                , n = t.fetchStart
                , r = t.redirectStart
                , i = t.redirectEnd
                , o = t.domainLookupStart
                , a = t.domainLookupEnd
                , s = t.connectStart
                , u = t.secureConnectionStart
                , c = t.connectEnd
                , l = t.requestStart
                , f = t.responseStart
                , d = t.responseEnd
                , p = {
                    firstbyte: ht(f - l),
                    trans: ht(d - f),
                    downloadTime: Co(e, f, d),
                    firstByteTime: Co(e, l, f)
                };
            return f > 0 && f <= yt() && (p.ttfb = ht(f - l)),
            c !== n && (p.tcp = ht(c - s),
            p.connectTime = Co(e, s, c),
            ho(s, u, c) && (p.ssl = ht(c - u),
            p.sslTime = Co(e, u, c))),
            a !== n && (p.dns = ht(a - o),
            p.dnsTime = Co(e, o, a)),
            To(t) && (p.redirect = ht(i - r),
            p.redirectTime = Co(e, r, i)),
            t.renderBlockingStatus && (p.renderBlockingStatus = t.renderBlockingStatus),
            p;
        }
    }
    function wo(t) {
        return t.duration >= 0;
    }
    function So(t) {
        var e = ho(t.startTime, t.fetchStart, t.domainLookupStart, t.domainLookupEnd, t.connectStart, t.connectEnd, t.requestStart, t.responseStart, t.responseEnd)
            , n = !To(t) || ho(t.startTime, t.redirectStart, t.redirectEnd, t.fetchStart);
        return e && n;
    }
    function To(t) {
        return t.redirectEnd > t.startTime;
    }
    function Co(t, e, n) {
        return {
            duration: ht(n - e),
            start: ht(e - t)
        };
    }
    function Io(t) {
        return t.startTime < t.responseStart ? {
            size: t.decodedBodySize,
            encodedBodySize: t.encodedBodySize,
            decodedBodySize: t.decodedBodySize,
            transferSize: t.transferSize
        } : {
            size: void 0,
            encodedBodySize: void 0,
            decodedBodySize: void 0,
            transferSize: void 0
        };
    }
    function Oo(t, e) {
        return e && !function(t, e) {
            var n = [e.rumEndpoint];
            return e.logsEndpoint && n.push(e.logsEndpoint),
            e.sessionReplayEndPoint && n.push(e.sessionReplayEndPoint),
            z(n, (function(e) {
                return 0 === t.indexOf(e);
            }
            )) || e.isIntakeUrl(t);
        }(e, t);
    }
    var Ao = /data:(.+)?(;base64)?,/g
        , xo = 24e3;
    function Ro(t) {
        return !(t.length <= xo) && ("data:" === t.substring(0, 5) && (t = t.substring(0, xo),
        !0));
    }
    function ko(t) {
        return t.match(Ao)[0] + "[...]";
    }
    function No(t, e) {
        var n = wt()
            , r = !1
            , i = an(window, [ie.CLICK, ie.MOUSE_DOWN, ie.KEY_DOWN, ie.TOUCH_START, ie.POINTER_DOWN], (function(t) {
                if (t.cancelable) {
                    var e = {
                        entryType: "first-input",
                        processingStart: yt(),
                        processingEnd: yt(),
                        startTime: t.timeStamp,
                        duration: 0,
                        name: "",
                        cancelable: !1,
                        target: null,
                        toJSON: function() {
                            return {};
                        }
                    };
                    t.type === ie.POINTER_DOWN ? function(t) {
                        an(window, [ie.POINTER_UP, ie.POINTER_CANCEL], (function(e) {
                            e.type === ie.POINTER_UP && o(t);
                        }
                        ), {
                            once: !0
                        });
                    }(e) : o(e);
                }
            }
            ), {
                passive: !0,
                capture: !0
            }).stop;
        return {
            stop: i
        };
        function o(t) {
            if (!r) {
                r = !0,
                i();
                var o = t.processingStart - t.startTime;
                o >= 0 && o < wt() - n && e(t);
            }
        }
    }
    var Lo, Do = {
        EVENT: "event",
        FIRST_INPUT: "first-input",
        LARGEST_CONTENTFUL_PAINT: "largest-contentful-paint",
        LAYOUT_SHIFT: "layout-shift",
        LONG_TASK: "longtask",
        LONG_ANIMATION_FRAME: "long-animation-frame",
        NAVIGATION: "navigation",
        PAINT: "paint",
        RESOURCE: "resource"
    };
    function Po(t, e) {
        return new tn((function(n) {
            if (window.PerformanceObserver) {
                var r, i, o = function(e) {
                        var r = function(t, e) {
                            return e.filter((function(e) {
                                return !function(t, e) {
                                    return !(e.entryType !== Do.RESOURCE || Oo(t, e.name) && wo(e));
                                }(t, e);
                            }
                            ));
                        }(t, e);
                        r.length > 0 && n.notify(r);
                    }, a = !0, s = new PerformanceObserver(c((function(t) {
                        a ? r = h((function() {
                            o(t.getEntries());
                        }
                        )) : o(t.getEntries());
                    }
                    )));
                try {
                    s.observe(e);
                } catch (t) {
                    if (Lt([Do.RESOURCE, Do.NAVIGATION, Do.LONG_TASK, Do.PAINT], e.type)) {
                        e.buffered && (r = h((function() {
                            o(performance.getEntriesByType(e.type));
                        }
                        )));
                        try {
                            s.observe({
                                entryTypes: [e.type]
                            });
                        } catch (t) {
                            return;
                        }
                    }
                }
                if (a = !1,
                function(t) {
                    !Lo && void 0 !== window.performance && "getEntries"in performance && "addEventListener"in performance && (Lo = on(performance, "resourcetimingbufferfull", (function() {
                        performance.clearResourceTimings();
                    }
                    )));
                }(),
                !Mo(Do.FIRST_INPUT) && e.type === Do.FIRST_INPUT) {
                    var u = No(0, (function(t) {
                        o([t]);
                    }
                    ));
                    i = u.stop;
                }
                return function() {
                    s.disconnect(),
                    i && i(),
                    _(r);
                };
            }
        }
        ));
    }
    function Mo(t) {
        return window.PerformanceObserver && void 0 !== PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes(t);
    }
    function Uo(t) {
        var e = t.lifeCycle
            , n = t.isChildEvent
            , r = t.onChange;
        void 0 === r && (r = st);
        var i = {
                errorCount: 0,
                longTaskCount: 0,
                resourceCount: 0,
                actionCount: 0,
                frustrationCount: 0
            }
            , o = e.subscribe(pn.RUM_EVENT_COLLECTED, (function(t) {
                if (t.type !== ue.VIEW && n(t))
                    switch (t.type) {
                        case ue.ERROR:
                            i.errorCount += 1,
                            r();
                            break;
                        case ue.ACTION:
                            t.action.frustration && (i.frustrationCount += t.action.frustration.type.length),
                            i.actionCount += 1,
                            r();
                            break;
                        case ue.LONG_TASK:
                            i.longTaskCount += 1,
                            r();
                            break;
                        case ue.RESOURCE:
                            i.resourceCount += 1,
                            r();
                    }
            }
            ));
        return {
            stop: function() {
                o.unsubscribe();
            },
            eventCounts: i
        };
    }
    var Vo = 100
        , Bo = 100;
    function zo(t, e, n, r, i) {
        var o = function(t, e, n) {
            return new tn((function(r) {
                var i, o = [], a = 0;
                o.push(e.subscribe((function() {
                    u();
                }
                )), Po(n, {
                    type: Do.RESOURCE
                }).subscribe((function(t) {
                    z(t, (function(t) {
                        return !Ho(n, t.name);
                    }
                    )) && u();
                }
                )), t.subscribe(pn.REQUEST_STARTED, (function(t) {
                    Ho(n, t.url) || (void 0 === i && (i = t.requestIndex),
                    a += 1,
                    u());
                }
                )), t.subscribe(pn.REQUEST_COMPLETED, (function(t) {
                    Ho(n, t.url) || void 0 === i || t.requestIndex < i || (a -= 1,
                    u());
                }
                )));
                var s = Xe(window, "open", u).stop;
                return function() {
                    s(),
                    A(o, (function(t) {
                        t.unsubscribe();
                    }
                    ));
                }
                ;
                function u() {
                    r.notify({
                        isBusy: a > 0
                    });
                }
            }
            ));
        }(t, e, n);
        return function(t, e, n) {
            var r, i = !1, o = h((function() {
                    c({
                        hadActivity: !1
                    });
                }
                ), Vo), a = void 0 !== n ? h((function() {
                    return c({
                        hadActivity: !0,
                        end: Et()
                    });
                }
                ), n) : void 0, s = t.subscribe((function(t) {
                    var e = t.isBusy;
                    _(o),
                    _(r);
                    var n = Et();
                    e || (r = h((function() {
                        c({
                            hadActivity: !0,
                            end: n
                        });
                    }
                    ), Bo));
                }
                )), u = function() {
                    i = !0,
                    _(o),
                    _(r),
                    _(a),
                    s.unsubscribe();
                };
            function c(t) {
                i || (u(),
                e(t));
            }
            return {
                stop: u
            };
        }(o, r, i);
    }
    function Ho(t, e) {
        return F(t.excludedActivityUrls, e);
    }
    var Fo = ct
        , Wo = 100
        , jo = {
            WaitingForMoreClicks: 0,
            WaitingForClicksToStop: 1,
            Finalized: 2
        };
    function Go(t, e) {
        var n, r = [], i = jo.WaitingForMoreClicks;
        function o(t) {
            t.stopObservable.subscribe(a),
            r.push(t),
            _(n),
            n = h(s, Fo);
        }
        function a() {
            i === jo.WaitingForClicksToStop && H(r, (function(t) {
                return t.isStopped();
            }
            )) && (i = jo.Finalized,
            e(r));
        }
        function s() {
            _(n),
            i === jo.WaitingForMoreClicks && (i = jo.WaitingForClicksToStop,
            a());
        }
        return o(t),
        {
            tryAppend: function(t) {
                return i === jo.WaitingForMoreClicks && (r.length > 0 && (e = r[r.length - 1].event,
                n = t.event,
                !(e.target === n.target && (a = e,
                u = n,
                Math.sqrt(Math.pow(a.clientX - u.clientX, 2) + Math.pow(a.clientY - u.clientY, 2)) <= Wo) && e.timeStamp - n.timeStamp <= Fo)) ? (s(),
                    !1) : (o(t),
                    !0));
                var e, n, a, u;
            },
            stop: function() {
                s();
            }
        };
    }
    var $o = "data-guance-action-name";
    function Ko(t, e) {
        return qo(t, $o) || e && qo(t, e) || ta(t, e, Xo) || ta(t, e, Qo) || "";
    }
    function qo(t, e) {
        var n;
        if (function() {
            void 0 === Yo && (Yo = "closest"in HTMLElement.prototype);
            return Yo;
        }())
            n = t.closest("[" + e + "]");
        else
            for (var r = t; r; ) {
                if (r.hasAttribute(e)) {
                    n = r;
                    break;
                }
                r = r.parentElement;
            }
        if (n)
            return na(ea(n.getAttribute(e).trim()));
    }
    var Zo, Yo, Xo = [function(t, e) {
            if (function() {
                void 0 === Zo && (Zo = "labels"in HTMLInputElement.prototype);
                return Zo;
            }()) {
                if ("labels"in t && t.labels && t.labels.length > 0)
                    return ra(t.labels[0], e);
            } else if (t.id) {
                var n = t.ownerDocument && Dt(t.ownerDocument.querySelectorAll("label"), (function(e) {
                    return e.htmlFor === t.id;
                }
                ));
                return n && ra(n, e);
            }
        }
        , function(t) {
            if ("INPUT" === t.nodeName) {
                var e = t
                    , n = e.getAttribute("type");
                if ("button" === n || "submit" === n || "reset" === n)
                    return e.value;
            }
        }
        , function(t, e) {
            if ("BUTTON" === t.nodeName || "LABEL" === t.nodeName || "button" === t.getAttribute("role"))
                return ra(t, e);
        }
        , function(t) {
            return t.getAttribute("aria-label");
        }
        , function(t, e) {
            var n = t.getAttribute("aria-labelledby");
            if (n)
                return n = n.split(/\s+/),
                n = B(n, (function(e) {
                    return function(t, e) {
                        return t.ownerDocument ? t.ownerDocument.getElementById(e) : null;
                    }(t, e);
                }
                )),
                n = V(n, (function(t) {
                    return Boolean(t);
                }
                )),
                (n = B(n, (function(t) {
                    return ra(t, e);
                }
                ))).join(" ");
        }
        , function(t) {
            return t.getAttribute("alt");
        }
        , function(t) {
            return t.getAttribute("name");
        }
        , function(t) {
            return t.getAttribute("title");
        }
        , function(t) {
            return t.getAttribute("placeholder");
        }
        , function(t, e) {
            if ("options"in t && t.options.length > 0)
                return ra(t.options[0], e);
        }
        ], Qo = [function(t, e) {
            return ra(t, e);
        }
        ], Jo = 10;
    function ta(t, e, n) {
        for (var r = t, i = 0; i <= Jo && r && "BODY" !== r.nodeName && "HTML" !== r.nodeName && "HEAD" !== r.nodeName; ) {
            for (var o = 0; o < n.length; o++) {
                var a = (0,
                n[o])(r, e);
                if ("string" == typeof a) {
                    var s = a.trim();
                    if (s)
                        return na(ea(s));
                }
            }
            if ("FORM" === r.nodeName)
                break;
            r = r.parentElement,
            i += 1;
        }
    }
    function ea(t) {
        return t.replace(/\s+/g, " ");
    }
    function na(t) {
        return t.length > 100 ? kt(t, 100) + " [...]" : t;
    }
    function ra(t, e) {
        if (!t.isContentEditable) {
            if ("innerText"in t) {
                var n = t.innerText
                    , r = function(e) {
                        for (var r = t.querySelectorAll(e), i = 0; i < r.length; i += 1) {
                            var o = r[i];
                            if ("innerText"in o) {
                                var a = o.innerText;
                                a && a.trim().length > 0 && (n = n.replace(a, ""));
                            }
                        }
                    };
                return Bt() === Vt.IE && r("script, style"),
                r("[" + $o + "]"),
                e && r("[" + e + "]"),
                n;
            }
            return t.textContent;
        }
    }
    var ia, oa = [$o, "data-testid", "data-test", "data-qa", "data-cy", "data-test-id", "data-qa-id", "data-testing", "data-component", "data-element", "data-source-file"], aa = [la, function(t) {
            if (t.id && !ca(t.id))
                return "#" + W(t.id);
        }
        ], sa = [la, function(t) {
            if ("BODY" === t.tagName)
                return;
            if (t.classList.length > 0)
                for (var e = 0; e < t.classList.length; e += 1) {
                    var n = t.classList[e];
                    if (!ca(n))
                        return W(t.tagName) + "." + W(n);
                }
        }
        , function(t) {
            return W(t.tagName);
        }
        ];
    function ua(t, e) {
        if (function(t) {
            if ("isConnected"in t)
                return t.isConnected;
            return t.ownerDocument.documentElement.contains(t);
        }(t)) {
            for (var n, r = t; r && "HTML" !== r.nodeName; ) {
                var i = da(r, aa, pa, e, n);
                if (i)
                    return i;
                n = da(r, sa, va, e, n) || ha(fa(r), n),
                r = r.parentElement;
            }
            return n;
        }
    }
    function ca(t) {
        return /[0-9]/.test(t);
    }
    function la(t, e) {
        if (e && (r = i(e)))
            return r;
        for (var n = 0; n < oa.length; n++) {
            var r;
            if (r = i(oa[n]))
                return r;
        }
        function i(e) {
            if (t.hasAttribute(e))
                return W(t.tagName) + "[" + e + '="' + W(t.getAttribute(e)) + '"]';
        }
    }
    function fa(t) {
        for (var e = t.parentElement && t.parentElement.firstElementChild, n = 1; e && e !== t; )
            e.tagName === t.tagName && (n += 1),
            e = e.nextElementSibling;
        var r = W(t.tagName);
        return /^::/.test(r) ? r : r + ":nth-of-type(" + n + ")";
    }
    function da(t, e, n, r, i) {
        for (var o = 0; o < e.length; o++) {
            var a = (0,
            e[o])(t, r);
            if (a && n(t, a, i))
                return ha(a, i);
        }
    }
    function pa(t, e, n) {
        return 1 === t.ownerDocument.querySelectorAll(ha(e, n)).length;
    }
    function va(t, e, n) {
        var r;
        if (void 0 === n)
            r = function(t) {
                return t.matches(e);
            }
            ;
        else {
            var i = function() {
                if (void 0 === ia)
                    try {
                        document.querySelector(":scope"),
                        ia = !0;
                    } catch (t) {
                        ia = !1;
                    }
                return ia;
            }() ? ha("".concat(e, ":scope"), n) : ha(e, n);
            r = function(t) {
                return null !== t.querySelector(i);
            };
        }
        for (var o = t.parentElement.firstElementChild; o; ) {
            if (o !== t && r(o))
                return !1;
            o = o.nextElementSibling;
        }
        return !0;
    }
    function ha(t, e) {
        return e ? t + ">" + e : t;
    }
    function _a() {
        var t = window.getSelection();
        return !t || t.isCollapsed;
    }
    function ga(t) {
        return t.target instanceof Element && !1 !== t.isPrimary;
    }
    var ma = 3;
    function ya(t, e) {
        if (function(t) {
            if (z(t, (function(t) {
                return t.getUserActivity().selection || t.getUserActivity().scroll;
            }
            )))
                return !1;
            for (var e = 0; e < t.length - (ma - 1); e += 1)
                if (t[e + ma - 1].event.timeStamp - t[e].event.timeStamp <= ct)
                    return !0;
            return !1;
        }(t))
            return e.addFrustration(se.RAGE_CLICK),
            z(t, Ea) && e.addFrustration(se.DEAD_CLICK),
            e.hasError() && e.addFrustration(se.ERROR_CLICK),
            {
                isRage: !0
            };
        var n = z(t, (function(t) {
            return t.getUserActivity().selection;
        }
        ));
        return A(t, (function(t) {
            t.hasError() && t.addFrustration(se.ERROR_CLICK),
            Ea(t) && !n && t.addFrustration(se.DEAD_CLICK);
        }
        )),
        {
            isRage: !1
        };
    }
    var ba = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]),textarea,select,[contenteditable],[contenteditable] *,canvas,a[href],a[href] *';
    function Ea(t) {
        return !(t.hasPageActivity() || t.getUserActivity().input || t.getUserActivity().scroll) && (e = t.event.target,
        n = ba,
        !(e.matches ? e.matches(n) : e.msMatchesSelector && e.msMatchesSelector(n)));
        var e, n;
    }
    var wa = 10 * ct
        , Sa = new Map;
    function Ta(t, e) {
        Sa.set(t, e),
        Sa.forEach((function(t, e) {
            St(e, yt()) > wa && Sa.delete(e);
        }
        ));
    }
    var Ca = 5 * lt;
    function Ia(t, e, n) {
        var r, i = new Jt({
                expireDelay: Ca
            }), o = new tn;
        t.subscribe(pn.SESSION_RENEWED, (function() {
            i.reset();
        }
        )),
        t.subscribe(pn.VIEW_ENDED, p);
        var a, s, u, c, l, f = (a = {
                onPointerDown: function(r) {
                    return function(t, e, n, r) {
                        var i, o, a, s, u = (i = r,
                            o = t.actionNameAttribute,
                            a = i.target.getBoundingClientRect(),
                            (s = ua(i.target, o)) && Ta(i.timeStamp, s),
                            {
                                type: ae.CLICK,
                                target: {
                                    width: Math.round(a.width),
                                    height: Math.round(a.height),
                                    selector: s
                                },
                                position: {
                                    x: Math.round(i.clientX - a.left),
                                    y: Math.round(i.clientY - a.top)
                                },
                                name: Ko(i.target, o)
                            }), c = !1;
                        return zo(e, n, t, (function(t) {
                            c = t.hadActivity;
                        }
                        ), Vo),
                        {
                            clickActionBase: u,
                            hadActivityOnPointerDown: function() {
                                return c;
                            }
                        };
                    }(n, t, e, r);
                },
                onPointerUp: function(r, a, s) {
                    !function(t, e, n, r, i, o, a, s, u, c) {
                        var l = Aa(e, r, u, a, s);
                        o(l);
                        var f = a && a.target && a.target.selector;
                        f && Ta(s.timeStamp, f);
                        var d = zo(e, n, t, (function(t) {
                                t.hadActivity && t.end < l.startClocks.timeStamp ? l.discard() : t.hadActivity ? l.stop(t.end) : c() ? l.stop(l.startClocks.timeStamp) : l.stop();
                            }
                            ), wa)
                            , p = d.stop
                            , v = e.subscribe(pn.VIEW_ENDED, (function(t) {
                                l.stop(t.endClocks.timeStamp);
                            }
                            ))
                            , h = i.subscribe((function() {
                                l.stop();
                            }
                            ));
                        l.stopObservable.subscribe((function() {
                            v.unsubscribe(),
                            p(),
                            h.unsubscribe();
                        }
                        ));
                    }(n, t, e, i, o, v, r.clickActionBase, a, s, r.hadActivityOnPointerDown);
                }
            },
            c = {
                selection: !1,
                input: !1,
                scroll: !1
            },
            l = [on(window, ie.POINTER_DOWN, (function(t) {
                ga(t) && (s = _a(),
                c = {
                    selection: !1,
                    input: !1,
                    scroll: !1
                },
                u = a.onPointerDown(t));
            }
            ), {
                capture: !0
            }), on(window, ie.SELECTION_CHANGE, (function() {
                s && _a() || (c.selection = !0);
            }
            ), {
                capture: !0
            }), on(window, ie.POINTER_UP, (function(t) {
                if (ga(t) && u) {
                    var e = c;
                    a.onPointerUp(u, t, (function() {
                        return e;
                    }
                    )),
                    u = void 0;
                }
            }
            ), {
                capture: !0
            }), on(window, ie.SCROLL, (function() {
                c.scroll = !0;
            }
            ), {
                capture: !0,
                passive: !0
            }), on(window, ie.INPUT, (function() {
                c.input = !0;
            }
            ), {
                capture: !0
            })],
            {
                stop: function() {
                    A(l, (function(t) {
                        return t.stop();
                    }
                    ));
                }
            }), d = f.stop;
        return {
            stop: function() {
                p(),
                o.notify(),
                d();
            },
            actionContexts: {
                findActionId: function(t) {
                    var e = i.findAll(t);
                    if (e && e.length)
                        return e[e.length - 1];
                },
                findAllActionId: function(t) {
                    return i.findAll(t);
                }
            }
        };
        function p() {
            r && r.stop();
        }
        function v(t) {
            if (!r || !r.tryAppend(t)) {
                var e = t.clone();
                r = Go(t, (function(t) {
                    !function(t, e) {
                        var n = ya(t, e)
                            , r = n.isRage;
                        r ? (A(t, (function(t) {
                            t.discard();
                        }
                        )),
                        e.stop(Et()),
                        e.validate(B(t, (function(t) {
                            return t.event;
                        }
                        )))) : (e.discard(),
                        A(t, (function(t) {
                            t.validate();
                        }
                        )));
                    }(t, e);
                }
                ));
            }
        }
    }
    var Oa = {
        ONGOING: 0,
        STOPPED: 1,
        FINALIZED: 2
    };
    function Aa(t, e, n, r, i) {
        var o, a = Q(), s = bt(), u = e.add(a, s.relative), c = Uo({
                lifeCycle: t,
                isChildEvent: function(t) {
                    return void 0 !== t.action && (L(t.action.ids) ? Lt(t.action.ids, a) : t.action.ids === a);
                }
            }), l = Oa.ONGOING, f = [], d = new tn;
        function p(t) {
            l === Oa.ONGOING && (o = t,
            l = Oa.STOPPED,
            o ? u.close(gt(o)) : u.remove(),
            c.stop(),
            d.notify());
        }
        return {
            event: i,
            stop: p,
            stopObservable: d,
            hasError: function() {
                return c.eventCounts.errorCount > 0;
            },
            hasPageActivity: function() {
                return void 0 !== o;
            },
            getUserActivity: n,
            addFrustration: function(t) {
                f.push(t);
            },
            startClocks: s,
            isStopped: function() {
                return l === Oa.STOPPED || l === Oa.FINALIZED;
            },
            clone: function() {
                return Aa(t, e, n, r, i);
            },
            validate: function(e) {
                if (p(),
                l === Oa.STOPPED) {
                    var n = c.eventCounts
                        , u = n.resourceCount
                        , d = n.errorCount
                        , v = n.longTaskCount
                        , h = x({
                            type: ae.CLICK,
                            duration: o && St(s.timeStamp, o),
                            startClocks: s,
                            id: a,
                            frustrationTypes: f,
                            counts: {
                                resourceCount: u,
                                errorCount: d,
                                longTaskCount: v
                            },
                            events: Wt(e, [i]),
                            event: i
                        }, r);
                    t.notify(pn.AUTO_ACTION_COMPLETED, h),
                    l = Oa.FINALIZED;
                }
            },
            discard: function() {
                p(),
                l = Oa.FINALIZED;
            }
        };
    }
    var xa = 4e3
        , Ra = 500
        , ka = Wn
        , Na = {
            ACTIVE: "active",
            PASSIVE: "passive",
            HIDDEN: "hidden",
            FROZEN: "frozen",
            TERMINATED: "terminated"
        };
    function La(t) {
        void 0 === t && (t = Ra);
        var e, n = Jt({
            expireDelay: ka,
            maxEntries: xa
        });
        i(Da(), yt());
        var r = an(window, [ie.PAGE_SHOW, ie.FOCUS, ie.BLUR, ie.VISIBILITY_CHANGE, ie.RESUME, ie.FREEZE, ie.PAGE_HIDE], (function(t) {
            i(function(t) {
                if (t.type === ie.FREEZE)
                    return Na.FROZEN;
                if (t.type === ie.PAGE_HIDE)
                    return t.persisted ? Na.FROZEN : Na.TERMINATED;
                return Da();
            }(t), t.timeStamp);
        }
        ), {
            capture: !0
        }).stop;
        function i(t, r) {
            void 0 === r && (r = yt()),
            t !== e && (e = t,
            n.closeActive(r),
            n.add({
                state: e,
                startTime: r
            }, r));
        }
        var o = {
            findAll: function(e, r) {
                var i = n.findAll(e, r);
                if (0 !== i.length) {
                    for (var o = [], a = Math.max(0, i.length - t), s = i.length - 1; s >= a; s--) {
                        var u = i[s]
                            , c = St(e, u.startTime);
                        o.push({
                            state: u.state,
                            start: _t(c)
                        });
                    }
                    return o;
                }
            },
            wasInPageStateAt: function(t, e) {
                return o.wasInPageStateDuringPeriod(t, e, 0);
            },
            wasInPageStateDuringPeriod: function(t, e, r) {
                return n.findAll(e, r).some((function(e) {
                    return e.state === t;
                }
                ));
            },
            addPageState: i,
            stop: function() {
                r(),
                n.stop();
            }
        };
        return o;
    }
    function Da() {
        return "hidden" === document.visibilityState ? Na.HIDDEN : document.hasFocus() ? Na.ACTIVE : Na.PASSIVE;
    }
    function Pa(t, e) {
        var n = Ma(t) ? {
            action: {
                error: {
                    count: t.counts.errorCount
                },
                id: t.id,
                loadingTime: qt(_t(t.duration)),
                frustration: {
                    type: t.frustrationTypes
                },
                long_task: {
                    count: t.counts.longTaskCount
                },
                resource: {
                    count: t.counts.resourceCount
                }
            },
            _gc: {
                action: {
                    target: t.target,
                    position: t.position
                }
            }
        } : {
            action: {
                loadingTime: 0
            }
        };
        return {
            customerContext: Ma(t) ? void 0 : t.context,
            rawRumEvent: N({
                action: {
                    id: Q(),
                    target: {
                        name: t.name
                    },
                    type: t.type
                },
                date: t.startClocks.timeStamp,
                type: ue.ACTION,
                view: {
                    in_foreground: e.wasInPageStateAt(Na.ACTIVE, t.startClocks.relative)
                }
            }, n),
            startTime: t.startClocks.relative,
            domainContext: Ma(t) ? {
                event: t.event,
                events: t.events
            } : {}
        };
    }
    function Ma(t) {
        return t.type !== ae.CUSTOM;
    }
    var Ua = {
        REPLAY: 1,
        RUM: 2
    };
    function Va(t, e) {
        var n, r = 0, i = [], o = 0, a = [], s = on(t, "message", (function(t) {
            var o = t.data;
            if (!("wrote" !== o.type || o.streamId && o.streamId !== e)) {
                r += o.additionalBytesCount,
                i.push(o.result),
                n = o.trailer;
                var u = a.shift();
                u && u.id === o.id ? u.writeCallback ? u.writeCallback(o.result.byteLength) : u.finishCallback && u.finishCallback() : (s(),
                fi("Worker responses received out of order."));
            }
        }
        )).stop;
        function u() {
            var t = 0 === i.length ? new Uint8Array(0) : function(t) {
                    for (var e = t.reduce((function(t, e) {
                            return t + e.length;
                        }
                        ), 0), n = new Uint8Array(e), r = 0, i = 0, o = t; i < o.length; i++) {
                        var a = o[i];
                        n.set(a, r),
                        r += a.length;
                    }
                    return n;
                }(i.concat(n))
                , e = {
                    rawBytesCount: r,
                    output: t,
                    outputBytesCount: t.byteLength,
                    encoding: "deflate"
                };
            return r = 0,
            i = [],
            e;
        }
        function c() {
            o > 0 && (t.postMessage({
                action: "reset",
                streamId: e
            }),
            o = 0);
        }
        return {
            isAsync: !0,
            isEmpty: function() {
                return 0 === o;
            },
            write: function(n, r) {
                t.postMessage({
                    action: "write",
                    id: o,
                    data: n,
                    streamId: e
                }),
                a.push({
                    id: o,
                    writeCallback: r,
                    data: n
                }),
                o += 1;
            },
            finish: function(t) {
                c(),
                a.length ? (a.forEach((function(t) {
                    delete t.writeCallback;
                }
                )),
                a[a.length - 1].finishCallback = function() {
                    return t(u());
                }
                ) : t(u());
            },
            finishSync: function() {
                c();
                var t = a.map((function(t) {
                    return delete t.writeCallback,
                    delete t.finishCallback,
                    t.data;
                }
                )).join("");
                return x(u(), {
                    pendingData: t
                });
            },
            estimateEncodedBytesCount: function(t) {
                return t.length / 8;
            },
            stop: function() {
                s();
            }
        };
    }
    var Ba = 10 * ct;
    function za(t) {
        return new Worker(t.workerUrl || URL.createObjectURL(new Blob(['!function(){"use strict";function t(t){for(var e=t.reduce((function(t,e){return t+e.length}),0),a=new Uint8Array(e),n=0,r=0,i=t;r<i.length;r++){var s=i[r];a.set(s,n),n+=s.length}return a}function e(t){for(var e=t.length;--e>=0;)t[e]=0}var a=256,n=286,r=30,i=15,s=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),_=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),h=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),l=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),o=new Array(576);e(o);var d=new Array(60);e(d);var u=new Array(512);e(u);var f=new Array(256);e(f);var c=new Array(29);e(c);var p,g,w,v=new Array(r);function b(t,e,a,n,r){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=n,this.max_length=r,this.has_stree=t&&t.length}function m(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}e(v);var y=function(t){return t<256?u[t]:u[256+(t>>>7)]},k=function(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255},z=function(t,e,a){t.bi_valid>16-a?(t.bi_buf|=e<<t.bi_valid&65535,k(t,t.bi_buf),t.bi_buf=e>>16-t.bi_valid,t.bi_valid+=a-16):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)},x=function(t,e,a){z(t,a[2*e],a[2*e+1])},A=function(t,e){var a=0;do{a|=1&t,t>>>=1,a<<=1}while(--e>0);return a>>>1},E=function(t,e,a){var n,r,s=new Array(16),_=0;for(n=1;n<=i;n++)s[n]=_=_+a[n-1]<<1;for(r=0;r<=e;r++){var h=t[2*r+1];0!==h&&(t[2*r]=A(s[h]++,h))}},Z=function(t){var e;for(e=0;e<n;e++)t.dyn_ltree[2*e]=0;for(e=0;e<r;e++)t.dyn_dtree[2*e]=0;for(e=0;e<19;e++)t.bl_tree[2*e]=0;t.dyn_ltree[512]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0},U=function(t){t.bi_valid>8?k(t,t.bi_buf):t.bi_valid>0&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0},S=function(t,e,a,n){var r=2*e,i=2*a;return t[r]<t[i]||t[r]===t[i]&&n[e]<=n[a]},R=function(t,e,a){for(var n=t.heap[a],r=a<<1;r<=t.heap_len&&(r<t.heap_len&&S(e,t.heap[r+1],t.heap[r],t.depth)&&r++,!S(e,n,t.heap[r],t.depth));)t.heap[a]=t.heap[r],a=r,r<<=1;t.heap[a]=n},L=function(t,e,n){var r,i,h,l,o=0;if(0!==t.last_lit)do{r=t.pending_buf[t.d_buf+2*o]<<8|t.pending_buf[t.d_buf+2*o+1],i=t.pending_buf[t.l_buf+o],o++,0===r?x(t,i,e):(h=f[i],x(t,h+a+1,e),0!==(l=s[h])&&(i-=c[h],z(t,i,l)),r--,h=y(r),x(t,h,n),0!==(l=_[h])&&(r-=v[h],z(t,r,l)))}while(o<t.last_lit);x(t,256,e)},F=function(t,e){var a,n,r,s=e.dyn_tree,_=e.stat_desc.static_tree,h=e.stat_desc.has_stree,l=e.stat_desc.elems,o=-1;for(t.heap_len=0,t.heap_max=573,a=0;a<l;a++)0!==s[2*a]?(t.heap[++t.heap_len]=o=a,t.depth[a]=0):s[2*a+1]=0;for(;t.heap_len<2;)s[2*(r=t.heap[++t.heap_len]=o<2?++o:0)]=1,t.depth[r]=0,t.opt_len--,h&&(t.static_len-=_[2*r+1]);for(e.max_code=o,a=t.heap_len>>1;a>=1;a--)R(t,s,a);r=l;do{a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],R(t,s,1),n=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=n,s[2*r]=s[2*a]+s[2*n],t.depth[r]=(t.depth[a]>=t.depth[n]?t.depth[a]:t.depth[n])+1,s[2*a+1]=s[2*n+1]=r,t.heap[1]=r++,R(t,s,1)}while(t.heap_len>=2);t.heap[--t.heap_max]=t.heap[1],function(t,e){var a,n,r,s,_,h,l=e.dyn_tree,o=e.max_code,d=e.stat_desc.static_tree,u=e.stat_desc.has_stree,f=e.stat_desc.extra_bits,c=e.stat_desc.extra_base,p=e.stat_desc.max_length,g=0;for(s=0;s<=i;s++)t.bl_count[s]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;a<573;a++)(s=l[2*l[2*(n=t.heap[a])+1]+1]+1)>p&&(s=p,g++),l[2*n+1]=s,n>o||(t.bl_count[s]++,_=0,n>=c&&(_=f[n-c]),h=l[2*n],t.opt_len+=h*(s+_),u&&(t.static_len+=h*(d[2*n+1]+_)));if(0!==g){do{for(s=p-1;0===t.bl_count[s];)s--;t.bl_count[s]--,t.bl_count[s+1]+=2,t.bl_count[p]--,g-=2}while(g>0);for(s=p;0!==s;s--)for(n=t.bl_count[s];0!==n;)(r=t.heap[--a])>o||(l[2*r+1]!==s&&(t.opt_len+=(s-l[2*r+1])*l[2*r],l[2*r+1]=s),n--)}}(t,e),E(s,o,t.bl_count)},T=function(t,e,a){var n,r,i=-1,s=e[1],_=0,h=7,l=4;for(0===s&&(h=138,l=3),e[2*(a+1)+1]=65535,n=0;n<=a;n++)r=s,s=e[2*(n+1)+1],++_<h&&r===s||(_<l?t.bl_tree[2*r]+=_:0!==r?(r!==i&&t.bl_tree[2*r]++,t.bl_tree[32]++):_<=10?t.bl_tree[34]++:t.bl_tree[36]++,_=0,i=r,0===s?(h=138,l=3):r===s?(h=6,l=3):(h=7,l=4))},I=function(t,e,a){var n,r,i=-1,s=e[1],_=0,h=7,l=4;for(0===s&&(h=138,l=3),n=0;n<=a;n++)if(r=s,s=e[2*(n+1)+1],!(++_<h&&r===s)){if(_<l)do{x(t,r,t.bl_tree)}while(0!=--_);else 0!==r?(r!==i&&(x(t,r,t.bl_tree),_--),x(t,16,t.bl_tree),z(t,_-3,2)):_<=10?(x(t,17,t.bl_tree),z(t,_-3,3)):(x(t,18,t.bl_tree),z(t,_-11,7));_=0,i=r,0===s?(h=138,l=3):r===s?(h=6,l=3):(h=7,l=4)}},N=!1,O=function(t,e,a,n){z(t,0+(n?1:0),3),function(t,e,a,n){U(t),n&&(k(t,a),k(t,~a)),t.pending_buf.set(t.window.subarray(e,e+a),t.pending),t.pending+=a}(t,e,a,!0)},D=function(t,e,n,r){var i,s,_=0;t.level>0?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,n=4093624447;for(e=0;e<=31;e++,n>>>=1)if(1&n&&0!==t.dyn_ltree[2*e])return 0;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return 1;for(e=32;e<a;e++)if(0!==t.dyn_ltree[2*e])return 1;return 0}(t)),F(t,t.l_desc),F(t,t.d_desc),_=function(t){var e;for(T(t,t.dyn_ltree,t.l_desc.max_code),T(t,t.dyn_dtree,t.d_desc.max_code),F(t,t.bl_desc),e=18;e>=3&&0===t.bl_tree[2*l[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),i=t.opt_len+3+7>>>3,(s=t.static_len+3+7>>>3)<=i&&(i=s)):i=s=n+5,n+4<=i&&-1!==e?O(t,e,n,r):4===t.strategy||s===i?(z(t,2+(r?1:0),3),L(t,o,d)):(z(t,4+(r?1:0),3),function(t,e,a,n){var r;for(z(t,e-257,5),z(t,a-1,5),z(t,n-4,4),r=0;r<n;r++)z(t,t.bl_tree[2*l[r]+1],3);I(t,t.dyn_ltree,e-1),I(t,t.dyn_dtree,a-1)}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,_+1),L(t,t.dyn_ltree,t.dyn_dtree)),Z(t),r&&U(t)},B={_tr_init:function(t){N||(!function(){var t,e,a,l,m,y=new Array(16);for(a=0,l=0;l<28;l++)for(c[l]=a,t=0;t<1<<s[l];t++)f[a++]=l;for(f[a-1]=l,m=0,l=0;l<16;l++)for(v[l]=m,t=0;t<1<<_[l];t++)u[m++]=l;for(m>>=7;l<r;l++)for(v[l]=m<<7,t=0;t<1<<_[l]-7;t++)u[256+m++]=l;for(e=0;e<=i;e++)y[e]=0;for(t=0;t<=143;)o[2*t+1]=8,t++,y[8]++;for(;t<=255;)o[2*t+1]=9,t++,y[9]++;for(;t<=279;)o[2*t+1]=7,t++,y[7]++;for(;t<=287;)o[2*t+1]=8,t++,y[8]++;for(E(o,287,y),t=0;t<r;t++)d[2*t+1]=5,d[2*t]=A(t,5);p=new b(o,s,257,n,i),g=new b(d,_,0,r,i),w=new b(new Array(0),h,0,19,7)}(),N=!0),t.l_desc=new m(t.dyn_ltree,p),t.d_desc=new m(t.dyn_dtree,g),t.bl_desc=new m(t.bl_tree,w),t.bi_buf=0,t.bi_valid=0,Z(t)},_tr_stored_block:O,_tr_flush_block:D,_tr_tally:function(t,e,n){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&n,t.last_lit++,0===e?t.dyn_ltree[2*n]++:(t.matches++,e--,t.dyn_ltree[2*(f[n]+a+1)]++,t.dyn_dtree[2*y(e)]++),t.last_lit===t.lit_bufsize-1},_tr_align:function(t){z(t,2,3),x(t,256,o),function(t){16===t.bi_valid?(k(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):t.bi_valid>=8&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}(t)}},C=function(t,e,a,n){for(var r=65535&t,i=t>>>16&65535,s=0;0!==a;){a-=s=a>2e3?2e3:a;do{i=i+(r=r+e[n++]|0)|0}while(--s);r%=65521,i%=65521}return r|i<<16},H=new Uint32Array(function(){for(var t,e=[],a=0;a<256;a++){t=a;for(var n=0;n<8;n++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}()),M=function(t,e,a,n){var r=H,i=n+a;t^=-1;for(var s=n;s<i;s++)t=t>>>8^r[255&(t^e[s])];return~t},Y={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},K={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8},P=B._tr_init,j=B._tr_stored_block,G=B._tr_flush_block,X=B._tr_tally,W=B._tr_align,q=K.Z_NO_FLUSH,J=K.Z_PARTIAL_FLUSH,Q=K.Z_FULL_FLUSH,V=K.Z_FINISH,$=K.Z_BLOCK,tt=K.Z_OK,et=K.Z_STREAM_END,at=K.Z_STREAM_ERROR,nt=K.Z_DATA_ERROR,rt=K.Z_BUF_ERROR,it=K.Z_DEFAULT_COMPRESSION,st=K.Z_FILTERED,_t=K.Z_HUFFMAN_ONLY,ht=K.Z_RLE,lt=K.Z_FIXED,ot=K.Z_DEFAULT_STRATEGY,dt=K.Z_UNKNOWN,ut=K.Z_DEFLATED,ft=258,ct=262,pt=103,gt=113,wt=666,vt=function(t,e){return t.msg=Y[e],e},bt=function(t){return(t<<1)-(t>4?9:0)},mt=function(t){for(var e=t.length;--e>=0;)t[e]=0},yt=function(t,e,a){return(e<<t.hash_shift^a)&t.hash_mask},kt=function(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(t.output.set(e.pending_buf.subarray(e.pending_out,e.pending_out+a),t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))},zt=function(t,e){G(t,t.block_start>=0?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,kt(t.strm)},xt=function(t,e){t.pending_buf[t.pending++]=e},At=function(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e},Et=function(t,e){var a,n,r=t.max_chain_length,i=t.strstart,s=t.prev_length,_=t.nice_match,h=t.strstart>t.w_size-ct?t.strstart-(t.w_size-ct):0,l=t.window,o=t.w_mask,d=t.prev,u=t.strstart+ft,f=l[i+s-1],c=l[i+s];t.prev_length>=t.good_match&&(r>>=2),_>t.lookahead&&(_=t.lookahead);do{if(l[(a=e)+s]===c&&l[a+s-1]===f&&l[a]===l[i]&&l[++a]===l[i+1]){i+=2,a++;do{}while(l[++i]===l[++a]&&l[++i]===l[++a]&&l[++i]===l[++a]&&l[++i]===l[++a]&&l[++i]===l[++a]&&l[++i]===l[++a]&&l[++i]===l[++a]&&l[++i]===l[++a]&&i<u);if(n=ft-(u-i),i=u-ft,n>s){if(t.match_start=e,s=n,n>=_)break;f=l[i+s-1],c=l[i+s]}}}while((e=d[e&o])>h&&0!=--r);return s<=t.lookahead?s:t.lookahead},Zt=function(t){var e,a,n,r,i,s,_,h,l,o,d=t.w_size;do{if(r=t.window_size-t.lookahead-t.strstart,t.strstart>=d+(d-ct)){t.window.set(t.window.subarray(d,d+d),0),t.match_start-=d,t.strstart-=d,t.block_start-=d,e=a=t.hash_size;do{n=t.head[--e],t.head[e]=n>=d?n-d:0}while(--a);e=a=d;do{n=t.prev[--e],t.prev[e]=n>=d?n-d:0}while(--a);r+=d}if(0===t.strm.avail_in)break;if(s=t.strm,_=t.window,h=t.strstart+t.lookahead,l=r,o=void 0,(o=s.avail_in)>l&&(o=l),a=0===o?0:(s.avail_in-=o,_.set(s.input.subarray(s.next_in,s.next_in+o),h),1===s.state.wrap?s.adler=C(s.adler,_,o,h):2===s.state.wrap&&(s.adler=M(s.adler,_,o,h)),s.next_in+=o,s.total_in+=o,o),t.lookahead+=a,t.lookahead+t.insert>=3)for(i=t.strstart-t.insert,t.ins_h=t.window[i],t.ins_h=yt(t,t.ins_h,t.window[i+1]);t.insert&&(t.ins_h=yt(t,t.ins_h,t.window[i+3-1]),t.prev[i&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=i,i++,t.insert--,!(t.lookahead+t.insert<3)););}while(t.lookahead<ct&&0!==t.strm.avail_in)},Ut=function(t,e){for(var a,n;;){if(t.lookahead<ct){if(Zt(t),t.lookahead<ct&&e===q)return 1;if(0===t.lookahead)break}if(a=0,t.lookahead>=3&&(t.ins_h=yt(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-ct&&(t.match_length=Et(t,a)),t.match_length>=3)if(n=X(t,t.strstart-t.match_start,t.match_length-3),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=3){t.match_length--;do{t.strstart++,t.ins_h=yt(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart}while(0!=--t.match_length);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=yt(t,t.ins_h,t.window[t.strstart+1]);else n=X(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(n&&(zt(t,!1),0===t.strm.avail_out))return 1}return t.insert=t.strstart<2?t.strstart:2,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):t.last_lit&&(zt(t,!1),0===t.strm.avail_out)?1:2},St=function(t,e){for(var a,n,r;;){if(t.lookahead<ct){if(Zt(t),t.lookahead<ct&&e===q)return 1;if(0===t.lookahead)break}if(a=0,t.lookahead>=3&&(t.ins_h=yt(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=2,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-ct&&(t.match_length=Et(t,a),t.match_length<=5&&(t.strategy===st||3===t.match_length&&t.strstart-t.match_start>4096)&&(t.match_length=2)),t.prev_length>=3&&t.match_length<=t.prev_length){r=t.strstart+t.lookahead-3,n=X(t,t.strstart-1-t.prev_match,t.prev_length-3),t.lookahead-=t.prev_length-1,t.prev_length-=2;do{++t.strstart<=r&&(t.ins_h=yt(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart)}while(0!=--t.prev_length);if(t.match_available=0,t.match_length=2,t.strstart++,n&&(zt(t,!1),0===t.strm.avail_out))return 1}else if(t.match_available){if((n=X(t,0,t.window[t.strstart-1]))&&zt(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return 1}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(n=X(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<2?t.strstart:2,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):t.last_lit&&(zt(t,!1),0===t.strm.avail_out)?1:2};function Rt(t,e,a,n,r){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=n,this.func=r}var Lt=[new Rt(0,0,0,0,(function(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(Zt(t),0===t.lookahead&&e===q)return 1;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var n=t.block_start+a;if((0===t.strstart||t.strstart>=n)&&(t.lookahead=t.strstart-n,t.strstart=n,zt(t,!1),0===t.strm.avail_out))return 1;if(t.strstart-t.block_start>=t.w_size-ct&&(zt(t,!1),0===t.strm.avail_out))return 1}return t.insert=0,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):(t.strstart>t.block_start&&(zt(t,!1),t.strm.avail_out),1)})),new Rt(4,4,8,4,Ut),new Rt(4,5,16,8,Ut),new Rt(4,6,32,32,Ut),new Rt(4,4,16,16,St),new Rt(8,16,32,32,St),new Rt(8,16,128,128,St),new Rt(8,32,128,256,St),new Rt(32,128,258,1024,St),new Rt(32,258,258,4096,St)];function Ft(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=ut,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(1146),this.dyn_dtree=new Uint16Array(122),this.bl_tree=new Uint16Array(78),mt(this.dyn_ltree),mt(this.dyn_dtree),mt(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(16),this.heap=new Uint16Array(573),mt(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(573),mt(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}var Tt=function(t){if(!t||!t.state)return vt(t,at);t.total_in=t.total_out=0,t.data_type=dt;var e=t.state;return e.pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?42:gt,t.adler=2===e.wrap?0:1,e.last_flush=q,P(e),tt},It=function(t){var e,a=Tt(t);return a===tt&&((e=t.state).window_size=2*e.w_size,mt(e.head),e.max_lazy_match=Lt[e.level].max_lazy,e.good_match=Lt[e.level].good_length,e.nice_match=Lt[e.level].nice_length,e.max_chain_length=Lt[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=2,e.match_available=0,e.ins_h=0),a},Nt=function(t,e,a,n,r,i){if(!t)return at;var s=1;if(e===it&&(e=6),n<0?(s=0,n=-n):n>15&&(s=2,n-=16),r<1||r>9||a!==ut||n<8||n>15||e<0||e>9||i<0||i>lt)return vt(t,at);8===n&&(n=9);var _=new Ft;return t.state=_,_.strm=t,_.wrap=s,_.gzhead=null,_.w_bits=n,_.w_size=1<<_.w_bits,_.w_mask=_.w_size-1,_.hash_bits=r+7,_.hash_size=1<<_.hash_bits,_.hash_mask=_.hash_size-1,_.hash_shift=~~((_.hash_bits+3-1)/3),_.window=new Uint8Array(2*_.w_size),_.head=new Uint16Array(_.hash_size),_.prev=new Uint16Array(_.w_size),_.lit_bufsize=1<<r+6,_.pending_buf_size=4*_.lit_bufsize,_.pending_buf=new Uint8Array(_.pending_buf_size),_.d_buf=1*_.lit_bufsize,_.l_buf=3*_.lit_bufsize,_.level=e,_.strategy=i,_.method=a,It(t)},Ot={deflateInit:function(t,e){return Nt(t,e,ut,15,8,ot)},deflateInit2:Nt,deflateReset:It,deflateResetKeep:Tt,deflateSetHeader:function(t,e){return t&&t.state?2!==t.state.wrap?at:(t.state.gzhead=e,tt):at},deflate:function(t,e){var a,n;if(!t||!t.state||e>$||e<0)return t?vt(t,at):at;var r=t.state;if(!t.output||!t.input&&0!==t.avail_in||r.status===wt&&e!==V)return vt(t,0===t.avail_out?rt:at);r.strm=t;var i=r.last_flush;if(r.last_flush=e,42===r.status)if(2===r.wrap)t.adler=0,xt(r,31),xt(r,139),xt(r,8),r.gzhead?(xt(r,(r.gzhead.text?1:0)+(r.gzhead.hcrc?2:0)+(r.gzhead.extra?4:0)+(r.gzhead.name?8:0)+(r.gzhead.comment?16:0)),xt(r,255&r.gzhead.time),xt(r,r.gzhead.time>>8&255),xt(r,r.gzhead.time>>16&255),xt(r,r.gzhead.time>>24&255),xt(r,9===r.level?2:r.strategy>=_t||r.level<2?4:0),xt(r,255&r.gzhead.os),r.gzhead.extra&&r.gzhead.extra.length&&(xt(r,255&r.gzhead.extra.length),xt(r,r.gzhead.extra.length>>8&255)),r.gzhead.hcrc&&(t.adler=M(t.adler,r.pending_buf,r.pending,0)),r.gzindex=0,r.status=69):(xt(r,0),xt(r,0),xt(r,0),xt(r,0),xt(r,0),xt(r,9===r.level?2:r.strategy>=_t||r.level<2?4:0),xt(r,3),r.status=gt);else{var s=ut+(r.w_bits-8<<4)<<8;s|=(r.strategy>=_t||r.level<2?0:r.level<6?1:6===r.level?2:3)<<6,0!==r.strstart&&(s|=32),s+=31-s%31,r.status=gt,At(r,s),0!==r.strstart&&(At(r,t.adler>>>16),At(r,65535&t.adler)),t.adler=1}if(69===r.status)if(r.gzhead.extra){for(a=r.pending;r.gzindex<(65535&r.gzhead.extra.length)&&(r.pending!==r.pending_buf_size||(r.gzhead.hcrc&&r.pending>a&&(t.adler=M(t.adler,r.pending_buf,r.pending-a,a)),kt(t),a=r.pending,r.pending!==r.pending_buf_size));)xt(r,255&r.gzhead.extra[r.gzindex]),r.gzindex++;r.gzhead.hcrc&&r.pending>a&&(t.adler=M(t.adler,r.pending_buf,r.pending-a,a)),r.gzindex===r.gzhead.extra.length&&(r.gzindex=0,r.status=73)}else r.status=73;if(73===r.status)if(r.gzhead.name){a=r.pending;do{if(r.pending===r.pending_buf_size&&(r.gzhead.hcrc&&r.pending>a&&(t.adler=M(t.adler,r.pending_buf,r.pending-a,a)),kt(t),a=r.pending,r.pending===r.pending_buf_size)){n=1;break}n=r.gzindex<r.gzhead.name.length?255&r.gzhead.name.charCodeAt(r.gzindex++):0,xt(r,n)}while(0!==n);r.gzhead.hcrc&&r.pending>a&&(t.adler=M(t.adler,r.pending_buf,r.pending-a,a)),0===n&&(r.gzindex=0,r.status=91)}else r.status=91;if(91===r.status)if(r.gzhead.comment){a=r.pending;do{if(r.pending===r.pending_buf_size&&(r.gzhead.hcrc&&r.pending>a&&(t.adler=M(t.adler,r.pending_buf,r.pending-a,a)),kt(t),a=r.pending,r.pending===r.pending_buf_size)){n=1;break}n=r.gzindex<r.gzhead.comment.length?255&r.gzhead.comment.charCodeAt(r.gzindex++):0,xt(r,n)}while(0!==n);r.gzhead.hcrc&&r.pending>a&&(t.adler=M(t.adler,r.pending_buf,r.pending-a,a)),0===n&&(r.status=pt)}else r.status=pt;if(r.status===pt&&(r.gzhead.hcrc?(r.pending+2>r.pending_buf_size&&kt(t),r.pending+2<=r.pending_buf_size&&(xt(r,255&t.adler),xt(r,t.adler>>8&255),t.adler=0,r.status=gt)):r.status=gt),0!==r.pending){if(kt(t),0===t.avail_out)return r.last_flush=-1,tt}else if(0===t.avail_in&&bt(e)<=bt(i)&&e!==V)return vt(t,rt);if(r.status===wt&&0!==t.avail_in)return vt(t,rt);if(0!==t.avail_in||0!==r.lookahead||e!==q&&r.status!==wt){var _=r.strategy===_t?function(t,e){for(var a;;){if(0===t.lookahead&&(Zt(t),0===t.lookahead)){if(e===q)return 1;break}if(t.match_length=0,a=X(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(zt(t,!1),0===t.strm.avail_out))return 1}return t.insert=0,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):t.last_lit&&(zt(t,!1),0===t.strm.avail_out)?1:2}(r,e):r.strategy===ht?function(t,e){for(var a,n,r,i,s=t.window;;){if(t.lookahead<=ft){if(Zt(t),t.lookahead<=ft&&e===q)return 1;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=3&&t.strstart>0&&(n=s[r=t.strstart-1])===s[++r]&&n===s[++r]&&n===s[++r]){i=t.strstart+ft;do{}while(n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&r<i);t.match_length=ft-(i-r),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=3?(a=X(t,1,t.match_length-3),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=X(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(zt(t,!1),0===t.strm.avail_out))return 1}return t.insert=0,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):t.last_lit&&(zt(t,!1),0===t.strm.avail_out)?1:2}(r,e):Lt[r.level].func(r,e);if(3!==_&&4!==_||(r.status=wt),1===_||3===_)return 0===t.avail_out&&(r.last_flush=-1),tt;if(2===_&&(e===J?W(r):e!==$&&(j(r,0,0,!1),e===Q&&(mt(r.head),0===r.lookahead&&(r.strstart=0,r.block_start=0,r.insert=0))),kt(t),0===t.avail_out))return r.last_flush=-1,tt}return e!==V?tt:r.wrap<=0?et:(2===r.wrap?(xt(r,255&t.adler),xt(r,t.adler>>8&255),xt(r,t.adler>>16&255),xt(r,t.adler>>24&255),xt(r,255&t.total_in),xt(r,t.total_in>>8&255),xt(r,t.total_in>>16&255),xt(r,t.total_in>>24&255)):(At(r,t.adler>>>16),At(r,65535&t.adler)),kt(t),r.wrap>0&&(r.wrap=-r.wrap),0!==r.pending?tt:et)},deflateEnd:function(t){if(!t||!t.state)return at;var e=t.state.status;return 42!==e&&69!==e&&73!==e&&91!==e&&e!==pt&&e!==gt&&e!==wt?vt(t,at):(t.state=null,e===gt?vt(t,nt):tt)},deflateSetDictionary:function(t,e){var a=e.length;if(!t||!t.state)return at;var n=t.state,r=n.wrap;if(2===r||1===r&&42!==n.status||n.lookahead)return at;if(1===r&&(t.adler=C(t.adler,e,a,0)),n.wrap=0,a>=n.w_size){0===r&&(mt(n.head),n.strstart=0,n.block_start=0,n.insert=0);var i=new Uint8Array(n.w_size);i.set(e.subarray(a-n.w_size,a),0),e=i,a=n.w_size}var s=t.avail_in,_=t.next_in,h=t.input;for(t.avail_in=a,t.next_in=0,t.input=e,Zt(n);n.lookahead>=3;){var l=n.strstart,o=n.lookahead-2;do{n.ins_h=yt(n,n.ins_h,n.window[l+3-1]),n.prev[l&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=l,l++}while(--o);n.strstart=l,n.lookahead=2,Zt(n)}return n.strstart+=n.lookahead,n.block_start=n.strstart,n.insert=n.lookahead,n.lookahead=0,n.match_length=n.prev_length=2,n.match_available=0,t.next_in=_,t.input=h,t.avail_in=s,n.wrap=r,tt},deflateInfo:"pako deflate (from Nodeca project)"};for(var Dt=new Uint8Array(256),Bt=0;Bt<256;Bt++)Dt[Bt]=Bt>=252?6:Bt>=248?5:Bt>=240?4:Bt>=224?3:Bt>=192?2:1;Dt[254]=Dt[254]=1;var Ct=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0},Ht=Object.prototype.toString,Mt=K.Z_NO_FLUSH,Yt=K.Z_SYNC_FLUSH,Kt=K.Z_FULL_FLUSH,Pt=K.Z_FINISH,jt=K.Z_OK,Gt=K.Z_STREAM_END,Xt=K.Z_DEFAULT_COMPRESSION,Wt=K.Z_DEFAULT_STRATEGY,qt=K.Z_DEFLATED;function Jt(){this.options={level:Xt,method:qt,chunkSize:16384,windowBits:15,memLevel:8,strategy:Wt};var t=this.options;t.raw&&t.windowBits>0?t.windowBits=-t.windowBits:t.gzip&&t.windowBits>0&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Ct,this.strm.avail_out=0;var e=Ot.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(e!==jt)throw new Error(Y[e]);if(t.header&&Ot.deflateSetHeader(this.strm,t.header),t.dictionary){var a;if(a="[object ArrayBuffer]"===Ht.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(e=Ot.deflateSetDictionary(this.strm,a))!==jt)throw new Error(Y[e]);this._dict_set=!0}}function Qt(t,e,a){try{t.postMessage({type:"errored",error:e,streamId:a})}catch(n){t.postMessage({type:"errored",error:String(e),streamId:a})}}function Vt(t){var e=t.strm.adler;return new Uint8Array([3,0,e>>>24&255,e>>>16&255,e>>>8&255,255&e])}Jt.prototype.push=function(t,e){var a,n,r=this.strm,i=this.options.chunkSize;if(this.ended)return!1;for(n=e===~~e?e:!0===e?Pt:Mt,"[object ArrayBuffer]"===Ht.call(t)?r.input=new Uint8Array(t):r.input=t,r.next_in=0,r.avail_in=r.input.length;;)if(0===r.avail_out&&(r.output=new Uint8Array(i),r.next_out=0,r.avail_out=i),(n===Yt||n===Kt)&&r.avail_out<=6)this.onData(r.output.subarray(0,r.next_out)),r.avail_out=0;else{if((a=Ot.deflate(r,n))===Gt)return r.next_out>0&&this.onData(r.output.subarray(0,r.next_out)),a=Ot.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===jt;if(0!==r.avail_out){if(n>0&&r.next_out>0)this.onData(r.output.subarray(0,r.next_out)),r.avail_out=0;else if(0===r.avail_in)break}else this.onData(r.output)}return!0},Jt.prototype.onData=function(t){this.chunks.push(t)},Jt.prototype.onEnd=function(t){t===jt&&(this.result=function(t){for(var e=0,a=0,n=t.length;a<n;a++)e+=t[a].length;for(var r=new Uint8Array(e),i=0,s=0,_=t.length;i<_;i++){var h=t[i];r.set(h,s),s+=h.length}return r}(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},function(e){void 0===e&&(e=self);try{var a=new Map;e.addEventListener("message",(function(n){try{var r=function(e,a){switch(a.action){case"init":return{type:"initialized",version:"3.2.16"};case"write":var n=e.get(a.streamId);n||(n=new Jt,e.set(a.streamId,n));var r=n.chunks.length,i=function(t){if("function"==typeof TextEncoder&&TextEncoder.prototype.encode)return(new TextEncoder).encode(t);var e,a,n,r,i,s=t.length,_=0;for(r=0;r<s;r++)55296==(64512&(a=t.charCodeAt(r)))&&r+1<s&&56320==(64512&(n=t.charCodeAt(r+1)))&&(a=65536+(a-55296<<10)+(n-56320),r++),_+=a<128?1:a<2048?2:a<65536?3:4;for(e=new Uint8Array(_),i=0,r=0;i<_;r++)55296==(64512&(a=t.charCodeAt(r)))&&r+1<s&&56320==(64512&(n=t.charCodeAt(r+1)))&&(a=65536+(a-55296<<10)+(n-56320),r++),a<128?e[i++]=a:a<2048?(e[i++]=192|a>>>6,e[i++]=128|63&a):a<65536?(e[i++]=224|a>>>12,e[i++]=128|a>>>6&63,e[i++]=128|63&a):(e[i++]=240|a>>>18,e[i++]=128|a>>>12&63,e[i++]=128|a>>>6&63,e[i++]=128|63&a);return e}(a.data);return n.push(i,K.Z_SYNC_FLUSH),{type:"wrote",id:a.id,streamId:a.streamId,result:t(n.chunks.slice(r)),trailer:Vt(n),additionalBytesCount:i.length};case"reset":e.delete(a.streamId)}}(a,n.data);r&&e.postMessage(r)}catch(t){Qt(e,t,n.data&&"streamId"in n.data?n.data.streamId:void 0)}}))}catch(t){Qt(e,t)}}()}();'])));
    }
    var Ha = {
            Nil: 0,
            Loading: 1,
            Error: 2,
            Initialized: 3
        }
        , Fa = {
            status: Ha.Nil
        };
    function Wa(t, e, n, r) {
        switch (void 0 === r && (r = za),
        Fa.status === Ha.Nil && function(t, e, n) {
            void 0 === n && (n = za);
            try {
                var r = n(t)
                    , i = on(r, "error", (function(n) {
                        Ga(t, e, n);
                    }
                    ))
                    , a = on(r, "message", (function(t) {
                        var e, n = t.data;
                        "errored" === n.type ? Ga(n.error, n.streamId) : "initialized" === n.type && (e = n.version,
                        Fa.status === Ha.Loading && (Fa = {
                            status: Ha.Initialized,
                            worker: Fa.worker,
                            version: e,
                            stop: Fa.stop
                        }));
                    }
                    ));
                r.postMessage({
                    action: "init"
                }),
                h((function() {
                    return function(t) {
                        Fa.status === Ha.Loading && (o.error(t + " failed to start: a timeout occurred while initializing the Worker"),
                        Fa.initializationFailureCallbacks.forEach((function(t) {
                            t();
                        }
                        )),
                        Fa = {
                            status: Ha.Error
                        });
                    }(e);
                }
                ), Ba);
                var s = function() {
                    i.stop(),
                    a.stop();
                };
                Fa = {
                    status: Ha.Loading,
                    worker: r,
                    stop: s,
                    initializationFailureCallbacks: []
                };
            } catch (n) {
                Ga(t, e, n);
            }
        }(t, e, r),
        Fa.status) {
            case Ha.Loading:
                return Fa.initializationFailureCallbacks.push(n),
                Fa.worker;
            case Ha.Initialized:
                return Fa.worker;
        }
    }
    function ja() {
        return Fa.status;
    }
    function Ga(t, e, n, r) {
        if (Fa.status === Ha.Loading) {
            var i;
            if (o.error(e + " failed to start: an error occurred while creating the Worker:", n),
            n instanceof Event || n instanceof Error && (Lt(a = n.message, "Content Security Policy") || Lt(a, "requires 'TrustedScriptURL'")))
                i = t.workerUrl ? "Please make sure the Worker URL " + t.workerUrl + " is correct and CSP is correctly configured." : "Please make sure CSP is correctly configured.",
                o.error(i);
            else
                di(n);
            Fa.status === Ha.Loading && Fa.initializationFailureCallbacks.forEach((function(t) {
                t();
            }
            )),
            Fa = {
                status: Ha.Error
            };
        } else
            di(n, {
                worker_version: Fa.status === Ha.Initialized && Fa.version,
                stream_id: r
            });
        var a;
    }
    function $a(t, e, n, r, i, o, a) {
        var s = function(t, e, n, r, i, o) {
            void 0 === o && (o = Ii);
            var a = function(t, e) {
                return o({
                    encoder: e.encoder,
                    request: _i(e.endpoint, t.batchBytesLimit, t.retryMaxSize, n),
                    flushController: Ai({
                        messagesLimit: t.batchMessagesLimit,
                        bytesLimit: t.batchBytesLimit,
                        durationLimit: t.flushTimeout,
                        pageExitObservable: r,
                        sessionExpireObservable: i
                    }),
                    messageBytesLimit: t.messageBytesLimit,
                    sendContentTypeByJson: t.sendContentTypeByJson
                });
            }(t, e);
            return {
                flushObservable: a.flushController.flushObservable,
                add: function(t) {
                    a.add(t);
                },
                upsert: function(t, e) {
                    a.upsert(t, e);
                },
                stop: function() {
                    a.stop();
                }
            };
        }(t, {
            endpoint: t.rumEndpoint,
            encoder: a(Ua.RUM)
        }, r, i, o);
        return e.subscribe(pn.RUM_EVENT_COLLECTED, (function(t) {
            t.type === ue.VIEW ? s.upsert(t, t.view.id) : s.add(t);
        }
        )),
        n.subscribe((function(t) {
            s.add(t);
        }
        )),
        s;
    }
    function Ka(t) {
        return Ka = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        ,
        Ka(t);
    }
    function qa(t) {
        var e = function(t, e) {
            if ("object" != Ka(t) || !t)
                return t;
            var n = t[Symbol.toPrimitive];
            if (void 0 !== n) {
                var r = n.call(t, e || "default");
                if ("object" != Ka(r))
                    return r;
                throw new TypeError("@@toPrimitive must return a primitive value.");
            }
            return ("string" === e ? String : Number)(t);
        }(t, "string");
        return "symbol" == Ka(e) ? e : e + "";
    }
    function Za(t, e, n) {
        return (e = qa(e))in t ? Object.defineProperty(t, e, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : t[e] = n,
        t;
    }
    function Ya(t, e) {
        var n = Object.keys(t);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(t);
            e && (r = r.filter((function(e) {
                return Object.getOwnPropertyDescriptor(t, e).enumerable;
            }
            ))),
            n.push.apply(n, r);
        }
        return n;
    }
    function Xa(t) {
        for (var e = 1; e < arguments.length; e++) {
            var n = null != arguments[e] ? arguments[e] : {};
            e % 2 ? Ya(Object(n), !0).forEach((function(e) {
                Za(t, e, n[e]);
            }
            )) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Ya(Object(n)).forEach((function(e) {
                Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e));
            }
            ));
        }
        return t;
    }
    var Qa, Ja = {
            SYNTHETICS: "synthetics",
            USER: "user"
        }, ts = {
            "view.url": "string",
            "view.referrer": "string"
        }, es = {
            context: "object"
        }, ns = {
            service: "string",
            version: "string"
        }, rs = {};
    function is(t, e, n, r, i, a, s, u, c, l) {
        rs[ue.VIEW] = Xa(Xa({}, es), ts),
        rs[ue.ERROR] = x({
            "error.message": "string",
            "error.stack": "string",
            "error.resource.url": "string"
        }, es, ts, ns),
        rs[ue.RESOURCE] = x({
            "resource.url": "string"
        }, es, ts, ns),
        rs[ue.ACTION] = x({
            "action.target.name": "string"
        }, es, ts, ns),
        rs[ue.LONG_TASK] = x({}, es, ts);
        var f = {};
        f[ue.ERROR] = Tn(ue.ERROR, t.eventRateLimiterThreshold, l),
        f[ue.ACTION] = Tn(ue.ACTION, t.eventRateLimiterThreshold, l),
        e.subscribe(pn.RAW_RUM_EVENT_COLLECTED, (function(l) {
            var d, p = l.startTime, v = l.rawRumEvent, h = l.savedCommonContext, _ = l.customerContext, g = l.domainContext, m = i.findView(p), y = a.findUrl(p), b = n.findTrackedSession(p);
            if (b && m && y) {
                var E = s.findActionId(p)
                    , w = s.findAllActionId(p)
                    , S = h || c()
                    , T = {
                        _gc: {
                            sdkName: t.sdkName,
                            sdkVersion: t.sdkVersion,
                            drift: Math.round(wt() - (At() + performance.now())),
                            configuration: {
                                session_sample_rate: vt(t.sessionSampleRate, 3),
                                session_replay_sample_rate: vt(t.sessionReplaySampleRate, 3)
                            }
                        },
                        terminal: {
                            type: "web"
                        },
                        application: {
                            id: t.applicationId
                        },
                        device: re,
                        env: t.env || "",
                        service: m.service || t.service || "browser",
                        version: m.version || t.version || "",
                        source: "browser",
                        date: Et(),
                        user: {
                            id: r.getId(),
                            is_signin: "F",
                            is_login: !1
                        },
                        session: {
                            type: void 0 === window._DATAFLUX_SYNTHETICS_BROWSER ? Ja.USER : Ja.SYNTHETICS,
                            id: b.id
                        },
                        view: {
                            id: m.id,
                            name: m.name || m.path,
                            url: y.url,
                            referrer: y.referrer,
                            host: y.host,
                            path: y.path,
                            pathGroup: y.pathGroup,
                            urlQuery: y.urlQuery
                        },
                        action: (d = v,
                        -1 !== [ue.ERROR, ue.RESOURCE, ue.LONG_TASK].indexOf(d.type) && E ? {
                            id: E,
                            ids: w
                        } : void 0),
                        display: u.get()
                    }
                    , C = Ht(N(T, m, v))
                    , I = N({}, S.context, m.context, _);
                G(I) || (C.context = I),
                "has_replay"in C.session || (C.session.has_replay = S.hasReplay),
                "view" === C.type && (C.session.sampled_for_replay = b.sessionReplayAllowed),
                G(S.user) || (C.user = N({
                    is_signin: "T",
                    is_login: !0
                }, S.user)),
                function(t, e, n, r) {
                    if (e) {
                        var i = En(t, rs[t.type], (function(t) {
                            return e(t, n);
                        }
                        ));
                        if (!1 === i && t.type !== ue.VIEW)
                            return !1;
                        !1 === i && o.warn("Can't dismiss view events using beforeSend!");
                    }
                    var a = !1;
                    r[t.type] && (a = r[t.type].isLimitReached());
                    return !a;
                }(C, t.beforeSend, g, f) && (G(C.context) && delete C.context,
                e.notify(pn.RUM_EVENT_COLLECTED, C));
            }
        }
        ));
    }
    function os() {
        return Qa || (Qa = new tn((function(t) {
            var e = Y((function() {
                t.notify(as());
            }
            ), 200).throttled;
            return on(window, ie.RESIZE, e, {
                capture: !0,
                passive: !0
            }).stop;
        }
        ))),
        Qa;
    }
    function as() {
        var t = window.visualViewport;
        return t ? {
            width: Number(t.width * t.scale),
            height: Number(t.height * t.scale)
        } : {
            width: Number(window.innerWidth || 0),
            height: Number(window.innerHeight || 0)
        };
    }
    var ss = Wn;
    var us = Wn;
    function cs(e, n, r) {
        var i = new tn;
        return function(e) {
            var n = rn([t.error]).subscribe((function(t) {
                e.notify(t.error);
            }
            ));
        }(i),
        function(t) {
            ke((function(e, n) {
                t.notify($e({
                    stackTrace: e,
                    originalError: n,
                    startClocks: bt(),
                    nonErrorPrefix: ve.UNCAUGHT,
                    source: Ge.SOURCE,
                    handling: pe.UNHANDLED
                }));
            }
            ));
        }(i),
        function(t, e) {
            var n = un(0, [(sn.cspViolation,
            sn.intervention)]).subscribe((function(t) {
                e.notify({
                    startClocks: bt(),
                    message: t.message,
                    stack: t.stack,
                    type: t.subtype,
                    source: Ge.REPORT,
                    handling: pe.UNHANDLED
                });
            }
            ));
        }(0, i),
        i.subscribe((function(t) {
            e.notify(pn.RAW_ERROR_COLLECTED, {
                error: t
            });
        }
        )),
        function(t, e) {
            return t.subscribe(pn.RAW_ERROR_COLLECTED, (function(n) {
                t.notify(pn.RAW_RUM_EVENT_COLLECTED, x({
                    customerContext: n.customerContext,
                    savedCommonContext: n.savedCommonContext
                }, function(t, e) {
                    var n = {
                        date: t.startClocks.timeStamp,
                        error: {
                            id: Q(),
                            message: t.message,
                            source: t.source,
                            stack: t.stack,
                            handling_stack: t.handlingStack,
                            type: t.type,
                            handling: t.handling,
                            causes: t.causes,
                            source_type: "browser"
                        },
                        type: ue.ERROR,
                        view: {
                            in_foreground: e.wasInPageStateAt(Na.ACTIVE, t.startClocks.relative)
                        }
                    };
                    return {
                        rawRumEvent: n,
                        startTime: t.startClocks.relative,
                        domainContext: {
                            error: t.originalError
                        }
                    };
                }(n.error, e)));
            }
            )),
            {
                addError: function(e, n) {
                    var r = e.error
                        , i = $e({
                            stackTrace: r instanceof Error ? be(r) : void 0,
                            originalError: r,
                            handlingStack: e.handlingStack,
                            startClocks: e.startClocks,
                            nonErrorPrefix: ve.PROVIDED,
                            source: Ge.CUSTOM,
                            handling: pe.HANDLED
                        });
                    t.notify(pn.RAW_ERROR_COLLECTED, {
                        customerContext: e.context,
                        savedCommonContext: n,
                        error: i
                    });
                }
            };
        }(e, r);
    }
    var ls = 10 * lt;
    function fs() {
        if (Mo(Do.NAVIGATION)) {
            var t = performance.getEntriesByType(Do.NAVIGATION)[0];
            if (t)
                return t;
        }
        var e = function() {
                var t = {}
                    , e = performance.timing;
                for (var n in e)
                    if (Z(e[n])) {
                        var r = n
                            , i = e[r];
                        t[r] = 0 === i ? 0 : gt(i);
                    }
                return t;
            }()
            , n = x({
                entryType: Do.NAVIGATION,
                initiatorType: "navigation",
                name: window.location.href,
                startTime: 0,
                duration: e.responseEnd,
                decodedBodySize: 0,
                encodedBodySize: 0,
                transferSize: 0,
                toJSON: function() {
                    return x({}, n, {
                        toJSON: void 0
                    });
                }
            }, e);
        return n;
    }
    function ds(t, e, n) {
        return void 0 === n && (n = fs),
        function(t) {
            var e, n = Pr("complete", (function() {
                e = h((function() {
                    t();
                }
                ));
            }
            ));
            return {
                stop: function() {
                    n.stop(),
                    _(e);
                }
            };
        }((function() {
            var t = n();
            (function(t) {
                return t.loadEventEnd <= 0;
            }
            )(t) || e(function(t) {
                return {
                    fetchStart: t.fetchStart,
                    responseEnd: t.responseEnd,
                    domComplete: t.domComplete,
                    domContentLoaded: t.domContentLoadedEventEnd,
                    domInteractive: t.domInteractive,
                    loadEvent: t.loadEventEnd,
                    loadEventEnd: t.loadEventEnd,
                    loadEventStart: t.loadEventStart,
                    domContentLoadedEventEnd: t.domContentLoadedEventEnd,
                    domContentLoadedEventStart: t.domContentLoadedEventStart,
                    firstByte: t.responseStart >= 0 && t.responseStart <= yt() ? t.responseStart : void 0
                };
            }(t));
        }
        ));
    }
    var ps = 10 * lt;
    function vs(t) {
        var e;
        if (void 0 === t && (t = window),
        "hidden" === document.visibilityState)
            e = 0;
        else {
            e = 1 / 0;
            var n = an(t, [ie.PAGE_HIDE, ie.VISIBILITY_CHANGE], (function(t) {
                t.type !== ie.PAGE_HIDE && "hidden" !== document.visibilityState || (e = t.timeStamp,
                n());
            }
            ), {
                capture: !0
            }).stop;
        }
        return {
            getTimeStamp: function() {
                return e;
            },
            stop: function() {
                n && n();
            }
        };
    }
    function hs(t, e, n) {
        var r = {}
            , i = ds(0, (function(t) {
                e(t.loadEvent),
                r.navigationTimings = t,
                n();
            }
            ))
            , o = vs()
            , a = i.stop
            , s = function(t, e, n) {
                return {
                    stop: Po(t, {
                        type: Do.PAINT,
                        buffered: !0
                    }).subscribe((function(t) {
                        var r = Dt(t, (function(t) {
                            return t.entryType === Do.PAINT && "first-contentful-paint" === t.name && t.startTime < e.getTimeStamp() && t.startTime < ls;
                        }
                        ));
                        r && n(r.startTime);
                    }
                    )).unsubscribe
                };
            }(t, o, (function(t) {
                r.firstContentfulPaint = t,
                n();
            }
            ))
            , u = s.stop
            , c = function(t, e, n, r) {
                var i = 1 / 0
                    , o = an(n, [ie.POINTER_DOWN, ie.KEY_DOWN], (function(t) {
                        i = t.timeStamp;
                    }
                    ), {
                        capture: !0,
                        once: !0
                    }).stop
                    , a = 0
                    , s = Po(t, {
                        type: Do.LARGEST_CONTENTFUL_PAINT,
                        buffered: !0
                    }).subscribe((function(n) {
                        var o, s = function(t, e) {
                            for (var n = t.length - 1; n >= 0; n -= 1) {
                                var r = t[n];
                                if (e(r, n, t))
                                    return r;
                            }
                        }(n, (function(t) {
                            return t.entryType === Do.LARGEST_CONTENTFUL_PAINT && t.startTime < i && t.startTime < e.getTimeStamp() && t.startTime < ps && t.size > a;
                        }
                        ));
                        s && (s.element && (o = ua(s.element, t.actionNameAttribute)),
                        r({
                            value: s.startTime,
                            targetSelector: o
                        }),
                        a = s.size);
                    }
                    ));
                return {
                    stop: function() {
                        o(),
                        s.unsubscribe();
                    }
                };
            }(t, o, window, (function(t) {
                r.largestContentfulPaint = t,
                n();
            }
            ))
            , l = c.stop
            , f = function(t, e, n) {
                var r = Po(t, {
                    type: Do.FIRST_INPUT,
                    buffered: !0
                }).subscribe((function(r) {
                    var i = Dt(r, (function(t) {
                        return t.entryType === Do.FIRST_INPUT && t.startTime < e.getTimeStamp();
                    }
                    ));
                    if (i) {
                        var o, a = St(i.startTime, i.processingStart);
                        i.target && Rr(i.target) && (o = ua(i.target, t.actionNameAttribute)),
                        n({
                            delay: a >= 0 ? a : 0,
                            time: i.startTime,
                            targetSelector: o
                        });
                    }
                }
                ));
                return {
                    stop: function() {
                        r.unsubscribe();
                    }
                };
            }(t, o, (function(t) {
                r.firstInput = t,
                n();
            }
            ))
            , d = f.stop;
        return {
            stop: function() {
                a(),
                u(),
                l(),
                d(),
                o.stop();
            },
            initialViewMetrics: r
        };
    }
    var _s = ct;
    function gs(t, e, n, r) {
        void 0 === r && (r = function(t, e) {
            void 0 === e && (e = _s);
            return new tn((function(t) {
                function n() {
                    var e, n, r, i;
                    t.notify((e = Ur(),
                    n = as().height,
                    r = Math.round((document.scrollingElement || document.documentElement).scrollHeight),
                    i = Math.round(n + e),
                    {
                        scrollHeight: r,
                        scrollDepth: i,
                        scrollTop: e
                    }));
                }
                if (window.ResizeObserver) {
                    var r = Y(n, e, {
                            leading: !1,
                            trailing: !0
                        })
                        , i = document.scrollingElement || document.documentElement
                        , o = new ResizeObserver(c(r.throttled));
                    i && o.observe(i);
                    var a = on(window, ie.SCROLL, r.throttled, {
                        passive: !0
                    });
                    return function() {
                        r.cancel(),
                        o.unobserve(i),
                        a.stop();
                    };
                }
            }
            ));
        }());
        var i = 0
            , o = 0
            , a = 0
            , s = r.subscribe((function(t) {
                var r = t.scrollDepth
                    , s = t.scrollTop
                    , u = t.scrollHeight
                    , c = !1;
                if (r > i && (i = r,
                c = !0),
                u > o) {
                    o = u;
                    var l = yt();
                    a = St(e.relative, l),
                    c = !0;
                }
                c && n({
                    maxDepth: Math.min(i, o),
                    maxDepthScrollTop: s,
                    maxScrollHeight: o,
                    maxScrollHeightTime: a
                });
            }
            ));
        return {
            stop: function() {
                return s.unsubscribe();
            }
        };
    }
    function ms(t, e, n) {
        if (!Ss())
            return {
                stop: st
            };
        var r, i, o = 0;
        n({
            value: 0
        });
        var a = function() {
                var t, e, n = 0, r = 0;
                return {
                    update: function(i) {
                        var o;
                        return void 0 === t || i.startTime - e >= ws || i.startTime - t >= 5 * Es ? (t = e = i.startTime,
                        r = n = i.value,
                        o = !0) : (n += i.value,
                        e = i.startTime,
                        (o = i.value > r) && (r = i.value)),
                        {
                            cumulatedValue: n,
                            isMaxValue: o
                        };
                    }
                };
            }()
            , s = Po(t, {
                type: Do.LAYOUT_SHIFT,
                buffered: !0
            }).subscribe((function(s) {
                for (var u = 0, c = s; u < c.length; u++) {
                    var l = c[u];
                    if (!(l.hadRecentInput || l.startTime < e)) {
                        var f = a.update(l)
                            , d = f.cumulatedValue;
                        if (f.isMaxValue) {
                            var p = ys(l.sources);
                            r = p ? new WeakRef(p) : void 0,
                            i = St(e, l.startTime);
                        }
                        if (d > o) {
                            o = d;
                            p = r && r.deref();
                            n({
                                value: vt(o, 4),
                                targetSelector: p && ua(p, t.actionNameAttribute),
                                time: i
                            });
                        }
                    }
                }
            }
            ));
        return {
            stop: function() {
                s.unsubscribe();
            }
        };
    }
    function ys(t) {
        if (t) {
            var e = Dt(t, (function(t) {
                return !!t.node && Rr(t.node);
            }
            ));
            return e && e.node;
        }
    }
    var bs, Es = 5 * ct, ws = ct;
    function Ss() {
        return Mo(Do.LAYOUT_SHIFT) && "WeakRef"in window;
    }
    var Ts = 0
        , Cs = 1 / 0
        , Is = 0;
    var Os = function() {
            return bs ? Ts : window.performance.interactionCount || 0;
        }
        , As = 10
        , xs = 1 * lt;
    function Rs(t, e, n) {
        if (!(Mo("event") && window.PerformanceEventTiming && "interactionId"in PerformanceEventTiming.prototype))
            return {
                getInteractionToNextPaint: function() {},
                setViewEnd: st,
                stop: st
            };
        var r, i, o = function(t) {
                "interactionCount"in performance || bs || (bs = new window.PerformanceObserver(c((function(t) {
                    t.getEntries().forEach((function(t) {
                        var e = t;
                        e.interactionId && (Cs = Math.min(Cs, e.interactionId),
                        Is = Math.max(Is, e.interactionId),
                        Ts = (Is - Cs) / 7 + 1);
                    }
                    ));
                }
                )))).observe({
                    type: "event",
                    buffered: !0,
                    durationThreshold: 0
                });
                var e = t === le.INITIAL_LOAD ? 0 : Os()
                    , n = {
                        stopped: !1
                    };
                function r() {
                    return Os() - e;
                }
                return {
                    getViewInteractionCount: function() {
                        return n.stopped ? n.interactionCount : r();
                    },
                    stopViewInteractionCount: function() {
                        n = {
                            stopped: !0,
                            interactionCount: r()
                        };
                    }
                };
            }(n), a = o.getViewInteractionCount, s = o.stopViewInteractionCount, u = 1 / 0, l = function(t) {
                var e = [];
                function n() {
                    e.sort((function(t, e) {
                        return e.duration - t.duration;
                    }
                    )).splice(As);
                }
                return {
                    process: function(t) {
                        var r = e.findIndex((function(e) {
                                return t.interactionId === e.interactionId;
                            }
                            ))
                            , i = e[e.length - 1];
                        -1 !== r ? t.duration > e[r].duration && (e[r] = t,
                        n()) : (e.length < As || t.duration > i.duration) && (e.push(t),
                        n());
                    },
                    estimateP98Interaction: function() {
                        var n = Math.min(e.length - 1, Math.floor(t() / 50));
                        return e[n];
                    }
                };
            }(a), f = -1;
        function d(n) {
            for (var o = 0, a = n; o < a.length; o++) {
                var s = a[o];
                s.interactionId && s.startTime >= e && s.startTime <= u && l.process(s);
            }
            var c, d, p = l.estimateP98Interaction();
            p && p.duration !== f && (f = p.duration,
            i = St(e, p.startTime),
            c = p.startTime,
            d = Sa.get(c),
            Sa.delete(c),
            !(r = d) && p.target && Rr(p.target) && (r = ua(p.target, t.actionNameAttribute)));
        }
        var p = Po(t, {
                type: Do.FIRST_INPUT,
                buffered: !0
            }).subscribe(d)
            , v = Po(t, {
                type: Do.EVENT,
                durationThreshold: 40,
                buffered: !0
            }).subscribe(d);
        return {
            getInteractionToNextPaint: function() {
                return f >= 0 ? {
                    value: Math.min(f, xs),
                    targetSelector: r,
                    time: i
                } : a() ? {
                    value: 0
                } : void 0;
            },
            setViewEnd: function(t) {
                u = t,
                s();
            },
            stop: function() {
                v.unsubscribe(),
                p.unsubscribe();
            }
        };
    }
    function ks(t, e, n, r, i, o) {
        var a = {}
            , s = function(t, e, n, r, i, o) {
                var a = r === le.INITIAL_LOAD
                    , s = !0
                    , u = []
                    , c = vs();
                function l() {
                    if (!s && !a && u.length > 0) {
                        var t = Math.max.apply(Math, u);
                        t < c.getTimeStamp() && o(t);
                    }
                }
                var f = zo(t, e, n, (function(t) {
                    s && (s = !1,
                    t.hadActivity && u.push(St(i.timeStamp, t.end)),
                    l());
                }
                )).stop;
                return {
                    setLoadEvent: function(t) {
                        a && (a = !1,
                        u.push(t),
                        l());
                    },
                    stop: function() {
                        f(),
                        c.stop(),
                        s && (s = !1,
                        l());
                    }
                };
            }(t, e, n, i, o, (function(t) {
                a.loadingTime = t,
                r();
            }
            ))
            , u = s.stop
            , c = s.setLoadEvent
            , l = gs(0, o, (function(t) {
                a.scroll = t;
            }
            )).stop
            , f = ms(n, o.relative, (function(t) {
                a.cumulativeLayoutShift = t,
                r();
            }
            )).stop
            , d = Rs(n, o.relative, i)
            , p = d.stop
            , v = d.getInteractionToNextPaint;
        return {
            stop: function() {
                u(),
                f(),
                l();
            },
            stopINPTracking: p,
            setLoadEvent: c,
            setViewEnd: d.setViewEnd,
            getCommonViewMetrics: function() {
                return a.interactionToNextPaint = v(),
                a;
            }
        };
    }
    var Ns = 3e3
        , Ls = 5 * lt
        , Ds = 5 * lt;
    function Ps(t, e, n, r, i, o, a) {
        var s = new Set;
        function u(i, o, a) {
            var u = function(t, e, n, r, i, o, a) {
                void 0 === o && (o = bt());
                var s, u, c, l, f, d = Q(), p = new tn, v = {}, _ = 0, y = R(r), b = Vi(), E = !0;
                a && (u = a.name,
                c = a.service,
                l = a.version,
                f = a.context);
                f && b.setContext(f);
                var w = {
                    id: d,
                    name: u,
                    startClocks: o,
                    service: c,
                    version: l
                };
                t.notify(pn.BEFORE_VIEW_CREATED, w),
                t.notify(pn.VIEW_CREATED, w);
                var S = Y(F, Ns, {
                        leading: !1
                    })
                    , T = S.throttled
                    , C = S.cancel
                    , I = ks(t, e, n, H, i, o)
                    , O = I.setLoadEvent
                    , A = I.stop
                    , x = I.getCommonViewMetrics
                    , k = I.stopINPTracking
                    , N = I.setViewEnd
                    , L = i === le.INITIAL_LOAD ? hs(n, O, H) : {
                        stop: st,
                        initialViewMetrics: {}
                    }
                    , D = L.stop
                    , P = L.initialViewMetrics
                    , M = function(t, e, n) {
                        var r = Uo({
                            lifeCycle: t,
                            isChildEvent: function(t) {
                                return t.view.id === e;
                            },
                            onChange: n
                        });
                        return {
                            stop: r.stop,
                            eventCounts: r.eventCounts
                        };
                    }(t, d, H)
                    , U = M.stop
                    , V = M.eventCounts
                    , B = g(F, Ls);
                function z() {
                    t.notify(pn.BEFORE_VIEW_UPDATED, {
                        id: d,
                        name: u,
                        context: b.getContext(),
                        startClocks: o
                    });
                }
                function H() {
                    z(),
                    T();
                }
                function F() {
                    C(),
                    z(),
                    _ += 1;
                    var e = void 0 === s ? Et() : s.timeStamp;
                    t.notify(pn.VIEW_UPDATED, {
                        customTimings: v,
                        documentVersion: _,
                        id: d,
                        name: u,
                        service: c,
                        version: l,
                        context: b.getContext(),
                        loadingType: i,
                        location: y,
                        startClocks: o,
                        commonViewMetrics: x(),
                        initialViewMetrics: P,
                        duration: St(o.timeStamp, e),
                        isActive: void 0 === s,
                        sessionIsActive: E,
                        eventCounts: V
                    });
                }
                F(),
                b.changeObservable.subscribe(H);
                var W = {
                    name: u,
                    service: c,
                    version: l,
                    contextManager: b,
                    stopObservable: p,
                    end: function(e) {
                        s || (s = Wt(e && e.endClocks, bt()),
                        E = Wt(e && e.sessionIsActive, !0),
                        t.notify(pn.VIEW_ENDED, {
                            endClocks: s
                        }),
                        t.notify(pn.AFTER_VIEW_ENDED, {
                            endClocks: s
                        }),
                        m(B),
                        N(s.relative),
                        A(),
                        F(),
                        h((function() {
                            W.stop();
                        }
                        ), Ds));
                    },
                    stop: function() {
                        D(),
                        U(),
                        k(),
                        p.notify();
                    },
                    addTiming: function(t, e) {
                        if (!s) {
                            var n = function(t) {
                                return t < dt;
                            }(e) ? e : St(o.timeStamp, e);
                            v[function(t) {
                                var e = t.replace(/[^a-zA-Z0-9-_.@$]/g, "_");
                                e !== t && console.warn("Invalid timing name: " + t + ", sanitized to: " + e);
                                return e;
                            }(t)] = n,
                            H();
                        }
                    },
                    setViewName: function(t) {
                        u = t,
                        F();
                    }
                };
                return W;
            }(e, n, r, t, i, o, a);
            return s.add(u),
            u.stopObservable.subscribe((function() {
                s.delete(u);
            }
            )),
            u;
        }
        var c, l = u(le.INITIAL_LOAD, Tt(), a);
        return e.subscribe(pn.SESSION_RENEWED, (function() {
            l = u(le.ROUTE_CHANGE, void 0, {
                name: l.name,
                service: l.service,
                version: l.version,
                context: l.contextManager.getContext()
            });
        }
        )),
        e.subscribe(pn.SESSION_EXPIRED, (function() {
            l.end({
                sessionIsActive: !1
            });
        }
        )),
        e.subscribe(pn.PAGE_EXITED, (function(t) {
            t.reason === Ar.UNLOADING && l.end();
        }
        )),
        o && (c = function(t) {
            return t.subscribe((function(t) {
                var e, n, r = t.oldLocation, i = t.newLocation;
                if (n = i,
                (e = r).pathname !== n.pathname || !$t(n.hash) && Kt(n.hash) !== Kt(e.hash))
                    return l.end(),
                    void (l = u(le.ROUTE_CHANGE));
            }
            ));
        }(i)),
        {
            addTiming: function(t, e) {
                void 0 === e && (e = Et()),
                l.addTiming(t, e);
            },
            startView: function(t, e) {
                l.end({
                    endClocks: e
                }),
                l = u(le.ROUTE_CHANGE, e, t);
            },
            setViewContext: function(t) {
                l.contextManager.setContext(t);
            },
            setViewContextProperty: function(t, e) {
                l.contextManager.setContextProperty(t, e);
            },
            setViewName: function(t) {
                l.setViewName(t);
            },
            getViewContext: function() {
                return l.contextManager.getContext();
            },
            stop: function() {
                c && c.unsubscribe(),
                l.end(),
                s.forEach((function(t) {
                    t.stop();
                }
                ));
            }
        };
    }
    function Ms(t, e, n, r, i, o, a, s) {
        return t.subscribe(pn.VIEW_UPDATED, (function(n) {
            t.notify(pn.RAW_RUM_EVENT_COLLECTED, function(t, e, n, r) {
                var i = n.getReplayStats(t.id)
                    , o = r.findAll(t.startClocks.relative, t.duration)
                    , a = {
                        _gc: {
                            document_version: t.documentVersion,
                            replay_stats: i,
                            page_states: o
                        },
                        date: t.startClocks.timeStamp,
                        type: ue.VIEW,
                        view: {
                            action: {
                                count: t.eventCounts.actionCount
                            },
                            frustration: {
                                count: t.eventCounts.frustrationCount
                            },
                            cumulative_layout_shift: Rt(t.commonViewMetrics, "cumulativeLayoutShift.value"),
                            cumulative_layout_shift_time: Rt(t.commonViewMetrics, "cumulativeLayoutShift.time"),
                            cumulative_layout_shift_target_selector: Rt(t.commonViewMetrics, "cumulativeLayoutShift.targetSelector"),
                            first_byte: _t(Rt(t.initialViewMetrics, "navigationTimings.firstByte")),
                            dom_complete: _t(Rt(t.initialViewMetrics, "navigationTimings.domComplete")),
                            dom_content_loaded: _t(Rt(t.initialViewMetrics, "navigationTimings.domContentLoaded")),
                            dom_interactive: _t(Rt(t.initialViewMetrics, "navigationTimings.domInteractive")),
                            error: {
                                count: t.eventCounts.errorCount
                            },
                            first_contentful_paint: _t(Rt(t.initialViewMetrics, "firstContentfulPaint")),
                            first_input_delay: _t(Rt(t.initialViewMetrics, "firstInput.delay")),
                            first_input_time: _t(Rt(t.initialViewMetrics, "firstInput.time")),
                            first_input_target_selector: Rt(t.initialViewMetrics, "firstInput.targetSelector"),
                            interaction_to_next_paint: _t(Rt(t.commonViewMetrics, "interactionToNextPaint.value")),
                            interaction_to_next_paint_target_selector: Rt(t.commonViewMetrics, "interactionToNextPaint.targetSelector"),
                            is_active: t.isActive,
                            name: t.name,
                            largest_contentful_paint: _t(Rt(t.initialViewMetrics, "largestContentfulPaint.value")),
                            largest_contentful_paint_element_selector: Rt(t.initialViewMetrics, "largestContentfulPaint.targetSelector"),
                            load_event: _t(Rt(t.initialViewMetrics, "navigationTimings.loadEvent")),
                            loading_time: qt(_t(t.commonViewMetrics.loadingTime)),
                            loading_type: t.loadingType,
                            long_task: {
                                count: t.eventCounts.longTaskCount
                            },
                            resource: {
                                count: t.eventCounts.resourceCount
                            },
                            time_spent: _t(t.duration)
                        },
                        display: t.commonViewMetrics.scroll ? {
                            scroll: {
                                max_depth: t.commonViewMetrics.scroll.maxDepth,
                                max_depth_scroll_top: t.commonViewMetrics.scroll.maxDepthScrollTop,
                                max_scroll_height: t.commonViewMetrics.scroll.maxScrollHeight,
                                max_scroll_height_time: _t(t.commonViewMetrics.scroll.maxScrollHeightTime)
                            }
                        } : void 0,
                        session: {
                            has_replay: !!i || void 0,
                            is_active: !!t.sessionIsActive && void 0
                        },
                        privacy: {
                            replay_level: e.defaultPrivacyLevel
                        }
                    };
                G(t.customTimings) || (a.view.custom_timings = (s = t.customTimings,
                u = _t,
                c = {},
                A(s, (function(t, e) {
                    c[e] = u(t);
                }
                )),
                c));
                var s, u, c;
                return a = N(a, {
                    view: Us(t.initialViewMetrics.navigationTimings)
                }),
                {
                    rawRumEvent: a,
                    startTime: t.startClocks.relative,
                    domainContext: {
                        location: t.location
                    }
                };
            }(n, e, a, o));
        }
        )),
        Ps(n, t, r, e, i, !e.trackViewsManually, s);
    }
    function Us(t) {
        if (t) {
            var e = t.fetchStart
                , n = t.responseEnd
                , r = t.domInteractive
                , i = t.domContentLoaded
                , o = t.domComplete
                , a = t.loadEventEnd
                , s = t.loadEventStart
                , u = t.domContentLoadedEventEnd
                , c = {};
            if (Z(n) && Z(e) && n !== e) {
                c.fpt = _t(n - e);
                var l = parseInt((n - e) / 1e3);
                c.apdexLevel = l > 9 ? 9 : l;
            }
            return Z(r) && Z(e) && r !== e && (c.tti = _t(r - e)),
            Z(i) && Z(e) && i !== e && (c.dom_ready = _t(i - e)),
            Z(a) && Z(e) && a !== e && (c.load = _t(a - e)),
            Z(s) && Z(u) && s !== u && (c.resource_load_time = _t(s - u)),
            Z(o) && Z(r) && o !== r && (c.dom = _t(o - r)),
            c;
        }
    }
    function Vs() {
        this.buffer = new Uint8Array(8),
        Bs().getRandomValues(this.buffer),
        this.buffer[0] = 127 & this.buffer[0];
    }
    function Bs() {
        return window.crypto || window.msCrypto;
    }
    function zs(t, e) {
        if (this._spanId = new Vs,
        this._traceId = new Vs,
        this._traceSampled = e,
        t.generateTraceId && "function" === rt(t.generateTraceId)) {
            var n = t.generateTraceId();
            "string" === rt(n) && (this.customTraceId = n);
        }
    }
    function Hs() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (function(t) {
            var e = 16 * Math.random() | 0;
            return ("x" === t ? e : 3 & e | 8).toString(16);
        }
        ));
    }
    function Fs(t, e, n) {
        if (this._spanId = Hs(),
        this._traceId = Hs(),
        this._applicationId = t.applicationId,
        this._env = t.env,
        this._version = t.version,
        this._urlParse = tt(e).getParse(),
        this._traceSampled = n,
        t.generateTraceId && "function" === rt(t.generateTraceId)) {
            var r = t.generateTraceId();
            "string" === rt(r) && (this.customTraceId = r);
        }
    }
    function Ws(t, e) {
        if (this._traceId = new Vs,
        this._spanId = new Vs,
        this._traceSampled = e,
        this.is128Bit = t.traceId128Bit,
        t.generateTraceId && "function" === rt(t.generateTraceId)) {
            var n = t.generateTraceId();
            "string" === rt(n) && (this.customTraceId = n);
        }
    }
    function js(t, e) {
        if (this._traceId = new Vs,
        this._spanId = new Vs,
        this._traceSampled = e,
        t.generateTraceId && "function" === rt(t.generateTraceId)) {
            var n = t.generateTraceId();
            "string" === rt(n) && (this.customTraceId = n);
        }
    }
    function Gs(t, e) {
        if (this._traceId = new Vs,
        this._spanId = new Vs,
        this._traceSampled = e,
        this.is128Bit = t.traceId128Bit,
        t.generateTraceId && "function" === rt(t.generateTraceId)) {
            var n = t.generateTraceId();
            "string" === rt(n) && (this.customTraceId = n);
        }
    }
    function $s(t, e, n) {
        if (this._traceId = new Vs,
        this._spanId = new Vs,
        this._traceSampled = e,
        this.isHexTraceId = n,
        t.generateTraceId && "function" === rt(t.generateTraceId)) {
            var r = t.generateTraceId();
            "string" === rt(r) && (this.customTraceId = r);
        }
    }
    function Ks(t) {
        0 !== t.status || t.isAborted || (t.traceId = void 0,
        t.spanId = void 0,
        t.traceSampled = void 0);
    }
    function qs(t, e, n, r) {
        if (n.findTrackedSession()) {
            var i = Dt(t.allowedTracingUrls, (function(t) {
                return F([t.match], e.url, !0);
            }
            ));
            if (i) {
                var o, a = !Z(t.tracingSampleRate) || pt(t.tracingSampleRate);
                switch (i.traceType) {
                    case de.DDTRACE:
                        o = new zs(t,a);
                        break;
                    case de.SKYWALKING_V3:
                        o = new Fs(t,e.url,a);
                        break;
                    case de.ZIPKIN_MULTI_HEADER:
                        o = new Gs(t,a);
                        break;
                    case de.JAEGER:
                        o = new Ws(t,a);
                        break;
                    case de.W3C_TRACEPARENT:
                        o = new $s(t,a);
                        break;
                    case de.W3C_TRACEPARENT_64:
                        o = new $s(t,a,!0);
                        break;
                    case de.ZIPKIN_SINGLE_HEADER:
                        o = new js(t,a);
                }
                if (o && o.isTracingSupported()) {
                    e.traceId = o.getTraceId(),
                    e.spanId = o.getSpanId(),
                    e.traceSampled = a;
                    var s = o.makeTracingHeaders();
                    if (t.injectTraceHeader) {
                        var u = t.injectTraceHeader(R(e));
                        "object" === rt(u) && A(u, (function(t, e) {
                            "string" === rt(t) && (s[e] = t);
                        }
                        ));
                    }
                    r(s);
                }
            }
        }
    }
    Vs.prototype = {
        toString: function(t) {
            var e = this.readInt32(0)
                , n = this.readInt32(4)
                , r = "";
            do {
                var i = e % t * 4294967296 + n;
                e = Math.floor(e / t),
                n = Math.floor(i / t),
                r = (i % t).toString(t) + r;
            } while (e || n);
            return r;
        },
        toDecimalString: function() {
            return this.toString(10);
        },
        toPaddedHexadecimalString: function() {
            var t = this.toString(16);
            return Array(17 - t.length).join("0") + t;
        },
        readInt32: function(t) {
            return 16777216 * this.buffer[t] + (this.buffer[t + 1] << 16) + (this.buffer[t + 2] << 8) + this.buffer[t + 3];
        }
    },
    zs.prototype = {
        isTracingSupported: function() {
            return void 0 !== Bs();
        },
        getSpanId: function() {
            return this._spanId.toDecimalString();
        },
        getTraceId: function() {
            return this.customTraceId ? this.customTraceId : this._traceId.toDecimalString();
        },
        makeTracingHeaders: function() {
            return {
                "x-datadog-origin": "rum",
                "x-datadog-parent-id": this.getSpanId(),
                "x-datadog-sampling-priority": this._traceSampled ? "2" : "-1",
                "x-datadog-trace-id": this.getTraceId()
            };
        }
    },
    Fs.prototype = {
        isTracingSupported: function() {
            return !!(this._env && this._version && this._urlParse);
        },
        getSpanId: function() {
            return this._spanId;
        },
        getTraceId: function() {
            return this.customTraceId ? this.customTraceId : this._traceId;
        },
        getSkyWalkingSw8: function() {
            try {
                var t = String(X(this.getTraceId()))
                    , e = String(X(this.getSpanId()))
                    , n = String(X(this._applicationId + "_rum_" + this.env))
                    , r = String(X(this._version))
                    , i = String(X(window.location.href))
                    , o = String(X(this._urlParse.Host));
                return (this._traceSampled ? "1" : "0") + "-" + t + "-" + e + "-0-" + n + "-" + r + "-" + i + "-" + o;
            } catch (t) {
                return "";
            }
        },
        makeTracingHeaders: function() {
            return {
                sw8: this.getSkyWalkingSw8()
            };
        }
    },
    Ws.prototype = {
        isTracingSupported: function() {
            return void 0 !== Bs();
        },
        getSpanId: function() {
            return this._spanId.toPaddedHexadecimalString();
        },
        getTraceId: function() {
            return this.customTraceId ? this.customTraceId : this.is128Bit ? "0000000000000000" + this._traceId.toPaddedHexadecimalString() : this._traceId.toPaddedHexadecimalString();
        },
        getUberTraceId: function() {
            return this.getTraceId() + ":" + this.getSpanId() + ":0:" + (this._traceSampled ? "1" : "0");
        },
        makeTracingHeaders: function() {
            return {
                "uber-trace-id": this.getUberTraceId()
            };
        }
    },
    js.prototype = {
        isTracingSupported: function() {
            return void 0 !== Bs();
        },
        getSpanId: function() {
            return this._spanId.toPaddedHexadecimalString();
        },
        getTraceId: function() {
            return this.customTraceId ? this.customTraceId : this._traceId.toPaddedHexadecimalString();
        },
        getB3Str: function() {
            return this.getTraceId() + "-" + this.getSpanId() + "-" + (this._traceSampled ? "1" : "0");
        },
        makeTracingHeaders: function() {
            return {
                b3: this.getB3Str()
            };
        }
    },
    Gs.prototype = {
        isTracingSupported: function() {
            return void 0 !== Bs();
        },
        getSpanId: function() {
            return this._spanId.toPaddedHexadecimalString();
        },
        getTraceId: function() {
            return this.customTraceId ? this.customTraceId : this.is128Bit ? "0000000000000000" + this._traceId.toPaddedHexadecimalString() : this._traceId.toPaddedHexadecimalString();
        },
        makeTracingHeaders: function() {
            return {
                "X-B3-TraceId": this.getSpanId(),
                "X-B3-SpanId": this.getTraceId(),
                "X-B3-Sampled": this._traceSampled ? "1" : "0"
            };
        }
    },
    $s.prototype = {
        isTracingSupported: function() {
            return void 0 !== Bs();
        },
        getSpanId: function() {
            return this.isHexTraceId ? this._spanId.toDecimalString() : this._spanId.toPaddedHexadecimalString();
        },
        getTraceId: function() {
            return this.customTraceId ? this.customTraceId : this.isHexTraceId ? this._traceId.toDecimalString() : this._traceId.toPaddedHexadecimalString() + this._spanId.toPaddedHexadecimalString();
        },
        getTraceParent: function() {
            return this.isHexTraceId ? "00-0000000000000000" + this._traceId.toPaddedHexadecimalString() + "-" + this._spanId.toPaddedHexadecimalString() + "-" + (this._traceSampled ? "01" : "00") : "00-" + this.getTraceId() + "-" + this.getSpanId() + "-" + (this._traceSampled ? "01" : "00");
        },
        makeTracingHeaders: function() {
            var t = {
                traceparent: this.getTraceParent()
            };
            return this.isHexTraceId ? x(t, {
                "x-gc-trace-id": this.getTraceId(),
                "x-gc-span-id": this.getSpanId()
            }) : t;
        }
    };
    var Zs = 1;
    function Ys(t, e, n) {
        var r = function(t, e) {
            return {
                clearTracingIfNeeded: Ks,
                traceFetch: function(n) {
                    return qs(t, n, e, (function(t) {
                        if (!(n.input instanceof Request) || n.init && n.init.headers) {
                            n.init = R(n.init);
                            var e = [];
                            n.init.headers instanceof Headers ? n.init.headers.forEach((function(t, n) {
                                e.push([n, t]);
                            }
                            )) : L(n.init.headers) ? A(n.init.headers, (function(t) {
                                e.push(t);
                            }
                            )) : n.init.headers && A(n.init.headers, (function(t, n) {
                                e.push([n, t]);
                            }
                            ));
                            var r = {};
                            A(e.concat($(t)), (function(t) {
                                r[t[0]] = t[1];
                            }
                            )),
                            n.init.headers = r;
                        } else
                            n.input = new Request(n.input),
                            A(t, (function(t, e) {
                                n.input.headers.append(e, t);
                            }
                            ));
                    }
                    ));
                },
                traceXhr: function(n, r) {
                    return qs(t, n, e, (function(t) {
                        A(t, (function(t, e) {
                            r.setRequestHeader(e, t);
                        }
                        ));
                    }
                    ));
                }
            };
        }(e, n);
        !function(t, e, n) {
            var r = Cr().subscribe((function(r) {
                var i = r;
                if (Oo(e, i.url))
                    switch (i.state) {
                        case "start":
                            n.traceXhr(i, i.xhr),
                            i.requestIndex = Xs(),
                            t.notify(pn.REQUEST_STARTED, {
                                requestIndex: i.requestIndex,
                                url: i.url
                            });
                            break;
                        case "complete":
                            n.clearTracingIfNeeded(i),
                            t.notify(pn.REQUEST_COMPLETED, {
                                duration: i.duration,
                                method: i.method,
                                requestIndex: i.requestIndex,
                                spanId: i.spanId,
                                startClocks: i.startClocks,
                                status: i.status,
                                traceId: i.traceId,
                                traceSampled: i.traceSampled,
                                type: fe.XHR,
                                url: i.url,
                                xhr: i.xhr,
                                isAborted: i.isAborted,
                                handlingStack: i.handlingStack
                            });
                    }
            }
            ));
        }(t, e, r),
        function(t, e, n) {
            var r = Sr().subscribe((function(r) {
                var i = r;
                if (Oo(e, i.url))
                    switch (i.state) {
                        case "start":
                            n.traceFetch(i),
                            i.requestIndex = Xs(),
                            t.notify(pn.REQUEST_STARTED, {
                                requestIndex: i.requestIndex,
                                url: i.url
                            });
                            break;
                        case "resolve":
                            !function(t, e) {
                                var n = t.response && function(t) {
                                    try {
                                        return t.clone();
                                    } catch (t) {
                                        return;
                                    }
                                }(t.response);
                                n && n.body ? function(t, e, n) {
                                    var r = t.getReader()
                                        , i = []
                                        , o = 0;
                                    function a() {
                                        var t, a;
                                        if (r.cancel().catch(st),
                                        n.collectStreamBody) {
                                            var s;
                                            if (1 === i.length)
                                                s = i[0];
                                            else {
                                                s = new Uint8Array(o);
                                                var u = 0;
                                                A(i, (function(t) {
                                                    s.set(t, u),
                                                    u += t.length;
                                                }
                                                ));
                                            }
                                            t = s.slice(0, n.bytesLimit),
                                            a = s.length > n.bytesLimit;
                                        }
                                        e(void 0, t, a);
                                    }
                                    !function t() {
                                        r.read().then(c((function(e) {
                                            e.done ? a() : (n.collectStreamBody && i.push(e.value),
                                            (o += e.value.length) > n.bytesLimit ? a() : t());
                                        }
                                        )), c((function(t) {
                                            e(t);
                                        }
                                        )));
                                    }();
                                }(n.body, (function() {
                                    e(St(t.startClocks.timeStamp, Et()));
                                }
                                ), {
                                    bytesLimit: Number.POSITIVE_INFINITY,
                                    collectStreamBody: !1
                                }) : e(St(t.startClocks.timeStamp, Et()));
                            }(i, (function(e) {
                                n.clearTracingIfNeeded(i),
                                t.notify(pn.REQUEST_COMPLETED, {
                                    duration: e,
                                    method: i.method,
                                    requestIndex: i.requestIndex,
                                    responseType: i.responseType,
                                    spanId: i.spanId,
                                    startClocks: i.startClocks,
                                    status: i.status,
                                    traceId: i.traceId,
                                    traceSampled: i.traceSampled,
                                    type: fe.FETCH,
                                    url: i.url,
                                    response: i.response,
                                    init: i.init,
                                    input: i.input,
                                    isAborted: i.isAborted,
                                    handlingStack: i.handlingStack
                                });
                            }
                            ));
                    }
            }
            ));
        }(t, e, r);
    }
    function Xs() {
        var t = Zs;
        return Zs += 1,
        t;
    }
    var Qs = new Ji;
    function Js(t) {
        if (performance && "getEntriesByName"in performance) {
            var e = performance.getEntriesByName(t.url, "resource");
            if (e.length && "toJSON"in e[0]) {
                var n = V(e, (function(t) {
                    return !Qs.has(t);
                }
                ));
                n = V(n, (function(t) {
                    return wo(t) && So(t);
                }
                )),
                n = V(n, (function(e) {
                    return n = e,
                    r = t.startClocks.relative,
                    i = tu({
                        startTime: t.startClocks.relative,
                        duration: t.duration
                    }),
                    o = 1,
                    n.startTime >= r - o && tu(n) <= It(i, o);
                    var n, r, i, o;
                }
                ));
                var r = void 0;
                if (n.length > 1) {
                    var i = Number.MAX_SAFE_INTEGER;
                    n.forEach((function(e) {
                        var n = Math.abs(e.startTime - t.startClocks.relative);
                        n < i && (i = n,
                        r = e);
                    }
                    ));
                } else
                    1 === n.length && (r = n[0]);
                return r ? (Qs.add(r),
                r.toJSON()) : void 0;
            }
        }
    }
    function tu(t) {
        return It(t.startTime, t.duration);
    }
    function eu(t, e) {
        Pr("interactive", (function() {
            var t = x(fs().toJSON(), {
                entryType: Do.RESOURCE,
                initiatorType: fo,
                toJSON: function() {
                    return x({}, t, {
                        toJSON: void 0
                    });
                }
            });
            e(t);
        }
        ));
    }
    function nu(t, e, n, r, i) {
        void 0 === r && (r = function() {
            var t = [];
            function e(e) {
                var r;
                if (e.didTimeout) {
                    var i = performance.now();
                    r = function() {
                        return Ln - (performance.now() - i);
                    };
                } else
                    r = e.timeRemaining.bind(e);
                for (; r() > 0 && t.length; )
                    t.shift()();
                t.length && n();
            }
            function n() {
                Rn(e, {
                    timeout: Nn
                });
            }
            return {
                push: function(e) {
                    1 === t.push(e) && n();
                }
            };
        }()),
        void 0 === i && (i = eu),
        t.subscribe(pn.REQUEST_COMPLETED, (function(t) {
            a((function() {
                return function(t, e) {
                    var n = Js(t)
                        , r = n ? Ct(n.startTime) : t.startClocks
                        , i = function(t) {
                            var e = t.traceSampled && t.traceId && t.spanId;
                            if (!e)
                                return;
                            return {
                                _gc: {
                                    spanId: t.spanId,
                                    traceId: t.traceId
                                },
                                resource: {
                                    id: Q()
                                }
                            };
                        }(t)
                        , o = t.type === fe.XHR ? oe.XHR : oe.FETCH
                        , a = n ? iu(n) : void 0
                        , s = function(t, e, n) {
                            return t.wasInPageStateDuringPeriod(Na.FROZEN, e.relative, n) ? void 0 : _t(n);
                        }(e, r, t.duration)
                        , u = tt(t.url).getParse()
                        , c = N({
                            date: r.timeStamp,
                            resource: {
                                id: Q(),
                                type: o,
                                duration: s,
                                method: t.method,
                                status: t.status,
                                statusGroup: at(t.status),
                                url: Ro(t.url) ? ko(t.url) : t.url,
                                urlHost: u.Host,
                                urlPath: u.Path,
                                urlPathGroup: J(u.Path),
                                urlQuery: et(t.url),
                                deliveryType: n && _o(n),
                                protocol: n && go(n)
                            },
                            type: ue.RESOURCE
                        }, i, a);
                    return {
                        startTime: r.relative,
                        rawRumEvent: c,
                        domainContext: {
                            performanceEntry: n,
                            xhr: t.xhr,
                            response: t.response,
                            requestInput: t.input,
                            requestInit: t.init,
                            error: t.error,
                            isAborted: t.isAborted,
                            handlingStack: t.handlingStack
                        }
                    };
                }(t, n);
            }
            ));
        }
        ));
        var o = Po(e, {
            type: Do.RESOURCE,
            buffered: !0
        }).subscribe((function(t) {
            for (var n = function(t) {
                    (function(t) {
                        return "xmlhttprequest" === t.initiatorType || "fetch" === t.initiatorType;
                    }
                    )(t) || yo(t.name, e.resourceUrlLimit) || a((function() {
                        return ru(t, e);
                    }
                    ));
                }, r = 0, i = t; r < i.length; r++) {
                n(i[r]);
            }
        }
        ));
        function a(e) {
            r.push((function() {
                var n = e();
                n && t.notify(pn.RAW_RUM_EVENT_COLLECTED, n);
            }
            ));
        }
        return i(e, (function(t) {
            a((function() {
                return ru(t, e);
            }
            ));
        }
        )),
        {
            stop: function() {
                o.unsubscribe();
            }
        };
    }
    function ru(t, e) {
        var n, r = Ct(t.startTime), i = function(t) {
                return t.traceId ? {
                    _gc: {
                        traceId: t.traceId
                    }
                } : void 0;
            }(t), o = vo(t), a = iu(t), s = tt(t.name).getParse(), u = N({
                date: r.timeStamp,
                resource: {
                    id: Q(),
                    type: o,
                    url: t.name,
                    urlHost: s.Host,
                    urlPath: s.Path,
                    urlPathGroup: J(s.Path),
                    urlQuery: et(t.name),
                    method: "GET",
                    status: (n = t.responseStatus,
                    0 === n ? void 0 : n),
                    statusGroup: at(t.responseStatus),
                    deliveryType: _o(t),
                    protocol: go(t)
                },
                type: ue.RESOURCE
            }, i, a);
        return {
            startTime: r.relative,
            rawRumEvent: u,
            domainContext: {
                performanceEntry: t
            }
        };
    }
    function iu(t) {
        return {
            resource: N({}, {
                duration: bo(t)
            }, Io(t), Eo(t))
        };
    }
    var ou = {
        sdkVersion: "3.2.16",
        sdkName: "df_web_rum_sdk"
    };
    function au(t) {
        if (t.applicationId) {
            var e = function(t) {
                return t.site || t.datakitOrigin || t.datakitUrl ? !(t.site && !t.clientToken && (o.error("clientToken is not configured, no RUM data will be collected."),
                1)) : (o.error("datakitOrigin or site is not configured, no RUM data will be collected."),
                !1);
            }(t);
            if (e)
                if (void 0 === t.sessionReplaySampleRate || Mt(t.sessionReplaySampleRate)) {
                    var n = function(t) {
                        void 0 !== t.allowedTracingUrls && void 0 !== t.allowedTracingOrigins && o.warn("Both allowedTracingUrls and allowedTracingOrigins (deprecated) have been defined. The parameter allowedTracingUrls will override allowedTracingOrigins.");
                        if (void 0 !== t.allowedTracingUrls) {
                            if (!L(t.allowedTracingUrls))
                                return void o.error("Allowed Tracing URLs should be an array");
                            var e = [];
                            return A(t.allowedTracingUrls, (function(n) {
                                var r;
                                Nt(n) ? e.push({
                                    match: n,
                                    traceType: Wt(t.traceType, de.DDTRACE)
                                }) : "object" === rt(r = n) && Nt(r.match) && K(r.traceType) ? e.push(n) : o.warn("Allowed Tracing Urls parameters should be a string, RegExp, function, or an object. Ignoring parameter", n);
                            }
                            )),
                            e;
                        }
                        if (void 0 !== t.allowedTracingOrigins) {
                            if (!L(t.allowedTracingOrigins))
                                return void o.error("Allowed Tracing Origins should be an array");
                            e = [];
                            return A(t.allowedTracingOrigins, (function(n) {
                                var r = su(n, Wt(t.traceType, de.DDTRACE));
                                r && e.push(r);
                            }
                            )),
                            e;
                        }
                        if (void 0 !== t.allowedDDTracingOrigins) {
                            if (!L(t.allowedDDTracingOrigins))
                                return void o.error("Allowed Tracing Origins should be an array");
                            e = [];
                            return A(t.allowedDDTracingOrigins, (function(n) {
                                var r = su(n, Wt(t.traceType, de.DDTRACE));
                                r && e.push(r);
                            }
                            )),
                            e;
                        }
                        return [];
                    }(t);
                    if (n)
                        if (void 0 === t.tracingSampleRate || Mt(t.tracingSampleRate))
                            if (void 0 === t.excludedActivityUrls || L(t.excludedActivityUrls)) {
                                var r = wr(t);
                                if (r) {
                                    var i, a, s = !!Wt(t.trackUserInteractions, t.trackInteractions);
                                    return x({
                                        applicationId: t.applicationId,
                                        actionNameAttribute: t.actionNameAttribute,
                                        sessionReplaySampleRate: Wt(t.sessionReplaySampleRate, 100),
                                        tracingSampleRate: t.tracingSampleRate,
                                        allowedTracingUrls: n,
                                        injectTraceHeader: t.injectTraceHeader && d(t.injectTraceHeader, "injectTraceHeader threw an error:"),
                                        generateTraceId: t.generateTraceId && d(t.generateTraceId, "generateTraceId threw an error:"),
                                        excludedActivityUrls: Wt(t.excludedActivityUrls, []),
                                        workerUrl: t.workerUrl,
                                        compressIntakeRequests: !!t.compressIntakeRequests,
                                        trackUserInteractions: s,
                                        enableLongAnimationFrame: !!t.enableLongAnimationFrame,
                                        trackViewsManually: !!t.trackViewsManually,
                                        traceType: Wt(t.traceType, de.DDTRACE),
                                        traceId128Bit: !!t.traceId128Bit,
                                        defaultPrivacyLevel: (i = Er,
                                        a = t.defaultPrivacyLevel,
                                        z(U(i), (function(t) {
                                            return i[t] === a;
                                        }
                                        )) ? t.defaultPrivacyLevel : Er.MASK_USER_INPUT)
                                    }, r, ou);
                                }
                            } else
                                o.error("Excluded Activity Urls should be an array");
                        else
                            o.error("Tracing Sample Rate should be a number between 0 and 100");
                } else
                    o.error("Premium Sample Rate should be a number between 0 and 100");
        } else
            o.error("Application ID is not configured, no RUM data will be collected.");
    }
    function su(t, e) {
        var n;
        if ("string" == typeof t ? n = t : t instanceof RegExp ? n = function(e) {
            return t.test(In(e));
        }
            : "function" == typeof t && (n = function(e) {
                return t(In(e));
            }
            ),
        void 0 !== n)
            return {
                match: n,
                traceType: e
            };
        o.warn("Allowed Tracing Origins parameters should be a string, RegExp or function. Ignoring parameter", t);
    }
    function uu(t, e, n) {
        var r, i, a, s, u = t.ignoreInitIfSyntheticsWillInjectRum, c = t.startDeflateWorker, l = Yt();
        function f() {
            if (a && s) {
                var t;
                if (s.trackViewsManually) {
                    if (!r)
                        return;
                    l.remove(r.callback),
                    t = r.options;
                }
                var e = n(s, i, t);
                l.drain(e);
            }
        }
        function d(t) {
            var e = Ri();
            if (e && (t = function(t) {
                return x({}, t, {
                    applicationId: "00000000-aaaa-0000-aaaa-000000000000",
                    sessionSampleRate: 100
                });
            }(t)),
            a = t,
            function(t) {
                ci({
                    type: ii.configuration,
                    configuration: t
                });
            }(ot(t)),
            s)
                to("DATAFLUX_RUM", t);
            else {
                var n = au(t);
                n && (e || n.sessionStoreStrategyType ? (!n.compressIntakeRequests || n.sendContentTypeByJson || e || !c || (i = c(n, "RUM", st))) && (s = n,
                Sr().subscribe(st),
                f()) : o.warn("No storage available for session. We will not send any data."));
            }
        }
        return {
            init: function(t) {
                t ? (a = t,
                u && Boolean(window._GUANCE_SYNTHETICS_INJECTS_RUM || Hn(ki)) || d(t)) : o.error("Missing configuration");
            },
            getInitConfiguration: function() {
                return a;
            },
            getInternalContext: st,
            stopSession: st,
            addTiming: function(t, e) {
                void 0 === e && (e = Et()),
                l.add((function(n) {
                    n.addTiming(t, e);
                }
                ));
            },
            startView: function(t, e) {
                void 0 === e && (e = bt());
                var n = function(n) {
                    n.startView(t, e);
                };
                l.add(n),
                r || (r = {
                    options: t,
                    callback: n
                },
                f());
            },
            setViewName: function(t) {
                l.add((function(e) {
                    return e.setViewName(t);
                }
                ));
            },
            setViewContext: function(t) {
                l.add((function(e) {
                    return e.setViewContext(t);
                }
                ));
            },
            setViewContextProperty: function(t, e) {
                l.add((function(n) {
                    return n.setViewContextProperty(t, e);
                }
                ));
            },
            getViewContext: function() {},
            addAction: function(t, n) {
                void 0 === n && (n = e()),
                l.add((function(e) {
                    e.addAction(t, n);
                }
                ));
            },
            addError: function(t, n) {
                void 0 === n && (n = e()),
                l.add((function(e) {
                    e.addError(t, n);
                }
                ));
            }
        };
    }
    var cu = {
            FullSnapshot: 2,
            IncrementalSnapshot: 3,
            Meta: 4,
            Focus: 6,
            ViewEnd: 7,
            VisualViewport: 8,
            FrustrationRecord: 9
        }
        , lu = {
            Document: 0,
            DocumentType: 1,
            Element: 2,
            Text: 3,
            CDATA: 4,
            DocumentFragment: 11
        }
        , fu = {
            Mutation: 0,
            MouseMove: 1,
            MouseInteraction: 2,
            Scroll: 3,
            ViewportResize: 4,
            Input: 5,
            TouchMove: 6,
            MediaInteraction: 7,
            StyleSheetRule: 8
        }
        , du = {
            MouseUp: 0,
            MouseDown: 1,
            Click: 2,
            ContextMenu: 3,
            DblClick: 4,
            Focus: 5,
            Blur: 6,
            TouchStart: 7,
            TouchEnd: 9
        }
        , pu = {
            Play: 0,
            Pause: 1
        }
        , vu = {
            IGNORE: "ignore",
            HIDDEN: "hidden",
            ALLOW: Er.ALLOW,
            MASK: Er.MASK,
            MASK_USER_INPUT: Er.MASK_USER_INPUT
        }
        , hu = "data-gc-privacy"
        , _u = "allow"
        , gu = "mask"
        , mu = "mask-user-input"
        , yu = "hidden"
        , bu = "gc-privacy-allow"
        , Eu = "gc-privacy-mask"
        , wu = "gc-privacy-mask-user-input"
        , Su = "gc-privacy-hidden"
        , Tu = "***"
        , Cu = "data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
        , Iu = {
            INPUT: !0,
            OUTPUT: !0,
            TEXTAREA: !0,
            SELECT: !0,
            OPTION: !0,
            DATALIST: !0,
            OPTGROUP: !0
        };
    function Ou(t, e, n) {
        if (n && n.has(t))
            return n.get(t);
        var r = Dr(t)
            , i = r ? Ou(r, e) : e
            , o = Au(xu(t), i);
        return n && n.set(t, o),
        o;
    }
    function Au(t, e) {
        switch (e) {
            case vu.HIDDEN:
            case vu.IGNORE:
                return e;
        }
        switch (t) {
            case vu.ALLOW:
            case vu.MASK:
            case vu.MASK_USER_INPUT:
            case vu.HIDDEN:
            case vu.IGNORE:
                return t;
            default:
                return e;
        }
    }
    function xu(t) {
        if (Rr(t)) {
            var e = t.getAttribute(hu);
            if ("BASE" === t.tagName)
                return vu.ALLOW;
            if ("INPUT" === t.tagName) {
                var n = t;
                if ("password" === n.type || "email" === n.type || "tel" === n.type)
                    return vu.MASK;
                if ("hidden" === n.type)
                    return vu.MASK;
                var r = n.getAttribute("autocomplete");
                if (r && 0 === r.indexOf("cc-"))
                    return vu.MASK;
            }
            return e === yu || t.classList.contains(Su) ? vu.HIDDEN : e === gu || t.classList.contains(Eu) ? vu.MASK : e === mu || t.classList.contains(wu) ? vu.MASK_USER_INPUT : e === _u || t.classList.contains(bu) ? vu.ALLOW : function(t) {
                if ("SCRIPT" === t.nodeName)
                    return !0;
                if ("LINK" === t.nodeName) {
                    var e = i("rel");
                    return /preload|prefetch/i.test(e) && "script" === i("as") || "shortcut icon" === e || "icon" === e;
                }
                if ("META" === t.nodeName) {
                    var n = i("name")
                        , r = (e = i("rel"),
                        i("property"));
                    return /^msapplication-tile(image|color)$/.test(n) || "application-name" === n || "icon" === e || "apple-touch-icon" === e || "shortcut icon" === e || "keywords" === n || "description" === n || /^(og|twitter|fb):/.test(r) || /^(og|twitter):/.test(n) || "pinterest" === n || "robots" === n || "googlebot" === n || "bingbot" === n || t.hasAttribute("http-equiv") || "author" === n || "generator" === n || "framework" === n || "publisher" === n || "progid" === n || /^article:/.test(r) || /^product:/.test(r) || "google-site-verification" === n || "yandex-verification" === n || "csrf-token" === n || "p:domain_verify" === n || "verify-v1" === n || "verification" === n || "shopify-checkout-api-token" === n;
                }
                function i(e) {
                    return (t.getAttribute(e) || "").toLowerCase();
                }
                return !1;
            }(t) ? vu.IGNORE : void 0;
        }
    }
    function Ru(t, e) {
        switch (e) {
            case vu.MASK:
            case vu.HIDDEN:
            case vu.IGNORE:
                return !0;
            case vu.MASK_USER_INPUT:
                return function(t) {
                    return t.nodeType === Node.TEXT_NODE;
                }(t) ? ku(t.parentNode) : ku(t);
            default:
                return !1;
        }
    }
    function ku(t) {
        if (!t || t.nodeType !== t.ELEMENT_NODE)
            return !1;
        var e = t;
        if ("INPUT" === e.tagName)
            switch (e.type) {
                case "button":
                case "color":
                case "reset":
                case "submit":
                    return !1;
            }
        return !!Iu[e.tagName];
    }
    var Nu = function(t) {
        return t.replace(/\S/g, "x");
    };
    function Lu(t, e, n) {
        var r = t.parentElement && t.parentElement.tagName
            , i = t.textContent || "";
        if (!e || i.trim()) {
            var o = n;
            if ("SCRIPT" === r)
                i = Tu;
            else if (o === vu.HIDDEN)
                i = Tu;
            else if (Ru(t, o))
                if ("DATALIST" === r || "SELECT" === r || "OPTGROUP" === r) {
                    if (!i.trim())
                        return;
                } else
                    i = "OPTION" === r ? Tu : Nu(i);
            return i;
        }
    }
    var Du = new WeakMap;
    function Pu(t) {
        return Du.has(t);
    }
    function Mu(t) {
        return Du.get(t);
    }
    function Uu(t, e) {
        var n = t.tagName
            , r = t.value;
        if (Ru(t, e)) {
            var i = t.type;
            if ("INPUT" === n && ("button" === i || "submit" === i || "reset" === i || "range" === i))
                return r;
            if (!r || "OPTION" === n)
                return;
            return Tu;
        }
        return "OPTION" === n || "SELECT" === n ? t.value : "INPUT" === n || "TEXTAREA" === n ? r : void 0;
    }
    var Vu = /url\((?:(')([^']*)'|(")([^"]*)"|([^)]*))\)/gm
        , Bu = /^[A-Za-z]+:|^\/\//
        , zu = /^data:.*,/i;
    function Hu(t, e) {
        return t.replace(Vu, (function(t, n, r, i, o, a) {
            var s = r || o || a;
            if (!e || !s || Bu.test(s) || zu.test(s))
                return t;
            var u = n || i || "";
            return "/" === s[0] ? "url(".concat(u).concat(function(t) {
                return (t.indexOf("//") > -1 ? t.split("/").slice(0, 3).join("/") : t.split("/")[0]).split("?")[0];
            }(e) + s).concat(u, ")") : "url(".concat(u).concat(function(t, e) {
                try {
                    return On(t, e).href;
                } catch (e) {
                    return t;
                }
            }(s, e)).concat(u, ")");
        }
        ));
    }
    function Fu(t) {
        if (!t)
            return null;
        var e, n;
        try {
            e = t.rules || t.cssRules;
        } catch (t) {}
        return e ? Hu(((n = Array.from(e, Bt() === Vt.SAFARI ? ju : Wu).join("")).includes(" background-clip: text;") && !n.includes(" -webkit-background-clip: text;") && (n = n.replace(" background-clip: text;", " -webkit-background-clip: text; background-clip: text;")),
        n), t.href) : null;
    }
    function Wu(t) {
        return function(t) {
            return "styleSheet"in t;
        }(t) && Fu(t.styleSheet) || t.cssText;
    }
    function ju(t) {
        if (function(t) {
            return "selectorText"in t;
        }(t) && t.selectorText.includes(":")) {
            return t.cssText.replace(/(\[[\w-]+[^\\])(:[^\]]+\])/g, "$1\\$2");
        }
        return Wu(t);
    }
    function Gu(t) {
        if (void 0 !== t && 0 !== t.length)
            return t.map((function(t) {
                var e = t.cssRules || t.rules;
                return {
                    cssRules: Array.from(e, (function(t) {
                        return t.cssText;
                    }
                    )),
                    disabled: t.disabled || void 0,
                    media: t.media.length > 0 ? Array.from(t.media) : void 0
                };
            }
            ));
    }
    function $u(t, e) {
        if (!e || "" === e.trim())
            return e;
        var n = t.createElement("a");
        return n.href = e,
        n.href;
    }
    var Ku = /^[^ \t\n\r\u000c]+/
        , qu = /^[, \t\n\r\u000c]+/;
    var Zu = {
        INITIAL_FULL_SNAPSHOT: 0,
        SUBSEQUENT_FULL_SNAPSHOT: 1,
        MUTATION: 2
    };
    function Yu(t, e, n) {
        return Xu(t, {
            serializationContext: n,
            parentNodePrivacyLevel: e.defaultPrivacyLevel,
            configuration: e
        });
    }
    function Xu(t, e) {
        var n = function(t, e) {
            switch (t.nodeType) {
                case t.DOCUMENT_NODE:
                    return function(t, e) {
                        return {
                            type: lu.Document,
                            childNodes: Qu(t, e),
                            adoptedStyleSheets: Gu(t.adoptedStyleSheets)
                        };
                    }(t, e);
                case t.DOCUMENT_FRAGMENT_NODE:
                    return function(t, e) {
                        var n = Nr(t);
                        n && e.serializationContext.shadowRootsController.addShadowRoot(t);
                        return {
                            type: lu.DocumentFragment,
                            childNodes: Qu(t, e),
                            isShadowRoot: n,
                            adoptedStyleSheets: n ? Gu(t.adoptedStyleSheets) : void 0
                        };
                    }(t, e);
                case t.DOCUMENT_TYPE_NODE:
                    return n = t,
                    {
                        type: lu.DocumentType,
                        name: n.name,
                        publicId: n.publicId,
                        systemId: n.systemId
                    };
                case t.ELEMENT_NODE:
                    return function(t, e) {
                        var n = nc(t.tagName)
                            , r = (o = t,
                            "svg" === o.tagName || o instanceof SVGElement || void 0)
                            , i = Au(xu(t), e.parentNodePrivacyLevel);
                        var o;
                        if (i === vu.HIDDEN) {
                            var a = t.getBoundingClientRect()
                                , s = a.width
                                , u = a.height;
                            return {
                                type: lu.Element,
                                tagName: n,
                                attributes: Za({
                                    rr_width: s + "px",
                                    rr_height: u + "px"
                                }, hu, yu),
                                childNodes: [],
                                isSVG: r
                            };
                        }
                        if (i === vu.IGNORE)
                            return;
                        var c = function(t, e, n) {
                                if (e === vu.HIDDEN)
                                    return {};
                                for (var r = {}, i = nc(t.tagName), o = t.ownerDocument, a = 0; a < t.attributes.length; a += 1) {
                                    var s = t.attributes.item(a).name
                                        , u = Ju(t, e, s, n.configuration);
                                    null !== u && (r[s] = rc(o, i, s, u));
                                }
                                if (t.value && ("textarea" === i || "select" === i || "option" === i || "input" === i)) {
                                    var c = Uu(t, e);
                                    void 0 !== c && (r.value = c);
                                }
                                if ("option" === i && e === vu.ALLOW) {
                                    var l = t;
                                    l.selected && (r.selected = l.selected);
                                }
                                if ("link" === i) {
                                    var f = Array.from(o.styleSheets).find((function(e) {
                                        return e.href === t.href;
                                    }
                                    ));
                                    (d = Fu(f)) && f && (r._cssText = d);
                                }
                                if ("style" === i && t.sheet) {
                                    var d;
                                    (d = Fu(t.sheet)) && (r._cssText = d);
                                }
                                var p, v, h = t;
                                "input" !== i || "radio" !== h.type && "checkbox" !== h.type || (e === vu.ALLOW ? r.checked = !!h.checked : Ru(h, e) && delete r.checked);
                                if ("audio" === i || "video" === i) {
                                    var _ = t;
                                    r.rr_mediaState = _.paused ? "paused" : "played";
                                }
                                var g = n.serializationContext;
                                switch (g.status) {
                                    case Zu.INITIAL_FULL_SNAPSHOT:
                                        p = Math.round(t.scrollTop),
                                        v = Math.round(t.scrollLeft),
                                        (p || v) && g.elementsScrollPositions.set(t, {
                                            scrollTop: p,
                                            scrollLeft: v
                                        });
                                        break;
                                    case Zu.SUBSEQUENT_FULL_SNAPSHOT:
                                        if (g.elementsScrollPositions.has(t)) {
                                            var m = g.elementsScrollPositions.get(t);
                                            p = m.scrollTop,
                                            v = m.scrollLeft;
                                        }
                                }
                                v && (r.rr_scrollLeft = v);
                                p && (r.rr_scrollTop = p);
                                return r;
                            }(t, i, e)
                            , l = [];
                        if (function(t) {
                            return t.childNodes.length > 0 || kr(t);
                        }(t) && "style" !== n) {
                            l = Qu(t, e.parentNodePrivacyLevel === i && e.ignoreWhiteSpace === ("head" === n) ? e : x({}, e, {
                                parentNodePrivacyLevel: i,
                                ignoreWhiteSpace: "head" === n
                            }));
                        }
                        return {
                            type: lu.Element,
                            tagName: n,
                            attributes: c,
                            childNodes: l,
                            isSVG: r
                        };
                    }(t, e);
                case t.TEXT_NODE:
                    return function(t, e) {
                        var n = Lu(t, e.ignoreWhiteSpace || !1, e.parentNodePrivacyLevel);
                        if (void 0 === n)
                            return;
                        return {
                            type: lu.Text,
                            textContent: n
                        };
                    }(t, e);
                case t.CDATA_SECTION_NODE:
                    return {
                        type: lu.CDATA,
                        textContent: ""
                    };
            }
            var n;
        }(t, e);
        if (!n)
            return null;
        var r = Mu(t) || tc++
            , i = n;
        return i.id = r,
        function(t, e) {
            Du.set(t, e);
        }(t, r),
        e.serializedNodeIds && e.serializedNodeIds.add(r),
        i;
    }
    function Qu(t, e) {
        var n = [];
        return Lr(t, (function(t) {
            var r = Xu(t, e);
            r && n.push(r);
        }
        )),
        n;
    }
    function Ju(t, e, n, r) {
        if (e === vu.HIDDEN)
            return null;
        var i = t.getAttribute(n);
        if (e === vu.MASK && n !== hu && !oa.includes(n) && n !== r.actionNameAttribute) {
            var o = t.tagName;
            switch (n) {
                case "title":
                case "alt":
                case "placeholder":
                    return Tu;
            }
            if ("IMG" === o || "SOURCE" === o) {
                if ("src" === n || "srcset" === n)
                    return Cu;
                if ("onerror" === n)
                    return null;
            }
            if ("A" === o && "href" === n)
                return Tu;
            if (i && jt(n, "data-"))
                return Tu;
            if ("IFRAME" === o && "srcdoc" === n)
                return Tu;
        }
        return i && "string" == typeof i && Ro(i) ? ko(i) : i;
    }
    var tc = 1;
    var ec = /[^a-z1-6-_]/;
    function nc(t) {
        var e = (t + "").toLowerCase().trim();
        return ec.test(e) ? "div" : e;
    }
    function rc(t, e, n, r) {
        return r ? "src" === n || "href" === n && ("use" !== e || "#" !== r[0]) || "xlink:href" === n && "#" !== r[0] ? $u(t, r) : "background" !== n || !r || "table" !== e && "td" !== e && "th" !== e ? "srcset" === n ? function(t, e) {
            if ("" === e.trim())
                return e;
            var n = 0;
            function r(t) {
                var r, i = t.exec(e.substring(n));
                return i ? (r = i[0],
                n += r.length,
                r) : "";
            }
            for (var i = []; r(qu),
            !(n >= e.length); ) {
                var o = r(Ku);
                if ("," === o.slice(-1))
                    o = $u(t, o.substring(0, o.length - 1)),
                    i.push(o);
                else {
                    var a = "";
                    o = $u(t, o);
                    for (var s = !1; ; ) {
                        var u = e.charAt(n);
                        if ("" === u) {
                            i.push((o + a).trim());
                            break;
                        }
                        if (s)
                            ")" === u && (s = !1);
                        else {
                            if ("," === u) {
                                n += 1,
                                i.push((o + a).trim());
                                break;
                            }
                            "(" === u && (s = !0);
                        }
                        a += u,
                        n += 1;
                    }
                }
            }
            return i.join(", ");
        }(t, r) : "style" === n ? Hu(r, ((i = document.createElement("a")).href = "",
        i.href)) : "object" === e && "data" === n ? $u(t, r) : r : $u(t, r) : r;
        var i;
    }
    function ic(t) {
        return Boolean(t.changedTouches);
    }
    function oc(t, e) {
        return {
            data: x({
                source: t
            }, e),
            type: cu.IncrementalSnapshot,
            timestamp: Et()
        };
    }
    function ac(t) {
        for (var e = [], n = t; n.parentRule; ) {
            var r = Array.from(n.parentRule.cssRules).indexOf(n);
            e.unshift(r),
            n = n.parentRule;
        }
        if (n.parentStyleSheet) {
            r = Array.from(n.parentStyleSheet.cssRules).indexOf(n);
            return e.unshift(r),
            e;
        }
    }
    var sc = 100
        , uc = 16;
    function cc(t, e, n, r) {
        var i = co();
        if (!i)
            return {
                stop: st,
                flush: st
            };
        var o = function(t) {
                var e = st
                    , n = [];
                function r() {
                    e(),
                    t(n),
                    n = [];
                }
                var i = Y(r, uc, {
                        leading: !1
                    })
                    , o = i.throttled
                    , a = i.cancel;
                return {
                    addMutations: function(t) {
                        0 === n.length && (e = Rn(o, {
                            timeout: sc
                        })),
                        Array.prototype.push.apply(n, t);
                    },
                    flush: r,
                    stop: function() {
                        e(),
                        a();
                    }
                };
            }((function(r) {
                !function(t, e, n, r) {
                    var i = new Map;
                    t.filter((function(t) {
                        return "childList" === t.type;
                    }
                    )).forEach((function(t) {
                        t.removedNodes.forEach((function(t) {
                            lc(t, r.removeShadowRoot);
                        }
                        ));
                    }
                    ));
                    var o = t.filter((function(t) {
                            return t.target.isConnected && function(t) {
                                for (var e = t; e; ) {
                                    if (!Pu(e) && !Nr(e))
                                        return !1;
                                    e = Dr(e);
                                }
                                return !0;
                            }(t.target) && Ou(t.target, n.defaultPrivacyLevel, i) !== vu.HIDDEN;
                        }
                        ))
                        , a = function(t, e, n, r) {
                            for (var i = new Set, o = new Map, a = 0, s = t; a < s.length; a++) {
                                var u = s[a];
                                u.addedNodes.forEach((function(t) {
                                    i.add(t);
                                }
                                )),
                                u.removedNodes.forEach((function(t) {
                                    i.has(t) || o.set(t, u.target),
                                    i.delete(t);
                                }
                                ));
                            }
                            var c = Array.from(i);
                            l = c,
                            l.sort((function(t, e) {
                                var n = t.compareDocumentPosition(e);
                                return n & Node.DOCUMENT_POSITION_CONTAINED_BY ? -1 : n & Node.DOCUMENT_POSITION_CONTAINS || n & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : n & Node.DOCUMENT_POSITION_PRECEDING ? -1 : 0;
                            }
                            ));
                            var l;
                            for (var f = new Set, d = [], p = 0, v = c; p < v.length; p++) {
                                var h = v[p];
                                if (!b(h)) {
                                    var _ = Ou(h.parentNode, e.defaultPrivacyLevel, r);
                                    if (_ !== vu.HIDDEN && _ !== vu.IGNORE) {
                                        var g = Xu(h, {
                                            serializedNodeIds: f,
                                            parentNodePrivacyLevel: _,
                                            serializationContext: {
                                                status: Zu.MUTATION,
                                                shadowRootsController: n
                                            },
                                            configuration: e
                                        });
                                        if (g) {
                                            var m = Dr(h);
                                            d.push({
                                                nextId: E(h),
                                                parentId: Mu(m),
                                                node: g
                                            });
                                        }
                                    }
                                }
                            }
                            var y = [];
                            return o.forEach((function(t, e) {
                                Pu(e) && y.push({
                                    parentId: Mu(t),
                                    id: Mu(e)
                                });
                            }
                            )),
                            {
                                adds: d,
                                removes: y,
                                serializedNodeIds: f,
                                hasBeenSerialized: b
                            };
                            function b(t) {
                                return Pu(t) && f.has(Mu(t));
                            }
                            function E(t) {
                                for (var e = t.nextSibling; e; ) {
                                    if (Pu(e))
                                        return Mu(e);
                                    e = e.nextSibling;
                                }
                                return null;
                            }
                        }(o.filter((function(t) {
                            return "childList" === t.type;
                        }
                        )), n, r, i)
                        , s = a.adds
                        , u = a.removes
                        , c = a.serializedNodeIds;
                    function l(t) {
                        return Pu(t) && c.has(Mu(t));
                    }
                    var f = function(t, e, n) {
                            for (var r = [], i = new Set, o = t.filter((function(t) {
                                    return !i.has(t.target) && (i.add(t.target),
                                    !0);
                                }
                                )), a = 0, s = o; a < s.length; a++) {
                                var u = s[a];
                                if (u.target.textContent !== u.oldValue) {
                                    var c = Ou(Dr(u.target), e.defaultPrivacyLevel, n);
                                    c !== vu.HIDDEN && c !== vu.IGNORE && r.push({
                                        id: Mu(u.target),
                                        value: Wt(Lu(u.target, !1, c))
                                    });
                                }
                            }
                            return r;
                        }(o.filter((function(t) {
                            return "characterData" === t.type && !l(t.target);
                        }
                        )), n, i)
                        , d = function(t, e, n) {
                            for (var r = [], i = new Map, o = t.filter((function(t) {
                                    var e = i.get(t.target);
                                    return (!e || !e.has(t.attributeName)) && (e ? e.add(t.attributeName) : i.set(t.target, new Set([t.attributeName])),
                                    !0);
                                }
                                )), a = new Map, s = 0, u = o; s < u.length; s++) {
                                var c = u[s];
                                if (c.target.getAttribute(c.attributeName) !== c.oldValue) {
                                    var l, f = Ou(c.target, e.defaultPrivacyLevel, n), d = Ju(c.target, f, c.attributeName, e);
                                    if ("value" === c.attributeName) {
                                        var p = Uu(c.target, f);
                                        if (void 0 === p)
                                            continue;
                                        l = p;
                                    } else
                                        l = "string" == typeof d ? d : null;
                                    var v = a.get(c.target);
                                    v || (v = {
                                        id: Mu(c.target),
                                        attributes: {}
                                    },
                                    r.push(v),
                                    a.set(c.target, v)),
                                    v.attributes[c.attributeName] = l;
                                }
                            }
                            return r;
                        }(o.filter((function(t) {
                            return "attributes" === t.type && !l(t.target);
                        }
                        )), n, i);
                    if (!(f.length || d.length || u.length || s.length))
                        return;
                    e({
                        adds: s,
                        removes: u,
                        texts: f,
                        attributes: d
                    });
                }(r.concat(a.takeRecords()), t, e, n);
            }
            ))
            , a = new i(c(o.addMutations));
        return a.observe(r, {
            attributeOldValue: !0,
            attributes: !0,
            characterData: !0,
            characterDataOldValue: !0,
            childList: !0,
            subtree: !0
        }),
        {
            stop: function() {
                a.disconnect(),
                o.stop();
            },
            flush: function() {
                o.flush();
            }
        };
    }
    function lc(t, e) {
        kr(t) && e(t.shadowRoot),
        Lr(t, (function(t) {
            return lc(t, e);
        }
        ));
    }
    var fc, dc = function(t, e) {
            var n = window.visualViewport
                , r = {
                    layoutViewportX: t,
                    layoutViewportY: e,
                    visualViewportX: t,
                    visualViewportY: e
                };
            return n ? (!function() {
                var t = window.visualViewport;
                return Math.abs(t.pageTop - t.offsetTop - window.scrollY) > 25 || Math.abs(t.pageLeft - t.offsetLeft - window.scrollX) > 25;
            }() ? (r.visualViewportX = Math.round(t - n.offsetLeft),
                r.visualViewportY = Math.round(e - n.offsetTop)) : (r.layoutViewportX = Math.round(t + n.offsetLeft),
                r.layoutViewportY = Math.round(e + n.offsetTop)),
            r) : r;
        }, pc = function() {
            var t = window.visualViewport;
            return {
                scale: t.scale,
                offsetLeft: t.offsetLeft,
                offsetTop: t.offsetTop,
                pageLeft: t.pageLeft,
                pageTop: t.pageTop,
                height: t.height,
                width: t.width
            };
        }, vc = 50, hc = 100, _c = 200, gc = new WeakMap, mc = 1;
    function yc(t) {
        return gc.has(t) || gc.set(t, mc++),
        gc.get(t);
    }
    function bc(t) {
        var e, n, r, i, o, a, s, u, c, l = (e = t.mutationCb,
            n = t.configuration,
            r = t.shadowRootsController,
            cc(e, n, r, document)), f = function(t) {
                var e = Y((function(e) {
                        var n = Tc(e);
                        if (Pu(n)) {
                            var r = wc(e);
                            if (!r)
                                return;
                            var i = {
                                id: Mu(n),
                                timeOffset: 0,
                                x: r.x,
                                y: r.y
                            };
                            t([i], ic(e) ? fu.TouchMove : fu.MouseMove);
                        }
                    }
                    ), vc, {
                        trailing: !1
                    })
                    , n = e.cancel
                    , r = e.throttled
                    , i = an(document, [ie.MOUSE_MOVE, ie.TOUCH_MOVE], r, {
                        capture: !0,
                        passive: !0
                    }).stop;
                return function() {
                    i(),
                    n();
                };
            }(t.mousemoveCb), d = function(t, e) {
                var n = function(n) {
                    var r = Tc(n);
                    if (Ou(r, e) !== vu.HIDDEN && Pu(r)) {
                        var i, o = Mu(r), a = Ec[n.type];
                        if (a !== du.Blur && a !== du.Focus) {
                            var s = wc(n);
                            if (!s)
                                return;
                            i = {
                                id: o,
                                type: a,
                                x: s.x,
                                y: s.y
                            };
                        } else
                            i = {
                                id: o,
                                type: a
                            };
                        var u = x({
                            id: yc(n)
                        }, oc(fu.MouseInteraction, i));
                        t(u);
                    }
                };
                return an(document, Object.keys(Ec), n, {
                    capture: !0,
                    passive: !0
                }).stop;
            }(t.mouseInteractionCb, t.configuration.defaultPrivacyLevel), p = function(t, e, n) {
                var r = Y((function(r) {
                        var i = Tc(r);
                        if (i && Ou(i, e) !== vu.HIDDEN && Pu(i)) {
                            var o = Mu(i)
                                , a = i === document ? {
                                    scrollTop: Ur(),
                                    scrollLeft: Mr()
                                } : {
                                    scrollTop: Math.round(i.scrollTop),
                                    scrollLeft: Math.round(i.scrollLeft)
                                };
                            n.set(i, a),
                            t({
                                id: o,
                                x: a.scrollLeft,
                                y: a.scrollTop
                            });
                        }
                    }
                    ), hc)
                    , i = r.cancel
                    , o = r.throttled
                    , a = on(document, ie.SCROLL, o, {
                        capture: !0,
                        passive: !0
                    }).stop;
                return function() {
                    a(),
                    i();
                };
            }(t.scrollCb, t.configuration.defaultPrivacyLevel, t.elementsScrollPositions), v = function(t) {
                return os().subscribe(t).unsubscribe;
            }(t.viewportResizeCb), h = Sc(t.inputCb, t.configuration.defaultPrivacyLevel), _ = (i = t.mediaInteractionCb,
            o = t.configuration.defaultPrivacyLevel,
            a = function(t) {
                var e = Tc(t);
                e && Ou(e, o) !== vu.HIDDEN && Pu(e) && i({
                    id: Mu(e),
                    type: t.type === ie.PLAY ? pu.Play : pu.Pause
                });
            }
            ,
            an(document, [ie.PLAY, ie.PAUSE], a, {
                capture: !0,
                passive: !0
            }).stop), g = function(t) {
                function e(t, e) {
                    t && Pu(t.ownerNode) && e(Mu(t.ownerNode));
                }
                var n = [Xe(CSSStyleSheet.prototype, "insertRule", (function(n) {
                    var r = n.target
                        , i = n.parameters
                        , o = i[0]
                        , a = i[1];
                    e(r, (function(e) {
                        return t({
                            id: e,
                            adds: [{
                                rule: o,
                                index: a
                            }]
                        });
                    }
                    ));
                }
                )), Xe(CSSStyleSheet.prototype, "deleteRule", (function(n) {
                    var r = n.target
                        , i = n.parameters[0];
                    e(r, (function(e) {
                        return t({
                            id: e,
                            removes: [{
                                index: i
                            }]
                        });
                    }
                    ));
                }
                ))];
                "undefined" != typeof CSSGroupingRule ? r(CSSGroupingRule) : (r(CSSMediaRule),
                r(CSSSupportsRule));
                function r(r) {
                    n.push(Xe(r.prototype, "insertRule", (function(n) {
                        var r = n.target
                            , i = n.parameters
                            , o = i[0]
                            , a = i[1];
                        e(r.parentStyleSheet, (function(e) {
                            var n = ac(r);
                            n && (n.push(a || 0),
                            t({
                                id: e,
                                adds: [{
                                    rule: o,
                                    index: n
                                }]
                            }));
                        }
                        ));
                    }
                    )), Xe(r.prototype, "deleteRule", (function(n) {
                        var r = n.target
                            , i = n.parameters[0];
                        e(r.parentStyleSheet, (function(e) {
                            var n = ac(r);
                            n && (n.push(i),
                            t({
                                id: e,
                                removes: [{
                                    index: n
                                }]
                            }));
                        }
                        ));
                    }
                    )));
                }
                return function() {
                    n.forEach((function(t) {
                        t.stop();
                    }
                    ));
                };
            }(t.styleSheetCb), m = (s = t.focusCb,
            an(window, [ie.FOCUS, ie.BLUR], (function() {
                s({
                    has_focus: document.hasFocus()
                });
            }
            )).stop), y = function(t) {
                if (!window.visualViewport)
                    return st;
                var e = Y((function() {
                        t(pc());
                    }
                    ), _c, {
                        trailing: !1
                    })
                    , n = an(window.visualViewport, [ie.RESIZE, ie.SCROLL], e.throttled, {
                        capture: !0,
                        passive: !0
                    }).stop
                    , r = e.cancel;
                return function() {
                    n(),
                    r();
                };
            }(t.visualViewportResizeCb), b = (u = t.lifeCycle,
            c = t.frustrationCb,
            u.subscribe(pn.RAW_RUM_EVENT_COLLECTED, (function(t) {
                t.rawRumEvent.type === ue.ACTION && t.rawRumEvent.action.type === ae.CLICK && t.rawRumEvent.action.frustration && t.rawRumEvent.action.frustration.type && t.rawRumEvent.action.frustration.type.length && "events"in t.domainContext && t.domainContext.events && t.domainContext.events.length && c({
                    timestamp: t.rawRumEvent.date,
                    type: cu.FrustrationRecord,
                    data: {
                        frustrationTypes: t.rawRumEvent.action.frustration.type,
                        recordIds: t.domainContext.events.map((function(t) {
                            return yc(t);
                        }
                        ))
                    }
                });
            }
            )).unsubscribe);
        return {
            flush: function() {
                l.flush();
            },
            stop: function() {
                l.stop(),
                f(),
                d(),
                p(),
                v(),
                h(),
                _(),
                g(),
                m(),
                y(),
                b();
            }
        };
    }
    var Ec = (Za(fc = {}, ie.POINTER_UP, du.MouseUp),
    Za(fc, ie.MOUSE_DOWN, du.MouseDown),
    Za(fc, ie.CLICK, du.Click),
    Za(fc, ie.CONTEXT_MENU, du.ContextMenu),
    Za(fc, ie.DBL_CLICK, du.DblClick),
    Za(fc, ie.FOCUS, du.Focus),
    Za(fc, ie.BLUR, du.Blur),
    Za(fc, ie.TOUCH_START, du.TouchStart),
    Za(fc, ie.TOUCH_END, du.TouchEnd),
    fc);
    function wc(t) {
        var e = ic(t) ? t.changedTouches[0] : t
            , n = e.clientX
            , r = e.clientY;
        if (window.visualViewport) {
            var i = dc(n, r);
            n = i.visualViewportX,
            r = i.visualViewportY;
        }
        if (Number.isFinite(n) && Number.isFinite(r))
            return {
                x: n,
                y: r
            };
    }
    function Sc(t, e, n) {
        void 0 === n && (n = document);
        var r, i = new WeakMap, o = n !== document, a = an(n, o ? [ie.CHANGE] : [ie.INPUT, ie.CHANGE], (function(t) {
                var e = Tc(t);
                (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement) && c(e);
            }
            ), {
                capture: !0,
                passive: !0
            }), s = a.stop;
        if (o)
            r = st;
        else {
            var u = [Qe(HTMLInputElement.prototype, "value", c), Qe(HTMLInputElement.prototype, "checked", c), Qe(HTMLSelectElement.prototype, "value", c), Qe(HTMLTextAreaElement.prototype, "value", c), Qe(HTMLSelectElement.prototype, "selectedIndex", c)];
            r = function() {
                u.forEach((function(t) {
                    return t.stop();
                }
                ));
            };
        }
        return function() {
            r(),
            s();
        }
        ;
        function c(t) {
            var n = Ou(t, e);
            if (n !== vu.HIDDEN) {
                var r, i = t.type;
                if ("radio" === i || "checkbox" === i) {
                    if (Ru(t, n))
                        return;
                    r = {
                        isChecked: t.checked
                    };
                } else {
                    var o = Uu(t, n);
                    if (void 0 === o)
                        return;
                    r = {
                        text: o
                    };
                }
                l(t, r);
                var a, s, u = t.name;
                "radio" === i && u && t.checked && (a = document.querySelectorAll('input[type="radio"][name="' + W(u) + '"]'),
                s = function(e) {
                    e !== t && l(e, {
                        isChecked: !1
                    });
                }
                ,
                Array.prototype.forEach.call(a, s));
            }
        }
        function l(e, n) {
            if (Pu(e)) {
                var r = i.get(e);
                r && r.text === n.text && r.isChecked === n.isChecked || (i.set(e, n),
                t(x({
                    id: Mu(e)
                }, n)));
            }
        }
    }
    function Tc(t) {
        return !0 === t.composed && kr(t.target) ? t.composedPath()[0] : t.target;
    }
    var Cc = function(t, e) {
        var n = e.mutationCb
            , r = e.inputCb
            , i = new Map
            , o = {
                addShadowRoot: function(e) {
                    if (!i.has(e)) {
                        var a = cc(n, t, o, e)
                            , s = a.flush
                            , u = a.stop
                            , c = Sc(r, t.defaultPrivacyLevel, e);
                        i.set(e, {
                            flush: s,
                            stop: function() {
                                u(),
                                c();
                            }
                        });
                    }
                },
                removeShadowRoot: function(t) {
                    var e = i.get(t);
                    e && (e.stop(),
                    i.delete(t));
                },
                stop: function() {
                    i.forEach((function(t) {
                        t.stop();
                    }
                    ));
                },
                flush: function() {
                    i.forEach((function(t) {
                        t.flush();
                    }
                    ));
                }
            };
        return o;
    };
    function Ic(t) {
        var e = t.emit;
        if (!e)
            throw new Error("emit function is required");
        var n, r = (n = new WeakMap,
            {
                set: function(t, e) {
                    (t !== document || document.scrollingElement) && n.set(t === document ? document.scrollingElement : t, e);
                },
                get: function(t) {
                    return n.get(t);
                },
                has: function(t) {
                    return n.has(t);
                }
            }), i = function(t) {
                e(oc(fu.Mutation, t));
            }, o = function(t) {
                e(oc(fu.Input, t));
            }, a = Cc(t.configuration, {
                mutationCb: i,
                inputCb: o
            }), s = function(n, i) {
                void 0 === n && (n = Et()),
                void 0 === i && (i = {
                    status: Zu.INITIAL_FULL_SNAPSHOT,
                    elementsScrollPositions: r,
                    shadowRootsController: a
                });
                var o = as()
                    , s = o.width
                    , u = o.height;
                e({
                    data: {
                        height: u,
                        href: window.location.href,
                        width: s
                    },
                    type: cu.Meta,
                    timestamp: n
                }),
                e({
                    data: {
                        has_focus: document.hasFocus()
                    },
                    type: cu.Focus,
                    timestamp: n
                }),
                e({
                    data: {
                        node: Yu(document, t.configuration, i),
                        initialOffset: {
                            left: Mr(),
                            top: Ur()
                        }
                    },
                    type: cu.FullSnapshot,
                    timestamp: n
                }),
                window.visualViewport && e({
                    data: pc(),
                    type: cu.VisualViewport,
                    timestamp: n
                });
            };
        s();
        var u = bc({
                lifeCycle: t.lifeCycle,
                configuration: t.configuration,
                elementsScrollPositions: r,
                inputCb: o,
                mediaInteractionCb: function(t) {
                    e(oc(fu.MediaInteraction, t));
                },
                mouseInteractionCb: function(t) {
                    e(t);
                },
                mousemoveCb: function(t, n) {
                    e(oc(n, {
                        positions: t
                    }));
                },
                mutationCb: i,
                scrollCb: function(t) {
                    e(oc(fu.Scroll, t));
                },
                styleSheetCb: function(t) {
                    e(oc(fu.StyleSheetRule, t));
                },
                viewportResizeCb: function(t) {
                    e(oc(fu.ViewportResize, t));
                },
                frustrationCb: function(t) {
                    e(t);
                },
                focusCb: function(t) {
                    e({
                        data: t,
                        type: cu.Focus,
                        timestamp: Et()
                    });
                },
                visualViewportResizeCb: function(t) {
                    e({
                        data: t,
                        type: cu.VisualViewport,
                        timestamp: Et()
                    });
                },
                shadowRootsController: a
            })
            , c = u.stop
            , l = u.flush;
        function f() {
            a.flush(),
            l();
        }
        return {
            stop: function() {
                a.stop(),
                c();
            },
            takeSubsequentFullSnapshot: function(t) {
                f(),
                s(t, {
                    shadowRootsController: a,
                    status: Zu.SUBSEQUENT_FULL_SNAPSHOT,
                    elementsScrollPositions: r
                });
            },
            flushMutations: f,
            shadowRootsController: a
        };
    }
    function Oc(t, e, n) {
        var r = new FormData;
        return r.append("segment", new Blob([t],{
            type: "application/octet-stream"
        }), e.session.id + "-" + e.start),
        Ac(e, (function(t, e) {
            r.append(t, e);
        }
        )),
        r.append("raw_segment_size", n),
        {
            data: r,
            bytesCount: t.byteLength
        };
    }
    function Ac(t, e, n) {
        void 0 === n && (n = ""),
        A($(t), (function(t) {
            var r = t[1]
                , i = t[0];
            "object" === Ka(r) && null !== r ? Ac(r, e, "" + n + i + "_") : e("" + n + i, String(r));
        }
        ));
    }
    var xc, Rc = 10;
    function kc(t) {
        return Nc(t).segments_count;
    }
    function Nc(t) {
        var e;
        return xc || (xc = new Map),
        xc.has(t) ? e = xc.get(t) : (e = {
            records_count: 0,
            segments_count: 0,
            segments_total_raw_size: 0
        },
        xc.set(t, e),
        xc.size > Rc && function() {
            if (!xc)
                return;
            if (xc.keys)
                xc.delete(xc.keys().next().value);
            else {
                var t = !0;
                xc.forEach((function(e, n) {
                    t && (xc.delete(n),
                    t = !1);
                }
                ));
            }
        }()),
        e;
    }
    function Lc(t) {
        var e = t.context
            , n = t.creationReason
            , r = t.encoder
            , i = 0
            , o = e.view.id
            , a = x({
                start: 1 / 0,
                end: -1 / 0,
                creation_reason: n,
                records_count: 0,
                has_full_snapshot: !1,
                index_in_view: kc(o),
                source: "browser"
            }, e);
        return function(t) {
            Nc(t).segments_count += 1;
        }(o),
        {
            addRecord: function(t, e) {
                a.start = Math.min(a.start, t.timestamp),
                a.end = Math.max(a.end, t.timestamp),
                a.records_count += 1,
                a.has_full_snapshot || (a.has_full_snapshot = t.type === cu.FullSnapshot),
                function(t) {
                    Nc(t).records_count += 1;
                }(a.view.id);
                var n = r.isEmpty() ? '{"records":[' : ",";
                r.write(n + JSON.stringify(t), (function(t) {
                    e(i += t);
                }
                ));
            },
            flush: function(t) {
                if (r.isEmpty())
                    throw new Error("Empty segment flushed");
                r.write("]," + JSON.stringify(a).slice(1) + "\n"),
                r.finish((function(e) {
                    !function(t, e) {
                        Nc(t).segments_total_raw_size += e;
                    }(a.view.id, e.rawBytesCount),
                    t(a, e);
                }
                ));
            }
        };
    }
    var Dc = 5 * ct
        , Pc = 6e4;
    function Mc(t, e, n, r, i, o) {
        return function(t, e, n, r) {
            var i = {
                    status: Uc.WaitingForInitialRecord,
                    nextSegmentCreationReason: "init"
                }
                , o = t.subscribe(pn.VIEW_CREATED, (function() {
                    c("view_change");
                }
                ))
                , a = o.unsubscribe
                , s = t.subscribe(pn.PAGE_EXITED, (function(t) {
                    c(t.reason);
                }
                ))
                , u = s.unsubscribe;
            function c(t) {
                i.status === Uc.SegmentPending && (i.segment.flush((function(e, r) {
                    var i = Oc(r.output, e, r.rawBytesCount);
                    xr(t) ? n.sendOnExit(i) : n.send(i);
                }
                )),
                _(i.expirationTimeoutId)),
                i = "stop" !== t ? {
                    status: Uc.WaitingForInitialRecord,
                    nextSegmentCreationReason: t
                } : {
                    status: Uc.Stopped
                };
            }
            return {
                addRecord: function(t) {
                    if (i.status !== Uc.Stopped) {
                        if (i.status === Uc.WaitingForInitialRecord) {
                            var n = e();
                            if (!n)
                                return;
                            i = {
                                status: Uc.SegmentPending,
                                segment: Lc({
                                    encoder: r,
                                    context: n,
                                    creationReason: i.nextSegmentCreationReason
                                }),
                                expirationTimeoutId: h((function() {
                                    c("segment_duration_limit");
                                }
                                ), Dc)
                            };
                        }
                        i.segment.addRecord(t, (function(t) {
                            t > Pc && c("segment_bytes_limit");
                        }
                        ));
                    }
                },
                stop: function() {
                    c("stop"),
                    a(),
                    u();
                }
            };
        }(t, (function() {
            return function(t, e, n) {
                var r = e.findTrackedSession()
                    , i = n.findView();
                if (!r || !i)
                    return;
                return {
                    sdk: {
                        name: t.sdkName,
                        version: t.sdkVersion
                    },
                    env: t.env || "",
                    service: i.service || t.service || "browser",
                    version: i.version || t.version || "",
                    app: {
                        id: t.applicationId
                    },
                    session: {
                        id: r.id
                    },
                    view: {
                        id: i.id
                    }
                };
            }(e, n, r);
        }
        ), i, o);
    }
    var Uc = {
        WaitingForInitialRecord: 0,
        SegmentPending: 1,
        Stopped: 2
    };
    var Vc = 0
        , Bc = 1
        , zc = 2
        , Hc = 3;
    var Fc, Wc, jc, Gc, $c = function(t, e) {
            if (Ri() || "function" != typeof Array.from || "function" != typeof CSSSupportsRule || "function" != typeof URL.createObjectURL || !("forEach"in NodeList.prototype))
                return {
                    start: st,
                    stop: st,
                    getReplayStats: function() {},
                    onRumStart: st,
                    isRecording: function() {
                        return !1;
                    }
                };
            var n = {
                    status: Vc
                }
                , r = function() {
                    n = {
                        status: Bc
                    };
                }
                , i = function() {
                    n = {
                        status: Vc
                    };
                };
            return {
                start: function(t) {
                    r(t);
                },
                stop: function() {
                    i();
                },
                onRumStart: function(o, a, s, u, c) {
                    var l;
                    o.subscribe(pn.SESSION_EXPIRED, (function() {
                        n.status !== zc && n.status !== Hc || (i(),
                        n = {
                            status: Bc
                        });
                    }
                    )),
                    o.subscribe(pn.PAGE_EXITED, (function(t) {
                        t.reason === Ar.UNLOADING && i();
                    }
                    )),
                    o.subscribe(pn.SESSION_RENEWED, (function() {
                        n.status === Bc && r();
                    }
                    )),
                    r = function(r) {
                        var f = s.findTrackedSession();
                        f && f.sessionReplayAllowed ? n.status !== zc && n.status !== Hc && (n = {
                            status: zc
                        },
                        Pr("interactive", (function() {
                            if (n.status === zc) {
                                var r = (l || (c || (c = Wa(a, "Session Replay", (function() {
                                    i();
                                }
                                ), e)),
                                c && (l = Va(c, Ua.REPLAY))),
                                l);
                                if (r) {
                                    var f = t(o, a, s, u, r);
                                    n = {
                                        status: Hc,
                                        stopRecording: f.stop
                                    };
                                } else
                                    n = {
                                        status: Vc
                                    };
                            }
                        }
                        ))) : n = {
                            status: Bc
                        };
                    }
                    ,
                    i = function() {
                        n.status !== Vc && (n.status === Hc && n.stopRecording(),
                        n = {
                            status: Vc
                        });
                    }
                    ,
                    n.status === Bc && r();
                },
                isRecording: function() {
                    return ja() === Ha.Initialized && n.status === Hc;
                },
                getReplayStats: function(t) {
                    return ja() === Ha.Initialized ? function(t) {
                        return xc && xc.get(t);
                    }(t) : void 0;
                }
            };
        }((function(t, e, n, r, i, o) {
            var a = []
                , s = o || _i(e.sessionReplayEndPoint, Pc, e.retryMaxSize, (function(e) {
                    t.notify(pn.RAW_ERROR_COLLECTED, {
                        error: e
                    }),
                    fi("Error reported to customer", {
                        "error.message": e.message
                    });
                }
                ))
                , u = Mc(t, e, n, r, s, i)
                , c = u.addRecord;
            a.push(u.stop);
            var l = Ic({
                emit: c,
                configuration: e,
                lifeCycle: t
            });
            a.push(l.stop);
            var f = l.takeSubsequentFullSnapshot
                , d = l.flushMutations
                , p = t.subscribe(pn.VIEW_ENDED, (function() {
                    d(),
                    c({
                        timestamp: Et(),
                        type: cu.ViewEnd
                    });
                }
                ));
            a.push(p.unsubscribe);
            var v = t.subscribe(pn.VIEW_CREATED, (function(t) {
                f(t.startClocks.timeStamp);
            }
            ));
            return a.push(v.unsubscribe),
            {
                stop: function() {
                    a.forEach((function(t) {
                        t();
                    }
                    ));
                }
            };
        }
        )), Kc = function(t, e, n) {
            void 0 === n && (n = {});
            var r = Zi(qi.Unknown)
                , i = Vi("global", {
                    customerDataTracker: r.getOrCreateTracker(zi)
                })
                , a = Vi("user", {
                    customerDataTracker: r.getOrCreateTracker(Bi),
                    propertiesConfig: {
                        id: {
                            type: "string"
                        },
                        name: {
                            type: "string"
                        },
                        email: {
                            type: "string"
                        }
                    }
                });
            function s() {
                return function(t, e, n) {
                    return {
                        context: t.getContext(),
                        user: e.getContext(),
                        hasReplay: !!n.isRecording() || void 0
                    };
                }(i, a, e);
            }
            var f, d, p = uu(n, s, (function(o, u, c) {
                    o.storeContextsToLocal && (ji(o, i, "rum", zi),
                    ji(o, a, "rum", Bi)),
                    r.setCompressionStatus(u ? qi.Enabled : qi.Disabled);
                    var l = t(o, e, r, s, c, u && n.createDeflateEncoder ? function(t) {
                        return n.createDeflateEncoder(u, t);
                    }
                        : Xi);
                    return e.onRumStart(l.lifeCycle, o, l.session, l.viewContexts, u),
                    p = function(t, e) {
                        return x({
                            init: function(t) {
                                to("DATAFLUX_RUM", t);
                            },
                            initConfiguration: t.getInitConfiguration()
                        }, e);
                    }(p, l),
                    l;
                }
                )), v = c((function(t) {
                    var e = "object" === Ka(t) ? t : {
                        name: t
                    };
                    p.startView(e),
                    e.context && r.getOrCreateTracker(Hi).updateCustomerData(e.context),
                    pi({
                        feature: "start-view"
                    });
                }
                )), h = (f = {
                    init: c((function(t) {
                        p.init(t);
                    }
                    )),
                    setViewName: c((function(t) {
                        p.setViewName(t),
                        pi({
                            feature: "set-view-name"
                        });
                    }
                    )),
                    setViewContext: c((function(t) {
                        p.setViewContext(t),
                        pi({
                            feature: "set-view-context"
                        });
                    }
                    )),
                    setViewContextProperty: c((function(t, e) {
                        p.setViewContextProperty(t, e),
                        pi({
                            feature: "set-view-context-property"
                        });
                    }
                    )),
                    getViewContext: c((function() {
                        return pi({
                            feature: "set-view-context-property"
                        }),
                        p.getViewContext();
                    }
                    )),
                    addRumGlobalContext: c((function(t, e) {
                        i.setContextProperty(t, e),
                        pi({
                            feature: "set-global-context"
                        });
                    }
                    )),
                    setGlobalContextProperty: c((function(t, e) {
                        i.setContextProperty(t, e),
                        pi({
                            feature: "set-global-context"
                        });
                    }
                    )),
                    removeRumGlobalContext: c((function(t) {
                        return i.removeContextProperty(t);
                    }
                    )),
                    removeGlobalContextProperty: c((function(t) {
                        return i.removeContextProperty(t);
                    }
                    )),
                    getRumGlobalContext: c((function() {
                        return i.getContext();
                    }
                    )),
                    getGlobalContext: c((function() {
                        return i.getContext();
                    }
                    )),
                    setRumGlobalContext: c((function(t) {
                        i.setContext(t),
                        pi({
                            feature: "set-global-context"
                        });
                    }
                    )),
                    setGlobalContext: c((function(t) {
                        i.setContext(t),
                        pi({
                            feature: "set-global-context"
                        });
                    }
                    )),
                    clearGlobalContext: c((function() {
                        return i.clearContext();
                    }
                    )),
                    getInitConfiguration: c((function() {
                        return ot(p.initConfiguration);
                    }
                    )),
                    getInternalContext: c((function(t) {
                        return p.getInternalContext(t);
                    }
                    )),
                    addDebugSession: c((function(t) {}
                    )),
                    clearDebugSession: c((function() {}
                    )),
                    getDebugSession: c((function() {}
                    )),
                    addAction: c((function(t, e) {
                        var n = Ke();
                        l((function() {
                            p.addAction({
                                name: ze(t),
                                context: ze(e),
                                startClocks: bt(),
                                type: ae.CUSTOM,
                                handlingStack: n
                            }),
                            pi({
                                feature: "add-action"
                            });
                        }
                        ));
                    }
                    )),
                    addError: c((function(t, e) {
                        var n = Ke();
                        l((function() {
                            p.addError({
                                error: t,
                                handlingStack: n,
                                context: ze(e),
                                startClocks: bt()
                            }),
                            pi({
                                feature: "add-error"
                            });
                        }
                        ));
                    }
                    )),
                    addTiming: c((function(t, e) {
                        p.addTiming(ze(t), e);
                    }
                    )),
                    setUser: c((function(t) {
                        (function(t) {
                            var e = "object" === rt(t);
                            return e || o.error("Unsupported user:", t),
                            e;
                        }
                        )(t) && a.setContext(Qi(t)),
                        pi({
                            feature: "set-user"
                        });
                    }
                    )),
                    getUser: c((function() {
                        return a.getContext();
                    }
                    )),
                    setUserProperty: c((function(t, e) {
                        var n = {};
                        n[t] = e;
                        var r = Qi(n)[t];
                        a.setContextProperty(t, r),
                        pi({
                            feature: "set-user"
                        });
                    }
                    )),
                    removeUserProperty: c((function(t) {
                        return a.removeContextProperty(t);
                    }
                    )),
                    removeUser: c((function() {
                        return a.clearContext();
                    }
                    )),
                    clearUser: c((function() {
                        return a.clearContext();
                    }
                    )),
                    startView: v,
                    stopSession: c((function() {
                        p.stopSession(),
                        pi({
                            feature: "stop-session"
                        });
                    }
                    )),
                    startSessionReplayRecording: c((function(t) {
                        e.start(t),
                        pi({
                            feature: "start-session-replay-recording",
                            force: t && t.force
                        });
                    }
                    )),
                    stopSessionReplayRecording: c(e.stop)
                },
                d = x({
                    onReady: function(t) {
                        t();
                    }
                }, f),
                Object.defineProperty(d, "_setDebug", {
                    get: function() {
                        return u;
                    },
                    enumerable: !1
                }),
                d);
            return h;
        }((function(t, e, n, r, i, o) {
            var a = []
                , s = new vn
                , u = function(t) {
                    var e = li(si.RUM, t);
                    return e;
                }(t)
                , l = function(t) {
                    s.notify(pn.RAW_ERROR_COLLECTED, {
                        error: t
                    });
                }
                , f = new tn((function(t) {
                    var e = an(window, [ie.VISIBILITY_CHANGE, ie.FREEZE], (function(e) {
                            e.type === ie.VISIBILITY_CHANGE && "hidden" === document.visibilityState ? t.notify({
                                reason: Ar.HIDDEN
                            }) : e.type === ie.FREEZE && t.notify({
                                reason: Ar.FROZEN
                            });
                        }
                        ), {
                            capture: !0
                        })
                        , n = on(window, ie.BEFORE_UNLOAD, (function() {
                            t.notify({
                                reason: Ar.UNLOADING
                            });
                        }
                        ));
                    return function() {
                        e.stop(),
                        n.stop();
                    };
                }
                ));
            f.subscribe((function(t) {
                s.notify(pn.PAGE_EXITED, t);
            }
            )),
            a.push((function() {
                pageExitSubscription.unsubscribe();
            }
            ));
            var d = Ri() ? function() {
                var t = {
                    id: "00000000-aaaa-0000-aaaa-000000000000",
                    plan: no.WITHOUT_SESSION_REPLAY,
                    sessionReplayAllowed: !1
                };
                return {
                    findTrackedSession: function() {
                        return t;
                    },
                    expire: st,
                    expireObservable: new tn
                };
            }() : io(t, s);
            if (Ri())
                !function(t) {
                    var e = xi();
                    t.subscribe(pn.RUM_EVENT_COLLECTED, (function(t) {
                        var n = Ci(t).rowData;
                        e.send("rum", n);
                    }
                    ));
                }(s);
            else {
                var p = $a(t, s, u.observable, l, f, d.expireObservable, o);
                a.push((function() {
                    p.stop();
                }
                ));
            }
            var v, h = uo(t), _ = (v = co(),
                new tn((function(t) {
                    if (v) {
                        var e = new v(c((function() {
                            return t.notify();
                        }
                        )));
                        return e.observe(document, {
                            attributes: !0,
                            characterData: !0,
                            childList: !0,
                            subtree: !0
                        }),
                        function() {
                            return e.disconnect();
                        };
                    }
                }
                ))), g = lo(location), m = La(), y = function(t, e, n, r, i, o, a, s, u, c) {
                    // 初始化性能监控
                    var l = function(t) {
                            var e = Jt({
                                expireDelay: us // 过期延迟
                            });
                            // // 订阅视图创建前事件
                            return t.subscribe(pn.BEFORE_VIEW_CREATED, (function(t) {
                                e.add(function(t) {
                                    return {
                                        service: t.service,
                                        version: t.version,
                                        context: t.context,
                                        id: t.id,
                                        name: t.name,
                                        startClocks: t.startClocks
                                    };
                                }(t), t.startClocks.relative);
                            }
                            )),
                            // // 订阅视图创建后事件
                            t.subscribe(pn.AFTER_VIEW_ENDED, (function(t) {
                                e.closeActive(t.endClocks.relative);
                            }
                            )), 
                            // // 订阅视图更新前事件
                            t.subscribe(pn.BEFORE_VIEW_UPDATED, (function(t) {
                                var n = e.find(t.startClocks.relative);
                                // // 更新视图名称
                                n && t.name && (n.name = t.name),   
                                // // 更新视图上下文
                                n && t.context && (n.context = t.context);
                            }
                            )),
                            // 会话更新时重置
                            t.subscribe(pn.SESSION_RENEWED, (function() {
                                e.reset();
                            }
                            )),
                            {
                                findView: function(t) {
                                    return e.find(t);
                                },
                                stop: function() {
                                    e.stop();
                                }
                            };
                        }(t)
                        , f = function(t, e, n) {
                            var r, i = Jt({
                                expireDelay: ss
                            });
                            // // 订阅视图创建前事件
                            t.subscribe(pn.BEFORE_VIEW_CREATED, (function(t) {
                                var e = n.href;
                                i.add(a({
                                    url: e,
                                    location: n,
                                    referrer: r || document.referrer
                                }), t.startClocks.relative),
                                r = e;
                            }
                            )),
                            t.subscribe(pn.AFTER_VIEW_ENDED, (function(t) {
                                i.closeActive(t.endClocks.relative);
                            }
                            ));
                            var o = e.subscribe((function(t) {
                                var e = i.find();
                                if (e) {
                                    var n = yt();
                                    i.closeActive(n),
                                    i.add(a({
                                        url: t.newLocation.href,
                                        location: t.newLocation,
                                        referrer: e.referrer
                                    }), n);
                                }
                            }
                            ));
                            function a(t) {
                                var e = t.location.pathname
                                    , n = t.location.hash;
                                return n && !$t(n) && (e = "/" + Kt(n)),
                                {
                                    url: t.url,
                                    referrer: t.referrer,
                                    host: t.location.host,
                                    path: e,
                                    pathGroup: J(e),
                                    urlQuery: et(t.location.href)
                                };
                            }
                            return {
                                findUrl: function(t) {
                                    return i.find(t);
                                },
                                stop: function() {
                                    o.unsubscribe(),
                                    i.stop();
                                }
                            };
                        }(t, a, n)
                        , d = function(t, e, n, r) {
                            t.subscribe(pn.AUTO_ACTION_COMPLETED, (function(e) {
                                t.notify(pn.RAW_RUM_EVENT_COLLECTED, Pa(e, r));
                            }
                            ));
                            var i = {
                                findActionId: st,
                                findAllActionId: st
                            };
                            return n.trackUserInteractions && (i = Ia(t, e, n).actionContexts),
                            {
                                actionContexts: i,
                                addAction: function(e, n) {
                                    t.notify(pn.RAW_RUM_EVENT_COLLECTED, k({
                                        savedCommonContext: n
                                    }, Pa(e, r)));
                                }
                            };
                        }(t, s, e, o)
                        , p = d.actionContexts
                        , v = d.addAction
                        , h = (_ = as(),
                        {
                            get: function() {
                                return {
                                    viewport: _
                                };
                            },
                            stop: os().subscribe((function(t) {
                                _ = t;
                            }
                            )).unsubscribe
                        });
                    var _;
                    return is(e, t, r, i, l, f, p, h, u, c),
                    {
                        viewContexts: l,
                        urlContexts: f,
                        pageStateHistory: o,
                        addAction: v,
                        actionContexts: p,
                        stop: function() {
                            h.stop(),
                            o.stop(),
                            f.stop(),
                            l.stop();
                        }
                    };
                }(s, t, location, d, h, m, g, _, r, l), b = y.viewContexts, E = y.urlContexts, w = y.actionContexts, S = y.stop, T = y.addAction;
            a.push(S),
            ui.drain(),
            u.setContextProvider((function() {
                return {
                    application: {
                        id: t.applicationId
                    },
                    session: {
                        id: d.findTrackedSession() && d.findTrackedSession().id
                    },
                    view: {
                        id: b.findView() && b.findView().id
                    },
                    action: {
                        id: w.findActionId(),
                        ids: w.findAllActionId()
                    }
                };
            }
            ));
            // 添加时间 性能监控相关代码
            var C = Ms(s, t, location, _, g, m, e, i)
                , I = C.addTiming // 添加时间
                , O = C.startView // 开始视图
                , A = C.setViewName // 设置视图名称
                , x = C.setViewContext // 设置视图上下文
                , R = C.setViewContextProperty // 设置视图上下文属性
                , N = C.getViewContext // 获取视图上下文
                , L = C.stop; // 停止
            a.push(L);
            var D = nu(s, t, m);
            if (a.push(D.stop),
            // 支持长帧动画 长任务监控
            PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes(Do.LONG_ANIMATION_FRAME)) {
                var P = function(t, e) {
                    // 订阅长帧动画事件监控长动画帧
                    var n = Po(e, {
                        type: Do.LONG_ANIMATION_FRAME,
                        buffered: !0
                    }).subscribe((function(e) {
                        // 遍历长帧动画事件 处理每个长任务
                        for (var n = 0, r = e; n < r.length; n++) {
                            var i = r[n]
                                , o = Ct(i.startTime)
                                // 构建长任务数据
                                , a = {
                                    date: o.timeStamp,
                                    longTask: { 
                                        id: Q(), // 长任务ID
                                        entryType: ce.LONG_ANIMATION_FRAME, // 长任务类型   
                                        duration: _t(i.duration), // 长任务持续时间
                                        blockingDuration: _t(i.blockingDuration), // 阻塞持续时间
                                        firstUiEventTimestamp: _t(i.firstUIEventTimestamp), // 首次UI事件时间戳
                                        renderStart: _t(i.renderStart), // 渲染开始时间戳
                                        styleAndLayoutStart: _t(i.styleAndLayoutStart), // 样式和布局开始时间戳
                                        startTime: _t(i.startTime), // 任务开始时间戳
                                        // 记录脚本信息
                                        scripts: i.scripts.map((function(t) {
                                            return {
                                                duration: _t(t.duration),// 脚本持续时间
                                                pause_duration: _t(t.pauseDuration),// 暂停持续时间
                                                forced_style_and_layout_duration: _t(t.forcedStyleAndLayoutDuration),// 强制样式和布局持续时间
                                                start_time: _t(t.startTime),// 脚本开始时间
                                                execution_start: _t(t.executionStart),// 执行开始时间
                                                source_url: t.sourceURL,// 脚本源URL
                                                source_function_name: t.sourceFunctionName,// 脚本源函数名
                                                source_char_position: t.sourceCharPosition,// 脚本源字符位置
                                                invoker: t.invoker,// 调用者
                                                invoker_type: t.invokerType,// 调用者类型
                                                window_attribution: t.windowAttribution // 窗口归属
                                            };
                                        }
                                        ))
                                    },
                                    type: ue.LONG_TASK
                                };
                                // 通知长任务事件
                            t.notify(pn.RAW_RUM_EVENT_COLLECTED, {
                                rawRumEvent: a, // 长任务数据
                                startTime: o.relative, // 长任务开始时间
                                domainContext: {
                                    performanceEntry: i // 性能条目
                                }
                            });
                        }
                    }
                    ));
                    return {
                        stop: function() {
                            n.unsubscribe(); // 停止订阅
                        }
                    };
                }(s, t);
                a.push(P.stop);
                /* 性能监控系统：
视图生命周期监控
长任务检测
动画帧性能分析
事件订阅机制：
视图创建/更新/结束事件
会话更新事件
性能事件
数据收集：
长任务信息
脚本执行详情
时间戳记录
用于：
性能数据采集
用户体验监控
性能瓶颈分析  END*/
            } else
                !function(t, e) {// 长任务监控
                    // 订阅长任务事件订阅长任务事件 创建性能观察器
                    var n = Po(e, {
                        type: Do.LONG_TASK,
                        buffered: !0
                    }).subscribe((function(e) {
                        // 处理每个长任务
                        for (var n = 0; n < e.length; n++) {
                            var r = e[n];
                            if (r.entryType !== Do.LONG_TASK)
                                break;
                            // 构建长任务数据
                            var i = Ct(r.startTime)
                                , o = {
                                    date: i.timeStamp,// 时间戳 
                                    longTask: {
                                        id: Q(),// 长任务ID
                                        entryType: ce.LONG_TASK,// 长任务类型
                                        duration: _t(r.duration)// 长任务持续时间
                                    },
                                    type: ue.LONG_TASK
                                };
                            t.notify(pn.RAW_RUM_EVENT_COLLECTED, {
                                rawRumEvent: o, // 长任务数据
                                startTime: i.relative, // 长任务开始时间
                                domainContext: {
                                    performanceEntry: r // 性能条目
                                }
                            });
                        }
                    }
                    ));
                }(s, t);
            var M = cs(s, 0, m).addError;
            Ys(s, t, d);
            var U = function(t, e, n, r, i) {
                return {
                    get: function(o) {
                        var a = n.findView(o)
                            , s = i.findUrl(o)
                            , u = e.findTrackedSession(o);
                        if (u && a && s) {
                            var c = r.findActionId(o)
                                , l = r.findAllActionId(o);
                            return {
                                application: {
                                    id: t
                                },
                                session: {
                                    id: u.id
                                },
                                userAction: c ? {
                                    id: c,
                                    ids: l
                                } : void 0,
                                view: {
                                    id: a.id,// 视图ID
                                    name: a.name || a.path,// 视图名称
                                    url: s.url,// 视图URL
                                    referrer: s.referrer,// 引用
                                    host: s.host,// 主机
                                    path: s.path,// 路径
                                    pathGroup: s.pathGroup,// 路径组
                                    urlQuery: s.urlQuery
                                }
                            };
                        }
                    }
                };
            }(t.applicationId, d, b, w, E);
            return {
                addAction: T,// 添加动作
                addError: M,// 添加错误
                addTiming: I,// 添加时间
                configuration: t,// 配置
                startView: O,// 开始视图
                setViewContext: x,// 设置视图上下文
                setViewContextProperty: R,// 设置视图上下文属性
                getViewContext: N,// 获取视图上下文
                setViewName: A,// 设置视图名称
                lifeCycle: s,// 生命周期
                viewContexts: b,// 视图上下文
                session: d,// 会话
                stopSession: function() {
                    d.expire();
                },
                getInternalContext: U.get,// 获取内部上下文
                stop: function() {
                    a.forEach((function(t) {
                        t();
                    }
                    ));
                }
            };
        }
        ), $c, {
            startDeflateWorker: Wa,// 启动压缩工作线程
            createDeflateEncoder: Va// 创建压缩编码器
        });
    Fc = v(),// 创建数据流
    jc = Kc,// 设置数据流
    Gc = Fc[Wc = "DATAFLUX_RUM"],// 
    // 设置数据流
    Fc[Wc] = jc,
    // 如果数据流存在，则执行回调
    Gc && Gc.q && A(Gc.q, (function(t) {
        d(t, "onReady callback threw an error:")();
    }
    ));
}();
