var PositionParser = {
    url:"//cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/",
    option:"-ox",
    resolveName:async function(name){
        let out;
        let data = $.ajax({
            url: PositionParser.url + PositionParser.option + "?" + name,
            type: "GET",
        });
        data.then(result=>{
            try{
                console.log();

                out = {status:true,ra: $("jradeg",result)[0].textContent,de:  $("jdedeg",result)[0].textContent};
            }catch(e){
                out = {status:false,errormsg:"No Data"};
            }
        });
        data.catch(function(error){
            console.error(error);
            out = {status:false, error:error};
        });
        await data;
        return out;
    }
};