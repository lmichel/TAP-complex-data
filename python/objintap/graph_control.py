

class GraphControl:
    tables = dict()
    links = []
    definitions = []
    joined = []
      
    @staticmethod
    def get_table(service, schema, tname, key_id, natural_join):
        from objintap.table import Table
        if tname not in GraphControl.tables.keys():
            GraphControl.tables[tname] = Table(service, schema, tname, key_id, natural_join)
            print(" create " + tname)
        return GraphControl.tables[tname]
            
    @staticmethod
    def hasnt_link(t1, t2):
        return ("{} {}".format(t1, t2) not in GraphControl.links)
    
    @staticmethod
    def store_link(t1, t2):
        GraphControl.links.append("{} {}".format(t1, t2) )
        GraphControl.links.append("{} {}".format(t2, t1) )

    @staticmethod
    def hasnt_definition(t1):
        return (t1 not in GraphControl.definitions)

    @staticmethod
    def store_definition(t1):
        print("store " + t1)
        GraphControl.definitions.append(t1 )
    
    @staticmethod
    def store_joined(t1):
        GraphControl.joined.append(t1 )
        
    @staticmethod
    def hasnt_joined(t1):
        print(GraphControl.joined)
        return (t1 not in GraphControl.joined)
    
