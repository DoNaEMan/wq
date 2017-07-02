/**
 * Created by wq on 2017/5/16.
 */
(function (window, document, Math, utils) {
	var BdScroll = function (el, options) {
		this.wrapper = typeof el === 'string' ? document.querySelector(el) : el;
		this.scroller = this.wrapper.querySelector('.scroller') || this.wrapper.children[0];
		this.upTips = this.wrapper.querySelector('#pullDown');
		this.scrollerStyle = this.scroller.style;
		this.upTipsStyle = this.upTips.style;
		this.forTheMoment = 40;

		this.options = {
// INSERT POINT: OPTIONS
			disablePointer: !utils.hasPointer,
			disableTouch: utils.hasPointer || !utils.hasTouch,
			disableMouse: utils.hasPointer || utils.hasTouch,
			startY: 0,
			scrollY: true,
			directionLockThreshold: 5,
			momentum: true,

			bounce: true,
			bounceTime: 600,
			bounceEasing: '',

			HWCompositing: true,
			useTransition: true,
			useTransform: true,
			bindToWrapper: true/*typeof window.onmousedown === "undefined"*/
		};

		for (var i in options) {
			this.options[i] = options[i];
		}

		// Normalize options
		this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

		this.options.useTransition = utils.hasTransition && this.options.useTransition;
		this.options.useTransform = utils.hasTransform && this.options.useTransform;

		this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;

		// If you want eventPassthrough I have to lock one of the axes
		this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
		this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

		// With eventPassthrough we also need lockDirection mechanism
		this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
		this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

		this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

		this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

		if (this.options.tap === true) {
			this.options.tap = 'tap';
		}


// INSERT POINT: NORMALIZATION

		// Some defaults
		this.y = 0;
		this._events = {};

// INSERT POINT: DEFAULTS

		this._init();
		this.refresh();

		//this._scrollTo(this.options.startX, this.options.startY);
		this.enable()
	}

	BdScroll.prototype = {

		_init: function () {
			this._initEvents();
// INSERT POINT: _init
			this._initIcon();

			this._prevent = function (e) {
				e.preventDefault();
			}

		},

		destroy: function () {
			this._initEvents(true);
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = null;
			this._execEvent('destroy');
		},

		_transitionEnd: function (e) {
			if (!this.isInTransition) {
				return;
			}

			this._transitionTime();
			this.isInTransition = false;
		},

		_locked: function () {
			if (this.locking) return;
			this.locking = true;
			document.addEventListener('touchmove', this._prevent, false);
		},

		_unlocked: function () {
			if (!this.locking) return;
			this.locking = false;
			document.removeEventListener('touchmove', this._prevent, false);
		},

		disable: function () {
			this.enabled = false;
		},

		enable: function () {
			this.enabled = true;
		},

		_start: function (e) {
			if (!this.enabled) return;
			var point = e.touches ? e.touches[0] : e,
				pos;
			this.moved = true;
			if (this.options.useTransition && this.isInTransition) {
				this._transitionTime();
				this.isInTransition = false;
				pos = this.getComputedPosition();
				this._translate(0, Math.round(pos.y));
			} else if (!this.options.useTransition && this.isAnimating) {
				this.isAnimating = false;
			}

			this.startY = this.y;
			this.pointY = point.pageY;
			this.startPointY = point.pageY;
		},

		_move: function (e) {
			if (!this.enabled) return;
			var point = e.touches ? e.touches[0] : e,
				deltaY = point.pageY - this.pointY,
				distance = point.pageY - this.startPointY,
				newY = this.y + deltaY / 2;

			this.pointY = point.pageY;

			if (distance > 3 && document.body.scrollTop === 0) {
				this._locked();
				this._translate(0, newY);
				this.draw(1, (this.y - 10) / 40 * 100);
				if (this.y > this.forTheMoment + 10) {
					this.changePullTip('d2');
				} else {
					this.changePullTip('d1');
				}
			}
		},

		_end: function (e) {
			if (!this.enabled) return;
			var point = e.changedTouches ? e.changedTouches[0] : e;
			this._unlocked();
			if (this.y > this.forTheMoment + 10) {
				this.disable();
				this.changePullTip('d3');
				this.downrefreshing = true;
				this.resetPosition(0, this.forTheMoment, this.options.bounceTime);
				this.options.pullDownFn && this.options.pullDownFn();
			} else {
				if (this.y === 0) return;
				this.resetPosition(0, 0, this.options.bounceTime);
				this.draw(1, 0);
			}
		},

		_scroll: function (e) {
			if (!this.uprefreshing && !this.downrefreshing && this.moved && document.body.scrollTop >= document.body.offsetHeight - this.windowHeight - 80) {
				this.draw(2, 100);
				this.changePullTip('u3');
				this.uprefreshing = true;
				this.options.pullUpFn && this.options.pullUpFn();
			}
		},

		_resize: function () {
			var that = this;

			clearTimeout(this.resizeTimeout);

			this.resizeTimeout = setTimeout(function () {
				that.refresh();
			}, this.options.resizePolling);
		},

		resetPosition: function (x, y, time) {
			this._scrollTo(0, y, time, this.options.bounceEasing);
		},

		_translate: function (x, y) {
			if (this.options.useTransform) {
				this.scrollerStyle[utils.style.transform] = 'translate(0px,' + y + 'px)' + this.translateZ;
			} else {
				y = Math.round(y);
				this.scrollerStyle.top = y + 'px';
			}
			this.y = y;
		},

		_initIcon: function () {
			var d = this.wrapper.querySelector('#pullDown .pullDownIcon');
			var u = this.wrapper.querySelector('#pullUp .pullUpIcon');
			u.innerHTML = d.innerHTML = '<canvas height="100" width="100" style="width:100%;height:100%;position: absolute;top:0;left:0"></canvas>';
			this.dc = this.wrapper.querySelector('#pullDown canvas');
			this.uc = this.wrapper.querySelector('#pullUp canvas');
			this.d = this.wrapper.querySelector('#pullDown .pullDownLabel');
			this.u = this.wrapper.querySelector('#pullUp .pullUpLabel');
			if (this.d.getContext) {
				this.noCanvs = true;
			} else {
				this.dcc = this.dc.getContext('2d');
				this.ucc = this.uc.getContext('2d');
			}

			if (!this.options.useTransform) {
				this.scrollerStyle.position = 'relative';
			}

			this.p = (Math.PI * 2) / 360;
			this.changePullTip('u1');
			this.draw(2, 100);
		},

		draw: function (direction, rate) {
			if (this.noCanvs || rate < 0) return
			var p = this.p;
			var c = null;
			var _this = this;
			if (direction === 1) {
				c = this.dcc;
			} else {
				c = this.ucc;
			}
			rAF(function () {
				rate = rate >= 100 ? 100 : rate <= 0 ? 0 : rate;
				c.beginPath();
				c.clearRect(0, 0, 100, 100);
				c.strokeStyle = '#ffffff';
				c.lineWidth = 12;
				c.arc(50, 50, 43, 0, 360 * p, false);
				c.stroke();
				c.beginPath();
				c.strokeStyle = '#0394fb';
				c.lineWidth = 12;
				c.arc(50, 50, 43, -80 * p, (3.4 * rate - 80) * p, false);
				c.stroke();
			})
		},

		changePullTip: function (type) {
			var d = this.d;
			var u = this.u;
			var dc = this.dc;
			var uc = this.uc;
			switch (type) {
				case 'd1':
					d.innerHTML = '继续下拉刷新';
					utils.removeClass(dc, 'circle-ani');
					break;
				case 'd2':
					d.innerHTML = '松手即可刷新';
					break;
				case 'd3':
					d.innerHTML = '正在刷新中...';
					utils.addClass(dc, 'circle-ani');
					break;
				case 'u1':
					u.innerHTML = '拉动加载更多';
					utils.removeClass(uc, 'circle-ani');
					break;
				case 'u2':
					u.innerHTML = '松手即可加载';
					break;
				case 'u3':
					u.innerHTML = '正在加载中...';
					utils.addClass(uc, 'circle-ani');
					break;
				case 'u4':
					u.innerHTML = '全部加载完毕';
					utils.removeClass(uc, 'circle-ani');
					break;

			}
			return this;
		},

		refresh: function (nomore) {
			this.moved = false;
			this.windowHeight = window.innerHeight || document.documentElement.clientHeight;

			if (this.downrefreshing) {
				this.enable();
				this.downrefreshing = false;
				this.resetPosition(0, 0, this.options.bounceTime);
			}
			if (this.uprefreshing) {
				this.enable();
				this.uprefreshing = false;
			}

			if (nomore) {
				this.uprefreshing = true;
				this.changePullTip('u4');
				this.draw(2, 0);
			} else {
				this.uprefreshing = false;
				this.changePullTip('u3');
				this.draw(2, 100);
			}

		},

		on: function (type, fn) {
			if (!this._events[type]) {
				this._events[type] = [];
			}

			this._events[type].push(fn);
		},

		off: function (type, fn) {
			if (!this._events[type]) {
				return;
			}

			var index = this._events[type].indexOf(fn);

			if (index > -1) {
				this._events[type].splice(index, 1);
			}
		},

		_execEvent: function (type) {
			if (!this._events[type]) {
				return;
			}

			var i = 0,
				l = this._events[type].length;

			if (!l) {
				return;
			}

			for (; i < l; i++) {
				this._events[type][i].apply(this, [].slice.call(arguments, 1));
			}
		},

		scrollTo: function (x, y, time) {
			if (time) {
				if (y === document.body.scrollTop) return;
				this._animate(0, y, time, utils.ease.circular.fn, true);
			} else {
				window.scrollTo(x, y);
			}
		},

		scrollBy: function (x, y, time) {
			y = document.body.scrollTop + y;
			if (time) {
				this._animate(0, y, time, utils.ease.circular.fn, true);
			} else {
				window.scrollTo(x, y);
			}
		},

		_scrollTo: function (x, y, time, easing) {
			easing = easing || utils.ease.circular;

			this.isInTransition = this.options.useTransition && time > 0;
			var transitionType = this.options.useTransition && easing.style;
			if (!time || transitionType) {
				if (transitionType) {
					this._transitionTimingFunction(easing.style);
					this._transitionTime(time);
				}
				this._translate(x, y);
			} else {
				this._animate(x, y, time, easing.fn);
			}
		},

		_transitionTime: function (time) {
			time = time || 0;

			var durationProp = utils.style.transitionDuration;
			this.scrollerStyle[durationProp] = time + 'ms';

			if (!time && utils.isBadAndroid) {
				this.scrollerStyle[durationProp] = '0.0001ms';
				// remove 0.0001ms
				var self = this;
				rAF(function () {
					if (self.scrollerStyle[durationProp] === '0.0001ms') {
						self.scrollerStyle[durationProp] = '0s';
					}
				});
			}

		},

		_transitionTimingFunction: function (easing) {
			this.scrollerStyle[utils.style.transitionTimingFunction] = easing;

		},

		_initEvents: function (remove) {
			var eventType = remove ? utils.removeEvent : utils.addEvent,
				target = this.options.bindToWrapper ? this.wrapper : window;

			eventType(window, 'orientationchange', this);
			eventType(window, 'resize', this);

			if (this.options.click) {
				eventType(this.wrapper, 'click', this, true);
			}

			if (!this.options.disableMouse) {
				eventType(this.wrapper, 'mousedown', this);
				eventType(target, 'mousemove', this);
				eventType(target, 'mousecancel', this);
				eventType(target, 'mouseup', this);
			}

			if (utils.hasPointer && !this.options.disablePointer) {
				eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
				eventType(target, utils.prefixPointerEvent('pointermove'), this);
				eventType(target, utils.prefixPointerEvent('pointercancel'), this);
				eventType(target, utils.prefixPointerEvent('pointerup'), this);
			}

			if (utils.hasTouch && !this.options.disableTouch) {
				eventType(this.wrapper, 'touchstart', this);
				eventType(target, 'touchmove', this);
				eventType(target, 'touchcancel', this);
				eventType(target, 'touchend', this);
			}

			eventType(this.scroller, 'transitionend', this);
			eventType(this.scroller, 'webkitTransitionEnd', this);
			eventType(this.scroller, 'oTransitionEnd', this);
			eventType(this.scroller, 'MSTransitionEnd', this);
			eventType(window, 'scroll', this);
		},

		getComputedPosition: function () {
			var matrix = window.getComputedStyle(this.scroller, null), y;
			if (this.options.useTransform) {
				matrix = matrix[utils.style.transform].split(')')[0].split(', ');
				y = +(matrix[13] || matrix[5]);
			} else {
				y = +matrix.top.replace(/[^-\d.]/g, '');
			}

			return {y: y};
		},
		_animate: function (destX, destY, duration, easingFn, win) {
			var that = this,
				startY = this.y,
				startTime = utils.getTime(),
				destTime = startTime + duration;

			if(win){
				startY = document.body.scrollTop;
			}

			function step() {
				var now = utils.getTime(),
					newY,
					easing;

				if (now >= destTime) {
					that.isAnimating = false;
					if (win) {
						window.scrollTo(0, destY);
					} else {
						that._translate(0, destY);
					}
					return;
				}
				now = ( now - startTime ) / duration;

				easing = easingFn(now);
				newY = ( destY - startY ) * easing + startY;
				if (win) {
					window.scrollTo(0, newY);
				} else {
					that._translate(0, destY);
				}

				if (that.isAnimating) {
					rAF(step);
				}
			}

			this.isAnimating = true;
			step();
		},
		handleEvent: function (e) {
			switch (e.type) {
				case 'touchstart':
				case 'pointerdown':
				case 'MSPointerDown':
				case 'mousedown':
					this._start(e);
					break;
				case 'touchmove':
				case 'pointermove':
				case 'MSPointerMove':
				case 'mousemove':
					this._move(e);
					break;
				case 'touchend':
				case 'pointerup':
				case 'MSPointerUp':
				case 'mouseup':
				case 'touchcancel':
				case 'pointercancel':
				case 'MSPointerCancel':
				case 'mousecancel':
					this._end(e);
					break;
				case 'orientationchange':
				case 'resize':
					this._resize();
					break;
				case 'transitionend':
				case 'webkitTransitionEnd':
				case 'oTransitionEnd':
				case 'MSTransitionEnd':
					this._transitionEnd(e);
					break;
				case 'scroll':
					this._scroll(e);
					if (this.options.onScroll) {
						this.options.onScroll(e);
					}
					break;
				case 'click':
					if (!e._constructed) {
						e.preventDefault();
						e.stopPropagation();
					}
					break;
			}
		}
	}

	if (typeof module != 'undefined' && module.exports) {
		module.exports = BdScroll;
	} else {
		window.BdScroll = BdScroll;
	}
})(window, document, Math, utils);