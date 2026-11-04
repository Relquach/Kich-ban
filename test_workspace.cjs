const assert=require('node:assert/strict');const {createApp}=require('./test_dom.cjs');
(async()=>{
 const old={chapters:[{id:'c1',title:'Chương cũ',text:'Tôi và Lan gặp nhau.',characters:['Tôi','Lan']}],current:0,skills:['literary'],custom:'',model:'qwen:local',auto:false};
 const app=createApp({stored:old});const {run,$}=app;await Promise.resolve();await Promise.resolve();
 assert.equal(run('state.profiles.length'),2);assert.equal(run('state.chapters[0].text'),old.chapters[0].text);assert.equal(run('state.profiles[1].personality'),'');
 assert.equal($('storyNodes').children.length,0);
 $('addProfile').click();$('profile-name').value='Minh';$('profileForm').fire('input',{target:$('profile-name')});$('profile-personality').value='Kín đáo, sợ làm người khác buồn';$('profileForm').fire('input',{target:$('profile-personality')});assert.equal(run('state.profiles.at(-1).personality'),'Kín đáo, sợ làm người khác buồn');
 run('view("canvas")');$('addStoryNode').click();$('storyNodeTitle').value='A phát hiện bí mật';$('storyNodeTitle').fire('input');$('addStoryNode').click();$('storyNodeTitle').value='A chất vấn B';$('storyNodeTitle').fire('input');
 assert.equal(run('state.story.nodes.length'),2);$('connectMode').click();$('storyNodes').children[0].click();$('storyNodes').children[1].click();assert.equal(run('state.story.edges.length'),1);
 $('storyEdgeLabel').value='Vì bằng chứng mâu thuẫn';$('storyEdgeLabel').fire('input');assert.equal(run('state.story.edges[0].label'),'Vì bằng chứng mâu thuẫn');
 run('selectStory(state.story.nodes[0].id)');$('deleteStoryNode').click();assert.equal(run('state.story.edges.length'),0);$('undoCanvas').click();assert.equal(run('state.story.nodes.length'),2);assert.equal(run('state.story.edges.length'),1);
 const encoded=run('encodeProject(state)');const project=run('normalizeProject(JSON.parse(encodeProject(state)))');assert.equal(project.profiles.at(-1).name,'Minh');assert.equal(project.story.edges[0].label,'Vì bằng chứng mâu thuẫn');
 const bad=JSON.parse(encoded);bad.project.story.edges[0].to='missing';app.context.bad=bad;assert.throws(()=>run('normalizeProject(bad)'),/dây nối|Dây nối/);
 const captured=run('captureAgentContext()');assert.equal(captured.profiles.length,3);assert.equal(captured.story.edges.length,1);
 let written='';app.window.showSaveFilePicker=async()=>({name:'test.machvan.json',createWritable:async()=>({write:async t=>written=t,close:async()=>{}})});await run('saveProjectFile()');assert.equal(JSON.parse(written).format,'machvan-project');assert.equal(JSON.parse(written).project.story.nodes.length,2);
 run('applyOpenedProject(normalizeProject(JSON.parse('+JSON.stringify(encoded)+')))');assert.equal(run('state.profiles.at(-1).name'),'Minh');assert.equal(run('state.story.edges.length'),1);assert.equal(run('projectEpoch'),1);
 // A character request carries the stored profile, partner, context and generation mode.
 app.context.fetch=async(path,options)=>{if(path==='/api/models')return{ok:true,json:async()=>({models:[{name:'qwen:local'}]})};const payload=JSON.parse(options.body);assert.equal(payload.profile.name,'Minh');assert.equal(payload.profile.personality,'Kín đáo, sợ làm người khác buồn');assert.equal(payload.mode,'dialogue');return {ok:true,json:async()=>({suggestions:[{dialogue:'Cậu có điều gì muốn nói với tôi không?',action:'',thought:'',reason:'Hỏi gián tiếp vì kín đáo'}]})};};
 $('sceneContext').value='Minh phát hiện bạn giấu chuyện.';await run('suggestCharacter("dialogue",state.profiles.at(-1).id)');assert.equal($('characterSuggestions').children.length,1);const before=run('chapter().text');$('characterSuggestions').querySelector('button').click();assert.ok(run('chapter().text').includes('Minh:'));assert.notEqual(run('chapter().text'),before);
 console.log('Workspace simulation passed: boot, legacy migration, profile editing, canvas create/connect/edit/delete/undo, file round-trip/save, agent context, grounded dialogue request and reviewed insertion.');
})().catch(e=>{console.error(e);process.exit(1)});
