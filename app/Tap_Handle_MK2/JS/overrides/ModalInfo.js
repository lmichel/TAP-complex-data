function ModalInfoOverride(){
    ModalInfo = function(){
        function ModalInfo(){
            this.counter=0;
            this.icons = {
                "info":"./images/info2.png",
                "error":"./images/red.png",
            };
        }

        ModalInfo.prototype.getNextID = function(){
            this.counter++;
            return "modal_" + this.counter;
        };

        ModalInfo.prototype.buildModal = function(id,header,body,footer){
            return '<div class="modal fade" tabindex="-1" id="' + id + '"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content">' +
            this.undefSafe(header) + this.undefSafe(body) + this.undefSafe(footer) +
                '</div></div></div>';
        };

        ModalInfo.prototype.undefSafe= function(obj){
            return (obj === undefined ? "" : obj);
        };

        ModalInfo.prototype.buildHeader = function(iconHtml,title){
            return '<div class="modal-header">' + this.undefSafe(iconHtml) + 
                (title === undefined ? "" : '<h5 class="modal-title">' + title.replace(/\n/g,"<br>") + '</h5>') +
                '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>';
        };

        ModalInfo.prototype.buildBody = function(content){
            return '<div class="modal-body">' + content + '</div>';
        };

        ModalInfo.prototype.iconToHTML = function(url){
            return '<i style="background-image: url(' + url + ');" class = "modal-icon"></i>';
        };

        ModalInfo.prototype.formatMessage = function(message) {
            if (message === undefined){
                message = "";
            }
            message = message.replace(/\n/g,"<br>");
            var retour = "<pre>" + message + "</pre>";
            return retour;
        };

        ModalInfo.prototype.info = function(content,title,show = true){
            let id = this.getNextID();
            let modalHtml = this.buildModal(
                id,
                this.buildHeader(this.iconToHTML(this.icons.info),title),
                this.buildBody(this.formatMessage(content))
            );
            $("body").append(modalHtml);
            let modal = new bootstrap.Modal($("#" + id)[0]);
            if(show){
                modal.show();
            }
            return modal;
        };

        ModalInfo.prototype.error = function(content, title) {
            let id = this.getNextID();
            let modalHtml = this.buildModal(
                id,
                this.buildHeader(this.iconToHTML(this.icons.error),"Error" + (title === undefined ? "" : " : " +title)),
                this.buildBody(this.formatMessage(content))
            );
            $("body").append(modalHtml);
            let modal = new bootstrap.Modal($("#" + id)[0]);
            modal.show();
            return modal;
        };

        /**
        * Return the content of the object obj as a user readable HTML string
        */
        ModalInfo.prototype.stringyfyJSON = function(obj,indent){
            indent = indent || '';
            let s = '';
            if (Array.isArray(obj)) {
                s += '[';
                for (let i=0; i<obj.length; i++) {
                    s += this.stringyfyJSON(obj[i], indent);
                }
                s +=indent + ']';
            } else if (obj === null) {
                s = 'NULL';
            } else switch(typeof obj) {
                case 'undefined':
                    s += 'UNDEFINED';
                    break;
                case 'object':
                    let first = true;
                    for (let p in obj) {
                        
                        if (!first) {
                            if( p != "id" && p != "$" ){
                                s += indent;
                            } else {
                                s += " ";
                            }
                        } else {
                            s += "\n" + indent;
                        }
                        
                        s += '<b>'+ p + '</b>: ';
                        s += this.stringyfyJSON(obj[p], indent + "  ");
                        
                        if( p != "id" && p != "$" ){
                            s += "\n";
                        }
                        first = false;
                    }
                    break;
                case 'boolean':
                    s += (obj) ? 'TRUE' : 'FALSE';
                    break;
                case 'number':
                    s += obj;
                    break;
                case 'string':
                    if( obj.lastIndexOf("http", 0) === 0 ) 
                        obj = decodeURIComponent(obj);
                    if( obj.match(/\s/))
                        s += '"' + obj + '"';
                    else 
                        s += obj;
                    break;
                case 'function':
                    s += '<FUNCTION>';
                    break;
                default:
                    s += obj.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                break;
            }
            return s;
    };

        /**
         * Create an info object dialog
         * @content: string, content of the dialog
         * @title: string, title of the dialog
         */
        ModalInfo.prototype.infoObject = function (object, title) {
            let id = this.getNextID();
            let modalHtml = this.buildModal(
                id,
                this.buildHeader(this.iconToHTML(this.icons.info),title),
                this.buildBody(this.formatMessage(this.stringyfyJSON(object, '  ')))
            );
            $("body").append(modalHtml);
            let modal = new bootstrap.Modal($("#" + id)[0]);
            return modal;
        };

        return new ModalInfo();
    }();
    Modalinfo.error = ModalInfo.error.bind(ModalInfo);
}