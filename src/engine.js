/* ================= state ================= */
let S=null,P=store('cj2-profile'),DONE=store('cj2-done')||{};
function reset(){
  S={case:null,C:null,log:[],mark:0,evMark:0,unlocked:[],notes:[],people:[],lean:[],sched:[],dayIx:-1,asked:0,improper:0,
     sc:{obj:[0,0],note:[0,0],read:[0,0],duty:[0,0]},res:{},myVote:{},firstVote:{},changed:[],
     out:null,sentence:null,my0:null,my1:null,anchor:null,jAvg:null,dutySeen:[]};
}
reset();

/* ================= voices by role ================= */
function castOf(name){if(!S||!S.C)return null;for(const k in S.C.cast){if(S.C.cast[k].n===name)return S.C.cast[k];}return null;}
function castName(short){if(!S.C||!short)return null;for(const k in S.C.cast){const n=S.C.cast[k].n;if(n.endsWith(short)||n.includes(' '+short))return n;}return null;}
function voiceFor(who){
  if(who==='審判長')return {p:.72,r:.86,cv:'rounded',cr:.85,m:true};
  if(who==='陪席法官')return {p:.86,r:.92,cv:'rounded',cr:.92,m:false};
  if(who==='受命法官')return {p:.84,r:.95,cv:'rounded',cr:.95,m:true};
  if(who==='檢察官')return {p:1.0,r:1.1,cv:'glassy',cr:1.08,m:false};
  if(who==='辯護人')return {p:.92,r:.95,cv:'buttery',cr:.95,m:true};
  if(who==='法警')return {p:.85,r:1.0,cv:'glassy',cr:1.0,m:true};
  const c=castOf(who);
  if(c){const f=c.g==='f';return {p:c.p||(f?1.15:.84),r:c.rt||.96,cv:f?'airy':'rounded',cr:c.rt||.96,m:!f};}
  const n=(who.match(/(\d)\s*號/)||[])[1];
  if(n){const k=+n;return {p:[1.15,.92,1.05,.98,1.2][(k-1)%5],r:1.0,cv:['airy','buttery','rounded','glassy','airy'][(k-1)%5],cr:1.0,m:k===2||k===4};}
  return null;
}

/* ================= UI primitives ================= */
const ROLECLS={judge:'judge',pros:'pros',def:'def',defn:'def',wit:'wit',exp:'exp',sys:'sys'};
function roleClass(who){
  if(who==='你（6 號）')return 'you';
  if(/審判長|陪席法官|受命法官/.test(who))return 'judge';
  if(who==='檢察官')return 'pros';if(who==='辯護人')return 'def';if(who==='法警')return 'sys';
  const c=castOf(who);if(c)return ROLECLS[c.r]||'';
  return who.includes('號')?'npc':'';
}
function scene(k,screen){const s=$('#scene');s.innerHTML=(SC[k]||SC.court)+(screen?`<div class="screen">${screen}</div>`:'');const f=s.firstChild;f&&f.classList&&f.classList.add('fade');}
function stage(t,p){$('#stage').textContent=t;if(p!=null)$('#progress div').style.width=p+'%';}
function setDay(t){$('#day').textContent=t;}
function actions(h){$('#actions').innerHTML=h||'';$('#actions').scrollTop=0;ctxScroll();}
function setIssue(html){$('#issueText').innerHTML=html;$('#issue').classList.add('on');}
function tally(){$('#tally').textContent=S&&S.notes.length?`｜筆記 ${S.notes.length} 則`:'';}
let advance=null,typing=false,full='';
$('#dialog').addEventListener('click',()=>{
  if(typing){typing=false;$('#text').textContent=full;return;}
  if(advance){const a=advance;advance=null;$('#next').classList.remove('on');voiceStop();sfx('next');a();}
});
async function type(who,text){
  $('#dialog').style.display='block';
  if(who!=='你（6 號）')speak(who,text);
  const w=$('#who');w.textContent=who;w.className=roleClass(who);
  full=text;typing=true;const el=$('#text');el.textContent='';
  for(let i=0;i<text.length&&typing;i++){el.textContent=text.slice(0,i+1);await sleep(text.length>60?13:20);}
  typing=false;el.textContent=text;
}
async function say(who,text,sc){if(S&&S.C)S.log.push({who,text,day:S.dayIx+1});if(sc)scene(sc);await type(who,text);$('#next').classList.add('on');await new Promise(r=>advance=r);}
async function show(who,text,sc){if(sc)scene(sc);await type(who,text);}
function hideDialog(){$('#dialog').style.display='none';}
function waitClick(sel){return new Promise(r=>{$$(sel).forEach(b=>b.addEventListener('click',()=>r(b.dataset.v),{once:true}));});}
async function cont(label='繼續',cls='btn'){$('#actions').insertAdjacentHTML('beforeend',`<button class="${cls}" id="cont">${label}</button>`);const b=$('#cont');b.scrollIntoView({block:'nearest'});await new Promise(r=>b.onclick=r);actions('');}
let toastT=null;
function toast(h,ms=4000){const t=$('#toast');t.innerHTML=`<div class="hint">${h}</div>`;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),ms);}
function hideToast(){$('#toast').classList.remove('on');}
function sheet(h){$('#sheet').innerHTML=h+'<button class="btn" id="closeM">回到法庭</button>';$('#modal').classList.add('on');$('#closeM').onclick=()=>$('#modal').classList.remove('on');$('#sheet').scrollTop=0;}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')$('#modal').classList.remove('on');});
function bump(){const b=$('#locker');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');}

/* ================= context recall: show what a question refers to ================= */
function markSeg(){S.mark=S.log.length;S.evMark=S.unlocked.length;}
function ctxHtml(o={}){
  if(!S||!S.C)return '';
  let lines=o.who?S.log.filter(l=>l.who===o.who):o.filter?S.log.filter(o.filter):S.log.slice(S.mark);
  if(o.last)lines=lines.slice(-o.last);
  const ids=new Set(o.who||o.filter||o.last?[]:S.unlocked.slice(S.evMark).map(e=>e.id));
  String(o.text||'').replace(/[A-Z]\d/g,m=>{ids.add(m);return m;});
  (o.ref||[]).forEach(i=>ids.add(i));
  let evs=S.unlocked.filter(e=>ids.has(e.id));
  if(o.who){const nm=o.who.split(' ').pop();evs=evs.concat(S.unlocked.filter(e=>e.kind==='test'&&e.title.includes(nm)&&!ids.has(e.id)));}
  if(o.allEv)evs=S.unlocked.slice();
  if(!lines.length&&!evs.length)return '';
  const cnt=[lines.length?lines.length+' 句發言':'',evs.length?evs.length+' 項證據':''].filter(Boolean).join('、');
  return `<details class="ctx" ${o.closed?'':'open'}><summary>${o.title||'回顧：這題相關的法庭內容'}<span>${cnt}</span></summary><div class="ctxb">${evs.map(e=>`<div class="ce"><b>${esc(e.title)}</b>｜${esc(e.desc)}</div>`).join('')}${lines.map(l=>`<p class="${l.who==='你（6 號）'?'me':''}"><b>${esc(l.who)}</b>：${esc(l.text)}</p>`).join('')}</div></details>`;
}
function ctxScroll(){$$('.ctxb').forEach(e=>e.scrollTop=e.scrollHeight);}
function transcriptHtml(){
  if(!S.log.length)return '<div class="lockedmsg">開庭後，法庭上每一句發言都會記在這裡。</div>';
  let out='',d=-1;
  S.log.forEach(l=>{if(l.day!==d){d=l.day;out+=`<p class="label" style="margin-top:6px">${d>0&&d<=S.C.days.length?'第 '+d+' 庭｜'+esc(S.C.days[d-1].date):d>S.C.days.length?'評議':'選任'}</p>`;}out+=`<p class="tline"><b>${esc(l.who)}</b>：${esc(l.text)}</p>`;});
  return out;
}

/* ================= notebook ================= */
function sideTag(side){if(!S.C||!side)return '';const t=side==='a'?S.C.sides.a:side==='b'?S.C.sides.b:'中立／待查';return `<i class="${side==='a'?'a':side==='b'?'b':''}">${esc(t)}</i>`;}
function noteHtml(n,i,pick){return `<div class="note ${pick?'pick':''}" ${pick?`data-i="${i}"`:''}><div class="meta"><span>${esc(n.day)}</span><span>${esc(n.who||'')}</span>${sideTag(n.side)}</div>${esc(n.text)}</div>`;}
function addNote(n){S.notes.push({day:S.dayIx>=0?`第 ${S.dayIx+1} 庭`:'',side:'n',...n});tally();bump();toast('已存進筆記本（右上角「筆」）',2200);}
function unlock(id,title,desc,kind){if(S.unlocked.some(e=>e.id===id))return;sfx('evidence');S.unlocked.push({id,title,desc,kind,day:S.dayIx+1});bump();}
function calHtml(){
  return `<div class="cal">${S.sched.map((d,i)=>`<div class="d ${i===S.dayIx?'now':i<S.dayIx?'done':''}"><b>${esc(d.date)}</b><span>${d.items.map(x=>x.n?`<span class="new">＋${esc(x.t)}</span>`:esc(x.t)).join('<br>')}</span></div>`).join('')}</div>`;
}
function openBook(tab){
  tab=tab||'notes';
  if(!S.C){sheet('<h3>筆記本</h3><div class="lockedmsg">開始審理案件後，這裡會有你的筆記、證據櫃、人物利益分析和庭期表。</div>');return;}
  const T=[['notes','筆記'],['ev','證據櫃'],['log','庭審紀錄'],['ppl','人物'],['cal','庭期']];
  let body='';
  if(tab==='notes')body=`<p class="small">好筆記＝誰說的｜說了什麼｜限制或疑點。只寫法庭上出現的內容，感想另外標。</p>`+(S.notes.length?S.notes.map((n,i)=>noteHtml(n,i)).join(''):'<div class="lockedmsg">還沒有筆記。開庭後會一邊審理一邊教你記。</div>');
  if(tab==='ev')body=`<p class="small">卷證不併送：開庭前法官和國民法官都沒看過卷宗，只能用法庭上調查過的證據判斷。</p>`+(S.unlocked.length?S.unlocked.map(e=>`<div class="card ${e.kind==='test'?'warm':''}"><h4>${esc(e.title)}</h4>${esc(e.desc)}<div class="small">第 ${e.day} 庭・${e.kind==='test'?'證詞':'書證／物證'}</div></div>`).join(''):'<div class="lockedmsg">目前還是空的。</div>');
  if(tab==='ppl')body=`<p class="small">每個人都有自己的立場與利益。有利益不等於說謊，但他的話需要其他證據互相印證。</p>`+(S.people.length?S.people.map(p=>`<div class="card"><h4>${esc(p.who)}</h4><b>利益：</b>${esc(p.ans)}<br><b>可能強調：</b>${esc(p.push)}<br><b>可能淡化：</b>${esc(p.hide)}</div>`).join(''):'<div class="lockedmsg">休庭時做的人物利益分析會放在這裡。</div>');
  if(tab==='cal')body=calHtml();
  if(tab==='log')body=`<p class="small">法庭上每一句發言的完整紀錄，可以隨時回來查。</p>`+transcriptHtml();
  sheet(`<h3>筆記本｜${esc(S.C.short)}</h3><div class="tabs">${T.map(t=>`<button class="tab ${t[0]===tab?'on':''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>`+body);
  $$('#sheet .tab').forEach(b=>b.onclick=()=>openBook(b.dataset.t));
}
$('#locker').addEventListener('click',()=>openBook());

/* ================= glossary ================= */
const GLOSS_COMMON=[
  ['開審陳述','開庭一開始，檢察官和辯護人各自說明「要證明什麼、用哪些證據」。像預告片，本身不是證據。'],
  ['交互詰問','傳喚證人的一方先「主詰問」，對方再「反詰問」，之後可「覆主詰問」「覆反詰問」。主詰問原則上不能誘導；反詰問可以誘導，用來檢驗證詞。'],
  ['異議','認為對方的問題或程序違法時，當場向審判長聲明。常見理由：主詰問誘導、誤導、要求證人陳述個人意見或推測、與本案無關。'],
  ['國民法官補充詢問','證人、鑑定人、被告接受詰問或詢問後，國民法官經審判長同意，可以針對判斷需要的事項補充詢問。'],
  ['鑑定人','具有專業知識的人，說明醫學、筆跡、數位資料等專業問題。鑑定人只說明專業，不替你決定被告有沒有罪。'],
  ['聲請調查證據','檢辯雙方可以聲請傳喚新證人或調取資料，要說明和待證事實的關聯，由法院決定是否准許。'],
  ['卷證不併送','法官和國民法官開庭前不看檢察官的卷宗，只用法庭上調查過的證據判斷。'],
  ['無罪推定','檢察官負責舉證。證據不足以讓你確信、還有合理懷疑時，就要做有利被告的認定。'],
  ['緘默權','被告可以拒絕陳述，不能因為被告保持沉默就推論他有罪。'],
  ['評議怎麼表決','有罪的認定需要 9 人中 2/3 以上（至少 6 票），且同時包含法官與國民法官；量刑等事項採過半數，同樣須包含雙方。'],
  ['保密義務','評議的經過、各人的意見和票數都要保密。審判期間也不要接觸媒體報導、不要自己去調查。'],
];
$('#help').addEventListener('click',()=>{
  const list=(S.C&&S.C.gloss?S.C.gloss:[]).concat(GLOSS_COMMON);
  sheet(`<h3>法律小幫手（審判長白話解釋）</h3>`+list.map(g=>`<div class="card"><h4>${g[0]}</h4>${g[1]}</div>`).join(''));
});

/* ================= step interpreter ================= */
async function run(steps){for(const st of steps)await doStep(st);}
async function doStep(st){
  if(Array.isArray(st)){const [k,x,sc]=st;const c=S.C.cast[k];await say(c?c.n:k,x,sc!==undefined?sc:(c?c.sc:null));return;}
  for(const k in STEP)if(st[k]!==undefined)return STEP[k](st[k],st);
}
const STEP={
  async card(title,st){
    actions(`<div class="card ${st.navy?'navy':st.warm?'warm':''}"><h4>${title}</h4>${st.html}</div>`);await cont(st.btn||'了解');
  },
  async issue(html){setIssue(html);},
  async ev(id,st){
    const d=(P&&P.gentle&&st.gd)||st.d;
    if(st.kind==='test'){unlock(id,st.t,d,'test');toast(`證詞已放入證據櫃：${esc(st.t)}`,2400);return;}
    const by=S.C.cast[st.by||'P'];
    scene('evidence',`${esc(st.t)}<small>證據 ${id}</small>`);
    await show(by.n,`請看證據 ${id}：${st.t}。`);
    actions(`<div class="card"><h4>證據 ${id}｜${esc(st.t)}</h4>${esc(d)}</div><button class="btn" data-v="1">看清楚了</button>`);
    await waitClick('#actions .btn');actions('');unlock(id,`${id}｜${st.t}`,d);
    if(st.hint)await say('審判長',st.hint);
  },
  async obj(o){
    const c=S.C.cast[o.by];sfx('warn');
    await show(c.n,o.said,c.sc);
    actions(ctxHtml({last:3,title:'回顧：被異議的那段問答'})+`<div class="lesson"><p class="label">異議！換你猜</p><h4>審判長會怎麼裁定？</h4></div><div class="chips"><button class="chip s" data-v="s">異議成立</button><button class="chip k" data-v="o">異議駁回</button></div>`);
    const v=await waitClick('.chip');const ok=v===o.rule;S.sc.obj[1]++;if(ok)S.sc.obj[0]++;actions('');
    await say('審判長',o.why);
    actions(`<div class="fb ${ok?'ok':'no'}"><b>${ok?'猜對了。':'這次猜錯了。'}</b>${o.teach}</div>`);await cont();
  },
  async note(n){return NOTE[n.kind](n);},
  async ask(a){
    await show('審判長',a.intro,'ask');
    let left=a.n;const used=new Set();
    while(left>0){
      const av=a.opts.map((o,i)=>[o,i]).filter(x=>!used.has(x[1]));if(!av.length)break;
      actions(ctxHtml({title:'回顧：剛才的詰問與證詞'})+`<p class="label">國民法官補充詢問・剩 ${left} 題</p>`+av.map(([o,i],j)=>`<button class="opt" data-v="${i}"><b>${'ABCDE'[j]}</b>${esc(o.q)}</button>`).join('')+`<button class="btn ghost" data-v="x" style="font-size:14px;padding:9px">我沒有問題了</button>`);
      const v=await waitClick('#actions button');actions('');if(v==='x')break;
      const o=a.opts[+v];used.add(+v);
      await say('你（6 號）',o.q,'answer');
      if(o.bad){S.improper++;sfx('deny');await say('審判長',o.bad+'這題不列入，也不扣次數。','off');continue;}
      left--;S.asked++;const c=S.C.cast[o.to||a.to];await say(c.n,o.a,c.sc);
      if(o.note)await say('審判長',o.note);
    }
  },
  async recess(r){
    hideDialog();scene('delib');bgm('delib');stage(r.title);
    actions(`<div class="recess"><p class="label">休庭・人性觀察</p><h4>${r.title}</h4>${r.intro||'法庭休息時，回想剛才雙方的互動：誰在問、為什麼這樣問、想讓你相信什麼。'}</div>`);await cont('開始觀察','btn amber');
    for(const q of r.qs){
      actions(ctxHtml({text:q.q+q.opts.map(o=>o[0]).join(''),ref:q.ref,title:'回顧：這段休庭前的法庭內容'})+`<div class="recess"><p class="label">觀察題</p><h4>${q.q}</h4></div>`+q.opts.map((o,i)=>`<button class="opt" data-v="${i}"><b>${'ABCD'[i]}</b>${esc(o[0])}</button>`).join(''));
      const i=+(await waitClick('.opt'));const o=q.opts[i];S.sc.read[1]++;if(o[1])S.sc.read[0]++;
      $$('#actions .opt').forEach((b,j)=>{b.disabled=true;if(q.opts[j][1])b.classList.add('right');else if(j===i)b.classList.add('wrong');});
      $('#actions').insertAdjacentHTML('beforeend',`<div class="fb ${o[1]?'ok':'no'}">${o[2]}${!o[1]?'<br><b>參考：</b>'+q.opts.find(x=>x[1])[2]:''}</div>`);
      await cont();
    }
    markSeg();bgm('trial');
  },
  async interest(t){
    hideDialog();scene(t.sc||'delib');
    actions(ctxHtml({who:t.who,title:`回顧：${t.who}說過的話`})+`<div class="recess"><p class="label">人物利益分析（可複選）</p><h4>${esc(t.who)}：他在乎什麼？</h4>${t.desc}</div>
      <div class="tl" id="iw">${t.opts.map((o,i)=>`<button class="chip" style="flex:0 0 auto;padding:8px 12px" data-i="${i}">${o}</button>`).join('')}</div><button class="btn" id="isub">送出</button>`);
    const sel=new Set();$$('#iw .chip').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;sel.has(i)?sel.delete(i):sel.add(i);b.classList.toggle('sel');});
    await new Promise(r=>$('#isub').onclick=()=>{if(sel.size)r();else toast('至少選一項');});
    const hit=[...sel].filter(i=>t.ans.includes(i)).length,wrong=[...sel].filter(i=>!t.ans.includes(i)).length;const ok=hit>=1&&wrong<=1;
    S.sc.read[1]++;if(ok)S.sc.read[0]++;
    $$('#iw .chip').forEach(b=>{const i=+b.dataset.i;b.disabled=true;b.classList.remove('sel');if(t.ans.includes(i))b.classList.add('sel');else if(sel.has(i))b.style.opacity='.45';});
    $('#isub').remove();
    $('#actions').insertAdjacentHTML('beforeend',`<div class="fb ${ok?'ok':'mid'}"><b>${ok?'分析得不錯。':'可以再想想。'}</b>參考答案已標色。<br><b>可能強調：</b>${t.push}<br><b>可能淡化：</b>${t.hide}<br>${t.note}</div>`);
    S.people.push({who:t.who,ans:t.ans.map(i=>t.opts[i]).join('、'),push:t.push,hide:t.hide});
    await cont('記進人物利益頁');bump();markSeg();
  },
  async motion(m){
    sfx('lock');await say('審判長','裁定：'+m.rule);
    const next=S.sched[Math.min(S.sched.length-1,S.dayIx+1)];
    m.add.forEach(t=>next.items.push({t,n:true}));
    actions(`<div class="card warm"><h4>庭期表更新</h4>${m.add.map(t=>'＋ '+esc(t)).join('<br>')}<div class="small">排在 ${esc(next.date)}。隨著雙方蒐集的證據越來越多，會傳喚更多人。</div></div>`);await cont();
  },
  async tip(trait,st){
    if(!P||!P.flags||!P.flags.includes(trait))return;
    actions(`<div class="warnbox"><b>你的側寫提醒</b>｜${st.text}</div>`);await cont('收到');
  },
  async gentle(text){if(!P||!P.gentle)return;actions(`<div class="hint">${text}</div>`);await cont('我準備好了');},
  async say(x){await say(x[0],x[1],x[2]);},
};

/* ================= note-taking lessons (learn by doing) ================= */
const NOTE={
  async pick(n){
    actions(ctxHtml({text:n.q+n.opts.map(o=>o[0]).join(''),ref:n.ref})+`<div class="lesson"><p class="label">${n.title}</p><h4>${n.q}</h4>${n.intro||''}</div>`+n.opts.map((o,i)=>`<button class="opt" data-v="${i}"><b>${'ABCD'[i]}</b>${esc(o[0])}</button>`).join(''));
    const i=+(await waitClick('#actions .opt'));const o=n.opts[i];const top=Math.max(...n.opts.map(x=>x[1]));const best=n.opts.findIndex(x=>x[1]===top);
    S.sc.note[1]++;if(o[1]===top)S.sc.note[0]++;
    $$('#actions .opt').forEach((b,j)=>{b.disabled=true;if(j===best)b.classList.add('right');else if(j===i)b.classList.add('wrong');});
    $('#actions').insertAdjacentHTML('beforeend',`<div class="fb ${o[1]===top?'ok':o[1]?'mid':'no'}">${o[2]}</div>`);
    await cont(n.save?'存進筆記本':'繼續');
    if(n.save)addNote({who:n.save.who,side:n.save.side||'n',issue:n.save.issue,text:n.save.text||n.opts[best][0]});
  },
  async classify(n){
    const cats=['事實','推論','意見'];
    actions(ctxHtml({ref:n.ref})+`<div class="lesson"><p class="label">${n.title}</p>${n.intro}</div>`+n.items.map((it,i)=>`<div class="cls" data-i="${i}"><span>${esc(it[0])}</span><div class="chips">${cats.map((c,j)=>`<button class="chip ${['s','k','u'][j]}" data-c="${c}">${c}</button>`).join('')}</div><div class="fbx"></div></div>`).join(''));
    let done=0;
    await new Promise(r=>$$('.cls').forEach(box=>{const it=n.items[+box.dataset.i];
      box.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{
        const ok=b.dataset.c===it[1];S.sc.note[1]++;if(ok)S.sc.note[0]++;
        box.querySelectorAll('.chip').forEach(x=>{x.disabled=true;if(x.dataset.c===it[1])x.classList.add('sel');});
        box.querySelector('.fbx').innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?'✓ ':'✗ 是「'+it[1]+'」。'}${it[2]}</div>`;
        if(++done===n.items.length)r();
      });}));
    await cont();
  },
  async write(n){
    const sd=S.C.sides;
    actions(ctxHtml(castName(n.who)?{who:castName(n.who),title:`回顧：${n.who}的證詞`}:{})+`<div class="lesson"><p class="label">${n.title}</p><h4>${n.q||'換你自己寫一則筆記'}</h4>${n.intro||'格式：<b>誰｜說了什麼｜限制或疑點</b>。短一點沒關係，只寫法庭上出現的內容。'}</div>
      <textarea id="nt" maxlength="90" placeholder="${esc(n.hint)}"></textarea>
      <p class="label">這則筆記比較支持哪一邊？</p>
      <div class="chips"><button class="chip k" data-v="a">${esc(sd.a)}</button><button class="chip h" data-v="b">${esc(sd.b)}</button><button class="chip u" data-v="n">中立／待查</button></div>`);
    const side=await waitClick('#actions .chip');
    const txt=($('#nt').value||'').trim();
    const issues=[];
    if(!txt)issues.push('你沒有寫內容，先用參考寫法存起來。下次試試自己寫，寫的過程就是在整理思考。');
    else{
      if(/可憐|可怕|一定|絕對|明顯|壞人|騙子|活該|噁心|冷血|心虛|爛/.test(txt))issues.push('裡面有評價或情緒字眼。感受可以有，但筆記的主體要是「他說了什麼」。');
      if(n.who&&!txt.includes(n.who.slice(0,1))&&!txt.includes('｜'))issues.push(`記得寫是誰說的（${n.who}），評議時才知道來源。`);
      if(txt.length>70)issues.push('有點長。試著只留關鍵字和數字。');
    }
    const ok=txt&&!issues.length;S.sc.note[1]++;if(ok)S.sc.note[0]++;
    actions(`<div class="fb ${ok?'ok':'mid'}">${ok?'<b>寫得好。</b>來源、內容都清楚。':issues.join('<br>')}<br><b>參考寫法：</b>${esc(n.suggest)}</div>`);
    await cont('存進筆記本');
    addNote({who:n.who,side,issue:n.issue,text:txt||n.suggest});
  },
  async order(n){
    const items=shuffle(n.items.map((t,i)=>({t,i})));let seq=[];
    const draw=()=>{actions(ctxHtml({allEv:true,filter:()=>false,closed:true,title:'回顧：證據櫃'})+`<div class="lesson"><p class="label">${n.title}</p><h4>${n.q}</h4>依時間先後，一個一個點。</div><div class="seq">${items.map(x=>{const k=seq.indexOf(x.i);return `<button class="${k>=0?'on':''}" data-i="${x.i}"><i>${k>=0?k+1:''}</i><span>${esc(x.t)}</span></button>`;}).join('')}</div><button class="btn ghost" id="sr" style="font-size:14px;padding:9px">重排</button>`);
      $('#sr').onclick=()=>{seq=[];draw();};
      $$('.seq button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(seq.includes(i))return;seq.push(i);if(seq.length===items.length)finish();else draw();});};
    let done;const p=new Promise(r=>done=r);
    const finish=()=>{const right=seq.filter((v,k)=>v===k).length;S.sc.note[1]++;if(right>=n.items.length-1)S.sc.note[0]++;
      actions(`<div class="fb ${right===n.items.length?'ok':'mid'}"><b>排對 ${right}／${n.items.length} 個位置。</b>正確順序：<br>${n.items.map((t,k)=>(k+1)+'. '+esc(t)).join('<br>')}<br><br>${n.fb||'時間線能幫你發現「中間空掉的那幾分鐘」，那常常就是爭點所在。'}</div>`);
      cont('存進筆記本').then(()=>{addNote({who:'時間線',side:'n',issue:n.issue,text:n.items.join(' → ')});done();});};
    draw();await p;
  },
};
NOTE.contra=NOTE.pick;

/* ================= waiting between court days: juror duties ================= */
const DUTY=[
  {q:'手機跳出新聞推播：「本案被告開庭時面無表情？網友熱議」。你會？',o:[['點開看完，多了解一點也好',0],['滑掉不看',1],['只看標題，不點進去',0]],fb:'審判期間應避免接觸本案報導，標題本身也可能帶著立場。研究整理數十個實驗發現，審前報導會讓模擬陪審員更傾向判有罪（Steblay 等人，1999 統合分析）。'},
  {q:'晚餐時家人問：「你那個案子，被告是不是壞人？」你會？',o:[['說說自己目前的看法',0],['只說自己在當國民法官，不談案情',1],['轉述其他國民法官怎麼想',0]],fb:'國民法官有保密義務，評議的經過、每個人的意見都不能對外說。可以說自己正在擔任國民法官，但不要討論案情與心證。'},
  {q:'下班路過案發地點附近，你會？',o:[['過去看看，量一下距離',0],['不去；有疑問在法庭上請審判長調查',1],['上網用街景看一下就好',0]],fb:'國民法官只能依照法庭上調查過的證據判斷。自己去現場或上網查，等於用了雙方都沒機會檢驗的「證據」。有疑問，可以在法庭上提出。'},
  {q:'LINE 群組有人說：「欸，那個證人是我表哥的同事」。你會？',o:[['追問他知道什麼',0],['請他不要再說，並主動告訴法院',1],['當作沒看到',0]],fb:'如果接觸到和當事人、證人有關的人或資訊，應該告訴法院，由法院判斷會不會影響公正。'},
  {q:'主管說：「你一直請假，考績可能會受影響喔。」你會？',o:[['默默接受',0],['說明國民法官法保障，必要時向法院反映',1],['乾脆不去開庭了',0]],fb:'國民法官法規定，雇主不得因為員工擔任國民法官而給予不利對待。無正當理由不到庭，反而可能被處罰鍰。'},
  {q:'你想發限時動態：「今天當國民法官，那個證人一直在說謊……」你會？',o:[['發，反正沒寫名字',0],['不發',1],['發，但只給好友看',0]],fb:'在審判中公開表達對案件的看法，可能影響審判公正，也違反保密精神。等判決之後，可以分享「當國民法官的經驗」，但仍不能透露評議內容。'},
];
async function between(prev,next){
  hideDialog();scene('court');setDay(next.date);stage('等待下一個庭期');bgm('calm');
  actions(`<div class="bigdate">${esc(next.date)}<small>${esc(next.wait||'')}・${esc(next.title)}</small></div><p class="label">庭期表</p>${calHtml()}`);
  await cont('過日子去');
  const pool=DUTY.map((d,i)=>i).filter(i=>!S.dutySeen.includes(i));const k=pool[Math.floor(Math.random()*pool.length)];
  if(k==null)return;S.dutySeen.push(k);const d=DUTY[k];
  actions(`<div class="lesson"><p class="label">開庭之外的日子</p><h4>${d.q}</h4></div>`+d.o.map((o,i)=>`<button class="opt" data-v="${i}"><b>${'ABC'[i]}</b>${o[0]}</button>`).join(''));
  const i=+(await waitClick('.opt'));const ok=d.o[i][1];S.sc.duty[1]++;if(ok)S.sc.duty[0]++;
  $$('#actions .opt').forEach((b,j)=>{b.disabled=true;if(d.o[j][1])b.classList.add('right');else if(j===i)b.classList.add('wrong');});
  $('#actions').insertAdjacentHTML('beforeend',`<div class="fb ${ok?'ok':'no'}">${d.fb}</div>`);
  await cont(`前往法院｜${next.date}`);
}

/* ================= oath & case intro ================= */
async function caseIntro(C){
  hideDialog();scene('court');setDay('報到');stage(C.short,2);bgm('calm');
  actions(`<div class="card navy"><h4>${C.title}</h4>${C.brief}</div>
    <div class="card"><h4>起訴罪名</h4>${C.charge}<div class="small">${C.why}</div></div>
    <p class="label">預定庭期</p>${calHtml()}
    ${C.warn?`<div class="warnbox">${C.warn}</div>`:''}`);
  await cont('前往選任程序','btn amber');
}
async function oath(){
  stage('選任與宣誓',4);scene('oath');setDay('選任期日');
  await show('審判長','歡迎。今天是選任期日，請先了解你的任務。');
  const cards=['國民法官從年滿 23 歲的國民中抽選，<b>不需要法律背景</b>。','選任程序中，檢察官和辯護人可以依問卷與詢問，<b>各自不附理由拒卻</b>部分候選人。你的「側寫」結果，可以想成雙方眼中的你。','你將和 <b>3 位職業法官</b>、另外 5 位國民法官一起決定：被告有沒有罪、判多重。','案件可能開庭好幾天。開庭之間要<b>保密</b>、不接觸報導、不自己調查。'];
  for(let i=0;i<cards.length;i++){actions(`<div class="card">${cards[i]}</div><button class="btn" data-v="1">${i<cards.length-1?'下一張（'+(i+1)+'／'+cards.length+'）':'我了解了'}</button>`);await waitClick('#actions .btn');}
  if(P){actions(`<div class="card warm"><h4>檢辯雙方看你的問卷</h4>${voirDire(P)}</div>`);await cont('結果：我被選任了');}
  await show('審判長','請起立宣誓：「依法公平誠懇執行職務」。');
  actions(`<button class="btn hold" id="hold"><span class="fill" id="hf"></span>長按 2 秒・完成宣誓</button><p class="small" style="text-align:center">按住不放，直到進度條填滿</p>`);
  await new Promise(r=>{
    const b=$('#hold'),f=$('#hf');let t=null,st=0;
    const down=e=>{e.preventDefault();st=Date.now();clearInterval(t);t=setInterval(()=>{const p=Math.min(1,(Date.now()-st)/2000);f.style.width=p*100+'%';if(p>=1){clearInterval(t);r();}},30);};
    const up=()=>{clearInterval(t);f.style.width='0';};
    b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);
    b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')r();});
  });
  actions('');sfx('oath');await sleep(500);sfx('bell');
}

/* ================= day end: provisional belief ================= */
async function dayEnd(C,i){
  hideDialog();scene('court');
  const last=S.lean.length?S.lean[S.lean.length-1].v:50;
  actions(`<div class="lean"><p class="label">第 ${i+1} 庭結束・你的暫時心證</p><h4 style="font-size:15.5px;margin:4px 0 6px">${C.lean.q}</h4><div class="ends"><span>${esc(C.lean.a)}</span><span>${esc(C.lean.b)}</span></div><input type="range" id="ln" min="0" max="100" value="${last}"><p class="small">這只是暫時的傾向，評議前不要定案。最後會給你看這條心證軌跡。</p></div>`);
  await cont('記錄心證並休庭');
  S.lean.push({label:`第${i+1}庭`,v:+($('#ln')||{value:last}).value});
}

/* ================= deliberation ================= */
function voteWord(iss,v){return v==='y'?iss.ys:iss.ns;}
async function issueVote(iss){
  scene('delib');
  await show('審判長',iss.q);
  actions(`<div class="lesson"><p class="label">先寫再聽 ①</p><h4>${iss.q}</h4>在聽任何人發言之前，先寫下你自己的判斷。</div>
    ${ctxHtml({allEv:true,filter:()=>false,closed:true,title:'回顧：所有調查過的證據'})}
    ${S.notes.length?`<details class="ctx"><summary>回顧：我的筆記<span>${S.notes.length} 則</span></summary><div class="ctxb">${S.notes.map((n,i)=>noteHtml(n,i)).join('')}</div></details>`:''}
    <button class="opt" data-v="y"><b>A</b>${iss.yes}</button><button class="opt" data-v="n"><b>B</b>${iss.no}</button>
    <button class="btn ghost" id="gl" style="font-size:14px;padding:9px">？ 查名詞</button>`);
  $('#gl').onclick=()=>$('#help').click();
  const v0=await waitClick('#actions .opt');S.firstVote[iss.id]=v0;
  const pool=S.notes.map((n,i)=>[n,i]);
  actions(`<p class="label">先寫再聽 ②｜從筆記挑出最多 2 則理由</p>`+(pool.length?pool.map(([n,i])=>noteHtml(n,i,true)).join(''):'<div class="lockedmsg">你的筆記本是空的。沒關係，下次試著多記幾則。</div>'));
  const picks=new Set();
  $$('.note.pick').forEach(el=>el.onclick=()=>{const i=+el.dataset.i;if(picks.has(i)){picks.delete(i);el.classList.remove('on');}else if(picks.size<2){picks.add(i);el.classList.add('on');}});
  await cont('發言');
  const why=[...picks].map(i=>'「'+S.notes[i].text.slice(0,36)+(S.notes[i].text.length>36?'…':'')+'」').join('、');
  S.reasons=(S.reasons||0)+picks.size;
  await say('你（6 號）',`我認為${voteWord(iss,v0)}。`+(why?`我的依據是筆記裡的${why}。`:'我還說不太出具體的證據。'));
  for(const p of iss.npc.filter(x=>!x[1]))await say(p[0]+'國民法官',`我傾向「${voteWord(iss,p[2]?'y':'n')}」。${p[3]}`);
  for(const p of iss.npc.filter(x=>x[1]))await say(p[0],`我傾向「${voteWord(iss,p[2]?'y':'n')}」。${p[3]}`);
  await show('審判長','每個人都說完了。現在正式投票，你可以維持，也可以改變。');
  const other=v0==='y'?'n':'y';
  actions(`<p class="label">先寫再聽 ③｜最終投票</p>
    <button class="opt" data-v="keep"><b>A</b>維持：${voteWord(iss,v0)}</button>
    <button class="opt" data-v="reason"><b>B</b>改投「${voteWord(iss,other)}」：有人提出我漏掉的證據</button>
    <button class="opt" data-v="follow"><b>C</b>改投「${voteWord(iss,other)}」：大家好像都這樣想</button>`);
  const ch=await waitClick('#actions .opt');const v=ch==='keep'?v0:other;if(ch!=='keep')S.changed.push({id:iss.id,why:ch,q:iss.short});
  S.myVote[iss.id]=v;actions('');
  const all=iss.npc.map(p=>({n:p[0],j:!!p[1],v:p[2]?'y':'n'})).concat([{n:'你（6 號）',j:false,v,me:true}]);
  const yv=all.filter(x=>x.v==='y');const need=iss.rule==='guilt'?6:5;
  const pass=yv.length>=need&&yv.some(x=>x.j)&&yv.some(x=>!x.j);S.res[iss.id]=pass;
  scene('vote');sfx('drum');
  actions(`<p class="label">${esc(iss.short)}・表決（9 票）</p>
    <div class="votes">${all.map(x=>`<div class="v ${x.v==='y'?'k':'h'} ${x.me?'me':''}"><b>${x.n}</b>${voteWord(iss,x.v)}</div>`).join('')}</div>
    <div class="meter"><div class="a" style="width:${yv.length/9*100}%"></div><div class="b" style="flex:1"></div></div>
    <div class="row"><span>${esc(iss.ys)} ${yv.length} 票</span><span>門檻 ${need} 票${iss.rule==='guilt'?'（2/3）':'（過半）'}，且含法官與國民法官</span></div>
    <div class="card ${pass?'warm':''}">${pass?iss.passText:iss.failText}</div>`);
  const pivot=(yv.length===need&&v==='y')||(yv.length===need-1&&v==='n');
  await show('審判長',pass?'達到門檻。':'沒有達到門檻'+(iss.rule==='guilt'?'，依無罪推定，不能做不利被告的認定。':'。')+(pivot?'你的一票剛好決定了結果。':''));
  await cont('繼續');
}
async function sentencing(C){
  const out=S.out;const sn=out.sent;
  if(!sn){await say('審判長',out.noSent||'評議結果不成立犯罪，不需要討論刑度。','delib');return;}
  stage('終局評議｜科刑',94);scene('delib');
  await show('審判長',`最後一個議題：${out.label}，刑度多重？請先寫下並鎖定你的刑度，再聽其他人。法官會最後發言。`);
  if(P&&P.flags&&P.flags.includes('anchor')){actions(`<div class="warnbox"><b>你的側寫提醒</b>｜前測的骰子遊戲顯示你可能受隨機數字影響。檢察官的求刑也是一個「錨」。先回到筆記裡的量刑事由，再決定數字。</div>`);await cont('收到');}
  const def=Math.round((sn.min+sn.max)/2/6)*6;
  actions(ctxHtml({filter:l=>/求處|從輕|量刑|賠償|前案|悔|對不起|復健|提心吊膽|真相|回不來/.test(l.text),title:'回顧：科刑辯論與被害人陳述'})+`<div class="card"><h4>參考</h4>${sn.ref}<div class="small">刑度範圍為遊戲簡化設定，未列出無期徒刑、死刑與罰金等選項。</div></div>
    <div class="big" id="sv"></div><input type="range" id="sl" min="${sn.min}" max="${sn.max}" step="1" value="${def}">
    <div class="row"><span>${fmt(sn.min)}</span><span>${fmt(sn.max)}</span></div><button class="btn amber" data-v="1">鎖定我的刑度</button>`);
  let sl=$('#sl'),sv=$('#sv');let up=()=>sv.textContent='有期徒刑 '+fmt(+sl.value);sl.oninput=up;up();
  await waitClick('#actions .btn');S.my0=+sl.value;actions('');
  await say('你（6 號）',`我先寫下：有期徒刑 ${fmt(S.my0)}。（已鎖定）`);
  for(const p of sn.npc.filter(x=>!x[1]))await say(p[0]+'國民法官',`我會判 ${fmt(p[2])}。${p[3]}`);
  for(const p of sn.npc.filter(x=>x[1]))await say(p[0],`我會判 ${fmt(p[2])}。${p[3]}`);
  const js=sn.npc.filter(x=>x[1]);const jAvg=js.reduce((a,p)=>a+p[2],0)/js.length;
  await show('審判長','每個人都說完了。你可以修改一次刑度，也可以維持。');
  actions(`<div class="card"><h4>你鎖定的刑度：${fmt(S.my0)}</h4><span class="small">國民法官 ${sn.npc.filter(x=>!x[1]).map(p=>fmt(p[2])).join('、')}<br>法官 ${js.map(p=>fmt(p[2])).join('、')}</span></div>
    <div class="big" id="sv"></div><input type="range" id="sl" min="${sn.min}" max="${sn.max}" step="1" value="${S.my0}">
    <p class="label">如果要修改，原因是？</p>
    <button class="opt" data-v="reason"><b>A</b>有人提到我漏看的量刑事由</button>
    <button class="opt" data-v="follow"><b>B</b>我想跟大家的意見一致</button>
    <button class="opt" data-v="keep"><b>C</b>維持我原本的刑度</button>`);
  sl=$('#sl');sv=$('#sv');up=()=>sv.textContent='有期徒刑 '+fmt(+sl.value);sl.oninput=up;up();
  const why=await waitClick('#actions .opt');
  S.my1=why==='keep'?S.my0:+sl.value;S.sentWhy=why;actions('');
  S.anchor=Math.abs(jAvg-S.my0)<1?null:Math.max(0,Math.min(100,Math.round((S.my1-S.my0)/(jAvg-S.my0)*100)));
  const vals=sn.npc.map(p=>p[2]).concat([S.my1]).sort((a,b)=>a-b);S.sentence=vals[4];S.jAvg=jAvg;
  scene('vote');sfx('drum');
  await say('審判長',`各位的意見從 ${fmt(vals[0])} 到 ${fmt(vals[8])}。依過半數意見（遊戲以 9 人的中位數呈現），刑度定為 ${fmt(S.sentence)}。`);
}
async function deliberate(C){
  hideDialog();scene('delib');bgm('delib');stage('終局評議',88);setDay(C.delibDate+'｜評議');
  actions(`<div class="card navy"><h4>評議室規則</h4>① 有罪的認定：9 票中至少 6 票，且含法官與國民法官。<br>② 量刑：過半數，且含雙方。<br>③ <b style="color:#E8B04A">先寫再聽</b>：每個議題你都先寫下自己的判斷，再聽別人，法官最後說。</div>
    <div class="card"><h4>為什麼要先寫再聽？</h4>研究發現，評議開始時的多數意見，常常就決定了最後結果（Kalven & Zeisel, 1966）；在從眾實驗中，即使答案很明顯，也有不少人會跟著一致的錯誤多數走（Asch, 1956）。先寫下來，是保護你自己的判斷。</div>`);
  await cont('進入評議');
  for(const iss of C.delib){if(iss.when&&!iss.when(S))continue;await issueVote(iss);}
  S.out=C.outcome(S);
  await sentencing(C);
}

/* ================= verdict & review ================= */
async function verdict(C){
  stage('宣示判決',100);scene('verdict');setDay(C.verdictDate+'｜宣判');bgm('verdict');sfx('rise');
  await say('法警','全體起立。');sfx('gong');
  await say('審判長',C.verdictText(S));
  review(C);
}
function leanChart(C){
  if(!S.lean.length)return '';
  const W=300,H=130,pl=26,pr=26,pt=22,pb=24,n=S.lean.length;
  const x=i=>pl+(n===1?(W-pl-pr)/2:i*(W-pl-pr)/(n-1)),y=v=>pt+v/100*(H-pt-pb);
  const pts=S.lean.map((p,i)=>`${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="心證軌跡">
    <rect x="${pl}" y="${pt}" width="${W-pl-pr}" height="${H-pt-pb}" fill="#F4F6F5"/>
    <line x1="${pl}" x2="${W-pr}" y1="${y(50)}" y2="${y(50)}" stroke="#C5D1CE" stroke-dasharray="4 4"/>
    <text x="4" y="13" font-size="11" fill="#9A3328" font-weight="700">${esc(C.lean.a)}</text>
    <text x="${W-4}" y="${H-6}" font-size="11" fill="#22578C" font-weight="700" text-anchor="end">${esc(C.lean.b)}</text>
    <polyline points="${pts}" fill="none" stroke="#0E7C74" stroke-width="3" stroke-linejoin="round"/>
    ${S.lean.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.v)}" r="5" fill="#0E7C74"/><text x="${x(i)}" y="${y(p.v)-9}" font-size="10.5" fill="#13233F" text-anchor="middle">${p.label}</text>`).join('')}
  </svg></div>`;
}
function selfCheck(){
  const out=[];if(!P)return '<p class="small">你這次沒有做心理側寫。做完側寫，這裡會比對「測驗中的你」和「評議中的你」。</p>';
  const fl=P.flags||[];
  const follow=S.changed.filter(c=>c.why==='follow').length,reason=S.changed.filter(c=>c.why==='reason').length;
  if(fl.includes('conform'))out.push(follow?'前測：從眾傾向較高｜評議：你有 '+follow+' 次因為「大家都這樣想」改票。下次先問自己：我聽到新的證據了嗎？':'前測：從眾傾向較高｜評議：你沒有因為多數而改票，守住了判斷。');
  else out.push(follow?'前測：從眾傾向不高｜評議：但你有 '+follow+' 次因為多數改票。評議室的壓力比測驗大。':(reason?'評議中你因為「新的理由」改票 '+reason+' 次，這是好的改變。':'評議中你維持了自己的判斷。'));
  if(S.anchor!=null)out.push((fl.includes('anchor')?'前測：容易受數字錨定｜':'')+`量刑：你往法官平均移動了 ${S.anchor}%。`+(S.anchor>=50&&S.sentWhy==='follow'?'而且理由是「想一致」，這正是錨定的樣子。':''));
  if(fl.includes('story'))out.push(`前測：會用故事補完空白｜本案你挑了 ${S.reasons||0} 則筆記當理由。理由越扎根在筆記，越不容易被故事帶走。`);
  if(fl.includes('credential'))out.push('前測：容易被頭銜說服｜回想一下，鑑定人說「不能判斷」的那句話，你有記進筆記嗎？');
  if(fl.includes('justworld'))out.push('前測：相信世界公平的程度較高｜這種信念有時會讓人覺得被害人「也有錯」。評議時，你有沒有因為被害人的品行而改變對事實的判斷？');
  return out.map(t=>`<p style="margin:4px 0">・${t}</p>`).join('');
}
function review(C){
  voiceStop();bgm('calm');sfx('sparkle');hideDialog();scene('court');stage('你的審判回顧',100);setDay('結案');
  DONE[S.case]=true;store('cj2-done',DONE);
  const r=(a)=>a[1]?`${a[0]}／${a[1]}`:'—';
  const iss=C.delib.filter(i=>S.myVote[i.id]);
  actions(`<div class="card navy"><h4>判決</h4>${C.verdictShort(S)}</div>
   <div class="card"><h4>你的評議</h4>${iss.map(i=>`<b>${esc(i.short)}</b>：先寫「${voteWord(i,S.firstVote[i.id])}」→ 最終「${voteWord(i,S.myVote[i.id])}」`).join('<br>')}${S.my0!=null?`<br><b>刑度</b>：先寫 ${fmt(S.my0)} → 最終 ${fmt(S.my1)}`:''}</div>
   <p class="label">心證軌跡（每個庭期結束時）</p>${leanChart(C)}
   <p class="small">信念會隨證據順序起伏，最後出現的證據常影響特別大（Hogarth & Einhorn, 1992）。看看你的線，是在哪一天轉彎的？</p>
   <div class="score"><div><b>${r(S.sc.obj)}</b>異議裁定預測</div><div><b>${r(S.sc.note)}</b>筆記練習</div><div><b>${r(S.sc.read)}</b>人性與利益觀察</div><div><b>${r(S.sc.duty)}</b>國民法官義務</div><div><b>${S.notes.length}</b>筆記則數</div><div><b>${S.asked}</b>補充詢問（不當 ${S.improper}）</div></div>
   ${S.anchor!=null?`<div class="card warm"><h4>被帶走指數（錨定）</h4><div class="anchor">${S.anchor}%</div><p>你的刑度從 ${fmt(S.my0)} 改成 ${fmt(S.my1)}，往法官平均（${fmt(S.jAvg)}）移動了 ${S.anchor}%。</p></div>`:''}
   <div class="card"><h4>側寫 vs. 你在評議室的表現</h4>${selfCheck()}</div>
   <div class="card"><h4>這個案子用到的心理學</h4>${C.psych.map(p=>`<p class="ref">・${p}</p>`).join('')}</div>
   <button class="btn amber" id="nextc">選下一個案件</button>
   <button class="btn ghost" id="seeP">${P?'看我的心理側寫':'做心理側寫前測'}</button>
   <p class="small">${C.credit}</p>`);
  $('#nextc').onclick=()=>pickCase();
  $('#seeP').onclick=()=>P?showProfile(true):runProfile().then(pickCase);
}

/* ================= case runner ================= */
async function playCase(key){
  reset();S.case=key;S.C=CASES[key];const C=S.C;
  S.sched=C.days.map(d=>({date:d.date,items:d.plan.map(t=>({t}))})).concat([{date:C.delibDate,items:[{t:'終局評議（不公開）'}]},{date:C.verdictDate,items:[{t:'宣示判決'}]}]);
  $('#issue').classList.remove('on');tally();hideToast();
  await caseIntro(C);
  await oath();
  for(let i=0;i<C.days.length;i++){
    const d=C.days[i];
    if(i>0)await between(C.days[i-1],d);
    S.dayIx=i;setDay(`第 ${i+1} 庭｜${d.date}`);stage(d.title,Math.round((i+1)/(C.days.length+2)*100));bgm('trial');
    if(C.issueHtml&&i>0)setIssue(C.issueHtml);
    markSeg();await run(d.steps);
    await dayEnd(C,i);
  }
  S.dayIx=C.days.length;
  await between(C.days[C.days.length-1],{date:C.delibDate,wait:'辯論終結後',title:'終局評議'});
  await deliberate(C);
  await verdict(C);
}
