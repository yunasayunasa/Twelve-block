// BootScene.js
import { POWERUP_ICON_KEYS, AUDIO_KEYS } from './constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        console.log("BootScene Preload Start");
        this.textures.generate('whitePixel', { data: ['1'], pixelWidth: 1 });

        // --- 画像読み込み ---
        console.log("Loading images...");
        this.load.image('ball_image', 'assets/ball.png');
        // パワーアップアイコンを一括読み込み (元に戻す)
        Object.values(POWERUP_ICON_KEYS).forEach(key => {
             if (key && typeof key === 'string') {
                 this.load.image(key, `assets/${key}.png`);
             }
        });
        this.load.image('joykun', 'assets/joykun.png'); // 元に戻す
        this.load.image('gameBackground', 'assets/gamebackground.jpg');
        this.load.image('gameBackground2', 'assets/gamebackground2.jpg');
        this.load.image('gameBackground3', 'assets/gamebackground3.jpg'); // これは使う
        // --- ▼ titleLogo と titleBg の読み込みを削除 ▼ ---
        // this.load.image('titleLogo', 'assets/Title_logo.png');
        // this.load.image('titleBg', 'assets/Titlebg.jpg');
        // console.log("Loading title assets: titleLogo, titleBg"); // 削除
        // --- ▲ titleLogo と titleBg の読み込みを削除 ▲ ---


        // --- 音声読み込み (元に戻す) ---
        console.log("Loading audio files (all as .mp3)...");
       this.load.audio(AUDIO_KEYS.BGM1, 'assets/stage_bgm1.mp3');
       this.load.audio(AUDIO_KEYS.BGM2, 'assets/stage_bgm2.mp3');
       this.load.audio(AUDIO_KEYS.SE_START, 'assets/se_start.mp3');
      // this.load.audio(AUDIO_KEYS.SE_LAUNCH, 'assets/se_launch.mp3');
        // ★注意: エラーが出ていたSEはコメントアウトしたままにするか、ファイルを修正/削除する必要があるかもしれません
     //   this.load.audio(AUDIO_KEYS.SE_REFLECT, 'assets/se_reflect.mp3'); // もし404ならコメントアウト
     //   this.load.audio(AUDIO_KEYS.SE_DESTROY, 'assets/se_destroy.mp3'); // もし404ならコメントアウト
      //  this.load.audio(AUDIO_KEYS.SE_STAGE_CLEAR, 'assets/se_stage_clear.mp3'); // もし404ならコメントアウト
       // this.load.audio(AUDIO_KEYS.SE_GAME_OVER, 'assets/se_game_over.mp3');
     //   this.load.audio(AUDIO_KEYS.SE_SINDARA_MERGE, 'assets/se_sindara_merge.mp3'); // もし404ならコメントアウト
      //  this.load.audio(AUDIO_KEYS.SE_BIKARA_CHANGE, 'assets/se_bikara_change.mp3');
     //   this.load.audio(AUDIO_KEYS.SE_VAJRA_TRIGGER, 'assets/se_vajra_trigger.mp3'); // もし404ならコメントアウト
        this.load.audio(AUDIO_KEYS.VOICE_KUBIRA, 'assets/voice_kubira.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_SHATORA, 'assets/voice_shatora.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_HAILA, 'assets/voice_haila.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_ANCHIRA, 'assets/voice_anchira.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_SINDARA, 'assets/voice_sindara.mp3');
      //  this.load.audio(AUDIO_KEYS.VOICE_SINDARA_MERGE, 'assets/voice_sindara_merge.mp3'); // もし404ならコメントアウト
        this.load.audio(AUDIO_KEYS.VOICE_BIKARA_YIN, 'assets/voice_bikara_yin.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_BIKARA_YANG, 'assets/voice_bikara_yang.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_INDARA, 'assets/voice_indara.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_ANILA, 'assets/voice_anila.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_BAISRAVA, 'assets/voice_baisrava.mp3'); // もし404ならコメントアウト
        this.load.audio(AUDIO_KEYS.VOICE_VAJRA_GET, 'assets/voice_vajra.mp3');
       // this.load.audio(AUDIO_KEYS.VOICE_VAJRA_TRIGGER, 'assets/voice_vajra_trigger.mp3'); // もし404ならコメントアウト
        this.load.audio(AUDIO_KEYS.VOICE_MAKIRA, 'assets/voice_makira.mp3');
        this.load.audio(AUDIO_KEYS.VOICE_MAKORA, 'assets/voice_makora.mp3');

        console.log("Finished loading audio files setup.");
    }

    create() {
        console.log("BootScene Create Start");
        const loaderElement = document.getElementById('loader-container');
        if (loaderElement) {
            loaderElement.style.display = 'none';
            console.log("Loader hidden.");
        } else {
            console.warn("Loader element not found.");
        }
        this.scene.start('TitleScene');
        console.log("BootScene Create End");
    }
}