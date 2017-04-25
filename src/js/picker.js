/**
 * Created by wq on 2017/4/25.
 */
pick = picker({
	//每个子picker的唯一键名 ['y','month','d','h','m','s'],['0', '1', '2']
	cols: ['y','month','d','h','m','s'],
	//类型 `time` `data`
	type: 'time',
	//联动 数据
	data: data,
	//`time` 默认值为当前时间
	dftsValue: {
		y: 2017,
		month: 2,
		d: 24,
		h: 20,
		m: 4,
		s: 50
	}
});

function picker(opts) {
	//picker
	var pickers = {},
		s = '',
		k = 0,
		d = new Date(),
		len = opts.cols.length;

	if (opts.type == 'time') {
		pickers.result = opts.dftsValue || {
				y: d.getFullYear(),
				month: d.getMonth() + 1,
				d: d.getDay(),
				h: d.getHours(),
				m: d.getMinutes(),
				s: d.getSeconds()
			};
		pickers.days = pickers.result.d;
	} else {
		pickers.result = {
			0: '',
			1: '',
			2: ''
		};
	}
	//创建scroll
	for (k = 0; k < len; k++) {
		s += '<div class="picker-wrapper' + k + '"><ul class="picker-scroll"></ul></div>';
	}
	document.querySelector('.picker-wrappers').innerHTML = s;
	s = null;

	for (k = 0; k < len; k++) {
		pickers[opts.cols[k]] = new IScroll('.picker-wrapper' + k, {
			picker: len,
			pos: opts.cols[k],
			data: opts.data,
			type: opts.type,
			appendBefore: 2,
			bounceTime: 250,
			//渲染当前scroll
			render: function () {
				var data = null
				var len;
				var i = 0;
				var str = '';
				var oLi = null;
				//前填充 两个 li
				for (i = 0; i < this.options.appendBefore; i++) {
					str += '<li></li>';
				}

				if (this.options.type == 'time' && this.options.pos == 'y') {
					//第几个有内容的li
					this.index = 100;
					for (i = pickers.result.y - 100; i < pickers.result.y + 100; i++) {
						str += '<li data-value="' + i + '">' + i + '年</li>';
					}
				} else if (this.options.type == 'time' && this.options.pos == 'month') {
					this.index = pickers.result.month - 1;
					for (i = 0; i < 12; i++) {
						str += '<li data-value="' + (i + 1) + '">' + (i + 1) + '月</li>';
					}
				} else if (this.options.type == 'time' && this.options.pos == 'd') {
					this.index = pickers.result.d - 1;
					pickers.days = howManyDays(pickers.result.y, pickers.result.month);
					for (i = 0; i < pickers.days; i++) {
						str += '<li data-value="' + (i + 1) + '">' + (i + 1) + '日</li>';
					}
				} else if (this.options.type == 'time' && this.options.pos == 'h') {
					this.index = pickers.result.h;
					for (i = 0; i < 24; i++) {
						str += '<li data-value="' + i + '">' + (i <= 9 ? '0' + i : i) + '时</li>';
					}
				} else if (this.options.type == 'time' && this.options.pos == 'm') {
					this.index = pickers.result.m;
					for (i = 0; i < 60; i++) {
						str += '<li data-value="' + i + '">' + (i <= 9 ? '0' + i : i) + '分</li>';
					}
				} else if (this.options.type == 'time' && this.options.pos == 's') {
					this.index = pickers.result.s;
					for (i = 0; i < 60; i++) {
						str += '<li data-value="' + i + '">' + (i <= 9 ? '0' + i : i) + '秒</li>';
					}
				} else if (this.options.type == 'data' && this.options.pos == '0') {
					data = this.options.data;
					len = data.length;
					this.index = 0;
					for (i = 0; i < len; i++) {
						str += '<li data-value="' + data[i].value + '">' + data[i].name + '</li>';
					}
				} else if (this.options.type == 'data' && this.options.pos == '1') {
					data = this.options.data[pickers[0].index].children;
					len = data && data.length;
					this.index = 0;
					if (len > 0) {
						for (i = 0; i < len; i++) {
							str += '<li data-value="' + data[i].value + '">' + data[i].name + '</li>';
						}
					}
				} else if (this.options.type == 'data' && this.options.pos == '2') {
					data = this.options.data[pickers[0].index].children;
					data = data && data[pickers[1].index].children;
					len = data && data.length;
					this.index = 0;
					if (len > 0) {
						for (i = 0; i < len; i++) {
							str += '<li data-value="' + data[i].value + '">' + data[i].name + '</li>';
						}
					}
				}

				//后填充 两个 li
				for (i = 0; i < this.options.appendBefore; i++) {
					str += '<li></li>';
				}

				this.wrapper.style.width = 1 / this.options.picker * 100 + '%';
				this.wrapper.querySelector('ul').innerHTML = str;
				oLi = this.wrapper.querySelectorAll('li');
				pickers.result[this.options.pos] = '';
				//下一级有内容
				if (oLi.length > 2 * this.options.appendBefore) {
					//oLi[this.index + this.options.appendBefore].classList.add('picker-active');
					pickers.result[this.options.pos] = oLi[this.index + this.options.appendBefore].dataset.value;
				}
			}
		});

		//当前月中的天数
		function howManyDays(y, m) {
			if (m == 2) {
				if (y % 4 == 0 && y % 100 != 0 || y % 400 == 0) {
					return 29;
				} else {
					return 28;
				}
			} else if ('1,3,5,7,8,10,12'.indexOf(m) > -1) {
				return 31;
			} else {
				return 30;
			}
		}

		//判断是否正在转...
		pickers.isSelecting = function () {
			for (var i in this) {
				if (typeof this[i] === 'object' && this[i].selecting) {
					return true;
				}
			}
			return false;
		}

		//刷新pick
		pickers.refresh = function () {
			for (var i in this) {
				if (typeof this[i] === 'object' && this[i].refresh) {
					this[i].refresh();
				}
			}
		}

		//滚动停止后设置选择中值
		function setValue() {
			//确认滚动到位了
			if (this.y % this.options.snapDis !== 0) {
				this.scrollTo(0, -Math.round(-this.y / this.options.snapDis) * this.options.snapDis, this.options.bounceTime, IScroll.utils.ease.quadratic)
			} else {
				var oLi , day;
				this.lastIndex = this.index;
				//定位
				this.index = Math.abs(this.y / this.options.snapDis);
				oLi = this.wrapper.querySelectorAll('li')[this.index + this.options.appendBefore];
				//oLi.classList.add('picker-active');

				//变更`日`数
				if (this.options.type == 'time') {
					pickers.result[this.options.pos] = Number(oLi.dataset.value);
					day = howManyDays(pickers.result.y, pickers.result.month)
					if (day != pickers.days && this.options.type == 'time') {
						if (pickers.d.index > day - 1) {
							pickers.d.index = day - 1;
						}
						pickers.days = day;
						pickers.result.d = pickers.d.index + 1;
						pickers.d.pickerRerender();
					}
				} else {
					pickers.result[this.options.pos] = oLi.dataset.value;
					if (this.options.pos == '0') {
						if (this.index != this.lastIndex) {
							pickers[1].pickerRerender();
							pickers[2].pickerRerender();
						}
					} else if (this.options.pos == '1') {
						if (this.index != this.lastIndex) {
							pickers[2].pickerRerender();
						}
					}
				}

				this.selecting = false;
			}
		}

		pickers[opts.cols[k]].on('scrollEnd', setValue)

		pickers[opts.cols[k]].on('scrollCancel', setValue)

		pickers[opts.cols[k]].on('scrollStart', function () {
			this.selecting = true;
			//this.wrapper.querySelectorAll('li')[this.index + this.options.appendBefore].classList.remove('picker-active');
		})
	}

	return pickers;
}