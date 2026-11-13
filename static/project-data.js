// Versioned project data shared by file IO, profiles, canvas and agent.
const MARK_COLORS={red:'Đỏ',blue:'Xanh',yellow:'Vàng',purple:'Tím'};
const PROFILE_FIELDS=['name','aliases','role','personality','likes','dislikes','goals','fears','backstory','voice','relationships'];
const NODE_KINDS=['event','turn','reveal','ending','chapter','character'];
const EDGE_KINDS=['cause','turn','reveal','sequence','participation','reference'];
function newProfile(name='Nhân vật mới'){return Object.fromEntries([['id',crypto.randomUUID()],...PROFILE_FIELDS.map(k=>[k,k==='name'?name:''])]);}
function plainObject(v){return v!==null&&typeof v==='object'&&!Array.isArray(v);}
function textValue(v,max=4000){if(typeof v!=='string'||v.length>max)throw Error('Nội dung dự án không hợp lệ hoặc quá dài.');return v;}
function identifier(v){textValue(v,128);if(!v.trim())throw Error('ID không hợp lệ.');return v;}
function normalizeProject(input){
 let raw=input;
 if(input?.format==='machvan-project'){if(![2,3,4].includes(input.version))throw Error('Phiên bản file dự án chưa được hỗ trợ.');raw=input.project;}
 if(!plainObject(raw)||!Array.isArray(raw.chapters)||!raw.chapters.length||raw.chapters.length>500)throw Error('File dự án không có danh sách chương hợp lệ.');
 const chapters=raw.chapters.map(c=>{if(!plainObject(c))throw Error('Dữ liệu chương không hợp lệ.');const text=textValue(c.text,2000000);const marks=c.marks??[];if(!Array.isArray(marks)||marks.length>500)throw Error('Đánh dấu màu không hợp lệ.');const clean=marks.map(m=>{if(!plainObject(m)||!Object.hasOwn(MARK_COLORS,m.color)||!Number.isInteger(m.start)||!Number.isInteger(m.end)||m.start<0||m.end<=m.start||m.end>text.length)throw Error('Vị trí đánh dấu màu không hợp lệ.');return {id:identifier(m.id),color:m.color,start:m.start,end:m.end};}).sort((a,b)=>a.start-b.start);if(new Set(clean.map(m=>m.id)).size!==clean.length||clean.some((m,i)=>i>0&&m.start<clean[i-1].end))throw Error('Đánh dấu trùng hoặc chồng lấn.');return {id:identifier(c.id),title:textValue(c.title,200),text,marks:clean};});
 if(new Set(chapters.map(c=>c.id)).size!==chapters.length)throw Error('ID chương bị trùng.');
 if(!Number.isInteger(raw.current)||raw.current<0||raw.current>=chapters.length)throw Error('Chương đang chọn không hợp lệ.');
 if(!Array.isArray(raw.skills)||!raw.skills.every(k=>['literary','dialogue','tension','continuity'].includes(k)))throw Error('Danh sách kỹ năng không hợp lệ.');
 const profiles=[];
 if(raw.profiles!==undefined){if(!Array.isArray(raw.profiles)||raw.profiles.length>500)throw Error('Danh sách hồ sơ không hợp lệ.');for(const p of raw.profiles){if(!plainObject(p))throw Error('Hồ sơ không hợp lệ.');profiles.push({id:identifier(p.id),...Object.fromEntries(PROFILE_FIELDS.map(k=>[k,textValue(p[k]??'',k==='name'?200:4000)]))});}}
 else{ // Previous releases used chapter-local name lists; preserve names, never invent traits.
  for(const c of raw.chapters){if(c.characters===undefined)continue;if(!Array.isArray(c.characters))throw Error('Nhân vật cũ không hợp lệ.');for(const name of c.characters){textValue(name,200);if(name.trim()&&!profiles.some(p=>p.name===name))profiles.push(newProfile(name));}}
 }
 if(new Set(profiles.map(p=>p.id)).size!==profiles.length)throw Error('ID hồ sơ bị trùng.');
 const story=raw.story??{nodes:[],edges:[]};
 if(!plainObject(story)||!Array.isArray(story.nodes)||!Array.isArray(story.edges)||story.nodes.length>500||story.edges.length>1500)throw Error('Canvas không hợp lệ hoặc quá lớn.');
 const nodes=story.nodes.map(n=>{
  if(!plainObject(n)||!NODE_KINDS.includes(n.kind)||![n.x,n.y].every(v=>Number.isFinite(v)&&v>=0&&v<=5000))throw Error('Nút canvas không hợp lệ.');
  const linked=['chapter','character'].includes(n.kind);let refId='';
  if(linked){refId=identifier(n.refId);const source=(n.kind==='chapter'?chapters:profiles).find(x=>x.id===refId);if(!source)throw Error('Nút tham chiếu chương/nhân vật không tồn tại.');}
  for(const key of ['pinned','highlighted'])if(n[key]!==undefined&&typeof n[key]!=='boolean')throw Error('Trạng thái nút không hợp lệ.');
  return {id:identifier(n.id),title:textValue(n.title,200),description:textValue(n.description,4000),kind:n.kind,x:n.x,y:n.y,...(linked?{refId}:{}),pinned:!!n.pinned,highlighted:!!n.highlighted};
 });
 const nodeIds=new Set(nodes.map(n=>n.id));if(nodeIds.size!==nodes.length)throw Error('ID nút bị trùng.');
 const edges=story.edges.map(e=>{if(!plainObject(e)||!nodeIds.has(e.from)||!nodeIds.has(e.to)||e.from===e.to||!EDGE_KINDS.includes(e.kind))throw Error('Dây nối tham chiếu nút không hợp lệ.');return {id:identifier(e.id),from:e.from,to:e.to,kind:e.kind,label:textValue(e.label,500)};});
 if(new Set(edges.map(e=>e.id)).size!==edges.length)throw Error('ID dây nối bị trùng.');
 const editorStyle=raw.editorStyle??{family:'sans',style:'normal'};if(!plainObject(editorStyle)||!['sans','serif','mono'].includes(editorStyle.family)||!['normal','bold','italic','bolditalic'].includes(editorStyle.style))throw Error('Kiểu chữ không hợp lệ.');
 const overview=raw.overview??{};if(!plainObject(overview))throw Error('Kịch bản tổng không hợp lệ.');const summary={premise:textValue(overview.premise??'',4000),synopsis:textValue(overview.synopsis??'',20000),ending:textValue(overview.ending??'',4000)};
 return {overview:summary,editorStyle:{family:editorStyle.family,style:editorStyle.style},projectName:textValue(raw.projectName??'Dự án chưa đặt tên',200),chapters,current:raw.current,profiles,story:{nodes,edges},skills:[...new Set(raw.skills)],custom:textValue(raw.custom??'',8000),model:textValue(raw.model??'',200),auto:!!raw.auto};
}
function encodeProject(project){return JSON.stringify({format:'machvan-project',version:4,savedAt:new Date().toISOString(),project},null,2);}

// Chapter removal keeps reference cards and their wires consistent with the manuscript.
function removeProjectChapter(project,id,makeId=()=>crypto.randomUUID()){
 const index=project.chapters.findIndex(c=>c.id===id);
 if(index<0)return null;
 const activeId=project.chapters[project.current].id;
 const removed=JSON.parse(JSON.stringify(project.chapters[index]));
 const nodes=project.story.nodes.filter(n=>n.kind==='chapter'&&n.refId===id);
 const nodeIds=new Set(nodes.map(n=>n.id));
 const edges=project.story.edges.filter(e=>nodeIds.has(e.from)||nodeIds.has(e.to));
 let placeholder=null;
 if(project.chapters.length===1)placeholder={id:makeId(),title:'Chương mới',text:'',marks:[]};
 const record=JSON.parse(JSON.stringify({chapter:removed,index,nodes,edges,placeholder}));
 project.chapters.splice(index,1);
 if(placeholder)project.chapters.push(placeholder);
 const activeIndex=project.chapters.findIndex(c=>c.id===activeId);
 project.current=activeIndex>=0?activeIndex:Math.min(index,project.chapters.length-1);
 project.story.nodes=project.story.nodes.filter(n=>!nodeIds.has(n.id));
 project.story.edges=project.story.edges.filter(e=>!nodeIds.has(e.from)&&!nodeIds.has(e.to));
 return record;
}
function restoreProjectChapter(project,record){
 if(!record)throw Error('Chưa có chương đã xóa để hoàn tác.');
 if(project.chapters.some(c=>c.id===record.chapter.id))throw Error('Chương này đã tồn tại.');
 const placeholderIndex=record.placeholder?project.chapters.findIndex(c=>c.id===record.placeholder.id&&JSON.stringify(c)===JSON.stringify(record.placeholder)):-1;
 if(project.chapters.length-(placeholderIndex>=0?1:0)>=500)throw Error('Dự án đã có 500 chương. Hãy bớt một chương trước khi hoàn tác.');
 const existingNodes=new Set(project.story.nodes.map(n=>n.id)),existingEdges=new Set(project.story.edges.map(e=>e.id));
 if(record.nodes.some(n=>existingNodes.has(n.id))||record.edges.some(e=>existingEdges.has(e.id)))throw Error('ID trên canvas đã được dùng lại. Chưa thể khôi phục chương an toàn.');
 const restoredNodes=JSON.parse(JSON.stringify(record.nodes));
 const validIds=new Set([...existingNodes,...restoredNodes.map(n=>n.id)]);
 // Another endpoint may have been deleted since the chapter was removed.
 const restoredEdges=JSON.parse(JSON.stringify(record.edges.filter(e=>validIds.has(e.from)&&validIds.has(e.to))));
 if(project.story.nodes.length+restoredNodes.length>500||project.story.edges.length+restoredEdges.length>1500)throw Error('Canvas đã đầy. Hãy bớt nút hoặc dây trước khi hoàn tác.');
 if(placeholderIndex>=0)project.chapters.splice(placeholderIndex,1);
 const index=Math.min(record.index,project.chapters.length);
 project.chapters.splice(index,0,JSON.parse(JSON.stringify(record.chapter)));
 project.current=index;
 project.story.nodes.push(...restoredNodes);
 project.story.edges.push(...restoredEdges);
 return {skippedEdges:record.edges.length-restoredEdges.length};
}
