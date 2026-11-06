import {readFile,writeFile,mkdir} from 'node:fs/promises';
const ui=await readFile('src/ui.html','utf8'),reports=await readFile('src/reports.js','utf8'),server=await readFile('src/server.js','utf8'),storage=await readFile('src/demo-storage.js','utf8');
const bootstrap=`<script>
window.CLEANING_DEMO=true;
window.CLEANING_READY=(async()=>{
 if(!('serviceWorker' in navigator))throw Error('このブラウザでは公開デモを利用できません。Safari・Chromeの通常モードで開いてください。');
 await navigator.serviceWorker.register('./sw.js',{scope:'./'});
 await navigator.serviceWorker.ready;
 if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
})();
<`+`/script>`;
const banner='<div style="background:#e7efda;color:#49623c;text-align:center;padding:10px 18px;font-size:12px">共有用デモ：入力内容と写真はこの端末に保存されます。別の端末とは共有されません。</div>';
const html=ui.replace('<body>','<body>'+banner+bootstrap).replace('async function init(){if(window.CLEANING_READY)await window.CLEANING_READY;','async function init(){if(window.CLEANING_READY)try{await window.CLEANING_READY}catch(err){$(\'#app\').innerHTML=errorHTML(err.message);return;}');
await mkdir('docs',{recursive:true});
await writeFile('docs/index.html',html);
await writeFile('docs/sw.js',"const APP_HTML='';\n"+reports+'\n'+server.replace('export default {','const appWorker = {')+'\n'+storage);
await writeFile('docs/.nojekyll','');
await mkdir('worker',{recursive:true});
await writeFile('worker/index.js','const APP_HTML='+JSON.stringify(ui)+';\n'+reports+'\n'+server);
console.log('Built public demo: docs/index.html + docs/sw.js');
