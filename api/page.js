const fs=require('node:fs');
const path=require('node:path');
const {settings}=require('../lib/store');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports=async(req,res)=>{
 if(req.method!=='GET')return res.status(405).end();
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');
 try{
 const config=await settings();let html=fs.readFileSync(path.join(process.cwd(),'deploy/index.html'),'utf8');
 const marker='<script type="__bundler/template">',start=html.indexOf(marker)+marker.length,end=html.indexOf('</script>',start);
 let template=JSON.parse(html.slice(start,end));
 template=template.replace(/const DEFAULTS = .*?;\n/,()=> 'const DEFAULTS = '+JSON.stringify(config)+';\n');
 const fmt=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'});
 const dates=config.startDate?fmt(config.startDate)+' – '+fmt(config.endDate):'Dates to be announced · '+config.year;
 html=html.slice(0,start).replaceAll('Dates to be announced · 2027',escape(dates)).replaceAll('2027',String(config.year))+JSON.stringify(template).replaceAll('<','\\u003c')+html.slice(end);
 res.status(200).end(html);
 }catch{res.status(503).end('<!doctype html><title>Motzi Travel</title><h1>Motzi Travel</h1><p>We are updating availability. Please call <a href="tel:12016147732">(201) 614-7732</a> or <a href="mailto:motzitravel@gmail.com">email us</a> to inquire.</p>');}
};
