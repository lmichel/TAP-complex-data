
function simbadMain(){
    initial();
    
    $("#bObject").click(function(){
        var s = new TapService("http://simbad.u-strasbg.fr/simbad/sim-tap/sync","public","Simbad",true);
        var data = s.createJson();
        var sj=new jsonRead(data); 
        $("#load1").empty();
        var output = sj.json2Html("basic");
        $("#load1").html(output);
        Aide(sj,s)
        limitJson2data(sj,s);
    })

    $("#bBilio").click(function(){
        var s = new TapService("http://simbad.u-strasbg.fr/simbad/sim-tap/sync","public","Simbad",true);
        var data = s.createJson();
        var sj=new jsonRead(data); 
        $("#load1").empty();
        var output = sj.json2Html("ref");
        $("#load1").html(output);
        Aide(sj,s)
        limitJson2data(sj,s);
    })
}

function initial(){
    var $initial = $("<div class=\"page-header\" style=\"text-align: center\">"+
    "<img src=\"../img/cds.png\" style=\"width:100px;float: left;\">"+
    "<img src=\"../img/simbad_blackx30px.png\" style=\"width:100px;float: left;\">"+
        "<h1>TAP TEST"+
            "<small>Obas</small>"+
        "</h1>"+
        
    "</div>"+
    
    "<div class=\"btn-group\" style=\" margin-left:600px;padding-right:40px\">"+
        "<button type=\"button\" id = \"bObject\" class=\"btn btn-primary\">Object</button>"+
    "</div>"+
    "<div class=\"btn-group\" style=\" padding-left:400px;padding-right:40px\">"+
        "<button type=\"button\" id = \"bBilio\" class=\"btn btn-primary\">Bilio</button>"+
    "</div>"+
    "<br></br>"+
    
    "<pre id=\"load1\" style= \"background-color:white; overflow:scroll; width:800px; height:600px;margin-left:500px;float:left\"></pre>"+
    "<div class=\"btn-group\" style=\"text-align: center; padding-left:100px;float:left;top :350px\">"+
            "<button type=\"button\" id = \"test\" class=\"btn btn-primary\">Query</button>"+
        "</div>"+
    "<pre id=\"load2\" style= \"background-color:white; overflow:scroll; width:1400px; height:700px;margin-left:200px; font-size:15px ;float:left\"> </pre>"
    )
    
    $("body").append($initial);
}


function limitJson2data(n,s){//n: instance of the jsonRead; s: instance of TapService
    var jsont = n.json
    $("button#test").on('click',{"json" : jsont},function(event){//@TODO 
        console.log(event.data.json);
        var t =event.data.json
        var keyConstraint=[]
        var list=[]
        var allList=[];
        var listId =[];
        var listJoinAndId = [];
        var adqlMain;
        var oidJson;
        var niveau;
        var rootName = $("input[name='Cinput']:first").attr("id").slice(1);
        listJoinAndId = joinAndId(rootName,t);//record all the keys linked to root table and the join table's name
        for(var i = 0;i<listJoinAndId.length;i=i+2){
            if(!json2Requete.isString(listJoinAndId[i])){
                var temp = listJoinAndId[i][0];
            }
            else{
                var temp = listJoinAndId[i];
            }
            if(listId.indexOf(temp)==-1){
                listId.push(temp);//record the key linked to root table, No repeating
            }
        }
        var countedNames = listJoinAndId.reduce(function (allNames, name) { if (name in allNames) { allNames[name]++; } else { allNames[name] = 1; } return allNames; }, {});
        for(var i=0;i<listId.length;i++){
            for(var j = 0;j<listId.length-i-1;j++){
                if(countedNames[listId[j+1]]>countedNames[listId[j]]){
                    var temp = listId[j];
                    listId[j]=listId[j+1]
                    listId[j+1]=temp;
                }
            }
        }
        //allList.push( $("input[name='Cinput']:first").attr("id"));//record the root table's niveau and name
        var count = 0;
        var p=-1;//position of the last constraints;if p=-1, it means no constraints on input
        $("input[name='Cinput']").each(function(){
            count++;
            allList.push($(this).attr("id"));
            if($(this).val().length!=0){//user entered the constraints
                if(allList.indexOf($(this).attr("id"))==-1){
                    allList.push($(this).attr("id"));
                }
                p = count;
                var name = $(this).attr("id").slice(1);//the name of table
                var constraints = $(this).val();
                var temp=[];
                temp.push(name,constraints);
                keyConstraint.push(...temp);//record all constraints,[table name, constraints]
                niveau = $(this).attr("id").slice(0,1);
                //list.unshift(name);
            }
        })
        if(p!=-1){
            for(var h=niveau;h>0;h--){
                for(var j=p-1;j>=0;j--){
                    if(allList[j].slice(0,1)==h){
                        list.unshift(allList[j].slice(1));
                        break;
                    }
                }
            }
            var column=[];
            for(var i=0;i<listId.length;i++){
                column.push(rootName);
                column.push(listId[i]);
            } 
            console.log("haoyun \n"+ list +"\n"+keyConstraint+"\n"+column+"\n"+t);
            var json2= n.CreateJsonAndContraint(list,keyConstraint,column,0,t);
            adqlMain = json2Requete.getAdql(json2);
            oidJson = s.createMainJson(adqlMain,t,rootName,listId,listJoinAndId);

            var json = n.CreateJsonWithoutColumns(list,keyConstraint,0,t);//normal json with constraints
            var adql = json2Requete.getAdql(json);
            console.log("$$\n"+adql);
            var QObject = s.Query(adql);
            console.log(QObject)
            var dataTable = VOTableTools.votable2Rows(QObject);
            var contentText = QObject.responseText;
            var Field =VOTableTools.genererField(QObject,contentText);

            var nb = Field.length;
            if(nb==0){//report error message
                $(contentText).find('RESOURCE[type="results"]').each(function(){
                    if($(this).find("INFO").attr("name")=="QUERY_STATUS"){
                        out = $(this).context.textContent;
                        alert(out);
                    }
                })
            }
            var out = genererTextArea(adql);
            out += genererTable(Field,dataTable,t,rootName,listJoinAndId,s);
            $("#load2").html(out);
            constraints="";
            $("button[name='div1']").on("click",function(){
                var id = $(this).context.id
                if($("table[id="+id+"]").css('display')=="none"){
                    $("table[id="+id+"]").css('display','block');
                }else{
                    $("table[id="+id+"]").css('display','none');
                }
            })

            window.location.hash = "#load2"
            $("a[name='boid']").on("click",function(){
                var temp = $(this).attr("id");
                var tempArr = temp.split("|");
                var id = tempArr[0];
                var tableName = tempArr[1];
                for(var root in oidJson){
                    if(root==tableName){
                        for(var t in oidJson[root]){
                            if(t==id){
                                var Adql = oidJson[root][t];
                                console.log(Adql)
                            }
                        }
                    }
                }
                var QObject = s.Query(Adql);
                console.log(Adql);
                var dataTable = VOTableTools.votable2Rows(QObject);
                var contentText = QObject.responseText;
                var Field =VOTableTools.genererField(QObject,contentText);
                if(dataTable.length==0){
                    $(contentText).find('RESOURCE[type="results"]').each(function(){
                        if($(this).find("INFO").attr("name")=="QUERY_STATUS"){
                            out1 = $(this).context.textContent;
                            alert(out1);
                        }
                    })
                }
                else{
                    var out1 =genererDataTable(Field,dataTable);
                    var a  = listTable(Field,dataTable,tableName);
                    console.log(a)
                    $("body").prepend(out1);
                    document.getElementById('light1').style.display='block';
                }
            });
        }
               
        if(p==-1){//without constraints or with the root table's constraints, it will select all columns of the root table
            var list=[];
            list.push(rootName);
            var constraints = [];
            if($("input[id^='1']").val().length!=0){
                constraints = $("input[id^='1']").val();
                var temp=[];
                temp.push(rootName,constraints);
                keyConstraint.push(...temp);//record all constraints
            }
            console.log("haoyun \n"+ list +"\n"+keyConstraint+"\n"+t);
            console.log(t)
            var json =n.CreateJsonWithoutColumns(list,keyConstraint,0,t);
            var adql = json2Requete.getAdql(json);
            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject)
            var contentText = QObject.responseText;
            var Field =VOTableTools.genererField(QObject,contentText);
            var nb = Field.length;
            if(nb==0){//report error message
                $(contentText).find('RESOURCE[type="results"]').each(function(){
                    if($(this).find("INFO").attr("name")=="QUERY_STATUS"){
                        out = $(this).context.textContent
                        alert(out);
                    }
                })
            }
            var out = genererTextArea(adql);
            out += genererTable(Field,dataTable,t,rootName,listJoinAndId,s);
            $("#load2").html(out);
            $("button[name='div1']").on("click",function(){
                var id = $(this).context.id
                console.log($("table[id="+id+"]").css('display'))
                if($("table[id="+id+"]").css('display')=="none"){
                    $("table[id="+id+"]").css('display','block');
                }else{
                    $("table[id="+id+"]").css('display','none');
                }
            })
            window.location.hash = "#load2";
            var column=[];
            for(var i=0;i<listId.length;i++){
                column.push(rootName);
                column.push(listId[i]);
            }
            var json2= n.CreateJsonAndContraint(list,keyConstraint,column,0,t);
            adqlMain = json2Requete.getAdql(json2);
            oidJson = s.createMainJson(adqlMain,t,rootName,listId,listJoinAndId);

            $("a[name='boid']").on("click",function(){
                var temp = $(this).attr("id");
                var tempArr = temp.split("|");
                var id = tempArr[0];
                var tableName = tempArr[1];
                for(var root in oidJson){
                    if(root==tableName){
                        for(var t in oidJson[root]){
                            if(t==id){
                                var Adql = oidJson[root][t];
                            }
                        }
                    }
                }
                var QObject = s.Query(Adql);
                console.log("laurent "+Adql);
                var dataTable = VOTableTools.votable2Rows(QObject);
                var contentText = QObject.responseText;
                var Field =VOTableTools.genererField(QObject,contentText);
                if(dataTable.length==0){//report error message
                    $(contentText).find('RESOURCE[type="results"]').each(function(){
                        if($(this).find("INFO").attr("name")=="QUERY_STATUS"){
                            out1 = $(this).context.textContent;
                            alert(out1);
                        }
                    })
                }
                else{
                    var out1 =genererDataTable(Field,dataTable);
                    var a  = listTable(Field,dataTable,tableName);
                    console.log(a)
                    $("body").prepend(out1);
                    document.getElementById('light1').style.display='block';
                }
            })
        }
        //$("button#test").unbind('click')
        $("#badql").on("click",function(){//regenerate the form of the query
            var adql2 = checkAdql(listId);
                console.log(adql2)
            out = genererZone3(adql2,s,rootName,n,listJoinAndId);
            if(listId.length == 1){
                var start = adql2.indexOf(listId[0])+listId[0].length;
                var end = adql2.indexOf("FROM");
                if(adql2.indexOf(listId[0])==-1){
                    adql2 = adql2.slice(0,start)+",\n"+listId[0]+"\n"+adql2.slice(end);
                }
                else{
                    start = adql2.indexOf(listId[0])+listId[0].length;
                    adql2 = adql2.slice(0,start)+"\n"+adql2.slice(end);
                }
            }
            else{
                for(var i = 1;i<listId.length;i++){
                    var start = adql2.indexOf(listId[i-1])+listId[i-1].length;
                    var end = adql2.indexOf("FROM");
                    if(adql2.indexOf(listId[i])==-1){
                        adql2 = adql2.slice(0,start)+",\n"+listId[i]+"\n"+adql2.slice(end);
                    }
                    else{
                        start = adql2.indexOf(listId[i])+listId[i].length;
                        adql2 = adql2.slice(0,start)+"\n"+adql2.slice(end);
                    }
                }
            }
            
            
            var oidJson = s.createMainJson(adql2,t,rootName,listId,listJoinAndId);//@TODO oid otype should not appear in this place

            if(out.indexOf("Incorrect")!=-1){
                alert(out);
            }
            else{
                $("#ddata").empty();
                $("#ddata").html(out);
                $("a[name='boid']").on("click",function(){
                    var temp = $(this).attr("id");
                    var tempArr = temp.split("|");
                    var id = tempArr[0];
                    var tableName = tempArr[1];
                    for(var root in oidJson){
                        if(root==tableName){
                            for(var t in oidJson[root]){
                                if(t==id){
                                    var Adql = oidJson[root][t];
                                }
                            }
                        }
                    }
                    var QObject = s.Query(Adql);
                    console.log(Adql)
                    var dataTable = VOTableTools.votable2Rows(QObject)
                    var contentText = QObject.responseText;
                    var Field =VOTableTools.genererField(QObject,contentText);
                    if(Field.length==0){
                        $(contentText).find('RESOURCE[type="results"]').each(function(){
                            if($(this).find("INFO").attr("name")=="QUERY_STATUS"){
                                out1 = $(this).context.textContent
                                alert(out1);
                            }
                        })
                    }
                    else{
                        var out1 =genererDataTable(Field,dataTable);
                        var a  = listTable(Field,dataTable,tableName);
                    console.log(a)
                        $("body").prepend(out1);
                        document.getElementById('light1').style.display='block';
                    }
                })
            }
        })
        $("button#test").unbind('click');
    });
    
}

function genererTextArea(adql){
    out = "<div id = \"dadql\">"
    out += "<textarea rows=\"100\" col=\"100\"  id = \"textadql\" style= \" width:500px; height:300px;margin-left:20px\">"+adql+"</textarea>"
    out += " <button type=\"button\" id = \"badql\"class=\"btn btn-primary\" style = \"width:65px;height:30px;position: relative;top: -8px;right: -8px\">Query</button>"
    out +="</div>";
    out +="<br></br>";
    return out;
}


/**
 * generate table of help
 * @param {instance of the jsonRead} n 
 * @param {instance of TapService} s 
 */
function Aide(n,s){
    var a = document.getElementsByName('Cbutton');
    var b = document.getElementsByName('Cinput');
    for(var i =0;i<a.length;i++){
        a[i].onclick = (function closure(ii){
            return function(){
                var name = b[ii].id.slice(1);//the name of 
                var schema = n.json[name].schema;
                var adql = n.AdqlAllColumn(name,schema)
                var QObject = s.Query(adql);
                var dataTable = VOTableTools.votable2Rows(QObject)
                var contentText = QObject.responseText;
                var Field =VOTableTools.genererField(QObject,contentText)
                var nb = Field.length;
                var out ="<div class = \"white_content\" " +
                      "id=\"light\">" +
                      "<span style=\"text-align: left;font-weight: bold;font-size: x-large;\"> Columns of table " +name +"</span>"+
                      "<button class=\"delete_right\" href = \"javascript:void(0)\" "+
                      "onclick = \" document.getElementById('light').style.display='none'\"><i class=\"fa fa-close\" ></i></button><br></br>";//head 
                out += "<table  class = 'table' role = \"grid\" >";
                out +="<thead><tr role=\"row\">";//head
                //out +="<th/>";
                for(var j=0;j<nb;j++){
                    out +="<th rowspan=\"1\"  colspan=\"1\" style=\"text-align:center;vertical-align:bottom\">"+Field[j]+"</th>";
                }
                out +="</tr></thead>";
                out +="<tbody>"
                var column =0;
                for(var j=0;j<dataTable.length;j++){//table  content
                    if(column==0){
                        var judge = (j+nb)/nb;
                        if(judge%2==1){
                            out+="<tr class = \"odd\">";
                            //out+="<td><input type=\"checkbox\"></td>";
                        }
                        else{
                            out+="<tr class = \"even\">";
                            //out+="<td><input type=\"checkbox\"></td>";
                        }
                        var row = j/6+1;
                        out +="<td id = \""+dataTable[j]+"\" style=\"text-align: center;vertical-align:bottom;text-decoration:underline\" >"+dataTable[j]+"</td>";
                    }
                    else{
                        out +="<td style=\"text-align: center;vertical-align:bottom\">"+dataTable[j]+"</td>";
                    }
                    column =column+1;
                    if(column==nb){
                        out +="</tr>";
                        column=0;
                    }
                    
                }
                out+="</tbody>"
                out += "</table>  </div>"
                $("body").prepend(out);
                var td = $("td");
                for (var i = 0; i < td.length; i++) {
                    $(td[i]).click(function () {
                        var i = $(this).attr("id");
                        if($("#"+b[ii].id).val().length!=0){
                            var content = $("#"+b[ii].id).val();
                            $("#"+b[ii].id).val(content + " AND " +name+"."+i+"=");
                            document.getElementById('light').style.display='none';
                        }else{
                            $("#"+b[ii].id).val(name+"."+i+"=");
                            document.getElementById('light').style.display='none';
                        }
                        
                    });
                }
                document.getElementById('light').style.display='block';
            }
        })(i);
    }
}


function genererZone3(adql,s,root,n,listJoinAndId){
    var QObject = s.Query(adql);
    var dataTable = VOTableTools.votable2Rows(QObject);
    var contentText = QObject.responseText;
    var Field =VOTableTools.genererField(QObject,contentText);
    var nb = Field.length;
    if(nb==0){
        $(contentText).find('RESOURCE[type="results"]').each(function(){
            if($(this).find("INFO").attr("name")=="QUERY_STATUS"){
                out = $(this).context.textContent;
                return out;
            }
           
        })
    }
    else{
        out = genererTable(Field,dataTable,n.json,root,listJoinAndId,s);
    }
    return out;
}

function genererTable(Field,dataTable,json,root,listJoinAndId,s){//include textarea
    var listJoin=[];
    var nb = Field.length;
    for(var key in json[root].join_tables){
        listJoin.push(key);
    }
    var out = ""
    out += "<div id = \"ddata\"><table class = 'table' role = \"grid\">";
    out += "<h4>The amount of data is: </h4>"
    out +="<thead><tr role=\"row\">";//head
    out +="<th></th>";
    for(var j=0;j<nb;j++){
        out +="<th class=\"sorting_disabled\" rowspan=\"1\" colspan=\"1\" style=\"text-align: auto;\">"+Field[j]+"</th>";
    }
    out +="</tr></thead>";
    var joinIdDic ={};
    for(var i=0;i<listJoinAndId.length;i=i+2){
        if(!json2Requete.isString(listJoinAndId[i])){
            joinIdDic[listJoinAndId[i+1]]=listJoinAndId[i][0];
        }else{
            joinIdDic[listJoinAndId[i+1]]=listJoinAndId[i];
        }
    }
    var jsonTable ={};
    for(var key in joinIdDic){
        for(var j=0;j<nb;j++){
            if(Field[j]==joinIdDic[key]){
                var temp =j;//save the position of key
            }
        }
        jsonTable[key]=temp;
    }
    //console.log(listJoinAndId)
    //console.log(joinIdDic)
    //console.log(jsonTable)
    out +="<tbody>"
    var count =0;
    var number=0;

    for(var j=0;j<dataTable.length;j++){//table  content
        if(count==0){
            var idTable = [];
            out +="<tr role=\"row\">";
            console.log("number ***   " + number)
            out +="<td><button type=\"button\" id=\""+number+"\" class=\"btn btn-primary\" name = \"div1\">open</button></td>"
            //out +="<td><div class=\"btn-group\" style=\"width :100px\">"+
            //"<button type=\"button\" class=\"btn btn-primary\" >JOIN</button>"+
            //"<button type=\"button\" class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\" >"+
            //    "<span class=\"caret\"></span>"+
            //    "<span class=\"sr-only\"></span>"+
            //"</button>"+
            //"<ul class=\"dropdown-menu\" role=\"menu\">";
            for(var i=0;i<listJoin.length;i++){
                var position = jsonTable[listJoin[i]];
                idTable.push(dataTable[j+position])
                idTable.push(listJoin[i])
            //    out+="<li><a href=\"#\" id=\""+ dataTable[j+position] +"|"+ listJoin[i] + "\"  name = \"boid\">"+listJoin[i]+"</a></li>";
            }
            //out +="</ul>"+"</div></td>";
        }
        
        out +="<td style=\"text-align: auto;\">"+dataTable[j]+"</td>";
        count =count+1;
        if(count==nb){
            out +="</tr>";
            console.log("number   " + number)
            count=0;
            console.log(idTable);
            out +="<tr role=\"row\"><td colspan = \"100\">"
            out +="<table class = 'table' role = \"grid\"  style=\"display:none\"  id = \""+number+"\" name = \"div1\" width=\"100%\">";
            out +=listTableChoisir(idTable,s);
            out +="</table></td></tr>";
            number++;
        }
    }
    out+="</tbody>"
    out += "</table></div>"
    var start = out.indexOf("is:")+3;
    out = out.slice(0,start)+" "+number +out.slice(start)
    return out;
}




function genererDataTable(Field,dataTable){//zone 3 except textarea
    var out1="<div class = \"white_content\" " +
        "id=\"light1\">" +
        //"<span style=\"text-align: left;font-weight: bold;font-size: x-large;\"> Data of table " +name +"</span>"+
        "<button class=\"delete_right\" href = \"javascript:void(0)\" "+
        "onclick = \" document.getElementById('light1').style.display='none'\"><i class=\"fa fa-close\" ></i></button><br></br>";//head 
    out1 += "<table  class = 'table' role = \"grid\" >";
    out1 +="<thead><tr role=\"row\">";//head
    //out +="<th/>";
    var nb = Field.length;
    for(var j=0;j<nb;j++){
    out1 +="<th rowspan=\"1\"  colspan=\"1\" style=\"text-align:center;vertical-align:bottom\">"+Field[j]+"</th>";
    }
    out1 +="</tr></thead>";
    out1 +="<tbody>";
    var column =0;
    for(var j=0;j<dataTable.length;j++){//table  content
    if(column==0){    
        var judge = (j+nb)/nb;
        if(judge%2==1){
            out1+="<tr class = \"odd\">";
            //out+="<td><input type=\"checkbox\"></td>";
        }
        else{
            out1+="<tr class = \"even\">";
            //out+="<td><input type=\"checkbox\"></td>";
        }
        out1 +="<td id = \""+dataTable[j]+"\" style=\"text-align: center;vertical-align:bottom\" >"+dataTable[j]+"</td>";
    }
    else{
        out1 +="<td style=\"text-align: center;vertical-align:bottom\">"+dataTable[j]+"</td>";
    }
    column =column+1;
    if(column==nb){
        out1 +="</tr>";
        column=0;
    }
    }
    out1 +="</tbody>";
    out1 += "</table></div>";
    return out1;
}

function checkAdql(listId){//@TODO special for simbad 
    var adql2 = $("#textadql").val()
    console.log("------------------------")
    console.log(adql2)
    console.log(listId)
    console.log("------------------------")
    var col = adql2.slice(0,adql2.indexOf("FROM"))
    var start1 = adql2.indexOf("FROM")+5;
    var end = adql2.indexOf("JOIN")-1;
    var root = adql2.slice(start1,end)+".";
    console.log(root)
    console.log(col);
    for(var i=0;i<listId.length;i++){
        //if(adql2.indexOf("*")!=-1){//adql has "*"
        //adql2 = adql2;
        //}
        if(col.indexOf(listId[i])!=-1){//adql has "oid"
        console.log(listId[i])
            if(adql2.indexOf("DISTINCT")!=-1){//adql has "DISTINCT"
                if(adql2.indexOf("TOP 100")!=-1){//adql has "TOP 100"
                    continue;
                }
                else{//adql has not "TOP 100" 
                    var start = adql2.indexOf("DISTINCT")+8;
                    adql2 = adql2.slice(0, start) + "\nTOP 100 \n" + adql2.slice(start);
                }
                
            }
            else{//adql has not "DISTINCT"
                if(adql2.indexOf("TOP 100")!=-1){//adql has "TOP 100"
                    var start = adql2.indexOf("TOP 100");
                    aadql2 = adql2.slice(0, start) + "DISTINCT \n" + adql2.slice(start);
                }
                else{//adql has not "TOP 100" 
                    var start = adql2.indexOf("SELECT")+6;
                    adql2 = adql2.slice(0, start) + "DISTINCT \nTOP 100 \n" + adql2.slice(start);
                }
            }
        }
        else{
            console.log(listId[i])
            if(adql2.indexOf("DISTINCT")!=-1){//adql has "DISTINCT"
                if(adql2.indexOf("TOP 100")!=-1){//adql has "TOP 100"
                    if(i!=0&&i!=listId.length-1){//not the first key, not the last key, more than one key
                        var start = adql2.indexOf(listId[i-1])+listId[i-1].length;
                        adql2 = adql2.slice(0, start) + ",\n"+root+listId[i] + adql2.slice(start);
                    }else if(i==0&&i!=listId.length-1){//the first key, not the last key, more than one key
                        var start = adql2.indexOf("TOP 100")+7;
                        adql2 = adql2.slice(0, start) + "\n"+root+listId[i] +","+ adql2.slice(start);
                    }else if(i==0&&listId.length==1){//the first key, only one key
                        var start = adql2.indexOf("TOP 100")+7;
                        adql2 = adql2.slice(0, start) + "\n"+root+listId[i] +","+ adql2.slice(start);
                    }else{
                        var start = adql2.indexOf(listId[i-1])+listId[i-1].length;
                        adql2 = adql2.slice(0, start) + ",\n"+root+listId[i] + adql2.slice(start);
                    }
                }
                else{//adql has not "TOP 100" 
                    var start = adql2.indexOf("DISTINCT")+8;
                    adql2 = adql2.slice(0, start) + "\nTOP 100 \n"+root+listId[i]+"," + adql2.slice(start);
                }
            }
            else{//adql has not "DISTINCT"
                if(adql2.indexOf("TOP 100")!=-1){//adql has "TOP 100"
                    var start = adql2.indexOf("TOP 100");
                    var adql2 = adql2.slice(0, start) + "DISTINCT \n" + adql2.slice(start);
                    start = adql2.indexOf("TOP 100")+7;
                    adql2 = adql2.slice(0, start) + "\n"+root+listId[i]+"," + adql2.slice(start);
                }
                else{//adql has not "TOP 100" 
                    var start = adql2.indexOf("SELECT")+6;
                    adql2 = adql2.slice(0, start) + "\nDISTINCT \nTOP 100 \n"+root+listId[i]+"," + adql2.slice(start);
                }
            }
        }
    }
    if(adql2.indexOf("ORDER")==-1&&adql2.indexOf("order")==-1&&adql2.indexOf("basic")!=-1){
        adql2 += " ORDER BY oid";
    }
    $("#textadql").val(adql2);
    return adql2;
}


function joinAndId(root,json){
    var list = [];
    for(var key in json){
        if(key == root){
            for(var join in json[key].join_tables){
                list.push(json[key].join_tables[join].target);
                list.push(join);
            }
        }
    }
    return list;
}

function getDepth(arr) {
    const eleDepths = []
    arr.forEach( ele => {
      let depth = 0
      if (Array.isArray(ele)) {
        depth = getDepth(ele)
      }
      eleDepths.push(depth)
    })
    return 1 + max(eleDepths)
  }
  
  function max(arr) {
    return arr.reduce( (accu, curr) => {
      if (curr > accu) return curr
      return accu
    })
  }

  function listTable(Field,dataTable,tableName){//data displayed after clicking on the table name
    var out1="<div class = \"white_content\" " +
    "id=\""+tableName+"\">" ;//
    out1 += "<table  class = 'table' role = \"grid\" >";
    out1 +="<thead><tr role=\"row\">";//head
    //out +="<th/>";
    var nb = Field.length;
    for(var j=0;j<nb;j++){
        out1 +="<th rowspan=\"1\"  colspan=\"1\" style=\"text-align:center;vertical-align:bottom\">"+Field[j]+"</th>";
    }
    out1 +="</tr></thead>";
    out1 +="<tbody>";
    var column =0;
    for(var j=0;j<dataTable.length;j++){//table  content
    if(column==0){    
        var judge = (j+nb)/nb;
        if(judge%2==1){
            out1+="<tr class = \"odd\">";
            //out+="<td><input type=\"checkbox\"></td>";
        }
        else{
            out1+="<tr class = \"even\">";
            //out+="<td><input type=\"checkbox\"></td>";
        }
        out1 +="<td id = \""+dataTable[j]+"\" style=\"text-align: center;vertical-align:bottom\" >"+dataTable[j]+"</td>";
    }
    else{
        out1 +="<td style=\"text-align: center;vertical-align:bottom\">"+dataTable[j]+"</td>";
    }
    column =column+1;
    if(column==nb){
        out1 +="</tr>";
        column=0;
    }
    }
    out1 +="</tbody>";
    out1 += "</table></div>";
    return out1;
  }

  function listTableChoisir(listTable,s){
        var out = "";
        var a = listTable.indexOf("ident");
        if(a!=-1){
            out += "<tr><td colspan = \"100%\"><p id=\""+listTable[a-1]+"|"+listTable[a]+"\" style=\"display:inline\">"+listTable[a]+"</p></td>";
            adql = "SELECT id FROM ident WHERE oidref="+listTable[a-1]
            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject);
            out+= "<td><p style=\"display:inline\">"+""+dataTable+"</p></td></tr>"
            listTable.splice(a,1);
            listTable.splice(a-1,1);
        }
        var a = listTable.indexOf("flux");
        if(a!=-1){
            out += "<tr><td colspan = \"100%\"><p id=\""+listTable[a-1]+"|"+listTable[a]+"\" style=\"display:inline\">"+listTable[a]+"</p></td>";
            adql = "SELECT flux FROM flux WHERE oidref="+listTable[a-1]
            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject);
            out+= "<td><p style=\"display:inline\">"+""+dataTable+"</p></td></tr>"
            listTable.splice(a,1);
            listTable.splice(a-1,1);
        }
        var a = listTable.indexOf("otypes");
        if(a!=-1){
            out += "<tr><td colspan = \"100%\"><p id=\""+listTable[a-1]+"|"+listTable[a]+"\" style=\"display:inline\">"+listTable[a]+"</p></td>";
            adql = "SELECT  otype_shortname FROM otypedef join otypes on otypedef.otype=otypes.otype WHERE oidref="+listTable[a-1]
            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject);
            out+= "<td><p style=\"display:inline\">"+""+dataTable+"</p></td></tr>"
            listTable.splice(a,1);
            listTable.splice(a-1,1);
        }
        var a = listTable.indexOf("ref");
        if(a!=-1){
            out += "<tr><td colspan = \"100%\"><p id=\""+listTable[a-1]+"|"+listTable[a]+"\" style=\"display:inline\">"+listTable[a]+"</p></td>";
            adql = "SELECT bibcode FROM ref join has_ref on oidbib = oidbibref WHERE oidref="+listTable[a-1]
            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject);
            out+= "<td><p style=\"display:inline\">"+""+dataTable+"</p></td></tr>"
            listTable.splice(a,1);
            listTable.splice(a-1,1);
        }
        var a = listTable.indexOf("author");
        if(a!=-1){
            out += "<tr><td colspan = \"100%\"><p id=\""+listTable[a-1]+"|"+listTable[a]+"\" style=\"display:inline\">"+listTable[a]+"</p></td>";
            adql = "SELECT name FROM author join \"public\".ref.oidbib=\"public\".author.oidbibref WHERE oidbib="+listTable[a-1]

            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject);
            out+= "<td><p style=\"display:inline\">"+""+dataTable+"</p></td></tr>"
            listTable.splice(a,1);
            listTable.splice(a-1,1);
        }
        var a = listTable.indexOf("keywords");
        if(a!=-1){
            out += "<tr><td colspan = \"100%\"><p id=\""+listTable[a-1]+"|"+listTable[a]+"\" style=\"display:inline\">"+listTable[a]+"</p></td>";
            adql = "SELECT keyword FROM \"public\".ref JOIN \"public\".keywords ON \"public\".ref.oidbib=\"public\".keywords.oidbibref WHERE oidbib="+listTable[a-1]
            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject);
            out+= "<td><p style=\"display:inline\">"+""+dataTable+"</p></td></tr>"
            listTable.splice(a,1);
            listTable.splice(a-1,1);
        }
        var a = listTable.indexOf("has_ref");
        if(a!=-1){
            out += "<tr><td colspan = \"100%\"><p id=\""+listTable[a-1]+"|"+listTable[a]+"\" style=\"display:inline\">"+"object"+"</p></td>";
            adql = "SELECT \"public\".basic.main_id FROM \"public\".has_ref JOIN \"public\".ref ON \"public\".ref.oidbib=\"public\".has_ref.oidbibref JOIN \"public\".basic ON \"public\".has_ref.oidbibref=\"public\".basic.oid WHERE oidbib="+listTable[a-1]
            console.log("**********************")
            console.log(listTable[a-1])
            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject);
            var newDataTable = Array.from(new Set(dataTable))//remove dulicate data from an array
            out+= "<td><p style=\"display:inline\">"+""+newDataTable+"</p></td></tr>"
            listTable.splice(a,1);
            listTable.splice(a-1,1);
        }

        console.log(listTable)
        if(listTable.length==0){

        }else{
            out +="<tr><td><div class=\"btn-group\" style=\"width :100px\">"+
            "<button type=\"button\" class=\"btn btn-primary\" >JOIN</button>"+
            "<button type=\"button\" class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\" >"+
                "<span class=\"caret\"></span>"+
                "<span class=\"sr-only\"></span>"+
            "</button>"+
            "<ul class=\"dropdown-menu\" role=\"menu\">";
            for(var i=1;i<listTable.length;i=i+2){
                out += "<li><a href=\"#\" id=\""+listTable[i-1]+"|"+listTable[i]+"\" name = \"boid\">"+listTable[i]+"</a></li>";
            }
            out +="</ul>"+"</div></td></tr>";
        }
        
        //out += "</div>";
        console.log(out)
        return out;
  }