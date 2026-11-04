import unittest,json
from unittest.mock import Mock
from turbo import generate_turbo
class TurboTest(unittest.TestCase):
 def test_lean_model_payload(self):
  mock=Mock(return_value={'message':{'content':'{"message":"OK","actions":[{"type":"replace_text","chapter_id":"c","text":"Đã sửa"}]}'}})
  generate_turbo(mock,{'model':'qwen','text':'Sửa chính tả','context':{'current':{'id':'c','text':'Đoạn chọn'},'names':[{'name':'Lan','aliases':'L'}],'story':{'secret':'not sent'},'overview':{'synopsis':'not sent'}}})
  wire=mock.call_args.args[1];body=json.loads(wire['messages'][-1]['content'])
  self.assertNotIn('story',body);self.assertNotIn('overview',body);self.assertEqual(len(wire['messages']),2);self.assertFalse(wire['think']);self.assertEqual(wire['options']['num_predict'],1536)
 def test_truncated_result_rejected(self):
  with self.assertRaises(ValueError):generate_turbo(Mock(return_value={'done_reason':'length'}),{'model':'q','text':'Sửa','context':{'current':{'id':'c','text':'Nội dung'}}})
if __name__=='__main__':unittest.main()
