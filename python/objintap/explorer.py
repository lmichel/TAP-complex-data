from astroquery.utils.tap.core import TapPlus
from objintap.graph_control import GraphControl
import json
from orca.scripts import self_voicing


class Explorer():
    def __init__(self, service_url, schema, master_table, natural_join=None):
        self.service_url = service_url
        self.schema = schema
        self.natural_join = natural_join
        self.service = TapPlus(url=self.service_url)
        self.master_table = GraphControl.get_table(self.service, schema, master_table,  None, None, natural_join=natural_join)
        
    def ajout_joint(self,*a):
        value=self.master_table.set_targets(*a)
        store_json=json.dumps(value, indent = 4, sort_keys = True)
        #with open('./TAP_simbad.json', 'w') as f:
            #json.dump(value, f)
        print(store_json)

            