"""The web build exports and traverses the same authored play graphs."""

import json
from pathlib import Path
import shutil
import subprocess
import unittest

from soccer_strategy.soccer_smart.play_content import build_plays
from soccer_strategy.soccer_smart.web_export import build_web_payload


class ContinuousWebTests(unittest.TestCase):
    def test_web_payload_preserves_every_play_node_and_exit(self):
        data = build_web_payload()
        self.assertEqual(len(data.get('plays',[])),24)
        self.assertEqual(len(data['play_families']),8)
        self.assertEqual(sum(len(p['nodes']) for p in data['plays']),sum(len(p.nodes) for p in build_plays()))
        self.assertNotIn('john',json.dumps(data).lower())
        for actual, expected in zip(data['plays'],build_plays()):
            self.assertEqual(actual['id'],expected.id)
            for node, original in zip(actual['nodes'],expected.nodes):
                self.assertEqual(node['exits'],[list(e) for e in original.exits])

    def test_real_node_web_graph_ui_retry_and_touch(self):
        node = shutil.which('node')
        self.assertIsNotNone(node)
        script = Path(__file__).with_name('test_play_web.js')
        result = subprocess.run([node,str(script)],capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        data = json.loads(result.stdout)
        self.assertEqual(data['plays'],24)
        self.assertEqual(data['nodes'],sum(len(p.nodes) for p in build_plays()))
        self.assertEqual(data['choices'],3*data['nodes'])


if __name__ == '__main__':
    unittest.main()
