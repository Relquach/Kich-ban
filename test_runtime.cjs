const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const timers=new Map();let next=0,reads=0,writes=0,status=[];
 const ctx=vm.createContext({setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id),AbortController,Error,fetch:async()=>({ok:true,json:async()=>({text:'ok'})})});
 vm.runInContext(fs.readFileSync('static/runtime.js','utf8'),ctx);
 ctx.opts={read:()=>{reads++;return 'draft';},write:()=>writes++,onState:s=>status.push(s)};
 vm.runInContext('const store=createDeferredSave(opts);for(let i=0;i<100;i++)store.queue()',ctx);
 assert.equal(reads,0);assert.equal(timers.size,1);
 [...timers.values()][0]();assert.equal(reads,1);assert.equal(writes,1);assert.equal(vm.runInContext('store.dirty',ctx),false);
 vm.runInContext('store.queue();store.flush()',ctx);assert.equal(writes,2);
 ctx.opts.write=()=>{throw Error('disk full');};vm.runInContext('const broken=createDeferredSave(opts);broken.queue();broken.flush()',ctx);assert.equal(vm.runInContext('broken.dirty',ctx),true);assert.equal(status.at(-1),'error');
 let resolveFetch;ctx.fetch=()=>new Promise(r=>resolveFetch=r);
 const first=vm.runInContext('requestAI("/api/agent",{})',ctx);assert.equal(vm.runInContext('aiRuntime.busy',ctx),true);
 await assert.rejects(vm.runInContext('requestAI("/api/assist",{})',ctx),/đang xử lý/);
 resolveFetch({ok:true,json:async()=>({message:'done'})});await first;
 assert.equal(vm.runInContext('aiRuntime.busy',ctx),false);
 ctx.fetch=async()=>({ok:false,json:async()=>({error:'Model lỗi'})});await assert.rejects(vm.runInContext('requestAI("/api/agent",{})',ctx),/Model lỗi/);assert.equal(vm.runInContext('aiRuntime.busy',ctx),false);
 console.log('Runtime checks passed: 100 queued edits -> 1 serialization/write; lifecycle flush; write failure; single AI request; recovery after failure.');
})().catch(e=>{console.error(e);process.exit(1)});
