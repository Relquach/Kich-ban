import unittest,json
from unittest.mock import Mock
from character_assist import suggest
class CharacterTest(unittest.TestCase):
    def payload(self,mode='dialogue'):
        return {'model':'local-qwen','text':'Lan gặp Minh sau hiểu lầm.','mode':mode,'profile':{'name':'Lan','personality':'Kín đáo','voice':'Nói ngắn','likes':'Trà xanh'},'partner':{'name':'Minh','personality':'Thẳng thắn'}}
    def test_grounding_and_mode(self):
        mock=Mock(return_value={'message':{'content':json.dumps({'suggestions':[{'dialogue':'Cậu muốn ngồi lại không?','action':'should be ignored','reason':'Hỏi gián tiếp'}]})}})
        result=suggest(mock,self.payload())
        body=json.loads(mock.call_args.args[1]['messages'][-1]['content'])
        self.assertEqual(body['profile']['voice'],'Nói ngắn')
        self.assertEqual(body['partner']['personality'],'Thẳng thắn')
        self.assertEqual(result['suggestions'][0]['action'],'')
    def test_missing_personality(self):
        p=self.payload();p['profile']={'name':'Lan'}
        with self.assertRaises(ValueError):suggest(Mock(),p)
    def test_no_empty_suggestions(self):
        mock=Mock(return_value={'message':{'content':'{"suggestions":[]}'}})
        with self.assertRaises(ValueError):suggest(mock,self.payload())
    def test_no_wrong_mode_content(self):
        mock=Mock(return_value={'message':{'content':'{"suggestions":[{"action":"walk"}]}'}})
        with self.assertRaises(ValueError):suggest(mock,self.payload())
    def test_no_truncated_content(self):
        mock=Mock(return_value={'message':{'content':'{}'},'done_reason':'length'})
        with self.assertRaises(ValueError):suggest(mock,self.payload())
if __name__=='__main__':unittest.main()
