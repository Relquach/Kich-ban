let selectedStoryNode=null,selectedStoryEdge=null,connectSource=null,connecting=false,storyZoom=1;
let storyHistory=[],storyHistoryGroup='',storyHistoryTime=0,storyDrag=null,storyFrame=null;
const edgeViews=new Map();
const STORY_NODE_LABELS={event:'Sự kiện',turn:'Cú ngoặt',reveal:'Hé lộ',ending:'Kết cục',chapter:'Chương',character:'Nhân vật'};
const STORY_EDGE_LABELS={cause:'Nhân quả',turn:'Cú ngoặt',reveal:'Hé lộ',sequence:'Tiếp diễn',participation:'Tham gia chương',reference:'Tham chiếu'};
function rememberStory(group=''){
 const now=Date.now();if(group&&group===storyHistoryGroup&&now-storyHistoryTime<700){storyHistoryTime=now;return;}
 storyHistoryGroup=group;storyHistoryTime=now;storyHistory.push(JSON.stringify(state.story));
 let size=storyHistory.reduce((n,x)=>n+x.length*2,0);while(storyHistory.length>25||size>2*1024*1024)size-=storyHistory.shift().length*2;
}
function resetCanvasSession(){selectedStoryNode=null;selectedStoryEdge=null;connectSource=null;connecting=false;storyHistory=[];storyHistoryGroup='';storyDrag=null;if(storyFrame!==null){cancelAnimationFrame(storyFrame);storyFrame=null;}}
function storyNode(id){return state.story.nodes.find(n=>n.id===id);}
function storyEdge(id){return state.story.edges.find(e=>e.id===id);}
function storyPosition(value){return Math.max(0,Math.min(5000,Number(value)||0));}
function svgElement(tag,attrs={}){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el;}
function updateEdgeGeometry(onlyNode=null){
 const byId=new Map(state.story.nodes.map(n=>[n.id,n]));
 for(const e of state.story.edges){if(onlyNode&&e.from!==onlyNode&&e.to!==onlyNode)continue;const from=byId.get(e.from),to=byId.get(e.to),v=edgeViews.get(e.id);if(!from||!to||!v)continue;
  const right=to.x>=from.x;const x1=from.x+(right?220:0),y1=from.y+60,x2=to.x+(right?0:220),y2=to.y+60;const bend=Math.max(60,Math.abs(x2-x1)*.45)*(right?1:-1);
  v.path.setAttribute('d',`M ${x1} ${y1} C ${x1+bend} ${y1}, ${x2-bend} ${y2}, ${x2} ${y2}`);v.label.setAttribute('x',(x1+x2)/2);v.label.setAttribute('y',(y1+y2)/2-10);
 }
}
function drawStoryEdges(){
 const svg=$('storyEdges');svg.replaceChildren();edgeViews.clear();const defs=svgElement('defs');
 for(const kind of EDGE_KINDS){const marker=svgElement('marker',{id:'edge-arrow-'+kind,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.append(svgElement('path',{d:'M 0 0 L 10 5 L 0 10 z',class:'edge-fill edge-'+kind}));defs.append(marker);}svg.append(defs);
 for(const e of state.story.edges){const path=svgElement('path',{fill:'none',class:'story-wire edge-'+e.kind+(e.id===selectedStoryEdge?' selected':''),'marker-end':'url(#edge-arrow-'+e.kind+')'});const label=svgElement('text',{class:'wire-label','text-anchor':'middle'});label.textContent=(e.label||STORY_EDGE_LABELS[e.kind]).slice(0,64);const title=svgElement('title');title.textContent=e.label||STORY_EDGE_LABELS[e.kind];path.append(title);svg.append(path,label);edgeViews.set(e.id,{path,label});}
 updateEdgeGeometry();
}
function resizeStoryStage(){const w=Math.max(1100,...state.story.nodes.map(n=>n.x+280)),h=Math.max(700,...state.story.nodes.map(n=>n.y+200));$('canvasStage').style.width=w*storyZoom+'px';$('canvasStage').style.height=h*storyZoom+'px';for(const id of ['storyNodes','storyEdges']){const el=$(id);el.style.width=w+'px';el.style.height=h+'px';el.style.transform=`scale(${storyZoom})`;}$('resetZoom').textContent=Math.round(storyZoom*100)+'%';}
function selectStory(id,edge=false){selectedStoryNode=edge?null:id;selectedStoryEdge=edge?id:null;document.querySelectorAll('.story-node').forEach(b=>{b.classList.toggle('selected',b.dataset.nodeId===selectedStoryNode);b.setAttribute('aria-pressed',String(b.dataset.nodeId===selectedStoryNode));});renderStoryInspector();drawStoryEdges();}
function renderStoryInspector(){
 const n=storyNode(selectedStoryNode),e=storyEdge(selectedStoryEdge);$('nodeInspector').hidden=!n;$('edgeInspector').hidden=!e;$('canvasInspectorEmpty').hidden=!!(n||e);
 if(n){$('storyNodeTitle').value=n.title;$('storyNodeDescription').value=n.description;$('storyNodeKind').value=n.kind;$('storyNodeX').value=n.x;$('storyNodeY').value=n.y;}
 if(e){$('storyEdgeKind').value=e.kind;$('storyEdgeLabel').value=e.label;}
 const box=$('storyEdgeList');box.replaceChildren();for(const edge of state.story.edges){const b=document.createElement('button');b.className='edge-list-item'+(edge.id===selectedStoryEdge?' selected':'');b.textContent=(storyNode(edge.from)?.title||'Nút')+' → '+(storyNode(edge.to)?.title||'Nút');const small=document.createElement('small');small.textContent=STORY_EDGE_LABELS[edge.kind]+(edge.label?' · '+edge.label:'');b.append(small);b.onclick=()=>selectStory(edge.id,true);box.append(b);}
}
function renderCanvas(){
 if(!storyNode(selectedStoryNode))selectedStoryNode=null;if(!storyEdge(selectedStoryEdge))selectedStoryEdge=null;
 const nodes=$('storyNodes');nodes.replaceChildren();
 for(const n of state.story.nodes){const b=document.createElement('div');b.tabIndex=0;b.setAttribute('role','button');b.className='story-node kind-'+n.kind+(n.id===selectedStoryNode?' selected':'');b.dataset.nodeId=n.id;b.style.left=n.x+'px';b.style.top=n.y+'px';b.setAttribute('aria-pressed',String(n.id===selectedStoryNode));b.setAttribute('aria-label',n.title+' · '+STORY_NODE_LABELS[n.kind]+'. Dùng phím mũi tên để di chuyển.');const kind=document.createElement('small');kind.textContent=STORY_NODE_LABELS[n.kind];const title=document.createElement('strong');title.textContent=n.title;const desc=document.createElement('span');desc.textContent=n.description||'Bấm để thêm nội dung';b.append(kind,title,desc);b.onclick=()=>{if(connecting){if(!connectSource){connectSource=n.id;$('canvasStatus').textContent='Đã chọn nguồn “'+n.title+'”. Chọn nút đích.';}else if(connectSource!==n.id){const exists=state.story.edges.find(e=>e.from===connectSource&&e.to===n.id&&e.kind==='cause');if(exists){selectStory(exists.id,true);}else{rememberStory();const edge={id:crypto.randomUUID(),from:connectSource,to:n.id,kind:'cause',label:''};state.story.edges.push(edge);selectedStoryEdge=edge.id;selectedStoryNode=null;save();}connecting=false;connectSource=null;renderCanvas();}}else selectStory(n.id);};b.onkeydown=e=>{const delta={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];if(!delta||n.pinned||e.target?.closest?.('.story-port,.story-menu-trigger'))return;e.preventDefault();rememberStory('move-'+n.id);n.x=storyPosition(n.x+delta[0]*(e.shiftKey?0.25:1));n.y=storyPosition(n.y+delta[1]*(e.shiftKey?0.25:1));b.style.left=n.x+'px';b.style.top=n.y+'px';selectedStoryNode=n.id;selectedStoryEdge=null;resizeStoryStage();updateEdgeGeometry(n.id);renderStoryInspector();b.scrollIntoView?.({block:'nearest',inline:'nearest'});save();};nodes.append(b);}
 $('canvasEmpty').hidden=state.story.nodes.length>0;$('connectMode').setAttribute('aria-pressed',String(connecting));$('connectMode').textContent=connecting?'Hủy nối dây':'Nối dây';resizeStoryStage();drawStoryEdges();renderStoryInspector();
}
function applyStoryAction(a){
 switch(a.type){
 case'create_story_node':if(storyNode(a.node_id))throw Error('ID nút đã tồn tại.');state.story.nodes.push({id:a.node_id,title:a.title,description:a.description,kind:a.kind,x:a.x,y:a.y});break;
 case'update_story_node':{const n=storyNode(a.node_id);if(n&&['chapter','character'].includes(n.kind))throw Error('Chỉ sửa ghi chú của thẻ liên kết.');if(!n)throw Error('Nút không tồn tại.');Object.assign(n,{title:a.title,description:a.description,kind:a.kind});break;}
 case'move_story_node':{const n=storyNode(a.node_id);if(n?.pinned)throw Error('Bỏ ghim trước khi di chuyển.');if(!n)throw Error('Nút không tồn tại.');n.x=a.x;n.y=a.y;break;}
 case'connect_story_nodes':if(!storyNode(a.from)||!storyNode(a.to)||a.from===a.to)throw Error('Hai đầu dây không hợp lệ.');if(state.story.edges.some(e=>e.from===a.from&&e.to===a.to&&e.kind===a.kind))throw Error('Dây nối đã tồn tại.');state.story.edges.push({id:crypto.randomUUID(),from:a.from,to:a.to,kind:a.kind,label:a.label});break;
 case'update_story_edge':{const e=storyEdge(a.edge_id);if(!e)throw Error('Dây không tồn tại.');e.kind=a.kind;e.label=a.label;break;}
 default:throw Error('Thao tác canvas không được hỗ trợ.');
 }
 renderCanvas();save();
}
function initCanvas(){
 $('addStoryNode').onclick=()=>{rememberStory();const vp=$('canvasViewport'),n={id:crypto.randomUUID(),title:'Sự kiện mới',description:'',kind:$('newNodeKind').value,x:storyPosition(vp.scrollLeft/storyZoom+60+(state.story.nodes.length%3)*30),y:storyPosition(vp.scrollTop/storyZoom+50+(state.story.nodes.length%3)*35)};state.story.nodes.push(n);selectedStoryNode=n.id;selectedStoryEdge=null;renderCanvas();save();$('storyNodeTitle').focus();};
 $('connectMode').onclick=()=>{connecting=!connecting;connectSource=null;renderCanvas();$('canvasStatus').textContent=connecting?'Chọn nút nguồn, sau đó chọn nút đích.':'Đã thoát nối dây.';};
 $('undoCanvas').onclick=()=>{if(!storyHistory.length)return toast('Chưa có thay đổi canvas để hoàn tác.');state.story=JSON.parse(storyHistory.pop());state.story.nodes=state.story.nodes.filter(n=>!['chapter','character'].includes(n.kind)||referenceSource(n));const ids=new Set(state.story.nodes.map(n=>n.id));state.story.edges=state.story.edges.filter(e=>ids.has(e.from)&&ids.has(e.to));storyHistoryGroup='';renderCanvas();save();};
 function zoom(value){storyZoom=Math.max(.4,Math.min(1.6,Math.round(value*10)/10));resizeStoryStage();}
 $('zoomIn').onclick=()=>zoom(storyZoom+.1);$('zoomOut').onclick=()=>zoom(storyZoom-.1);$('resetZoom').onclick=()=>zoom(1);
 for(const [id,key] of [['storyNodeTitle','title'],['storyNodeDescription','description'],['storyNodeKind','kind'],['storyNodeX','x'],['storyNodeY','y']])$(id).oninput=()=>{const n=storyNode(selectedStoryNode);if(!n||(['x','y'].includes(key)&&n.pinned)||(['title','kind'].includes(key)&&['chapter','character'].includes(n.kind)))return;rememberStory('node-'+n.id+'-'+key);n[key]=['x','y'].includes(key)?storyPosition($(id).value):$(id).value;const node=Array.from($('storyNodes').children).find(b=>b.dataset.nodeId===n.id);if(node){if(key==='title')node.querySelector('strong').textContent=n.title;if(key==='description')node.querySelector('span').textContent=n.description;if(key==='kind'){node.className='story-node kind-'+n.kind+' selected'+(n.pinned?' pinned':'')+(n.highlighted?' highlighted':'');node.querySelector('small').textContent=STORY_NODE_LABELS[n.kind];}node.style.left=n.x+'px';node.style.top=n.y+'px';}resizeStoryStage();drawStoryEdges();save();};
 for(const [id,key] of [['storyEdgeKind','kind'],['storyEdgeLabel','label']])$(id).oninput=()=>{const edge=storyEdge(selectedStoryEdge);if(!edge)return;rememberStory('edge-'+edge.id+'-'+key);edge[key]=$(id).value;drawStoryEdges();save();};
 for(const id of ['storyNodeTitle','storyNodeDescription','storyNodeKind','storyEdgeKind','storyEdgeLabel'])$(id).onchange=renderStoryInspector;
 $('deleteStoryNode').onclick=()=>{if(!selectedStoryNode)return;rememberStory();state.story.nodes=state.story.nodes.filter(n=>n.id!==selectedStoryNode);state.story.edges=state.story.edges.filter(e=>e.from!==selectedStoryNode&&e.to!==selectedStoryNode);selectedStoryNode=null;renderCanvas();save();};
 $('deleteStoryEdge').onclick=()=>{if(!selectedStoryEdge)return;rememberStory();state.story.edges=state.story.edges.filter(e=>e.id!==selectedStoryEdge);selectedStoryEdge=null;renderCanvas();save();};
 $('canvasAskAI').onclick=()=>{toggleAgent(true);$('agentInput').value='Đọc canvas cốt truyện hiện tại, kiểm tra quan hệ nhân quả và đề xuất chỉnh sửa. Không tự thêm biến cố khi tôi chưa yêu cầu.';$('agentInput').focus();};
 const stage=$('canvasStage');stage.addEventListener('pointerdown',e=>{const node=e.target.closest?.('.story-node');if(!node||connecting||e.button!==0||e.target.closest?.('.story-port')||e.target.closest?.('.story-menu-trigger'))return;const n=storyNode(node.dataset.nodeId);if(!n||n.pinned)return;selectStory(n.id);storyDrag={id:n.id,node,startX:e.clientX,startY:e.clientY,x:n.x,y:n.y,moved:false};stage.setPointerCapture(e.pointerId);});
 stage.addEventListener('pointermove',e=>{if(!storyDrag)return;const d=storyDrag,n=storyNode(d.id);if(!n)return;const dx=(e.clientX-d.startX)/storyZoom,dy=(e.clientY-d.startY)/storyZoom;if(!d.moved&&Math.hypot(dx,dy)<4)return;if(!d.moved){rememberStory();d.moved=true;}n.x=storyPosition(d.x+dx);n.y=storyPosition(d.y+dy);if(storyFrame===null)storyFrame=requestAnimationFrame(()=>{d.node.style.left=n.x+'px';d.node.style.top=n.y+'px';updateEdgeGeometry(n.id);$('storyNodeX').value=Math.round(n.x);$('storyNodeY').value=Math.round(n.y);storyFrame=null;});});
 const finish=e=>{if(!storyDrag)return;const moved=storyDrag.moved;storyDrag=null;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(moved){resizeStoryStage();save();}};stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);
}
