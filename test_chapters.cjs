const assert=require('node:assert/strict');
const {createApp}=require('./test_dom.cjs');
(async()=>{
 const app=createApp(),{run,$}=app;
 await Promise.resolve();await Promise.resolve();
 run(`state.chapters=[
  {id:'c1',title:'Khởi đầu',text:'Lan gặp Tâm.',marks:[{id:'m1',color:'red',start:0,end:3}]},
  {id:'c2',title:'Bí mật',text:'Bản thảo đang viết.',marks:[]},
  {id:'c3',title:'Kết thúc',text:'Họ trở về.',marks:[]}
 ];state.current=1;
 state.profiles=[{...newProfile('Lan'),id:'p1'}];
 state.story={nodes:[
  {id:'nc1',kind:'chapter',refId:'c1',title:'Khởi đầu',description:'Ghi chú riêng',x:50,y:50,pinned:true,highlighted:true},
  {id:'nc2',kind:'chapter',refId:'c2',title:'Bí mật',description:'',x:350,y:50},
  {id:'np',kind:'character',refId:'p1',title:'Lan',description:'',x:50,y:250},
  {id:'ne',kind:'event',title:'Gặp nhau',description:'',x:350,y:250}
 ],edges:[
  {id:'e1',from:'nc1',to:'np',kind:'participation',label:'Xuất hiện'},
  {id:'e2',from:'nc1',to:'ne',kind:'cause',label:'Khởi nguồn'},
  {id:'e3',from:'nc2',to:'ne',kind:'reference',label:'Giữ lại'}
 ]};render();`);
 assert.equal($('chapters').querySelectorAll('.chapter-delete').length,3);
 // Cancel does not modify content, undo state, canvas or request epoch.
 const original=run('JSON.stringify(state)'),epoch=run('projectEpoch');
 app.context.confirm=()=>false;
 $('chapters').querySelector('.chapter-delete').click();
 assert.equal(run('JSON.stringify(state)'),original);
 assert.equal(run('projectEpoch'),epoch);
 assert.equal($('undoDeleteChapter').hidden,true);
 app.context.confirm=()=>true;
 run('sendCanvasNodeToAgent("nc1");startStoryConnection("nc1");rememberStory()');
 run('showAgentPlan([{type:"create_chapter",title:"Đề xuất cũ"}],captureAgentContext(),agentSnapshot())');
 const oldApply=$('agentMessages').children.at(-1).querySelector('.primary');
 $('chapters').querySelector('.chapter-delete').click();
 assert.equal(run('chapter().id'),'c2');
 assert.equal(run('chapter().text'),'Bản thảo đang viết.');
 assert.equal(run('state.chapters.length'),2);
 assert.equal(run('state.story.nodes.some(n=>n.refId==="c1")'),false);
 assert.deepEqual(run('state.story.edges.map(e=>e.id)'),['e3']);
 assert.equal(run('canvasAttachments.length'),0);
 assert.equal(run('connectSource'),null);
 assert.equal(run('storyHistory.length'),0);
 assert.equal(oldApply.disabled,true);
 assert.equal(run('projectEpoch'),epoch+1);
 assert.equal($('undoDeleteChapter').hidden,false);
 // Saving after deletion remains a valid project; undo preserves intervening edits.
 assert.equal(run('normalizeProject(JSON.parse(encodeProject(state))).chapters.length'),2);
 run('chapter().text="Đã viết thêm sau khi xóa";state.story.nodes.find(n=>n.id==="ne").description="Giữ thay đổi mới"');
 $('undoDeleteChapter').click();
 assert.equal(run('chapter().id'),'c1');
 assert.equal(run('chapter().text'),'Lan gặp Tâm.');
 assert.equal(run('chapter().marks[0].color'),'red');
 assert.equal(run('state.chapters[1].text'),'Đã viết thêm sau khi xóa');
 assert.equal(run('storyNode("nc1").description'),'Ghi chú riêng');
 assert.equal(run('storyNode("nc1").pinned'),true);
 assert.equal(run('storyNode("ne").description'),'Giữ thay đổi mới');
 assert.equal(run('state.story.edges.length'),3);
 assert.equal(run('normalizeProject(JSON.parse(encodeProject(state))).story.edges.length'),3);
 assert.equal($('undoDeleteChapter').hidden,true);
 // Deleting the active chapter chooses its neighbor, then undo returns to it.
 run('deleteChapter("c2")');assert.equal(run('chapter().id'),'c1');
 run('state.current=1;deleteChapter("c3")');assert.equal(run('chapter().id'),'c1');
 $('undoDeleteChapter').click();assert.equal(run('chapter().id'),'c3');
 // A reference wire cannot be restored if its other endpoint was removed later.
 run('deleteChapter("c1");state.story.nodes=state.story.nodes.filter(n=>n.id!=="np")');
 $('undoDeleteChapter').click();
 assert.equal(run('state.story.edges.some(e=>e.id==="e1")'),false);
 assert.equal(run('state.story.edges.some(e=>e.id==="e2")'),true);
 assert.equal(run('normalizeProject(JSON.parse(encodeProject(state))).chapters.length'),2);
 // Reopening a project ends the old project's undo session.
 run('deleteChapter("c1");applyOpenedProject(normalizeProject(JSON.parse(encodeProject(state))))');
 assert.equal($('undoDeleteChapter').hidden,true);
 $('undoDeleteChapter').click();assert.equal(run('state.chapters.some(c=>c.id==="c1")'),false);
 // The last chapter is replaced with an empty editable draft.
 const last=createApp(),l=last.run;
 l('chapter().text="Không làm mất khi hoàn tác";chapter().marks=[{id:"m",color:"blue",start:0,end:5}];render()');
 const lastId=l('chapter().id');
 last.$('chapters').querySelector('.chapter-delete').click();
 assert.equal(l('state.chapters.length'),1);assert.equal(l('chapter().text'),'');
 last.$('undoDeleteChapter').click();
 assert.equal(l('state.chapters.length'),1);assert.equal(l('chapter().id'),lastId);
 assert.equal(l('chapter().marks[0].color'),'blue');
 last.$('chapters').querySelector('.chapter-delete').click();
 l('chapter().text="Đã viết trong chương trống mới"');
 last.$('undoDeleteChapter').click();
 assert.equal(l('state.chapters.length'),2);
 assert.equal(l('state.chapters[1].text'),'Đã viết trong chương trống mới');
 assert.equal(l('normalizeProject(JSON.parse(encodeProject(state))).chapters.length'),2);
 console.log('Chapter deletion passed: cancel, active/inactive chapters, reference cleanup, undo, marks, pending review invalidation, file round-trip, project switch and last-chapter editing.');
})().catch(e=>{console.error(e);process.exit(1)});
