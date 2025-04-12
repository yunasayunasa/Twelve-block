// --- 定数 ---
const PADDLE_WIDTH_RATIO = 0.2; const PADDLE_HEIGHT = 20; const PADDLE_Y_OFFSET = 50;
const BALL_RADIUS = 12; // ユーザー調整値
const BALL_INITIAL_VELOCITY_Y = -350; // ユーザー調整値
const BALL_INITIAL_VELOCITY_X_RANGE = [-150, 150];
const BRICK_ROWS = 5; const BRICK_COLS = 8; const BRICK_WIDTH_RATIO = 0.1; const BRICK_HEIGHT = 20;
const BRICK_SPACING = 4;
const BRICK_OFFSET_TOP = 100; // ユーザー調整値

const GAME_MODE = { NORMAL: 'normal', ALL_STARS: 'all_stars' };
const BRICK_COLORS = [ 0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff ];

const POWERUP_DROP_RATE = 0.1;
const POWERUP_SIZE = 15;
const POWERUP_SPEED_Y = 100;
const POWERUP_TYPES = {
    KUBIRA: 'kubira',
    SHATORA: 'shatora',
    HAILA: 'haila',
    ANCHIRA: 'anchira', // ★ 追加
    SINDARA: 'sindara'  // ★ 追加
};
const POWERUP_COLORS = {
    [POWERUP_TYPES.KUBIRA]: 0x800080, // 紫
    [POWERUP_TYPES.SHATORA]: 0xffa500, // オレンジ
    [POWERUP_TYPES.HAILA]: 0xadd8e6,  // 水色
    [POWERUP_TYPES.ANCHIRA]: 0xffc0cb, // ピンク (仮)
    [POWERUP_TYPES.SINDARA]: 0xd2b48c, // 茶色 (仮)
};
const POWERUP_DURATION = {
    [POWERUP_TYPES.KUBIRA]: 10000, // 10秒 (ユーザー調整値反映)
    [POWERUP_TYPES.SHATORA]: 3000, // 3秒
    [POWERUP_TYPES.HAILA]: 10000, // 10秒
    // アンチラ、シンダラは時間ではなく条件で解除
};
const NORMAL_BALL_SPEED = Math.abs(BALL_INITIAL_VELOCITY_Y);
const BALL_SPEED_MODIFIERS = {
    [POWERUP_TYPES.SHATORA]: 3.0,
    [POWERUP_TYPES.HAILA]: 0.3
};


// --- BootScene --- (変更なし)
class BootScene extends Phaser.Scene { /* ... */ }

// --- TitleScene --- (変更なし)
class TitleScene extends Phaser.Scene { /* ... */ }

// --- GameScene (ゲームプレイ画面) ---
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.paddle = null;
        // this.ball = null; // ← 単一ボール管理をやめる
        this.balls = null;    // ★ ボールを格納する物理グループに変更
        this.bricks = null;
        this.powerUps = null;
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
        this.ballBrickOverlap = null;
        this.activePowerUp = null;
        this.powerUpTimer = null;
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
        this.cameras.main.setBackgroundColor('#222222');

        this.time.delayedCall(50, () => { /* UI初期値通知 */ });

        this.physics.world.setBoundsCollision(true, true, true, false);

        const paddleWidth = this.gameWidth * PADDLE_WIDTH_RATIO;
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, null)
            .setDisplaySize(paddleWidth, PADDLE_HEIGHT).setTint(0xffffff).setImmovable(true);

        // ★ ボールグループを作成
        this.balls = this.physics.add.group({
            bounceX: 1,         // X方向の反発係数
            bounceY: 1,         // Y方向の反発係数
            collideWorldBounds: true // ワールド境界との衝突
        });

        // ★ 最初のボールを作成してグループに追加
        this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);

        this.createBricks();

        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Game Over\nタップで戻る', { fontSize: '48px', fill: '#f00', align: 'center' })
            .setOrigin(0.5).setVisible(false).setDepth(1);

        this.powerUps = this.physics.add.group();

        // ★ コライダー/Overlap設定をボールグループに対して行うように変更
        this.setColliders();

        this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);

        // 入力処理
        this.input.on('pointermove', (pointer) => {
            if (this.lives > 0 && this.paddle) {
                const paddleHalfWidth = this.paddle.displayWidth / 2;
                const targetX = Phaser.Math.Clamp(pointer.x, paddleHalfWidth, this.gameWidth - paddleHalfWidth);
                this.paddle.x = targetX;
                // ★ 発射前のボール(複数対応)をパドルに追従させる
                if (!this.isBallLaunched) {
                    this.balls.getChildren().forEach(ball => {
                        if (ball.active) { // 念のためアクティブチェック
                            ball.x = this.paddle.x;
                        }
                    });
                }
            }
        });
        this.input.on('pointerdown', () => {
            if (this.lives > 0) {
                if (!this.isBallLaunched) { this.launchBall(); } // ★ 最初のボールを発射
            } else if (this.gameOverText && this.gameOverText.visible) { this.returnToTitle(); }
        });
        this.events.on('shutdown', this.shutdown, this);
    }

    update() {
        if (this.lives <= 0) return;

        // ★ ボール落下処理 (グループ内のボールをチェック)
        let activeBalls = 0;
        this.balls.getChildren().forEach(ball => {
            if (ball.active) {
                activeBalls++;
                if (ball.y > this.gameHeight + ball.displayHeight) { // 画面下に落ちたボール
                    console.log("Ball out of bounds, deactivating.");
                    ball.setActive(false); // 非アクティブ化
                    ball.setVisible(false);
                    if (ball.body) ball.body.enable = false; // 物理ボディも無効化
                }
            }
        });

        // ★ アクティブなボールが0になったらライフ減少処理
        if (activeBalls === 0 && this.isBallLaunched && this.lives > 0) {
             console.log("No active balls left.");
             this.loseLife();
        }


        // パワーアップアイテムが画面外に出たら削除
        this.powerUps.children.each(powerUp => { /* ...前回と同じ... */ });

        // TODO: アンチラの解除条件チェック (ボールが1つになったら)
        if (this.activePowerUp === POWERUP_TYPES.ANCHIRA && this.balls.countActive(true) === 1) {
             console.log("Anchira effect ending: only one ball left.");
             this.deactivateCurrentPower();
        }

        // TODO: シンダラの更新処理 (引き合う力など)
        if (this.activePowerUp === POWERUP_TYPES.SINDARA) {
            // this.updateSindaraBalls();
        }
    }

    // ★★★ コライダー設定関数 (ボールグループ対応) ★★★
    setColliders() {
        // 既存のコライダー/Overlapを破棄
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy();
        if (this.ballBrickCollider) this.ballBrickCollider.destroy();
        if (this.ballBrickOverlap) this.ballBrickOverlap.destroy();

        // オブジェクト存在チェック
        if (!this.balls || !this.paddle || !this.bricks) { console.error("Missing object for colliders"); return; }

        // ★ パドルとボールグループの衝突
        this.ballPaddleCollider = this.physics.add.collider(
            this.paddle, // 先に書く方が良い場合がある
            this.balls,
            this.hitPaddle, // コールバック関数
            null,           // processCallback
            this            // context
        );

        // ★ ブロックとボールグループの衝突 (デフォルト)
        this.ballBrickCollider = this.physics.add.collider(
            this.bricks, // 先に書く方が良い場合がある
            this.balls,
            this.hitBrick, // コールバック関数
            null,         // processCallback
            this          // context
        );

        // ★ クビラ用Overlap (ボールグループ対応)
        this.ballBrickOverlap = this.physics.add.overlap(
            this.balls,
            this.bricks,
            this.handleBallBrickOverlapForKubira,
            null,
            this
        );
        this.ballBrickOverlap.active = false; // 初期状態は無効

        // TODO: シンダラ用のボール同士の衝突判定
        // this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, null, this);

        console.log("Colliders (and Overlap) set for ball group.");
    }

    // ★★★ ボール生成・追加関数 ★★★
    createAndAddBall(x, y, initialVelocityX = 0, initialVelocityY = 0) {
        const ball = this.balls.create(x, y, null) // グループのcreateメソッドを使用
            .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2)
            .setTint(0x00ff00) // デフォルトは緑
            .setCircle(BALL_RADIUS)
            .setCollideWorldBounds(true) // ワールド境界と衝突
            .setBounce(1);          // 跳ね返り

        // 速度を設定
        if (ball.body) { // ボディがあるか確認
             ball.setVelocity(initialVelocityX, initialVelocityY);
             ball.body.onWorldBounds = true; // ワールド境界衝突イベントを有効に (必要なら)
        } else {
             console.error("Failed to create ball body!");
        }

        // ★ 現在アクティブなパワーアップの効果を新しいボールにも適用するか？ (能力による)
        if (this.activePowerUp) {
            this.applyPowerUpEffectToBall(ball, this.activePowerUp);
        }

        console.log(`Ball created and added to group at ${x.toFixed(0)}, ${y.toFixed(0)}`);
        return ball; // 生成したボールを返す
    }

     // ★★★ launchBall 関数 (ボールグループ対応) ★★★
    launchBall() {
        // まだ発射されておらず、ボールグループが存在する場合
        if (!this.isBallLaunched && this.balls) {
            // グループ内の最初のアクティブなボールを取得 (通常は1球のはず)
            const firstBall = this.balls.getFirstAlive();
            if (firstBall) {
                 const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]);
                 firstBall.setVelocity(initialVelocityX, BALL_INITIAL_VELOCITY_Y);
                 this.isBallLaunched = true;
                 console.log(`Ball launched with velocity: ${initialVelocityX}, ${BALL_INITIAL_VELOCITY_Y}`);
            } else {
                 console.warn("Cannot launch ball - no active ball found in group.");
            }
        }
    }

    createBricks() { /* ...前回と同じ... */ }

    // ★★★ hitPaddle 関数 (ボールグループ対応) ★★★
    // 引数の順序が collider の設定順 (paddle, ball) になる点に注意
    hitPaddle(paddle, ball) {
        if (!paddle || !ball || !ball.active) return;
        let diff = ball.x - paddle.x;
        const maxDiff = paddle.displayWidth / 2;
        const maxVelX = 250;
        ball.setVelocityX(maxVelX * (diff / maxDiff));
        // Y速度の調整 (前回と同じ)
        if (Math.abs(ball.body.velocity.y) < Math.abs(BALL_INITIAL_VELOCITY_Y * 0.5)) {
            ball.setVelocityY(BALL_INITIAL_VELOCITY_Y * (ball.body.velocity.y > 0 ? 0.5 : -0.5));
        }
    }

    // ★★★ hitBrick 関数 (ボールグループ対応) ★★★
    // 引数の順序が collider の設定順 (brick, ball) になる点に注意
    hitBrick(brick, ball) {
         if (!brick || !ball || !brick.active || !ball.active) return;
         brick.disableBody(true, true);
         this.score += 10;
         this.events.emit('updateScore', this.score);

         // パワーアップドロップ判定
         if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) {
             this.dropPowerUp(brick.x, brick.y);
         }

         if (this.bricks.countActive(true) === 0) { this.stageClear(); }
    }

    dropPowerUp(x, y) {
        // ★ ドロップするタイプにアンチラ、シンダラを追加 (仮)
        const availableTypes = [
             POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA,
             POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA
        ];
        const type = Phaser.Utils.Array.GetRandom(availableTypes);
        const color = POWERUP_COLORS[type] || 0xffffff;

        console.log(`Dropping PowerUp: ${type} at ${x.toFixed(0)}, ${y.toFixed(0)}`);
        const powerUp = this.powerUps.create(x, y, null)
            .setDisplaySize(POWERUP_SIZE, POWERUP_SIZE).setTint(color).setData('type', type);
        if (powerUp.body) { powerUp.setVelocity(0, POWERUP_SPEED_Y); powerUp.body.setCollideWorldBounds(false); }
        else { console.error("Failed to create powerup body!"); }
    }

    collectPowerUp(paddle, powerUp) {
        if (!powerUp.active) return;
        const type = powerUp.getData('type');
        console.log(`Collected PowerUp: ${type}`);
        powerUp.destroy();

        // ★ アンチラ・シンダラ取得時の特殊処理
        if (type === POWERUP_TYPES.ANCHIRA || type === POWERUP_TYPES.SINDARA) {
             // 既存のボールが多い場合、一番遠いボール以外を消す
             if (this.balls.countActive(true) > 1) {
                 this.keepFurthestBall();
             }
        }

        this.activatePower(type);
    }

    // ★ 一番遠いボール以外を消す関数 (アンチラ・シンダラ取得時用)
    keepFurthestBall() {
         const activeBalls = this.balls.getMatching('active', true);
         if (activeBalls.length <= 1) return; // 消す対象がない

         let furthestBall = null;
         let maxDistSq = -1;

         // パドルから最も遠いボールを探す
         activeBalls.forEach(ball => {
             const distSq = Phaser.Math.Distance.Squared(this.paddle.x, this.paddle.y, ball.x, ball.y);
             if (distSq > maxDistSq) {
                 maxDistSq = distSq;
                 furthestBall = ball;
             }
         });

         console.log(`Keeping furthest ball (distSq=${maxDistSq.toFixed(0)})`);

         // 最遠ボール以外を削除
         activeBalls.forEach(ball => {
             if (ball !== furthestBall) {
                 console.log("Removing extra ball");
                 ball.destroy(); // グループからも削除される
             }
         });
    }


    // ★★★ activatePower 関数 (ボールグループ対応、アンチラ・シンダラ分岐追加) ★★★
    activatePower(type) {
        this.deactivateCurrentPower(); // 以前のパワーアップを解除

        this.activePowerUp = type;
        console.log(`Activating Power: ${type}`);

        // 適用対象のボールを取得 (通常は1球のはずだが、念のため)
        const targetBalls = this.balls.getMatching('active', true);
        if (targetBalls.length === 0) {
            console.warn("Cannot activate power, no active balls.");
            this.activePowerUp = null;
            return;
        }
        // const mainBall = targetBalls[0]; // 最初のボールを基準にするなど

        // タイプに応じた発動処理
        if (type === POWERUP_TYPES.KUBIRA) { this.activateKubira(targetBalls); } // 引数でボールを渡すように変更
        else if (type === POWERUP_TYPES.SHATORA) { this.activateShatora(targetBalls); }
        else if (type === POWERUP_TYPES.HAILA) { this.activateHaira(targetBalls); }
        else if (type === POWERUP_TYPES.ANCHIRA) { this.activateAnchira(targetBalls[0]); } // アンチラは基準ボールが必要
        else if (type === POWERUP_TYPES.SINDARA) { this.activateSindara(targetBalls[0]); } // シンダラも基準ボールが必要

        // 時間制限のあるパワーアップのタイマー設定
        const duration = POWERUP_DURATION[type];
        if (duration) {
            this.powerUpTimer = this.time.delayedCall(duration, this.deactivateCurrentPower, [], this);
            console.log(`PowerUp Timer set for ${duration}ms`);
        }
    }

    // ★★★ deactivateCurrentPower 関数 (ボールグループ対応) ★★★
    deactivateCurrentPower() {
        if (!this.activePowerUp) return;
        console.log(`Deactivating Power: ${this.activePowerUp}`);
        const type = this.activePowerUp;
        this.activePowerUp = null;
        if (this.powerUpTimer) { this.powerUpTimer.remove(); this.powerUpTimer = null; console.log("PowerUp Timer removed"); }

        // 全てのアクティブなボールに対して解除処理を行う
        const activeBalls = this.balls.getMatching('active', true);

        if (type === POWERUP_TYPES.KUBIRA) { this.deactivateKubira(activeBalls); }
        else if (type === POWERUP_TYPES.SHATORA) { this.deactivateShatora(activeBalls); }
        else if (type === POWERUP_TYPES.HAILA) { this.deactivateHaira(activeBalls); }
        else if (type === POWERUP_TYPES.ANCHIRA) { this.deactivateAnchira(activeBalls); }
        else if (type === POWERUP_TYPES.SINDARA) { this.deactivateSindara(activeBalls); }

        // 全ボールの見た目をデフォルトに戻す & 速度リセット
        activeBalls.forEach(ball => {
            ball.setTint(0x00ff00); // 緑色
            if (type === POWERUP_TYPES.SHATORA || type === POWERUP_TYPES.HAILA) {
                this.resetBallSpeed(ball); // ★ 個別のボールに対して速度リセット
            }
        });
    }

    // ★ ボール速度リセット関数 (引数でボールを受け取る)
    resetBallSpeed(ball) {
        if (!ball || !ball.active || !ball.body) return;
        const currentVelocity = ball.body.velocity;
        const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
        ball.setVelocity(direction.x * NORMAL_BALL_SPEED, direction.y * NORMAL_BALL_SPEED);
        // console.log(`Ball speed reset to normal (${NORMAL_BALL_SPEED})`); // ログ多すぎるのでコメントアウト
    }

    // ★ パワーアップ効果を特定のボールに適用するヘルパー関数
    applyPowerUpEffectToBall(ball, powerType) {
        if (!ball || !powerType) return;

        ball.setTint(POWERUP_COLORS[powerType] || 0x00ff00); // 色設定

        if (powerType === POWERUP_TYPES.KUBIRA) {
             ball.setData('isPenetrating', true);
             // Collider/Overlapのアクティブ状態は activateKubira で全体管理
        } else if (powerType === POWERUP_TYPES.SHATORA) {
             ball.setData('isFast', true);
             const speedMultiplier = BALL_SPEED_MODIFIERS[powerType];
             const direction = ball.body.velocity.length() > 0 ? ball.body.velocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
             ball.setVelocity(direction.x * NORMAL_BALL_SPEED * speedMultiplier, direction.y * NORMAL_BALL_SPEED * speedMultiplier);
        } else if (powerType === POWERUP_TYPES.HAILA) {
             ball.setData('isSlow', true);
              const speedMultiplier = BALL_SPEED_MODIFIERS[powerType];
              const direction = ball.body.velocity.length() > 0 ? ball.body.velocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
              ball.setVelocity(direction.x * NORMAL_BALL_SPEED * speedMultiplier, direction.y * NORMAL_BALL_SPEED * speedMultiplier);
        }
        // アンチラ、シンダラは特殊なのでここでは扱わない
    }


    // ★★★ クビラ関連関数 (ボールグループ対応) ★★★
    activateKubira(balls) {
        console.log("Activating Kubira for ball group");
        balls.forEach(ball => {
            ball.setData('isPenetrating', true);
            ball.setTint(POWERUP_COLORS[POWERUP_TYPES.KUBIRA]);
        });
        if (this.ballBrickCollider) this.ballBrickCollider.active = false;
        if (this.ballBrickOverlap) this.ballBrickOverlap.active = true;
        console.log("Kubira activated: Collider disabled, Overlap enabled.");
    }
    deactivateKubira(balls) {
        console.log("Deactivating Kubira for ball group");
        balls.forEach(ball => {
             ball.setData('isPenetrating', false);
        });
         if (this.ballBrickOverlap) this.ballBrickOverlap.active = false;
         if (this.ballBrickCollider && this.ballBrickCollider.world) this.ballBrickCollider.active = true;
         console.log("Kubira deactivated: Overlap disabled, Collider enabled.");
    }
    // handleBallBrickOverlapForKubira はボール個別に呼ばれるので変更不要だが、引数順序に注意
    // (overlap 設定順 ball, brick なのでそのはず)
    handleBallBrickOverlapForKubira(ball, brick) {
        if (!ball || !brick || !ball.active || !brick.active || !ball.getData('isPenetrating')) return;
        // console.log("Kubira Overlap with brick"); // ログ多すぎる
        brick.disableBody(true, true);
        this.score += 10;
        this.events.emit('updateScore', this.score);
        if (this.bricks.countActive(true) === 0) { this.stageClear(); }
    }

    // ★★★ シャトラ関連関数 (ボールグループ対応) ★★★
    activateShatora(balls) {
        console.log("Activating Shatora for ball group");
        const speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA];
        balls.forEach(ball => {
            ball.setData('isFast', true);
            ball.setTint(POWERUP_COLORS[POWERUP_TYPES.SHATORA]);
            const direction = ball.body.velocity.length() > 0 ? ball.body.velocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
            ball.setVelocity(direction.x * NORMAL_BALL_SPEED * speedMultiplier, direction.y * NORMAL_BALL_SPEED * speedMultiplier);
        });
        console.log(`Shatora speed set`);
    }
    deactivateShatora(balls) {
        console.log("Deactivating Shatora for ball group");
        balls.forEach(ball => {
            ball.setData('isFast', false);
            // 速度リセットは deactivateCurrentPower で行う
        });
    }

    // ★★★ ハイラ関連関数 (ボールグループ対応) ★★★
    activateHaira(balls) {
        console.log("Activating Haira for ball group");
        const speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];
        balls.forEach(ball => {
            ball.setData('isSlow', true);
            ball.setTint(POWERUP_COLORS[POWERUP_TYPES.HAILA]);
            const direction = ball.body.velocity.length() > 0 ? ball.body.velocity.clone().normalize() : new Phaser.Math.Vector2(0, -1);
            ball.setVelocity(direction.x * NORMAL_BALL_SPEED * speedMultiplier, direction.y * NORMAL_BALL_SPEED * speedMultiplier);
        });
         console.log(`Haira speed set`);
    }
    deactivateHaira(balls) {
        console.log("Deactivating Haira for ball group");
         balls.forEach(ball => {
            ball.setData('isSlow', false);
            // 速度リセットは deactivateCurrentPower で行う
        });
    }

    // ★★★ アンチラ関連関数 (枠組み) ★★★
    activateAnchira(sourceBall) {
        console.log("Activating Anchira");
        if (!sourceBall || !sourceBall.active) {
            console.warn("Cannot activate Anchira, source ball invalid.");
            return;
        }
        const x = sourceBall.x;
        const y = sourceBall.y;
        const numToSpawn = 3; // 元のボールと合わせて4つにする

        // 新しいボールを生成
        for (let i = 0; i < numToSpawn; i++) {
            // 少し位置をずらし、ランダムな方向へ発射
            const offsetX = Phaser.Math.Between(-5, 5);
            const offsetY = Phaser.Math.Between(-5, 5);
            const velocityX = Phaser.Math.Between(-150, 150);
            // Y速度は必ず上向きにする
            const velocityY = -Math.abs(Phaser.Math.Between(100, NORMAL_BALL_SPEED));

            this.createAndAddBall(x + offsetX, y + offsetY, velocityX, velocityY);
        }
        // 元のボールの色も変える？ (他のボールと同じにするか、特別な色にするか)
        sourceBall.setTint(POWERUP_COLORS[POWERUP_TYPES.ANCHIRA]); // 仮にピンク
        // Anchira特有のデータ設定 (必要なら)
        // sourceBall.setData('isAnchiraMaster', true);
    }
    deactivateAnchira(balls) {
        console.log("Deactivating Anchira (automatically when 1 ball left)");
        // 特に解除処理は不要 (ボールの色は deactivateCurrentPower で戻る)
    }

    // ★★★ シンダラ関連関数 (枠組み) ★★★
    activateSindara(sourceBall) {
        console.log("Activating Sindara");
        if (!sourceBall || !sourceBall.active) {
            console.warn("Cannot activate Sindara, source ball invalid.");
            return;
        }
        const x = sourceBall.x;
        const y = sourceBall.y;

        // 2つ目のボールを生成
        const offsetX = Phaser.Math.Between(-5, 5);
        const offsetY = Phaser.Math.Between(-5, 5);
        const velocityX = Phaser.Math.Between(-150, 150);
        const velocityY = -Math.abs(Phaser.Math.Between(100, NORMAL_BALL_SPEED));
        const secondBall = this.createAndAddBall(x + offsetX, y + offsetY, velocityX, velocityY);

        // ボールにシンダラ属性を付与
        sourceBall.setData('isSindara', true);
        sourceBall.setData('sindaraPartner', secondBall); // パートナー参照
        sourceBall.setTint(POWERUP_COLORS[POWERUP_TYPES.SINDARA]);
        secondBall.setData('isSindara', true);
        secondBall.setData('sindaraPartner', sourceBall);
        secondBall.setTint(POWERUP_COLORS[POWERUP_TYPES.SINDARA]);

        // TODO: 引き合い・合体処理のタイマーや更新処理を設定
        // 例: 3秒後に引き合い開始
        // this.time.delayedCall(3000, () => { this.startSindaraAttraction(); }, [], this);
        console.log("Sindara activated - 2 balls created.");
    }
    deactivateSindara(balls) {
        console.log("Deactivating Sindara");
        // ボールに付与したシンダラ属性などを解除
         balls.forEach(ball => {
            ball.setData('isSindara', false);
            ball.setData('sindaraPartner', null);
            // TODO: 引き合い処理なども停止
        });
    }
    // TODO: handleBallCollision(ball1, ball2) - ボール同士の衝突処理 (シンダラ合体など)
    // TODO: updateSindaraBalls() - シンダーラボールの引き合い処理など


    // ★★★ ライフ管理 (ボールグループ対応) ★★★
    loseLife() {
        // ライフがある場合のみ処理
        if (this.lives > 0) {
            // 現在のパワーアップを解除 (ボールが消える前に)
            this.deactivateCurrentPower();

            this.lives--;
            this.events.emit('updateLives', this.lives);
            console.log(`Life lost. Lives remaining: ${this.lives}`);

            // ★ isBallLaunched フラグをリセットして、再発射待ち状態にする
            this.isBallLaunched = false;

            if (this.lives > 0) {
                // 少し待ってからボールを1つリセット
                this.time.delayedCall(500, this.resetForNewLife, [], this);
            } else {
                // ゲームオーバー
                this.time.delayedCall(500, this.gameOver, [], this);
            }
        } else {
            console.warn("loseLife called but no lives left or already processing.");
        }
    }

    // ★★★ 新しいライフのためのリセット関数 ★★★
    resetForNewLife() {
        console.log("Resetting for new life...");
        // 既存のボールを全てクリア
        if (this.balls) {
             this.balls.clear(true, true); // 第1引数: GameObjectも破棄, 第2引数: 子要素も破棄
             console.log("Cleared existing balls.");
        }
        // パドルの位置リセット
        if (this.paddle) {
            this.paddle.x = this.gameWidth / 2;
            this.paddle.y = this.gameHeight - PADDLE_Y_OFFSET;
        }
        // 新しいボールを1つ生成
        this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        this.isBallLaunched = false; // 発射待ち状態
        console.log("Ready for new life.");
    }

    // gameOver, stageClear, gameComplete, returnToTitle, shutdown は前回とほぼ同じだが、ボールグループを意識

    gameOver() {
        if(this.gameOverText && !this.gameOverText.visible) {
            this.gameOverText.setVisible(true);
            this.physics.pause();
            // ★ ボールグループ内のボールを非アクティブ化
            if (this.balls) {
                this.balls.getChildren().forEach(ball => ball.setActive(false));
            }
            console.log("Game Over!");
        }
    }

    stageClear() {
        console.log(`Stage ${this.currentStage} Clear! Score: ${this.score}`);
        this.physics.pause();
        this.deactivateCurrentPower(); // パワーアップ解除

        // ★ ボールグループ内のボールを非アクティブ化
        if(this.balls) {
            this.balls.getChildren().forEach(ball => {
                 ball.setVelocity(0,0).setVisible(false).setActive(false);
                 if(ball.body) ball.body.enable = false;
            });
        }

        alert(`ステージ ${this.currentStage} クリア！ (仮)`);
        this.currentStage++;
        const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12;
        if (this.currentStage > maxStages) { this.gameComplete(); }
        else {
            console.log(`Starting Stage ${this.currentStage}`);
            this.events.emit('updateStage', this.currentStage);
            this.time.delayedCall(500, () => {
                this.createBricks();
                // ★ resetForNewLife で新しいボールとColliderが準備される
                this.resetForNewLife(); // 新しいライフと同様のリセット
                this.setColliders(); // Collider再設定
                this.physics.resume();
                // isBallLaunched は resetForNewLife で false になっている
            });
        }
    }

     gameComplete() { /* ...前回と同じ... */ }
     returnToTitle() { /* ...前回と同じ... */ }
     shutdown() { /* ...前回と同じ... */ }

} // ← GameScene クラスの終わり

// --- UIScene --- (変更なし)
class UIScene extends Phaser.Scene { /* ... */ }

// --- Phaserゲーム設定 --- (変更なし)
const config = { /* ... */ };

// --- ゲーム開始 --- (変更なし)
const game = new Phaser.Game(config);