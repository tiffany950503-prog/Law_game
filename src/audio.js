/* ================= AUDIO: 背景音樂・音效・角色語音 ================= */
const AU={ctx:null,master:null,bgmG:null,sfxG:null,mood:null,loop:null,tts:null,ttsTried:false,zhVoices:[],warned:false,
  set:{bgm:true,sfx:true,voice:'auto'}};
try{const s=JSON.parse(localStorage.getItem('cj-audio')||'null');if(s)Object.assign(AU.set,s);}catch(e){}
function auSave(){try{localStorage.setItem('cj-audio',JSON.stringify(AU.set));}catch(e){}}
function auInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return;}
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    AU.ctx=new C();AU.master=AU.ctx.createGain();AU.master.gain.value=.9;AU.master.connect(AU.ctx.destination);
    AU.bgmG=AU.ctx.createGain();AU.bgmG.gain.value=AU.set.bgm?.055:0;AU.bgmG.connect(AU.master);
    AU.sfxG=AU.ctx.createGain();AU.sfxG.gain.value=AU.set.sfx?.5:0;AU.sfxG.connect(AU.master);
  }catch(e){AU.ctx=null;}
  if(!AU.ttsTried){AU.ttsTried=true;(async()=>{try{if(window.claude&&claude.use)AU.tts=await claude.use('tts');}catch(e){}})();}
}
const hz=m=>440*Math.pow(2,(m-69)/12);
function tone(f,t0,dur,{type='sine',vol=.3,att=.01,rel=.2,dest,detune=0,filt}={}){
  const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;o.detune.value=detune;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+att);g.gain.setValueAtTime(vol,t0+Math.max(att,dur-rel));g.gain.linearRampToValueAtTime(0,t0+dur);
  let n=o;if(filt){const f2=c.createBiquadFilter();f2.type='lowpass';f2.frequency.value=filt;o.connect(f2);n=f2;}
  n.connect(g);g.connect(dest||AU.sfxG);o.start(t0);o.stop(t0+dur+.05);return o;
}
function noise(t0,dur,{vol=.2,freq=1200,q=.8,type='bandpass',dest}={}){
  const c=AU.ctx,len=Math.ceil(c.sampleRate*dur),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
  const g=c.createGain();g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.001,t0+dur);
  s.connect(f);f.connect(g);g.connect(dest||AU.sfxG);s.start(t0);
}
function bell(t0,f,vol=.25,dur=3.2){ /* inharmonic partials = 鐘聲 */
  [[1,1],[2.01,.5],[2.76,.32],[5.4,.16],[8.9,.07]].forEach(([r,a])=>tone(f*r,t0,dur/(1+r*.25),{vol:vol*a,att:.004,rel:dur/(1+r*.25)-.01}));
}
function sfx(name){
  if(!AU.ctx||!AU.set.sfx)return;const t=AU.ctx.currentTime+.01;
  switch(name){
    case 'tap':tone(1800,t,.05,{type:'triangle',vol:.08,att:.002,rel:.04});break;
    case 'pop':tone(660,t,.09,{vol:.18,att:.004,rel:.08});tone(990,t+.05,.1,{vol:.12,att:.004,rel:.09});break;
    case 'next':tone(1200,t,.04,{type:'triangle',vol:.05,att:.002,rel:.03});break;
    case 'evidence':noise(t,.25,{vol:.18,freq:3000,q:.6});tone(hz(76),t+.08,.25,{vol:.16});tone(hz(83),t+.2,.45,{vol:.16});break;
    case 'oath':[72,76,79,84].forEach((m,i)=>tone(hz(m),t+i*.09,1.2-i*.1,{type:'triangle',vol:.12,att:.01,rel:.8}));break;
    case 'bell':bell(t,hz(57),.3,3.5);break;
    case 'rise':noise(t,.9,{vol:.22,freq:500,q:.4,type:'lowpass'});noise(t+.25,.7,{vol:.16,freq:900,q:.5});break;
    case 'gong':bell(t,hz(45),.42,5);tone(hz(33),t,2.5,{vol:.25,att:.01,rel:2.2});break;
    case 'deny':tone(hz(55),t,.16,{type:'square',vol:.07,filt:900});tone(hz(50),t+.17,.26,{type:'square',vol:.07,filt:900});break;
    case 'drum':for(let i=0;i<14;i++)noise(t+i*.06,.08,{vol:.05+i*.012,freq:180,q:.7,type:'lowpass'});
      tone(hz(36),t+.9,.9,{vol:.35,att:.004,rel:.8});noise(t+.9,.5,{vol:.25,freq:2500,q:.3});break;
    case 'sparkle':[79,83,86,91,95].forEach((m,i)=>tone(hz(m),t+i*.07,.5,{type:'triangle',vol:.08,att:.005,rel:.4}));break;
    case 'warn':tone(hz(81),t,.12,{vol:.12});tone(hz(81),t+.2,.12,{vol:.12});break;
    case 'lock':tone(hz(69),t,.08,{type:'triangle',vol:.14});tone(hz(64),t+.08,.18,{type:'triangle',vol:.14});break;
  }
}
/* generative background music: slow pads, mood per scene */
const MOODS={
  calm:{bpm:52,prog:[[50,57,60,65],[46,53,57,62],[53,60,64,69],[48,55,58,64]],pulse:false,type:'triangle',filt:1400},
  trial:{bpm:66,prog:[[38,50,57,62],[34,46,53,62],[31,43,50,58],[33,45,52,61]],pulse:true,type:'sawtooth',filt:700},
  delib:{bpm:56,prog:[[41,53,57,64],[38,50,57,60],[34,46,53,57],[36,48,55,64]],pulse:false,type:'triangle',filt:1100},
  verdict:{bpm:44,prog:[[26,38,45,50],[26,38,45,53]],pulse:false,type:'sawtooth',filt:500},
};
function bgm(mood){
  if(!AU.ctx||AU.mood===mood)return;AU.mood=mood;clearInterval(AU.loop);
  const M=MOODS[mood];if(!M)return;
  const bar=60/M.bpm*4;let i=0,next=AU.ctx.currentTime+.1;
  const sched=()=>{
    while(next<AU.ctx.currentTime+bar*1.5){
      const ch=M.prog[i%M.prog.length];
      ch.forEach((m,k)=>{tone(hz(m),next,bar*1.15,{type:M.type,vol:k?.22:.3,att:bar*.35,rel:bar*.45,dest:AU.bgmG,filt:M.filt,detune:k%2?4:-4});});
      if(M.pulse)for(let b=0;b<4;b++)tone(hz(ch[0]-12+12),next+b*bar/4,.25,{vol:b===0?.45:.25,att:.005,rel:.2,dest:AU.bgmG,filt:300});
      next+=bar;i++;
    }
  };
  sched();AU.loop=setInterval(sched,400);
}
function bgmDuck(on){if(!AU.ctx||!AU.set.bgm)return;const g=AU.bgmG.gain,t=AU.ctx.currentTime;g.cancelScheduledValues(t);g.setTargetAtTime(on?.022:.055,t,.25);}
function applyAudioSettings(){
  if(!AU.ctx)return;const t=AU.ctx.currentTime;
  AU.bgmG.gain.setTargetAtTime(AU.set.bgm?.055:0,t,.2);AU.sfxG.gain.setTargetAtTime(AU.set.sfx?.5:0,t,.05);
  if(AU.set.voice==='off')voiceStop();
}
/* ---- character voices: authority & attitude by pitch / rate / voice ---- */
const VOICE={
  '審判長':{p:.72,r:.86,cv:'rounded',cr:.85,m:true,desc:'低沉、緩慢、有威嚴'},
  '陪席法官':{p:.86,r:.92,cv:'rounded',cr:.92,m:false,desc:'冷靜、平穩'},
  '受命法官':{p:.84,r:.95,cv:'rounded',cr:.95,m:true,desc:'冷靜、條理分明'},
  '檢察官':{p:1.0,r:1.1,cv:'glassy',cr:1.08,m:false,desc:'果斷、咄咄逼人'},
  '辯護人':{p:.92,r:.95,cv:'buttery',cr:.95,m:true,desc:'溫和、穩重'},
  '被告 王鈞':{p:.78,r:.84,cv:'rounded',cr:.82,m:true,desc:'低沉、遲疑'},
  '被告 周志明':{p:.82,r:.8,cv:'rounded',cr:.8,m:true,desc:'愧疚、聲音發抖'},
  '被害人 陳辰':{p:1.0,r:1.18,cv:'glassy',cr:1.15,m:true,desc:'激動、憤怒'},
  '證人 李芸':{p:1.2,r:1.0,cv:'airy',cr:1.0,m:false,desc:'緊張但清楚'},
  '證人 張警員':{p:.9,r:1.06,cv:'glassy',cr:1.02,m:true,desc:'公事公辦'},
  '證人 陳怡君':{p:1.22,r:1.0,cv:'airy',cr:1.0,m:false,desc:'惋惜'},
  '告訴人 林秀琴':{p:1.08,r:.78,cv:'airy',cr:.8,m:false,desc:'哀傷、緩慢'},
  '法警':{p:.85,r:1.0,cv:'glassy',cr:1.0,m:true,desc:'洪亮'},
};
function voiceOf(who){
  if(VOICE[who])return VOICE[who];
  const n=(who.match(/(\d)\s*號/)||[])[1];
  if(n){const k=+n;return {p:[1.15,.92,1.05,.98,1.2][(k-1)%5],r:1.0,cv:['airy','buttery','rounded','glassy','airy'][(k-1)%5],cr:1.0,m:k===2||k===4};}
  return null;
}
function loadVoices(){try{const v=speechSynthesis.getVoices();AU.zhVoices=v.filter(x=>/^zh/i.test(x.lang)||/Chinese|國語|中文|Mandarin/i.test(x.name));
  AU.zhVoices.sort((a,b)=>(/TW|HK|Hant/i.test(b.lang)?1:0)-(/TW|HK|Hant/i.test(a.lang)?1:0));}catch(e){}}
try{loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}
function engine(){
  if(AU.set.voice==='off')return null;
  const dev=('speechSynthesis' in window)&&AU.zhVoices.length>0;
  if(AU.set.voice==='device')return dev?'device':(AU.tts?'claude':null);
  if(AU.set.voice==='claude')return AU.tts?'claude':(dev?'device':null);
  return dev?'device':(AU.tts?'claude':null);
}
function cleanSpeech(t){return t.replace(/（[^）]*）/g,'').replace(/[「」『』]/g,'').replace(/｜/g,'，').replace(/…+/g,'，').trim();}
function voiceStop(){try{speechSynthesis.cancel();}catch(e){}try{AU.tts&&AU.tts.stop();}catch(e){}bgmDuck(false);}
function speak(who,text){
  const V=voiceFor(who),eng=engine();if(!V||!eng)return;
  const s=cleanSpeech(text);if(!s)return;
  voiceStop();bgmDuck(true);
  if(eng==='device'){
    try{
      const u=new SpeechSynthesisUtterance(s);u.lang='zh-TW';
      const vs=AU.zhVoices;if(vs.length){const male=vs.filter(v=>/male|男|Yu|Zhiwei|Kangkang|Yunyang|Hanhan/i.test(v.name)&&!/female/i.test(v.name));
        u.voice=(V.m&&male.length?male[0]:vs[V.m?Math.min(1,vs.length-1):0]);}
      u.pitch=V.p;u.rate=V.r;u.volume=1;u.onend=u.onerror=()=>bgmDuck(false);
      speechSynthesis.speak(u);
    }catch(e){bgmDuck(false);}
  }else{
    AU.tts.speak(s,{voice:V.cv,rate:V.cr}).catch(()=>{}).finally(()=>bgmDuck(false));
  }
}
/* ---- settings sheet ---- */
function audioSheet(){
  const eng=engine();
  const opt=(k,l)=>`<button class="opt ${AU.set.voice===k?'on':''}" data-voice="${k}" style="${AU.set.voice===k?'border-color:var(--teal);background:#E7F5F2':''}">${l}</button>`;
  sheet(`<h3>聲音設定</h3>
    <div class="row" style="align-items:center"><span>背景音樂</span><button class="tab ${AU.set.bgm?'on':''}" id="tBgm" style="flex:0 0 90px">${AU.set.bgm?'開':'關'}</button></div>
    <div class="row" style="align-items:center"><span>動作音效</span><button class="tab ${AU.set.sfx?'on':''}" id="tSfx" style="flex:0 0 90px">${AU.set.sfx?'開':'關'}</button></div>
    <p class="label">角色語音</p>
    ${opt('auto','自動選擇（建議）')}${opt('device','裝置中文語音：可調音高，威嚴感較明顯')}${opt('claude','Claude 語音：較自然，依角色換聲線與語速')}${opt('off','關閉語音，只看字幕')}
    <p class="small">目前使用：${eng==='device'?'裝置中文語音':eng==='claude'?'Claude 語音':'無可用語音（只顯示字幕）'}。審判長低沉緩慢、檢察官果斷、被告遲疑、被害人激動，依角色調整音高與語速。</p>
    <button class="btn ghost" id="tryJ">試聽：審判長</button><button class="btn ghost" id="tryP">試聽：檢察官</button>`);
  $('#tBgm').onclick=()=>{AU.set.bgm=!AU.set.bgm;auSave();applyAudioSettings();audioSheet();};
  $('#tSfx').onclick=()=>{AU.set.sfx=!AU.set.sfx;auSave();applyAudioSettings();audioSheet();};
  document.querySelectorAll('[data-voice]').forEach(b=>b.onclick=()=>{AU.set.voice=b.dataset.voice;auSave();applyAudioSettings();audioSheet();});
  $('#tryJ').onclick=()=>speak('審判長','現在開庭。請檢察官說明起訴事實。');
  $('#tryP').onclick=()=>speak('檢察官','被告明知酒後不能開車，仍然執意上路！');
}
/* global click feedback */
document.addEventListener('click',e=>{
  auInit();
  const el=e.target.closest('button');if(!el)return;
  if(el.classList.contains('chip'))sfx('pop');else if(el.id!=='hold')sfx('tap');
},true);

$('#snd').addEventListener('click',()=>{auInit();audioSheet();});

