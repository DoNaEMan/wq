/**
 * Created by wq on 2017/5/16.
 */
(function (window, document, Math, utils) {
	var BdScroll = function (el, options) {
		this.wrapper = typeof el === 'string' ? document.querySelector(el) : el;
		this.scroller = this.wrapper.querySelector('.bd-scroller');
		this.upTips = this.wrapper.querySelector('#pullDown');
		this.scrollerStyle = this.scroller.style;
		this.upTipsStyle = this.upTips.style;
		this.forTheMoment = 40;

		this.options = {
// INSERT POINT: OPTIONS
			disablePointer: !utils.hasPointer,
			disableTouch: utils.hasPointer || !utils.hasTouch,
			disableMouse: utils.hasPointer || utils.hasTouch,
			startX: 0,
			startY: 0,
			scrollY: true,
			directionLockThreshold: 5,
			momentum: true,

			bounce: true,
			bounceTime: 600,
			bounceEasing: '',

			preventDefault: true,
			preventDefaultException: {tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/},

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
		if (!this.options.useTransform) {
			this.scrollerStyle.position = 'absolute';
			this.scrollerStyle.width = '100%';
		}

		this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
		this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

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
		this.x = 0;
		this.y = 0;
		this.directionX = 0;
		this.directionY = 0;
		this._events = {};

// INSERT POINT: DEFAULTS

		this._init();
		this.refresh();

		//this.scrollTo(this.options.startX, this.options.startY);
	}

	BdScroll.prototype = {

		_init: function () {
			this._initEvents();
// INSERT POINT: _init
			this._initIcon();

		},

		destroy: function () {
			this._initEvents(true);
			clearTimeout(this.resizeTimeout);
			this.resizeTimeout = null;
			this._execEvent('destroy');
		},

		_transitionEnd: function (e) {
			if (e.target != this.scroller || !this.isInTransition) {
				return;
			}

			this._transitionTime();
			if (!this.resetPosition(this.options.bounceTime)) {
				this.isInTransition = false;
				this._execEvent('scrollEnd');
			}
		},

		_start: function (e) {
			// React to left mouse button only
			if (utils.eventType[e.type] != 1) {
				// for button property
				// http://unixpapa.com/js/mouse.html
				var button;
				if (!e.which) {
					/* IE case */
					button = (e.button < 2) ? 0 :
						((e.button == 4) ? 1 : 2);
				} else {
					/* All others */
					button = e.button;
				}
				if (button !== 0) {
					return;
				}
			}

			if ((this.initiated && utils.eventType[e.type] !== this.initiated)) {
				return;
			}

			var point = e.touches ? e.touches[0] : e,
				pos;

			this.initiated = utils.eventType[e.type];
			this.moved = false;
			this.distX = 0;
			this.distY = 0;
			this.directionX = 0;
			this.directionY = 0;
			this.directionLocked = 0;

			this.startTime = utils.getTime();

			if (this.options.useTransition && this.isInTransition) {
				this._transitionTime();
				this.isInTransition = false;
				pos = this.getComputedPosition();
				this._translate(Math.round(pos.x), Math.round(pos.y));
				this._execEvent('scrollEnd');
			} else if (!this.options.useTransition && this.isAnimating) {
				this.isAnimating = false;
				this._execEvent('scrollEnd');
			}

			this.startX = this.x;
			this.startY = this.y;
			this.absStartX = this.x;
			this.absStartY = this.y;
			this.pointX = point.pageX;
			this.pointY = point.pageY;
			this.startPointY = point.pageY;
			this.startPointX = point.pageX;

			this._execEvent('beforeScrollStart');
		},

		_move: function (e) {
			if (utils.eventType[e.type] !== this.initiated) {
				return;
			}

			if (this.options.preventDefault) {	// increases performance on Android? TODO: check!
				e.preventDefault();
			}

			var point = e.touches ? e.touches[0] : e,
				deltaX = point.pageX - this.pointX,
				deltaY = point.pageY - this.pointY,
				timestamp = utils.getTime(),
				newX, newY,
				absDistX, absDistY;

			this.pointX = point.pageX;
			this.pointY = point.pageY;
			this.movePointY = point.pageY;
			this.movePointX = point.pageX;

			this.distX += deltaX;
			this.distY += deltaY;
			absDistX = Math.abs(this.distX);
			absDistY = Math.abs(this.distY);

			// We need to move at least 10 pixels for the scrolling to initiate
			/*if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
			 return;
			 }*/

			if (this.directionLocked == 'h') {
				if (this.options.eventPassthrough == 'vertical') {
					e.preventDefault();
				} else if (this.options.eventPassthrough == 'horizontal') {
					this.initiated = false;
					return;
				}

				deltaY = 0;
			} else if (this.directionLocked == 'v') {
				if (this.options.eventPassthrough == 'horizontal') {
					e.preventDefault();
				} else if (this.options.eventPassthrough == 'vertical') {
					this.initiated = false;
					return;
				}

				deltaX = 0;
			}

			deltaX = this.hasHorizontalScroll ? deltaX : 0;
			deltaY = this.hasVerticalScroll ? deltaY : 0;

			newX = this.x + deltaX;
			newY = this.y + deltaY;

			// Slow down if outside of the boundaries
			if (newX > 0 || newX < this.maxScrollX) {
				newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
			}
			if (newY > 0 || newY < this.maxScrollY) {
				newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
			}

			this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
			this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

			if (!this.moved) {
				this._execEvent('scrollStart');
			}

			this.moved = true;

			this._translate(newX, newY);

			/* REPLACE START: _move */

			if (this.options.probeType > 1) {
				this._execEvent('scroll')
			}

			this.pullAction();
			/* REPLACE END: _move */

		},

		_end: function (e) {
			if (utils.eventType[e.type] !== this.initiated) {
				return;
			}

			var point = e.changedTouches ? e.changedTouches[0] : e,
				momentumX,
				momentumY,
				duration = utils.getTime() - this.startTime,
				newX = Math.round(this.x),
				newY = Math.round(this.y),
				distanceX = Math.abs(newX - this.startX),
				distanceY = Math.abs(newY - this.startY),
				time = 0,
				easing = '';

			this.isInTransition = 0;
			this.initiated = 0;
			this.endTime = utils.getTime();

			// reset if we are outside of the boundaries
			if (this.resetPosition(this.options.bounceTime)) {
				return;
			}

			this.scrollTo(newX, newY);	// ensures that the last position is rounded

			// we scrolled less than 10 pixels
			if (!this.moved) {
				if (this.options.tap) {
					utils.tap(e, this.options.tap);
				}

				if (this.options.click) {
					utils.click(e);
				}

				this._execEvent('scrollCancel');
				return;
			}

			if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
				this._execEvent('flick');
				return;
			}

// INSERT POINT: _end

			if (newX != this.x || newY != this.y) {
				// change easing function when scroller goes out of the boundaries
				if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
					easing = utils.ease.quadratic;
				}

				this.scrollTo(newX, newY, time, easing);
				return;
			}

			//this._execEvent('scrollEnd');
		},

		_resize: function () {
			var that = this;

			clearTimeout(this.resizeTimeout);

			this.resizeTimeout = setTimeout(function () {
				that.refresh();
			}, this.options.resizePolling);
		},

		resetPosition: function (time) {
			var x = this.x,
				y = this.y;

			time = time || 0;

			if (!this.hasHorizontalScroll || this.x > 0) {
				x = 0;
			} else if (this.x < this.maxScrollX) {
				x = this.maxScrollX;
			}

			if (!this.hasHorizontalScroll || this.x > 0) {
				if (x > this.forTheMoment && !this.downrefreshing) {
					x = this.forTheMoment;
					this.downrefreshing = true;
					this.changePullTip('d3')
					this._execEvent('pullDownRight');
				} else if (!this.downrefreshing) {
					x = 0;
				} else {
					x = this.forTheMoment;
				}
			} else if (this.x < this.maxScrollX) {
				x = this.maxScrollX;
			}

			if (!this.hasVerticalScroll || this.y > 0) {
				if (y > this.forTheMoment && !this.downrefreshing) {
					y = this.forTheMoment;
					this.downrefreshing = true;
					this.changePullTip('d3')
					this._execEvent('pullDownRefresh');
				} else if (!this.downrefreshing) {
					y = 0;
				} else {
					y = this.forTheMoment;
				}
			} else if (this.y < this.maxScrollY) {
				y = this.maxScrollY;
			}

			if (x == this.x && y == this.y) {
				return false;
			}
			this.scrollTo(x, y, time, this.options.bounceEasing);

			return true;
		},

		_translate: function (x, y) {

			if (this.options.scrollY) {
				x = 0;
				//禁止默认
				if (document.body.scrollTop === 0 && this.y >= 0) {
					this.options.preventDefault = true;
					//容许默认
				} else {
					y = 0;
					this.options.preventDefault = false;
				}
				if (y <= 0) {
					y = 0;
				}
				//方向up,容许默认
				if (this.movePointY < this.startPointY) {
					this.options.preventDefault = false;
				}
				if (this.downrefreshing) {
					y = 40;
				}
			} else {
				y = 0;
				if (document.body.scrollLeft === 0 && this.x >= 0) {
					this.options.preventDefault = true;
				} else {
					x = 0;
					this.options.preventDefault = false;
				}
				if (x <= 0) {
					x = 0;
				}
				if (this.movePointX < this.startPointX) {
					this.options.preventDefault = false;
				}
				if (this.downrefreshing) {
					x = 40;
				}
			}

			if (this.options.useTransform) {

				/* REPLACE START: _translate */
				this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
				/* REPLACE END: _translate */

			} else {
				x = Math.round(x);
				y = Math.round(y);
				this.scrollerStyle.left = x + 'px';
				this.scrollerStyle.top = y + 'px';
			}

			this.x = x;
			this.y = y;

// INSERT POINT: _translate

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
			this.p = (Math.PI * 2) / 360;
		},

		pullAction: function () {
			this.draw(1, this.y / 40 * 100);
			if (this.downrefreshing) {
				this.changePullTip('d3');
				this.options.preventDefault = false;
			} else {
				if (this.y <= this.forTheMoment) {
					this.changePullTip('d1')
				} else {
					this.changePullTip('d2')
				}
			}
		},

		draw: function (direction, rate) {
			if (this.draw.ing && this.noCanvs) return
			this.draw.ing = true;
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
				_this.draw.ing = false;
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
					u.innerHTML = '上拉加载更多';
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
					this.draw(2, 0);
					break;

			}
			return this;
		},

		refresh: function (nomore) {
			this.hasHorizontalScroll = this.options.scrollX
			this.hasVerticalScroll = this.options.scrollY

			this.maxScrollTop = document.body.offsetHeight;
			this.maxScrollLeft = document.body.offsetWidth;

			this.maxScrollY = 0;
			this.maxScrollX = 0;

			this.endTime = 0;
			this.directionX = 0;
			this.directionY = 0;

			this._execEvent('refresh');
			if (this.downrefreshing) {
				this.downrefreshing = false;
				this.resetPosition(this.options.bounceTime);
			} else if (this.uprefreshing) {
				this.uprefreshing = true;
			} else {
				this.resetPosition();
			}

			if (nomore) {
				this.uprefreshing = true;
				this.changePullTip('u4');
			}
// INSERT POINT: _refresh

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

		scrollBy: function (x, y, time, easing) {
			x = this.x + x;
			y = this.y + y;
			time = time || 0;

			this.scrollTo(x, y, time, easing);
		},

		scrollTo: function (x, y, time, easing) {
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

		scrollToElement: function (el, time, offsetX, offsetY, easing) {
			el = el.nodeType ? el : this.scroller.querySelector(el);

			if (!el) {
				return;
			}

			var pos = utils.offset(el);

			pos.left -= this.wrapperOffset.left;
			pos.top -= this.wrapperOffset.top;

			// if offsetX/Y are true we center the element to the screen
			if (offsetX === true) {
				offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
			}
			if (offsetY === true) {
				offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
			}

			pos.left -= offsetX || 0;
			pos.top -= offsetY || 0;

			pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
			pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;

			time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;

			this.scrollTo(pos.left, pos.top, time, easing);
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

// INSERT POINT: _transitionTime

		},

		_transitionTimingFunction: function (easing) {
			this.scrollerStyle[utils.style.transitionTimingFunction] = easing;

// INSERT POINT: _transitionTimingFunction

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
		},

		getComputedPosition: function () {
			var matrix = window.getComputedStyle(this.scroller, null),
				x, y;

			if (this.options.useTransform) {
				matrix = matrix[utils.style.transform].split(')')[0].split(', ');
				x = +(matrix[12] || matrix[4]);
				y = +(matrix[13] || matrix[5]);
			} else {
				x = +matrix.left.replace(/[^-\d.]/g, '');
				y = +matrix.top.replace(/[^-\d.]/g, '');
			}

			return {x: x, y: y};
		},
		_animate: function (destX, destY, duration, easingFn) {
			var that = this,
				startX = this.x,
				startY = this.y,
				startTime = utils.getTime(),
				destTime = startTime + duration;

			function step() {
				var now = utils.getTime(),
					newX, newY,
					easing;

				if (now >= destTime) {
					that.isAnimating = false;
					that._translate(destX, destY);

					if (!that.resetPosition(that.options.bounceTime)) {
						that._execEvent('scrollEnd');
					}

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