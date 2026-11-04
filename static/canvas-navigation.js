let canvasPan=null;
function stopCanvasPan(){const vp=$('canvasViewport');if(!canvasPan)return;const id=canvasPan.id;canvasPan=null;vp.classList.toggle('panning',false);if(vp.hasPointerCapture(id))vp.releasePointerCapture(id);}
function initCanvasNavigation(){
 const vp=$('canvasViewport');
 vp.addEventListener('pointerdown',e=>{if(e.button!==1)return;e.preventDefault();e.stopPropagation();stopCanvasPan();canvasPan={id:e.pointerId,x:e.clientX,y:e.clientY,left:vp.scrollLeft,top:vp.scrollTop};closeCanvasMenu();vp.classList.toggle('panning',true);vp.setPointerCapture(e.pointerId);},true);
 vp.addEventListener('pointermove',e=>{if(!canvasPan||e.pointerId!==canvasPan.id)return;e.preventDefault();vp.scrollLeft=canvasPan.left-(e.clientX-canvasPan.x);vp.scrollTop=canvasPan.top-(e.clientY-canvasPan.y);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])vp.addEventListener(type,e=>{if(canvasPan&&e.pointerId===canvasPan.id)stopCanvasPan();});
 for(const type of ['mousedown','auxclick'])vp.addEventListener(type,e=>{if(e.button===1){e.preventDefault();e.stopPropagation();}},true);
 window.addEventListener('blur',stopCanvasPan);
 $('clearWireSelection').onclick=()=>{selectedStoryEdge=null;drawStoryEdges();renderStoryInspector();};
 $('focusWireEnds').onclick=()=>{
 const e=storyEdge(selectedStoryEdge);if(!e)return;const a=storyNode(e.from),b=storyNode(e.to);if(!a||!b)return;
 const left=Math.min(a.x,b.x)-40,top=Math.min(a.y,b.y)-40,w=Math.abs(a.x-b.x)+300,h=Math.abs(a.y-b.y)+210;
 storyZoom=Math.max(.4,Math.min(1,(vp.clientWidth||700)/w,(vp.clientHeight||450)/h));resizeStoryStage();vp.scrollLeft=Math.max(0,left*storyZoom);vp.scrollTop=Math.max(0,top*storyZoom);
 };
}
function updateWireFocus(){
 const edge=storyEdge(selectedStoryEdge),svg=$('storyEdges');svg.classList.toggle('has-wire-selection',!!edge);$('selectedWireInfo').hidden=!edge;
 if(edge){$('selectedWireTitle').textContent=(storyNode(edge.from)?.title||'Nút nguồn')+' → '+(storyNode(edge.to)?.title||'Nút đích');$('selectedWireText').textContent=STORY_EDGE_LABELS[edge.kind]+(edge.label?' · '+edge.label:' · Chưa có ghi chú');}
 for(const [id,v] of edgeViews){const chosen=id===selectedStoryEdge;v.path.classList.toggle('wire-selected',chosen);v.path.classList.toggle('wire-muted',!!edge&&!chosen);v.label.classList.toggle('wire-muted',!!edge&&!chosen);v.label.classList.toggle('wire-label-selected',chosen);}
 for(const el of $('storyNodes').children){const id=el.dataset.nodeId;el.classList.toggle('wire-endpoint',!!edge&&(id===edge.from||id===edge.to));el.classList.toggle('wire-unrelated',!!edge&&id!==edge.from&&id!==edge.to);}
}
const originalDrawWires=drawStoryEdges;
drawStoryEdges=function(){originalDrawWires();const svg=$('storyEdges');for(const e of state.story.edges){const v=edgeViews.get(e.id);if(!v)continue;const hit=svgElement('path',{d:v.path.getAttribute('d'),class:'wire-hit',fill:'none'});hit.setAttribute('aria-hidden','true');hit.onpointerdown=event=>{if(event.button===0)event.stopPropagation();};hit.onclick=event=>{event.stopPropagation();selectStory(e.id,true);};v.hit=hit;svg.append(hit);v.label.onclick=event=>{event.stopPropagation();selectStory(e.id,true);};}const selected=edgeViews.get(selectedStoryEdge);if(selected)svg.append(selected.path,selected.label,selected.hit);updateWireFocus();};
const originalWireGeometry=updateEdgeGeometry;
updateEdgeGeometry=function(onlyNode=null){originalWireGeometry(onlyNode);for(const v of edgeViews.values())if(v.hit)v.hit.setAttribute('d',v.path.getAttribute('d'));};
