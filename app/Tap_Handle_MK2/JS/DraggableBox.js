class DraggableBox{
    constructor(id){
        if( id ==undefined ){
            id = "drglBx_" + DraggableBox.ID++;
        }
        this.id = id;
        $("body").append("<div id = '"+this.id+"' class='draggable-box'><div class= 'draggable-header' style='display :flex'>" +
            "<div id='reduce' style= 'margin:auto;margin-right:.5em;cursor: pointer;height:100%;display: flex;'><div style = 'background-color:black;margin:auto;margin-left:.5em;width:1em;height:.2em'></div></div></div>" +
            "<div class='draggable-body'></div></div>");
        this.box = $("#" + this.id)[0];
        this.header = $(".draggable-header",this.box)[0];
        this.body = $(".draggable-body",this.box)[0];
        this.header.onmousedown = this.startDragging.bind(this);

        this.boundaries = this.box.getBoundingClientRect();
        this.offsetX =0;
        this.offsetY =0;
        this.x=0;
        this.y=0;
        this.oldx=undefined;
        this.oldy=undefined;
        $("#reduce",this.header).click(()=>{
            this.reduce();
        });
        this.scrollX=window.scrollX;
        this.scrollY=window.scrollY;

        this.box.style.left = this.x;
        this.box.style.top = this.y;

    }

    reduce(){
        if(this.oldx === undefined){
            this.oldx = window.innerWidth;
        }
        if(this.oldy === undefined){
            this.oldy = 0;
        }
        let swp;

        swp=this.x;
        this.x=this.oldx;
        this.oldx = swp;

        swp=this.y;
        this.y=this.oldy;
        this.oldy = swp;

        $(this.body).toggle();

        this.snap();
    }

    startDragging(e){
        e = e || window.event;
        e.preventDefault();
        
        // we compute the position of the mouse relative to the element to keep this positionning 
        this.boundaries = this.box.getBoundingClientRect();
        this.offsetX = e.clientX - this.boundaries.x - window.scrollX;
        this.offsetY = e.clientY - this.boundaries.y - window.scrollY;
        
        document.onmouseup = this.stopDragging.bind(this);
        // call a function whenever the cursor moves:
        document.onmousemove = this.drag.bind(this);
    }

    drag(e){
        this.y= e.clientY - this.offsetY;
        this.x = e.clientX - this.offsetX;

        this.snap();
    }

    snap(){
        /*/ avoid the floating box to go outside of the screen /*/

        // setting the scrollHeight and width  
        let scrollHeight = document.body.offsetWidth> window.innerWidth ? DraggableBox.scrollHeight:0;
        let scrollWidth = document.body.offsetHeight> window.innerHeight ? DraggableBox.scrollWidth:0;

        let boundaries = this.box.getBoundingClientRect();

        /*checking if the box too far away to the right or to the bottom.
        * We compensate for the scroll, the boundaries of the box, and the scrollbar 
        */

        this.x = (this.x + boundaries.width > window.innerWidth - scrollWidth + window.scrollX) ? 
            window.innerWidth - boundaries.width + window.scrollX - scrollWidth :
            this.x;

        this.y = (this.y + boundaries.height > window.innerHeight - scrollHeight + window.scrollY) ? 
            window.innerHeight - boundaries.height + window.scrollY - scrollHeight :
            this.y;

        this.x = this.x <window.scrollX?window.scrollX:this.x;
        this.y = this.y <window.scrollY?window.scrollY:this.y;

        // the layout is updated each time one of those is changed it's ligter to only do this once 
        this.box.style.left = this.x;
        this.box.style.top = this.y;
    }

    stopDragging(){
        document.onmouseup = null;
        document.onmousemove = null;
    }

    compensateScroll(e){
        //let 
    }

}

DraggableBox.ID = 0;
$(document).ready(()=>{
    DraggableBox.scrollWidth = (() => {
        // code stolen from stackoverflow to compute the scrollbar width
        var inner = document.createElement('p');
        inner.style.width = "100%";
        inner.style.height = "200px";
    
        var outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "200px";
        outer.style.height = "150px";
        outer.style.overflow = "hidden";
        outer.appendChild (inner);
    
        document.body.appendChild (outer);
        var w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetWidth;
        if (w1 == w2) w2 = outer.clientWidth;
    
        document.body.removeChild (outer);
    
        return (w1 - w2);
    })();
    DraggableBox.scrollHeight = (() => {
        // code stolen from stackoverflow (and a little changed) to compute the scrollbar height
        var inner = document.createElement('p');
        inner.style.height = "100%";
        inner.style.width = "200px";
    
        var outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.height = "200px";
        outer.style.width = "150px";
        outer.style.overflow = "hidden";
        outer.appendChild (inner);
    
        document.body.appendChild (outer);
        var w1 = inner.offsetHeight;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetHeight;
        if (w1 == w2) w2 = outer.offsetHeight;
    
        document.body.removeChild (outer);
    
        return (w1 - w2);
    })();
});