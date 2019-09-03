from astroquery.utils.tap.core import TapPlus
from objintap.table import Table
from objintap.graph_control import GraphControl

class Explorer():
    def __init__(self, service_url, schema, master_table, natural_join=None):
        self.service_url = service_url
        self.schema = schema
        self.natural_join = natural_join
        self.service = TapPlus(url=self.service_url)
        self.master_table = GraphControl.get_table(self.service, schema, master_table, None, natural_join=natural_join)
        
    def build_hierarchy(self):
        self.master_table.set_targets()

    def to_json_schema(self):
        table_defs = []
        retour  = '"definitions": {\n'
        for v in GraphControl.tables.values():    
            table_defs.append(v.to_json_schema_definition("    "))
        retour += ",".join(table_defs)
        retour += '\n}\n'
        retour +=  self.master_table.to_json_schema("", True)
        return retour

    
            