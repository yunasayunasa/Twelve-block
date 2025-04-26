// BootScene.js
import { POWERUP_ICON_KEYS, AUDIO_KEYS } from './constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
        console.log("BootScene constructor called.");
    }

    preload() {
        console.log("BootScene Preload Start");
        // --- ▼ ここで既存のアセット読み込み処理 ▼ ---
        this.textures.generate('whitePixel', { data: ['1'], pixelWidth: 1 });
        this.load.image('ball_image', 'assets/ball.png');
        Object.values(POWERUP_ICON_KEYS).forEach(key => {
             if (key && typeof key === 'string') {
                 this.load.image(key, `assets/${key}.png`);
             }
        });
        this.load.image('joykun', 'assets/joykun.png');
        this.load.image('gameBackground', 'assets/gamebackground.jpg');
        this.load.image('gameBackground2', 'assets/gamebackground2.jpg');
        this.load.image('gameBackground3', 'assets/gamebackground3.jpg');

        // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
        // ★ ここに新しい画像 (ロゴ、タイトル背景) の読み込みを追加 ★
        // ★ 例: this.load.image('titleLogo', 'assets/title_logo.png'); ★
        // ★ 例: this.load.image('titleBg', 'assets/title_background.jpg'); ★
        // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


        console.log("Loading audio files (all as .mp3)...");
        this.load.audio(AUDIO_KEYS.BGM1, 'assets/stage_bgm1.mp3');
        // ... (他の音声読み込み) ...
        this.load.audio(AUDIO_KEYS.VOICE_MAKORA, 'assets/voice_makora.mp3');

        console.log("Finished loading audio files setup.");

        // --- ▲ 既存のアセット読み込み処理 ▲ ---


        // （オプション）Phaser標準のプログレスバー表示
        // let progressBar = this.add.graphics();
        // let progressBox = this.add.graphics();
        // progressBox.fillStyle(0x222222, 0.8);
        // progressBox.fillRect(this.cameras.main.width / 2 - 160, this.cameras.main.height / 2 - 25, 320, 50);
        // this.load.on('progress', function (value) {
        //     progressBar.clear();
        //     progressBar.fillStyle(0xffffff, 1);
        //     progressBar.fillRect(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2 - 15, 300 * value, 30);
        // });
        // this.load.on('complete', function () {
        //     progressBar.destroy();
        //     progressBox.destroy();
        // });
    }

    create() {
        console.log("BootScene Create Start");

        // --- ▼ ローダー非表示処理を追加 ▼ ---
        const loaderElement = document.getElementById('loader-container');
        if (loaderElement) {
            loaderElement.style.display = 'none';
            console.log("Loader hidden.");
        } else {
            console.warn("Loader element not found.");
        }
        // --- ▲ ローダー非表示処理を追加 ▲ ---

        // 読み込みが完了したらTitleSceneへ
        this.scene.start('TitleScene');
        console.log("BootScene Create End");
    }
}