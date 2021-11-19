"use strict;";

if (typeof jw === "undefined") {
    throw "The SearchBar widget require JW's API to work load it before this pluggin";
}

if (!String.lcs) {
    /**
     * compute and return the Longest Common String
     * @param {String} other 
     */
    String.prototype.lcs = function (other) {
        let lcs = "";
        for (let i = 0; i < other.length; i++) {
            if (this[i] == other[i]) {
                lcs += this[i];
            } else {
                break;
            }
        }
        return lcs;
    };
}

/**
 * 
 * @param {*} input jQuery object from where the research string will be collected.
 * @param {*} output object with a `push` method where the output of the querier will be pushed.
 * @param {*} parser string parser used to parse the string from the input must have a `parseString` method taking
 * a string as argument return type depend on the querier.
 * @param {*} processor this object transform the output of the parser into a object accepted by the querier. 
 * This object must have a `processConditions` method taking as input the object produced by the parser
 * @param {*} querier querier use to get the data to build the result list must have a `queryData` (can be async) method taking as argument the object
 * returned by the processor, the querier return object will be pased to the output.
 * @param {number} timeout the minimal amout of time between two requests.
 * @param {utils.Logger} logger an instance of Logger used to log everything that append inside of the search bar. 
 */
 jw.widget.SearchBar = function (input, output, parser,processor ,querier, timeout = 2000, logger = new utils.DisabledLogger()) {

    let promList = [];
    let time;
    let lastTimeout;
    let lastEvent = new Promise((resolve) => { resolve(); });

    this.processEvent = () => {
        logger.info("Parsing search string");
        let parsed = parser.parseString(input.val(), logger);
        logger.log(parsed);

        logger.info("processing constrains");
        let processed = processor.processConditions(parsed);

        let data;
        logger.info("Gathering data");
        if (promList.length > 0) {
            data = promList[promList.length - 1].then(() => {
                return querier.queryData(processed, logger);
            });
        } else {
            data = querier.queryData(processed, logger);
        }

        if (data.then !== undefined) {
            promList.push(data);
            data.then((val) => {
                output.push(val);
                promList.remove(data);
            });
        } else {
            output.push(data);
        }
    };

    input.keyup((event) => {
        lastEvent = lastEvent.then(() => {
            if (time === undefined) {
                time = Date.now();
                lastTimeout = new utils.Timeout(this.processEvent, 0);
            } else {
                if (lastTimeout !== undefined && !lastTimeout.timedOut) {
                    lastTimeout.clear();
                }
                logger.info("Waiting for timeout");
                if (lastTimeout.ended) {
                    lastTimeout = new utils.Timeout(this.processEvent, Math.max(timeout - Date.now() + time, 0));
                } else {
                    lastTimeout = new utils.Timeout(this.processEvent, timeout);
                }
            }
        });
    });
};

/**
 * 
 * @param {*} keyWords list of keywords to use when parsing strings
 * @param {*} separator string putted after the keywords to better differenciate keywords from normal text 
 * @returns 
 */
jw.widget.SearchBar.StringParser = function (keyWords, separator) {
    if (separator === undefined) {
        separator = ":";
    }

    this.keyWords = keyWords;
    this.separator = separator;

    this.parseString = function (str, logger) {
        let splitted = [str];
        let newSplit, partialSplit;
        let data = { "default": [] };
        let j, k;

        //splitting the string on all separator to get nice strings to work with
        // can be optimized but would this worth the time spent ? 
        for (let i = 0; i < this.keyWords.length; i++) {
            data[this.keyWords[i]] = [];
            newSplit = [];
            for (j = 0; j < splitted.length; j++) {
                partialSplit = splitted[j].split(this.keyWords[i] + this.separator);

                for (k = 1; k < partialSplit.length; k++) {
                    partialSplit[k] = this.keyWords[i] + this.separator + partialSplit[k].trim();
                }
                partialSplit[0] = partialSplit[0].trim();
                if (partialSplit[0].length < 1) {
                    partialSplit.shift();
                }
                newSplit = newSplit.concat(partialSplit);
            }
            splitted = newSplit;
        }
        let defaultVal = Array.from(splitted);

        // sorting all data in a convenient way
        for (let i = 0; i < this.keyWords.length; i++) {
            for (j = 0; j < splitted.length; j++) {
                if (splitted[j].startsWith(this.keyWords[i] + this.separator)) {
                    defaultVal.remove(splitted[j]);
                    data[this.keyWords[i]].push(splitted[j].substr(this.keyWords[i].length + this.separator.length));
                }
            }
        }
        data.default = data.default.concat(defaultVal);

        logger.log(data);

        return data;
    };
};

/**
 * This class aims to hold the constraints values as well as provide way to compare them in order to manage cache.
 */
jw.widget.SearchBar.ConstraintsHolder = class {

    /**
     * @param {[String]} values the values to compare
     * @param {String} constraint the main constraint
     * @param {number} degree the degree of the constraint ie with how many other constrains this one is the merge result, 0 by default
     * this value is usefull for merger to provide distance correction function
     * @param {*} rectifier a function use correct errors in distance calculation like distance is always three times too large than expected
     */
    constructor(values, constraint,degree=0,rectifier=v=>v) {
        this.values = values;
        this.constraint = constraint;
        this.degree = degree;
        this.rectifier = rectifier;
    }

    getConstraint() {
        return this.constraint;
    }

    /** compare the current object to `other` and return true when 
     * if a result R can pass `other`'s condtion imply that R can pass the curent object's conditions
     * @param {ConstraintHolder} other 
     */
    includes(other) {
        let include = true,i=0,j;
        // for each constrains of other
        while (include && i<other.values.length){
            j=0;
            // there is at least one constrains from this which includes it
            while(j<this.values.length && !other.values[j].startsWith(this.values[i])){
                j++;
            }
            include = include && j<this.values.length;
            i++;
        }
        return include;
    }

    /** compute a distance between the current object and `other`. This computation is mathematical distance.
     * @param {ConstraintHolder} other Other has to either includes or being included by the current object for this computation to work
     */
    getDistance(other) {
        console.log("evaluating distance");
        let dist,sum=0,i,valsL,valsS;
        
        // always determine which is the longest and shortest is needed to ensure that other.getDistance(this) == this.getDistance(other)
        if(this.values.length>other.values.length){
            valsL = this.values;
            valsS = other.values;
        }else {
            valsS = this.values;
            valsL = other.values;
        }

        // the distance is the sum of the minimum distances between each element of valsL and any element of valsS.
        //Swapping valsL and valsS will decrease the distance no test has been done to determine which way is the best 
        valsL.forEach((val)=>{
            dist = Number.POSITIVE_INFINITY;
            i=0;
            while (dist !== 0 && i < valsS.length){
                dist = Math.min(dist, Math.abs(Math.max(val.length, valsS[i].length) - valsS[i].lcs(val).length));
                i++;
            }
            sum += dist;
        });

        return this.rectifier(sum);
    }

    /**evaluate the passed and return true it fullfill the contrains this object hold 
     * 
     * @param {String} val string to evaluate 
     */
    match(val){
        return this.values.some(v=> v==val);
    }
};

jw.widget.SearchBar.FuzzyConstraintsHolder = class extends jw.widget.SearchBar.ConstraintsHolder {

    /** compare the current object to `other` and return true when 
     * if a result R can pass `other`'s condtion imply that R can pass the curent object's conditions
     * @param {ConstraintHolder} other 
     */
     includes(other) {
        let include = true,i=0,j,test;
        // for each constrains of other
        while (include && i<other.values.length){
            j=0;
            test = false;
            // there is at least one constrains from this which includes it
            while(j<this.values.length && !test){
                if(this.values[j].indexOf("%") !== -1){
                    test = test || other.values[i].replace(/%\'/g,"").toUpperCase().includes(this.values[j].replace(/%\'/g,"").toUpperCase());
                }else{
                    test = test || other.values[i].startsWith(this.values[j]);
                }
                console.log(test);
                j++;
            }
            include = include && test;
            i++;
        }
        return include;
    }

    /**evaluate the passed and return true it fullfill the contrains this object hold 
     * 
     * @param {String} val string to evaluate 
     */
    match(val){
        return this.values.some(v=> v.indexOf("%") == -1 ? v==val : val.toUpperCase().includes(v.replace(/%/g, "").toUpperCase()));
    }
};

/**
 * This class provide a post processing for conditions taking the output object of the parser and transforming it to be usable by the querier
 * @param {*} constraintMap a map in the form of {kw:{aliases:[],table,column,formator,merger}...} with two behavior depending on if `aliases` is set or not
 * and a special keyword `_default`. the map's element are defined as :
 * 
 * for each element of the map if aliases is not set :
 *  - `kw` can be a keyword of the parser, this keyword will be passed to querier as defined in the return object of the `processConditions` method
 *  - `table` is the unqualifyed name of the table this keyword will constraint
 *  - `column` is  the unqualifyed name of the column of `table` this keyword will constraint
 *  - `formator` is an object with a `format` method. This method will be given a string assigned by the parser to this keyword
 *  - `merger` is an object with a `merge` method. This method will be given a list of formated conditions produced by the `formator` 
 *  as well as the schema, the table and the column. this method is expected to output a {@link jw.widget.SearchBar.ConstraintsHolder ConstraintsHolder}
 * 
 * if aliases is set :
 *  - `aliases` is an array of keyword which exist in the map and don't have the aliases field set
 *  - `kw` is a keyword from the parser, this keyword will not be passed to querier as related data will be merged into the aliases data.
 *  - `table` will be send to the querier.
 *  - `column`  will be send to the querier.
 *  - `formator` is an object with a `format` method. This method will be given a string assigned by the parser to the main keyword.
 *  If no formator is defined the formators of each keywords will be used 
 *  - `merger` is an object with a `merge` method. If this object is missing data will be put with the aliases data before being merged.
 *  The `merge` method will be given a list of formated conditions produced by the `formator`
 *  as well as the schema, the table and the column and a {@link jw.widget.SearchBar.ConstraintsHolder ConstraintsHolder}
 *  as outputed by the aliases merge functions. this method is expected to output a {@link jw.widget.SearchBar.ConstraintsHolder ConstraintsHolder}
 * 
 * The `_default` keyword is used to store default values for all fields except `aliases` allowing to not provide any of the said fields if defined here.
 * This keyword also have a `schema` field to register the working schema.
 * @param {utils.Logger} logger 
 */
jw.widget.SearchBar.ConstraintProcessor = function(constraintMap,logger= new utils.DisabledLogger()){
    
    /** This function process conditions as explained in the constructor's documentation.
     *  
     * @param {*} conditions {kw:[val1,val2],...} the outputed object of the parser
     * @returns {*} {kw:{condition:{@link jw.widget.SearchBar.ConstraintsHolder ConstraintsHolder}, table:String,column:String}}
     */
    this.processConditions = function(conditions){
        // TODO :split in sub functions foctorise redundent code
        let formated = {},aliased = {};
        // first loop : formating
        for (let kw in conditions){
            conditions[kw] = Array.from(new Set(conditions[kw]));

            if(conditions[kw].length<1)
                continue;

            // alias process
            if(constraintMap[kw].aliases !== undefined && constraintMap[kw].aliases.length>0){
                aliased[kw] = {};
                if(constraintMap[kw].formator){
                    if(constraintMap[kw].merger){
                        aliased[kw].__=[];
                        conditions[kw].forEach((val)=>{
                            aliased[kw].__.push(constraintMap[kw].formator.format(val));
                        });
                    } else {
                        let form;
                        conditions[kw].forEach((val)=>{
                            form = constraintMap[kw].formator.format(val);
                            constraintMap[kw].aliases.forEach((alias)=>{
                                if(!formated[alias]){
                                    formated[alias] = [];
                                }
                                formated[alias].push(form);
                            });
                        });
                    }
                }else {
                    // if no formator then we use the formators of each aliased keword
                    // if there is a special merger we keep the formated values alone for later use
                    if(constraintMap[kw].merger){
                        constraintMap[kw].aliases.forEach((alias)=>{
                            aliased[kw][alias] = [];
                            conditions[kw].forEach((val)=>{
                                // for user's ease to use the user can specify defaults values
                                if(constraintMap[alias].formator){
                                    aliased[kw][alias].push(constraintMap[alias].formator.format(val));
                                } else {
                                    aliased[kw][alias].push(constraintMap._default.formator.format(val));
                                }
                            });
                        });
                    } else {
                        // else we put those values with the other ones
                        constraintMap[kw].aliases.forEach((alias)=>{
                            if(!formated[alias]){
                                formated[alias] = [];
                            }
                            conditions[kw].forEach((val)=>{
                                // for user's ease to use the user can specify defaults values
                                if(constraintMap[alias].formator){
                                    formated[alias].push(constraintMap[alias].formator.format(val));
                                } else {
                                    formated[alias].push(constraintMap._default.formator.format(val));
                                }
                            });
                        });
                    }
                    
                }
            } else {
                if(!formated[kw]){
                    formated[kw] = [];
                }
                conditions[kw].forEach((val)=>{
                    // for user's ease to use the user can specify defaults values
                    if(constraintMap[kw].formator){
                        formated[kw].push(constraintMap[kw].formator.format(val));
                    } else {
                        formated[kw].push(constraintMap._default.formator.format(val));
                    }
                });
            }
        }
        // second loop : merge the non-aliased constraints
        let merged = {};
        let table,column;
        for(let kw in formated){
            table = constraintMap[kw].table !== undefined ? constraintMap[kw].table : constraintMap._default.table;
            column = constraintMap[kw].column !== undefined ? constraintMap[kw].column : constraintMap._default.column;

            merged[kw] = {
                table : table,
                column : column,
                condition : constraintMap[kw].merger !== undefined ? 
                    constraintMap[kw].merger.merge(formated[kw],constraintMap._default.schema,table,column) : 
                    constraintMap._default.merger.merge(formated[kw],constraintMap._default.schema,table,column),
            };
        }
        // third loop : merging the aliased constraints
        for(let kw in aliased){
            if(aliased[kw].__){
                constraintMap[kw].aliases.forEach((alias)=>{
                    if(merged[kw] == undefined){
                        merged[kw] = {
                            table:constraintMap[alias].table !== undefined ? constraintMap[alias].table : constraintMap._default.table,
                            column:constraintMap[alias].column !== undefined ? constraintMap[alias].column : constraintMap._default.column
                        };
                    }
                    merged[kw].condition = constraintMap[kw].merger.merge(
                        aliased[kw].__, 
                        constraintMap._default.schema,
                        constraintMap[alias].table !== undefined ? constraintMap[alias].table : constraintMap._default.table,
                        constraintMap[alias].column !== undefined ? constraintMap[alias].column : constraintMap._default.column,
                        merged[kw].condition
                    );
                });
            }else{
                for (let alias in aliased[kw]){
                    merged[alias].condition = constraintMap[kw].merger.merge(
                        aliased[kw][alias], 
                        constraintMap._default.schema,
                        merged[alias].table, 
                        merged[alias].column,
                        merged[alias].condition
                    );
                }
            }
        }

        return merged;

    };
};

/**
 * This object store defaults merger which may be helpfull
 */
jw.widget.SearchBar.mergers = {
    /**
     * this merger is using `like` or `=` to form conditions based on the detection of `%`
     * this merger can be used with aliases
     */
    likeMerger :function (upper=""){
        return {
            merge : function(conditions,schema,table,column,merge){

                let base =jw.Api.safeQualifier([schema,table,column]).qualified,fullCondition="";
                conditions.forEach((condition)=>{
                    if(condition.indexOf("%") == -1){
                        fullCondition +=  base + " = " + condition + " OR ";
                    }else {
                        fullCondition += (upper.length>0 ? upper + "(":"") + base + (upper.length>0 ? ")": "") + " LIKE " +
                            (upper.length>0 ? condition.toUpperCase() : condition) + " OR ";
                    }
                });
                if(merge === undefined){
                    return new jw.widget.SearchBar.FuzzyConstraintsHolder(Array.from(conditions),fullCondition.substr(0,fullCondition.length-4));
                } else {
                    return new jw.widget.SearchBar.FuzzyConstraintsHolder(conditions.concat(merge.values),fullCondition + merge.getConstraint(),
                        merge.degree+1 ,
                        (v)=>{
                            return v/(merge.degree+2) - conditions.concat(merge.values).filter(e=>e.endsWith("%")).length +1;
                        }
                    );
                }
            }
        };
    }
};

/**
 * This object store defaults formators which may be helpfull
 */
jw.widget.SearchBar.formators = {
    /**
     * This formator apply simple quoting and escape possibly problematic characters like quotes
     */
    simpleStringFormator: {
        format: function (str) {
            str = str.replace(/([\"\\\'])/g, "\\$1");
            return "'" + str + "'";
        }
    },

    /**
     * This formator put `%` at the start and the end or the condition if not already present then use the simpleStringFormator to finish the formating
     * This formator the impact of this addition depend on the merger's behavior
     */
    fuzzyStringFormator: {
        format:function (str) {
            if (!str.startsWith("%")) {
                str = "%" + str;
            }
            if (!str.endsWith("%")) {
                str += "%";
            }
            return jw.widget.SearchBar.formators.simpleStringFormator.format(str);
        }
    },
};

/**This class is designed to be used with the search bar
 * 
 * @param {*} api an instance of jw.Api allready connected to the wanted root table.
 * @param {*} defaults a map registering default conditions and fields in the form of
 * {kw:{condition,table,column,operator}}
 * where :
 *  - `kw` is a keyword used to map the output values, kw can be a parser's keyword
 *  - `condition` is a {@link jw.widget.SearchBar.ConstraintsHolder ConstraintsHolder} containing the condition to be applyed.
 *  Leave empty set the keyword as only a default field.
 *  - `table` is the unqualifyed name of the table this keyword will constraint or select
 *  - `column` is  the unqualifyed name of the column of `table` this keyword will constraint or select
 * @param {*} keyBuilder a function taking as argument a dictionary where each key is the name of a field queried and each value is the related string value.
 * this function should return a string, this string is used to detect if two entries are duplicated due to 1-N joins. Leave empty for no nomalisation
 * @param {utils.Logger} logger a logger used to produce logs
 */
jw.widget.SearchBar.Querier = function(api,defaults = {},keyBuilder= d=>Object.values(d).join(''),logger = new utils.DisabledLogger()){
    this.protected = {cache:{conditions:{}},schema: api.getConnector().connector.service.schema};

    // return true if `a` contains every elements of `b`
    this.protected.arrayIncludes = function (a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length >= b.length &&
            b.every((val) => a.includes(val));
    };

    this.protected.getSelect= function(conditionMap){
        let select = "SELECT ";
        for(let kw in conditionMap){
            select += jw.Api.safeQualifier([this.schema, conditionMap[kw].table, conditionMap[kw].column]).qualified + " AS \"" + kw + "\", ";
        }
        for (let kw in defaults){
            if(conditionMap[kw] === undefined){
                select += jw.Api.safeQualifier([this.schema, defaults[kw].table, defaults[kw].column]).qualified + " AS \"" + kw + "\", ";
            }
        }
        return select.substr(0, select.length - 2) + " ";
    };

    this.protected.arraysToMaps = function (arrays) {
        let maps = [];
        let map;
        for (let i = 0; i < arrays.field_values.length; i++) {
            map = {};
            for (let j = 0; j < arrays.field_names.length; j++) {
                map[arrays.field_names[j]] = arrays.field_values[i][j];
            }
            maps.push(map);
        }
        return maps;
    };

    this.protected.normalize = function (data) {
        let nDat = [], known = [];
        for (let i = 0; i < data.length; i++) {
            if (!known.includes(keyBuilder(data[i]))) {
                nDat.push(data[i]);
                known.push(keyBuilder(data[i]));
            }
        }
        return nDat;
    };

    /**This method rely on being only called once at a time
     * TODO : split in sub functions
     * @param {*} conditions 
     * @returns 
     */
    this.queryData = function(conditions){
        // if a keyword from conditions is not in the cache or in the defaults the cache can't be used as it won't contains data related to this keyword
        //FIX ME cache not working
        if(false && this.protected.arrayIncludes(Object.keys(this.protected.cache.conditions).concat(Object.keys(defaults)),Object.keys(conditions)) &&
            this.protected.arrayIncludes(Object.keys(conditions),Object.keys(this.protected.cache.conditions)) && this.protected.cache.values !== undefined
        ){
            // checking that all cached conditions are less restrictive than the conditions we are evaluating
            let includeTest = Object.keys(conditions).every((kw)=>{
                return  (this.protected.cache.conditions[kw] === undefined ? true : 
                        this.protected.cache.conditions[kw].condition.includes(conditions[kw].condition)) &&
                    (defaults[kw] !== undefined && defaults[kw].condition !== undefined ? defaults[kw].condition.includes(conditions[kw].condition) : true);
            });
            if(includeTest){
                console.log("Include test OK");
                // checking how much the conditions changed
                let delta = 0,d;
                Object.keys(conditions).forEach((kw)=>{
                    d = [];
                    if(defaults[kw] !== undefined){
                        d.push(defaults[kw].condition.getDistance(conditions[kw].condition));
                    }
                    if(this.protected.cache.conditions[kw] !== undefined){
                        d.push(this.protected.cache.conditions[kw].condition.getDistance(conditions[kw].condition));
                    }
                    delta += Math.min(...d);
                });
                console.log(delta);
                if(delta<5){
                    console.log("Delta OK");
                    let nval = [];
                    this.protected.cache.values.forEach((data)=>{
                        if(Object.keys(data).every((kw)=>{
                            if(conditions[kw]!== undefined){
                                return conditions[kw].condition.match(data[kw]);
                            }
                            return true;
                        })){
                            nval.push(data);
                        }else{
                            console.log("refusing", data);
                        }
                    });
                    return this.protected.normalize(nval);
                }
            }
        }

        let map = {};
        api.resetAllTableConstraint();
        for (let kw in conditions){
            map[kw] = conditions[kw].condition.getConstraint();
        }

        // merging by keyword
        for (let kw in defaults){
            if(map[kw] === undefined || defaults[kw].condition !== undefined ){
                if(defaults[kw].condition === undefined){
                    map[kw] = "";
                } else if(map[kw] !== undefined){
                    map[kw] = "( " + map[kw] + " ) AND ( " + defaults[kw].condition.getConstraint() + " )";
                } else {
                    map[kw] = defaults[kw].condition.getConstraint();
                }
            }
        }

        let tableMap = {},table;

        for (let kw in map){
            if(conditions[kw] !== undefined){
                table = conditions[kw].table;
            }else {
                table = defaults[kw].table;
            }
            if(tableMap[table] === undefined){
                if(map[kw] == ""){
                    tableMap[table] = map[kw];
                }else {
                    tableMap[table] = "( " + map[kw] + " ) AND ";
                }
            } else if(map[kw] !== "") {
                tableMap[table] += "( " +  map[kw] + " ) AND ";
            }
        }

        for (let tab in tableMap){
            api.setTableConstraint(tab,tableMap[tab].substr(0,tableMap[tab].length - 5));
        }

        logger.info("Creating request");

        return api.getTableQuery().then((val) => {
            let query = val.query;
            query = this.protected.getSelect(conditions) + query.substr(query.toLowerCase().indexOf(" from "));

            while (query.indexOf("  ") !== -1) {
                query = query.replace("  ", " ");
            }

            logger.log(query);
            logger.info("Waiting for server responce");

            return api.query(query).then((val) => {

                logger.log(val);
                if (val.status) {
                    this.protected.cache.conditions = conditions;
                    this.protected.cache.values = this.protected.arraysToMaps(val);
                    return this.protected.normalize(this.protected.cache.values);
                }
                return [];
            });
        });

    };
};

//TODO : make this hell easier to understand.
/**
 * 
 * @param {TapApi} api Tap Api instance with a root table already selected. Queries will be created from the root table query ensure 
 * 
 * @param {*} fieldMap A map in the form of  {name:{tableName,conditionBase,transform,merger}...} where :
 *  - `name` is one the keywords of the StringParser or a dummy entry to be used with the `exceptionMap`
 * this field is used to name the fields of dict composing the array returned by the `queryData` method
 *  - `tableName` is the name of the table which the builded constraints will apply to
 *  - `conditionBase` is a string representing the fully qualified name of the field which will be constrained.
 * This value is also used to automaticly select fields to query see the `exceptionMap` parameter to see how to allow more complex conditionBase to work
 *  - `transform` is a function called on each value which will be used to constrain the query 
 *  - `merger` is a function which is called with as arguements a list of transformed values and conditionBase
 *  this function must return a string representing a valid constrains, 
 *  which can be placed after a `WHERE` and can be composed with other constrains with `AND` and `OR`
 * 
 * @param {*} defaultConditions A map of the form of {name:condition} where :
 *  - `name` is one the keywords of the StringParser
 *  - `condition` is a string representing a valid constrains
 * which can be placed after a `WHERE` and can be composed with other constrains with `AND` and `OR`
 * 
 * This map is used to add default constrains to the query.
 * 
 * @param {*} exceptionMap A map of the form {name:[name,name]...} where :
 *  - `name` is one the keywords of the `fieldMap`
 * 
 * This map is used to convert complex `conditionBase` of the `fieldMap` into simpler and valid names to use instead 
 * if keyword `a` should constrains two fields of the same table then the `exceptionMap` would have a field looking like `a:[b,c]`
 * this process is not done recurcievely.
 * @param {*} defaultFields A map of the form {field_name:name} where :
 *  - `field_name` is a string representing the fully qualified name of the field which will be requested 
 * where the table related to this field is constrained in the default condition.
 *  - `name` is the short name of the field which will be used as the `name` field of the `fieldMap` the `queryData` method
 * if the value of this field also exist in the `fieldMap` take care of making `field_name` and `fieldMap`'s 'conditionBase' match for the said `name`
 * failing to do so might cause you some troubles.
 * @param {*} keyBuilder A function used to create a string key from an object representing a line of the runed query.
 * This string is used to detect and remove duplicated entries. the keys of the given object are 
 * the name of the requested fields has specifyed in the `defaultFields` and `fieldMap` param
 * @returns 
 */
var dataQueryier = function (api, fieldMap, defaultConditions, exceptionMap, defaultFields, keyBuilder) {

    let cache, cachedMap;
    let publicObject = {}, protected = {};

    /*/ Public Methods and Fields /*/

    publicObject.exceptionMap = exceptionMap;
    publicObject.defaultConditions = defaultConditions;
    publicObject.defaultFields = defaultFields;
    publicObject.keyBuilder = keyBuilder;

    if (publicObject.keyBuilder === undefined) {
        publicObject.keyBuilder = (data) => {
            return Object.values(data).join("");
        };
    }

    publicObject.processConditions = function (conditionMap) {
        let processed = {};
        let partialProcess;

        for (let consName in conditionMap) {
            partialProcess = [];
            if (fieldMap[consName].transform) {
                for (let i = 0; i < conditionMap[consName].length; i++) {
                    partialProcess.push(fieldMap[consName].transform(conditionMap[consName][i]));
                }
            } else {
                partialProcess = Array.from(conditionMap[consName]);
            }
            if (processed[fieldMap[consName].tableName] === undefined) {
                processed[fieldMap[consName].tableName] = [];
            }
            processed[fieldMap[consName].tableName].push(fieldMap[consName].merger(partialProcess, fieldMap[consName].conditionBase));
        }
        for (let table in processed) {
            processed[table] = processed[table].join(" AND ");
        }
        return processed;
    };

    publicObject.getSelect = function (conditionMap) {
        let fields = $.extend({}, publicObject.defaultFields);
        for (let consName in conditionMap) {
            if (conditionMap[consName].length > 0 && consName != "default") {
                fields[fieldMap[consName].conditionBase] = consName;
            }
        }

        let select = "SELECT ";
        for (let field in fields) {
            select += field + " AS \"" + fields[field] + "\", ";
        }
        return select.substr(0, select.length - 2) + " ";
    };

    publicObject.queryData = function (conditionMap, logger) {
        conditionMap = protected.toCachedMap(conditionMap);

        //checking if no new constraint fields are set
        logger.info("Checking if cache is up to date");
        if (cache !== undefined && protected.arrayEquals(Object.keys(conditionMap), Object.keys(cachedMap))) {

            //checking if no new constraint as been added to any field
            if (Object.keys(conditionMap).every((table) => conditionMap[table].length == cachedMap[table].length)) {
                let delta = protected.getDelta(conditionMap);
                if (delta.delta == 0) { // conditions are the same
                    return protected.normalize(cache);

                    // if some chars has been removed the condition is probably less restrictive, we can't assure accuraty of the result in this case
                    // same thing if percents has appears this mean that some string are now less restrictive
                } else if (delta.percent == 0 && delta.delta < 5 && delta.min >= 0) {
                    logger.info("Gathering from cache");
                    return protected.fromCache(conditionMap, delta.changed);
                }
            }

        }

        logger.info("Creating ADQL constraints");
        let allCond = publicObject.processConditions(conditionMap);
        cachedMap = conditionMap;

        for (let table in publicObject.defaultConditions) {
            if (allCond[table] !== undefined) {
                allCond[table] += " AND ( " + publicObject.defaultConditions[table] + " )";
            } else {
                allCond[table] = publicObject.defaultConditions[table];
            }
        }

        logger.info("applying ADQL constraints");
        logger.log(allCond);
        api.resetAllTableConstraint();

        for (let table in allCond) {
            api.setTableConstraint(table, allCond[table]);
        }

        logger.info("Creating request");
        return api.getTableQuery().then((val) => {
            let query = val.query;
            query = publicObject.getSelect(conditionMap) + query.substr(query.toLowerCase().indexOf(" from "));

            while (query.indexOf("  ") !== -1) {
                query = query.replace("  ", " ");
            }

            logger.log(query);
            logger.info("Waiting for server responce");

            return api.query(query).then((val) => {

                logger.log(val);
                if (val.status) {
                    cache = protected.arraysToMaps(val);
                }
                return protected.normalize(cache);
            });
        });


    };

    /*/ Protected Methods and Fields /*/

    protected.arraysToMaps = function (arrays) {
        let maps = [];
        let map;
        for (let i = 0; i < arrays.field_values.length; i++) {
            map = {};
            for (let j = 0; j < arrays.field_names.length; j++) {
                map[arrays.field_names[j]] = arrays.field_values[i][j];
            }
            maps.push(map);
        }
        return maps;
    };


    protected.arrayEquals = function (a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    };

    // str1 = new str2 = old
    protected.stringDelta = function (str1, str2) {
        let lcs = "";
        for (let i = 0; i < str2.length; i++) {
            if (str1[i] == str2[i]) {
                lcs += str1[i];
            } else {
                break;
            }
        }

        if (lcs.length == str2.length) {
            return str1.length - str2.length;
        } else {
            return lcs.length - str2.length;
        }
    };

    protected.getDelta = function (conditionMap) {
        let delta = 0, min, max, d, percent = 0;
        let changed = [];
        for (let table in conditionMap) {
            for (let i = 0; i < conditionMap[table].length; i++) {
                d = protected.stringDelta(conditionMap[table][i], cachedMap[table][i]);
                percent += Math.abs(conditionMap[table][i].split('%').length - cachedMap[table][i].split('%').length);
                if (min > d || min === undefined) {
                    min = d;
                } else if (max < d || max === undefined) {
                    max = d;
                }
                delta += Math.abs(d);
                if (d != 0) {
                    changed.push(table);
                }
            }
        }
        return { delta: delta, min: min, max: max, changed: Array.from(new Set(changed)), percent: percent };
    };

    protected.toCachedMap = function (conditionMap) {
        let map = {};
        for (let table in conditionMap) {
            // removing fields without constraints
            if (conditionMap[table].length > 0) {
                // ignoring empty constraints
                map[table] = Array.from(conditionMap[table]);
                while (map[table].indexOf("") !== -1) {
                    map[table].remove("");
                }
                if (map[table].length < 1) {
                    delete map[table];
                }
            }
        }
        return map;
    };

    protected.fromCache = function (conditionMap, changed) {
        let test;
        return protected.normalize(cache.filter((val) => {
            return changed.every((table) => {
                return conditionMap[table].every((condition) => {
                    if (publicObject.exceptionMap[table] !== undefined) {
                        test = false;
                        publicObject.exceptionMap[table].forEach((table) => {
                            test = test || val[table].toLowerCase().includes(condition.toLowerCase().replace("%", ""));
                        });
                        return test;
                    } else {
                        return val[table].toLowerCase().includes(condition.toLowerCase().replace("%", ""));
                    }
                });
            });
        }));
    };

    protected.normalize = function (data) {
        let nDat = [], known = [];
        for (let i = 0; i < data.length; i++) {
            if (!known.includes(publicObject.keyBuilder(data[i]))) {
                nDat.push(data[i]);
                known.push(publicObject.keyBuilder(data[i]));
            }
        }
        return nDat;
    };

    publicObject.protected = protected;

    return publicObject;

};

/*
let id=0;
function test(){
 	this.a =id;
    id++;
    this.protected = {};
    this.buildProtected();
}
test.prototype.buildProtected= function(){
  let that = this;
  this.protected.w = function(){
   console.log(that.a);
   console.log(this);
  }
}

let t = new test();
let t2 = new test();

t.protected.w();
t2.protected.w();
 */