"""Ollama and OpenAI-compatible transports. Credentials live in server memory only."""
import json, os, threading, urllib.request, urllib.error
from urllib.parse import urlsplit

class SameOriginRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        old,new=urlsplit(req.full_url),urlsplit(newurl)
        if (old.scheme,old.netloc)!=(new.scheme,new.netloc):raise ValueError('API chuyển hướng sang máy chủ khác. Nhập Base URL đích chính xác trước khi gửi khóa.')
        return super().redirect_request(req,fp,code,msg,headers,newurl)

class AIProvider:
    def __init__(self):
        self.lock=threading.RLock()
        self.config={'provider':os.environ.get('AI_PROVIDER','ollama'),'base_url':os.environ.get('AI_BASE_URL',os.environ.get('OLLAMA_URL','http://127.0.0.1:11434') if os.environ.get('AI_PROVIDER','ollama')=='ollama' else 'https://api.openai.com/v1').rstrip('/'),'api_key':os.environ.get('AI_API_KEY',''),'json_mode':True}
    def public(self):
        with self.lock:return {k:v for k,v in self.config.items() if k!='api_key'}|{'has_key':bool(self.config['api_key'])}
    def configure(self,p):
        provider=p.get('provider');base=p.get('base_url','')
        if not isinstance(base,str):raise ValueError('Base URL không hợp lệ.')
        base=base.strip().rstrip('/')
        if provider not in ('ollama','openai','compatible'):raise ValueError('Loại API không hợp lệ.')
        u=urlsplit(base)
        if u.scheme not in ('http','https') or not u.hostname or u.username or u.password or u.query or u.fragment:raise ValueError('Base URL cần là http(s), không chứa khóa, tài khoản hoặc query.')
        key=p.get('api_key','')
        if not isinstance(key,str) or '\n' in key or '\r' in key:raise ValueError('Khóa API không hợp lệ.')
        mode=p.get('json_mode',True)
        if not isinstance(mode,bool):raise ValueError('JSON mode không hợp lệ.')
        with self.lock:
            same=provider==self.config['provider'] and base==self.config['base_url']
            retained=self.config['api_key'] if same and not p.get('clear_key') else ''
            self.config={'provider':provider,'base_url':base,'api_key':'' if p.get('clear_key') else key.strip() or retained,'json_mode':mode}
        return self.public()
    def redact(self,text):
        with self.lock:key=self.config['api_key']
        return str(text).replace(key,'[REDACTED]') if key else str(text)
    def request(self,url,payload,key):
        headers={'Content-Type':'application/json','Accept':'application/json'}
        if key:headers['Authorization']='Bearer '+key
        req=urllib.request.Request(url,data=None if payload is None else json.dumps(payload).encode(),headers=headers)
        with urllib.request.build_opener(SameOriginRedirect()).open(req,timeout=240) as r:return json.load(r)
    def call(self,path,payload=None):
        with self.lock:c=dict(self.config)
        if c['provider']=='ollama':return self.request(c['base_url']+path,payload,c['api_key'])
        if path=='/api/tags':
            r=self.request(c['base_url']+'/models',None,c['api_key'])
            return {'models':[{'name':m['id']} for m in r.get('data',[]) if isinstance(m,dict) and isinstance(m.get('id'),str)]}
        if path!='/api/chat' or not isinstance(payload,dict):raise ValueError('Tác vụ API không được hỗ trợ.')
        wire={'model':payload['model'],'messages':payload['messages'],'stream':False}
        options=payload.get('options',{})
        if 'temperature' in options:wire['temperature']=options['temperature']
        if 'num_predict' in options:wire['max_completion_tokens' if c['provider']=='openai' else 'max_tokens']=options['num_predict']
        if payload.get('format')=='json' and c['json_mode']:wire['response_format']={'type':'json_object'}
        r=self.request(c['base_url']+'/chat/completions',wire,c['api_key'])
        choices=r.get('choices',[])
        if not choices:raise ValueError('API không trả kết quả chat. Kiểm tra model và Base URL.')
        item=choices[0];content=item.get('message',{}).get('content')
        if not isinstance(content,str) or not content.strip():raise ValueError('API trả nội dung trống hoặc kiểu phản hồi chưa hỗ trợ.')
        return {'message':{'content':content},'done_reason':'length' if item.get('finish_reason') in ('length','content_filter') else 'stop'}

provider=AIProvider()
