// --- 定数 ---
const PADDLE_WIDTH_RATIO = 0.2; const PADDLE_HEIGHT = 20; const PADDLE_Y_OFFSET = 50;
// ★ ユーザー調整値を反映
const BALL_RADIUS = 12;
const BALL_INITIAL_VELOCITY_Y = -350; // ★ ユーザー調整値
const BALL_INITIAL_VELOCITY_X_RANGE = [-150, 150];
const BRICK_ROWS = 5; const BRICK_COLS = 8; const BRICK_WIDTH_RATIO = 0.1; const BRICK_HEIGHT = 20;
const BRICK_SPACING = 4;
// ★ ユーザー調整値を反映
const BRICK_OFFSET_TOP = 100; // ★ ユーザー調整値

const GAME_MODE = { NORMAL: 'normal', ALL_STARS: 'all_stars' };
const BRICK_COLORS = [ 0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff ];

// ★ パワーアップ関連の定数 (追加・変更)
const POWERUP_DROP_RATE = 0.1; // ドロップ率 (調整可)
const POWERUP_SIZE = 15;
const POWERUP_SPEED_Y = 100;
const POWERUP_TYPES = {
    KUBIRA: 'kubira',
    SHATORA: 'shatora', // ★ 追加
    HAILA: 'haila'      // ★ 追加
};
const POWERUP_COLORS = {
    [POWERUP_TYPES.KUBIRA]: 0x800080, // 紫
    [POWERUP_TYPES.SHATORA]: 0xffa500, // オレンジ
    [POWERUP_TYPES.HAILA]: 0xadd8e6  // 水色
};
const POWERUP_DURATION = {
    [POWERUP_TYPES.KUBIRA]: 10000, // 10秒
    [POWERUP_TYPES.SHATORA]: 3000, // 3秒
    [POWERUP_TYPES.HAILA]: 10000 // 10秒
};
// ★ 速度変更関連の定数
const NORMAL_BALL_SPEED = Math.abs(BALL_INITIAL_VELOCITY_Y); // 通常のボール速度の基準 (Y軸初速の絶対値)
const BALL_SPEED_MODIFIERS = {
    [POWERUP_TYPES.SHATORA]: 3.0, // 3倍速
    [POWERUP_TYPES.HAILA]: 0.3   // 0.3倍速
};


// --- BootScene (アセット読み込みなど) ---
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    preload() {
        console.log("BootScene: Preloading assets...");
        // 将来のアセット読み込みはここ
    }
    create() {
        console.log("BootScene: Assets loaded, starting TitleScene...");
        this.scene.start('TitleScene');
    }
}

// --- TitleScene (タイトル画面) ---
class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }
    create() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        this.cameras.main.setBackgroundColor('#222222'); // 少し明るいグレー

        this.add.text(this.gameWidth / 2, this.gameHeight * 0.2, '十二神将ブロック崩し', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.3, '(仮)', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

        const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } };
        const buttonHoverStyle = { fill: '#ff0' };

        const normalButton = this.add.text(this.gameWidth / 2, this.gameHeight * 0.5, '通常モード', buttonStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerover', () => normalButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => normalButton.setStyle(buttonStyle))
            .on('pointerdown', () => {
                console.log("通常モード選択");
                this.scene.start('GameScene', { mode: GAME_MODE.NORMAL });
                this.scene.launch('UIScene');
            });

        const allStarsButton = this.add.text(this.gameWidth / 2, this.gameHeight * 0.7, '全員集合モード', buttonStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerover', () => allStarsButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => allStarsButton.setStyle(buttonStyle))
            .on('pointerdown', () => {
                console.log("全員集合モード選択");
                this.scene.start('GameScene', { mode: GAME_MODE.ALL_STARS });
                this.scene.launch('UIScene');
            });
    }
}

// --- GameScene (ゲームプレイ画面) ---
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.paddle = null;
        this.ball = null;
        this.bricks = null;
        this.powerUps = null; // パワーアップアイテムグループ
        this.lives = 0;
        this.gameOverText = null;
        this.isBallLaunched = false;
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.currentMode = null;
        this.currentStage = 1;
        this.score = 0;
        this.ballPaddleCollider = null;
        this.ballBrickCollider = null;
        this.ballBrickOverlap = null; // クビラ用Overlap
        this.activePowerUp = null; // 現在発動中のパワーアップタイプ
        this.powerUpTimer = null; // パワーアップ効果時間タイマー
    }

    init(data) {
        this.currentMode = data.mode || GAME_MODE.NORMAL;
        console.log(`GameScene: Initializing with mode: ${this.currentMode}`);
        this.lives = (this.currentMode === GAME_MODE.ALL_STARS) ? 1 : 3;
        this.isBallLaunched = false;
        this.currentStage = 1;
        this.score = 0;
        this.activePowerUp = null;
        if (this.powerUpTimer) this.powerUpTimer.remove();
        this.powerUpTimer = null;
    }

    preload() { }

    create() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        console.log(`GameScene: Creating stage ${this.currentStage} for mode ${this.currentMode}`);

        // 背景色設定
        this.cameras.main.setBackgroundColor('#222222');

        this.time.delayedCall(50, () => {
            if (this.scene.isActive('UIScene')) {
                this.events.emit('updateLives', this.lives);
                this.events.emit('updateScore', this.score);
                this.events.emit('updateStage', this.currentStage);
            }
        });

        this.physics.world.setBoundsCollision(true, true, true, false);

        const paddleWidth = this.gameWidth * PADDLE_WIDTH_RATIO;
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, null)
            .setDisplaySize(paddleWidth, PADDLE_HEIGHT).setTint(0xffffff).setImmovable(true);

        this.createBall();
        this.createBricks();

        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Game Over\nタップで戻る', { fontSize: '48px', fill: '#f00', align: 'center' })
            .setOrigin(0.5).setVisible(false).setDepth(1);

        // パワーアップアイテムグループ作成
        this.powerUps = this.physics.add.group();

        this.setColliders(); // コライダー/Overlap設定

        // パドルとパワーアップの衝突判定 (Overlap)
        this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);

        // 入力処理
        this.input.on('pointermove', (pointer) => {
            if (this.lives > 0 && this.paddle) {
                const paddleHalfWidth = this.paddle.displayWidth / 2;
                const targetX = Phaser.Math.Clamp(pointer.x, paddleHalfWidth, this.gameWidth - paddleHalfWidth);
                this.paddle.x = targetX;
                if (!this.isBallLaunched && this.ball) { this.ball.x = this.paddle.x; }
            }
        });
        this.input.on('pointerdown', () => {
            if (this.lives > 0) {
                if (!this.isBallLaunched) { this.launchBall(); }
            } else if (this.gameOverText && this.gameOverText.visible) {
                this.returnToTitle();
            }
        });
        this.events.on('shutdown', this.shutdown, this);
    }

    update() {
        if (this.lives <= 0) return;
        if (this.ball && this.ball.active && this.ball.y > this.gameHeight + this.ball.displayHeight) { // 少し余裕を持たせる
             this.loseLife();
        }

        // パワーアップアイテムが画面外に出たら削除
        this.powerUps.children.each(powerUp => {
            if (powerUp.active && powerUp.y > this.gameHeight + POWERUP_SIZE) {
                console.log("Destroying out-of-bounds powerup");
                powerUp.destroy();
            }
        });
    }

    setColliders() {
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy();
        if (this.ballBrickCollider) this.ballBrickCollider.destroy();
        if (this.ballBrickOverlap) this.ballBrickOverlap.destroy();

        if (!this.ball || !this.paddle || !this.bricks) { console.error("Missing object for colliders"); return; }

        this.ballPaddleCollider = this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        // デフォルトのボール・ブロック間コライダー
        this.ballBrickCollider = this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        // クビラ用Overlap (最初は無効)
        this.ballBrickOverlap = this.physics.add.overlap(this.ball, this.bricks, this.handleBallBrickOverlapForKubira, null, this);
        this.ballBrickOverlap.active = false;

        console.log("Colliders (and Overlap) set.");
    }

    createBall() {
         if (this.ball) { this.ball.destroy(); }
         const initialX = this.paddle ? this.paddle.x : this.gameWidth / 2;
         const initialY = this.paddle ? this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS : this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2 - BALL_RADIUS;
         this.ball = this.physics.add.image(initialX, initialY, null)
            .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2).setTint(0x00ff00).setCircle(BALL_RADIUS)
            .setCollideWorldBounds(true).setBounce(1);
         this.isBallLaunched = false;
         console.log("Ball created");
    }

    launchBall() {
        if (!this.isBallLaunched && this.ball && this.ball.active) {
            const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]);
            this.ball.setVelocity(initialVelocityX, BALL_INITIAL_VELOCITY_Y);
            this.isBallLaunched = true;
            console.log(`Ball launched with velocity: ${initialVelocityX}, ${BALL_INITIAL_VELOCITY_Y}`);
        }
    }

    createBricks() {
        if (this.bricks) { this.bricks.destroy(true); }
        this.bricks = this.physics.add.staticGroup();
        const brickWidth = this.gameWidth * BRICK_WIDTH_RATIO;
        const totalBricksWidth = BRICK_COLS * brickWidth + (BRICK_COLS - 1) * BRICK_SPACING;
        const offsetX = (this.gameWidth - totalBricksWidth) / 2;
        const rows = this.currentMode === GAME_MODE.ALL_STARS ? BRICK_ROWS + 2 : BRICK_ROWS;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < BRICK_COLS; j++) {
                const brickX = offsetX + j * (brickWidth + BRICK_SPACING) + brickWidth / 2;
                const brickY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2;
                const randomColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS);
                this.bricks.create(brickX, brickY, null)
                    .setDisplaySize(brickWidth, BRICK_HEIGHT).setTint(randomColor)
                    .setData('hits', 1).refreshBody();
            }
        }
        console.log(`Created ${this.bricks.getLength()} bricks`);
    }

    hitPaddle(ball, paddle) {
        if (!ball || !paddle || !ball.active) return;
        let diff = ball.x - paddle.x;
        const maxDiff = paddle.displayWidth / 2;
        const maxVelX = 250;
        ball.setVelocityX(maxVelX * (diff / maxDiff));
        if (Math.abs(ball.body.velocity.y) < Math.abs(BALL_INITIAL_VELOCITY_Y * 0.5)) {
            ball.setVelocityY(BALL_INITIAL_VELOCITY_Y * (ball.body.velocity.y > 0 ? 0.5 : -0.5));
        }
        // console.log("Hit paddle");
    }

    hitBrick(ball, brick) {
         if (!ball || !brick || !ball.active || !brick.active) return;
         // console.log("Hit brick (Collider)");
         brick.disableBody(true, true);
         this.score += 10;
         this.events.emit('updateScore', this.score);

         // パワーアップアイテムドロップ判定
         if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) {
             this.dropPowerUp(brick.x, brick.y);
         }

         if (this.bricks.countActive(true) === 0) { this.stageClear(); }
    }

    dropPowerUp(x, y) {
        const availableTypes = [POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA];
        const type = Phaser.Utils.Array.GetRandom(availableTypes);
        const color = POWERUP_COLORS[type] || 0xffffff;

        console.log(`Dropping PowerUp: ${type} at ${x.toFixed(0)}, ${y.toFixed(0)}`);
        const powerUp = this.powerUps.create(x, y, null)
            .setDisplaySize(POWERUP_SIZE, POWERUP_SIZE)
            .setTint(color)
            .setData('type', type);

        if (powerUp.body) {
             powerUp.setVelocity(0, POWERUP_SPEED_Y);
             powerUp.body.setCollideWorldBounds(false);
        } else {
             console.error("Failed to create powerup body!");
        }
    }

    // ★★★ ここからが GameScene のメソッドが続く正しい場所 ★★★

    collectPowerUp(paddle, powerUp) {
         if (!powerUp.active) return;
        const type = powerUp.getData('type');
        console.log(`Collected PowerUp: ${type}`);
        powerUp.destroy();
        this.activatePower(type);
    }

    activatePower(type) {
        this.deactivateCurrentPower();
        this.activePowerUp = type;
        console.log(`Activating Power: ${type}`);
        if (!this.ball || !this.ball.active) {
             console.warn("Cannot activate power, ball is missing or inactive.");
             this.activePowerUp = null;
             return;
        }
        if (type === POWERUP_TYPES.KUBIRA) { this.activateKubira(); }
        else if (type === POWERUP_TYPES.SHATORA) { this.activateShatora(); }
        else if (type === POWERUP_TYPES.HAILA) { this.activateHaira(); }

        const duration = POWERUP_DURATION[type];
        if (duration) {
            this.powerUpTimer = this.time.delayedCall(duration, this.deactivateCurrentPower, [], this);
            console.log(`PowerUp Timer set for ${duration}ms`);
        }
    }

    deactivateCurrentPower() {
        if (!this.activePowerUp) return;
        console.log(`Deactivating Power: ${this.activePowerUp}`);
        const type = this.activePowerUp;
        this.activePowerUp = null;
        if (this.powerUpTimer) { this.powerUpTimer.remove(); this.powerUpTimer = null; console.log("PowerUp Timer removed"); }

        if (type === POWERUP_TYPES.KUBIRA) { this.deactivateKubira(); }
        else if (type === POWERUP_TYPES.SHATORA) { this.deactivateShatora(); }
        else if (type === POWERUP_TYPES.HAILA) { this.deactivateHaira(); }

        if (this.ball && this.ball.active) {
             this.ball.setTint(0x00ff00);
             if (type === POWERUP_TYPES.SHATORA || type === POWERUP_TYPES.HAILA) { this.resetBallSpeed(); }
        }
    }

    resetBallSpeed() {
        if (!this.ball || !this.ball.active || !this.ball.body) return;
        const currentVelocity = this.ball.body.velocity;
        const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
        this.ball.setVelocity(direction.x * NORMAL_BALL_SPEED, direction.y * NORMAL_BALL_SPEED);
        console.log(`Ball speed reset to normal (${NORMAL_BALL_SPEED})`);
    }

    activateKubira() {
        if (!this.ball || !this.ball.active) return;
        this.ball.setData('isPenetrating', true);
        this.ball.setTint(POWERUP_COLORS[POWERUP_TYPES.KUBIRA]);
        if (this.ballBrickCollider) this.ballBrickCollider.active = false;
        if (this.ballBrickOverlap) this.ballBrickOverlap.active = true;
        console.log("Kubira activated: Collider disabled, Overlap enabled.");
    }

    deactivateKubira() {
         if (!this.ball) return;
         this.ball.setData('isPenetrating', false);
         if (this.ballBrickOverlap) this.ballBrickOverlap.active = false;
         if (this.ballBrickCollider && this.ballBrickCollider.world) this.ballBrickCollider.active = true;
         console.log("Kubira deactivated: Overlap disabled, Collider enabled.");
    }

    handleBallBrickOverlapForKubira(ball, brick) {
        if (!ball || !brick || !ball.active || !brick.active || !ball.getData('isPenetrating')) return;
        console.log("Kubira Overlap with brick");
        brick.disableBody(true, true);
        this.score += 10;
        this.events.emit('updateScore', this.score);
        if (this.bricks.countActive(true) === 0) { this.stageClear(); }
    }

    activateShatora() {
        if (!this.ball || !this.ball.active || !this.ball.body) return;
        console.log("Activating Shatora");
        this.ball.setData('isFast', true);
        this.ball.setTint(POWERUP_COLORS[POWERUP_TYPES.SHATORA]);
        const currentVelocity = this.ball.body.velocity;
        const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
        const speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA];
        this.ball.setVelocity(direction.x * NORMAL_BALL_SPEED * speedMultiplier, direction.y * NORMAL_BALL_SPEED * speedMultiplier);
        console.log(`Shatora speed set to ${NORMAL_BALL_SPEED * speedMultiplier}`);
    }

    deactivateShatora() {
        if (!this.ball) return;
        console.log("Deactivating Shatora");
        this.ball.setData('isFast', false);
    }

    activateHaira() {
        if (!this.ball || !this.ball.active || !this.ball.body) return;
        console.log("Activating Haira");
        this.ball.setData('isSlow', true);
        this.ball.setTint(POWERUP_COLORS[POWERUP_TYPES.HAILA]);
        const currentVelocity = this.ball.body.velocity;
        const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
        const speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];
        this.ball.setVelocity(direction.x * NORMAL_BALL_SPEED * speedMultiplier, direction.y * NORMAL_BALL_SPEED * speedMultiplier);
        console.log(`Haira speed set to ${NORMAL_BALL_SPEED * speedMultiplier}`);
    }

    deactivateHaira() {
        if (!this.ball) return;
        console.log("Deactivating Haira");
        this.ball.setData('isSlow', false);
    }

    loseLife() {
        if (this.lives > 0) {
            this.deactivateCurrentPower();
            this.lives--;
            this.events.emit('updateLives', this.lives);
            console.log(`Life lost. Lives remaining: ${this.lives}`);
            if (this.ball) {
                this.ball.setActive(false).setVisible(false);
                if (this.ball.body) this.ball.body.enable = false;
            }
            if (this.lives > 0) { this.time.delayedCall(500, this.resetPaddleAndBall, [], this); }
            else { this.time.delayedCall(500, this.gameOver, [], this); }
        }
    }

    resetPaddleAndBall() {
        console.log("Resetting paddle and ball...");
        if (this.paddle) { this.paddle.x = this.gameWidth / 2; this.paddle.y = this.gameHeight - PADDLE_Y_OFFSET; this.paddle.setVelocity(0,0); }
        if (this.ball) {
             if (!this.physics.world.running) { this.physics.resume(); }
            const resetX = this.paddle ? this.paddle.x : this.gameWidth / 2;
            const resetY = this.paddle ? this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS : this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2 - BALL_RADIUS;
            this.ball.setPosition(resetX, resetY);
            this.ball.setVelocity(0, 0);
            this.ball.setActive(true);
            this.ball.setVisible(true);
             if (this.ball.body) { this.ball.body.enable = true; }
             else { console.error("Ball body not found during reset!"); }
             if (this.ball.getData('isPenetrating')) { this.deactivateKubira(); this.ball.setTint(0x00ff00); }
             // ★ シャトラ/ハイラ状態もリセットすべきか？ -> deactivateCurrentPowerで解除されるはずなので不要
            console.log("Existing ball reset.");
        } else {
             console.warn("Ball not found during reset, creating new one.");
             this.createBall();
             this.setColliders();
        }
        this.isBallLaunched = false;
    }

    gameOver() {
        if(this.gameOverText && !this.gameOverText.visible) {
            this.gameOverText.setVisible(true);
            this.physics.pause();
            console.log("Game Over!");
        }
    }

    stageClear() {
        console.log(`Stage ${this.currentStage} Clear! Score: ${this.score}`);
        this.physics.pause();
        this.deactivateCurrentPower();
        if(this.ball) { this.ball.setVelocity(0,0).setVisible(false).setActive(false); if(this.ball.body) this.ball.body.enable = false; }
        alert(`ステージ ${this.currentStage} クリア！ (仮)`);
        this.currentStage++;
        const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12;
        if (this.currentStage > maxStages) { this.gameComplete(); }
        else {
            console.log(`Starting Stage ${this.currentStage}`);
            this.events.emit('updateStage', this.currentStage);
            this.time.delayedCall(500, () => {
                this.createBricks();
                this.setColliders();
                this.resetPaddleAndBall();
                this.physics.resume();
                this.isBallLaunched = false;
            });
        }
    }

     gameComplete() {
        console.log("All stages cleared!");
        alert(`ゲームクリア！おめでとう！\n最終スコア: ${this.score} (仮)`);
        this.returnToTitle();
    }

    returnToTitle() {
        console.log("Returning to TitleScene");
        if (this.scene.isActive()) {
            if (!this.physics.world.running) { this.physics.resume(); }
            if (this.scene.isActive('UIScene')) { this.scene.stop('UIScene'); }
            this.scene.start('TitleScene');
        }
    }

    shutdown() {
        console.log("GameScene shutdown: Cleaning up...");
        if (this.powerUpTimer) this.powerUpTimer.remove();
        if(this.input) this.input.removeAllListeners();
        if(this.time) this.time.removeAllEvents();
        this.ballPaddleCollider = null; this.ballBrickCollider = null; this.ballBrickOverlap = null;
        this.events.removeAllListeners();
        console.log("GameScene cleanup finished.");
    }

} // ← GameScene クラスの正しい終わり

// --- UIScene (UI表示) ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText = null; this.scoreText = null; this.stageText = null; }
    create() {
        console.log("UIScene: Creating UI elements..."); this.gameWidth = this.scale.width;
        this.livesText = this.add.text(16, 16, 'ライフ: -', { fontSize: '24px', fill: '#fff' });
        this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: -', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5, 0);
        this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: 0', { fontSize: '24px', fill: '#fff' }).setOrigin(1, 0);
        try {
             const gameScene = this.scene.get('GameScene');
             if (gameScene) { this.registerGameEventListeners(gameScene); }
             else { this.scene.get('GameScene').events.once('start', this.registerGameEventListeners, this); }
        } catch (e) { console.error("UIScene: Error setting up GameScene listeners on create.", e); }
        this.events.on('shutdown', () => {
            console.log("UIScene: Shutting down..."); try { if (this.scene.manager.getScene('GameScene')) { const gameScene = this.scene.get('GameScene'); if (gameScene && gameScene.events) { gameScene.events.off('updateLives', this.updateLivesDisplay, this); gameScene.events.off('updateScore', this.updateScoreDisplay, this); gameScene.events.off('updateStage', this.updateStageDisplay, this); gameScene.events.off('start', this.registerGameEventListeners, this); console.log("UIScene: Listeners removed."); } } else { console.log("UIScene: GameScene not found on shutdown."); } } catch (e) { console.error("UIScene: Error removing listeners on shutdown.", e); }
        });
    }
    registerGameEventListeners(gameScene) {
         if (!gameScene || !gameScene.events) { return; }
        console.log("UIScene: Registering event listeners for GameScene.");
        gameScene.events.off('updateLives', this.updateLivesDisplay, this); gameScene.events.off('updateScore', this.updateScoreDisplay, this); gameScene.events.off('updateStage', this.updateStageDisplay, this);
        gameScene.events.on('updateLives', this.updateLivesDisplay, this); gameScene.events.on('updateScore', this.updateScoreDisplay, this); gameScene.events.on('updateStage', this.updateStageDisplay, this);
        if (gameScene.hasOwnProperty('lives')) this.updateLivesDisplay(gameScene.lives);
        if (gameScene.hasOwnProperty('score')) this.updateScoreDisplay(gameScene.score);
        if (gameScene.hasOwnProperty('currentStage')) this.updateStageDisplay(gameScene.currentStage);
    }
    updateLivesDisplay(lives) { if (this.livesText) this.livesText.setText(`ライフ: ${lives}`); }
    updateScoreDisplay(score) { if (this.scoreText) this.scoreText.setText(`スコア: ${score}`); }
    updateStageDisplay(stage) { if (this.stageText) this.stageText.setText(`ステージ: ${stage}`); }
}


// --- Phaserゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-example', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: [BootScene, TitleScene, GameScene, UIScene]
};

// --- ゲーム開始 ---
const game = new Phaser.Game(config);
