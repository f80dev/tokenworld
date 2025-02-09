git commit -a -m "commit pour publication"
copy ./src/CNAME_beta ./src/CNAME
npm version patch
ng build --aot --output-hashing=none --source-map=true --optimization=false --configuration development
gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/tokenworld.git -f -t true -b gh-pages -m \"update from gh-pages\"
