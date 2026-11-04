// App agent: model proposes structured actions; the app owns execution and review.
const agentHistory=[];
let agentRunning=false;
let activeAgentReview=null,agentScrollFrame=null;
function recordAgentHistory(item){agentHistory.push({...item,content:item.content.slice(0,16000)});let chars=agentHistory.reduce((n,m)=>n+m.content.length,0);while(agentHistory.length>24||chars>120000){chars-=agentHistory.shift().content.length;}}
function retireAgentReview(reason){if(activeAgentReview){const {apply,reject,status}=activeAgentReview;apply.disabled=true;reject.disabled=true;apply.onclick=null;reject.onclick=null;if(reason)status.textContent=reason;activeAgentReview=null;}}
function appendAgentNode(node){const log=$('agentMessages');log.append(node);while(log.children.length>80)log.firstElementChild.remove();if($('agentPanel').hidden){$('agentNotification').hidden=false;return;}if(agentScrollFrame===null)agentScrollFrame=requestAnimationFrame(()=>{log.scrollTop=log.scrollHeight;agentScrollFrame=null;});}
function updateAgentContext(){
  const sel=selection&&selection.id===chapter().id&&chapter().text.slice(selection.start,selection.end)===selection.text?selection:null;
  $('agentContext').textContent=`Chương: ${chapter().title}\nModel: ${state.model||'Chưa kết nối'}\nChế độ: ${state.auto?'Tự động':'Thủ công'}\nHồ sơ: ${state.profiles.length} nhân vật · Canvas: ${state.story.nodes.length} nút, ${state.story.edges.length} dây\nPhạm vi sửa: ${sel?sel.text.length+' ký tự đã chọn':state.auto?'Toàn chương':'Chưa chọn đoạn; chỉ trao đổi và điều khiển app'}`;
}
function agentMessage(role,text){const item=document.createElement('div');item.className='chat-message '+role;const label=document.createElement('span');label.className='chat-role';label.textContent=role==='user'?'BẠN':'MẠCH VĂN AGENT';const body=document.createElement('div');body.textContent=text;item.append(label,body);appendAgentNode(item);return item;}
function agentSnapshot(){syncStoryTitles();return JSON.stringify({chapters:state.chapters,skills:state.skills,custom:state.custom,current:state.current,auto:state.auto,overview:state.overview,profiles:state.profiles,story:state.story,project_epoch:projectEpoch});}
function captureAgentContext(){
  const c=chapter(),sel=selection&&selection.id===c.id&&c.text.slice(selection.start,selection.end)===selection.text?{...selection}:null;
  return {project_epoch:projectEpoch,overview:state.overview,profiles:profileKnowledge(),story:canvasAgentGraph(),canvas_attachments:canvasAttachmentData(),colored_passages:coloredPassages(c),chapters:state.chapters.map(c=>({id:c.id,title:c.title})),current:{id:c.id,title:c.title,text:c.text,characters:state.profiles.map(p=>p.name)},editing_scope:sel?{kind:'selection',...sel}:state.auto?{kind:'chapter',start:0,end:c.text.length,text:c.text}:{kind:'none'},skills:skillDefs.filter(s=>state.skills.includes(s[0])).map(s=>({id:s[0],instruction:s[2]})),custom_style:state.custom};
}
function actionSummary(a){
 const c=state.chapters.find(c=>c.id===a.chapter_id);const title=c?.title||'';
 switch(a.type){
 case'navigate':return 'Mở trang: '+({write:'Bản thảo',overview:'Kịch bản tổng',characters:'Hồ sơ nhân vật',canvas:'Canvas cốt truyện',skills:'Kỹ năng AI',settings:'Ollama'}[a.view]||a.view);
 case'switch_chapter':return 'Chuyển đến chương: '+title;
 case'create_chapter':return 'Tạo chương rỗng: '+a.title;
 case'rename_chapter':return `Đổi tên “${title}” → “${a.title}”`;
 case'update_overview':return 'Cập nhật kịch bản tổng';
 case'replace_marked_text':return 'Sửa đoạn màu · '+(coloredPassages().find(m=>m.id===a.mark_id)?.colorName||a.mark_id);
 case'create_reference_story_node':return 'Canvas · Thêm thẻ '+(a.kind==='chapter'?'chương: '+(state.chapters.find(c=>c.id===a.ref_id)?.title||a.ref_id):'nhân vật: '+(state.profiles.find(p=>p.id===a.ref_id)?.name||a.ref_id));
 case'set_story_node_state':return 'Canvas · '+Object.entries(a).filter(([k])=>['pinned','highlighted'].includes(k)).map(([k,v])=>(k==='pinned'?'Ghim vị trí':'Làm nổi bật')+': '+(v?'Bật':'Tắt')).join(', ');
 case'update_story_note':return 'Canvas · Sửa ghi chú: '+a.description;
 case'replace_text':return 'Sửa văn bản trong phạm vi đã chia sẻ';
 case'create_profile':return 'Tạo hồ sơ: '+a.name;
 case'update_profile':return 'Sửa hồ sơ: '+(state.profiles.find(p=>p.id===a.profile_id)?.name||a.profile_id);
 case'create_story_node':return 'Canvas · Tạo nút: '+a.title;
 case'update_story_node':return 'Canvas · Sửa nút: '+a.title;
 case'move_story_node':return `Canvas · Di chuyển “${storyNode(a.node_id)?.title||a.node_id}” đến (${a.x}, ${a.y})`;
 case'connect_story_nodes':return `Canvas · Nối ${storyNode(a.from)?.title||a.from} → ${storyNode(a.to)?.title||a.to} · ${STORY_EDGE_LABELS[a.kind]}: ${a.label}`;
 case'update_story_edge':return 'Canvas · Sửa quan hệ '+STORY_EDGE_LABELS[a.kind]+': '+a.label;
 case'set_skill':return `${a.enabled?'Bật':'Tắt'} kỹ năng: ${skillDefs.find(s=>s[0]===a.skill_id)?.[1]||a.skill_id}`;
 default:throw Error('Thao tác không được hỗ trợ.');
 }
}
function runAgentAction(a,context){
 let target=state.chapters.find(c=>c.id===a.chapter_id);
 switch(a.type){
 case'navigate':if(!['write','overview','characters','canvas','skills','settings'].includes(a.view))throw Error('Trang không hợp lệ.');view(a.view);break;
 case'switch_chapter':{const i=state.chapters.findIndex(c=>c.id===a.chapter_id);if(i<0)throw Error('Chương không tồn tại.');state.current=i;selection=null;cursor=0;revision++;pending=null;$('resultBox').hidden=true;clearTimeout(timer);render();save();view('write');break;}
 case'create_chapter':state.chapters.push({id:crypto.randomUUID(),title:a.title,text:''});renderChapters();save();break;
 case'rename_chapter':if(!target)throw Error('Chương không tồn tại.');target.title=a.title;render();save();break;
 case'create_profile':case'update_profile':applyProfileAction(a);break;
 case'create_reference_story_node':case'set_story_node_state':case'update_story_note':applyExtendedStoryAction(a);break;
 case'create_story_node':case'update_story_node':case'move_story_node':case'connect_story_nodes':case'update_story_edge':applyStoryAction(a);break;
 case'set_skill':if(!skillDefs.some(s=>s[0]===a.skill_id))throw Error('Kỹ năng không hợp lệ.');state.skills=a.enabled?[...new Set([...state.skills,a.skill_id])]:state.skills.filter(id=>id!==a.skill_id);renderSkills();save();break;
 case'update_overview':state.overview={...state.overview,...a.fields};renderOverview();save();break;
 case'replace_marked_text':{
 const mark=target?.marks?.find(m=>m.id===a.mark_id),original=context.colored_passages.find(m=>m.id===a.mark_id);
 if(!mark||!original||target.id!==chapter().id||target.text.slice(mark.start,mark.end)!==original.text)throw Error('Đoạn màu đã thay đổi.');
 remember();replaceChapterRange(target,mark.start,mark.end,a.text,mark.id);revision++;selection=null;pending=null;clearTimeout(timer);$('resultBox').hidden=true;render();save();break;}
 case'replace_text':{
 const scope=context.editing_scope;
 if(!target||target.id!==context.current.id||target.text!==context.current.text||!['selection','chapter'].includes(scope.kind))throw Error('Phạm vi sửa đã thay đổi hoặc chưa được chọn.');
 if(target.id!==chapter().id)throw Error('Hãy về chương được chọn và gửi lại yêu cầu.');
 if(target.text.slice(scope.start,scope.end)!==scope.text)throw Error('Đoạn chọn đã thay đổi.');
 remember();replaceChapterRange(target,scope.start,scope.end,a.text);revision++;selection=null;pending=null;clearTimeout(timer);$('resultBox').hidden=true;render();save();break;}
 default:throw Error('Thao tác không được hỗ trợ.');
 }
 return actionSummary(a);
}
function showAgentPlan(actions,context,snapshot){
 retireAgentReview('Kế hoạch đã được thay bằng đề xuất mới.');
 const box=document.createElement('div');box.className='agent-plan';const heading=document.createElement('h2');heading.textContent='Đề xuất thay đổi · Chờ bạn duyệt';box.append(heading);
 actions.forEach(a=>{const p=document.createElement('p');p.textContent=actionSummary(a);box.append(p);if(['replace_text','replace_marked_text'].includes(a.type)){const before=document.createElement('pre'),after=document.createElement('pre');before.textContent='TRƯỚC\n'+(a.type==='replace_marked_text'?context.colored_passages.find(m=>m.id===a.mark_id)?.text:context.editing_scope.text);after.textContent='SAU\n'+a.text;box.append(before,after);}else if(a.type==='update_overview'){const detail=document.createElement('pre');detail.textContent=Object.entries(a.fields).map(([k,v])=>({premise:'Ý tưởng chính',synopsis:'Diễn biến tổng thể',ending:'Kết thúc'}[k])+': '+v).join('\n');box.append(detail);}else if(['create_story_node','update_story_node'].includes(a.type)){const detail=document.createElement('pre');detail.textContent=STORY_NODE_LABELS[a.kind]+'\n'+a.description;box.append(detail);}else if(['create_profile','update_profile'].includes(a.type)){const detail=document.createElement('pre');const fields=a.fields||a;detail.textContent=PROFILE_FIELDS.filter(k=>fields[k]).map(k=>({name:'Tên',role:'Vai trò',personality:'Tính cách',likes:'Sở thích',dislikes:'Không thích',goals:'Mục tiêu',fears:'Nỗi sợ',backstory:'Quá khứ',voice:'Giọng nói',relationships:'Quan hệ'}[k])+': '+fields[k]).join('\n');box.append(detail);}});
 const apply=document.createElement('button'),reject=document.createElement('button'),status=document.createElement('p');apply.className='primary';apply.textContent='Duyệt và thực hiện';reject.className='plain';reject.textContent='Bỏ qua';
 apply.onclick=()=>{
 if(agentSnapshot()!==snapshot){retireAgentReview();status.textContent='Trạng thái app đã thay đổi. Hãy gửi lại yêu cầu để tránh sửa nhầm.';recordAgentHistory({role:'assistant',content:'Kế hoạch bị hủy vì ngữ cảnh đã thay đổi.'});return;}
 // Preflight before any mutation; execution is synchronous on the captured state.
 if(actions.some(a=>a.chapter_id&&!state.chapters.some(c=>c.id===a.chapter_id))){status.textContent='Chương không tồn tại.';return;}
 const backup=JSON.stringify(state),backupHistory=JSON.stringify([...history]),backupStoryHistory=[...storyHistory];
 try{if(actions.some(a=>a.type.includes('story_')))rememberStory();const receipts=actions.map(a=>runAgentAction(a,context));retireAgentReview();status.textContent='Đã thực hiện:\n'+receipts.join('\n');recordAgentHistory({role:'assistant',content:'App đã thực hiện: '+receipts.join('; ')});updateAgentContext();toast('Agent đã thực hiện thay đổi bạn duyệt.');}catch(e){state=JSON.parse(backup);history.clear();for(const [id,entries] of JSON.parse(backupHistory))history.set(id,entries);storyHistory=backupStoryHistory;undoChapter=null;render();retireAgentReview();status.textContent='Đã hủy toàn bộ kế hoạch: '+e.message;recordAgentHistory({role:'assistant',content:'Thực thi bị dừng: '+e.message});}
 };
 reject.onclick=()=>{retireAgentReview();status.textContent='Đã bỏ qua. Không thay đổi dữ liệu.';recordAgentHistory({role:'assistant',content:'Tác giả đã bỏ qua kế hoạch.'});};box.append(apply,reject,status);activeAgentReview={apply,reject,status};appendAgentNode(box);
}
$('selectForAgent').onclick=()=>{toggleAgent(false);view('write');$('editor').focus({preventScroll:true});};document.querySelectorAll('.agent-example').forEach(b=>b.onclick=()=>{$('agentInput').value=b.textContent;$('agentInput').focus();});
$('clearChat').onclick=()=>{if(agentRunning)return toast('Chờ agent hoàn tất yêu cầu hiện tại.');retireAgentReview();agentHistory.length=0;$('agentMessages').replaceChildren();agentMessage('assistant','Đã bắt đầu cuộc trò chuyện mới. Bạn muốn tôi hỗ trợ điều gì?');};
$('agentForm').onsubmit=async e=>{
 e.preventDefault();if(agentRunning)return;if(aiRuntime.busy){toast('AI đang xử lý yêu cầu trước. Hãy chờ hoàn tất.');return;}$('agentError').hidden=true;
 if(!state.model){toast('Mở Ollama đã cài sẵn, rồi bấm kiểm tra kết nối.');view('settings');return;}
 const text=$('agentInput').value.trim();if(!text)return;
 const context=captureAgentContext(),snapshot=agentSnapshot(),previous=agentHistory.slice(-12);
 agentMessage('user',text);recordAgentHistory({role:'user',content:text});$('agentInput').value='';agentRunning=true;clearTimeout(timer);retireAgentReview('Đã gửi yêu cầu mới; kế hoạch trước không còn áp dụng.');
 try{
 const wireContext={...context,editing_scope:{...context.editing_scope}};if(wireContext.editing_scope.kind==='chapter')delete wireContext.editing_scope.text;const d=await requestAI('/api/agent',{model:state.model,text,context:wireContext,history:previous});
 if(context.project_epoch!==projectEpoch)throw Error('Dự án đã thay đổi trong lúc agent xử lý. Gửi lại yêu cầu.');
 if(typeof d.message!=='string'||!Array.isArray(d.actions))throw Error('Phản hồi agent không hợp lệ.');
 agentMessage('assistant',d.message);recordAgentHistory({role:'assistant',content:d.message+'\nKế hoạch (chưa thực hiện): '+JSON.stringify(d.actions)});
 if(d.actions.length){
 if(agentSnapshot()!==snapshot){agentMessage('assistant','Bản thảo hoặc trạng thái app đã thay đổi trong lúc xử lý. Tôi chưa thực hiện thao tác; hãy gửi lại yêu cầu.');recordAgentHistory({role:'assistant',content:'App đã hủy kế hoạch do trạng thái thay đổi.'});return;}
 const immediate=d.actions.filter(a=>['navigate','switch_chapter'].includes(a.type)),changes=d.actions.filter(a=>!['navigate','switch_chapter'].includes(a.type));
 if(changes.length){showAgentPlan(changes,context,snapshot);if(immediate.length)agentMessage('assistant','Các thao tác chuyển trang/chương trong kế hoạch sẽ chưa chạy để giữ nguyên phạm vi chỉnh sửa. Bạn có thể yêu cầu mở trang ở lượt tiếp theo.');}
 else{const receipts=immediate.map(a=>runAgentAction(a,context));agentMessage('assistant','Đã thực hiện: '+receipts.join('; '));recordAgentHistory({role:'assistant',content:'App đã thực hiện: '+receipts.join('; ')});toast(receipts.join('; '));}
 }
 }catch(e){$('agentError').textContent=e.message;$('agentError').hidden=false;agentMessage('assistant','Chưa thực hiện: '+e.message);recordAgentHistory({role:'assistant',content:'Yêu cầu thất bại, không thực hiện: '+e.message});}
 finally{agentRunning=false;notifyAIStatus();updateAgentContext();}
};
agentMessage('assistant','Chào bạn. Tôi dùng model Qwen có sẵn trên Ollama để cùng bạn biên tập và điều khiển app. Tôi đọc hồ sơ nhân vật và canvas, hỗ trợ tạo nút, nối dây và biên tập đoạn đã chọn. Bạn luôn duyệt trước khi tôi thay đổi dữ liệu.');
