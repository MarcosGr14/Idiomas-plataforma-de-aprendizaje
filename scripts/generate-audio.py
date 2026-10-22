"""Generate provisional local Japanese audio. Requires pyopenjtalk, scipy, ffmpeg."""
import json, pathlib, subprocess, tempfile
import numpy as np
import pyopenjtalk
from scipy.io import wavfile
root=pathlib.Path(__file__).resolve().parent.parent
for word in json.loads((root/'scripts/audio-words.json').read_text()):
    target=root/'public/audio'/f"{word['id']}.mp3"
    waveform, rate=pyopenjtalk.tts(word['text'])
    with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
        wavfile.write(tmp.name, rate, waveform.astype(np.int16))
        subprocess.run(['ffmpeg','-loglevel','error','-y','-i',tmp.name,'-codec:a','libmp3lame','-b:a','64k',str(target)],check=True)
    print(word['id'],flush=True)
