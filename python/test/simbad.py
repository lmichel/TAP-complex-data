import sys
sys.path.append('..')
from objintap.explorer import Explorer

if __name__ == "__main__":
    explorer = Explorer("https://simbad.u-strasbg.fr/simbad/sim-tap", "public", "basic")
    explorer.ajout_joint("otypes", "otypedef") 
    #explorer = Explorer("http://dc.zah.uni-heidelberg.de/tap", 'rr', 'rr.registries', natural_join="ivoid")
    #explorer.ajout_joint("rr.resource") 
    