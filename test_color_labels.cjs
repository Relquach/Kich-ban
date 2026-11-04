const assert=require('node:assert/strict');
const {createApp}=require('./test_dom.cjs');
const app=createApp(),{run,$}=app;
run('chapter().text="Lan đứng chờ. Trời đang mưa.";chapter().marks=[];render();selection={id:chapter().id,start:0,end:13,text:chapter().text.slice(0,13)}');
const originalText=run('chapter().text');
for(const [color,name] of Object.entries({red:'Đỏ',blue:'Xanh',yellow:'Vàng',purple:'Tím'})){
 $('markColor').value=color;$('markSelected').click();
 const passage=run('captureAgentContext().colored_passages[0]');
 assert.equal(passage.color,color);assert.equal(passage.colorName,name);
 assert.equal(passage.text,originalText.slice(0,13));
 const option=Array.from($('markColor').children).find(o=>o.value===color);
 assert.equal(option.textContent,name);
 $('agentInput').value='';$('askMarkedAgent').click();
 assert.equal($('agentInput').value,`Với các đoạn màu ${name.toLowerCase()} trong chương hiện tại, `);
 // Opening color help must not submit an inferred action or alter the draft.
 assert.equal(run('chapter().text'),originalText);
 const authorRequest=`Hãy sửa chính tả cho đoạn ${name.toLowerCase()}.`;
 $('agentInput').value=authorRequest;$('askMarkedAgent').click();
 assert.equal($('agentInput').value,authorRequest);
}
const saved=run('encodeProject(state)');app.context.saved=saved;
assert.equal(run('normalizeProject(JSON.parse(saved)).chapters[0].marks[0].color'),'purple');
assert.equal(run('normalizeProject(JSON.parse(saved)).chapters[0].marks[0].start'),0);
assert.equal(run('normalizeProject(JSON.parse(saved)).chapters[0].marks[0].end'),13);
assert.equal(run('normalizeProject(JSON.parse(saved)).chapters[0].text'),originalText);
console.log('Color-label checks passed: neutral palette and agent context, scope-only prompt, preserved author instruction, unchanged marked text and saved ranges.');
