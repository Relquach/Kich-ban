// Execution checks with an in-memory DOM stub; no browser/model required.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function el(){return {children:[],append(...xs){this.children.push(...xs)},scrollIntoView(){},replaceChildren(){this.children=[]},style:{},classList:{toggle(){}},value:''};}
const els=new Map();const context=vm.createContext({console,crypto:require('node:crypto').webcrypto,clearTimeout(){},document:{createElement:el,querySelectorAll:()=>[]},$:id=>{if(!els.has(id))els.set(id,el());return els.get(id);},state:{chapters:[{id:'one',title:'Một',text:'Tôi gặp Lan.',characters:[]}],current:0,skills:['literary'],custom:'',auto:false,model:'qwen'},selection:{id:'one',start:0,end:3,text:'Tôi'},cursor:0,revision:0,pending:null,timer:null,skillDefs:[['literary','Văn chương','Giữ giọng văn']],render(){},save(){},renderChapters(){},renderSkills(){},renderCharacters(){},view(){},toast(){},remember(){}});
vm.runInContext('function chapter(){return state.chapters[state.current]}',context);
vm.runInContext(fs.readFileSync('static/agent-ui.js','utf8'),context);
const run=s=>vm.runInContext(s,context);
assert.equal(run('captureAgentContext().editing_scope.kind'),'selection');
run('const captured=captureAgentContext(); runAgentAction({type:"replace_text",chapter_id:"one",text:"Tớ"},captured)');
assert.equal(context.state.chapters[0].text,'Tớ gặp Lan.');
assert.throws(()=>run('runAgentAction({type:"replace_text",chapter_id:"one",text:"X"},captured)'),/thay đổi/);
run('state.auto=false;selection=null');assert.equal(run('captureAgentContext().editing_scope.kind'),'none');
run('state.auto=true');assert.equal(run('captureAgentContext().editing_scope.kind'),'chapter');
run('showAgentPlan([{type:"create_chapter",title:"Mới"}],captureAgentContext(),agentSnapshot())');
let plan=els.get('agentMessages').children.at(-1);context.state.chapters[0].text+=' Changed';plan.children.find(e=>e.className==='primary').onclick();assert.equal(context.state.chapters.length,1);
run('showAgentPlan([{type:"create_chapter",title:"Mới"}],captureAgentContext(),agentSnapshot())');plan=els.get('agentMessages').children.at(-1);plan.children.find(e=>e.className==='primary').onclick();assert.equal(context.state.chapters.length,2);assert.equal(context.state.chapters[1].text,'');
run('runAgentAction({type:"set_skill",skill_id:"literary",enabled:false},captureAgentContext())');assert.equal(context.state.skills.length,0);
assert.throws(()=>run('runAgentAction({type:"shell"},captureAgentContext())'),/không được hỗ trợ/);
console.log('Agent execution checks passed: scope boundaries, stale plans, approval, empty chapters, skills, unsupported tools.');
