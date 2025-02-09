  if %1=="beta" (
    cp ./src/CNAME_beta ./src/CNAME
    npm version patch
    ng build --aot --output-hashing=none --source-map=true --optimization=false --configuration development
    gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/tokenworld.git -f -t true -b gh-pages -m \"update from gh-pages\"
  )

  if %1=="prod" (
    cp ./src/CNAME_prod ./src/CNAME
    npm version patch
    ng build --aot --output-hashing=none --source-map=false --optimization=true --configuration production
    gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/TokemonWorldProduction.git -f -t true -b main -m \"update from main\"
  )

  if %1=="devnet" (
    cp ./src/CNAME_devnet ./src/CNAME
    npm version patch
    ng build --aot --output-hashing=none --source-map=false --optimization=true --configuration devnet
    gh-pages -d ./dist/tokemonworld --repo https://github.com/f80dev/TokemonWorldDevnet.git -f -t true -b main -m \"update from main\"",
  )

