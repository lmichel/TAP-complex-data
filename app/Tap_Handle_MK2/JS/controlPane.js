class ControlPane{

    constructor(){
        this.box = new DraggableBox();
        this.reset();
        this.api=undefined;
    }

    setApi(api){
        this.api=api;
        reset();
        buildWhat();
    }

    reset(){
        $(this.box.body).html('<div style="justify-content: center;display: flex;" id="controlPane"><div id="multiTabDiv" style="width: 100%;">' +
            '<ul><li><a href="#what">Select what</a></li><li><a href="#where">Where</a></li><li><a href="#query">Adql Query</a></li></ul>' +
            '<div id="what" style="justify-content: center;display: flex;"><div id="tapColSelector" style="display: flex;"></div></div>' +
            '<div id="where" style="justify-content: center;display: flex;"><div id="tapColEditor" style="display: flex;"></div></div>' +
            '<div id="query"></div></div></div>'
        );
        console.log($("#multiTabDiv",this.box.body));
        $("#multiTabDiv",this.box.body).tabs();
    }

    buildWhat(){
        
    }

}