// TitleScene.js
import { AUDIO_KEYS } from './constants.js';

export default class TitleScene extends Phaser.Scene {
     constructor() {
        super('TitleScene');
        this.selectedCount = 4;
        this.selectedRate = 50;
        this.domElements = [];
        this.currentBgm = null;
        this.titleLogo = null;
     }

    create() {
        // --- ▼ try...catch で全体を囲む ▼ ---
        try {
            console.log("TitleScene Create Start");
            const w = this.scale.width;
            const h = this.scale.height;

             // --- ▼ 背景表示をシンプル化 ▼ ---
        console.log("Adding SIMPLE background (white pixel)...");
        this.add.image(w / 2, h / 2, 'whitePixel').setDisplaySize(w,h).setTint(0x333333); // 白ピクセルで代用
        console.log("SIMPLE background added.");
        // --- ▲ 背景表示をシンプル化 ▲ ---

            /////
            //console.log("Attempting to play title BGM..."); // ログ追加
            //this.playTitleBgm(); // BGM再生呼び出し
            //console.log("Title BGM play called (or attempted)."); // ログ追加
///
             // --- ▼ ロゴ表示をシンプル化 ▼ ---
        console.log("Adding SIMPLE logo (white pixel)...");
        this.titleLogo = this.add.image(w / 2, h * 0.2, 'whitePixel') // 画面内に表示
                           .setDisplaySize(200, 50) // 適当なサイズ
                           .setTint(0xff0000); // 赤色で目立たせる
        console.log("SIMPLE logo added.");
        // --- ▲ ロゴ表示をシンプル化 ▲ ---

            console.log("Creating DOM elements..."); // ログ追加
            const sliderContainer = document.createElement('div');
            // ...(スタイル設定)...
            sliderContainer.style.backgroundColor = 'rgba(0,0,0,0.7)';
            // ...(要素作成)...
            const countDiv = document.createElement('div'); /* ... */ sliderContainer.appendChild(countDiv);
            const rateDiv = document.createElement('div'); /* ... */ sliderContainer.appendChild(rateDiv);
            const domElement = this.add.dom(w / 2, h * 0.6, sliderContainer).setOrigin(0.5);
            this.domElements.push(domElement);
            // ...(イベントリスナー)...
            console.log("DOM elements created."); // ログ追加

            console.log("Creating start button..."); // ログ追加
            const buttonStyle = { /* ... */ };
            const buttonHoverStyle = { /* ... */ };
            const startButton = this.add.text(w / 2, h * 0.85, 'ゲーム開始', buttonStyle)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => { /* ... */ })
                .on('pointerout', () => { /* ... */ })
                .on('pointerdown', () => { /* ... */ });
            console.log("Start button created."); // ログ追加

            this.events.on('shutdown', this.shutdownScene, this);

            console.log("TitleScene Create End");

        } catch (error) { // --- ▼ エラーキャッチ処理 ▼ ---
            console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.error("Error occurred during TitleScene create:", error);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

            // エラー発生時もローダーが残らないように非表示にする (念のため)
            const loaderElement = document.getElementById('loader-container');
            if (loaderElement) {
                loaderElement.style.display = 'none';
            }
           // 画面にエラーメッセージを表示する
           const errorDiv = document.createElement('div');
           errorDiv.textContent = `タイトル画面表示エラー: ${error.message}. コンソールを確認してください。`;
           errorDiv.style.color = 'red'; errorDiv.style.padding = '20px';
           errorDiv.style.border = '2px solid red'; errorDiv.style.position = 'absolute';
           errorDiv.style.top = '10px'; errorDiv.style.left = '10px'; // 左上に表示
           errorDiv.style.backgroundColor = 'white'; errorDiv.style.zIndex = '10000';
           document.body.appendChild(errorDiv);
        } // --- ▲ エラーキャッチ処理 ▲ ---
    }

    playTitleBgm() {
        // --- ▼ BGM再生も try...catch で囲む ▼ ---
        try {
            this.stopTitleBgm();
            console.log("Playing Title BGM (BGM2)");
            this.currentBgm = this.sound.add(AUDIO_KEYS.BGM2, { loop: true, volume: 0.5 });
            // playの戻り値やエラーをハンドルすることも考慮できるが、まずはtry-catchで
            this.currentBgm.play();
            console.log("BGM play method executed."); // playが呼ばれたことを確認
        } catch (error) {
            console.error("Error during BGM playback setup/start:", error);
            // BGM再生エラーはゲームを止めないように、ここでは握りつぶす（ログには出す）
        }
        // --- ▲ BGM再生も try...catch で囲む ▲ ---
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