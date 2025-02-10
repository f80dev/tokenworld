git commit -a -m "commit pour publication devnet"
copy .\src\CNAME_devnet .\src\CNAME
copy .\src\index-devnet.html .\src\index.html
copy .\src\manifest-devnet.webmanifest .\src\manisfest.webmanifest
call ng build --aot --output-hashing=none --source-map=false --optimization=true --configuration devnet
call gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/TokemonWorldDevnet.git -f -t true -b main -m \"update from main\"",
