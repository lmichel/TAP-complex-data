    
class Field():
    def __init__(self, name, datatype, unit, ucd ):
        self.name = name.decode("utf-8") 
        self.datatype = datatype.decode("utf-8") 
        self.unit = unit.decode("utf-8") 
        self.ucd = ucd.decode("utf-8") 

    def __repr__(self):
        return "{} {} {} {}".format(str(self.name), str(self.datatype), str(self.unit), str(self.ucd))
    
    def to_json_schema(self, indent):
        retour  = indent + '"{}": {}\n'.format(self.name, '{')
        retour += indent + '    "type": "object",\n'
        retour += indent + '    "properties": {\n'
        retour += indent + '       "datatype": {\n'
        retour += indent + '           "const": "{}"\n'.format(self.datatype)
        retour += indent + '         },\n'
        retour += indent + '       "unit": {\n'
        retour += indent + '            "const": "{}"\n'.format(self.unit)
        retour += indent + '        },\n'
        retour += indent + '       "ucd": {\n'
        retour += indent + '            "const": "{}"\n'.format(self.ucd)
        retour += indent + '        }\n'
        retour += indent + '    }\n'
        retour += indent + '}\n'
        return retour

   