import {Bank, detect_network, isEmail, newCryptoKey} from "./tools";

export function url_wallet(network:string) : string {
    if(network.indexOf("elrond")>-1){
        return network.indexOf("devnet")==-1 ? "https://wallet.elrond.com" : "https://devnet-wallet.elrond.com";
    } else {
        return "";
    }
}

export function eval_direct_url_xportal(uri:string) : string {
    let rc="https://xportal.com/?wallet-connect="+uri; //"+this.provider.?relay-protocol%3Dirn&symKey=2a0e80dd8b982dac05eef5ce071fbe541d390fc302666d09856ae379416bfa6e"
    return "https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link="+encodeURIComponent(rc);
}


export function removeBigInt(obj:any) {
    Object.keys(obj).map((key:any, index:any) =>
        typeof obj[key] === 'bigint'
            ? obj[key] .toString()
            : obj[key]  // return everything else unchanged
    );

    return obj;
}

export function find_miner_from_operation(operation:any,addr:string) : any {
    let to_network=isEmail(addr) ? operation.mining?.networks[0].network : detect_network(addr);  //Si l'adresse est email on prend la première source du mining
    for(let n of operation.mining!.networks){
        if(n.network.startsWith(to_network)){
            return n;
        }
    }
    return {}
}



export function getNetworks(name:string="elrond"): any[] {
    let rc=[]
    if(name.indexOf("elrond")>-1 || name.indexOf("multiversx")>-1) {
        rc.push({label:"MultiversX Test",value:"elrond-devnet"})
        rc.push({label:"MultiversX",value:"elrond-mainnet"})
        rc.push({label:"MultiversX Test 2",value:"elrond-devnet2"})
    }
    return rc;
}



export function getWalletUrl(network="elrond"): string {
    if(network.indexOf("elrond")>-1){
        let _type=network.split("-")[1]+"-"
        if(_type=="mainnet-")_type=""
        return "https://"+_type+"wallet.multiversx.com"
    }
    return ""
}



export function extract_bank_from_param(params:any) : Bank | undefined {
    if(params && params["bank.miner"] && params["bank.token"]){
        return {
            miner: newCryptoKey("","","",params["bank.miner"]),
            network: params["bank.network"],
            refund: params["bank.refund"],
            title: params["bank.title"],
            token: params["bank.token"],
            wallet_limit:params["bank.wallet_limit"],
            limit: params["bank.limit"],
            histo:params["bank.histo"],
            collection:params["bank.collection"]
        }
    }

    return undefined;
}
