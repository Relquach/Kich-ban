const assert=require('node:assert/strict');
const {createApp}=require('./test_dom.cjs');
(async()=>{
 const app=createApp(),{run,$}=app;
 const premise='Mai muốn trở về quê nhưng phải đối diện bí mật của gia đình.';
 run('view("overview")');$('overview-premise').value=premise;$('overview-premise').fire('input');
 assert.ok($('agentContextSummary').textContent.includes('Kịch bản tổng 1/3 mục'));
 assert.ok($('agentContextSummary').textContent.includes('Canvas 0 nút'));
 assert.ok($('agentContext').textContent.includes('Ý tưởng chính: có nội dung'));
 assert.ok($('agentContext').textContent.includes('Tóm tắt diễn biến: chưa nhập'));
 const overviewSuggestion=$('agentExamples').querySelector('button');
 assert.equal(overviewSuggestion.textContent,'Đọc và góp ý cho kịch bản tổng');
 overviewSuggestion.click();
 let payload;
 app.context.fetch=async(path,options)=>{
  if(path==='/api/models')return {ok:true,json:async()=>({models:[{name:'qwen:local'}]})};
  assert.equal(path,'/api/agent');payload=JSON.parse(options.body);
  return {ok:true,json:async()=>({message:'Tôi có ý tưởng chính trong kịch bản tổng; canvas chưa có sơ đồ.',actions:[]})};
 };
 run('state.model="qwen:local"');
 await run('$("agentForm").onsubmit({preventDefault(){}})');
 assert.equal(payload.context.active_view,'overview');
 assert.equal(payload.context.overview.premise,premise);
 assert.equal(payload.context.overview.synopsis,'');assert.equal(payload.context.overview.ending,'');
 assert.equal(payload.context.story.nodes.length,0);assert.equal(payload.context.story.edges.length,0);
 // The captured payload must not change if the overview is edited later.
 const captured=run('captureAgentContext()');$('overview-premise').value='Ý tưởng mới';$('overview-premise').fire('input');
 assert.equal(captured.overview.premise,premise);
 $('overviewAskAgent').click();assert.ok($('agentInput').value.startsWith('Đọc kịch bản tổng'));
 run('view("canvas")');assert.equal($('agentExamples').querySelector('button').textContent,'Kiểm tra quan hệ nhân quả trên canvas');
 run('view("overview")');assert.equal($('agentExamples').querySelector('button').textContent,'Đọc và góp ý cho kịch bản tổng');
 console.log('Overview checks passed: visible sharing status, page-aware prompts, actual request with premise and empty canvas, immutable captured overview and overview-help button.');
})().catch(e=>{console.error(e);process.exit(1)});
