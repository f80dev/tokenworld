git commit -a -m "commit pour publication beta"
copy ./src/CNAME_beta ./src/CNAME
call ng build --aot --output-hashing=none --source-map=true --optimization=false --configuration development
call gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/tokenworld.git -f -t true -b gh-pages -m \"update from gh-pages\"
