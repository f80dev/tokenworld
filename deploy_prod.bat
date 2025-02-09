copy .\src\CNAME_prod .\src\CNAME
git commit -a -m "commit pour publication production"
call npm version patch
call ng build --aot --output-hashing=none --source-map=false --optimization=true --configuration production
call gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/TokemonWorldProduction.git -f -t true -b main -m \"update from main\"
