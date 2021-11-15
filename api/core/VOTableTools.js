"use strict;";

(function () {
    jw.core.VOTableTools = function() {
    };

    /**
     *
     * @param vObject : votable object
     * @returns : return data table 
     */
    jw.core.VOTableTools.votable2Rows = function (vObject) {
        var contentText = "";
        contentText = vObject.responseText;
        var reData = [];
        var method = contentText.indexOf("base64");
        if (method != -1) {
            var data = jw.core.VOTableTools.content2Rows(contentText);
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
                const cdata="[CDATA";
                $(this).find("TR").each(function () {
                    $(this).find("TD").each(function () {
                        if( !this.childNodes[0]) {
                        }
                        if(typeof this.childNodes[0] == typeof undefined){
                            //break;
                            reData.push("");
                        }else{
                        let nodeData = this.childNodes[0].data;

                        if(nodeData.startsWith(cdata)){
                                var cDataContent =(nodeData.replace("[CDATA[","").replace("]]",""));
                                reData.push(cDataContent);  
                        }else{
                            reData.push(this.textContent);
                        }

                        
                    }   
               });
                  
            });
         });
     }
        //console.log(reData);
        return reData;
    };
  
    /**
     *
     * @param allstr Original string / 原始字符串
     * @param start tarting position /  开始位置
     * @param end End position / 结束位置
     * @param str The string to be changed / 要改变的字
     * @param changeStr Changed string / 改变后的字
     */
    jw.core.VOTableTools.changeString = function (allstr, start, end, str, changeStr) {
        if (allstr.substring(start, end) == str) {
            return allstr.substring(0, start) + changeStr + allstr.substring(end + 1, allstr.length + 2);
        }
        else {
            allstr;
        }
    };

    /***
     * Get the table with the data
     * @param content: the content of votable object.
     */
    jw.core.VOTableTools.content2Rows = function (content) {
        var p = new VOTableParser();
        var data = p.loadFile(content); //store the data(2-dimensional array) after query by url
        p.cleanMemory();
        return data; //name of field and data
    };

    /***
     * Get the name of field (get data)
     * @param vObject: votable object.
     */
    jw.core.VOTableTools.getField = function (vObject) {
        var contentText = "";
        contentText = vObject.responseText;
        var p = new VOTableParser();
        p.loadFile(contentText); //store the data(2-dimensional array) after query by url
        var fields = p.getCurrentTableFields(); //store all the information of field
        var nbFields = fields.length;
        var nameFields = [];
        for (var i = 0; i < nbFields; i++) {
            nameFields.push(fields[i].name); //store the name of filed
        }
        p.cleanMemory();
        return nameFields; //name of field and data
    };

    /***
       * Get the name of field
       * @param vObject: votable object.
       * @param content: the content of votable object.
       */
    jw.core.VOTableTools.genererField = function (QObject, contentText) {
        var method = contentText.indexOf("base64");
        var Field = [];
        if (method != -1) {
            Field = jw.core.VOTableTools.getField(QObject);
        }
        else {
            $(contentText).find('RESOURCE[type="results"]').each(function () {
                $(this).find("FIELD").each(function () {
                    Field.push(this.attributes.name.nodeValue);
                });
            });
        }
        return Field;
    };
}());
