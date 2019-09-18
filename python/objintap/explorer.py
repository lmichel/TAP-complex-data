from astroquery.utils.tap.core import TapPlus
from objintap.table import Table
from objintap.graph_control import GraphControl


class Explorer():
    def __init__(self, service_url, schema, master_table, natural_join=None):
        self.service_url = service_url
        self.schema = schema
        self.natural_join = natural_join
        self.service = TapPlus(url=self.service_url)
        self.master_table = GraphControl.get_table(self.service, schema, master_table, None, None, None, natural_join=natural_join)
        
    def build_hierarchy(self):
        self.master_table.set_targets()

    def limit_tables(self,limit):
        table_limit = limit
        ttable = []
        for ttable in table_limit:
            GraphControl.store_limit_table(ttable)
        lenth=len(table_limit)
        i=0
        j=0
        retour=''
        while i<lenth and j<lenth:
            if i==j:
                j=j+1
            while j<lenth and j!=i:
                if GraphControl.has_link(table_limit[i], table_limit[j]):
                    self.master_table=GraphControl.get_real_table(table_limit[i])
                    flag=0
                    for k,v in self.master_table.joined.items():
                        if k==table_limit[j]:
                            flag=1
                            retour += self.master_table.to_json_schema_limit(table_limit[j], "", True)
                    if flag==0:
                        self.master_table=GraphControl.get_real_table(table_limit[j])
                        retour += self.master_table.to_json_schema_limit(table_limit[i], "", True)
                i=i+1
                j=j+1
            i=i+1
            j=0
        return retour
            

    def to_json_schema(self):
        table_defs = []
        retour  = '"definitions": {\n'
        for v in GraphControl.tables.values():
            table_defs.append(v.to_json_schema_definition("    "))
        t=0
        tlist=[]
        tlist=self.master_table.set_otargets()
        tmax=len(tlist)
        print(tlist)
        retour += ",".join(table_defs)
        retour += '\n}\n'
        while t<tmax and t!=4:
            self.master_table=GraphControl.get_real_table(tlist[t].decode("utf-8"))
            retour += "\n"
            retour +=  self.master_table.to_json_schema("", True)
            t=t+1
        #print(retour)
        return retour

    
            