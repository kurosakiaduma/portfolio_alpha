"""
Tests for MusicEntry model validation.
Run with: backend/.venv/bin/python backend/tests/test_music.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pydantic import ValidationError
from models.music import MusicEntry


def test_playable_without_audio_url_raises():
    """MusicEntry with playable=True and no audio_url must raise ValidationError."""
    try:
        MusicEntry(title="Track", artist="Artist", playable=True, audio_url=None)
        assert False, "Expected ValidationError was not raised"
    except ValidationError as exc:
        errors = exc.errors()
        assert any("audio_url" in str(e) for e in errors), f"Unexpected errors: {errors}"
    print("PASS test_playable_without_audio_url_raises")


def test_playable_with_audio_url_ok():
    """MusicEntry with playable=True and a valid audio_url must succeed."""
    entry = MusicEntry(title="Track", artist="Artist", playable=True, audio_url="/audio/track.mp3")
    assert entry.playable is True
    assert entry.audio_url == "/audio/track.mp3"
    print("PASS test_playable_with_audio_url_ok")


def test_not_playable_without_audio_url_ok():
    """MusicEntry with playable=False and no audio_url must succeed."""
    entry = MusicEntry(title="Album", artist="Artist", playable=False)
    assert entry.playable is False
    assert entry.audio_url is None
    print("PASS test_not_playable_without_audio_url_ok")


if __name__ == "__main__":
    tests = [
        test_playable_without_audio_url_raises,
        test_playable_with_audio_url_ok,
        test_not_playable_without_audio_url_ok,
    ]
    failures = []
    for t in tests:
        try:
            t()
        except Exception as exc:
            print(f"FAIL {t.__name__}: {exc}")
            failures.append(t.__name__)

    print(f"\n{len(tests) - len(failures)}/{len(tests)} tests passed")
    if failures:
        sys.exit(1)
