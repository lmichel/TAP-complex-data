"use strict";
document.write("<script type='text/javascript' src= 'votable.js'></script>");
"use strict";
var VOTableTools = /** @class */ (function () {
    function VOTableTools() {
    }
    /**
     *
     * @param vObject : votable object.
     */
    VOTableTools.votable2Rows = function (vObject) {
        var contentText = vObject.responseText;
        var reData = [];
        var method = contentText.indexOf("base64");
        /*
        This methode only works if the data is a string.
        @TODO It should be rewritten to find a method that works for all types. e.g. double, long ...
        */
        if (method != -1) {
            var content = $(contentText).find("STREAM").eq(0).text();
            //a means base64
            var data = atob(content).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
            data = data.replace(/\|\|\|\|/g, "&");
            if (data.indexOf("|||") != -1) {
                for (;;) {
                    var start = data.indexOf("|||");
                    data = VOTableTools.changeString(data, start, start + 3, "|||", "||||");
                    data = data.replace(/\|\|\|\|/g, "&");
                    if (data.indexOf("|||") == -1) {
                        break;
                    }
                }
            }
            var data2 = data.split("&");
            for (var i = 1; i < data2.length; i = i + 1) {
                reData.push(data2[i]);
            }
        }
        else {
            $(contentText).find('RESOURCE[type="results"]').each(function () {
                $(this).find("TR").each(function () {
                    for (var i_1 = 0; i_1 < this.childNodes.length; i_1++) {
                        reData.push(this.childNodes[i_1].textContent);
                    }
                });
            });
        }
        return reData;
    };
    /**
     *
     * @param allstr Original string/原始字符串
     * @param start tarting position/开始位置
     * @param end End position/结束位置
     * @param str The string to be changed/要改变的字
     * @param changeStr Changed string改变后的字
     */
    VOTableTools.changeString = function (allstr, start, end, str, changeStr) {
        if (allstr.substring(start, end) == str) {
            return allstr.substring(0, start) + changeStr + allstr.substring(end + 1, allstr.length + 2);
        }
        else {
            allstr;
        }
    };
    return VOTableTools;
}());
