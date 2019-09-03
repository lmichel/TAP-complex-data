from astroquery.utils.tap.core import TapPlus

KEY_QUERY = "select  top 100  tap_schema.keys.target_table as table_name, tap_schema.keys.key_id from tap_schema.keys \
join tap_schema.key_columns on tap_schema.keys.key_id = tap_schema.key_columns.key_id  \
where from_table = '{}'"

NATURAL_QUERY = "SELECT DISTINCT TOP 100  tap_schema.tables.table_name \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.table_name != '{}' AND tap_schema.tables.schema_name = '{}' AND tap_schema.columns.column_name = '{}'"

FIELD_QUERY = "SELECT DISTINCT TOP 100  tap_schema.columns.column_name, tap_schema.columns.description, tap_schema.columns.unit, tap_schema.columns.ucd, tap_schema.columns.datatype, tap_schema.columns.utype \n\
FROM tap_schema.tables \n\
JOIN tap_schema.columns ON tap_schema.tables.table_name = tap_schema.columns.table_name \n\
WHERE tap_schema.tables.schema_name = '{}' AND tap_schema.tables.table_name = '{}' "

    
class Field():
    def __init__(self, name, datatype, unit, ucd ):
        self.name = name
        self.datatype = datatype
        self.unit = unit
        self.ucd = ucd

class Table():
    def __init__(self, service, schema, name, key, natural_join=None):
        self.service = service
        self.schema = schema
        self.name = name;
        self.natural_join = natural_join
        self.key = key
        self.fields = dict()        
        self.joined = dict()
        self.set_fields()
            
    def set_fields(self):
        query = FIELD_QUERY.format(self.schema, self.name)
        job = self.service.launch_job(query)
        r = job.get_results()
        for cn, de, un, uc, dt, xt in r['column_name', 'description', 'unit', 'ucd', 'datatype', 'utype']:
            field = Field(cn,dt,un,uc)
            self.fields[cn] = field

        print(r)

    def set_targets(self):
        targets = None
        if self.natural_join == None:
            targets=self.get_joined_tables()
            for ft, ki in targets['table_name', 'key_id']:
                tname = ft.decode("utf-8") 
                key_id = ki.decode("utf-8") 
                print("add {} {} -> {}".format(self.name, key_id, tname))
                new_table = Table(self.service, self.schema, tname, key_id, self.natural_join)
                self.joined[tname] = new_table
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
        print(" get join tables for {}".format(self.name))
        query = KEY_QUERY.format(self.name)
        job = self.service.launch_job(query)
        r = job.get_results()
        print(r)
        return r
    
    def get_natural_joined_tables(self):
        print(" get join tables for {}".format(self.name))
        query = NATURAL_QUERY.format(self.name, self.schema, self.natural_join)
        job = self.service.launch_job(query)
        r = job.get_results()
        return r
    
class Explorer():
    def __init__(self, service_url, schema, master_table, natural_join=None):
        self.service_url = service_url
        self.schema = schema
        self.natural_join = natural_join
        self.service = TapPlus(url=self.service_url)
        self.master_table = Table(self.service, schema, master_table, None, natural_join=natural_join)
        
    def build_hierarchy(self):
        self.master_table.set_targets()

explorer = Explorer("http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap", 'rr', 'rr.capability')
#explorer = Explorer("http://simbad.u-strasbg.fr/simbad/sim-tap/", 'public', 'basic',natural_join=None)
#explorer.build_hierarchy()
        
#explorer = Explorer("http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap", 'rr', 'rr.capability', natural_join="ivoid")
#explorer = Explorer("http://simbad.u-strasbg.fr/simbad/sim-tap/", 'rr', 'rr.capability', natural_join="ivoid")
#explorer.build_hierarchy()
print(explorer.master_table)
