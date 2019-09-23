from astroquery.utils.tap.core import TapPlus
from objintap.graph_control import GraphControl
import json

class Explorer():
    def __init__(self, service_url, schema, master_table, natural_join=None):
        self.service_url = service_url
        self.schema = schema
        self.natural_join = natural_join
        self.service = TapPlus(url=self.service_url)
        self.master_table = GraphControl.get_table(self.service, schema, master_table,  None, None, natural_join=natural_join)
        
    def build_hierarchy(self):
        self.master_table.set_targets()

    def to_json_schema(self):
        #parameter : 
        #in order to build the dictionary of schema
        #return : the json's form
        retour = {}
        t=0
        list_Ttable=self.master_table.get_all_tables()
        tmax=len(list_Ttable)
        while t<tmax:
            for tname in list_Ttable['table_name']:
                self.master_table=GraphControl.get_real_table(tname.decode("utf-8"))
                key=tname.decode("utf-8")
                value=self.master_table.to_json_schema_joint()
                retour.setdefault(key,value)
            t=t+1
        return json.dumps(retour, indent = 4, sort_keys = True)

    
            