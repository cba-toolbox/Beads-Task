/**
 * task.js
 * jsPsych 7.0 ライブラリのフレームワークを用いて作成した beads task 課題を行うスクリプトです。
 */

/////////////////////////////////////////////////
// 課題の設定

/**
 * ユーザー定義の設定をします。
 * 教示および刺激に用いる画像ファイルが入ったフォルダーのパスと、
 * フォルダ内の画像の名前を設定します。
 * すべての刺激画像は同一のフォルダーに入っている必要があります。
 */
const getUserDefinedSettings = () => ({
  /**
   * 2 種類の内、多い方のビーズの割合 (%) です。
   */
  highProbability: 85,

  /**
   * ビーズの画像を設定します。
   */
  beadsStimuli: [
    { beadsColor: 'red', beadsImage: 'beads-red.png'},
    { beadsColor: 'blue', beadsImage: 'beads-blue.png'}
  ],

  /**
   * 画像ファイルを指定します。
   * 瓶の名前、
   * 割合が多いほうの色 (highProbabilityColor)、
   * その割合 (probability)、
   * を合わせて設定します。
   */
  jarStimuli: [
    { jar: 'A', highProbabilityColor: 'red', lowProbabilityColor: 'blue', jarImage: 'red85-blue15ver.png' },
    { jar: 'B', highProbabilityColor: 'blue', lowProbabilityColor: 'red', jarImage: 'red15-blue85ver.png' }
  ],

  /**
   * 課題で使用する画像が格納されているフォルダーのパスです。
   */
  sourceFolderPath: 'beads-task/source',
});

/////////////////////////////////////////////////
// 課題の構成

/**
 * jsPsych ライブラリのフレームワークに従って課題を構成します。
 * @returns 課題のタイムライン
 */
const prepareTimeline = () => {
  // 設定を読み込みます。
  const settings = prepareSettings();

  return [
    // フルスクリーン表示に切り替えます。
    setFullScreen(),

    // 試行に必要な画像データを事前にロードします。
    preloadData(settings),

    // 課題の説明文を表示します。
    showTaskInstruction(settings),

    // beads task 課題を行います。
    doBeadsTaskTrial(settings),

    // 課題の終了文を表示します。
    showEndInstruction(timeline),

    // フルスクリーン表示を解除します。
    cancelFullScreen(),
  ];
};

/////////////////////////////////////////////////
//// 課題の構成要素

/**
 * 画面をフルスクリーン表示に切り替えます。
 * @returns 試行オブジェクト
 */
const setFullScreen = () => {
  // jspsych_init.js スクリプトで fullscreen 全画面表示オブジェクトがすでに
  // 定義されている場合は、それを返します。そうで無い場合は新規に生成して返します。
  if (typeof fullscreen !== 'undefined') {
    return fullscreen;
  } else {
    return {
      type: jsPsychFullscreen,
      message: "<p><span style='font-size:20pt;'>それでは課題をはじめます。</span></p>" +
        "<p><span style='font-size:20pt;'>以下の「開始」を押すと、全画面になって課題がはじまります。</span></p>" +
        "<p><span style='font-size:20pt;'>課題を途中で終了する場合は、エスケープ キーを押して全画面を解除し、</span></p>" +
        "<p><span style='font-size:20pt;'>ブラウザーを閉じてください。</span></p>",
      button_label: "<p style='font-size:20px'>開始</p>",
      fullscreen_mode: true,
      data: {
        name: 'full screen'
      }
    };
  }
};

/**
 * 試行に必要な画像データを事前にロードします。
 * @param {*} settings
 */
const preloadData = (settings) => {
  let imageData = [];
  // 画像データのみを、1 つの配列に格納します。
  settings.beadsStimSourceMap.forEach((value) => {
    imageData.push(value);
  });
  settings.jarStimSourceMap.forEach((value) => {
    imageData.push(value.jarImage);
  });
  return {
  type: jsPsychPreload,
  images: imageData,
  data: {
    name: 'pre load'
    }
  };
};

/**
 * 課題開始時の説明文を表示します。
 */
 const showTaskInstruction = (settings) => ({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div id="title">瓶課題</div><br>
    <div id="instruction">
      <div id="jar">
        <div class="jarlabel">A</div>
        <img src="${settings.jarStimSourceMap.get('A').jarImage}" class="jarimage">
      </div>
      <div id="beadscounter"></div>
      <div id="jar">
        <div class="jarlabel">B</div>
        <img src="${settings.jarStimSourceMap.get('B').jarImage}" class="jarimage">
      </div>
    </div>
    <div style="width: 100%; height: 20vh;"></div>
    <div>この課題では、コンピューターが，瓶 A または瓶 B のどちらかから赤色または青色のビーズを取り出します。<br>
      それぞれのビーズは、同じ瓶の中からランダムに取り出されます。<br><br>
      一度取り出されたビーズは、次のビーズを取り出す前に瓶に戻します。<br>
      そのため、瓶の中の赤色と青色のビーズの個数は常に一定です。<br><br>
      これから、瓶から取り出されるビーズを見て、瓶 A と瓶 B のどちらから取り出されているのかを推測してください。<br>
      この推測ができるのは1回だけです。<br>
      ただし、推測する前に、何度でも瓶からビーズを取り出すことができます。</div>
  `,
  choices: [`<div id="button" class="single">1 つめのビーズを引く</div>`],
  button_html: `%choice%`,
  data: {
    name: 'instruction'
  }
});

/**
 * beads task 課題を定義するブロックを生成します。
 * 2 回目以降のビーズを引く試行、
 * ビーズを引くか、瓶を推測するかを問う試行
 * から構成されます。
 * @param {number} settings
 */
const doBeadsTaskTrial = (settings) => {
  // 瓶を選択します。
  const jar = jsPsych.randomization.sampleWithoutReplacement(['A', 'B'], 1);
  jsPsych.data.repeatFlag = true;
  let trialCount = 1;     // ビーズを引いた回数です。
  let beads;              // 引いたビーズを表す変数です。
  let beadsSequence ='';  //これまでに引いた累積のビーズを表す変数です。

  // 1 回引いたビーズを表示する試行を定義します。
  const drawing = () => ({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      beads = settings.beadsStimSourceMap.get(`${jsPsych.timelineVariable('beads_color')}`);
      beadsSequence += `<img src="${beads}" class="alignedbeads">`;
      if (trialCount % 25 == 0) { // 25 個毎に改行して表示します。
        beadsSequence += `<br>`;
      }
    return `
    <div id="instruction">
      <div id="jar">
        <div class="jarlabel">A</div>
        <img src="${settings.jarStimSourceMap.get('A').jarImage}" class="jarimage">
      </div>
      <div id="beadscounter">${trialCount} 回目の<br>ビーズ<br><br><img src="${beads}"></div>
      <div id="jar">
        <div class="jarlabel">B</div>
        <img src="${settings.jarStimSourceMap.get('B').jarImage}" class="jarimage">
      </div>
    </div>
    <div id="beadssequence"><div style="font-size: 14pt; text-align: center; line-height: 1.8em;">これまでに引いたビーズ</div><br>
    ${beadsSequence}</div>`
    },
    choices: [`<div id="button" class="double_left">次のビーズを引く</div>`, `<div id="button" class="double_right">瓶を推測する（1回のみ）</div>`],
    button_html: '%choice%',
    data: {
      name: 'drawing',
      trial_count: trialCount,
      beads_color: jsPsych.timelineVariable('beads_color')
    },
    on_finish: () => {
      let response = jsPsych.data.get().last(1).values()[0];
      let choice = response.response;
      jsPsych.data.repeatFlag = (choice == 0);
      console.log(beadsSequence);
      trialCount++;
    }
  });

 // ビーズを引くか、瓶を推測するかを判断する試行です。
  const repeatDrawingOrNot = () => ({
    timeline: [chooseJar(), resultFeedback()],
    conditional_function: () => {
      // repeatFlag が false ('瓶を推測する') であれば、chooseJar() および resultFeedback() を実行します。
      return (! jsPsych.data.repeatFlag);
    },
    data: {
      name: 'repeat drawing or not',
    },
  });

 // 瓶を推測する試行です。
 //<div id="beadscounter">${trialCount} 回目の<br>ビーズ<br><br><img src="${beads}"></div> は消したat
  const chooseJar = () => ({
  type: jsPsychHtmlButtonResponse,
  stimulus: () => {
    return `
    <div id="instruction">
      <div id="jar">
        <div class="jarlabel">A</div>
      </div>
      <div id="beadscounter"></div>
      <div id="jar">
        <div class="jarlabel">B</div>
      </div>
    </div>
    <div style="width: 100%; height: 20vh;"></div>
    <div style="font-weight: bold;">ビーズがどちらの瓶から取り出されているのか推測して、瓶をマウスでクリックして選んでください。</div>
    <div id="beadssequence"><div style="font-size: 14pt; text-align: center; line-height: 1.8em;">これまでに引いたビーズ</div><br>
    ${beadsSequence}</div></div>`
  },
  choices: [
    `<img src="${settings.jarStimSourceMap.get('A').jarImage}" class="jarbutton" style="left: 34.8vw;">`,
    `<img src="${settings.jarStimSourceMap.get('B').jarImage}" class="jarbutton" style="left: 65.2vw;">`
  ],
  button_html: [
    '<button class="jspsych-btn">%choice%</button>',
    '<button class="jspsych-btn">%choice%</button>'
  ],
  data: {
    name: 'choose jar',
    jar_name: jar,
  },
  on_finish: (data) => {
    let response = jsPsych.data.get().last(1).values()[0];
    if (response.jar_name == 'A') {
      data.correct = (response.response == 0);
    } else {
      data.correct = (response.response == 1);
    }
  }
});

 // 瓶を推測した結果のフィードバックをします。
  const resultFeedback = () => ({
    type: jsPsychHtmlButtonResponse,
    stimulus: () => {
      // 推測結果を取得し、正誤の判定をします。
      let response = jsPsych.data.get().last(1).values()[0];
      let correct = (response.correct == true) ? '正解です。' : '不正解です。'

      return `<div style="font-size: 24pt; text-align: center; line-height: 1.8em">
        ${correct}<br>ビーズは瓶 ${response.jar_name} から選ばれました。</div>`;
    },
    choices: ['<div id="button">次へ</div>'],
    button_html: '%choice%',
    data: {
      name: 'result feed back'
    }
  });

  return {
    timeline: [drawing(), repeatDrawingOrNot()],
    timeline_variables: [
      { beads_color: settings.jarStimSourceMap.get(`${jar}`).highProbabilityColor},
      { beads_color: settings.jarStimSourceMap.get(`${jar}`).lowProbabilityColor }
    ],
    sample: {
      type: 'with-replacement',
      weights: settings.probability,
      size: 1,
    },
    loop_function: () => {
      // repeatFlag が false へ変更された場合は、ループを終了します。
      return jsPsych.data.repeatFlag;
    }
  }
};

/**
 * 課題の終了文を表示するブロック定義を生成します。
 * @returns 課題の終了文表示を表すブロック定義
 */
const showEndInstruction = () => ({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p style="font-size: 24px; line-height: 1.8em; text-align: left; width: 800px;">
    　この課題は終了です。<br>
      キーボードのキーをどれか押すと、結果が保存されて，次の課題に進みます<br>`,
  choices: "ALL_KEYS",
  post_trial_gap: 1000,
  data: {
    name: 'end'
  }
});

/**
 * 画面のフルスクリーン表示を解除します。
 * @returns ブロック定義
 */
const cancelFullScreen = () => ({
  type: jsPsychFullscreen,
  fullscreen_mode: false,
});

/////////////////////////////////////////////////
//// 関数の定義

/**
 * 設定情報を格納したオブジェクトを生成します。
 */
const prepareSettings = () => {

  let usersettings = getUserDefinedSettings();

  // 以下、ソースに関する設定をします。
  // パス名に '/' が不足していれば追加します。
  if (usersettings.sourceFolderPath.charAt(usersettings.sourceFolderPath.length - 1) !== '/') {
    usersettings.sourceFolderPath += '/';
  }

  // 2　種類のビーズの割合を設定します。
  usersettings.probability = [usersettings.highProbability, 100 - usersettings.highProbability];

  // ビーズの画像を設定します。
  usersettings.beadsStimSourceMap = new Map();
  // 刺激用画像ファイルのパスを設定します。
  for (let i = 0; i < usersettings.beadsStimuli.length; i++) {
    usersettings.beadsStimSourceMap.set(
      usersettings.beadsStimuli[i].beadsColor, usersettings.sourceFolderPath + usersettings.beadsStimuli[i].beadsImage
    );
  }

  //画像ファイルのパスを格納するマップです。
  usersettings.jarStimSourceMap = new Map();
  // 刺激用画像ファイルのパスを設定します。
  for (let i = 0; i < usersettings.jarStimuli.length; i++) {
    usersettings.jarStimSourceMap.set(
      usersettings.jarStimuli[i].jar, {
      highProbabilityColor: usersettings.jarStimuli[i].highProbabilityColor,
      lowProbabilityColor: usersettings.jarStimuli[i].lowProbabilityColor,
      jarImage: usersettings.sourceFolderPath + usersettings.jarStimuli[i].jarImage }
    );
  }

  // 使用しないユーザー定義の設定を消去します。
  delete usersettings.highProbability;
  delete usersettings.sourceFolderPath;
  delete usersettings.stimuli;

  return usersettings;
};

////////////////////////////////////////
//// 課題の実行

/**
 * 課題シーケンスです。
 * timeline 変数をグローバルに定義することにより、
 * jsPsych が定義された課題シーケンスを実行します。
 */
var timeline = prepareTimeline();
