// BossScene.js
import {
    PADDLE_WIDTH_RATIO, PADDLE_HEIGHT, PADDLE_Y_OFFSET, BALL_RADIUS, PHYSICS_BALL_RADIUS,
    BALL_INITIAL_VELOCITY_Y, BALL_INITIAL_VELOCITY_X_RANGE, NORMAL_BALL_SPEED, AUDIO_KEYS, MAX_STAGE // 必要な定数をインポート
    // 他にも BossScene で使う定数があれば追加 (例: ボスの体力など)
} from './constants.js';

export default class BossScene extends Phaser.Scene {
    constructor() {
        super('BossScene'); // シーンキーを 'BossScene' に設定

        // --- プロパティ初期化 ---
        this.paddle = null;
        this.balls = null;
        this.boss = null; // ボスオブジェクト用
        this.orbiters = null; // 子機グループ用
        this.attackBricks = null; // 攻撃ブロックグループ用
        this.bossContainer = null; // ボスと子機をまとめるコンテナ (オプション)

        // ゲーム状態
        this.lives = 3; // デフォルト値 (initで上書き)
        this.score = 0; // デフォルト値 (initで上書き)
        this.chaosSettings = null; // initで受け取る
        this.currentStage = MAX_STAGE; // ボスステージは常にMAX_STAGEとする

        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false; // ボス撃破フラグ

        // UI連携用
        this.uiScene = null;

        // その他
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.currentBgm = null; // ボス戦用BGM管理
    }

    init(data) {
        console.log("BossScene Init Start");
        // GameSceneからデータを受け取る
        this.lives = data.lives || 3; // ライフ引き継ぎ (なければ3)
        this.score = data.score || 0; // スコア引き継ぎ (なければ0)
        this.chaosSettings = data.chaosSettings || { count: 4, rate: 0.5 }; // カオス設定引き継ぎ
        console.log(`BossScene Initialized with Lives: ${this.lives}, Score: ${this.score}`);
        console.log('Chaos Settings:', this.chaosSettings);

        // 状態リセット
        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.currentBgm = null; // BGMリセット
    }

    preload() {
        // BossScene固有のアセットがあればここで読み込む (通常はBootSceneで済ませる)
        console.log("BossScene Preload (usually nothing needed here)");
    }

    create() {
        console.log("BossScene Create Start");
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // --- ▼ 基本的なシーン設定 (GameSceneとほぼ同じ) ▼ ---
        // 背景 (ボス戦専用背景があれば使う。なければGameSceneのものを流用)
        this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'gameBackground3') // 仮にgameBackground3を使用
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.gameWidth, this.gameHeight)
            .setDepth(-1);

        // BGM再生 (ボス戦用BGMキーを設定)
        this.playBossBgm(); // ★ ボス戦用BGM再生関数を呼び出す

        // UIシーン起動 & 初期値設定
        console.log("Launching UIScene for Boss...");
        this.scene.launch('UIScene'); // UISceneを起動
        this.uiScene = this.scene.get('UIScene'); // UISceneへの参照を取得
        // 少し待ってからUIに初期値を送る
        this.time.delayedCall(50, () => {
            if (this.uiScene && this.uiScene.scene.isActive()) { // UISceneが起動しているか確認
                console.log("Updating initial UI for BossScene.");
                this.uiScene.events.emit('updateLives', this.lives);
                this.uiScene.events.emit('updateScore', this.score);
                this.uiScene.events.emit('updateStage', this.currentStage); // ステージ番号をMAX_STAGEに
                // ボス戦ではヴァジラゲージやドロッププールは不要？ 必要なら表示
                this.uiScene.events.emit('deactivateVajraUI');
                this.uiScene.events.emit('updateDropPoolUI', []); // ドロッププールは空に
            }
        }, [], this);


        // 物理ワールド設定
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.physics.world.off('worldbounds', this.handleWorldBounds, this); // 念のため解除
        this.physics.world.on('worldbounds', this.handleWorldBounds, this);

        // パドル作成・操作設定 (GameSceneと同じ)
        this.paddle = this.physics.add.image(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET, 'whitePixel')
            .setTint(0xffff00).setImmovable(true).setData('originalWidthRatio', PADDLE_WIDTH_RATIO);
        this.updatePaddleSize();
        this.input.on('pointermove', this.handlePointerMove, this); // パドル移動ハンドラ

        // ボールグループ作成 & 初期ボール作成 (GameSceneと同じ)
        this.balls = this.physics.add.group({ bounceX: 1, bounceY: 1, collideWorldBounds: true });
        this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);

        // ゲームオーバーテキスト (GameSceneと同じ)
        this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER\nTap to Restart', { /*...*/ }).setOrigin(0.5).setVisible(false).setDepth(1);

        // ポインターダウン処理 (ボール発射 / ゲームオーバーリスタート)
        this.input.off('pointerdown', this.handlePointerDown, this); // 念のため解除
        this.input.on('pointerdown', this.handlePointerDown, this); // ボスシーン用のハンドラを設定

        // リサイズイベント
        this.scale.off('resize', this.handleResize, this); // 念のため解除
        this.scale.on('resize', this.handleResize, this);

        // シーン終了イベント
        this.events.on('shutdown', this.shutdownScene, this);
        // --- ▲ 基本的なシーン設定 ▲ ---


        // --- ▼ ボス関連の初期化 (まずは枠だけ) ▼ ---
        console.log("Initializing boss elements...");
        // ボス・子機用コンテナ (オプション)
        // this.bossContainer = this.add.container(x, y);

        // ボス本体生成 (仮表示)
        this.boss = this.physics.add.image(this.gameWidth / 2, 150, 'bossStand') // 初期位置 (仮)
             .setImmovable(true); // ボスは動かないように設定
        console.log("Boss object created (initial).");
        // ★ここにボスの当たり判定設定、体力設定などを追加していく

        // 子機グループ生成
        this.orbiters = this.physics.add.group({ immovable: true });
        console.log("Orbiters group created.");
        // ★ここに子機を生成し、グループやコンテナに追加する処理を追加していく

        // 攻撃ブロックグループ生成
        this.attackBricks = this.physics.add.group();
        console.log("Attack bricks group created.");

        // ★ここにボス登場演出 (カットインなど) を追加していく
        // 演出中は操作不可にするフラグなど
        // this.playerControlEnabled = false;
        // this.time.delayedCall(演出時間, () => { this.playerControlEnabled = true; });

        // --- ▲ ボス関連の初期化 ▲ ---


        // --- ▼ 衝突判定設定 (ボス関連を追加) ▼ ---
        console.log("Setting boss colliders...");
        this.setColliders(); // ★ setCollidersメソッドをBossScene用に作成・修正する
        console.log("Boss colliders set.");
        // --- ▲ 衝突判定設定 ▲ ---


        console.log("BossScene Create End");
    }

    update(time, delta) {
        // ゲームオーバー or ボス撃破時は何もしない
        if (this.isGameOver || this.bossDefeated) {
            return;
        }

        // ★ここにボスの動き (8の字)、子機の回転、攻撃ブロック生成などのロジックを追加

        // ボールが画面下に落ちた判定 (GameSceneと同じ)
        let activeBallCount = 0;
        this.balls.getChildren().forEach(ball => {
             if (ball.active) {
                 activeBallCount++;
                 if (this.isBallLaunched && ball.y > this.gameHeight + ball.displayHeight) {
                     // ボス戦ではアニラは考慮しない？ 必要なら追加
                     console.log("Ball went out of bounds.");
                     ball.setActive(false).setVisible(false);
                     if (ball.body) ball.body.enable = false;
                 }
                 // ★ここにボール速度制限などを追加 (GameScene参考)
             }
        });
         if (activeBallCount === 0 && this.isBallLaunched && this.lives > 0) {
             console.log("No active balls left, losing life.");
             this.loseLife(); // ★ loseLife メソッドをBossScene用に作成する
             return;
         }

         // 攻撃ブロックが画面下に落ちた判定
         this.attackBricks.children.each(brick => {
             if (brick.active && brick.y > this.gameHeight + brick.displayHeight) {
                 brick.destroy();
             }
         });

         // ★ここにボスや子機のupdate処理を追加
    }

    // --- ▼ 必要なメソッドを GameScene から移植・修正 ▼ ---

    // BGM再生 (ボス戦用)
    playBossBgm() {
        this.stopBgm();
        console.log("Playing Boss BGM (Using BGM2 for now)"); // ★仮にBGM2を使う
        this.currentBgm = this.sound.add(AUDIO_KEYS.BGM2, { loop: true, volume: 0.5 });
        this.currentBgm.play();
    }
    stopBgm() { // GameSceneと同じ
        if (this.currentBgm) { /* ... */ }
    }

    updatePaddleSize() { /* ... GameSceneと同じ ... */ }
    handleResize(gameSize) { /* ... GameSceneと同じ＋ボスUI調整？ ... */ }
    handlePointerMove(pointer) { // GameSceneと同じ (操作不可フラグを考慮？)
         // if (this.playerControlEnabled && !this.isGameOver && ...) { ... }
         /* ... GameSceneと同じパドル移動ロジック ... */
    }
    handlePointerDown() { // ボール発射 or ゲームオーバーリスタート
        console.log("BossScene Pointer down event detected.");
        if (this.isGameOver && this.gameOverText?.visible) {
            console.log("Game Over detected, reloading page...");
            this.returnToTitle(); // リロード方式
        } else if (/*this.playerControlEnabled &&*/ this.lives > 0 && !this.isBallLaunched) { // ★操作可能かチェック
            this.launchBall();
        } else {
             console.log("Pointer down ignored.");
        }
    }
    launchBall() { /* ... GameSceneと同じ＋SE再生 ... */ }
    createAndAddBall(x, y, vx = 0, vy = 0) { /* ... GameSceneと同じ (パワーアップデータは引き継がない想定？) ... */ }

    setColliders() {
        console.log("[BossScene] Setting colliders...");
        // ★★★ GameSceneのsetCollidersをベースに、ボス戦用に修正する ★★★
        // - ボール vs パドル
        // - ボール vs ボス本体 (ダメージ処理へ)
        // - ボール vs 子機 (跳ね返すだけ)
        // - ボール vs 攻撃ブロック (破壊処理へ)
        // - (必要なら) パドル vs 攻撃ブロック (ダメージ処理？)
        // 既存のコライダー破棄も忘れずに
    }

    handleWorldBounds(body, up, down, left, right) { /* ... GameSceneと同じ (壁反射SE) ... */ }

    // ★ ボスへのダメージ処理関数 (hitBoss など) を追加
    // ★ 攻撃ブロックの生成関数を追加
    // ★ 攻撃ブロックの破壊関数 (アイテムドロップ含む) を追加
    // ★ 子機の動きを制御する関数を追加
    // ★ ボスの動きを制御する関数を追加

    loseLife() { // GameScene参考
        if (this.isGameOver || this.bossDefeated) return;
        console.log(`[BossScene] Losing life. Lives remaining: ${this.lives - 1}`);
        this.lives--;
        if (this.uiScene && this.uiScene.scene.isActive()) {
            this.uiScene.events.emit('updateLives', this.lives);
        }
        this.isBallLaunched = false;
        // ボールリセットなど
        if (this.lives > 0) {
             this.time.delayedCall(500, this.resetForNewLife, [], this);
        } else {
            console.log("[BossScene] Game Over condition met.");
            try { this.sound.add(AUDIO_KEYS.SE_GAME_OVER).play(); } catch(e) { console.error("Error playing SE_GAME_OVER:", e); }
            this.stopBgm();
            this.time.delayedCall(500, this.gameOver, [], this);
        }
    }
    resetForNewLife() { /* ... GameScene参考 (ボス戦用に調整) ... */ }
    gameOver() { // GameScene参考
        if (this.isGameOver) return;
        console.log("[BossScene] Executing gameOver sequence.");
        this.isGameOver = true;
        if (this.gameOverText) this.gameOverText.setVisible(true);
        try { if (this.physics.world.running) this.physics.pause(); } catch(e) { console.error("Error pausing physics:", e); }
        // ボール停止など
    }

    // ★ ボス撃破関数 (defeatBoss など) を追加
    //   - 撃破演出
    //   - gameComplete 呼び出し

    gameComplete() { // GameSceneとほぼ同じだが、呼び出し元はボス撃破
        console.log("[BossScene] Game Complete!");
        try { this.sound.add(AUDIO_KEYS.SE_STAGE_CLEAR).play(); } catch(e) { /*...*/ }
        this.stopBgm();
        alert(`ゲームクリア！ スコア: ${this.score}`); // 仮
        this.returnToTitle();
    }

    returnToTitle() { // GameSceneと同じ (リロード方式)
         console.log("[BossScene] Attempting to reload page...");
         this.stopBgm();
         window.location.reload();
    }

    shutdownScene() {
        console.log("BossScene shutdown initiated.");
        this.stopBgm();
        // ★ GameSceneのshutdownSceneを参考に、BossSceneで追加したオブジェクトの破棄などを追加
        // イベントリスナー解除
        if (this.scale) this.scale.off('resize', this.handleResize, this);
        if (this.physics.world) this.physics.world.off('worldbounds', this.handleWorldBounds, this);
        this.events.removeAllListeners();
        if (this.input) this.input.removeAllListeners();

        // タイマー停止 (もしあれば)

        // オブジェクト破棄
        this.safeDestroy(this.paddle, "paddle");
        this.safeDestroy(this.balls, "balls group", true);
        this.safeDestroy(this.boss, "boss");
        this.safeDestroy(this.orbiters, "orbiters group", true);
        this.safeDestroy(this.attackBricks, "attackBricks group", true);
        this.safeDestroy(this.bossContainer, "bossContainer"); // コンテナを使っていれば
        this.safeDestroy(this.gameOverText, "gameOverText");

        // 参照クリア
        this.paddle = null; this.balls = null; this.boss = null; this.orbiters = null; this.attackBricks = null; this.bossContainer = null; this.gameOverText = null;
        this.uiScene = null;

        console.log("BossScene shutdown complete.");
    }

    // GameSceneからコピー
    safeDestroy(obj, name, destroyChildren = false) {
        if (obj && obj.scene) { /* ... */ } else { /* ... */ }
    }

    // --- ▲ 必要なメソッドを GameScene から移植・修正 ▲ ---
}