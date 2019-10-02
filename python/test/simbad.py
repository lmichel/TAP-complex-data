import sys
sys.path.append('..')
from objintap.explorer import Explorer

if __name__ == "__main__":
    #explorer = Explorer("https://simbad.u-strasbg.fr/simbad/sim-tap", "public", "otypes")
    #explorer.ajout_joint("otypedef", "basic") 
    explorer = Explorer("http://dc.zah.uni-heidelberg.de/__system__/tap/run/tap", 'rr', 'rr.registries', natural_join="ivoid")
    explorer.ajout_joint("rr.resource") 
    