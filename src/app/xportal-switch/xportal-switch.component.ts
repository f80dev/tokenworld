import {Component, inject, Input} from '@angular/core';
import {DeviceService} from "../device.service";
import {MatButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {walletConnectDeepLink} from "../mvx";
import {$$} from "../../tools";



export function eval_direct_url_xportal(uri:string) : string {
  //voir https://github.com/multiversx/mx-sdk-dapp/blob/03966c45f2e1f12e8f6cbc44b7590d683ac61877/src/constants/network.ts#L57
  //CE qui est envoyé par le wallet : https://xportal.com/?wallet-connect=wc:ce6de4b726ef7c3f60957fb50af0fe61616d7deba376b3e0cdd5aa61bf94be5b@2?expiryTimestamp%3D1745482118&relay-protocol=irn&symKey=993f613b23e71af335be1d3c6b1dca3c442472dcf4f2abe1e4eb0a2ba4e407a0
  //Envoyé pour xpôrtal : https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/?wallet-connect=wc%3Aaeef4e39dde77bc6eb3e3cd5da8fa9f21bc9bb6d607670918ba57ecaf9661080%402%3Frelay-protocol%3Dirn%26symKey%3D84ffabfe27abc6e3b6caf6bc18159d0a5da8790049dcd7015dced107c937a1bc%26expiryTimestamp%3D1745488607
  let url=walletConnectDeepLink+encodeURIComponent("https://xportal.com/?wallet-connect="+uri)
  //let url="https://xportal.com/?wallet-connect="+uri
  $$("url de connexion "+url+" en partant de uri="+uri)
  return url
}

@Component({
  selector: 'app-xportal-switch',
  imports: [
    MatButton,
    NgIf
  ],
  templateUrl: './xportal-switch.component.html',
  standalone: true,
  styleUrl: './xportal-switch.component.css'
})
export class XportalSwitchComponent {

  device=inject(DeviceService)
  @Input() uri=""

  open_xportal() {
    open(eval_direct_url_xportal(this.uri),"xportal")
  }
}
