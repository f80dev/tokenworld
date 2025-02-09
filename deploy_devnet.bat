git commit -a -m "commit pour publication devnet"
del "./src/CNAME"
copy "./src/CNAME_devnet" "./src/CNAME"
call ng build --aot --output-hashing=none --source-map=false --optimization=true --configuration devnet
call gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/TokemonWorldDevnet.git -f -t true -b main -m \"update from main\"",
