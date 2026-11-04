import unittest
from unittest.mock import Mock,patch
from ai_provider import AIProvider
class ProviderTest(unittest.TestCase):
 def setUp(self):
  with patch.dict('os.environ',{},clear=True):self.p=AIProvider()
 def test_ollama_wire_unchanged(self):
  self.p.request=Mock(return_value={'message':{'content':'ok'}})
  body={'model':'qwen','think':False,'keep_alive':'5m','messages':[]}
  self.p.call('/api/chat',body)
  self.assertEqual(self.p.request.call_args.args,('http://127.0.0.1:11434/api/chat',body,''))
 def test_compatible_maps_supported_fields(self):
  self.p.configure({'provider':'compatible','base_url':'http://127.0.0.1:1234/v1','api_key':'test-key'})
  self.p.request=Mock(return_value={'choices':[{'message':{'content':'{"message":"OK","actions":[]}'},'finish_reason':'stop'}]})
  result=self.p.call('/api/chat',{'model':'local','messages':[{'role':'user','content':'test'}],'stream':False,'think':False,'format':'json','keep_alive':'5m','options':{'temperature':.2,'num_ctx':8192,'num_predict':100}})
  url,wire,key=self.p.request.call_args.args
  self.assertEqual(url,'http://127.0.0.1:1234/v1/chat/completions');self.assertEqual(key,'test-key');self.assertEqual(wire['max_tokens'],100)
  self.assertNotIn('think',wire);self.assertNotIn('keep_alive',wire);self.assertNotIn('options',wire);self.assertEqual(wire['response_format'],{'type':'json_object'});self.assertEqual(result['done_reason'],'stop')
 def test_public_config_never_returns_key(self):
  r=self.p.configure({'provider':'openai','base_url':'https://api.openai.com/v1','api_key':'fake-secret'})
  self.assertNotIn('api_key',r);self.assertTrue(r['has_key']);self.assertNotIn('fake-secret',str(r));self.assertNotIn('fake-secret',self.p.redact('error fake-secret'))
 def test_key_not_reused_on_other_host(self):
  self.p.configure({'provider':'compatible','base_url':'https://first.invalid/v1','api_key':'fake-key'})
  self.p.configure({'provider':'compatible','base_url':'https://other.invalid/v1','api_key':''})
  self.assertFalse(self.p.public()['has_key'])
 def test_same_host_retains_or_clears_key(self):
  conf={'provider':'compatible','base_url':'https://first.invalid/v1'}
  self.p.configure(conf|{'api_key':'fake-key'});self.p.configure(conf|{'api_key':''});self.assertTrue(self.p.public()['has_key']);self.p.configure(conf|{'clear_key':True});self.assertFalse(self.p.public()['has_key'])
 def test_json_optional_and_truncation(self):
  self.p.configure({'provider':'openai','base_url':'https://api.openai.com/v1','json_mode':False})
  self.p.request=Mock(return_value={'choices':[{'message':{'content':'incomplete'},'finish_reason':'length'}]})
  result=self.p.call('/api/chat',{'model':'test','messages':[],'format':'json','options':{'num_predict':30}})
  wire=self.p.request.call_args.args[1];self.assertNotIn('response_format',wire);self.assertEqual(wire['max_completion_tokens'],30);self.assertEqual(result['done_reason'],'length')
 def test_models_normalized(self):
  self.p.configure({'provider':'compatible','base_url':'http://localhost:1234/v1'})
  self.p.request=Mock(return_value={'data':[{'id':'model-a'},{'id':'model-b'}]})
  self.assertEqual(self.p.call('/api/tags')['models'],[{'name':'model-a'},{'name':'model-b'}])
 def test_invalid_key_in_url(self):
  with self.assertRaises(ValueError):self.p.configure({'provider':'openai','base_url':'https://host.invalid/v1?api_key=secret'})
if __name__=='__main__':unittest.main()
