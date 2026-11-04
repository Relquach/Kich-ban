import unittest
from agent import validate_plan
class ToolsTest(unittest.TestCase):
 def setUp(self):
  self.ctx={'chapters':[{'id':'c'}],'profiles':[{'id':'p'}],'current':{'id':'c','text':'😀 Lan buồn.'},'colored_passages':[{'id':'red','color':'red','start':3,'end':11,'text':'Lan buồn'}],'story':{'nodes':[{'id':'n','kind':'event','pinned':True}],'edges':[]},'editing_scope':{'kind':'none'}}
 def plan(self,actions):return validate_plan({'message':'Kế hoạch','actions':actions},self.ctx)
 def test_reference_and_membership(self):
  result=self.plan([{'type':'create_reference_story_node','node_id':'ch','kind':'chapter','ref_id':'c','x':10,'y':10},{'type':'create_reference_story_node','node_id':'person','kind':'character','ref_id':'p','x':320,'y':10},{'type':'connect_story_nodes','from':'ch','to':'person','kind':'participation','label':'Có mặt trong chương'}])
  self.assertEqual(len(result['actions']),3)
 def test_missing_reference(self):
  with self.assertRaises(ValueError):self.plan([{'type':'create_reference_story_node','node_id':'bad','kind':'chapter','ref_id':'missing','x':0,'y':0}])
 def test_pinned_node_cannot_move(self):
  with self.assertRaises(ValueError):self.plan([{'type':'move_story_node','node_id':'n','x':30,'y':50}])
 def test_explicit_unpin_then_move(self):
  self.assertEqual(len(self.plan([{'type':'set_story_node_state','node_id':'n','pinned':False},{'type':'move_story_node','node_id':'n','x':30,'y':50}])['actions']),2)
 def test_mark_utf16_scope(self):
  self.assertEqual(self.plan([{'type':'replace_marked_text','chapter_id':'c','mark_id':'red','text':'Lan thấy lòng nặng trĩu'}])['actions'][0]['mark_id'],'red')
 def test_unknown_mark(self):
  with self.assertRaises(ValueError):self.plan([{'type':'replace_marked_text','chapter_id':'c','mark_id':'missing','text':'X'}])
 def test_stale_mark(self):
  self.ctx['colored_passages'][0]['text']='không khớp'
  with self.assertRaises(ValueError):self.plan([{'type':'replace_marked_text','chapter_id':'c','mark_id':'red','text':'X'}])
 def test_duplicate_mark_changes(self):
  action={'type':'replace_marked_text','chapter_id':'c','mark_id':'red','text':'X'}
  with self.assertRaises(ValueError):self.plan([action,action])
 def test_overview_fields(self):
  self.assertEqual(self.plan([{'type':'update_overview','fields':{'synopsis':'Tóm tắt'}}])['actions'][0]['fields']['synopsis'],'Tóm tắt')
if __name__=='__main__':unittest.main()
