import {environment} from "./environments/environment";
import {ActivatedRoute} from "@angular/router";
import {Clipboard} from "@angular/cdk/clipboard";


export interface CryptoKey {
  name: string | null
  address: string
  secret_key:string | null
  encrypt:string | undefined
  balance:number | null
  qrcode:string | null
  explorer:string | null
  unity:string | null
}

export function newCryptoKey(address="",name="",privateKey="",encrypted:string | undefined=undefined) : CryptoKey {
  let rc:CryptoKey= {
    explorer:null, qrcode: "", unity: "",
    name:name,
    address:address,
    secret_key:privateKey,
    encrypt:encrypted,
    balance:null
  }
  return rc
}


export function bytesToInt(bytes: number[]): number {
  let value = 0;
  for (let i = 0; i < bytes.length; i++) {
    value += bytes[i] << (i * 8);
  }
  return value;
}



export function parseFrenchDate(dateString: string): Date | null {
  let _time=dateString.indexOf(" ")>-1 ? dateString.split(" ")[1] : "00:00:00"

  const dateParts = dateString.split(" ")[0].split('/');

  if (dateParts.length !== 3) {
    console.error('Invalid date format');
    return null;
  }

  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Months are zero-based in JavaScript
  const year = parseInt(dateParts[2], 10);

  const hour=parseInt(_time.split(":")[0])
  const minute=parseInt(_time.split(":")[1])
  const sec=parseInt(_time.split(":")[2])

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error('Invalid date components');
    return null;
  }

  return new Date(year, month, day,hour,minute,sec);
}





export function hashCode(s:string):number {
  var hash = 0,
    i, chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}


export function b64DecodeUnicode(s:string):string {
  return decodeURIComponent(Array.prototype.map.call(atob(s), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}



export function encodeUnicode(str:string) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode(Number('0x' + p1));
    }));
}


export function encrypt(s:string) : string {
  //TODO fonction a terminer
  return btoa(s);
}



export function getBrowserName() {
  const agent = window.navigator.userAgent.toLowerCase()
  switch (true) {
    case agent.indexOf('edge') > -1:
      return 'edge';
    case agent.indexOf('opr') > -1 && !!(<any>window).opr:
      return 'opera';
    case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
      return 'chrome';
    case agent.indexOf('trident') > -1:
      return 'ie';
    case agent.indexOf('firefox') > -1:
      return 'firefox';
    case agent.indexOf('safari') > -1:
      return 'safari';
    default:
      return 'other';
  }
}


export function setParams(_d:any,prefix="",param_name="p",domain="") : string {
  //Encryptage des parametres de l'url
  //Version 1.0
  let rc=[];
  _d=JSON.parse(JSON.stringify(_d))
  for(let k of Object.keys(_d)){
    if(typeof(_d[k])=="object")_d[k]="b64:"+btoa(JSON.stringify(_d[k]));
    rc.push(k+"="+encodeURIComponent(_d[k]));
  }
  let url=encrypt(prefix+rc.join("&"));
  if(domain!=""){
    if(domain.indexOf("?")>-1){
      domain=domain+"&"
    }else{
      domain=domain+"?"
    }
  }
  if(param_name!="")
    return domain+param_name+"="+encodeURIComponent(url);
  else
    return domain+encodeURIComponent(url);
}

export function enterFullScreen(element:any) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  }else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();     // Firefox
  }else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();  // Safari
  }else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();      // IE/Edge
  }
};


export function analyse_params(params:string):any {
  let _params=decrypt(decodeURIComponent(params)).split("&");
  $$("Les paramètres à analyser sont "+_params);
  let rc:any={};
  for(let _param of _params) {
    let key = _param.split("=")[0];
    let value: any = decodeURIComponent(_param.split("=")[1]);

    $$("Récupération de " + _param);
    if (value.startsWith("b64:")) {
      try {
        value = JSON.parse(atob(value.replace("b64:", "")));
      } catch (e) {
        $$("!Impossible de parser le paramétrage");
      }
    }
    if (value == "false") value = false;
    if (value == "true") value = true;
    rc[key] = value;

    if(key=="params_file"){
      fetch(environment.server+"/api/yaml/?file="+value).then((content:any)=>{
        debugger
      })
    }

  }
  return rc;
}

export function now(format="number",offset_in_sec=0) : any {
  let d=new Date(new Date().getTime()+offset_in_sec*1000);
  let rc=new Date().getTime();
  if(format=="date")return d.toLocaleDateString();
  if(format=="time")return d.toLocaleTimeString();
  if(format=="datetime")return d.toLocaleString();
  if(format=="rand")return (Math.random()*10000).toString(16);
  if(format=="hex")return rc.toString(16);
  if(format=="dec" || format=="str")return rc.toString();
  return rc
}


export function exportToCsv(filename: string, rows: object[],separator=";",cr="\n",text_sep="'") {
  if (!rows || !rows.length) {
    return;
  }
  const keys = Object.keys(rows[0]);
  const csvContent =
      keys.join(separator) +
      cr +
      rows.map((row:any) => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date
              ? cell.toLocaleString()
              : text_sep+cell.toString().replace(/"/g, '""')+text_sep;
          if (cell.search(/("|"+separator"+|"+cr+")/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

      download_file(csvContent,filename)
}


//tag #save_file save local
export function download_file(content:string,filename:string,_type='text/csv;charset=utf-8;'){
  const blob = new Blob([content], { type: _type });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


function drawRotated(canvas:any, image:any, degrees:any) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(degrees * Math.PI / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.restore();
}


export function showIosInstallModal(localStorageKey: string="ios_install"): boolean {
  // detect if the device is on iOS
  //voir https://medium.com/ngconf/installing-your-pwa-on-ios-d1c497968e62
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  // check if the device is in standalone mode
  const isInStandaloneMode = () => {
    return (
        "standalone" in (window as any).navigator &&
        (window as any).navigator.standalone
    );
  };


  // show the modal only once
  const localStorageKeyValue = localStorage.getItem(localStorageKey);
  const iosInstallModalShown = localStorageKeyValue
      ? JSON.parse(localStorageKeyValue)
      : false;
  const shouldShowModalResponse =
      isIos() && !isInStandaloneMode() && !iosInstallModalShown;
  if (shouldShowModalResponse) {
    localStorage.setItem(localStorageKey, "true");
  }
  return shouldShowModalResponse;
}


/**
 *
 * @param src
 * @param angle
 * @param quality
 * @param func
 */
export function rotate(src: string, angle: number, quality: number=1) : Promise<string> {
  return new Promise((resolve) => {
    if (angle == 0)
      resolve(src);
    else {
      var img = new Image();
      img.onload = function() {
        var canvas:any = document.createElement('canvas');
        canvas.width = img.height;
        canvas.height = img.width;
        drawRotated(canvas, this, angle);
        var rc = canvas.toDataURL("image/jpeg", quality);
        resolve(rc);
      };
      img.src = src;
    }
  });
}

export function get_images_from_banks(vm:any,prompt_function:Function,api:any,sample:string="",sticker:boolean=false,max=20) : Promise<any[]> {
  //Permet de récupérer des images depuis internet
  //la fenetre appelante doit contenir une déclaration dialog:MatDialog
  return new Promise(async (resolve) => {
    if(vm && api){
      let rc:any[]=[]
      let query=await prompt_function(vm,"Recherche d'images",sample,
          "Votre requête en quelques mots en ANGLAIS de préférence (ajouter 'sticker' pour des images transparentes)",
          "text",
          "Rechercher",
          "Annuler",false);

      if(sticker){query=query+" sticker"}
      api.search_images(query,sticker).subscribe(async (r:any)=>{
        let message=max>1 ? "Sélectionez une ou plusieurs images" : "Sélectionez une image";
        let images=await prompt_function(vm,message,"","","images","Sélectionner","Annuler",false,r.images,false,max)
        let idx=0
        for(let link of images){
          rc.push({image:link,name:"bank_"+now("rand")+"_"+idx,ext:"image/jpg"});
          idx=idx+1
        }
        resolve(rc)
      })
    }

  })
}


export function deleteAllCookies() {
  var cookies = document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf('=');
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }
}

export function apply_params(vm:any,params:any,env:any={}){
  for(let prop of ["intro","duration_intro","duration","claim","title","appname","background","visual","new_account_mail","existing_account_mail","website","cgu","contact","company","logo"]){
    if(vm.hasOwnProperty(prop))vm[prop]=params[prop] || env[prop] || "";
  }

  if(vm.hasOwnProperty("network")){
    if(typeof vm.network=="string")vm.network = params.network || env.network || "elrond-devnet"
  }
  if(params.hasOwnProperty("advanced_mode"))vm.advanced_mode=(params.advanced_mode=='true');

  if(vm.hasOwnProperty("device")){
    vm.device.setTitle(params.appname);
    if(params.favicon)vm.device.setFavicon(params.favicon || "favicon.ico");
  }

  let style=params.style || env.style;
  if(style && vm.hasOwnProperty("style")){
    vm.style.setStyle("theme","./"+style);
  }
  if(vm.hasOwnProperty("miner") && (params.miner || env.miner)){
    vm.miner = newCryptoKey("","","",params.miner || env.miner)
  }

  if(vm.hasOwnProperty("user")){
    vm.user.params = params;
    if(params.hasOwnProperty("toolbar")){
      vm.user.toolbar_visible=(params["toolbar"]=="true")
    }
    $$("Conservation des paramètres dans le service user")
  }
}


export function isURL(s:string,need_http=false):boolean {
  if(!s || s=='')return false;
  if(s.indexOf(".")==-1)return false;
  let ext=s.split('.')[1].trim()
  if(ext.length<2)return false;
  if(!need_http)return true;
  if(s.indexOf("http://")==0 || s.indexOf("https://")==0)return true;
  return false;
}

export function getParams(routes:ActivatedRoute,local_setting_params="",force_treatment=false) {
  //Decryptage des parametres de l'url
  //Version 1.0
  return new Promise((resolve, reject) => {

      routes.queryParams.subscribe({next:(ps:any) => {
        if(ps==null && local_setting_params.length>0){
          ps=localStorage.getItem(local_setting_params)
        }

        if(ps){
          if(ps.hasOwnProperty("b")){
            let rc=JSON.parse(decrypt(ps.b))
            $$("Lecture des paramètres ",rc)
            resolve(rc)
          }
          if(ps.hasOwnProperty("p")){
            let temp:any=analyse_params(decodeURIComponent(ps["p"]));
            for(let k of Object.keys(ps)){
              if(k!="p"){
                temp[k]=ps[k];
              }
            }
            ps=temp;
            $$("Analyse des paramètres par la fenetre principale ", ps);
          }
        }

        if(!ps) {
          if (force_treatment) {resolve({})}else{reject()}
        }else{
          if(local_setting_params.length>0)localStorage.setItem(local_setting_params,ps["p"]);
          resolve(ps);
        }
      },error:(err)=>{
        $$("!Impossible d'analyser les parametres de l'url");
        reject(err);
      }})
  });
}

export function decrypt(s:string | any) : string {
  if(s){
    try{
      return atob(s);
    }catch (e){
      $$("Impossible de décoder les paramètres ",s)
    }

  }
  return "";
}


export function toStringify(obj:any) {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value // return everything else unchanged
  );
}

export function syntaxHighlight(json:any) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match:any)=> {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}


// @ts-ignore
/**
 * Affichage du message
 * @param vm
 * @param s
 * @param duration
 * @param func
 * @param label_button
 */
export function showMessage(vm:any,s:string="",duration=4000,func:any= null,label_button="ok"){
  if(s==null || s.length==0)return false;
  s=s+"";
  $$("Affichage du message :",s)
  if(s.startsWith("#")){
    //Affichage en mode plein écran
    s=s.substring(1);
    vm.message=s;
    if(s.length>0)setTimeout(()=>{vm.showMessage=true;},500);
  } else {
    //Affichage en mode toaster
    if(vm){
      var toaster=vm.toast || vm.snackBar || vm.toaster;
      if(toaster!=null){
        if(func){
          toaster.open(s,label_button,{duration:duration}).onAction().subscribe(()=>{
            func();
          });
        }
        else
          toaster.open(s,"",{duration:duration});
      }
    }
  }
  return true;
}

export function isLocal(domain:string) : boolean {
  return(domain.indexOf("localhost")>-1 || domain.indexOf("127.0.0.1")>-1);
}


export function normalize(s:string) : string {
  return s.toLowerCase().replace(" ","").split(".")[0]
}


export function words(objs:any,rc=""){
  if(!objs)return rc;
  for(let it of Object.values(objs)) {
    while(typeof it=="object"){
      // @ts-ignore
      it=Object.values(it).join(" ").toLowerCase();
    }
    rc=rc+it+" ";
  }
  return rc;
}

export function hasWebcam(result:boolean) {
  navigator.mediaDevices.enumerateDevices().then((devices:any)=>{
    result=false;
    for(let device of devices)
      if(device.kind=="videoinput")result=true;
  })
}


export function showError(vm:any,err:any=null){
  $$("!Error ",err.message);
  if(vm && vm.hasOwnProperty("message"))vm.message="";
  let mes="Oops, un petit problème technique. Veuillez recommencer l'opération";
  if(err && err.hasOwnProperty("error"))mes=err.error;
  showMessage(vm,mes);
}

export function base64ToArrayBuffer(base64:string) : ArrayBuffer {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}


export function $$(s: string, obj: any= null) {
  console.log("");
  if(environment.production)return;
  if((s!=null && s.startsWith("!"))){
    //debugger
  }
  const lg = new Date().getHours() + ':' + new Date().getMinutes() + ' -> ' + s;
  if (obj != null) {
    obj = JSON.stringify(obj).replace(",",",\n");
  } else {
    obj = '';
  }
  console.log(lg + ' ' + obj);
  if (lg.indexOf('!!') > -1) {alert(lg); }
}


export function copyAchievements(clp:Clipboard,to_copy:string) {
  return new Promise((resolve, reject) => {
    const pending = clp.beginCopy(to_copy);
    let remainingAttempts = 3;
    const attempt = () => {
      const result = pending.copy();
      if (!result && --remainingAttempts) {
        setTimeout(()=>{
          resolve(true);
        });
      } else {
        // Remember to destroy when you're done!
        pending.destroy();
      }
    };
  });

}



export function find(liste:any[],elt_to_search:any,index_name:any=0){
  let rc=0;
  for(let item of liste){
    if(typeof elt_to_search=="object") {
      if (item[index_name] == elt_to_search[index_name]) return rc;
    } else {
      if(item[index_name]==elt_to_search) return rc;
    }
    rc=rc+1;
  }
  return -1;
}

//Alias find_network et get_network
export function detect_network(addr:string) : string {
  if(addr.length<20 || addr.indexOf("@")>-1)return "";
  if(addr.startsWith("erd"))return "elrond";
  if(addr.length>50 && addr.endsWith("="))return "access_code";
  return "solana";
}

export function create_manifest_for_webapp_install(content:any,document:any,icon_path="",icon_size=""){
  //see https://medium.com/@alshakero/how-to-setup-your-web-app-manifest-dynamically-using-javascript-f7fbee899a61

  if(icon_path!="" && icon_size!=""){
    if(!content["icons"])content["icons"]=[]
    for(let size of icon_size.split(",")){
      content["icons"].push({
        "src": icon_path.replace("%%",size),
        "sizes": size+"x"+size,
        "type": "image/png"
      })
    }
  }
  if(!content.hasOwnProperty("display"))content["display"]="standalone"
  if(!content.hasOwnProperty("short_name"))content["short_name"]=content["name"]
  if(!content.hasOwnProperty("scope"))content["scope"]="./"
  if(!content.hasOwnProperty("start_url"))content["start_url"]="./"


  const stringManifest = JSON.stringify(content);
  const blob = new Blob([stringManifest], {type: 'application/json'});
  const manifestURL = URL.createObjectURL(blob);
  document.querySelector('#my-manifest-placeholder').setAttribute('href', manifestURL);
}


export function detect_type_network(network:string){
  if(network.indexOf("devnet")>-1)return "devnet";
  if(network.toLowerCase().indexOf(" test")>-1)return "devnet";
  return "mainnet";
}

export function jsonToList(obj:any):string {
  let rc="<ul>";
  for(let k of Object.keys(obj)){
    rc=rc+"<li><strong>"+k+"</strong>: "+obj[k]+"</li>"
  }
  return rc+"</ul>";
}


export function isEmail(addr="") {
  if(!addr)return false;
  const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return expression.test(addr);
}



export interface Bank {
  miner:CryptoKey
  refund: number  //Montant de rechargement
  title: string
  network: string
  token: string
  collection:string
  limit:number //Limit de rechargement par jour
  wallet_limit: number
  histo: string //Base de données de stockage de l'historique des transactions
}


export function convert_to_list(text:string="",separator=",",labelandvalue=false) : any[] {
  if(!text)return [];
  if(typeof text!="string")return text;
  text=text.trim()
  if(text.length==0)return [];
  let rc:any[]=text.split(",")
  if(labelandvalue){
    rc=[]
    for(let t of text.split(","))
      rc.push({label:t,value:t})
  }
  return rc
}
