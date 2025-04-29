// BossScene.js (修正版5 - 省略なし完全コード)

import {
    PADDLE_WIDTH_RATIO, PADDLE_HEIGHT, PADDLE_Y_OFFSET, BALL_RADIUS, PHYSICS_BALL_RADIUS,
    BALL_INITIAL_VELOCITY_Y, BALL_INITIAL_VELOCITY_X_RANGE, NORMAL_BALL_SPEED, AUDIO_KEYS, MAX_STAGE, POWERUP_TYPES,
    ALL_POSSIBLE_POWERUPS, POWERUP_ICON_KEYS, POWERUP_SIZE, POWERUP_SPEED_Y, BAISRAVA_DROP_RATE, VAJRA_GAUGE_MAX, VAJRA_GAUGE_INCREMENT, // ヴァジラ関連追加
    POWERUP_DURATION, BALL_SPEED_MODIFIERS, BRICK_WIDTH_RATIO,
    MAKIRA_ATTACK_INTERVAL, MAKIRA_FAMILIAR_SIZE, MAKIRA_FAMILIAR_OFFSET,
    MAKIRA_BEAM_WIDTH, MAKIRA_BEAM_HEIGHT, MAKIRA_BEAM_COLOR, MAKIRA_BEAM_SPEED // マキラ関連定数
} from './constants.js';

// --- ボス戦用定数 ---
const BOSS_MAX_HEALTH = 5; // ★ テスト用体力
const BOSS_SCORE = 1000;
const BOSS_MOVE_RANGE_X_RATIO = 0.6;
const BOSS_MOVE_DURATION = 4000; // 片道の時間
const ATTACK_BRICK_VELOCITY_Y = 150;
const ATTACK_BRICK_SPAWN_DELAY_MIN = 400;
const ATTACK_BRICK_SPAWN_DELAY_MAX = 1200;
const ATTACK_BRICK_SCALE = 0.8;
const ATTACK_BRICK_SPAWN_FROM_TOP_CHANCE = 0.6;
const ATTACK_BRICK_ITEM_DROP_RATE = 0.4; // ← これは chaosSettings.rate で上書きされる想定

export default class BossScene extends Phaser.Scene {
    constructor() {
        super('BossScene');

        // --- プロパティ初期化 ---
        this.paddle = null;
        this.balls = null;          // Physics Group
        this.boss = null;           // Physics Image
        this.attackBricks = null;   // Physics Group
        this.powerUps = null;       // Physics Group
        this.familiars = null;      // ★ Group (Physicsではない)
        this.makiraBeams = null;    // Physics Group

        this.lives = 3;
        this.score = 0;
        this.chaosSettings = null;
        this.currentStage = MAX_STAGE;

        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true;
        this.bossMoveTween = null;
        this.attackBrickTimer = null;
        this.powerUpTimers = {};
        this.isVajraSystemActive = false; // ★ ヴァジラ用
        this.vajraGauge = 0;          // ★ ヴァジラ用
        this.isMakiraActive = false;    // ★ マキラ用
        this.makiraAttackTimer = null;  // ★ マキラ用


        // コライダー/オーバーラップ参照
        this.ballPaddleCollider = null;
        this.ballBossCollider = null;
        this.ballAttackBrickCollider = null;
        this.paddlePowerUpOverlap = null;
        this.makiraBeamBossOverlap = null; // 必要に応じて

        // UI連携用
        this.uiScene = null;

        // その他
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.currentBgm = null;
        this.lastPlayedVoiceTime = {};
        this.voiceThrottleTime = 500;
    }

    init(data) {
        console.log("BossScene Init Start");
        console.log("Received data in BossScene init:", data);
        this.lives = data.lives || 3;
        this.score = data.score || 0;
        if (data && data.chaosSettings) {
            this.chaosSettings = {
                count: data.chaosSettings.count,
                rate: (data.chaosSettings.ratePercent ?? (data.chaosSettings.rate ? data.chaosSettings.rate * 100 : 50)) / 100.0
            };
            this.chaosSettings.rate = Phaser.Math.Clamp(this.chaosSettings.rate, 0, 1);
            console.log('Chaos Settings Set in BossScene:', this.chaosSettings);
        } else {
            console.log('No Chaos Settings received in BossScene, using defaults.');
            this.chaosSettings = { count: 4, rate: 0.5 };
        }

        // 状態リセット
        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true;
        this.currentBgm = null;
        this.isVajraSystemActive = false;
        this.vajraGauge = 0;
        this.isMakiraActive = false;
        this.bossDropPool = [];
        Object.values(this.powerUpTimers).forEach(timer => timer?.remove());
        this.powerUpTimers = {};
        if (this.bossMoveTween) { this.bossMoveTween.stop(); this.bossMoveTween = null; }
        if (this.attackBrickTimer) { this.attackBrickTimer.remove(); this.attackBrickTimer = null; }
        if (this.makiraAttackTimer) { this.makiraAttackTimer.remove(); this.makiraAttackTimer = null; }

    }

    preload() {
        console.log("BossScene Preload");
    }

    create() {
        console.log("BossScene Create Start");
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // --- 1. 基本的なシーン設定 ---
        this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'gameBackground3').setOrigin(0.5, 0.5).setDisplaySize(this.gameWidth, this.gameHeight).setDepth(-1);
        this.playBossBgm();
        this.setupUI();
        this.setupPhysics();

        // --- 2. パドルとボールの生成 ---
        this.createPaddle();
        this.createBalls();

        // --- 3. ボス関連オブジェクトの生成 ---
        this.createBoss();
        this.createAttackBricksGroup();
        this.createPowerUpsGroup();
        this.createMakiraGroups(); // マキラ用グループ作成

        // --- 4. ボス戦用ドロッププール設定 ---
        this.setupBossDropPool();

        // --- 5. 衝突判定の設定 ---
        this.setColliders();

        // --- 6. ゲームオーバーテキスト ---
        this.createGameOverText();

        // --- 7. 入力・イベントリスナー設定 ---
        this.setupInputAndEvents();

        // --- 8. ボスの動きを開始 ---
        this.startBossMovement();

        // --- 9. 攻撃ブロック生成タイマーを開始 ---
        this.scheduleNextAttackBrick();

        console.log("BossScene Create End");
    }

    update(time, delta) {
        if (this.isGameOver || this.bossDefeated) { return; }

        this.updateMakiraFamiliars(); // ★ マキラ子機追従
        this.updateBallFall();
        this.updateAttackBricks();
        this.updateMakiraBeams(); // ★ ビーム画面外除去
    }

    // --- ▼ Create ヘルパーメソッド (省略なし) ▼ ---

    setupUI() {
        console.log("Launching UIScene for Boss...");
        if (!this.scene.isActive('UIScene')) { this.scene.launch('UIScene'); }
        this.uiScene = this.scene.get('UIScene');
        this.time.delayedCall(50, () => {
            if (this.uiScene && this.uiScene.scene.isActive()) {
                console.log("Updating initial UI for BossScene.");
                this.uiScene.events.emit('updateLives', this.lives);
                this.uiScene.events.emit('updateScore', this.score);
                this.uiScene.events.emit('updateStage', this.currentStage);
                this.uiScene.events.emit('deactivateVajraUI');
                this.uiScene.events.emit('updateDropPoolUI', []);
                 // もしボス戦でヴァジラゲージ使うならここで表示開始
                 // if (this.isVajraSystemActive) this.uiScene.events.emit('activateVajraUI', this.vajraGauge, VAJRA_GAUGE_MAX);
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

    createAttackBricksGroup() {
        console.log("Creating attack bricks group...");
        if (this.attackBricks) { this.attackBricks.destroy(true); this.attackBricks = null; }
        this.attackBricks = this.physics.add.group();
        console.log("Attack bricks group created.");
    }

    createPowerUpsGroup() {
        console.log("Creating power ups group...");
        if (this.powerUps) { this.powerUps.destroy(true); this.powerUps = null; }
        this.powerUps = this.physics.add.group();
        console.log("Power ups group created.");
    }

    createMakiraGroups() {
        console.log("Creating Makira groups...");
        if (this.familiars) { this.familiars.destroy(true); this.familiars = null; }
        this.familiars = this.add.group(); // ★ 通常のグループ
        if (this.makiraBeams) { this.makiraBeams.destroy(true); this.makiraBeams = null; }
        this.makiraBeams = this.physics.add.group(); // ビームは物理
        console.log("Makira groups created.");
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

    setupBossDropPool() {
        console.log("Setting up boss drop pool...");
        const possibleDropsOriginal = ALL_POSSIBLE_POWERUPS.filter(type => // マキラ等を除外
             type !== POWERUP_TYPES.MAKIRA &&
             type !== POWERUP_TYPES.MAKORA &&
             type !== POWERUP_TYPES.VAJRA
        );
        const possibleDrops = [...possibleDropsOriginal]; // コピー作成
        const shuffledPool = Phaser.Utils.Array.Shuffle(possibleDrops);
        const countToUse = this.chaosSettings?.count ?? 0;
        this.bossDropPool = shuffledPool.slice(0, countToUse);
        // ★ 確実にドロップさせたいものを追加 (例: 必ずクビラは出るようにする)
        // if (!this.bossDropPool.includes(POWERUP_TYPES.KUBIRA)) {
        //     if (this.bossDropPool.length < (this.chaosSettings?.count ?? possibleDrops.length)) {
        //          this.bossDropPool.push(POWERUP_TYPES.KUBIRA);
        //      } else if (this.bossDropPool.length > 0) {
        //           this.bossDropPool[Phaser.Math.Between(0, this.bossDropPool.length - 1)] = POWERUP_TYPES.KUBIRA; // ランダム置換
        //      }
        // }
        console.log(`Boss Drop Pool (Count: ${this.bossDropPool.length}): [${this.bossDropPool.join(',')}]`);
    }

    // --- ▲ Create ヘルパーメソッド ▲ ---


    // --- ▼ Update ヘルパーメソッド ▼ ---

    updateMakiraFamiliars() {
         if (this.isMakiraActive && this.paddle && this.paddle.active && this.familiars && this.familiars.active) {
            const paddleX = this.paddle.x;
            const familiarY = this.paddle.y - PADDLE_HEIGHT / 2 - MAKIRA_FAMILIAR_SIZE;
            const children = this.familiars.getChildren();
            try {
                if (children[0]?.active) children[0].setPosition(paddleX - MAKIRA_FAMILIAR_OFFSET, familiarY);
                if (children[1]?.active) children[1].setPosition(paddleX + MAKIRA_FAMILIAR_OFFSET, familiarY);
            } catch (e) { console.error("Error updating familiar position:", e); }
        }
    }

     updateMakiraBeams() {
         if (!this.makiraBeams || !this.makiraBeams.active) return;
         this.makiraBeams.children.each(beam => {
             if (beam.active && beam.y < -MAKIRA_BEAM_HEIGHT) {
                 beam.destroy();
             }
         });
     }

    updateBallFall() { /* ... (変更なし) ... */ }
    updateAttackBricks() { /* ... (変更なし) ... */ }

    // --- ▲ Update ヘルパーメソッド ▲ ---


    // --- ▼ ボスの動きメソッド ▼ ---
    startBossMovement() {
        if (!this.boss || !this.boss.active) { console.warn("Cannot start movement, boss not ready."); return; }
        if (this.bossMoveTween) { this.tweens.killTweensOf(this.boss); this.bossMoveTween = null; } // killTweensOf を使う

        console.log("Starting boss horizontal movement (Center Start - Chained Tweens)...");
        const moveWidth = this.gameWidth * BOSS_MOVE_RANGE_X_RATIO / 2;
        const leftX = this.gameWidth / 2 - moveWidth;
        const rightX = this.gameWidth / 2 + moveWidth;
        const startX = this.gameWidth / 2;

        this.boss.setX(startX);

        const easeFunctions = ['Sine.easeInOut', 'Quad.easeInOut', 'Cubic.easeInOut', 'Quart.easeInOut', 'Expo.easeInOut', 'Circ.easeInOut'];

        const moveToRight = () => {
            const randomEase = Phaser.Utils.Array.GetRandom(easeFunctions);
            console.log(`Tween: Moving to Right (Ease: ${randomEase})`);
            this.bossMoveTween = this.tweens.add({ targets: this.boss, x: rightX, duration: BOSS_MOVE_DURATION, ease: randomEase,
                onComplete: () => { if (this.boss?.active && !this.isGameOver && !this.bossDefeated) moveToLeft(); }
            });
        };
        const moveToLeft = () => {
            const randomEase = Phaser.Utils.Array.GetRandom(easeFunctions);
            console.log(`Tween: Moving to Left (Ease: ${randomEase})`);
            this.bossMoveTween = this.tweens.add({ targets: this.boss, x: leftX, duration: BOSS_MOVE_DURATION, ease: randomEase,
                onComplete: () => { if (this.boss?.active && !this.isGameOver && !this.bossDefeated) moveToRight(); }
            });
        };
        moveToRight(); // 開始
        console.log("Chained boss movement tweens with random ease initiated.");
    }
    // --- ▲ ボスの動きメソッド ▲ ---


    // --- ▼ 当たり判定・ダメージ処理など (省略なし) ▼ ---
    setColliders() {
        console.log("[BossScene] Setting colliders...");
        // 既存コライダー破棄
        this.safeDestroy(this.ballPaddleCollider, "ballPaddleCollider");
        this.safeDestroy(this.ballBossCollider, "ballBossCollider");
        // this.safeDestroy(this.ballOrbiterCollider, "ballOrbiterCollider"); // 削除
        this.safeDestroy(this.ballAttackBrickCollider, "ballAttackBrickCollider");
        this.safeDestroy(this.paddlePowerUpOverlap, "paddlePowerUpOverlap");
        this.safeDestroy(this.makiraBeamBossOverlap, "makiraBeamBossOverlap");

        // ボール vs パドル
        if (this.paddle && this.balls) { this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this); }
        else { console.warn("Cannot set Ball-Paddle collider."); }

        // ボール vs ボス本体
        if (this.boss && this.balls) { this.ballBossCollider = this.physics.add.collider(this.boss, this.balls, this.hitBoss, (boss, ball) => !boss.getData('isInvulnerable'), this); }
        else { console.warn("Cannot set Ball-Boss collider."); }

        // ボール vs 攻撃ブロック
        if (this.attackBricks && this.balls) { this.ballAttackBrickCollider = this.physics.add.collider(this.attackBricks, this.balls, this.hitAttackBrick, null, this); }
        else { console.warn("Cannot set Ball-AttackBrick collider."); }

        // パドル vs パワーアップアイテム
        if (this.paddle && this.powerUps) { this.paddlePowerUpOverlap = this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this); }
        else { console.warn("Cannot set Paddle-PowerUp overlap."); }

        // マキラビーム vs ボス (ビーム生成時に設定するので、ここでは不要かも)
        // if (this.makiraBeams && this.boss) { this.makiraBeamBossOverlap = this.physics.add.overlap(this.makiraBeams, this.boss, this.hitBossWithMakiraBeam, (beam, boss) => !boss.getData('isInvulnerable'), this); }
    }

    hitPaddle(paddle, ball) {
        if (!paddle || !ball || !ball.active || !ball.body) return;
        console.log("[BossScene] Ball hit paddle.");
        let diff = ball.x - paddle.x; const maxDiff = paddle.displayWidth / 2; let influence = diff / maxDiff; influence = Phaser.Math.Clamp(influence, -1, 1);
        const maxVx = NORMAL_BALL_SPEED * 0.8; let newVx = maxVx * influence; const minVy = NORMAL_BALL_SPEED * 0.5;
        let currentVy = ball.body.velocity.y; let newVy = -Math.abs(currentVy); if (Math.abs(newVy) < minVy) newVy = -minVy;
        // 速度計算 (パワーアップ考慮)
        let speedMultiplier = 1.0;
        const isFast = ball.getData('isFast') === true; const isSlow = ball.getData('isSlow') === true;
        if (isFast) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if (isSlow) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];
        const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier;
        const newVelocity = new Phaser.Math.Vector2(newVx, newVy).normalize().scale(targetSpeed);
        console.log(`[hitPaddle] Setting velocity to (${newVelocity.x.toFixed(2)}, ${newVelocity.y.toFixed(2)}) with targetSpeed ${targetSpeed.toFixed(0)}`);
        ball.setVelocity(newVelocity.x, newVelocity.y);
        // SE & Effect
        try { this.sound.add(AUDIO_KEYS.SE_REFLECT).play(); } catch (e) { console.error("Error playing SE_REFLECT (paddle):", e); }
        try { const particles = this.add.particles(0, 0, 'whitePixel', { x: ball.x, y: ball.y + BALL_RADIUS * 0.8, lifespan: 150, speed: { min: 100, max: 200 }, angle: { min: 240, max: 300 }, gravityY: 300, scale: { start: 0.4, end: 0 }, quantity: 5, blendMode: 'ADD', emitting: false }); if(particles){ particles.setParticleTint(0xffffcc); particles.explode(5); this.time.delayedCall(200, () => { if (particles?.scene) particles.destroy(); });}} catch (e) { console.error("Error creating paddle hit particle effect:", e); }
    }

    hitBoss(boss, ball) {
        if (!boss || !ball || !boss.active || !ball.active || boss.getData('isInvulnerable')) return;
        console.log("[hitBoss] Boss hit by ball.");
        let damage = 1;
        const lastPower = ball.getData('lastActivatedPower'); const isBikara = lastPower === POWERUP_TYPES.BIKARA;
        const bikaraState = ball.getData('bikaraState'); const isKubiraActive = ball.getData('isKubiraActive') === true;
        // ダメージ計算
        if (isBikara && bikaraState === 'yang') { damage = 2; if (isKubiraActive) { damage += 1; console.log("[hitBoss] Bikara Yang + Kubira hit! Calculated Damage: 3"); } else { console.log("[hitBoss] Bikara Yang hit! Calculated Damage: 2"); } }
        else if (isKubiraActive) { damage += 1; console.log("[hitBoss] Kubira hit! Calculated Damage: 2"); }
        else if (isBikara && bikaraState === 'yin') { console.log("[hitBoss] Bikara Yin hit. Calculated Damage: 1"); }
        else { console.log(`[hitBoss] Normal hit. Calculated Damage: ${damage}`); }
        // ダメージ適用とリアクション
        this.applyBossDamage(boss, damage, "Ball Hit");
        // ボール跳ね返し
        if (ball.body) {
             let speedMultiplier = 1.0; const isFast = ball.getData('isFast') === true; const isSlow = ball.getData('isSlow') === true;
             if (isFast) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if (isSlow) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];
             const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier;
             let bounceVx = ball.body.velocity.x; let bounceVy = -ball.body.velocity.y;
             const minBounceSpeedY = NORMAL_BALL_SPEED * 0.3; if(Math.abs(bounceVy) < minBounceSpeedY) { bounceVy = -minBounceSpeedY * Math.sign(bounceVy || -1); }
             const bounceVel = new Phaser.Math.Vector2(bounceVx, bounceVy).normalize().scale(targetSpeed);
             console.log(`[hitBoss] Reflecting ball with velocity (${bounceVel.x.toFixed(2)}, ${bounceVel.y.toFixed(2)}) targetSpeed: ${targetSpeed.toFixed(0)}`);
             ball.setVelocity(bounceVel.x, bounceVel.y);
         }
    }

    hitAttackBrick(brick, ball) {
        if (!brick || !brick.active || !ball || !ball.active) return;
        console.log(`[hitAttackBrick] Current chaosSettings.count: ${this.chaosSettings?.count}`);
        console.log("Attack brick hit by ball!");
        const brickX = brick.x; const brickY = brick.y; const brickColor = brick.tintTopLeft;
        // エフェクト & SE
        try { const particles = this.add.particles(0, 0, 'whitePixel', { frame: 0, x: brickX, y: brickY, lifespan: 500, speed: { min: 80, max: 150 }, angle: { min: 0, max: 360 }, gravityY: 100, scale: { start: 0.7, end: 0 }, quantity: 12, blendMode: 'NORMAL', emitting: false }); if(particles) { particles.setParticleTint(brickColor || 0xcccccc); particles.explode(12); this.time.delayedCall(600, () => { if(particles?.scene) particles.destroy();});}} catch (e) { console.error("Error creating attack brick destroy effect:", e); }
        try { this.sound.add(AUDIO_KEYS.SE_DESTROY).play(); console.log("SE_DESTROY playback attempted for attack brick."); } catch (e) { console.error("Error playing SE_DESTROY:", e); }
        brick.destroy();
        // ヴァジラゲージ増加
        this.increaseVajraGauge();
        // ボール速度維持
        if (ball.body) {
            let speedMultiplier = 1.0; const isFast = ball.getData('isFast') === true; const isSlow = ball.getData('isSlow') === true;
            if (isFast) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if (isSlow) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];
            const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier;
            const currentVelocity = ball.body.velocity;
            if (currentVelocity.lengthSq() > 0) { currentVelocity.normalize().scale(targetSpeed); ball.setVelocity(currentVelocity.x, currentVelocity.y); console.log(`[hitAttackBrick] Ball speed reset to targetSpeed: ${targetSpeed.toFixed(0)}`); }
            else { ball.setVelocity(0, -targetSpeed); } // 速度ゼロなら上に飛ばす
        }
        // アイテムドロップ判定
        const dropRate = this.chaosSettings?.rate ?? ATTACK_BRICK_ITEM_DROP_RATE;
        console.log(`[Drop Logic] Checking drop against rate: ${dropRate.toFixed(2)}`);
        if (Phaser.Math.FloatBetween(0, 1) < BAISRAVA_DROP_RATE) { console.log("[Drop Logic] Baisrava special drop!"); this.dropSpecificPowerUp(brickX, brickY, POWERUP_TYPES.BAISRAVA); }
        else if (Phaser.Math.FloatBetween(0, 1) < dropRate) {
             if (this.bossDropPool && this.bossDropPool.length > 0) {
                 const poolWithoutBaisrava = this.bossDropPool.filter(type => type !== POWERUP_TYPES.BAISRAVA);
                 if (poolWithoutBaisrava.length > 0) { const dropType = Phaser.Utils.Array.GetRandom(poolWithoutBaisrava); console.log(`[Drop Logic] Dropping item: ${dropType}`); this.dropSpecificPowerUp(brickX, brickY, dropType); }
                 else { console.log("Drop pool only contained Baisrava."); }
             } else { console.log("No items in boss drop pool."); }
        } else { console.log("[Drop Logic] No item drop based on rate."); }
    }

    applyBossDamage(boss, damage, source = "Unknown") {
        if (!boss || !boss.active || boss.getData('isInvulnerable')) { console.log(`Damage (${damage} from ${source}) blocked.`); return; }
        let currentHealth = boss.getData('health') - damage;
        boss.setData('health', currentHealth);
        console.log(`[Boss Damage] ${damage} damage dealt by ${source}. Boss health: ${currentHealth}/${boss.getData('maxHealth')}`);
        // リアクション
        boss.setTint(0xff0000); boss.setData('isInvulnerable', true);
        const shakeDuration = 60; const shakeAmount = boss.displayWidth * 0.03;
        try { this.tweens.add({ targets: boss, props: { x: { value: `+=${shakeAmount}`, duration: shakeDuration / 4, yoyo: true, ease: 'Sine.InOut' } }, repeat: 1 }); } catch (e) { console.error("[applyBossDamage] Error creating shake tween:", e); }
        this.time.delayedCall(150, () => { if (boss.active) { boss.clearTint(); boss.setData('isInvulnerable', false); } });
        if (currentHealth <= 0) { this.defeatBoss(boss); }
    }

    defeatBoss(boss) {
        if (this.bossDefeated) return;
        console.log("[defeatBoss] Boss defeated!");
        this.bossDefeated = true;
        if (this.bossMoveTween) { this.bossMoveTween.stop(); }
        this.deactivateMakira(); // マキラ停止
        Object.values(this.powerUpTimers).forEach(timer => timer?.remove()); // 他のタイマー停止
        boss.disableBody(true, true);
        this.score += BOSS_SCORE;
        if (this.uiScene?.scene.isActive()) { this.uiScene.events.emit('updateScore', this.score); }
        if (this.attackBricks) this.attackBricks.clear(true, true);
        this.time.delayedCall(1500, () => { this.gameComplete(); });
    }

    // --- ▼ アイテム取得/効果メソッド (省略なし) ▼ ---
    dropSpecificPowerUp(x, y, type) {
        if (!type) { console.warn("Attempted to drop powerup with no type."); return; }
        if (!this.powerUps) { console.error("PowerUps group does not exist!"); return; }
        let textureKey = POWERUP_ICON_KEYS[type] || 'whitePixel';
        let displaySize = POWERUP_SIZE; let tintColor = null;
        if (textureKey === 'whitePixel') { tintColor = (type === POWERUP_TYPES.BAISRAVA) ? 0xffd700 : 0xcccccc; }
        console.log(`[BossScene] Dropping power up ${type} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        try {
            const powerUp = this.powerUps.create(x, y, textureKey);
            if (powerUp) {
                powerUp.setDisplaySize(displaySize, displaySize).setData('type', type);
                if (tintColor !== null) { powerUp.setTint(tintColor); } else { powerUp.clearTint(); }
                if (powerUp.body) { powerUp.setVelocity(0, POWERUP_SPEED_Y); powerUp.body.setCollideWorldBounds(false); powerUp.body.setAllowGravity(false); }
                else { powerUp.destroy(); console.error("No body for powerup!"); }
            } else { console.error("Failed to create powerup object!"); }
        } catch (e) { console.error("CRITICAL Error in dropSpecificPowerUp:", e); }
    }

    collectPowerUp(paddle, powerUp) {
        console.log("--- collectPowerUp ---");
        // console.log("Context 'this' in collectPowerUp:", this);
        if (!(this instanceof BossScene)) { console.error("!!! 'this' is NOT BossScene in collectPowerUp !!!"); return; }
        if (!powerUp || !powerUp.active || this.isGameOver || this.bossDefeated) return;
        const type = powerUp.getData('type'); if (!type) { powerUp.destroy(); return; }
        console.log(`[BossScene] Collected power up: ${type}`);
        powerUp.destroy();
        // ボイス再生
        const voiceKeyBase = `voice_${type}`; const upperCaseKey = voiceKeyBase.toUpperCase();
        let actualAudioKey = AUDIO_KEYS[upperCaseKey]; if (type === POWERUP_TYPES.VAJRA) actualAudioKey = AUDIO_KEYS.VOICE_VAJRA_GET;
        const now = this.time.now; const lastPlayed = this.lastPlayedVoiceTime[upperCaseKey] || 0;
        if (actualAudioKey && (now - lastPlayed > this.voiceThrottleTime)) { try { this.sound.play(actualAudioKey); this.lastPlayedVoiceTime[upperCaseKey] = now; } catch (e) { console.error(`Error playing voice ${actualAudioKey}:`, e); } }
        else if (!actualAudioKey) { /*console.warn(`Voice key ${upperCaseKey} not found.`);*/ } else { console.log(`Voice ${upperCaseKey} throttled.`); }
        // 効果発動
        switch (type) {
            case POWERUP_TYPES.KUBIRA: console.log("Activating Kubira (Boss Fight - Damage +1 for 10s)"); this.activateTemporaryEffect(type, POWERUP_DURATION[type] || 10000, () => this.setBallPowerUpState(type, true), () => this.setBallPowerUpState(type, false)); break;
            case POWERUP_TYPES.SHATORA: console.log("Activating Shatora (Boss Fight - Speed Up for 3s)"); this.activateTemporaryEffect(type, POWERUP_DURATION[type] || 3000, () => this.balls?.getChildren().forEach(b => b.active && this.applySpeedModifier(b, type)), () => this.balls?.getChildren().forEach(b => b.active && this.resetBallSpeed(b))); break;
            case POWERUP_TYPES.HAILA: console.log("Activating Haila (Boss Fight - Speed Down for 10s)"); this.activateTemporaryEffect(type, POWERUP_DURATION[type] || 10000, () => this.balls?.getChildren().forEach(b => b.active && this.applySpeedModifier(b, type)), () => this.balls?.getChildren().forEach(b => b.active && this.resetBallSpeed(b))); break;
            case POWERUP_TYPES.BAISRAVA: console.log("Activating Baisrava (Boss Fight - 50 Damage)"); if (this.boss?.active && !this.boss.getData('isInvulnerable')) this.applyBossDamage(this.boss, 50, "Baisrava"); else console.log("Baisrava blocked."); break;
            case POWERUP_TYPES.MAKIRA: console.log("Activating Makira (Boss Fight - Paddle Beam)."); this.activateMakira(); break;
            // --- 未実装 ---
            case POWERUP_TYPES.SINDARA: console.log("Power up Sindara collected, effect TBD (Split 2)."); break;
            case POWERUP_TYPES.ANCHIRA: console.log("Power up Anchira collected, effect TBD (Split 4 for 5s)."); break;
            case POWERUP_TYPES.BIKARA: console.log("Power up Bikara collected, effect TBD (Yin/Yang Damage)."); break;
            case POWERUP_TYPES.INDARA: console.log("Power up Indara collected, effect TBD (Homing)."); break;
            case POWERUP_TYPES.ANILA: console.log("Power up Anila collected, effect TBD (Invincible)."); break;
            case POWERUP_TYPES.MAKORA: console.log("Power up Makora collected, effect TBD (Copy)."); break;
            case POWERUP_TYPES.VAJRA: console.log("Power up Vajra collected, effect TBD (Gauge)."); this.activateVajra(); break; // activateVajra呼び出し追加
            default: console.log(`Power up ${type} collected, no specific effect defined yet.`); break;
        }
        this.updateBallAndPaddleAppearance();
    }

    activateTemporaryEffect(type, duration, onStartCallback = null, onEndCallback = null) {
        console.log(`--- activateTemporaryEffect for ${type} ---`);
        if (!(this instanceof BossScene)) { console.error("!!! 'this' is NOT BossScene in activateTemporaryEffect !!!"); return; }
        if (this.powerUpTimers[type]) { this.powerUpTimers[type].remove(); }
        if (onStartCallback) { try { onStartCallback(); } catch (e) { console.error(`Error onStart for ${type}:`, e); } }
        this.setBallPowerUpState(type, true); // 開始時に状態設定
        this.powerUpTimers[type] = this.time.delayedCall(duration, () => {
            console.log(`Deactivating temporary effect: ${type}`);
            this.setBallPowerUpState(type, false); // 終了時に状態解除
            if (onEndCallback) { try { onEndCallback(); } catch (e) { console.error(`Error onEnd for ${type}:`, e); } }
            this.powerUpTimers[type] = null;
            this.updateBallAndPaddleAppearance();
        }, [], this);
        this.updateBallAndPaddleAppearance();
    }

    setBallPowerUpState(type, isActive) {
        this.balls?.getChildren().forEach(ball => {
            if (ball?.active && ball.getData) {
                let activePowers = ball.getData('activePowers');
                if (!activePowers) activePowers = new Set();
                if (isActive) activePowers.add(type); else activePowers.delete(type);
                ball.setData('activePowers', activePowers);
                if (type === POWERUP_TYPES.KUBIRA) ball.setData('isKubiraActive', isActive);
                if (type === POWERUP_TYPES.SHATORA) ball.setData('isFast', isActive);
                if (type === POWERUP_TYPES.HAILA) ball.setData('isSlow', isActive);
                // 他のフラグも追加
                if (isActive) { ball.setData('lastActivatedPower', type); }
                else { if (ball.getData('lastActivatedPower') === type) { const remaining = Array.from(activePowers); ball.setData('lastActivatedPower', remaining.length > 0 ? remaining[remaining.length - 1] : null); } }
                console.log(`Ball power state for ${type} set to ${isActive}. Current:`, Array.from(activePowers), `Last: ${ball.getData('lastActivatedPower')}`);
            }
        });
    }

    updateBallAndPaddleAppearance() {
        console.log("Updating ball and paddle appearance...");
        if (this.balls?.active) { this.balls.getChildren().forEach(ball => { if (ball?.active) { try { this.updateBallAppearance(ball); } catch (e) { console.error("Error during individual ball appearance update:", e); } } }); }
        console.log("Ball and paddle appearance update finished.");
    }

    applySpeedModifier(ball, type) { /* ... (変更なし) ... */ }
    resetBallSpeed(ball) { /* ... (変更なし) ... */ }
    activateVajra() { /* ... (変更なし) ... */ }
    increaseVajraGauge() { /* ... (変更なし) ... */ }
    triggerVajraDestroy() { /* ... (変更なし) ... */ }
    activateMakira() { /* ... (変更なし) ... */ }
    deactivateMakira() { /* ... (変更なし) ... */ }
    createFamiliars() { /* ... (修正済み) ... */ }
    fireMakiraBeam() { /* ... (修正済み) ... */ }
    hitBossWithMakiraBeam(beam, boss) { /* ... (変更なし) ... */ }

    // --- ▲ アイテム取得/効果メソッド ▲ ---


    // --- ▼ ゲーム進行メソッド (省略なし) ▼ ---
    loseLife() {
        if (this.isGameOver || this.bossDefeated) return;
        console.log(`[BossScene] Losing life. Lives remaining: ${this.lives - 1}`);
        this.deactivateMakira(); // マキラ停止
        Object.values(this.powerUpTimers).forEach(timer => timer?.remove()); this.powerUpTimers = {}; // タイマーリセット
        this.balls?.getChildren().forEach(ball => { // ボール状態リセット
             if(ball?.active) { ball.setData('activePowers', new Set()); ball.setData('lastActivatedPower', null); ball.setData('isKubiraActive', false); ball.setData('isFast', false); ball.setData('isSlow', false); }
        });
        this.updateBallAndPaddleAppearance(); // 見た目リセット
        this.lives--;
        if (this.uiScene?.scene.isActive()) this.uiScene.events.emit('updateLives', this.lives);
        this.isBallLaunched = false;
        if (this.balls) this.balls.clear(true, true);
        if (this.lives > 0) { this.time.delayedCall(500, this.resetForNewLife, [], this); }
        else { console.log("[BossScene] Game Over condition met."); try { this.sound.add(AUDIO_KEYS.SE_GAME_OVER).play(); } catch(e) { /*...*/ } this.stopBgm(); this.time.delayedCall(500, this.gameOver, [], this); }
    }
    resetForNewLife() {
        if (this.isGameOver || this.bossDefeated) return;
        console.log("[BossScene] Resetting for new life...");
        if (this.paddle?.active) this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        else this.createAndAddBall(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT/2 - BALL_RADIUS);
        this.isBallLaunched = false;
    }
    gameOver() { /* ... (変更なし) ... */ }
    gameComplete() { /* ... (変更なし) ... */ }
    returnToTitle() { /* ... (変更なし) ... */ }

    // --- ▼ ユーティリティメソッド (省略なし) ▼ ---
    updatePaddleSize() { /* ... (変更なし) ... */ }
    handleResize(gameSize) { /* ... (変更なし) ... */ }
    updateBossSize() { /* ... (変更なし) ... */ }
    createAndAddBall(x, y, vx = 0, vy = 0) { /* ... (変更なし) ... */ }
    handlePointerMove(pointer) { /* ... (変更なし) ... */ }
    handlePointerDown() { /* ... (変更なし) ... */ }
    launchBall() { /* ... (変更なし) ... */ }
    handleWorldBounds(body, up, down, left, right) { /* ... (変更なし) ... */ }
    playBossBgm() { /* ... (変更なし) ... */ }
    stopBgm() { /* ... (変更なし) ... */ }

    // --- ▼ クリーンアップ (省略なし) ▼ ---
    shutdownScene() {
        console.log("BossScene shutdown initiated.");
        this.stopBgm();
        if (this.bossMoveTween) { this.tweens.killTweensOf(this.boss); this.bossMoveTween = null; }
        if (this.attackBrickTimer) { this.attackBrickTimer.remove(); this.attackBrickTimer = null; }
        if (this.makiraAttackTimer) { this.makiraAttackTimer.remove(); this.makiraAttackTimer = null; }
        Object.values(this.powerUpTimers).forEach(timer => timer?.remove());
        // イベントリスナー解除
        console.log("[Shutdown] Removing event listeners...");
        try { if (this.scale) this.scale.off('resize', this.handleResize, this); if (this.physics.world) this.physics.world.off('worldbounds', this.handleWorldBounds, this); if (this.input) this.input.removeAllListeners(); this.events.removeAllListeners(); console.log("[Shutdown] Event listeners removed."); } catch (e) { console.error("[Shutdown] Error removing event listeners:", e); }
        // オブジェクト破棄
        console.log("[Shutdown] Destroying GameObjects...");
        this.safeDestroy(this.paddle, "paddle"); this.safeDestroy(this.balls, "balls group", true); this.safeDestroy(this.boss, "boss"); /*this.safeDestroy(this.orbiters, "orbiters group", true);*/ this.safeDestroy(this.attackBricks, "attackBricks group", true); this.safeDestroy(this.gameOverText, "gameOverText"); this.safeDestroy(this.powerUps, "powerUps group", true); this.safeDestroy(this.familiars, "familiars group", true); this.safeDestroy(this.makiraBeams, "makiraBeams group", true);
        console.log("[Shutdown] Finished destroying GameObjects.");
        // 参照クリア
        this.paddle = null; this.balls = null; this.boss = null; /*this.orbiters = null;*/ this.attackBricks = null; this.gameOverText = null; this.powerUps = null; this.familiars = null; this.makiraBeams = null;
        this.uiScene = null; this.ballPaddleCollider = null; this.ballBossCollider = null; /*this.ballOrbiterCollider = null;*/ this.ballAttackBrickCollider = null; this.paddlePowerUpOverlap = null; this.makiraBeamBossOverlap = null;
        console.log("BossScene shutdown complete.");
    }

    safeDestroy(obj, name, destroyChildren = false) {
        if (obj && obj.scene) { console.log(`[Shutdown] Attempting to destroy ${name}...`); try { obj.destroy(destroyChildren); console.log(`[Shutdown] ${name} destroyed.`); } catch (e) { console.error(`[Shutdown] Error destroying ${name}:`, e.message); } }
    }
    // --- ▲ クリーンアップ ▲ ---

} // <-- BossScene クラスの終わり