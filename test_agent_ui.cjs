const assert=require('node:assert/strict'),{createApp}=require('./test_dom.cjs');
const app=createApp(),{run,$}=app;
run('chapter().text="Tôi gặp Lan.";selection={id:chapter().id,start:0,end:3,text:"Tôi"}');
assert.equal(run('captureAgentContext().editing_scope.kind'),'selection');
run('const captured=captureAgentContext();runAgentAction({type:"replace_text",chapter_id:chapter().id,text:"Tớ"},captured)');assert.equal(run('chapter().text'),'Tớ gặp Lan.');
assert.throws(()=>run('runAgentAction({type:"replace_text",chapter_id:chapter().id,text:"X"},captured)'),/thay đổi/);
run('state.auto=false;selection=null');assert.equal(run('captureAgentContext().editing_scope.kind'),'none');run('state.auto=true');assert.equal(run('captureAgentContext().editing_scope.kind'),'chapter');
run('showAgentPlan([{type:"create_chapter",title:"Mới"}],captureAgentContext(),agentSnapshot())');let plan=$('agentMessages').children.at(-1);run('chapter().text+=" Changed"');plan.querySelector('.primary').click();assert.equal(run('state.chapters.length'),1);
app.context.plan=[{type:'create_story_node',node_id:'a',title:'A',description:'Lý do A',kind:'event',x:20,y:20},{type:'create_story_node',node_id:'b',title:'B',description:'Hệ quả B',kind:'turn',x:320,y:20},{type:'connect_story_nodes',from:'a',to:'b',kind:'cause',label:'Vì A nên B'}];
run('showAgentPlan(plan,captureAgentContext(),agentSnapshot())');assert.equal(run('state.story.nodes.length'),0);$('agentMessages').children.at(-1).querySelector('.primary').click();assert.equal(run('state.story.nodes.length'),2);assert.equal(run('state.story.edges.length'),1);
run('showAgentPlan([{type:"create_profile",profile_id:"lan",name:"Lan",personality:"Kín đáo"}],captureAgentContext(),agentSnapshot())');$('agentMessages').children.at(-1).querySelector('.primary').click();assert.equal(run('state.profiles[0].personality'),'Kín đáo');
// Plans are atomic even if a later execution step fails.
run('showAgentPlan([{type:"create_chapter",title:"Must rollback"},{type:"connect_story_nodes",from:"a",to:"missing",kind:"cause",label:"bad"}],captureAgentContext(),agentSnapshot())');$('agentMessages').children.at(-1).querySelector('.primary').click();assert.equal(run('state.chapters.length'),1);
assert.throws(()=>run('runAgentAction({type:"shell"},captureAgentContext())'),/không được hỗ trợ/);
console.log('Agent simulation passed: selected scope, stale guard, reviewed graph creation, profile creation, atomic rollback, rejected unsupported tools.');
