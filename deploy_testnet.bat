git commit -a -m "commit pour publication devnet"
copy .\src\CNAME_testnet .\src\CNAME
copy .\src\index-testnet.html .\src\index.html
copy .\src\manifest-testnet.webmanifest .\src\manisfest.webmanifest
call ng build --aot --output-hashing=all --source-map=true --optimization=false --configuration testnet
call gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/TokemonWorldTestnet.git -f -t true -b main -m \"update from main\"",
