from builtins import staticmethod
from _testbuffer import staticarray
from abc import abstractstaticmethod


class GraphControl:
    tables = dict()
    links = []
    definitions = []
    joined = []
    limit_table = []
    
    @staticmethod
    def store_limit_table(limit):
        GraphControl.limit_table.append(limit)
        
    @staticmethod
    def get_limit_table(limit):
        #print(limit)
        if GraphControl.limit_table == []:
            return True
        else :
            return (limit in GraphControl.limit_table)
    
    @staticmethod
    def if_exsit_limit_table():
        if GraphControl.limit_table == []:
            return False
        else : 
            return True
    
    @staticmethod
    def get_table(service, schema, tname, key_id, from_Column, target_Column, natural_join):#create a new table
        from objintap.table import Table
        if tname not in GraphControl.tables.keys():
            GraphControl.tables[tname] = Table(service, schema, tname, key_id, from_Column, target_Column,natural_join)
            print(" create " + tname)
        #print(GraphControl.tables[tname])
        return GraphControl.tables[tname]
    
    @staticmethod
    def get_real_table(tname):#create a new table
        from objintap.table import Table
        #print(GraphControl.tables[tname])
        return GraphControl.tables[tname]
         

    @staticmethod
    def hasnt_link(t1, t2):
        return ("{} {}".format(t1, t2) not in GraphControl.links)
    
    @staticmethod
    def has_link(t1, t2):
        return  ("{} {}".format(t1, t2) in GraphControl.links)
    
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
        print(GraphControl.definitions)
    
    @staticmethod
    def store_joined(t1):
        GraphControl.joined.append(t1 )
        
    @staticmethod
    def hasnt_joined(t1):
        print(GraphControl.joined)
        return (t1 not in GraphControl.joined)
    
