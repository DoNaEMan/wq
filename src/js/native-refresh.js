/**
 * Created by wq on 2017/4/6.
 */
(function(){
    function NativeRefresh(el, opts) {
        this.isWindow = el === window;
        this.wapper = typeof el === 'string' ? document.querySelector(el) : this.isWindow ? window : el;
        this.scroller = this.wapper.querySelector('.native-scroller');
        this.opts = {
            PULLDOWNTIPS: '下拉加载更多...',
            PULLDOWNTIPS2: '释放可刷新',
            PULLDOWNTIPS3: '正在加载中...',
            PULLUPTIPS: '正在刷新中...',
            PULLUPEND: '已经没有更多了',
            animateSpeed: 100,
            borderColor: '#0394fb',
            offetTop: '0px',
            offetBottom: '0px',
        }

        xy.utils.extend(this.opts, opts || {});

        this._init();
    }

    NativeRefresh.prototype = {
        version: '1.0.0',

        _init: function () {
            var _this = this;
            //加入提示元素
            this.pullUpBox = xy.html('<div class="native-pull-up"><div class="wrap">' +
                '<canvas class="circle-ani" height="100" width="100"></canvas><div class="tips"></div>' +
                '</div></div>');
            this.scroller.appendChild(this.pullUpBox);
            this.pullUpTips = this.pullUpBox.querySelector('.tips')
            this.pullUpTips.innerHTML = this.opts.PULLUPTIPS;

            this.pullDownBox = xy.html('<div class="native-pull-down"><div class="wrap">' +
                '<canvas height="100" width="100"></canvas><div class="tips"></div>' +
                '</div></div>');
            document.body.insertBefore(this.pullDownBox, document.body.children[0]);
            this.pullDownBox.querySelector('.tips')
            this.pullDownTips = this.pullDownBox.querySelector('.tips')
            this.pullDownTips.innerHTML = this.opts.PULLDOWNTIPS;
            this.pullUpBoxHeight = this.pullUpBox.offsetHeight;
            this.scroller.style.paddingBottom = this.opts.offetBottom;
            this.scroller.style.paddingTop = this.opts.offetTop;
            this.pullDownBox.style.top = this.opts.offetTop;

            this.pullDownCanvas = this.pullDownBox.querySelector('canvas');
            this.pullUpCanvas = this.pullUpBox.querySelector('canvas');

            this._drawCircle(100, 2);

            this.refresh();

            this.wapper.addEventListener('scroll', this, false);

            touch.on(this.wapper, 'drag dragend', function (e) {
                if (e.type === 'drag') {
                    _this._move.call(_this, e);
                } else {
                    _this._end.call(_this, e);
                }
            })
        },
        getScrollTop: function () {
            if (this.isWindow) {
                return document.body.scrollTop || document.documentElement.scrollTop;
            } else {
                return this.wapper.scrollTop;
            }
        },
        setScrollTop: function (s) {
            if (this.isWindow) {
                document.body.scrollTop = s, document.documentElement.scrollTop = s;
            } else {
                return this.wapper.scrollTop = s;
            }
        },
        refresh: function (deep) {
            this.maxScrollY = this.isWindow ? window.innerHeight - document.body.offsetHeight : this.wapper.offsetHeight - this.scroller.offsetHeight;
            this.maxScrollY = this.maxScrollY < 0 ? -this.maxScrollY : 0;

            this.pullUpRefreshing = this.pullDownRefreshing = false;
            this.ratio = 0;
        },
        pullUpOver: function (isEnd) {
            if (isEnd) {
                this._setTipsStyle('u2')
                this.pullUpEnd = true;
            } else {
                this._setTipsStyle('u1');
                this.pullUpEnd = false;
            }
            this.refresh();
        },
        pullDownOver: function (isEnd) {
            this.pullUpOver(isEnd);
            this._setTipsStyle('d1');
            this.refresh();
        },
        _drawCircle: function (rate, direction) {
            if (this.pullUpRefreshing || this.pullDownRefreshing) return;
            var canvas, p = (Math.PI * 2) / 360, context;
            if (direction === 1) {
                canvas = this.pullDownCanvas
            } else {
                canvas = this.pullUpCanvas
            }
            rate = rate >= 100 ? 100 : rate <= 0 ? 0 : rate;
            if (canvas.getContext) {
                context = canvas.getContext("2d");
                context.beginPath();
                context.clearRect(0, 0, 100, 100);
                context.strokeStyle = this.opts.borderColor;
                context.lineWidth = 12;
                context.arc(50, 50, 43, -80 * p, (3.4 * rate - 80) * p, false);
                context.stroke();
            }
        },
        scrollTo: function (s) {
            this.setScrollTop(s);
        },
        _setTipsStyle: function (type) {
            switch (type) {
                case 'u1':
                    this.pullUpTips.innerHTML = this.opts.PULLUPTIPS;
                    this.pullUpCanvas.style.display = 'block';
                    this.pullUpBox.style.display = 'block';
                    break;
                case 'u2':
                    this.pullUpTips.innerHTML = this.opts.PULLUPEND;
                    this.pullUpCanvas.style.display = 'none';
                    this.pullUpBox.style.display = 'block';
                    break;
                case 'u3':
                    this.pullUpBox.style.display = 'none';
                    break;
                case 'd1':
                    var ds = this.pullDownBox.style;
                    this.pullDownTips.innerHTML = this.opts.PULLDOWNTIPS;
                    ds.opacity = 0;
                    ds.display = 'none';
                    this.pullDownCanvas.classList.remove('circle-ani');
                    this._drawCircle(0, 1);
                    break;
                case 'd2':
                    var ds = this.pullDownBox.style;
                    ds.opacity = this.ratio
                    ds.display = 'block';
                    this._drawCircle(this.ratio * 100, 1);
                    break;
                case 'd3':
                    this.pullDownTips.innerHTML = this.opts.PULLDOWNTIPS2;
                    this._drawCircle(100, 1);
                    break;
                case 'd4':
                    this.pullDownTips.innerHTML = this.opts.PULLDOWNTIPS3;
                    this.pullDownBox.style.display = 'block';
                    this.pullDownCanvas.classList.add('circle-ani');
                    this._drawCircle(100, 1);
                    break;
            }
        },

        _move: function (e) {
            if (this.pullDownRefreshing || this.pullUpRefreshing) return;
            if (e.direction === 'down' && this.getScrollTop() === 0) {
                this.ratio = Math.abs(e.y) / this.opts.animateSpeed;
                this.ratio = this.ratio > 1 ? 1 : this.ratio;
                if (this.ratio >= 1) {
                    this._setTipsStyle('d3');
                } else {
                    this._setTipsStyle('d2');
                }
            } else {
                this.ratio = 0;
                this._setTipsStyle('d1');
            }

        },

        _end: function (e) {
            if (this.pullDownRefreshing || this.pullUpRefreshing) return;
            if (this.ratio >= 1) {
                this._setTipsStyle('d4');
                this.opts.pullDownCallBack && this.opts.pullDownCallBack();
                this.pullDownRefreshing = true;
            } else {
                this._setTipsStyle('d1');
            }

        },
        handleEvent: function (e) {
            if (this.pullDownRefreshing) {
                this._setTipsStyle('u3')
            }
            if (this.pullDownRefreshing || this.pullUpRefreshing) return;
            if (this.getScrollTop() >= this.maxScrollY - this.pullUpBoxHeight && !this.pullUpEnd) {
                this.pullUpRefreshing = true;
                this.opts.pullUpCallBack && this.opts.pullUpCallBack();
            }
            this.opts.scroll && this.opts.scroll();
        }

    };

    window.NativeRefresh = NativeRefresh;
})();