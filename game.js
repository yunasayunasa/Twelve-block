// --- 定数 ---
// (変更なし - ただし画像関連の定数は一時的に参照されない)
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
const DURABLE_BRICK_CHANCE = 0.2;
const MAX_DURABLE_HITS = 3;
const DURABLE_BRICK_COLOR = 0xaaaaaa;
const DURABLE_BRICK_HIT_DARKEN = 40;
const INDESTRUCTIBLE_BRICK_COLOR = 0x333333;
const MAX_STAGE = 12;

const GAME_MODE = { NORMAL: 'normal', ALL_STARS: 'all_stars' };
const BRICK_COLORS = [ 0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff ];
const BRICK_MARKED_COLOR = 0x666666;
const DEFAULT_BALL_COLOR = 0x00ff00;

const POWERUP_DROP_RATE = 0.7;
const BAISRAVA_DROP_RATE = 0.02;
const POWERUP_SIZE = 20;
const POWERUP_SPEED_Y = 100;
const POWERUP_TYPES = { KUBIRA: 'kubira', SHATORA: 'shatora', HAILA: 'haila', ANCHIRA: 'anchira', SINDARA: 'sindara', BIKARA: 'bikara', INDARA: 'indara', ANILA: 'anila', BAISRAVA: 'baisrava', VAJRA: 'vajra', MAKIRA: 'makira', MAKORA: 'makora' };
const NORMAL_MODE_POWERUP_POOL = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA, POWERUP_TYPES.MAKORA ];
const ALLSTARS_MODE_POWERUP_POOL = [...NORMAL_MODE_POWERUP_POOL];
// PowerUpの色定義はアイコン画像を使うようになるため、UIでの色表示以外では使用しなくなるが、コード内で参照されている箇所があるため残しておく
const POWERUP_COLORS = { [POWERUP_TYPES.KUBIRA]: 0x800080, [POWERUP_TYPES.SHATORA]: 0xffa500, [POWERUP_TYPES.HAILA]: 0xadd8e6, [POWERUP_TYPES.ANCHIRA]: 0xffc0cb, [POWERUP_TYPES.SINDARA]: 0xd2b48c, [POWERUP_TYPES.BIKARA]: 0xffffff, [POWERUP_TYPES.INDARA]: 0x4682b4, [POWERUP_TYPES.ANILA]: 0xffefd5, [POWERUP_TYPES.BAISRAVA]: 0xffd700, [POWERUP_TYPES.VAJRA]: 0xffff00, [POWERUP_TYPES.MAKIRA]: 0x008080, [POWERUP_TYPES.MAKORA]: 0xffffff, };
// ビカラの色の定義はUIやボールの色付けで使う可能性があるため残しておく
const BIKARA_COLORS = { yin: 0x444444, yang: 0xfffafa };
const POWERUP_DURATION = { [POWERUP_TYPES.KUBIRA]: 10000, [POWERUP_TYPES.SHATORA]: 3000, [POWERUP_TYPES.HAILA]: 10000, [POWERUP_TYPES.MAKIRA]: 6667 };
const BIKARA_YANG_COUNT_MAX = 2;
const INDARA_MAX_HOMING_COUNT = 3;
const NORMAL_BALL_SPEED = Math.abs(BALL_INITIAL_VELOCITY_Y);
const BALL_SPEED_MODIFIERS = { [POWERUP_TYPES.SHATORA]: 3.0, [POWERUP_TYPES.HAILA]: 0.3 };
const SINDARA_ATTRACTION_DELAY = 3000;
const SINDARA_ATTRACTION_FORCE = 400;
const SINDARA_MERGE_DURATION = 500;
const SINDARA_POST_MERGE_PENETRATION_DURATION = 2000;
const SINDARA_ATTRACT_COLOR = 0xa52a2a;
const SINDARA_MERGE_COLOR = 0xff4500;
const VAJRA_GAUGE_MAX = 100;
const VAJRA_GAUGE_INCREMENT = 10;
const VAJRA_DESTROY_COUNT = 5;
const MAKIRA_ATTACK_INTERVAL = 1000;
const MAKIRA_BEAM_SPEED = 400;
const MAKIRA_BEAM_WIDTH = 10;
const MAKIRA_BEAM_HEIGHT = 15;
const MAKIRA_BEAM_COLOR = 0xff0000;
const MAKIRA_FAMILIAR_OFFSET = 40;
const MAKIRA_FAMILIAR_SIZE = 10;
const MAKIRA_FAMILIAR_COLOR = 0x00ced1;
const DROP_POOL_UI_ICON_SIZE = 18;
const DROP_POOL_UI_SPACING = 5;
const UI_BOTTOM_OFFSET = 30;

// 文字パターンの定義 (一時的に未使用)
const SYMBOL_PATTERNS = {
    '3': [], '9': [], '11': []
};

// パワーアップタイプに対応するアイコン画像のキー定義 (一時的に未使用)
const POWERUP_ICON_KEYS = {};
// ボールに重ねるビカラアイコンのキー定義 (一時的に未使用)
const BIKARA_BALL_ICON_KEYS = {};
// 全てのロードが必要なアイコンタイプのリスト (一時的に未使用)
const ALL_ICON_TYPES_TO_LOAD = [];


// --- BootScene ---
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        this.textures.generate('whitePixel', { data: ['1'], pixelWidth: 1 });
        // ★ 背景画像のみをロード
        this.load.image('title_background', 'assets/title_background.jpg');
        this.load.image('game_background', 'assets/background1.jpg');

        // ★ ボール画像とアイコン画像のロードはコメントアウトしたまま
        // this.load.image('ball_image', 'assets/ball.png');
        // ALL_POWERUP_TYPES_LIST.forEach(type => { ... });
        // this.load.image(BIKARA_BALL_ICON_KEYS.yin, 'assets/icon_bikara_yin.png');
    }
    create() {
        // ★ タイトルシーンではなく直接ゲームシーンを開始（UIシーンも）
        this.scene.start('GameScene');
        this.scene.launch('UIScene');
    }
}

// --- TitleScene ---
// ★ TitleScene は使用しないため削除またはコメントアウト推奨
// class TitleScene extends Phaser.Scene {
//     constructor() { super('TitleScene'); }
//     create() {
//         // ... (TitleScene のコード)
//     }
// }


// --- GameScene ---
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.paddle = null; this.balls = null; this.bricks = null; this.powerUps = null; this.lives = 0; this.gameOverText = null; this.isBallLaunched = false; this.gameWidth = 0; this.gameHeight = 0; this.currentMode = null; this.currentStage = 1; this.score = 0;
        // ★ コライダー関連のプロパティは使用しないためコメントアウト
        // this.ballPaddleCollider = null; this.ballBrickCollider = null; this.ballBrickOverlap = null; this.ballBallCollider = null;
        // this.makiraBeamBrickOverlap = null;
        // ★ パワーアップ関連のプロパティは使用しないためコメントアウト
        // this.powerUpTimers = {};
        // this.sindaraAttractionTimer = null; this.sindaraMergeTimer = null; this.sindaraPenetrationTimer = null;
        this.isStageClearing = false; this.isGameOver = false;
        // ★ ヴァジラ・マキラ関連のプロパティは使用しないためコメントアウト
        // this.isVajraSystemActive = false; this.vajraGauge = 0;
        // this.isMakiraActive = false; this.familiars = null; this.makiraBeams = null; this.makiraAttackTimer = null;
        this.stageDropPool = [];
        // 背景画像を保持するためのプロパティ
        this.backgroundImage = null;
    }

    init(data) {
        // ★ init メソッドも最小限に
        this.currentMode = data?.mode || GAME_MODE.NORMAL;
        this.lives = (this.currentMode === GAME_MODE.ALL_STARS) ? 1 : 3;
        this.isBallLaunched = false;
        this.currentStage = 1;
        this.score = 0;

        // ★ タイマー、パワーアップ関連のリセット処理はコメントアウト
        // Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(); }); this.powerUpTimers = {};
        // if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;

        this.isStageClearing = false; this.isGameOver = false;

        // ★ ヴァジラ・マキラ関連のリセット処理はコメントアウト
        // this.isVajraSystemActive = false; this.vajraGauge = 0;
        // this.isMakiraActive = false; if (this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer = null;

        this.stageDropPool = [];
        this.backgroundImage = null; // シーン初期化時にリセット
    }

    preload() { } // BootSceneでロード済み

    create() {
        console.log("GameScene create started"); // ★ ログ追加
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height;

        // ゲーム背景画像の表示 (ロードが成功すれば表示される)
        this.backgroundImage = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'game_background');
        this.backgroundImage.setDisplaySize(this.gameWidth, this.gameHeight); // 画面いっぱいに表示

        this.cameras.main.setBackgroundColor('#222'); // 背景画像で見えなくなりますが、念のため残します

        // ★ UI シーンへのイベント発行はコメントアウト (UI シーンも最小限に修正が必要かも)
        // this.time.delayedCall(50, () => { if (this.scene.isActive('UIScene')) { this.events.emit('updateLives', this.lives); this.events.emit('updateScore', this.score); this.events.emit('updateStage', this.currentStage); if (this.isVajraSystemActive) { this.events.emit('activateVajraUI', this.vajraGauge, VAJRA_GAUGE_MAX); } else { this.events.emit('deactivateVajraUI'); } this.events.emit('updateDropPoolUI', this.stageDropPool); } });

        // ★ 物理世界の境界設定のみ残す
        this.physics.world.setBoundsCollision(true, true, true, false);
        // ★ ワールド境界衝突リスナーはコメントアウト
        // this.physics.world.on('worldbounds', this.handleWorldBounds, this);


        // パドルの生成
        this.paddle = this.physics.add.image(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET, 'whitePixel').setTint(0xffffff).setImmovable(true).setData('originalWidthRatio', PADDLE_WIDTH_RATIO);
        this.updatePaddleSize();

        // ボールを物理グループとして作成
        this.balls = this.physics.add.group({ bounceX: 1, bounceY: 1, collideWorldBounds: true });
        // createAndAddBallでボールをwhitePixelで生成・追加
        this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);

        // ★ ステージセットアップ、ブロック、パワーアップ、ヴァジラ、マキラ関連は全てコメントアウト
        // this.setupStage();
        // this.gameOverText = this.add.text(...).setVisible(false).setDepth(1);
        // this.powerUps = this.physics.add.group();
        // this.familiars = this.physics.add.group();
        // this.makiraBeams = this.physics.add.group();

        // ★ コライダー設定は全てコメントアウト
        // this.setColliders();
        // this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);

        // ★ 入力イベントリスナー設定は残す (パドル操作)
        this.input.on('pointermove', (pointer) => {
            // if (!this.isGameOver && this.lives > 0 && this.paddle && !this.isStageClearing) { // ★ 条件を簡略化
            if (this.paddle) {
                const targetX = pointer.x;
                const halfWidth = this.paddle.displayWidth / 2;
                const clampedX = Phaser.Math.Clamp(targetX, halfWidth, this.scale.width - halfWidth);
                this.paddle.x = clampedX;
                // if (!this.isBallLaunched) { // ★ 条件を簡略化
                    this.balls.getChildren().forEach(ball => {
                        if (ball.active) {
                            ball.x = clampedX;
                        }
                    });
                // }
            }
        });
        // ★ pointerdown リスナーはコメントアウト (ボール発射など不要な処理を避ける)
        // this.input.on('pointerdown', () => { ... });

        // ★ リサイズリスナーは残す
        this.scale.on('resize', this.handleResize, this);
        // ★ shutdown リスナーは残す
        this.events.on('shutdown', this.shutdown, this);

        console.log("GameScene create finished"); // ★ ログ追加
    }

    updatePaddleSize() { if (!this.paddle) return; const newWidth = this.scale.width * this.paddle.getData('originalWidthRatio'); this.paddle.setDisplaySize(newWidth, PADDLE_HEIGHT); this.paddle.refreshBody(); const halfWidth = this.paddle.displayWidth / 2; this.paddle.x = Phaser.Math.Clamp(this.paddle.x, halfWidth, this.scale.width - halfWidth); }

    handleResize(gameSize, baseSize, displaySize, resolution) {
        console.log("GameScene handleResize"); // ★ ログ追加
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;
        this.updatePaddleSize();
        if (this.backgroundImage) {
             this.backgroundImage.setPosition(this.gameWidth / 2, this.gameHeight / 2);
             this.backgroundImage.setDisplaySize(this.gameWidth, this.gameHeight);
        }
        // if (this.scene.isActive('UIScene')) { this.events.emit('gameResize'); } // ★ UIイベント発行はコメントアウト
    }

    // ★ setupStage はコメントアウトしたまま
    // setupStage() { ... }

    update() {
        // console.log("GameScene update"); // ★ updateログは重いのでコメントアウト
        // ★ update メソッドの主要な処理はコメントアウト
        // if (this.isGameOver || this.isStageClearing || this.lives <= 0) { return; }
        // ... (ボールの画面外判定、Sindara処理、Makira処理など全てコメントアウト) ...

        // update関数内には、パドルとボールの物理演算による自動的な動き以外、
        // この最小構成では特別な処理は不要なはず。
        // 物理演算はPhaserが自動で行う。
    }

    // ★ setColliders 関数はコメントアウトしたまま
    // setColliders() { ... }

    // createAndAddBall 関数でボールをwhitePixelで生成
    createAndAddBall(x, y, vx = 0, vy = 0, data = null) {
        // whitePixelキーを使用
        const ball = this.balls.create(x, y, 'whitePixel').setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2).setTint(DEFAULT_BALL_COLOR).setCircle(BALL_RADIUS).setCollideWorldBounds(true).setBounce(1);
        if (ball.body) {
             // ★ ボールの初期速度を設定（とりあえず下方向）
             ball.setVelocity(0, NORMAL_BALL_SPEED); // ★ BALL_INITIAL_VELOCITY_Y は上方向なので下方向にする
             // ball.body.onWorldBounds = true; // ★ 一時コメントアウト
        } else { console.error("Failed to create ball physics body!"); ball.destroy(); return null; }
        // ★ Ballのデータ設定も最小限に
        // ball.setData({ activePowers: ..., lastActivatedPower: ..., isPenetrating: ..., ... });
        // if (data) { this.updateBallTint(ball); if (ball.getData('isFast')) ... }
        return ball;
    }

    // ★ launchBall 関数はコメントアウトしたまま
    // launchBall() { ... }

    // ★ createBricks 関数（ほぼ空にする）はコメントアウトしたまま
    // createBricks() { ... }
    // createBricksFallbackToNormal() { ... }

    // ★ dropSpecificPowerUp 関数 -> whitePixel+Tintに戻したまま
     dropSpecificPowerUp(x, y, type) {
        const color = POWERUP_COLORS[type] || 0x888888;
        let powerUp = null;
        try {
             powerUp = this.powerUps.create(x, y, 'whitePixel');
             if (powerUp) {
                 powerUp.setDisplaySize(POWERUP_SIZE, POWERUP_SIZE).setTint(color).setData('type', type);
                  if (powerUp.body) { powerUp.setVelocity(0, POWERUP_SPEED_Y); powerUp.body.setCollideWorldBounds(false); powerUp.body.setAllowGravity(false); } else { console.error(`No physics body for powerup type: ${type}! Destroying.`); powerUp.destroy(); }
             } else { console.error(`Failed to create powerup object for type: ${type}!`); }
        } catch (error) {
            console.error(`CRITICAL ERROR in dropSpecificPowerUp (${type}):`, error);
            if (powerUp && powerUp.active) {
                powerUp.destroy();
            }
        }
    }

    // ★ dropPowerUp 関数はコメントアウトしたまま
    // dropPowerUp(x, y) { ... }

    // ★ hitPaddle 関数はコメントアウトしたまま
    // hitPaddle(paddle, ball) { ... }

    // ★ collectPowerUp 関数はコメントアウトしたまま
    // collectPowerUp(paddle, powerUp) { ... }
    // activateMakora() { ... }
    // keepFurthestBall() { ... }
    // activatePower(type) { ... }
    // deactivatePowerByType(type) { ... }

    // updateBallTint 関数 (色のみ更新に戻したまま - ただしほぼ使用されない)
    updateBallTint(ball) {
        if (!ball || !ball.active) return;
        // この最小構成ではパワーアップがないため、基本的にDEFAULT_BALL_COLORになる
        ball.setTint(DEFAULT_BALL_COLOR);
    }
    // ★ 個別パワーアップ効果関連の関数は全てコメントアウト
    // activateKubira() { ... }
    // deactivateKubira() { ... }
    // applySpeedModifier() { ... }
    // resetBallSpeed() { ... }
    // ... (他のパワーアップ関連関数) ...
    // handleWorldBounds() { ... } // ★ コメントアウト

    // ★ ゲーム進行関連の関数は全てコメントアウト
    // loseLife() { ... }
    // resetForNewLife() { ... }
    // gameOver() { ... }
    // stageClear() { ... }
    // gameComplete() { ... }
    // returnToTitle() { ... }

    // shutdown 関数は残す (クリーンアップのため)
    shutdown() {
        console.log("GameScene shutdown started"); // ★ ログ追加
        if (this.scale) this.scale.off('resize', this.handleResize, this);
        // if (this.physics.world) this.physics.world.off('worldbounds', this.handleWorldBounds, this); // ★ コメントアウト
        this.events.removeAllListeners();
        if (this.input) this.input.removeAllListeners();
        this.isGameOver = false; // ★ プロパティのリセットのみ残す
        this.isStageClearing = false;

        // ★ クリーンアップ処理も最小限に
        // this.deactivateMakira();
        // this.deactivateVajra();
        // Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(false); }); this.powerUpTimers = {};
        // if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(false); this.sindaraAttractionTimer = null;
        // if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(false); this.sindaraMergeTimer = null;
        // if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(false); this.sindaraPenetrationTimer = null;
        // if (this.makiraAttackTimer) this.makiraAttackTimer.remove(false); this.makiraAttackTimer = null;
        if (this.time) this.time.removeAllEvents();

        if (this.balls) this.balls.destroy(true); this.balls = null;
        if (this.bricks) this.bricks.destroy(true); this.bricks = null;
        if (this.powerUps) this.powerUps.destroy(true); this.powerUps = null;
        if (this.paddle) this.paddle.destroy(); this.paddle = null;
        if (this.familiars) this.familiars.destroy(true); this.familiars = null;
        if (this.makiraBeams) this.makiraBeams.destroy(true); this.makiraBeams = null;
        if (this.gameOverText) this.gameOverText.destroy(); this.gameOverText = null;

        // ★ コライダーオブジェクトの破棄もコメントアウト
        // this.ballPaddleCollider = null; this.ballBrickCollider = null; this.ballBrickOverlap = null; this.ballBallCollider = null; this.makiraBeamBrickOverlap = null;

        // 背景画像オブジェクトも破棄する
        if (this.backgroundImage) { this.backgroundImage.destroy(); this.backgroundImage = null; }
         console.log("GameScene shutdown finished"); // ★ ログ追加
    }
}


// --- UIScene ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText = null; this.scoreText = null; this.stageText = null; this.vajraGaugeText = null; this.dropPoolIconsGroup = null; this.gameSceneListenerAttached = false; this.gameScene = null; }
    create() {
        console.log("UIScene create started"); // ★ ログ追加
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; const textStyle = { fontSize: '24px', fill: '#fff' };

        // ★ UIテキストの生成のみ残す
        this.livesText = this.add.text(16, 16, 'ライフ: ', textStyle);
        this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: ', textStyle).setOrigin(0.5, 0);
        this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: ', textStyle).setOrigin(1, 0);
        // this.vajraGaugeText = this.add.text(...).setVisible(false); // ★ コメントアウト
        // this.dropPoolIconsGroup = this.add.group(); // ★ コメントアウト

        // ★ UI 表示更新関連のイベントリスナー設定はコメントアウト
        // this.gameScene = this.scene.get('GameScene'); if (this.gameScene) { this.gameScene.events.on('gameResize', this.onGameResize, this); } try { const gameScene = this.scene.get('GameScene'); if (gameScene && gameScene.scene.settings.status === Phaser.Scenes.RUNNING) { this.registerGameEventListeners(gameScene); } else { this.scene.get('GameScene').events.once('create', this.registerGameEventListeners, this); } } catch (e) { console.error("Error setting up UIScene listeners:", e); }
        // this.events.on('shutdown', () => { this.unregisterGameEventListeners(); if (this.gameScene && this.gameScene.events) { this.gameScene.events.off('gameResize', this.onGameResize, this); } });

        // ★ 初期表示の更新もコメントアウト
        // this.updateDropPoolDisplay([]);
        // this.updateLivesDisplay(3); // 仮の値
        // this.updateScoreDisplay(0); // 仮の値
        // this.updateStageDisplay(1); // 仮の値

        console.log("UIScene create finished"); // ★ ログ追加
    }

    // ★ UI 更新関連の関数は全てコメントアウト
    onGameResize() { /* console.log("UIScene handleResize"); */ this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; this.livesText?.setPosition(16, 16); this.stageText?.setPosition(this.gameWidth / 2, 16); this.scoreText?.setPosition(this.gameWidth - 16, 16); /* this.vajraGaugeText?.setPosition(16, this.gameHeight - UI_BOTTOM_OFFSET); this.updateDropPoolPosition(); */ } // ★ Vajra/DropPool関連もコメントアウト
    registerGameEventListeners(gameScene) { /* ... */ }
    unregisterGameEventListeners(gameScene = null) { /* ... */ }
    updateLivesDisplay(lives) { if (this.livesText) this.livesText.setText(`ライフ: ${lives}`); } // ★ この関数自体は残すが、リスナーがないので呼ばれない
    updateScoreDisplay(score) { if (this.scoreText) this.scoreText.setText(`スコア: ${score}`); } // ★ この関数自体は残すが、リスナーがないので呼ばれない
    updateStageDisplay(stage) { if (this.stageText) this.stageText.setText(`ステージ: ${stage}`); } // ★ この関数自体は残すが、リスナーがないので呼ばれない
    // activateVajraUIDisplay() { ... }
    // updateVajraGaugeDisplay() { ... }
    // deactivateVajraUIDisplay() { ... }
    updateDropPoolDisplay(dropPoolTypes) { /* ... */ }
    updateDropPoolPosition() { /* ... */ }
}

// --- Phaserゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-game-container', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { debug: false, gravity: { y: 0 } } }, // ★ デバッグ表示は Off に戻す
    scene: [BootScene, GameScene, UIScene], // ★ TitleScene を除外
    input: { activePointers: 3, },
    render: { pixelArt: false, antialias: true, }
};

// --- ゲーム開始 ---
window.onload = () => {
    const game = new Phaser.Game(config);
};
