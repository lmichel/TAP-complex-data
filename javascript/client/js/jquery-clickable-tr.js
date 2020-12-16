/*
 *  Project: https://github.com/DeOldSax/clickable-tr-jquery
 *  Version: 1.0.0
 *  License: MIT
 */
;(function ( $ ) {

    var disableClickClass = 'disable-row-click';
    var defaults = {};
    var settings;

    $.fn.clickableTable = function( options ) {
        settings = $.extend( defaults, options);

        var rows = this.find('tr[data-href], tr[data-event]');

        rows.css("cursor", "pointer");
        rows.find("td." + disableClickClass).css("cursor", "default");

        addClickEvent(rows);

        return this;
    };

    function addClickEvent(rows) {
        rows.click(function(e) {
            if (notClickable(e)) {
                return;
            }

            var dataEvent = $(this).data("event");
            if ( dataEvent ) {
                if (settings && settings[dataEvent]) {
                   settings[dataEvent].call( this, e );
                } else {
                    var fun = window[dataEvent];
                    if ( typeof fun === "function" ) {
                        fun.call( this, e );
                    }
                }
            }

            var dataHref = $(this).data("href");
            if ( dataHref ) {
                var isRemote = $(this).data("remote");

                var id = "uniquy-id-id";
                var aTag = buildATag(id, dataHref, isRemote);
                document.getElementById(id).click();
                aTag.remove();
            }
        });
    }

    function notClickable(e) {
        var target = $(e.target);
        return e.target.localName == 'a' ||
            e.target.localName == 'button' ||
            target.hasClass(disableClickClass) ||
            target.closest('td').hasClass(disableClickClass);
    }

    function buildATag(id, dataHref, isRemote) {
        var a = $('<a></a>');
        a.css('display', 'none');
        a.attr('data-remote', isRemote);
        a.attr('href', dataHref);
        a.attr('id', id);
        a.insertAfter($("body"));
        return a;
    }

}( jQuery ));
