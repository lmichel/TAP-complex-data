
"use strict"

class VOTableTools{

  /**
   * 
   * @param vObject : votable object.
   */
  static votable2Rows(vObject: any):string[]{
    let contentText:string = "";
    contentText=vObject.responseText;
    let reData:string[]=[];
    var method = contentText.indexOf("base64");
    if(method!=-1){//The coding mode is "base64". e.g. Simbad, GAVO
      var data = VOTableTools.content2Rows(contentText);

      let k:number = 0;
      for(var i=0;i<data.length;i=i+1)//Store the name of the table in an array
      {
        for(var j=0;j<data[i].length;j=j+1)
        {
          reData[k]=data[i][j];
          k=k+1;
        }
      }
    }
    else{//The coding mode is normal. e.g. VizieR, CAOM
			$(contentText).find('RESOURCE[type="results"]').each(function(){
				$(this).find("TR").each(function(){
          for(let i:number=0; i<this.childNodes.length; i++){
            reData.push(this.childNodes[i].textContent);
          }
				});
    })
  }
    return reData;
  }

  /**
   * 
   * @param allstr Original string/原始字符串
   * @param start tarting position/开始位置
   * @param end End position/结束位置
   * @param str The string to be changed/要改变的字
   * @param changeStr Changed string改变后的字
   */
  static changeString (allstr:string,start:number,end:number,str:string,changeStr:string){ //allstr:，start:,end：,str：，changeStr:
    if(allstr.substring(start,end) == str){
        return allstr.substring(0,start)+changeStr+allstr.substring(end+1,allstr.length+2); 
    }else{
        allstr; 
    }
  }


  /***
   * Get the table with the data
   * @param content: the content of votable object.
   */
  static content2Rows(content:string){
    var p = new VOTableParser();
    var data = p.loadFile(content);//store the data(2-dimensional array) after query by url
    var fields = p.getCurrentTableFields();//store all the information of field
    var nbFields = fields.length;
    let nameFields:string[] = [];
    for(let i:number=0;i<nbFields;i++){
      nameFields.push(fields[i].name);//store the name of filed
    }
    p.cleanMemory();
    return data;//name of field and data
  }

  /***
   * Get the name of field
   * @param vObject: votable object.
   */
  static getField(vObject: any){
    let contentText:string = "";
    contentText=vObject.responseText;
    var p = new VOTableParser();
    p.loadFile(contentText);//store the data(2-dimensional array) after query by url
    var fields = p.getCurrentTableFields();//store all the information of field
    var nbFields = fields.length;
    let nameFields:string[] = [];
    for(let i:number=0;i<nbFields;i++){
      nameFields.push(fields[i].name);//store the name of filed
    }
    p.cleanMemory();
    return nameFields;//name of field and data
  }

  static genererField(QObject:any,contentText:string){
    let method:number = contentText.indexOf("base64");
    let Field:string[]=[];
    if(method!=-1){//The coding mode is "base64". e.g. Simbad, GAVO
        Field = VOTableTools.getField(QObject)
    }
    else{//The coding mode is normal. e.g. VizieR, CAOM
        $(contentText).find('RESOURCE[type="results"]').each(function(){
            $(this).find("FIELD").each(function(){
                    Field.push(this.attributes.name.nodeValue);
            });
        })
    }
    return Field;
}


}