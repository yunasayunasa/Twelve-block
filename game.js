// --- 定数 ---
// (変更なし)
const PADDLE_WIDTH_RATIO = 0.2; const PADDLE_HEIGHT = 20; const PADDLE_Y_OFFSET = 50;
const BALL_RADIUS = 10; const BALL_INITIAL_VELOCITY_Y = -300; const BALL_INITIAL_VELOCITY_X_RANGE = [-150, 150];
const BRICK_ROWS = 5; const BRICK_COLS = 8; const BRICK_WIDTH_RATIO = 0.1; const BRICK_HEIGHT = 20;
const BRICK_SPACING = 4; const BRICK_OFFSET_TOP = 60;
const GAME_MODE = { NORMAL: 'normal', ALL_STARS: 'all_stars' };

// --- BootScene --- (変更なし)
class BootScene extends Phaser.Scene { /* ... */ }

// --- TitleScene --- (変更なし)
class TitleScene extends Phaser.Scene { /* ... */ }

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

    preload() { /* ... */ }

    create() {
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height;
        console.log(`GameScene: Create Start - Stage ${this.currentStage}, Mode ${this.currentMode}`);
        this.time.delayedCall(50, () => { /* UI初期値通知 */ });
        this.physics.world.setBoundsCollision(true, true, true, false);
        const paddleWidth = this.gameWidth * PADDLE_WIDTH_RATIO;
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, null)
            .setDisplaySize(paddleWidth, PADDLE_HEIGHT).setTint(0xffffff).setImmovable(true).setCollideWorldBounds(true);
        this.createBall();
        this.createBricks(); // この中で setBallBrickCollider が呼ばれるように変更が必要かも → createBricksの後で呼ぶ
        this.gameOverText = this.add.text(/* ... */).setVisible(false);

        // コライダー設定
        this.ballPaddleCollider = this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.setBallBrickCollider(); // ブロック用コライダー

        // 入力処理
        this.input.on('pointermove', /* ... */ );
        this.input.on('pointerdown', () => {
             if (this.lives > 0 && !this.isStageClearing) { // ステージクリア中は発射しない
                 if (!this.isBallLaunched) { this.launchBall(); }
             } else if (this.gameOverText.visible) { // ゲームオーバー表示後なら
                 this.returnToTitle();
             }
        });
        this.events.on('shutdown', this.shutdown, this);
        console.log("GameScene: Create End");
    }

    // ★★★ update メソッドを修正 ★★★
    update(time, delta) { // time と delta を受け取る
        if (this.lives <= 0 || this.isStageClearing) return; // ライフゼロ or ステージクリア中は処理停止

        // ボール落下チェック
        if (this.ball && this.ball.y > this.gameHeight + this.ball.displayHeight) {
             if (this.lives > 0 && this.ball.active) { // ライフがあり、ボールがアクティブなら
                 console.log("Ball out of bounds - calling loseLife");
                 this.loseLife();
             }
        }

        // ★ 衝突したブロックの処理をここで行う ★
        this.processBrickHits();

    }

    // ★★★ 衝突したブロックを処理する関数 ★★★
    processBrickHits() {
        if (this.bricksHitThisFrame.length === 0) {
            return; // 処理対象がなければ抜ける
        }

        console.log(`Processing ${this.bricksHitThisFrame.length} brick hits...`);
        let needsStageClearCheck = false; // ステージクリアチェックが必要か

        // 配列内の各ブロックを処理
        this.bricksHitThisFrame.forEach(brick => {
            if (brick.active) { // まだアクティブなブロックのみ処理
                const brickData = brick.getData();
                let hits = brickData.hits;

                if (hits > 0) { // 破壊不可でない場合
                    hits--;
                    brick.setData('hits', hits);
                    console.log(`Brick processed, hits remaining: ${hits}`);

                    if (hits <= 0) {
                        // ★ setActive/setVisible を使う (disableBodyは使わない)
                        brick.setActive(false);
                        brick.setVisible(false);
                        console.log("Brick deactivated.");

                        // スコア加算とUI更新
                        this.score += 10;
                        this.events.emit('updateScore', this.score);
                        console.log(`Score updated: ${this.score}`);
                        needsStageClearCheck = true; // ブロックが破壊されたのでチェック要

                        // TODO: パワーアップアイテムドロップ処理

                    } else {
                        // 耐久ブロックの見た目変更
                        brick.setTint(0xffaaaa);
                        console.log("Brick damaged.");
                    }
                }
            }
        });

        // 処理が終わったので配列をクリア
        this.bricksHitThisFrame = [];
        console.log("Brick hit processing finished.");

        // ステージクリアチェックが必要な場合
        if (needsStageClearCheck) {
             console.log("Checking for stage clear...");
             if (this.bricks.countActive(true) === 0) {
                 console.log("All bricks cleared!");
                 this.stageClear();
             } else {
                 console.log(`Bricks remaining: ${this.bricks.countActive(true)}`);
             }
        }
    }


    setBallBrickCollider() {
        if (this.ballBrickCollider) { this.ballBrickCollider.destroy(); this.ballBrickCollider = null; }
        if (!this.ball || !this.bricks) { return; }
        this.ballBrickCollider = this.physics.add.collider(
            this.ball,
            this.bricks,
            this.hitBrick, // ★ コールバック自体は hitBrick のまま
            null,
            this
        );
        console.log("New Ball-Brick collider set.");
    }


    createBall() {
        if (this.ball) { this.ball.destroy(); }
        this.ball = this.physics.add.image(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS, null)
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
        // ★ createBricks の中でコライダー再設定はしない
    }

    hitPaddle(ball, paddle) { /* ...前回と同じ... */ }

    // ★★★ hitBrick 関数を大幅に簡略化 ★★★
    hitBrick(ball, brick) {
         if (!ball || !brick || !ball.active || !brick.active) {
             return; // 無効なオブジェクトは無視
         }

         // ★ 衝突したブロックを配列に追加するだけ ★
         // 同じフレームで複数回ヒットする場合があるので、重複チェック
         if (!this.bricksHitThisFrame.includes(brick)) {
             this.bricksHitThisFrame.push(brick);
             console.log("Hit brick - Added to processing list."); // ★ ログ変更
         } else {
             // console.log("Hit brick - Already in list for this frame."); // デバッグ用
         }
         // ★ ここで他の処理 (disableBody, setActive, スコア加算など) は一切行わない
    }

    loseLife() {
        if (this.lives <= 0 || this.isStageClearing) return; // ライフゼロ or ステージクリア中は処理しない
        console.log(`Lose life - Lives before: ${this.lives}`);
        this.lives--; this.events.emit('updateLives', this.lives);
        console.log(`Lives after: ${this.lives}`);
        if (this.ball) { this.ball.setActive(false).setVisible(false); if(this.ball.body) this.ball.body.enable = false; }
        if (this.lives > 0) { this.time.delayedCall(500, this.resetPaddleAndBall, [], this); }
        else { this.time.delayedCall(500, this.gameOver, [], this); }
    }

    resetPaddleAndBall() {
         console.log("Resetting paddle and ball - Start");
         if (!this.physics.world.running) { this.physics.resume(); }
         if (this.paddle) { this.paddle.x = this.gameWidth / 2; this.paddle.y = this.gameHeight - PADDLE_Y_OFFSET; this.paddle.setVelocity(0, 0); }
         this.createBall();
         // ★ ボールとブロックのコライダーは setBallBrickCollider で管理されているので、ここでは不要
         this.isBallLaunched = false;
         console.log("Resetting paddle and ball - End");
    }

    gameOver() {
        console.log("Game Over - Start");
        if(this.gameOverText.visible) return;
        this.gameOverText.setVisible(true);
        this.physics.pause();
        console.log("Game Over - End");
    }

    stageClear() {
        if (this.isStageClearing) return; // 既に処理中なら抜ける
        console.log(`Stage Clear - Start (Stage ${this.currentStage})`);
        this.isStageClearing = true; // 処理中フラグを立てる
        this.physics.pause();

        if(this.ball) { this.ball.setVelocity(0,0).setVisible(false).setActive(false); if(this.ball.body) this.ball.body.enable = false; }

        console.log("Scheduling next stage transition...");
        this.time.delayedCall(1000, () => {
            console.log("Executing next stage transition...");
            this.currentStage++;
            const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12;

            if (this.currentStage > maxStages) {
                 console.log("All stages complete!");
                 this.gameComplete(); // この中で returnToTitle が呼ばれる
            } else {
                console.log(`Starting next stage: ${this.currentStage}`);
                this.events.emit('updateStage', this.currentStage);
                this.createBricks(); // ブロック再生成
                this.setBallBrickCollider(); // ★ 新しいブロックにコライダー設定
                this.resetPaddleAndBall(); // パドルとボールリセット
                this.isStageClearing = false; // ★ フラグ解除
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
        if (!this.physics.world.running) { this.physics.resume(); }
        this.scene.stop('UIScene');
        this.scene.start('TitleScene');
        console.log("Returning to TitleScene - End");
    }

    shutdown() { /* ...前回と同じ... */ }
}

// --- UIScene --- (変更なし)
class UIScene extends Phaser.Scene { /* ... */ }

// --- Phaserゲーム設定 ---
const config = {
    // ★ type は AUTO に戻す
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-example', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { debug: true } },
    scene: [BootScene, TitleScene, GameScene, UIScene]
};

// --- ゲーム開始 ---
const game = new Phaser.Game(config);
