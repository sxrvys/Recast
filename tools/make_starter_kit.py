"""Generate Recast's original, deterministic starter one-shots (no external samples)."""
import math, random, struct, wave
from pathlib import Path
RATE=44100
FILES=('Kick.wav','Snare.wav','Hat.wav','Metal.wav','Relay.wav','Bass.wav')

def generate(folder):
    folder=Path(folder);folder.mkdir(parents=True,exist_ok=True)
    for role,(name,duration,level) in enumerate(zip(FILES,(.65,.32,.09,.5,.55,.9),(.74,.53,.29,.43,.3,.5))):
        rng=random.Random(7821+role);samples=[];previous=0.;phase=0.
        for i in range(round(RATE*duration)):
            t=i/RATE;noise=rng.uniform(-1,1);high=noise-previous;previous=noise
            if role==0:
                phase+=2*math.pi*(47+115*math.exp(-t*48))/RATE
                x=math.sin(phase)*math.exp(-t*8)+.14*high*math.exp(-t*220)
            elif role==1:
                x=.7*high*math.exp(-t*22)+.34*math.sin(2*math.pi*185*t)*math.exp(-t*24)+.13*math.sin(2*math.pi*327*t)*math.exp(-t*33)
            elif role==2:
                x=(.8*high+.15*sum(math.sin(2*math.pi*f*t) for f in (4721,6329,8731)))*math.exp(-t*65)
            elif role==3:
                x=sum(math.sin(2*math.pi*f*t)*math.exp(-t*d) for f,d in ((211,12),(593,18),(1327,25),(2801,34)))/3+.09*high*math.exp(-t*140)
            elif role==4:
                # A short dry relay sequence useful as a texture / percussion sound.
                x=0.
                for start in (0,.083,.19,.315):
                    u=t-start
                    if u>=0:x+=(.7*high+.3*math.sin(2*math.pi*780*u))*math.exp(-u*115)
            else:
                phase+=2*math.pi*55/RATE
                x=(math.sin(phase)+.18*math.sin(phase*2))*math.exp(-t*3.8)
            fade=min(1,t/.0007,(duration-t)/.008)
            samples.append(x*max(0,fade))
        peak=max(abs(x) for x in samples) or 1
        pcm=b''.join(struct.pack('<h',round(x/peak*level*32767)) for x in samples)
        with wave.open(str(folder/name),'wb') as f:
            f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(pcm)
    return list(FILES)

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('folder',type=Path)
    generate(parser.parse_args().folder)
