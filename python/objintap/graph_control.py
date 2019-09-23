from builtins import staticmethod


class GraphControl:
    tables = dict()
    list_table = []
    
    @staticmethod
    def store_list_table(tname):#store the link
        GraphControl.list_table.append(tname)
      
    @staticmethod  
    def get_list_table():#return the link
        return GraphControl.list_table
    
    @staticmethod
    def get_table(service, schema, tname, from_Column, target_Column, natural_join):#create a new table
        from objintap.table import Table
        if tname not in GraphControl.tables.keys():
            GraphControl.tables[tname] = Table(service, schema, tname, from_Column, target_Column,natural_join)
        return GraphControl.tables[tname]
    
    @staticmethod
    def get_real_table(tname):#return appointed table
        return GraphControl.tables[tname]

    
