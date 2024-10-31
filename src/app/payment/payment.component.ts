import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input, OnDestroy,
  Output
} from '@angular/core';
import {
  Transaction,
  TokenTransfer,
  TransactionPayload,
  Address,
  TransferTransactionsFactory, GasEstimator
} from "@multiversx/sdk-core/out";
import {WalletConnectV2Provider} from "@multiversx/sdk-wallet-connect-provider/out";
import {NetworkService} from "../network.service";
import {$$, Bank, now, setParams, showError, showMessage} from "../../tools";
import { Account } from "@multiversx/sdk-core";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers";
import {_prompt} from "../prompt/prompt.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {GooglePayButtonModule, ReadyToPayChangeResponse} from "@google-pay/button-angular";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {DeviceService} from "../device.service";
import {DecimalPipe, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {eval_direct_url_xportal} from "../../crypto";

export interface PaymentTransaction {
  transaction:string ,
  price:number,
  ts:string,
  address:string,
  billing_to:string,
  unity:string,
  provider:any
}

//Interface incluant le paiement en fiat et le paiement crypto
export interface Merchant {
  id:string
  name:string
  currency:string
  country:string
  contact: string
  wallet:{
    network:string,
    address:string,
    token:string,
    unity:string
  } | undefined
}

export function extract_merchant_from_param(params:any) : Merchant | undefined {
  if(params["merchant.name"]){
    return {
      contact: params["merchant.contact"],
      country: params["merchant.country"],
      currency: params["merchant.currency"],
      id: params["merchant.id"],
      name: params["merchant.name"],
      wallet: {
        network:params["merchant.wallet.network"],
        address:params["merchant.wallet.address"],
        token:params["merchant.wallet.token"],
        unity:params["merchant.wallet.unity"]
      }
    }
  } else return undefined;

}

@Component({
  selector: 'app-payment',
  standalone:true,
    imports: [
        HourglassComponent,
        DecimalPipe,
        MatIcon, NgIf,
        GooglePayButtonModule, MatButton
    ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements AfterContentInit,OnDestroy {
  payment_request: any;

  money: { name: string, supply: number, id: string, unity: string,decimals:number } | undefined;
  @Input() price: number = 0
  @Input() fiat_price: number=0;
  @Input() billing_to: string="";
  @Input() bank:Bank | string | undefined;
  @Input() merchant: Merchant | undefined
  @Output('paid') onpaid: EventEmitter<PaymentTransaction>=new EventEmitter();
  @Output('cancel') oncancel: EventEmitter<any> =new EventEmitter();
  @Input() user: string = ""
  @Input() buy_method: "fiat" | "crypto" | "" = "";
  @Input() wallet_provider: WalletConnectV2Provider | any

  qrcode: string="";
  balance:{balance:number,egld:number}={balance:-1,egld:0}
  qrcode_buy_token: string = "";
  handle: NodeJS.Timeout | undefined

  @Input() url_direct_to_xportal: string=""
  show_url_to_xportal=false

  constructor(
      public device:DeviceService,
      public networkService: NetworkService,
      public toast:MatSnackBar,
      public dialog:MatDialog
  ) {
  }

  ngOnDestroy(): void {
        if(this.handle)clearInterval(this.handle);
    }

  ngAfterContentInit(): void {
    this.refresh();
  }

  refresh(){
    let network=this.merchant?.wallet!.network!
    let token=this.merchant?.wallet?.token || "egld"
    this.networkService.get_token(token,network).subscribe({
      next:async (money:any)=>{
        this.money=money
        if(this.wallet_provider && this.wallet_provider.account){
          this.user=this.wallet_provider.account.address;
          this.show_user_balance(this.user,token,network)
        }
      },
      error:(err:any)=>{
        this.money=undefined
        showError(this,err)
      }
    })

    if(this.merchant) {
      this.payment_request = {
        apiVersion: 2, apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'], allowedCardNetworks: ['VISA', 'MASTERCARD']},
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId'}
          }
        }],
        merchantInfo: {merchantId: this.merchant.id, merchantName: this.merchant.name},
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: this.fiat_price.toString(),
          currencyCode: this.merchant.currency,
          countryCode: this.merchant.country
        }
      }
    }
  }

  async show_user_balance(addr:string,token_id:string,network:string){
    try{
      wait_message(this,"Calcul de votre encours")
      debugger
      this.balance=await this.get_balance(addr,token_id,network) ///(10**this.money!.decimals);
      wait_message(this)
      if(Number(this.price)>this.balance.balance || this.balance.egld<0.001){
        if(this.balance.egld<0.001)showMessage(this,"Vous devez avoir quelques fractions d'egld pour les frais de services")
        this.networkService.qrcode(addr,"json").subscribe((r:any)=>{
          this.qrcode_buy_token=r.qrcode;
        })
      }else{
        if(this.handle)clearInterval(this.handle);
        this.qrcode_buy_token="";
      }
    }catch (e){
      showMessage(this,"Impossible de récupérer votre encours");
    }
  }

  ngOnChanges(changes: any): void {
    if(changes.user.currentValue && this.money){
      this.show_user_balance(changes.user.currentValue,this.money!.id,this.merchant?.wallet?.network!)
    }
  }

  onReadyToPayChange = (event: CustomEvent<ReadyToPayChangeResponse>): void => {
    console.log('ready to pay change', event.detail);
  };

  onClickPreventDefault = (event: Event): void => {
    console.log('prevent default');
  };


  onLoadPaymentData = (event: google.payments.api.PaymentData): void => {
      let unity="EUR"
      if(this.money)unity=this.money.unity
      let rc:PaymentTransaction={
        transaction:event.paymentMethodData.description || "",
        unity:unity,
        address:event.paymentMethodData.description || "",
        price:0,
        ts:now("str"),
        billing_to:this.billing_to,
        provider:null
      }
      this.onpaid.emit(rc);

  };

  // onPaymentDataAuthorized: google.payments.api.PaymentAuthorizedHandler = paymentData => {
  //   console.log('payment authorized', paymentData);
  //   return {
  //     transactionState: 'SUCCESS',
  //   };
  // };
  message="";
  modal=true;



  error_fiat_event(event: ErrorEvent): void {
    console.error('error', event.error);
  }

  async start_payment(amount:number){
    try{
      this.show_url_to_xportal=true
      this.url_direct_to_xportal=eval_direct_url_xportal("")
      let result=await this.payment(amount);
      this.show_url_to_xportal=false
      this.onpaid.emit(result);
    } catch(e) {
      showMessage(this,"Paiement annulé");
    }
  }

  async payment(amount=0.001) : Promise<any>{
    //
    return new Promise( async(resolve,reject) => {
      let unity="EUR"
      if(this.wallet_provider){
        unity=this.money!.unity
        let sender_addr=this.wallet_provider.address || this.wallet_provider.account.address;
        $$("Paiement avec l'adresse "+sender_addr)
        //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook/
        let payment={
          address:this.merchant?.wallet!.address,
          amount:amount,
          description:'paiement pour signature'
        }
        let prefix=this.merchant && this.merchant.wallet && this.merchant.wallet.network.indexOf("devnet")>-1 ? "devnet-" : ""
        const proxyNetworkProvider = new ProxyNetworkProvider("https://"+prefix+"gateway.multiversx.com");
        let t:Transaction;
        if(unity=="egld"){
          let opt={
            data:new TransactionPayload("Paiement"),
            value:TokenTransfer.egldFromAmount(payment.amount),
            gasLimit: 200000,
            sender: Address.fromBech32(sender_addr),
            receiver: Address.fromBech32(this.merchant!.wallet!.address),
            chainID: prefix.length>0 ? "D" : "1"
          }
          t=new Transaction(opt);

        }else{

          wait_message(this,"Initialisation du paiement",true)
          const factory = new TransferTransactionsFactory(new GasEstimator());

          //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook#token-transfers
          t=factory.createESDTTransfer({
            tokenTransfer: TokenTransfer.fungibleFromAmount(this.money!.id,Number(this.price),this.money!.decimals),
            sender: Address.fromBech32(sender_addr),
            receiver: Address.fromBech32(this.merchant?.wallet!.address!),
            chainID: prefix.length>0 ? "D" : "1"
          })
        }
        let sender_account=new Account(Address.fromBech32(sender_addr));

        try {
          let sender_on_network=await proxyNetworkProvider.getAccount(sender_account.address)
          sender_account.update(sender_on_network)
          t.setNonce(sender_account.getNonceThenIncrement());

          this.show_url_to_xportal=true
          wait_message(this,"En attente de validation sur votre wallet")
          let sign_transaction=await this.wallet_provider.signTransaction(t);
          wait_message(this,"Envoi de la transaction")
          let hash=await proxyNetworkProvider.sendTransaction(sign_transaction);
          wait_message(this);
          resolve({
            transaction:hash,
            price:this.price,
            ts:now("str"),
            address:sender_addr,
            billing_to:this.billing_to,
            unity:unity,
            provider:this.wallet_provider});
        } catch(error) {
          wait_message(this);
          $$("Error",error)
          reject(error)
        }
      }
      reject("no provider");
    });

  }


  async get_balance(addr:string,token_id:string,network:string) : Promise<any> {
    return new Promise((resolve,reject) => {
      if(addr.length>0 && network.length>0 && token_id.length>0){
        this.networkService.getBalance(addr,network,token_id).subscribe((r:any)=>{
          for(let owner of r){
            if(owner.address==addr)resolve({balance:owner.balance,egld:owner.egld_balance});
          }
          resolve(0);
        },(err:any)=>{reject();})
      }
    });
  }


  async change_billing_address() {
    let email=await _prompt(this,"Adresse de réception de la facture",this.billing_to,"","text","Valider","Annuler",false);
    if(email)this.billing_to=email;
  }

  change_payment_mode() {
    this.buy_method="";
    this.wallet_provider=null;
    this.user="";
    this.oncancel.emit(null);
  }


  get_address(){
    return this.wallet_provider.address || this.wallet_provider.account.address;
  }


  refresh_solde() {
    this.show_user_balance(this.get_address(),this.money!.id,this.merchant?.wallet?.network!)

  }


  cancel_fiat_payment() {
    this.change_payment_mode();
  }

  open_bank() {
    let url="";
    if(!this.bank)return;
    if(this.bank.toString().startsWith("http")){
      url=this.bank.toString();
    } else {
      url="https://tokenforge.nfluent.io/bank?";
      let claim="Acquérir des "+this.money!.unity+" en quelques clics"
      url=url+setParams({
        address :this.get_address(),
        merchant:this.merchant,
        bank:this.bank,
        claim: claim,
        toolbar :false,
        appname:"The "+this.money!.unity+" bank",
        style:"nfluent-dark.css",
        visual:"https://nfluent.io/assets/bank.avif",
        background:"https://nfluent.io/assets/cash_machine.jpg"
      })
    }
    open(url,"bank")
    this.handle=setInterval(()=>{this.refresh_solde()},20000);
  }

  open_xportal() {
    open(this.url_direct_to_xportal,"xportal")
  }
}
