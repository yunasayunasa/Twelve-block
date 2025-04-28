// BossScene.js (修正版4 - 省略なし完全コード - 子機削除、単純Tween)

import {
    PADDLE_WIDTH_RATIO, PADDLE_HEIGHT, PADDLE_Y_OFFSET, BALL_RADIUS, PHYSICS_BALL_RADIUS,
    BALL_INITIAL_VELOCITY_Y, BALL_INITIAL_VELOCITY_X_RANGE, NORMAL_BALL_SPEED, AUDIO_KEYS, MAX_STAGE, POWERUP_TYPES,
    ALL_POSSIBLE_POWERUPS, // アイテムドロップで使う可能性
    POWERUP_ICON_KEYS, // アイテムドロップで使う可能性
    BRICK_WIDTH_RATIO
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

        // コライダー参照
        this.ballPaddleCollider = null;
        this.ballBossCollider = null;
        this.ballAttackBrickCollider = null; // 子機削除

        // UI連携用
        this.uiScene = null;

        // その他
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.currentBgm = null;
    }

    init(data) {
        console.log("BossScene Init Start");
        this.lives = data.lives || 3;
        this.score = data.score || 0;
        this.chaosSettings = data.chaosSettings || { count: 4, rate: 0.5 };
        console.log(`BossScene Initialized with Lives: ${this.lives}, Score: ${this.score}`);
        
        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true;
        this.currentBgm = null;
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

        // --- 4. 衝突判定の設定 ---
        this.setColliders();

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

    update(time, delta) {
        if (this.isGameOver || this.bossDefeated) { return; }

        this.updateBallFall();
        this.updateAttackBricks();
        // updateOrbiters 削除
    }

    // --- ▼ Create ヘルパーメソッド ▼ ---

    setupUI() {
        console.log("Launching UIScene for Boss...");
        if (!this.scene.isActive('UIScene')) {
             this.scene.launch('UIScene');
        }
        this.uiScene = this.scene.get('UIScene');
        this.time.delayedCall(50, () => {
            if (this.uiScene && this.uiScene.scene.isActive()) {
                console.log("Updating initial UI for BossScene.");
                this.uiScene.events.emit('updateLives', this.lives);
                this.uiScene.events.emit('updateScore', this.score);
                this.uiScene.events.emit('updateStage', this.currentStage);
                this.uiScene.events.emit('deactivateVajraUI');
                this.uiScene.events.emit('updateDropPoolUI', []);
            } else { console.warn("UIScene not ready for initial UI update."); }
        }, [], this);
    }

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

    // createOrbiters() メソッド削除

    createAttackBricksGroup() {
        console.log("Creating attack bricks group...");
        if (this.attackBricks) { this.attackBricks.destroy(true); this.attackBricks = null; }
        this.attackBricks = this.physics.add.group();
        console.log("Attack bricks group created.");
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
                console.log("Attack brick went out of bounds.");
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
        console.log(`Scheduling next attack brick in ${nextDelay}ms`);

        this.attackBrickTimer = this.time.addEvent({
            delay: nextDelay,
            callback: this.spawnAttackBrick, // 生成関数を呼び出す
            callbackScope: this,
            loop: false // ループはせず、コールバック内で再度スケジュールする
        });
    }

    spawnAttackBrick() {
        // ... (生成位置決定ロジック spawnX, spawnY) ...
        console.log("Spawning attack brick...");
        let spawnX; // ★★★ この行を追加 ★★★
        const spawnY = -30;

        // --- 生成位置を決定 ---
        if (Phaser.Math.FloatBetween(0, 1) < ATTACK_BRICK_SPAWN_FROM_TOP_CHANCE) {
            spawnX = Phaser.Math.Between(30, this.gameWidth - 30);
            console.log("Spawning from top random position.");
        } else {
            if (this.boss && this.boss.active) {
                spawnX = this.boss.x;
                console.log("Spawning from boss position.");
            } else {
                console.log("Boss not available, spawning at center top.");
                spawnX = this.gameWidth / 2;
            }
        }
        // --- 生成位置決定終わり ---

        // --- ▼ attackBrick テクスチャを使うように修正 ▼ ---
        // ★ テクスチャキーを 'attackBrick' に固定 (読み込み前提)
        //    もし読み込めなかった場合のフォールバックは create でチェックする方が良いかも
        const brickTexture = 'attackBrick';
        console.log(`[Spawn Debug] Using texture: ${brickTexture}`);

        const attackBrick = this.attackBricks.create(spawnX, spawnY, brickTexture);

        if (attackBrick) {
            // --- ▼ 見た目の調整 ▼ ---
            const desiredScale = 0.8; // ★ 画像に合わせた適切なスケールに調整
            attackBrick.setScale(desiredScale);

            // ★ Tint設定は attackBrick 画像を使うので不要 → 削除
            // if (brickTexture === 'whitePixel') {
            //     attackBrick.setTint(0xcc99ff);
            // } else {
            //     attackBrick.clearTint();
            // }
            attackBrick.clearTint(); // 念のためクリア

            // --- ▼ 当たり判定を表示サイズに合わせる ▼ ---
            try {
                if (attackBrick.body) {
                    // 表示サイズに合わせて当たり判定を設定
                    attackBrick.body.setSize(attackBrick.displayWidth, attackBrick.displayHeight);
                    // 必要ならオフセット調整
                    console.log(`Attack brick body size set to: ${attackBrick.displayWidth.toFixed(0)}x${attackBrick.displayHeight.toFixed(0)}`);
                } else { console.warn("Attack brick body not ready for size setting."); }
            } catch (e) { console.error("Error setting attack brick body size:", e); }
            // --- ▲ 当たり判定を表示サイズに合わせる ▲ ---

            // 落下速度など
            attackBrick.setVelocityY(ATTACK_BRICK_VELOCITY_Y);
            attackBrick.body.setAllowGravity(false);
            attackBrick.body.setCollideWorldBounds(false);

            console.log(`Attack brick spawned at (${spawnX.toFixed(0)}, ${spawnY})`);
            this.scheduleNextAttackBrick();

    

        } else {
            console.error("Failed to create attack brick object!");
             // エラー発生時も次の生成を試みる (無限ループ防止のため遅延を入れる)
             this.time.delayedCall(ATTACK_BRICK_SPAWN_DELAY_MAX, this.scheduleNextAttackBrick, [], this);
        }
    }

    // 攻撃ブロックがボールに当たった時の処理 (後で実装)
    hitAttackBrick(brick, ball) {
        console.log("Attack brick hit by ball!");
        // ★ ここでブロック破壊、エフェクト、SE、アイテムドロップ処理

        // 例: ブロック破壊
        brick.destroy();

        // 例: アイテムドロップ判定
        if (Phaser.Math.FloatBetween(0, 1) < ATTACK_BRICK_ITEM_DROP_RATE) {
            // ドロップするアイテム決定 (ボス戦専用プール？ or カオス設定？)
            const dropType = Phaser.Utils.Array.GetRandom(ALL_POSSIBLE_POWERUPS); // 仮に全体から
            console.log(`Dropping item: ${dropType}`);
            // ★ GameSceneの dropSpecificPowerUp のようなメソッドをBossSceneにも用意するか、呼び出す
            this.dropSpecificPowerUp(brick.x, brick.y, dropType); // 仮呼び出し
        }
    }
    // ★ アイテムドロップ用のメソッド (GameSceneから移植/修正)
    dropSpecificPowerUp(x, y, type) {
        // ★ GameSceneの同名メソッドを参考に実装
        console.log(`[BossScene] Dropping power up ${type} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        // ... (アイテム生成、落下処理) ...
        // ボス戦で拾うアイテムは一時的な効果が良いかも？
    }


    // --- ▲ 攻撃ブロック生成関連メソッド ▲ ---

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

    console.log("Starting boss horizontal movement (Center Start - Chained Tweens)...");
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
        console.log(`Tween: Moving to Right (Ease: ${randomEase})`);
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
        console.log(`Tween: Moving to Left (Ease: ${randomEase})`);
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
    console.log("Chained boss movement tweens with random ease initiated.");
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
        this.safeDestroy(this.ballAttackBrickCollider, "ballAttackBrickCollider");

        // ボール vs パドル
        if (this.paddle && this.balls) { this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this); }
        else { console.warn("Cannot set Ball-Paddle collider."); }

        // ボール vs ボス本体
        if (this.boss && this.balls) { this.ballBossCollider = this.physics.add.collider(this.boss, this.balls, this.hitBoss, (boss, ball) => !boss.getData('isInvulnerable'), this); }
        else { console.warn("Cannot set Ball-Boss collider."); }

        // ボール vs 子機 // 削除

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
    }

    

    hitPaddle(paddle, ball) {
        if (!paddle || !ball || !ball.active || !ball.body) return;
        console.log("[BossScene] Ball hit paddle.");
        let diff = ball.x - paddle.x;
        const maxDiff = paddle.displayWidth / 2;
        let influence = diff / maxDiff;
        influence = Phaser.Math.Clamp(influence, -1, 1);
        const maxVx = NORMAL_BALL_SPEED * 0.8;
        let newVx = maxVx * influence;
        const minVy = NORMAL_BALL_SPEED * 0.5;
        let currentVy = ball.body.velocity.y;
        let newVy = -Math.abs(currentVy);
        if (Math.abs(newVy) < minVy) newVy = -minVy;
        const targetSpeed = NORMAL_BALL_SPEED;
        const newVelocity = new Phaser.Math.Vector2(newVx, newVy).normalize().scale(targetSpeed);
        ball.setVelocity(newVelocity.x, newVelocity.y);
        try { this.sound.add(AUDIO_KEYS.SE_REFLECT).play(); } catch (e) { console.error("Error playing SE_REFLECT (paddle):", e); }
        // パドルヒットエフェクト
        try {
            const impactPointY = ball.y + BALL_RADIUS * 0.8;
            const impactPointX = ball.x;
            const particles = this.add.particles(0, 0, 'whitePixel', { x: impactPointX, y: impactPointY, lifespan: 150, speed: { min: 100, max: 200 }, angle: { min: 240, max: 300 }, gravityY: 300, scale: { start: 0.4, end: 0 }, quantity: 5, blendMode: 'ADD', emitting: false });
            if(particles) { particles.setParticleTint(0xffffcc); particles.explode(5); this.time.delayedCall(200, () => { if (particles && particles.scene) particles.destroy(); }); }
        } catch (e) { console.error("Error creating paddle hit particle effect:", e); }
    }

    hitBoss(boss, ball) {
        if (!boss || !ball || !boss.active || !ball.active || boss.getData('isInvulnerable')) return;
        console.log("[hitBoss] Boss hit by ball.");
        let damage = 1;
        const lastPower = ball.getData('lastActivatedPower');
        const isBikara = lastPower === POWERUP_TYPES.BIKARA;
        const bikaraState = ball.getData('bikaraState');
        const isPenetrating = ball.getData('isPenetrating');
        if (isPenetrating || (isBikara && bikaraState === 'yang')) { damage = 2; console.log("[hitBoss] Penetrating/Bikara Yang hit! Damage: 2"); }
        else if (isBikara && bikaraState === 'yin') { damage = 1; console.log("[hitBoss] Bikara Yin hit. Damage: 1 (Simple Rule)"); }
        else { console.log("[hitBoss] Normal hit. Damage: 1"); }
        let currentHealth = boss.getData('health') - damage;
        boss.setData('health', currentHealth);
        console.log(`[hitBoss] Boss health: ${currentHealth}/${boss.getData('maxHealth')}`);
        // ダメージリアクション
        boss.setTint(0xff0000); boss.setData('isInvulnerable', true);
        const shakeDuration = 60; const shakeAmount = boss.displayWidth * 0.03;
        this.tweens.add({ targets: boss, props: { x: { value: `+=${shakeAmount}`, duration: shakeDuration / 4, yoyo: true, ease: 'Sine.InOut' } }, repeat: 1 });
        // try { this.sound.add('seBossHit').play(); } catch(e) {}
        this.time.delayedCall(150, () => { if (boss.active) { boss.clearTint(); boss.setData('isInvulnerable', false); } });
        if (currentHealth <= 0) { this.defeatBoss(boss); }
    }

    // hitOrbiter(orbiter, ball) メソッド削除

    defeatBoss(boss) {
        if (this.bossDefeated) return;
        console.log("[defeatBoss] Boss defeated!");
        this.bossDefeated = true;
        if (this.bossMoveTween) { this.bossMoveTween.stop(); }
        // ★ 撃破演出実装
        boss.disableBody(true, true);
        this.score += BOSS_SCORE;
        if (this.uiScene?.scene.isActive()) { this.uiScene.events.emit('updateScore', this.score); }
        // if (this.orbiters) this.orbiters.clear(true, true); // 削除
        if (this.attackBricks) this.attackBricks.clear(true, true);
        this.time.delayedCall(1500, () => { this.gameComplete(); });
    }

    // --- ▼ ゲーム進行メソッド (省略なし) ▼ ---
    loseLife() {
        if (this.isGameOver || this.bossDefeated) return;
        console.log(`[BossScene] Losing life. Lives remaining: ${this.lives - 1}`);
        this.lives--;
        if (this.uiScene && this.uiScene.scene.isActive()) {
            this.uiScene.events.emit('updateLives', this.lives);
        }
        this.isBallLaunched = false;
        if (this.balls) { this.balls.clear(true, true); }

        if (this.lives > 0) {
             this.time.delayedCall(500, this.resetForNewLife, [], this);
        } else {
            console.log("[BossScene] Game Over condition met.");
            try { this.sound.add(AUDIO_KEYS.SE_GAME_OVER).play(); } catch(e) { console.error("Error playing SE_GAME_OVER:", e); }
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

    // --- ▼ ユーティリティメソッド (省略なし) ▼ ---
    updatePaddleSize() {
        if (!this.paddle) return;
        const newWidth = this.scale.width * this.paddle.getData('originalWidthRatio');
        this.paddle.setDisplaySize(newWidth, PADDLE_HEIGHT);
        this.paddle.refreshBody();
        const halfWidth = this.paddle.displayWidth / 2;
        this.paddle.x = Phaser.Math.Clamp(this.paddle.x, halfWidth, this.scale.width - halfWidth);
    }

    handleResize(gameSize) {
        console.log("BossScene resized.");
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;
        this.updatePaddleSize();
        if (this.boss) {
            this.updateBossSize();
            // ボス移動Tweenを再開/調整する必要があるか？
            // this.startBossMovement(); // サイズ変更後に動きを再開
        }
        if (this.uiScene && this.uiScene.scene.isActive()) {
            this.uiScene.events.emit('gameResize');
        }
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

    updateBallAppearance(ball) {
        if (!ball || !ball.active) return;
        if (ball.texture.key !== 'ball_image') { ball.setTexture('ball_image'); }
        ball.clearTint();
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
        // ...
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