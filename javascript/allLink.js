document.write("<script type='text/javascript' src= 'allLinkQuery.js'></script>");
var allLink = function (site, rootTable){
    var allLinkObject = allLinkQuery(site, rootTable);
    var reTableRe;
    var everyLink=[];
    var allLink=[];
    reTableRe = allLinkObject.responseText;
    var method = reTableRe.indexOf("base64");
    if(method!=-1){//The coding mode is "base64".
    reTableRe = reTableRe.replace(/<STREAM encoding="base64">/g, "haha");
    reTableRe = reTableRe.replace(/<STREAM encoding='base64'>\n/g, "haha");
    reTableRe = reTableRe.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g,"");
    reTableRe = reTableRe.match(/haha(\S*)xixi/)[1];
    var donnee = atob(reTableRe).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
    donnee=donnee.split("||||");
    for(var i=1;i<donnee.length;i=i+5)
    {
      var tt= donnee[i+1];
      var tc= donnee[i+4];
      var ft= donnee[i];
      var fc= donnee[i+3];
      var k=0;
      everyLink[k]=tt+'|'+tc;
      k=1;
      everyLink[k]=ft+'|'+fc;
      allLink.push(everyLink);
      everyLink=[];
    }
    }
    if(method==-1){//The coding mode is normal.
      reTableRe=reTableRe.replace(/\s+/g,"");
      console.log(reTableRe)
      reTableRe= reTableRe.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
      var donnee = reTableRe.replace(/<TR><TD>/g, "@");
      donnee = donnee.replace(/<\/TD><\/TR>/g, "");
      donnee = donnee.replace(/<\/TD><TD>/g, "|")
      donnee = donnee.split('@')
    }

    return allLink;
}