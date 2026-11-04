// App agent: model proposes structured actions; the app owns execution and review.
const agentHistory=[];
let agentRunning=false;
function updateAgentContext(){
  const sel=selection&&selection.id===chapter().id&&chapter().text.slice(selection.start,selection.end)===selection.text?selection:null;
  $('agentContext').textContent=`Chương: ${chapter().title}\nModel: ${state.model||'Chưa kết nối'}\nChế độ: ${state.auto?'Tự động':'Thủ công'}\nPhạm vi sửa: ${sel?sel.text.length+' ký tự đã chọn':state.auto?'Toàn chương':'Chưa chọn đoạn; chỉ trao đổi và điều khiển app'}`;
}
function agentMessage(role,text){const item=document.createElement('div');item.className='chat-message '+role;const label=document.createElement('span');label.className='chat-role';label.textContent=role==='user'?'BẠN':'MẠCH VĂN AGENT';const body=document.createElement('div');body.textContent=text;item.append(label,body);$('agentMessages').append(item);item.scrollIntoView({block:'nearest'});return item;}
function agentSnapshot(){return JSON.stringify({chapters:state.chapters,skills:state.skills,custom:state.custom,current:state.current,auto:state.auto});}
function captureAgentContext(){
  const c=chapter(),sel=selection&&selection.id===c.id&&c.text.slice(selection.start,selection.end)===selection.text?{...selection}:null;
  return {chapters:state.chapters.map(c=>({id:c.id,title:c.title})),current:{id:c.id,title:c.title,text:c.text,characters:[...c.characters]},editing_scope:sel?{kind:'selection',...sel}:state.auto?{kind:'chapter',start:0,end:c.text.length,text:c.text}:{kind:'none'},skills:skillDefs.filter(s=>state.skills.includes(s[0])).map(s=>({id:s[0],instruction:s[2]})),custom_style:state.custom};
}
function actionSummary(a){
 const c=state.chapters.find(c=>c.id===a.chapter_id);const title=c?.title||'';
 switch(a.type){
 case'navigate':return 'Mở trang: '+({write:'Bản thảo',characters:'Nhân vật',skills:'Kỹ năng AI',settings:'Ollama'}[a.view]||a.view);
 case'switch_chapter':return 'Chuyển đến chương: '+title;
 case'create_chapter':return 'Tạo chương rỗng: '+a.title;
 case'rename_chapter':return `Đổi tên “${title}” → “${a.title}”`;
 case'replace_text':return 'Sửa văn bản trong phạm vi đã chia sẻ';
 case'add_character':return `Thêm nhân vật “${a.name}” vào “${title}”`;
 case'set_skill':return `${a.enabled?'Bật':'Tắt'} kỹ năng: ${skillDefs.find(s=>s[0]===a.skill_id)?.[1]||a.skill_id}`;
 default:throw Error('Thao tác không được hỗ trợ.');
 }
}
function runAgentAction(a,context){
 let target=state.chapters.find(c=>c.id===a.chapter_id);
 switch(a.type){
 case'navigate':if(!['write','characters','skills','settings'].includes(a.view))throw Error('Trang không hợp lệ.');view(a.view);break;
 case'switch_chapter':{const i=state.chapters.findIndex(c=>c.id===a.chapter_id);if(i<0)throw Error('Chương không tồn tại.');state.current=i;selection=null;cursor=0;revision++;pending=null;$('resultBox').hidden=true;clearTimeout(timer);render();save();view('write');break;}
 case'create_chapter':state.chapters.push({id:crypto.randomUUID(),title:a.title,text:'',characters:[]});renderChapters();save();break;
 case'rename_chapter':if(!target)throw Error('Chương không tồn tại.');target.title=a.title;render();save();break;
 case'add_character':if(!target)throw Error('Chương không tồn tại.');if(!target.characters.includes(a.name))target.characters.push(a.name);renderCharacters();save();break;
 case'set_skill':if(!skillDefs.some(s=>s[0]===a.skill_id))throw Error('Kỹ năng không hợp lệ.');state.skills=a.enabled?[...new Set([...state.skills,a.skill_id])]:state.skills.filter(id=>id!==a.skill_id);renderSkills();save();break;
 case'replace_text':{
 const scope=context.editing_scope;
 if(!target||target.id!==context.current.id||target.text!==context.current.text||!['selection','chapter'].includes(scope.kind))throw Error('Phạm vi sửa đã thay đổi hoặc chưa được chọn.');
 if(target.id!==chapter().id)throw Error('Hãy về chương được chọn và gửi lại yêu cầu.');
 if(target.text.slice(scope.start,scope.end)!==scope.text)throw Error('Đoạn chọn đã thay đổi.');
 remember();target.text=target.text.slice(0,scope.start)+a.text+target.text.slice(scope.end);revision++;selection=null;pending=null;clearTimeout(timer);$('resultBox').hidden=true;render();save();break;}
 default:throw Error('Thao tác không được hỗ trợ.');
 }
 return actionSummary(a);
}
function showAgentPlan(actions,context,snapshot){
 const box=document.createElement('div');box.className='agent-plan';const heading=document.createElement('h2');heading.textContent='Đề xuất thay đổi · Chờ bạn duyệt';box.append(heading);
 actions.forEach(a=>{const p=document.createElement('p');p.textContent=actionSummary(a);box.append(p);if(a.type==='replace_text'){const before=document.createElement('pre'),after=document.createElement('pre');before.textContent='TRƯỚC\n'+context.editing_scope.text;after.textContent='SAU\n'+a.text;box.append(before,after);}});
 const apply=document.createElement('button'),reject=document.createElement('button'),status=document.createElement('p');apply.className='primary';apply.textContent='Duyệt và thực hiện';reject.className='plain';reject.textContent='Bỏ qua';
 apply.onclick=()=>{
 if(agentSnapshot()!==snapshot){apply.disabled=true;status.textContent='Trạng thái app đã thay đổi. Hãy gửi lại yêu cầu để tránh sửa nhầm.';agentHistory.push({role:'assistant',content:'Kế hoạch bị hủy vì ngữ cảnh đã thay đổi.'});return;}
 // Preflight before any mutation; execution is synchronous on the captured state.
 if(actions.some(a=>a.chapter_id&&!state.chapters.some(c=>c.id===a.chapter_id))){status.textContent='Chương không tồn tại.';return;}
 try{const receipts=actions.map(a=>runAgentAction(a,context));apply.disabled=true;reject.disabled=true;status.textContent='Đã thực hiện:\n'+receipts.join('\n');agentHistory.push({role:'assistant',content:'App đã thực hiện: '+receipts.join('; ')});updateAgentContext();toast('Agent đã thực hiện thay đổi bạn duyệt.');}catch(e){apply.disabled=true;status.textContent=e.message;agentHistory.push({role:'assistant',content:'Thực thi bị dừng: '+e.message});}
 };
 reject.onclick=()=>{apply.disabled=true;reject.disabled=true;status.textContent='Đã bỏ qua. Không thay đổi dữ liệu.';agentHistory.push({role:'assistant',content:'Tác giả đã bỏ qua kế hoạch.'});};box.append(apply,reject,status);$('agentMessages').append(box);box.scrollIntoView({block:'nearest'});
}
$('selectForAgent').onclick=()=>view('write');document.querySelectorAll('.agent-example').forEach(b=>b.onclick=()=>{$('agentInput').value=b.textContent;$('agentInput').focus();});
$('clearChat').onclick=()=>{if(agentRunning)return toast('Chờ agent hoàn tất yêu cầu hiện tại.');agentHistory.length=0;$('agentMessages').replaceChildren();agentMessage('assistant','Đã bắt đầu cuộc trò chuyện mới. Bạn muốn tôi hỗ trợ điều gì?');};
$('agentForm').onsubmit=async e=>{
 e.preventDefault();if(agentRunning)return;
 if(!state.model){toast('Mở Ollama đã cài sẵn, rồi bấm kiểm tra kết nối.');view('settings');return;}
 const text=$('agentInput').value.trim();if(!text)return;
 const context=captureAgentContext(),snapshot=agentSnapshot(),previous=agentHistory.slice(-12);
 agentMessage('user',text);agentHistory.push({role:'user',content:text});$('agentInput').value='';agentRunning=true;clearTimeout(timer);$('agentSend').disabled=true;$('agentSend').textContent='Agent đang suy nghĩ…';
 try{
 const r=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:state.model,text,context,history:previous})});const d=await r.json();if(!r.ok)throw Error(d.error+(d.detail?' '+d.detail:''));
 if(typeof d.message!=='string'||!Array.isArray(d.actions))throw Error('Phản hồi agent không hợp lệ.');
 agentMessage('assistant',d.message);agentHistory.push({role:'assistant',content:d.message+'\nKế hoạch (chưa thực hiện): '+JSON.stringify(d.actions)});
 if(d.actions.length){
 if(agentSnapshot()!==snapshot){agentMessage('assistant','Bản thảo hoặc trạng thái app đã thay đổi trong lúc xử lý. Tôi chưa thực hiện thao tác; hãy gửi lại yêu cầu.');agentHistory.push({role:'assistant',content:'App đã hủy kế hoạch do trạng thái thay đổi.'});return;}
 const immediate=d.actions.filter(a=>['navigate','switch_chapter'].includes(a.type)),changes=d.actions.filter(a=>!['navigate','switch_chapter'].includes(a.type));
 if(changes.length){showAgentPlan(changes,context,snapshot);if(immediate.length)agentMessage('assistant','Các thao tác chuyển trang/chương trong kế hoạch sẽ chưa chạy để giữ nguyên phạm vi chỉnh sửa. Bạn có thể yêu cầu mở trang ở lượt tiếp theo.');}
 else{const receipts=immediate.map(a=>runAgentAction(a,context));agentMessage('assistant','Đã thực hiện: '+receipts.join('; '));agentHistory.push({role:'assistant',content:'App đã thực hiện: '+receipts.join('; ')});toast(receipts.join('; '));}
 }
 }catch(e){agentMessage('assistant','Chưa thực hiện: '+e.message);agentHistory.push({role:'assistant',content:'Yêu cầu thất bại, không thực hiện: '+e.message});}
 finally{agentRunning=false;$('agentSend').disabled=false;$('agentSend').textContent='Gửi cho agent ↗';updateAgentContext();}
};
agentMessage('assistant','Chào bạn. Tôi dùng model Qwen có sẵn trên Ollama để cùng bạn biên tập và điều khiển app. Bạn có thể yêu cầu mở kỹ năng, tạo chương, thêm nhân vật hoặc trau chuốt đoạn đã chọn. Bạn luôn duyệt trước khi tôi thay đổi dữ liệu.');
