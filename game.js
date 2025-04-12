// --- 定数 ---
// (変更なし)
const PADDLE_WIDTH_RATIO = 0.2;
const PADDLE_HEIGHT = 20;
const PADDLE_Y_OFFSET = 50;
const BALL_RADIUS = 10;
const BALL_INITIAL_VELOCITY_Y = -300;
const BALL_INITIAL_VELOCITY_X_RANGE = [-150, 150];
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH_RATIO = 0.1;
const BRICK_HEIGHT = 20;
const BRICK_SPACING = 4;
const BRICK_OFFSET_TOP = 60;

const GAME_MODE = {
    NORMAL: 'normal',
    ALL_STARS: 'all_stars'
};

// --- BootScene ---
// (変更なし)
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() { console.log("BootScene: Preloading assets..."); }
    create() { console.log("BootScene: Assets loaded, starting TitleScene..."); this.scene.start('TitleScene'); }
}

// --- TitleScene ---
// (変更なし)
class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
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
        this.paddle = null;
        this.ball = null;
        this.bricks = null;
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
        // this.isCheckingStageClear = false; // ステージクリアチェック中フラグ
    }

    init(data) {
        this.currentMode = data.mode || GAME_MODE.NORMAL;
        console.log(`GameScene: Initializing with mode: ${this.currentMode}`);
        if (this.currentMode === GAME_MODE.ALL_STARS) { this.lives = 1; } else { this.lives = 3; }
        this.isBallLaunched = false;
        this.currentStage = 1;
        this.score = 0;
        this.isCheckingStageClear = false; // フラグもリセット
    }

    preload() { }

    create() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        console.log(`GameScene: Create Start - Stage ${this.currentStage}, Mode ${this.currentMode}`);

        // --- UIシーンへの初期値通知 (遅延実行) ---
        this.time.delayedCall(50, () => {
            this.events.emit('updateLives', this.lives);
            this.events.emit('updateScore', this.score);
            this.events.emit('updateStage', this.currentStage);
        });

        // --- 物理ワールド設定 ---
        this.physics.world.setBoundsCollision(true, true, true, false);

        // --- パドルの作成 ---
        const paddleWidth = this.gameWidth * PADDLE_WIDTH_RATIO;
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, null)
            .setDisplaySize(paddleWidth, PADDLE_HEIGHT)
            .setTint(0xffffff)
            .setImmovable(true)
            .setCollideWorldBounds(true);
        console.log("Paddle created");

        // --- ボールの作成 ---
        this.createBall(); // ボールを作成

        // --- ブロックの作成 ---
        this.createBricks(); // ブロックを作成

        // --- ゲームオーバー表示 ---
        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Game Over\nタップで戻る', { fontSize: '48px', fill: '#f00', align: 'center' })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1);

        // --- 衝突処理の設定 ---
        // ボールとパドルの衝突 (一度だけ設定)
        this.ballPaddleCollider = this.physics.add.collider(
            this.ball,
            this.paddle,
            this.hitPaddle,
            null,
            this
        );
        console.log("Ball-Paddle collider set");
        // ボールとブロックの衝突 (createBricks後に再設定が必要)
        this.setBallBrickCollider(); // ブロック用コライダーを設定

        // --- 入力処理 ---
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
            if (this.lives > 0) {
                if (!this.isBallLaunched) {
                    this.launchBall();
                }
            } else if (!this.gameOverText.visible) { // ゲームオーバー表示後のみ反応
                 // ゲームオーバー中にタップされたらタイトルへ
                 this.returnToTitle();
            }
        });
        console.log("Input listeners set");

        // シーン終了時のクリーンアップ
        this.events.on('shutdown', this.shutdown, this);
        console.log("GameScene: Create End");
    }

    update() {
        if (this.lives <= 0 || !this.ball || !this.ball.active) return;

        // ボールが画面下に落ちたかチェック
        if (this.ball.y > this.gameHeight + this.ball.displayHeight) {
             if (this.lives > 0) { // ライフがまだある場合のみ loseLife を呼ぶ
                console.log("Ball out of bounds - calling loseLife");
                this.loseLife();
             }
        }
    }

    // --- ボールとブロックのコライダー設定関数 ---
    setBallBrickCollider() {
        // 古いブロックコライダーがあれば破棄
        if (this.ballBrickCollider) {
            console.log("Destroying existing ball-brick collider.");
            this.ballBrickCollider.destroy();
            this.ballBrickCollider = null; // 参照をクリア
        }

        if (!this.ball || !this.bricks) {
            console.error("Cannot set ball-brick collider: ball or bricks missing.");
            return;
        }

        // 新しいブロックグループに対してコライダーを設定
        this.ballBrickCollider = this.physics.add.collider(
            this.ball,
            this.bricks,
            this.hitBrick,
            null, // processCallback なし
            this  // context
        );
        console.log("New Ball-Brick collider set.");
    }


    createBall() {
        if (this.ball) {
            console.log("Destroying existing ball.");
            this.ball.destroy();
        }
        this.ball = this.physics.add.image(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS, null)
            .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2)
            .setTint(0x00ff00)
            .setCircle(BALL_RADIUS)
            .setCollideWorldBounds(true)
            .setBounce(1);

        this.ball.body.onWorldBounds = true;
        // 念のため、ボール作成時に速度をリセット
        this.ball.setVelocity(0, 0);
        this.isBallLaunched = false;
        console.log("Ball created");
        // ★ ボールとパドルのコライダーはcreateで設定するのでここでは不要
    }

    launchBall() {
        if (!this.isBallLaunched && this.ball && this.ball.active) { // ボールがアクティブか確認
            const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]);
            // Y速度が0にならないように保証
            const initialVelocityY = BALL_INITIAL_VELOCITY_Y === 0 ? -300 : BALL_INITIAL_VELOCITY_Y;
            this.ball.setVelocity(initialVelocityX, initialVelocityY);
            // 速度が極端に小さい場合は補正
             if (this.ball.body.velocity.length() < 100) {
                 this.ball.body.velocity.normalize().scale(200);
             }
            this.isBallLaunched = true;
            console.log(`Ball launched with velocity: ${this.ball.body.velocity.x.toFixed(2)}, ${this.ball.body.velocity.y.toFixed(2)}`);
        } else {
             console.warn("Cannot launch ball - ball not ready or already launched.");
        }
    }

    createBricks() {
        console.log("Creating bricks...");
        if (this.bricks) {
            console.log("Destroying existing bricks group.");
            this.bricks.destroy(true); // グループごと破棄
        }
        this.bricks = this.physics.add.staticGroup(); // 静的グループとして再作成
        const brickWidth = this.gameWidth * BRICK_WIDTH_RATIO;
        const totalBricksWidth = BRICK_COLS * brickWidth + (BRICK_COLS - 1) * BRICK_SPACING;
        const offsetX = (this.gameWidth - totalBricksWidth) / 2;
        const rows = this.currentMode === GAME_MODE.ALL_STARS ? BRICK_ROWS + 2 : BRICK_ROWS;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < BRICK_COLS; j++) {
                const brickX = offsetX + j * (brickWidth + BRICK_SPACING) + brickWidth / 2;
                const brickY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2;
                const brickType = 'normal'; let tint = Phaser.Display.Color.RandomRGB().color; let hits = 1;
                this.bricks.create(brickX, brickY, null)
                    .setDisplaySize(brickWidth, BRICK_HEIGHT).setTint(tint)
                    .setData({ type: brickType, hits: hits }).refreshBody();
            }
        }
        console.log(`Created ${this.bricks.getLength()} bricks`);
        // ★ 新しいブロックグループに対してコライダーを設定
        // this.setBallBrickCollider(); // ここで呼ぶのではなく、createBricks を呼んだ側 (create, stageClear) で呼ぶ
    }

    hitPaddle(ball, paddle) {
        if (!ball || !paddle || !ball.body || !ball.active) return; // 状態チェック
        console.log("Hit paddle");

        let diff = ball.x - paddle.x;
        const maxDiff = paddle.displayWidth / 2;
        const influence = 0.75;
        const baseVelX = ball.body.velocity.x * (1.0 - influence);
        const paddleVelX = 250 * (diff / maxDiff) * influence;
        let newVelX = baseVelX + paddleVelX;
        const minVelXAbs = 50; const maxVelXAbs = 400;
        if (Math.abs(newVelX) < minVelXAbs) { newVelX = minVelXAbs * Math.sign(newVelX || 1); }
        newVelX = Phaser.Math.Clamp(newVelX, -maxVelXAbs, maxVelXAbs);

        let newVelY = ball.body.velocity.y;
        if (newVelY > -100 && newVelY <= 0) { newVelY = -100; }
        else if (newVelY >= 0) { newVelY = -100; }

        ball.setVelocity(newVelX, newVelY);
    }

    // ★★★ hitBrick 関数を修正 ★★★
    hitBrick(ball, brick) {
         if (!ball || !brick || !ball.active || !brick.active) {
             return;
         }

         console.log("Hit brick - Start"); // ここは通過するはず
         const brickData = brick.getData();
         let hits = brickData.hits;

         // TODO: 特殊ボール効果（貫通など）の判定

         if (hits > 0) {
             hits--;
             brick.setData('hits', hits);
             console.log(`Brick hits remaining: ${hits}`);

             if (hits <= 0) {
                 console.log("Brick destroyed - Attempting to deactivate...");

                 // ★★★ disableBody の代わりに setActive/setVisible を使用 ★★★
                 try {
                     brick.setActive(false);
                     brick.setVisible(false);
                     console.log("Brick deactivated and hidden."); // ★ このログが出るか確認
                 } catch (e) {
                     console.error("Error during brick deactivation:", e); // エラーが出たら表示
                     // フリーズ回避のため、エラーが出ても処理を続ける試み（非推奨だがデバッグ目的）
                 }


                 // スコア加算とUI更新 (非アクティブ化の後)
                 this.score += 10;
                 this.events.emit('updateScore', this.score);
                 console.log(`Score updated: ${this.score}`);

                 // TODO: パワーアップアイテムドロップ処理

                 // ステージクリアチェック (同期)
                 console.log("Executing direct stage clear check...");
                 // ★注意: countActive は active なものを数えるので、setActive(false)でOK
                 if (this.bricks.countActive(true) === 0) {
                     console.log("All bricks cleared!");
                     this.stageClear();
                 } else {
                      console.log(`Bricks remaining: ${this.bricks.countActive(true)}`);
                 }
                 console.log("Stage clear check finished.");

             } else {
                 // 耐久ブロックの見た目変更（仮）
                 brick.setTint(0xffaaaa);
                 console.log("Brick damaged, not destroyed.");
             }
         } else if (hits === -1) {
             // 破壊不可ブロックの場合
             console.log("Hit indestructible brick.");
         }
         console.log("Hit brick - End"); // ★ ここまでログが出るか確認
    }

    loseLife() {
        // ライフ減少処理は一度だけ実行されるようにする
        if (this.lives <= 0) {
             console.warn("loseLife called but already out of lives.");
             return;
        }
        if (!this.ball || !this.ball.active) {
            console.warn("loseLife called but ball is inactive.");
            // return; // ボールが非アクティブでもライフ減少処理は進めるべきか？ -> 進める
        }

        console.log(`Lose life - Lives before: ${this.lives}`);
        this.lives--;
        this.events.emit('updateLives', this.lives);
        console.log(`Lives after: ${this.lives}`);


        // ボールを非アクティブ化・非表示
        if (this.ball) {
             console.log("Deactivating ball due to life loss.");
             this.ball.setActive(false);
             this.ball.setVisible(false);
             if(this.ball.body) this.ball.body.enable = false;
        }

        if (this.lives > 0) {
            // 少し待ってからリセット処理
            console.log("Scheduling paddle and ball reset...");
            this.time.delayedCall(500, this.resetPaddleAndBall, [], this);
        } else {
            console.log("No lives left, scheduling game over...");
            // 少し待ってからゲームオーバー処理
            this.time.delayedCall(500, this.gameOver, [], this);
        }
    }

    resetPaddleAndBall() {
         console.log("Resetting paddle and ball - Start");
         // 物理演算が止まっている場合は再開しておく（リセット前に）
         if (!this.physics.world.running) {
             console.log("Resuming physics before reset.");
             this.physics.resume();
         }

        if (this.paddle) {
            this.paddle.x = this.gameWidth / 2;
            this.paddle.y = this.gameHeight - PADDLE_Y_OFFSET;
            this.paddle.setVelocity(0, 0);
        }

        // 新しいボールを作成
        this.createBall();

        // ★ボールとパドルのコライダーはcreateで設定済みなのでここでは不要
        // ★ボールとブロックのコライダーは setBallBrickCollider で管理

        this.isBallLaunched = false;
        console.log("Resetting paddle and ball - End");
    }

    gameOver() {
        console.log("Game Over - Start");
        if(this.gameOverText.visible) {
            console.warn("gameOver called but already game over.");
            return; // 既にゲームオーバーなら何もしない
        }
        this.gameOverText.setVisible(true);
        this.physics.pause(); // 物理演算を停止
        console.log("Physics paused for game over.");
        // ボールは loseLife で非アクティブ化されているはず
        console.log("Game Over - End");
    }

    stageClear() {
        console.log(`Stage Clear - Start (Stage ${this.currentStage})`);
        this.physics.pause(); // 物理演算を一時停止
        console.log("Physics paused for stage clear.");

        // ボールも一旦停止・非表示
        if(this.ball) {
            console.log("Deactivating ball for stage clear.");
            this.ball.setVelocity(0,0);
            this.ball.setVisible(false).setActive(false);
            if(this.ball.body) this.ball.body.enable = false;
        }

        // 短い待機時間（演出用）
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

                // ブロック再生成
                this.createBricks();
                // ★新しいブロックに対してコライダーを設定
                this.setBallBrickCollider();

                // パドルとボールリセット (新しいボールが生成される)
                this.resetPaddleAndBall();

                this.physics.resume();    // 物理演算を再開
                this.isBallLaunched = false;
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
        // 物理演算が止まっている場合は再開させてからシーン遷移（安全のため）
         if (!this.physics.world.running) {
            this.physics.resume();
         }
        this.scene.stop('UIScene');
        this.scene.start('TitleScene');
        console.log("Returning to TitleScene - End");
    }

    shutdown() {
        console.log("GameScene shutdown: Cleaning up...");
        if(this.input) this.input.removeAllListeners();
        if(this.time) this.time.removeAllEvents();
        // コライダー参照クリア
        this.ballPaddleCollider = null;
        this.ballBrickCollider = null;
        this.events.removeAllListeners();
        console.log("GameScene cleanup finished.");
    }
}

// --- UIScene ---
// (変更なし、前回のままでOK)
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText = null; this.scoreText = null; this.stageText = null; }
    create() {
        console.log("UIScene: Creating UI elements..."); this.gameWidth = this.scale.width;
        this.livesText = this.add.text(16, 16, 'ライフ: -', { fontSize: '24px', fill: '#fff' });
        this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: -', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5, 0);
        this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: 0', { fontSize: '24px', fill: '#fff' }).setOrigin(1, 0);
        try { this.scene.get('GameScene').events.on('start', this.registerGameEventListeners, this); } catch (e) { console.error("UIScene: Error getting GameScene on create.", e); }
        this.events.on('shutdown', () => {
            console.log("UIScene: Shutting down..."); try { if (this.scene.manager.getScene('GameScene')) { const gameScene = this.scene.get('GameScene'); if (gameScene && gameScene.events) { gameScene.events.off('updateLives', this.updateLivesDisplay, this); gameScene.events.off('updateScore', this.updateScoreDisplay, this); gameScene.events.off('updateStage', this.updateStageDisplay, this); gameScene.events.off('start', this.registerGameEventListeners, this); console.log("UIScene: Listeners removed."); } } else { console.log("UIScene: GameScene not found on shutdown."); } } catch (e) { console.error("UIScene: Error removing listeners on shutdown.", e); }
        });
    }
    registerGameEventListeners(gameScene) {
        console.log("UIScene: Registering event listeners for GameScene.");
        gameScene.events.off('updateLives', this.updateLivesDisplay, this); gameScene.events.off('updateScore', this.updateScoreDisplay, this); gameScene.events.off('updateStage', this.updateStageDisplay, this);
        gameScene.events.on('updateLives', this.updateLivesDisplay, this); gameScene.events.on('updateScore', this.updateScoreDisplay, this); gameScene.events.on('updateStage', this.updateStageDisplay, this);
        this.updateLivesDisplay(gameScene.lives); this.updateScoreDisplay(gameScene.score); this.updateStageDisplay(gameScene.currentStage);
    }
    updateLivesDisplay(lives) { if (this.livesText) { this.livesText.setText(`ライフ: ${lives}`); } }
    updateScoreDisplay(score) { if (this.scoreText) { this.scoreText.setText(`スコア: ${score}`); } }
    updateStageDisplay(stage) { if (this.stageText) { this.stageText.setText(`ステージ: ${stage}`); } }
}

// --- Phaserゲーム設定 ---
const config = {
    // ★★★ レンダラーをCanvasに強制 ★★★
    type: Phaser.CANVAS,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-example', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: {
        debug: true, // デバッグ表示継続
        // iOS/iPadOSでのパフォーマンス/安定性のため、FPSを調整してみる (オプション)
        // fps: 60, // または 30
        // fixedStep: true, // 物理演算のステップを固定 (オプション)
        // timeScale: 1 // 物理演算の速度 (オプション)
      }
    },
    // Canvas使用時のパフォーマンス設定 (オプション)
    render: {
        antialias: false, // アンチエイリアス無効化
        pixelArt: true, // ピクセルアートモード (ドット絵なら有効)
        // roundPixels: true // ピクセル座標を整数にする (場合によっては有効)
    },
    scene: [BootScene, TitleScene, GameScene, UIScene]
};


// --- ゲーム開始 ---
const game = new Phaser.Game(config);
