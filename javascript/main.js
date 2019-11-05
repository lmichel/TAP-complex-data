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
            flag= 1;
        })
        $("#"+mostUsedTable[1]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            flag= 2;
        })
        $("#"+mostUsedTable[2]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            flag= 3;
        })
        $("#"+mostUsedTable[3]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            flag= 4;
        })
        $("#"+mostUsedTable[4]).click(function(){
            $("#load2").empty();
            output = sj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
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
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = gj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
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
            var schema = "rr";
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
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = vj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
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
            flag= 1;
        })
        $("#r01").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[1]);
            $("#load2").html(output);
            flag= 2;
        })
        $("#r02").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[2]);
            $("#load2").html(output);
            flag= 3;
        })
        $("#r03").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[3]);
            $("#load2").html(output);
            flag= 4;
        })
        $("#r04").click(function(){
            $("#load2").empty();
            output = cj.json2Html(mostUsedTable[4]);
            $("#load2").html(output);
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
                    flag = flag-5;
                    break;
            }
        })
    })
}