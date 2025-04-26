// TitleScene.js
import { AUDIO_KEYS } from './constants.js';

export default class TitleScene extends Phaser.Scene {
     constructor() {
        super('TitleScene');
        this.selectedCount = 4;
        this.selectedRate = 50;
        this.domElements = [];
        this.currentBgm = null;
        // this.titleLogo = null; // ロゴ画像を使わないので削除
     }

    create() {
        console.log("TitleScene Create Start");
        const w = this.scale.width;
        const h = this.scale.height;

       // --- ▼ 背景画像を gameBackground3 に変更 ▼ ---
       this.add.image(w / 2, h / 2, 'gameBackground3') // キーを変更
           .setOrigin(0.5, 0.5)
           .setDisplaySize(w, h); // 必要ならアスペクト比維持の処理を追加
       // --- ▲ 背景画像を gameBackground3 に変更 ▲ ---

        this.playTitleBgm(); // コメントアウトを解除

        // --- ▼ ロゴ画像の代わりにテキストタイトルを復活 ▼ ---
        this.add.text(w / 2, h * 0.15, '十二神将ブロック崩し', { fontSize: '40px', fill: '#fff', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5); // strokeを追加して視認性UP
        this.add.text(w / 2, h * 0.25, '(仮)', { fontSize: '20px', fill: '#fff', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
        // --- ▲ ロゴ画像の代わりにテキストタイトルを復活 ▲ ---


        // --- ハチャメチャ度設定UI (変更なし、座標は要調整) ---
        const sliderContainer = document.createElement('div');
        // ...(スタイル設定)...
        sliderContainer.style.backgroundColor = 'rgba(0,0,0,0.7)'; // 背景に合わせて調整
        // ...(要素作成)...
        const domElement = this.add.dom(w / 2, h * 0.5, sliderContainer).setOrigin(0.5); // Y座標を元に戻す (h*0.5あたり？)
        this.domElements.push(domElement);
        // ...(イベントリスナー)...

        // --- ゲーム開始ボタン (変更なし、座標は要調整) ---
        const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } };
        const buttonHoverStyle = { fill: '#ff0' };
        const startButton = this.add.text(w / 2, h * 0.75, 'ゲーム開始', buttonStyle) // Y座標を元に戻す (h*0.75あたり？)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => { startButton.setStyle(buttonHoverStyle) })
            .on('pointerout', () => { startButton.setStyle(buttonStyle) })
            .on('pointerdown', () => {
                console.log("Start button clicked."); // ★これがクリック時に出るか？
                this.sound.play(AUDIO_KEYS.SE_START);
                this.stopTitleBgm();
                this.scene.start('GameScene', { chaosSettings: { count: this.selectedCount, ratePercent: this.selectedRate } });
                this.scene.launch('UIScene');
            });

        this.events.on('shutdown', this.shutdownScene, this);

        console.log("TitleScene Create End");
        // try...catch ブロックは削除
    }

    playTitleBgm() {
        // try...catch を削除
        this.stopTitleBgm();
        console.log("Playing Title BGM (BGM2)");
        this.currentBgm = this.sound.add(AUDIO_KEYS.BGM2, { loop: true, volume: 0.5 });
        this.currentBgm.play();
        // console.log("BGM play method executed."); // 削除
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