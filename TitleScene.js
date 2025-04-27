import { AUDIO_KEYS } from './constants.js';

export default class TitleScene extends Phaser.Scene {
     constructor() {
        super('TitleScene');
        // デフォルトのハチャメチャ度設定
        this.selectedCount = 4; // 抽選候補数 (0-11)
        this.selectedRate = 50; // ドロップ率 (0-100%)
        this.domElements = []; // DOM要素管理用
        this.currentBgm = null; // BGM管理用
     }

    create() {
        console.log("TitleScene Create Start");
        const w = this.scale.width;
        const h = this.scale.height;
        //this.cameras.main.setBackgroundColor('#222'); // 暗めの背景色
        // --- ▼ 背景画像を gameBackground3 に変更 ▼ ---
       this.add.image(w / 2, h / 2, 'gameBackground3') // キーを 'gameBackground3' に変更
       .setOrigin(0.5, 0.5)
       .setDisplaySize(w, h); // 画面全体に表示 (アスペクト比無視)
       // 必要なら setScale や resizeBackground のような処理を追加
   // --- ▲ 背景画像を gameBackground3 に変更 ▲ ---


        // タイトルBGM再生
        this.playTitleBgm();

        // --- ▼ テキストタイトル表示を修正 ▼ ---
this.add.text(w / 2, h * 0.15, 'はちゃめちゃ！\n十二神将会議！', {
    fontSize: '48px', // 少し大きく？
    // ポップな丸文字系フォント候補 (環境依存)
    fontFamily: '"Comic Sans MS", "Chalkduster", "Arial Rounded MT Bold", sans-serif',
    fill: '#FFD700',      // ゴールドっぽい色 (例)
    stroke: '#C71585',      // 縁取りを濃いピンクに (例)
    strokeThickness: 6,   // 縁取りを太く
    align: 'center',
    shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 6, stroke: true, fill: true } // 影も少し調整
}).setOrigin(0.5);
// --- ▲ テキストタイトル表示を修正 ▲ ---

    // (仮) のテキストは削除またはコメントアウト？ 必要なら残す
    // this.add.text(w / 2, h * 0.25, '(仮)', { /* ... */ }).setOrigin(0.5);
    // --- ▲ テキストタイトル表示を修正 ▲ ---

        // --- ハチャメチャ度設定UI ---
   /*
        const sliderContainer = document.createElement('div');
    sliderContainer.id = 'chaos-slider-container';
    // CSSでスタイルを設定するので、JSでのスタイル設定は最小限に
    // sliderContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // CSSで設定するので削除可能
    //sliderContainer.style.width = '80%'; // 必要なら残す
   // sliderContainer.style.maxWidth = '400px'; // 必要なら残す
    // sliderContainer.style.color = 'white'; // CSSで設定
    // sliderContainer.style.fontSize = '18px'; // CSSで設定
    // sliderContainer.style.padding = '15px'; // CSSで設定
    // sliderContainer.style.borderRadius = '8px'; // CSSで設定
    // sliderContainer.style.textAlign = 'left'; // CSSで設定

        // 抽選候補数スライダー
        const countDiv = document.createElement('div');
        countDiv.style.marginBottom = '10px';
        const countLabel = document.createElement('label');
        countLabel.htmlFor = 'count-slider';
        countLabel.textContent = 'でてくる神将: ';
        countLabel.style.display = 'inline-block';
        countLabel.style.width = '150px'; // ラベル幅調整
        const countValueSpan = document.createElement('span');
        countValueSpan.id = 'count-value';
        countValueSpan.textContent = this.selectedCount.toString();
        countValueSpan.style.display = 'inline-block';
        countValueSpan.style.minWidth = '2em'; // 幅確保
        countValueSpan.style.textAlign = 'right';
        countValueSpan.style.marginRight = '10px';
        const countSlider = document.createElement('input');
        countSlider.type = 'range';
        countSlider.id = 'count-slider';
        countSlider.min = '0';
        countSlider.max = '11'; // ALL_POSSIBLE_POWERUPSの要素数 - 1 (0から数えるため)
        countSlider.value = this.selectedCount.toString();
        countSlider.step = '1';
        countSlider.style.width = 'calc(100% - 190px)'; // ラベルと数値表示分引く
        countSlider.style.verticalAlign = 'middle';
        countDiv.appendChild(countLabel);
        countDiv.appendChild(countValueSpan);
        countDiv.appendChild(countSlider);

        // ドロップ率スライダー
        const rateDiv = document.createElement('div');
        const rateLabel = document.createElement('label');
        rateLabel.htmlFor = 'rate-slider';
        rateLabel.textContent = 'ドロップ率: ';
        rateLabel.style.display = 'inline-block';
        rateLabel.style.width = '150px'; // ラベル幅調整
        const rateValueSpan = document.createElement('span');
        rateValueSpan.id = 'rate-value';
        rateValueSpan.textContent = this.selectedRate.toString() + '%';
        rateValueSpan.style.display = 'inline-block';
        rateValueSpan.style.minWidth = '4em'; // 幅確保 (例: 100%)
        rateValueSpan.style.textAlign = 'right';
        rateValueSpan.style.marginRight = '10px';
        const rateSlider = document.createElement('input');
        rateSlider.type = 'range';
        rateSlider.id = 'rate-slider';
        rateSlider.min = '0';
        rateSlider.max = '100';
        rateSlider.value = this.selectedRate.toString();
        rateSlider.step = '10';
        rateSlider.style.width = 'calc(100% - 200px)'; // ラベルと数値表示分引く
        rateSlider.style.verticalAlign = 'middle';
        rateDiv.appendChild(rateLabel);
        rateDiv.appendChild(rateValueSpan);
        rateDiv.appendChild(rateSlider);

        sliderContainer.appendChild(countDiv);
        sliderContainer.appendChild(rateDiv);

        // DOM要素をPhaserに追加
        const domElement = this.add.dom(w / 2, h * 0.5, sliderContainer).setOrigin(0.5);
        this.domElements.push(domElement); // 破棄用に保持

        // スライダーイベントリスナー
        countSlider.addEventListener('input', (event) => {
            this.selectedCount = parseInt(event.target.value);
            countValueSpan.textContent = this.selectedCount.toString();
        });
        rateSlider.addEventListener('input', (event) => {
            this.selectedRate = parseInt(event.target.value);
            rateValueSpan.textContent = this.selectedRate.toString() + '%';
        });
*/
        // --- ▼ ゲーム開始ボタン (インタラクション修正) ▼ ---
    const buttonW = 240; const buttonH = 70; const buttonX = w / 2; const buttonY = h * 0.75; const buttonRadius = 15;
    const buttonTextStyle = { /* ... */ };
    const buttonNormalAlpha = 0.8; const buttonHoverAlpha = 0.95;
    const buttonNormalColor = 0xff6347; const buttonHoverColor = 0xff8c00;

    // 1. 角丸背景を描画
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(buttonNormalColor, buttonNormalAlpha);
    buttonBg.fillRoundedRect(buttonX - buttonW / 2, buttonY - buttonH / 2, buttonW, buttonH, buttonRadius);

    // --- ▼ setInteractive を引数なしで呼び出す ▼ ---
    buttonBg.setInteractive(); // ヒットエリアの自動検出に任せる
    // 念のため、inputが有効になったか確認 (trueならOK)
    console.log("Button background interactive enabled:", buttonBg.input?.enabled);
    // --- ▲ setInteractive を引数なしで呼び出す ▲ ---

    // 2. テキストを描画
    const startButtonText = this.add.text(buttonX, buttonY, 'ゲーム開始', buttonTextStyle).setOrigin(0.5);
    // ★ テキスト自体のインタラクションは無効化する
    startButtonText.disableInteractive();

    // 3. 背景に対するインタラクションを設定
    console.log("Adding button event listeners...");
    buttonBg.on('pointerover', () => {
        console.log("Button pointerover"); // ★ログ追加
        buttonBg.clear();
        buttonBg.fillStyle(buttonHoverColor, buttonHoverAlpha);
        buttonBg.fillRoundedRect(buttonX - buttonW / 2, buttonY - buttonH / 2, buttonW, buttonH, buttonRadius);
        this.input.setDefaultCursor('pointer'); // マウスカーソルを指マークに
    });
    buttonBg.on('pointerout', () => {
        console.log("Button pointerout"); // ★ログ追加
        buttonBg.clear();
        buttonBg.fillStyle(buttonNormalColor, buttonNormalAlpha);
        buttonBg.fillRoundedRect(buttonX - buttonW / 2, buttonY - buttonH / 2, buttonW, buttonH, buttonRadius);
        this.input.setDefaultCursor('default'); // マウスカーソルを元に戻す
    });
    buttonBg.on('pointerdown', () => {
        console.log("Start button clicked."); // ★これが重要
        this.sound.play(AUDIO_KEYS.SE_START);
        this.stopTitleBgm();
      //  this.clearDOM();
        this.scene.start('GameScene', { chaosSettings: { count: this.selectedCount, ratePercent: this.selectedRate } });
        this.scene.launch('UIScene');
    });
    console.log("Button event listeners added."); // リスナー登録完了ログ
    // --- ▲ ゲーム開始ボタン (インタラクション修正) ▲ ---
        // シーン終了時の処理を登録
    //    this.events.on('shutdown', this.shutdownScene, this);

        console.log("TitleScene Create End");
    }

    playTitleBgm() {
        this.stopTitleBgm(); // 念のため既存のBGMを停止
        console.log("Playing Title BGM (BGM2)");
        this.currentBgm = this.sound.add(AUDIO_KEYS.BGM2, { loop: true, volume: 0.5 });
        this.currentBgm.play();
    }

    stopTitleBgm() {
        if (this.currentBgm) {
            console.log("Stopping Title BGM");
            this.currentBgm.stop();
            this.sound.remove(this.currentBgm); // サウンドキャッシュからも削除
            this.currentBgm = null;
        }
    }

    // シーンがシャットダウンする（他のシーンに遷移するなど）時に呼ばれる
    shutdownScene() {
        console.log("TitleScene shutdown initiated.");
        this.clearDOM(); // DOM要素を削除
        this.stopTitleBgm(); // BGMを停止
        this.events.off('shutdown', this.shutdownScene, this); // イベントリスナー解除
        console.log("TitleScene shutdown complete.");
    }

    // DOM要素をクリアする
    clearDOM() {
        console.log("Clearing DOM elements.");
        this.domElements.forEach(element => element.destroy());
        this.domElements = [];
    }
}