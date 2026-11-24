/* ================= evidence illustrations (inline SVG, 320×180) ================= */
const EVC={ink:'#13233F',paper:'#FFFDF6',line:'#C9BFA6',teal:'#0E7C74',amber:'#E8B04A',red:'#B5473A',blue:'#2F6FB0',mute:'#6B7689',bg:'#E9EEF0',dark:'#16264A'};
const svgWrap=(body,bg=EVC.bg)=>`<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" font-family="Noto Sans TC, system-ui, sans-serif" role="img"><rect width="320" height="180" fill="${bg}"/>${body}</svg>`;
const tx=(x,y,t,o={})=>`<text x="${x}" y="${y}" font-size="${o.s||11}" fill="${o.c||EVC.ink}" font-weight="${o.w||500}" text-anchor="${o.a||'start'}"${o.it?' font-style="italic"':''}>${esc(t)}</text>`;
/* a paper document with labelled rows; hl = highlighted row index */
function evDoc(title,rows,o={}){
  const h=Math.min(170,34+rows.length*20+(o.stamp?24:0));let b=`<rect x="60" y="${(180-h)/2}" width="200" height="${h}" rx="3" fill="${EVC.paper}" stroke="${EVC.line}"/>`;
  const y0=(180-h)/2;b+=tx(160,y0+18,title,{a:'middle',w:700,s:12});b+=`<line x1="72" x2="248" y1="${y0+25}" y2="${y0+25}" stroke="${EVC.line}"/>`;
  rows.forEach((r,i)=>{const y=y0+40+i*20;if(i===o.hl)b+=`<rect x="66" y="${y-13}" width="188" height="18" rx="2" fill="${EVC.amber}" opacity=".35"/>`;
    b+=r[1]===undefined?tx(74,y,r[0],{s:10.5,c:o.hand?EVC.blue:EVC.ink,it:o.hand}):tx(74,y,r[0],{s:10,c:EVC.mute})+tx(246,y,r[1],{s:10.5,w:700,a:'end',c:o.hand?EVC.blue:EVC.ink});});
  if(o.stamp)b+=`<g transform="rotate(-8 226 ${y0+h-15})"><rect x="198" y="${y0+h-27}" width="56" height="22" rx="3" fill="none" stroke="${EVC.red}" stroke-width="2"/>${tx(226,y0+h-12,o.stamp,{a:'middle',c:EVC.red,w:700,s:10})}</g>`;
  if(o.sign)b+=`<path d="M170 ${y0+h-16} c8 -10 14 6 22 -4 s10 4 18 -2 s8 2 14 -3" fill="none" stroke="${EVC.blue}" stroke-width="1.6"/>`;
  return svgWrap(b);
}
/* a phone screen with a list of entries */
function evPhone(title,items){
  let b=`<rect x="100" y="8" width="120" height="164" rx="14" fill="${EVC.ink}"/><rect x="106" y="20" width="108" height="144" rx="4" fill="#F7F9FA"/>`;
  b+=tx(160,34,title,{a:'middle',w:700,s:10.5});
  items.forEach((it,i)=>{const y=46+i*30;b+=`<rect x="110" y="${y}" width="100" height="26" rx="4" fill="${it.hl?'#FCEFD4':'#fff'}" stroke="${it.hl?EVC.amber:'#DDE3E6'}"/>`+tx(114,y+11,it.t,{s:8.6,w:700})+tx(114,y+22,it.s||'',{s:8,c:EVC.mute});});
  return svgWrap(b);
}
const EVIMG={
 /* ---- 王鈞殺人未遂案 ---- */
 A1:()=>svgWrap(`<rect x="40" y="76" width="70" height="26" rx="8" fill="#7A4A2A"/><circle cx="58" cy="89" r="3" fill="#D9C3A5"/><circle cx="92" cy="89" r="3" fill="#D9C3A5"/>
   <path d="M110 78 H270 L292 89 L270 100 H110 Z" fill="#CBD3DA" stroke="#8A96A3"/><path d="M150 78 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5 l6 -5 l6 5" fill="none" stroke="#8A96A3" stroke-width="1.5"/>
   <line x1="110" x2="292" y1="124" y2="124" stroke="${EVC.ink}"/><line x1="110" x2="110" y1="118" y2="130" stroke="${EVC.ink}"/><line x1="292" x2="292" y1="118" y2="130" stroke="${EVC.ink}"/>${tx(201,142,'刀刃 15 公分（最寬 3 公分，鋸齒）',{a:'middle',s:10.5,w:700})}
   <line x1="40" x2="292" y1="56" y2="56" stroke="${EVC.mute}" stroke-dasharray="3 3"/>${tx(166,48,'全長 25 公分',{a:'middle',s:10,c:EVC.mute})}<rect x="16" y="150" width="70" height="20" rx="3" fill="${EVC.amber}"/>${tx(51,164,'扣案物 A1',{a:'middle',s:10,w:700})}`),
 A2:()=>svgWrap(`<rect x="0" y="0" width="320" height="180" fill="#D8CFC0"/><rect x="40" y="10" width="110" height="120" fill="#8C6A4C"/><rect x="48" y="18" width="94" height="112" fill="#A47E5C"/><circle cx="132" cy="76" r="4" fill="#E8C66A"/>
   ${Array.from({length:6},(_,i)=>`<line x1="0" x2="320" y1="${130+i*9}" y2="${130+i*9}" stroke="#C2B6A2"/>`).join('')}<rect x="30" y="128" width="130" height="6" fill="#6E5440"/>
   <path d="M95 140 q25 -10 55 0 q30 8 10 22 q-25 14 -60 6 q-30 -8 -5 -28z" fill="#7E2A22" opacity=".85"/><ellipse cx="190" cy="160" rx="14" ry="5" fill="#7E2A22" opacity=".7"/><ellipse cx="70" cy="150" rx="8" ry="3" fill="#7E2A22" opacity=".6"/>
   <rect x="200" y="20" width="104" height="22" rx="3" fill="#fff" opacity=".85"/>${tx(252,35,'現場照片 A2・門口',{a:'middle',s:10,w:700})}<line x1="60" x2="240" y1="174" y2="174" stroke="${EVC.ink}"/>${tx(250,172,'約 1 公尺',{s:9.5})}`,'#D8CFC0'),
 A3:()=>evDoc('診斷證明書',[['部位','左腹部穿刺傷'],['傷口','寬 3 公分、深 6 公分'],['併發','出血性休克'],['處置','曾發病危通知'],['住院','8 天']],{hl:1,stamp:'急診室'}),
 A4:()=>evPhone('119 通話紀錄',[{t:'21:46 李芸 → 119',s:'通報有人受傷',hl:1},{t:'21:47 王鈞 → 林美華',s:'通話 38 秒',hl:1},{t:'王鈞 → 119',s:'無紀錄'}]),
 /* ---- 周志明酒駕致死案 ---- */
 E1:()=>svgWrap(`<rect x="90" y="20" width="140" height="130" rx="16" fill="${EVC.ink}"/><rect x="104" y="36" width="112" height="52" rx="6" fill="#0B3B37"/>${tx(160,70,'0.48',{a:'middle',s:26,w:700,c:'#5FD3C4'})}${tx(160,82,'mg/L',{a:'middle',s:9,c:'#5FD3C4'})}
   ${tx(160,108,'法定門檻 0.25',{a:'middle',s:10,c:'#F4F6F5'})}${tx(160,126,'事故後約 40 分鐘施測',{a:'middle',s:9.5,c:'#BFD8D5'})}<rect x="150" y="150" width="20" height="22" fill="${EVC.ink}"/>`),
 E2:()=>svgWrap(`<rect width="320" height="180" fill="#3D4453"/><rect x="0" y="100" width="320" height="80" fill="#5C6575"/>${Array.from({length:8},(_,i)=>`<rect x="${10+i*40}" y="137" width="22" height="4" fill="#F4F6F5"/>`).join('')}
   <rect x="250" y="14" width="22" height="58" rx="5" fill="#111"/><circle cx="261" cy="28" r="7" fill="${EVC.red}"/><circle cx="261" cy="44" r="7" fill="#4A3E1A"/><circle cx="261" cy="60" r="7" fill="#1E3A2A"/>
   <rect x="110" y="112" width="70" height="28" rx="8" fill="#F4F6F5"/><rect x="122" y="116" width="34" height="11" rx="3" fill="#8FB7D9"/>${tx(145,104,'→ 約 72 km/h（速限 50）',{a:'middle',s:10,c:'#F4F6F5',w:700})}
   <circle cx="14" cy="14" r="5" fill="${EVC.red}"/>${tx(24,18,'CAM 03　22:40:17　紅燈',{s:10,c:'#F4F6F5'})}`,'#3D4453'),
 E3:()=>evDoc('死亡證明書',[['死亡時間','翌日凌晨'],['死因','頭部重創'],['送醫','急救後不治']],{stamp:'醫院'}),
 E4:()=>evPhone('通話紀錄',[{t:'22:43 周志明 → 119',s:'通報有人受傷',hl:1},{t:'22:52 員警到場',s:''}]),
 E5:()=>svgWrap(`<rect width="320" height="180" fill="#2A2F3A"/><rect x="0" y="110" width="320" height="70" fill="#4A5160"/><rect x="150" y="96" width="96" height="34" rx="10" fill="#F4F6F5"/><rect x="164" y="101" width="40" height="12" rx="3" fill="#8FB7D9"/>
   <g fill="#C8CED6"><circle cx="118" cy="82" r="7"/><rect x="112" y="90" width="12" height="28" rx="4"/><circle cx="262" cy="82" r="7"/><rect x="256" y="90" width="12" height="28" rx="4"/></g>
   <rect x="20" y="40" width="96" height="22" rx="10" fill="#fff"/>${tx(68,55,'0:12「是那台白車」',{a:'middle',s:9.5,w:700})}<rect x="180" y="46" width="136" height="22" rx="10" fill="${EVC.amber}"/>${tx(248,61,'0:15「是我開的，我有喝酒」',{a:'middle',s:8.6,w:700})}
   <circle cx="14" cy="14" r="5" fill="${EVC.red}"/>${tx(24,18,'BODYCAM　22:52　車旁 2 人',{s:10,c:'#F4F6F5'})}`,'#2A2F3A'),
 E6:()=>evDoc('前案紀錄表',[['13 年前','酒後駕車'],['結果','判刑確定'],['10 年內再犯','否（不適用）']],{hl:2}),
 E7:()=>evDoc('和解資料',[['被告提出','賠償方案'],['家屬','尚未接受']]),
 E8:()=>evDoc('生活狀況資料',[['家庭','經濟支柱、子女 2 人'],['學歷','大學畢業'],['職業','業務經理']]),
 /* ---- 沈雅雯殺夫案 ---- */
 B1:()=>svgWrap(`<rect x="30" y="30" width="140" height="110" fill="#fff" stroke="${EVC.ink}" stroke-width="2"/>${tx(100,56,'主臥室',{a:'middle',w:700})}<rect x="80" y="92" width="34" height="24" rx="3" fill="#6E4A2A"/>${tx(97,130,'炭盆',{a:'middle',s:9.5})}
   <rect x="170" y="30" width="120" height="110" fill="#fff" stroke="${EVC.ink}" stroke-width="2"/>${tx(230,56,'女兒房',{a:'middle',w:700})}${tx(230,72,'（被告當晚睡此）',{a:'middle',s:9,c:EVC.mute})}
   <rect x="30" y="140" width="260" height="24" fill="#DCE8F2" stroke="${EVC.ink}"/>${tx(160,156,'陽台（兩房相通）',{a:'middle',s:10,w:700})}
   <rect x="70" y="136" width="40" height="8" fill="${EVC.amber}"/>${tx(90,176,'落地窗：未上鎖＋毛巾',{a:'middle',s:9,c:EVC.red,w:700})}
   <rect x="24" y="60" width="10" height="36" fill="${EVC.amber}"/>${tx(28,24,'房門：內側反鎖、膠帶貼內側',{s:9.5,c:EVC.red,w:700})}`),
 B2:()=>evDoc('解剖與毒物報告',[['死因','一氧化碳中毒'],['COHb','62%'],['zolpidem','高於治療劑量'],['血中酒精','0.06%'],['抵抗傷','無']],{hl:2,stamp:'法醫所'}),
 B3:()=>svgWrap(`<rect x="70" y="40" width="70" height="110" rx="10" fill="#F2A65A" opacity=".85"/><rect x="66" y="26" width="78" height="20" rx="4" fill="#fff" stroke="#C9BFA6"/><rect x="76" y="70" width="58" height="50" rx="3" fill="#fff"/>
   ${tx(105,86,'Zolpidem',{a:'middle',s:9.5,w:700})}${tx(105,99,'10mg × 30',{a:'middle',s:9})}${tx(105,112,'沈雅雯 3/1',{a:'middle',s:8.5,c:EVC.mute})}
   ${Array.from({length:6},(_,i)=>`<ellipse cx="${178+(i%3)*24}" cy="${90+Math.floor(i/3)*22}" rx="9" ry="5" fill="#fff" stroke="${EVC.mute}"/>`).join('')}
   ${tx(202,138,'查扣時剩 6 顆',{a:'middle',s:11,w:700})}${tx(202,154,'（依處方應剩約 16 顆）',{a:'middle',s:9.5,c:EVC.red,w:700})}`),
 B4:()=>svgWrap(`${[[110,'死者的杯子','檢出 zolpidem',EVC.red],[210,'被告的杯子','未檢出',EVC.teal]].map(([x,a,b,c])=>`<path d="M${x-22} 40 h44 q0 40 -22 48 q-22 -8 -22 -48z" fill="#F4E4E8" stroke="${EVC.mute}"/><path d="M${x-18} 56 h36 q-2 24 -18 28 q-16 -4 -18 -28z" fill="#8C2F45" opacity=".7"/><line x1="${x}" x2="${x}" y1="88" y2="124" stroke="${EVC.mute}" stroke-width="2"/><ellipse cx="${x}" cy="126" rx="18" ry="4" fill="${EVC.mute}"/>${tx(x,146,a,{a:'middle',s:10.5,w:700})}${tx(x,162,b,{a:'middle',s:10,c:c,w:700})}`).join('')}${tx(160,22,'酒瓶：未檢出藥物',{a:'middle',s:10,c:EVC.mute})}`),
 C1:()=>evPhone('死者手機・鑑識',[{t:'3/13 14:10 搜尋',s:'木炭 一氧化碳｜在公司',hl:1},{t:'3/14 23:40 LINE',s:'「對不起，我撐不下去了」'},{t:'3/14 23:51 密碼解鎖',s:'搜尋「燒炭 多久 會」',hl:1},{t:'臉部辨識失敗 1 次',s:'原因未記錄'}]),
 C2:()=>evPhone('被告手機・鑑識',[{t:'23:45～00:12',s:'計步 132 步',hl:1},{t:'定位',s:'住家'}]),
 /* ---- 青山村土地案 ---- */
 L1:()=>evDoc('土地洽談紀錄',[['洽談次數','7 次'],['出價','每坪 3 萬 → 6 萬'],['古阿松','均拒絕'],['5/20 鄭國棟手寫備註：'],['　']],{hl:4}).replace('</svg>',tx(74,143,'「最後一戶，月底前處理掉」',{s:11.5,c:EVC.red,w:700,it:true})+'</svg>'),
 L2:()=>evDoc('解剖報告',[['骨折','右側肋骨 3 根'],['外傷','胸背多處鈍挫傷'],['死因','鈍傷誘發心肌梗塞'],['既往病史','冠狀動脈疾病']],{hl:2,stamp:'法醫'}),
 L3:()=>evDoc('匯款紀錄',[['日期','6/3 10:12'],['匯出','鴻運開發'],['收款','黃志彪（個人）'],['金額','500,000'],['摘要','整地顧問費'],['契約','無']],{hl:5}),
 L4:()=>evPhone('6/2 通聯紀錄',[{t:'20:14 鄭 → 黃',s:'3 分 12 秒',hl:1},{t:'21:58 黃 → 鄭',s:'未接'},{t:'6/3 07:40 鄭 → 黃',s:'1 分 05 秒'}]),
 /* ---- 三百萬欠條案 ---- */
 K1:()=>evDoc('欠條',[['蘇志遠積欠吳俊傑'],['新台幣參佰萬元整'],['於 2025/6/30 前清償'],['2024/12/20　立據人：']],{hand:true,sign:true,hl:1}),
 K2:()=>svgWrap(`<rect x="20" y="30" width="280" height="60" rx="8" fill="${EVC.ink}"/>${Array.from({length:46},(_,i)=>{const h=6+Math.abs(Math.sin(i*1.7)*18+Math.sin(i*.6)*10);return `<rect x="${30+i*5.8}" y="${60-h/2}" width="3" height="${h}" fill="#5FD3C4"/>`;}).join('')}
   ${tx(26,22,'錄音 8/10 10:05（蘇妻手機）',{s:10,w:700})}<rect x="20" y="102" width="280" height="62" rx="6" fill="#fff" stroke="${EVC.line}"/>${tx(30,122,'「三百萬，一毛都不能少，',{s:10.5})}${tx(30,138,'再加五十萬，算他讓我等這麼久。',{s:10.5,c:EVC.red,w:700})}${tx(30,154,'明天中午前，不然你們就見不到他了。」',{s:10.5})}`),
 K3:()=>evDoc('診斷證明書',[['診斷','腰椎第一節爆裂性骨折'],['功能','雙下肢肌力明顯減弱'],['預後','須長期復健，難完全恢復']],{hl:1,stamp:'骨科'}),
 K4:()=>svgWrap(`<path d="M40 160 V60 L160 30 L280 60 V160 Z" fill="#B9C2CC" stroke="${EVC.ink}"/>${Array.from({length:9},(_,i)=>`<line x1="${52+i*26}" x2="${52+i*26}" y1="${60-(i<5?i*6:(8-i)*6)}" y2="160" stroke="#9AA6B2"/>`).join('')}
   <rect x="60" y="78" width="200" height="6" fill="${EVC.ink}"/>${tx(160,74,'二樓夾層',{a:'middle',s:9.5,w:700})}<rect x="206" y="90" width="30" height="22" fill="#DCE8F2" stroke="${EVC.ink}"/>${tx(221,124,'窗（無鐵窗）',{a:'middle',s:9,c:EVC.red,w:700})}
   <line x1="292" x2="292" y1="100" y2="160" stroke="${EVC.red}" stroke-width="1.5"/><path d="M288 104 l4 -6 l4 6 M288 156 l4 6 l4 -6" fill="none" stroke="${EVC.red}"/>${tx(286,134,'4.5m',{s:10,c:EVC.red,w:700,a:'end'})}
   <rect x="90" y="120" width="30" height="40" fill="#8A96A3"/><path d="M96 138 h18" stroke="#444" stroke-width="3" stroke-dasharray="3 2"/>${tx(105,174,'門：鐵鍊外鎖',{a:'middle',s:9})}`),
 /* ---- 漁港標案收賄案 ---- */
 Q1:()=>{const base=150,sc=v=>base-(v-4400)/620*120;const bar=(x,v,c,l)=>`<rect x="${x}" y="${sc(v)}" width="42" height="${base-sc(v)}" fill="${c}"/>${tx(x+21,sc(v)-5,v.toLocaleString(),{a:'middle',s:9.5,w:700})}${tx(x+21,base+14,l,{a:'middle',s:9.5})}`;
   return svgWrap(`<line x1="30" x2="300" y1="${base}" y2="${base}" stroke="${EVC.ink}"/>${bar(40,4791,EVC.teal,'宏達（得標）')}${bar(110,4880,'#9AA6B5','乙廠商')}${bar(180,4920,'#9AA6B5','丙廠商')}
   <line x1="30" x2="250" y1="${sc(4800)}" y2="${sc(4800)}" stroke="${EVC.red}" stroke-dasharray="5 3"/>${tx(312,sc(4800)+4,'底價 4,800',{a:'end',s:9.5,c:EVC.red,w:700})}
   <line x1="30" x2="250" y1="${sc(4830)}" y2="${sc(4830)}" stroke="${EVC.amber}" stroke-dasharray="2 3"/>${tx(312,sc(4830)-3,'預估 4,830',{a:'end',s:9,c:'#8A6410',w:700})}${tx(160,18,'決標紀錄（萬元）｜得標價＝底價 99.81%',{a:'middle',s:10,w:700})}`);},
 Q2:()=>evDoc('借據',[['林正雄向陳志忠'],['借款新台幣捌拾萬元'],['（無利息、無還款期限）'],['2024/4/26　雙方簽名：']],{hand:true,sign:true,hl:2}),
 Q3:()=>evDoc('還款與醫療紀錄',[['2024/5/2','林母手術費 62 萬（現金）'],['2025/3/2','調查局搜索宏達'],['2025/3/9','林 → 陳 匯 20 萬']],{hl:2}),
 Q4:()=>svgWrap(`<rect x="40" y="16" width="240" height="150" rx="4" fill="#F7F1DE" stroke="${EVC.line}"/>${Array.from({length:7},(_,i)=>`<line x1="50" x2="270" y1="${44+i*18}" y2="${44+i*18}" stroke="#D9CCA6"/>`).join('')}
   ${tx(160,34,'宏達營造 手寫帳冊',{a:'middle',s:10.5,w:700})}${tx(56,58,'4/20　材料行　12',{s:10.5,c:EVC.blue,it:true})}<rect x="50" y="64" width="220" height="18" fill="${EVC.amber}" opacity=".4"/>${tx(56,77,'4/26　林　80（公關）',{s:11,c:EVC.blue,it:true,w:700})}
   ${tx(56,95,'4/28　縣議員 A　20（公關）',{s:10.5,c:EVC.blue,it:true})}${tx(56,113,'5/01　工地主任紅包　5',{s:10.5,c:EVC.blue,it:true})}${tx(160,150,'全冊無「借出」「應收」項目',{a:'middle',s:9.5,c:EVC.red,w:700})}`,'#E9EEF0'),
};
const EV_SENSITIVE=['A2'];
function evImg(id,small){const f=EVIMG[id];if(!f)return '';return `<div class="evimg${small?' sm':''}">${f()}</div>`;}
