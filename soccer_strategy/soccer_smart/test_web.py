"""Tests for the static GitHub Pages web bundle, JS parity, and local serving."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
from threading import Thread
import unittest
from urllib.request import urlopen

from soccer_strategy.soccer_smart.catalog import build_catalog, build_practice_cards
from soccer_strategy.soccer_smart.model import transfer_scene
from soccer_strategy.soccer_smart.presentation import (
    ball_height,
    card_height,
    card_positions,
    positions,
    route_destination,
)
from soccer_strategy.soccer_smart.web_export import (
    DEFAULT_DOCS,
    REQUIRED_WEB_FILES,
    build_web_payload,
    export_web,
    format_bundle,
    verify_web_export,
)


def _seed_html_and_js(docs: Path) -> None:
    (docs / "soccer_smart").mkdir(parents=True, exist_ok=True)
    (docs / "index.html").write_text("<!DOCTYPE html>\n<html></html>\n", encoding="utf-8")
    (docs / "soccer_smart/index.html").write_text("<!DOCTYPE html>\n<html></html>\n", encoding="utf-8")
    (docs / "soccer_smart/app.js").write_text("// clean ascii\n", encoding="utf-8")


class WebExportTests(unittest.TestCase):
    def test_committed_docs_bundle_is_complete_and_in_sync(self) -> None:
        live = build_web_payload()
        self.assertNotIn("john", json.dumps(live).lower())
        stats = verify_web_export(DEFAULT_DOCS)
        self.assertEqual(stats["web_files"], len(REQUIRED_WEB_FILES))
        self.assertEqual(stats["scenes"], 65)
        self.assertEqual(stats["cards"], 31)
        self.assertEqual(stats["lessons"], 57)
        payload = json.loads((DEFAULT_DOCS / "soccer_smart/data.json").read_text(encoding="utf-8"))
        self.assertEqual(payload, json.loads(format_bundle(live)[0]))
        for rel in REQUIRED_WEB_FILES:
            content = (DEFAULT_DOCS / rel).read_text(encoding="utf-8")
            self.assertNotIn("john", content.lower(), f"Found 'john' in {rel}")
        first_actors = payload["starter_scenes"][0]["actors"]
        self.assertTrue(any(a["key"] == "you" and a["label"] == "YOU" for a in first_actors))

    def test_export_and_negative_controls_for_missing_whitespace_and_drift(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            docs = Path(folder)
            with self.assertRaisesRegex(ValueError, "Missing web file"):
                verify_web_export(docs)
            _seed_html_and_js(docs)
            counts = export_web(docs)
            self.assertEqual(counts["starter_scenes"], 36)
            self.assertEqual(counts["book_scenes"], 29)
            self.assertEqual(verify_web_export(docs)["scenes"], 65)

            (docs / "index.html").write_text("non-ascii \u2603\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "ASCII or whitespace"):
                verify_web_export(docs)

            (docs / "index.html").write_text("trailing space \n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "ASCII or whitespace"):
                verify_web_export(docs)

            (docs / "index.html").write_text("tab\tcharacter\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "ASCII or whitespace"):
                verify_web_export(docs)

            _seed_html_and_js(docs)
            (docs / "soccer_smart/data.json").write_text("{}\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "out of sync"):
                verify_web_export(docs)

            export_web(docs)
            (docs / "soccer_smart/data.js").write_text("window.SOCCER_SMART_DATA = {};\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "out of sync"):
                verify_web_export(docs)

    def test_web_geometry_and_presentation_match_python(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node)
        assert node is not None
        scene = build_catalog()[0]
        card = build_practice_cards()[0]
        py_pos, py_ball = positions(scene, "outcome", 0.5, 0)
        py_bh = ball_height(scene, "outcome", 0.5, 0)
        py_dest = route_destination(scene.choices[0])
        py_tx = transfer_scene(scene, 0.96).ball
        py_cpos, py_cball = card_positions(card, 0.5)
        py_ch = card_height(card, 0.5)
        script = (
            'const fs=require("fs"),d=JSON.parse(fs.readFileSync("docs/soccer_smart/data.json","utf8")),'
            'w=require("./docs/soccer_smart/app.js"),s=d.starter_scenes[0],c=d.starter_cards[0],'
            'p=w.positions(s,"outcome",0.5,0),cp=w.cardPositions(c,0.5);'
            'console.log(JSON.stringify({you:p.actors.you,ball:p.ball,bh:w.ballHeight(s,"outcome",0.5,0),'
            'dest:w.routeDestination(s.choices[0]),tx:w.transferScene(s,0.96).ball,'
            'cyou:cp.actors.you,cball:cp.ball,ch:w.cardHeight(c,0.5)}));'
        )
        out = subprocess.run([node, "-e", script], cwd=DEFAULT_DOCS.parent, check=True,
                             capture_output=True, text=True).stdout
        js = json.loads(out)
        self.assertAlmostEqual(js["you"][0], py_pos["john"][0])
        self.assertAlmostEqual(js["ball"][1], py_ball[1])
        self.assertAlmostEqual(js["bh"], py_bh)
        self.assertEqual(tuple(js["dest"]), py_dest)
        self.assertAlmostEqual(js["tx"][0], py_tx[0])
        self.assertAlmostEqual(js["cyou"][0], py_cpos["john"][0])
        self.assertAlmostEqual(js["cball"][1], py_cball[1])
        self.assertAlmostEqual(js["ch"], py_ch)

    def test_web_ui_touch_two_tap_book_and_local_storage(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node)
        assert node is not None
        script = (
            'const fs=require("fs"),d=JSON.parse(fs.readFileSync("docs/soccer_smart/data.json","utf8")),'
            'w=require("./docs/soccer_smart/app.js"),st={},'
            'ms={getItem:(k)=>st[k]||null,setItem:(k,v)=>{st[k]=v;}},'
            'ctx={font:"16px sans-serif",measureText:(s)=>({width:s.length*7.2}),fillText(){},'
            'fillRect(){},strokeRect(){},beginPath(){},roundRect(){},rect(){},fill(){},stroke(){},'
            'arc(){},ellipse(){},moveTo(){},lineTo(){},closePath(){}},'
            'app=new w.SoccerSmartWebApp(d,{getContext:()=>ctx},ms);'
            'app.activate("stage:1");app.handleKeyDown(" ");'
            'const b=app.buttons()[0].rect,pt=[b.x+10,b.y+10];'
            'app.handlePointerDown(pt,"touch");'
            'if(app.session.phase!=="decide"||app.touchPreviewChoice!==0)process.exit(2);'
            'app.handlePointerDown(pt,"touch");'
            'if(app.session.phase!=="outcome"||app.touchPreviewChoice!==null)process.exit(3);'
            'const firstRating=Object.values(app.session.results)[0];'
            'app.handleKeyDown(" ");app.handleKeyDown("c");app.handleKeyDown(" ");'
            'app.handleKeyDown("r");app.handleKeyDown(" ");app.handleKeyDown("2");app.handleKeyDown(" ");'
            'if(Object.values(app.session.results)[0]!==firstRating)process.exit(4);'
            'for(const sc of d.starter_scenes.concat(d.book_scenes)){'
            'app.session.scenes=[sc];app.session.index=0;app.session.selected=0;'
            'for(const ph of ["observe","decide","outcome","feedback","coach"]){'
            'app.session.phase=ph;app.draw();if(app.layoutErrors.length)process.exit(5);}}'
            'app.activate("book");'
            'for(const [cat] of d.categories){app.activate("book_category:"+cat);'
            'for(const e of app.book.visible){app.activate("book_entry:"+e.page);app.draw();'
            'if(app.layoutErrors.length)process.exit(6);app.handleKeyDown("b");}}'
            'console.log(JSON.stringify({saved:Object.keys(JSON.parse(st.soccer_smart_progress_v1)).length}));'
        )
        run = subprocess.run([node, "-e", script], cwd=DEFAULT_DOCS.parent, check=True,
                             capture_output=True, text=True)
        self.assertGreaterEqual(json.loads(run.stdout)["saved"], 1)

    def test_local_http_serving_delivers_all_static_assets(self) -> None:
        handler = partial(SimpleHTTPRequestHandler, directory=str(DEFAULT_DOCS))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            port = server.server_port
            for rel in REQUIRED_WEB_FILES:
                with urlopen(f"http://127.0.0.1:{port}/{rel}", timeout=5) as resp:
                    self.assertEqual(resp.status, 200)
                    body = resp.read().decode("utf-8")
                    self.assertGreater(len(body), 20)
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
