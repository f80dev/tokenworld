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
    "elrond-devnet":"LIFEPOINT-7f9101",
    "elrond-mainnet":"LIFEPOINT-7f9101"
  },
  max_file_size:50000000,
  shorter_service:"",
  appli:"",
  transfer_page:"https://t.f80.fr",

  //scale_factor:10000000,
  scale_factor:1000,
  translate_factor:100000000000,
  offset_lat:0, //-0.00017,
  offset_lng:0,  //0.00020,
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
      pv:"HP"
    }
  },

  contract_addr:{
    "elrond-devnet":"erd1qqqqqqqqqqqqqpgqlrnzk2elgn4942v7zgjknehyudjtvr8z835s8a4gym",
    "elrond-mainnet":""
  },

  website: "https://f80.fr",
  company:" F80",
  seuil_capture: 0.03,
  max_pv_loading: 1000,
  nft_market: {
    "elrond-devnet":"https://devnet.xspotlight.com/",
    "elrond-mainnet":"https://xspotlight.com/",
  }

}
