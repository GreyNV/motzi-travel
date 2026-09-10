const {createSign,createHash,timingSafeEqual}=require('node:crypto');
const defaults=require('../data/defaults.json');
const configured=()=>!!(process.env.GOOGLE_SHEET_ID&&process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL&&process.env.GOOGLE_PRIVATE_KEY);
let cached;
async function token(){
 if(cached&&cached.expires>Date.now())return cached.value;
 const now=Math.floor(Date.now()/1000), enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
 const input=enc({alg:'RS256',typ:'JWT'})+'.'+enc({iss:process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,scope:'https://www.googleapis.com/auth/spreadsheets',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const signer=createSign('RSA-SHA256');signer.update(input);
 const assertion=input+'.'+signer.sign(process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g,'\n'),'base64url');
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion}),signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error('Google authentication failed');const data=await r.json();cached={value:data.access_token,expires:Date.now()+3300000};return cached.value;
}
async function sheet(range,method='GET',values,append=false){
 if(!configured())throw Error('Google Sheets is not configured');
 const url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(process.env.GOOGLE_SHEET_ID)+'/values/'+encodeURIComponent(range)+(append?':append':'')+(method==='GET'?'':'?valueInputOption=RAW'+(append?'&insertDataOption=INSERT_ROWS':''));
 const r=await fetch(url,{method,headers:{Authorization:'Bearer '+await token(),'Content-Type':'application/json'},body:values?JSON.stringify({values}):undefined,signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error('Google Sheets request failed');return r.json();
}
function validate(x){
 if(!x||!Number.isInteger(x.year)||x.year<2027||x.year>2100)throw Error('Enter a year from 2027 to 2100.');
 const date=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
 if(typeof x.startDate!=='string'||typeof x.endDate!=='string'||(!!x.startDate!==!!x.endDate))throw Error('Set both dates or leave both empty.');
 if(x.startDate&&(!date(x.startDate)||!date(x.endDate)||x.startDate>=x.endDate||+x.startDate.slice(0,4)!==x.year||+x.endDate.slice(0,4)!==x.year))throw Error('Dates must be in the selected year, with departure after arrival.');
 if(typeof x.orderUrl!=='string'||x.orderUrl.length>2000)throw Error('Invalid order URL.');
 if(x.orderUrl){let u;try{u=new URL(x.orderUrl)}catch{}if(!u||u.protocol!=='https:'||u.username||u.password)throw Error('Use a full HTTPS ordering URL.');}
 if(!Array.isArray(x.suites)||x.suites.length!==defaults.suites.length)throw Error('All suites are required.');
 const suites=defaults.suites.map(s=>{const entry=x.suites.find(v=>v.id===s.id);if(!entry||typeof entry.available!=='boolean'||typeof entry.price!=='string'||!entry.price.trim()||entry.price.length>60)throw Error('Every suite needs a price and availability.');return {...s,price:entry.price.trim(),available:entry.available};});
 if(!Array.isArray(x.addons)||x.addons.length!==defaults.addons.length)throw Error('All add-on prices are required.');
 const addons=defaults.addons.map((a,i)=>{const p=x.addons[i]?.p;if(typeof p!=='string'||!p.trim()||p.length>60)throw Error('Invalid add-on price.');return {...a,p:p.trim()};});
 return {year:x.year,startDate:x.startDate,endDate:x.endDate,orderUrl:x.orderUrl.trim(),suites,addons};
}
async function settings(){if(!configured())return defaults;const r=await sheet('Settings!A1');return r.values?.[0]?.[0]?validate(JSON.parse(r.values[0][0])):defaults;}
function authorized(req){const p=process.env.ADMIN_PASSWORD;if(!p||p.length<16)return false;const supplied=(req.headers.authorization||'').replace(/^Bearer /,'');return timingSafeEqual(createHash('sha256').update(p).digest(),createHash('sha256').update(supplied).digest());}
function sameOrigin(req){const o=req.headers.origin;return !o||o===('https://'+req.headers.host)|| (process.env.NODE_ENV!=='production'&&o==='http://'+req.headers.host);}
function body(req){const b=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!b||JSON.stringify(b).length>20000)throw Error('Invalid request.');return b;}
module.exports={defaults,configured,sheet,settings,validate,authorized,sameOrigin,body};
