// --- 定数 ---
const PADDLE_WIDTH_RATIO = 0.2; // 画面幅に対するパドルの幅の割合
const PADDLE_HEIGHT = 20;
const PADDLE_Y_OFFSET = 50; // 画面下からの距離
const BALL_RADIUS = 10;
const BALL_INITIAL_VELOCITY_Y = -300; // ボール発射時のY軸初速
const BALL_INITIAL_VELOCITY_X_RANGE = [-150, 150]; // ボール発射時のX軸初速の範囲
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH_RATIO = 0.1; // 画面幅に対するブロック幅の割合
const BRICK_HEIGHT = 20;
const BRICK_SPACING = 4; // ブロック間の隙間
const BRICK_OFFSET_TOP = 60; // 画面上部からのブロック群のオフセット

const GAME_MODE = {
    NORMAL: 'normal',
    ALL_STARS: 'all_stars'
};

// ★ ブロックの色リストを追加
const BRICK_COLORS = [
    0xff0000, // Red
    0x0000ff, // Blue
    0x00ff00, // Green
    0xffff00, // Yellow
    0xff00ff, // Magenta
    0x00ffff, // Cyan
];


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
        this.scene.start('TitleScene'); // 読み込み完了後、タイトルシーンへ
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

        // ★ 背景色を少し明るく
        this.cameras.main.setBackgroundColor('#222222');

        // タイトルテキスト
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.2, '十二神将ブロック崩し', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.3, '(仮)', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

        // --- モード選択ボタン ---
        const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } };
        const buttonHoverStyle = { fill: '#ff0' };

        // 通常モードボタン
        const normalButton = this.add.text(this.gameWidth / 2, this.gameHeight * 0.5, '通常モード', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true }) // カーソル変更とインタラクション有効化
            .on('pointerover', () => normalButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => normalButton.setStyle(buttonStyle))
            .on('pointerdown', () => {
                console.log("通常モード選択");
                this.scene.start('GameScene', { mode: GAME_MODE.NORMAL }); // ゲームシーンを通常モードで開始
                this.scene.launch('UIScene'); // UIシーンも起動
            });

        // 全員集合モードボタン
        const allStarsButton = this.add.text(this.gameWidth / 2, this.gameHeight * 0.7, '全員集合モード', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => allStarsButton.setStyle(buttonHoverStyle))
            .on('pointerout', () => allStarsButton.setStyle(buttonStyle))
            .on('pointerdown', () => {
                console.log("全員集合モード選択");
                this.scene.start('GameScene', { mode: GAME_MODE.ALL_STARS }); // ゲームシーンを全員集合モードで開始
                this.scene.launch('UIScene'); // UIシーンも起動
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
        this.lives = 0; // initで設定
        this.gameOverText = null;
        this.isBallLaunched = false;
        this.gameWidth = 0;
        this.gameHeight = 0;
        this.currentMode = null; // 現在のゲームモード
        this.currentStage = 1; // 現在のステージ
        this.score = 0; // スコア
        this.ballPaddleCollider = null; // コライダー参照保持用
        this.ballBrickCollider = null;  // コライダー参照保持用
    }

    // シーン開始時にデータを受け取る
    init(data) {
        this.currentMode = data.mode || GAME_MODE.NORMAL; // デフォルトは通常モード
        console.log(`GameScene: Initializing with mode: ${this.currentMode}`);

        // モードに応じて初期ライフを設定
        if (this.currentMode === GAME_MODE.ALL_STARS) {
            this.lives = 1;
        } else {
            this.lives = 3; // 通常モードの初期ライフ
        }
         this.isBallLaunched = false; // ボール発射状態もリセット
         this.currentStage = 1; // ステージもリセット
         this.score = 0; // スコアもリセット
    }

    preload() {
        // GameScene固有のアセットがあればここで読み込む
    }

    create() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        console.log(`GameScene: Creating stage ${this.currentStage} for mode ${this.currentMode}`);

        // UIシーンへの初期値通知 (少し遅延)
        this.time.delayedCall(50, () => {
            if (this.scene.isActive('UIScene')) {
                this.events.emit('updateLives', this.lives);
                this.events.emit('updateScore', this.score);
                this.events.emit('updateStage', this.currentStage);
            }
        });

        // --- 物理ワールド設定 ---
        this.physics.world.setBoundsCollision(true, true, true, false); // 下辺以外で衝突

        // --- パドルの作成 ---
        const paddleWidth = this.gameWidth * PADDLE_WIDTH_RATIO;
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, null)
            .setDisplaySize(paddleWidth, PADDLE_HEIGHT)
            .setTint(0xffffff) // 白色
            .setImmovable(true); // 動かないオブジェクトに設定

        // --- ボールの作成 ---
        this.createBall(); // ボールを作成

        // --- ブロックの作成 ---
        this.createBricks(); // ブロックを作成

        // --- ゲームオーバー表示 (初期非表示) ---
        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Game Over\nタップで戻る', { fontSize: '48px', fill: '#f00', align: 'center' })
            .setOrigin(0.5)
            .setVisible(false)
            .setDepth(1); // 他の要素より手前に表示

        // --- 衝突処理の設定 ---
        this.setColliders(); // コライダーを設定

        // --- 入力処理 (スワイプ/マウス) ---
        this.input.on('pointermove', (pointer) => {
            if (this.lives > 0 && this.paddle) { // ライフがあり、パドルが存在すれば
                const paddleHalfWidth = this.paddle.displayWidth / 2;
                const targetX = Phaser.Math.Clamp(pointer.x, paddleHalfWidth, this.gameWidth - paddleHalfWidth);
                this.paddle.x = targetX;
                // 発射前のボールはパドルに追従
                if (!this.isBallLaunched && this.ball) {
                    this.ball.x = this.paddle.x;
                }
            }
        });

        // --- 入力処理 (タップ) ---
        this.input.on('pointerdown', () => {
            if (this.lives > 0) { // ライフがあれば
                if (!this.isBallLaunched) {
                    this.launchBall(); // ボールを発射
                }
            } else if (this.gameOverText && this.gameOverText.visible) { // ゲームオーバー表示中なら
                // タップでタイトルへ戻る
                this.returnToTitle();
            }
        });

        // --- シーン終了時のクリーンアップ ---
        this.events.on('shutdown', this.shutdown, this);
    }

    update() {
        if (this.lives <= 0) return; // ゲームオーバーなら何もしない

        // ボールが画面下に落ちたかチェック
        // オブジェクトが存在し、アクティブか確認してから判定
        if (this.ball && this.ball.active && this.ball.y > this.gameHeight) {
            console.log("Ball out of bounds");
            this.loseLife();
        }
    }

     // --- コライダー設定関数 ---
     setColliders() {
        // 古いコライダーがあれば破棄 (安全のため)
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy();
        if (this.ballBrickCollider) this.ballBrickCollider.destroy();

        // オブジェクトが存在するか確認
        if (!this.ball || !this.paddle || !this.bricks) {
            console.error("Cannot set colliders: ball, paddle, or bricks missing.");
            return;
        }

        // ボールとパドルの衝突
        this.ballPaddleCollider = this.physics.add.collider(
            this.ball,
            this.paddle,
            this.hitPaddle,
            null,
            this
        );

        // ボールとブロックの衝突
        this.ballBrickCollider = this.physics.add.collider(
            this.ball,
            this.bricks,
            this.hitBrick,
            null,
            this
        );
        console.log("Colliders set.");
    }

    // --- ボール作成関数 ---
    createBall() {
         if (this.ball) {
            this.ball.destroy(); // 既存のボールがあれば削除
        }
         // パドル基準で位置を決める (なければ中央)
         const initialX = this.paddle ? this.paddle.x : this.gameWidth / 2;
         const initialY = this.paddle ? this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS : this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2 - BALL_RADIUS;

        this.ball = this.physics.add.image(initialX, initialY, null)
            .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2)
            .setTint(0x00ff00) // 緑色
            .setCircle(BALL_RADIUS) // 円形の衝突判定
            .setCollideWorldBounds(true) // ワールド境界との衝突を有効化
            .setBounce(1); // 完全な反射

        this.isBallLaunched = false; // 発射フラグをリセット
        console.log("Ball created");
    }

    // --- ボール発射関数 ---
    launchBall() {
        // 発射されておらず、ボールが存在し、アクティブな場合
        if (!this.isBallLaunched && this.ball && this.ball.active) {
            const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]);
            this.ball.setVelocity(initialVelocityX, BALL_INITIAL_VELOCITY_Y);
            this.isBallLaunched = true;
            console.log(`Ball launched with velocity: ${initialVelocityX}, ${BALL_INITIAL_VELOCITY_Y}`);
        }
    }


    // --- ブロック作成関数 ---
    createBricks() {
        if (this.bricks) {
            this.bricks.destroy(true); // 既存のブロックグループがあれば削除
        }
        this.bricks = this.physics.add.staticGroup(); // 静的グループとして作成
        const brickWidth = this.gameWidth * BRICK_WIDTH_RATIO;
        const totalBricksWidth = BRICK_COLS * brickWidth + (BRICK_COLS - 1) * BRICK_SPACING;
        const offsetX = (this.gameWidth - totalBricksWidth) / 2; // 中央揃えのためのオフセット

        // モードによる難易度調整（仮：全員集合なら行数を増やす）
        const rows = this.currentMode === GAME_MODE.ALL_STARS ? BRICK_ROWS + 2 : BRICK_ROWS;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < BRICK_COLS; j++) {
                const brickX = offsetX + j * (brickWidth + BRICK_SPACING) + brickWidth / 2;
                const brickY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2;
                 // ★ BRICK_COLORS リストからランダムに色を選択
                 const randomColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS);
                this.bricks.create(brickX, brickY, null)
                    .setDisplaySize(brickWidth, BRICK_HEIGHT)
                    .setTint(randomColor) // ★ ランダムな明るい色を設定
                    .setData('hits', 1) // ヒット回数 (将来の耐久ブロック用)
                    .refreshBody(); // 静的オブジェクトの物理ボディを更新
            }
        }
        console.log(`Created ${this.bricks.getLength()} bricks`);
    }

    // --- パドルとの衝突処理 ---
    hitPaddle(ball, paddle) {
         if (!ball || !paddle || !ball.active) return; // オブジェクトが有効かチェック

        // パドルの中心からの距離に応じてボールのX方向の速度を変える
        let diff = ball.x - paddle.x;
        // 最大の変化量を設定 (例: パドル幅の半分で最大速度)
        const maxDiff = paddle.displayWidth / 2;
        const maxVelX = 250;
        ball.setVelocityX(maxVelX * (diff / maxDiff));

        // Y速度が小さすぎる場合に最低速度を保証する（ハマり防止）
        if (Math.abs(ball.body.velocity.y) < Math.abs(BALL_INITIAL_VELOCITY_Y * 0.5)) {
             ball.setVelocityY(BALL_INITIAL_VELOCITY_Y * (ball.body.velocity.y > 0 ? 0.5 : -0.5));
        }
        console.log("Hit paddle");
    }

    // --- ブロックとの衝突処理 ---
    hitBrick(ball, brick) {
         // オブジェクトが有効かチェック
         if (!ball || !brick || !ball.active || !brick.active) {
             console.warn("HitBrick called with inactive object.");
             return;
         }

        console.log("Hit brick");
        // TODO: 耐久度ブロックの処理
        brick.disableBody(true, true); // ブロックを非表示にし、物理演算を無効化

        this.score += 10; // スコア加算
        this.events.emit('updateScore', this.score); // UIシーンに通知

        // TODO: パワーアップアイテムドロップ処理

        // 全てのブロックが壊れたかチェック
        if (this.bricks.countActive(true) === 0) {
             console.log("All bricks cleared!");
            this.stageClear(); // ステージクリア処理へ
        }
    }

    // --- ライフ減少処理 ---
    loseLife() {
        // ライフが残っているか、ボールがアクティブかなどを確認
        if (this.lives > 0) {
            this.lives--;
            this.events.emit('updateLives', this.lives); // UIシーンに通知
            console.log(`Life lost. Lives remaining: ${this.lives}`);

             // ボールを非アクティブ化
             if (this.ball) {
                this.ball.setActive(false).setVisible(false);
                 if (this.ball.body) this.ball.body.enable = false;
             }

            if (this.lives > 0) {
                // 少し待ってからパドルとボールをリセット
                this.time.delayedCall(500, this.resetPaddleAndBall, [], this);
            } else {
                // ライフが0になったらゲームオーバー処理
                 this.time.delayedCall(500, this.gameOver, [], this);
            }
        } else {
             console.warn("loseLife called but no lives left.");
        }
    }

    // --- パドルとボールのリセット ---
    resetPaddleAndBall() {
        console.log("Resetting paddle and ball...");
        if (this.paddle) {
            this.paddle.x = this.gameWidth / 2;
            this.paddle.y = this.gameHeight - PADDLE_Y_OFFSET;
            this.paddle.setVelocity(0,0); // パドル速度もリセット
        }

        if (this.ball) {
             // 物理演算が停止している場合は再開
             if (!this.physics.world.running) {
                console.log("Resuming physics before ball reset.");
                this.physics.resume();
             }
            // ボールをパドルの上の中央に再配置
            const resetX = this.paddle ? this.paddle.x : this.gameWidth / 2;
            const resetY = this.paddle ? this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS : this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2 - BALL_RADIUS;
            this.ball.setPosition(resetX, resetY);
            // 速度を0にして物理ボディを再有効化
            this.ball.setVelocity(0, 0);
            this.ball.setActive(true); // アクティブ状態に
            this.ball.setVisible(true); // 可視状態に
             // 物理ボディが存在すれば有効化
             if (this.ball.body) {
                 this.ball.body.enable = true;
             } else {
                 console.error("Ball body not found during reset!");
             }
            console.log("Existing ball reset.");
        } else {
             // ボールが存在しない場合は再生成 (念のため)
             console.warn("Ball not found during reset, creating new one.");
             this.createBall();
             // ボールを作り直した場合、コライダーの再設定が必要になる可能性あり
             this.setColliders();
        }

        this.isBallLaunched = false; // 発射フラグをリセット
    }

    // --- ゲームオーバー処理 ---
    gameOver() {
        // すでに表示されている場合は何もしない
        if(this.gameOverText && this.gameOverText.visible) return;

        console.log("Game Over!");
         if (this.gameOverText) {
            this.gameOverText.setVisible(true);
         } else {
             console.error("gameOverText is not defined!");
         }
        this.physics.pause(); // 物理演算を停止
    }

    // --- ステージクリア処理 ---
    stageClear() {
        console.log(`Stage ${this.currentStage} Clear! Score: ${this.score}`);
        this.physics.pause(); // 物理演算を一時停止

        // ボールも一旦停止・非表示
        if(this.ball) {
            this.ball.setVelocity(0,0);
            this.ball.setVisible(false).setActive(false);
            if(this.ball.body) this.ball.body.enable = false;
        }

        // 仮のアラート表示
        alert(`ステージ ${this.currentStage} クリア！ (仮)`);

        this.currentStage++;
        const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12;

        if (this.currentStage > maxStages) {
             this.gameComplete(); // 全ステージクリア
        } else {
            // 次のステージへ
            console.log(`Starting Stage ${this.currentStage}`);
            this.events.emit('updateStage', this.currentStage); // UIに通知

            // 短い待機後、次のステージ準備
            this.time.delayedCall(500, () => {
                this.createBricks();      // 新しいブロック配置
                // ★重要: 新しいブロックグループに対してコライダーを再設定
                this.setColliders();
                this.resetPaddleAndBall(); // パドルとボールをリセット
                this.physics.resume();    // 物理演算を再開
                this.isBallLaunched = false;
            });
        }
    }

     // --- 全ステージクリア ---
     gameComplete() {
        console.log("All stages cleared!");
        // TODO: ゲームクリア画面の実装
        alert(`ゲームクリア！おめでとう！\n最終スコア: ${this.score} (仮)`);
        this.returnToTitle();
    }


    // --- タイトルシーンに戻る処理 ---
    returnToTitle() {
        console.log("Returning to TitleScene");
        // シーンがアクティブか確認
        if (this.scene.isActive()) {
             // 物理演算が止まっている場合は再開
             if (!this.physics.world.running) {
                 this.physics.resume();
             }
             // UIシーンを停止
             if (this.scene.isActive('UIScene')) {
                 this.scene.stop('UIScene');
             }
             // タイトルシーンを開始
            this.scene.start('TitleScene');
        } else {
            console.warn("GameScene is not active, cannot return to title.");
        }
    }

     // --- シーン終了時の処理 ---
    shutdown() {
        console.log("GameScene shutdown: Cleaning up...");
        // タイマーやイベントリスナーを削除
        if(this.input) this.input.removeAllListeners();
        if(this.time) this.time.removeAllEvents();
        // コライダー参照クリア
        this.ballPaddleCollider = null;
        this.ballBrickCollider = null;
        // GameScene->UISceneのイベントリスナーも削除
        this.events.removeAllListeners();
        console.log("GameScene cleanup finished.");
    }
}

// --- UIScene (UI表示) ---
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false }); // 初期状態は非アクティブ
        this.livesText = null;
        this.scoreText = null;
        this.stageText = null;
    }

    create() {
        console.log("UIScene: Creating UI elements...");
        this.gameWidth = this.scale.width;

        // --- UI要素の作成 ---
        this.livesText = this.add.text(16, 16, 'ライフ: -', { fontSize: '24px', fill: '#fff' });
        this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: -', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5, 0); // 中央揃え
        this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: 0', { fontSize: '24px', fill: '#fff' }).setOrigin(1, 0); // 右寄せ

        // --- GameSceneからのイベントリスナー設定 ---
         try {
             const gameScene = this.scene.get('GameScene');
             if (gameScene) {
                 this.registerGameEventListeners(gameScene);
             } else {
                 // GameSceneが見つからない場合、起動イベントを待つ方がより安全
                 console.warn("UIScene: GameScene not found immediately. Listening for start event.");
                 this.scene.get('GameScene').events.once('start', this.registerGameEventListeners, this);
             }
        } catch (e) {
             console.error("UIScene: Error getting GameScene or setting listeners.", e);
        }

         // UIScene破棄時のリスナー削除
        this.events.on('shutdown', () => {
            console.log("UIScene: Shutting down, attempting to remove listeners.");
             try {
                // GameSceneがまだ存在すればリスナーを削除
                if (this.scene.manager.getScene('GameScene')) {
                     const gameScene = this.scene.get('GameScene');
                     if (gameScene && gameScene.events) {
                        gameScene.events.off('updateLives', this.updateLivesDisplay, this);
                        gameScene.events.off('updateScore', this.updateScoreDisplay, this);
                        gameScene.events.off('updateStage', this.updateStageDisplay, this);
                        gameScene.events.off('start', this.registerGameEventListeners, this); // startイベントリスナーも削除
                        console.log("UIScene: Listeners removed from GameScene.");
                    }
                } else {
                     console.log("UIScene: GameScene not found on shutdown, no listeners to remove.");
                }
            } catch (e) {
                 console.error("UIScene: Error removing listeners on shutdown.", e);
            }
        });
    }

    // イベントリスナーを登録する関数
    registerGameEventListeners(gameScene) {
         // gameScene が有効かチェック
         if (!gameScene || !gameScene.events) {
             console.error("UIScene: Cannot register listeners, invalid GameScene or events.");
             return;
         }
         console.log("UIScene: Registering event listeners for GameScene.");
         // 既存のリスナーがあれば念のため削除
         gameScene.events.off('updateLives', this.updateLivesDisplay, this);
         gameScene.events.off('updateScore', this.updateScoreDisplay, this);
         gameScene.events.off('updateStage', this.updateStageDisplay, this);
         // 新しいリスナーを登録
         gameScene.events.on('updateLives', this.updateLivesDisplay, this);
         gameScene.events.on('updateScore', this.updateScoreDisplay, this);
         gameScene.events.on('updateStage', this.updateStageDisplay, this);

         // GameSceneの現在の値で初期表示
         // GameSceneのプロパティが存在するか確認してからアクセス
         if (gameScene.hasOwnProperty('lives')) this.updateLivesDisplay(gameScene.lives);
         if (gameScene.hasOwnProperty('score')) this.updateScoreDisplay(gameScene.score);
         if (gameScene.hasOwnProperty('currentStage')) this.updateStageDisplay(gameScene.currentStage);
    }

     // ライフ表示更新
    updateLivesDisplay(lives) {
        if (this.livesText) this.livesText.setText(`ライフ: ${lives}`);
    }
    // スコア表示更新
    updateScoreDisplay(score) {
       if (this.scoreText) this.scoreText.setText(`スコア: ${score}`);
    }
    // ステージ表示更新
    updateStageDisplay(stage) {
        if (this.stageText) this.stageText.setText(`ステージ: ${stage}`);
    }
}


// --- Phaserゲーム設定 ---
const config = {
    type: Phaser.AUTO, // WebGL優先、不可ならCanvas
    scale: {
        mode: Phaser.Scale.FIT, // 画面に合わせてスケール
        parent: 'phaser-example', // HTML内の要素ID (今回はbody直下なので不要かも)
        autoCenter: Phaser.Scale.CENTER_BOTH, // 画面中央に配置
        width: '100%', // 幅を親要素に合わせる
        height: '100%' // 高さを親要素に合わせる
    },
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: { y: 0 }, // 重力なし
            debug: false // 物理演算のデバッグ表示 (trueにすると当たり判定が見える)
        }
    },
    // backgroundColor: '#000000', // 必要なら背景色を明示的に設定 (今回はTitleSceneで設定)
    scene: [BootScene, TitleScene, GameScene, UIScene] // 使用するシーンのリスト
};

// --- ゲーム開始 ---
const game = new Phaser.Game(config);
