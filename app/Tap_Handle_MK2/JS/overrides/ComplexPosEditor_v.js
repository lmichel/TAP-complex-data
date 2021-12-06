var ComplexPosEditor_Mvc;

function ComplexPosEditor_mVcExtends(){
    ComplexPosEditor_mVc = function(params){
		tapPosQEditor_mVc.call(this,params);
        this.fieldListView = new ComplexPosFieldList_mVc(params.parentDivId,
			this.formName,
			{
				stackHandler: null,
				orderByHandler: null,
				raHandler: null,
				decHandler: null,
				radec: true
			},        
            params.sessionID,
        );
        this.fieldListView.setStackTooltip("Click to constrain this field");
        
        this.posEditor = new ComplexPos_mVc({editor: this,
            parentDivId: this.constPosContainer,
            formName: this.formName,
            frames: null,
            urls: {sesameURL: params.sesameUrl, uploadURL:params.upload.url},
            postUploadHandler: params.upload.postHandler,
            preloadedGetter: params.upload.preloadedGetter,
        });
	};

    ComplexPosEditor_mVc.prototype = Object.create(tapPosQEditor_mVc.prototype,{
        draw : { 
            value: function() {
                this.fieldListView.draw();
                this.parentDiv.append('<div>' +
                        '<div id=' + this.constPosContainer + '></div>' +
                        '<div id=' + this.constContainerId + '></div>' +
                        '</div>');
                this.posEditor.draw();
                
                var isPos = {"fieldset":"inherit", "div":"102px"};
                var isADQL = true;
                this.constListId = this.constListView.draw(isPos, isADQL);
            }
        },
    });
}