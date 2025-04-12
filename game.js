// --- 定数 ---
const PADDLE_WIDTH_RATIO = 0.2; const PADDLE_HEIGHT = 20; const PADDLE_Y_OFFSET = 50;
const BALL_RADIUS = 10; const BALL_INITIAL_VELOCITY_Y = -300; const BALL_INITIAL_VELOCITY_X_RANGE = [-150, 150];
const BRICK_ROWS = 5; const BRICK_COLS = 8; const BRICK_WIDTH_RATIO = 0.1; const BRICK_HEIGHT = 20;
const BRICK_SPACING = 4; const BRICK_OFFSET_TOP = 60;
const GAME_MODE = { NORMAL: 'normal', ALL_STARS: 'all_stars' };

// --- BootScene ---
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() { console.log("BootScene: Preloading assets..."); /* ここでアセット読み込み */ }
    create() { console.log("BootScene: Assets loaded, starting TitleScene..."); this.scene.start('TitleScene'); }
}

// --- TitleScene ---
class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height;
        this.cameras.main.setBackgroundColor('#333');
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.2, '十二神将ブロック崩し', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.3, '(仮)', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } };
        const buttonHoverStyle = { fill: '#ff0' };
        const normalButton = this.add.text(this.gameWidth / 2, this.gameHeight * 0.5, '通常モード', buttonStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerover', () => normalButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => normalButton.setStyle(buttonStyle))
            .on('pointerdown', () => { console.log("通常モード選択"); this.scene.start('GameScene', { mode: GAME_MODE.NORMAL }); this.scene.launch('UIScene'); });
        const allStarsButton = this.add.text(this.gameWidth / 2, this.gameHeight * 0.7, '全員集合モード', buttonStyle)
            .setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerover', () => allStarsButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => allStarsButton.setStyle(buttonStyle))
            .on('pointerdown', () => { console.log("全員集合モード選択"); this.scene.start('GameScene', { mode: GAME_MODE.ALL_STARS }); this.scene.launch('UIScene'); });
    }
}

// --- GameScene (ゲームプレイ画面) ---
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.paddle = null; this.ball = null; this.bricks = null; this.lives = 0;
        this.gameOverText = null; this.isBallLaunched = false; this.gameWidth = 0; this.gameHeight = 0;
        this.currentMode = null; this.currentStage = 1; this.score = 0;
        this.ballPaddleCollider = null; this.ballBrickCollider = null;
        this.bricksHitThisFrame = []; // ★ 衝突したブロックを一時格納する配列
        this.isStageClearing = false; // ステージクリア処理中フラグ
    }

    init(data) {
        this.currentMode = data.mode || GAME_MODE.NORMAL;
        console.log(`GameScene: Initializing with mode: ${this.currentMode}`);
        if (this.currentMode === GAME_MODE.ALL_STARS) { this.lives = 1; } else { this.lives = 3; }
        this.isBallLaunched = false;
        this.currentStage = 1;
        this.score = 0;
        this.bricksHitThisFrame = []; // 配列もリセット
        this.isStageClearing = false; // フラグもリセット
    }

    preload() { /* アセット読み込みが必要ならここに */ }

    create() {
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height;
        console.log(`GameScene: Create Start - Stage ${this.currentStage}, Mode ${this.currentMode}`);
        this.time.delayedCall(50, () => {
             // UIシーンが起動しているか確認してからイベント送信
             if (this.scene.isActive('UIScene')) {
                 this.events.emit('updateLives', this.lives);
                 this.events.emit('updateScore', this.score);
                 this.events.emit('updateStage', this.currentStage);
             } else {
                 console.warn("UIScene not active when trying to send initial UI data.");
             }
         });
        this.physics.world.setBoundsCollision(true, true, true, false);
        const paddleWidth = this.gameWidth * PADDLE_WIDTH_RATIO;
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, null)
            .setDisplaySize(paddleWidth, PADDLE_HEIGHT).setTint(0xffffff).setImmovable(true).setCollideWorldBounds(true);
        this.createBall();
        this.createBricks();
        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Game Over\nタップで戻る', { fontSize: '48px', fill: '#f00', align: 'center' })
            .setOrigin(0.5).setVisible(false).setDepth(1);

        // コライダー設定
        this.ballPaddleCollider = this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.setBallBrickCollider(); // ブロック用コライダー

        // 入力処理
        this.input.on('pointermove', (pointer) => {
            if (this.lives > 0 && this.paddle) {
                const paddleHalfWidth = this.paddle.displayWidth / 2;
                const targetX = Phaser.Math.Clamp(pointer.x, paddleHalfWidth, this.gameWidth - paddleHalfWidth);
                this.paddle.x = targetX;
                if (!this.isBallLaunched && this.ball) {
                    this.ball.x = this.paddle.x;
                }
            }
         });
        this.input.on('pointerdown', () => {
             if (this.lives > 0 && !this.isStageClearing) { // ステージクリア中は発射しない
                 if (!this.isBallLaunched) { this.launchBall(); }
             } else if (this.gameOverText && this.gameOverText.visible) { // ゲームオーバー表示後なら (gameOverTextの存在もチェック)
                 this.returnToTitle();
             }
        });
        this.events.on('shutdown', this.shutdown, this);
        console.log("GameScene: Create End");
    }

    update(time, delta) {
        if (this.lives <= 0 || this.isStageClearing) return;

        // ボール落下チェック
        if (this.ball && this.ball.y > this.gameHeight + this.ball.displayHeight) {
             if (this.lives > 0 && this.ball.active) {
                 console.log("Ball out of bounds - calling loseLife");
                 this.loseLife();
             }
        }

        // 衝突したブロックの処理
        this.processBrickHits();
    }

    processBrickHits() {
        if (this.bricksHitThisFrame.length === 0) { return; }

        console.log(`Processing ${this.bricksHitThisFrame.length} brick hits...`);
        let needsStageClearCheck = false;

        this.bricksHitThisFrame.forEach(brick => {
            if (brick.active) {
                const brickData = brick.getData();
                let hits = brickData.hits;

                if (hits > 0) {
                    hits--;
                    brick.setData('hits', hits);
                    console.log(`Brick processed, hits remaining: ${hits}`);
                    if (hits <= 0) {
                        brick.setActive(false);
                        brick.setVisible(false);
                        console.log("Brick deactivated.");
                        this.score += 10;
                        this.events.emit('updateScore', this.score);
                        console.log(`Score updated: ${this.score}`);
                        needsStageClearCheck = true;
                        // TODO: パワーアップアイテムドロップ処理
                    } else {
                        brick.setTint(0xffaaaa);
                        console.log("Brick damaged.");
                    }
                }
            }
        });

        this.bricksHitThisFrame = [];
        console.log("Brick hit processing finished.");

        if (needsStageClearCheck) {
             console.log("Checking for stage clear...");
             // countActiveが0になったらステージクリア (bricksが存在するか確認)
             if (this.bricks && this.bricks.countActive(true) === 0) {
                 console.log("All bricks cleared!");
                 this.stageClear();
             } else if (this.bricks) {
                 console.log(`Bricks remaining: ${this.bricks.countActive(true)}`);
             }
        }
    }

    setBallBrickCollider() {
        if (this.ballBrickCollider) { this.ballBrickCollider.destroy(); this.ballBrickCollider = null; }
        if (!this.ball || !this.bricks) { console.error("Missing ball or bricks for collider."); return; }
        this.ballBrickCollider = this.physics.add.collider(
            this.ball,
            this.bricks,
            this.hitBrick,
            null,
            this
        );
        console.log("New Ball-Brick collider set.");
    }

    createBall() {
        if (this.ball) { this.ball.destroy(); }
        // パドルが存在しない場合はデフォルト位置に
        const initialX = this.paddle ? this.paddle.x : this.gameWidth / 2;
        const initialY = this.paddle ? this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS : this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2 - BALL_RADIUS;
        this.ball = this.physics.add.image(initialX, initialY, null)
            .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2).setTint(0x00ff00).setCircle(BALL_RADIUS)
            .setCollideWorldBounds(true).setBounce(1);
        this.ball.body.onWorldBounds = true; this.ball.setVelocity(0, 0);
        this.isBallLaunched = false;
        console.log("Ball created");
    }

    launchBall() {
        if (!this.isBallLaunched && this.ball && this.ball.active) {
             const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]);
             const initialVelocityY = BALL_INITIAL_VELOCITY_Y === 0 ? -300 : BALL_INITIAL_VELOCITY_Y;
             this.ball.setVelocity(initialVelocityX, initialVelocityY);
             if (this.ball.body.velocity.length() < 100) { this.ball.body.velocity.normalize().scale(200); }
             this.isBallLaunched = true;
             console.log(`Ball launched with velocity: ${this.ball.body.velocity.x.toFixed(2)}, ${this.ball.body.velocity.y.toFixed(2)}`);
        }
    }

    createBricks() {
        console.log("Creating bricks...");
        if (this.bricks) { this.bricks.destroy(true); }
        this.bricks = this.physics.add.staticGroup();
        const brickWidth = this.gameWidth * BRICK_WIDTH_RATIO; const totalBricksWidth = BRICK_COLS * brickWidth + (BRICK_COLS - 1) * BRICK_SPACING;
        const offsetX = (this.gameWidth - totalBricksWidth) / 2; const rows = this.currentMode === GAME_MODE.ALL_STARS ? BRICK_ROWS + 2 : BRICK_ROWS;
        for (let i = 0; i < rows; i++) { for (let j = 0; j < BRICK_COLS; j++) { const brickX = offsetX + j * (brickWidth + BRICK_SPACING) + brickWidth / 2; const brickY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; const brickType = 'normal'; let tint = Phaser.Display.Color.RandomRGB().color; let hits = 1; this.bricks.create(brickX, brickY, null).setDisplaySize(brickWidth, BRICK_HEIGHT).setTint(tint).setData({ type: brickType, hits: hits }).refreshBody(); } }
        console.log(`Created ${this.bricks.getLength()} bricks`);
    }

    hitPaddle(ball, paddle) {
        if (!ball || !paddle || !ball.body || !ball.active) return;
        console.log("Hit paddle");
        let diff = ball.x - paddle.x; const maxDiff = paddle.displayWidth / 2; const influence = 0.75;
        const baseVelX = ball.body.velocity.x * (1.0 - influence); const paddleVelX = 250 * (diff / maxDiff) * influence;
        let newVelX = baseVelX + paddleVelX; const minVelXAbs = 50; const maxVelXAbs = 400;
        if (Math.abs(newVelX) < minVelXAbs) { newVelX = minVelXAbs * Math.sign(newVelX || 1); }
        newVelX = Phaser.Math.Clamp(newVelX, -maxVelXAbs, maxVelXAbs);
        let newVelY = ball.body.velocity.y;
        if (newVelY > -100 && newVelY <= 0) { newVelY = -100; } else if (newVelY >= 0) { newVelY = -100; }
        ball.setVelocity(newVelX, newVelY);
    }

    hitBrick(ball, brick) {
         if (!ball || !brick || !ball.active || !brick.active) { return; }
         if (!this.bricksHitThisFrame.includes(brick)) {
             this.bricksHitThisFrame.push(brick);
             console.log("Hit brick - Added to processing list.");
         }
    }

    loseLife() {
        if (this.lives <= 0 || this.isStageClearing) return;
        console.log(`Lose life - Lives before: ${this.lives}`);
        this.lives--; this.events.emit('updateLives', this.lives);
        console.log(`Lives after: ${this.lives}`);
        if (this.ball) { this.ball.setActive(false).setVisible(false); if(this.ball.body) this.ball.body.enable = false; }
        if (this.lives > 0) { this.time.delayedCall(500, this.resetPaddleAndBall, [], this); }
        else { this.time.delayedCall(500, this.gameOver, [], this); }
    }

    resetPaddleAndBall() {
         console.log("Resetting paddle and ball - Start");
         // 物理演算が止まっている可能性があるので再開
         if (!this.physics.world.running) {
             console.log("Resuming physics for reset.");
             this.physics.resume();
         }
         if (this.paddle) { this.paddle.x = this.gameWidth / 2; this.paddle.y = this.gameHeight - PADDLE_Y_OFFSET; this.paddle.setVelocity(0, 0); }
         this.createBall();
         this.isBallLaunched = false;
         console.log("Resetting paddle and ball - End");
    }

    gameOver() {
        console.log("Game Over - Start");
        // すでに表示されている場合は何もしない
        if(this.gameOverText && this.gameOverText.visible) {
            console.warn("gameOver called but already visible.");
            return;
        }
        // gameOverTextが生成されていなければエラー回避
        if(this.gameOverText) {
            this.gameOverText.setVisible(true);
        } else {
            console.error("gameOverText not found!");
        }
        this.physics.pause();
        console.log("Game Over - End");
    }

    stageClear() {
        if (this.isStageClearing) return;
        console.log(`Stage Clear - Start (Stage ${this.currentStage})`);
        this.isStageClearing = true;
        this.physics.pause();
        if(this.ball) { this.ball.setVelocity(0,0).setVisible(false).setActive(false); if(this.ball.body) this.ball.body.enable = false; }
        console.log("Scheduling next stage transition...");
        this.time.delayedCall(1000, () => {
            console.log("Executing next stage transition...");
            this.currentStage++;
            const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12;
            if (this.currentStage > maxStages) {
                 console.log("All stages complete!");
                 this.gameComplete();
            } else {
                console.log(`Starting next stage: ${this.currentStage}`);
                this.events.emit('updateStage', this.currentStage);
                this.createBricks();
                this.setBallBrickCollider(); // ★重要: 新しいBricksに対してColliderを設定
                this.resetPaddleAndBall();
                this.isStageClearing = false; // ★フラグ解除はここ
                this.physics.resume();
                console.log("Physics resumed for next stage.");
            }
            console.log("Stage Clear transition finished.");
        });
    }

    gameComplete() {
        console.log("Game Complete - Start");
        alert(`ゲームクリア！\n最終スコア: ${this.score}`);
        this.returnToTitle();
        console.log("Game Complete - End");
    }

    returnToTitle() {
        console.log("Returning to TitleScene - Start");
        // シーンがアクティブか確認してから停止・開始
        if (this.scene.isActive()) {
            // 物理演算が止まっている場合は再開 (安全のため)
            if (!this.physics.world.running) {
                this.physics.resume();
            }
            if (this.scene.isActive('UIScene')) { this.scene.stop('UIScene'); }
            this.scene.start('TitleScene');
        } else {
            console.warn("GameScene is not active, cannot return to title.");
        }
        console.log("Returning to TitleScene - End");
    }

    shutdown() {
        console.log("GameScene shutdown: Cleaning up...");
        if(this.input) this.input.removeAllListeners();
        if(this.time) this.time.removeAllEvents();
        this.ballPaddleCollider = null; this.ballBrickCollider = null;
        this.events.removeAllListeners();
        console.log("GameScene cleanup finished.");
    }
}

// --- UIScene ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText = null; this.scoreText = null; this.stageText = null; }
    create() {
        console.log("UIScene: Creating UI elements..."); this.gameWidth = this.scale.width;
        this.livesText = this.add.text(16, 16, 'ライフ: -', { fontSize: '24px', fill: '#fff' });
        this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: -', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5, 0);
        this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: 0', { fontSize: '24px', fill: '#fff' }).setOrigin(1, 0);
        try {
            // GameSceneが起動済みか確認してからリスナー登録
            if (this.scene.isSleeping('GameScene') || this.scene.isActive('GameScene')) {
                 const gameScene = this.scene.get('GameScene');
                 this.registerGameEventListeners(gameScene);
            } else {
                 // GameSceneのstartイベントを待つ
                 this.scene.get('GameScene').events.once('start', this.registerGameEventListeners, this);
            }
        } catch (e) { console.error("UIScene: Error setting up GameScene listeners on create.", e); }
        this.events.on('shutdown', () => {
            console.log("UIScene: Shutting down..."); try { if (this.scene.manager.getScene('GameScene')) { const gameScene = this.scene.get('GameScene'); if (gameScene && gameScene.events) { gameScene.events.off('updateLives', this.updateLivesDisplay, this); gameScene.events.off('updateScore', this.updateScoreDisplay, this); gameScene.events.off('updateStage', this.updateStageDisplay, this); gameScene.events.off('start', this.registerGameEventListeners, this); console.log("UIScene: Listeners removed."); } } else { console.log("UIScene: GameScene not found on shutdown."); } } catch (e) { console.error("UIScene: Error removing listeners on shutdown.", e); }
        });
    }
    registerGameEventListeners(gameScene) {
        console.log("UIScene: Registering event listeners for GameScene.");
        // 念のため既存リスナー削除
        gameScene.events.off('updateLives', this.updateLivesDisplay, this); gameScene.events.off('updateScore', this.updateScoreDisplay, this); gameScene.events.off('updateStage', this.updateStageDisplay, this);
        // リスナー登録
        gameScene.events.on('updateLives', this.updateLivesDisplay, this); gameScene.events.on('updateScore', this.updateScoreDisplay, this); gameScene.events.on('updateStage', this.updateStageDisplay, this);
        // 初期値表示
        this.updateLivesDisplay(gameScene.lives); this.updateScoreDisplay(gameScene.score); this.updateStageDisplay(gameScene.currentStage);
    }
    updateLivesDisplay(lives) { if (this.livesText) { this.livesText.setText(`ライフ: ${lives}`); } }
    updateScoreDisplay(score) { if (this.scoreText) { this.scoreText.setText(`スコア: ${score}`); } }
    updateStageDisplay(stage) { if (this.stageText) { this.stageText.setText(`ステージ: ${stage}`); } }
}


// --- Phaserゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-example', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { debug: true } },
    scene: [BootScene, TitleScene, GameScene, UIScene]
};

// --- ゲーム開始 ---
const game = new Phaser.Game(config);
