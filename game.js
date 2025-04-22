// --- 定数 ---
// (変更なし)
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
const POWERUP_COLORS = { [POWERUP_TYPES.KUBIRA]: 0x800080, [POWERUP_TYPES.SHATORA]: 0xffa500, [POWERUP_TYPES.HAILA]: 0xadd8e6, [POWERUP_TYPES.ANCHIRA]: 0xffc0cb, [POWERUP_TYPES.SINDARA]: 0xd2b48c, [POWERUP_TYPES.BIKARA]: 0xffffff, [POWERUP_TYPES.INDARA]: 0x4682b4, [POWERUP_TYPES.ANILA]: 0xffefd5, [POWERUP_TYPES.BAISRAVA]: 0xffd700, [POWERUP_TYPES.VAJRA]: 0xffff00, [POWERUP_TYPES.MAKIRA]: 0x008080, [POWERUP_TYPES.MAKORA]: 0xffffff, };
const MAKORA_COPYABLE_POWERS = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA ];
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

const SYMBOL_PATTERNS = {
    '3': [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ],
    '9': [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
    ],
    '11': [
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0]
    ],
};

// --- BootScene (テクスチャ生成 + 確認ログ) ---
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.textures.generate('whitePixel', { data: ['1'], pixelWidth: 1 });

        // ブロックテクスチャ生成
        const brickWidth = 64;
        const brickHeight = 32;
        const lineWidth = 2;

        // 1. 通常ブロック用
        let graphics = this.make.graphics({ width: brickWidth, height: brickHeight, add: false });
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, brickWidth, brickHeight);
        graphics.lineStyle(lineWidth, 0x555555, 1);
        graphics.strokeRect(lineWidth / 2, lineWidth / 2, brickWidth - lineWidth, brickHeight - lineWidth);
        graphics.generateTexture('brick_texture_base', brickWidth, brickHeight);
        console.log("[BootScene] Texture 'brick_texture_base' exists:", this.textures.exists('brick_texture_base')); // ★ 確認ログ
        graphics.destroy();

        // 2. 耐久ブロック用
        graphics = this.make.graphics({ width: brickWidth, height: brickHeight, add: false });
        graphics.fillStyle(DURABLE_BRICK_COLOR, 1);
        graphics.fillRect(0, 0, brickWidth, brickHeight);
        graphics.lineStyle(lineWidth, 0x333333, 1);
        graphics.strokeRect(lineWidth / 2, lineWidth / 2, brickWidth - lineWidth, brickHeight - lineWidth);
        graphics.generateTexture('brick_texture_durable_base', brickWidth, brickHeight);
        console.log("[BootScene] Texture 'brick_texture_durable_base' exists:", this.textures.exists('brick_texture_durable_base')); // ★ 確認ログ
        graphics.destroy();

        // 3. 破壊不可ブロック用
        graphics = this.make.graphics({ width: brickWidth, height: brickHeight, add: false });
        graphics.fillStyle(INDESTRUCTIBLE_BRICK_COLOR, 1);
        graphics.fillRect(0, 0, brickWidth, brickHeight);
        graphics.lineStyle(lineWidth, 0x111111, 1);
        graphics.strokeRect(lineWidth / 2, lineWidth / 2, brickWidth - lineWidth, brickHeight - lineWidth);
        graphics.generateTexture('brick_texture_indestructible_base', brickWidth, brickHeight);
        console.log("[BootScene] Texture 'brick_texture_indestructible_base' exists:", this.textures.exists('brick_texture_indestructible_base')); // ★ 確認ログ
        graphics.destroy();
    }

    create() {
        this.scene.start('TitleScene');
    }
}

// --- TitleScene ---
// (変更なし)
class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() {
        const w = this.scale.width; const h = this.scale.height; this.cameras.main.setBackgroundColor('#222');
        this.add.text(w / 2, h * 0.2, '十二神将ブロック崩し', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(w / 2, h * 0.3, '(仮)', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } }; const buttonHoverStyle = { fill: '#ff0' };
        const normalButton = this.add.text(w / 2, h * 0.5, '通常モード', buttonStyle).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerover', () => { normalButton.setStyle(buttonHoverStyle) }).on('pointerout', () => { normalButton.setStyle(buttonStyle) }).on('pointerdown', () => { this.scene.start('GameScene', { mode: GAME_MODE.NORMAL }); this.scene.launch('UIScene'); });
        const allStarsButton = this.add.text(w / 2, h * 0.7, '全員集合モード', buttonStyle).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerover', () => { allStarsButton.setStyle(buttonHoverStyle) }).on('pointerout', () => { allStarsButton.setStyle(buttonStyle) }).on('pointerdown', () => { this.scene.start('GameScene', { mode: GAME_MODE.ALL_STARS }); this.scene.launch('UIScene'); });
    }
}

// --- GameScene ---
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.paddle = null; this.balls = null; this.bricks = null; this.powerUps = null; this.lives = 0; this.gameOverText = null; this.isBallLaunched = false; this.gameWidth = 0; this.gameHeight = 0; this.currentMode = null; this.currentStage = 1; this.score = 0;
        this.ballPaddleCollider = null; this.ballBrickCollider = null; this.ballBrickOverlap = null; this.ballBallCollider = null;
        this.powerUpTimers = {};
        this.sindaraAttractionTimer = null; this.sindaraMergeTimer = null; this.sindaraPenetrationTimer = null;
        this.isStageClearing = false; this.isGameOver = false;
        this.isVajraSystemActive = false; this.vajraGauge = 0;
        this.isMakiraActive = false; this.familiars = null; this.makiraBeams = null; this.makiraAttackTimer = null; this.makiraBeamBrickOverlap = null;
        this.stageDropPool = [];
    }

    init(data) {
        this.currentMode = data.mode || GAME_MODE.NORMAL; this.lives = (this.currentMode === GAME_MODE.ALL_STARS) ? 1 : 3; this.isBallLaunched = false; this.currentStage = 1; this.score = 0;
        Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(); }); this.powerUpTimers = {};
        if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
        this.isStageClearing = false; this.isGameOver = false;
        this.isVajraSystemActive = false; this.vajraGauge = 0;
        this.isMakiraActive = false; if (this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer = null;
        this.stageDropPool = [];
    }

    preload() { }

    create() {
        console.log("[GameScene] create() started"); // ★ 開始ログ
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; this.cameras.main.setBackgroundColor('#222');

        // 1. 物理ワールド設定
        this.physics.world.setBoundsCollision(true, true, true, false);
        this.physics.world.on('worldbounds', this.handleWorldBounds, this);
        console.log("[GameScene] Physics world bounds set."); // ★ ログ

        // 2. 物理グループ初期化
        this.balls = this.physics.add.group({ bounceX: 1, bounceY: 1, collideWorldBounds: true });
        this.powerUps = this.physics.add.group();
        this.familiars = this.physics.add.group();
        this.makiraBeams = this.physics.add.group();
        console.log("[GameScene] Physics groups initialized."); // ★ ログ

        // 3. パドル生成と設定
        this.paddle = this.physics.add.image(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET, 'whitePixel')
            .setTint(0xffffff)
            .setImmovable(true)
            .setData('originalWidthRatio', PADDLE_WIDTH_RATIO);
        this.updatePaddleSize(); // パドル生成直後にサイズ更新
        console.log(`[GameScene] Paddle created at x: ${this.paddle.x}, y: ${this.paddle.y}, width: ${this.paddle.displayWidth}`); // ★ ログ

        // 4. ボール生成
        this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        const initialBall = this.balls.getFirstAlive();
        if (initialBall) {
             console.log(`[GameScene] Initial ball created at x: ${initialBall.x}, y: ${initialBall.y}`); // ★ ログ
        } else {
             console.error("[GameScene] Failed to create initial ball!"); // ★ エラーログ
        }


        // 5. ステージ設定 (ブリック生成含む)
        this.setupStage(); // この中で this.bricks が初期化され、ブリックが生成される
        console.log(`[GameScene] Stage ${this.currentStage} setup called.`); // ★ ログ

        // 6. UI要素生成
        this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER\nTap to Restart', { fontSize: '48px', fill: '#f00', align: 'center' })
            .setOrigin(0.5).setVisible(false).setDepth(1);

        // 7. コライダー設定 (全ての物理オブジェクト生成後)
        this.setColliders();
        console.log("[GameScene] Colliders set."); // ★ ログ

        // 8. オーバーラップ設定
        this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);

        // 9. 入力イベントリスナー
        this.input.on('pointermove', (pointer) => { /* ... */ });
        this.input.on('pointerdown', () => { /* ... */ });

        // 10. リサイズイベントリスナー
        this.scale.on('resize', this.handleResize, this);

        // 11. シャットダウンイベントリスナー
        this.events.on('shutdown', this.shutdown, this);

        // 12. UIシーンへの初期データ送信
        this.time.delayedCall(50, () => { if (this.scene.isActive('UIScene')) { /* ... */ } });
        console.log("[GameScene] create() finished."); // ★ 終了ログ
    }

    updatePaddleSize() { if (!this.paddle) return; const newWidth = this.scale.width * this.paddle.getData('originalWidthRatio'); this.paddle.setDisplaySize(newWidth, PADDLE_HEIGHT); this.paddle.refreshBody(); const halfWidth = this.paddle.displayWidth / 2; this.paddle.x = Phaser.Math.Clamp(this.paddle.x, halfWidth, this.scale.width - halfWidth); }
    handleResize(gameSize, baseSize, displaySize, resolution) { this.gameWidth = gameSize.width; this.gameHeight = gameSize.height; this.updatePaddleSize(); if (this.scene.isActive('UIScene')) { this.events.emit('gameResize'); } }
    setupStage() { if (this.currentMode === GAME_MODE.NORMAL) { const shuffledPool = Phaser.Utils.Array.Shuffle([...NORMAL_MODE_POWERUP_POOL]); this.stageDropPool = shuffledPool.slice(0, 4); this.events.emit('updateDropPoolUI', this.stageDropPool); } else { this.stageDropPool = [...ALLSTARS_MODE_POWERUP_POOL]; this.events.emit('updateDropPoolUI', []); } this.createBricks(); }

    update() {
        // (update ロジックは変更なし)
        if (this.isGameOver || this.isStageClearing || this.lives <= 0) { return; }
        let activeBallCount = 0; let sindaraBalls = [];
        this.balls.getChildren().forEach(ball => { if (ball.active) { activeBallCount++; if (this.isBallLaunched && !this.isStageClearing && ball.y > this.gameHeight + ball.displayHeight) { if (ball.getData('isAnilaActive')) { this.triggerAnilaBounce(ball); } else { ball.setActive(false).setVisible(false); if (ball.body) ball.body.enable = false; } } if (ball.getData('isSindara')) { sindaraBalls.push(ball); if (ball.getData('isAttracting')) { this.updateSindaraAttraction(ball); } } if (ball.body && this.isBallLaunched) { const minSpeed = NORMAL_BALL_SPEED * 0.1; const maxSpeed = NORMAL_BALL_SPEED * 5; const speed = ball.body.velocity.length(); if (speed < minSpeed && speed > 0) { ball.body.velocity.normalize().scale(minSpeed); } else if (speed > maxSpeed) { ball.body.velocity.normalize().scale(maxSpeed); } } } });
        if (sindaraBalls.length === 1 && this.balls.getTotalUsed() > 1) { const remainingBall = sindaraBalls[0]; if (remainingBall.getData('isSindara')) { this.deactivateSindara([remainingBall]); this.updateBallTint(remainingBall); } }
        if (activeBallCount === 0 && this.isBallLaunched && !this.isStageClearing && this.lives > 0) { this.loseLife(); return; }
        this.powerUps.children.each(powerUp => { if (powerUp.active && powerUp.y > this.gameHeight + POWERUP_SIZE) { powerUp.destroy(); } });
        if (this.balls.countActive(true) === 1) { const lastBall = this.balls.getFirstAlive(); if (lastBall && lastBall.getData('isAnchira')) { this.deactivateAnchira([lastBall]); this.updateBallTint(lastBall); } }
        if (this.isMakiraActive && this.paddle && this.familiars) { const paddleX = this.paddle.x; const familiarY = this.paddle.y - PADDLE_HEIGHT / 2 - MAKIRA_FAMILIAR_SIZE; const children = this.familiars.getChildren(); if (children.length >= 1 && children[0].active) children[0].setPosition(paddleX - MAKIRA_FAMILIAR_OFFSET, familiarY); if (children.length >= 2 && children[1].active) children[1].setPosition(paddleX + MAKIRA_FAMILIAR_OFFSET, familiarY); }
        if (this.makiraBeams) { this.makiraBeams.children.each(beam => { if (beam.active && beam.y < -MAKIRA_BEAM_HEIGHT) { beam.destroy(); } }); }
    }

    setColliders() {
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy(); if (this.ballBrickCollider) this.ballBrickCollider.destroy(); if (this.ballBrickOverlap) this.ballBrickOverlap.destroy(); if (this.ballBallCollider) this.ballBallCollider.destroy(); if (this.makiraBeamBrickOverlap) this.makiraBeamBrickOverlap.destroy();
        if (!this.balls || !this.paddle || !this.bricks) {
             console.warn("[GameScene] setColliders called before all objects are ready."); // ★ 警告ログ
             return;
        }
        this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this);
        this.ballBrickCollider = this.physics.add.collider(this.bricks, this.balls, this.hitBrick, (brick, ball) => { const isBikara = ball.getData('isBikara'); const isPenetrating = ball.getData('isPenetrating'); const isSindaraMerging = ball.getData('isSindara') && ball.getData('isMerging'); const isSindaraAttracting = ball.getData('isSindara') && ball.getData('isAttracting'); return !(isPenetrating || isBikara || isSindaraMerging || isSindaraAttracting); }, this);
        this.ballBrickOverlap = this.physics.add.overlap(this.balls, this.bricks, this.handleBallBrickOverlap, (ball, brick) => { return ball.getData('isPenetrating') || ball.getData('isBikara') || (ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'))); }, this);
        this.ballBallCollider = this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, (ball1, ball2) => { return ball1.getData('isSindara') && ball2.getData('isSindara') && ball1.getData('isAttracting') && ball2.getData('isAttracting'); }, this);
        if (this.makiraBeams && this.bricks) { this.makiraBeamBrickOverlap = this.physics.add.overlap(this.makiraBeams, this.bricks, this.hitBrickWithMakiraBeam, null, this); }
    }

    createAndAddBall(x, y, vx = 0, vy = 0, data = null) {
        const ball = this.balls.create(x, y, 'whitePixel').setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2).setTint(DEFAULT_BALL_COLOR).setCircle(BALL_RADIUS).setCollideWorldBounds(true).setBounce(1);
        if (ball.body) { ball.setVelocity(vx, vy); ball.body.onWorldBounds = true; } else { console.error("[GameScene] Failed to create ball physics body!"); ball.destroy(); return null; }
        ball.setData({ activePowers: data ? new Set(data.activePowers) : new Set(), lastActivatedPower: data ? data.lastActivatedPower : null, isPenetrating: data ? data.isPenetrating : false, isFast: data ? data.isFast : false, isSlow: data ? data.isSlow : false, isAnchira: data ? data.isAnchira : false, isSindara: data ? data.isSindara : false, sindaraPartner: null, isAttracting: false, isMerging: false, isBikara: data ? data.isBikara : false, bikaraState: data ? data.bikaraState : null, bikaraYangCount: 0, isIndaraActive: data ? data.isIndaraActive : false, indaraHomingCount: data ? data.indaraHomingCount : 0, isAnilaActive: data ? data.isAnilaActive : false });
        if (data) { this.updateBallTint(ball); if (ball.getData('isFast')) this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); else if (ball.getData('isSlow')) this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); }
        return ball;
    }

    launchBall() { if (!this.isBallLaunched && this.balls) { const firstBall = this.balls.getFirstAlive(); if (firstBall) { const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]); firstBall.setVelocity(initialVelocityX, BALL_INITIAL_VELOCITY_Y); this.isBallLaunched = true; console.log("[GameScene] Ball launched!"); } } } // ★ ログ追加

    // ★★★ createBricks 関数（デバッグログ + Tint一時無効化） ★★★
    createBricks() {
        console.log("[GameScene] createBricks() started"); // ★ 開始ログ
        if (this.bricks) { this.bricks.clear(true, true); this.bricks.destroy(); }
        this.bricks = this.physics.add.staticGroup();
        const stage = this.currentStage;
        const maxStage = MAX_STAGE;
        const rows = BRICK_ROWS + Math.floor(stage / 3);
        const cols = BRICK_COLS + Math.floor(stage / 4);
        const maxTotalBricks = Math.floor((this.scale.height * 0.5) / (BRICK_HEIGHT + BRICK_SPACING)) * (BRICK_COLS + 4) * 1.2;
        const actualRows = Math.min(rows, Math.floor(maxTotalBricks / (BRICK_COLS + 4)));
        const actualCols = Math.min(cols, BRICK_COLS + 4);
        let durableRatio = 0;
        let indestructibleRatio = 0;
        let progress = 0;
        if (stage >= 3) {
            progress = Phaser.Math.Clamp((stage - 3) / (maxStage - 3), 0, 1);
            durableRatio = progress * 0.5;
            indestructibleRatio = progress * 0.15;
        }
        const bW = this.scale.width * BRICK_WIDTH_RATIO;
        const totalBrickWidth = actualCols * bW + (actualCols - 1) * BRICK_SPACING;
        const oX = (this.scale.width - totalBrickWidth) / 2;

        let specialLayoutType = null;
        const stageString = stage.toString();
        if (stage > 2 && stage % 8 === 0) { specialLayoutType = 's_shape'; }
        else if (stage > 2 && stage % 4 === 0) { specialLayoutType = 'wall'; }
        else if (stage > 4 && stage % 6 === 0) { specialLayoutType = 'center_hollow'; }
        else if (stage >= 3 && SYMBOL_PATTERNS[stageString]) { specialLayoutType = 'symbol'; }

        let density;
        if (stage <= 3) { density = 0.4; }
        else { density = 0.4 + 0.5 * progress; }

        // --- ブロック生成ヘルパー (デバッグ用) ---
        const createBrickObject = (x, y, type, color, maxHits, isDurable) => {
            let textureKey = 'brick_texture_base';
            if (type === 'durable') textureKey = 'brick_texture_durable_base';
            else if (type === 'indestructible') textureKey = 'brick_texture_indestructible_base';

            // ★ テクスチャが存在するか再確認
            if (!this.textures.exists(textureKey)) {
                console.error(`[GameScene] Texture key '${textureKey}' not found for brick type '${type}'! Falling back to whitePixel.`);
                textureKey = 'whitePixel'; // フォールバック
            }

            const brick = this.bricks.create(x, y, textureKey);
            console.log(`[GameScene] Creating brick at (${Math.round(x)}, ${Math.round(y)}) with texture: ${brick.texture.key}`); // ★ テクスチャキー確認ログ
            brick.setDisplaySize(bW, BRICK_HEIGHT);

            // ★★★ Tint を一時的にコメントアウトしてテスト ★★★
            // brick.setTint(color);

            let originalColorForData = color;
            if (type === 'durable') originalColorForData = DURABLE_BRICK_COLOR;
            else if (type === 'indestructible') originalColorForData = INDESTRUCTIBLE_BRICK_COLOR;
            // ★ Tintしない場合は、耐久・破壊不能の基本色をセットしておく（ヒット時の色変化基準用）
            if (type === 'durable' || type === 'indestructible') {
                 brick.setTint(originalColorForData); // Tint無効化テスト中はこれもコメントアウト
            }


            brick.setData({
                originalTint: originalColorForData,
                isMarkedByBikara: false,
                maxHits: maxHits,
                currentHits: maxHits,
                isDurable: isDurable,
                type: type
            });
            brick.refreshBody();
            if (maxHits === -1) brick.body.immovable = true;
            return brick;
        };

        // --- 配置タイプに応じた生成ロジック (createBrickObject を使用) ---
        if (specialLayoutType === 'wall') { /* ... (変更なし、createBrickObject を呼ぶだけ) ... */
            console.log(`Generating Special Layout: Wall (Stage ${stage}, Density: ${density.toFixed(3)})`);
            const exitColTop = Math.floor(actualCols / 2); const exitColBottom = Math.floor(actualCols / 2);
            for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; let generateBrick = true; let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; const isOuterWall = (i === 0 || i === actualRows - 1 || j === 0 || j === actualCols - 1); const isExit = (i === 0 && j === exitColTop) || (i === actualRows - 1 && j === exitColBottom); if (isOuterWall && !isExit) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; isDurable = false; } else { if (Phaser.Math.FloatBetween(0, 1) > density) { generateBrick = false; } else { if (isExit) { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } else { const rand = Phaser.Math.FloatBetween(0, 1); if (stage >= 3 && rand < durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } } } } if (generateBrick) { createBrickObject(bX, bY, brickType, brickColor, maxHits, isDurable); } } }
            if (this.getDestroyableBrickCount() === 0 && stage > 1) { console.warn("Wall layout generated no destroyable bricks, retrying..."); this.time.delayedCall(10, this.createBricks, [], this); return; }

        } else if (specialLayoutType === 's_shape') { /* ... (変更なし、createBrickObject を呼ぶだけ) ... */
            console.log(`Generating Special Layout: S-Shape (Stage ${stage}, Density: ${density.toFixed(3)})`);
            const wallRow1 = Math.floor(actualRows / 3); const wallRow2 = Math.floor(actualRows * 2 / 3); const wallLengthCols = Math.floor(actualCols * 2 / 3); let generatedDestroyableCount = 0;
            for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; let generateBrick = true; let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; const isWallPart = (i === wallRow1 && j >= actualCols - wallLengthCols) || (i === wallRow2 && j < wallLengthCols); if (isWallPart) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; isDurable = false; } else { if (Phaser.Math.FloatBetween(0, 1) > density) { generateBrick = false; } else { const rand = Phaser.Math.FloatBetween(0, 1); if (stage >= 3 && rand < durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } } } if (generateBrick) { const brick = createBrickObject(bX, bY, brickType, brickColor, maxHits, isDurable); if (maxHits !== -1) generatedDestroyableCount++; } } }
            if (generatedDestroyableCount < 5 && stage > 1) { console.warn(`S-Shape generated only ${generatedDestroyableCount} destroyable bricks, retrying...`); this.time.delayedCall(10, this.createBricks, [], this); return; }

        } else if (specialLayoutType === 'center_hollow') { /* ... (変更なし、createBrickObject を呼ぶだけ) ... */
            console.log(`Generating Special Layout: Center Hollow (Stage ${stage}, Density: ${density.toFixed(3)})`);
            let generatedCount = 0; const hollowRowStart = Math.floor(actualRows / 4); const hollowRowEnd = Math.floor(actualRows * 3 / 4); const hollowColStart = Math.floor(actualCols / 4); const hollowColEnd = Math.floor(actualCols * 3 / 4);
            for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; const isInHollowArea = (i >= hollowRowStart && i < hollowRowEnd && j >= hollowColStart && j < hollowColEnd); if (isInHollowArea) { continue; } if (Phaser.Math.FloatBetween(0, 1) > density && generatedCount > 5) { continue; } const rand = Phaser.Math.FloatBetween(0, 1); let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; if (stage >= 3 && rand < indestructibleRatio) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; } else if (stage >= 3 && rand < indestructibleRatio + durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } createBrickObject(bX, bY, brickType, brickColor, maxHits, isDurable); generatedCount++; } }
            if (this.getDestroyableBrickCount() === 0 && stage > 1) { console.warn("Center Hollow layout generated no destroyable bricks, retrying..."); this.time.delayedCall(10, this.createBricks, [], this); return; }

        } else if (specialLayoutType === 'symbol') { /* ... (変更なし、createBrickObject を呼ぶだけ) ... */
            console.log(`Generating Special Layout: Symbol '${stageString}' (Stage ${stage})`);
            const pattern = SYMBOL_PATTERNS[stageString];
            let generatedCount = 0;
            if (pattern && pattern.length > 0 && pattern[0].length > 0) {
                const patternRows = pattern.length; const patternCols = pattern[0].length; const patternTotalHeight = patternRows * BRICK_HEIGHT + (patternRows - 1) * BRICK_SPACING; const patternTotalWidth = patternCols * bW + (patternCols - 1) * BRICK_SPACING; const startY = BRICK_OFFSET_TOP + Math.max(0, (this.scale.height * 0.4 - patternTotalHeight) / 2); const startX = (this.scale.width - patternTotalWidth) / 2;
                for (let i = 0; i < patternRows; i++) { for (let j = 0; j < patternCols; j++) { if (pattern[i][j] === 1) { const bX = startX + j * (bW + BRICK_SPACING) + bW / 2; const bY = startY + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; const brickType = 'normal'; const brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); const maxHits = 1; const isDurable = false; createBrickObject(bX, bY, brickType, brickColor, maxHits, isDurable); generatedCount++; } } }
                 if (generatedCount < 3 && stage > 1) { console.warn(`Symbol layout '${stageString}' generated only ${generatedCount} bricks, retrying as normal...`); this.time.delayedCall(10, () => { this.createBricksFallbackToNormal(); }, [], this); return; }
            } else { console.warn(`Symbol pattern for stage ${stage} not found or invalid. Falling back to normal layout.`); this.createBricksFallbackToNormal(); return; }

        } else { // 通常配置 /* ... (変更なし、createBrickObject を呼ぶだけ) ... */
            console.log(`Generating Normal Layout (Stage ${stage}, Density: ${density.toFixed(3)})`);
            let generatedCount = 0;
            for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; if (Phaser.Math.FloatBetween(0, 1) > density && generatedCount > 5) { continue; } const rand = Phaser.Math.FloatBetween(0, 1); let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; if (stage >= 3 && rand < indestructibleRatio) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; } else if (stage >= 3 && rand < indestructibleRatio + durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } createBrickObject(bX, bY, brickType, brickColor, maxHits, isDurable); generatedCount++; } }
            if (this.getDestroyableBrickCount() === 0 && stage > 1) { console.warn("Normal layout generated no destroyable bricks, retrying..."); this.time.delayedCall(10, this.createBricks, [], this); return; }
        }
        console.log(`[GameScene] Bricks generated: ${this.bricks.getLength()}, Destroyable: ${this.getDestroyableBrickCount()}`);
        this.setColliders(); // ブリック生成後にコライダーを再設定
        console.log("[GameScene] createBricks() finished."); // ★ 終了ログ
    }

    // 通常配置フォールバック用のヘルパーメソッド (デバッグ用)
    createBricksFallbackToNormal() {
        console.log("[GameScene] createBricksFallbackToNormal() started"); // ★ 開始ログ
        // (createBrickObject ヘルパー定義は createBricks 内にあるのでここでは不要)
        const stage = this.currentStage; const maxStage = MAX_STAGE; const rows = BRICK_ROWS + Math.floor(stage / 3); const cols = BRICK_COLS + Math.floor(stage / 4); const maxTotalBricks = Math.floor((this.scale.height * 0.5) / (BRICK_HEIGHT + BRICK_SPACING)) * (BRICK_COLS + 4) * 1.2; const actualRows = Math.min(rows, Math.floor(maxTotalBricks / (BRICK_COLS + 4))); const actualCols = Math.min(cols, BRICK_COLS + 4); let durableRatio = 0; let indestructibleRatio = 0; let progress = 0; if (stage >= 3) { progress = Phaser.Math.Clamp((stage - 3) / (maxStage - 3), 0, 1); durableRatio = progress * 0.5; indestructibleRatio = progress * 0.15; }
        const bW = this.scale.width * BRICK_WIDTH_RATIO;
        const totalBrickWidth = actualCols * bW + (actualCols - 1) * BRICK_SPACING; const oX = (this.scale.width - totalBrickWidth) / 2; let density; if (stage <= 3) { density = 0.4; } else { density = 0.4 + 0.5 * progress; }

        // --- ブロック生成ヘルパー (再掲、createBricksと同じもの) ---
         const createBrickObject = (x, y, type, color, maxHits, isDurable) => {
            let textureKey = 'brick_texture_base';
            if (type === 'durable') textureKey = 'brick_texture_durable_base';
            else if (type === 'indestructible') textureKey = 'brick_texture_indestructible_base';
            if (!this.textures.exists(textureKey)) {
                console.error(`[GameScene] Texture key '${textureKey}' not found for brick type '${type}'! Falling back to whitePixel.`);
                textureKey = 'whitePixel';
            }
            const brick = this.bricks.create(x, y, textureKey);
            console.log(`[GameScene] Creating brick (fallback) at (${Math.round(x)}, ${Math.round(y)}) with texture: ${brick.texture.key}`);
            brick.setDisplaySize(bW, BRICK_HEIGHT);
            // brick.setTint(color); // ★★★ Tint一時無効化 ★★★
             let originalColorForData = color;
             if (type === 'durable') originalColorForData = DURABLE_BRICK_COLOR;
             else if (type === 'indestructible') originalColorForData = INDESTRUCTIBLE_BRICK_COLOR;
             if (type === 'durable' || type === 'indestructible') {
                 // brick.setTint(originalColorForData); // Tint無効化テスト中はこれもコメントアウト
             }
            brick.setData({ originalTint: originalColorForData, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable, type: type });
            brick.refreshBody();
            if (maxHits === -1) brick.body.immovable = true;
            return brick;
        };
        // --- ここまでヘルパー ---

        let generatedCount = 0;
        for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; if (Phaser.Math.FloatBetween(0, 1) > density && generatedCount > 5) { continue; } const rand = Phaser.Math.FloatBetween(0, 1); let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; if (stage >= 3 && rand < indestructibleRatio) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; } else if (stage >= 3 && rand < indestructibleRatio + durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } createBrickObject(bX, bY, brickType, brickColor, maxHits, isDurable); generatedCount++; } }
        if (this.getDestroyableBrickCount() === 0 && stage > 1) { console.warn("Normal layout (fallback) generated no destroyable bricks, retrying..."); this.time.delayedCall(10, this.createBricks, [], this); return; }
        console.log(`[GameScene] Bricks generated (fallback): ${this.bricks.getLength()}, Destroyable: ${this.getDestroyableBrickCount()}`);
        this.setColliders();
         console.log("[GameScene] createBricksFallbackToNormal() finished."); // ★ 終了ログ
    }
    // ★★★ ブロック生成修正ここまで ★★★


    // --- ブロックヒット処理 (変更なし) ---
    handleBrickHit(brick, damage = 1) {
        if (!brick || !brick.active || !brick.getData) return false;
        const maxHits = brick.getData('maxHits');
        if (maxHits === -1 && damage !== Infinity) { return false; }
        let currentHits = brick.getData('currentHits');
        const isDurable = brick.getData('isDurable');
        if (damage === Infinity) { currentHits = 0; } else { currentHits -= damage; }
        brick.setData('currentHits', currentHits);
        if (currentHits <= 0) { this.handleBrickDestruction(brick); return true; }
        else if (isDurable) {
            const darknessFactor = (maxHits - currentHits) * DURABLE_BRICK_HIT_DARKEN;
            const originalColor = Phaser.Display.Color.ValueToColor(DURABLE_BRICK_COLOR);
            const newColor = originalColor.darken(darknessFactor);
            // ★ Tint無効化テスト中は以下の行もコメントアウトが必要
            // brick.setTint(newColor.color);
            return false;
        } else { return false; }
    }
    // --- Bikara マーク処理 (変更なし) ---
    markBrickByBikara(brick) {
        if (!brick || !brick.active || brick.getData('isMarkedByBikara') || brick.getData('maxHits') === -1) return;
        brick.setData('isMarkedByBikara', true);
         // ★ Tint無効化テスト中は以下の行もコメントアウトが必要
        // brick.setTint(BRICK_MARKED_COLOR);
    }

    // --- その他のメソッド (変更なし) ---
    handleBrickDestruction(brick) { /* ... */ }
    hitBrick(brick, ball) { /* ... */ }
    handleBallBrickOverlap(ball, brick) { /* ... */ }
    handleBikaraYangDestroy(ball, hitBrick) { /* ... (内部の setTint も無効化テスト中はコメントアウト) ... */ }
    hitBrickWithMakiraBeam(beam, brick) { /* ... */ }
    triggerVajraDestroy() { /* ... (内部の setTint も無効化テスト中はコメントアウト) ... */ }
    activateBaisrava() { /* ... (内部の setTint も無効化テスト中はコメントアウト) ... */ }
    getDestroyableBrickCount() { /* ... */ }
    dropSpecificPowerUp(x, y, type) { /* ... */ }
    dropPowerUp(x, y) { /* ... */ }
    hitPaddle(paddle, ball) { /* ... */ }
    collectPowerUp(paddle, powerUp) { /* ... */ }
    activateMakora() { /* ... */ }
    keepFurthestBall() { /* ... */ }
    activatePower(type) { /* ... */ }
    deactivatePowerByType(type) { /* ... */ }
    updateBallTint(ball) { /* ... */ }
    activateKubira(balls) { /* ... */ }
    deactivateKubira(balls) { /* ... */ }
    applySpeedModifier(ball, type) { /* ... */ }
    resetBallSpeed(ball) { /* ... */ }
    activateShatora(balls) { /* ... */ }
    deactivateShatora(balls) { /* ... */ }
    activateHaira(balls) { /* ... */ }
    deactivateHaira(balls) { /* ... */ }
    activateAnchira(sourceBall) { /* ... */ }
    deactivateAnchira(balls) { /* ... */ }
    activateSindara(sourceBall) { /* ... */ }
    startSindaraAttraction(ball1, ball2) { /* ... */ }
    updateSindaraAttraction(ball) { /* ... */ }
    handleBallCollision(ball1, ball2) { /* ... */ }
    mergeSindaraBalls(ballToKeep, ballToRemove) { /* ... */ }
    finishSindaraMerge(mergedBall) { /* ... */ }
    deactivateSindaraPenetration(ball) { /* ... */ }
    deactivateSindara(balls) { /* ... */ }
    activateBikara(balls) { /* ... */ }
    deactivateBikara(balls) { /* ... (内部の setTint も無効化テスト中はコメントアウト) ... */ }
    switchBikaraState(ball) { /* ... */ }
    activateIndara(balls) { /* ... */ }
    deactivateIndaraForBall(ball) { /* ... */ }
    handleWorldBounds(body, up, down, left, right) { /* ... */ }
    activateAnila(balls) { /* ... */ }
    deactivateAnilaForBall(ball) { /* ... */ }
    triggerAnilaBounce(ball) { /* ... */ }
    activateVajra() { /* ... */ }
    increaseVajraGauge() { /* ... */ }
    deactivateVajra() { /* ... */ }
    activateMakira() { /* ... */ }
    deactivateMakira() { /* ... */ }
    createFamiliars() { /* ... */ }
    fireMakiraBeam() { /* ... */ }
    loseLife() { /* ... */ }
    resetForNewLife() { /* ... */ }
    gameOver() { /* ... */ }
    stageClear() { /* ... (内部の setTint も無効化テスト中はコメントアウト) ... */ }
    gameComplete() { /* ... */ }
    returnToTitle() { /* ... */ }
    shutdown() { /* ... */ }
}


// --- UIScene (変更なし) ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); /* ... */ }
    create() { /* ... */ }
    onGameResize() { /* ... */ }
    registerGameEventListeners(gameScene) { /* ... */ }
    unregisterGameEventListeners(gameScene = null) { /* ... */ }
    updateLivesDisplay(lives) { /* ... */ } updateScoreDisplay(score) { /* ... */ } updateStageDisplay(stage) { /* ... */ }
    activateVajraUIDisplay(initialValue, maxValue) { /* ... */ }
    updateVajraGaugeDisplay(currentValue) { /* ... */ }
    deactivateVajraUIDisplay() { /* ... */ }
    updateDropPoolDisplay(dropPoolTypes) { /* ... */ }
    updateDropPoolPosition() { /* ... */ }
}

// --- Phaserゲーム設定 (デバッグ有効化) ---
const config = {
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-game-container', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true, // ★ 物理デバッグを有効化
            gravity: { y: 0 }
        }
    },
    scene: [BootScene, TitleScene, GameScene, UIScene],
    input: { activePointers: 3, },
    render: { pixelArt: false, antialias: true, }
};

// --- ゲーム開始 ---
window.onload = () => {
    const game = new Phaser.Game(config);
};