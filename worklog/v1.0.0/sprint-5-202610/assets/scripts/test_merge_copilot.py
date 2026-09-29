"""Exercise the import's history and source-worktree safety with a real Git fixture."""

import json
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("merge-copilot.py")


class ImportTest(unittest.TestCase):
    def test_history_tags_overlays_and_source_isolation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source = root / "source"
            source.mkdir()

            def git(*args):
                return subprocess.check_output(["git", "-C", str(source), *args]).decode().strip()

            git("init", "-q", "-b", "main")
            git("config", "user.name", "Fixture")
            git("config", "user.email", "fixture@localhost")
            for path in ["dts-copilot-ai/src/App.java", "dts-copilot-webapp/app.js", ".env", "build.sh"]:
                dest = source / path
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_text("fixture-only\n")
            git("add", ".")
            git("commit", "-qm", "fixture baseline")
            git("tag", "-a", "v1", "-m", "fixture tag")
            revision = git("rev-parse", "HEAD")
            (source / "build.sh").write_text("pending change\n")
            (source / "scripts").mkdir()
            (source / "scripts/load-env.sh").write_text("pending untracked file\n")
            before = git("status", "--porcelain")
            manifests = []
            for name in ["first", "second"]:
                output = root / name
                command = ["python3", str(SCRIPT), "--source", str(source), "--revision", revision,
                           "--output", str(output), "--overlay", "build.sh", "--overlay", "scripts/load-env.sh"]
                subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                manifests.append(json.loads((output / "manifest.json").read_text()))
                imported = output / "repo"
                paths = subprocess.check_output(["git", "-C", str(imported), "log", "--all",
                                                 "--format=", "--name-only"]).decode().splitlines()
                self.assertFalse(any(".env" in p or "webapp" in p for p in paths))
                self.assertTrue((imported / "engine/engine-ai/src/App.java").is_file())
                self.assertEqual("pending change\n", (imported / "engine/deploy/legacy/build.sh").read_text())
                self.assertEqual(["copilot-v1"], manifests[-1]["import_tags"])
                self.assertEqual(before, git("status", "--porcelain"))
                self.assertEqual(revision, git("rev-parse", "HEAD"))
                repeated = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                self.assertNotEqual(0, repeated.returncode, "existing output must be refused")
            self.assertEqual(manifests[0], manifests[1])
            invalid = subprocess.run(["python3", str(SCRIPT), "--source", str(source), "--revision", revision,
                                      "--output", str(root / "invalid"), "--overlay", ".env"],
                                     stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            self.assertNotEqual(0, invalid.returncode)
            self.assertFalse((root / "invalid").exists())


if __name__ == "__main__":
    unittest.main()
