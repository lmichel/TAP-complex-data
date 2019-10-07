from objintap.graph_control import GraphControl
import time

KEY_QUERY = "SELECT  TOP 100  tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column \n\
FROM tap_schema.keys \n\
JOIN  tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id "

# Find all tables
TABLE_QUERY = "SELECT DISTINCT TOP 100  tap_schema.tables.table_name as table_name\n\
FROM tap_schema.tables \n\
WHERE table_name NOT LIKE 'T%'"

NATURAL_QUERY = "SELECT DISTINCT TOP 100  tap_schema.tables.table_name \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.schema_name = '{}' AND tap_schema.columns.column_name = '{}'"

NATURAL_JOINT_QUERY = "SELECT  TOP 100  tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column \n\
FROM tap_schema.keys \n\
JOIN  tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id \n\
"

class Table():
    def __init__(self, service, schema, name, from_Column, target_Column, natural_join=None):
        self.service = service
        self.schema = schema
        self.name = name;
        self.natural_join = natural_join
        self.fields = dict()    
        self.joined = dict()  

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
    
    def if_joint(self,list_exist):
        #parameter : 
        #            self :root, 
        #            list_exist : the tables that already store
        #
        #return : dictionary
        if self.natural_join == None:
            value = {}
            targets = self.get_joined_tables()
            for ft, tt, fc, tc in targets['from_table','target_table', 'from_column', 'target_column']:
                if self.name == ft.decode("utf-8") and (tt.decode("utf-8") not in list_exist):
                    key=tt.decode("utf-8")
                    value_joint_table = {}
                    key_joint_table='joint_tables'
                    key_joint='keys_joint'
                    key_root='keys_root'
                    value_joint_table.setdefault(key_joint,[]).append(tc.decode("utf-8"))
                    value_joint_table.setdefault(key_root,[]).append(fc.decode("utf-8"))
                    list_exist.append(tt.decode("utf-8"))
                    new_table = GraphControl.get_real_table(tt.decode("utf-8"))
                    value_joint = {}
                    value_joint = new_table.if_joint(list_exist)
                    if value_joint : 
                        value_joint_table.setdefault(key_joint_table,[]).append(value_joint)
                    #value_table.setdefault(key_joint_table,[]).append(value_joint_table)
                    value.setdefault(key,[]).append(value_joint_table)
                elif self.name == tt.decode("utf-8") and (ft.decode("utf-8") not in list_exist):
                    key=ft.decode("utf-8")
                    value_joint_table = {}
                    key_joint_table='joint_tables'
                    key_joint='keys_joint'
                    key_root='keys_root'
                    value_joint_table.setdefault(key_joint,[]).append(fc.decode("utf-8"))
                    value_joint_table.setdefault(key_root,[]).append(tc.decode("utf-8"))
                    list_exist.append(ft.decode("utf-8"))
                    new_table = GraphControl.get_real_table(ft.decode("utf-8"))
                    value_joint = {}
                    value_joint = new_table.if_joint(list_exist)
                    if value_joint : 
                        value_joint_table.setdefault(key_joint_table,[]).append(value_joint)
                    #value_table.setdefault(key_joint_table,[]).append(value_joint_table)
                    value.setdefault(key,[]).append(value_joint_table)
        else:
            value = {}
            targets = self.get_natural_joined_tables()
            for ft, tt, fc, tc in targets['from_table','target_table', 'from_column', 'target_column']:
                if self.name == ft.decode("utf-8") and (tt.decode("utf-8") not in list_exist):
                    key=tt.decode("utf-8")
                    value_joint_table = {}
                    key_joint_table='joint_tables'
                    key_joint='keys_joint'
                    key_root='keys_root'
                    value_joint_table.setdefault(key_joint,[]).append(tc.decode("utf-8"))
                    value_joint_table.setdefault(key_root,[]).append(fc.decode("utf-8"))
                    list_exist.append(tt.decode("utf-8"))
                    new_table = GraphControl.get_real_table(tt.decode("utf-8"))
                    value_joint = {}
                    value_joint = new_table.if_joint(list_exist)
                    if value_joint : 
                        value_joint_table.setdefault(key_joint_table,[]).append(value_joint)
                    #value_table.setdefault(key_joint_table,[]).append(value_joint_table)
                    value.setdefault(key,[]).append(value_joint_table)
                elif self.name == tt.decode("utf-8") and (ft.decode("utf-8") not in list_exist):
                    key=ft.decode("utf-8")
                    value_joint_table = {}
                    key_joint_table='joint_tables'
                    key_joint='keys_joint'
                    key_root='keys_root'
                    value_joint_table.setdefault(key_joint,[]).append(fc.decode("utf-8"))
                    value_joint_table.setdefault(key_root,[]).append(tc.decode("utf-8"))
                    list_exist.append(ft.decode("utf-8"))
                    new_table = GraphControl.get_real_table(ft.decode("utf-8"))
                    value_joint = {}
                    value_joint = new_table.if_joint(list_exist)
                    if value_joint : 
                        value_joint_table.setdefault(key_joint_table,[]).append(value_joint)
                    #value_table.setdefault(key_joint_table,[]).append(value_joint_table)
                    value.setdefault(key,[]).append(value_joint_table)
        return value

    def set_targets(self,*a): #master_table is target table
        #parameter : 
        #            self :root, 
        #            *a : the tables that you want to query
        #
        #return : dictionary
        
        if self.natural_join == None:
            list_Ttable= self.get_all_tables()#store the tables
            for lt in list_Ttable['table_name']:
                GraphControl.get_table(self.service, self.schema, lt.decode("utf-8"), None, None, self.natural_join)
            key = self.name
            value =  {}
            retour={}
            jsonRoot = {}
            key_joint_table="joint_tables"
            targets = self.get_joined_tables()
            for limit_table in a :
                list_exist = []
                for ft, tt, fc, tc in targets['from_table','target_table', 'from_column', 'target_column']:
                    if self.name == ft.decode("utf-8") and limit_table == tt.decode("utf-8"):
                        value_joint_table = {}
                        key_joint='keys_joint'
                        key_root='keys_root'
                        value_joint_table.setdefault(key_joint,[]).append(tc.decode("utf-8") )
                        value_joint_table.setdefault(key_root,[]).append(fc.decode("utf-8") )
                        list_exist.append(ft.decode("utf-8") )
                        list_exist.append(tt.decode("utf-8") )
                        new_table = GraphControl.get_real_table(limit_table)
                        value_joint = {}
                        value_joint = new_table.if_joint(list_exist)
                        if value_joint : 
                            value_joint_table.setdefault(key_joint_table,[]).append(value_joint)
                        jsonRoot.setdefault(limit_table,[]).append(value_joint_table)
                        
                    elif self.name == tt.decode("utf-8") and limit_table == ft.decode("utf-8"):
                        value_joint_table = {}
                        key_joint='keys_joint'
                        key_root='keys_root'
                        value_joint_table.setdefault(key_joint,[]).append(fc.decode("utf-8") )
                        value_joint_table.setdefault(key_root,[]).append(tc.decode("utf-8") )
                        
                        list_exist.append(ft.decode("utf-8") )
                        list_exist.append(tt.decode("utf-8") )
                        new_table = GraphControl.get_real_table(limit_table)
                        value_joint = {}
                        value_joint = new_table.if_joint(list_exist)
                        if value_joint : 
                            value_joint_table.setdefault(key_joint_table,[]).append(value_joint)
                        jsonRoot.setdefault(limit_table,[]).append(value_joint_table)
        else:
            list_Ttable= self.get_natural_tables()#store the tables
            for lt in list_Ttable['table_name']:
                GraphControl.get_table(self.service, self.schema, lt.decode("utf-8"), None, None, self.natural_join)
            key = self.name
            value =  {}
            retour={}
            list_exist = []
            jsonRoot = {}
            key_joint_table="joint_tables"
            targets = self.get_natural_joined_tables()
            print(targets)
            for limit_table in a :
                for ft, tt, fc, tc in targets['from_table','target_table', 'from_column', 'target_column']:
                    if self.name == ft.decode("utf-8") and limit_table == tt.decode("utf-8"):
                        value_joint_table = {}
                        key_joint='keys_joint'
                        key_root='keys_root'
                        value_joint_table.setdefault(key_joint,[]).append(tc.decode("utf-8") )
                        value_joint_table.setdefault(key_root,[]).append(fc.decode("utf-8") )
                        list_exist.append(ft.decode("utf-8") )
                        list_exist.append(tt.decode("utf-8") )
                        new_table = GraphControl.get_real_table(limit_table)
                        value_joint = {}
                        value_joint = new_table.if_joint(list_exist)
                        if value_joint : 
                            value_joint_table.setdefault(key_joint_table,[]).append(value_joint)
                        jsonRoot.setdefault(limit_table,[]).append(value_joint_table)
                    elif self.name == tt.decode("utf-8") and limit_table == ft.decode("utf-8"):
                        value_joint_table = {}
                        key_joint='keys_joint'
                        key_root='keys_root'
                        value_joint_table.setdefault(key_joint,[]).append(fc.decode("utf-8") )
                        value_joint_table.setdefault(key_root,[]).append(tc.decode("utf-8") )
                        list_exist.append(ft.decode("utf-8") )
                        list_exist.append(tt.decode("utf-8") )
                        new_table = GraphControl.get_real_table(limit_table)
                        value_joint = {}
                        value_joint = new_table.if_joint(list_exist)
                        if value_joint : 
                            value_joint_table.setdefault(key_joint_table,[]).append(value_joint)
                        jsonRoot.setdefault(limit_table,[]).append(value_joint_table)
        value.setdefault(key_joint_table,[]).append(jsonRoot)
        retour.setdefault(key,[]).append(value)
        return retour
    
    def get_joined_tables(self):
        query = KEY_QUERY.format(self.name, self.name)
        time.sleep(0.2)
        job = self.service.launch_job(query)
        r = job.get_results()
        return r
    
    def get_all_tables(self):
        query = TABLE_QUERY.format(self.name)
        time.sleep(0.2)
        job = self.service.launch_job(query)
        r = job.get_results()
        return r
    
    def get_natural_tables(self):
        print(" get join tables for {}".format(self.name))
        query = NATURAL_QUERY.format(self.schema, self.natural_join)
        job = self.service.launch_job(query)
        r = job.get_results()
        return r
    
    def get_natural_joined_tables(self):
        print(" get join tables for {}".format(self.name))
        query = NATURAL_JOINT_QUERY.format()
        job = self.service.launch_job(query)
        r = job.get_results()
        return r