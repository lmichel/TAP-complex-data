var PositionParser = {
    url:"//cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/",
    option:"-ox",
    resolveName:async function(name){
        let out;
        name = name.trim();
		if(name.split(" ").lenght == 2 && name.split(" ").every((v)=>!isNaN(v)&&!isFinite(parseFloat(v)))){
            // case: already in decimal
            out = {status:true,ra: name.split(" ")[0],de:  name.split(" ")[1]};
            if(!(out.de.startsWith("+") ||out.de.startsWith("-"))){
                out.de = "+" + out.de;
            }
        }else{
            // case name
            let data = $.ajax({
                url: PositionParser.url + PositionParser.option + "?" + name,
                type: "GET",
            });
            data.then(result=>{
                try{
                    out = {status:true,ra: $("jradeg",result)[0].textContent,de:  $("jdedeg",result)[0].textContent};
                    if(!(out.de.startsWith("+") ||out.de.startsWith("-")) ){
                        out.de = "+" + out.de;
                    }
                }catch(e){
                    console.error(e);
                    out = {status:false,errormsg:"No Data"};
                }
            });
            data.catch(function(error){
                console.error(error);
                out = {status:false, error:error};
            });
            await data;
        }
        return out;
    }
};