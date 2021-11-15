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
 * @param {*} output jQuery object where the list will be outputed.
 * @param {*} parser string parser used to parse the string from the input must have a `parseString` method taking
 * a string as argument return type depend on the queryier. The method can also handle an extra arg which is an instance of Logger.
 * @param {*} queryier queryier use to get the data to build the result list must have a `queryData` (can be async) method taking as argument the object
 * returned by the parser, the queryier return type is an array of object where each object will be passed to the elemBuilder to build each
 * element of the list. The method can also handle an extra arg which is an instance of Logger.
 * @param {*} elemBuilder builder use to create each element of the html output list taking as input a element of the array returned by the queryier.
 * The method can also handle an extra arg which is an instance of Logger.
 * @param {*} handler handler which may take as argument the same object sent to the elemBuilder, and a jQuery object representing
 * the object which has been clicked and a jQuery EventObject.
 * @param {number} timeout the minimal amout of time between two requests.
 * @param {Logger} logger an instance of Logger used to log everything that append inside of the search bar. 
 */
 jw.widget.SearchBar = function (input, output, parser, queryier, elemBuilder, handler = () => { }, timeout = 2000, logger = new DisabledLogger()) {

    if (!(logger instanceof Logger)) {
        logger = new DisabledLogger();
    }

    let list = $("ul", output);

    let promList = [];
    let time;
    let lastTimeout;
    let lastEvent = new Promise((resolve) => { resolve(); });

    let processEvent = () => {
        logger.info("Parsing search string");
        let parsed = parser.parseString(input.val(), logger);
        display(parsed, "codeOutput");
        let data;

        logger.info("Gathering data");
        if (promList.length > 0) {
            data = promList[promList.length - 1].then(() => {
                return queryier.queryData(parsed, logger);
            });
        } else {
            data = queryier.queryData(parsed, logger);
        }

        let endProcess = (data) => {
            logger.info("Building html");
            list = "";
            for (let i = 0; i < data.length; i++) {
                list += elemBuilder(data[i], logger);
            }

            output.html("<ul class = '' role='listbox' style='text-align: center; border-radius: 4px;" +
                "border: 1px solid #aaaaaa;padding:0;margin: 0.5em'> </ul>");
            $("ul", output).html(list);
            $("ul", output).children().each((i, e) => {
                $(e).click((event) => {
                    handler(data[i], last, event);
                });
            });
            time = Date.now();
        };
        if (data.then !== undefined) {
            promList.push(data);
            data.then((val) => {
                endProcess(val);
                promList.remove(data);
            });
        } else {
            endProcess(data);
        }
    };

    input.keyup((event) => {
        lastEvent = lastEvent.then(() => {
            if (time === undefined) {
                time = Date.now();
                lastTimeout = new Timeout(processEvent, 0);
            } else {
                if (lastTimeout !== undefined && !lastTimeout.timedOut) {
                    lastTimeout.clear();
                }
                logger.info("Waiting for timeout");
                if (lastTimeout.ended) {
                    lastTimeout = new Timeout(processEvent, Math.max(timeout - Date.now() + time, 0));
                } else {
                    lastTimeout = new Timeout(processEvent, timeout);
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

    var parser = {};

    parser.keyWords = keyWords;
    parser.separator = separator;

    parser.parseString = function (str, logger) {
        let splitted = [str];
        let newSplit, partialSplit;
        let data = { "default": [] };
        let j, k;

        //splitting the string on all separator to get nice strings to work with
        // can be optimized but would this worth the time spent ? 
        for (let i = 0; i < parser.keyWords.length; i++) {
            data[parser.keyWords[i]] = [];
            newSplit = [];
            for (j = 0; j < splitted.length; j++) {
                partialSplit = splitted[j].split(parser.keyWords[i] + parser.separator);

                for (k = 1; k < partialSplit.length; k++) {
                    partialSplit[k] = parser.keyWords[i] + parser.separator + partialSplit[k].trim();
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
        for (let i = 0; i < parser.keyWords.length; i++) {
            for (j = 0; j < splitted.length; j++) {
                if (splitted[j].startsWith(parser.keyWords[i] + parser.separator)) {
                    defaultVal.remove(splitted[j]);
                    data[parser.keyWords[i]].push(splitted[j].substr(parser.keyWords[i].length + parser.separator.length));
                }
            }
        }
        data.default = data.default.concat(defaultVal);

        logger.log(data);

        return data;
    };

    return parser;

};

/**
 * This class aims to hold the constraints values as well as provide way to compare them in order to manage cache.
 */
jw.widget.SearchBar.ConstraintsHolder = class {

    /**
     * 
     * @param {String} table the table the constraints apply to  
     * @param {String} col the column of the table `table` the constraints apply to  
     * @param {[String]} values the values to compare
     */
    constructor(values, constraint) {
        this.values = values;
        this.constraint = constraint;
    }

    getConstraint() {
        return this.constraint;
    }

    /** compare the current object to `other` and return true the current object is restrictive enought to includes the other constraints in it
     * @param {ConstraintHolder} other 
     */
    includes(other) {
        let include = true,i=0,j;
        // for each constrains of other
        while (include && i<other.values.length){
            j=0;
            // there is at least one constrains from this which includes it
            while(j<this.values.length && !this.values[j].startsWith(other.values[i])){
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
            }
            sum += dist;
        });

        return sum;
    }
};

/**
 * 
 * @param {*} constraintMap {kw:{alias:[],table,column,merger,formator}}
 */
jw.widget.SearchBar.ConstraintProcessor = function(constraintMap){
    let public = {};

    /**
     * 
     * @param {*} conditions {kw:[val1,val2],...} 
     */
    public.processConditions = function(conditions){
        // TODO :split in sub functions foctorise redundent code
        let formated = {},aliased = {};
        // first loop : formating
        for (let kw in conditions){
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
        for(let kw in formated){
            merged[kw] = {
                table : constraintMap[kw].table !== undefined ? constraintMap[kw].table : constraintMap._default.table,
                column : constraintMap[kw].column !== undefined ? constraintMap[kw].column : constraintMap._default.column,
                condition : constraintMap[kw].merger !== undefined ? constraintMap[kw].merger(formated[kw]) : constraintMap._default.merger(formated[kw]),
            };
        }
        // third loop : merging the aliased constraints
        for(let kw in aliased){
            if(aliased[kw].__){
                constraintMap[kw].aliases.forEach((alias)=>{
                    merged[alias].condition = constraintMap[kw].merger(aliased[kw].__,merged[alias].condition);
                });
            }else{
                for (let alias in aliased[kw]){
                    merged[alias].condition = constraintMap[kw].merger(aliased[kw][alias],merged[alias].condition);
                }
            }
        }

        return merged;

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

var mergerRegistry = {
    simpleStringMerger: function (conditions, base) {
        let condition = "";
        for (let i = 0; i < conditions.length; i++) {
            if (condition.length > 0) {
                condition += " OR ";
            }
            if (conditions[i].indexOf("%") == -1) {
                condition += base + "= " + conditions[i];
            } else {
                condition += "UPPER(" + base + ") LIKE " + conditions[i].toUpperCase();
            }
        }
        return condition;
    },
    multiTableStringMerger: function (conditions, base) {
        let bases = base.split("::");
        let mergedConditions = [];
        for (let i = 0; i < bases.length; i++) {
            mergedConditions.push("(" + mergerRegistry.simpleStringMerger(conditions, bases[i]) + ")");
        }
        return mergedConditions.join(" OR ");
    },
};

var formatorRegistry = {

    simpleStringFormator: function (str) {
        str = str.replace(/([\"\\])/g, "\\$1");
        return "'" + str + "'";
    },
    lazyStringFormator: function (str) {
        if (!str.startsWith("%")) {
            str = "%" + str;
        }
        if (!str.endsWith("%")) {
            str += "%";
        }
        return formatorRegistry.simpleStringFormator(str);
    },
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