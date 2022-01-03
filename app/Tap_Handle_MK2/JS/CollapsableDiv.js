class CollapsableDiv{
    constructor(holder,name,collapsed,firstClickHandler,elems,expendOn=undefined,parity=true){
        let id = "collapsable-holder-" + name;
        if($("#" + id,holder).length>0){
            $("#" + id,holder).html("").removeClass("collapsable-holder "+ (parity?"odd":"even")).addClass("collapsable-holder "+ (parity?"even":"odd"));
        }else{
            holder.append("<div class='collapsable-holder "+ (parity?"even":"odd") + "' id = '" + id + "' ></div>");
        }
        this.holder = $("#" + id,holder);
        this.name = name;
        this.parity = parity;
        this.header=undefined;
        this.div = undefined;

        this.buildHeader(elems);

        this.holder.append("<div class='collapsable-div' id = 'collapsable-div-" + name + "' style = 'max-width:" + this.header[0].offsetWidth + "' ></div>");
    
        this.div = $("#collapsable-div-" + name,this.holder );
        if(collapsed){
            this.div.hide();
        }

        this.registerEvents(firstClickHandler,expendOn);
    }

    buildHeader(elems){
        let header = "<div class='collapsable-header' id = 'collapsable-header-" + this.name + "'>";
        if(elems){
            let r=[],c=[],l=[];
            let totWeight=0,lWeight=0,rWeight=0,cWeight=0;
            let addition;

            for (let i=0;i<elems.length;i++){

                if(elems[i].weight === undefined){
                    elems[i].weight=1;
                }
                totWeight +=elems[i].weight;

                if(elems[i].txt){
                    addition="class ='";
                    if (elems[i].type){
                        addition += " collapsable-" + elems[i].type;
                    }
                    if (elems[i].monoline){
                        addition += " monoline";
                    }
                    addition += "'";
                    elems[i].toDom = "<p "+ addition +">" + elems[i].txt + "</p>";
                }

                switch(elems[i].pos){
                    case "center":{
                        c.push(elems[i]);
                        cWeight+=elems[i].weight;
                    }break;
                    case "left":{
                        l.push(elems[i]);
                        lWeight+=elems[i].weight;
                    }break;
                    case "right":{
                        r.push(elems[i]);
                        rWeight+=elems[i].weight;
                    }break;
                }
            }

            if(l.length>0){
                header += '<div style="align-items: center;display: flex;" class="txt-left col-'+Math.round(lWeight/totWeight*12)+'">';
                    l.forEach(function(element) {
                        header += '<div class="side-div">'+ element.toDom + "</div>";
                    });
                    header += "</div>";
            }
            if(c.length>0){
                header += '<div style="align-items: center;display: flex;justify-content: center;" class="txt-center col-'+Math.round(cWeight/totWeight*12)+'">';
                    c.forEach(function(element) {
                        header += '<div class="side-div">'+ element.toDom + "</div>";
                    });
                    header += "</div>";
            }
            if(r.length>0){
                header += '<div style="align-items: center;display: flex;flex-direction: row-reverse;" class="txt-right col-'+Math.round(rWeight/totWeight*12)+'">';
                    r.forEach(function(element) {
                        header += '<div class="side-div">'+ element.toDom + "</div>";
                    });
                    header += "</div>";
            }
        }

        header += "</div>";
        this.holder.append(header);
        this.header = $("#collapsable-header-" + this.name,this.holder);

        let getNBLines = function(e,h){
            return Math.round(e.clientHeight/h);
        };

        $("p.monoline",this.header).each((i,e)=>{
            let h = 1.5*parseFloat(getComputedStyle(e).fontSize); //the 1.5 factor comes from empirical tests
            if(getNBLines(e,h)>1){
                let a,b,text = e.innerText,c=getNBLines(e,h);
                e.innerText = text.substr(0, Math.round(text.length/c));
                if(getNBLines(e)>1){
                    b = e.innerText.length;
                    a = Math.round(text.length/(c+1));
                } else {
                    a = e.innerText.length;
                    b = Math.round(text.length/(c-1));
                }
                while(a!=b){

                    c = Math.floor((a+b)/2);
                    e.innerText = text.substr(0,c);
                    if(getNBLines(e,h)>1){
                        b=c;
                    }else{
                        if(c==a){
                            b=a;
                        }
                        a=c;
                    }
                }
                e.innerText = text.substr(0,c-3) + "...";
                //final adjustement sometimes usefull
                while(getNBLines(e,h)>1){
                    c--;
                    e.innerText = text.substr(0,c-3) + "...";
                }
                e.innerText = text.substr(0,c-6) + "...";
                e.title = text;
                $(e).tooltip({ 
                    template : '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
                    html:true,
                    customClass :"ressource-tooltip",
                });
            }
        });
    }

    registerEvents(firstClickHandler,expendOn){

        this.div.data("clicked",false);
        let handler = ()=>{
            if(!this.div.data("clicked")){
                this.div.data("clicked",true);
                if(firstClickHandler!==undefined){
                    firstClickHandler(this.div);
                }
            }
            this.div.toggle();
        };

        if(expendOn !== undefined){
            let elem =  $(".collapsable-"+expendOn,this.header);
            if(elem.length>0){
                elem.each((i,e)=>{e.classList.add("clickable");});
                elem.click(handler);
            }else{
                this.header.each((i,e)=>{e.classList.add("clickable");});
                this.header.click(handler);
            }
        }else{
            this.header.each((i,e)=>{e.classList.add("clickable");});
            this.header.click(handler);
        }
    }
}