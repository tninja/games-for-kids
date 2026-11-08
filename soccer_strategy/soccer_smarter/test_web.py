"""Tests for the static GitHub Pages Soccer Smarter web bundle, JS parity, and local serving."""

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

from soccer_strategy.soccer_smarter.content import episodes
from soccer_strategy.soccer_smarter.model import Track
from soccer_strategy.soccer_smarter.web_export import (
    DEFAULT_DOCS,
    REQUIRED_WEB_FILES,
    build_web_payload,
    export_web,
    format_bundle,
    verify_web_export,
)


def _seed_html_and_js(docs: Path) -> None:
    (docs / "soccer_smarter").mkdir(parents=True, exist_ok=True)
    (docs / "index.html").write_text("<!DOCTYPE html>\n<html></html>\n", encoding="utf-8")
    (docs / "soccer_smarter/index.html").write_text("<!DOCTYPE html>\n<html></html>\n", encoding="utf-8")
    (docs / "soccer_smarter/app.js").write_text("// clean ascii\n", encoding="utf-8")


class SmarterWebExportTests(unittest.TestCase):
    def test_committed_docs_bundle_is_complete_and_in_sync(self) -> None:
        live = build_web_payload()
        self.assertEqual(len(live["episodes"]), 14)
        self.assertNotIn("john", json.dumps(live).lower())
        stats = verify_web_export(DEFAULT_DOCS)
        self.assertEqual(stats["web_files"], len(REQUIRED_WEB_FILES))
        self.assertEqual(stats["episodes"], 14)
        self.assertEqual(stats["missions"], 7)
        self.assertEqual(stats["notebook"], 3)
        payload = json.loads((DEFAULT_DOCS / "soccer_smarter/data.json").read_text(encoding="utf-8"))
        self.assertEqual(payload, json.loads(format_bundle(live)[0]))
        for rel in REQUIRED_WEB_FILES:
            content = (DEFAULT_DOCS / rel).read_text(encoding="utf-8")
            self.assertNotIn("john", content.lower(), f"Found 'john' in {rel}")
        first_node = payload["episodes"][0]["nodes"][0]["state"]
        self.assertEqual(first_node["control"], "you")
        self.assertTrue(any(a["key"] == "you" and a["label"] == "YOU" for a in first_node["actors"]))

    def test_export_and_negative_controls_for_missing_whitespace_and_drift(self) -> None:
        with tempfile.TemporaryDirectory() as folder:
            docs = Path(folder)
            with self.assertRaisesRegex(ValueError, "Missing web file"):
                verify_web_export(docs)
            _seed_html_and_js(docs)
            counts = export_web(docs)
            self.assertEqual(counts["episodes"], 14)
            self.assertEqual(counts["missions"], 7)
            self.assertEqual(counts["notebook"], 3)
            self.assertEqual(verify_web_export(docs)["episodes"], 14)

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
            (docs / "soccer_smarter/data.json").write_text("{}\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "out of sync"):
                verify_web_export(docs)

            export_web(docs)
            (docs / "soccer_smarter/data.js").write_text("window.SOCCER_SMARTER_DATA = {};\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "out of sync"):
                verify_web_export(docs)

    def test_web_geometry_and_tracks_match_python(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node)
        assert node is not None
        ep = episodes()[0]
        root = ep.node("root")
        py_pos, py_ball = root.choices[0].motion.frame(root.state, 0.5)
        py_prev = root.choices[0].preview(root.state).points[-1]
        corner = Track("corner", ((10.0, 20.0), (50.0, 25.0), (80.0, 70.0)), 0.25)
        curve = Track("curve", ((10.0, 20.0), (50.0, 15.0), (80.0, 70.0)), 0.0)
        py_corner = corner.sample(0.625)
        py_curve = curve.sample(0.5)
        script = (
            'const fs=require("fs"),d=JSON.parse(fs.readFileSync("docs/soccer_smarter/data.json","utf8")),'
            'w=require("./docs/soccer_smarter/app.js"),r=d.episodes[0].nodes[0],'
            'fr=w.frameMotion(r.choices[0].motion,r.state,0.5),pv=w.previewChoice(r.choices[0],r.state).points.slice(-1)[0],'
            'co=w.sampleTrack({kind:"corner",points:[[10,20],[50,25],[80,70]],contact:0.25},0.625),'
            'cu=w.sampleTrack({kind:"curve",points:[[10,20],[50,15],[80,70]],contact:0},0.5);'
            'console.log(JSON.stringify({you:fr.actors.you,ball:fr.ball,pv,co,cu}));'
        )
        out = subprocess.run([node, "-e", script], cwd=DEFAULT_DOCS.parent, check=True,
                             capture_output=True, text=True).stdout
        js = json.loads(out)
        self.assertAlmostEqual(js["you"][0], py_pos["john"][0])
        self.assertAlmostEqual(js["ball"][1], py_ball[1])
        self.assertEqual(tuple(js["pv"]), py_prev)
        self.assertAlmostEqual(js["co"][0], py_corner[0])
        self.assertAlmostEqual(js["co"][1], py_corner[1])
        self.assertAlmostEqual(js["cu"][0], py_curve[0])
        self.assertAlmostEqual(js["cu"][1], py_curve[1])

    def test_web_ui_missions_predictions_notebook_and_touch(self) -> None:
        node = shutil.which("node")
        self.assertIsNotNone(node)
        assert node is not None
        script = (
            'const fs=require("fs"),d=JSON.parse(fs.readFileSync("docs/soccer_smarter/data.json","utf8")),'
            'w=require("./docs/soccer_smarter/app.js"),st={},'
            'ms={getItem:(k)=>st[k]||null,setItem:(k,v)=>{st[k]=v;}},'
            'ctx={font:"16px sans-serif",measureText:(s)=>({width:s.length*7.2}),fillText(){},'
            'fillRect(){},strokeRect(){},beginPath(){},roundRect(){},rect(){},fill(){},stroke(){},'
            'arc(){},ellipse(){},moveTo(){},lineTo(){},closePath(){}},'
            'app=new w.SoccerSmarterWebApp(d,{getContext:()=>ctx},ms);'
            'app.activate("basics");app.draw();app.activate("menu");'
            'app.activate("M01");app.activate("pause");app.activate("step");app.activate("skip");'
            'const b=app.buttons().find((x)=>x.action.startsWith("choice:")).rect,pt=[b.x+10,b.y+10];'
            'app.handlePointerDown(pt,"touch");'
            'if(app.session.phase!=="decide"||app.touchPreviewChoice!==0)process.exit(2);'
            'app.handlePointerDown(pt,"touch");'
            'if(app.session.phase!=="outcome"||app.touchPreviewChoice!==null)process.exit(3);'
            'const firstScore=app.session.results["M01.A:root"];'
            'app.activate("skip");app.activate("coach");app.activate("skip");'
            'app.activate("retry");app.activate("skip");app.activate("choice:1");app.activate("skip");'
            'if(app.session.results["M01.A:root"]!==firstScore)process.exit(4);'
            'app.activate("M04");app.activate("predict:0");app.activate("skip");'
            'app.activate("choice:0");app.activate("skip");app.activate("next");app.draw();'
            'if(app.layoutErrors.length)process.exit(5);'
            'for(const ep of d.episodes){for(const node of ep.nodes){'
            'app.session.episodes=[ep];app.session.index=0;app.session.nodeId=node.id;app.session.selected=0;'
            'for(const ph of ["predict","observe","decide","outcome","feedback","coach"]){'
            'app.session.phase=ph;app.draw();if(app.layoutErrors.length)process.exit(6);}}}'
            'for(const xid of ["X01","X02","X03"]){app.activate(xid);app.draw();'
            'while(app.notebook.step){app.draw();if(app.layoutErrors.length)process.exit(7);'
            'if(app.notebook.step.options.length)app.activate("note:0");else app.activate("note_skip");}'
            'app.draw();if(app.layoutErrors.length)process.exit(8);}'
            'console.log(JSON.stringify({saved:Object.keys(JSON.parse(st.soccer_smarter_progress_v1)).length}));'
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
