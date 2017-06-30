(function (window, document, xy) {
    var config = {
        DOMAIN: 'https://ccapp.cib.com.cn/o2o-api',
        SUCCESS_CODE: '000000',
        TIME_OUT: 10000,
    };
    /**
     * 返回配置常量
     * @param key {number/string}
     * @returns {*}
     */
    xy.getConfig = function (key) {
        return config[key];
    }
    /**
     * 常用js工具
     */
    xy.utils = (function () {
        var me = {},
            _elementStyle = document.createElement('div').style,
            _vendor = (function () {
                var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                    transform,
                    i = 0,
                    l = vendors.length;

                for (; i < l; i++) {
                    transform = vendors[i] + 'ransform';
                    if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
                }
                _elementStyle = null;
                return false;
            })(),
            _localStorageSet = function (key, value) {
                if (typeof localStorage === 'object') {
                    try {
                        localStorage.setItem(key, value);
                    } catch (e) {
                        xy.cue.alert('请关闭无痕浏览模式');
                    }
                }
            },
            _sessionStorageSet = function (key, value) {
                if (typeof sessionStorage === 'object') {
                    try {
                        sessionStorage.setItem(key, value);
                    } catch (e) {
                        xy.cue.alert('请关闭无痕浏览模式');
                    }
                }
            };

        me.prefixStyle = function (style) {
            if (_vendor === false) return false;
            if (_vendor === '') return style;
            return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
        };
        me.extend = function (dfts, opts) {
            for (i in opts) {
                dfts[i] = opts[i];
            }
            return dfts;
        };
        //转JSON为查询字符串
        me.param = function (opts) {
            var str = '', j;
            if (!opts) return '';
            for (j in opts) {
                str += j + '=' + opts[j] + '&';
            }
            return str.substring(0, str.length - 1);
        };
        //默认将url的查询字符串变JSON
        me.parseSearchStr = function (url) {
            var arr, result = {}, temp;
            if (url) {
                arr = decodeURIComponent(url).split('&');
            } else {
                arr = decodeURIComponent(window.location.search.substr(1)).split('&');
            }
            arr.forEach(function (item) {
                if (!item) return;
                temp = item.split('=');
                result[temp[0]] = temp[1];
            });
            return result;
        };
        me.isEmptyObject = function (c) {
            for (var i in c) {
                return false;
            }
            return true;
        };
        me.localSet = function (key, data) {
            if (typeof data == 'object') {
                _localStorageSet(key, JSON.stringify(data))
            } else {
                _localStorageSet(key, data)
            }
        };
        me.localGet = function (key, destroy) {
            var val;
            try {
                val = localStorage.getItem(key);
                destroy && localStorage.removeItem(key); //是否取完立即删除
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        };
        me.sessionSet = function (key, data) {
            if (typeof data == 'object') {
                _sessionStorageSet(key, JSON.stringify(data))
            } else {
                _sessionStorageSet(key, data)
            }
        };
        me.sessionGet = function (key) {
            var val;
            try {
                val = sessionStorage.getItem(key);
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        };
        //小数点后几位舍入
        me.toFixed = function (numb, len, type) {
            var arr = (numb + '').split('.');
            if (len <= 0) return numb;
            if (type === 'floor') {
                if (arr[1] && arr[1].length > len) {
                    return Number(arr[0] + '.' + arr[1].substr(0, len));
                } else {
                    return numb;
                }
            } else if (type === 'ceil') {
                if (arr[1] && arr[1].length > len) {
                    return Number(arr[0] + '.' + arr[1].substr(0, len)) + Math.pow(10, -1 * len);
                } else {
                    return numb;
                }
            } else {
                if (arr[1] && arr[1].length > len) {
                    len = arr[1].length;
                }
                return Number(numb.toFixed(len));
            }
        }

        return me;
    })();

    window.rAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };

    /**
     * ajax
     * @param opts {JSON}
     * @returns {XMLHttpRequest}
     */
    xy.ajax = function (opts) {
        var xhr = new XMLHttpRequest(), timeout = false, timer, str = '', txt, loadingTimer,
            loading = function (on) {
                if (!dft.loading) return;
                if (on) {
                    loadingTimer = setTimeout(function () {
                        xy.cue.loading(1);
                    }, 200);
                } else {
                    clearTimeout(loadingTimer);
                    xy.cue.loading(0);
                }
            },
            dft = {
                async: true,
                type: 'POST',
                loading: false,
                abortTip: false,
                contentType: "text/plain;charset=UTF-8",
                abnormal: function (data) {
                    //TODO 处理请求异常
                }
            };

        xy.utils.extend(dft, opts);

        loading(1);

        if (!/http:/.test(dft.url)) {
            dft.url = xy.getConfig('DOMAIN') + dft.url;
        }

        timer = setTimeout(function () {
            timeout = true;
            xhr.abort();
            loading(0);
            dft.abortTip && xy.cue.toast('请求超时了！');
        }, dft.timeout || xy.getConfig('TIME_OUT'));

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (timeout) return;
                clearTimeout(timer);
                //处理返回二进制文件
                if (dft.responseType === 'blob') {
                    if (xhr.status === 200) {
                        dft.success && dft.success(xhr.response);
                        loading(0);
                    } else {
                        dft.error && dft.error(xhr.response);
                        loading(0);
                    }
                } else {
                    txt = xhr.responseText;
                    if (xhr.status === 200) {
                        loading(0);
                        try {
                            if (txt && typeof txt !== 'object') {
                                txt = JSON.parse(decodeURI(txt));
                            }
                            //TODO 对 接口正常返回和异常返回处理
                            if (txt.responseCode === xy.getConfig('SUCCESS_CODE')) {
                                return dft.success && dft.success(txt);
                            } else {
                                return dft.abnormal && dft.abnormal(txt);
                            }
                        } catch (e) {
                            xy.cue.alert('ajax success,next error' + xhr.responseText);
                        }
                    } else {
                        loading(0);
                        try {
                            if (txt && typeof txt !== 'object') {
                                txt = JSON.parse(decodeURI(txt));
                            }
                            return dft.error && dft.error(txt);
                        } catch (e) {
                            xy.cue.alert('ajax error,next error' + xhr.responseText);
                        }
                    }
                }
            }
        };

        if (dft.type.toLowerCase() === 'get') {
            str = xy.utils.param(dft.data);
            if (str) {
                dft.url += '?' + str;
            }
        }

        if (dft.responseType === 'blob') {
            xhr.responseType = 'blob'
        }

        xhr.open(dft.type, dft.url, dft.async);

        xhr.setRequestHeader("Content-Type", dft.contentType);

        if (dft.type.toLowerCase() === 'get') {
            xhr.send(null);
        } else {
            xhr.send(JSON.stringify(dft.data));
        }
        return xhr;
    }

    //$.html
    xy.html = function (s) {
        var o = document.createElement('div');
        o.innerHTML = s;
        return o.children[0];
    };

    //css3
    xy.css3 = function (el, opt) {
        var elStyle = el.style;
        for (var i in opt) {
            var s = xy.utils.prefixStyle(i);
            if (s === false) continue;
            elStyle[s] = opt[i];
        }
    }

    /**
     * 跳页
     * otps {JOSN/number}
     * @param opts
     */
    xy.pageSkip = function (opts) {
        var temp, str, n = 0, postfix = '', getLvl = function (s) {
            s.split('/').forEach(function (t) {
                t === '..' ? (n++) : (postfix += '/' + t);
            })
            postfix = postfix.replace(/^\//, '');
        };
        if (typeof opts === 'number') {
            window.history.go(opts);
        } else if (typeof opts === 'string') {
            temp = opts.split(',');
            getLvl(temp[0]);
            if (temp[1]) {
                window.location.replace(this.getDomainPath(n) + postfix);
            } else {
                window.location.href = this.getDomainPath(n) + postfix;
            }
        } else if (typeof opts === 'object') {
            getLvl(opts.url);
            if (xy.utils.isEmptyObject(opts.data)) {
                str = '';
            } else {
                str = '?' + xy.utils.param(opts.data);
            }
            if (opts.replace === true) {
                window.location.replace(this.getDomainPath(n) + postfix + str);
            } else {
                window.location.href = this.getDomainPath(n) + postfix + str;
            }
        }
    }

    /**
     * 获取当前n级绝对路径
     * @param n {number/string}
     * @returns {string}
     */
    xy.getDomainPath = function (n) {
        var reg = null, str = '.*?\\/', sc = '';
        str = '.*?\\/';
        i = 0;
        n = n || 0;
        for (; i < n; i++) {
            sc += str;
        }
        reg = new RegExp('(.*\\/)' + sc + '.*?\\.html\\??');
        reg.exec(window.location.href);
        return RegExp.$1;
    }
    /**
     * 提示模块
     * @type {{}}
     */
    xy.cue = {
        /**
         * 加载提示
         * @param on {boolean}
         * @param msg {string/number}
         */
        loading: function (on, msg) {
            this._first && this._init();
            if (on) {
                if (!this._loadingCount) {
                    this._changeLoadingTxt(msg)._show(this._loadingEl, 'loading');
                }
                this._loadingCount++;
            } else {
                if (this._loadingCount) {
                    this._loadingCount--;
                    if (!this._loadingCount) this._hide(this._loadingEl, 'loading');
                }
            }
        },
        /**
         * 吐司提示
         * @param msg {string/number}
         * @param cb {function}
         */
        toast: function (msg, cb) {
            this._first && this._init();
            this._list.push({
                id: new Date().getTime() + Math.random(),
                type: 'toast',
                msg: msg,
                cb: cb,
                exec: function () {
                    var _this = this;
                    xy.cue._loadingEl.style.opacity = '0';
                    xy.cue._changeToastTxt(this.msg)._show(xy.cue._toastEl, this.type);
                    setTimeout(function () {
                        xy.cue._hide(xy.cue._toastEl, _this.type)._remove()._next();
                        _this.cb && _this.cb();
                    }, 2000);
                },
            });
            this._begin();
        },
        /**
         * 警告提示
         * @param msg
         * @param cb
         */
        alert: function (msg, cb) {
            this._first && this._init();
            this._list.push({
                id: new Date().getTime() + Math.random(),
                type: 'alert',
                msg: msg,
                cb: cb,
                exec: function () {
                    var _this = this;
                    xy.cue._loadingEl.style.opacity = '0';
                    xy.cue._changeAlertTxt(this.msg)._show(xy.cue._alertEl, _this.type);
                    xy.cue._alertCB = function () {
                        xy.cue._hide(xy.cue._alertEl, _this.type)._remove()._next();
                        _this.cb && _this.cb();
                    }
                }
            });
            this._begin();
        },
        /**
         * 确定取消提示框
         * @param msg {string/number}
         * @param cb {function}
         */
        confirm: function (msg, cb, cb1) {
            this._first && this._init();
            this._list.push({
                id: new Date().getTime() + Math.random(),
                type: 'confirm',
                msg: msg,
                cb: cb,
                cb1: cb1,
                exec: function () {
                    var _this = this;
                    xy.cue._loadingEl.style.opacity = '0';
                    xy.cue._changeConfirmTxt(this.msg)._show(xy.cue._confirmEl, _this.type);
                    xy.cue._confirmCB = function (op) {
                        xy.cue._hide(xy.cue._confirmEl, _this.type)._remove()._next();
                        if (op) {
                            _this.cb && _this.cb();
                        } else {
                            _this.cb1 && _this.cb1();
                        }
                    }
                }
            });
            this._begin();
        },

        _first: true,
        _loadingCount: 0,
        _alertCB: null,
        _confirmCB: null,
        _list: [],
        _show: function (el, type) {
            var c;
            el.style.display = 'table';
            if (type === 'alert' || type === 'confirm') {
                c = document.querySelector('.content,.container');
                c && c.classList.add('filter');
            }
            return this;
        },
        _hide: function (el, type) {
            var c;
            el.style.display = 'none';
            if (type === 'alert' || type === 'confirm') {
                c = document.querySelector('.content,.container');
                c && c.classList.remove('filter');
            }
            return this;
        },
        _remove: function (id) {
            this._list[0] && this._list.shift(0);
            return this;
        },
        _begin: function () {
            if (!this._cuing && this._list[0]) {
                this._cuing = true;
                this._list[0].exec();
            }
        },
        _next: function () {
            if (this._list[0]) {
                var _this = this;
                setTimeout(function () {
                    _this._list[0].exec();
                    _this._cuing = true;
                }, 16)
                return this;
            }
            xy.cue._loadingEl.style.opacity = '1';
            this._cuing = false;
            return this;
        },

        _init: function () {
            delete this._first;
            var ob = document.querySelector('body'), loading, toast;
            //loading...
            this._loadingEl = xy.html('<div class="loading"><div class="loading-panel"><div class="loading-content"><div class="upper"><div class="loading-pic circle-ani"></div></div><div class="lower"></div></div></div></div>');
            this._changeLoadingTxt = function (msg) {
                this._loadingEl.querySelector('.lower').innerHTML = msg || '信息加载中...';
                return this;
            }
            ob.appendChild(this._loadingEl);
            //toast...
            this._toastEl = xy.html('<div class="toast" ><div class="toast-panel"><div class="toast-content">&nbsp;</div></div></div>');
            this._changeToastTxt = function (msg) {
                this._toastEl.querySelector('.toast-content').innerHTML = msg || '请您注意了！';
                return this;
            }
            ob.appendChild(this._toastEl);
            //alert...
            this._alertEl = xy.html('<div class="alert mask"><div class="alert-panel"><div class="alert-content"><p class="header">注意</p><p class="body">&nbsp;</p><p class="footer sure bw">确定</p></div></div></div>');
            this._changeAlertTxt = function (msg) {
                this._alertEl.querySelector('.body').innerHTML = msg || '请您注意了！';
                return this;
            }
            this._alertEl.querySelector('.sure').addEventListener('click', function () {
                xy.cue._alertCB && xy.cue._alertCB();
            }, !1);
            ob.appendChild(this._alertEl);
            //confirm...
            this._confirmEl = xy.html('<div class="confirm mask"><div class="confirm-panel"><div class="confirm-content"><p class="header">注意</p><p class="body">&nbsp;</p><div class="footer bw"><p class="cell-l cancel bw">取消</p><p class="cell-r sure">确定</p></div></div></div></div>');
            this._changeConfirmTxt = function (msg) {
                this._confirmEl.querySelector('.body').innerHTML = msg || '您确定要这样操作？';
                return this;
            }
            this._confirmEl.querySelector('.sure').addEventListener('click', function () {
                xy.cue._confirmCB && xy.cue._confirmCB(1);
            }, !1);
            this._confirmEl.querySelector('.cancel').addEventListener('click', function () {
                xy.cue._confirmCB && xy.cue._confirmCB(0);
            }, !1);
            ob.appendChild(this._confirmEl);
        }
    }

    xy.scrollRefresh = function (el, pulldownFn, pullupFn) {
        var iscroll = new IScroll('#wrapper', {
            refresh: true,
            probeType: 2,
            animateSpeed: 55,
            animateBeginOffset: 70,
            borderColor: '#0394fb',
            borderBGColor: '#fff',
            BGColor: '#e1e1e1',
        });

        iscroll.on('pullDownRefresh', function () {
            pulldownFn && pulldownFn();
        })
        iscroll.on('pullUpRefresh', function () {
            pullupFn && pullupFn();
        })

        return iscroll;
    }

    /**
     * 移动端浏览器判断
     */
    ;
    (function (ua) {
        xy.os = {};
        var funcs = [
            function () { //wechat
                var wechat = ua.match(/(MicroMessenger)\/([\d\.]+)/i);
                if (wechat) { //wechat
                    this.os.wechat = {
                        version: wechat[2].replace(/_/g, '.')
                    };
                }
                return false;
            },
            function () { //android
                var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
                if (android) {
                    this.os.android = true;
                    this.os.version = android[2];

                    this.os.isBadAndroid = !(/Chrome\/\d/.test(window.navigator.appVersion));
                }
                return this.os.android === true;
            },
            function () { //ios
                var iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
                if (iphone) { //iphone
                    this.os.ios = this.os.iphone = true;
                    this.os.version = iphone[2].replace(/_/g, '.');
                } else {
                    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
                    if (ipad) { //ipad
                        this.os.ios = this.os.ipad = true;
                        this.os.version = ipad[2].replace(/_/g, '.');
                    }
                }
                return this.os.ios === true;
            }
        ];
        [].every.call(funcs, function (func) {
            return !func.call(xy);
        });
    })(window.navigator.userAgent);

    //****与原生app混合代码由此开始*****//
    xy.plus = {
        nextPage: function (se) {
            this.ai('nextPage', se);
        },
        ai: function (type, se) {
            if (xy.os.ios) {
                try {
                    window.webkit.messageHandlers[type].postMessage(JSON.stringify(se));
                } catch (e) {
                    alert('错误' + e);
                }
            } else if (xy.os.android) {
                try {
                    window.plus[type](JSON.stringify(se));
                } catch (e) {
                    alert('错误' + e);
                }
            }
        }
    }

})(window, document, window.xy = {});
//****业务级共用代码由此开始*****//
(function (window, document, xy) {

    window.test = function(a){
        var str = a;
        var len = str.length;
        var count = [];
        var result = []
        var max = len - 1;
        var all = 0;

        for(var i= 0; i<= len; i++){
            all += Math.pow(len , i);
        }

        var w = 0
        for (var i = 0; i < all; i++) {
            function addBySelf(x) {
                if (x > max) return;
                if (count[x] +1 > max) {
                    count[x] = 0;
                    addBySelf(x + 1);
                } else {
                    if (typeof count[x] !== 'number') {
                        count[x] = 0;
                    } else {
                        count[x] += 1;
                    }
                    toStr();
                }
            };
            addBySelf(w);
        }

        function toStr() {
            var s = '';
            count.forEach(function (item, key) {
                s += str[item];
            })
            console.log(s);
        }
    }

})(window, document, xy);