/**
 * Created by wq on 2017/4/6.
 */
(function () {
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
            ease: {
                style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fn: function (k) {
                    return k * ( 2 - k );
                }
            }
        }

        xy.utils.extend(this.options, opts);
        //防止错位设置
        this.options.autoPlayTime = this.options.autoPlayTime < 3000 ? 3000 : this.options.autoPlayTime;

        this.x = 0;
        this.y = 0;
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
                transform: xy.utils.prefixStyle('transform'),
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
            this.sliderHeight = parseInt(this.rootEl.offsetHeight);
            this.sliderWidth = parseInt(this.rootEl.offsetWidth);

            for (i = 0; i < this.slidersNumb; i++) {
                this.sliders[i].style.width = this.sliderWidth + "px";
                this.sliders[i].style.height = this.sliderHeight + "px";
                //y 方向清除浮动
                if (this.options.direction == 'y') {
                    this.sliders[i].style.float = "none";
                }
            }

            if (this.options.direction == 'y') {
                this.wrapperStyle.width = this.sliderWidth + "px";
                this.wrapperStyle.height = this.slidersNumb * this.sliderHeight + "px";
                this.maxSlideX = 0;
                this.maxSlideY = -this.sliderHeight * (this.slidersNumb - 1);
                this.y = -this.index * this.sliderHeight;
            } else {
                this.wrapperStyle.height = this.sliderHeight + "px";
                this.wrapperStyle.width = this.slidersNumb * this.sliderWidth + "px";
                this.maxSlideY = 0;
                this.maxSlideX = -this.sliderWidth * (this.slidersNumb - 1);
                this.x = -this.index * this.sliderWidth;
            }

            this.wrapperStyle[this.style.transitionTimingFunction] = this.options.ease.style;

            this.scrollTo(this.x, this.y);
        },
        _drag: function (ev) {
            var x = 0, y = 0, absX, absY;
            if (this.options.direction == 'y') {
                y = ev.y;
                absY = Math.abs(y);
                /*最多只能打拉动一个slider*/
                if (absY >= this.sliderHeight) y = y / absY * this.sliderHeight;
                y = this.y + y > 0 ? this.y + y / 3 : this.y + y < this.maxSlideY ? this.y + y / 3 : this.y + y;
            } else {
                x = ev.x;
                absX = Math.abs(x);
                if (absX >= this.sliderWidth) x = x / absX * this.sliderWidth;
                x = this.x + x > 0 ? this.x + x / 3 : this.x + x < this.maxSlideX ? this.x + x / 3 : this.x + x;
            }

            this._translate(x, y);
        },

        _dragEnd: function (ev) {
            var x = 0, y = 0, absX, absY;
            if (this.options.direction == 'y') {
                y = ev.y;
                absY = Math.abs(y);
                if (absY >= this.sliderHeight) y = y / absY * this.sliderHeight;
                y = this.y + y;
                this.y = y > 0 ? 0 : y < this.maxSlideY ? this.maxSlideY : y;
                this.index = Math.round(-y / this.sliderHeight);
                y = -this.index * this.sliderHeight;
            } else {
                x = ev.x;
                absX = Math.abs(x);
                if (absX >= this.sliderWidth) x = x / absX * this.sliderWidth;
                x = this.x + x;
                x = x > 0 ? 0 : x < this.maxSlideX ? this.maxSlideX : x;
                this.index = Math.round(-x / this.sliderWidth);
                x = -this.index * this.sliderWidth;
            }

            this.scrollTo(x, y, this.options.slideTime);
        },

        _swipeEnd: function (ev) {
            var x = 0, y = 0;
            if (this.options.direction == 'y') {
                if (ev.direction === "up") {
                    this.index = this.index === this.slidersNumb - 1 ? this.slidersNumb - 1 : this.index + 1;
                } else if (ev.direction === "down") {
                    this.index = this.index === 0 ? 0 : this.index - 1;
                }
                y = -this.index * this.sliderHeight;
            } else {
                if (ev.direction === "left") {
                    this.index = this.index === this.slidersNumb - 1 ? this.slidersNumb - 1 : this.index + 1;
                } else if (ev.direction === "right") {
                    this.index = this.index === 0 ? 0 : this.index - 1;
                }
                x = -this.index * this.sliderWidth;
            }
            this.scrollTo(x, y, this.options.slideTime);
        },

        scrollTo: function (x, y, time) {
            var _this = this;
            this.animating = true;
            this.x = x;
            this.y = y;
            if (this.options.direction == 'y') {
                this.index = Math.round(-y / this.sliderHeight);
            } else {
                this.index = Math.round(-x / this.sliderWidth);
            }

            if (this.style.transform) {
                this.wrapperStyle[this.style.transitionDuration] = (time || 0) + "ms";
                this._translate(x, y);
            } else {
                this._animate(x, y, time, this.options.ease.fn);
            }

            setTimeout(function () {
                _this._scrollEnd.call(_this);
            }, time)
        },

        _animate: function (destX, destY, duration, easingFn) {
            var that = this,
                tmp = this.getComputedPosition(),
                startX = tmp.x,
                startY = tmp.y,
                startTime = new Date().getTime(),
                destTime = startTime + duration;

            function step() {
                var now = new Date().getTime(),
                    newX, newY,
                    easing;

                if (now >= destTime) {

                    that._translate(destX, destY);
                    that.animating = false;

                    return;
                }

                now = ( now - startTime ) / duration;
                easing = easingFn(now);
                newX = ( destX - startX ) * easing + startX;
                newY = ( destY - startY ) * easing + startY;
                that._translate(newX, newY);

                if (that.isAnimating) {
                    rAF(step);
                }
            }

            this.isAnimating = true;
            step();
        },

        getComputedPosition: function () {
            var matrix = window.getComputedStyle(this.wrapper, null),
                x, y;

            if (this.style.transform) {
                matrix = matrix[this.style.transform].split(')')[0].split(', ');
                x = +(matrix[12] || matrix[4]);
                y = +(matrix[13] || matrix[5]);
            } else {
                x = +matrix.left.replace(/[^-\d.]/g, '');
                y = +matrix.top.replace(/[^-\d.]/g, '');
            }

            return {x: x, y: y};
        },

        _translate: function (x, y) {
            if (this.options.direction == 'y') {
                x = 0
            } else {
                y = 0
            }
            if (this.style.transform) {
                this.wrapperStyle[this.style.transform] = 'translate(' + x + 'px,' + y + 'px) translateZ(0)';
            } else {
                x = Math.round(x);
                y = Math.round(y);
                this.wrapperStyle.left = x + 'px';
                this.wrapperStyle.top = y + 'px';
            }
        },

        _scrollEnd: function () {
            //无限自动播放
            if (this.options.loop && this.index === this.slidersNumb - 1) {
                this.index = 1;
            } else if (this.options.loop && this.index === 0) {
                this.index = this.slidersNumb - 2;

            }

            if (this.options.direction == 'y') {
                this.y = -this.index * this.sliderHeight;
            } else {
                this.x = -this.index * this.sliderWidth;
            }

            this.wrapperStyle[this.style.transitionDuration] = "";
            this._translate(this.x, this.y);
            this.options.pagination && this._updatePaginationIndex();
            this.animating = false;
        },

        _autoPlay: function () {
            var _this = this,
                autoPlay = function () {
                    if (!this.options.loop && this.index === this.slidersNumb - 1) {
                        this.index = 0;
                        this.x = 0;
                        this.y = 0;
                        this.scrollTo(0, 0, this.options.slideTime);
                        this.timer = setTimeout(call, this.options.autoPlayTime);
                    } else {
                        if(this.options.direction == 'y'){
                            this._swipeEnd({direction: "up"});
                        }else{
                            this._swipeEnd({direction: "left"});
                        }

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