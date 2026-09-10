const {settings,sheet,validate,authorized,sameOrigin,body}=require('../lib/store');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 try{
  if(req.method==='GET')return res.status(200).json(await settings());
  if(req.method!=='PUT')return res.status(405).json({error:'Method not allowed'});
  if(!sameOrigin(req)||!authorized(req))return res.status(401).json({error:'Invalid admin password, or admin access is not configured.'});
  let value;try{value=validate(body(req));}catch(e){return res.status(400).json({error:e.message});}
  await sheet('Settings!A1','PUT',[[JSON.stringify(value)]]);
  return res.status(200).json(value);
 }catch{return res.status(503).json({error:'Settings could not be saved or loaded. Check the Google Sheets connection.'});}
};
