const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Original synthesized sound effects; one lazily unlocked context, no downloads.
export class MatchAudio {
  enabled=true;
  context=null;
  master=null;
  noise=null;
  crowd=null;
  crowdBuffer=null;
  voices=new Set();
  unlock(){
    if(!this.enabled)return;
    try{
      if(!this.context){
        const c=new AudioContext(),master=c.createGain();
        master.gain.value=.55;master.connect(c.destination);
        this.context=c;this.master=master;
        const buffer=c.createBuffer(1,Math.ceil(c.sampleRate*2),c.sampleRate),data=buffer.getChannelData(0);
        let seed=1471;
        for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
        this.noise=buffer;
      }
      if(this.context.state==="suspended"||String(this.context.state)==="interrupted")void this.context.resume().catch(()=>{});
    }catch{/* Audio is optional; never interrupt the game. */}
  }
  setEnabled(enabled){
    this.enabled=enabled;
    if(enabled)this.unlock();
    if(this.context&&this.master){
      const t=this.context.currentTime;
      this.master.gain.cancelScheduledValues(t);this.master.gain.setValueAtTime(enabled?.55:0,t);
    }
    if(!enabled){this.stopEffects();this.setCrowd(false);}
  }
  stopEffects(){
    for(const v of this.voices){try{v.stop();}catch{/* Already stopped. */}}
    this.voices.clear();
  }
  setCrowd(active){
    const c=this.context,master=this.master;
    if(!active||!this.enabled||!c||!master){
      if(this.crowd){try{this.crowd.source.stop();}catch{/* Already stopped. */}this.crowd=null;}
      return;
    }
    if(this.crowd)return;
    try{
      if(!this.crowdBuffer){
        const b=c.createBuffer(1,Math.ceil(c.sampleRate*4),c.sampleRate),d=b.getChannelData(0);
        let seed=9182,low=0,mid=0;
        for(let i=0;i<d.length;i++){
          seed=(Math.imul(seed,1664525)+1013904223)>>>0;
          const white=seed/2147483648-1,t=i/d.length;
          low=.985*low+.015*white;mid=.84*mid+.16*white;
          d[i]=(low*2.8+mid*.55)*( .75+.16*Math.sin(2*Math.PI*t*3)+.09*Math.cos(2*Math.PI*t*7) );
        }
        this.crowdBuffer=b;
      }
      const source=c.createBufferSource(),gain=c.createGain();
      source.buffer=this.crowdBuffer;source.loop=true;gain.gain.value=.24;
      source.connect(gain);gain.connect(master);
      source.onended=()=>{source.disconnect();gain.disconnect();};
      source.start();this.crowd={source,gain};
    }catch{/* Background ambience is optional. */}
  }
  voice(source,output,at,duration,volume,x,attack=.008){
    const c=this.context,master=this.master;
    if(!c||!master||this.voices.size>=24)return;
    const gain=c.createGain(),end=at+duration,peak=Math.min(end-.006,at+attack);
    gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),peak);gain.gain.exponentialRampToValueAtTime(.0001,end);
    output.connect(gain);
    const pan=typeof c.createStereoPanner==="function"?c.createStereoPanner():null;
    if(pan){pan.pan.value=clamp((x/600-.5)*1.1,-.55,.55);gain.connect(pan);pan.connect(master);}
    else gain.connect(master);
    this.voices.add(source);
    source.onended=()=>{this.voices.delete(source);source.disconnect();if(output!==source)output.disconnect();gain.disconnect();pan?.disconnect();};
    source.start(at);source.stop(end+.01);
  }
  tone(x,from,to,duration,volume,delay=0,type="sine",attack=.008){
    const c=this.context;if(!c||this.voices.size>=24)return;
    const o=c.createOscillator(),at=c.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(from,at);o.frequency.exponentialRampToValueAtTime(to,at+duration);
    this.voice(o,o,at,duration,volume,x,attack);
  }
  burst(x,freq,duration,volume,delay=0,mode="lowpass",attack=.008){
    const c=this.context;if(!c||!this.noise||this.voices.size>=24)return;
    const source=c.createBufferSource(),filter=c.createBiquadFilter();
    source.buffer=this.noise;source.loop=duration>1.9;filter.type=mode;filter.frequency.value=freq;filter.Q.value=mode==="bandpass"?.8:.45;
    source.connect(filter);this.voice(source,filter,c.currentTime+delay,duration,volume,x,attack);
  }
  play(kind,x=300){
    if(!this.enabled||!this.context)return;
    try{
      switch(kind){
      case "pass":this.tone(x,175,78,.085,.16,0,"triangle");this.burst(x,900,.065,.23);break;
      case "shot":this.tone(x,145,45,.17,.27,0,"triangle");this.burst(x,1200,.13,.32);this.burst(x,2800,.065,.09,.015,"highpass");break;
      case "receive":this.tone(x,120,62,.065,.10);this.burst(x,600,.07,.15);break;
      case "intercept":this.tone(x,150,75,.09,.16,0, "triangle");this.burst(x,1600,.10,.20);break;
      case "save":this.tone(x,130,60,.14,.19,0,"triangle");this.burst(x,700,.17,.31);this.burst(300,750,.55,.16,.04,"bandpass",.09);break;
      case "tackle":this.tone(x,110,55,.12,.18,0,"triangle");this.burst(x,1100,.14,.25);break;
      case "miss":this.burst(x,1800,.15,.09,0,"highpass",.035);break;
      case "bounce":this.tone(x,215,105,.075,.12,0,"triangle");this.burst(x,1500,.045,.13);break;
      case "dribble":this.tone(x,100,56,.045,.045);this.burst(x,550,.05,.06);break;
      case "step":this.burst(x,700,.045,.065);break;
      case "whistle":this.tone(300,2050,2350,.18,.10,0,"sine",.025);this.tone(300,2720,2600,.17,.045,0,"sine",.025);break;
      case "fullTime":
        for(const delay of [0,.23,.46]){this.tone(300,2180,2450,delay===.46?.28:.16,.085,delay,"sine",.018);}
        break;
      case "goalBlue":
      case "goalRed":
        this.burst(300,760,1.5,kind==="goalBlue"?.47:.28,0,"bandpass",.12);
        this.burst(300,1800,.9,.23,.06,"bandpass",.11);
        for(const delay of [.03,.12,.24,.39,.51])this.burst(300,2500,.075,.12,delay,"highpass");
        if(kind==="goalBlue"){
          for(const [i,n] of [392,523,659,784].entries())this.tone(300,n,n,.19,.11,i*.10,"triangle");
        }else this.tone(300,250,150,.32,.12,.08,"triangle");
        break;
      case "coach":this.tone(300,523,523,.11,.075);this.tone(300,784,784,.15,.075,.11);break;
      case "retry":this.tone(300,660,330,.19,.075,0,"triangle");this.tone(300,440,660,.17,.075,.20);break;
      case "click":this.tone(300,400,300,.045,.055);break;
      }
    }catch{/* Unsupported audio features must never affect gameplay. */}
  }
}
