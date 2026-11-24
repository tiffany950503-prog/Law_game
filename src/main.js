/* ================= case picker & title ================= */
const CASE_ORDER=['murder','dui','affair','land','kidnap','bribe'];
async function pickCase(){
  reset();hideDialog();hideToast();scene('court');setDay('選擇案件');stage('國民法官：庭審日誌',0);$('#issue').classList.remove('on');tally();bgm('calm');
  const rec=P?(ARCH[P.top]||ARCH.calm)[2]:null;
  actions(`<p class="label">選擇要審理的案件</p><div class="cases">${CASE_ORDER.map(k=>{const C=CASES[k];return `<button class="case ${k===rec?'rec':''}" data-v="${k}"><h4><span>${C.title}</span>${k===rec?'<em>推薦你</em>':''}</h4><span class="small">${C.sub}</span><span class="tags">${C.tags.map(t=>`<span>${t}</span>`).join('')}<span>${C.days.length} 個庭期＋評議</span></span>${DONE[k]?'<span class="done">✓ 已審理過</span>':''}</button>`;}).join('')}</div>
    <p class="small">現實中國民法官是逐案隨機抽選，不能挑案件，也不會依個性分案。這裡只是選擇練習的案子。所有案件除《王鈞殺人未遂案》改編自司法院模擬劇本外，皆為虛構。</p>
    <button class="btn ghost" id="toP">${P?'看我的心理側寫':'先做心理側寫前測'}</button>`);
  $('#toP').onclick=()=>P?showProfile(false):runProfile();
  const k=await waitClick('.case');
  actions('');await playCase(k);
}
async function start(){
  reset();hideDialog();scene('court');setDay('國民法官');stage('庭審日誌',0);
  actions(`<div class="title"><p class="label">國民法官模擬遊戲</p><h1>你被抽中了。<br>這次，要開好幾天庭。</h1>
    <p>六個案件：殺人、酒駕致死、外遇疑雲、財團與土地、擄人勒贖、收賄。每個案子都有開審陳述、交互詰問、鑑定人、新證人，最後進評議室投票。</p>
    <p>開庭前，先玩 9 個改編自<b>法律心理學研究</b>的小關卡，看看你的判斷習慣可能怎麼影響審判。</p>
    <button class="btn amber" id="go">${P?'重新做心理側寫':'開始心理側寫（約 6 分鐘）'}</button>
    <button class="btn ghost" id="skip">${P?'用上次的側寫，直接選案':'跳過，直接選案'}</button>
    <p class="small">有背景音樂、音效與角色語音，右上角「♪」可調整。「筆」是筆記本與證據櫃，「？」可請審判長白話解釋法律名詞。</p></div>`);
  const v=await new Promise(r=>{$('#go').onclick=()=>r('p');$('#skip').onclick=()=>r('s');});
  auInit();bgm('calm');
  if(v==='p')await runProfile();else await pickCase();
}
start();
