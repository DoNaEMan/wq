/**
 * Created by wq on 2017/4/6.
 */
(function (win, doc, math) {
    var sw ,timer;
    var designDefautRatio = 100
	var designDraftWidth = 750;
	var dpr = win.devicePixelRatio;
    var designDefautRatio = 100;
	var fontSize = '12px';
    var docEl = doc.documentElement;
    var isIPhone = win.navigator.appVersion.match(/iphone/gi);
	var borderWidth = '1px';

	docEl.style.maxWidth = designDraftWidth + 'px';
	function getInfo(){
		sw = win.innerWidth;
		docEl.style.fontSize = designDefautRatio * sw / designDraftWidth + 'px';
    }

    getInfo();

	function flex() {
		clearTimeout(timer);
		setTimeout(function () {
			getInfo();
		}, 300);
	}
	window.addEventListener('orientationchange',flex,false);
	window.addEventListener('resize', flex,false);

    if (dpr >= 2 && dpr < 3) {
        fontSize = '14px';
    } else if (dpr >= 1 && dpr < 2) {
        fontSize = '12px';
    } else {
        fontSize = '16px';
    }
    if(isIPhone){
        borderWidth = (1 / designDefautRatio) + 'rem';
    }
    doc.write('<style>body{font-size:' + fontSize + ';margin: 0 auto;}.bw{border-width:'+borderWidth+';}</style>');
}(window, document, Math))