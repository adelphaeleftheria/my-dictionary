import unittest,tempfile,json,sys
from pathlib import Path
sys.path.insert(0,'scripts')
from tatoeba import build
class TatoebaTest(unittest.TestCase):
 def test_links_and_attribution(self):
  # Explicitly synthetic structure fixture, never shipped as lexical content.
  with tempfile.TemporaryDirectory() as d:
   p=Path(d);(p/'de').write_text('1\tdeu\tTest DE\tAlice\t2020\t2021\n');(p/'en').write_text('2\teng\tTest EN\tBob\t2020\t2021\n');(p/'links').write_text('1\t2\n2\t1\n')
   r=build(p/'de',p/'en',p/'links',p/'out');pair=json.loads((p/'out').read_text());self.assertEqual(r['pairs'],1);self.assertEqual(pair['english']['contributor'],'Bob');self.assertEqual(pair['german']['license'],'CC-BY-2.0-FR');self.assertIsNone(pair['senseId'])
