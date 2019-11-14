document.write("<script type='text/javascript' src= './js/json2Requete.js'></script>");
function main(){
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
        var data = s.createJson();
        $("#load1").html(
            JSON.stringify(data, undefined, 6)
        );
        var sj=new jsonRead(data); 
        s.createJson(data,"basic");
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
            Aide(sj,data,s)
            limitJson2data(sj,data,s);
            flag= 1;
        })
        $("#"+mostUsedTable[1]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            Aide(sj,data,s)
            limitJson2data(sj,data,s);
            flag= 2;
        })
        $("#"+mostUsedTable[2]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            Aide(sj,data,s)
            limitJson2data(sj,data,s);
            flag= 3;
        })
        $("#"+mostUsedTable[3]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            Aide(sj,data,s)
            limitJson2data(sj,data,s);
            flag= 4;
        })
        $("#"+mostUsedTable[4]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
            Aide(sj,data,s)
            limitJson2data(sj,data,s);
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
                    Aide(sj,data,s)
                    limitJson2data(sj,data,s);
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
            Aide(gj,data,g)
            limitJson2data(gj,data,g);
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            Aide(gj,data,g);
            limitJson2data(gj,data,g);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            Aide(gj,data,g);
            limitJson2data(gj,data,g);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            Aide(gj,data,g);
            limitJson2data(gj,data,g);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
            Aide(gj,data,g);
            limitJson2data(gj,data,g);
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
                    Aide(gj,data,g);
                    limitJson2data(gj,data,g);
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

        $("#load1").html(
            JSON.stringify(data, undefined, 6)
        );
        var vj=new jsonRead(data);
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
            Aide(vj,data,v);
            limitJson2data(vj,data,v);
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            Aide(vj,data,v);
            limitJson2data(vj,data,v);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            Aide(vj,data,v);
            limitJson2data(vj,data,v);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            Aide(vj,data,v);
            limitJson2data(vj,data,v);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
            Aide(vj,data,v);
            limitJson2data(vj,data,v);
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
                    Aide(vj,data,v);
                    limitJson2data(vj,data,v);
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
            Aide(cj,data,c);
            limitJson2data(cj,data,c);
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            Aide(cj,data,c);
            limitJson2data(cj,data,c);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            Aide(cj,data,c);
            limitJson2data(cj,data,c);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            Aide(cj,data,c);
            limitJson2data(cj,data,c);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
            Aide(cj,data,c);
            limitJson2data(cj,data,c);
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
                    Aide(cj,data,c);
                    limitJson2data(cj,data,c);
                    flag = flag-5;
                    break;
            }
        })
    })
}

 function limitJson2data(n,data1,s){
    var testButton = document.getElementById('test')
    var b = document.getElementsByName('Cinput');
    testButton.onclick = function test(){
        var flag = 0;
        var constraints="";
        for(var i =0;i<b.length;i++){
            var list=[];
            if(($("#"+b[i].id).val()).length!=0){
                flag = 1;
                constraints = $("#"+b[i].id).val();
                var niveau =b[i].id.slice(0,1);
                var name = b[i].id.slice(1);//the name of table
                list.unshift(name);
                for(var h=niveau-1;h>=0;h--){
                    for(var j=i-1;j>=0;j--){
                        if(b[j].id.slice(0,1)==h){
                            list.unshift(b[j].id.slice(1));
                            break;
                        }
                    }
                }
                var json = n.CreateJsonWithoutColumns(list,constraints,0,data1);
                var adql = json2Requete.getAdql(json);
                var QObject = s.Query(adql);
                var dataTable = VOTableTools.votable2Rows(QObject)
                var contentText = QObject.responseText;
                var method = contentText.indexOf("base64");
                var Field =[]
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
                var nb = Field.length;
                //var out ="<div class = \"white_content\" " +
                //        "id=\"light\"> <table border = \"1\" style = \"width: 80%; margin :auto\">" +
                //        "<button class=\"delete_right\" style = \"background:url('../javascript/img/close.png')\" href = \"javascript:void(0)\" "+
                //        "onclick = \" document.getElementById('light').style.display='none'\"></button><br></br>";//head <div ng-show=\"base_view\" class=\"labletitle\" style=\"top: 54px; left: 0px;width: 70%; margin-top: 2%;margin-left: 22%;margin-right: 10%; background-color: #F7F4F4;   -webkit-box-shadow: 0 8px 20px rgba(100, 100, 100, 0.85); z-index: 10;\"> 
                out = adql
                out +="<br></br>"
                out += "<table border = \"1\" style = \"width: 80%; margin :auto\">";
                out +="<thead><tr role=\"row\">";//head
                for(var j=0;j<nb;j++){
                    out +="<th class=\"sorting_disabled\" rowspan=\"1\" colspan=\"1\" style=\"text-align: auto;\">"+Field[j]+"</th>";
                }
                out +="</tr></thead>";
                out +="<tbody>"
                var count =0;
                for(var j=0;j<dataTable.length;j++){//table  content
                    if(count==0){
                        out+="<tr role=\"row\">";
                    }
                    out +="<td style=\"text-align: auto;\">"+dataTable[j]+"</td>";
                    count =count+1;
                    if(count==nb){
                        out +="</tr>";
                        count=0;
                    }
                }
                out+="</tbody>"
                out += "</table>"
                $("#load3").html(out);
                //document.getElementById('light').style.display='block';
                constraints="";
                flag =0;
                $("input[name=Cinput]").val("");
                window.location.hash = "#load3"
            }
            else if(flag==0){
                continue;
            }
        }
        
    }
    
}

function Aide(n,data1,s){
    var a = document.getElementsByName('Cbutton');
    var b = document.getElementsByName('Cinput');
    for(var i =0;i<a.length;i++){
        a[i].onclick = (function closure(ii){
            return function(){
                var name = b[ii].id.slice(1);//the name of table
                var schema = data1[name].schema;
                var adql = n.AdqlAllColumn(name,schema)
                var QObject = s.Query(adql);
                var dataTable = VOTableTools.votable2Rows(QObject)
                var contentText = QObject.responseText;
                var method = contentText.indexOf("base64");
                var Field =[]
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
                var nb = Field.length;
                var out ="<div class = \"white_content\" " +
                      "id=\"light\"> <table border = \"1\" style = \"width: 80%; margin :auto\">" +
                      "<button class=\"delete_right\" style = \"background:url('../javascript/img/close.png')\" href = \"javascript:void(0)\" "+
                      "onclick = \" document.getElementById('light').style.display='none'\"></button><br></br>";//head <div ng-show=\"base_view\" class=\"labletitle\" style=\"top: 54px; left: 0px;width: 70%; margin-top: 2%;margin-left: 22%;margin-right: 10%; background-color: #F7F4F4;   -webkit-box-shadow: 0 8px 20px rgba(100, 100, 100, 0.85); z-index: 10;\"> 
                out += "<table border = \"1\" style = \"width: 80%; margin :auto\">";
                out +="<thead><tr role=\"row\">";//head
                for(var j=0;j<nb;j++){
                    out +="<th rowspan=\"1\" colspan=\"1\" style=\"text-align: auto;\">"+Field[j]+"</th>";
                }
                out +="</tr></thead>";
                out +="<tbody>"
                var count =0;
                for(var j=0;j<dataTable.length;j++){//table  content
                    if(count==0){
                        out+="<tr>";
                    }
                    out +="<th style=\"text-align: auto;\">"+dataTable[j]+"</th>";
                    count =count+1;
                    if(count==nb){
                        out +="</tr>";
                        count=0;
                    }
                }
                out+="</tbody>"
                out += "</table>  </div>"
                $("body").prepend(out);
                document.getElementById('light').style.display='block';
            }
        })(i);
    }
}
