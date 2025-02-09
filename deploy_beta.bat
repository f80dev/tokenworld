git commit -a -m "commit pour publication"
copy ./src/CNAME_beta ./src/CNAME
start npm version patch
start ng build --aot --output-hashing=none --source-map=true --optimization=false --configuration development
start gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/tokenworld.git -f -t true -b gh-pages -m \"update from gh-pages\"
