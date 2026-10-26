"""Generate provisional local Japanese audio. Requires pyopenjtalk, scipy, ffmpeg."""
import json, pathlib, subprocess, tempfile, sys
import numpy as np
import pyopenjtalk
from scipy.io import wavfile
root=pathlib.Path(__file__).resolve().parent.parent
words = [word for name in ('japanese-pilot.json', 'japanese-hiragana.json') for word in json.loads((root/'content'/name).read_text())['words']]
for word in words:
    target=root/'public/audio'/f"{word['id']}.mp3"
    if target.exists() and '--force' not in sys.argv:
        continue
    waveform, rate=pyopenjtalk.tts(word['jp'])
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        wavfile.write(tmp.name, rate, waveform.astype(np.int16))
        subprocess.run(['ffmpeg','-loglevel','error','-y','-i',tmp.name,'-codec:a','libmp3lame','-b:a','64k',str(target)],check=True)
    print(word['id'],flush=True)
