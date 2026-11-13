"""Validate original starter kit format, determinism, headroom and basic role separation."""
import array, math, sys, tempfile, wave
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from make_starter_kit import generate
with tempfile.TemporaryDirectory() as tmp:
    a,b=Path(tmp)/'a',Path(tmp)/'b';files=generate(a);generate(b);crossings={};size=0
    for name in files:
        assert (a/name).read_bytes()==(b/name).read_bytes()
        with wave.open(str(a/name)) as f:
            assert (f.getnchannels(),f.getsampwidth(),f.getframerate())==(1,2,44100)
            samples=array.array('h',f.readframes(f.getnframes()))
            if sys.byteorder!='little':samples.byteswap()
        peak=max(abs(x) for x in samples)/32768
        assert .1<peak<.8
        assert max(abs(x) for x in samples[:88])>100, name+' delayed onset'
        assert abs(samples[-1])<100,name+' tail discontinuity'
        assert all(math.isfinite(x) for x in samples)
        crossings[name]=sum((x>0)!=(y>0) for x,y in zip(samples,samples[1:]))/len(samples)
        size+=(a/name).stat().st_size
    assert crossings['Hat.wav']>crossings['Kick.wav']*5
    assert size<300000
print('PASS: bundled one-shots are deterministic 16-bit / 44.1 kHz mono, start promptly, retain headroom and distinguish bright hats from low kicks; kit <300 KB.')
