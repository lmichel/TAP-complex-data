from objintap.explorer import Explorer

if __name__ == "__main__":
    explorer = Explorer("https://simbad.u-strasbg.fr/simbad/sim-tap", "public", "basic")
    explorer.build_hierarchy() #create all table and save the key
    #print(explorer.limit_tables(["basic", "otypes", "otypedef", "flux","filter"]))
    print(explorer.to_json_schema())