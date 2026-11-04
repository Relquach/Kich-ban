// Minimal DOM simulation for app initialization and state transitions; not a browser.
const vm=require('node:vm'),fs=require('node:fs');
function createApp({stored=null}={}){
 let doc;
 class Element{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.dataset={};this.style={setProperty(k,v){this[k]=v;}};this.className='';this.listeners={};this.hidden=false;this.disabled=false;this._value=undefined;this._text='';this.scrollLeft=0;this.scrollTop=0;this.scrollHeight=500;this.selectionStart=0;this.selectionEnd=0;this.isConnected=true;this.classList={toggle:(c,on)=>{const classes=new Set(this.className.split(/\s+/).filter(Boolean));if(on??!classes.has(c))classes.add(c);else classes.delete(c);this.className=[...classes].join(' ');},contains:c=>this.className.split(/\s+/).includes(c)};}
  get firstElementChild(){return this.children[0];}
  get value(){return this._value??(this.tagName==='SELECT'?(this.children.find(c=>c.tagName==='OPTION')?.value||''):'');}set value(v){this._value=String(v);}
  get textContent(){return this._text+this.children.map(c=>c.textContent||'').join('');}set textContent(v){this._text=String(v);this.children=[];}
  append(...items){for(let x of items){if(typeof x==='string'){const t=new Element('#text');t._text=x;x=t;}if(x.parentElement)x.remove();x.parentElement=this;this.children.push(x);}}
  replaceChildren(...items){for(const child of this.children)child.parentElement=null;this.children=[];this._text='';this.append(...items);}
  remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(c=>c!==this);this.parentElement=null;}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);if(k==='id')this.id=String(v);if(k==='hidden')this.hidden=true;if(k==='value')this.value=v;if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,a)=>a.toUpperCase())]=String(v);}
  getAttribute(k){return this.attributes[k]??null;}removeAttribute(k){delete this.attributes[k];}
  matches(selector){if(selector.startsWith('#'))return this.id===selector.slice(1);if(selector.startsWith('.'))return this.classList.contains(selector.slice(1));const a=selector.match(/^\[([^=\]]+)(?:="?([^"\]]+)"?)?\]$/);if(a)return this.attributes[a[1]]!==undefined&&(a[2]===undefined||this.attributes[a[1]]===a[2]);return this.tagName.toLowerCase()===selector.toLowerCase();}
  querySelectorAll(selector){const selectors=selector.split(',').map(s=>s.trim()),result=[];const walk=e=>{for(const c of e.children){if(selectors.some(s=>c.matches(s)))result.push(c);walk(c);}};walk(this);return result;}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}closest(s){for(let e=this;e;e=e.parentElement)if(e.matches(s))return e;return null;}
  contains(node){return node===this||this.children.some(c=>c.contains(node));}
  addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
  fire(k,event={}){const e={target:this,preventDefault(){},...event};this['on'+k]?.(e);for(const fn of this.listeners[k]||[])fn(e);}
  click(){this.fire('click');}focus(){doc.activeElement=this;}setSelectionRange(a,b){this.selectionStart=a;this.selectionEnd=b;}
  getBoundingClientRect(){return {left:0,top:0,right:0,bottom:0};}setPointerCapture(){}hasPointerCapture(){return false;}releasePointerCapture(){}
 }
 doc=new Element('document');doc.createElement=tag=>new Element(tag);doc.createElementNS=(_,tag)=>new Element(tag);doc.createTextNode=t=>{const n=new Element('#text');n._text=t;return n;};doc.getElementById=id=>doc.querySelector('#'+id);doc.visibilityState='visible';doc.activeElement=null;
 const html=fs.readFileSync('static/index.html','utf8'),stack=[doc],voids=new Set(['meta','link','input','br','hr','img']);
 for(const token of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[^>]+>|[^<]+/g)){const t=token[0];if(t.startsWith('<!'))continue;if(t.startsWith('</')){if(stack.length>1)stack.pop();continue;}if(t.startsWith('<')){const m=t.match(/^<([\w-]+)/);if(!m)continue;const tag=m[1],el=new Element(tag);for(const attr of t.slice(m[0].length).matchAll(/([\w-]+)(?:="([^"]*)")?/g))el.setAttribute(attr[1],attr[2]??'');stack.at(-1).append(el);if(!voids.has(tag)&&!t.endsWith('/>'))stack.push(el);}else if(t.trim())stack.at(-1).append(t);}
 doc.documentElement=doc.querySelector('html');doc.body=doc.querySelector('body');
 const storage=new Map(stored?[['machvan-v1',JSON.stringify(stored)]]:[]),timers=new Map();let next=0;
 const window={listeners:{},addEventListener(k,fn){this.listeners[k]=fn;}};
 const media={matches:false,addEventListener(){}};
 const sandbox={document:doc,window,console,crypto:require('node:crypto').webcrypto,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>media,confirm:()=>true,requestAnimationFrame:fn=>{timers.set(++next,fn);return next;},cancelAnimationFrame:id=>timers.delete(id),setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id),AbortController,Blob,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},fetch:async()=>({ok:true,json:async()=>({models:[{name:'qwen:local'}]})})};
 const context=vm.createContext(sandbox);
 const run=code=>vm.runInContext(code,context);
 for(const script of ['theme-init.js','icons.js','runtime.js','project-data.js','characters.js','canvas.js','app.js','projects.js','ui.js','agent-ui.js'])vm.runInContext(fs.readFileSync('static/'+script,'utf8'),context,{filename:script});
 return {context,run,$:id=>doc.getElementById(id),storage,document:doc,window,timers};
}
module.exports={createApp};
