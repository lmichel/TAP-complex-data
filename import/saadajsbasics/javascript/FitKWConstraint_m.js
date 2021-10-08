/**
 * 
 */
function FitConstraint_Mvc(params){
	KWConstraint_Mvc.call(this, params);
	if( this.attributeHandler.type == 'String' ) this.operators = ["=", "!=","LIKE", "NOT LIKE"]
	else if( this.attributeHandler.type == 'boolean' ) this.operators = ["="]
	else this.operators = ["=", "!=", ">", "<", "BETWEEN"];




};


FitConstraint_Mvc.prototype = Object.create(KWConstraint_Mvc.prototype, {
	getADQL: {
		value: function(attQuoted) {
			if( this.fault ) {
				return null;
			} else {
				return ' ' + this.attributeHandler.databaseName + ' ' + this.operator + ' ' + this.operand + ' ' 
			}
		}
	},
	/*notifyInitDone: 
	{value:function(){
		this.listener.isInit(this.attributeHandler, this.operators ,this.andors,this.range, this.defaultValue);
	}},*/
	processEnterEvent:  {
		value: function(ao, op, opd) {


			this.andor = "AND";
			//op!=undef to not update qlstmt
			//if(op!=undefined){
			if(/^\s*$/.test(opd)) { 
				this.operand ="";
				this.operator='IS NOT NULL';
				this.notifyTypoMsg(0, 'IS NOT NULL');
				this.editorModel.updateQuery();

				return;
			} 
			else if( op == 'BETWEEN' && !/String|boolean/.test(this.attributeHandler.type)) {
				this.operator = op;
				var myArray = opd.match(/^((?:[^\s]+)|(?:'.*'))\s+and\s+((?:[^\s]+)|(?:'.*'))$/);
				if ( myArray != null && !isNaN(myArray[1]) && !isNaN(myArray[2]) && myArray[1] < myArray[2] ) {
					var o1 = myArray[1];
					var o2 = myArray[2];
					if((this.attributeHandler.range!=undefined) && (o2<parseFloat(this.attributeHandler.range.values[0]) || o1>parseFloat(this.attributeHandler.range.values[this.attributeHandler.range.values.length-1])))
					{this.notifyTypoMsg(1, 'Respect the range');
					this.editorModel.updateQuery();
					return;}
						this.operand =  o1 + ' AND ' + o2;												
				}  else {
					this.notifyTypoMsg(1, 'The operator ' + op + ' requires an operand like "num1 and num2" where num1 < num2');
					this.editorModel.updateQuery();
					return;
				}
			} else if(isNaN(opd) && !/String|boolean/.test(this.attributeHandler.type)){
				this.notifyTypoMsg(1, 'Single numeric operand required with operator "'+op+'"');
				this.editorModel.updateQuery();
				return;											
			}
			else if(this.attributeHandler.type =='boolean' && !/^\s*[Tt][Rr][Uu][Ee]\s*$|^\s*[Ff][Aa][Ll][Ss][Ee]\s*$/.test(opd)){
				this.notifyTypoMsg(1, 'Boolean operand required');
				this.editorModel.updateQuery();
				return;	
			}else if(!/String|boolean/.test(this.attributeHandler.type) &&(this.attributeHandler.range!=undefined)){
				if ( (op == '=' && (parseFloat(opd)<parseFloat(this.attributeHandler.range.values[0]) || parseFloat(opd)>parseFloat(this.attributeHandler.range.values[this.attributeHandler.range.values.length-1])))||((this.attributeHandler.range.values.length==2) && ((op == '<' && parseFloat(opd) <=parseFloat(this.attributeHandler.range.values[0])) || (op == '>' && parseFloat(opd) >=parseFloat(this.attributeHandler.range.values[1])))) || ((this.attributeHandler.range.values.length!=2) &&  ((op == '<' && parseFloat(opd) <=parseFloat(this.attributeHandler.range.values[0]))||(op == '>' && parseFloat(opd) >=parseFloat(this.attributeHandler.range.values[this.attributeHandler.range.values.length-1])) ||  (op == '=' && this.attributeHandler.range.values.indexOf(opd)==-1))))
				{this.notifyTypoMsg(1, 'Respect the range');
				this.editorModel.updateQuery();
				return;}	
				else {this.operator = op;
				this.operand =opd;}
			}
			else {
				this.operator = op;
				if (this.attributeHandler.type == 'String') opd="'"+opd+"'"
				if (this.attributeHandler.type == 'boolean') {if(/\s*[Tt][Rr][Uu][Ee]\s*/.test(opd)) opd="T"
					else if(/\s*[Ff][Aa][Ll][Ss][Ee]\s*/.test(opd)) opd="F"}
				this.operand =opd;												
			}

			this.notifyTypoMsg(0, ' '+this.operator + ' ' + this.operand);				
			if( this.andors.length == 0 ) {
				this.processRemoveFirstAndOr();
			}

			this.editorModel.updateQuery();
			//}
		}
	}
});