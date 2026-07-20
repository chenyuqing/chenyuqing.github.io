(() => {
  'use strict';

  const EN = {
    '钢铁防线 · 经典坦克大战': 'Iron Defense · Classic Tank Battle',
    '钢铁防线 · 3D坦克大战': 'Iron Defense · 3D Tank Battle',
    '五子连珠 · 3D 人机对弈': 'Five in a Row · 3D Gomoku',
    '楚汉争锋 · 3D 中国象棋': 'Chu-Han Clash · 3D Chinese Chess',
    '楚汉争锋 · 3D中国象棋': 'Chu-Han Clash · 3D Chinese Chess',
    '方块坠落 · 3D 俄罗斯方块': 'Blockfall · 3D Tetris',
    '蘑菇奇兵 · 3D 跑酷冒险': 'Mushroom Raiders · 3D Platform Adventure',
    '飞鸟穿云 · 3D Flappy Bird': 'Skybound Bird · 3D Flappy Bird',
    '返回游戏专区': 'Back to Games', '返回游戏库': 'Back to Games', '← 返回游戏专区': '← Back to Games',
    '退出': 'Exit', '退 出': 'Exit', '← 退出': '← Exit', '游戏结束': 'Game Over', '再 来 一 局': 'Play Again',
    '重新开始': 'Restart', '重新开局': 'New Game', '重开': 'Restart', '视角复位': 'Reset Camera',
    '收起/展开面板': 'Toggle panel', '音效开关': 'Toggle sound', 'BGM 开关': 'Toggle music',
    '音效：开': 'Sound: On', '音效：关': 'Sound: Off', '背景音乐：开': 'Music: On', '背景音乐：关': 'Music: Off',
    '暂停': 'Pause', '继续': 'Resume', '开 局': 'Start', '开 战': 'Start Battle', '开 始 冒 险': 'Start Adventure',

    '钢铁防线': 'Iron Defense', '3D 坦克大战': '3D TANK BATTLE', '单人': 'Solo', '双人': 'Two Players',
    '选择模式': 'Select Mode', '选择关卡': 'Select Stage', '战况': 'STATUS', '关卡 STAGE': 'STAGE',
    '剩余敌军': 'Enemies Left', '基地': 'Base', '完好': 'Secure', '被毁': 'Destroyed', '开战！': 'Battle Start!',
    '玩家一：WASD 移动，J 开火。': 'Player 1: WASD to move, J to fire.',
    '玩家二：方向键移动，/ 开火。': 'Player 2: Arrow keys to move, / to fire.',
    '可直接选择任意关卡开始。拖动旋转视角，滚轮拉近拉远，守住基地！': 'Choose any stage. Drag to rotate, scroll to zoom, and defend the base!',
    '移动端：屏幕左下方向盘，右下开火键。': 'Mobile: move at bottom left and fire at bottom right.',
    '开火': 'FIRE', '防线守住 · 全关通关': 'Defense Held · Campaign Clear', '基地失守': 'Base Lost',
    '进 入 下 一 关': 'Next Stage',

    '五子连珠': 'Five in a Row', '3D 人机对弈': '3D GOMOKU', '对局控制': 'GAME CONTROL',
    '本地对弈': 'Local Match', '人机对战': 'Play vs AI', '电脑·简单': 'AI · Easy', '电脑·普通': 'AI · Normal',
    '电脑·困难': 'AI · Hard', '简单': 'Easy', '普通': 'Normal', '困难': 'Hard', '智能提示': 'Smart Hint',
    '悔棋': 'Undo', '禁手：关': 'Forbidden Moves: Off', '禁手：开': 'Forbidden Moves: On',
    '黑方落子': 'Black to Move', '白方落子': 'White to Move', '黑方先行，点击棋盘交叉点落子。五子连珠即胜。': 'Black moves first. Place stones on intersections; connect five to win.',
    '第一步：选择对手': 'Step 1: Choose Opponent', '第二步：黑方禁手规则': 'Step 2: Black Forbidden Moves',
    '不启用': 'Off', '启用（标准 Renju）': 'On (Standard Renju)',
    '玩法：点击棋盘交叉点落子，黑方先行，先连成横、竖、斜五子者胜。': 'Place stones on intersections. Black moves first; connect five horizontally, vertically, or diagonally to win.',
    '拖动可旋转棋盘视角，滚轮缩放。启用禁手后，黑方若形成三三 / 四四 / 长连判负。': 'Drag to rotate and scroll to zoom. With Renju rules, double-three, double-four, and overlines are forbidden for Black.',
    'AI 思考中…': 'AI is thinking…', '无棋可悔': 'No moves to undo', '对局已经结束': 'The game is over',
    '请等待 AI 落子': 'Please wait for the AI', '当前没有可提示的位置': 'No hint is available',
    '可直接连成五子': 'Wins immediately', '必须阻挡对方成五': 'Blocks an immediate loss',
    '优先压制对方攻势': 'Counters the opponent’s threat', '兼顾进攻与防守': 'Balances attack and defense',
    '黑方胜': 'Black Wins', '白方胜': 'White Wins',

    '楚汉争锋': 'Chu-Han Clash', '3D 中国象棋 · 儿童战场版': '3D CHINESE CHESS',
    '红方走棋': 'Red to Move', '黑方走棋': 'Black to Move', '红方胜利': 'Red Wins', '黑方胜利': 'Black Wins',
    '提示走法': 'Suggest Move', '棋子模式': 'PIECE STYLE', '圆棋': 'Classic', '形象': 'Figures',
    '被吃棋子': 'CAPTURED', '红方损失：': 'Red lost: ', '黑方损失：': 'Black lost: ', '无': 'None',
    '点击己方棋子，绿色光圈是可走位置，红色光圈可吃子。': 'Select your piece. Green marks legal moves; red marks captures.',
    '双人对战': 'Two Players', '第二步：选择棋子样子': 'Step 2: Choose Piece Style',
    '传统圆棋': 'Classic Pieces', '立体形象（将军/战马/火炮…）': '3D Figures (general, horse, cannon…)',
    '玩法：点击棋子 → 绿色光圈是可以走的位置，红色光圈可以吃掉对方棋子。': 'Select a piece. Green marks legal moves and red marks captures.',
    '拖动画面可以旋转战场视角，滚轮可以拉近拉远。对局中随时可以切换棋子样子哦！': 'Drag to rotate and scroll to zoom. You can switch piece styles during the match.',

    '方块坠落': 'Blockfall', '3D 俄罗斯方块': '3D TETRIS', '分数': 'Score', '等级': 'Level', '行数': 'Lines',
    '下一块': 'NEXT', '暂存（HOLD）': 'HOLD', '最高分': 'Best', '本局分数': 'Score', '已消行': 'Lines',
    '单/双/三/四消': 'Singles/Doubles/Triples/Tetris', '控制': 'CONTROLS', '选择难度': 'Select Difficulty',
    '悠闲': 'Relaxed', '急速': 'Fast', '旋转': 'Rotate', '左移': 'Move Left', '右移': 'Move Right',
    '软降': 'Soft Drop', '硬降': 'Hard Drop',
    '键盘：← → 移动，↑ / X 顺时针旋转，Z 逆时针，↓ 软降，空格 硬降，C 暂存，P 暂停，R 重开': 'Keyboard: ← → move, ↑ / X rotate clockwise, Z counterclockwise, ↓ soft drop, Space hard drop, C hold, P pause, R restart',
    '移动端：下方按钮或左右滑屏移动，上滑旋转，下滑软降，长按硬降。': 'Mobile: use the buttons or swipe left/right to move, up to rotate, down to soft drop, and hold for hard drop.',

    '蘑菇奇兵': 'Mushroom Raiders', '3D 跑酷冒险': '3D PLATFORM ADVENTURE', '金币': 'Coins', '生命': 'Lives',
    '关卡': 'Stage', '剩余生命': 'Lives Left', '距离': 'Distance', '胜利': 'Victory', '控制方式': 'Controls',
    '移动': 'Move', '跳跃': 'Jump', '攻击冲刺': 'Dash Attack', '冲刺': 'Dash',
    '收集金币、踩扁蘑菇怪、抵达旗杆即可通关。': 'Collect coins, stomp mushroom guards, and reach the flag.',
    '拖动画面旋转视角，滚轮拉近拉远。': 'Drag to rotate the camera and scroll to zoom.',
    '移动端：屏幕左下方向键，右下跳跃键。': 'Mobile: move at bottom left and jump at bottom right.',
    '全线通关 · 冒险结束': 'Campaign Clear · Adventure Complete',

    '飞鸟穿云': 'Skybound Bird', '飞鸟穿云游戏': 'Skybound Bird game', '点击或按空格键让小鸟飞起': 'Tap or press Space to flap',
    '最高': 'Best', '暂停游戏': 'Pause game', '准备起飞': 'Ready', '穿过云层': 'Fly Through the Clouds',
    '点击画面、触碰屏幕或按空格键，让小鸟振翅。': 'Click, tap, or press Space to flap.', '开始飞行': 'Start Flying',
    '点击画面或按空格键飞行': 'Click or press Space to fly', '穿过竹管，别碰到边缘。': 'Fly through the bamboo pipes without touching them.',
    '重新起飞': 'Fly Again', '飞行结束': 'Flight Over', '暂停中': 'Paused', '云层静止': 'The clouds are still',
    '准备好后继续这一次飞行。': 'Resume when you are ready.', '继续飞行': 'Resume Flight',

    '云端翔行 · 飞行棋': 'Sky Voyage · Aeroplane Chess', '云端翔行': 'Sky Voyage', '飞行棋': 'Aeroplane Chess', '3D 飞行棋': '3D AEROPLANE CHESS', '四方飞行棋': 'Four-Player Aeroplane Chess',
    '红方回合': 'Red Turn', '黄方回合': 'Yellow Turn',
    '蓝方回合': 'Blue Turn', '绿方回合': 'Green Turn', '红方': 'Red', '黄方': 'Yellow', '蓝方': 'Blue', '绿方': 'Green',
    '战况': 'STATUS', '当前回合': 'Current Turn', '骰子点数': 'Dice', '红方到家': 'Red Home', '黄方到家': 'Yellow Home',
    '蓝方到家': 'Blue Home', '绿方到家': 'Green Home', '掷骰': 'Roll', '重开': 'Restart', '音效：开': 'Sound: On',
    '音效：关': 'Sound: Off', '视角复位': 'Reset Camera', '收起/展开面板': 'Toggle panel',
    '胜利！': 'Victory!', '获胜': 'Wins', '四架飞机全部抵达终点': 'All four planes have reached the finish',
    '再 来 一 局': 'Play Again', '起 飞': 'Take Off',
    '你执 红 方，其余三方由电脑控制。': 'You play Red; the other three sides are computer-controlled.',
    '掷出 6 才能起飞，并可再掷一次。': 'Roll a 6 to take off, then roll again.',
    '走到对方飞机所在格，将其击落回基地。': 'Landing on an opponent sends their plane back to base.',
    '四架飞机全部抵达中央终点者获胜。': 'Get all four planes to the center to win.',
    '拖动旋转视角，滚轮拉近拉远。': 'Drag to rotate and scroll to zoom.',
    '你的回合': 'Your turn', '掷出6，再掷一次！': 'Rolled a 6 — roll again!',
    '点击高亮飞机移动': 'Tap a highlighted plane to move',
    '云台战况': 'SKY DECK', '骰子': 'Dice', '胜利': 'Victory', '云端胜利': 'Victory in the Clouds', '棋局已定': 'Match Complete',
    '朱雀': 'Vermilion Bird', '金乌': 'Golden Crow', '青龙': 'Azure Dragon', '玄武': 'Black Tortoise',
    '红方先行，掷骰起飞': 'Red moves first. Roll to take off.',
    '四架朱雀已抵达云台中央。': 'All four Vermilion Bird planes reached the Sky Deck.',
    '你执红方，与三位棋手竞速云端。': 'You command Red in a race across the clouds.',
    '掷出 6 可起飞并再掷一次；落在对手飞机上可将其击落。': 'Roll a 6 to launch and roll again; land on a rival to send it home.',
    '进入己方航道后，必须刚好抵达云台中央。': 'In your home lane, you must reach the Sky Deck exactly.',
    '起飞': 'Take Off', '再来一局': 'Play Again',
    '掷 骰': 'ROLL', '飞行规则': 'Flight Rules', '关闭': 'Close', '规则': 'Rules',
    '同色跳跃！': 'Color jump!', '虚线飞越！': 'Sky shortcut!', '终点反弹！': 'Bounce back!',
    '连续三个 6，本架飞机回基地！': 'Three 6s in a row — this plane returns home!',
    '点击飞机选择移动 · 空格也可掷骰': 'Tap a plane to move · Space to roll',
    '四方飞行棋 · 竞速云端': 'Four-Player Aeroplane Chess',
    '掷出 5 或 6：起飞；掷出 6 可再掷一次': 'Roll 5 or 6 to take off; roll 6 again for a bonus turn',
    '同色跳跃：落在己方颜色格，跳到下一个同色格': 'Color jump: land on your color to leap ahead',
    '虚线飞越：落在虚线格，直飞棋盘对面': 'Sky shortcut: land on the dashed cell to fly across',
    '击落：落在敌机格，敌机回基地': 'Capture: land on a rival to send it home',
    '终点：进入航道后需刚好到达，超出会反弹': 'Finish: land exactly — overshoot bounces back',
    '惩罚：连续三次 6，本架飞机回基地': 'Penalty: three 6s in a row sends this plane home',
    '保底：全机在基地连续 3 次未起飞，强制起飞': 'Pity: force a takeoff after 3 failed launch rolls',
    '保底起飞！': 'Pity takeoff!',
    '红方先行，掷 5 或 6 起飞': 'Red first — roll 5 or 6 to take off',
    '你的回合 · 5 或 6 起飞': 'Your turn · 5 or 6 to take off',
    '你': 'YOU', '你执红方 · 朱雀，从画面下方基地起飞': 'You fly Red · Vermilion Bird — your base is at the bottom'
  };

  const SIDE_NAMES = { '红方':'Red', '黄方':'Yellow', '蓝方':'Blue', '绿方':'Green' };

  const translateDynamic = text => {
    let match = text.match(/^(红方|黄方|蓝方|绿方)掷出 (\d+)$/);
    if (match) return `${SIDE_NAMES[match[1]]} rolled ${match[2]}`;
    match = text.match(/^(红方|黄方|蓝方|绿方)掷出六点，再掷一次$/);
    if (match) return `${SIDE_NAMES[match[1]]} rolled 6. Roll again.`;
    match = text.match(/^(红方|黄方|蓝方|绿方)击落(红方|黄方|蓝方|绿方)！$/);
    if (match) return `${SIDE_NAMES[match[1]]} shot down ${SIDE_NAMES[match[2]]}!`;
    match = text.match(/^(红方|黄方|蓝方|绿方)的四架飞机率先抵达云台中央。$/);
    if (match) return `${SIDE_NAMES[match[1]]} reached the Sky Deck with all four planes.`;
    return '';
  };

  const PATTERNS = [
    [/^第 (\d+) 关$/, 'Stage $1'], [/^第 (\d+) 关 · 开战$/, 'Stage $1 · Battle Start'],
    [/^第 (\d+) 关 守住$/, 'Stage $1 Held'], [/^下一关：第 (\d+) 关$/, 'Next: Stage $1'],
    [/^第 (\d+) 手 · (.+) · 轮到黑方$/, 'Move $1 · $2 · Black to move'],
    [/^第 (\d+) 手 · (.+) · 轮到白方$/, 'Move $1 · $2 · White to move'],
    [/^第 (\d+) 手 · AI：(.+) · 轮到黑方$/, 'Move $1 · AI: $2 · Black to move'],
    [/^智能提示：(.+) · (.+)$/, 'Smart Hint: $1 · $2'], [/^已悔 (\d+) 手 · 轮到黑方$/, 'Undid $1 move(s) · Black to move'],
    [/^已悔 (\d+) 手 · 轮到白方$/, 'Undid $1 move(s) · White to move'], [/^总得分 (\d+)$/, 'Total Score $1'],
    [/^金币 (\d+)　·　生命 (\d+)$/, 'Coins $1 · Lives $2'], [/^本次得分 (\d+)$/, 'Score $1'],
    [/^新局开始 · 黑方先行$/, 'New game · Black moves first'], [/^禁手：(.+)$/, 'Forbidden move: $1'],
    [/^掷出 (\d+)，选择一架飞机$/, 'Rolled $1. Choose a plane.'], [/^掷出 (\d+)，没有可动飞机$/, 'Rolled $1. No plane can move.'],
    [/^掷出 6，无可动飞机，再掷一次$/, 'Rolled 6. No plane can move. Roll again.']
  ];

  const translate = value => {
    const text = value.trim();
    if (!text) return value;
    let result = EN[text];
    if (!result) {
      const prefixed = text.match(/^([^\p{L}\p{N}]+)\s*(.+)$/u);
      if (prefixed && EN[prefixed[2]]) result = prefixed[1] + ' ' + EN[prefixed[2]];
    }
    if (!result) result = translateDynamic(text);
    if (!result) {
      for (const [pattern, replacement] of PATTERNS) {
        if (pattern.test(text)) { result = text.replace(pattern, replacement); break; }
      }
    }
    if (!result) return value;
    const start = value.match(/^\s*/)?.[0] || '';
    const end = value.match(/\s*$/)?.[0] || '';
    return start + result + end;
  };

  const applyNode = node => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement?.closest('script,style')) {
        const next = translate(node.nodeValue || '');
        if (next !== node.nodeValue) node.nodeValue = next;
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches('script,style')) return;
    for (const attr of ['title', 'aria-label', 'placeholder']) {
      if (node.hasAttribute(attr)) {
        const current = node.getAttribute(attr) || '';
        const next = translate(current);
        if (next !== current) node.setAttribute(attr, next);
      }
    }
    for (const child of node.childNodes) applyNode(child);
  };

  let applying = false;
  const applyEnglish = root => {
    if (applying) return;
    applying = true;
    applyNode(root);
    const nextTitle = translate(document.title);
    if (nextTitle !== document.title) document.title = nextTitle;
    applying = false;
  };

  const lang = localStorage.getItem('site-lang') === 'en' ? 'en' : 'zh';
  document.documentElement.dataset.lang = lang;
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';

  const style = document.createElement('style');
  style.textContent = '#game-lang-toggle{position:fixed;z-index:150;top:max(70px,env(safe-area-inset-top));left:14px;min-width:42px;height:34px;padding:0 9px;border:1px solid rgba(240,199,94,.75);border-radius:5px;background:rgba(20,16,12,.88);color:#f0c75e;font:800 12px/1 system-ui,sans-serif;letter-spacing:.06em;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35)}#game-lang-toggle:hover{background:#d4a017;color:#1a1208}@media(max-width:820px){#game-lang-toggle{top:max(56px,env(safe-area-inset-top));left:8px;height:30px}}';
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.id = 'game-lang-toggle';
  button.type = 'button';
  button.textContent = lang === 'en' ? '中' : 'EN';
  button.setAttribute('aria-label', lang === 'en' ? '切换到中文' : 'Switch to English');
  button.addEventListener('click', () => {
    localStorage.setItem('site-lang', lang === 'en' ? 'zh' : 'en');
    location.reload();
  });
  document.body.appendChild(button);

  if (lang === 'en') {
    applyEnglish(document.body);
    new MutationObserver(records => {
      if (applying) return;
      for (const record of records) {
        if (record.type === 'characterData') applyEnglish(record.target);
        for (const node of record.addedNodes) applyEnglish(node);
      }
    }).observe(document.body, { childList:true, characterData:true, subtree:true });
  }
})();
