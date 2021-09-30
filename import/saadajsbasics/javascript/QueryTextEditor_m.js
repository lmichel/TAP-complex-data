/**
 * @returns {QueryTextEditor_Mvc}
 */
function QueryTextEditor_Mvc() {
	this.colConst =  new Array();
	this.obConst  = new Array();
	this.ucdConst = new Array();
	this.posConst = new Array();
	this.relConst = new Array();
	this.kwConst  = new Array();
	this.fitConst = new Array();
	this.limConst = "";
	this.query = "";
	this.treePath = null;
	this.listener = null;
};

QueryTextEditor_Mvc.prototype = {
		addListener : function(list){
			this.listener = list;
		},
		getQuery: function() {
			return this.query;
		},
		reset: function(){
			this.colConst =  new Array();
			this.obConst  = new Array();
			this.ucdConst = new Array();
			this.posConst = new Array();
			this.relConst = new Array();
			this.kwConst  = new Array();
			this.fitConst = new Array();
			this.limConst = "";
			this.query = "";
			this.treePath = null;			
		},
		processAddConstraint: function(label, type, constraints) {
			Out.debug("add constraint of type " + type + " from form " + label);
			if( type == "column") {
				this.delConst(label, this.colConst);
				this.addConstraintToArray(label, constraints, this.colConst) ;
			} else if( type == "orderby" && constraints.length > 0) {
				this.obConst = constraints[0];				
			} else if( type == "ucd") {
				this.delConst(label, this.ucdConst);
				this.addConstraintToArray(label, constraints,this. ucdConst) ;
			} else if( type == "position") {
				this.delConst(label,this.posConst);
				this.addConstraintToArray(label, constraints, this.posConst) ;
			} else if( type == "relation") {
				this.delConst(label, this.relConst);
				this.addConstraintToArray(label, constraints, this.relConst) ;
			} else if( type == "kwconst") {
				this.delConst(label, this.kwConst);
				this.addConstraintToArray(label, constraints, this.kwConst) ;
			} else if( type == "fitconst") {
				this.delConst(label, this.fitConst);
				this.addConstraintToArray(label, constraints, this.fitConst) ;
			} else if( type == "limit" && constraints.length > 0) {
				this.limConst = constraints[0];				
			} else {
				Modalinfo.error("QueryTextEditor do not know what to do with a constraint typed as " +type);
			}		
			this.buildQuery();
			this.notifyDisplayQuery();
		},
		addConstraintToArray: function(label, constraints, constArray) {
			if(constraints != null &&  $.trim(constraints) != "" ) {
				constArray.push({label:label, constraints: constraints});
			}
		},
		processDelConstraint: function(label, type) {
			Out.debug("Del constraint of type " + type + " from form " + label);
			if( type == "column") {
				this.delConst(label, this.colConst);
			} else if( type == "orderby") {
				this.obConst = "";				
			} else if( type == "ucd") {
				this.delConst(label, this.ucdConst);
			} else if( type == "position") {
				this.delConst(label, this.posConst);
			} else if( type == "relation") {
				this.delConst(label, this.relConst);
			} else if( type == "kwconst") {
				this.delConst(label, this.kwConst);
			} else if( type == "fitconst") {
				this.delConst(label, this.fitConst);
			} else if( type == "limit") {
				this.limConst = "";												
			} else {
				Modalinfo.error("QueryTextEditor do not know what to do with a constraint typed as " + type);
			}	
			this.buildQuery();
			this.notifyDisplayQuery();
		},
		delConst: function(label, constArray) {
			for( var i=0 ; i<constArray.length ; i++ ) {
				if( constArray[i].label == label){
					constArray.splice(i,1);
					return;
				}
			}
		},
		buildQuery: function() {
			this.query =  
			  this.buildWhereConstraint("\nWherePosition"         , ","  , this.posConst)
			+ this.buildWhereConstraint("\nWhereAttributeSaada"   , "AND", this.colConst)
			+ this.buildWhereConstraint("\nWhereUCD"              , "AND", this.ucdConst)
			+ this.buildWhereConstraint("\nWhereRelation"         , " "  , this.relConst)
			+ this.buildWhereConstraint("\nHavingCounterpartsWith", ","  , this.kwConst)
			+ this.buildWhereConstraint("\nWhereModel"            , " "  , this.fitConst)
			if( this.obConst != "" ){
				this.query += "\nOrder By " + this.obConst + "\n";
			}
			if( this.limConst != "" && !isNaN(this.limConst) ){
				this.query += "\nLimit " + this.limConst + "\n";
			}
		},
		buildWhereConstraint : function(stmt, logical, constArray){
			var constrt ="";		
			var openPar = '';
			var closePar = '';
			if( logical == 'AND' ) {
				openPar = '(';
				closePar = ')';
			}
			for( var i=0 ; i<constArray.length ; i++ ){
				if( i > 0 ) {
					constrt += (logical.trim() == "") ?"\n":  ("\n    " + logical + "\n") ;
				}
				var tc = $.trim(constArray[i].constraints);
				constrt += (constArray.length > 1 )? ("    " +  openPar + tc + closePar):  constArray[i].constraints;
			}
			return (constrt == "")? "" : stmt + " {\n" + constrt + "\n}";
		},
		notifyDisplayQuery:  function() {
			this.listener.controlDisplayQuery(this.query);
		},
		setTreePath: function(treePath){
			this.treePath = $.extend({},treePath);
		}
};

/**
 * Subclass of QueryTextEditor_Mvc handling adql queries
 */
function ADQLTextEditor_Mvc(){
	QueryTextEditor_Mvc.call(this);
	this.selectConst = new Array();
	this.joinedTables = new JoinKeyMap();
	this.flatJoined = new Array();
	/*
	 * 
	 * {tablename -> {joinKey [select][orderby][constrainst]}
	 * joinKey {source_table, source_column, target_table, target_column}
	 */
	this.tableConst = new Array();

};
/**
 * Method overloading
 */
ADQLTextEditor_Mvc.prototype = Object.create(QueryTextEditor_Mvc.prototype, {	
	processAddConstraint: {
		value: function(label, type, constraints, tableJoin) {
			Out.debug("add constraint of type " + type + " from form " + label);
			if( type == "select") {
				this.selectConst = [{label:label, constraints: constraints}];
			} else if( type == "column") {
				this.delConst(label, this.colConst);
				this.addConstraintToArray(label, constraints, this.colConst) ;
			} else if( type == "orderby" && constraints.length > 0) {
				this.obConst = [{label:label, constraints: constraints[0]}];
			} else if( type == "position") {
				this.delConst(label,this.posConst);
				this.addConstraintToArray(label, constraints, this.posConst) ;
			} else if( type == "kwconst") {
				this.delConst(label, this.kwConst);
				this.addConstraintToArray(label, constraints, this.kwConst) ;
			} else if( type == "fitconst") {
				this.delConst(label, this.fitConst);
				this.addConstraintToArray(label, constraints, this.fitConst) ;
			}else if( type == "limit" && constraints.length > 0) {
				this.limConst = {label:label, constraints: constraints[0]};;				
			} else {
				Modalinfo.error("QueryTextEditor does not know what to do with a constraint typed as " +type);
				return;
			}	
			this.joinedTables.removeFromOrigin(label);
			this.flatJoined = new Array();
			if( tableJoin != null ) {
				for( var jt in tableJoin ) {
					/* 
					 * key of tableJoin array
					 *     [target_datatreepath.schema].[target_datatreepath.table];
					 * joinKey format:  
					 *     {"target_datatreepath":{"nodekey":"node","schema":"schema","table":"autre1","tableorg":"autre1","jobid":"","key":"node.schema.autre1"},
					 *      "target_column":"1autre1","source_column":"1schema.table"}
					 */
					var joinKey = tableJoin[jt];
					if( joinKey.target_column == "" ) {
						this.flatJoined.push(joinKey.target_table);
					} else {
						this.joinedTables.addJoinKey(jt, joinKey, label);
					}
				}
			}
			this.buildQuery();
			this.notifyDisplayQuery();
		}
	},

	getJoin : { 
		value: function() {
			var retour = "";
			var joinKeys = this.joinedTables.getJoinKeys();
			var arrayLength = joinKeys.length;
			for (var i = 0; i < arrayLength; i++) {
				var joinKey = joinKeys[i];
				var tt = (joinKey.target_datatreepath.schema + "." + joinKey.target_datatreepath.table).quotedTableName().qualifiedName;
				retour += "JOIN " + tt + " ON " 
				+ this.getCurrentTableName().quotedTableName().qualifiedName + "." +  joinKey.source_column.quotedTableName().qualifiedName
				+ " = " 
				+  tt + "." + joinKey.target_column.quotedTableName().qualifiedName  + "\n";		
			}
			return retour;
		}
	},

	buildQuery :{
		value: function() {
			var tableName = this.getCurrentTableName().quotedTableName().qualifiedName;
			var li = this.limConst.constraints;
			var topLimit = ( li != undefined) ? ' TOP ' + li + ' ': '';
			this.query = "";
			this.query += this.buildWhereConstraint("SELECT " + topLimit , ",", this.selectConst);
			this.query += "FROM " + tableName ;
			if( this.flatJoined != null ){
				for( var i in this.flatJoined) {
					this.query += ", " + this.flatJoined[i];
				}
			}
			this.query += "\n";
			this.query += this.getJoin();			
			this.query += this.buildWhereConstraint("WHERE"   , "AND", this.colConst);
			this.query += this.buildWhereConstraint("ORDER BY", ","  , this.obConst);
		}
	},

	buildWhereConstraint : {
		value: function(stmt, logical, constArray){
			var constrt ="";		
			var openPar = '';
			var closePar = '';
			if( logical == 'AND' ) {
				openPar = '(';
				closePar = ')';
			}
			for( var i=0 ; i<constArray.length ; i++ ){
				if( i > 0 ) {
					constrt += (logical.trim() == "") ?"\n":  ("\n    " + logical + "\n") ;
				}
				var tc = $.trim(constArray[i].constraints) ;
				constrt += (constArray.length > 1 )? "    " +  openPar + tc + closePar:  constArray[i].constraints;
			}
			return (constrt == "")? "" : stmt + " " + constrt + "\n";
		}
	},

	getCurrentTableName: {
		value: function(){
			return this.treePath.schema + "." + this.treePath.table;
		}
	}
});
/**
 * Object merging the keyJoin coming from different forms.
 * keyJoins remain unique but with a reference of all forms using them.
 * When a key is no longer used by a form and just by it, it is removed from the map.
 * If it is used by multiple keywords, the form label is removed from the origins array, 
 * but the keyJoin remains in place within the map.
 */
function JoinKeyMap() {
	/**
	 * Map key: 
	 *     [target_datatreepath.schema].[target_datatreepath.table];
	 * Map value
	 *     { keyJoin: {"target_datatreepath":{"nodekey":"node","schema":"schema","table":"autre1","tableorg":"autre1","jobid":"","key":"node.schema.autre1"},
	 *                 "target_column":"1autre1","source_column":"1schema.table"}
	 *       origins: []
	 * Origins contains the labels of the forms using the keyJoin
	 */
	this.keyMap =  {};
};
/**
 * Methods
 */
JoinKeyMap.prototype = {
		/**
		 * Add a joinKey to the map if it does not exist. 
		 * If the joinKey already exists, the origins array is updated
		 * @param key      map key: [target_datatreepath.schema].[target_datatreepath.table]
		 * @param joinKey  map value: see above for the format
		 * @param origin   form label
		 */
		addJoinKey : function(key, joinKey, origin){
			var jk = this.keyMap[key];
			if( jk == null ){
				this.keyMap[key] = {joinKey: joinKey, origins: [origin]};
			} else {
				var ors = jk.origins;
				var index = ors.indexOf(origin);
				if (index == -1) {
					jk.origins.push(origin);
				}
			}
		},
		/**
		 * remove the joinKey attached to origin it is only used by the form referenced by origin.
		 * If it is used by multiple keywords, the lebel origin is removed from the origins array, 		 
		 * @param origin form label
		 */
		removeFromOrigin : function(origin){
			for( var key in this.keyMap ) {
				var entry = this.keyMap[key];
				var jk = entry.joinKey;
				var ors = entry.origins;
				if( ors.length == 1 && ors[0] == origin){
					delete this.keyMap[key];
				} else {
					var index = ors.indexOf(origin);
					if (index > -1) {
					    ors.splice(index, 1);
					}
				}
			}
		},
		/**
		 * Used to iterate on the joinKeys
		 * @returns {Array} All joinKeys in an array
		 */
		getJoinKeys: function() {
			var retour = new Array();
			for( var k in this.keyMap ) {
				retour.push(this.keyMap[k].joinKey);
			}
			return retour;
		}
};
