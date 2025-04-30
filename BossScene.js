// BossScene.js (修正版4 - 省略なし完全コード - 子機削除、単純Tween)

import {
    PADDLE_WIDTH_RATIO, PADDLE_HEIGHT, PADDLE_Y_OFFSET, BALL_RADIUS, PHYSICS_BALL_RADIUS,
    BALL_INITIAL_VELOCITY_Y, BALL_INITIAL_VELOCITY_X_RANGE, NORMAL_BALL_SPEED, AUDIO_KEYS, MAX_STAGE, POWERUP_TYPES,
    ALL_POSSIBLE_POWERUPS, // アイテムドロップで使う可能性
    POWERUP_ICON_KEYS, // アイテムドロップで使う可能性
    BRICK_WIDTH_RATIO, POWERUP_SIZE, POWERUP_SPEED_Y,
    POWERUP_DURATION, BALL_SPEED_MODIFIERS,// 時間・速度関連の定数を追加
    // --- ▼ マキラ関連の定数をインポート ▼ ---
    MAKIRA_ATTACK_INTERVAL,
    MAKIRA_FAMILIAR_SIZE,
    MAKIRA_FAMILIAR_OFFSET,
    MAKIRA_BEAM_WIDTH,
    MAKIRA_BEAM_HEIGHT,
    MAKIRA_BEAM_COLOR,
    MAKIRA_BEAM_SPEED,
    // --- ▲ マキラ関連の定数をインポート ▲ ---
     // ▼▼▼ ここに VAJRA_GAUGE_MAX を追加 ▼▼▼
     VAJRA_GAUGE_MAX,
     VAJRA_GAUGE_INCREMENT // ヴァジラ関連の他の定数もここでインポートしておくと良い
} from './constants.js';

// --- ボス戦用定数 ---
const BOSS_MAX_HEALTH = 5;
const BOSS_SCORE = 1000;
// ▼ ボスの動き設定 (左右往復) ▼
const BOSS_MOVE_RANGE_X_RATIO = 0.8; // 画面幅の60%を往復
const BOSS_MOVE_DURATION = 4000; // 片道にかかる時間 (ms)
// --- ▲ ボスの動き設定 ▲ ---
// ★ 攻撃ブロック関連の定数
const ATTACK_BRICK_VELOCITY_Y = 150; // 落下速度
const ATTACK_BRICK_SPAWN_DELAY_MIN = 400; // 最短生成間隔 (ms)
const ATTACK_BRICK_SPAWN_DELAY_MAX = 1200; // 最長生成間隔 (ms)
const ATTACK_BRICK_SCALE = 0.8; // ブロックの表示スケール (仮)
const ATTACK_BRICK_SPAWN_FROM_TOP_CHANCE = 0.6; // 上から降ってくる確率 (60%)
const ATTACK_BRICK_ITEM_DROP_RATE = 0.4; // 破壊時にアイテムを落とす確率 (40%)
const FAMILIAR_MOVE_SPEED_X = 180; // ★ 子機の左右移動速度 (追加


export default class BossScene extends Phaser.Scene {
    constructor() {
        super('BossScene');

        // --- プロパティ初期化 ---
        this.paddle = null;
        this.balls = null;
        this.boss = null;
        this.attackBricks = null; // 子機は削除

        this.lives = 3;
        this.score = 0;
        this.chaosSettings = null;
        this.currentStage = MAX_STAGE;

        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true;
        this.bossMoveTween = null;
        this.bossAfterImageEmitter = null; // ★ 残像用エミッタのプロパテ
        this.attackBrickTimer = null; // ★ 攻撃ブロック生成タイマー用
        this.powerUps = null; // ★ パワーアップグループ用プロパティ追加
        this.bossDropPool = []; // ★ ボス戦用ドロッププールプロパティ追加
        this.powerUpTimers = {}; // ★ パワーアップタイマー用プロパティ
        this.isVajraSystemActive = false; // ★ ヴァジラゲージシステムが有効か
        this.vajraGauge = 0;              // ★ ヴァジラゲージの現在値

        // コライダー参照
        this.ballPaddleCollider = null;
        this.ballBossCollider = null;
        this.ballAttackBrickCollider = null; // 子機削除
        this.ballAttackBrickCollider = null;
         this.paddlePowerUpOverlap = null; // ★ パドルとアイテムのオーバーラップ参照
         // ...
         this.lastPlayedVoiceTime = {}; // ★ ボイス再生抑制用 (GameSceneからコピー)
         this.voiceThrottleTime = 500;  // ★ ボイス再生抑制用 (GameSceneからコピー)

        // UI連携用
        this.uiScene = null;

        // その他
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.currentBgm = null;
    }

    init(data) {
        console.log("BossScene Init Start");
        console.log("Received data in BossScene init:", data); // ★ 受け取ったデータ全体をログ出力
        this.lives = data.lives || 3;
        this.score = data.score || 0;
        if (data && data.chaosSettings) {
            // ★ GameSceneから(rate)かTitleSceneから(ratePercent)かで処理を分けるか、
            //    または、常に ratePercent を期待して変換するのが安全かも？
            // 例：常に ratePercent を期待する方式
            this.chaosSettings = {
                count: data.chaosSettings.count,
                rate: (data.chaosSettings.ratePercent ?? (data.chaosSettings.rate ? data.chaosSettings.rate * 100 : 50)) / 100.0 // ratePercent優先、なければrate*100、それもなければ50%
            };
            this.chaosSettings.rate = Phaser.Math.Clamp(this.chaosSettings.rate, 0, 1);
            console.log('Chaos Settings Set in BossScene:', this.chaosSettings); // ★ 設定後の値を確認
       } else {
            console.log('No Chaos Settings received in BossScene, using defaults.');
            this.chaosSettings = { count: 4, rate: 0.5 }; // デフォルト値
       }
        console.log(`BossScene Initialized with Lives: ${this.lives}, Score: ${this.score}`);
        Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(); });
        this.powerUpTimers = {};
        this.bossDropPool = []; // ★ initでも初期化
        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true;
        this.currentBgm = null;
        this.isVajraSystemActive = false; // ★ initでも初期化
        this.vajraGauge = 0;              // ★ initでも初期化
        if (this.bossMoveTween) {
            this.bossMoveTween.stop();
            this.bossMoveTween = null;
        }
    }

    preload() {
        console.log("BossScene Preload");
    }

    create() {
        console.log("BossScene Create Start");
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // --- 1. 基本的なシーン設定 ---
        this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'gameBackground3')
            .setOrigin(0.5, 0.5).setDisplaySize(this.gameWidth, this.gameHeight).setDepth(-1);
        this.playBossBgm();
        this.setupUI();
        this.setupPhysics();


        // --- 2. パドルとボールの生成 ---
        this.createPaddle();
        this.createBalls();

        // --- 3. ボス関連オブジェクトの生成 ---
        this.createBoss();
        this.createAttackBricksGroup();
        this.setupAfterImageEmitter(); // ★ 残像エミッタのセットアップ呼び出
        this.createPowerUpsGroup(); // ★ パワーアップグループ作成呼び出

        // --- 4. 衝突判定の設定 ---
// --- ▼ ボス戦用ドロッププールを設定 ▼ ---
this.setupBossDropPool();
// --- ▲ ボス戦用ドロッププールを設定 ▲ ---        
        this.setColliders(); // ★ 衝突判定にアイテム取得も追加

        // --- 5. ゲームオーバーテキスト ---
        this.createGameOverText();

        // --- 6. 入力・イベントリスナー設定 ---
        this.setupInputAndEvents();

        // --- 7. ボスの動きを開始 ---
        this.startBossMovement();

        // --- ▼ 攻撃ブロック生成タイマーを開始 ▼ ---
        this.scheduleNextAttackBrick();
        // --- ▲ 攻撃ブロック生成タイマーを開始 ▲ ---

        console.log("BossScene Create End");
    }

    /// BossScene.js の update メソッド (最終デバッグ)

    // BossScene.js 内
update(time, delta) {
    if (this.isGameOver || this.bossDefeated) {
         if (this.bossAfterImageEmitter && this.bossAfterImageEmitter.emitting) {
             this.bossAfterImageEmitter.stop();
         }
        return;
    }

    // --- 残像エミッタの位置追従 ---
    if (this.bossAfterImageEmitter && this.boss && this.boss.active) {
        this.bossAfterImageEmitter.setPosition(this.boss.x, this.boss.y);
        if (!this.bossAfterImageEmitter.emitting) {
             // console.log("[DEBUG AfterImage] Force starting emitter in update."); // 必要ならデバッグログ復活
             this.bossAfterImageEmitter.start();
        }
    }

    // --- ▼▼▼ マキラ子機追従ロジック削除 ▼▼▼ ---
    /*
    // このブロック全体を削除またはコメントアウト
    console.log(`[Update Tick ${time.toFixed(0)}] isMakiraActive: ${this.isMakiraActive}`);
    if (this.isMakiraActive) {
         // ... (追従のための setPosition などの処理) ...
    } else {
         // ...
    }
    */
    // --- ▲▲▲ マキラ子機追従ロジック削除 ▲▲▲ ---

    this.updateBallFall();
    this.updateAttackBricks();
    // updateMakiraBeams(); // このメソッドは定義されていなければ不要
}
    

    // --- ▼ Create ヘルパーメソッド ▼ ---

    setupUI() {
        console.log("Launching UIScene for Boss...");
        if (!this.scene.isActive('UIScene')) {
            const dataToPass = { parentSceneKey: 'BossScene' }; // ★ 渡すデータを変数に
        // ★★★ 渡す直前のデータの内容を詳細に出力 ★★★
        console.log(">>> Preparing to launch UIScene. Data type:", typeof dataToPass, "Content:", JSON.stringify(dataToPass));
        try {
            this.scene.launch('UIScene', dataToPass); // ★ 変数を使ってデータ渡し
            console.log("<<< UIScene launch command sent.");
        } catch (e) {
            console.error("!!! ERROR during UIScene launch:", e);
        }
    
           // console.log(">>> Launching UIScene with SIMPLE STRING data..."); // ログ追加
         //this.scene.launch('UIScene', "HelloUISceneFromBoss"); // ★ 文字列を渡す
             // ▼▼▼ UIScene 起動時にデータを渡す ▼▼▼
            // this.scene.launch('UIScene', { parentSceneKey: 'BossScene' });
             // ▲▲▲ UIScene 起動時にデータを渡す ▲▲▲
        }
        this.uiScene = this.scene.get('UIScene');
        // 初期UI更新 (少し遅延させるのは良いプラクティス)
        this.time.delayedCall(50, () => {
            if (this.uiScene && this.uiScene.scene.isActive()) {
                console.log("Updating initial UI for BossScene.");
                // ★ this (BossScene) のプロパティを使ってイベントを発行 ★
                this.events.emit('updateLives', this.lives);
                this.events.emit('updateScore', this.score);
                this.events.emit('updateStage', this.currentStage);
                 // ボス戦開始時はヴァジラUIは非表示、ドロッププールは空のはず
                 this.events.emit('deactivateVajraUI');
                 this.events.emit('updateDropPoolUI', this.bossDropPool); // bossDropPool を渡す
            } else { console.warn("UIScene not ready for initial UI update in BossScene."); }
        }, [], this);
    }


    // --- ▼ Create ヘルパーメソッドに setupBossDropPool を追加 ▼ ---
    setupBossDropPool() {
        console.log("Setting up boss drop pool...");
        const possibleDrops = [...ALL_POSSIBLE_POWERUPS];
        const shuffledPool = Phaser.Utils.Array.Shuffle(possibleDrops);
        const countToUse = this.chaosSettings?.count ?? 0; // 安全に取得
        this.bossDropPool = shuffledPool.slice(0, countToUse);
        console.log(`Boss Drop Pool (Count: ${countToUse}): [${this.bossDropPool.join(',')}]`);
    }
    // --- ▲ Create ヘルパーメソッドに setupBossDropPool を追加 ▲ ---

    setupPhysics() {
        console.log("Setting up physics world for BossScene...");
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.physics.world.off('worldbounds', this.handleWorldBounds, this);
        this.physics.world.on('worldbounds', this.handleWorldBounds, this);
        console.log("Physics world setup complete.");
    }

    createPaddle() {
        console.log("Creating paddle...");
        if (this.paddle) { this.paddle.destroy(); this.paddle = null; }
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, 'whitePixel')
            .setTint(0xffff00).setImmovable(true).setData('originalWidthRatio', PADDLE_WIDTH_RATIO);
        this.updatePaddleSize();
        console.log("Paddle created.");
    }

    createBalls() {
        console.log("Creating balls group and initial ball...");
        if (this.balls) { this.balls.destroy(true); this.balls = null; }
        this.balls = this.physics.add.group({ bounceX: 1, bounceY: 1, collideWorldBounds: true });
        if (this.paddle && this.paddle.active) {
            this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        } else {
            console.warn("Paddle not available, creating ball at default position.");
            this.createAndAddBall(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT/2 - BALL_RADIUS);
        }
        console.log("Balls group and initial ball created.");
    }

    createBoss() {
        console.log("Creating boss...");
        if (this.boss) { this.boss.destroy(); this.boss = null; }
        const bossStartX = this.gameWidth / 2;
        const bossStartY = this.gameHeight * 0.25;
        this.boss = this.physics.add.image(bossStartX, bossStartY, 'bossStand')
             .setImmovable(true);
        this.boss.setData('health', BOSS_MAX_HEALTH);
        this.boss.setData('maxHealth', BOSS_MAX_HEALTH);
        this.boss.setData('isInvulnerable', false);
        this.updateBossSize();
        console.log(`Boss created with health: ${this.boss.getData('health')}`);
    }

     // ★ パワーアップグループ作成メソッド (新規追加)
     createPowerUpsGroup() {
        console.log("Creating power ups group...");
        if (this.powerUps) { this.powerUps.destroy(true); }
        this.powerUps = this.physics.add.group();
        console.log("Power ups group created.");
    }

    createAttackBricksGroup() {
     //   console.log("Creating attack bricks group...");
        if (this.attackBricks) { this.attackBricks.destroy(true); this.attackBricks = null; }
        this.attackBricks = this.physics.add.group();
     //   console.log("Attack bricks group created.");
    }

    createGameOverText() {
        if (this.gameOverText) { this.gameOverText.destroy(); this.gameOverText = null; }
        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'GAME OVER\nTap to Restart', { fontSize: '48px', fill: '#f00', align: 'center' })
            .setOrigin(0.5).setVisible(false).setDepth(1);
    }

    setupInputAndEvents() {
        console.log("Setting up input and scene events...");
        this.input.off('pointermove', this.handlePointerMove, this);
        this.input.off('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.scale.off('resize', this.handleResize, this);
        this.scale.on('resize', this.handleResize, this);
        this.events.off('shutdown', this.shutdownScene, this);
        this.events.on('shutdown', this.shutdownScene, this);
        console.log("Input and scene events set up.");
    }

    // --- ▲ Create ヘルパーメソッド ▲ ---

// --- ▼ 見た目更新ヘルパー (優先順位考慮) ▼ ---
// --- ▼ updateBallAppearance (ログ追加・優先順位確認) ▼ ---
updateBallAppearance(ball) {
    console.log(`>>> Entering updateBallAppearance. Ball texture: ${ball?.texture?.key}`);

    if (!ball || !ball.active || !ball.getData) {
        console.log("<<< Exiting updateBallAppearance early: Ball invalid or inactive.");
        return;
    }

    let textureKey = 'ball_image'; // デフォルト
    const currentTexture = ball.texture.key;
    const lastPower = ball.getData('lastActivatedPower'); // 最後に有効になったパワーアップタイプを取得

    console.log(`[updateBallAppearance] Checking ball ${ball.name || currentTexture}. Last Activated Power: ${lastPower}`);

    // ▼▼▼ 条件分岐を lastPower 最優先に変更 ▼▼▼
    if (lastPower && POWERUP_ICON_KEYS[lastPower]) {
        // 最後に有効になったパワーアップに対応するアイコンキーがあれば、それを使用
        textureKey = POWERUP_ICON_KEYS[lastPower];
        console.log(`  Priority: Last power (${lastPower}). Target texture: ${textureKey}`);
    } else {
        // lastPower が null か、対応するアイコンキーがなければデフォルト
        textureKey = 'ball_image';
        console.log(`  Priority: Default or no icon for last power. Target texture: ${textureKey}`);
    }
    // ▲▲▲ 条件分岐を lastPower 最優先に変更 ▲▲▲


    // テクスチャが実際に変更されるかチェック
    if (currentTexture !== textureKey) {
        try {
            ball.setTexture(textureKey);
            console.log(`  ===> Texture CHANGED from ${currentTexture} to: ${textureKey}`);
        } catch (e) {
            console.error(`  !!! Error setting texture to ${textureKey}:`, e);
        }
    } else {
        // console.log(`  Texture already ${textureKey}. No change needed.`);
    }
    ball.clearTint(); // Tint は常にクリア

    console.log(`<<< updateBallAppearance finished (lastPower priority).`); // 出口ログ変更
}
 // --- ▲ updateBallAppearance ▲ ---


// ★★★ このメソッド定義を追加 ★★★
scheduleNextAttackBrick() {
    if (this.attackBrickTimer) { // 既存タイマーがあればクリア
        this.attackBrickTimer.remove();
    }
    // 次回実行までの遅延時間をランダムに決定
    const nextDelay = Phaser.Math.Between(ATTACK_BRICK_SPAWN_DELAY_MIN, ATTACK_BRICK_SPAWN_DELAY_MAX);
 //   console.log(`Scheduling next attack brick in ${nextDelay}ms`);
    // タイマーを設定
    this.attackBrickTimer = this.time.addEvent({
        delay: nextDelay,
        callback: this.spawnAttackBrick, // spawnAttackBrick を呼び出す
        callbackScope: this,
        loop: false // 1回実行したら、spawnAttackBrick内で再度スケジュールする
    });
}
// ★★★ このメソッド定義を追加 ★★★

    // --- ▼ Update ヘルパーメソッド ▼ ---

    updateBallFall() {
        if (!this.balls || !this.balls.active) return;
        let activeBallCount = 0;
        this.balls.getChildren().forEach(ball => {
            if (ball.active) {
                activeBallCount++;
                if (this.isBallLaunched && ball.y > this.gameHeight + ball.displayHeight) {
                    console.log("Ball went out of bounds.");
                    ball.setActive(false).setVisible(false);
                    if (ball.body) ball.body.enable = false;
                }
            }
        });
        if (activeBallCount === 0 && this.isBallLaunched && this.lives > 0 && !this.isGameOver && !this.bossDefeated) {
            console.log("No active balls left, losing life.");
            this.loseLife();
        }
    }

    updateAttackBricks() {
        if (!this.attackBricks || !this.attackBricks.active) return;
        this.attackBricks.children.each(brick => {
            if (brick.active && brick.y > this.gameHeight + brick.displayHeight) {
             //   console.log("Attack brick went out of bounds.");
                brick.destroy();
            }
        });
    }

    // updateOrbiters(time, delta) メソッド削除

    // --- ▲ Update ヘルパーメソッド ▲ ---

    // --- ▼ 攻撃ブロック生成関連メソッド (新規・修正) ▼ ---

    // 次の攻撃ブロック生成を予約するメソッド
    scheduleNextAttackBrick() {
        // 既存のタイマーがあれば削除
        if (this.attackBrickTimer) {
            this.attackBrickTimer.remove();
        }
        // ランダムな遅延時間を計算
        const nextDelay = Phaser.Math.Between(ATTACK_BRICK_SPAWN_DELAY_MIN, ATTACK_BRICK_SPAWN_DELAY_MAX);
        //console.log(`Scheduling next attack brick in ${nextDelay}ms`);

        this.attackBrickTimer = this.time.addEvent({
            delay: nextDelay,
            callback: this.spawnAttackBrick, // 生成関数を呼び出す
            callbackScope: this,
            loop: false // ループはせず、コールバック内で再度スケジュールする
        });
    }

    spawnAttackBrick() {
        // ... (生成位置決定ロジック spawnX, spawnY) ...
        //console.log("Spawning attack brick...");
        let spawnX; // ★★★ この行を追加 ★★★
        const spawnY = -30;

        // --- 生成位置を決定 ---
        if (Phaser.Math.FloatBetween(0, 1) < ATTACK_BRICK_SPAWN_FROM_TOP_CHANCE) {
            spawnX = Phaser.Math.Between(30, this.gameWidth - 30);
          //  console.log("Spawning from top random position.");
        } else {
            if (this.boss && this.boss.active) {
                spawnX = this.boss.x;
               // console.log("Spawning from boss position.");
            } else {
               // console.log("Boss not available, spawning at center top.");
                spawnX = this.gameWidth / 2;
            }
        }
        // --- 生成位置決定終わり ---

        // --- ▼ attackBrick テクスチャを使うように修正 ▼ ---
        // ★ テクスチャキーを 'attackBrick' に固定 (読み込み前提)
        //    もし読み込めなかった場合のフォールバックは create でチェックする方が良いかも
        const brickTexture = 'attackBrick';
       // console.log(`[Spawn Debug] Using texture: ${brickTexture}`);

        const attackBrick = this.attackBricks.create(spawnX, spawnY, brickTexture);

        if (attackBrick) {
            // --- ▼ 見た目の調整 ▼ ---
            const desiredScale = 0.2; // ★ 画像に合わせた適切なスケールに調整
            attackBrick.setScale(desiredScale);

            // ★ Tint設定は attackBrick 画像を使うので不要 → 削除
            // if (brickTexture === 'whitePixel') {
            //     attackBrick.setTint(0xcc99ff);
            // } else {
            //     attackBrick.clearTint();
            // }
            attackBrick.clearTint(); // 念のためクリア

            // // --- ▼ 当たり判定を表示サイズより大きくする ▼ ---
            try {
                if (attackBrick.body) {
                    // ★ 当たり判定の倍率を設定 ★
                    const hitboxScaleMultiplier = 3.8; // 例: 見た目の1.8倍の当たり判定サイズにする

                    const hitboxWidth = attackBrick.displayWidth * hitboxScaleMultiplier;
                    const hitboxHeight = attackBrick.displayHeight * hitboxScaleMultiplier;

                    attackBrick.body.setSize(hitboxWidth, hitboxHeight);

                    // ★ setSize で中央基準に拡大されるため、オフセットは通常不要 ★
                    // もしズレる場合は調整:
                    // const offsetX = (attackBrick.displayWidth - hitboxWidth) / 2;
                    // const offsetY = (attackBrick.displayHeight - hitboxHeight) / 2;
                    // attackBrick.body.setOffset(offsetX, offsetY);

                  //  console.log(`Attack brick body size set to: ${hitboxWidth.toFixed(0)}x${hitboxHeight.toFixed(0)} (Multiplier: ${hitboxScaleMultiplier})`);
                } else { console.warn("Attack brick body not ready for size setting."); }
            } catch (e) { console.error("Error setting attack brick body size:", e); }
            // --- ▲ 当たり判定を表示サイズより大きくする ▲ ---


            // 落下速度など
            attackBrick.setVelocityY(ATTACK_BRICK_VELOCITY_Y);
            attackBrick.body.setAllowGravity(false);
            attackBrick.body.setCollideWorldBounds(false);

          //  console.log(`Attack brick spawned at (${spawnX.toFixed(0)}, ${spawnY})`);
            this.scheduleNextAttackBrick();

    

        } else {
         //   console.error("Failed to create attack brick object!");
             // エラー発生時も次の生成を試みる (無限ループ防止のため遅延を入れる)
             this.time.delayedCall(ATTACK_BRICK_SPAWN_DELAY_MAX, this.scheduleNextAttackBrick, [], this);
        }
    }


    // --- ▼ アイテムドロップメソッド (GameSceneから移植・ボス戦用に調整) ▼ ---
    dropSpecificPowerUp(x, y, type) {
        if (!type) { console.warn("Attempted to drop powerup with no type."); return; }
        if (!this.powerUps) { console.error("PowerUps group does not exist!"); return; }

        let textureKey = POWERUP_ICON_KEYS[type] || 'whitePixel';
        let displaySize = POWERUP_SIZE;
        let tintColor = null;
        if (textureKey === 'whitePixel') { tintColor = (type === POWERUP_TYPES.BAISRAVA) ? 0xffd700 : 0xcccccc; }

        console.log(`[BossScene] Dropping power up ${type} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        try {
            const powerUp = this.powerUps.create(x, y, textureKey);
            if (powerUp) {
                powerUp.setDisplaySize(displaySize, displaySize).setData('type', type);
                if (tintColor !== null) { powerUp.setTint(tintColor); }
                else { powerUp.clearTint(); }
                if (powerUp.body) {
                    powerUp.setVelocity(0, POWERUP_SPEED_Y);
                    powerUp.body.setCollideWorldBounds(false);
                    powerUp.body.setAllowGravity(false);
                } else { powerUp.destroy(); console.error("No body for powerup!"); }
            } else { console.error("Failed to create powerup object!"); }
        } catch (e) { console.error("CRITICAL Error in dropSpecificPowerUp:", e); }
    }
    // --- ▲ アイテムドロップメソッド ▲ ---

     // --- ▼ アイテム取得メソッド (ボス戦効果実装開始) ▼ ---
     // BossScene.js

collectPowerUp(paddle, powerUp) {
    console.log("--- collectPowerUp ---");
    if (!(this instanceof BossScene)) { console.error("!!! 'this' is NOT BossScene in collectPowerUp !!!"); return; }
    if (!powerUp || !powerUp.active || this.isGameOver || this.bossDefeated) return;
    const type = powerUp.getData('type');
    if (!type) { powerUp.destroy(); return; }

    console.log(`[BossScene] Collected power up: ${type}`);
    powerUp.destroy();

    // --- ボイス再生 (共通処理) ---
    const voiceKeyBase = `voice_${type}`; const upperCaseKey = voiceKeyBase.toUpperCase();
    // 特殊なキー名を持つボイスの処理
    let actualAudioKey = AUDIO_KEYS[upperCaseKey];
    if (type === POWERUP_TYPES.VAJRA) actualAudioKey = AUDIO_KEYS.VOICE_VAJRA_GET; // ヴァジラ取得時用
    // ビカラは陰陽でボイスが分かれる可能性があるが、取得時は共通か？ 일단 Bikara Yin 으로?
    // if (type === POWERUP_TYPES.BIKARA) actualAudioKey = AUDIO_KEYS.VOICE_BIKARA_YIN;
    // シンダラ合体ボイスは別途

    const now = this.time.now; const lastPlayed = this.lastPlayedVoiceTime[upperCaseKey] || 0;
    if (actualAudioKey && (now - lastPlayed > this.voiceThrottleTime)) {
        try {
            console.log(`Playing voice: ${actualAudioKey}`); // ★再生するキー名をログ出力
            this.sound.play(actualAudioKey);
            this.lastPlayedVoiceTime[upperCaseKey] = now;
        }
        catch (e) { console.error(`Error playing voice ${actualAudioKey}:`, e); }
    } else if (!actualAudioKey) { console.warn(`Voice key ${upperCaseKey} / ${actualAudioKey} not found or invalid for type ${type}.`);} // ★見つからない場合もログ
    else { console.log(`Voice ${upperCaseKey} throttled.`); }
    // --- ボイス再生 終了 ---


    // --- ボス戦でのパワーアップ効果 ---
    switch (type) {
        case POWERUP_TYPES.KUBIRA:
            console.log("Activating Kubira (Boss Fight - Damage +1 for 10s)");
            this.activateTemporaryEffect(
                type, POWERUP_DURATION[type] || 10000,
                () => this.setBallPowerUpState(type, true),
                () => this.setBallPowerUpState(type, false)
            );
            break;
        case POWERUP_TYPES.SHATORA:
            console.log("Activating Shatora (Boss Fight - Speed Up for 3s)");
            this.activateTemporaryEffect(
                type, POWERUP_DURATION[type] || 3000,
                () => { this.balls.getChildren().forEach(ball => { if (ball.active) this.applySpeedModifier(ball, type); }); },
                () => { this.balls.getChildren().forEach(ball => { if (ball.active) this.resetBallSpeed(ball); }); }
            );
             this.setBallPowerUpState(type, true); // アイコン表示のため状態設定も必要
            break;
        case POWERUP_TYPES.HAILA:
            console.log("Activating Haila (Boss Fight - Speed Down for 10s)");
             this.activateTemporaryEffect(
                 type, POWERUP_DURATION[type] || 10000,
                 () => { this.balls.getChildren().forEach(ball => { if (ball.active) this.applySpeedModifier(ball, type); }); },
                 () => { this.balls.getChildren().forEach(ball => { if (ball.active) this.resetBallSpeed(ball); }); }
             );
             this.setBallPowerUpState(type, true); // アイコン表示のため状態設定も必要
            break;
        case POWERUP_TYPES.BAISRAVA:
            console.log("Activating Baisrava (Boss Fight - 50 Damage)");
            if (this.boss && this.boss.active && !this.boss.getData('isInvulnerable')) {
                 this.applyBossDamage(this.boss, 50, "Baisrava");
            } else { console.log("Baisrava hit, but boss is inactive or invulnerable."); }
             // バイシュラヴァはアイコン表示不要（即時効果のため）
            break;
        case POWERUP_TYPES.MAKIRA:
            console.log("Activating Makira (Boss Fight - Paddle Beam for 6.7s).");
            this.activateMakira(); // activateMakira 内で状態設定とタイマー管理
            break;

        // --- ▼▼▼ 未実装パワーアップのアイコン＆ボイス対応 ▼▼▼ ---
        case POWERUP_TYPES.SINDARA:
            console.log("Power up Sindara collected (Icon/Voice Test - Effect TBD: Split 2).");
            this.setBallPowerUpState(type, true); // アイコン表示のために状態設定
            // 効果時間がない/特殊な解除条件なので activateTemporaryEffect は使わない
            // ※ 解除ロジックは効果実装時に必要
            break;
        case POWERUP_TYPES.ANCHIRA:
            console.log("Power up Anchira collected (Icon/Voice Test - Effect TBD: Split 4 for 5s?).");
            this.setBallPowerUpState(type, true);
            // ※ 効果時間があるので、後で activateTemporaryEffect に組み込む必要あり
            // this.activateTemporaryEffect(type, 5000, () => {/*開始処理*/}, () => {/*終了処理*/});
            break;
        case POWERUP_TYPES.BIKARA:
            console.log("Power up Bikara collected (Icon/Voice Test - Effect TBD: Yin/Yang Damage).");
            this.setBallPowerUpState(type, true); // 初期状態（陰？）を設定
            // ※ 解除ロジック（陽で一定回数破壊後など）は効果実装時に必要
            break;
        case POWERUP_TYPES.INDARA:
            console.log("Power up Indara collected (Icon/Voice Test - Effect TBD: Homing + Pierce).");
            this.setBallPowerUpState(type, true);
            // ※ 解除ロジック（ボスヒット時など）は効果実装時に必要
            break;
        case POWERUP_TYPES.ANILA:
            console.log("Power up Anila collected (Icon/Voice Test - Effect TBD: Invincible Paddle for 10s?).");
            this.setBallPowerUpState(type, true); // ボールアイコンに反映
            // ※ パドルの無敵効果とタイマーは別途実装必要
            // this.activateTemporaryEffect(type, 10000, () => {/*パドル無敵化*/}, () => {/*無敵解除*/});
            break;
        case POWERUP_TYPES.MAKORA:
            console.log("Power up Makora collected (Icon/Voice Test - Effect TBD: Copy Boss Ability).");
            this.setBallPowerUpState(type, true);
            // ※ コピー効果は後で実装
            break;
            case POWERUP_TYPES.VAJRA:
                console.log("Power up Vajra collected - Activating Gauge System.");
                this.activateVajra(); // ★ activateVajra を呼び出す
                // activateVajra内で状態設定するのでここでは不要
               break;
        // --- ▲▲▲ 未実装パワーアップのアイコン＆ボイス対応 ▲▲▲ ---

        default:
            console.log(`Power up ${type} collected, no specific handler defined yet.`);
            // デフォルトでもアイコン表示を試みる（もし対応キーがあれば）
            this.setBallPowerUpState(type, true);
            break;
    }
    // ★★★ 見た目更新呼び出しを追加 ★★★
    // （setBallPowerUpState内で呼ばれるが、念のためここでも呼ぶと確実かも）
    this.updateBallAndPaddleAppearance();
}


    // --- ▼ パワーアップ効果管理ヘルパー ▼ ---

    // 一定時間だけ効果を有効にする汎用関数
    activateTemporaryEffect(type, duration, onStartCallback = null, onEndCallback = null) {
        console.log(`--- activateTemporaryEffect for ${type} ---`);
        console.log("Context 'this' in activateTemporaryEffect:", this); // ★ this の内容確認
        if (!(this instanceof BossScene)) { console.error("!!! 'this' is NOT BossScene in activateTemporaryEffect !!!"); return; } // ★ 型チェック
        // 既存タイマー解除
        if (this.powerUpTimers[type]) {
            this.powerUpTimers[type].remove();
        }
        // 開始時処理実行
        if (onStartCallback) {
            try { onStartCallback(); } catch (e) { console.error(`Error onStart for ${type}:`, e); }
        }
        // ボールに状態を設定 (例)
        this.setBallPowerUpState(type, true);

        // 終了タイマー設定
        this.powerUpTimers[type] = this.time.delayedCall(duration, () => {
            console.log(`Deactivating temporary effect: ${type}`);
            // 終了時処理実行
            if (onEndCallback) {
                try { onEndCallback(); } catch (e) { console.error(`Error onEnd for ${type}:`, e); }
            }
            // ボールの状態を解除
            this.setBallPowerUpState(type, false);
            this.powerUpTimers[type] = null; // タイマー参照クリア
            this.updateBallAndPaddleAppearance(); // 見た目更新
        }, [], this);

        this.updateBallAndPaddleAppearance(); // 開始時の見た目更新
    }

 // --- ▼ updateBallAndPaddleAppearance (ループ確認ログ追加) ▼ ---
updateBallAndPaddleAppearance() {
    console.log("--- updateBallAndPaddleAppearance called ---");
    console.log("Context 'this' inside updateBallAndPaddleAppearance:", this); // ★ this の内容確認
    if (this.balls && this.balls.active) {
        const children = this.balls.getChildren(); // 先に子を取得
        console.log(`  Checking ${children.length} balls in group.`); // ★ ボールの数をログ出力
        children.forEach((ball, index) => {
            console.log(`  Looping ball index ${index}. Ball active: ${ball?.active}`); // ★ ループ実行ログ
            if (ball && ball.active) { // ボールが存在しアクティブか確認
                try {
                    console.log(`    Calling updateBallAppearance for ball index ${index}...`); // ★ 関数呼び出し直前ログ
                    this.updateBallAppearance(ball);
                }
                catch (e) { console.error(`Error during individual ball appearance update (index ${index}):`, e); }
            } else {
                console.log(`    Skipping inactive/null ball index ${index}.`); // ★ スキップログ
            }
        });
    } else {
        console.log("  Balls group not active or does not exist."); // ★ グループがない場合のログ
    }
    console.log("--- updateBallAndPaddleAppearance finished ---");
}
// --- ▲ updateBallAndPaddleAppearance ▲ ---







    // --- ▼ ボール状態設定ヘルパー (lastActivatedPower再設定ロジック省略なし) ▼ ---
    // --- ▼ setBallPowerUpState (ログ強化) ▼ ---
setBallPowerUpState(type, isActive) {
    console.log(`[setBallPowerUpState] Called for type: ${type}, isActive: ${isActive}`); // ★ 関数呼び出しログ
    this.balls?.getChildren().forEach(ball => {
        if (ball?.active && ball.getData) { // getDataの存在も確認
            let activePowers = ball.getData('activePowers');
            if (!activePowers) activePowers = new Set();
            let oldLastPower = ball.getData('lastActivatedPower'); // ★ 古い lastActivatedPower を記録

            if (isActive) {
                activePowers.add(type);
                ball.setData('lastActivatedPower', type);
                console.log(`  Ball ${ball.name || ball.texture.key}: Added ${type}. Last Power: ${type} (was ${oldLastPower})`); // ★ ログ追加
            } else {
                activePowers.delete(type);
                console.log(`  Ball ${ball.name || ball.texture.key}: Removed ${type}. Current Powers: [${Array.from(activePowers).join(', ')}]`); // ★ 削除ログ
                if (ball.getData('lastActivatedPower') === type) {
                    const remainingPowers = Array.from(activePowers);
                    const newLastPower = remainingPowers.length > 0 ? remainingPowers[remainingPowers.length - 1] : null;
                    ball.setData('lastActivatedPower', newLastPower);
                    console.log(`    Last Power was ${type}, reset to: ${newLastPower}`); // ★ リセットログ
                }
            }
            ball.setData('activePowers', activePowers);

            // 各パワーアップに対応するフラグの設定/解除
            if (type === POWERUP_TYPES.KUBIRA) {
                ball.setData('isKubiraActive', isActive);
                console.log(`    Set isKubiraActive to: ${isActive}`); // ★ isKubiraActive 設定ログ
            }
            if (type === POWERUP_TYPES.SHATORA) { // 他のフラグも同様にログ追加推奨
                ball.setData('isFast', isActive);
                 console.log(`    Set isFast to: ${isActive}`);
            }
            if (type === POWERUP_TYPES.HAILA) {
                ball.setData('isSlow', isActive);
                 console.log(`    Set isSlow to: ${isActive}`);
            }
             if (type === POWERUP_TYPES.MAKIRA) { // マキラ用フラグはないが、activePowersで管理
                 console.log(`    Makira power status set to: ${isActive}`);
             }
            // 他のパワーアップフラグもここに追加

        }
    });
    // ★★★ setBallPowerUpState の最後に見た目更新を強制呼び出し ★★★
    console.log("[setBallPowerUpState] Forcing appearance update after state change.");
    this.updateBallAndPaddleAppearance(); // 変更を即時反映させるため
// ★★★ 直接呼び出しテスト ★★★
const firstBall = this.balls?.getFirstAlive();
if (firstBall) {
     console.log(">>> Attempting DIRECT call to updateBallAppearance for first ball...");
     try {
         this.updateBallAppearance(firstBall);
         console.log("<<< DIRECT call finished.");
     } catch(e) {
          console.error("!!! ERROR during DIRECT call:", e);
     }
} else {
     console.log("No active ball found for direct call test.");
}
 // ★★★ 直接呼び出しテスト終了 ★★★
// ★★★ 単純なテスト関数呼び出し ★★★
console.log(">>> Attempting call to testLogFunction...");
try {
    this.testLogFunction("Hello from setBallPowerUpState");
    console.log("<<< testLogFunction call finished.");
} catch(e) {
    console.error("!!! ERROR during testLogFunction call:", e);
}
 // ★★★ 単純なテスト関数呼び出し終了 ★★★
}
// --- ▲ setBallPowerUpState ▲ ---
    // --- ▲ ボール状態設定ヘルパー ▲ ---



// --- ▼ マキラ関連メソッド (GameSceneから移植・調整) ▼ ---

activateMakira() {
    if (!this.isMakiraActive) {
        console.log("[BossScene] Activating Makira.");
        this.isMakiraActive = true; // フラグを立てる
        // ファミリアグループ準備
        if (this.familiars) this.familiars.clear(true, true);
        else this.familiars = this.physics.add.group(); // ★ familiarsプロパティが必要
        this.createFamiliars(); // ファミリア生成
        // ビームグループ準備
        if (this.makiraBeams) this.makiraBeams.clear(true, true);
        else this.makiraBeams = this.physics.add.group(); // ★ makiraBeamsプロパティが必要

        // 攻撃タイマー開始
        if (this.makiraAttackTimer) this.makiraAttackTimer.remove();
        this.makiraAttackTimer = this.time.addEvent({
            delay: MAKIRA_ATTACK_INTERVAL, // constants.js から
            callback: this.fireMakiraBeam,
            callbackScope: this,
            loop: true
        });
        // ボール状態設定
        this.setBallPowerUpState(POWERUP_TYPES.MAKIRA, true);
        this.updateBallAndPaddleAppearance(); // 見た目更新
    }
    // 効果時間タイマー設定
    const duration = POWERUP_DURATION[POWERUP_TYPES.MAKIRA] || 6667;
    if (this.powerUpTimers[POWERUP_TYPES.MAKIRA]) this.powerUpTimers[POWERUP_TYPES.MAKIRA].remove();
    this.powerUpTimers[POWERUP_TYPES.MAKIRA] = this.time.delayedCall(duration, () => {
        console.log("Deactivating Makira due to duration.");
        this.deactivateMakira();
        this.powerUpTimers[POWERUP_TYPES.MAKIRA] = null;
    }, [], this);
    // ★ 衝突判定の更新が必要 (ビーム用) ★
    this.setColliders();
}

deactivateMakira() {
    if (this.isMakiraActive) {
        console.log("[BossScene] Deactivating Makira.");
        this.isMakiraActive = false;
        if (this.makiraAttackTimer) { this.makiraAttackTimer.remove(); this.makiraAttackTimer = null; }
        if (this.powerUpTimers[POWERUP_TYPES.MAKIRA]) { this.powerUpTimers[POWERUP_TYPES.MAKIRA].remove(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = null; }
        if (this.familiars) { this.familiars.clear(true, true); }
        if (this.makiraBeams) { this.makiraBeams.clear(true, true); }
        // ボール状態解除
        this.setBallPowerUpState(POWERUP_TYPES.MAKIRA, false);
        this.updateBallAndPaddleAppearance();
         // ★ 衝突判定の更新 (ビーム用を解除) ★
        this.setColliders();
    }
}

// BossScene.js 内
createFamiliars() {
    if (!this.paddle || !this.paddle.active || !this.familiars) { console.warn("Cannot create familiars."); return; }
    console.log("Creating familiars (physics enabled for independent movement)..."); // ログ変更
    const paddleX = this.paddle.x; // 初期位置の基準には使う
    const familiarY = this.paddle.y - PADDLE_HEIGHT / 2 - MAKIRA_FAMILIAR_SIZE; // Y座標はパドルの少し上

    try {
        // 左の子機
        const familiarLeft = this.familiars.create(paddleX - MAKIRA_FAMILIAR_OFFSET, familiarY, 'joykun') // physics group から create
            .setDisplaySize(MAKIRA_FAMILIAR_SIZE * 2, MAKIRA_FAMILIAR_SIZE * 2)
            .setCollideWorldBounds(true) // ★ ワールド境界と衝突
            .setBounceX(1)               // ★ X方向(左右)に反射
            .setImmovable(true);         // ★ 他からの影響を受けないように

        if (familiarLeft.body) {
            familiarLeft.body.setAllowGravity(false); // 重力無効
            familiarLeft.setVelocityX(-FAMILIAR_MOVE_SPEED_X); // ★ 左へ移動開始
            familiarLeft.body.onWorldBounds = true; // ★ 境界衝突イベント有効化 (もし必要ならSE再生などに使える)
        } else { console.error("Failed to create familiarLeft body!"); if(familiarLeft) familiarLeft.destroy(); }

        // 右の子機
        const familiarRight = this.familiars.create(paddleX + MAKIRA_FAMILIAR_OFFSET, familiarY, 'joykun')
            .setDisplaySize(MAKIRA_FAMILIAR_SIZE * 2, MAKIRA_FAMILIAR_SIZE * 2)
            .setCollideWorldBounds(true)
            .setBounceX(1)
            .setImmovable(true);

        if (familiarRight.body) {
            familiarRight.body.setAllowGravity(false);
            familiarRight.setVelocityX(FAMILIAR_MOVE_SPEED_X); // ★ 右へ移動開始
            familiarRight.body.onWorldBounds = true;
        } else { console.error("Failed to create familiarRight body!"); if(familiarRight) familiarRight.destroy(); }

        console.log(`Physics familiars created. Count: ${this.familiars.getLength()}`);
    } catch (e) {
        console.error("Error creating/setting up physics familiars:", e);
    }
}


fireMakiraBeam() {
    if (!this.isMakiraActive || !this.familiars || this.familiars.countActive(true) === 0 || this.isGameOver || this.bossDefeated) return;
    // SEは無しでOK

    this.familiars.getChildren().forEach(familiar => {
        if (familiar.active) {
            const beam = this.makiraBeams.create(familiar.x, familiar.y - MAKIRA_FAMILIAR_SIZE, 'whitePixel') // 定数が必要
                .setDisplaySize(MAKIRA_BEAM_WIDTH, MAKIRA_BEAM_HEIGHT).setTint(MAKIRA_BEAM_COLOR); // 定数が必要
            if (beam && beam.body) {
                beam.setVelocity(0, -MAKIRA_BEAM_SPEED); // 定数が必要
                beam.body.setAllowGravity(false);
                 // ★ ビームとボスの衝突判定を設定する必要あり ★
                 //    setColliders内か、ここで毎回設定するか
                 this.physics.add.overlap(beam, this.boss, this.hitBossWithMakiraBeam, (theBeam, boss) => !boss.getData('isInvulnerable'), this); // 例
            } else { if (beam) beam.destroy(); }
        }
    });
}

// ★ マキラビームがボスに当たった時の処理 (新規追加)
hitBossWithMakiraBeam(beam, boss) {
     if (!beam || !boss || !beam.active || !boss.active || boss.getData('isInvulnerable')) return;
     console.log("Makira beam hit boss!");
     beam.destroy(); // ビームは消える
     this.applyBossDamage(boss, 1, "Makira Beam"); // ダメージ1を与える
}
     
    // ★ applyBossDamage メソッド (新規追加 - hitBossを汎用化)
    applyBossDamage(boss, damage, source = "Unknown") {
        if (!boss || !boss.active || boss.getData('isInvulnerable')) {
             console.log(`Damage (${damage} from ${source}) blocked: Boss inactive or invulnerable.`);
             return;
        }
         let currentHealth = boss.getData('health');
         currentHealth -= damage;
         boss.setData('health', currentHealth);
         console.log(`[Boss Damage] ${damage} damage dealt by ${source}. Boss health: ${currentHealth}/${boss.getData('maxHealth')}`);
         // ダメージリアクション
         boss.setTint(0xff0000); boss.setData('isInvulnerable', true);
         const shakeDuration = 60; const shakeAmount = boss.displayWidth * 0.03;
         this.tweens.add({ targets: boss, props: { x: { value: `+=${shakeAmount}`, duration: shakeDuration / 4, yoyo: true, ease: 'Sine.InOut' } }, repeat: 1 });
         // try { this.sound.add('seBossHit').play(); } catch(e) {}
         this.time.delayedCall(150, () => { if (boss.active) { boss.clearTint(); boss.setData('isInvulnerable', false); } });
         // 体力ゼロ判定
         if (currentHealth <= 0) { this.defeatBoss(boss); }
    }


    // --- ▲ パワーアップ効果管理ヘルパー ▲ ---


    // --- ▼ 速度変更ヘルパー (GameSceneから移植) ▼ ---
    applySpeedModifier(ball, type) {
        if (!ball || !ball.active || !ball.body) return;
        const modifier = BALL_SPEED_MODIFIERS[type];
        if (!modifier) return;
        const currentVelocity = ball.body.velocity;
        const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
        const newSpeed = NORMAL_BALL_SPEED * modifier;
        ball.setVelocity(direction.x * newSpeed, direction.y * newSpeed);
         console.log(`Applied speed modifier ${modifier} for ${type}`);
         this.setBallPowerUpState(type === POWERUP_TYPES.SHATORA ? 'isFast' : 'isSlow', true); // 状態フラグ設定
    }

    resetBallSpeed(ball) {
        if (!ball || !ball.active || !ball.body) return;
        console.log("Resetting ball speed...");
         // isFast/isSlow フラグをボールデータに持たせる必要がある
         // this.setBallPowerUpState('isFast', false); // 仮
         // this.setBallPowerUpState('isSlow', false); // 仮
         // if (ball.getData('isFast')) ... else if (ball.getData('isSlow')) ... else ...
         // GameSceneの実装を参照し、ボールのdataに必要なフラグを追加する必要あり
         // → 簡略化のため、一旦単純にNORMAL_BALL_SPEEDに戻す
         const currentVelocity = ball.body.velocity;
         const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
         ball.setVelocity(direction.x * NORMAL_BALL_SPEED, direction.y * NORMAL_BALL_SPEED);
          console.log("Ball speed reset to normal.");
    }
    // --- ▲ 速度変更ヘルパー ▲ ---


    // ... (他のメソッド: hitBoss, hitOrbiter(削除済), defeatBoss など) ...

    /*hitAttackBrick(brick, ball) {
        if (!brick || !brick.active || !ball || !ball.active) return;
      //  console.log(`[hitAttackBrick] Current chaosSettings.count: ${this.chaosSettings?.count}`);
      //  console.log("Attack brick hit by ball!");
        const brickX = brick.x; const brickY = brick.y; const brickColor = brick.tintTopLeft;
        // エフェクト & SE
        try { /* ...パーティクル... */ } catch (e) { /*...*/ }
        try { this.sound.add(AUDIO_KEYS.SE_DESTROY).play(); } catch (e) { /*...*/ }
        brick.destroy(); // 先にブロックを破壊

        // ★★★ ヴァジラゲージ増加処理を追加 ★★★
        this.increaseVajraGauge(); // 攻撃ブロック破壊でゲージ増加

        // --- ▼ アイテムドロップ判定 (バイシュラヴァ特別判定追加) ▼ ---
        const dropRate = this.chaosSettings?.rate ?? ATTACK_BRICK_ITEM_DROP_RATE;

        // 1. まずバイシュラヴァが特別にドロップするか判定 (GameSceneと同じ定数を使用)
        if (Phaser.Math.FloatBetween(0, 1) < BAISRAVA_DROP_RATE) {
            console.log("[Drop Logic] Baisrava special drop!");
            this.dropSpecificPowerUp(brickX, brickY, POWERUP_TYPES.BAISRAVA);
        }
        // 2. バイシュラヴァが出なかった場合、通常のドロップ判定を行う
        else if (Phaser.Math.FloatBetween(0, 1) < dropRate) {
             console.log(`[Drop Logic] Checking drop against rate: ${dropRate.toFixed(2)}`);
             if (this.bossDropPool && this.bossDropPool.length > 0) {
                 // ★ バイシュラヴァを除いたプールから選ぶ (任意) ★
                 //    これにより、特別ドロップ以外ではバイシュラヴァが出なくなる
                 const poolWithoutBaisrava = this.bossDropPool.filter(type => type !== POWERUP_TYPES.BAISRAVA);
                 if (poolWithoutBaisrava.length > 0) {
                     const dropType = Phaser.Utils.Array.GetRandom(poolWithoutBaisrava);
                     console.log(`[Drop Logic] Dropping item: ${dropType} (From pool excluding Baisrava)`);
                     this.dropSpecificPowerUp(brickX, brickY, dropType);
                 } else {
                      console.log("Drop pool only contained Baisrava, nothing else to drop.");
                 }
             } else { console.log("No items in boss drop pool."); }
        } else {
             console.log("[Drop Logic] No item drop based on rate.");
        }
        
        // --- ▲ アイテムドロップ判定 (バイシュラヴァ特別判定追加) ▲ ---

        // --- ▼ ボール速度を維持/再設定 ▼ ---
        if (ball.body) { // ボディがあるか確認
            let speedMultiplier = 1.0;
            const isFast = ball.getData('isFast') === true;
            const isSlow = ball.getData('isSlow') === true;
            if (isFast) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA];
            else if (isSlow) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];
            const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier;

            // 現在の速度ベクトルを維持しつつ、速度だけ再設定
            const currentVelocity = ball.body.velocity;
            if (currentVelocity.lengthSq() > 0) { // 速度が0でない場合
                currentVelocity.normalize().scale(targetSpeed); // 方向を維持して速度を適用
                ball.setVelocity(currentVelocity.x, currentVelocity.y);
                console.log(`[hitAttackBrick] Ball speed reset to targetSpeed: ${targetSpeed.toFixed(0)}`);
            } else {
                 console.warn("[hitAttackBrick] Ball velocity was zero, cannot normalize.");
                 // 速度ゼロの場合はデフォルトで上向きに飛ばすなど検討
                 ball.setVelocity(0, -targetSpeed);
            }
        }
        // --- ▲ ボール速度を維持/再設定 ▲ ---

    }


    // --- ▼ ヴァジラ関連メソッド (GameSceneから移植・調整) ▼ ---
    activateVajra() {
        if (!this.isVajraSystemActive) {
            console.log("[BossScene] Activating Vajra system.");
            this.isVajraSystemActive = true; // ★ フラグを立てる
            this.vajraGauge = 0;              // ★ ゲージリセット
            // ▼▼▼ UISceneに通知 ▼▼▼
            if(this.uiScene?.scene.isActive()) {
                this.events.emit('activateVajraUI', this.vajraGauge, VAJRA_GAUGE_MAX);
            } else { console.warn("Vajra activated, but UIScene not ready."); }
            // ▲▲▲ UISceneに通知 ▲▲▲
            // ボールに状態付与 (アイコン表示用)
            this.setBallPowerUpState(POWERUP_TYPES.VAJRA, true);
            this.updateBallAndPaddleAppearance(); // 見た目更新
        } else {
             console.log("[BossScene] Vajra system already active."); // 既に有効な場合
             // 既に有効な場合はゲージをリセットする？ or 何もしない？ -> 今回は何もしない
        }
    }

    // increaseVajraGauge メソッド (追加)
    increaseVajraGauge() {
        // ★ ゲージシステムが有効で、ゲームが進行中の場合のみ増加
        if (this.isVajraSystemActive && !this.isGameOver && !this.bossDefeated) {
            this.vajraGauge += VAJRA_GAUGE_INCREMENT; // 定数で増加
            this.vajraGauge = Math.min(this.vajraGauge, VAJRA_GAUGE_MAX); // 上限チェック
            console.log(`[Vajra Gauge] Increased to ${this.vajraGauge}/${VAJRA_GAUGE_MAX}`);

            // ▼▼▼ UISceneに通知 ▼▼▼
            if(this.uiScene?.scene.isActive()) {
                this.events.emit('updateVajraGauge', this.vajraGauge);
            }
            // ▲▲▲ UISceneに通知 ▲▲▲

            // ★ ゲージMAX判定 ★
            if (this.vajraGauge >= VAJRA_GAUGE_MAX) {
                console.log("[Vajra Gauge] MAX! Triggering Ougi!");
                this.triggerVajraDestroy(); // 奥義発動
            }
        }
    }

    // triggerVajraDestroy メソッド (ダメージ値修正)
    triggerVajraDestroy() {
        if (!this.isVajraSystemActive) return; // 発動状態でなければ何もしない
        console.log("[BossScene] Triggering Vajra destroy (Boss Damage: 10)."); // ダメージ明記
        this.isVajraSystemActive = false; // 発動したらゲージシステム終了

        // ▼▼▼ UISceneに通知 ▼▼▼
        if(this.uiScene?.scene.isActive()) {
            this.events.emit('deactivateVajraUI');
        }
        // ▲▲▲ UISceneに通知 ▲▲▲

        // ボール状態解除 (アイコン戻すなど)
        this.setBallPowerUpState(POWERUP_TYPES.VAJRA, false);
        this.updateBallAndPaddleAppearance();

        // ボイス・SE再生
        try { this.sound.add(AUDIO_KEYS.VOICE_VAJRA_TRIGGER).play(); } catch (e) { console.error("Error playing VOICE_VAJRA_TRIGGER:", e); }
        // try { this.sound.add(AUDIO_KEYS.SE_VAJRA_TRIGGER).play(); } catch (e) { console.error("Error playing SE_VAJRA_TRIGGER:", e); } // SEは任意

        // ボスに10ダメージ
        if (this.boss && this.boss.active) {
            this.applyBossDamage(this.boss, 10, "Vajra Ougi"); // ★ ダメージを10に変更
        } else {
             console.log("Vajra Ougi triggered, but boss is inactive.");
        }
    }
    // --- ▲ ヴァジラ関連メソッド ▲ ---


// BossScene.js の create ヘルパー

// BossScene.js 内
createMakiraGroups() {
    console.log("Creating Makira groups (familiars as physics group)..."); // ログ変更
    if (this.familiars) { this.familiars.destroy(true); this.familiars = null; }
    // ★★★ ファミリアを物理グループにする ★★★
    this.familiars = this.physics.add.group(); // physics.add.group() に変更
    if (this.makiraBeams) { this.makiraBeams.destroy(true); this.makiraBeams = null; }
    this.makiraBeams = this.physics.add.group(); // ビームは物理のまま
    console.log("Makira groups created (familiars as physics).");
}


    

    //* --- ▼ ボスの動きメソッド ▼ ---
   /* startBossMovement() {
        if (!this.boss || !this.boss.active) { console.warn("Cannot start movement, boss not ready."); return; }
        if (this.bossMoveTween) { this.bossMoveTween.stop(); this.bossMoveTween = null; }

        console.log("Starting simple boss horizontal movement tween...");
        const moveWidth = this.gameWidth * BOSS_MOVE_RANGE_X_RATIO / 2;
        const leftX = this.gameWidth / 2 - moveWidth;
        const rightX = this.gameWidth / 2 + moveWidth;

        this.bossMoveTween = this.tweens.add({
            targets: this.boss,
            x: rightX,
            duration: BOSS_MOVE_DURATION,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: 500
        });
        console.log("Simple boss movement tween started.");
    }*/
    // --- ▲ ボスの動きメソッド 元に戻す用▲ ---*/

// BossScene.js の startBossMovement メソッド (中央開始 - Tween連結方式)

startBossMovement() {
    if (!this.boss || !this.boss.active) { console.warn("Cannot start movement, boss not ready."); return; }
    // 既存のTweenがあれば停止・削除
    if (this.bossMoveTween) {
         if (this.tweens.getTweensOf(this.boss).length > 0) { // 念のため対象のTweenか確認
             this.tweens.killTweensOf(this.boss); // 対象オブジェクトのTweenを全て停止・削除
         }
        this.bossMoveTween = null;
    }

   // console.log("Starting boss horizontal movement (Center Start - Chained Tweens)...");
    const moveWidth = this.gameWidth * BOSS_MOVE_RANGE_X_RATIO / 2;
    const leftX = this.gameWidth / 2 - moveWidth;
    const rightX = this.gameWidth / 2 + moveWidth;
    const startX = this.gameWidth / 2; // 開始位置

    this.boss.setX(startX); // 初期位置を中央に

    // ★ 利用するイージング関数の名前リスト
    const easeFunctions = [
        'Sine.easeInOut',
        'Quad.easeInOut',
        'Cubic.easeInOut',
        'Quart.easeInOut', // Sineより急→緩やか→急
        'Expo.easeInOut',  // 最初と最後が非常に急 (サッピタッに近い)
        'Circ.easeInOut'   // 円曲線的な滑らかさ
    ];

    const moveToRight = () => {
        const randomEase = Phaser.Utils.Array.GetRandom(easeFunctions); // ★ ランダム選択
      //  console.log(`Tween: Moving to Right (Ease: ${randomEase})`);
        this.bossMoveTween = this.tweens.add({
            targets: this.boss,
            x: rightX,
            duration: BOSS_MOVE_DURATION,
            ease: randomEase, // ★ ランダムなEaseを適用
            onComplete: () => {
                if (this.boss?.active && !this.isGameOver && !this.bossDefeated) {
                    moveToLeft();
                }
            }
        });
    };

    const moveToLeft = () => {
        const randomEase = Phaser.Utils.Array.GetRandom(easeFunctions); // ★ ランダム選択
     //   console.log(`Tween: Moving to Left (Ease: ${randomEase})`);
        this.bossMoveTween = this.tweens.add({
            targets: this.boss,
            x: leftX,
            duration: BOSS_MOVE_DURATION,
            ease: randomEase, // ★ ランダムなEaseを適用
            onComplete: () => {
                 if (this.boss?.active && !this.isGameOver && !this.bossDefeated) {
                    moveToRight();
                }
            }
        });
    };

    moveToRight(); // 開始
  //  console.log("Chained boss movement tweens with random ease initiated.");
}

// --- ▼ 残像エミッタ設定メソッド (新規追加) ▼ ---
setupAfterImageEmitter() {
    if (this.bossAfterImageEmitter) { this.bossAfterImageEmitter.destroy(); } // 既存があれば破棄

    this.bossAfterImageEmitter = this.add.particles(0, 0, 'whitePixel', { // ★ whitePixel を使う
        // frame: 'bossStand', // 画像を使う場合はフレーム指定
        x: { min: -5, max: 5 }, // X座標を少しばらつかせる
        y: { min: -5, max: 5 }, // Y座標を少しばらつかせる
        lifespan: 1000, // 短い寿命 (ms)
        speed: 0, // 速度は不要 (その場に残る)
        scale: { start: this.boss.scale * 0.8, end: 0 }, // ★ ボスのスケールに合わせて開始、小さくなって消える
        alpha: { start: 0.8, end: 0 }, // 半透明で開始し、消える
        quantity: 3, // 一度に1つ放出
        frequency: 10, // 放出頻度 (ms) - 小さいほど頻繁
        blendMode: 'NORMAL', // NORMALかADDかお好みで
        tint: 0xfffff, // ★ 残像の色 (例: 少し暗い白、ボスの色に合わせても良い)
        emitting: false // ★ updateで追従させるので最初は止めておく
    });
    this.bossAfterImageEmitter.setDepth(this.boss.depth - 1); // ボスより後ろに表示
    console.log("After image emitter created.");
}
// --- ▲ 残像エミッタ設定メソッド ▲ ---


update(time, delta) {
    if (this.isGameOver || this.bossDefeated) {
         // ゲーム終了時は残像エミッタを停止
         if (this.bossAfterImageEmitter && this.bossAfterImageEmitter.emitting) {
             this.bossAfterImageEmitter.stop();
         }
        return;
    }

    // --- ▼ 残像エミッタの位置追従 & 強制放出 (デバッグ用) ▼ ---
    if (this.bossAfterImageEmitter && this.boss && this.boss.active) {
        // 位置を常にボスに合わせる
        this.bossAfterImageEmitter.setPosition(this.boss.x, this.boss.y);

        // ★★★ デバッグのため、常にエミッタを開始してみる ★★★
        if (!this.bossAfterImageEmitter.emitting) {
             console.log("[DEBUG AfterImage] Force starting emitter in update.");
             this.bossAfterImageEmitter.start();
        }
        // --- ▲ 速度チェックを外して、常にstart()を試みる ---
    } else {
         // オブジェクトが存在しない場合のログ (デバッグ用)
         // if (!this.bossAfterImageEmitter) console.warn("[AfterImage Update] Emitter not ready.");
         // if (!this.boss) console.warn("[AfterImage Update] Boss not ready.");
    }
    // --- ▲ 残像エミッタの位置追従 & 強制放出 (デバッグ用) ▲ ---
    this.updateBallFall();
    this.updateAttackBricks();
    // updateOrbiters は削除済み
}


    // --- ▼ 当たり判定・ダメージ処理など ▼ ---
    setColliders() {
        console.log("[BossScene] Setting colliders (No Orbiters)...");
        // 既存コライダー破棄
        this.safeDestroy(this.ballPaddleCollider, "ballPaddleCollider");
        this.safeDestroy(this.ballBossCollider, "ballBossCollider");
        // this.safeDestroy(this.ballOrbiterCollider, "ballOrbiterCollider"); // 削除
        this.safeDestroy(this.ballAttackBrickCollider, "ballAttackBrickCollider",
        "paddlePowerUpOverlap"); // ★ 追加

        // ボール vs パドル
        if (this.paddle && this.balls) { this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this); }
        else { console.warn("Cannot set Ball-Paddle collider."); }

        // ボール vs ボス本体
        if (this.boss && this.balls) { this.ballBossCollider = this.physics.add.collider(this.boss, this.balls, this.hitBoss, (boss, ball) => !boss.getData('isInvulnerable'), this); }
        else { console.warn("Cannot set Ball-Boss collider."); }

        this.safeDestroy(this.makiraBeamBossOverlap, "makiraBeamBossOverlap"); // 参照追加

         // ★ マキラビーム vs ボス (fireMakiraBeam内でoverlap設定するなら不要かも？)
         // if (this.makiraBeams && this.boss) {
         //     this.makiraBeamBossOverlap = this.physics.add.overlap(this.makiraBeams, this.boss, this.hitBossWithMakiraBeam, (beam, boss) => !boss.getData('isInvulnerable'), this);
         // }

         // ★ (オプション) マキラビーム vs 攻撃ブロック の判定も追加？

        // ★★★ ボール vs 攻撃ブロック ★★★
        this.safeDestroy(this.ballAttackBrickCollider, "ballAttackBrickCollider"); // 既存を破棄
        if (this.attackBricks && this.balls) {
            this.ballAttackBrickCollider = this.physics.add.collider(
                this.attackBricks,
                this.balls,
                this.hitAttackBrick, // 衝突時のコールバック
                null, // processCallback は不要
                this
            );
            console.log("[BossScene] Ball-AttackBrick collider added.");
        } else { console.warn("[BossScene] Cannot set Ball-AttackBrick collider."); }
    // ★★★ パドル vs パワーアップアイテム (Overlap) ★★★
    if (this.paddle && this.powerUps) {
        this.paddlePowerUpOverlap = this.physics.add.overlap(
            this.paddle,
            this.powerUps,
            this.collectPowerUp, // ★ アイテム取得処理
            null,
            this
        );
        console.log("[BossScene] Paddle-PowerUp overlap added.");
   } else { console.warn("[BossScene] Cannot set Paddle-PowerUp overlap."); }
}
// --- ▲ setColliders メソッド修正 ▲ ---

    

    // BossScene.js 内

    // --- ▼ hitPaddle メソッド (速度計算修正) ▼ ---
    hitPaddle(paddle, ball) {
        if (!paddle || !ball || !ball.active || !ball.body) return;
        console.log("[BossScene] Ball hit paddle.");

        // --- 反射角度計算 ---
        let diff = ball.x - paddle.x;
        const maxDiff = paddle.displayWidth / 2;
        let influence = diff / maxDiff;
        influence = Phaser.Math.Clamp(influence, -1, 1);
        const maxVx = NORMAL_BALL_SPEED * 0.8; // X方向の最大速度成分
        let newVx = maxVx * influence;
        const minVy = NORMAL_BALL_SPEED * 0.5; // Y方向の最低速度
        let currentVy = ball.body.velocity.y;
        let newVy = -Math.abs(currentVy); // 必ず上向きに
        if (Math.abs(newVy) < minVy) newVy = -minVy; // 最低速度保証

        // --- ▼ 速度設定 (パワーアップ考慮) ▼ ---
        let speedMultiplier = 1.0; // 通常速度倍率
        const isFast = ball.getData('isFast') === true; // シャトラ状態か (明確にtrueか比較)
        const isSlow = ball.getData('isSlow') === true; // ハイラ状態か (明確にtrueか比較)

        if (isFast) {
            speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA];
            console.log("[hitPaddle] Shatora active, applying speed multiplier:", speedMultiplier);
        } else if (isSlow) {
            speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];
            console.log("[hitPaddle] Haila active, applying speed multiplier:", speedMultiplier);
        } else {
            console.log("[hitPaddle] Normal speed.");
        }
        const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier; // ★ 目標速度を計算

        const newVelocity = new Phaser.Math.Vector2(newVx, newVy);
        if (newVelocity.lengthSq() === 0) { newVelocity.set(0, -1); } // ゼロベクトル回避
        newVelocity.normalize().scale(targetSpeed); // ★ 計算した目標速度で設定

        console.log(`[hitPaddle] Setting velocity to (${newVelocity.x.toFixed(2)}, ${newVelocity.y.toFixed(2)}) with targetSpeed ${targetSpeed.toFixed(0)}`);
        ball.setVelocity(newVelocity.x, newVelocity.y);
        // --- ▲ 速度設定 (パワーアップ考慮) ▲ ---


        // --- SE再生 ---
        try { this.sound.add(AUDIO_KEYS.SE_REFLECT).play(); } catch (e) { console.error("Error playing SE_REFLECT (paddle):", e); }

        // --- パドルヒットエフェクト ---
        try {
            const impactPointY = ball.y + BALL_RADIUS * 0.8;
            const impactPointX = ball.x;
            const particles = this.add.particles(0, 0, 'whitePixel', { x: impactPointX, y: impactPointY, lifespan: 150, speed: { min: 100, max: 200 }, angle: { min: 240, max: 300 }, gravityY: 300, scale: { start: 0.4, end: 0 }, quantity: 5, blendMode: 'ADD', emitting: false });
            if(particles) { particles.setParticleTint(0xffffcc); particles.explode(5); this.time.delayedCall(200, () => { if (particles && particles.scene) particles.destroy(); }); }
        } catch (e) { console.error("Error creating paddle hit particle effect:", e); }

        // ★ パドルヒットで解除される効果があればここで処理 ★
        // 例: if (ball.getData('isIndaraActive')) { this.deactivateIndaraForBall(ball); }
    }
    // --- ▲ hitPaddle メソッド ▲ ---


    // --- ▼ hitBoss メソッド (ボール跳ね返し処理追加) ▼ ---
    hitBoss(boss, ball) {
        if (!boss || !ball || !boss.active || !ball.active || boss.getData('isInvulnerable')) return;
        console.log("[hitBoss] Boss hit by ball.");
        // ★★★ 衝突時のボールデータをログ出力 ★★★
        console.log('[hitBoss] Ball data at impact:', ball.data?.getAll());

        let damage = 1;
        const lastPower = ball.getData('lastActivatedPower');
        const isBikara = lastPower === POWERUP_TYPES.BIKARA;
        const bikaraState = ball.getData('bikaraState');
        const isKubiraActive = ball.getData('isKubiraActive') === true;
        console.log('[hitBoss] Checking isKubiraActive:', isKubiraActive); // ★ isKubiraActive の値確認

        // --- ▼ ダメージ計算ロジック (省略なし) ▼ ---
        if (isBikara && bikaraState === 'yang') {
            // ビカラ陽が最優先で基本ダメージ2
            damage = 2;
            if (isKubiraActive) {
                damage += 1; // クビラ重複なら+1で計3
                console.log("[hitBoss] Bikara Yang + Kubira hit! Calculated Damage: 3");
            } else {
                console.log("[hitBoss] Bikara Yang hit! Calculated Damage: 2");
            }
        } else if (isKubiraActive) {
            // 次にクビラをチェック、基本ダメージ1に+1して2にする
            damage += 1;
            console.log("[hitBoss] Kubira hit! Calculated Damage: 2");
        } else if (isBikara && bikaraState === 'yin') {
             // 次にビカラ陰、基本ダメージ1のまま
             console.log("[hitBoss] Bikara Yin hit. Calculated Damage: 1");
        } else {
            // それ以外（通常ヒット）も基本ダメージ1
            console.log(`[hitBoss] Normal hit. Calculated Damage: ${damage}`); // damage は初期値 1
        }
        // --- ▲ ダメージ計算ロジック (省略なし) ▲ ---

        console.log(`[hitBoss] Final calculated damage before applying: ${damage}`); // ★適用直前の最終ダメージ確認ログ
        this.applyBossDamage(boss, damage, "Ball Hit"); // 計算されたダメージを適用
        // --- ▼ ボール跳ね返し処理 (パワーアップ考慮) ▼ ---
        if (ball && ball.active && ball.body) { // ボールがまだ有効か確認
             console.log("[hitBoss] Calculating ball reflection velocity...");
             let speedMultiplier = 1.0;
             const isFast = ball.getData('isFast') === true; // isFast状態取得
             const isSlow = ball.getData('isSlow') === true; // isSlow状態取得
             if (isFast) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA];
             else if (isSlow) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];
             const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier;

             // 跳ね返る方向 (単純にY方向反転)
             let bounceVx = ball.body.velocity.x;
             let bounceVy = -ball.body.velocity.y; // Y速度を反転
             // 最低速度保証 (跳ね返りが弱すぎないように)
             const minBounceSpeedY = NORMAL_BALL_SPEED * 0.3;
             if(Math.abs(bounceVy) < minBounceSpeedY) {
                 bounceVy = -minBounceSpeedY * Math.sign(bounceVy || -1); // 方向を維持しつつ最低速度に
             }

             const bounceVel = new Phaser.Math.Vector2(bounceVx, bounceVy).normalize().scale(targetSpeed);
             console.log(`[hitBoss] Reflecting ball with velocity (${bounceVel.x.toFixed(2)}, ${bounceVel.y.toFixed(2)}) targetSpeed: ${targetSpeed.toFixed(0)}`);
             ball.setVelocity(bounceVel.x, bounceVel.y);
         }
        // --- ▲ ボール跳ね返し処理 ▲ ---

        // 体力ゼロ判定は applyBossDamage 内で行われる
    }
    // --- ▲ hitBoss メソッド ▲ ---


    // --- ▼ applyBossDamage メソッド (変更なし) ▼ ---
    applyBossDamage(boss, damage, source = "Unknown") {
        if (!boss || !boss.active || boss.getData('isInvulnerable')) {
             console.log(`Damage (${damage} from ${source}) blocked: Boss inactive or invulnerable.`);
             return;
        }
        let currentHealth = boss.getData('health') - damage;
        boss.setData('health', currentHealth);
        console.log(`[Boss Damage] ${damage} damage dealt by ${source}. Boss health: ${currentHealth}/${boss.getData('maxHealth')}`);
        // ダメージリアクション (Tint, 無敵, 揺れ)
        boss.setTint(0xff0000);
        boss.setData('isInvulnerable', true);
        const shakeDuration = 60;
        const shakeAmount = boss.displayWidth * 0.03;
        try {
            this.tweens.add({ targets: boss, props: { x: { value: `+=${shakeAmount}`, duration: shakeDuration / 4, yoyo: true, ease: 'Sine.InOut' } }, repeat: 1 });
        } catch (e) { console.error("[applyBossDamage] Error creating shake tween:", e); }
        // try { this.sound.add('seBossHit').play(); } catch(e) {}
        this.time.delayedCall(150, () => { if (boss.active) { boss.clearTint(); boss.setData('isInvulnerable', false); } });
        // 体力ゼロ判定
        if (currentHealth <= 0) { this.defeatBoss(boss); }
    }
    // --- ▲ applyBossDamage メソッド ▲ ---
    // --- ▼ 攻撃ブロック衝突処理メソッド (実装) ▼ ---
    hitAttackBrick(brick, ball) {
        if (!brick || !brick.active || !ball || !ball.active) return;
         // ★★★ chaosSettings の値をログに出力 ★★★
    console.log(`[hitAttackBrick] Current chaosSettings.count: ${this.chaosSettings?.count}`);
    // ★★★ chaosSettings の値をログに出力 ★★★

       // console.log("Attack brick hit by ball!");

        const brickX = brick.x;
        const brickY = brick.y;
        const brickColor = brick.tintTopLeft; // Tintから色を取得 (whitePixelの場合)

        // --- 破壊エフェクト (GameScene流用) ---
        try {
            const particles = this.add.particles(0, 0, 'whitePixel', {
                frame: 0, x: brickX, y: brickY, lifespan: 500, speed: { min: 80, max: 150 },
                angle: { min: 0, max: 360 }, gravityY: 100, scale: { start: 0.7, end: 0 },
                quantity: 12, blendMode: 'NORMAL', emitting: false
            });
           if(particles) { particles.setParticleTint(brickColor || 0xcccccc); particles.explode(12); this.time.delayedCall(600, () => { if(particles.scene) particles.destroy();});}
        } catch (e) { console.error("Error creating attack brick destroy effect:", e); }

        // --- 破壊SE (GameScene流用) ---
        try {
            this.sound.add(AUDIO_KEYS.SE_DESTROY).play();
             console.log("SE_DESTROY playback attempted for attack brick.");
        } catch (e) { console.error("Error playing SE_DESTROY:", e); }

        // --- ブロックを破壊 ---
        brick.destroy(); // destroy() はグループからも削除する

        // ★★★ ヴァジラゲージ増加処理を追加 ★★★
        this.increaseVajraGauge(); // 攻撃ブロック破壊でゲージ増加

        // --- ▼ アイテムドロップ判定 (ドロップ率を chaosSettings から取得) ▼ ---
        // ★ 固定値ではなく this.chaosSettings.rate を使う ★
        const dropRate = this.chaosSettings?.rate ?? ATTACK_BRICK_ITEM_DROP_RATE; // 安全に取得 (なければ定数をフォールバック)
        console.log(`[Drop Logic] Checking drop against rate: ${dropRate.toFixed(2)}`); // 現在のレートをログ表示

        if (Phaser.Math.FloatBetween(0, 1) < dropRate) { // ★ dropRate で判定

            if (this.bossDropPool && this.bossDropPool.length > 0) {
                const dropType = Phaser.Utils.Array.GetRandom(this.bossDropPool);
                console.log(`[Drop Logic] Dropping item: ${dropType} (From fixed pool: [${this.bossDropPool.join(',')}])`);
                this.dropSpecificPowerUp(brick.x, brick.y, dropType);
            } else {
                 console.log("No items in boss drop pool.");
            }
        } else {
             console.log("[Drop Logic] No item drop based on rate."); // ドロップしなかった場合のログ
        }
        // --- ▲ アイテムドロップ判定 (ドロップ率を chaosSettings から取得) ▲ ---
    }
    // --- ▲ hitAttackBrick メソッド修正 ▲ ---


    // --- ▼ アイテムドロップメソッド (GameSceneから移植・修正) ▼ ---
 /*   dropSpecificPowerUp(x, y, type) {
        if (!type) { console.warn("Attempted to drop powerup with no type."); return; }
        if (!this.powerUps) { console.error("PowerUps group does not exist!"); return; } // グループ確認

        let textureKey = POWERUP_ICON_KEYS[type] || 'whitePixel';
        let displaySize = POWERUP_SIZE;
        let tintColor = null;
        if (textureKey === 'whitePixel') { tintColor = (type === POWERUP_TYPES.BAISRAVA) ? 0xffd700 : 0xcccccc; } // BAISRAVA特別対応

        console.log(`[BossScene] Dropping power up ${type} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        try {
            const powerUp = this.powerUps.create(x, y, textureKey);
            if (powerUp) {
                powerUp.setDisplaySize(displaySize, displaySize).setData('type', type);
                if (tintColor !== null) { powerUp.setTint(tintColor); }
                else { powerUp.clearTint(); }
                if (powerUp.body) {
                    powerUp.setVelocity(0, POWERUP_SPEED_Y);
                    powerUp.body.setCollideWorldBounds(false);
                    powerUp.body.setAllowGravity(false);
                } else { powerUp.destroy(); console.error("No body for powerup!"); }
            } else { console.error("Failed to create powerup object!"); }
        } catch (e) { console.error("CRITICAL Error in dropSpecificPowerUp:", e); }
    }
    // --- ▲ アイテムドロップメソッド ▲ ---


    // --- ▼ アイテム取得メソッド (GameSceneから移植・ボス戦用に調整) ▼ ---
    collectPowerUp(paddle, powerUp) {
        if (!powerUp || !powerUp.active || this.isGameOver || this.bossDefeated) return;
        const type = powerUp.getData('type');
        if (!type) { powerUp.destroy(); return; }

        console.log(`[BossScene] Collected power up: ${type}`);
        powerUp.destroy();

        // ボイス再生 (GameScene流用)
        const voiceKeyBase = `voice_${type}`; const upperCaseKey = voiceKeyBase.toUpperCase();
        let actualAudioKey = AUDIO_KEYS[upperCaseKey]; if (type === POWERUP_TYPES.VAJRA) actualAudioKey = AUDIO_KEYS.VOICE_VAJRA_GET;
        const now = this.time.now; const lastPlayed = this.lastPlayedVoiceTime[upperCaseKey] || 0;
        if (actualAudioKey && (now - lastPlayed > this.voiceThrottleTime)) {
            try { this.sound.play(actualAudioKey); this.lastPlayedVoiceTime[upperCaseKey] = now; }
            catch (e) { console.error(`Error playing voice ${actualAudioKey}:`, e); }
        } else if (!actualAudioKey) {/*console.warn(`Voice key ${upperCaseKey} not found.`);}
        else { console.log(`Voice ${upperCaseKey} throttled.`); }

        // ★★★ ボス戦でのパワーアップ効果 ★★★
        // GameScene の activatePower は複雑すぎるので、ボス戦専用の効果にするか、
        // 必要なものだけを限定的に実装するのがおすすめ。
        // 例：単純な効果のみ有効にする
        switch (type) {
            case POWERUP_TYPES.KUBIRA:
                // ボス戦でクビラ貫通を有効にする？ (ダメージ2になるだけ？)
                // this.activateTemporaryPower(type, 5000); // 例: 5秒間だけ有効化
                console.log("Kubira effect (Boss fight) - currently no effect");
                break;
            case POWERUP_TYPES.SHATORA:
                 // ボス戦でボール加速？
                 // this.activateTemporaryPower(type, 3000);
                 console.log("Shatora effect (Boss fight) - currently no effect");
                 break;
             // 他のパワーアップも同様に、ボス戦での効果を定義・実装
            default:
                console.log(`Power up ${type} collected, no specific effect in boss fight yet.`);
                break;
        }
    }*/
    // ★ (オプション) 一時的なパワーアップ有効化メソッド (もし必要なら)
    // activateTemporaryPower(type, duration) { ... }*/
    // --- ▲ アイテム取得メソッド ▲ ---*/

    defeatBoss(boss) {
        if (this.bossDefeated) return;
        console.log("[defeatBoss] Boss defeated!");
        this.bossDefeated = true;
        if (this.bossMoveTween) { this.bossMoveTween.stop(); }
        // ★ 撃破演出実装
        boss.disableBody(true, true);
        this.score += BOSS_SCORE;
         // ▼▼▼ UI更新イベントを発行 ▼▼▼
         this.events.emit('updateScore', this.score);
         // ▲▲▲ UI更新イベントを発行 ▲▲▲
        if (this.uiScene?.scene.isActive()) { this.uiScene.events.emit('updateScore', this.score); }
        // if (this.orbiters) this.orbiters.clear(true, true); // 削除
        if (this.attackBricks) this.attackBricks.clear(true, true);
        this.time.delayedCall(1500, () => { this.gameComplete(); });
    }

    // --- ▼ ゲーム進行メソッド (省略なし) ▼ ---
    loseLife() {
        if (this.isGameOver || this.bossDefeated) return;
        console.log(`[BossScene] Losing life. Lives remaining: ${this.lives - 1}`);

        // ★★★ ライフ減少時にマキラ効果を停止 ★★★
        this.deactivateMakira();
        // ★★★ ライフ減少時にマキラ効果を停止 ★★★

        // ★★★ 他の持続系パワーアップも停止する方が自然 ★★★
        // (ボールがリセットされるため効果もリセットするのが一般的)
        Object.values(this.powerUpTimers).forEach(timer => timer?.remove());
        this.powerUpTimers = {};
        // ボールの状態もリセット (activateTemporaryEffect で管理している場合)
        this.balls?.getChildren().forEach(ball => {
             if(ball?.active) {
                 ball.setData('activePowers', new Set()); // 全パワー解除
                 ball.setData('lastActivatedPower', null);
                 ball.setData('isKubiraActive', false);
                 ball.setData('isFast', false);
                 ball.setData('isSlow', false);
                 // 他のフラグもリセット
             }
        });
        this.updateBallAndPaddleAppearance(); // 見た目もリセット
        // ★★★ 他の持続系パワーアップも停止 ★★★


        this.lives--;
        if (this.uiScene && this.uiScene.scene.isActive()) {
            this.uiScene.events.emit('updateLives', this.lives);
        }
        this.isBallLaunched = false;
        if (this.balls) { this.balls.clear(true, true); } // 古いボールクリア
        // ▼▼▼ UI更新イベントを発行 ▼▼▼
        this.events.emit('updateLives', this.lives);
        // ▲▲▲ UI更新イベントを発行 ▲▲▲
        // ...
        if (this.lives > 0) {
             this.time.delayedCall(500, this.resetForNewLife, [], this);
        } else {
            console.log("[BossScene] Game Over condition met.");
            try { this.sound.add(AUDIO_KEYS.SE_GAME_OVER).play(); } catch(e) { /*...*/ }
            this.stopBgm();
            this.time.delayedCall(500, this.gameOver, [], this);
        }
    }
    resetForNewLife() {
        if (this.isGameOver || this.bossDefeated) return;
        console.log("[BossScene] Resetting for new life...");
        if (this.paddle && this.paddle.active) {
             this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        } else {
             this.createAndAddBall(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT/2 - BALL_RADIUS);
        }
        this.isBallLaunched = false;
    }

    gameOver() {
        if (this.isGameOver) return;
        console.log("[BossScene] Executing gameOver sequence.");
        this.isGameOver = true;
        if (this.gameOverText) this.gameOverText.setVisible(true);
        try { if (this.physics.world.running) this.physics.pause(); } catch(e) { console.error("Error pausing physics:", e); }
        if (this.balls) { this.balls.children.each(ball => { if(ball.active) ball.setVelocity(0,0).setActive(false); }); }
    }

    gameComplete() {
        console.log("[BossScene] Game Complete!");
        try { this.sound.add(AUDIO_KEYS.SE_STAGE_CLEAR).play(); } catch(e) { console.error("Error playing SE_STAGE_CLEAR:", e); }
        this.stopBgm();
        alert(`ゲームクリア！ スコア: ${this.score}`);
        this.returnToTitle();
    }

    returnToTitle() {
         console.log("[BossScene] Attempting to reload page...");
         this.stopBgm();
         window.location.reload();
    }

    // --- ▼ BGMメソッド (省略なし) ▼ ---
    playBossBgm() {
        this.stopBgm();
        const bossBgmKey = AUDIO_KEYS.BGM2; // 後半用BGMキーを使用
        console.log(`Playing Boss BGM (Using ${bossBgmKey})`);
        this.currentBgm = this.sound.add(bossBgmKey, { loop: true, volume: 0.5 });
        try {
            this.currentBgm.play();
        } catch (e) {
            console.error("Error playing boss BGM:", e);
        }
    }

    stopBgm() {
        if (this.currentBgm) {
            console.log("Stopping Boss BGM");
            try {
                 this.currentBgm.stop();
                 this.sound.remove(this.currentBgm);
            } catch (e) {
                 console.error("Error stopping BGM:", e);
            }
            this.currentBgm = null;
        }
    }

    // BossScene.js 内に追加
testLogFunction(message) {
    console.log(">>> Entering testLogFunction. Message:", message);
    console.log("<<< Exiting testLogFunction.");
}

    // --- ▼ ユーティリティメソッド (省略なし) ▼ ---
    updatePaddleSize() {
        if (!this.paddle) return;
        const newWidth = this.scale.width * this.paddle.getData('originalWidthRatio');
        this.paddle.setDisplaySize(newWidth, PADDLE_HEIGHT);
        this.paddle.refreshBody();
        const halfWidth = this.paddle.displayWidth / 2;
        this.paddle.x = Phaser.Math.Clamp(this.paddle.x, halfWidth, this.scale.width - halfWidth);
    }

    // handleResize メソッドを修正 (または新規追加)
    handleResize(gameSize) {
        console.log("BossScene resized.");
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;
        this.updatePaddleSize();
        if (this.boss) { this.updateBossSize(); }

        // ▼▼▼ UIScene にリサイズを通知 ▼▼▼
        if (this.scene.isActive('UIScene')) {
            // 'gameResize' というイベント名で通知 (UIScene側と合わせる)
            this.events.emit('gameResize');
            console.log("Emitted gameResize event for UIScene from BossScene.");
        }
        // ▲▲▲ UIScene にリサイズを通知 ▲▲▲
    }


    updateBossSize() {
        if (!this.boss || !this.boss.texture || !this.boss.texture.source[0]) return;
        const texture = this.boss.texture;
        const originalWidth = texture.source[0].width;
        const originalHeight = texture.source[0].height;
        const targetWidthRatio = 0.20;
        const targetBossWidth = this.scale.width * targetWidthRatio;
        let desiredScale = targetBossWidth / originalWidth;
        desiredScale = Phaser.Math.Clamp(desiredScale, 0.1, 1.0);
        this.boss.setScale(desiredScale);
        // 当たり判定調整
        const hitboxWidth = originalWidth * desiredScale;
        const blockWidth = this.scale.width * BRICK_WIDTH_RATIO;
        const hitboxHeight = blockWidth * 8;
        this.boss.body.setSize(hitboxWidth, hitboxHeight);
        console.log(`Boss size updated. Scale: ${desiredScale.toFixed(2)}, Hitbox: ${hitboxWidth.toFixed(0)}x${hitboxHeight.toFixed(0)}`);
    }

    
    createAndAddBall(x, y, vx = 0, vy = 0) {
        console.log(`Creating ball at (${x}, ${y})`);
        if (!this.balls) { console.error("Balls group missing!"); return null; }
        const ball = this.balls.create(x, y, 'ball_image')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2)
            .setCircle(PHYSICS_BALL_RADIUS)
            .setCollideWorldBounds(true)
            .setBounce(1);
        if (ball.body) {
            ball.setVelocity(vx, vy);
            ball.body.onWorldBounds = true;
            console.log("Ball body enabled:", ball.body.enable);
        } else { console.error("Failed to create ball body!"); if(ball) ball.destroy(); return null; }
        ball.setData({ lastActivatedPower: null });
        this.updateBallAppearance(ball);
        console.log("Ball created successfully.");
        return ball;
    }

    handlePointerMove(pointer) {
        if (this.playerControlEnabled && !this.isGameOver && this.paddle && this.paddle.active) {
            const targetX = pointer.x;
            const halfWidth = this.paddle.displayWidth / 2;
            const clampedX = Phaser.Math.Clamp(targetX, halfWidth, this.scale.width - halfWidth);
            this.paddle.x = clampedX;
            if (!this.isBallLaunched && this.balls && this.balls.active) {
                 this.balls.getChildren().forEach(ball => {
                     if (ball.active) ball.x = clampedX;
                 });
            }
        }
    }

    handlePointerDown() {
        console.log("BossScene Pointer down event detected.");
        if (this.isGameOver && this.gameOverText?.visible) {
            console.log("Game Over detected, reloading page...");
            this.returnToTitle();
        } else if (this.playerControlEnabled && this.lives > 0 && !this.isBallLaunched) {
            this.launchBall();
        } else {
             console.log("Pointer down ignored in BossScene.");
        }
    }

    launchBall() {
        console.log("Attempting to launch ball in BossScene.");
        if (!this.isBallLaunched && this.balls) {
            const firstBall = this.balls.getFirstAlive();
            if (firstBall) {
                console.log("Launching ball!");
                const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]);
                const initialVelocityY = BALL_INITIAL_VELOCITY_Y !== 0 ? BALL_INITIAL_VELOCITY_Y : -350;
                firstBall.setVelocity(initialVelocityX, initialVelocityY);
                this.isBallLaunched = true;
                try { this.sound.add(AUDIO_KEYS.SE_LAUNCH).play(); } catch (error) { console.error("Error playing SE_LAUNCH:", error); }
            } else { console.log("No active ball found to launch."); }
        } else { console.log("Cannot launch ball."); }
    }

    handleWorldBounds(body, up, down, left, right) {
        const gameObject = body.gameObject;
        if (!gameObject || !(gameObject instanceof Phaser.Physics.Arcade.Image) || !this.balls?.contains(gameObject) || !gameObject.active) {
            return;
        }
        const ball = gameObject;

        if (up || left || right) {
            // 壁ヒットエフェクト
            try {
                let impactPointX = ball.x; let impactPointY = ball.y; let angleMin = 0, angleMax = 0;
                if (up) { impactPointY = ball.body.y; angleMin = 60; angleMax = 120; }
                else if (left) { impactPointX = ball.body.x; angleMin = -30; angleMax = 30; }
                else if (right) { impactPointX = ball.body.x + ball.body.width; angleMin = 150; angleMax = 210; }
                const particles = this.add.particles(0, 0, 'whitePixel', { x: impactPointX, y: impactPointY, lifespan: 150, speed: { min: 100, max: 200 }, angle: { min: angleMin, max: angleMax }, gravityY: 100, scale: { start: 0.4, end: 0 }, quantity: 4, blendMode: 'ADD', emitting: false });
                if(particles) { particles.setParticleTint(0xffffff); particles.explode(4); this.time.delayedCall(200, () => { if (particles && particles.scene) particles.destroy(); });}
            } catch (e) { console.error("Error creating wall hit particle effect:", e); }
        }
    }

    // --- ▼ クリーンアップ (省略なし) ▼ ---
    shutdownScene() {
        console.log("BossScene shutdown initiated.");
        this.stopBgm();
        if (this.bossMoveTween) { this.bossMoveTween.stop(); this.bossMoveTween = null; console.log("[Shutdown] Boss movement tween stopped."); }
        // イベントリスナー解除
        console.log("[Shutdown] Removing event listeners...");
        try {
            if (this.scale) this.scale.off('resize', this.handleResize, this);
            if (this.physics.world) this.physics.world.off('worldbounds', this.handleWorldBounds, this);
            if (this.input) this.input.removeAllListeners();
            this.events.removeAllListeners();
             console.log("[Shutdown] Event listeners removed.");
        } catch (e) { console.error("[Shutdown] Error removing event listeners:", e); }
        // ★ 攻撃ブロックタイマーも停止
        if (this.attackBrickTimer) {
            this.attackBrickTimer.remove();
            this.attackBrickTimer = null;
        
            console.log("[Shutdown] Attack brick timer removed.");
        }
        // オブジェクト破棄
        console.log("[Shutdown] Destroying GameObjects...");
        this.safeDestroy(this.paddle, "paddle");
        this.safeDestroy(this.balls, "balls group", true);
        this.safeDestroy(this.boss, "boss");
        // this.safeDestroy(this.orbiters, "orbiters group", true); // 削除
        this.safeDestroy(this.attackBricks, "attackBricks group", true);
        this.safeDestroy(this.gameOverText, "gameOverText");
        console.log("[Shutdown] Finished destroying GameObjects.");
        this.safeDestroy(this.bossAfterImageEmitter, "bossAfterImageEmitter"); // ★ エミッタも破棄
        this.isVajraSystemActive = false; // ★ フラグクリア
        this.vajraGauge = 0;              // ★ ゲージクリア
        // ...
        this.safeDestroy(this.powerUps, "powerUps group", true); // ★ powerUps も破棄
        if (this.attackBrickTimer) { this.attackBrickTimer.remove(); this.attackBrickTimer = null; }
        // ...
        this.powerUps = null; // ★ 参照クリア
        this.paddlePowerUpOverlap = null; // ★ 参照クリア
        // ...
        if (this.makiraAttackTimer) { this.makiraAttackTimer.remove(); this.makiraAttackTimer = null; }
        this.safeDestroy(this.familiars, "familiars group", true);
        this.safeDestroy(this.makiraBeams, "makiraBeams group", true);
        // ...
        this.familiars = null; this.makiraBeams = null; this.makiraAttackTimer = null;
        this.safeDestroy(this.makiraBeamBossOverlap, "makiraBeamBossOverlap"); this.makiraBeamBossOverlap = null;
        this.bossAfterImageEmitter = null; // 参照クリア
        // 参照クリア
        this.paddle = null; this.balls = null; this.boss = null; /*this.orbiters = null;*/ this.attackBricks = null; this.gameOverText = null;
        this.uiScene = null; this.ballPaddleCollider = null; this.ballBossCollider = null; /*this.ballOrbiterCollider = null;*/ this.ballAttackBrickCollider = null;
        console.log("BossScene shutdown complete.");
    }

    safeDestroy(obj, name, destroyChildren = false) {
        if (obj && obj.scene) { // Check if it exists and belongs to a scene
            console.log(`[Shutdown] Attempting to destroy ${name}...`);
            try {
                obj.destroy(destroyChildren);
                console.log(`[Shutdown] ${name} destroyed.`);
            } catch (e) {
                console.error(`[Shutdown] Error destroying ${name}:`, e.message);
            }
        } else {
            // console.log(`[Shutdown] ${name} was null or already destroyed.`);
        }
    }
    // --- ▲ クリーンアップ ▲ ---

} // <-- BossScene クラスの終わり