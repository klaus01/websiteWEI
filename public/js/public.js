
function urlParameterByJSON(parameters) {
    var ret = '';
    for (var p in parameters) {
        ret += p + '=' + encodeURIComponent(parameters[p]) + '&';
    }
    ret = ret.substr(0, ret.length - 1);
    return ret;
}

function setIframeAutoHeight() {
    $('iframe').on('load', function(){
        var iframeWin = this.contentWindow || this.contentDocument.parentWindow;
        if (iframeWin.document.body)
            this.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
    });
}