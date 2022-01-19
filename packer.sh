>api.js

find ./utils/ -name "*.js" | xargs cat >> api.js

find ./api/ -name "*_*.js" | xargs cat >> api.js
find ./api/ -name "*.js" ! -name "*_*" | xargs cat >> api.js