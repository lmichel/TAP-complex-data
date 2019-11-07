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
        var contentText = "";
        contentText = vObject.responseText;
        var reData = [];
        var method = contentText.indexOf("base64");
        if (method != -1) {
            var data = VOTableTools.content2Rows(contentText);
            var k = 0;
            for (var i = 0; i < data.length; i = i + 1) {
                for (var j = 0; j < data[i].length; j = j + 1) {
                    reData[k] = data[i][j];
                    k = k + 1;
                }
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
    VOTableTools.content2Rows = function (content) {
        var p = new VOTableParser();
        var data = p.loadFile(content); //store the data(2-dimensional array) after query by url
        var fields = p.getCurrentTableFields(); //store all the information of field
        var nbFields = fields.length;
        var nameFields = [];
        for (var i = 0; i < nbFields; i++) {
            nameFields.push(fields[i].name); //store the name of filed
        }
        p.cleanMemory();
        return data; //name of field and data
    };
    VOTableTools.getField = function (vObject) {
        var contentText = "";
        contentText = vObject.responseText;
        console.log(contentText);
        var p = new VOTableParser();
        console.log(p);
        p.loadFile(contentText); //store the data(2-dimensional array) after query by url
        var fields = p.getCurrentTableFields(); //store all the information of field
        var nbFields = fields.length;
        var nameFields = [];
        for (var i = 0; i < nbFields; i++) {
            nameFields.push(fields[i].name); //store the name of filed
        }
        console.log(nameFields);
        p.cleanMemory();
        return nameFields; //name of field and data
    };
    return VOTableTools;
}());
