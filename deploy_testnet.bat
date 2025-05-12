git commit -a -m "commit pour publication devnet"
copy .\src\CNAME_testnet .\src\CNAME
copy .\src\index-testnet.html .\src\index.html
copy .\src\manifest-testnet.webmanifest .\src\manisfest.webmanifest
call ng build --aot --output-hashing=all --source-map=true --optimization=false --configuration testnet
call gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/TokemonTestnet.git -f -t true -b public2 -m \"update from main\"
