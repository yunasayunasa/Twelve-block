// --- 定数 ---
const PADDLE_WIDTH_RATIO = 0.2;
const PADDLE_HEIGHT = 20;
const PADDLE_Y_OFFSET = 50;
const BALL_RADIUS = 12;
const BALL_INITIAL_VELOCITY_Y = -350;
const BALL_INITIAL_VELOCITY_X_RANGE = [-150, 150];
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH_RATIO = 0.1;
const BRICK_HEIGHT = 20;
const BRICK_SPACING = 4;
const BRICK_OFFSET_TOP = 100;

const GAME_MODE = { NORMAL: 'normal', ALL_STARS: 'all_stars' };
const BRICK_COLORS = [ 0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff ];
const BRICK_MARKED_COLOR = 0x666666;
const DEFAULT_BALL_COLOR = 0x00ff00;

const POWERUP_DROP_RATE = 0.7; // ドロップ率
const POWERUP_SIZE = 15;
const POWERUP_SPEED_Y = 100;
const POWERUP_TYPES = {
    KUBIRA: 'kubira',     // 貫通
    SHATORA: 'shatora',   // 高速
    HAILA: 'haila',       // 低速
    ANCHIRA: 'anchira',   // 4分裂
    SINDARA: 'sindara',   // 2分裂&引寄&合体
    BIKARA: 'bikara',     // 陰陽切替&マーク破壊
    INDARA: 'indara',     // 壁反射ホーミング (3回)
    ANILA: 'anila',       // 落下時1回バウンド
    BAISRAVA: 'baisrava'  // 全ブロック破壊
    // マキラ、マコラ、ヴァジラ は未実装
};
const POWERUP_COLORS = {
    [POWERUP_TYPES.KUBIRA]: 0x800080, // 紫
    [POWERUP_TYPES.SHATORA]: 0xffa500, // オレンジ
    [POWERUP_TYPES.HAILA]: 0xadd8e6,   // 水色
    [POWERUP_TYPES.ANCHIRA]: 0xffc0cb, // ピンク
    [POWERUP_TYPES.SINDARA]: 0xd2b48c, // 茶 (初期)
    [POWERUP_TYPES.BIKARA]: 0xffffff,   // 白 (アイテム色、ボール色は陰陽で変化)
    [POWERUP_TYPES.INDARA]: 0x4682b4,   // 藍色 (SteelBlue)
    [POWERUP_TYPES.ANILA]: 0xffefd5,   // クリーム (PapayaWhip)
    [POWERUP_TYPES.BAISRAVA]: 0xffd700, // 金色 (Gold)
};
const BIKARA_COLORS = { yin: 0x444444, yang: 0xfffafa };
const POWERUP_DURATION = { [POWERUP_TYPES.KUBIRA]: 10000, [POWERUP_TYPES.SHATORA]: 3000, [POWERUP_TYPES.HAILA]: 10000 };
const BIKARA_YANG_COUNT_MAX = 2;
const INDARA_MAX_HOMING_COUNT = 3;
const NORMAL_BALL_SPEED = Math.abs(BALL_INITIAL_VELOCITY_Y);
const BALL_SPEED_MODIFIERS = { [POWERUP_TYPES.SHATORA]: 3.0, [POWERUP_TYPES.HAILA]: 0.3 };
const SINDARA_ATTRACTION_DELAY = 3000;
const SINDARA_ATTRACTION_FORCE = 400;
const SINDARA_MERGE_DURATION = 500;
const SINDARA_ATTRACT_COLOR = 0xa52a2a;
const SINDARA_MERGE_COLOR = 0xff4500;

// --- BootScene ---
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() { console.log("BootScene: Preloading assets..."); }
    create() { console.log("BootScene: Assets loaded, starting TitleScene..."); this.scene.start('TitleScene'); }
}

// --- TitleScene ---
class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height;
        this.cameras.main.setBackgroundColor('#222222');
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.2, '十二神将ブロック崩し', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.3, '(仮)', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } };
        const buttonHoverStyle = { fill: '#ff0' };
        const normalButton = this.add.text(this.gameWidth / 2, this.gameHeight * 0.5, '通常モード', buttonStyle).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerover', () => normalButton.setStyle(buttonHoverStyle)).on('pointerout', () => normalButton.setStyle(buttonStyle))
            .on('pointerdown', () => { console.log("通常モード選択"); this.scene.start('GameScene', { mode: GAME_MODE.NORMAL }); this.scene.launch('UIScene'); });
        const allStarsButton = this.add.text(this.gameWidth / 2, this.gameHeight * 0.7, '全員集合モード', buttonStyle).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerover', () => allStarsButton.setStyle(buttonHoverStyle)).on('pointerout', () => allStarsButton.setStyle(buttonStyle))
            .on('pointerdown', () => { console.log("全員集合モード選択"); this.scene.start('GameScene', { mode: GAME_MODE.ALL_STARS }); this.scene.launch('UIScene'); });
    }
}

// --- GameScene ---
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.paddle = null; this.balls = null; this.bricks = null; this.powerUps = null;
        this.lives = 0; this.gameOverText = null; this.isBallLaunched = false;
        this.gameWidth = 0; this.gameHeight = 0; this.currentMode = null; this.currentStage = 1; this.score = 0;
        this.ballPaddleCollider = null; this.ballBrickCollider = null; this.ballBrickOverlap = null; this.ballBallCollider = null;
        this.powerUpTimers = {};
        this.sindaraAttractionTimer = null; this.sindaraMergeTimer = null;
        this.isStageClearing = false; this.isGameOver = false;
    }

    init(data) {
        this.currentMode = data.mode || GAME_MODE.NORMAL;
        this.lives = (this.currentMode === GAME_MODE.ALL_STARS) ? 1 : 3;
        this.isBallLaunched = false; this.currentStage = 1; this.score = 0;
        Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(); });
        this.powerUpTimers = {};
        if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null;
        if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null;
        this.isStageClearing = false; this.isGameOver = false;
        console.log(`GameScene Initialized: Mode=${this.currentMode}, Lives=${this.lives}`);
    }

    preload() {
        // ここで画像や音声ファイルをロードします (将来用)
        // 例: this.load.image('paddle_img', 'assets/paddle.png');
    }

    create() {
        console.log("GameScene Create: Start");
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height;
        this.cameras.main.setBackgroundColor('#222222');

        // UIシーンへの初期値送信（少し遅延）
        this.time.delayedCall(50, () => {
            if (this.scene.isActive('UIScene')) {
                this.events.emit('updateLives', this.lives);
                this.events.emit('updateScore', this.score);
                this.events.emit('updateStage', this.currentStage);
            } else { console.warn("GameScene Create: UIScene not active for initial emit"); }
        });

        // 物理ワールド設定
        this.physics.world.setBoundsCollision(true, true, true, false); // 上左右の壁のみ衝突有効
        this.physics.world.on('worldbounds', this.handleWorldBounds, this); // 壁衝突イベント

        // パドル作成
        const paddleWidth = this.gameWidth * PADDLE_WIDTH_RATIO;
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, null) // 画像を使う場合はキーを指定
            .setDisplaySize(paddleWidth, PADDLE_HEIGHT).setTint(0xffffff).setImmovable(true);

        // ボールグループ作成
        this.balls = this.physics.add.group({ bounceX: 1, bounceY: 1, collideWorldBounds: true });
        // 初期ボール作成
        this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        // ブロック作成
        this.createBricks();

        // ゲームオーバーテキスト作成
        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Game Over\nタップで戻る',
            { fontSize: '48px', fill: '#f00', align: 'center' }).setOrigin(0.5).setVisible(false).setDepth(1);

        // パワーアップアイテムグループ作成
        this.powerUps = this.physics.add.group();
        // 衝突設定
        this.setColliders();
        // パワーアップ取得処理
        this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);

        // 入力イベントリスナー設定
        this.input.on('pointermove', (pointer) => {
             if (!this.isGameOver && this.lives > 0 && this.paddle && !this.isStageClearing) {
                const paddleHalfWidth = this.paddle.displayWidth / 2;
                const targetX = Phaser.Math.Clamp(pointer.x, paddleHalfWidth, this.gameWidth - paddleHalfWidth);
                this.paddle.x = targetX;
                if (!this.isBallLaunched) {
                    this.balls.getChildren().forEach(ball => { if(ball.active) ball.x = this.paddle.x; });
                }
             }
        });
        this.input.on('pointerdown', () => {
             if (this.isGameOver && this.gameOverText && this.gameOverText.visible) {
                 this.returnToTitle();
             } else if (this.lives > 0 && !this.isBallLaunched && !this.isStageClearing) {
                 this.launchBall();
             }
        });
        // シーン終了時のクリーンアップ処理
        this.events.on('shutdown', this.shutdown, this);
        console.log("GameScene Create: End");
    }

    update() {
        // ゲーム状態チェック
        if (this.isGameOver || this.isStageClearing || this.lives <= 0) return;

        let activeBallsCount = 0;
        let sindaraBallsActive = [];

        // 全てのボールをチェック
        this.balls.getChildren().forEach(ball => {
            if (ball.active) {
                activeBallsCount++;

                // 落下判定
                if (this.isBallLaunched && !this.isStageClearing && ball.y > this.gameHeight + ball.displayHeight) {
                    if (ball.getData('isAnilaActive')) {
                        this.triggerAnilaBounce(ball);
                    } else {
                        ball.setActive(false).setVisible(false);
                        if (ball.body) ball.body.enable = false;
                    }
                }

                // シンダラ処理
                if (ball.getData('isSindara')) {
                    sindaraBallsActive.push(ball);
                    if (ball.getData('isAttracting')) {
                        this.updateSindaraAttraction(ball);
                    }
                }

                // 速度補正
                if (ball.body && this.isBallLaunched) {
                    const minSpeed = NORMAL_BALL_SPEED * 0.1;
                    const maxSpeed = NORMAL_BALL_SPEED * 5;
                    const speed = ball.body.velocity.length();
                    if (speed < minSpeed && speed > 0) {
                        ball.body.velocity.normalize().scale(minSpeed);
                    } else if (speed > maxSpeed) {
                        ball.body.velocity.normalize().scale(maxSpeed);
                    }
                }
            }
        });

        // シンダラ片割れロスト処理
        if (sindaraBallsActive.length === 1 && this.balls.getTotalUsed() > 1) {
            const remainingSindaraBall = sindaraBallsActive[0];
            if (remainingSindaraBall.getData('isSindara')) {
                 this.deactivateSindara([remainingSindaraBall]);
                 this.updateBallTint(remainingSindaraBall);
            }
        }

        // ボール全ロスト判定
        if (activeBallsCount === 0 && this.isBallLaunched && !this.isStageClearing && this.lives > 0) {
             this.loseLife();
        }

        // 画面外パワーアップ削除
        this.powerUps.children.each(powerUp => {
            if (powerUp.active && powerUp.y > this.gameHeight + POWERUP_SIZE) {
                powerUp.destroy();
            }
        });

        // アンチラ解除判定
        if (this.balls.countActive(true) === 1) {
            const lastBall = this.balls.getFirstAlive();
            if (lastBall && lastBall.getData('isAnchira')) {
                this.deactivateAnchira([lastBall]);
                 this.updateBallTint(lastBall);
            }
        }
    }

    setColliders() {
        // 既存コライダー破棄
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy();
        if (this.ballBrickCollider) this.ballBrickCollider.destroy();
        if (this.ballBrickOverlap) this.ballBrickOverlap.destroy();
        if (this.ballBallCollider) this.ballBallCollider.destroy();

        // オブジェクト存在チェック
        if (!this.balls || !this.paddle || !this.bricks) {
            console.error("SetColliders: Missing critical objects.");
            return;
        }

        // パドルとボール
        this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this);
        // ブロックとボール（通常衝突）
        this.ballBrickCollider = this.physics.add.collider(this.bricks, this.balls, this.hitBrick, (brick, ball) => {
            return !(ball.getData('isBikara') && ball.getData('bikaraState') === 'yin') &&
                   !ball.getData('isPenetrating') &&
                   !ball.getData('isSindaraMerging');
        }, this);
        // ブロックとボール（オーバーラップ）
        this.ballBrickOverlap = this.physics.add.overlap(this.balls, this.bricks, this.handleBallBrickOverlap, (ball, brick) => {
             return ball.getData('isPenetrating') ||
                    (ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'))) ||
                    ball.getData('isBikara');
        }, this);
        // ボール同士
        this.ballBallCollider = this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, (ball1, ball2) => {
            return ball1.getData('isSindara') && ball2.getData('isSindara') &&
                   ball1.getData('isAttracting') && ball2.getData('isAttracting');
        }, this);
        console.log("Colliders set/reset.");
    }

    createAndAddBall(x, y, initialVelocityX = 0, initialVelocityY = 0, sourceBallData = null) {
        // ボール作成
        const ball = this.balls.create(x, y, null)
            .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2)
            .setTint(DEFAULT_BALL_COLOR)
            .setCircle(BALL_RADIUS)
            .setCollideWorldBounds(true)
            .setBounce(1);

        // ボディと速度設定
        if (ball.body) {
            ball.setVelocity(initialVelocityX, initialVelocityY);
            ball.body.onWorldBounds = true;
        } else {
            console.error("CreateBall: Failed to create ball body!");
            ball.destroy();
            return null;
        }

        // データ初期化/引き継ぎ
        ball.setData({
            activePowers: sourceBallData ? new Set(sourceBallData.activePowers) : new Set(),
            lastActivatedPower: sourceBallData ? sourceBallData.lastActivatedPower : null,
            isPenetrating: sourceBallData ? sourceBallData.isPenetrating : false,
            isFast: sourceBallData ? sourceBallData.isFast : false,
            isSlow: sourceBallData ? sourceBallData.isSlow : false,
            isAnchira: sourceBallData ? sourceBallData.isAnchira : false,
            isSindara: sourceBallData ? sourceBallData.isSindara : false,
            sindaraPartner: null, isAttracting: false, isMerging: false,
            isBikara: sourceBallData ? sourceBallData.isBikara : false,
            bikaraState: sourceBallData ? sourceBallData.bikaraState : null, bikaraYangCount: 0,
            isIndaraActive: sourceBallData ? sourceBallData.isIndaraActive : false,
            indaraHomingCount: sourceBallData ? sourceBallData.indaraHomingCount : 0,
            isAnilaActive: sourceBallData ? sourceBallData.isAnilaActive : false
        });

        // 引き継ぎ時の色と速度反映
        if (sourceBallData) {
            this.updateBallTint(ball);
             if (ball.getData('isFast')) this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA);
             else if (ball.getData('isSlow')) this.applySpeedModifier(ball, POWERUP_TYPES.HAILA);
        }
        return ball;
    }

    launchBall() {
        // 発射前＆ボールが存在する場合
        if (!this.isBallLaunched && this.balls) {
            const firstBall = this.balls.getFirstAlive();
            if (firstBall) {
                // ランダムなX速度で発射
                const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]);
                firstBall.setVelocity(initialVelocityX, BALL_INITIAL_VELOCITY_Y);
                this.isBallLaunched = true; // 発射済みフラグON
                console.log("Ball launched!");
            }
        }
    }

    createBricks() {
        // 既存ブロック削除
        if (this.bricks) {
            this.bricks.clear(true, true); this.bricks.destroy();
        }
        // 新規グループ作成
        this.bricks = this.physics.add.staticGroup();
        // サイズとオフセット計算
        const brickWidth = this.gameWidth * BRICK_WIDTH_RATIO;
        const totalBricksWidth = BRICK_COLS * brickWidth + (BRICK_COLS - 1) * BRICK_SPACING;
        const offsetX = (this.gameWidth - totalBricksWidth) / 2;
        const rows = this.currentMode === GAME_MODE.ALL_STARS ? BRICK_ROWS + 2 : BRICK_ROWS;
        // ブロック生成ループ
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < BRICK_COLS; j++) {
                const brickX = offsetX + j * (brickWidth + BRICK_SPACING) + brickWidth / 2;
                const brickY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2;
                const randomColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS);
                // ブロック作成＆設定
                const brick = this.bricks.create(brickX, brickY, null).setDisplaySize(brickWidth, BRICK_HEIGHT).setTint(randomColor);
                brick.setData({ hits: 1, originalTint: randomColor, isMarkedByBikara: false });
                brick.refreshBody(); // 静的ボディ更新
            }
        }
        console.log(`Bricks created for stage ${this.currentStage}. Rows: ${rows}, Cols: ${BRICK_COLS}. Total: ${this.bricks.getLength()}`);
    }

    hitPaddle(paddle, ball) {
        // 有効チェック
        if (!paddle || !ball || !ball.active || !ball.body) return;

        // 反射角計算
        let diff = ball.x - paddle.x;
        const maxDiff = paddle.displayWidth / 2;
        let influence = diff / maxDiff;
        influence = Phaser.Math.Clamp(influence, -1, 1);
        const maxVelX = NORMAL_BALL_SPEED * 0.8;
        let newVelX = maxVelX * influence;
        // Y速度計算
        const minVelY = NORMAL_BALL_SPEED * 0.5;
        let currentVelY = ball.body.velocity.y;
        let newVelY = -Math.abs(currentVelY);
        if (Math.abs(newVelY) < minVelY) newVelY = -minVelY;

        // 速度能力適用
        let speedMultiplier = 1.0;
        if (ball.getData('isFast')) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA];
        else if (ball.getData('isSlow')) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA];

        // 最終速度設定
        const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier;
        const newVelocity = new Phaser.Math.Vector2(newVelX, newVelY).normalize().scale(targetSpeed);
        ball.setVelocity(newVelocity.x, newVelocity.y);

        // 能力処理
        if (ball.getData('isBikara')) this.switchBikaraState(ball);
        if (ball.getData('isIndaraActive')) {
            console.log("Indara deactivated by paddle hit.");
            this.deactivateIndaraForBall(ball);
            this.updateBallTint(ball);
        }
    }

    hitBrick(brick, ball) {
         // 有効チェック
         if (!brick || !ball || !brick.active || !ball.active || this.isStageClearing) return;
         // ブロック破壊
         brick.disableBody(true, true);
         // スコア加算・UI更新
         this.score += 10;
         this.events.emit('updateScore', this.score);
         // アイテムドロップ判定
         if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) {
             this.dropPowerUp(brick.x, brick.y);
         }
         // ステージクリア判定
         if (!this.isStageClearing && this.bricks.countActive(true) === 0) {
             console.log("Last brick destroyed by normal hit!");
             this.stageClear();
         }
    }

    handleBallBrickOverlap(ball, brick) {
        // 有効チェック
        if (!ball || !brick || !ball.active || !brick.active || this.isStageClearing) return;

        // 能力フラグ取得
        const isKubira = ball.getData('isPenetrating');
        const isSindaraAttracting = ball.getData('isSindara') && ball.getData('isAttracting');
        const isSindaraMerging = ball.getData('isSindara') && ball.getData('isMerging');
        const isBikara = ball.getData('isBikara');
        const bikaraState = ball.getData('bikaraState');

        // Bikara処理
        if (isBikara) {
            if (bikaraState === 'yin') { this.markBrickByBikara(brick); return; }
            else if (bikaraState === 'yang') { this.handleBikaraYangDestroy(ball, brick); return; }
        }
        // 貫通処理
        if (isKubira || isSindaraAttracting || isSindaraMerging) {
            brick.disableBody(true, true);
            this.score += 10;
            this.events.emit('updateScore', this.score);
            if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) {
                 this.dropPowerUp(brick.x, brick.y);
            }
            if (!this.isStageClearing && this.bricks.countActive(true) === 0) {
                 console.log("Last brick destroyed by penetration!");
                 this.stageClear();
            }
            return;
        }
    }

    dropPowerUp(x, y) {
        // ドロップ候補
        const availableTypes = [
            POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA,
            POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA,
            POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA,
            POWERUP_TYPES.BAISRAVA // バイシュラ含む（テスト用）
        ];
        // テスト用: バイシュラのみ
        // const availableTypes = [ POWERUP_TYPES.BAISRAVA ];

        // ランダム選択と色決定
        const type = Phaser.Utils.Array.GetRandom(availableTypes);
        const color = POWERUP_COLORS[type] || 0xffffff;

        // アイテム生成
        const powerUp = this.powerUps.create(x, y, null)
            .setDisplaySize(POWERUP_SIZE, POWERUP_SIZE)
            .setTint(color)
            .setData('type', type);

        // 落下設定
        if (powerUp.body) {
            powerUp.setVelocity(0, POWERUP_SPEED_Y);
            powerUp.body.setCollideWorldBounds(false);
        } else {
            console.error("Failed to create powerup body!");
            powerUp.destroy();
        }
    }

    collectPowerUp(paddle, powerUp) {
         // 有効チェック
         if (!powerUp.active || this.isStageClearing) return;
         // アイテム情報取得・削除
        const type = powerUp.getData('type');
        powerUp.destroy();

        // バイシュラ個別処理
        if (type === POWERUP_TYPES.BAISRAVA) {
            console.log(">>> Collected BAISRAVA!");
            this.activateBaisrava();
            return;
        }

        // 分裂系ボール整理
         if (type === POWERUP_TYPES.ANCHIRA || type === POWERUP_TYPES.SINDARA) {
             if (this.balls.countActive(true) > 1) {
                 console.log("Multiple balls exist before Anchira/Sindara, keeping furthest.");
                 this.keepFurthestBall();
             }
         }
         // 通常能力発動
        this.activatePower(type);
    }

    keepFurthestBall() {
        // アクティブボール取得
         const activeBalls = this.balls.getMatching('active', true);
         // 1つ以下なら何もしない
         if (activeBalls.length <= 1) return;
         // 遠いボール探索
         let furthestBall = null;
         let maxDistSq = -1;
         const paddlePos = new Phaser.Math.Vector2(this.paddle.x, this.paddle.y);
         activeBalls.forEach(ball => {
             const distSq = Phaser.Math.Distance.Squared(paddlePos.x, paddlePos.y, ball.x, ball.y);
             if (distSq > maxDistSq) { maxDistSq = distSq; furthestBall = ball; }
         });
         // 遠いボール以外を削除
         activeBalls.forEach(ball => {
             if (ball !== furthestBall) {
                 console.log("Removing closer ball.");
                 ball.destroy();
             }
         });
         console.log("Kept only the furthest ball.");
    }

    activatePower(type) {
        console.log(`Activating Power: ${type}`);
        // 対象ボール取得
        const targetBalls = this.balls.getMatching('active', true);
        if (targetBalls.length === 0) { console.warn("No active balls to apply power up."); return; }

        // 既存タイマークリア
        if (POWERUP_DURATION[type]) {
            if (this.powerUpTimers[type]) { this.powerUpTimers[type].remove(); console.log(`Removed existing timer for ${type}`); }
        }

        // 能力別有効化処理
        switch (type) {
            case POWERUP_TYPES.KUBIRA: this.activateKubira(targetBalls); break;
            case POWERUP_TYPES.SHATORA: this.activateShatora(targetBalls); break;
            case POWERUP_TYPES.HAILA: this.activateHaira(targetBalls); break;
            case POWERUP_TYPES.ANCHIRA: this.activateAnchira(targetBalls[0]); break;
            case POWERUP_TYPES.SINDARA: this.activateSindara(targetBalls[0]); break;
            case POWERUP_TYPES.BIKARA: this.activateBikara(targetBalls); break;
            case POWERUP_TYPES.INDARA: this.activateIndara(targetBalls); break;
            case POWERUP_TYPES.ANILA: this.activateAnila(targetBalls); break;
            default: console.warn(`Unknown power up type in activatePower: ${type}`); return;
        }

        // ボールデータ更新
         targetBalls.forEach(ball => {
             if(ball.active) {
                 ball.getData('activePowers').add(type);
                 ball.setData('lastActivatedPower', type);
                 this.updateBallTint(ball);
             }
         });

        // 新規タイマー設定
        const duration = POWERUP_DURATION[type];
        if (duration) {
            this.powerUpTimers[type] = this.time.delayedCall(duration, () => {
                console.log(`Timer expired for ${type}`);
                this.deactivatePowerByType(type);
                this.powerUpTimers[type] = null; // タイマー参照クリア
            }, [], this);
             console.log(`Timer started for ${type} (${duration}ms)`);
        }
    }

    deactivatePowerByType(type) {
        console.log(`Deactivating Power by Type: ${type}`);
        // 対象ボール取得
        const targetBalls = this.balls.getMatching('active', true);
        if (targetBalls.length === 0) return;

        // 能力別解除処理
        switch (type) {
            case POWERUP_TYPES.KUBIRA: this.deactivateKubira(targetBalls); break;
            case POWERUP_TYPES.SHATORA: this.deactivateShatora(targetBalls); break;
            case POWERUP_TYPES.HAILA: this.deactivateHaira(targetBalls); break;
            default: console.warn(`Cannot deactivate non-timed or unknown power via timer: ${type}`); return;
        }

        // ボールデータ更新
         targetBalls.forEach(ball => {
             if(ball.active) {
                 ball.getData('activePowers').delete(type);
                 this.updateBallTint(ball); // 色再評価
             }
         });
    }

    updateBallTint(ball) {
        // 有効チェック
        if (!ball || !ball.active) return;
        // 能力セット取得
        const activePowers = ball.getData('activePowers');
        let tint = DEFAULT_BALL_COLOR; // デフォルト色

        // 能力が有効な場合
        if (activePowers && activePowers.size > 0) {
            const lastPower = ball.getData('lastActivatedPower'); // 最後に有効化した能力
            // lastPowerが現在も有効かチェック
            if (lastPower && activePowers.has(lastPower)) {
                // Bikaraの色
                if (lastPower === POWERUP_TYPES.BIKARA) {
                    tint = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin;
                // Sindaraの色
                } else if (lastPower === POWERUP_TYPES.SINDARA) {
                    if (ball.getData('isMerging')) tint = SINDARA_MERGE_COLOR;
                    else if (ball.getData('isAttracting')) tint = SINDARA_ATTRACT_COLOR;
                    else tint = POWERUP_COLORS[POWERUP_TYPES.SINDARA];
                // その他の能力の色
                } else if (POWERUP_COLORS[lastPower]) {
                    tint = POWERUP_COLORS[lastPower];
                }
            // lastPowerが無効になっている場合
            } else {
                 const remainingPowers = Array.from(activePowers); // 残りの能力リスト
                 if (remainingPowers.length > 0) {
                     const newLastPower = remainingPowers[remainingPowers.length - 1]; // 最後に残ったものを新たな優先色に
                      // 色を決定
                      if (newLastPower === POWERUP_TYPES.BIKARA) tint = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin;
                      else if (newLastPower === POWERUP_TYPES.SINDARA) {
                          if (ball.getData('isMerging')) tint = SINDARA_MERGE_COLOR;
                          else if (ball.getData('isAttracting')) tint = SINDARA_ATTRACT_COLOR;
                          else tint = POWERUP_COLORS[POWERUP_TYPES.SINDARA];
                      }
                      else tint = POWERUP_COLORS[newLastPower] || DEFAULT_BALL_COLOR;
                      // lastActivatedPower も更新
                      ball.setData('lastActivatedPower', newLastPower);
                 }
            }
        }
        // ボールに色を設定
        ball.setTint(tint);
    }

    // --- 個別能力 ---
    activateKubira(balls) { balls.forEach(ball => ball.setData('isPenetrating', true)); console.log("Kubira activated."); }
    deactivateKubira(balls) { balls.forEach(ball => { if (!ball.getData('isSindara') || (!ball.getData('isAttracting') && !ball.getData('isMerging'))) ball.setData('isPenetrating', false); }); console.log("Kubira deactivated."); }
    applySpeedModifier(ball, type) { if (!ball || !ball.active || !ball.body) return; const modifier = BALL_SPEED_MODIFIERS[type]; if (!modifier) return; const currentVelocity = ball.body.velocity; const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1); const newSpeed = NORMAL_BALL_SPEED * modifier; ball.setVelocity(direction.x * newSpeed, direction.y * newSpeed); }
    resetBallSpeed(ball) { if (!ball || !ball.active || !ball.body) return; if (ball.getData('isFast')) { this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); } else if (ball.getData('isSlow')) { this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); } else { const currentVelocity = ball.body.velocity; const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1); ball.setVelocity(direction.x * NORMAL_BALL_SPEED, direction.y * NORMAL_BALL_SPEED); } }
    activateShatora(balls) { balls.forEach(ball => { ball.setData({isFast: true, isSlow: false}); this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); }); console.log("Shatora activated."); }
    deactivateShatora(balls) { balls.forEach(ball => { if (ball.getData('isFast')) { ball.setData('isFast', false); this.resetBallSpeed(ball); } }); console.log("Shatora deactivated."); }
    activateHaira(balls) { balls.forEach(ball => { ball.setData({isSlow: true, isFast: false}); this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); }); console.log("Haira activated."); }
    deactivateHaira(balls) { balls.forEach(ball => { if (ball.getData('isSlow')) { ball.setData('isSlow', false); this.resetBallSpeed(ball); } }); console.log("Haira deactivated."); }
    activateAnchira(sourceBall) { console.log("Activating Anchira"); if (!sourceBall || !sourceBall.active) return; sourceBall.setData('isAnchira', true); const x = sourceBall.x; const y = sourceBall.y; const numToSpawn = 3; for (let i = 0; i < numToSpawn; i++) { const offsetX = Phaser.Math.Between(-5, 5); const offsetY = Phaser.Math.Between(-5, 5); const velocityX = Phaser.Math.Between(-150, 150); const velocityY = -Math.abs(Phaser.Math.Between(100, NORMAL_BALL_SPEED * 0.8)); const newBall = this.createAndAddBall(x + offsetX, y + offsetY, velocityX, velocityY, sourceBall.data.getAll()); if (!newBall) console.error("Failed split."); } console.log(`Anchira spawned ${numToSpawn} balls.`); }
    deactivateAnchira(balls) { console.log("Deactivating Anchira"); balls.forEach(ball => { if (ball.getData('isAnchira')) { ball.setData('isAnchira', false); ball.getData('activePowers').delete(POWERUP_TYPES.ANCHIRA); } }); }
    activateSindara(sourceBall) { console.log("Activating Sindara"); if (!sourceBall || !sourceBall.active) return; const x = sourceBall.x; const y = sourceBall.y; const secondBall = this.createAndAddBall(x + Phaser.Math.Between(-5, 5), y + Phaser.Math.Between(-5, 5), Phaser.Math.Between(-150, 150), -Math.abs(Phaser.Math.Between(100, NORMAL_BALL_SPEED * 0.8)), sourceBall.data.getAll()); if (secondBall) { sourceBall.setData({isSindara: true, sindaraPartner: secondBall, isAttracting: false, isMerging: false}); secondBall.setData({isSindara: true, sindaraPartner: sourceBall, isAttracting: false, isMerging: false}); if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = this.time.delayedCall(SINDARA_ATTRACTION_DELAY, () => { this.startSindaraAttraction(sourceBall, secondBall); }, [], this); console.log("Sindara activated."); } else { console.error("Failed Sindara split."); sourceBall.getData('activePowers').delete(POWERUP_TYPES.SINDARA); } }
    startSindaraAttraction(ball1, ball2) { console.log("Sindara attraction starting"); this.sindaraAttractionTimer = null; if (!ball1 || !ball2 || !ball1.active || !ball2.active || !ball1.getData('isSindara') || !ball2.getData('isSindara')) { console.warn("Cannot start attraction."); const activeSindaraBalls = this.balls.getMatching('isSindara', true); if(activeSindaraBalls.length > 0) { this.deactivateSindara(activeSindaraBalls); activeSindaraBalls.forEach(b => this.updateBallTint(b)); } return; } ball1.setData({isAttracting: true, isPenetrating: true}); ball2.setData({isAttracting: true, isPenetrating: true}); this.updateBallTint(ball1); this.updateBallTint(ball2); console.log("Sindara attracting."); }
    updateSindaraAttraction(ball) { const partner = ball.getData('sindaraPartner'); if (partner && partner.active && ball.active && ball.getData('isAttracting') && partner.getData('isAttracting') && !ball.getData('isMerging') && !partner.getData('isMerging')) { this.physics.moveToObject(ball, partner, SINDARA_ATTRACTION_FORCE); } }
    handleBallCollision(ball1, ball2) { if (ball1.active && ball2.active && ball1.getData('sindaraPartner') === ball2) { console.log("Sindara balls collided!"); this.mergeSindaraBalls(ball1, ball2); } }
    mergeSindaraBalls(ball1, ball2) { console.log("Merging Sindara balls"); const ballToKeep = ball1; const ballToRemove = ball2; const mergeX = (ballToKeep.x + ballToRemove.x) / 2; const mergeY = (ballToKeep.y + ballToRemove.y) / 2; ballToKeep.setPosition(mergeX, mergeY); ballToRemove.destroy(); ballToKeep.setData({ isMerging: true, isAttracting: false, isPenetrating: true, sindaraPartner: null }); this.updateBallTint(ballToKeep); if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = this.time.delayedCall(SINDARA_MERGE_DURATION, () => { this.finishSindaraMerge(ballToKeep); }, [], this); if (this.sindaraAttractionTimer) { this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; } console.log("Sindara merge initiated."); }
    finishSindaraMerge(mergedBall) { console.log("Finishing Sindara merge"); this.sindaraMergeTimer = null; if (!mergedBall || !mergedBall.active) return; mergedBall.setData({ isMerging: false, isPenetrating: false, isSindara: false }); mergedBall.getData('activePowers').delete(POWERUP_TYPES.SINDARA); if (mergedBall.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) mergedBall.setData('isPenetrating', true); this.resetBallSpeed(mergedBall); this.updateBallTint(mergedBall); console.log("Sindara merge finished."); }
    deactivateSindara(balls) { console.log("Deactivating Sindara."); if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; balls.forEach(ball => { if (ball.active && ball.getData('isSindara')) { ball.setData({ isSindara: false, sindaraPartner: null, isAttracting: false, isMerging: false }); if (!ball.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) ball.setData('isPenetrating', false); ball.getData('activePowers').delete(POWERUP_TYPES.SINDARA); } }); }
    activateBikara(balls) { console.log("Activating Bikara"); balls.forEach(ball => ball.setData({ isBikara: true, bikaraState: 'yin', bikaraYangCount: 0 })); console.log("Bikara activated."); }
    deactivateBikara(balls) { console.log("Deactivating Bikara"); balls.forEach(ball => { if (ball.getData('isBikara')) { ball.setData({ isBikara: false, bikaraState: null, bikaraYangCount: 0 }); ball.getData('activePowers').delete(POWERUP_TYPES.BIKARA); } }); this.bricks.getChildren().forEach(brick => { if (brick.getData('isMarkedByBikara')) { brick.setData('isMarkedByBikara', false); brick.setTint(brick.getData('originalTint') || 0xffffff); } }); console.log("Bikara deactivated."); }
    switchBikaraState(ball) { if (!ball || !ball.active || !ball.getData('isBikara')) return; const currentState = ball.getData('bikaraState'); const newState = (currentState === 'yin') ? 'yang' : 'yin'; ball.setData('bikaraState', newState); this.updateBallTint(ball); console.log(`Bikara state switched to: ${newState}`); }
    markBrickByBikara(brick) { if (!brick || !brick.active || brick.getData('isMarkedByBikara')) return; brick.setData('isMarkedByBikara', true); brick.setTint(BRICK_MARKED_COLOR); }
    handleBikaraYangDestroy(ball, hitBrick) { if (!ball || !ball.active || !ball.getData('isBikara') || ball.getData('bikaraState') !== 'yang') return; console.log("Bikara (Yang) triggered."); let destroyedCount = 0; const markedBricksToDestroy = []; if (hitBrick.active) { markedBricksToDestroy.push(hitBrick); hitBrick.setData('isMarkedByBikara', false); } this.bricks.getChildren().forEach(brick => { if (brick.active && brick.getData('isMarkedByBikara') && !markedBricksToDestroy.includes(brick)) { markedBricksToDestroy.push(brick); brick.setData('isMarkedByBikara', false); } }); markedBricksToDestroy.forEach(brick => { brick.disableBody(true, true); this.score += 10; destroyedCount++; if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) this.dropPowerUp(brick.x, brick.y); }); if (destroyedCount > 0) { this.events.emit('updateScore', this.score); console.log(`Bikara destroyed ${destroyedCount} bricks.`); } let currentYangCount = ball.getData('bikaraYangCount') || 0; currentYangCount++; ball.setData('bikaraYangCount', currentYangCount); console.log(`Bikara Yang count: ${currentYangCount}`); if (!this.isStageClearing && this.bricks.countActive(true) === 0) { console.log("Bikara destroyed last brick!"); this.stageClear(); } else if (currentYangCount >= BIKARA_YANG_COUNT_MAX) { console.log("Bikara max Yang count."); this.deactivateBikara([ball]); this.updateBallTint(ball); } }
    activateIndara(balls) { console.log("Activating Indara"); balls.forEach(ball => ball.setData({ isIndaraActive: true, indaraHomingCount: INDARA_MAX_HOMING_COUNT })); console.log(`Indara activated.`); }
    deactivateIndaraForBall(ball) { if (!ball || !ball.active || !ball.getData('isIndaraActive')) return; ball.setData({ isIndaraActive: false, indaraHomingCount: 0 }); ball.getData('activePowers').delete(POWERUP_TYPES.INDARA); console.log("Deactivated Indara."); }
    handleWorldBounds(body, up, down, left, right) { const ball = body.gameObject; if (!ball || !(ball instanceof Phaser.Physics.Arcade.Image) || !this.balls.contains(ball) || !ball.active) return; if (ball.getData('isIndaraActive') && ball.getData('indaraHomingCount') > 0 && (up || left || right)) { const currentHomingCount = ball.getData('indaraHomingCount'); console.log(`Indara wall hit. Count: ${currentHomingCount}`); const activeBricks = this.bricks.getMatching('active', true); if (activeBricks.length > 0) { let closestBrick = null; let minDistanceSq = Infinity; const ballCenter = ball.body.center; activeBricks.forEach(brick => { const distanceSq = Phaser.Math.Distance.Squared(ballCenter.x, ballCenter.y, brick.body.center.x, brick.body.center.y); if (distanceSq < minDistanceSq) { minDistanceSq = distanceSq; closestBrick = brick; } }); if (closestBrick) { console.log("Indara homing."); const currentSpeed = ball.body.velocity.length(); const angle = Phaser.Math.Angle.BetweenPoints(ballCenter, closestBrick.body.center); this.physics.velocityFromAngle(angle, currentSpeed, ball.body.velocity); const newHomingCount = currentHomingCount - 1; ball.setData('indaraHomingCount', newHomingCount); console.log(`Indara count remaining: ${newHomingCount}`); if (newHomingCount <= 0) { console.log("Indara deactivated."); this.deactivateIndaraForBall(ball); this.updateBallTint(ball); } } } else { console.log("Indara no bricks."); } } }
    activateAnila(balls) { console.log("Activating Anila"); balls.forEach(ball => { if (!ball.getData('isAnilaActive')) { ball.setData('isAnilaActive', true); console.log("Anila activated."); } }); }
    deactivateAnilaForBall(ball) { if (!ball || !ball.active || !ball.getData('isAnilaActive')) return; ball.setData('isAnilaActive', false); ball.getData('activePowers').delete(POWERUP_TYPES.ANILA); console.log("Deactivated Anila."); }
    triggerAnilaBounce(ball) { if (!ball || !ball.active || !ball.getData('isAnilaActive')) return; console.log("Anila bouncing back!"); const currentVelY = ball.body.velocity.y; const bounceVelY = -Math.abs(currentVelY > -10 ? BALL_INITIAL_VELOCITY_Y * 0.7 : currentVelY); ball.setVelocityY(bounceVelY); ball.y = this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT; this.deactivateAnilaForBall(ball); this.updateBallTint(ball); }
    activateBaisrava() { console.log(">>> activateBaisrava START"); if (this.isStageClearing || this.isGameOver) { console.log(">>> activateBaisrava BLOCKED"); return; } const activeBricks = this.bricks.getMatching('active', true); let destroyedCount = 0; console.log(">>> Found active bricks:", activeBricks.length); activeBricks.forEach(brick => { brick.disableBody(true, true); this.score += 10; destroyedCount++; }); if (destroyedCount > 0) { console.log(`>>> Baisrava destroyed ${destroyedCount} bricks. New score: ${this.score}`); this.events.emit('updateScore', this.score); } else { console.log(">>> Baisrava: No active bricks found."); } console.log(">>> activateBaisrava END, calling stageClear..."); this.stageClear(); }

    // --- ゲームフロー ---
    loseLife() { if (this.isStageClearing || this.isGameOver || this.lives <= 0) return; console.log("Losing a life."); this.lives--; this.events.emit('updateLives', this.lives); this.isBallLaunched = false; Object.keys(this.powerUpTimers).forEach(type => { if(this.powerUpTimers[type]) { this.powerUpTimers[type].remove(); this.powerUpTimers[type] = null; this.deactivatePowerByType(type); } }); if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; const activeSindara = this.balls.getMatching('isSindara', true); if(activeSindara.length > 0) this.deactivateSindara(activeSindara); if (this.lives > 0) { this.time.delayedCall(500, this.resetForNewLife, [], this); } else { this.time.delayedCall(500, this.gameOver, [], this); } }
    resetForNewLife() { if (this.isGameOver || this.isStageClearing) { console.log(">>> resetForNewLife aborted"); return; } console.log(">>> resetForNewLife START"); if (this.balls) { console.log(">>> Clearing balls..."); this.balls.clear(true, true); } if (this.paddle) { console.log(">>> Resetting paddle..."); this.paddle.x = this.gameWidth / 2; this.paddle.y = this.gameHeight - PADDLE_Y_OFFSET; } let newBall = null; if (this.paddle) { console.log(">>> Creating new ball..."); newBall = this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS); } else { console.error(">>> Paddle not found!"); newBall = this.createAndAddBall(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2 - BALL_RADIUS); } if (!newBall || !newBall.active) console.error(">>> Failed ball creation!"); else console.log(">>> New ball created. Active:", newBall.active); this.isBallLaunched = false; console.log(">>> Calling setColliders..."); this.setColliders(); console.log(">>> resetForNewLife END"); }
    gameOver() { if (this.isGameOver) return; this.isGameOver = true; console.log("Game Over!"); if(this.gameOverText) this.gameOverText.setVisible(true); this.physics.pause(); if (this.balls) { this.balls.getChildren().forEach(ball => { if(ball.active) { ball.setVelocity(0, 0); if(ball.body) ball.body.enable = false; } }); } Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(); }); this.powerUpTimers = {}; if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; }
    stageClear() { if (this.isStageClearing || this.isGameOver) { console.log(`>>> stageClear skipped.`); return; } this.isStageClearing = true; console.log(`>>> Stage ${this.currentStage} Clear! Setting isStageClearing=true.`); try { this.physics.pause(); console.log(">>> Physics paused."); Object.keys(this.powerUpTimers).forEach(type => { if(this.powerUpTimers[type]) { this.powerUpTimers[type].remove(); this.powerUpTimers[type] = null; this.deactivatePowerByType(type); } }); if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; const activeSindara = this.balls.getMatching('isSindara', true); if(activeSindara.length > 0) this.deactivateSindara(activeSindara); const activeBikara = this.balls.getMatching('isBikara', true); if(activeBikara.length > 0) this.deactivateBikara(activeBikara); const activeIndara = this.balls.getMatching('isIndaraActive', true); activeIndara.forEach(b => this.deactivateIndaraForBall(b)); const activeAnila = this.balls.getMatching('isAnilaActive', true); activeAnila.forEach(b => this.deactivateAnilaForBall(b)); console.log(">>> Powers deactivated."); if(this.balls) { this.balls.getChildren().forEach(ball => { if(ball.active) { ball.setVelocity(0,0).setVisible(false).setActive(false); if(ball.body) ball.body.enable = false; } }); console.log(">>> Balls cleared."); } if(this.bricks) { this.bricks.getChildren().forEach(brick => { if (brick.getData('isMarkedByBikara')) brick.setData('isMarkedByBikara', false); }); console.log(">>> Marks cleared."); } if(this.powerUps) { this.powerUps.clear(true, true); console.log(">>> Powerups cleared."); } /*alert(`ステージ ${this.currentStage} クリア！ (仮)`);*/ console.log(`>>> Stage clear message (Stage ${this.currentStage})`); this.currentStage++; console.log(`>>> Stage incremented to ${this.currentStage}.`); const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12; console.log(`>>> Check max stages: ${this.currentStage} > ${maxStages}`); if (this.currentStage > maxStages) { console.log(">>> Calling gameComplete..."); this.gameComplete(); } else { console.log(">>> Setting up next stage via delayedCall..."); this.events.emit('updateStage', this.currentStage); this.time.delayedCall(500, () => { console.log(">>> delayedCall START."); if (!this.scene || !this.scene.isActive() || this.isGameOver) { console.warn(`>>> delayedCall aborted.`); return; } try { console.log(">>> delayedCall: createBricks..."); this.createBricks(); console.log(">>> delayedCall: Bricks created. Count:", this.bricks ? this.bricks.getLength() : 'N/A'); console.log(">>> delayedCall: resetForNewLife..."); this.resetForNewLife(); console.log(">>> delayedCall: resetForNewLife finished."); console.log(">>> delayedCall: physics.resume..."); this.physics.resume(); console.log(">>> delayedCall: Physics resumed."); this.isStageClearing = false; console.log(`>>> delayedCall: isStageClearing set to ${this.isStageClearing}.`); } catch (error) { console.error("!!!!!!!!!! ERROR inside delayedCall !!!!!!!!!!", error); this.isStageClearing = false; console.error(">>> Set isStageClearing=false after error."); } console.log(">>> delayedCall END."); }, [], this); } } catch (error) { console.error("!!!!!!!!!! ERROR during stageClear !!!!!!!!!!", error); this.isStageClearing = false; console.error(">>> Set isStageClearing=false after error."); } console.log(">>> stageClear function end."); }
    gameComplete() { console.log("Game Complete!"); alert(`ゲームクリア！\nスコア: ${this.score}`); this.returnToTitle(); }
    returnToTitle() { console.log("Returning to TitleScene..."); if (this.physics.world && !this.physics.world.running) this.physics.resume(); if (this.scene.isActive('UIScene')) { this.scene.stop('UIScene'); console.log("UIScene stopped."); } this.time.delayedCall(10, () => { if (this.scene && this.scene.isActive()) { console.log("Starting TitleScene..."); this.scene.start('TitleScene'); } else console.warn("GameScene inactive."); }); }
    shutdown() { console.log("GameScene shutdown."); this.isGameOver = false; this.isStageClearing = false; Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(false); }); this.powerUpTimers = {}; if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(false); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(false); this.sindaraMergeTimer = null; if(this.input) this.input.removeAllListeners(); if(this.time) this.time.removeAllEvents(); if(this.physics.world) this.physics.world.off('worldbounds', this.handleWorldBounds, this); this.events.removeAllListeners(); if (this.balls) this.balls.destroy(true); this.balls = null; if (this.bricks) this.bricks.destroy(true); this.bricks = null; if (this.powerUps) this.powerUps.destroy(true); this.powerUps = null; if (this.paddle) this.paddle.destroy(); this.paddle = null; this.ballPaddleCollider = null; this.ballBrickCollider = null; this.ballBrickOverlap = null; this.ballBallCollider = null; console.log("GameScene cleanup finished."); }

} // ← GameScene クラスの終わり

// --- UIScene ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText = null; this.scoreText = null; this.stageText = null; }
    create() {
        console.log("UIScene Create: Start");
        this.gameWidth = this.scale.width;
        // UI要素作成
        const textStyle = { fontSize: '24px', fill: '#fff' };
        this.livesText = this.add.text(16, 16, 'ライフ: -', textStyle);
        this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: -', textStyle).setOrigin(0.5, 0);
        this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: 0', textStyle).setOrigin(1, 0);
        // GameSceneリスナー登録
        try {
             const gameScene = this.scene.get('GameScene');
             if (gameScene && gameScene.events) {
                  console.log("UIScene: GameScene found immediately.");
                  this.registerGameEventListeners(gameScene);
             } else {
                 this.scene.get('GameScene').events.once('create', this.registerGameEventListeners, this);
                 console.log("UIScene: Waiting for GameScene create event...");
             }
        } catch (e) { console.error("UIScene: Error getting GameScene.", e); }
        // シャットダウン処理
        this.events.on('shutdown', () => {
            console.log("UIScene Shutdown.");
            try {
                const gameScene = this.scene.get('GameScene');
                if (gameScene && gameScene.events) {
                    gameScene.events.off('updateLives', this.updateLivesDisplay, this);
                    gameScene.events.off('updateScore', this.updateScoreDisplay, this);
                    gameScene.events.off('updateStage', this.updateStageDisplay, this);
                    gameScene.events.off('create', this.registerGameEventListeners, this);
                }
            } catch (e) { /* Ignore */ }
        });
        console.log("UIScene Create: End");
    }
    registerGameEventListeners(gameScene) {
        console.log("UIScene: Registering listeners.");
        if (!gameScene || !gameScene.events) { console.error("UIScene Register: Invalid GameScene."); return; }
        // リスナー削除＆登録
        gameScene.events.off('updateLives', this.updateLivesDisplay, this);
        gameScene.events.off('updateScore', this.updateScoreDisplay, this);
        gameScene.events.off('updateStage', this.updateStageDisplay, this);
        gameScene.events.on('updateLives', this.updateLivesDisplay, this);
        gameScene.events.on('updateScore', this.updateScoreDisplay, this);
        gameScene.events.on('updateStage', this.updateStageDisplay, this);
        // 初期値設定
        try {
            if (gameScene.hasOwnProperty('lives')) this.updateLivesDisplay(gameScene.lives);
            if (gameScene.hasOwnProperty('score')) this.updateScoreDisplay(gameScene.score);
            if (gameScene.hasOwnProperty('currentStage')) this.updateStageDisplay(gameScene.currentStage);
            console.log("UIScene: Initial state updated.");
        } catch (e) { console.error("UIScene: Error updating initial state.", e); }
    }
    updateLivesDisplay(lives) { if (this.livesText) this.livesText.setText(`ライフ: ${lives}`); }
    updateScoreDisplay(score) { if (this.scoreText) this.scoreText.setText(`スコア: ${score}`); }
    updateStageDisplay(stage) { if (this.stageText) this.stageText.setText(`ステージ: ${stage}`); }
}

// --- Phaserゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-game-container',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%', // 例: 800
        height: '100%' // 例: 600
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false, gravity: { y: 0 } }
    },
    scene: [BootScene, TitleScene, GameScene, UIScene],
    input: { activePointers: 3, },
    render: { pixelArt: false, antialias: true, }
};

// --- ゲーム開始 ---
window.onload = () => {
    // HTML側に <div id="phaser-game-container"></div> が必要
    const game = new Phaser.Game(config);
    console.log("Phaser Game instance created.");
};