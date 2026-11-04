import json, threading, unittest, urllib.request, urllib.error
from http.server import ThreadingHTTPServer
from unittest.mock import patch
from server import Handler

class IntegrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.http = ThreadingHTTPServer(('127.0.0.1',0), Handler)
        cls.base = 'http://127.0.0.1:'+str(cls.http.server_port)
        threading.Thread(target=cls.http.serve_forever, daemon=True).start()
    @classmethod
    def tearDownClass(cls):
        cls.http.shutdown()
        cls.http.server_close()
    def request(self, path, data=None):
        req=urllib.request.Request(self.base+path, data=None if data is None else json.dumps(data).encode(),headers={'Content-Type':'application/json'})
        return urllib.request.urlopen(req)
    def test_static_workspace(self):
        with self.request('/') as r:
            self.assertIn('Mạch Văn',r.read().decode())
    def test_models(self):
        with patch.object(Handler,'ollama',return_value={'models':[{'name':'local-test:27b'}]}):
            with self.request('/api/models') as r:
                self.assertEqual(json.load(r)['models'][0]['name'],'local-test:27b')
    def test_offline_is_explicit(self):
        with patch.object(Handler,'ollama',side_effect=ConnectionError('offline')):
            with self.assertRaises(urllib.error.HTTPError) as c: self.request('/api/models')
            self.assertEqual(c.exception.code,503)
    def test_selected_text_and_skills_forwarded(self):
        with patch.object(Handler,'ollama',return_value={'message':{'content':'Đoạn đã sửa.'}}) as mock:
            with self.request('/api/assist',{'model':'local-test:27b','text':'Chỉ đoạn chọn','action':'polish','skills':'Giữ giọng kể'}) as r:
                self.assertEqual(json.load(r)['text'],'Đoạn đã sửa.')
            payload=mock.call_args.args[1]
            self.assertEqual(payload['messages'][1]['content'],'Chỉ đoạn chọn')
            self.assertIn('Giữ giọng kể',payload['messages'][0]['content'])
    def test_removed_outline_and_old_character_actions(self):
        for action in ('outline','characters'):
            with self.assertRaises(urllib.error.HTTPError) as c:
                self.request('/api/assist',{'model':'test','text':'Nội dung','action':action})
            self.assertEqual(c.exception.code,400)
    def test_profile_grounded_character_endpoint(self):
        response={'suggestions':[{'dialogue':'Cậu ổn chứ?','action':'','thought':'','reason':'Hỏi nhẹ vì kín đáo'}]}
        with patch.object(Handler,'ollama',return_value={'message':{'content':json.dumps(response)}}) as mock:
            with self.request('/api/character',{'model':'qwen','text':'Lan thấy bạn buồn','mode':'dialogue','profile':{'name':'Lan','personality':'Kín đáo','likes':'Trà'}}) as r:
                self.assertEqual(json.load(r)['suggestions'][0]['dialogue'],'Cậu ổn chứ?')
            payload=json.loads(mock.call_args.args[1]['messages'][-1]['content'])
            self.assertEqual(payload['profile']['likes'],'Trà')
    def test_agent_endpoint(self):
        context={'chapters':[{'id':'one','title':'Một'}], 'current':{'id':'one','text':'Tôi gặp Lan'}, 'editing_scope':{'kind':'none'}}
        with patch.object(Handler,'ollama',return_value={'message':{'content':'{"message":"Mở kỹ năng","actions":[{"type":"navigate","view":"skills"}]}'}}):
            with self.request('/api/agent',{'model':'installed-qwen','text':'Mở kỹ năng','context':context}) as r:
                self.assertEqual(json.load(r)['actions'][0]['view'],'skills')
    def test_agent_rejects_unavailable_edit_scope(self):
        context={'chapters':[{'id':'one','title':'Một'}], 'current':{'id':'one','text':'Tôi gặp Lan'}, 'editing_scope':{'kind':'none'}}
        with patch.object(Handler,'ollama',return_value={'message':{'content':'{"message":"Sửa","actions":[{"type":"replace_text","chapter_id":"one","text":"Đã sửa"}]}'}}):
            with self.assertRaises(urllib.error.HTTPError) as c:
                self.request('/api/agent',{'model':'installed-qwen','text':'Sửa','context':context})
            self.assertEqual(c.exception.code,400)
    def test_concurrent_inference_is_rejected(self):
        from concurrent.futures import ThreadPoolExecutor
        entered, release = threading.Event(), threading.Event()
        def slow_ollama(*args):
            entered.set()
            release.wait(3)
            return {'message':{'content':'Đã sửa'}}
        data={'model':'test','text':'Nội dung','action':'spelling'}
        with patch.object(Handler,'ollama',side_effect=slow_ollama), ThreadPoolExecutor(max_workers=1) as pool:
            first=pool.submit(self.request,'/api/assist',data)
            try:
                self.assertTrue(entered.wait(2))
                with self.assertRaises(urllib.error.HTTPError) as c:
                    self.request('/api/assist',data)
                self.assertEqual(c.exception.code,429)
            finally:
                release.set()
            first.result(timeout=2).close()
    def test_truncated_text_is_not_offered_for_apply(self):
        with patch.object(Handler,'ollama',return_value={'message':{'content':'Đoạn thiếu'},'done_reason':'length'}):
            with self.assertRaises(urllib.error.HTTPError) as c:
                self.request('/api/assist',{'model':'test','text':'Nội dung','action':'polish'})
            self.assertEqual(c.exception.code,400)
    def test_keep_model_warm(self):
        with patch.object(Handler,'ollama',return_value={'message':{'content':'OK'}}) as mock:
            self.request('/api/assist',{'model':'test','text':'Nội dung','action':'spelling'}).close()
            self.assertEqual(mock.call_args.args[1]['keep_alive'],'5m')
    def test_invalid_action(self):
        with self.assertRaises(urllib.error.HTTPError) as c:
            self.request('/api/assist',{'model':'test','text':'text','action':'delete'})
        self.assertEqual(c.exception.code,400)
if __name__=='__main__': unittest.main()
