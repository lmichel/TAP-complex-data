### At a Glance

- `TapHandleMK2` is a web application that allows you to explore any TAP service from your browser. 
- It has been designed to be a successor of TapHandle aiming to enable everyone to easly walk 
  throught hierarchical data stored in TAP services while keeping all the functionality of its predecessor.


- *Find a service* with the search bar in the banner
    - The search bar is connected to the [GAVO relation registry](https://dc.zah.uni-heidelberg.de/tap/sync) (credit: Markus Demleitner)
    - You can type any word in the bar or choose more specific constraints by selecting fields above the bar.
    - You can type an URL to connect one non registered service
    - Select one the popular tap (click on some popular tap services then select the desired service). 
      Do not misinterpret the _popular service_ concept. In our case, they are the services used to developped 
      the library underneath the application.

  
- *Browse a service* from the left data tree
	- *Double click* on the service name open a table selector (required for Vizier)
	- *Click on one table* to get the first 10 rows;
    - *Click on one table [info] button* to select the columns to be displayed.
    - If the displayed table is joined with others tables, you will see a little blue icon on the title right
      - Click on one row to show the join data
      - If the joined table is joined with others tables, you will see a little blue icon on the title right...
      - The constraint editor allows you to put constraints on any joined table, it is able to set-up the query accordingly 
    - The draggable modal holds the constraint setting forms.


### HTTP vs HTTPS Watchout

The HTTP server serving `TapHandleMK2` is configured to work with `http` TAP services even when
 it is launched from `https://taphandle.astro.unistra.fr`. However a few TAP services declared 
 as `https` operate redirections (code 30x) on  `http` URLs. This configuration makes `TapHandleMK2`
 falling into a `mixed content` error that cannot be trapped by the application (but on the console). 
 In such cases, relaunch `TapHandleMK2` from `http://taphandle.astro.unistra.fr`.
 
 ### TapHandle on Github
 
 `TapHandleMK2` is one application built over a wider project named [TapComplex](https://github.com/lmichel/TAP-complex-data) 
 which aims at exploring TAP service a little bit beyond the relational model.
 
