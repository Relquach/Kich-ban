const systemTheme=matchMedia('(prefers-color-scheme: dark)');
function setTheme(choice,persist=true){
 if(!['system','light','dark'].includes(choice))choice='system';
 const resolved=choice==='system'?(systemTheme.matches?'dark':'light'):choice;
 document.documentElement.dataset.theme=resolved;document.documentElement.dataset.themeChoice=choice;
 $('themeChoice').value=choice;
 $('themeToggle').replaceChildren(makeIcon(resolved==='dark'?'sun':'moon'));
 $('themeToggle').setAttribute('aria-label',resolved==='dark'?'Chuyển sang giao diện sáng':'Chuyển sang giao diện tối');
 if(persist)try{localStorage.setItem('machvan-theme',choice);}catch{toast('Chưa lưu được lựa chọn giao diện.');}
}
$('themeChoice').onchange=()=>setTheme($('themeChoice').value);
$('themeToggle').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
systemTheme.addEventListener('change',()=>{if(document.documentElement.dataset.themeChoice==='system')setTheme('system',false);});
setTheme(document.documentElement.dataset.themeChoice||'system',false);
let fontSaveTimer;
function setEditorSize(value){const size=Math.max(16,Math.min(26,Number(value)||17));document.documentElement.style.setProperty('--editor-size',size+'px');$('fontSize').value=String(size);$('fontSizeValue').textContent=size+' px';}
try{setEditorSize(localStorage.getItem('machvan-font-size')||17);}catch{setEditorSize(17);}
$('fontSize').oninput=()=>{setEditorSize($('fontSize').value);clearTimeout(fontSaveTimer);fontSaveTimer=setTimeout(()=>{try{localStorage.setItem('machvan-font-size',$('fontSize').value);}catch{}},200);};
let agentOpener=null;
function toggleAgent(force){
 const panel=$('agentPanel'),open=typeof force==='boolean'?force:panel.hidden;
 if(open){if(panel.hidden)agentOpener=document.activeElement;panel.hidden=false;$('agentLauncher').setAttribute('aria-expanded','true');$('agentNotification').hidden=true;updateAgentContext();$('agentInput').focus({preventScroll:true});}
 else{panel.hidden=true;$('agentLauncher').setAttribute('aria-expanded','false');if(panel.contains(document.activeElement))(agentOpener?.isConnected?agentOpener:$('agentLauncher')).focus({preventScroll:true});}
}
$('agentLauncher').onclick=()=>toggleAgent();$('sidebarAgent').onclick=()=>toggleAgent(true);$('agentMinimize').onclick=()=>toggleAgent(false);
document.addEventListener('keydown',e=>{if(e.defaultPrevented||['canvasLibrary','quickDialogue'].some(id=>$(id)?.open))return;if(e.altKey&&e.key.toLowerCase()==='j'){e.preventDefault();toggleAgent();}else if(e.key==='Escape'&&!$('agentPanel').hidden){e.preventDefault();toggleAgent(false);}});
// A modeless panel: keep background keyboard targets visible instead of trapping focus.
document.addEventListener('focusin',e=>{
 const panel=$('agentPanel');if(panel.hidden||panel.contains(e.target)||e.target===$('agentLauncher'))return;
 const a=panel.getBoundingClientRect(),b=e.target.getBoundingClientRect();
 if(b.right>a.left&&b.left<a.right&&b.bottom>a.top&&b.top<a.bottom)toggleAgent(false);
});
function updateAIStatus(){
 const working=aiRuntime.busy;
 document.querySelectorAll('[data-action],[data-character-mode]').forEach(b=>b.disabled=working);
 $('agentSend').disabled=working;
 $('agentSend').textContent=working?'Đang xử lý…':'Gửi';
 $('agentLiveStatus').textContent=working?'Qwen đang xử lý yêu cầu…':(state.model?'Qwen local · Sẵn sàng hỗ trợ':'Chưa chọn model · Mở Cài đặt');
 $('agentPanel').setAttribute('aria-busy',String(working));
}
updateAIStatus();
