from objintap.field import Field
from objintap.graph_control import GraphControl

import time
KEY_QUERY = "SELECT  TOP 100  tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table, tap_schema.keys.key_id \n\
FROM tap_schema.keys \n\
JOIN  tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id  \n\
WHERE from_table = '{}' OR target_table = '{}'"

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


class Table():
    def __init__(self, service, schema, name, key, natural_join=None):
        self.service = service
        self.schema = schema
        self.name = name;
        self.natural_join = natural_join
        self.key = key
        self.fields = dict()        
        self.joined = dict()
        self.links = []
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
    
    def to_json_schema(self, indent, follow):
        retour  = '\n' + indent + '"{}": {}\n'.format(self.name, '{')
        retour += indent + '     "type": "object",\n'
        retour += indent + '     "properties": {\n'
        retour += indent + '          "meta": {\n'
        retour += indent + '              "$ref": "Definitions#{}"\n'.format(self.name)
        retour += indent + '          },\n'
        retour += indent + '          "key": "{}"'.format(self.key)
        GraphControl.store_joined(self.name)  
        
        if follow == True :       
            if len(self.joined) > 0:
                retour += ',\n'
                retour += indent + '          "joinedTables": {\n'
                retour += indent + '             "type": "object",\n'
                retour += indent + '             "properties": {'
                tables = []
                for k,v in self.joined.items():                
                    tables.append(v.to_json_schema(indent + "                  ", GraphControl.hasnt_joined(k)))
                retour += ",".join(tables)
                retour += '\n' + indent + '             } \n'
                retour += indent + '         }\n'
            else:
                retour += '\n'
 
        retour += indent + '    }\n'
        retour += indent + '}'

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
            retour += v.to_json_schema( indent + "            ")
        retour += indent +  '               }\n'
        retour += indent +  '            }\n'
        retour += indent +  '      }\n' 
        retour += indent + '}'
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

    def set_targets(self):
        targets = None
        if self.natural_join == None:
            targets=self.get_joined_tables()
            #print(targets)
            for ft, tt, ki in targets['from_table','target_table', 'key_id']:
                if ft.decode("utf-8") != self.name :
                    tname = ft.decode("utf-8") 
                else:
                    tname = tt.decode("utf-8") 
                if GraphControl.hasnt_link(self.name, tname) :
                    GraphControl.store_link(self.name, tname)
                    key_id = ki.decode("utf-8") 
                    print("add {} {} -> {}".format(self.name, key_id, tname))
                    new_table = GraphControl.get_table(self.service, self.schema, tname, key_id, self.natural_join)
                    self.joined[tname] = new_table
                    print(self.name + " >> " + str(len(self.joined)) + " " + str(self.joined.keys()))
                    '''
                    let's go deeper in the hierarchy if join keys are given by the TAP schema
                    '''
                    new_table.set_targets()

        else:
            targets = self.get_natural_joined_tables()
            for ft in targets['table_name']:
                tname = ft.decode("utf-8") 
                print("add {} {} -> {}".format(self.name, self.natural_join, tname))
                
                new_table = Table(self.service, self.schema, tname, self.natural_join, self.natural_join)
                self.joined[tname] = new_table
             
    def get_joined_tables(self):
        print("** get join tables for {}".format(self.name))
        query = KEY_QUERY.format(self.name, self.name)
        #print(query)
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
 