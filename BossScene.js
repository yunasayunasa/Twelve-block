// BossScene.js (雛形 - 完全なコード)

import {
    PADDLE_WIDTH_RATIO, PADDLE_HEIGHT, PADDLE_Y_OFFSET, BALL_RADIUS, PHYSICS_BALL_RADIUS,
    BALL_INITIAL_VELOCITY_Y, BALL_INITIAL_VELOCITY_X_RANGE, NORMAL_BALL_SPEED, AUDIO_KEYS, MAX_STAGE, POWERUP_TYPES // SE_REFLECT用にPOWERUP_TYPESもインポート
    // 他にも BossScene で使う定数があれば追加
} from './constants.js';

export default class BossScene extends Phaser.Scene {
    constructor() {
        super('BossScene');

        // --- プロパティ初期化 ---
        this.paddle = null;
        this.balls = null;
        this.boss = null;
        this.orbiters = null;
        this.attackBricks = null;
        this.bossContainer = null;

        this.lives = 3;
        this.score = 0;
        this.chaosSettings = null;
        this.currentStage = MAX_STAGE;

        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true; // ★ 操作可能フラグ (登場演出などで使用)

        // コライダー参照
        this.ballPaddleCollider = null;
        this.ballWallCollider = null; // 壁との衝突 (worldboundsイベントで代替も可)

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

        this.isBallLaunched = false;
        this.isGameOver = false;
        this.bossDefeated = false;
        this.playerControlEnabled = true; // 初期状態では操作可能
        this.currentBgm = null;
    }

    preload() {
        console.log("BossScene Preload (usually nothing needed here)");
    }

    create() {
        console.log("BossScene Create Start");
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        

        // 背景
        this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'gameBackground3')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.gameWidth, this.gameHeight)
            .setDepth(-1);

        // BGM再生
        this.playBossBgm();

        // UIシーン起動 & 初期値設定
        console.log("Launching UIScene for Boss...");
        this.scene.launch('UIScene');
        this.uiScene = this.scene.get('UIScene');
        this.time.delayedCall(50, () => {
            if (this.uiScene && this.uiScene.scene.isActive()) {
                console.log("Updating initial UI for BossScene.");
                this.uiScene.events.emit('updateLives', this.lives);
                this.uiScene.events.emit('updateScore', this.score);
                this.uiScene.events.emit('updateStage', this.currentStage);
                this.uiScene.events.emit('deactivateVajraUI'); // ボス戦ではヴァジラUI非表示
                this.uiScene.events.emit('updateDropPoolUI', []); // ドロッププール空
            } else {
                console.warn("UIScene not ready or active when trying to update initial UI.");
            }
        }, [], this);


        // 物理ワールド設定
        this.physics.world.setBoundsCollision(true, true, true, false); // 下は通り抜ける
        this.physics.world.off('worldbounds', this.handleWorldBounds, this);
        this.physics.world.on('worldbounds', this.handleWorldBounds, this);

        // パドル作成・設定
        console.log("Creating paddle...");
        if (this.paddle) { this.paddle.destroy(); this.paddle = null; }
        this.paddle = this.physics.add.image(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET, 'whitePixel')
            .setTint(0xffff00).setImmovable(true).setData('originalWidthRatio', PADDLE_WIDTH_RATIO);
        this.updatePaddleSize(); // ★ サイズと位置を更新
        console.log("Paddle created and size updated.");

        // ボールグループ作成 & 初期ボール作成
        console.log("Creating balls group and initial ball...");
        if (this.balls) { this.balls.destroy(true); this.balls = null; }
        this.balls = this.physics.add.group({
            bounceX: 1,
            bounceY: 1,
            collideWorldBounds: true // ★ ワールド境界との衝突有効化
        });
        if (this.paddle && this.paddle.active) {
            this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
            console.log("Initial ball created based on paddle position.");
        } else {
            console.warn("Paddle not found when creating initial ball. Creating at default pos.");
            this.createAndAddBall(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT/2 - BALL_RADIUS);
        }
        console.log("Balls group and initial ball created.");


        // ゲームオーバーテキスト
        if (this.gameOverText) { this.gameOverText.destroy(); this.gameOverText = null; }
        this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER\nTap to Restart', { fontSize: '48px', fill: '#f00', align: 'center' })
            .setOrigin(0.5).setVisible(false).setDepth(1);

        // ポインターイベント設定
        this.input.off('pointermove', this.handlePointerMove, this);
        this.input.off('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.handlePointerMove, this);
        this.input.on('pointerdown', this.handlePointerDown, this);

        // リサイズイベント
        this.scale.off('resize', this.handleResize, this);
        this.scale.on('resize', this.handleResize, this);

        // シーン終了イベント
        this.events.off('shutdown', this.shutdownScene, this); // 重複防止
        this.events.on('shutdown', this.shutdownScene, this);


        // --- ▼ ボス関連の初期化 ▼ ---
        console.log("Initializing boss elements...");
        // ボス本体生成 (仮表示)
        this.boss = this.physics.add.image(this.gameWidth / 2, 150, 'bossStand')
             .setImmovable(true); // 物理的には動かない
        console.log("Boss object created (initial).");
        this.updateBossSize(); // ★ サイズ更新用メソッド呼び出し
        // ★ ここにボスの体力、当たり判定設定などを追加

        // 子機グループ生成
        this.orbiters = this.physics.add.group({ immovable: true });
        console.log("Orbiters group created.");
        // ★ ここに子機生成処理を追加

        // 攻撃ブロックグループ生成
        this.attackBricks = this.physics.add.group();
        console.log("Attack bricks group created.");

        // ★ ここにボス登場演出処理を追加
        // --- ▲ ボス関連の初期化 ▲ ---


        // --- 衝突判定設定 ---
        console.log("Setting initial colliders...");
        this.setColliders();
        console.log("Initial colliders set.");
        // --- ▲ 衝突判定設定 ▲ ---

        console.log("BossScene Create End");
    }

    update(time, delta) {
        if (this.isGameOver || this.bossDefeated) { return; }

        // --- ボールが画面下に落ちた判定 ---
        let activeBallCount = 0;
        if (this.balls && this.balls.active) { // グループが存在するか確認
             this.balls.getChildren().forEach(ball => {
                 if (ball.active) {
                     activeBallCount++;
                     if (this.isBallLaunched && ball.y > this.gameHeight + ball.displayHeight) {
                         console.log("Ball went out of bounds.");
                         ball.setActive(false).setVisible(false);
                         if (ball.body) ball.body.enable = false;
                     }
                     // 速度制限 (必要なら)
                     // const minSpeed = NORMAL_BALL_SPEED * 0.1;
                     // const maxSpeed = NORMAL_BALL_SPEED * 5;
                     // const speed = ball.body?.velocity.length() || 0;
                     // if (speed > 0 && speed < minSpeed) ball.body.velocity.normalize().scale(minSpeed);
                     // else if (speed > maxSpeed) ball.body.velocity.normalize().scale(maxSpeed);
                 }
            });
             if (activeBallCount === 0 && this.isBallLaunched && this.lives > 0) {
                 console.log("No active balls left, losing life.");
                 this.loseLife();
                 return;
             }
        }

        // --- 攻撃ブロックが画面下に落ちた判定 ---
        if (this.attackBricks && this.attackBricks.active) {
             this.attackBricks.children.each(brick => {
                 if (brick.active && brick.y > this.gameHeight + brick.displayHeight) {
                     brick.destroy();
                 }
             });
        }

        // --- ▼ ボス・子機・攻撃の更新処理 ▼ ---
        // ★ ここにボスの動き、子機の回転、攻撃ブロック生成のロジックを追加 ★
        // --- ▲ ボス・子機・攻撃の更新処理 ▲ ---
    }

    // --- 必要なメソッド ---

    playBossBgm() {
        this.stopBgm();
        console.log("Playing Boss BGM (Using BGM2 for now)");
        this.currentBgm = this.sound.add(AUDIO_KEYS.BGM2, { loop: true, volume: 0.5 });
        try { this.currentBgm.play(); } catch (e) { console.error("Error playing boss BGM:", e); }
    }
    stopBgm() {
        if (this.currentBgm) {
            console.log("Stopping Boss BGM");
            try { this.currentBgm.stop(); this.sound.remove(this.currentBgm); } catch (e) { console.error("Error stopping BGM:", e); }
            this.currentBgm = null;
        }
    }

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
        
        // 背景リサイズ (必要なら)
        // this.resizeBackground();
        // UIシーンにも通知
        if (this.uiScene && this.uiScene.scene.isActive()) {
            this.uiScene.events.emit('gameResize');
        }
        if (this.boss) { // ボスが存在すれば
            this.updateBossSize(); // ★ サイズ更新用メソッド呼び出し
        }

    }

    // サイズ更新用メソッド
updateBossSize() {
    if (!this.boss || !this.boss.texture || !this.boss.texture.source[0]) return; // 安全チェック

    const texture = this.boss.texture;
    const originalWidth = texture.source[0].width;
    const originalHeight = texture.source[0].height;

    const targetWidthRatio = 0.20; // ★ 画面幅の20%
    const targetBossWidth = this.scale.width * targetWidthRatio;
    let desiredScale = targetBossWidth / originalWidth;
    desiredScale = Phaser.Math.Clamp(desiredScale, 0.1, 1.0); // 上下限制限

    this.boss.setScale(desiredScale); // スケール適用

    // 当たり判定調整
    const hitboxWidth = originalWidth * desiredScale;
    // 横2x縦4ブロック相当の高さにするための調整 (例)
    // ブロック1つの幅 = this.scale.width * BRICK_WIDTH_RATIO (constants.jsから)
    // ボスの当たり判定高さ = ブロック幅 * 4
    const blockWidth = this.scale.width * 0.095; // 仮: BRICK_WIDTH_RATIOを直接使うか定数インポート
    const targetHitboxHeightRatio = 4; // 縦4ブロック分
    const hitboxHeight = blockWidth * targetHitboxHeightRatio;

    // setSizeは中央基準で幅・高さを設定
    this.boss.body.setSize(hitboxWidth, hitboxHeight);
    // オフセットは通常不要だが、必要なら調整
    // this.boss.body.setOffset(offsetX, offsetY);

    console.log(`Boss size updated. Scale: ${desiredScale.toFixed(2)}, Hitbox: ${hitboxWidth.toFixed(0)}x${hitboxHeight.toFixed(0)}`);
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
        ball.setData({ lastActivatedPower: null }); // ボス戦ではパワーアップなし
        this.updateBallAppearance(ball);
        console.log("Ball created successfully.");
        return ball;
    }

    updateBallAppearance(ball) {
        if (!ball || !ball.active) return;
        if (ball.texture.key !== 'ball_image') { ball.setTexture('ball_image'); }
        ball.clearTint();
    }

    setColliders() {
        console.log("[BossScene] Setting basic colliders...");
        // 既存コライダー破棄
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy();
        if (this.ballWallCollider) this.ballWallCollider.destroy(); // 壁とのColliderも念のため

        // ボール vs パドル
        if (this.paddle && this.balls) {
            this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this);
            console.log("[BossScene] Ball-Paddle collider added.");
        } else { console.warn("[BossScene] Cannot set Ball-Paddle collider."); }

        // ボール vs ワールド境界 (上左右) - これは worldbounds イベントで処理するので明示的なColliderは不要かも

        // ★★★ ここに ボール vs ボス, ボール vs 子機, ボール vs 攻撃ブロック の Collider/Overlap を追加 ★★★
    }

    // BossScene.js の hitPaddle メソッド

hitPaddle(paddle, ball) {
    console.log("[hitPaddle] Start"); // ★ 開始ログ
    try {
        // オブジェクトの有効性チェック
        if (!paddle || !paddle.active || !ball || !ball.active || !ball.body || !paddle.body) {
            console.warn("[hitPaddle] Aborting: Invalid paddle or ball state.");
            return;
        }
        console.log("[hitPaddle] Paddle and ball objects are valid.");

        // --- 反射角度計算 ---
        console.log("[hitPaddle] Calculating reflection angle...");
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
        console.log(`[hitPaddle] diff=${diff.toFixed(2)}, influence=${influence.toFixed(2)}, newVx=${newVx.toFixed(2)}, newVy=${newVy.toFixed(2)}`);

        // --- 速度設定 ---
        const targetSpeed = NORMAL_BALL_SPEED; // ボス戦では速度変化なし
        const newVelocity = new Phaser.Math.Vector2(newVx, newVy);
        // ゼロベクトルチェック (念のため)
        if (newVelocity.lengthSq() === 0) {
            console.warn("[hitPaddle] Calculated zero velocity! Using default up.");
            newVelocity.set(0, -1); // デフォルト上向き
        }
        newVelocity.normalize().scale(targetSpeed);
        console.log(`[hitPaddle] Setting velocity to (${newVelocity.x.toFixed(2)}, ${newVelocity.y.toFixed(2)})`);
        ball.setVelocity(newVelocity.x, newVelocity.y); // ★ ここでエラー？
        console.log("[hitPaddle] Velocity set.");

        // --- SE再生 ---
        console.log("[hitPaddle] Attempting to play SE_REFLECT...");
        try {
            this.sound.add(AUDIO_KEYS.SE_REFLECT).play();
             console.log("[hitPaddle] SE_REFLECT playback attempted.");
        } catch (e) {
            console.error("[hitPaddle] Error playing SE_REFLECT:", e.message, e.stack);
        }

        // --- エフェクト生成 ---
        console.log("[hitPaddle] Attempting to create particle effect...");
        try {
            const impactPointY = ball.y + BALL_RADIUS * 0.8;
            const impactPointX = ball.x;
            const particles = this.add.particles(0, 0, 'whitePixel', { /* ... エフェクト設定 ... */ });
            if (particles) { // ★ particles が null でないか確認
                particles.setParticleTint(0xffffcc);
                particles.explode(5);
                this.time.delayedCall(200, () => { if (particles && particles.scene) particles.destroy(); });
                console.log("[hitPaddle] Particle effect created.");
            } else {
                console.error("[hitPaddle] Failed to create particle manager!");
            }
        } catch (e) {
            console.error("[hitPaddle] Error creating particle effect:", e.message, e.stack);
        }

    } catch (error) { // hitPaddle全体のcatchブロック
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("[hitPaddle] CRITICAL Error occurred during hitPaddle method:");
        console.error(" Message:", error.message);
        console.error(" Stack:", error.stack);
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        // フリーズ回避のため、エラー発生時はボールを強制的に上に飛ばすなど検討？
        // if (ball && ball.body) ball.setVelocity(0, -NORMAL_BALL_SPEED);
    }
    console.log("[hitPaddle] End"); // ★ 終了ログ
}
    handleWorldBounds(body, up, down, left, right) {
        const ball = body.gameObject;
        if (!ball || !(ball instanceof Phaser.Physics.Arcade.Image) || !this.balls?.contains(ball) || !ball.active) return; // ?.で安全呼び出し
        if (up || left || right) {
            // 壁ヒットエフェクト
            try { /* ... エフェクト生成 ... */ } catch (e) { /*...*/ }
            // 壁反射音 (鳴らさない方針ならコメントアウト)
            // try { this.sound.add(AUDIO_KEYS.SE_REFLECT).play(); } catch(e) { /*...*/ }
        }
    }

    loseLife() {
        if (this.isGameOver || this.bossDefeated) return;
        console.log(`[BossScene] Losing life. Lives remaining: ${this.lives - 1}`);
        this.lives--;
        if (this.uiScene && this.uiScene.scene.isActive()) { this.uiScene.events.emit('updateLives', this.lives); }
        this.isBallLaunched = false;
        // ★ ボールリセット処理をここに実装 (resetForNewLife呼び出し前)
        if (this.balls) { this.balls.clear(true, true); }

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
        // ★ ボール再生成 (既にloseLifeでクリア済みなのでcreateAndAddBallのみ)
        if (this.paddle && this.paddle.active) {
             this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        } else {
             this.createAndAddBall(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT/2 - BALL_RADIUS);
        }
        this.isBallLaunched = false; // 未発射状態に戻す
    }

    gameOver() {
        if (this.isGameOver) return;
        console.log("[BossScene] Executing gameOver sequence.");
        this.isGameOver = true;
        if (this.gameOverText) this.gameOverText.setVisible(true);
        try { if (this.physics.world.running) this.physics.pause(); } catch(e) { /*...*/ }
        if (this.balls) { this.balls.children.each(ball => ball.setVelocity(0,0)); } // ボール停止
    }

    gameComplete() {
        console.log("[BossScene] Game Complete!");
        try { this.sound.add(AUDIO_KEYS.SE_STAGE_CLEAR).play(); } catch(e) { /*...*/ }
        this.stopBgm();
        alert(`ゲームクリア！ スコア: ${this.score}`);
        this.returnToTitle();
    }

    returnToTitle() {
         console.log("[BossScene] Attempting to reload page...");
         this.stopBgm();
         window.location.reload();
    }

    shutdownScene() {
        console.log("BossScene shutdown initiated.");
        this.stopBgm();
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
        this.safeDestroy(this.bossContainer, "bossContainer");
        this.safeDestroy(this.gameOverText, "gameOverText");

        // 参照クリア
        this.paddle = null; this.balls = null; this.boss = null; this.orbiters = null; this.attackBricks = null; this.bossContainer = null; this.gameOverText = null;
        this.uiScene = null;

        console.log("BossScene shutdown complete.");
    }

    safeDestroy(obj, name, destroyChildren = false) {
        if (obj && obj.scene) {
            console.log(`[Shutdown] Attempting to destroy ${name}...`);
            try { obj.destroy(destroyChildren); console.log(`[Shutdown] ${name} destroyed.`); }
            catch (e) { console.error(`[Shutdown] Error destroying ${name}:`, e.message); }
        } else { /*console.log(`[Shutdown] ${name} was null or already destroyed.`);*/ }
    }
}