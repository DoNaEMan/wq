!function(t,i,s){function e(s,e){this.wrapper="string"==typeof s?i.querySelector(s):s,this.scroller=this.wrapper.children[0],this.scrollerStyle=this.scroller.style,this.options={disablePointer:!n.hasPointer,disableTouch:n.hasPointer||!n.hasTouch,disableMouse:n.hasPointer||n.hasTouch,startX:0,startY:0,scrollY:!0,directionLockThreshold:5,momentum:!0,bounce:!0,bounceTime:600,bounceEasing:"",preventDefault:!0,preventDefaultException:{tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},HWCompositing:!0,useTransition:!0,useTransform:!0,bindToWrapper:void 0===t.onmousedown};for(var o in e)this.options[o]=e[o];this.translateZ=this.options.HWCompositing&&n.hasPerspective?" translateZ(0)":"",this.options.useTransition=n.hasTransition&&this.options.useTransition,this.options.useTransform=n.hasTransform&&this.options.useTransform,this.options.eventPassthrough=this.options.eventPassthrough===!0?"vertical":this.options.eventPassthrough,this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault,this.options.scrollY="vertical"!=this.options.eventPassthrough&&this.options.scrollY,this.options.scrollX="horizontal"!=this.options.eventPassthrough&&this.options.scrollX,this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough,this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold,this.options.bounceEasing="string"==typeof this.options.bounceEasing?n.ease[this.options.bounceEasing]||n.ease.circular:this.options.bounceEasing,this.options.resizePolling=void 0===this.options.resizePolling?60:this.options.resizePolling,this.options.tap===!0&&(this.options.tap="tap"),this.x=0,this.y=0,this.directionX=0,this.directionY=0,this._events={},this._init(),this.refresh(),this.scrollTo(this.options.startX,this.options.startY),this.enable()}var o=t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||t.msRequestAnimationFrame||function(i){t.setTimeout(i,1e3/60)},n=function(){function e(t){return r!==!1&&(""===r?t:r+t.charAt(0).toUpperCase()+t.substr(1))}var o={},n=i.createElement("div").style,r=function(){for(var t=["t","webkitT","MozT","msT","OT"],i=0,s=t.length;i<s;i++)if(t[i]+"ransform"in n)return t[i].substr(0,t[i].length-1);return!1}();o.getTime=Date.now||function(){return(new Date).getTime()},o.extend=function(t,i){for(var s in i)t[s]=i[s]},o.addEvent=function(t,i,s,e){t.addEventListener(i,s,!!e)},o.removeEvent=function(t,i,s,e){t.removeEventListener(i,s,!!e)},o.prefixPointerEvent=function(i){return t.MSPointerEvent?"MSPointer"+i.charAt(7).toUpperCase()+i.substr(8):i},o.momentum=function(t,i,e,o,n,r){var h,l,a=t-i,p=s.abs(a)/e;return r=void 0===r?6e-4:r,h=t+p*p/(2*r)*(a<0?-1:1),l=p/r,h<o?(h=n?o-n/2.5*(p/8):o,a=s.abs(h-t),l=a/p):h>0&&(h=n?n/2.5*(p/8):0,a=s.abs(t)+h,l=a/p),{destination:s.round(h),duration:l}};var h=e("transform");return o.extend(o,{hasTransform:h!==!1,hasPerspective:e("perspective")in n,hasTouch:"ontouchstart"in t,hasPointer:!(!t.PointerEvent&&!t.MSPointerEvent||/Safari\/\d/.test(t.navigator.appVersion)),hasTransition:e("transition")in n}),o.isBadAndroid=function(){var i=t.navigator.appVersion;if(/Android/.test(i)&&!/Chrome\/\d/.test(i)){var s=i.match(/Safari\/(\d+.\d)/);return!(s&&"object"==typeof s&&s.length>=2)||parseFloat(s[1])<535.19}return!1}(),o.extend(o.style={},{transform:h,transitionTimingFunction:e("transitionTimingFunction"),transitionDuration:e("transitionDuration"),transitionDelay:e("transitionDelay"),transformOrigin:e("transformOrigin")}),o.hasClass=function(t,i){return new RegExp("(^|\\s)"+i+"(\\s|$)").test(t.className)},o.addClass=function(t,i){if(!o.hasClass(t,i)){var s=t.className.split(" ");s.push(i),t.className=s.join(" ")}},o.removeClass=function(t,i){if(o.hasClass(t,i)){var s=new RegExp("(^|\\s)"+i+"(\\s|$)","g");t.className=t.className.replace(s," ")}},o.offset=function(t){for(var i=-t.offsetLeft,s=-t.offsetTop;t=t.offsetParent;)i-=t.offsetLeft,s-=t.offsetTop;return{left:i,top:s}},o.preventDefaultException=function(t,i){for(var s in i)if(i[s].test(t[s]))return!0;return!1},o.extend(o.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,pointerdown:3,pointermove:3,pointerup:3,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3}),o.extend(o.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(t){return t*(2-t)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(t){return s.sqrt(1- --t*t)}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(t){return(t-=1)*t*(5*t+4)+1}},bounce:{style:"",fn:function(t){return(t/=1)<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375}},elastic:{style:"",fn:function(t){return 0===t?0:1==t?1:.4*s.pow(2,-10*t)*s.sin((t-.055)*(2*s.PI)/.22)+1}}}),o.tap=function(t,s){var e=i.createEvent("Event");e.initEvent(s,!0,!0),e.pageX=t.pageX,e.pageY=t.pageY,t.target.dispatchEvent(e)},o.click=function(t){var s,e=t.target;/(SELECT|INPUT|TEXTAREA)/i.test(e.tagName)||(s=i.createEvent("MouseEvents"),s.initMouseEvent("click",!0,!0,t.view,1,e.screenX,e.screenY,e.clientX,e.clientY,t.ctrlKey,t.altKey,t.shiftKey,t.metaKey,0,null),s._constructed=!0,e.dispatchEvent(s))},o}();e.prototype={version:"5.2.0",_init:function(){this._initEvents(),this.options.refresh&&this._pullRefreshInit()},destroy:function(){this._initEvents(!0),clearTimeout(this.resizeTimeout),this.resizeTimeout=null,this._execEvent("destroy")},_transitionEnd:function(t){t.target==this.scroller&&this.isInTransition&&(this._transitionTime(),this.resetPosition(this.options.bounceTime)||(this.isInTransition=!1,this._execEvent("scrollEnd")))},_start:function(t){if(1!=n.eventType[t.type]){if(0!==(t.which?t.button:t.button<2?0:4==t.button?1:2))return}if(this.enabled&&(!this.initiated||n.eventType[t.type]===this.initiated)){!this.options.preventDefault||n.isBadAndroid||n.preventDefaultException(t.target,this.options.preventDefaultException)||t.preventDefault();var i,e=t.touches?t.touches[0]:t;this.initiated=n.eventType[t.type],this.moved=!1,this.distX=0,this.distY=0,this.directionX=0,this.directionY=0,this.directionLocked=0,this.startTime=n.getTime(),this.options.useTransition&&this.isInTransition?(this._transitionTime(),this.isInTransition=!1,i=this.getComputedPosition(),this._translate(s.round(i.x),s.round(i.y)),this._execEvent("scrollEnd")):!this.options.useTransition&&this.isAnimating&&(this.isAnimating=!1,this._execEvent("scrollEnd")),this.startX=this.x,this.startY=this.y,this.absStartX=this.x,this.absStartY=this.y,this.pointX=e.pageX,this.pointY=e.pageY,this._execEvent("beforeScrollStart")}},_move:function(t){if(this.enabled&&n.eventType[t.type]===this.initiated){this.options.preventDefault&&t.preventDefault();var i,e,o,r,h=t.touches?t.touches[0]:t,l=h.pageX-this.pointX,a=h.pageY-this.pointY,p=n.getTime();if(this.pointX=h.pageX,this.pointY=h.pageY,this.distX+=l,this.distY+=a,o=s.abs(this.distX),r=s.abs(this.distY),!(p-this.endTime>300&&o<10&&r<10)){if(this.directionLocked||this.options.freeScroll||(o>r+this.options.directionLockThreshold?this.directionLocked="h":r>=o+this.options.directionLockThreshold?this.directionLocked="v":this.directionLocked="n"),"h"==this.directionLocked){if("vertical"==this.options.eventPassthrough)t.preventDefault();else if("horizontal"==this.options.eventPassthrough)return void(this.initiated=!1);a=0}else if("v"==this.directionLocked){if("horizontal"==this.options.eventPassthrough)t.preventDefault();else if("vertical"==this.options.eventPassthrough)return void(this.initiated=!1);l=0}l=this.hasHorizontalScroll?l:0,a=this.hasVerticalScroll?a:0,i=this.x+l,e=this.y+a,(i>0||i<this.maxScrollX)&&(i=this.options.bounce?this.x+l/3:i>0?0:this.maxScrollX),(e>0||e<this.maxScrollY)&&(e=this.options.bounce?this.y+a/3:e>0?0:this.maxScrollY),this.directionX=l>0?-1:l<0?1:0,this.directionY=a>0?-1:a<0?1:0,this.moved||this._execEvent("scrollStart"),this.moved=!0,this._translate(i,e),this._pullAction(),p-this.startTime>300&&(this.startTime=p,this.startX=this.x,this.startY=this.y),this.options.probeType>1&&this._execEvent("scroll")}}},_end:function(t){if(this.enabled&&n.eventType[t.type]===this.initiated){this.options.preventDefault&&!n.preventDefaultException(t.target,this.options.preventDefaultException)&&t.preventDefault();var i,e,o=(t.changedTouches&&t.changedTouches[0],n.getTime()-this.startTime),r=s.round(this.x),h=s.round(this.y),l=s.abs(r-this.startX),a=s.abs(h-this.startY),p=0,c="";if(this.isInTransition=0,this.initiated=0,this.endTime=n.getTime(),!this.resetPosition(this.options.bounceTime)){if(this.scrollTo(r,h),!this.moved)return this.options.tap&&n.tap(t,this.options.tap),this.options.click&&n.click(t),void this._execEvent("scrollCancel");if(this._events.flick&&o<200&&l<100&&a<100)return void this._execEvent("flick");if(this.options.momentum&&o<300&&(i=this.hasHorizontalScroll?n.momentum(this.x,this.startX,o,this.maxScrollX,this.options.bounce?this.wrapperWidth:0,this.options.deceleration):{destination:r,duration:0},e=this.hasVerticalScroll?n.momentum(this.y,this.startY,o,this.maxScrollY,this.options.bounce?this.wrapperHeight:0,this.options.deceleration):{destination:h,duration:0},r=i.destination,h=e.destination,p=s.max(i.duration,e.duration),this.isInTransition=1),r!=this.x||h!=this.y)return(r>0||r<this.maxScrollX||h>0||h<this.maxScrollY)&&(c=n.ease.quadratic),void this.scrollTo(r,h,p,c);this._execEvent("scrollEnd")}}},_resize:function(){var t=this;clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(function(){t.refresh()},this.options.resizePolling)},resetPosition:function(t){var i=this.x,s=this.y;if(t=t||0,!this.hasHorizontalScroll||this.x>0?i=0:this.x<this.maxScrollX&&(i=this.maxScrollX),this.options.refresh){if(this.y>this.limitFloorY?this.pullDownRatio>1&&!this.pullUpRefreshing?(s=this.pullDownBoxHeight,this._refreshCallBack()):(s=this.limitFloorY,this._clearProgressAnimation(2,this.options.bounceTime)):this.y<this.maxScrollY&&!this.disablePullUpLoad?this.pullUpRatio>1&&!this.pullDownRefreshing?(s=this.maxScrollY-this.pullUpBoxHeight,this._refreshCallBack()):(s=this.maxScrollY,this._clearProgressAnimation(1,this.options.bounceTime)):this.y<this.maxScrollY&&this.disablePullUpLoad&&(s=this.maxScrollY),i==this.x&&s==this.y)return!1}else if(!this.hasHorizontalScroll||this.x>0?i=0:this.x<this.maxScrollX&&(i=this.maxScrollX),!this.hasVerticalScroll||this.y>0?s=0:this.y<this.maxScrollY&&(s=this.maxScrollY),i==this.x&&s==this.y)return!1;return this.scrollTo(i,s,t,this.options.bounceEasing),!0},disable:function(){this.enabled=!1},enable:function(){this.enabled=!0},refresh:function(t,i){this.wrapper.offsetHeight;this.scroller.style.minHeight=this.wrapper.clientHeight+"px",this.wrapperWidth=this.wrapper.clientWidth,this.wrapperHeight=this.wrapper.clientHeight,this.scrollerWidth=this.scroller.offsetWidth,this.scrollerHeight=this.scroller.offsetHeight,this.maxScrollX=this.wrapperWidth-this.scrollerWidth,this.maxScrollY=this.wrapperHeight-this.scrollerHeight,this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<=0,this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<=0,this.hasHorizontalScroll||(this.maxScrollX=0,this.scrollerWidth=this.wrapperWidth),this.hasVerticalScroll||(this.maxScrollY=0,this.scrollerHeight=this.wrapperHeight),this.endTime=0,this.directionX=0,this.directionY=0,this.wrapperOffset=n.offset(this.wrapper),this._execEvent("refresh"),this.options.refresh&&t&&(this.pullDownRatio=0,this.pullUpRatio=0,this.pullRefreshType="",this.pullDownRefreshing=!1,this.pullUpRefreshing=!1,this.pullDownTipBox.innerText=this.options.tips.PULLDOWN1,this.pullUpTipBox.innerText=this.options.tips.PULLUP1,this._clearProgressAnimation()),this.options.refresh&&(i===!0?this.disablePullUp(!0):i===!1?this.disablePullUp(!1):this.disablePullUp()),t?this.resetPosition(this.options.bounceTime):this.resetPosition()},on:function(t,i){this._events[t]||(this._events[t]=[]),this._events[t].push(i)},off:function(t,i){if(this._events[t]){var s=this._events[t].indexOf(i);s>-1&&this._events[t].splice(s,1)}},_execEvent:function(t){if(this._events[t]){var i=0,s=this._events[t].length;if(s)for(;i<s;i++)this._events[t][i].apply(this,[].slice.call(arguments,1))}},scrollBy:function(t,i,s,e){t=this.x+t,i=this.y+i,s=s||0,this.scrollTo(t,i,s,e)},scrollTo:function(t,i,s,e){e=e||n.ease.circular,this.isInTransition=this.options.useTransition&&s>0;var o=this.options.useTransition&&e.style;!s||o?(o&&(this._transitionTimingFunction(e.style),this._transitionTime(s)),this._translate(t,i)):this._animate(t,i,s,e.fn)},scrollToElement:function(t,i,e,o,r){if(t=t.nodeType?t:this.scroller.querySelector(t)){var h=n.offset(t);h.left-=this.wrapperOffset.left,h.top-=this.wrapperOffset.top,e===!0&&(e=s.round(t.offsetWidth/2-this.wrapper.offsetWidth/2)),o===!0&&(o=s.round(t.offsetHeight/2-this.wrapper.offsetHeight/2)),h.left-=e||0,h.top-=o||0,h.left=h.left>0?0:h.left<this.maxScrollX?this.maxScrollX:h.left,h.top=h.top>0?0:h.top<this.maxScrollY?this.maxScrollY:h.top,i=void 0===i||null===i||"auto"===i?s.max(s.abs(this.x-h.left),s.abs(this.y-h.top)):i,this.scrollTo(h.left,h.top,i,r)}},_transitionTime:function(t){t=t||0;var i=n.style.transitionDuration;if(this.scrollerStyle[i]=t+"ms",!t&&n.isBadAndroid){this.scrollerStyle[i]="0.0001ms";var s=this;o(function(){"0.0001ms"===s.scrollerStyle[i]&&(s.scrollerStyle[i]="0s")})}},_transitionTimingFunction:function(t){this.scrollerStyle[n.style.transitionTimingFunction]=t},_translate:function(t,i){this.options.useTransform?this.scrollerStyle[n.style.transform]="translate("+t+"px,"+i+"px)"+this.translateZ:(t=s.round(t),i=s.round(i),this.scrollerStyle.left=t+"px",this.scrollerStyle.top=i+"px"),this.x=t,this.y=i},_initEvents:function(i){var s=i?n.removeEvent:n.addEvent,e=this.options.bindToWrapper?this.wrapper:t;s(t,"orientationchange",this),s(t,"resize",this),this.options.click&&s(this.wrapper,"click",this,!0),this.options.disableMouse||(s(this.wrapper,"mousedown",this),s(e,"mousemove",this),s(e,"mousecancel",this),s(e,"mouseup",this)),n.hasPointer&&!this.options.disablePointer&&(s(this.wrapper,n.prefixPointerEvent("pointerdown"),this),s(e,n.prefixPointerEvent("pointermove"),this),s(e,n.prefixPointerEvent("pointercancel"),this),s(e,n.prefixPointerEvent("pointerup"),this)),n.hasTouch&&!this.options.disableTouch&&(s(this.wrapper,"touchstart",this),s(e,"touchmove",this),s(e,"touchcancel",this),s(e,"touchend",this)),s(this.scroller,"transitionend",this),s(this.scroller,"webkitTransitionEnd",this),s(this.scroller,"oTransitionEnd",this),s(this.scroller,"MSTransitionEnd",this)},getComputedPosition:function(){var i,s,e=t.getComputedStyle(this.scroller,null);return this.options.useTransform?(e=e[n.style.transform].split(")")[0].split(", "),i=+(e[12]||e[4]),s=+(e[13]||e[5])):(i=+e.left.replace(/[^-\d.]/g,""),s=+e.top.replace(/[^-\d.]/g,"")),{x:i,y:s}},_animate:function(t,i,s,e){function r(){var u,f,d,m=n.getTime();if(m>=c)return h.isAnimating=!1,h._translate(t,i),void(h.resetPosition(h.options.bounceTime)||h._execEvent("scrollEnd"));m=(m-p)/s,d=e(m),u=(t-l)*d+l,f=(i-a)*d+a,h._translate(u,f),h.isAnimating&&o(r)}var h=this,l=this.x,a=this.y,p=n.getTime(),c=p+s;this.isAnimating=!0,r()},handleEvent:function(t){switch(t.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(t);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(t);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(t);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(t);break;case"click":this.enabled&&!t._constructed&&(t.preventDefault(),t.stopPropagation())}}},e.utils=n,"undefined"!=typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd?define(function(){return e}):t.IScroll=e,e.prototype._pullRefreshInit=function(){var t,s,e=i.createElement("div");e.innerHTML='<div class="pull-up"><div class="wrap"><canvas height="100" width="100"></canvas><div class="tips"></div></div></div>',t=e.children[0],e.innerHTML='<div class="pull-down"><div class="wrap"><canvas height="100" width="100"></canvas><div class="tips"></div></div></div>',s=e.children[0],e=null,this.wrapper.querySelector(".pull-down")||this.scroller.insertBefore(s,this.scroller.children[0]),this.wrapper.querySelector(".pull-up")||this.scroller.appendChild(t),this.limitFloorY=0,this.pullDownTipBox=s.querySelector(".tips"),this.pullUpTipBox=t.querySelector(".tips"),this.pullDownBoxHeight=s.offsetHeight,this.pullUpBoxHeight=t.offsetHeight,this.pullDownCanvas=s.querySelector("canvas"),this.pullUpCanvas=t.querySelector("canvas"),this.pullDownTipBox.innerHTML=this.options.tips.PULLDOWN1,this.pullUpTipBox.innerHTML=this.options.tips.PULLUP1,this.scroller.style.minHeight=this.wrapper.clientHeight+"px"},e.prototype._pullAction=function(){if(this.options.refresh)if(this.y>this.limitFloorY&&!this.pullUpRefreshing&&!this.pullDownRefreshing){if(this.y-this.limitFloorY<this.options.animateBeginOffset)return;this.pullRefreshType="pulldown",this.pullDownRatio=(this.y-this.limitFloorY-this.options.animateBeginOffset)/this.options.animateSpeed,this._pullRefreshAnimate()}else if(this.y<this.maxScrollY&&!this.pullDownRefreshing&&!this.pullUpRefreshing&&!this.disablePullUpLoad){if(this.maxScrollY-this.y<this.options.animateBeginOffset)return;this.pullRefreshType="pullup",this.pullUpRatio=(this.maxScrollY-this.y-this.options.animateBeginOffset)/this.options.animateSpeed,this._pullRefreshAnimate()}},e.prototype._refreshCallBack=function(){this.pullUpRefreshing||this.pullDownRefreshing||("pulldown"===this.pullRefreshType?(this._startTurnRound(1),this.pullDownRefreshing=!0,this.pullDownTipBox.innerText=this.options.tips.PULLDOWN3,this._execEvent("pullDownRefresh")):"pullup"===this.pullRefreshType&&(this._startTurnRound(2),this.pullUpRefreshing=!0,this.pullUpTipBox.innerText=this.options.tips.PULLUP3,this._execEvent("pullUpRefresh")))},e.prototype._pullRefreshAnimate=function(){var t=this;"pulldown"!==this.pullRefreshType||this.pullDownRefreshing||this.pullUpRefreshing?"pullup"!==this.pullRefreshType||this.pullDownRefreshing||this.pullUpRefreshing||(o(function(){t._progressAnimation(parseInt(100*t.pullUpRatio),2)}),this.pullUpRatio>1?this.pullUpTipBox.innerText=this.options.tips.PULLUP2:this.pullUpTipBox.innerText=this.options.tips.PULLUP1):(o(function(){t._progressAnimation(parseInt(100*t.pullDownRatio),1)}),this.pullDownRatio>1?this.pullDownTipBox.innerText=this.options.tips.PULLDOWN2:this.pullDownTipBox.innerText=this.options.tips.PULLDOWN1)},e.prototype._progressAnimation=function(t,i){if(!this.pullUpRefreshing&&!this.pullDownRefreshing){var e,o,n=2*s.PI/360;e=1===i?this.pullDownCanvas:this.pullUpCanvas,t=t>=100?100:t<=0?0:t,e.getContext&&(o=e.getContext("2d"),o.beginPath(),o.clearRect(0,0,100,100),o.strokeStyle=this.options.borderColor,o.lineWidth=12,o.arc(50,50,43,-80*n,(3.4*t-80)*n,!1),o.stroke()),this.lastPullRate=t}},e.prototype._startTurnRound=function(t){this.pullUpRefreshing||this.pullDownRefreshing||(2===t?this.wrapper.querySelector(".pull-up canvas").classList.add("circle-ani"):1===t&&this.wrapper.querySelector(".pull-down canvas").classList.add("circle-ani"))},e.prototype._endTurnRound=function(t){this.pullUpRefreshing||this.pullDownRefreshing||(2===t?(this._progressAnimation(0,2),this.wrapper.querySelector(".pull-up canvas").classList.remove("circle-ani")):1===t&&(this._progressAnimation(0,1),this.wrapper.querySelector(".pull-down canvas").classList.remove("circle-ani")))},e.prototype._clearProgressAnimation=function(t,i){if(!this.pullUpRefreshing&&!this.pullDownRefreshing){var s=this;setTimeout(function(){s._endTurnRound(1),s._endTurnRound(2)},50)}},e.prototype.triggerPullDown=function(){this.pullDownRatio=10,this.pullRefreshType="pulldown",this._progressAnimation(100,1),this.y=1,this.resetPosition(this.options.bounceTime)},e.prototype.disablePullUp=function(t){var i,s;"boolean"==typeof t?this.disablePullUpLoad=t:t=this.disablePullUpLoad,s=this.wrapper.querySelector(".pull-up").style,t?(i=this.scroller.children[1].offsetHeight,i<=this.scrollerHeight-this.pullUpBoxHeight?s.bottom=this.scrollerHeight-i-this.pullDownBoxHeight+"px":i>this.scrollerHeight-this.pullUpBoxHeight&&i<this.scrollerHeight+this.pullUpBoxHeight?(this.maxScrollY-=i+this.pullUpBoxHeight-this.scrollerHeight,s.bottom=-(i+this.pullUpBoxHeight-this.scrollerHeight)+"px"):s.bottom=-this.pullUpBoxHeight+"px",this.pullUpTipBox.innerHTML=this.options.tips.PULLUPEND):s.bottom=-this.pullUpBoxHeight+"px"},e.prototype.pullDownOver=function(t){this.refresh(!0,t||!1)},e.prototype.pullUpOver=function(t){this.refresh(!0,t||!1)}}(window,document,Math);