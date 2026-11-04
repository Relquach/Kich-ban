// Theme + floating-panel interaction checks in a DOM simulation (not browser QA).
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function element(){return {children:[],hidden:false,isConnected:true,dataset:{},attributes:{},value:'',style:{setProperty(k,v){this[k]=v;}},replaceChildren(...nodes){this.children=nodes;},setAttribute(k,v){this.attributes[k]=v;},contains(node){return node===this||node?.inside===this;},focus(){doc.activeElement=this;},getBoundingClientRect(){return this.rect||{left:0,right:20,top:0,bottom:20};}};}
const els=new Map(),listeners={},saved=new Map();const doc={documentElement:element(),activeElement:null,addEventListener(k,fn){listeners[k]=fn;},querySelectorAll:()=>[]};
const media={matches:false,addEventListener(k,fn){this.listener=fn;}};
const get=id=>{if(!els.has(id))els.set(id,element());return els.get(id);};get('agentPanel').hidden=true;get('agentPanel').rect={left:400,right:800,top:100,bottom:700};get('agentInput').inside=get('agentPanel');doc.activeElement=get('agentLauncher');
const ctx=vm.createContext({document:doc,localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},matchMedia:()=>media,$:get,makeIcon:name=>({name}),toast(){},updateAgentContext(){},aiRuntime:{busy:false},state:{model:'qwen'},setTimeout:()=>1,clearTimeout(){}});
vm.runInContext(fs.readFileSync('static/theme-init.js','utf8'),ctx);assert.equal(doc.documentElement.dataset.theme,'light');
vm.runInContext(fs.readFileSync('static/ui.js','utf8'),ctx);
get('themeToggle').onclick();assert.equal(doc.documentElement.dataset.theme,'dark');assert.equal(saved.get('machvan-theme'),'dark');
get('themeChoice').value='system';get('themeChoice').onchange();media.matches=true;media.listener();assert.equal(doc.documentElement.dataset.theme,'dark');media.matches=false;media.listener();assert.equal(doc.documentElement.dataset.theme,'light');
get('agentLauncher').onclick();assert.equal(get('agentPanel').hidden,false);assert.equal(doc.activeElement,get('agentInput'));assert.equal(get('agentLauncher').attributes['aria-expanded'],'true');
get('agentInput').value='Giữ nội dung đang nhập';get('agentMinimize').onclick();assert.equal(get('agentPanel').hidden,true);assert.equal(get('agentInput').value,'Giữ nội dung đang nhập');assert.equal(doc.activeElement,get('agentLauncher'));
let prevented=false;listeners.keydown({altKey:true,key:'j',preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(get('agentPanel').hidden,false);
listeners.keydown({key:'Escape',preventDefault(){}});assert.equal(get('agentPanel').hidden,true);
get('agentLauncher').onclick();const behind=element();behind.rect={left:410,right:450,top:120,bottom:160};listeners.focusin({target:behind});assert.equal(get('agentPanel').hidden,true);
ctx.aiRuntime.busy=true;vm.runInContext('updateAIStatus()',ctx);assert.equal(get('agentSend').disabled,true);ctx.aiRuntime.busy=false;vm.runInContext('updateAIStatus()',ctx);assert.equal(get('agentSend').disabled,false);
console.log('UI simulation passed: theme persistence/system changes, floating open/close, preserved input, Escape, Alt+J, unobscured focus, AI busy state.');
