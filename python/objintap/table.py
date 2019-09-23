from objintap.graph_control import GraphControl
import time
import re

KEY_QUERY = "SELECT  TOP 100  tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column \n\
FROM tap_schema.keys \n\
JOIN  tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id  \n\
WHERE target_table = '{}' OR from_table = '{}'"

OKEY_QUERY = "SELECT DISTINCT TOP 100  tap_schema.columns.column_name, tap_schema.columns.description, tap_schema.columns.unit, tap_schema.columns.ucd, tap_schema.columns.datatype, tap_schema.columns.utype \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.schema_name = '{}' AND tap_schema.tables.table_name = '{}' "

NATURAL_QUERY = "SELECT DISTINCT TOP 100  tap_schema.tables.table_name \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.table_name != '{}' AND tap_schema.tables.schema_name = '{}' AND tap_schema.columns.column_name = '{}'"

FIELD_QUERY = "SELECT DISTINCT TOP 100  tap_schema.columns.column_name, tap_schema.columns.description, tap_schema.columns.unit, tap_schema.columns.ucd, tap_schema.columns.datatype \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.schema_name = '{}' AND tap_schema.tables.table_name = '{}' "

# Find all tables
TABLE_QUERY = "SELECT DISTINCT TOP 100  tap_schema.tables.table_name as table_name\n\
FROM tap_schema.tables \n\
WHERE table_name NOT LIKE 'T%'"


class Table():
    def __init__(self, service, schema, name, from_Column, target_Column, natural_join=None):
        self.service = service
        self.schema = schema
        self.name = name;
        self.natural_join = natural_join
        self.fields = dict()      

    def __repr__(self):
        retour = "Table {} [{}]\n".format(self.name, self.schema)
        for k,v in self.fields.items():
            retour += v.__repr__() + "\n"
        if len(self.joined) > 0:
            retour += "\nJoined with\n"
            for k,v in self.joined.items():
                retour += "    " + v.__repr__() 
        retour += "\n"
        return retour;

    def to_json_schema_joint(self):
        #parameter : 
        #in order to build the dictionary of joint table
        #return : dictionary
        retour = {}
        list_link = GraphControl.get_list_table()
        t=0
        tmax=len(list_link)
        name=self.name
        while t<tmax :
            if re.match(name, list_link[t][0]) or re.match(name, list_link[t][1]):
                follow=True
                break
            else:
                follow=False
            t=t+1
        t=0
        if follow == True:
            key_table="joint_tables"
            value_key = {}
            while t<tmax :
                if re.match(name, list_link[t][0]):
                    target_table_column=list_link[t][0].split('.')
                    from_table_column=list_link[t][1].split('.')
                    key_joint_table=from_table_column[0]
                    value_joint_table={}
                    key_joint="keys_joint"
                    value_joint = from_table_column[1]
                    value_joint_table.setdefault(key_joint,[]).append(value_joint)
                    key_root = "keys_root"
                    value_root = target_table_column[1]
                    value_joint_table.setdefault(key_root,[]).append(value_root)
                    value_key.setdefault(key_joint_table,[]).append(value_joint_table)
                elif re.match(name, list_link[t][1]):
                    target_table_column=list_link[t][0].split('.')
                    from_table_column=list_link[t][1].split('.')
                    key_joint_table=target_table_column[0]
                    value_joint_table={}
                    key_joint="keys_joint"
                    value_joint = target_table_column[1]
                    value_joint_table.setdefault(key_joint,[]).append(value_joint)
                    key_root = "keys_root"
                    value_root = from_table_column[1]
                    value_joint_table.setdefault(key_root,[]).append(value_root)
                    value_key.setdefault(key_joint_table,[]).append(value_joint_table)
                t=t+1    
            retour.setdefault(key_table,value_key)
        return retour
    
   
    
    
    def set_targets(self): #master_table is target table
        #parameter
        #To store all the links between the tables
        #return : [[target_table.target_column, from_table.from_column]...]
        list_Table= []
        list_odata = [] 
        if self.natural_join == None:
            list_Ttable= self.get_all_tables()#store the tables
            for lt in list_Ttable['table_name']:
                list_Table.append(lt.decode("utf-8"))
            t=0
            j=0
            tmax=len(list_Table)
            while t<tmax :#Traverse all the tables to store the data one by one
                now_table = GraphControl.get_table(self.service, self.schema, list_Table[t], None, None, self.natural_join)
                targets=now_table.get_joined_tables()
                if targets :
                    try :
                        for ki, fc, tc in targets['key_id', 'from_column', 'target_column']:
                            for kii, fcc, tcc in targets['key_id', 'from_column', 'target_column']: 
                                if ki==kii and (fcc!=fc or tcc!=tc):
                                    raise BaseException('It has the same key value but different column values!!')
                    except BaseException as e:
                        print(e)
                    for ft, tt, fc, tc in targets['from_table','target_table', 'from_column', 'target_column']:
                        if list_Table[t]==ft.decode("utf-8") :
                            fname = list_Table[t]
                            tname = tt.decode("utf-8")
                            fColumn = fc.decode("utf-8")
                            tColumn = tc.decode("utf-8")
                            data_temp = [tname+'.'+tColumn, fname+'.'+fColumn]
                            if data_temp in list_odata:
                                continue
                            else:
                                list_odata.append(data_temp)
                                GraphControl.store_list_table(data_temp)
                                j=j+1 # counter the elements
                        elif list_Table[t]==tt.decode("utf-8"):
                            fname = ft.decode("utf-8")
                            tname = list_Table[t]
                            fColumn = fc.decode("utf-8")
                            tColumn = tc.decode("utf-8")
                            data_temp = [tname+'.'+tColumn, fname+'.'+fColumn]
                            if data_temp in list_odata:
                                continue
                            else:
                                list_odata.append(data_temp)
                                GraphControl.store_list_table(data_temp)
                                j=j+1 # counter the elements
                else :
                    t=t+1
                    continue
                t=t+1
        return list_odata
         
    def get_joined_tables(self):
        #print("** get join tables for {}".format(self.name))
        query = KEY_QUERY.format(self.name, self.name)
        time.sleep(0.2)
        job = self.service.launch_job(query)
        r = job.get_results()
        #print(r)
        return r
    
    
    def get_all_tables(self):
        query = TABLE_QUERY.format(self.name)
        time.sleep(0.2)
        job = self.service.launch_job(query)
        r = job.get_results()
        #print(r)
        return r