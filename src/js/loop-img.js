/**
 * Created by wq on 2017/4/6.
 */
(function(){
    function LoopImg(el, opts) {
        this.rootEl = typeof el === "string" ? document.querySelector(el) : el;
        this.wrapper = this.rootEl.querySelector('.loop-wrapper');
        this.wrapperStyle = this.wrapper.style;

        this.options = {
            slideTime: 350,
            autoPlayTime: 5000,
            autoPlay: false,
            loop: false,
            pagination: false,
            bezier: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }

        xy.utils.extend(this.options, opts);
        //防止错位设置
        this.options.autoPlayTime = this.options.autoPlayTime < 3000 ? 3000 : this.options.autoPlayTime;

        this.x = 0;
        this.index = 0;
        this.animating = false;

        this._init();
    }

    LoopImg.prototype = {
        version: "1.0.0",
        _init: function () {
            var _this = this, addEvent = function (a, b, c) {
                a.addEventListener(b, c, false);
            };

            this.style = {
                transform: xy.utils.prefixStyle("transform"),
                transitionTimingFunction: xy.utils.prefixStyle('transitionTimingFunction'),
                transitionDuration: xy.utils.prefixStyle('transitionDuration'),
                transitionDelay: xy.utils.prefixStyle('transitionDelay'),
                transformOrigin: xy.utils.prefixStyle('transformOrigin')
            }

            touch.on(this.wrapper, "dragstart", function (ev) {
                if (_this.options.autoPlay) _this.play(false);
                if (_this.animating) return;
                _this.startTime = new Date().getTime();
            });

            touch.on(this.wrapper, "drag", function (ev) {
                ev.stopPropagation();
                if (_this._overTthreshold(ev.angle)) return;
                if (_this.animating) return;
                if (new Date().getTime() - _this.startTime > 300) _this.startTime = new Date().getTime();
                _this._drag.call(_this, ev);
            });

            touch.on(this.wrapper, "dragend", function (ev) {
                if (_this.options.autoPlay) _this.play(true);
                if (new Date().getTime() - _this.startTime < 300)
                    _this._swipeEnd.call(_this, ev);
                else
                    _this._dragEnd.call(_this, ev);
            });

            addEvent(this.wrapper, 'transitionend', this);
            addEvent(this.wrapper, 'webkitTransitionEnd', this);
            addEvent(this.wrapper, 'oTransitionEnd', this);
            addEvent(this.wrapper, 'MSTransitionEnd', this);
            addEvent(window, 'orientationchange', this);
            addEvent(window, 'resize', this);

            this.resize();


            this.options.pagination && this._initPagination();
            this.options.autoPlay && this._autoPlay();
        },
        resize: function () {
            var i = this.wrapper.querySelectorAll('.loop-slider');
            if (!i) return;
            i = i.length;

            //只有一个slide
            if (i === 1) {
                this.options.autoPlay = false;
                this.options.loop = false;
            }
            //增加首尾元素
            if (this.options.loop && !this.hasAddEl) {
                this.hasAddEl = true;
                this.sliders = this.wrapper.querySelectorAll('.loop-slider');
                this.wrapper.appendChild(this.sliders[0].cloneNode(true));
                this.wrapper.insertBefore(this.sliders[this.sliders.length - 1].cloneNode(true), this.sliders[0]);
                this.index = 1;
            }
            //初始化参数和状态
            this.sliders = this.wrapper.querySelectorAll('.loop-slider');
            this.slidersNumb = this.sliders.length;
            this.sliderLength = parseInt(this.rootEl.offsetWidth);
            this.wrapperStyle.width = this.slidersNumb * this.sliderLength + "px";
            this.maxSlideX = -this.sliderLength * (this.slidersNumb - 1);
            this.x = -this.index * this.sliderLength;

            for (i = 0; i < this.slidersNumb; i++) {
                this.sliders[i].style.width = this.sliderLength + "px";
            }

            this.wrapperStyle[this.style.transitionTimingFunction] = this.options.bezier;

            this.scrollTo(this.x, 0, 0);
        },
        _overTthreshold: function (angle) {
            if (angle > 30 && angle < 150 || angle > -150 && angle < -30) return true;
            return false;
        },
        _drag: function (ev) {
            var x = ev.x, y = ev.y, absX = Math.abs(x);
            if (absX >= this.sliderLength) x = x / absX * this.sliderLength;

            if (this.style.transform) {
                x = this.x + x > 0 ? x / 3 : this.x + x < this.maxSlideX ? x / 3 : x;
                this.wrapperStyle[this.style.transform] = "translate(" + (this.x + x) + "px,0px) translateZ(0)";
            } else {
                //TODO: solve no transform
            }
        },

        _dragEnd: function (ev) {
            var x = ev.x, y = ev.y, absX = Math.abs(x);
            if (absX >= this.sliderLength) x = x / absX * this.sliderLength;
            this.x += x;
            this.x = this.x > 0 ? 0 : this.x < this.maxSlideX ? this.maxSlideX : this.x;
            this.index = Math.round(-this.x / this.sliderLength);
            this.scrollTo(-this.index * this.sliderLength, 0, this.options.slideTime);
        },
        _swipeEnd: function (ev) {
            if (ev.direction === "left") {
                this.index = this.index === this.slidersNumb - 1 ? this.slidersNumb - 1 : this.index + 1;
                this.scrollTo(-this.index * this.sliderLength, 0, this.options.slideTime);
            } else {
                this.index = this.index === 0 ? 0 : this.index - 1;
                this.scrollTo(-this.index * this.sliderLength, 0, this.options.slideTime);
            }
        },

        scrollTo: function (x, y, time) {
            var _this = this;
            this.animating = true;
            this.x = x;
            this.index = Math.round(-x / this.sliderLength);
            this.wrapperStyle[this.style.transitionDuration] = time + "ms";
            this.wrapperStyle[this.style.transform] = "translate(" + x + "px,0px) translateZ(0)";

            setTimeout(function () {
                _this._scrollEnd.call(_this);
            }, time)
        },

        _scrollEnd: function () {
            this.wrapperStyle[this.style.transitionDuration] = "0ms";
            this.wrapperStyle[this.style.transform] = "translate(" + this.x + "px,0px) translateZ(0)";
            //无限自动播放
            if (this.options.loop && this.index === this.slidersNumb - 1) {
                this.index = 1;
                this.x = -this.sliderLength;
                this.wrapperStyle[this.style.transform] = "translate(" + this.x + ",0px) translateZ(0)";
            } else if (this.options.loop && this.index === 0) {
                this.index = this.slidersNumb - 2;
                this.x = -this.index * this.sliderLength;
                this.wrapperStyle[this.style.transform] = "translate(" + this.x + ",0px) translateZ(0)";
            }
            this.options.pagination && this._updatePaginationIndex();
            this.animating = false;
        },

        _autoPlay: function () {
            var _this = this,
                autoPlay = function () {
                    if (!this.options.loop && this.index === this.slidersNumb - 1) {
                        this.index = 0;
                        this.x = 0;
                        this.scrollTo(0, 0, this.options.slideTime);
                        this.timer = setTimeout(call, this.options.autoPlayTime);
                    } else {
                        this._swipeEnd({direction: "left"});
                        this.timer = setTimeout(call, this.options.autoPlayTime);
                    }
                },
                call = function () {
                    autoPlay.call(_this);
                }

            this.timer = setTimeout(call, this.options.autoPlayTime);

        },
        _initPagination: function () {
            var i = 0, len, str;
            len = this.wrapper.querySelectorAll('.loop-slider').length;
            if (this.options.loop) len = len - 2;
            str = '<div class="loop-pagination-box">';
            for (; i < len; i++) {
                str += '<span class="loop-pagination"></span>';
            }
            str += '</div>>';
            this.rootEl.appendChild(xy.html(str));
            return this;
        },
        _updatePaginationIndex: function () {
            var paginations = this.rootEl.querySelectorAll('.loop-pagination'),
                len = paginations.length, i = 0;

            for (; i < len; i++) {
                paginations[i].classList.remove('active');
            }
            if (this.options.loop)
                paginations[this.index - 1].classList.add('active');
            else
                paginations[this.index].classList.add('active');

        },
        play: function (bl) {
            if (bl) {
                this._autoPlay();
            } else {
                clearTimeout(this.timer);
            }
        },
        handleEvent: function (ev) {
            switch (ev.type) {
                case 'orientationchange':
                case 'resize':
                    this.resize(ev);
                    break;
                case 'transitionend':
                case 'webkitTransitionEnd':
                case 'oTransitionEnd':
                case 'MSTransitionEnd':
                    this._scrollEnd(ev);
                    break;
            }
        }
    }
    window.LoopImg = LoopImg;
})();