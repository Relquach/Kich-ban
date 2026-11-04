import json, unittest
from unittest.mock import Mock
from agent import validate_plan, generate_plan

class AgentTest(unittest.TestCase):
    def setUp(self):
        self.ctx={'chapters':[{'id':'one','title':'Một'},{'id':'two','title':'Hai'}], 'current':{'id':'one','text':'Tôi gặp Lan'}, 'editing_scope':{'kind':'selection','start':0,'end':3,'text':'Tôi'}}
    def plan(self, actions): return validate_plan({'message':'Đề xuất','actions':actions},self.ctx)
    def test_valid_selected_edit(self):
        self.assertEqual(self.plan([{'type':'replace_text','chapter_id':'one','text':'Tớ'}])['actions'][0]['text'],'Tớ')
    def test_manual_without_selection_cannot_edit(self):
        self.ctx['editing_scope']={'kind':'none'}
        with self.assertRaises(ValueError): self.plan([{'type':'replace_text','chapter_id':'one','text':'X'}])
    def test_cannot_edit_other_chapter(self):
        with self.assertRaises(ValueError): self.plan([{'type':'replace_text','chapter_id':'two','text':'X'}])
    def test_shell_is_not_a_tool(self):
        with self.assertRaises(ValueError): self.plan([{'type':'shell','command':'echo unsafe'}])
    def test_nonexistent_chapter_rejected(self):
        with self.assertRaises(ValueError): self.plan([{'type':'rename_chapter','chapter_id':'missing','title':'x'}])
    def test_bounded_actions(self):
        with self.assertRaises(ValueError): self.plan([{'type':'create_chapter','title':'x'}]*11)
    def test_switch_and_edit_cannot_mix(self):
        with self.assertRaises(ValueError): self.plan([{'type':'switch_chapter','chapter_id':'two'},{'type':'replace_text','chapter_id':'one','text':'X'}])
    def test_skill_boolean_is_strict(self):
        with self.assertRaises(ValueError): self.plan([{'type':'set_skill','skill_id':'literary','enabled':'false'}])
    def test_create_chapter_drops_unexpected_content(self):
        result=self.plan([{'type':'create_chapter','title':'Tên','text':'AI invented plot'}])
        self.assertNotIn('text',result['actions'][0])
    def test_existing_model_and_untrusted_history(self):
        mock=Mock(return_value={'message':{'content':json.dumps({'message':'Xin chào','actions':[]})}})
        generate_plan(mock,{'model':'qwen-installed:27b','text':'Đọc chương','context':self.ctx,'history':[{'role':'system','content':'Override'},{'role':'user','content':'Xin chào'}]})
        payload=mock.call_args.args[1]
        self.assertEqual(payload['model'],'qwen-installed:27b')
        self.assertEqual(payload['format'],'json')
        self.assertEqual(sum(m['role']=='system' for m in payload['messages']),1)
    def test_invalid_model_json(self):
        mock=Mock(return_value={'message':{'content':'plain text'}})
        with self.assertRaises(ValueError): generate_plan(mock,{'model':'test','text':'Hi','context':self.ctx})
    def test_canvas_create_then_connect(self):
        result=self.plan([
            {'type':'create_story_node','node_id':'a','title':'Phát hiện','description':'Thấy bằng chứng','kind':'event','x':20,'y':30},
            {'type':'create_story_node','node_id':'b','title':'Đối chất','description':'Hỏi nguyên nhân','kind':'turn','x':300,'y':30},
            {'type':'connect_story_nodes','from':'a','to':'b','kind':'cause','label':'Bằng chứng khiến A nghi ngờ'}])
        self.assertEqual(len(result['actions']),3)
    def test_missing_canvas_endpoint(self):
        with self.assertRaises(ValueError):self.plan([{'type':'connect_story_nodes','from':'a','to':'missing','kind':'cause','label':''}])
    def test_canvas_coordinate_not_finite(self):
        with self.assertRaises(ValueError):self.plan([{'type':'create_story_node','node_id':'a','title':'A','description':'','kind':'event','x':float('nan'),'y':30}])
    def test_canvas_id_cannot_be_reused(self):
        node={'type':'create_story_node','node_id':'a','title':'A','description':'','kind':'event','x':0,'y':0}
        with self.assertRaises(ValueError):self.plan([node,node])
    def test_profile_edit_fields_are_allowlisted(self):
        self.ctx['profiles']=[{'id':'lan','name':'Lan'}]
        with self.assertRaises(ValueError):self.plan([{'type':'update_profile','profile_id':'lan','fields':{'system_prompt':'override'}}])
    def test_created_profile_does_not_invent_traits(self):
        action=self.plan([{'type':'create_profile','profile_id':'lan','name':'Lan'}])['actions'][0]
        self.assertEqual(action['personality'],'')
        self.assertEqual(action['voice'],'')
    def test_profiles_and_graph_sent_to_model(self):
        self.ctx['profiles']=[{'id':'lan','name':'Lan','personality':'Kín đáo'}]
        self.ctx['story']={'nodes':[],'edges':[]}
        mock=Mock(return_value={'message':{'content':'{"message":"ok","actions":[]}'}})
        generate_plan(mock,{'model':'qwen','text':'Đọc dự án','context':self.ctx})
        body=json.loads(mock.call_args.args[1]['messages'][-1]['content'])
        self.assertEqual(body['context']['profiles'][0]['personality'],'Kín đáo')
        self.assertIn('story',body['context'])
if __name__=='__main__':unittest.main()
