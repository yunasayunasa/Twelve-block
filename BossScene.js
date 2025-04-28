// BossScene.js (修正版 - 省略なし完全コード)

import {
    PADDLE_WIDTH_RATIO, PADDLE_HEIGHT, PADDLE_Y_OFFSET, BALL_RADIUS, PHYSICS_BALL_RADIUS,
    BALL_INITIAL_VELOCITY_Y, BALL_INITIAL_VELOCITY_X_RANGE, NORMAL_BALL_SPEED, AUDIO_KEYS, MAX_STAGE, POWERUP_TYPES,
    // POWERUP_ICON_KEYS, // ボスシーンでは通常不要
    BRICK_WIDTH_RATIO // ボス当たり判定計算用にインポート
} from './constants.js';

// --- ボス戦用定数 (調整用) ---
const BOSS_MAX_HEALTH = 100; // ボス体力
const BOSS_SCORE = 1000;
// ボスの8の字移動設定
const BOSS_MOVE_DURATION_HALF = 4000; // 8の字の片ループ時間(ms) - 全体で8秒
// 子機設定
const NUM_ORBITERS = 4;
const ORBITER_DISTANCE = 90; // ボスからの距離 (ピクセル)
const ORBITER_ROTATION_SPEED = 0.015; // 回転速度 (ラジアン/フレーム)
const ORBITER_SCALE = 0.4; // 子機の表示スケール
const ORBITER_HITBOX_RADIUS = 20; // 子機の当たり判定（円の半径）

export default class BossScene extends Phaser.Scene {
    constructor() {
        super('BossScene');

        // --- プロパティ初期化 ---
        this.paddle = null;
        this.balls = null;
        this.boss = null;
        this.orbiters = null; // Physics Group
        this.attackBricks = null; // Physics Group

        this.lives = 3;
        this.score = 0;
        this.chaosSettings = null;
        this.currentStage = MAX_STAGE;

        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true; // 操作可能フラグ
        this.orbiterAngle = 0; // 子機回転角度
        this.bossMoveTween = null; // ボス移動Tween参照

        // コライダー参照
        this.ballPaddleCollider = null;
        this.ballBossCollider = null;
        this.ballOrbiterCollider = null;
        this.ballAttackBrickCollider = null;

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
        console.log('Chaos Settings:', this.chaosSettings);

        // 状態リセット
        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true;
        this.currentBgm = null;
        this.orbiterAngle = 0;
        if (this.bossMoveTween) {
            this.bossMoveTween.stop();
            this.bossMoveTween = null;
        }
    }

    preload() {
        console.log("BossScene Preload");
        // 基本的にアセットはBootSceneで読み込む想定
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
        this.createOrbiters();
        this.createAttackBricksGroup();

        // --- 4. 衝突判定の設定 ---
        this.setColliders();

        // --- 5. ゲームオーバーテキスト ---
        this.createGameOverText();

        // --- 6. 入力・イベントリスナー設定 ---
        this.setupInputAndEvents();

        // --- 7. ボスの動きを開始 ---
        this.startBossMovement();

        // --- 8. 登場演出など (後で実装) ---
        // 例: this.startIntroCutscene();

        console.log("BossScene Create End");
    }

    update(time, delta) {
        if (this.isGameOver || this.bossDefeated) { return; }

        this.updateBallFall();
        this.updateAttackBricks();
        this.updateOrbiters(time, delta);
        // ★ ここで攻撃ブロック生成ロジック呼び出し (後で実装)
    }


    // BGM再生 (ボス戦用)
    playBossBgm() {
        this.stopBgm(); // 既存のBGMがあれば停止
        console.log("Playing Boss BGM (Using BGM2 for now)"); // どのBGMを使っているかログ表示
        this.currentBgm = this.sound.add(AUDIO_KEYS.BGM2, { loop: true, volume: 0.5 }); // ★ ボス戦用BGMキーに変更 (必要なら)
        try {
            this.currentBgm.play(); // 再生
        } catch (e) {
            console.error("Error playing boss BGM:", e); // エラー処理
        }
    }

    // stopBgmメソッドも必要です (GameSceneからコピー)
    stopBgm() {
        if (this.currentBgm) {
            console.log("Stopping Boss BGM");
            try {
                 this.currentBgm.stop();
                 this.sound.remove(this.currentBgm); // removeもtry-catch内が安全
            } catch (e) {
                 console.error("Error stopping BGM:", e);
            }
            this.currentBgm = null;
        }
    }

    // --- ▼ Create ヘルパーメソッド ▼ ---

    setupUI() {
        console.log("Launching UIScene for Boss...");
        this.scene.launch('UIScene');
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
        this.updateBossSize(); // ★ サイズと当たり判定設定
        console.log(`Boss created with health: ${this.boss.getData('health')}`);
    }

    createOrbiters() {
        console.log("Creating orbiters...");
        if (this.orbiters) { this.orbiters.destroy(true); this.orbiters = null; }
        this.orbiters = this.physics.add.group({ immovable: true });
        const bossStartX = this.boss?.x || this.gameWidth / 2;
        const bossStartY = this.boss?.y || this.gameHeight * 0.25;
        for (let i = 0; i < NUM_ORBITERS; i++) {
            const angle = (Math.PI * 2 / NUM_ORBITERS) * i;
            const orbiterX = bossStartX + Math.cos(angle) * ORBITER_DISTANCE;
            const orbiterY = bossStartY + Math.sin(angle) * ORBITER_DISTANCE;
            const orbiter = this.orbiters.create(orbiterX, orbiterY, 'orbiter')
                .setImmovable(true)
                .setCircle(ORBITER_HITBOX_RADIUS)
                .setScale(ORBITER_SCALE)
                .setCollideWorldBounds(true);
            console.log(`Orbiter ${i} created at (${orbiterX.toFixed(0)}, ${orbiterY.toFixed(0)})`);
        }
        console.log("Orbiters created.");
    }

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

    updateOrbiters(time, delta) {
        if (!this.boss || !this.boss.active || !this.orbiters || !this.orbiters.active) return;
        this.orbiterAngle += ORBITER_ROTATION_SPEED * (delta / 16.66); // delta考慮
        this.orbiters.getChildren().forEach((orbiter, index) => {
            if (orbiter.active) {
                const angle = this.orbiterAngle + (Math.PI * 2 / NUM_ORBITERS) * index;
                orbiter.x = this.boss.x + Math.cos(angle) * ORBITER_DISTANCE;
                orbiter.y = this.boss.y + Math.sin(angle) * ORBITER_DISTANCE;
                // 物理ボディの位置も更新 (重要)
                if (orbiter.body) {
                    orbiter.body.reset(orbiter.x, orbiter.y);
                }
            }
        });
    }

    // --- ▲ Update ヘルパーメソッド ▲ ---


    // --- ▼ ボスの動きメソッド ▼ ---
    startBossMovement() {
        if (!this.boss || !this.boss.active) return;
        if (this.bossMoveTween) { this.bossMoveTween.stop(); this.bossMoveTween = null; }

        console.log("Starting boss movement tween...");
        const pathRadiusX = this.gameWidth * 0.25;
        const pathRadiusY = this.gameHeight * 0.08;
        const pathCenterX = this.gameWidth / 2;
        const pathCenterY = this.gameHeight * 0.25;

        this.bossMoveTween = this.tweens.createTimeline();

        // 始点: pathCenterX - pathRadiusX, pathCenterY

        // 1. 右上へ
        this.bossMoveTween.add({ targets: this.boss, x: pathCenterX, y: pathCenterY - pathRadiusY, duration: BOSS_MOVE_DURATION_HALF / 2, ease: 'Sine.Out' });
        // 2. 右下へ
        this.bossMoveTween.add({ targets: this.boss, x: pathCenterX + pathRadiusX, y: pathCenterY, duration: BOSS_MOVE_DURATION_HALF / 2, ease: 'Sine.In' });
        // 3. 左下へ
        this.bossMoveTween.add({ targets: this.boss, x: pathCenterX, y: pathCenterY + pathRadiusY, duration: BOSS_MOVE_DURATION_HALF / 2, ease: 'Sine.Out' });
        // 4. 左上 (始点) へ
        this.bossMoveTween.add({ targets: this.boss, x: pathCenterX - pathRadiusX, y: pathCenterY, duration: BOSS_MOVE_DURATION_HALF / 2, ease: 'Sine.In' });

        this.bossMoveTween.loop = -1;
        this.bossMoveTween.play();
        console.log("Boss movement tween playing.");
    }
    // --- ▲ ボスの動きメソッド ▲ ---


    // --- ▼ 当たり判定・ダメージ処理など ▼ ---
    setColliders() {
        console.log("[BossScene] Setting colliders...");
        // 既存コライダー破棄
        this.safeDestroy(this.ballPaddleCollider, "ballPaddleCollider");
        this.safeDestroy(this.ballBossCollider, "ballBossCollider");
        this.safeDestroy(this.ballOrbiterCollider, "ballOrbiterCollider");
        this.safeDestroy(this.ballAttackBrickCollider, "ballAttackBrickCollider");

        // ボール vs パドル
        if (this.paddle && this.balls) {
            this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this);
        } else { console.warn("Cannot set Ball-Paddle collider."); }

        // ボール vs ボス本体
        if (this.boss && this.balls) {
            this.ballBossCollider = this.physics.add.collider(this.boss, this.balls, this.hitBoss, (boss, ball) => !boss.getData('isInvulnerable'), this);
            console.log("[BossScene] Ball-Boss collider added.");
        } else { console.warn("Cannot set Ball-Boss collider."); }

        // ボール vs 子機
        if (this.orbiters && this.balls) {
            this.ballOrbiterCollider = this.physics.add.collider(this.orbiters, this.balls, this.hitOrbiter, null, this);
            console.log("[BossScene] Ball-Orbiter collider added.");
        } else { console.warn("Cannot set Ball-Orbiter collider."); }

        // ★ ボール vs 攻撃ブロック の判定を追加 (後で)
        // if (this.attackBricks && this.balls) {
        //    this.ballAttackBrickCollider = this.physics.add.collider(this.attackBricks, this.balls, this.hitAttackBrick, null, this);
        // }
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
            const particles = this.add.particles(0, 0, 'whitePixel', {
                x: impactPointX, y: impactPointY, lifespan: 150, speed: { min: 100, max: 200 }, angle: { min: 240, max: 300 }, gravityY: 300, scale: { start: 0.4, end: 0 }, quantity: 5, blendMode: 'ADD', emitting: false
             });
            particles.setParticleTint(0xffffcc); particles.explode(5);
            this.time.delayedCall(200, () => { if (particles && particles.scene) particles.destroy(); });
        } catch (e) { console.error("Error creating paddle hit particle effect:", e); }
    }

    hitBoss(boss, ball) {
        if (!boss || !ball || !boss.active || !ball.active || boss.getData('isInvulnerable')) { return; }
        console.log("[hitBoss] Boss hit by ball.");
        let damage = 1;
        const lastPower = ball.getData('lastActivatedPower'); // ボールにパワーアップ情報がなくてもエラーにならないように
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
        this.tweens.add({ targets: boss, x: boss.x + shakeAmount, duration: shakeDuration / 2, ease: 'Sine.easeInOut', yoyo: true, repeat: 1 });
        // try { this.sound.add('seBossHit').play(); } catch(e) {}
        this.time.delayedCall(150, () => { if (boss.active) { boss.clearTint(); boss.setData('isInvulnerable', false); } });
        // 体力ゼロ判定
        if (currentHealth <= 0) { this.defeatBoss(boss); }
    }

    hitOrbiter(orbiter, ball) {
        if (!orbiter || !orbiter.active || !ball || !ball.active) return;
        console.log("Ball hit orbiter");
        try { this.sound.add(AUDIO_KEYS.SE_REFLECT).play(); } catch (e) {}
        try {
            const particles = this.add.particles(0, 0, 'whitePixel', { x: ball.x, y: ball.y, lifespan: 100, speed: 100, scale: { start: 0.3, end: 0 }, quantity: 3, blendMode: 'ADD', emitting: false });
            particles.setParticleTint(0xaaaaaa); particles.explode(3);
            this.time.delayedCall(150, () => { if (particles && particles.scene) particles.destroy(); });
        } catch (e) {}
    }

    // ★ hitAttackBrick メソッド (後で作成)

    defeatBoss(boss) {
        if (this.bossDefeated) return;
        console.log("[defeatBoss] Boss defeated!");
        this.bossDefeated = true;
        if (this.bossMoveTween) { this.bossMoveTween.stop(); }
        // ★ 撃破演出実装
        boss.disableBody(true, true);
        this.score += BOSS_SCORE;
        if (this.uiScene?.scene.isActive()) { this.uiScene.events.emit('updateScore', this.score); }
        if (this.orbiters) this.orbiters.clear(true, true);
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
        if (this.balls) { this.balls.children.each(ball => ball.setVelocity(0,0).setActive(false)); } // ボール停止 & 非アクティブ化
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
        // オブジェクト破棄
        console.log("[Shutdown] Destroying GameObjects...");
        this.safeDestroy(this.paddle, "paddle");
        this.safeDestroy(this.balls, "balls group", true);
        this.safeDestroy(this.boss, "boss");
        this.safeDestroy(this.orbiters, "orbiters group", true);
        this.safeDestroy(this.attackBricks, "attackBricks group", true);
        this.safeDestroy(this.gameOverText, "gameOverText");
        console.log("[Shutdown] Finished destroying GameObjects.");
        // 参照クリア
        this.paddle = null; this.balls = null; this.boss = null; this.orbiters = null; this.attackBricks = null; this.gameOverText = null;
        this.uiScene = null; this.ballPaddleCollider = null; this.ballBossCollider = null; this.ballOrbiterCollider = null; this.ballAttackBrickCollider = null;
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
            // console.log(`[Shutdown] ${name} was null or already destroyed.`); // This log can be noisy
        }
    }

    // --- ▼ ユーティリティ (省略なし) ▼ ---
    updateBossSize() {
        if (!this.boss || !this.boss.texture || !this.boss.texture.source[0]) return;
        const texture = this.boss.texture;
        const originalWidth = texture.source[0].width;
        const originalHeight = texture.source[0].height;
        const targetWidthRatio = 0.20; // 画面幅の20%
        const targetBossWidth = this.scale.width * targetWidthRatio;
        let desiredScale = targetBossWidth / originalWidth;
        desiredScale = Phaser.Math.Clamp(desiredScale, 0.1, 1.0);
        this.boss.setScale(desiredScale);
        // 当たり判定調整
        const hitboxWidth = originalWidth * desiredScale; // 見た目の幅に合わせる
        const blockWidth = this.scale.width * BRICK_WIDTH_RATIO; // 0.095
        const hitboxHeight = blockWidth * 4; // 縦4ブロック分
        this.boss.body.setSize(hitboxWidth, hitboxHeight);
        // オフセットは通常不要
        console.log(`Boss size updated. Scale: ${desiredScale.toFixed(2)}, Hitbox: ${hitboxWidth.toFixed(0)}x${hitboxHeight.toFixed(0)}`);
    }

    updateBallAppearance(ball) {
        if (!ball || !ball.active) return;
        if (ball.texture.key !== 'ball_image') { ball.setTexture('ball_image'); }
        ball.clearTint();
    }

    // --- ▲ ユーティリティ ▲ ---

} // <-- BossScene クラスの終わり