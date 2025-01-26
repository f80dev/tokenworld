export const environment = {
  production: false,
  forum: "https://discord.gg/BfC2E2ent",
  mail: "contact@nfluent.io",
  version: require('../../package.json').version + '-dev',
  appname: "Gate",
  server: "http://localhost:5000",
  networks: [
    {label: "MultiversX Test", value: "elrond-devnet"},
    {label: "MultiversX", value: "elrond-mainnet"},
    {label: "MultiversX Test v2", value: "elrond-devnet2"},
  ],
  storage:"github",
  visual: "./assets/coffre.jpg",
  claim: "Valoriser vos contenus en quelques clics",
  token: {
    "elrond-devnet":"LIFEPOINT-30c75e",
    "elrond-mainnet":"LIFEPOINT-30c75e"
  },
  token_market: "https://tokemon.f80.fr/faucet",
  max_file_size:50000000,
  shorter_service:"",
  appli:"https://tokemon.f80.fr",
  transfer_page:"https://t.f80.fr",


  offset_lat:-0.00017,
  offset_lng:0.00040,
  render_server: "https://api.f80.fr:9876",
  fee: 10,
  style:"promptmarket.css",


  faqs:[
    {
      index: "aquoicasert",
      title: "Qu'est ce que {{appname}} ?",
      order: 0,
      format: "html",
      content:"{{appname}} est une place de marché permettant à des acheteurs de faire des annonces sous forme de prompt IA et à des possesseurs de puissances de calcul de répondre à ses prompts en proposant des images"
    },
    {
      index: "install_server",
      title: "Comment générer des images depuis son ordinateur",
      order: 0,
      format: "html",
      content:""
    }
  ],

  dictionnary:{
    "fr":{
      pv:"PV"
    },
    "en":{
      pv:"LP"
    }
  },

  scale_factor:100,
  translate_factor:1000000000,

  contract_addr:{
    "elrond-devnet":"erd1qqqqqqqqqqqqqpgqhkpt4kfdndnamdwdyzwhqc6sdcern39f835scfjvcp",
    "elrond-mainnet":""
  },

  website: "https://f80.fr",
  company:" F80",
  seuil_capture: 10,
  max_pv_loading: 1000,
  nft_market: {
    "elrond-devnet":"https://devnet.xspotlight.com/",
    "elrond-mainnet":"https://xspotlight.com/",
  },
  gaz_for_transaction:  200000000n,
  gaz_by_nft: 10000000n,
  max_gaz:    600000000n,
  geoloc_interval: 10000,
  accuracy_limit: 50
}
