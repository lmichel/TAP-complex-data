$(document).ready(function() {
    $('.clickable-table').clickableTable({
        eventC : Cplaceholder
    });
});

function eventA( e ) {
    console.log("Running eventA: ");
}

function anotherOne( e ) {
    console.log("I am another function");
}

function Cplaceholder( e ) {
    console.log("I am functionC") ;
}
jQuery(function($){
    $(document).ajaxSend(function() {
        $("#overlay").fadeIn(300);
    });

    $('#button').click(function(){
        $.ajax({
            type: 'GET',
            success: function(data){
                console.log(data);
            }
        }).done(function() {
            setTimeout(function(){
                $("#overlay").fadeOut(300);
            },500);
        });
    });
});
