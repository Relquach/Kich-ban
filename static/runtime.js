// Debounce serialization itself, not only the storage write.
function createDeferredSave({read,write,onState=()=>{},delay=450}){
 let timer=null,dirty=false;
 return {
  queue(){dirty=true;onState('pending');clearTimeout(timer);timer=setTimeout(()=>this.flush(),delay);},
  flush(){clearTimeout(timer);timer=null;if(!dirty)return true;try{write(read());dirty=false;onState('saved');return true;}catch(e){onState('error',e);return false;}},
  get dirty(){return dirty;}
 };
}
const aiRuntime={busy:false,controller:null};
function notifyAIStatus(){if(typeof updateAIStatus==='function')updateAIStatus();}
async function requestAI(path,payload){
 if(aiRuntime.busy)throw Error('AI đang xử lý yêu cầu trước. Hãy chờ hoàn tất rồi thử lại.');
 aiRuntime.busy=true;aiRuntime.controller=new AbortController();notifyAIStatus();
 const timeout=setTimeout(()=>aiRuntime.controller?.abort(),245000);
 try{const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:aiRuntime.controller.signal});const data=await r.json();if(!r.ok)throw Error(data.error+(data.detail?' '+data.detail:''));return data;}
 catch(e){if(e.name==='AbortError')throw Error('Máy chủ AI xử lý quá lâu. Hãy chọn đoạn ngắn hơn rồi thử lại.');throw e;}
 finally{clearTimeout(timeout);aiRuntime.busy=false;aiRuntime.controller=null;notifyAIStatus();}
}
