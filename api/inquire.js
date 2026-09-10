const {sheet,settings,sameOrigin,body}=require('../lib/store');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!sameOrigin(req))return res.status(403).json({error:'Invalid origin'});
 let d;try{d=body(req);}catch{return res.status(400).json({error:'Invalid request'});}
 if(d.website)return res.status(400).json({error:'Invalid submission'});
 const fields=['name','email','phone','suite','guests','addon','message'];
 if(fields.some(k=>d[k]!==undefined&&(typeof d[k]!=='string'||d[k].length>(k==='message'?4000:300)))||!d.name?.trim()||!/^\S+@\S+\.\S+$/.test(d.email||'')||(d.guests&&(!/^\d+$/.test(d.guests)||+d.guests<1||+d.guests>6)))return res.status(400).json({error:'Check your name, email, and party size.'});
 try{
 const config=await settings();
 await sheet('Inquiries!A:L','POST',[[new Date().toISOString(),...fields.map(k=>d[k]?.trim()||''),d.marketingConsent==='on'?'Yes':'No',String(config.year),config.startDate,config.endDate]],true);
 return res.status(200).json({ok:true});
 }catch{return res.status(503).json({error:'Inquiry was not saved. Please try again or call (201) 614-7732.'});}
};
