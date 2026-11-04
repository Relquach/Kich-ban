const $=id=>document.getElementById(id);
const skillDefs=[['literary','Văn chương & giọng kể','Chọn từ chính xác, hình ảnh tiết chế, giữ nguyên giọng kể riêng của tác giả.'],['dialogue','Hội thoại tự nhiên','Lời thoại phù hợp tính cách, quan hệ nhân vật và bối cảnh. Tránh thoại giải thích dài dòng.'],['tension','Nhịp truyện & cao trào','Nhận biết nơi nên tăng xung đột, tạo khoảng lặng; chỉ gợi ý, không tự thêm biến cố.'],['continuity','Nhất quán nhân vật','Theo dõi ngôi kể, cách xưng hô, tên nhân vật và thời gian trong văn bản được cung cấp.']];
let state={projectName:'Dự án chưa đặt tên',chapters:[{id:crypto.randomUUID(),title:'Chương 1',text:''}],current:0,profiles:[],story:{nodes:[],edges:[]},skills:skillDefs.map(x=>x[0]),custom:'',model:'',auto:false};
let projectEpoch=0;
let loadWarning='';
try{const raw=localStorage.getItem('machvan-v1');if(raw){try{state=normalizeProject(JSON.parse(raw));}catch(e){localStorage.setItem('machvan-recovery',raw);loadWarning='Không đọc được bản lưu cũ. Bản gốc được giữ ở khóa machvan-recovery. '+e.message;}}}catch(e){loadWarning='Chưa đọc được bản lưu trình duyệt: '+e.message;}
let selection=null,cursor=0,pending=null,busy=false,timer,toastTimer,revision=0;const history=new Map();
const chapter=()=>state.chapters[state.current];
const draftStore=createDeferredSave({read:()=>JSON.stringify(state),write:value=>localStorage.setItem('machvan-v1',value),onState:(status)=>{$('saveState').textContent={pending:'Đang lưu…',saved:'Đã lưu trên máy',error:'Chưa lưu được'}[status];if(status==='error')toast('Bộ nhớ trình duyệt đầy. Hãy xuất bản thảo để giữ dữ liệu.');}});
window.addEventListener('pagehide',()=>draftStore.flush());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')draftStore.flush();});
function toast(msg){$('toast').textContent=msg;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',5000);}
function save(){draftStore.queue();}
let undoChapter=null,undoTime=0;
function remember(group=false){
 const c=chapter(),now=Date.now();
 if(group&&undoChapter===c.id&&now-undoTime<700){undoTime=now;return;}
 undoTime=now;undoChapter=group?c.id:null;
 const h=history.get(c.id)||[];
 if(h.at(-1)!==c.text)h.push(c.text);
 history.delete(c.id);history.set(c.id,h.slice(-20));
 // A global budget, including chapters that are not currently visible.
 let bytes=0;for(const values of history.values())for(const t of values)bytes+=t.length*2;
 while(bytes>4*1024*1024&&history.size){const [id,values]=history.entries().next().value;if(values.length){bytes-=values.shift().length*2;}if(!values.length)history.delete(id);}
}
let countTimer;
function scheduleCounts(){clearTimeout(countTimer);countTimer=setTimeout(()=>{counts();if(typeof updateAgentContext==='function'&&!$('agentPanel').hidden)updateAgentContext();},180);}
function renderChapters(){const box=$('chapters');box.replaceChildren();state.chapters.forEach((c,i)=>{const b=document.createElement('button');b.className='chapter'+(i===state.current?' current':'');if(i===state.current)b.setAttribute('aria-current','true');const small=document.createElement('small');small.textContent=`CHƯƠNG ${String(i+1).padStart(2,'0')}`;b.append(small,document.createTextNode(c.title||'Chưa đặt tên'));b.onclick=()=>{state.current=i;selection=null;cursor=0;revision++;pending=null;$('resultBox').hidden=true;clearTimeout(timer);render();save();};box.append(b);});}
function counts(){$('wordCount').textContent=`${chapter().text.trim().split(/\s+/).filter(Boolean).length} từ · ${chapter().text.length} ký tự`;}
function render(){renderChapters();$('chapterTitle').value=chapter().title;$('editor').value=chapter().text;$('chapterLabel').textContent=`CHƯƠNG ${String(state.current+1).padStart(2,'0')}`;counts();renderCharacters();renderCanvas();$('projectName').value=state.projectName;setMode();if(typeof updateAgentContext==='function')updateAgentContext();}
function setMode(){$('auto').classList.toggle('selected',state.auto);$('auto').setAttribute('aria-pressed',String(state.auto));$('manual').setAttribute('aria-pressed',String(!state.auto));$('manual').classList.toggle('selected',!state.auto);$('modeHelp').textContent=state.auto?'Sau khi ngừng gõ 3 giây, AI đề xuất sửa chính tả toàn chương. Bạn duyệt trước khi áp dụng.':'Chọn một đoạn văn. AI chỉ đề xuất sửa đoạn bạn đã chọn.';}
function view(name){
 if(name==='agent'){if(typeof toggleAgent==='function')toggleAgent(true);return;}
 if(!['write','characters','canvas','skills','settings'].includes(name))return;
 document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!==name);
 document.querySelectorAll('.nav').forEach(b=>{const active=b.dataset.view===name;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 $('crumb').textContent={write:'Bản thảo',characters:'Hồ sơ nhân vật',canvas:'Canvas cốt truyện',skills:'Kỹ năng AI',settings:'Cài đặt'}[name];
 if(name==='canvas')renderCanvas();
 if(name==='characters')renderCharacters();
 if(typeof updateAgentContext==='function')updateAgentContext();
}

document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>view(b.dataset.view));
$('manual').onclick=()=>{state.auto=false;clearTimeout(timer);setMode();save();};$('auto').onclick=()=>{state.auto=true;setMode();save();};
$('editor').addEventListener('select',()=>{const e=$('editor');cursor=e.selectionEnd;selection=e.selectionEnd>e.selectionStart?{start:e.selectionStart,end:e.selectionEnd,text:e.value.slice(e.selectionStart,e.selectionEnd),id:chapter().id}:null;$('selectionInfo').textContent=selection?`Đã chọn ${selection.text.length} ký tự`:'Bôi đen một đoạn để chỉnh sửa riêng';if(typeof updateAgentContext==='function'&&!$('agentPanel').hidden)updateAgentContext();});
$('editor').addEventListener('keyup',()=>cursor=$('editor').selectionEnd);$('editor').addEventListener('click',()=>cursor=$('editor').selectionEnd);
$('editor').addEventListener('input',()=>{remember(true);chapter().text=$('editor').value;revision++;cursor=$('editor').selectionEnd;selection=null;scheduleCounts();save();clearTimeout(timer);if(state.auto&&state.model)timer=setTimeout(()=>assist('spelling',true),3000);});
let titleTimer;$('chapterTitle').oninput=()=>{chapter().title=$('chapterTitle').value;clearTimeout(titleTimer);titleTimer=setTimeout(renderChapters,250);save();};$('rename').onclick=()=>$('chapterTitle').focus();
$('addChapter').onclick=()=>{state.chapters.push({id:crypto.randomUUID(),title:'Chương mới',text:''});state.current=state.chapters.length-1;revision++;selection=null;cursor=0;pending=null;$('resultBox').hidden=true;render();save();view('write');$('chapterTitle').focus();};
$('undo').onclick=()=>{undoChapter=null;const h=history.get(chapter().id);if(!h?.length)return toast('Chưa có thay đổi để hoàn tác.');chapter().text=h.pop();revision++;selection=null;$('editor').value=chapter().text;counts();save();};
async function models(){ $('connection').textContent='○ Đang kiểm tra Ollama…';try{const r=await fetch('/api/models');const d=await r.json();if(!r.ok)throw Error(d.error);$('model').replaceChildren();(d.models||[]).forEach(m=>{const o=document.createElement('option');o.value=m.name;o.textContent=m.name;$('model').append(o);});if(!d.models?.length)throw Error('Ollama chưa có model. Hãy cài model bằng ollama pull <tên-tag>.');if(!d.models.some(m=>m.name===state.model))state.model=d.models.find(m=>/qwen/i.test(m.name))?.name||d.models[0].name;$('model').value=state.model;$('connection').textContent='● Ollama local · '+state.model;$('modelStatus').textContent='Đã kết nối. '+d.models.length+' model có sẵn.';if(typeof updateAIStatus==='function')updateAIStatus();save();}catch(e){$('connection').textContent='○ Ollama chưa kết nối · Cài đặt';$('modelStatus').textContent=e.message;}}
$('connection').onclick=()=>view('settings');$('refreshModels').onclick=models;$('model').onchange=()=>{state.model=$('model').value;save();$('connection').textContent='● Ollama local · '+state.model;notifyAIStatus();};
async function assist(action,automatic=false,whole=false){if(busy||aiRuntime.busy){if(!automatic)toast('AI đang xử lý một yêu cầu.');return;}if(!state.model){if(!automatic){toast('Kết nối Ollama và chọn model trước.');view('settings');}return;}const sel=!whole&&!automatic?selection:null;if(!state.auto&&!whole&&!sel){toast('Hãy bôi đen đoạn văn bạn muốn AI hỗ trợ.');$('editor').focus();return;}
const c=chapter(),snapshot=c.text,rev=revision;const text=sel?sel.text:snapshot;if(!text.trim())return toast('Chương này chưa có nội dung.');busy=true;document.querySelectorAll('[data-action],[data-character-mode]').forEach(b=>b.disabled=true);$('resultBox').hidden=false;$('result').textContent='Đang đọc bản thảo cùng bạn…';$('resultActions').hidden=true;pending=null;
try{const d=await requestAI('/api/assist',{model:state.model,action,text,skills:skillDefs.filter(s=>state.skills.includes(s[0])).map(s=>s[2]).join('\n')+'\n'+state.custom});if(c.id!==chapter().id||rev!==revision||c.text!==snapshot){$('resultBox').hidden=true;return toast('Bản thảo đã thay đổi. Hãy yêu cầu lại để tránh sửa nhầm đoạn.');}if(!d.text?.trim())throw Error('Model trả kết quả trống. Hãy thử lại.');$('result').textContent=d.text;$('resultActions').hidden=false;const editable=['polish','spelling'].includes(action);$('apply').hidden=!editable;pending=editable?{id:c.id,snapshot,start:sel?sel.start:0,end:sel?sel.end:snapshot.length,text:d.text}:null;
}catch(e){$('result').textContent=e.message;$('resultActions').hidden=true;toast('Chưa tạo được đề xuất. Kiểm tra kết nối trong Cài đặt.');}finally{busy=false;notifyAIStatus();}}
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>assist(b.dataset.action));
$('apply').onclick=()=>{if(!pending)return;const p=pending;if(chapter().id!==p.id||chapter().text!==p.snapshot){pending=null;return toast('Bản thảo đã thay đổi. Hãy tạo lại đề xuất.');}remember();chapter().text=p.snapshot.slice(0,p.start)+p.text+p.snapshot.slice(p.end);revision++;selection=null;pending=null;$('resultBox').hidden=true;render();save();toast('Đã áp dụng. Bạn có thể hoàn tác bằng ↶.');};$('dismiss').onclick=()=>{pending=null;$('resultBox').hidden=true;};
function renderSkills(){const box=$('skillList');box.replaceChildren();skillDefs.forEach(([id,title,desc])=>{const card=document.createElement('div');card.className='card';const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=state.skills.includes(id);input.onchange=()=>{state.skills=input.checked?[...state.skills,id]:state.skills.filter(x=>x!==id);save();};label.append(input,document.createTextNode(title));const p=document.createElement('p');p.textContent=desc;card.append(label,p);box.append(card);});$('customSkill').value=state.custom;}
$('customSkill').oninput=()=>{state.custom=$('customSkill').value;save();};
initCharacters();initCanvas();render();renderSkills();models();if(loadWarning)toast(loadWarning);
