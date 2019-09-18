from objintap.field import Field
from objintap.graph_control import GraphControl

import time

KEY_QUERY = "SELECT  TOP 100  tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table, tap_schema.keys.key_id ,tap_schema.key_columns.from_column, tap_schema.key_columns.target_column \n\
FROM tap_schema.keys \n\
JOIN  tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id  \n\
WHERE target_table = '{}'"#only chercher tt=master_table

OKEY_QUERY = "SELECT DISTINCT TOP 100  tap_schema.columns.column_name, tap_schema.columns.description, tap_schema.columns.unit, tap_schema.columns.ucd, tap_schema.columns.datatype, tap_schema.columns.utype \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.schema_name = '{}' AND tap_schema.tables.table_name = '{}' "

o_KEY_QUERY = "SELECT  TOP 100  tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table, tap_schema.keys.key_id \n\
FROM tap_schema.keys \n\
JOIN  tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id  \n\
"#chercher all table

NATURAL_QUERY = "SELECT DISTINCT TOP 100  tap_schema.tables.table_name \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.table_name != '{}' AND tap_schema.tables.schema_name = '{}' AND tap_schema.columns.column_name = '{}'"

FIELD_QUERY = "SELECT DISTINCT TOP 100  tap_schema.columns.column_name, tap_schema.columns.description, tap_schema.columns.unit, tap_schema.columns.ucd, tap_schema.columns.datatype \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.schema_name = '{}' AND tap_schema.tables.table_name = '{}' "


class Table():
    def __init__(self, service, schema, name, key, from_Column, target_Column, natural_join=None):
        self.service = service
        self.schema = schema
        self.name = name;
        self.natural_join = natural_join
        self.key = key
        self.fields = dict()        
        self.joined = dict()
        self.links = []
        self.flag = 0
        self.fColumn = from_Column 
        self.tColumn = target_Column
        #self.set_fields()
        
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
    
    def to_json_schema_limit(self, ttable, indent, follow):
        retour  = '\n' + indent + '"{}": {}\n'.format(self.name, '{')
        retour += indent + '    "key_id": "{}"'.format(self.key)
        GraphControl.store_joined(self.name)  
        
        if follow == True :
            if len(self.joined) > 0:
                retour += ',\n'
                retour += indent + '    "joint_Tables": {\n'
                tables = []
                exist_tables = []
                exist_tables.append(self.name)
                for k,v in self.joined.items():
                    while k!= ttable:
                            break
                    else:
                        exist_tables.append(k)
                        tables.append(v.to_json_schema(indent + "        ", GraphControl.hasnt_joined(k)))
                    if GraphControl.get_limit_table(k) and (k not in exist_tables) :
                        tables.append(v.to_json_schema_add(indent + "        ", GraphControl.hasnt_joined(k)))
                retour += ",".join(tables)
            else:
                retour += '\n'
            
        retour += '\n' + indent + '    }\n'
        retour += indent + '}'
        #print(retour)
        return retour
    
    def to_json_schema_add(self, indent, follow):
        retour  = "\n"+indent + '"{}": {}\n'.format(self.name, '{1')
        #retour += indent + '    "type": "object",\n'
        retour += indent + '    "key_id": "{}",\n'.format(self.key)
        retour += indent + '    "from_column":"{}",\n'.format(self.fColumn)
        retour += indent + '    "target_column":"{}"'.format(self.tColumn)
        GraphControl.store_joined(self.name)  
        #print(retour)
        if follow == True :       
            #print(self.name,follow)
            if len(self.joined) > 0:
                retour += ',\n'
                if GraphControl.if_exsit_limit_table():
                    retour += indent + '    "joint_Tables": {\n'
                    for k,v in self.joined.items():
                        if GraphControl.get_limit_table(k):
                            tables = []
                            tables.append(v.to_json_schema(indent + "        ", GraphControl.hasnt_joined(k)))
                            retour += ",\n".join(tables)
                            retour +='\n' + indent + '    }\n'
                else:
                    retour += indent + '    "joint_Tables": {\n'
                    tables = []
                    for k,v in self.joined.items():
                        tables.append(v.to_json_schema(indent + "        ", GraphControl.hasnt_joined(k)))
                    retour += ",\n".join(tables)
                    retour +='\n' + indent + '    }\n'
            else:
                retour += '\n'
        else :
            retour += '\n'
        #retour += indent + '9}'
        retour += indent + '7}'
        #print(retour)
        return retour
    
    def to_json_schema(self, indent, follow):
        retour  = indent + '"{}": {}\n'.format(self.name, '{')
        #retour += indent + '    "type": "object",\n'
        retour += indent + '    "key_id": "{}",\n'.format(self.key)
        retour += indent + '    "from_column":"{}",\n'.format(self.fColumn)
        retour += indent + '    "target_column":"{}"'.format(self.tColumn)
        GraphControl.store_joined(self.name)  
        #print(retour)
        if follow == True :       
            #print(self.name,follow)
            if len(self.joined) > 0:
                retour += ',\n'
                if GraphControl.if_exsit_limit_table():
                    retour += indent + '    "joint_Tables": {\n'
                    for k,v in self.joined.items():
                        if GraphControl.get_limit_table(k):
                            tables = []
                            tables.append(v.to_json_schema(indent + "        ", GraphControl.hasnt_joined(k)))
                            retour += ",\n".join(tables)
                            retour +='\n' + indent + '    }\n'
                else:
                    retour += indent + '    "joint_Tables": {\n'
                    tables = []
                    for k,v in self.joined.items():
                        tables.append(v.to_json_schema(indent + "        ", GraphControl.hasnt_joined(k)))
                    retour += ",\n".join(tables)
                    retour +='\n' + indent + '    }\n'
            else:
                retour += '\n'
        else :
            retour += '\n'
        #retour += indent + '9}'
        retour += indent + '}'
        #print(retour)
        return retour

    def to_json_schema_definition(self, indent):
        GraphControl.store_definition(self.name)
        retour  = "\n"
        retour += indent + '"{}": {}\n'.format(self.name, '{')
        retour += indent +  '    "type": "object",\n'
        retour += indent +  '    "properties": {\n'
        retour += indent +  '          "fields": {\n'
        retour += indent +  '              "type": "object",\n'
        retour += indent +  '              "properties": {\n'
        for k,v in self.fields.items():
            retour += v.to_json_schema( indent + "    ")
        retour += indent +  '               }\n'
        retour += indent +  '            }\n'
        retour += indent +  '      }\n' 
        retour += indent + '}'
        #print(retour)
        return retour


        
    def set_fields(self):
        query = FIELD_QUERY.format(self.schema, self.name)
        print(query)
        job = self.service.launch_job(query)
        r = job.get_results()
        for cn, de, un, uc, dt in r['column_name', 'description', 'unit', 'ucd', 'datatype']:
            field = Field(cn, dt, un, uc)
            self.fields[cn] = field

       # print(r)

    def set_otargets(self):
        otargets = None
        if self.natural_join == None:
            otargets=self.get_ojoined_tables()
            ttlist=[]
            i=0
            for ft, tt, ki in otargets['from_table','target_table', 'key_id']:
                if i == 0 :
                    ttlist.append(tt)
                    i=i+1
                elif  i != 0 :
                    if (tt not in ttlist) :
                        ttlist.append(tt) #store all different target_table
                        i=i+1
                    else :
                        continue
        return ttlist
    
    
    
    def set_targets(self): #master_table is target table
        targets = None
        if self.natural_join == None:
            targets=self.get_joined_tables()
            tlist=self.set_otargets()
            t=0
            tmax=len(tlist)
            if t==0 and tlist[t].decode("utf-8")==self.name:
                for ft, tt, ki, fc, tc in targets['from_table','target_table', 'key_id', 'from_column', 'target_column']:
                    #print(self.name)
                    if ft.decode("utf-8") != self.name and tt==tlist[t]:
                        #print(self.name)
                        tname = ft.decode("utf-8") 
                        #print(tname)
                        if GraphControl.hasnt_link(self.name, tname) :
                            GraphControl.store_link(self.name, tname)
                            key_id = ki.decode("utf-8") 
                            fcolumn=fc.decode("utf-8")
                            tcolumn=tc.decode("utf-8")
                            print("add {} {} -> {}".format(self.name, key_id, tname))
                            #if tname not in GraphControl.tables.keys(): #The key problem is not solved
                            new_table = GraphControl.get_table(self.service, self.schema, tname, key_id, fcolumn, tcolumn, self.natural_join)
                            self.joined[tname] = new_table
                            print(self.name + " >> " + str(len(self.joined)) + " " + str(self.joined.keys()))
                    else:
                        break
                t=t+1
                new_table = GraphControl.get_table(self.service, self.schema, tlist[t].decode("utf-8"), None, None, None, self.natural_join)
                new_table.set_targets()
                    #tname = tt.decode("utf-8") 
            else:
                t=t+1
            while t<tmax and t!=0:
                if tlist[t].decode("utf-8")==self.name:
                    for ft, tt, ki, fc, tc in targets['from_table','target_table', 'key_id', 'from_column', 'target_column']:
                        #print(self.name)
                        if ft.decode("utf-8") != self.name and tt==tlist[t]:
                            #print(self.name)
                            tname = ft.decode("utf-8") 
                            #print(tname)
                            if GraphControl.hasnt_link(self.name, tname) :
                                GraphControl.store_link(self.name, tname)
                                key_id = ki.decode("utf-8") 
                                fcolumn=fc.decode("utf-8")
                                tcolumn=tc.decode("utf-8")
                                print("add {} {} -> {}".format(self.name, key_id, tname))
                                #if tname not in GraphControl.tables.keys():#create new table named tname
                                new_table = GraphControl.get_table(self.service, self.schema, tname, key_id, fcolumn, tcolumn, self.natural_join)
                                self.joined[tname] = new_table
                                print(self.name + " >> " + str(len(self.joined)) + " " + str(self.joined.keys()))
                                #else:#add another relation between tname and self
                                #    odd_table = GraphControl.add_link(self.service, self.schema, tname, key_id, self.natural_join)
                                #    self.joined[tname] = odd_table
                                #    print(self.name + " >> " + str(len(self.joined)) + " " + str(self.joined.keys()))
                            #let's go deeper in the hierarchy if join keys are given by the TAP schema
                        else:
                            break
                            print(self.name)
                    t=t+1
                    if t==4:
                        break
                    else:
                        new_table = GraphControl.get_table(self.service, self.schema, tlist[t].decode("utf-8"), None, None, None, self.natural_join)
                        new_table.set_targets()
                else:
                    t=t+1
        else:
            targets = self.get_natural_joined_tables()
            for ft in targets['table_name']:
                tname = ft.decode("utf-8") 
                print("add {} {} -> {}".format(self.name, self.natural_join, tname))
                new_table = Table(self.service, self.schema, tname, self.natural_join, self.natural_join)
                self.joined[tname] = new_table
         
    def get_joined_tables(self):
        print("** get join tables for {}".format(self.name))
        query = KEY_QUERY.format(self.name, self.name)#trouver des données qui associent avec tt=self.name ou ft=self.name
        #(query)
        time.sleep(0.2)
        job = self.service.launch_job(query)
        r = job.get_results()
        #print(r)
        return r
    
    def get_ojoined_tables(self):
        print("** get join tables for {}".format(self.name))
        query = o_KEY_QUERY.format(self.name, self.name)#trouver des données qui associent avec tt=self.name ou ft=self.name
        #(query)
        time.sleep(0.2)
        job = self.service.launch_job(query)
        r = job.get_results()
        #print(r)
        return r
    
    def get_natural_joined_tables(self):
        print(" get join tables for {}".format(self.name))
        query = NATURAL_QUERY.format(self.name, self.schema, self.natural_join)
        job = self.service.launch_job(query)
        r = job.get_results()
        return r
 