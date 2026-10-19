/* 电车之狼 · 界面脚本
 * 目标选择器 / 状态栏 / 账本，全部由脚本自己挂到酒馆页面「输入栏正上方」。
 * 挂载方式：插在 #form_sheld（输入栏容器）前面，占满输入栏宽度、随输入栏一起留在页面上。
 * 不依赖消息楼层、不依赖正则渲染、不占用任何消息文本。
 * 选择器同样锚在输入栏上方展开，不再悬浮在屏幕中央。
 */
(function () {
  var P = window.parent || window;
  // 脚本可能跑在隐藏 iframe 里，也可能直接跑在酒馆页面：找那个真的有输入栏的 document
  function pickWin() {
    var cands = [];
    try { if (window.parent && window.parent !== window) cands.push(window.parent); } catch (e) { }
    cands.push(window);
    for (var i = 0; i < cands.length; i++) {
      try {
        var doc = cands[i].document;
        if (doc && (doc.getElementById('send_form') || doc.getElementById('send_textarea'))) return cands[i];
      } catch (e) { }
    }
    return cands[cands.length - 1];
  }
  var W = pickWin();
  var D = W.document;
  var JQ = W.jQuery || window.jQuery;

  if (D.getElementById('dnw-root')) { return; }

  var ST = [['朝雾', 3], ['樱坂', 3], ['白鹭', 2], ['筱见', 3], ['雨宫', 3], ['常磐', 2], ['东云', 3], ['汐见', 3], ['藤袴', 3], ['堇町', 2], ['月见丘', 3], ['千岁桥', 3]];

  var C = [
    ['喜多川海梦', '更衣人偶坠入爱河', 4, 15, '读者模特', '直球、行动力过剩', ['高中制服', '私服·假日便装', '黑江雫', '黑色罗贝莉亚', '贝罗妮卡', '兔女郎', '哈妮艾尔', '向日葵比基尼']],
    ['中野一花', '五等分的花嫁', 1, 17, '新人女演员', '笑着藏事、爱捉弄', ['旭高制服·冬服', '花火大会浴衣', '泳装', '黑框眼镜', '变装·三玖', '体育服']],
    ['中野二乃', '五等分的花嫁', 1, 17, '家里掌勺的人', '毒舌直球、脾气一点就着', ['旭高制服·冬服', '花火大会浴衣', '泳装', 'REVIVAL员工服', '体育服', '变装·四叶']],
    ['中野三玖', '五等分的花嫁', 2, 17, '面包店打工', '沉默、自我评价极低', ['旭高制服·冬服', '花火大会浴衣', '泳装', '变装·姐妹互换', '体育服']],
    ['中野四叶', '五等分的花嫁', 2, 17, '运动部外援', '拒绝不了任何人、元气', ['旭高制服·冬服', '花火大会浴衣', '泳装', '运动服', '动物图案睡衣']],
    ['中野五月', '五等分的花嫁', 2, 17, '补习班帮忙', '一本正经、死守敬语', ['旭高制服·冬服', '旭高制服·夏服', '泳装', '体育服', '读书眼镜']],
    ['加藤惠', '路人女主的养成方法', 3, 16, '社团程序', '存在感稀薄、语气平到极致', ['藏青水手款', '白衬衫款', '红开衫与白连衣裙', '水族馆约会装', '粉色和服', '深藏青比基尼', '温泉浴衣', '家居卫衣']],
    ['泽村英梨梨', '路人女主的养成方法', 3, 16, '同人绘师', '傲娇、嘴硬到底', ['白衬衫背心裙', '居家赶稿装', '冬季外出装', '红比基尼', '温泉浴衣', '墨绿运动上衣', '剧场版棒球夹克']],
    ['雪之下雪乃', '我的青春恋爱物语果然有问题', 5, 17, '侍奉社长', '完美主义、毒舌不留情面', ['总武制服·冬服', '总武制服·夏服', '制服＋围裙', '旅馆浴衣', '私服假日', '毕业舞会礼服']],
    ['由比滨结衣', '我的青春恋爱物语果然有问题', 5, 17, '侍奉社', '太会读空气、先迎合再后悔', ['总武制服·冬服', '总武制服·夏服', '制服＋围裙', '旅馆浴衣', '私服假日', '居家服']],
    ['一色彩羽', '我的青春恋爱物语果然有问题', 6, 16, '学生会长', '见人说人话、心里打算盘', ['总武制服·松垮', '总武制服·夏服', '足球社运动装', '会长臂章', '私服外出']],
    ['平冢静', '我的青春恋爱物语果然有问题', 6, 30, '语文教师兼生活指导', '少年漫式热血、说不过就动手', ['白大褂', '白大褂·夏装', '运动装', '私服校外']],
    ['三浦优美子', '我的青春恋爱物语果然有问题', 7, 17, '班内顶点', '女王气场、护短到不讲理', ['总武制服·冬服', '总武制服·夏服', '私服假日', '旅馆浴衣', '网球装']],
    ['川崎沙希', '我的青春恋爱物语果然有问题', 7, 17, '深夜打工的长女', '无口、语气冲', ['总武制服·不良风', '总武制服·夏服', '私服自制改造', '旅馆浴衣']],
    ['雪之下阳乃', '我的青春恋爱物语果然有问题', 8, 20, '国立大学理工系', '看穿别人、专挑痛处', ['私服风衣', '西装·对外场合', '私服大学日常', '礼服']],
    ['雪之下京子', '我的青春恋爱物语果然有问题', 8, 40, '雪之下家主母', '说一不二、不怒自威', ['和服·访问着', '裙套装', '外出着·冬']],
    ['霞之丘诗羽', '路人女主的养成方法', 9, 17, '轻小说作家', '毒舌全开的腹黑、挑逗主动', ['藏青水手款', '出版社商谈装', '酒红毛领开衫', '白色高领毛衣', '淡蓝家居', '黑无袖拉链', '温泉包毛巾', '剧场版米白开衫']],
    ['冰堂美智留', '路人女主的养成方法', 9, 16, '乐队主唱', '想到就做、说话不过脑子', ['椿姬制服', '军绿毛领羽绒', '居家练习装', '舞台演出装', '温泉泳装', '淡紫背心', '夏日便装', '夜间便装']]
  ];

  var APP = [
    ['从背后贴上去，借拥挤', '身后，胸口贴住她的背', '零', '后背、腰侧', '往前挪、缩肩、回头'],
    ['侧面切入，手从下往上', '侧后方', '半步', '大腿外侧、裙摆', '夹紧、侧身、挡手'],
    ['借刹车／启动的惯性压上去', '正后方，顺势前倾', '零', '整个人压上去', '撑住扶手、被压得说不出话'],
    ['借人群推挤把两人挤到一起', '任意角度，被动贴身', '零', '肩、胯、腿', '被挤得站不稳'],
    ['先站到她身边什么都不做，只等', '正侧方', '半臂', '无', '察觉、紧张、装作没察觉'],
    ['先让人挤得她动不了，再动手', '正面或侧面', '零', '手臂被压住', '只剩嘴和眼睛能动'],
    ['搭话取得位置（借路／借问路）', '正面', '一臂', '目光、言语', '回话、戒备、让开']
  ];

  var IDPOOL = [
    ['高中生（都立，二年级）', 15, 17, '水手服制服'], ['高中生（私立，一年级）', 15, 16, '西装式校服'], ['高中生（三年级）', 17, 18, '水手服制服'],
    ['大学生（二年级）', 19, 20, '针织衫配长裙'], ['公司职员（总务）', 23, 30, '衬衫配窄裙'], ['护士', 23, 32, '浅色护士服'],
    ['小学教师', 24, 33, '西装外套配长裤'], ['药妆店店员', 20, 26, '店内制服围裙'], ['咖啡店店员', 20, 27, '白衬衫配黑围裙'],
    ['专职主妇', 28, 35, '素色连衣裙罩开衫'], ['银行柜员', 23, 31, '制服套裙配丝巾'], ['出版社编辑', 24, 32, '宽松衬衫配牛仔']
  ];
  var SUR = ['佐藤', '铃木', '高桥', '田中', '渡边', '伊藤', '山本', '中村', '小林', '吉田', '山田', '佐佐木', '山口', '松本', '井上', '木村', '清水', '山崎', '森', '池田'];
  var GIV = ['美咲', '遥', '彩花', '优奈', '千夏', '结菜', '真央', '沙耶', '理惠', '明日香', '瞳', '菜月', '由纪', '香织', '千寻', '萌', '绫乃', '美月', '春香', '诗织'];
  var PER = ['安静', '话多', '爱笑', '易紧张', '嘴硬', '礼貌到生分', '懒散', '警觉', '温吞', '爱管闲事', '冷淡', '冒失'];
  var BODY = ['纤细', '匀称', '丰满', '高瘦'];
  var MARK = ['左眼角一颗泪痣', '深棕短发', '长卷发', '黑框眼镜', '耳骨一枚耳钉', '指甲涂成深红', '颈侧一颗小痣', '发尾挑染'];

  var CSS = [
    '#dnw-root{position:relative;box-sizing:border-box;width:100%;flex:0 0 auto;margin:0 0 4px;z-index:60;font-family:"Sarasa Gothic SC","Noto Sans SC",system-ui,sans-serif;font-size:12px;line-height:1.5;color:#e8e3dc}',
    '#dnw-root.float{position:fixed;right:14px;bottom:96px;width:252px;margin:0;z-index:9998}',
    '#dnw-root .p{background:linear-gradient(180deg,#1c1a18,#121110);border:1px solid #3a3330;border-radius:8px;box-shadow:0 -3px 14px rgba(0,0,0,.4);overflow:hidden;width:auto}',
    '#dnw-root .hd{display:flex;align-items:center;gap:6px;padding:5px 9px;background:#221f1d;border-bottom:1px solid #3a3330;user-select:none}',
    '#dnw-root .ti{flex:1;letter-spacing:.06em;color:#d8cec2}',
    '#dnw-root .tb{padding:2px 8px;border-radius:4px;cursor:pointer;color:#8b8178}',
    '#dnw-root .tb.on{background:#382f2a;color:#f0e6d8}',
    '#dnw-root .fl{cursor:pointer;color:#8b8178;padding:0 3px}',
    '#dnw-root .bd{padding:8px 9px 10px;max-height:30vh;overflow-y:auto}',
    '#dnw-root .bd.hide{display:none}',
    '#dnw-root .rw{display:flex;justify-content:space-between;gap:8px;margin-bottom:4px}',
    '#dnw-root .k{color:#8b8178;white-space:nowrap}',
    '#dnw-root .v{color:#efe7db;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px}',
    '#dnw-root .bar{height:5px;border-radius:3px;background:#2b2724;overflow:hidden;margin:2px 0 6px}',
    '#dnw-root .bar i{display:block;height:100%;width:0}',
    '#dnw-root .tu i{background:linear-gradient(90deg,#8d3b3b,#c85a4a)}',
    '#dnw-root .ex i{background:linear-gradient(90deg,#8d6f2f,#d9a83c)}',
    '#dnw-root .sp{height:1px;background:#332e2b;margin:7px 0}',
    '#dnw-root .bt{flex:1;padding:4px 0;text-align:center;background:#2b2724;border:1px solid #3f3833;border-radius:4px;color:#d8cec2;cursor:pointer}',
    '#dnw-root .bt:hover{background:#3a3330;color:#fff}',
    '#dnw-root .bt.w{color:#e0a08e;border-color:#5c3a33}',
    '#dnw-root .em{color:#6f675f;padding:6px 0;text-align:center}',
    '#dnw-root .lg{max-height:210px;overflow-y:auto}',
    '#dnw-root .li{display:flex;align-items:center;gap:6px;padding:3px 2px;border-bottom:1px dashed #2b2724}',
    '#dnw-root .nm{flex:1;color:#e2d8ca;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#dnw-root .nu{width:26px;text-align:right;color:#c85a4a}',
    '#dnw-root .mi{width:52px;height:4px;border-radius:2px;background:#2b2724;overflow:hidden}',
    '#dnw-root .mi i{display:block;height:100%;background:linear-gradient(90deg,#8d3b3b,#c85a4a)}',
    '#dnw-root .fg{font-size:10px;color:#d9a83c}',
    '#dnw-root .me{font-size:10px;color:#6f675f;white-space:nowrap}',
    '#dnw-sel{position:fixed;left:50%;bottom:180px;transform:translateX(-50%);z-index:9999;width:520px;max-width:94vw;display:none;font-family:"Sarasa Gothic SC","Noto Sans SC",system-ui,sans-serif;font-size:12px;color:#e8e3dc}',
    '#dnw-sel.open{display:block}',
    '#dnw-sel .box{background:linear-gradient(180deg,#1c1a18,#121110);border:1px solid #3a3330;border-radius:9px;box-shadow:0 14px 44px rgba(0,0,0,.7);overflow:hidden}',
    '#dnw-sel .hd{display:flex;align-items:center;gap:8px;padding:8px 11px;background:#221f1d;border-bottom:1px solid #3a3330}',
    '#dnw-sel .hd b{flex:1;font-weight:500;letter-spacing:.08em;color:#e2d7c8}',
    '#dnw-sel .pg{padding:3px 9px;border-radius:4px;cursor:pointer;color:#8b8178}',
    '#dnw-sel .pg.on{background:#382f2a;color:#f2e8da}',
    '#dnw-sel .x{cursor:pointer;color:#8b8178;padding:0 3px}',
    '#dnw-sel .bd{padding:10px 11px 12px;max-height:52vh;overflow-y:auto}',
    '#dnw-sel .cr{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:9px}',
    '#dnw-sel .cc{padding:3px 9px;border:1px solid #3f3833;border-radius:4px;cursor:pointer;color:#b7ab9d;background:#241f1d}',
    '#dnw-sel .cc.on{background:#4a2f28;border-color:#7a4a3c;color:#f0ddd2}',
    '#dnw-sel .grp{margin-bottom:8px}',
    '#dnw-sel .gh{color:#8b8178;font-size:11px;margin:2px 0 4px}',
    '#dnw-sel .list{display:grid;grid-template-columns:1fr 1fr;gap:5px}',
    '#dnw-sel .card{padding:6px 8px;border:1px solid #332e2b;border-radius:5px;background:#1f1b19;cursor:pointer}',
    '#dnw-sel .card:hover{border-color:#5c4a40;background:#262120}',
    '#dnw-sel .card.on{border-color:#8a5a44;background:#2c2320}',
    '#dnw-sel .card .nm{color:#ece2d4}',
    '#dnw-sel .card .sub{color:#877d73;font-size:11px}',
    '#dnw-sel .sepH{height:1px;background:#332e2b;margin:9px 0}',
    '#dnw-sel .lbl{color:#8b8178;margin:7px 0 3px}',
    '#dnw-sel .app{display:grid;grid-template-columns:1fr 1fr;gap:4px}',
    '#dnw-sel .ap{padding:4px 7px;border:1px solid #3f3833;border-radius:4px;background:#241f1d;cursor:pointer;color:#b7ab9d;font-size:11px;line-height:1.4}',
    '#dnw-sel .ap:hover{border-color:#5c4a40}',
    '#dnw-sel .ap.on{background:#3c2a24;border-color:#8a5a44;color:#f2e3d6}',
    '#dnw-sel .ft{display:flex;gap:6px;padding:8px 11px;background:#191614;border-top:1px solid #332e2b}',
    '#dnw-sel .btn{flex:1;text-align:center;padding:5px 0;border-radius:4px;cursor:pointer;background:#2b2724;border:1px solid #3f3833;color:#d8cec2}',
    '#dnw-sel .btn.go{background:#4a2f28;border-color:#8a5a44;color:#f3e4d7}',
    '#dnw-sel .btn:hover{filter:brightness(1.15)}',
    '#dnw-sel input,#dnw-sel select{width:100%;box-sizing:border-box;background:#1b1816;border:1px solid #3a3330;border-radius:4px;color:#ece2d4;padding:4px 6px;font-size:12px;font-family:inherit}',
    '#dnw-sel .f2{display:grid;grid-template-columns:1fr 1fr;gap:6px}',
    '#dnw-sel .tip{color:#7d736a;font-size:11px;margin-top:6px;line-height:1.6}',
    '#dnw-sel .pre{color:#c9bdae;background:#191614;border:1px solid #332e2b;border-radius:4px;padding:6px 8px;margin-top:7px;white-space:pre-wrap;font-size:11px;line-height:1.6}'
  ].join('\n');

  function style() {
    var s = D.getElementById('dnw-style');
    if (!s) { s = D.createElement('style'); s.id = 'dnw-style'; D.head.appendChild(s); }
    if (s.textContent !== CSS) s.textContent = CSS;
  }

  function esc(v) { return String(v == null ? '' : v).replace(/[<>&]/g, function (c) { return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]; }); }
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick1(a) { return a[rnd(a.length)]; }
  function h(tag, cls, txt) { var e = D.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function readData() {
    try { var d = Mvu.getMvuData({ type: 'message', message_id: 'latest' }); if (d && d.stat_data) return d.stat_data; } catch (e) { }
    try { var v = getVariables({ type: 'message', message_id: 'latest' }); if (v && v.stat_data) return v.stat_data; } catch (e) { }
    try { var w = getVariables({ type: 'message' }); if (w && w.stat_data) return w.stat_data; } catch (e) { }
    return null;
  }
  function writeData(mut) {
    var d = readData(); if (!d) return false;
    try { mut(d); } catch (e) { return false; }
    try { Mvu.replaceMvuData({ stat_data: d }, { type: 'message', message_id: 'latest' }); return true; } catch (e) { }
    try { replaceVariables({ stat_data: d }, { type: 'message', message_id: 'latest' }); return true; } catch (e) { }
    return false;
  }
  function send(text) {
    try { triggerSlash('/send ' + text); return true; } catch (e) { }
    var ta = D.getElementById('send_textarea');
    if (ta) {
      ta.value = text;
      ta.dispatchEvent(new (W.Event || Event)('input', { bubbles: true }));
      var b = D.getElementById('send_but'); if (b) { b.click(); return true; }
    }
    return false;
  }

  // ───────── 状态栏 / 账本 ─────────
  var tab = 'status', folded = false;
  var root = h('div'); root.id = 'dnw-root';
  var panel = h('div', 'p');
  var head = h('div', 'hd');
  head.appendChild(h('span', 'ti', '电车之狼'));
  var tStatus = h('span', 'tb on', '状态');
  var tLedger = h('span', 'tb', '账本');
  var tPick = h('span', 'tb', '选人');
  var fold = h('span', 'fl', '—');
  head.appendChild(tStatus); head.appendChild(tLedger); head.appendChild(tPick); head.appendChild(fold);
  var body = h('div', 'bd');
  panel.appendChild(head); panel.appendChild(body);
  root.appendChild(panel);

  tStatus.onclick = function () { tab = 'status'; tStatus.className = 'tb on'; tLedger.className = 'tb'; render(); };
  tLedger.onclick = function () { tab = 'ledger'; tStatus.className = 'tb'; tLedger.className = 'tb on'; render(); };
  tPick.onclick = function () { openSel(); };
  fold.onclick = function () { folded = !folded; body.className = folded ? 'bd hide' : 'bd'; fold.textContent = folded ? '+' : '—'; };

  function row(k, v) {
    var r = h('div', 'rw');
    r.appendChild(h('span', 'k', k));
    r.appendChild(h('span', 'v', v));
    return r;
  }
  function bar(cls, val) {
    var b = h('div', 'bar ' + cls);
    var i = h('i'); i.style.width = Math.max(0, Math.min(100, val)) + '%';
    b.appendChild(i);
    return b;
  }

  function render() {
    var d = readData();
    body.innerHTML = '';
    if (!d) { body.appendChild(h('div', 'em', '等待变量初始化…')); return; }
    if (tab === 'status') {
      var w = d['世界'] || {}, s = d['局势'] || {}, p = d['人物'] || {};
      var tgt = s['当前目标'] || '';
      var rec = (tgt && p[tgt]) || {};
      var tu = rec['沦陷值'] || 0, ex = s['异常度'] || 0;
      body.appendChild(row('车厢', (w['当前车号'] || 1) + ' 号车 · ' + (w['时段'] || '')));
      body.appendChild(row('下一站', w['下一站'] || ''));
      var sep = h('div', 'sp'); body.appendChild(sep);
      if (!tgt) {
        body.appendChild(h('div', 'em', '还没选定目标'));
      } else {
        var meta = C.filter(function (c) { return c[0] === tgt; })[0];
        body.appendChild(row('目标', tgt));
        body.appendChild(row('身份', meta ? meta[3] + ' 岁 · ' + meta[4] : '—'));
        body.appendChild(row('沦陷值', String(tu)));
        body.appendChild(bar('tu', tu));
        body.appendChild(row('异常度', String(ex)));
        body.appendChild(bar('ex', ex));
        body.appendChild(row('认知', rec['认知'] || '以为只是没人管'));
        body.appendChild(row('衣物', rec['衣物状态'] || '整齐'));
        body.appendChild(row('身体', rec['身体状态'] || '平稳'));
      }
      var sep2 = h('div', 'sp'); body.appendChild(sep2);
      var btns = h('div', 'rw');
      var b1 = h('span', 'bt', '换车厢/换人');
      var b2 = h('span', 'bt w', '收起压制');
      b1.onclick = function () { openSel(); };
      b2.onclick = function () {
        writeData(function (data) {
          data['局势'] = data['局势'] || {};
          data['局势']['压制'] = '收起';
          data['局势']['异常度'] = 0;
        });
        send('（我把存在感收了回来。这一瞬，整节车厢同时看见。）');
      };
      btns.appendChild(b1); btns.appendChild(b2);
      body.appendChild(btns);
    } else {
      var pp = d['人物'] || {};
      var names = C.map(function (c) { return c[0]; }).concat(Object.keys(pp).filter(function (n) {
        return !C.some(function (c) { return c[0] === n; });
      }));
      var lg = h('div', 'lg');
      names.forEach(function (n) {
        var r = pp[n] || {};
        var v = r['沦陷值'] || 0;
        var li = h('div', 'li');
        li.appendChild(h('span', 'nm', n));
        if (r['认知'] === '确认只有自己看得见') li.appendChild(h('span', 'fg', '知'));
        li.appendChild(h('span', 'me', '遇' + (r['遭遇'] || 0) + ((r['释放'] || 0) ? '·放' + r['释放'] : '')));
        var mi = h('div', 'mi'); var ii = h('i'); ii.style.width = v + '%'; mi.appendChild(ii);
        li.appendChild(mi);
        li.appendChild(h('span', 'nu', String(v)));
        lg.appendChild(li);
      });
      body.appendChild(lg);
    }
  }

  // ───────── 选择器 ─────────
  var page = 'fixed', car = 4, chosen = null, outfit = 0, app = -1, gen = null;
  var sel = h('div'); sel.id = 'dnw-sel';
  var sbox = h('div', 'box');
  var shd = h('div', 'hd');
  shd.appendChild((function () { var b = D.createElement('b'); b.textContent = '目标选择器'; return b; })());
  var pFixed = h('span', 'pg on', '固定人物');
  var pRand = h('span', 'pg', '随机人物');
  var closeX = h('span', 'x', '✕');
  shd.appendChild(pFixed); shd.appendChild(pRand); shd.appendChild(closeX);
  var sbd = h('div', 'bd');
  var sft = h('div', 'ft');
  var cancel = h('span', 'btn', '取消');
  var go = h('span', 'btn go', '确认上车');
  sft.appendChild(cancel); sft.appendChild(go);
  sbox.appendChild(shd); sbox.appendChild(sbd); sbox.appendChild(sft);
  sel.appendChild(sbox);

  pFixed.onclick = function () { page = 'fixed'; pFixed.className = 'pg on'; pRand.className = 'pg'; renderSel(); };
  pRand.onclick = function () { page = 'rand'; pFixed.className = 'pg'; pRand.className = 'pg on'; renderSel(); };
  closeX.onclick = closeSel;
  cancel.onclick = closeSel;
  go.onclick = confirmSel;

  function openSel() { placeSel(); sel.className = 'open'; renderSel(); }
  function closeSel() { sel.className = ''; }
  W.__dnwOpenSel = openSel;

  function renderSel() {
    sbd.innerHTML = '';
    if (page === 'fixed') renderFixed(); else renderRand();
  }

  function renderFixed() {
    sbd.appendChild(h('div', 'lbl', '第一步 · 上哪节车厢'));
    var cr = h('div', 'cr');
    for (var i = 1; i <= 9; i++) {
      (function (n) {
        var cc = h('span', 'cc' + (car === n ? ' on' : ''), n + ' 号车');
        cc.onclick = function () { car = n; chosen = null; app = -1; outfit = 0; renderSel(); };
        cr.appendChild(cc);
      })(i);
    }
    sbd.appendChild(cr);
    sbd.appendChild(h('div', 'lbl', '第二步 · 对谁下手'));

    var works = [], seen = {};
    C.forEach(function (c) { if (c[2] === car) { if (!seen[c[1]]) { seen[c[1]] = 1; works.push(c[1]); } } });
    if (!works.length) sbd.appendChild(h('div', 'tip', '这节车厢现在没人。'));
    works.forEach(function (w) {
      var grp = h('div', 'grp');
      grp.appendChild(h('div', 'gh', w));
      var list = h('div', 'list');
      C.filter(function (c) { return c[2] === car && c[1] === w; }).forEach(function (c) {
        var card = h('div', 'card' + (chosen && chosen[0] === c[0] ? ' on' : ''));
        card.appendChild(h('div', 'nm', c[0]));
        card.appendChild(h('div', 'sub', c[3] + ' · ' + c[4]));
        card.onclick = function () { chosen = c; outfit = 0; renderSel(); };
        list.appendChild(card);
      });
      grp.appendChild(list);
      sbd.appendChild(grp);
    });

    if (chosen) {
      sbd.appendChild(h('div', 'sepH'));
      sbd.appendChild(h('div', 'lbl', '她的性格'));
      sbd.appendChild(h('div', 'pre', chosen[5]));
      sbd.appendChild(h('div', 'lbl', '第三步 · 她穿什么'));
      var sl = D.createElement('select');
      sl.id = 'dnw-out';
      chosen[6].forEach(function (o, idx) {
        var op = D.createElement('option');
        op.value = idx; op.textContent = o;
        if (idx === outfit) op.selected = true;
        sl.appendChild(op);
      });
      sl.onchange = function () { outfit = +sl.value; };
      sbd.appendChild(sl);
      sbd.appendChild(h('div', 'lbl', '第四步 · 怎么靠近'));
      appendAppList();
    }
  }

  function appendAppList() {
    var wrap = h('div', 'app');
    APP.forEach(function (a, idx) {
      var el = h('div', 'ap' + (app === idx ? ' on' : ''), a[0]);
      el.onclick = function () {
        if (page === 'rand') readGen();
        app = idx; renderSel();
      };
      wrap.appendChild(el);
    });
    sbd.appendChild(wrap);
    if (app >= 0) {
      sbd.appendChild(h('div', 'pre', '位置：' + APP[app][1] + '｜距离：' + APP[app][2] + '\n先接触：' + APP[app][3] + '\n她还能做：' + APP[app][4]));
    }
  }

  function renderRand() {
    sbd.appendChild(h('div', 'tip', '生成一个这条线上的女人，生成后每一项都能改。'));
    var gb = h('span', 'btn', gen ? '再抽一个' : '生成一个');
    gb.style.cssText = 'display:inline-block;padding:5px 14px;margin:7px 0';
    gb.onclick = function () { gen = makeRand(); app = -1; renderSel(); };
    sbd.appendChild(gb);
    if (!gen) return;
    sbd.appendChild(h('div', 'sepH'));
    var f2 = h('div', 'f2');
    [['姓名', 'name', 'g-name'], ['年龄', 'age', 'g-age'], ['身份', 'ident', 'g-id'], ['身高', 'h', 'g-h'], ['性格', 'per', 'g-per'], ['服装', 'out', 'g-out']].forEach(function (it) {
      var cell = h('div');
      cell.appendChild(h('div', 'lbl', it[0]));
      var inp = D.createElement('input');
      inp.id = it[2]; inp.value = gen[it[1]];
      inp.onchange = readGen;
      cell.appendChild(inp);
      f2.appendChild(cell);
    });
    sbd.appendChild(f2);
    sbd.appendChild(h('div', 'lbl', '身材与标志'));
    var ib = D.createElement('input'); ib.id = 'g-body'; ib.value = gen.body; ib.onchange = readGen;
    sbd.appendChild(ib);
    sbd.appendChild(h('div', 'lbl', '上下车'));
    sbd.appendChild(h('div', 'pre', gen.from + ' → ' + gen.to + '（' + gen.mins + ' 分钟）'));
    sbd.appendChild(h('div', 'lbl', '怎么靠近'));
    appendAppList();
  }

  function readGen() {
    if (!gen) return;
    [['g-name', 'name'], ['g-age', 'age'], ['g-id', 'ident'], ['g-h', 'h'], ['g-per', 'per'], ['g-out', 'out'], ['g-body', 'body']].forEach(function (p) {
      var el = sbd.querySelector('#' + p[0]);
      if (el) gen[p[1]] = el.value;
    });
  }

  function makeRand() {
    var ip = pick1(IDPOOL);
    var age = ip[1] + rnd(ip[2] - ip[1] + 1);
    var s = rnd(12), len = 2 + rnd(4), e = (s + len) % 12, m = 0, k = s;
    for (var i = 0; i < len; i++) { m += ST[k][1]; k = (k + 1) % 12; }
    return {
      name: pick1(SUR) + ' ' + pick1(GIV), age: age, ident: ip[0], out: ip[3],
      per: pick1(PER) + '、' + pick1(PER), h: (150 + rnd(23)) + 'cm',
      body: pick1(BODY) + '，' + pick1(MARK), from: ST[s][0], to: ST[e][0], mins: m
    };
  }

  function confirmSel() {
    if (!readData()) { alert('变量还没初始化，发一条消息后再选。'); return; }
    if (app < 0) { alert('先选怎么靠近。'); return; }
    var a = APP[app];
    if (page === 'fixed') {
      if (!chosen) { alert('先选一个人。'); return; }
      var nm = chosen[0], o = chosen[6][outfit];
      var payload = '【上车】\n车厢：' + car + ' 号车\n目标：' + nm + '（' + chosen[3] + ' 岁 · ' + chosen[4] + '）\n服装：' + o +
        '\n接近方式：' + a[0] + '\n位置：' + a[1] + '｜距离：' + a[2] + '\n先接触：' + a[3] + '\n她还能做：' + a[4] +
        '\n（按世界书规则展开这一场。本回合只写接近与第一次接触，不替<user>做决定。）';
      writeData(function (data) {
        data['世界'] = data['世界'] || {};
        data['世界']['当前车号'] = car;
        data['世界']['在场'] = C.filter(function (c) { return c[2] === car; }).map(function (c) { return c[0]; });
        data['局势'] = data['局势'] || {};
        data['局势']['当前目标'] = nm; data['局势']['压制'] = '展开'; data['局势']['异常度'] = 0;
        data['人物'] = data['人物'] || {};
        var r = data['人物'][nm] || { 沦陷值: 0, 认知: '以为只是没人管', 遭遇: 0, 释放: 0, 衣物状态: '整齐', 身体状态: '平稳' };
        r['遭遇'] = (r['遭遇'] || 0) + 1; r['衣物状态'] = o;
        data['人物'][nm] = r;
      });
      closeSel(); send(payload); render();
    } else {
      if (!gen) { alert('先点生成。'); return; }
      readGen();
      var p2 = '【上车】\n车厢：' + car + ' 号车\n目标：' + gen.name + '（' + gen.age + ' 岁 · ' + gen.ident + '）\n身材：' + gen.h + '，' + gen.body +
        '\n性格：' + gen.per + '\n服装：' + gen.out + '\n上下车：' + gen.from + ' → ' + gen.to + '（' + gen.mins + ' 分钟）' +
        '\n接近方式：' + a[0] + '\n位置：' + a[1] + '｜距离：' + a[2] + '\n先接触：' + a[3] + '\n她还能做：' + a[4] +
        '\n（这是这节车厢里新出现的人。按世界书规则展开这一场，本回合只写接近与第一次接触。）';
      writeData(function (data) {
        data['世界'] = data['世界'] || {};
        data['世界']['当前车号'] = car;
        var here = (data['世界']['在场'] || []).slice();
        if (here.indexOf(gen.name) < 0) here.push(gen.name);
        data['世界']['在场'] = here;
        data['局势'] = data['局势'] || {};
        data['局势']['当前目标'] = gen.name; data['局势']['压制'] = '展开'; data['局势']['异常度'] = 0;
        data['人物'] = data['人物'] || {};
        data['人物'][gen.name] = { 沦陷值: 0, 认知: '以为只是没人管', 遭遇: 1, 释放: 0, 衣物状态: gen.out, 身体状态: '平稳' };
      });
      closeSel(); send(p2); render();
    }
  }

  // ───────── 挂载：固定在输入栏正上方 ─────────
  // 做法：把常驻条插在 #form_sheld（输入栏容器）前面，成为布局流里的一行，
  // 宽度跟随输入栏、位置永远贴着输入栏上沿，不悬在聊天区上、也不挂消息楼层。
  // 退回顺序：#form_sheld → #send_form → 都没有才降级成右下角浮层（.float）。
  function dockTarget() {
    var fs = D.getElementById('form_sheld');
    var sf = D.getElementById('send_form');
    var anchor = fs || sf;
    if (!anchor || !anchor.parentNode || anchor.parentNode.nodeType !== 1) return null;
    var host = anchor.parentNode;
    // 兜底：父容器若是「横向 flex」，插进去会被挤成并排而不是放在上面，
    // 这时往上一层，把这个容器整体作为插入点。
    try {
      var cs = W.getComputedStyle ? W.getComputedStyle(host) : null;
      if (cs && String(cs.display).indexOf('flex') >= 0 && String(cs.flexDirection).indexOf('row') === 0) {
        var up = host.parentNode;
        if (up && up.nodeType === 1 && up.id !== 'body') return { host: up, before: host };
      }
    } catch (e) { }
    return { host: host, before: anchor };
  }

  // 选择器紧贴常驻条上沿展开（不再居中悬浮），高度不够时往上顶
  function placeSel() {
    try {
      var r = root.getBoundingClientRect();
      var vh = W.innerHeight || (D.documentElement && D.documentElement.clientHeight) || 800;
      var b = Math.round(vh - r.top + 6);
      if (!(b > 0) || b > vh - 40) b = 150;
      sel.style.bottom = b + 'px';
    } catch (e) { }
  }

  function mount() {
    style();
    var t = dockTarget();
    if (t) {
      root.className = '';
      if (root.parentNode !== t.host || root.nextSibling !== t.before) {
        try { t.host.insertBefore(root, t.before); } catch (e) { }
      }
    } else if (!D.body.contains(root)) {
      root.className = 'float';
      D.body.appendChild(root);
    }
    if (!D.body.contains(sel)) D.body.appendChild(sel);
    placeSel();
    render();
  }

  if (JQ) { JQ(function () { mount(); }); } else { mount(); }
  try { W.addEventListener('resize', function () { placeSel(); }); } catch (e) { }

  try { eventOn(tavern_events.MESSAGE_RECEIVED, function () { setTimeout(render, 120); }); } catch (e) { }
  try { eventOn(tavern_events.MESSAGE_UPDATED, function () { setTimeout(render, 120); }); } catch (e) { }
  try { eventOn(tavern_events.CHAT_CHANGED, function () { setTimeout(mount, 200); }); } catch (e) { }
  // 输入栏被重建 / 切页面导致脱离时自动重新贴回
  setInterval(function () { if (!D.body.contains(root)) mount(); else render(); }, 1500);

  // 首次进入且还没选过目标时，自动弹一次选择器
  setTimeout(function () {
    var d = readData();
    if (d && !(d['局势'] || {})['当前目标'] && !W.__dnwIntroShown) {
      W.__dnwIntroShown = true;
      openSel();
    }
  }, 900);
})();
