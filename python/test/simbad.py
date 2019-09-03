from objintap.explorer import Explorer

explorer = Explorer("https://simbad.u-strasbg.fr/simbad/sim-tap", "public", "basic")
explorer.build_hierarchy()
print(explorer.to_json_schema())
