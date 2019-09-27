import sys
sys.path.append('..')
from objintap.explorer import Explorer

if __name__ == "__main__":
    explorer = Explorer("https://simbad.u-strasbg.fr/simbad/sim-tap", "public", "basic")
    explorer.ajout_joint("otypes", "otypedef") 
