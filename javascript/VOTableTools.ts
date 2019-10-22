"use strict"
class VOTableTools{

  /**
   * 
   * @param vObject : votable object.
   */
  static votableToJson(vObject: any):string[]{
    let contentText:string = vObject.responseText;
    let reData:string[]=[];
    var method = contentText.indexOf("base64");
    if(method!=-1){//The coding mode is "base64". e.g. Simbad, GAVO
    let content:string = $(contentText).find("STREAM").eq(0).text();
    //var data = btoa(content);
    //console.log(data)
    //a means base64
    let data:string =  atob(content).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
    data=data.replace(/\|\|\|\|/g,"&");
    if(data.indexOf("|||")!=-1){//special situation for table's name and table's description
      for(;;){
        let start:number = data.indexOf("|||");
        data = VOTableTools.changeString(data,start,start+3,"|||","||||");
        data=data.replace(/\|\|\|\|/g,"&");
        if(data.indexOf("|||")==-1){
          break;
        }
      }
    }
    
    let data2:string[]=data.split("&");
    for(var i=1;i<data2.length;i=i+1)//Store the name of the table in an array
      {
          reData.push(data2[i]);
      }
    }
    else{//The coding mode is normal. e.g. VizieR, CAOM
      let content:string = contentText.replace(/\s+/g,"#");
      content = content.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
      content = content.replace(/#/g," ");
      let data:string;  
      let data2:string[];
      data = content.replace(/<TR><TD>/g, "@");
      data = data.replace(/<\/TD><\/TR>/g, "");
      data = data.replace(/<\/TD><TD>/g, "@");
      data2 = data.split('@')
      for(var k = 1;k<data2.length;k++)
      {
        reData.push(data2[k]);
      }
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

  
}


