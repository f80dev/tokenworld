//Version 0.1
import {Component, EventEmitter, Input, OnChanges,  OnInit, Output, SimpleChanges} from '@angular/core';
import {NetworkService} from "../network.service";
import { NativeAuthClient } from "@multiversx/sdk-native-auth-client";
import {$$, isEmail, isLocal, now,  showError, showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../environments/environment";
import {Location, NgIf} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {GoogleSigninButtonModule, SocialAuthService} from "@abacritt/angularx-social-login";
import {Connexion, Operation} from "../../operation";
import {ADDR_ADMIN} from "../../definitions";
import {DeviceService} from "../device.service";
import { WalletConnectV2Provider } from "@multiversx/sdk-wallet-connect-provider";
import { ExtensionProvider } from "@multiversx/sdk-extension-provider";
import {WALLET_PROVIDER_DEVNET, WALLET_PROVIDER_MAINNET, WalletProvider} from "@multiversx/sdk-web-wallet-provider";
import {Socket} from "ngx-socket-io";
import {EvmWalletServiceService} from "../evm-wallet-service.service";
import {_prompt} from "../prompt/prompt.component";
import {MatDialog} from "@angular/material/dialog";
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {MatCard, MatCardTitle} from "@angular/material/card";
import {ScannerComponent} from "../scanner/scanner.component";
import {CdkCopyToClipboard} from "@angular/cdk/clipboard";
import {InputComponent} from "../input/input.component";
import {MatIcon} from "@angular/material/icon";
import {UploadFileComponent} from "../upload-file/upload-file.component";
import {MatButton} from "@angular/material/button";
import {XALIAS_PROVIDER_DEVNET, XALIAS_PROVIDER_MAINNET} from "@multiversx/sdk-web-wallet-provider/out";
import {eval_direct_url_xportal} from "../../crypto";
import {QRCodeComponent} from 'angularx-qrcode';
import {settings} from '../../environments/settings';
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {UserService} from "../user.service";

//Installation de @multiversx/sdk-wallet-connect-provider via yarn add @multiversx/sdk-wallet-connect-provider


enum Wallet_Operation {
  Connect = "connect",
  Logout = "logout",
  SignTransactions = "signTransactions",
  SignMessage = "signMessage",
  CancelAction = "cancelAction",
}

interface IExtensionAccount {
  address: string;
  name?: string;
  signature?: string;
}

@Component({
  selector: 'app-authent',
  templateUrl: './authent.component.html',
  standalone: true,
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatCardTitle,
    MatAccordion,
    QRCodeComponent,
    MatCard,
    ScannerComponent,
    CdkCopyToClipboard,
    InputComponent,
    GoogleSigninButtonModule,
    MatIcon,
    UploadFileComponent,
    NgIf,
    MatButton,
    HourglassComponent,
  ],
  providers: [],
  styleUrls: ['./authent.component.css']
})
export class AuthentComponent implements OnInit,OnChanges {

  account: IExtensionAccount = { address: "" };

  @Input() intro_message:string="";
  @Input() network:string="";
  @Input() connexion:Connexion={
    xAlias: false,
    address: false,
    direct_connect: true,
    email: false,
    extension_wallet: true,
    google: false,
    keystore: false,
    nfluent_wallet_connect: false,
    on_device: false,
    private_key: false,
    wallet_connect: true,
    web_wallet: false,
    webcam: false
  }


  @Input() paiement:{address:string, amount:number,description:string} | undefined;


  @Input() explain_message:string="Adresse de votre wallet ou votre email si vous n'en avez pas encore";
  @Input() autoconnect_for_localhost=false;   //Connection automatique sur le localhost
  @Input() prompt="Votre email ou adresse de wallet";   //Connection automatique sur le localhost

  @Output('authent') onauthent: EventEmitter<{strong:boolean,address:string,provider:any,encrypted:string,url_direct_xportal_connect:string}>=new EventEmitter();
  @Output('invalid') oninvalid: EventEmitter<any>=new EventEmitter();
  @Output('cancel') oncancel: EventEmitter<any>=new EventEmitter();
  @Output('disconnect') onlogout: EventEmitter<any>=new EventEmitter();

  //@Output('init_wallet') init_wallet: EventEmitter<{ provider:any,address:string }>=new EventEmitter();

  @Input() showAccesCode=false;         //Code secret d'accès (réservé)
  @Input() showCancel=false;         //Proposer le bouton d'annulation
  @Input() showWebcam=false;            //utilisation du QRCode dynamique du wallet nFluent
  @Input() showDynamicToken=false;      //Code dynamique utilisable en copié collé (a priori pas d'usage)
  @Input() use_cookie: boolean = false;
  @Input() showGoogle:boolean=false;            //Authentification via Google (pour les personnes souhaitant laissé un mail)
  @Input() showWalletConnect:boolean=false;
  @Input() showWebWallet:boolean=false;
  @Input() showDirectConnect:boolean=true;      //Utilisation pour lancer xPortal sur le device (possible sur Android / IPhone)
  @Input() showExtensionWallet:boolean=false;
  @Input() walletConnect_ProjectId="ea9073e2f07f3d98fea76d4f26f789fe"
  @Input() showAddress=false;
  @Input() showNetwork=false;
  @Input() showPrivateKey=false;
  @Input() showEmail=false;             //Code d'accès envoyé par email
  @Input() showKeystore=false;             //Code d'accès envoyé par email
  @Input() showNfluentWalletConnect=false;
  @Input() address: string="";
  @Input() nfluent_server: string=environment.server;
  @Input() directShowQRCode:boolean=false;      //Propose directement les qrcodes ou laisse l'utilisateur le demander (par défaut)
  @Input() callback: string="";

  strong=false;                     //Niveau d'authentification
  @Input() size="250px";
  @Input() title=""

  qrcode: string="";
  access_code="";

  nfluent_wallet_connect_qrcode="";
  provider: any
  _operation: Operation | undefined;
  private_key="";
  enabled_webcam: boolean=false;

  relayUrl:string = "wss://relay.walletconnect.com";
  qrcode_enabled: boolean = true;
  url_xportal_direct_connect: string="";
  @Input() walletconnect_open=true;
  message: string=""

  constructor(
      public api:NetworkService,
      public _location:Location,
      public socket:Socket,
      public dialog:MatDialog,
      public user:UserService,
      public device:DeviceService,
      public socialAuthService: SocialAuthService,
      public evmwalletservice:EvmWalletServiceService
  ) {
  }


  private toHex(stringToConvert: string) {
    return stringToConvert
        .split('')
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
  }


  refresh(){
    $$("Refresh de l'écran");
    if (this.provider) {
      this.provider.init().then(()=>{
        if(this.showWalletConnect && this.directShowQRCode)this.open_wallet_connect()
      });

      // this.provider.init().then((b: boolean) => {
      //   if (this.provider) {
      //     this.provider.login().then((s: string) => {
      //       this.qrcode = this.api.server_nfluent + "/api/qrcode/" + encodeURIComponent(s);
      //     });
      //   }
      // });

      if (isLocal(settings.appli) && this.showAccesCode && this.autoconnect_for_localhost) {
        this.onauthent.emit({address: ADDR_ADMIN,provider:this.provider,strong:true,encrypted:"",url_direct_xportal_connect:this.url_xportal_direct_connect});
      }
    }


    if(this.showGoogle){
      this.socialAuthService.authState.subscribe((socialUser) => {
        this.strong=true;
        this.onauthent.emit({
          address: socialUser.email,
          provider:this.provider,
          strong:true,
          encrypted:"",
          url_direct_xportal_connect:this.url_xportal_direct_connect});
      },(err)=>{
        $$("Erreur de connexion",err);
      });
    }
  }




  ngOnInit(): void {

    setTimeout(()=>{        //TODO : cet item doit passer dans l'update
      this.api.server_nfluent=this.nfluent_server;


      // if(this.network.indexOf("polygon")>-1){
      // }


      this.address="";
      if(this.use_cookie)this.address=localStorage.getItem("authent_address") || "";

      if(this.connexion){
        this.showPrivateKey=this.connexion.private_key
        this.showWalletConnect=this.connexion.wallet_connect;
        this.showWebWallet=this.connexion.web_wallet
        this.showExtensionWallet=this.connexion.extension_wallet
        this.showKeystore=this.connexion.keystore
        this.showGoogle = this.connexion.google
        this.showWebcam = this.connexion.webcam
        this.showAddress = this.connexion.address
        this.showEmail=this.connexion.email

        this.showNfluentWalletConnect = this.connexion.nfluent_wallet_connect
      }

      this.device.isHandset$.subscribe((r:boolean)=>{
        if(r){
          this.showExtensionWallet=false;
        }
      });


      this.refresh();
      //Création d'un validateur nécéssaire pour le nfluent wallet connect
      let validator_name="val_"+now("rand")
      if(this.connexion.nfluent_wallet_connect && this.socket){
        this.socket.on(validator_name,((data:any) => {
          this.address=data.address;
          this.success()
        }))
      }

      // if(this.operation.length>0){
      //   $$("On utilise "+this.operation+" pour le paramétrage du module");
      //   this.api.get_operations(this.operation).subscribe((ope)=> {
      //     this._operation=ope;
      //     this.showGoogle = ope.validate?.authentification.google || false;
      //     this.showWebcam = ope.validate?.authentification.webcam || false;
      //     this.showAddress = ope.validate?.authentification.address || false;
      //     this.showNfluentWalletConnect = ope.validate?.authentification.nfluent_wallet_connect || false;
      //     this.showWalletConnect=ope.validate?.authentification.wallet_connect || false;
      //     this.showWebWallet=this.showWalletConnect
      //     this.showExtensionWallet=this.showWalletConnect
      //     this.showWalletConnect=ope.validate?.authentification.wallet_connect || false;
      //
      //     this.showEmail = ope.validate?.authentification.email || false;
      //     this.checknft=get_in(ope,"validate.filters.collections",get_in(ope,"validate.collections",[]))
      //     if(this.checknft.length==0){
      //       //Recherche de collection dans les sources
      //       for(let src of ope.data.sources){
      //         this.checknft=get_in(src,"collection",get_in(src,"filter.collection",[]))
      //         if(this.checknft.length>0)break
      //       }
      //       if(this.checknft.length==0){
      //         //Recherche de collection dans le lazy_mining
      //         for(let network of get_in(ope,"lazy_mining.networks",[])){
      //           this.checknft=get_in(network,"collection",[])
      //           if(this.checknft.length>0)break;
      //         }
      //       }
      //     }
      //     this.network=ope.network;
      //     this.refresh();
      //     }
      //   )
      // } else this.refresh();

      if(this.showWalletConnect && !this.showExtensionWallet && !this.showWebWallet){
        setTimeout(()=>{this.open_wallet_connect();},500)
      }
    },500)


  }


  open_wallet() {
    if(this.network.indexOf("elrond")>-1) {
      let callback_url=settings.appli + this._location.path().split("?")[0];
      // let url_wallet=this.network.indexOf("devnet")==-1 ? WALLET_PROVIDER_MAINNET : WALLET_PROVIDER_DEVNET;
      // new WalletProvider(url_wallet).login({
      //   callbackUrl:callback_url
      // }).then((result) => {
      //   this.address = result;
      //   this.strong = true;
      //   this.onauthent.emit({address:this.address,strong:true,nftchecked:false});
      // })
    }
  }


  success(){
    //Se charge de retourner le message d'authentification réussi
    this.onauthent.emit({address:this.address,provider:this.provider,strong:this.strong,encrypted:this.private_key,url_direct_xportal_connect:this.url_xportal_direct_connect})
    if(this._operation && this._operation.validate?.actions.success && this._operation.validate?.actions.success.redirect.length>0)
      open(this._operation.validate.actions.success.redirect);
  }


  validate(address="") {
    if(address.length>0){
      this.address=address;
      //this._location.replaceState("/?"+setParams({toolbar:false,address:this.address,network:this.network}))
      if(this.use_cookie)localStorage.setItem("authent_address",address);
    }

    if(!isEmail(this.address) && !this.api.isElrond(this.address)){
      showMessage(this,"Pour l'instant, Le service n'est compatible qu'avec les adresses mail ou elrond");
    } else {
      if(isEmail(this.address)){
        this.api.create_account(this.network,this.address,"","",{},true).subscribe({
          next:(r:any)=>{
            this.address=r.address
            this.private_key=r.encrypt;
            this.strong=true;
          }
        })
      }else{
        this.success();
      }

    }
  }


  update_address(new_addr:string) {
    this.address=new_addr;
  }


  connect(network: string) {
    if(network=="elrond"){
      // @ts-ignore
      open(this.network.url_wallet(),"walletElrond")
    }

    if(network=="solana"){
      // @ts-ignore
      if(window.solflare || window.phantom){
        // this.solWalletS.connect().then( (wallet:Wallet) => {
        //   this.user.init(wallet).then((profil:any)=>{
        //     // if(requis.length>0){
        //     //   if(profil.perms.indexOf("*")==-1 && profil.perms.indexOf(requis)==-1)
        //     //     this.router.navigate(["faqs"],{queryParams:{"open":"not_authorized"}});
        //     // }
        //     //
        //   });
        // }).catch((err:any) => {
        //   console.log("Error connecting wallet", err );
        //   this.router.navigate(["faqs"],{queryParams:{"open":"not_authorized"}});
        // })
      }
    }

    // if(network=="google"){
    //   let servicePlatform = GoogleLoginProvider.PROVIDER_ID;
    //   this.socialAuthService.signIn(servicePlatform).then((socialUser:any) => {
    //     this.user.email=socialUser.email;
    //     this.user.name=socialUser.firstName + " "+ socialUser.lastName;
    //     this.strong=true;
    //   },(err:any)=>{
    //     $$("Erreur de connexion via google ",err);
    //     showMessage(this,"Problème d'authentification, veuillez saisir manuellement votre email");
    //   })
    // }

    if(network=="code"){
      if(this.access_code && this.access_code.length==8){
        this.api.access_code_checking(this.access_code,this.address).subscribe(()=>{
          this.strong_connect();
        },(err:any)=>{
          showMessage(this,'Code incorrect');
        })
      }
    }

    if(network=="private_key" && this.private_key.split(" ").length>=12){
      this.api.check_private_key(this.private_key,this.address,this.network).subscribe({
        next:(r:any)=>{
          this.address=r.address;
          this.strong_connect();
          },
        error:()=>{showMessage(this,'Phrase incorrecte');}
      })
    }
  }


  onflash($event: {data:string}) {
    //Flash du nfluent_wallet
      if($event.data.length>20){
        let addr=$event.data
        addr=addr.replace("multiversx:","").split("?")[0]
        $$("Lecture de l'adresse "+addr);
        this.api.check_access_code(addr).subscribe((result:any)=>{
          this.address=result.addr;
          this.enabled_webcam=false;
          this.validate();
        },(err:any)=>{
          showMessage(this,"Code incorrect")
        })
      }

  }

  private strong_connect() {
    this.strong=true;
    showMessage(this,"Authentification validée.")
    this.validate()
  }

  update_dynamic_token() {
    navigator.clipboard.readText().then(
        text => {
          this.onflash({data:text});
        }
    ).catch(error => {
              showMessage(this,'Impossible de lire le presse-papier');
            }
        );

  }

  cancel_webcam() {
    showMessage(this,"Webcam arrêtée");
    this.enabled_webcam=false;
  }


  private startBgrMsgChannel(operation: string, connectData: any): Promise<any> {
    //voir https://github.com/multiversx/mx-sdk-js-extension-provider/blob/main/src/extensionProvider.ts
    return new Promise((resolve) => {
      window.postMessage(
        {target: "erdw-inpage",type: operation,data: connectData}, window.origin
      );

      const eventHandler = (event: any) => {
        if (event.isTrusted && event.data.target === "erdw-contentScript") {
          if (event.data.type === "connectResponse") {
            if (event.data.data && Boolean(event.data.data.address)) {
              this.account = event.data.data;
            }
            window.removeEventListener("message", eventHandler);
            resolve(event.data.data);
          } else {
            window.removeEventListener("message", eventHandler);
            resolve(event.data.data);
          }
        }
      };
      window.addEventListener("message", eventHandler, false);
    });
  }

  async createNativeAuthInitialPart() {
    const url=this.network.indexOf("devnet")>-1 ? "https://devnet-api.multiversx.com" : "https://api.multiversx.com"
    const client = new NativeAuthClient({apiUrl: url, expirySeconds: 7200,});
    return client.initialize();
  }

  async open_extension_wallet() {
    //voir https://github.com/multiversx/mx-sdk-js-examples/tree/main/signing-providers
    this.provider=await ExtensionProvider.getInstance();
    try{
      await this.provider.init();
      let wallet=await this.provider.login()  //{ token: await this.createNativeAuthInitialPart() }
      if(wallet.address.length>0){
        this.strong=true;
        this.validate(wallet.address);
      } else {
        this.strong=false;
        this.oninvalid.emit(false);
      }
    } catch (e){
      $$("Impossible de se connecter ",e)
      this.strong=false;
      this.oninvalid.emit(false);
    }
  }
  async open_web_wallet(service="standard"){
    //tag webwallet open_webwallet
    //https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers/#the-web-wallet-provider
    let connexion_mode=this.network.indexOf("devnet")>-1 ? WALLET_PROVIDER_DEVNET : WALLET_PROVIDER_MAINNET
    if(service=="xAlias")connexion_mode=this.network.indexOf("devnet")>-1 ? XALIAS_PROVIDER_DEVNET : XALIAS_PROVIDER_MAINNET
    this.provider=new WalletProvider(connexion_mode)
    this.provider.redirectDelayMilliseconds=30000

    const callback_url = this.callback=="" ? encodeURIComponent(this._location.path(true)) : encodeURIComponent(this.callback)
    try{
      let address=await this.provider.login({callback_url,token:await this.createNativeAuthInitialPart()})
      this.strong=address.length>0;
      if(this.strong){
        this.validate(address);
      } else {
        this.oninvalid.emit(false);
      }

      //this.validate(this.provider.account.address);

      $$("Connexion web wallet ok "+address)

    } catch (e) {
      this.strong=false;
      this.oninvalid.emit(false)
    }
  }

  async open_wallet_connect() {
    //https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers/#the-wallet-connect-provider

    const callbacks:any ={
      onClientLogin: async ()=> {
        $$("Connexion wallet connect ")
        this.address=await this.provider.getAddress();
        },
      onClientLogout: ()=> {
        $$("Déconnexion de wallet connect")
      },
    }
    this.provider = new WalletConnectV2Provider(callbacks, this.user.get_chain_id(), this.relayUrl, this.walletConnect_ProjectId);

    try{
      wait_message(this,"Connexion")
      await this.provider.init()
      const { uri, approval } = await this.provider.connect();
      this.qrcode=uri
      wait_message(this)
      //this.qrcode=this.api.server_nfluent+"/api/qrcode/"+encodeURIComponent(uri);

      this.url_xportal_direct_connect=eval_direct_url_xportal(uri)
      let address=await this.provider.login({approval});
      if(address){
        //this.init_wallet.emit({provider:this.provider,address:this.address});
        this.strong=true;
        this.validate(address);
      } else {
        this.oncancel.emit();
      }
    }catch (e){
      showError(this,"Impossible d'utiliser wallet connect pour l'instant. Utiliser une autre méthode pour accéder à votre wallet")
    }



  }

  async open_polygon_extension_wallet() {
    //Voir https://medium.com/upstate-interactive/how-to-connect-an-angular-application-to-a-smart-contract-using-web3js-f83689fb6909
    let r=await this.evmwalletservice.connectWallet()
    if(this.address!="")this.success();
  }

  open_xportal() {
    open(this.url_xportal_direct_connect)
  }

  cancel() {
    this.address="";
    this.oncancel.emit()
  }

  active_webcam() {
    this.enabled_webcam=true;
    this.nfluent_wallet_connect_qrcode='';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.network.indexOf("polygon")>-1){
      this.evmwalletservice.checkWalletConnected().then((accounts:any[])=>{
        this.address=accounts[0]
        this.strong=true;
      })
    }

    if(this.showWalletConnect && !this.showWebWallet && !this.showExtensionWallet){
      if(this.network.indexOf("elrond")>-1)this.open_wallet_connect();

    }
  }

  async upload_keystore($event: any) {
    let password=await _prompt(this,"Mot de passe du keystore","","","text","ok","annuler",false)
    this.api.encrypte_key("",this.network,"","",password,$event.file).subscribe({
      next:(r:any)=>{
        this.strong=true;
        this.address=r.address;
        this.private_key=r.encrypt;
        this.success();
      }
    })
  }

    run_scanner() {
      this.enabled_webcam=true;
    }

  on_retreive_address($event: any) {
    this.address=$event.data;
    this.enabled_webcam=false;
    this.strong=false;
    this.validate(this.address)
  }
}
