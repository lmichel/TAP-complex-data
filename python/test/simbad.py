from objintap.explorer import Explorer

if __name__ == "__main__":
    explorer = Explorer("https://simbad.u-strasbg.fr/simbad/sim-tap", "public", "basic")
    explorer.build_hierarchy() #create all table and save the links
    print(explorer.to_json_schema())#build json