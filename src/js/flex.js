/**
 * Created by wq on 2017/4/6.
 */
(function (win, doc, math) {
    var k = win.innerWidth, dpr = win.devicePixelRatio, designDraftWidth = 750, designDraftFontSize = 28, fontSize = '12px', docEl = doc.documentElement;
    docEl.style.fontSize = designDraftFontSize * k / designDraftWidth + 'px';
    docEl.style.maxWidth = designDraftWidth + 'px';
    if (dpr >= 2 && dpr < 3) {
        fontSize = '14px';
    } else if (dpr >= 1 && dpr < 2) {
        fontSize = '12px';
    } else {
        fontSize = '16px';
    }
    doc.write('<style>body{font-size:' + fontSize + ';}</style>');
}(window, document, Math))