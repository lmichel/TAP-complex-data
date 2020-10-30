document.write("<script type='text/javascript' src= '../../module/js/json2Requete.js'></script>");
function main(){
   // initial();

    var $top_simbad = $("#top_simbad");//Simbad
    var $top_gavo = $("#top_gavo");//GAVO
    var $top_vizier = $("#top_vizier");//VizieR
    var $top_caom = $("#top_caom");//CAOM

   
    $("#simbad,#cs00").click(function(){
        $("#showRoot").empty();//Clear the contents of menu.
        var top_simbad = false;
        if($("#simbadCS").val()!=''){
            var schema = $("#simbadCS").val()
        }
        else{
            var schema = "public";
        }
        if($top_simbad.prop("checked"))//To check if choose the TOP 100. By default, it's false.
        {
            top_simbad = true;
        }
        var s = new TapService("http://simbad.u-strasbg.fr/simbad/sim-tap/sync",schema,"Simbad",top_simbad);
        alert(+" shema "+schema+"\n top "+top_simbad);
        var data = s.createJson();
        $("#load1").html(
            JSON.stringify(data, undefined, 6)
        );
        var sj=new jsonRead(data); 
        //s.createJson(data,"basic");
        var output = "";
        output += sj.showAll(data);
        $("#load2").html(output);//show all the informations of rootTable and it's join tables
        var mostUsedTable = sj.mostUsed();//read json, return all the most used table ([0] is the most used) as array
        var add ="" 
        for(var i = 0;i<5;i++){//add five bouton of the most used table
            add ="<li><a href='#' id="+"\'"+ mostUsedTable[i]+"\'"+">"+mostUsedTable[i]+": "+data[mostUsedTable[i]].description+"</a></li>";
            $("#showRoot").append(add);
        }
        var flag = 0;
        $("#"+mostUsedTable[0]).click(function(){//add the click event
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[0]);
            $("#load2").html(output);
            Aide(sj,s)
            limitJson2data(sj,s);
            flag= 1;
        })
        $("#"+mostUsedTable[1]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            Aide(sj,s)
            limitJson2data(sj,s);
            flag= 2;
        })
        $("#"+mostUsedTable[2]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            Aide(sj,s)
            limitJson2data(sj,s);
            flag= 3;
        })
        $("#"+mostUsedTable[3]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            Aide(sj,s)
            limitJson2data(sj,s);
            flag= 4;
        })
        $("#"+mostUsedTable[4]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
            Aide(sj,s)
            limitJson2data(sj,s);
            flag= 5;
        })
        $("#c00").click(function(){
            switch(flag){
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    $("#load2").empty();
                    output = s.createNewJson(data,mostUsedTable[flag-1]);
                    $("#load2").html(
                        JSON.stringify(output, undefined, 4)
                    );
                    flag=flag+5;
                    break;
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    $("#load2").empty();
                    output = sj.json2Html(mostUsedTable[flag-6]);
                    $("#load2").html(output);
                    Aide(sj,s)
                    limitJson2data(sj,s);
                    flag = flag-5;
                    break;
            }
        })

        
    })

    $("#gavo,#cs01").click(function(){
        $("#showRoot").empty();//Clear the contents of menu.
        var top_gavo = false;
        if($("#gavoCS").val()!=''){
            var schema = $("#gavoCS").val()
        }
        else{
            var schema = "rr";
        }
        if($top_gavo.prop("checked"))
        {
            top_gavo = true;
        }
        var g = new TapService("http://dc.zah.uni-heidelberg.de/tap/sync",schema,"GAVO",top_gavo);
        var data = g.createJson();
        $("#load1").html(
            JSON.stringify(data, undefined, 6)
        );
        var gj=new jsonRead(data);
        //var rootTable = gj.rootTable();//read json, return all the rootTable as array
        var output = "";
        output += gj.showAll(data);
        $("#load2").html(output);//show all the informations of rootTable and it's join tables
        var mostUsedTable = gj.mostUsed(data);//read json, return all the most used table ([0] is the most used) as array
        var add ="" 
        for(var i = 0;i<5;i++){//add five bouton of the most used table
            add ="<li><a href='#' id="+"\'"+'r0'+i+"\'"+">"+mostUsedTable[i]+": "+data[mostUsedTable[i]].description+"</a></li>";
            $("#showRoot").append(add);
        }
        var flag = 0;
        $("#r00").click(function(){//add the click event
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[0]);
            $("#load2").html(output);
            Aide(gj,g)
            limitJson2data(gj,g);
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            Aide(gj,g);
            limitJson2data(gj,g);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            Aide(gj,g);
            limitJson2data(gj,g);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            Aide(gj,g);
            limitJson2data(gj,g);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
            Aide(gj,g);
            limitJson2data(gj,g);
            flag= 5;
        })
        $("#c00").click(function(){
            switch(flag){
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    $("#load2").empty();
                    output = g.createNewJson(data,mostUsedTable[flag-1]);
                    $("#load2").html(
                        JSON.stringify(output, undefined, 4)
                    );
                    flag=flag+5;
                    break;
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    $("#load2").empty();
                    output = gj.json2Html(mostUsedTable[flag-6]);
                    $("#load2").html(output);
                    Aide(gj,g);
                    limitJson2data(gj,g);
                    flag = flag-5;
                    break;
            }
        })
    })

    $("#vizier,#cs02").click(function(){
        $("#showRoot").empty();//Clear the contents of menu.
        var top_vizier = false;
        if($("#vizierCS").val()!=''){
            var schema = $("#vizierCS").val()
        }
        else{
            var schema = "metaviz";
        }
        if($top_vizier.prop("checked"))
        {
            top_vizier = true;
        }
        var v = new TapService("http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync",schema,"Vizier",top_vizier);
        var data = v.createJson();
        console.log(data)
        $("#load1").html(
            JSON.stringify(data, undefined, 6)
        );
        var vj=new jsonRead(data);
        console.log(vj)
        //var rootTable = vj.rootTable();//read json, return all the rootTable as array
        var output = "";
        output += vj.showAll(data)
        $("#load2").html(output);//show all the informations of rootTable and it's join tables
        var mostUsedTable = vj.mostUsed(data);//read json, return all the most used table ([0] is the most used) as array
        var add ="" 
        for(var i = 0;i<5;i++){//add five bouton of the most used table
            add ="<li><a href='#' id="+"\'"+'r0'+i+"\'"+">"+mostUsedTable[i]+": "+data[mostUsedTable[i]].description+"</a></li>";
            $("#showRoot").append(add);
        }
        var flag = 0;
        $("#r00").click(function(){//add the click event
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[0]);
            $("#load2").html(output);
            Aide(vj,v);
            limitJson2data(vj,v);
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            Aide(vj,v);
            limitJson2data(vj,v);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            Aide(vj,v);
            limitJson2data(vj,v);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            Aide(vj,v);
            limitJson2data(vj,v);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
            Aide(vj,v);
            limitJson2data(vj,v);
            flag= 5;
        })
        $("#c00").click(function(){
            switch(flag){
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    $("#load2").empty();
                    output = v.createNewJson(data,mostUsedTable[flag-1]);
                    $("#load2").html(
                        JSON.stringify(output, undefined, 4)
                    );
                    flag=flag+5;
                    break;
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    $("#load2").empty();
                    output = vj.json2Html(mostUsedTable[flag-6]);
                    $("#load2").html(output);
                    Aide(vj,v);
                    limitJson2data(vj,v);
                    flag = flag-5;
                    break;
            }
        })
    })

    $("#caom,#cs03").click(function(){

        $("#showRoot").empty();//Clear the contents of menu
        var top_caom = false;
        if($("#caomCS").val()!=''){
            var schema = $("#caomCS").val()
        }
        else{
            var schema = "dbo";
        }
        if($top_caom.prop("checked"))
        {
            top_caom = true;
        }
        var c = new TapService("http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync",schema,"CAOM",top_caom);
        var data = c.createJson();
        $("#load1").html(
            JSON.stringify(data, undefined, 6)
        );
        var cj=new jsonRead(data);
        //var rootTable = cj.rootTable();//read json, return all the rootTable as array
        var output = "";
        output += cj.showAll(data)
        $("#load2").html(output);//show all the informations of rootTable and it's join tables
        var mostUsedTable = cj.mostUsed(data);//read json, return all the most used table ([0] is the most used) as array
        var add ="" 
        for(var i = 0;i<5;i++){//add five bouton of the most used table
            add ="<li><a href='#' id="+"\'"+'r0'+i+"\'"+">"+mostUsedTable[i]+": "+data[mostUsedTable[i]].description+"</a></li>";
            $("#showRoot").append(add);
        }
        var flag = 0;
        $("#r00").click(function(){//add the click event
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[0]);
            $("#load2").html(output);
            Aide(cj,c);
            limitJson2data(cj,c);
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            Aide(cj,c);
            limitJson2data(cj,c);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            Aide(cj,c);
            limitJson2data(cj,c);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            Aide(cj,c);
            limitJson2data(cj,c);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
            Aide(cj,c);
            limitJson2data(cj,c);
            flag= 5;
        })
        $("#c00").click(function(){
            switch(flag){
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    $("#load2").empty();
                    output = c.createNewJson(data,mostUsedTable[flag-1]);
                    $("#load2").html(
                        JSON.stringify(output, undefined, 4)
                    );
                    flag=flag+5;
                    break;
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    $("#load2").empty();
                    output = cj.json2Html(mostUsedTable[flag-6]);
                    $("#load2").html(output);
                    Aide(cj,c);
                    limitJson2data(cj,c);
                    flag = flag-5;
                    break;
            }
        })
    })
}


function limitJson2data(n,s){//n: instance of the jsonRead; s: instance of TapService
    var jsont = n.json
    $("button#test").on('click',{"json" : jsont},function(event){//@TODO 
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
            console.log("èèèèèèèèèèè")
            console.log(json2)
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
                       // alert(out);
                    }
                })
            }
            var out3 = genererTextArea(adql);
           // $("#load4").html(out);
            
           // out += genererTable(Field,dataTable,t,rootName,listJoinAndId);
            $("#load3").html(out3);
            constraints="";
            window.location.hash = "#load3"
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
                console.log("oidJson /n" + oidJson)
                console.log(oidJson)
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
                    $(this).parent().parent().after(out1);
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
            console.log("haoyun \n"+ list +"\n"+keyConstraint+"\n"+t)
            console.log(t)
            var json =n.CreateJsonWithoutColumns(list,keyConstraint,0,t);
            var adql = json2Requete.getAdql(json);
            alert("adql\n"+adql);
            var QObject = s.Query(adql);
            var dataTable = VOTableTools.votable2Rows(QObject)
            var contentText = QObject.responseText;
            var Field =VOTableTools.genererField(QObject,contentText);
            var nb = Field.length;
            if(nb==0){//report error message
                $(contentText).find('RESOURCE[type="results"]').each(function(){
                    if($(this).find("INFO").attr("name")=="QUERY_STATUS"){
                        out = $(this).context.textContent
                       // alert(out);
                    }
                })
            
            }
            
            // my out file
            var out = genererTextArea(adql);
            $("#load4").html(out);
            window.location.hash = "#load4";


            var out2 = genererTable(Field,dataTable,t,rootName,listJoinAndId);
            $("#load3").html(out2);
            window.location.hash = "#load3";
            var column=[];
            for(var i=0;i<listId.length;i++){
                column.push(rootName);
                column.push(listId[i]);
            }
            var json2= n.CreateJsonAndContraint(list,keyConstraint,column,0,t);
            console.log("èèèèèèèèèèè")
            console.log(json2)
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
                console.log("oidJson /n" )
                console.log(oidJson)
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
                    $(this).parent().parent().after(out1);
                    document.getElementById('light1').style.display='block';
                }
            })
        }
        //$("button#test").unbind('click')
        $("#badql").on("click",function(){//regenerate the form of the query
            var adql2 = checkAdql(listId);
            
            out = genererZone3(adql2,s,rootName,n,listJoinAndId);
            
            if(listId.length == 1){
                var start = adql2.indexOf(listId[0])+listId[0].length;
                var end = adql2.indexOf("FROM");
                if(adql2.indexOf(listId[0])==-1){
                    adql2 = adql2.slice(0,start)+",\n"+listId[0]+"\n"+adql2.slice(end);
                    console.log(" 1 @@@@@@@@@@@@@@@ "+adql2+" @@@@@@@@@@@@@@@")
                }
                else{
                    start = adql2.indexOf(listId[0])+listId[0].length;
                    adql2 = adql2.slice(0,start)+"\n"+adql2.slice(end);

                    console.log(" 2 @@@@@@@@@@@@@@@ "+adql2+" @@@@@@@@@@@@@@@")
                }
            }
            else{
                for(var i = 1;i<listId.length;i++){
                    var start = adql2.indexOf(listId[i-1])+listId[i-1].length;
                    var end = adql2.indexOf("FROM");
                    if(adql2.indexOf(listId[i])==-1){
                        adql2 = adql2.slice(0,start)+",\n"+listId[i]+"\n"+adql2.slice(end);
                        
                        console.log(" 3 start @@@@@@@@@@@@@@@ "+start+" @@@@@@@@@@@@@@@")
                        console.log(" 3 @@@@@@@@@@@@@@@ "+adql2+" @@@@@@@@@@@@@@@")
                    }
                    else{
                        start = adql2.indexOf(listId[i])+listId[i].length;
                        adql2 = //adql2.slice(0,start)+"\n"+adql2.slice(end);
                        //console.log(" 4 start @@@@@@@@@@@@@@@ "+listId[i]+" @@@@@@@@@@@@@@@")
                        console.log(" 4 @@@@@@@@@@@@@@@ "+adql2+" @@@@@@@@@@@@@@@")
                    }
                }
            }
            
            
            var oidJson = s.createMainJson(adql2,t,rootName,listId,listJoinAndId);//@TODO oid otype should not appear in this place
           // console.log("@@@@@@@@@@@@@@@ "+adql2+" @@@@@@@@@@@@@@@")
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
                    console.log("oidJson /n" )
                    console.log(oidJson)
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
                        $(this).parent().parent().after(out1);
                        document.getElementById('light1').style.display='block';
                    }
                })
            }
        })
        $("button#test").unbind('click');
    });
    
}

function genererTextArea(adql){
    out = "<div id = 'dadql'>"
    out += "<textarea rows='100' col='100'  id = 'textadql' style= ' width:400px; height:300px;margin-left:20px'>"+adql+"</textarea><br><br>"
    out += " <button type='button' id = 'badql'class='btn btn-primary' style = 'width:auto;height:30px;position: relative;top: -8px;right: -8px'>Run ADQL Query</button>"
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
                var out ="<div class = 'AIDE ' " +
                      "id='light'>" +
                      "<span style='text-align: left;font-weight: bold;font-size: x-large;'> Columns of table " +name +"</span>"+
                      "<button class='delete_right' id='d_right' href = 'javascript:void(0)' "+
                      "onclick = ' document.getElementById('light').style.display='none''><i class='fa fa-close' ></i></button><br></br>";//head 
                out += "<table  class = 'table' role = 'grid' >";
                out +="<thead><tr role='row'>";//head
                //out +="<th/>";
                for(var j=0;j<nb;j++){
                    out +="<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>"+Field[j]+"</th>";
                }
                out +="</tr></thead>";
                out +="<tbody>"
                var column =0;
                for(var j=0;j<dataTable.length;j++){//table  content
                    if(column==0){
                        var judge = (j+nb)/nb;
                        if(judge%2==1){
                            out+="<tr class = 'odd'>";
                            //out+="<td><input type='checkbox'></td>";
                        }
                        else{
                            out+="<tr class = 'even'>";
                            //out+="<td><input type='checkbox'></td>";
                        }
                        //var row = j/6+1;
                        out +="<td id = '"+dataTable[j]+"' style='text-align: center;vertical-align:bottom;text-decoration:underline' >"+dataTable[j]+"</td>";
                    }
                    else{
                        out +="<td style='text-align: center;vertical-align:bottom'>"+dataTable[j]+"</td>";
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
    console.log("field1111111111111")
    console.log(Field)
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
        out = genererTable(Field,dataTable,n.json,root,listJoinAndId);
    }
    return out;
}

function genererTable(Field,dataTable,json,root,listJoinAndId){//include textarea
    var listJoin=[];
    var nb = Field.length;
    for(var key in json[root].join_tables){
        listJoin.push(key);
    }
    var out = ""
    out += "<div id = 'ddata'><table class = 'table' role = 'grid'>";
    out += "<h4>The amount of data is: </h4>"
    out +="<thead><tr role='row'>";//head
    out +="<th></th>";
    for(var j=0;j<nb;j++){
        out +="<th class='sorting_disabled' rowspan='1' colspan='1' style='text-align: auto;'>"+Field[j]+"</th>";
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
            out +="<tr role='row'>";
            out +="<td><div class='btn-group' style='width :100px'>"+
            "<button type='button' class='btn btn-primary' >JOIN</button>"+
            "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown' >"+
                "<span class='caret'></span>"+
                "<span class='sr-only'></span>"+
            "</button>"+
            "<ul class='dropdown-menu' role='menu'>";
            for(var i=0;i<listJoin.length;i++){
                var position = jsonTable[listJoin[i]];
                out+="<li><a href='#' id='"+ dataTable[j+position] +"|"+ listJoin[i] + "'  name = 'boid'>"+listJoin[i]+"</a></li>";
            }
            out +="</ul>"+"</div></td>";
        }
        
        out +="<td style='text-align: auto;'>"+dataTable[j]+"</td>";
        count =count+1;
        if(count==nb){
            out +="</tr>";
            number++;
            count=0;
        }
    }
    out+="</tbody>"
    out += "</table></div>"
    var start = out.indexOf("is:")+3;
    out = out.slice(0,start)+" "+number +out.slice(start)
    return out;
}



function genererDataTable(Field,dataTable){//zone 3 except textarea class = 'white_content' 
       
    var out1="<tr name ='light1'><td colspan='100' style='position:relative'><div class = 'white_content' " +
    "> <table style='text-align:center;display:inline; table-layout:fixed; word-break: break-all' >" +
   /*
    "<div class='btn-group' style='width :100px; left:auto ''>"+
        "<button type='button' class='btn btn-primary'>JOIN</button>"+
        "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown' >"+
            "<span class='caret'></span>"+
            "<span class='sr-only'></span>"+
        "</button>"+
        "</div>"+*/

    "<button class='delete_right' id='d_right' href = 'javascript:void(0)' "+
    "onclick = ' var a = document.getElementsByName('light1')[0]; var listChild = a.childNodes;"+
    " while(listChild != null && listChild.length>0){a.removeChild(listChild[0]);var b = a.parentNode;b.removeChild(a)}'>"+
    "<i class='fa fa-close' ></i></button><br></br>";//head 
    out1 +="<thead><tr role='row'>";//head
    //out +="<th/>";
    var nb = Field.length;
    for(var j=0;j<nb;j++){
    out1 +="<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>"+Field[j]+"&nbsp&nbsp</th>";
    }
    out1 +="</tr></thead>";
    out1 +="<tbody>";
    var column =0;
    for(var j=0;j<dataTable.length;j++){//table  content
    if(column==0){    
        var judge = (j+nb)/nb;
        if(judge%2==1){
            out1+="<tr class = 'odd'>";
            //out+="<td><input type='checkbox'></td>";
        }
        else{
            out1+="<tr class = 'even'>";
            //out+="<td><input type='checkbox'></td>";
        }
        out1 +="<td id = '"+dataTable[j]+"' style='text-align: center;vertical-align:bottom' >"+dataTable[j]+"</td>";
    }
    else{
        out1 +="<td style='text-align: center;vertical-align:bottom'>"+dataTable[j]+"</td>";
    }
    column =column+1;
    if(column==nb){
        out1 +="</tr>";
        column=0;
    }
    }
    out1 +="</tbody>";
    out1 += "</table></div></td></tr>";
    return out1;
}

function checkAdql(listId){//@TODO special for simbad 
    var adql2 = $("#textadql").val()
    var adqlFromTextArea = adql2;
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
                        //console.log("+++++++++++++++++++++++++++> "+adql2)
                        adql2 = adql2.slice(0, start) + ",\n"+root+listId[i] + adql2.slice(start);
                        
                    }else if(i==0&&i!=listId.length-1){//the first key, not the last key, more than one key
                        var start = adql2.indexOf("TOP 100")+7;
                        adql2 = adql2.slice(0, start) + "\n"+root+listId[i] +","+ adql2.slice(start);
                        console.log("11 +++++++++++++++++++++++++++> "+adql2+"\n end"+adql2.slice(start)+"\n root id"+root+listId[i])
                    }else if(i==0&&listId.length==1){//the first key, only one key
                        var start = adql2.indexOf("TOP 100")+7;
                        adql2 = adql2.slice(0, start) + "\n"+root+listId[i] +","+ adql2.slice(start);
                        console.log("22 +++++++++++++++++++++++++++> "+adql2+"\n end"+adql2.slice(start)+"\n root id"+root+listId[i])
                    }else{
                        var start = adql2.indexOf(listId[i-1])+listId[i-1].length;
                        adql2 =adqlFromTextArea; //adql2.slice(0, start) + ",\n"+root+listId[i] + adql2.slice(start);
                        //console.log("33 +++++++++++++++++++++++++++> "+adql2+"\n end"+adql2.slice(start)+"\n root id"+root+listId[i])
                    }
                    //console.log("+++++++++++++++++++++++++++>"+adql2)
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
    console.log(adql2)
    $("#textadql").val(adql2);
    return adql2;
}

function initial(){
    var $initial = $("<div class='page-header' style='text-align: center'>"+
        "<h1>TAP TEST"+
            "<small>Obas</small>"+
        "</h1>"+
    "</div>"+
        "<h1>TAP TEST"+
            "<small>Obas</small>"+
        "</h1>"+
    "</div>"+
    "<div class='btn-group' style='padding-right:10px; padding-left:400px'>"+
        "<button type='button' class='btn btn-primary' >Simbad</button>"+
        "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown' >"+
            "<span class='caret'></span>"+
            "<span class='sr-only'></span>"+
        "</button>"+
        "<ul class='dropdown-menu' role='menu' style='margin-left:400px'>"+
            "<li><a href='#' id='simbad'>schema: public</a></li>"+
            "<li class='divider'></li>"+
            "<li><a href='http://simbad.u-strasbg.fr/simbad/sim-tap'>TAP Simbad</a></li>"+
        "</ul>"+
    "</div>"+
    "<input type='checkbox' id = 'top_simbad' >TOP 100"+

    "<div class='btn-group' style='padding-right:10px; padding-left:50px'>"+
        "<button type='button' class='btn btn-primary'>GAVO</button>"+
        "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>"+
            "<span class='caret'></span>"+
            "<span class='sr-only'></span>"+
        "</button>"+
        "<ul class='dropdown-menu' role='menu' style='margin-left:50px'>"+
            "<li><a href='#' id='gavo'>schema: rr</a></li>"+
            "<li class='divider'></li>"+
            "<li><a href='http://dc.zah.uni-heidelberg.de/__system__/adql/query'>TAP GAVO</a></li>"+
        "</ul>"+
    "</div>"+
    "<input type='checkbox' id = 'top_gavo' >TOP 100"+

    "<div class='btn-group' style='padding-right:10px; padding-left:50px'>"+
        "<button type='button' class='btn btn-primary'>VizieR</button>"+
        "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>"+
            "<span class='caret'></span>"+
            "<span class='sr-only'></span>"+
        "</button>"+
        "<ul class='dropdown-menu' role='menu' style='margin-left:50px'>"+
            "<li><a href='#' id='vizier'>schema: metaviz</a></li>"+
            "<li class='divider'></li>"+
            "<li><a href='http://tapvizier.u-strasbg.fr/TAPVizieR/'>TAP VizieR</a></li>"+
        "</ul>"+
    "</div>"+
    "<input type='checkbox' id = 'top_vizier' >TOP 100"+

    "<div class='btn-group' style='padding-right:10px; padding-left:50px'>"+
        "<button type='button' class='btn btn-primary'>CAOM</button>"+
        "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>"+
            "<span class='caret'></span>"+
            "<span class='sr-only'></span>"+
        "</button>"+
        "<ul class='dropdown-menu' role='menu' style='margin-left:50px'>"+
            "<li><a href='#' id='caom'>schema: dbo</a></li>"+
            "<li class='divider'></li>"+
            "<li><a href='http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap/'>TAP CAOM</a></li>"+
        "</ul>"+
    "</div>"+
    "<input type='checkbox' id = 'top_caom' >TOP 100"+
    "<br></br>"+
    "<input id='simbadCS' type='text' style = 'width: 100px;margin-left:400px' placeholder='public'>"+
    "<div class='btn-group' style=' padding-left:5px;padding-right:40px'>"+
        "<button type='button' id = 'cs00' class='btn btn-primary'>Change</button>"+
    "</div>"+
    "<input id='gavoCS' type='text' style = 'width: 100px' placeholder='rr'>"+
    "<div class='btn-group' style=' padding-left:10px;padding-right:40px'> "+
        "<button type='button' id = 'cs01' class='btn btn-primary'>Change</button>"+
    "</div>"+
    "<input id='vizierCS' type='text' style = 'width: 100px' placeholder='metaviz'>"+
    "<div class='btn-group' style=' padding-left:10px;padding-right:40px'>"+
        "<button type='button' id = 'cs02' class='btn btn-primary'>Change</button>"+
    "</div>"+
    "<input id='caomCS' type='text' style = 'width: 100px' placeholder='dbo'>"+
    "<div class='btn-group' style=' padding-left:10px;padding-right:40px'>"+
        "<button type='button' id = 'cs03' class='btn btn-primary'>Change</button>"+
    "</div>"+
    "<br></br>"+
    "<pre id='load1' style= 'background-color:white; overflow:scroll; width:800px; height:300px;margin-left:400px'></pre>"+
    "<div class='btn-group' style='text-align: center; padding-left:400px'>"+
        "<button type='button' id = 'c00' class='btn btn-primary'>Change</button>"+
    "</div>"+
    "<div class='btn-group' style='text-align: center; padding-left:610px'>"+
        "<button type='button' class='btn btn-primary'>RootTable</button>"+
        "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>"+
            "<span class='caret'></span>"+
            "<span class='sr-only'></span>"+
        "</button>"+
        "<ul class='dropdown-menu' id = 'showRoot' role='menu' style='margin-left:590px'>"+
        "</ul>"+
    "</div>"+
    
    "<br></br>"+
    "<pre id='load2' style= 'background-color:white; overflow:scroll; width:800px; height:700px;margin-left:400px; font-size:15px ;float:left'> </pre>"+
    "<div class='btn-group' style='text-align: center; padding-left:100px;float:left;top :350px'>"+
            "<button type='button' id = 'test' class='btn btn-primary'>Génerer ADQL</button>"+
        "</div>"+
    "<pre id='load3' style= 'background-color:white; overflow:scroll; width:1400px; height:900px;margin-left:200px; font-size:12px; line-height: 2.3'></pre>")
    $("body").append($initial);
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










function initial2

(){

  var $initial = $("<div class='page-header' style='text-align: center'>"+
  "<h1>TAP TEST"+
      "<small>Obas</small>"+
  "</h1>"+
"</div>"+
  "<h1>TAP TEST"+
      "<small>Obas</small>"+
  "</h1>"+
"</div>"+
"<div class='btn-group' style='padding-right:10px; padding-left:400px'>"+
  "<button type='button' class='btn btn-primary' >Simbad</button>"+
  "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown' >"+
      "<span class='caret'></span>"+
      "<span class='sr-only'></span>"+
  "</button>"+
  "<ul class='dropdown-menu' role='menu' style='margin-left:400px'>"+
      "<li><a href='#' id='simbad'>schema: public</a></li>"+
      "<li class='divider'></li>"+
      "<li><a href='http://simbad.u-strasbg.fr/simbad/sim-tap'>TAP Simbad</a></li>"+
  "</ul>"+
"</div>"+
"<input type='checkbox' id = 'top_simbad' >TOP 100"+

"<div class='btn-group' style='padding-right:10px; padding-left:50px'>"+
  "<button type='button' class='btn btn-primary'>GAVO</button>"+
  "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>"+
      "<span class='caret'></span>"+
      "<span class='sr-only'></span>"+
  "</button>"+
  "<ul class='dropdown-menu' role='menu' style='margin-left:50px'>"+
      "<li><a href='#' id='gavo'>schema: rr</a></li>"+
      "<li class='divider'></li>"+
      "<li><a href='http://dc.zah.uni-heidelberg.de/__system__/adql/query'>TAP GAVO</a></li>"+
  "</ul>"+
"</div>"+
"<input type='checkbox' id = 'top_gavo' >TOP 100"+

"<div class='btn-group' style='padding-right:10px; padding-left:50px'>"+
  "<button type='button' class='btn btn-primary'>VizieR</button>"+
  "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>"+
      "<span class='caret'></span>"+
      "<span class='sr-only'></span>"+
  "</button>"+
  "<ul class='dropdown-menu' role='menu' style='margin-left:50px'>"+
      "<li><a href='#' id='vizier'>schema: metaviz</a></li>"+
      "<li class='divider'></li>"+
      "<li><a href='http://tapvizier.u-strasbg.fr/TAPVizieR/'>TAP VizieR</a></li>"+
  "</ul>"+
"</div>"+
"<input type='checkbox' id = 'top_vizier' >TOP 100"+

"<div class='btn-group' style='padding-right:10px; padding-left:50px'>"+
  "<button type='button' class='btn btn-primary'>CAOM</button>"+
  "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>"+
      "<span class='caret'></span>"+
      "<span class='sr-only'></span>"+
  "</button>"+
  "<ul class='dropdown-menu' role='menu' style='margin-left:50px'>"+
      "<li><a href='#' id='caom'>schema: dbo</a></li>"+
      "<li class='divider'></li>"+
      "<li><a href='http://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap/'>TAP CAOM</a></li>"+
  "</ul>"+
"</div>"+
"<input type='checkbox' id = 'top_caom' >TOP 100"+
"<br></br>"+
"<input id='simbadCS' type='text' style = 'width: 100px;margin-left:400px' placeholder='public'>"+
"<div class='btn-group' style=' padding-left:5px;padding-right:40px'>"+
  "<button type='button' id = 'cs00' class='btn btn-primary'>Change</button>"+
"</div>"+
"<input id='gavoCS' type='text' style = 'width: 100px' placeholder='rr'>"+
"<div class='btn-group' style=' padding-left:10px;padding-right:40px'> "+
  "<button type='button' id = 'cs01' class='btn btn-primary'>Change</button>"+
"</div>"+
"<input id='vizierCS' type='text' style = 'width: 100px' placeholder='metaviz'>"+
"<div class='btn-group' style=' padding-left:10px;padding-right:40px'>"+
  "<button type='button' id = 'cs02' class='btn btn-primary'>Change</button>"+
"</div>"+
"<input id='caomCS' type='text' style = 'width: 100px' placeholder='dbo'>"+
"<div class='btn-group' style=' padding-left:10px;padding-right:40px'>"+
  "<button type='button' id = 'cs03' class='btn btn-primary'>Change</button>"+
"</div>"+
"<br></br>"+
"<pre id='load1' style= 'background-color:white; overflow:scroll; width:800px; height:300px;margin-left:400px'></pre>"+
"<div class='btn-group' style='text-align: center; padding-left:400px'>"+
  "<button type='button' id = 'c00' class='btn btn-primary'>Change</button>"+
"</div>"+
"<div class='btn-group' style='text-align: center; padding-left:610px'>"+
  "<button type='button' class='btn btn-primary'>RootTable</button>"+
  "<button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>"+
      "<span class='caret'></span>"+
      "<span class='sr-only'></span>"+
  "</button>"+
  "<ul class='dropdown-menu' id = 'showRoot' role='menu' style='margin-left:590px'>"+
  "</ul>"+
"</div>"+

"<br></br>"+
"<pre id='load2' style= 'background-color:white; overflow:scroll; width:800px; height:700px;margin-left:400px; font-size:15px ;float:left'> </pre>"+
"<div class='btn-group' style='text-align: center; padding-left:100px;float:left;top :350px'>"+
      "<button type='button' id = 'test' class='btn btn-primary'>Génerer ADQL</button>"+
  "</div>"+
"<pre id='load3' style= 'background-color:white; overflow:scroll; width:1400px; height:900px;margin-left:200px; font-size:12px; line-height: 2.3'></pre>")
$("body").append($initial);
}
























<div class="col-lg-2">
List of database <br><hr>


<div class='' style='padding-right:0px'>
      <span class='caret'></span>
      <span class='sr-only'></span>
  <ul>
      <li><a href='#' id='simbad'>schema: public</a></li>
      
  </ul>
</div>





</div>
<div class="col-lg-8 ">
<ul class="nav nav-tabs">
    <li class="active"><a data-toggle="tab" href="#menu1">Database</a></li>
    
  </ul>
  



  <div class="tab-content">
    

    <div id="menu1" class="tab-pane fade">
    
      <div class='row' style='margin-left:-100px'>
        <div class="col-lg-2">
          <ul><li class='panel panel-success' id = 'showRoot' role='menu' style='margin-left:0px'></li></ul>
        </div>
       
        <div class="col-lg-8">
          <!--pre id='load3' style= 'background-color:white; overflow:scroll; width:1250px; height:400px;margin-left:0px; font-size:12px; line-height: 2.3'></pre-->
          <pre id='' style= 'background-color:white; overflow:scroll; width:1250px; height:400px;margin-left:0px; font-size:12px; line-height: 2.3'></pre>
          <div class='btn-group' style='text-align: center; padding-left:0px;float:left;top :0px'>
            <button type='button' id = 'test' class='btn btn-primary' data-toggle="modal" data-target="#myModal">Run ADQL</button>
           </div>
            <div class="row">
              <div class="col-lg-8">
                <pre id='load2' class="mt-4" style= 'background-color:white; overflow:scroll; width:700px; height:400px;margin-left:0px; font-size:10px ;'> </pre>
              </div>
              <div class="col-lg-4 offset-6" style="margin-left: 850px; margin-top: -413px;">
                <pre id='load4' class="" style= 'background-color:white; overflow:scroll; width:350px; height:400px;margin-left:200px; font-size:10px ;float: right;'>
                   </pre>
           
              </div> 
            </div> 
            
              </div>
            
        </div>
        </div>
       
    </div>
    </div>
    <div id="menu2" class="tab-pane fade">
      
      
     
     <div class='page-header' >
       <div class="hide">
        <input id='simbadCS' type='text' style = 'width: 100px;margin-left:400px' placeholder='public'>
        <div class='btn-group' style=' padding-left:5px;padding-right:40px'>
            <button type='button' id = 'cs00' class='btn btn-primary'>Change</button>
        </div>
        
       </div>
      
    
      
      <br>
     
  </div>
</div>