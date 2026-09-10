import fs from 'node:fs';
let source=fs.readFileSync('deploy/source/Motzi Travel.dc.html','utf8');
let index=fs.readFileSync('deploy/index.html','utf8');
const marker='<script type="__bundler/template">';
const at=index.indexOf(marker);if(at<0)throw Error('Missing template');
const end=index.indexOf('</script>',at)+9;
const tail=index.indexOf('</html>',end)+7;
index=index.slice(0,tail);
source=source.replace('src="./support.js"','src="b7b896d1-bf81-4fb6-b033-65010ff8c5e9"');
index=index.slice(0,at)+marker+'\n'+JSON.stringify(source).replaceAll('</','<\\/')+'\n  </script>'+index.slice(end);
// Static shell metadata uses the default season; live metadata is served by api/page.
const before=index.indexOf(marker);
index=index.slice(0,before).replaceAll('April 1–10, 2026','Dates to be announced · 2027').replaceAll('2026','2027')+index.slice(before);
fs.writeFileSync('deploy/index.html',index);
console.log('Built index from editable source.');
