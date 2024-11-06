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
  token: "NFLUCOIN-4921ed",
  max_file_size:50000000,
  shorter_service:"",
  appli:"",
  transfer_page:"https://t.f80.fr",
  scale_factor:1,

  render_server: "https://api.f80.fr:9876",
  fee: 0,
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
    fr:{
      scale:{label:"Dimension de l'image produite",complexity:0},
      device:{label:"Matériel",complexity:1},
      inference:{label:"Nombre d'itération",complexity:0},
      model:{label:"Model neuronal",complexity:1},
      precision:{label:"Précision des calculs",complexity:1}
    }
  },

  contract_addr:{
    "elrond-devnet":"erd1qqqqqqqqqqqqqpgqp02ze98mfjtwxdy7d6mvuegjuk2r4ark835srncrlh",
    "elrond-mainnet":""
  },

  website: "https://f80.fr",
  company:" F80"

}
