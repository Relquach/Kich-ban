let projectFileHandle=null;
function projectFilename(){return (state.projectName.trim()||'du-an').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').slice(0,100)+'.machvan.json';}
function downloadProject(contents){const url=URL.createObjectURL(new Blob([contents],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=projectFilename();a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function saveProjectFile(){
 const button=$('export');button.disabled=true;
 try{
  // Snapshot only after the user picks a file, so edits made while the picker is open are included.
  if(window.showSaveFilePicker){if(!projectFileHandle)projectFileHandle=await window.showSaveFilePicker({suggestedName:projectFilename(),types:[{description:'Dự án Mạch Văn',accept:{'application/json':['.json']}}]});const contents=encodeProject(state),file=await projectFileHandle.createWritable();await file.write(contents);await file.close();toast('Đã lưu file dự án: '+projectFileHandle.name);}
  else{downloadProject(encodeProject(state));toast('Đã tải file dự án xuống. Lần sau chọn Mở dự án để tiếp tục.');}
  draftStore.flush();
 }catch(e){if(e.name!=='AbortError'){projectFileHandle=null;try{downloadProject(encodeProject(state));toast('Không ghi được vào file đã chọn. Đã tải bản sao dự án xuống.');}catch(error){toast('Chưa lưu được file: '+error.message);}}}
 finally{button.disabled=false;}
}
function applyOpenedProject(next,handle=null){
 state=next;projectFileHandle=handle;projectEpoch++;revision++;selection=null;cursor=0;pending=null;clearTimeout(timer);history.clear();undoChapter=null;resetCanvasSession();selectedProfileId=null;characterRequestSerial++;
 $('characterSuggestions').replaceChildren();$('characterStatus').textContent='';$('sceneContext').value='';$('resultBox').hidden=true;
 if(typeof retireAgentReview==='function'){retireAgentReview('Đã mở dự án khác.');agentHistory.length=0;$('agentMessages').replaceChildren();}
 render();renderSkills();save();draftStore.flush();view('write');models();
}
async function readProjectFile(file,handle=null){
 if(file.size>20*1024*1024)throw Error('File dự án tối đa 20 MB.');
 const next=normalizeProject(JSON.parse(await file.text()));
 if(!confirm('Mở dự án “'+next.projectName+'”? Hãy lưu dự án hiện tại ra file nếu bạn cần giữ bản riêng.'))return;
 applyOpenedProject(next,handle);toast('Đã mở dự án: '+next.projectName);
}
$('projectName').oninput=()=>{state.projectName=$('projectName').value;save();};
$('export').onclick=saveProjectFile;
$('import').onclick=async()=>{
 if(!window.showOpenFilePicker){$('importFile').click();return;}
 try{const [handle]=await window.showOpenFilePicker({multiple:false,types:[{description:'Dự án Mạch Văn / bản thảo JSON cũ',accept:{'application/json':['.json','.machvan']}}]});await readProjectFile(await handle.getFile(),handle);}catch(e){if(e.name!=='AbortError')toast('Không mở được dự án: '+e.message);}
};
$('importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{await readProjectFile(file);}catch(error){toast('Không mở được dự án: '+error.message);}finally{e.target.value='';}};
