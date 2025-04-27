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
       this.add.text(w / 2, h * 0.15, 'はちゃめちゃ！\n十二神将会議！', { // ★ 改行文字 \n を挿入
        fontSize: '40px',
        fill: '#fff',
        fontStyle: 'bold',
        stroke: '#000',      // 黒い縁取り
        strokeThickness: 4, // 縁取りの太さ
        align: 'center'     // ★ 中央揃えを追加 (複数行の場合に有効)
    }).setOrigin(0.5); // オブジェクト全体の基準点は中央のまま

    // (仮) のテキストは削除またはコメントアウト？ 必要なら残す
    // this.add.text(w / 2, h * 0.25, '(仮)', { /* ... */ }).setOrigin(0.5);
    // --- ▲ テキストタイトル表示を修正 ▲ ---

        // --- ハチャメチャ度設定UI ---
    const sliderContainer = document.createElement('div');
    // CSSでスタイルを設定するので、JSでのスタイル設定は最小限に
    // sliderContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // CSSで設定するので削除可能
    sliderContainer.style.width = '80%'; // 必要なら残す
    sliderContainer.style.maxWidth = '400px'; // 必要なら残す
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
        countLabel.textContent = '抽選候補数: ';
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

        // --- ゲーム開始ボタン (ポップなスタイル) ---
    const buttonStyle = {
        fontSize: '36px',
        fill: '#fff',
        fontFamily: '"Arial Black", Gadget, sans-serif',
        backgroundColor: '#ff6347', // トマト色 (例)
        padding: { x: 30, y: 15 },
        // borderRadius は効かない可能性あり
        shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, stroke: true, fill: true }
    };
    const buttonHoverStyle = {
        fill: '#fff',
        backgroundColor: '#ff8c00' // オレンジ色 (例)
    };
    const startButton = this.add.text(w / 2, h * 0.75, 'ゲーム開始', buttonStyle)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => { startButton.setStyle(buttonHoverStyle) })
        .on('pointerout', () => { startButton.setStyle(buttonStyle) })
            .on('pointerdown', () => {
                console.log("Start button clicked.");
                this.sound.play(AUDIO_KEYS.SE_START); // 開始SE
                this.stopTitleBgm(); // BGM停止
                // GameSceneに設定値を渡して開始
                this.scene.start('GameScene', { chaosSettings: { count: this.selectedCount, ratePercent: this.selectedRate } });
                // UISceneも同時に起動
                this.scene.launch('UIScene');
            });

        // シーン終了時の処理を登録
        this.events.on('shutdown', this.shutdownScene, this);

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