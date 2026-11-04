let selectedProfileId=null,characterRequestSerial=0;
function currentProfile(){return state.profiles.find(p=>p.id===selectedProfileId);}
function refreshProfileSelectors(){
 for(const id of ['quickCharacter','suggestCharacter','suggestPartner']){
  const select=$(id),previous=select.value;select.replaceChildren();
  const empty=document.createElement('option');empty.value='';empty.textContent=id==='suggestPartner'?'Không chỉ định':'Chọn hồ sơ nhân vật';select.append(empty);
  for(const p of state.profiles){const option=document.createElement('option');option.value=p.id;option.textContent=p.name||'Chưa đặt tên';select.append(option);}
  select.value=state.profiles.some(p=>p.id===previous)?previous:'';
 }
}
function renderProfileList(){const list=$('profileList');list.replaceChildren();for(const p of state.profiles){const b=document.createElement('button');b.className='profile-item'+(p.id===selectedProfileId?' selected':'');b.textContent=p.name||'Chưa đặt tên';b.setAttribute('aria-pressed',String(p.id===selectedProfileId));b.onclick=()=>{selectedProfileId=p.id;renderCharacters();$('suggestCharacter').value=p.id;};list.append(b);}}
function renderCharacters(){
 if(!state.profiles.some(p=>p.id===selectedProfileId))selectedProfileId=state.profiles[0]?.id||null;
 renderProfileList();refreshProfileSelectors();const p=currentProfile();$('profileEmpty').hidden=!!p;$('profileForm').hidden=!p;
 if(p){for(const key of PROFILE_FIELDS)$('profile-'+key).value=p[key];if(!$('suggestCharacter').value)$('suggestCharacter').value=p.id;}
}
function profileKnowledge(){return state.profiles.map(p=>({...p}));}
function initCharacters(){
 $('addProfile').onclick=()=>{const p=newProfile();state.profiles.push(p);selectedProfileId=p.id;renderCharacters();save();$('profile-name').focus();};
 $('openProfiles').onclick=()=>view('characters');
 $('profileForm').onsubmit=e=>e.preventDefault();
 $('profileForm').oninput=e=>{const key=e.target.id.replace('profile-',''),p=currentProfile();if(!p||!PROFILE_FIELDS.includes(key))return;p[key]=e.target.value;save();if(key==='name'){renderProfileList();refreshProfileSelectors();}};
 $('deleteProfile').onclick=()=>{const p=currentProfile();if(!p||!confirm('Xóa hồ sơ '+p.name+'? Các thẻ canvas liên kết cũng bị xóa. Nội dung truyện đã viết sẽ được giữ.'))return;rememberStory();const removed=new Set(state.story.nodes.filter(n=>n.kind==='character'&&n.refId===p.id).map(n=>n.id));state.story.nodes=state.story.nodes.filter(n=>!removed.has(n.id));state.story.edges=state.story.edges.filter(e=>!removed.has(e.from)&&!removed.has(e.to));state.profiles=state.profiles.filter(x=>x.id!==p.id);selectedProfileId=null;characterRequestSerial++;$('characterSuggestions').replaceChildren();renderCharacters();save();};
 document.querySelectorAll('[data-character-mode]').forEach(b=>b.onclick=()=>{
  const quick=!!b.closest('.character-quick');const id=$(quick?'quickCharacter':'suggestCharacter').value;
  if(!id)return toast('Chọn một hồ sơ nhân vật trước.');
  suggestCharacter(b.dataset.characterMode,id,quick);
 });
}
function suggestionText(option,profile,mode){const blocks=[];if(option.dialogue)blocks.push(profile.name+': “'+option.dialogue+'”');if(option.action)blocks.push(option.action);if(option.thought)blocks.push(profile.name+' nghĩ: '+option.thought);return blocks.join('\n');}
async function suggestCharacter(mode,id,quick=false){
 if(aiRuntime.busy)return toast('AI đang xử lý yêu cầu trước.');
 if(!state.model){toast('Chọn model Ollama trong Cài đặt.');return view('settings');}
 const profile=state.profiles.find(p=>p.id===id);if(!profile)return toast('Hồ sơ không tồn tại.');
 if(!['personality','voice','likes','goals','fears'].some(k=>profile[k].trim())){view('characters');selectedProfileId=id;renderCharacters();toast('Hãy bổ sung tính cách, giọng nói hoặc sở thích cho nhân vật trước.');return;}
 const c=chapter(),contextText=$('sceneContext').value.trim()||(selection?.id===c.id?selection.text:c.text);
 if(!contextText.trim()){view('characters');return toast('Nhập bối cảnh cho cảnh truyện trước khi tạo gợi ý.');}
 const target={id:c.id,text:c.text,at:Math.min(selection?.id===c.id?selection.end:cursor,c.text.length),epoch:projectEpoch};
 const profileSnapshot=JSON.stringify(state.profiles),serial=++characterRequestSerial;
 const partner=state.profiles.find(p=>p.id===$('suggestPartner').value&&p.id!==id)||null;
 if(quick){selectedProfileId=id;view('characters');renderCharacters();$('suggestCharacter').value=id;}
 $('characterSuggestions').replaceChildren();$('characterStatus').textContent='Đang đọc hồ sơ '+profile.name+' và bối cảnh…';
 try{
  const d=await requestAI('/api/character',{model:state.model,text:contextText,mode,profile,partner,skills:state.custom});
  if(serial!==characterRequestSerial||target.epoch!==projectEpoch||JSON.stringify(state.profiles)!==profileSnapshot){$('characterStatus').textContent='Hồ sơ hoặc dự án đã thay đổi. Hãy tạo lại gợi ý.';return;}
  $('characterStatus').textContent='Gợi ý cho '+profile.name+' · Bạn sửa và chọn trước khi chèn.';
  d.suggestions.forEach((option,i)=>{
   const card=document.createElement('div');card.className='suggestion-card';const h=document.createElement('h3');h.textContent='Phương án '+(i+1);const label=document.createElement('label');label.textContent='Nội dung có thể chỉnh sửa';const edit=document.createElement('textarea');edit.value=suggestionText(option,profile,mode);edit.setAttribute('aria-label','Phương án '+(i+1));label.append(edit);const reason=document.createElement('p');reason.textContent=option.reason||'';const apply=document.createElement('button');apply.className='plain';apply.textContent='Chèn vào bản thảo';
   apply.onclick=()=>{if(target.epoch!==projectEpoch||chapter().id!==target.id||chapter().text!==target.text||JSON.stringify(state.profiles)!==profileSnapshot)return toast('Bản thảo hoặc hồ sơ đã đổi. Tạo lại gợi ý để tránh chèn sai.');const value=edit.value.trim();if(!value)return;remember();const insert='\n'+value+'\n';replaceChapterRange(chapter(),target.at,target.at,insert);revision++;cursor=target.at+insert.length;selection=null;pending=null;clearTimeout(timer);$('resultBox').hidden=true;apply.disabled=true;render();save();view('write');$('editor').focus();$('editor').setSelectionRange(cursor,cursor);toast('Đã chèn phương án bạn chọn. Có thể hoàn tác.');};
   card.append(h,label,reason,apply);$('characterSuggestions').append(card);
  });
 }catch(e){$('characterStatus').textContent=e.message;}
}
function applyProfileAction(a){
 if(a.type==='create_profile'){if(state.profiles.some(p=>p.id===a.profile_id))throw Error('ID hồ sơ đã tồn tại.');const p={id:a.profile_id,...Object.fromEntries(PROFILE_FIELDS.map(k=>[k,a[k]||'']))};state.profiles.push(p);}
 else if(a.type==='update_profile'){const p=state.profiles.find(p=>p.id===a.profile_id);if(!p)throw Error('Hồ sơ không tồn tại.');for(const [k,v] of Object.entries(a.fields)){if(!PROFILE_FIELDS.includes(k))throw Error('Trường hồ sơ không hợp lệ.');p[k]=v;}}
 else throw Error('Thao tác hồ sơ không được hỗ trợ.');
 renderCharacters();save();
}
