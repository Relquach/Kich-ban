// Versioned project data shared by file IO, profiles, canvas and agent.
const PROFILE_FIELDS=['name','role','personality','likes','dislikes','goals','fears','backstory','voice','relationships'];
const NODE_KINDS=['event','turn','reveal','ending'];
const EDGE_KINDS=['cause','turn','reveal','sequence'];
function newProfile(name='Nhân vật mới'){return Object.fromEntries([['id',crypto.randomUUID()],...PROFILE_FIELDS.map(k=>[k,k==='name'?name:''])]);}
function plainObject(v){return v!==null&&typeof v==='object'&&!Array.isArray(v);}
function textValue(v,max=4000){if(typeof v!=='string'||v.length>max)throw Error('Nội dung dự án không hợp lệ hoặc quá dài.');return v;}
function identifier(v){textValue(v,128);if(!v.trim())throw Error('ID không hợp lệ.');return v;}
function normalizeProject(input){
 let raw=input;
 if(input?.format==='machvan-project'){if(input.version!==2)throw Error('Phiên bản file dự án chưa được hỗ trợ.');raw=input.project;}
 if(!plainObject(raw)||!Array.isArray(raw.chapters)||!raw.chapters.length||raw.chapters.length>500)throw Error('File dự án không có danh sách chương hợp lệ.');
 const chapters=raw.chapters.map(c=>{if(!plainObject(c))throw Error('Dữ liệu chương không hợp lệ.');return {id:identifier(c.id),title:textValue(c.title,200),text:textValue(c.text,2000000)};});
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
 const nodes=story.nodes.map(n=>{if(!plainObject(n)||!NODE_KINDS.includes(n.kind)||![n.x,n.y].every(v=>Number.isFinite(v)&&v>=0&&v<=5000))throw Error('Nút canvas không hợp lệ.');return {id:identifier(n.id),title:textValue(n.title,200),description:textValue(n.description,4000),kind:n.kind,x:n.x,y:n.y};});
 const nodeIds=new Set(nodes.map(n=>n.id));if(nodeIds.size!==nodes.length)throw Error('ID nút bị trùng.');
 const edges=story.edges.map(e=>{if(!plainObject(e)||!nodeIds.has(e.from)||!nodeIds.has(e.to)||e.from===e.to||!EDGE_KINDS.includes(e.kind))throw Error('Dây nối tham chiếu nút không hợp lệ.');return {id:identifier(e.id),from:e.from,to:e.to,kind:e.kind,label:textValue(e.label,500)};});
 if(new Set(edges.map(e=>e.id)).size!==edges.length)throw Error('ID dây nối bị trùng.');
 return {projectName:textValue(raw.projectName??'Dự án chưa đặt tên',200),chapters,current:raw.current,profiles,story:{nodes,edges},skills:[...new Set(raw.skills)],custom:textValue(raw.custom??'',8000),model:textValue(raw.model??'',200),auto:!!raw.auto};
}
function encodeProject(project){return JSON.stringify({format:'machvan-project',version:2,savedAt:new Date().toISOString(),project},null,2);}
