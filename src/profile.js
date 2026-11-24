/* ================= 心理側寫前測：改編自法律心理學研究的小遊戲 ================= */
const REFS={
  asch:'Asch, S. E. (1956). Studies of independence and conformity: A minority of one against a unanimous majority. <i>Psychological Monographs, 70</i>(9).',
  bond:'Bond, C. F., & DePaulo, B. M. (2006). Accuracy of deception judgments. <i>Personality and Social Psychology Review, 10</i>(3), 214–234.',
  cooper:'Cooper, J., Bennett, E. A., & Sukel, H. L. (1996). Complex scientific testimony: How do jurors make decisions? <i>Law and Human Behavior, 20</i>(4), 379–394.',
  hired:'Cooper, J., & Neuhaus, I. M. (2000). The "hired gun" effect: Assessing the effect of pay, frequency of testifying, and credentials on the perception of expert testimony. <i>Law and Human Behavior, 24</i>(2), 149–171.',
  englich:'Englich, B., Mussweiler, T., & Strack, F. (2006). Playing dice with criminal sentences: The influence of irrelevant anchors on experts’ judicial decision making. <i>Personality and Social Psychology Bulletin, 32</i>(2), 188–200.',
  frederick:'Frederick, S. (2005). Cognitive reflection and decision making. <i>Journal of Economic Perspectives, 19</i>(4), 25–42.',
  hogarth:'Hogarth, R. M., & Einhorn, H. J. (1992). Order effects in belief updating: The belief-adjustment model. <i>Cognitive Psychology, 24</i>(1), 1–55.',
  kalven:'Kalven, H., & Zeisel, H. (1966). <i>The American Jury</i>. Little, Brown.',
  kamin:'Kamin, K. A., & Rachlinski, J. J. (1995). Ex post ≠ ex ante: Determining liability in hindsight. <i>Law and Human Behavior, 19</i>(1), 89–104.',
  kassin:'Kassin, S. M., & Wrightsman, L. S. (1983). The construction and validation of a juror bias scale. <i>Journal of Research in Personality, 17</i>(4), 423–442.',
  lerner:'Lerner, M. J. (1980). <i>The Belief in a Just World: A Fundamental Delusion</i>. Plenum.',
  lieberman:'Lieberman, J. D., & Sales, B. D. (2007). <i>Scientific Jury Selection</i>. American Psychological Association.',
  loftus:'Loftus, E. F., & Palmer, J. C. (1974). Reconstruction of automobile destruction: An example of the interaction between language and memory. <i>Journal of Verbal Learning and Verbal Behavior, 13</i>(5), 585–589.',
  mcauliff:'McAuliff, B. D., & Kovera, M. B. (2008). Juror need for cognition and sensitivity to methodological flaws in expert evidence. <i>Journal of Applied Social Psychology, 38</i>(2), 385–408.',
  neuschatz:'Neuschatz, J. S., Lawson, D. S., Swanner, J. K., Meissner, C. A., & Neuschatz, J. S. (2008). The effects of accomplice witnesses and jailhouse informants on jury decision making. <i>Law and Human Behavior, 32</i>(2), 137–149.',
  obrien:'O’Brien, B. (2009). Prime suspect: An examination of factors that aggravate and counteract confirmation bias in criminal investigations. <i>Psychology, Public Policy, and Law, 15</i>(4), 315–334.',
  pennington:'Pennington, N., & Hastie, R. (1992). Explaining the evidence: Tests of the Story Model for juror decision making. <i>Journal of Personality and Social Psychology, 62</i>(2), 189–206.',
  pronin:'Pronin, E., Lin, D. Y., & Ross, L. (2002). The bias blind spot: Perceptions of bias in self versus others. <i>Personality and Social Psychology Bulletin, 28</i>(3), 369–381.',
  rubin:'Rubin, Z., & Peplau, L. A. (1975). Who believes in a just world? <i>Journal of Social Issues, 31</i>(3), 65–89.',
  shaffer:'Shaffer, D. R., & Case, T. (1982). On the decision to testify in one’s own behalf: Effects of withheld evidence, defendant’s sexual preferences, and juror dogmatism on juridic decisions. <i>Journal of Personality and Social Psychology, 42</i>(2), 335–346.',
  steblay:'Steblay, N. M., Besirevic, J., Fulero, S. M., & Jimenez-Lorente, B. (1999). The effects of pretrial publicity on juror verdicts: A meta-analytic review. <i>Law and Human Behavior, 23</i>(2), 219–235.',
  thompson:'Thompson, W. C., & Schumann, E. L. (1987). Interpretation of statistical evidence in criminal trials: The prosecutor’s fallacy and the defense attorney’s fallacy. <i>Law and Human Behavior, 11</i>(3), 167–187.',
  volokh:'Volokh, A. (1997). n Guilty Men. <i>University of Pennsylvania Law Review, 146</i>(1), 173–216.',
};
function refsSheet(){sheet(`<h3>參考文獻</h3><p class="small">遊戲中的小關卡是「改編自」這些研究的教學設計，不是原研究的完整復刻，也不是經過信效度驗證的心理測驗。</p>`+Object.values(REFS).map(r=>`<p class="ref">${r}</p>`).join(''));}

const PTOTAL=9;
function pHead(i,title){return `<div class="q"><p class="label">心理側寫前測　${i}／${PTOTAL}｜${title}</p><div class="dots">${Array.from({length:PTOTAL},(_,j)=>`<span class="${j<i?'on':''}"></span>`).join('')}</div></div>`;}
async function choose(head,q,opts){
  actions(head+`<div class="q"><h2>${q}</h2></div>`+opts.map((o,i)=>`<button class="opt" data-v="${i}"><b>${'ABCDEF'[i]}</b>${o}</button>`).join(''));
  return +(await waitClick('#actions .opt'));
}
async function scale(head,q,lo,hi){
  actions(head+`<div class="q"><h2>${q}</h2></div><div class="chips">${[0,1,2,3,4].map(v=>`<button class="chip" data-v="${v}">${v+1}</button>`).join('')}</div><div class="row"><span>${lo}</span><span>${hi}</span></div>`);
  return +(await waitClick('#actions .chip'));
}
async function explain(html,btn='下一關'){
  actions(`<div class="lesson"><p class="label">這關在測什麼？</p>${html}</div>`);await cont(btn);
}
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const dieHtml=n=>`<div class="die">${Array.from({length:9},(_,i)=>`<span class="${PIPS[n]&&PIPS[n].includes(i)?'on':''}"></span>`).join('')}</div>`;

async function runProfile(){
  hideDialog();scene('court');setDay('選任前測');stage('國民法官心理側寫',0);bgm('calm');
  const R={};
  actions(`<div class="title" style="padding:0"><p class="label">選任之前</p><h1 style="font-size:28px">你會怎麼判斷？<br>先認識你自己。</h1>
    <p>9 個小關卡，大約 6 分鐘。每一關都改編自法律心理學的經典研究：骰子會不會影響刑度？問法會不會改變記憶？多數人說錯時你會不會跟？</p>
    <p class="small">這不是心理診斷，也不是經過驗證的量表。結果只存在你自己的瀏覽器，用來在審判中給你個人化的提醒。</p></div>`);
  await cont('開始','btn amber');

  /* 1. 背景問卷（選任程序） */
  let h=pHead(1,'背景問卷');
  R.victim=await choose(h,'你或親近的人，曾經是犯罪的被害人嗎？',['有','沒有','不想回答']);
  R.trust=await scale(h,'你對警察和檢察官調查結果的信任程度？','很不信任','非常信任');
  R.tv=await choose(h,'你多常看犯罪推理劇、法庭劇或真實犯罪節目？',['幾乎每週','偶爾','很少']);
  const g=await choose(h,'如果劇情出現傷勢、死亡或自殺的描述，你希望？',['沒問題，照常呈現','先提醒我，讓我有心理準備','能淡化就淡化']);
  R.gentle=g>0;
  await explain(`國民法官的<b>選任程序</b>中，候選人會填問卷、回答詢問，檢察官和辯護人可以依此聲請拒卻部分候選人。<br><br>不過研究整理發現，年齡、性別、職業這類背景，預測一個人怎麼判決的能力其實很弱；<b>具體的態度</b>（例如對警察的信任、心中「合理懷疑」的門檻）才比較有預測力（Lieberman & Sales, 2007；Kassin & Wrightsman, 1983）。所以接下來的關卡，測的是態度與判斷習慣。`);

  /* 2. 骰子與刑度（錨定） */
  h=pHead(2,'骰子與刑度');
  const hi=Math.random()<.5;const dA=hi?4:1,dB=hi?5:2;R.anchorDie=dA+dB;
  actions(h+`<div class="card"><h4>案件</h4>被告第 12 次在超商偷東西，這次偷了價值約 2,000 元的商品。證據明確，被告也承認。</div>
    <div class="card warm">在這個關卡，<b>檢察官的求刑由骰子決定</b>（擲出幾點就求刑幾個月）。請擲骰。</div>
    <div class="dice" id="dc">${dieHtml(3)}${dieHtml(6)}</div><button class="btn amber" id="roll">擲骰子</button>`);
  await new Promise(r=>$('#roll').onclick=r);$('#roll').remove();
  $$('.die').forEach(d=>d.classList.add('roll'));sfx('drum');
  for(let k=0;k<10;k++){$('#dc').innerHTML=dieHtml(1+Math.floor(Math.random()*6))+dieHtml(1+Math.floor(Math.random()*6));$$('.die').forEach(d=>d.classList.add('roll'));await sleep(90);}
  $('#dc').innerHTML=dieHtml(dA)+dieHtml(dB);
  $('#actions').insertAdjacentHTML('beforeend',`<div class="big">${dA} + ${dB} ＝ ${R.anchorDie}</div><div class="card">檢察官求刑：<b>有期徒刑 ${R.anchorDie} 個月</b></div>`);
  await cont('繼續');
  await choose(h,`檢察官求刑 ${R.anchorDie} 個月，你覺得？`,['太高了','差不多','太低了']);
  actions(h+`<div class="q"><h2>你會判幾個月？</h2></div><div class="votes" style="grid-template-columns:repeat(5,1fr)">${Array.from({length:15},(_,i)=>`<button class="chip" style="flex:none" data-v="${i+1}">${i+1}</button>`).join('')}</div><p class="small">單位：月。法定範圍以遊戲簡化。</p>`);
  R.anchorMonths=+(await waitClick('#actions .chip'));
  R.anchored=(R.anchorDie===9&&R.anchorMonths>=8)||(R.anchorDie===3&&R.anchorMonths<=4);
  await explain(`你擲到 <b>${R.anchorDie}</b>，判了 <b>${R.anchorMonths} 個月</b>。<br><br>Englich、Mussweiler 與 Strack（2006）讓有實務經驗的德國法官讀同一個竊盜案，求刑由法官自己擲骰決定。結果<b>擲到大點數的法官，判得明顯比擲到小點數的重</b>，即使他們知道骰子是隨機的，而且經驗多寡並沒有減少這個效果。<br><br>這叫<b>錨定效應</b>：第一個出現的數字，會悄悄變成你思考的起點。審判中，檢察官的求刑、第一個發言的人說的刑度，都可能是錨。`);

  /* 3. 車禍影片（問法與記憶） */
  h=pHead(3,'車禍影片');
  R.verb=Math.random()<.5?'撞爛':'碰到';
  actions(h+`<div class="card">請專心看一段 3 秒的路口影片。只能看一次。</div><div class="road" id="road"><div class="car a"></div><div class="car b"></div></div><button class="btn amber" id="play">播放</button>`);
  await new Promise(r=>$('#play').onclick=r);$('#play').remove();$('#road').classList.add('go');await sleep(2300);sfx('pop');await sleep(900);
  R.speed=await choose(h,`兩台車互相「${R.verb}」的時候，黃色車的時速大約是？`,['20 公里','30 公里','40 公里','50 公里','60 公里以上']);
  await explain('這一關的答案，等下一關結束後才揭曉。先記住你剛剛看到的畫面。','下一關');

  /* 4. 多數人說錯時（從眾） */
  h=pHead(4,'評議室的線段');
  const T=[{ref:90,o:[60,90,118],ans:1,npc:1},{ref:70,o:[70,100,48],ans:0,npc:1},{ref:110,o:[84,136,110],ans:2,npc:0}];
  R.conform=0;
  for(let t=0;t<T.length;t++){
    const tr=T[t];
    actions(h+`<div class="q"><h2>第 ${t+1} 題：A、B、C 哪一條和左邊的「標準線」一樣長？</h2></div>
      <div class="lines"><div class="ref"><i style="height:${tr.ref}px"></i>標準</div>${tr.o.map((v,i)=>`<div><i style="height:${v}px"></i>${'ABC'[i]}</div>`).join('')}</div>
      <p class="label">其他 5 位國民法官依序回答</p><div class="jurors" id="jr"></div>`);
    for(let k=1;k<=5;k++){await sleep(520);sfx('tap');$('#jr').insertAdjacentHTML('beforeend',`<div class="v"><b>${k} 號</b>${'ABC'[tr.npc===tr.ans&&t===0?tr.ans:tr.npc]}</div>`);}
    await sleep(300);
    $('#actions').insertAdjacentHTML('beforeend',`<p class="label">輪到你（6 號）</p><div class="chips">${['A','B','C'].map((c,i)=>`<button class="chip" data-v="${i}">${c}</button>`).join('')}</div>`);
    const v=+(await waitClick('#actions .chip'));
    if(t>0&&v===tr.npc&&v!==tr.ans)R.conform++;
  }
  await explain(`第 2、3 題，其他 5 個人<b>一致給了錯誤答案</b>。你跟著錯了 <b>${R.conform}</b> 次。<br><br>Asch（1956）的經典實驗中，受試者混在一群事先串通的人裡判斷線段長度。答案很明顯，但大約四分之三的人至少有一次跟著錯誤的多數走。<br><br>評議室也有類似壓力：法官、口才好的人、先開口的人。所以這個遊戲的評議都採用<b>先寫再聽</b>。`);

  /* 5. 讀故事（故事模型） */
  h=pHead(5,'一段案情');
  actions(h+`<div class="card"><h4>請讀一遍</h4>晚上九點，阿凱和房東在樓梯間為了房租大吵。十點左右，鄰居聽到有人急忙跑下樓的聲音。十點半，房東被發現倒在一樓樓梯口，頭部受傷。阿凱的外套掉在三樓的樓梯轉角。</div>`);
  await cont('我讀完了，蓋上');
  const items=[['阿凱和房東為了房租吵架',1],['鄰居看到阿凱跑下樓',0],['阿凱的外套掉在樓梯轉角',1],['阿凱推了房東',0],['房東是從樓梯上摔下去的',0],['鄰居聽到有人跑下樓',1]];
  R.falseRecall=0;
  for(const [t,real] of items){
    const v=await choose(h,`剛才的文字裡，有沒有寫到：「${t}」？`,['有寫到','沒有寫到']);
    if(!real&&v===0)R.falseRecall++;
  }
  await explain(`有三句其實<b>沒有寫到</b>：「鄰居<b>看到</b>阿凱」「阿凱推了房東」「房東是摔下去的」。你「記得」其中 <b>${R.falseRecall}</b> 句。<br><br>Pennington 與 Hastie 的<b>故事模型</b>研究發現：陪審員會把證據組成一個合理的故事，再用故事來決定判決；故事需要、但證據沒有的情節，常常會被自動補上，而且故事越完整，人越有信心（Pennington & Hastie, 1992）。<br><br>所以筆記的第一課，就是分清楚<b>「證人說的事實」和「我推出來的結論」</b>。`);

  /* 3b. 車禍追問 */
  h=pHead(6,'回到車禍影片');
  R.glass=await choose(h,'回想剛才的車禍影片：畫面中有沒有碎玻璃？',['有','沒有','不確定']);
  await explain(`影片裡<b>沒有</b>碎玻璃。你剛才被問的是：兩台車「<b>${R.verb}</b>」時的時速。<br><br>Loftus 與 Palmer（1974）讓受試者看車禍影片後，只改變問句的一個動詞。被問「smashed（撞爛）」的人估計的車速比較快；一週後，他們之中約 32% 說看到了碎玻璃，被問「hit（撞到）」的人只有約 14%，但影片裡根本沒有碎玻璃。<br><br>法庭上的對應：<b>問題的用字會改變證人的記憶</b>。這就是主詰問不准誘導的原因之一。`);

  /* 6. 合理懷疑門檻 */
  h=pHead(7,'你的有罪門檻');
  actions(h+`<div class="q"><h2>要有多少把握，你才會判一個人殺人罪有罪？</h2></div><div class="big" id="thv">80%</div><input type="range" id="th" min="50" max="100" value="80"><div class="row"><span>50%（一半一半）</span><span>100%（完全確定）</span></div>`);
  $('#th').oninput=()=>$('#thv').textContent=$('#th').value+'%';
  await cont('確定');R.threshold=+(($('#th')||{}).value||80);
  if(!R.threshold)R.threshold=80;
  const bs=await choose(h,'「寧可放走 N 個有罪的人，也不要冤枉一個無辜的人。」你心中的 N 是？',['0：有罪的一個都不能放','1','10','100']);
  R.blackstone=[0,1,10,100][bs];
  R.jbs1=await scale(h,'「會被起訴的人，大多數真的有做。」','非常不同意','非常同意');
  R.jbs2=await scale(h,'「證據只要還有一點疑問，就應該判無罪。」','非常不同意','非常同意');
  await explain(`法律沒有規定「合理懷疑」是幾 %，但每個人心中的門檻差很多。你選了 <b>${R.threshold}%</b>，N＝<b>${R.blackstone}</b>。<br><br>「寧縱十惡」的比例在法律史上有很多版本，有人說 10、有人說 100（Volokh, 1997）。Kassin 與 Wrightsman（1983）的<b>陪審員偏見量表</b>也從兩個面向測量：你多相信「被起訴＝有做」，以及你對合理懷疑的標準多嚴格。這兩題就是改編自那兩個面向。`);

  /* 7. 公正世界 */
  h=pHead(8,'世界公平嗎');
  R.jw1=await scale(h,'「整體來說，人通常會得到他應得的。」','非常不同意','非常同意');
  R.jw2=await scale(h,'「遇到壞事的人，多少也有自己的問題。」','非常不同意','非常同意');
  await explain(`這兩題改編自<b>公正世界信念</b>（Lerner, 1980；Rubin & Peplau, 1975）。相信世界公平能讓人安心，但當壞事發生在無辜的人身上時，有些人會不自覺地去找「被害人哪裡做錯」，好讓世界看起來仍然公平。<br><br>在有外遇、欠債等情節的案件中，要特別注意：被害人的品行，不會改變被告有沒有做那件事。`);

  /* 8. 直覺與反思 + 專家 */
  h=pHead(9,'快想與慢想');
  const c1=await choose(h,'一支筆和一本筆記本共 110 元，筆記本比筆貴 100 元。筆多少錢？',['10 元','5 元','15 元']);
  const c2=await choose(h,'5 台影印機 5 分鐘印 5 份卷宗。100 台影印機印 100 份，要幾分鐘？',['100 分鐘','5 分鐘','20 分鐘']);
  R.crt=(c1===1)+(c2===1);
  const ex=await choose(h,'兩位專家對同一件事意見不同，誰比較有說服力？',[
    '甲：國立大學名譽教授、從業 35 年。「我看過上千件，這種傷一定是故意造成的。」',
    '乙：地區醫院主治醫師。「我比對了三個角度的照片和兩種文獻標準，這種傷有 A、B 兩種可能，無法排除任一種。」',
    '要看他們的方法和依據，光看這兩段很難判斷']);
  R.credential=ex===0;
  await explain(`兩題數學的直覺答案是 10 元、100 分鐘，正確是 <b>5 元、5 分鐘</b>。你答對 <b>${R.crt}</b> 題。這改編自 Frederick（2005）的<b>認知反思測驗</b>：直覺很快，但需要停下來檢查。<br><br>專家題：研究發現，專家證詞越複雜難懂，陪審員越容易改用<b>頭銜</b>來判斷（Cooper, Bennett & Sukel, 1996）；比較願意花心思思考的人，比較能看出專家方法上的漏洞（McAuliff & Kovera, 2008）。甲的頭銜比較亮眼，但他說的是「一定」，卻沒有說依據。`,'看我的側寫');

  P=buildProfile(R);store('cj2-profile',P);
  await showProfile(false);
}

function buildProfile(R){
  const cl=v=>Math.max(0,Math.min(100,Math.round(v)));
  const t={
    anchor:R.anchored?75:25,
    conform:R.conform*50,
    story:Math.round(R.falseRecall/3*100),
    misinfo:cl((R.glass===0?75:R.glass===2?45:15)+(R.verb==='撞爛'&&R.speed>=3?10:0)),
    credential:R.credential?75:25,
    justworld:Math.round((R.jw1+R.jw2)/8*100),
    reflect:R.crt*50,
    convict:cl((100-R.threshold)*1.3+R.jbs1*8+(4-R.jbs2)*7+(R.blackstone<=1?14:0)+R.trust*3),
  };
  const risk=['story','conform','anchor','misinfo','credential','justworld'];
  const flags=risk.filter(k=>t[k]>=60);
  const top=risk.slice().sort((a,b)=>t[b]-t[a])[0];
  return {R,t,flags,top:t[top]>=60?top:'calm',gentle:R.gentle,at:Date.now()};
}
const ARCH={
  story:['故事建築師','你很會把零碎的證據拼成一個完整的故事。風險是把「應該是這樣」當成「真的是這樣」。審判中請特別練習：筆記只寫證人說的話，推論另外標記。','affair'],
  conform:['團隊和聲者','你重視共識，也願意聽別人。風險是在評議室裡太早放下自己的判斷，尤其是法官或多數人先開口時。','land'],
  anchor:['數字追隨者','第一個出現的數字容易變成你的起點。量刑時，檢察官的求刑、第一個人說的刑度，都可能把你帶走。','kidnap'],
  misinfo:['記憶修圖師','你的記憶容易被後來的問法悄悄修改。聽交互詰問時，注意問題是怎麼問的，證人回答的是自己的記憶，還是問題裡的版本。','murder'],
  credential:['頭銜信任者','你信任專業與權威。風險是只看頭銜，不看方法。審判中會有好幾位專家，記得問：他的依據是什麼？他說了哪些「不能判斷」？','bribe'],
  justworld:['秩序守護者','你相信世界大致公平、善惡有報。風險是在被害人「不完美」時，不自覺地降低對被害人的同情，或混淆品行與事實。','kidnap'],
  calm:['冷靜會計師','在這些關卡裡你相對穩定。提醒：研究發現，人最大的盲點常是「覺得自己沒有盲點」（Pronin, Lin & Ross, 2002）。真正的法庭比測驗複雜得多。','murder'],
};
const TRAIT_LABEL={anchor:'錨定敏感',conform:'從眾壓力',story:'故事補完',misinfo:'記憶易被問法改變',credential:'頭銜依賴',justworld:'公正世界信念',reflect:'反思檢查',convict:'定罪傾向'};
function voirDire(P){
  const c=P.t.convict;
  const pros=c>=55?'可能想<b>留下你</b>：你對調查結果較信任、有罪門檻相對低。':c<=35?'可能考慮<b>拒卻你</b>：你心中的有罪門檻很高。':'大概不會特別在意你。';
  const def=c<=35?'可能想<b>留下你</b>：你很重視合理懷疑。':c>=55?'可能考慮<b>拒卻你</b>：你較傾向相信起訴內容。':'大概不會特別在意你。';
  return `檢察官：${pros}<br>辯護人：${def}<br><span class="small">真實的選任程序中，檢辯雙方都可以不附理由拒卻一定人數的候選人。這裡只是用你的前測模擬雙方的視角。</span>`;
}
async function showProfile(fromReview){
  hideDialog();scene('court');setDay('我的側寫');stage('國民法官心理側寫',100);sfx('sparkle');
  const a=ARCH[P.top]||ARCH.calm;const t=P.t;
  const extra=t.reflect>=100?'＋慢想派':'';
  const bar=k=>`<span>${TRAIT_LABEL[k]}</span><span class="bar"><i class="${t[k]>=60&&k!=='reflect'?'hi':''}" style="width:${Math.max(4,t[k])}%"></i></span><span class="num">${t[k]}</span>`;
  const tips={story:'筆記裡把「推論」和「事實」分開。',conform:'評議時先寫下自己的票，再聽別人。',anchor:'量刑前先列量刑事由，再看數字。',misinfo:'注意詰問的用字，特別是誘導式問題。',credential:'記下專家「不能判斷」的部分。',justworld:'被害人的品行，不等於被告有沒有做。'};
  actions(`<div class="type"><p class="label" style="color:#5FD3C4">你的國民法官側寫</p><h3>${a[0]}${extra}</h3><p>${a[1]}</p></div>
    <div class="prof">${['anchor','conform','story','misinfo','credential','justworld','reflect','convict'].map(bar).join('')}</div>
    <p class="small">橘色代表在這個傾向上分數較高，審判中會收到對應的提醒。分數只是遊戲中的粗略指標。</p>
    ${P.flags.length?`<div class="card warm"><h4>審判中會提醒你</h4>${P.flags.map(f=>'・'+tips[f]).join('<br>')}</div>`:''}
    <div class="card"><h4>選任程序：檢辯雙方怎麼看你</h4>${voirDire(P)}</div>
    <button class="btn amber" id="pgo">${fromReview?'選下一個案件':'選擇案件（推薦：'+CASES[a[2]].short+'）'}</button>
    <button class="btn ghost" id="pref">查看參考文獻</button>
    <button class="btn ghost" id="predo">重新做前測</button>`);
  $('#pref').onclick=refsSheet;
  await new Promise(r=>{$('#pgo').onclick=r;$('#predo').onclick=async()=>{await runProfile();r('done');};}).then(v=>{if(v!=='done')return pickCase();});
}
