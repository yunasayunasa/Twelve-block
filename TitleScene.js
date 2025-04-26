import { AUDIO_KEYS } from './constants.js';

export default class TitleScene extends Phaser.Scene {
     constructor() {
        super('TitleScene');
        // デフォルトのハチャメチャ度設定
        this.selectedCount = 4; // 抽選候補数 (0-11)
        this.selectedRate = 50; // ドロップ率 (0-100%)
        this.domElements = []; // DOM要素管理用
        this.currentBgm = null; // BGM管理用
        this.titleLogo = null; // ★ロゴオブジェクトを保持するプロパティ追加
     }

    create() {
        console.log("TitleScene Create Start");
        const w = this.scale.width;
        const h = this.scale.height;
       // this.cameras.main.setBackgroundColor('#222'); // 暗めの背景色
       // --- ▼ 背景画像を設定 ▼ ---
       this.add.image(w / 2, h / 2, 'titleBg') // 背景画像を表示
       .setOrigin(0.5, 0.5) // 中心基準
       .setDisplaySize(w, h); // 画面全体に表示 (アスペクト比は無視)
       // もしアスペクト比を維持したい場合は resizeBackground のような処理が必要
   // --- ▲ 背景画像を設定 ▲ ---

        // タイトルBGM再生
        this.playTitleBgm();

         // --- ▼ ロゴ画像を表示 ▼ ---
        // 初期位置は画面上部外側 (アニメーションで落とすため)
        this.titleLogo = this.add.image(w / 2, -200, 'titleLogo') // Y座標を画面外に
            .setOrigin(0.5, 0.5); // 中心基準
        // サイズ調整が必要な場合は .setScale() などを使う
        // 例: this.titleLogo.setScale(0.8);
        // --- ▲ ロゴ画像を表示 ▲ ---

        // タイトルテキスト
        //this.add.text(w / 2, h * 0.15, '十二神将ブロック崩し', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
       // this.add.text(w / 2, h * 0.25, '(仮)', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

        // --- ハチャメチャ度設定UI (DOM要素を使用) ---
        const sliderContainer = document.createElement('div');
        sliderContainer.style.width = '80%';
        sliderContainer.style.maxWidth = '400px';
        sliderContainer.style.color = 'white';
        sliderContainer.style.fontSize = '18px';
        sliderContainer.style.backgroundColor = 'rgba(0,0,0,0.6)';
        sliderContainer.style.padding = '15px';
        sliderContainer.style.borderRadius = '8px';
        sliderContainer.style.textAlign = 'left';

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
        const domElement = this.add.dom(w / 2, h * 0.6, sliderContainer).setOrigin(0.5);
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

        // --- ゲーム開始ボタン ---
        const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } };
        const buttonHoverStyle = { fill: '#ff0' }; // ホバー時の色

        const startButton = this.add.text(w / 2, h * 0.85, 'ゲーム開始', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true }) // カーソル変更
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