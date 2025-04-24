// --- 定数 ---
const PADDLE_WIDTH_RATIO = 0.2;
const PADDLE_HEIGHT = 20;
const PADDLE_Y_OFFSET = 50;
const BALL_RADIUS = 18; // 見た目のボール画像の半径 (直径36)
const PHYSICS_BALL_RADIUS = 60; // 当たり判定(緑円)の半径
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

const POWERUP_DROP_RATE = 0.7;
const BAISRAVA_DROP_RATE = 0.02;
const POWERUP_SIZE = 40; // ★ 全体サイズを40に変更
const POWERUP_SPEED_Y = 100;
const POWERUP_TYPES = { KUBIRA: 'kubira', SHATORA: 'shatora', HAILA: 'haila', ANCHIRA: 'anchira', SINDARA: 'sindara', BIKARA: 'bikara', INDARA: 'indara', ANILA: 'anila', BAISRAVA: 'baisrava', VAJRA: 'vajra', MAKIRA: 'makira', MAKORA: 'makora' };
const NORMAL_MODE_POWERUP_POOL = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA, POWERUP_TYPES.MAKORA ];
const ALLSTARS_MODE_POWERUP_POOL = [...NORMAL_MODE_POWERUP_POOL];
const POWERUP_COLORS = { [POWERUP_TYPES.KUBIRA]: 0x800080, [POWERUP_TYPES.SHATORA]: 0xffa500, [POWERUP_TYPES.HAILA]: 0xadd8e6, /*[POWERUP_TYPES.ANCHIRA]: 0xffc0cb,*/ [POWERUP_TYPES.SINDARA]: 0xd2b48c, /*[POWERUP_TYPES.BIKARA]: 0xffffff,*/ [POWERUP_TYPES.INDARA]: 0x4682b4, [POWERUP_TYPES.ANILA]: 0xffefd5, [POWERUP_TYPES.BAISRAVA]: 0xffd700, [POWERUP_TYPES.VAJRA]: 0xffff00, [POWERUP_TYPES.MAKIRA]: 0x008080, [POWERUP_TYPES.MAKORA]: 0xffffff, }; // アンチラ、ビカラの色は不要に
const MAKORA_COPYABLE_POWERS = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA ];
const BIKARA_COLORS = { yin: 0x444444, yang: 0xfffafa }; // Tint用だがアイコン優先
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

const SYMBOL_PATTERNS = { /* ... (変更なし) ... */ };

// --- BootScene ---
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        this.textures.generate('whitePixel', { data: ['1'], pixelWidth: 1 });
        this.load.image('ball_image', 'assets/ball.png');

        // アンチラ
        this.load.image('anchira_icon', 'assets/icon_anchira.png');
        // this.load.audio('voice_anchira', 'assets/voice_anchira.m4a'); // ★ m4a に変更

        // ★ ビカラ
        this.load.image('icon_bikara_yin', 'assets/icon_bikara_yin.png');
        this.load.image('icon_bikara_yang', 'assets/icon_bikara_yang.png');
        // this.load.audio('voice_bikara_yin', 'assets/voice_bikara_yin.m4a');
        // this.load.audio('voice_bikara_yang', 'assets/voice_bikara_yang.m4a');
    }
    create() { this.scene.start('TitleScene'); }
}

// --- TitleScene ---
class TitleScene extends Phaser.Scene { /* ... (変更なし) ... */ }

// --- GameScene ---
class GameScene extends Phaser.Scene {
    // ... (constructor, init, preload, create, updatePaddleSize, handleResize, setupStage, update, setColliders は変更なし) ...
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
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; this.cameras.main.setBackgroundColor('#222');
        this.time.delayedCall(50, () => { if (this.scene.isActive('UIScene')) { this.events.emit('updateLives', this.lives); this.events.emit('updateScore', this.score); this.events.emit('updateStage', this.currentStage); if (this.isVajraSystemActive) { this.events.emit('activateVajraUI', this.vajraGauge, VAJRA_GAUGE_MAX); } else { this.events.emit('deactivateVajraUI'); } this.events.emit('updateDropPoolUI', this.stageDropPool); } });
        this.physics.world.setBoundsCollision(true, true, true, false); this.physics.world.on('worldbounds', this.handleWorldBounds, this);
        this.paddle = this.physics.add.image(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET, 'whitePixel').setTint(0xffffff).setImmovable(true).setData('originalWidthRatio', PADDLE_WIDTH_RATIO); this.updatePaddleSize();
        this.balls = this.physics.add.group({ bounceX: 1, bounceY: 1, collideWorldBounds: true });
        this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        this.setupStage();
        this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER\nTap to Restart', { fontSize: '48px', fill: '#f00', align: 'center' }).setOrigin(0.5).setVisible(false).setDepth(1);
        this.powerUps = this.physics.add.group(); this.familiars = this.physics.add.group(); this.makiraBeams = this.physics.add.group();
        this.setColliders();
        this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);
        this.input.on('pointermove', (pointer) => { if (!this.isGameOver && this.lives > 0 && this.paddle && !this.isStageClearing) { const targetX = pointer.x; const halfWidth = this.paddle.displayWidth / 2; const clampedX = Phaser.Math.Clamp(targetX, halfWidth, this.scale.width - halfWidth); this.paddle.x = clampedX; if (!this.isBallLaunched) { this.balls.getChildren().forEach(ball => { if (ball.active) ball.x = clampedX; }); } } });
        this.input.on('pointerdown', () => { if (this.isGameOver && this.gameOverText?.visible) { this.returnToTitle(); } else if (this.lives > 0 && !this.isBallLaunched && !this.isStageClearing) { this.launchBall(); } });
        this.scale.on('resize', this.handleResize, this);
        this.events.on('shutdown', this.shutdown, this);
    }

     updatePaddleSize() { if (!this.paddle) return; const newWidth = this.scale.width * this.paddle.getData('originalWidthRatio'); this.paddle.setDisplaySize(newWidth, PADDLE_HEIGHT); this.paddle.refreshBody(); const halfWidth = this.paddle.displayWidth / 2; this.paddle.x = Phaser.Math.Clamp(this.paddle.x, halfWidth, this.scale.width - halfWidth); }
    handleResize(gameSize, baseSize, displaySize, resolution) { this.gameWidth = gameSize.width; this.gameHeight = gameSize.height; this.updatePaddleSize(); if (this.scene.isActive('UIScene')) { this.events.emit('gameResize'); } }
    setupStage() { if (this.currentMode === GAME_MODE.NORMAL) { const shuffledPool = Phaser.Utils.Array.Shuffle([...NORMAL_MODE_POWERUP_POOL]); this.stageDropPool = shuffledPool.slice(0, 4); this.events.emit('updateDropPoolUI', this.stageDropPool); } else { this.stageDropPool = [...ALLSTARS_MODE_POWERUP_POOL]; this.events.emit('updateDropPoolUI', []); } this.createBricks(); }

    update() {
        if (this.isGameOver || this.isStageClearing || this.lives <= 0) { return; }
        let activeBallCount = 0; let sindaraBalls = [];
        this.balls.getChildren().forEach(ball => { if (ball.active) { activeBallCount++; if (this.isBallLaunched && !this.isStageClearing && ball.y > this.gameHeight + ball.displayHeight) { if (ball.getData('isAnilaActive')) { this.triggerAnilaBounce(ball); } else { ball.setActive(false).setVisible(false); if (ball.body) ball.body.enable = false; } } if (ball.getData('isSindara')) { sindaraBalls.push(ball); if (ball.getData('isAttracting')) { this.updateSindaraAttraction(ball); } } if (ball.body && this.isBallLaunched) { const minSpeed = NORMAL_BALL_SPEED * 0.1; const maxSpeed = NORMAL_BALL_SPEED * 5; const speed = ball.body.velocity.length(); if (speed < minSpeed && speed > 0) { ball.body.velocity.normalize().scale(minSpeed); } else if (speed > maxSpeed) { ball.body.velocity.normalize().scale(maxSpeed); } } } });
        if (sindaraBalls.length === 1 && this.balls.getTotalUsed() > 1) { const remainingBall = sindaraBalls[0]; if (remainingBall.getData('isSindara')) { this.deactivateSindara([remainingBall]); this.updateBallTint(remainingBall); } }
        if (activeBallCount === 0 && this.isBallLaunched && !this.isStageClearing && this.lives > 0) { this.loseLife(); return; }
        this.powerUps.children.each(powerUp => { if (powerUp.active && powerUp.y > this.gameHeight + POWERUP_SIZE) { powerUp.destroy(); } });
        // ★ アンチラ解除は deactivatePowerByType で処理
        // if (this.balls.countActive(true) === 1) { const lastBall = this.balls.getFirstAlive(); if (lastBall && lastBall.getData('isAnchira')) { this.deactivateAnchira([lastBall]); this.updateBallTint(lastBall); } }
        if (this.isMakiraActive && this.paddle && this.familiars) { const paddleX = this.paddle.x; const familiarY = this.paddle.y - PADDLE_HEIGHT / 2 - MAKIRA_FAMILIAR_SIZE; const children = this.familiars.getChildren(); if (children.length >= 1 && children[0].active) children[0].setPosition(paddleX - MAKIRA_FAMILIAR_OFFSET, familiarY); if (children.length >= 2 && children[1].active) children[1].setPosition(paddleX + MAKIRA_FAMILIAR_OFFSET, familiarY); }
        if (this.makiraBeams) { this.makiraBeams.children.each(beam => { if (beam.active && beam.y < -MAKIRA_BEAM_HEIGHT) { beam.destroy(); } }); }
    }

    setColliders() {
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy(); if (this.ballBrickCollider) this.ballBrickCollider.destroy(); if (this.ballBrickOverlap) this.ballBrickOverlap.destroy(); if (this.ballBallCollider) this.ballBallCollider.destroy(); if (this.makiraBeamBrickOverlap) this.makiraBeamBrickOverlap.destroy();
        if (!this.balls || !this.paddle || !this.bricks) return;
        this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this);
        this.ballBrickCollider = this.physics.add.collider(this.bricks, this.balls, this.hitBrick, (brick, ball) => { const isBikara = ball.getData('isBikara'); const isPenetrating = ball.getData('isPenetrating'); const isSindaraMerging = ball.getData('isSindara') && ball.getData('isMerging'); const isSindaraAttracting = ball.getData('isSindara') && ball.getData('isAttracting'); return !(isPenetrating || (isBikara && ball.getData('bikaraState') !== 'yin') || isSindaraMerging || isSindaraAttracting); }, this); // Bikara(陽)も貫通しないように
        this.ballBrickOverlap = this.physics.add.overlap(this.balls, this.bricks, this.handleBallBrickOverlap, (ball, brick) => { return ball.getData('isPenetrating') || (ball.getData('isBikara') && ball.getData('bikaraState') === 'yin') || (ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'))); }, this); // Bikara(陰)のみOverlap対象
        this.ballBallCollider = this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, (ball1, ball2) => { return ball1.getData('isSindara') && ball2.getData('isSindara') && ball1.getData('isAttracting') && ball2.getData('isAttracting'); }, this);
        if (this.makiraBeams && this.bricks) { this.makiraBeamBrickOverlap = this.physics.add.overlap(this.makiraBeams, this.bricks, this.hitBrickWithMakiraBeam, null, this); }
    }


    createAndAddBall(x, y, vx = 0, vy = 0, data = null) {
        const initialTexture = (data && data.isBikara) ? (data.bikaraState === 'yang' ? 'icon_bikara_yang' : 'icon_bikara_yin') :
                               (data && data.isAnchira) ? 'anchira_icon' :
                               'ball_image'; // ★ 初期テクスチャをデータに基づいて決定

        const ball = this.balls.create(x, y, initialTexture) // ★ 決定した初期テクスチャを使用
                         .setOrigin(0.5, 0.5)
                         .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2)
                         .setCircle(PHYSICS_BALL_RADIUS)
                         .setCollideWorldBounds(true)
                         .setBounce(1);

        if (ball.body) {
             ball.setVelocity(vx, vy);
             ball.body.onWorldBounds = true;
             console.log(`Ball created with texture: ${initialTexture} at x=${ball.x}, y=${ball.y}`);
             // ... 他のログ出力 ...
        } else {
            console.error("Failed to create ball physics body!");
            ball.destroy();
            return null;
        }

        ball.setData({
            activePowers: data ? new Set(data.activePowers) : new Set(),
            lastActivatedPower: data ? data.lastActivatedPower : null,
            isPenetrating: data ? data.isPenetrating : false,
            isFast: data ? data.isFast : false,
            isSlow: data ? data.isSlow : false,
            isAnchira: data ? data.isAnchira : false,
            isSindara: data ? data.isSindara : false,
            sindaraPartner: null,
            isAttracting: false,
            isMerging: false,
            isBikara: data ? data.isBikara : false,
            bikaraState: data ? data.bikaraState : null, // activateBikara で陰に設定される
            bikaraYangCount: 0,
            isIndaraActive: data ? data.isIndaraActive : false,
            indaraHomingCount: data ? data.indaraHomingCount : 0,
            isAnilaActive: data ? data.isAnilaActive : false
        });

        this.updateBallTint(ball); // Tint処理 (アイコンならクリアされる)

        if (data) {
             if (ball.getData('isFast')) this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA);
             else if (ball.getData('isSlow')) this.applySpeedModifier(ball, POWERUP_TYPES.HAILA);
        }
        return ball;
    }

    // ... ( launchBall, createBricks系, handleBrick系, getDestroyableBrickCount は変更なし) ...
     launchBall() { if (!this.isBallLaunched && this.balls) { const firstBall = this.balls.getFirstAlive(); if (firstBall) { const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]);
        console.log(`Ball launched with vx=${initialVelocityX}, vy=${BALL_INITIAL_VELOCITY_Y}`);
        firstBall.setVelocity(initialVelocityX, BALL_INITIAL_VELOCITY_Y); this.isBallLaunched = true; } } }

    createBricks() {
        console.log(`Generating Bricks (Stage ${this.currentStage})`);
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
        else if (stage >= 3 && SYMBOL_PATTERNS[stageString]) {
             specialLayoutType = 'symbol';
        }

        let density;
        if (stage <= 3) { density = 0.4; }
        else { density = 0.4 + 0.5 * progress; }

        if (specialLayoutType === 'wall') {
            console.log(`Generating Special Layout: Wall (Stage ${stage}, Density: ${density.toFixed(3)})`);
            const exitColTop = Math.floor(actualCols / 2); const exitColBottom = Math.floor(actualCols / 2);
            for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; let generateBrick = true; let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; const isOuterWall = (i === 0 || i === actualRows - 1 || j === 0 || j === actualCols - 1); const isExit = (i === 0 && j === exitColTop) || (i === actualRows - 1 && j === exitColBottom); if (isOuterWall && !isExit) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; isDurable = false; } else { if (Phaser.Math.FloatBetween(0, 1) > density) { generateBrick = false; } else { if (isExit) { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } else { const rand = Phaser.Math.FloatBetween(0, 1); if (stage >= 3 && rand < durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } } } } if (generateBrick) { const brick = this.bricks.create(bX, bY, 'whitePixel').setDisplaySize(bW, BRICK_HEIGHT).setTint(brickColor); brick.setData({ originalTint: brickColor, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable, type: brickType }); brick.refreshBody(); if (maxHits === -1) brick.body.immovable = true; } } }
            if (this.getDestroyableBrickCount() === 0 && stage > 1) { console.warn("Wall layout generated no destroyable bricks, retrying..."); this.time.delayedCall(10, this.createBricks, [], this); return; }

        } else if (specialLayoutType === 's_shape') {
            console.log(`Generating Special Layout: S-Shape (Stage ${stage}, Density: ${density.toFixed(3)})`);
            const wallRow1 = Math.floor(actualRows / 3); const wallRow2 = Math.floor(actualRows * 2 / 3); const wallLengthCols = Math.floor(actualCols * 2 / 3); let generatedDestroyableCount = 0;
            for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; let generateBrick = true; let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; const isWallPart = (i === wallRow1 && j >= actualCols - wallLengthCols) || (i === wallRow2 && j < wallLengthCols); if (isWallPart) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; isDurable = false; } else { if (Phaser.Math.FloatBetween(0, 1) > density) { generateBrick = false; } else { const rand = Phaser.Math.FloatBetween(0, 1); if (stage >= 3 && rand < durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } } } if (generateBrick) { const brick = this.bricks.create(bX, bY, 'whitePixel').setDisplaySize(bW, BRICK_HEIGHT).setTint(brickColor); brick.setData({ originalTint: brickColor, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable, type: brickType }); brick.refreshBody(); if (maxHits === -1) brick.body.immovable = true; if (maxHits !== -1) generatedDestroyableCount++; } } }
            if (generatedDestroyableCount < 5 && stage > 1) { console.warn(`S-Shape generated only ${generatedDestroyableCount} destroyable bricks, retrying...`); this.time.delayedCall(10, this.createBricks, [], this); return; }

        } else if (specialLayoutType === 'center_hollow') {
            console.log(`Generating Special Layout: Center Hollow (Stage ${stage}, Density: ${density.toFixed(3)})`);
            let generatedCount = 0; const hollowRowStart = Math.floor(actualRows / 4); const hollowRowEnd = Math.floor(actualRows * 3 / 4); const hollowColStart = Math.floor(actualCols / 4); const hollowColEnd = Math.floor(actualCols * 3 / 4);
            for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; const isInHollowArea = (i >= hollowRowStart && i < hollowRowEnd && j >= hollowColStart && j < hollowColEnd); if (isInHollowArea) { continue; } if (Phaser.Math.FloatBetween(0, 1) > density && generatedCount > 5) { continue; } const rand = Phaser.Math.FloatBetween(0, 1); let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; if (stage >= 3 && rand < indestructibleRatio) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; } else if (stage >= 3 && rand < indestructibleRatio + durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } const brick = this.bricks.create(bX, bY, 'whitePixel').setDisplaySize(bW, BRICK_HEIGHT).setTint(brickColor); brick.setData({ originalTint: brickColor, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable, type: brickType }); brick.refreshBody(); if (maxHits === -1) brick.body.immovable = true; generatedCount++; } }
            if (this.getDestroyableBrickCount() === 0 && stage > 1) { console.warn("Center Hollow layout generated no destroyable bricks, retrying..."); this.time.delayedCall(10, this.createBricks, [], this); return; }

        } else if (specialLayoutType === 'symbol') {
            console.log(`Generating Special Layout: Symbol '${stageString}' (Stage ${stage})`);
            const pattern = SYMBOL_PATTERNS[stageString];
            let generatedCount = 0;

            if (pattern && pattern.length > 0 && pattern[0].length > 0) {
                const patternRows = pattern.length;
                const patternCols = pattern[0].length;
                const patternTotalHeight = patternRows * BRICK_HEIGHT + (patternRows - 1) * BRICK_SPACING;
                const patternTotalWidth = patternCols * bW + (patternCols - 1) * BRICK_SPACING;
                const startY = BRICK_OFFSET_TOP + Math.max(0, (this.scale.height * 0.4 - patternTotalHeight) / 2);
                const startX = (this.scale.width - patternTotalWidth) / 2;

                for (let i = 0; i < patternRows; i++) {
                    for (let j = 0; j < patternCols; j++) {
                        if (pattern[i][j] === 1) {
                            const bX = startX + j * (bW + BRICK_SPACING) + bW / 2;
                            const bY = startY + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2;
                            const brickType = 'normal';
                            const brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS);
                            const maxHits = 1;
                            const isDurable = false;
                            const brick = this.bricks.create(bX, bY, 'whitePixel').setDisplaySize(bW, BRICK_HEIGHT).setTint(brickColor);
                            brick.setData({ originalTint: brickColor, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable, type: brickType });
                            brick.refreshBody();
                            generatedCount++;
                        }
                    }
                }
                 if (generatedCount < 3 && stage > 1) {
                     console.warn(`Symbol layout '${stageString}' generated only ${generatedCount} bricks, retrying as normal...`);
                     this.time.delayedCall(10, () => { this.createBricksFallbackToNormal(); }, [], this);
                     return;
                 }
            } else {
                console.warn(`Symbol pattern for stage ${stage} not found or invalid. Falling back to normal layout.`);
                this.createBricksFallbackToNormal();
                return;
            }

        } else { // 通常配置
            console.log(`Generating Normal Layout (Stage ${stage}, Density: ${density.toFixed(3)})`);
            let generatedCount = 0;
            for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; if (Phaser.Math.FloatBetween(0, 1) > density && generatedCount > 5) { continue; } const rand = Phaser.Math.FloatBetween(0, 1); let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; if (stage >= 3 && rand < indestructibleRatio) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; } else if (stage >= 3 && rand < indestructibleRatio + durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } const brick = this.bricks.create(bX, bY, 'whitePixel').setDisplaySize(bW, BRICK_HEIGHT).setTint(brickColor); brick.setData({ originalTint: brickColor, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable, type: brickType }); brick.refreshBody(); if (maxHits === -1) brick.body.immovable = true; generatedCount++; } }
            if (this.getDestroyableBrickCount() === 0 && stage > 1) { console.warn("Normal layout generated no destroyable bricks, retrying..."); this.time.delayedCall(10, this.createBricks, [], this); return; }
        }
        console.log(`Bricks generated: ${this.bricks.getLength()}, Destroyable: ${this.getDestroyableBrickCount()}`);
        this.setColliders();
    }

    createBricksFallbackToNormal() {
        console.log("Falling back to Normal Layout generation...");
        const stage = this.currentStage; const maxStage = MAX_STAGE; const rows = BRICK_ROWS + Math.floor(stage / 3); const cols = BRICK_COLS + Math.floor(stage / 4); const maxTotalBricks = Math.floor((this.scale.height * 0.5) / (BRICK_HEIGHT + BRICK_SPACING)) * (BRICK_COLS + 4) * 1.2; const actualRows = Math.min(rows, Math.floor(maxTotalBricks / (BRICK_COLS + 4))); const actualCols = Math.min(cols, BRICK_COLS + 4); let durableRatio = 0; let indestructibleRatio = 0; let progress = 0; if (stage >= 3) { progress = Phaser.Math.Clamp((stage - 3) / (maxStage - 3), 0, 1); durableRatio = progress * 0.5; indestructibleRatio = progress * 0.15; } const bW = this.scale.width * BRICK_WIDTH_RATIO; const totalBrickWidth = actualCols * bW + (actualCols - 1) * BRICK_SPACING; const oX = (this.scale.width - totalBrickWidth) / 2; let density; if (stage <= 3) { density = 0.4; } else { density = 0.4 + 0.5 * progress; }
        let generatedCount = 0;
        for (let i = 0; i < actualRows; i++) { for (let j = 0; j < actualCols; j++) { const bX = oX + j * (bW + BRICK_SPACING) + bW / 2; const bY = BRICK_OFFSET_TOP + i * (BRICK_HEIGHT + BRICK_SPACING) + BRICK_HEIGHT / 2; if (Phaser.Math.FloatBetween(0, 1) > density && generatedCount > 5) { continue; } const rand = Phaser.Math.FloatBetween(0, 1); let brickType = 'normal'; let brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); let maxHits = 1; let isDurable = false; if (stage >= 3 && rand < indestructibleRatio) { brickType = 'indestructible'; brickColor = INDESTRUCTIBLE_BRICK_COLOR; maxHits = -1; } else if (stage >= 3 && rand < indestructibleRatio + durableRatio) { brickType = 'durable'; brickColor = DURABLE_BRICK_COLOR; maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; } else { brickType = 'normal'; brickColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS); maxHits = 1; isDurable = false; } const brick = this.bricks.create(bX, bY, 'whitePixel').setDisplaySize(bW, BRICK_HEIGHT).setTint(brickColor); brick.setData({ originalTint: brickColor, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable, type: brickType }); brick.refreshBody(); if (maxHits === -1) brick.body.immovable = true; generatedCount++; } }
        if (this.getDestroyableBrickCount() === 0 && stage > 1) { console.warn("Normal layout (fallback) generated no destroyable bricks, retrying..."); this.time.delayedCall(10, this.createBricks, [], this); return; }
        console.log(`Bricks generated (fallback): ${this.bricks.getLength()}, Destroyable: ${this.getDestroyableBrickCount()}`);
        this.setColliders();
    }

    handleBrickHit(brick, damage = 1) { if (!brick || !brick.active || !brick.getData) return false; const maxHits = brick.getData('maxHits'); if (maxHits === -1 && damage !== Infinity) { return false; } let currentHits = brick.getData('currentHits'); const isDurable = brick.getData('isDurable'); if (damage === Infinity) { currentHits = 0; } else { currentHits -= damage; } brick.setData('currentHits', currentHits); if (currentHits <= 0) { this.handleBrickDestruction(brick); return true; } else if (isDurable) { const darknessFactor = (maxHits - currentHits) * DURABLE_BRICK_HIT_DARKEN; const originalColor = Phaser.Display.Color.ValueToColor(DURABLE_BRICK_COLOR); const newColor = originalColor.darken(darknessFactor); brick.setTint(newColor.color); return false; } else { return false; } }
    handleBrickDestruction(brick) { if (!brick || !brick.active) return false; const brickX = brick.x; const brickY = brick.y; brick.disableBody(true, true); this.score += 10; this.events.emit('updateScore', this.score); this.increaseVajraGauge(); if (Phaser.Math.FloatBetween(0, 1) < BAISRAVA_DROP_RATE) { this.dropSpecificPowerUp(brickX, brickY, POWERUP_TYPES.BAISRAVA); return true; } if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) { this.dropPowerUp(brickX, brickY); } return false; }
    hitBrick(brick, ball) { if (!brick || !ball || !brick.active || !ball.active || this.isStageClearing) return; if (brick.getData('maxHits') === -1) { return; } const destroyed = this.handleBrickHit(brick, 1); if (destroyed && !this.isStageClearing && this.getDestroyableBrickCount() === 0) { this.stageClear(); } }
    handleBallBrickOverlap(ball, brick) { if (!ball || !brick || !ball.active || !brick.active || this.isStageClearing) return; const isBikara = ball.getData('isBikara'); const bikaraState = ball.getData('bikaraState'); const isPenetrating = ball.getData('isPenetrating') || (ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'))); if (brick.getData('maxHits') === -1) { let destroyed = false; if (isBikara && bikaraState === 'yang') { destroyed = this.handleBrickHit(brick, Infinity); } else if (isPenetrating) { destroyed = this.handleBrickHit(brick, Infinity); } if (destroyed && !this.isStageClearing && this.getDestroyableBrickCount() === 0) { this.stageClear(); } return; } if (isBikara) { if (bikaraState === 'yin') { this.markBrickByBikara(brick); return; } else if (bikaraState === 'yang') { this.handleBikaraYangDestroy(ball, brick); return; } } else if (isPenetrating) { const destroyed = this.handleBrickHit(brick, brick.getData('maxHits')); if (destroyed && !this.isStageClearing && this.getDestroyableBrickCount() === 0) { this.stageClear(); } } else { console.warn("BallBrickOverlap called without Bikara or Penetrating state?"); const destroyed = this.handleBrickHit(brick, 1); if (destroyed && !this.isStageClearing && this.getDestroyableBrickCount() === 0) { this.stageClear(); } } }
    handleBikaraYangDestroy(ball, hitBrick) { if (!ball || !ball.active || !ball.getData('isBikara') || ball.getData('bikaraState') !== 'yang') return; let destroyedCount = 0; const markedToDestroy = []; if (hitBrick.active) { markedToDestroy.push(hitBrick); hitBrick.setData('isMarkedByBikara', false); } this.bricks.getChildren().forEach(br => { if (br.active && br.getData('isMarkedByBikara') && !markedToDestroy.includes(br)) { markedToDestroy.push(br); br.setData('isMarkedByBikara', false); } }); markedToDestroy.forEach(br => { if (br.active) { const destroyed = this.handleBrickHit(br, Infinity); if (destroyed) destroyedCount++; } }); let currentYangCount = ball.getData('bikaraYangCount') || 0; currentYangCount++; ball.setData('bikaraYangCount', currentYangCount); if (!this.isStageClearing && this.getDestroyableBrickCount() === 0) { this.stageClear(); } else if (currentYangCount >= BIKARA_YANG_COUNT_MAX) { this.deactivateBikara([ball]); this.updateBallTint(ball); } }
    hitBrickWithMakiraBeam(beam, brick) { if (!beam || !brick || !beam.active || !brick.active || this.isStageClearing || this.isGameOver) return; if (brick.getData('maxHits') === -1) { beam.destroy(); return; } try { beam.destroy(); } catch (error) { console.error("Error destroying Makira beam:", error); if (beam && beam.active) { beam.setActive(false).setVisible(false); if (beam.body) beam.body.enable = false; } } const destroyed = this.handleBrickHit(brick, 1); if (destroyed && !this.isStageClearing && this.getDestroyableBrickCount() === 0) { this.time.delayedCall(10, this.stageClear, [], this); } }
    triggerVajraDestroy() { if (this.isStageClearing || this.isGameOver) return; if (!this.isVajraSystemActive) return; this.isVajraSystemActive = false; const activeBricks = this.bricks.getMatching('active', true); if (activeBricks.length === 0) { this.deactivateVajra(); return; } const countToDestroy = Math.min(activeBricks.length, VAJRA_DESTROY_COUNT); const shuffledBricks = Phaser.Utils.Array.Shuffle(activeBricks); let destroyedCount = 0; for (let i = 0; i < countToDestroy; i++) { const brick = shuffledBricks[i]; if (brick && brick.active) { const destroyed = this.handleBrickHit(brick, Infinity); if (destroyed) destroyedCount++; } } console.log(`Vajra destroyed ${destroyedCount} bricks.`); if (!this.isStageClearing && this.getDestroyableBrickCount() === 0) { this.stageClear(); } else { this.deactivateVajra(); } }
    activateBaisrava() { if (this.isStageClearing || this.isGameOver) return; const activeBricks = this.bricks.getMatching('active', true); let destroyedCount = 0; activeBricks.forEach(brick => { if (brick && brick.active) { const destroyed = this.handleBrickHit(brick, Infinity); if (destroyed) destroyedCount++; } }); if (destroyedCount > 0) { console.log(`Baisrava destroyed ${destroyedCount} bricks.`); } this.stageClear(); }
    getDestroyableBrickCount() { if (!this.bricks) return 0; return this.bricks.getMatching('active', true).filter(brick => brick.getData('maxHits') !== -1).length; }

    dropSpecificPowerUp(x, y, type) {
        let textureKey = 'whitePixel';
        let tintColor = POWERUP_COLORS[type] || null;
        let displaySize = POWERUP_SIZE; // 全体サイズを使用

        if (type === POWERUP_TYPES.ANCHIRA) {
            textureKey = 'anchira_icon';
            tintColor = null;
        } else if (type === POWERUP_TYPES.BIKARA) { // ★ ビカラアイテム
            textureKey = 'icon_bikara_yang'; // 陽アイコンでドロップ
            tintColor = null;
        }
        // else if (type === POWERUP_TYPES.SINDARA) { textureKey = 'sindara_icon'; tintColor = null; } // 今後追加

        if (!type || (tintColor === null && textureKey === 'whitePixel' && type !== POWERUP_TYPES.MAKORA)) { // Makoraは白なのでtintColorがnullでもOK
             console.warn(`Attempted to drop invalid or uncolored powerup type: ${type}`);
             return;
         }


        let powerUp = null;
        try {
            powerUp = this.powerUps.create(x, y, textureKey);
            if (powerUp) {
                powerUp.setDisplaySize(displaySize, displaySize).setData('type', type);
                if (tintColor !== null) {
                    powerUp.setTint(tintColor);
                } else {
                    powerUp.clearTint();
                }

                if (powerUp.body) {
                    powerUp.setVelocity(0, POWERUP_SPEED_Y);
                    powerUp.body.setCollideWorldBounds(false);
                    powerUp.body.setAllowGravity(false);
                } else {
                    console.error(`No physics body for powerup type: ${type}! Destroying.`);
                    powerUp.destroy(); powerUp = null;
                }
            } else {
                console.error(`Failed to create powerup object for type: ${type}!`);
            }
        } catch (error) {
            console.error(`CRITICAL ERROR in dropSpecificPowerUp (${type}):`, error);
            if (powerUp && powerUp.active) { powerUp.destroy(); }
        }
    }

    dropPowerUp(x, y) { let availableTypes = []; if (this.currentMode === GAME_MODE.NORMAL) { availableTypes = this.stageDropPool; } else { availableTypes = ALLSTARS_MODE_POWERUP_POOL; } if (availableTypes.length === 0) return; const type = Phaser.Utils.Array.GetRandom(availableTypes); this.dropSpecificPowerUp(x, y, type); }

    hitPaddle(paddle, ball) {
        if (!paddle || !ball || !ball.active || !ball.body) return;
        let diff = ball.x - paddle.x; const maxDiff = paddle.displayWidth / 2; let influence = diff / maxDiff; influence = Phaser.Math.Clamp(influence, -1, 1); const maxVx = NORMAL_BALL_SPEED * 0.8; let newVx = maxVx * influence; const minVy = NORMAL_BALL_SPEED * 0.5; let currentVy = ball.body.velocity.y; let newVy = -Math.abs(currentVy); if (Math.abs(newVy) < minVy) newVy = -minVy; let speedMultiplier = 1.0; if (ball.getData('isFast')) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if (ball.getData('isSlow')) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA]; const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier; const newVelocity = new Phaser.Math.Vector2(newVx, newVy).normalize().scale(targetSpeed); ball.setVelocity(newVelocity.x, newVelocity.y);

        // ★ パドルヒット時の処理
        if (ball.getData('isBikara')) {
            this.switchBikaraState(ball); // ビカラ状態切り替え（テクスチャ変更含む）
        }
        if (ball.getData('isIndaraActive')) {
            this.deactivateIndaraForBall(ball);
            this.updateBallTint(ball); // Tint更新（通常ボールに戻っていれば）
        }
    }

    collectPowerUp(paddle, powerUp) {
        if (!powerUp || !powerUp.active || this.isStageClearing) return;
        const type = powerUp.getData('type');
        if (!type) { console.warn("Collected powerup with no type data!"); powerUp.destroy(); return; }

        powerUp.destroy();

        if (type === POWERUP_TYPES.ANCHIRA) {
            // this.sound.play('voice_anchira'); // ★ m4a
        } else if (type === POWERUP_TYPES.BIKARA) {
            // this.sound.play('voice_bikara_yin'); // ★ 取得時は陰ボイス
        }

        if (type === POWERUP_TYPES.BAISRAVA) { this.activateBaisrava(); return; }
        if (type === POWERUP_TYPES.VAJRA) { this.activateVajra(); return; }
        if (type === POWERUP_TYPES.MAKIRA) { this.activateMakira(); return; }
        if (type === POWERUP_TYPES.MAKORA) { this.activateMakora(); return; }
        if (type === POWERUP_TYPES.ANCHIRA || type === POWERUP_TYPES.SINDARA) { if (this.balls.countActive(true) > 1) { this.keepFurthestBall(); } }
        this.activatePower(type);
    }

    activateMakora() { /* ... (変更なし) ... */ }
    keepFurthestBall() { /* ... (変更なし) ... */ }

    activatePower(type) {
        const targetBalls = this.balls.getMatching('active', true);
        if (targetBalls.length === 0) return;

        if (POWERUP_DURATION[type]) { // BikaraにはDURATIONがないのでタイマーはセットされない
             if (this.powerUpTimers[type]) { this.powerUpTimers[type].remove(); }
         }

        switch (type) {
            case POWERUP_TYPES.KUBIRA: this.activateKubira(targetBalls); break;
            case POWERUP_TYPES.SHATORA: this.activateShatora(targetBalls); break;
            case POWERUP_TYPES.HAILA: this.activateHaira(targetBalls); break;
            case POWERUP_TYPES.ANCHIRA: if (targetBalls.length === 1) this.activateAnchira(targetBalls[0]); break;
            case POWERUP_TYPES.SINDARA: if (targetBalls.length === 1) this.activateSindara(targetBalls[0]); break;
            case POWERUP_TYPES.BIKARA: this.activateBikara(targetBalls); break; // ★ ビカラ有効化
            case POWERUP_TYPES.INDARA: this.activateIndara(targetBalls); break;
            case POWERUP_TYPES.ANILA: this.activateAnila(targetBalls); break;
        }

        // activateAnchira, activateBikara 内でテクスチャとTintが設定されるので、ここでは共通処理のみ
        if (type !== POWERUP_TYPES.ANCHIRA && type !== POWERUP_TYPES.BIKARA) {
             targetBalls.forEach(ball => {
                 if (ball.active) {
                     ball.getData('activePowers').add(type);
                     ball.setData('lastActivatedPower', type);
                     this.updateBallTint(ball);
                 }
             });
         }

        const duration = POWERUP_DURATION[type];
        if (duration) {
            this.powerUpTimers[type] = this.time.delayedCall(duration, () => {
                this.deactivatePowerByType(type);
                this.powerUpTimers[type] = null;
            }, [], this);
        }
    }

    deactivatePowerByType(type) {
        const targetBalls = this.balls.getMatching('active', true);
        if (targetBalls.length === 0 || type === POWERUP_TYPES.MAKIRA || type === POWERUP_TYPES.VAJRA || type === POWERUP_TYPES.MAKORA) return;

        switch (type) {
            case POWERUP_TYPES.KUBIRA: this.deactivateKubira(targetBalls); break;
            case POWERUP_TYPES.SHATORA: this.deactivateShatora(targetBalls); break;
            case POWERUP_TYPES.HAILA: this.deactivateHaira(targetBalls); break;
            case POWERUP_TYPES.ANCHIRA: this.deactivateAnchira(targetBalls); break;
            case POWERUP_TYPES.BIKARA: this.deactivateBikara(targetBalls); break; // ★ ビカラ解除
            // 他のパワーアップ解除もここに追加
        }

        // アンチラ、ビカラ以外の解除処理（Tint更新など）
        if (type !== POWERUP_TYPES.ANCHIRA && type !== POWERUP_TYPES.BIKARA) {
             targetBalls.forEach(ball => {
                 if (ball.active) {
                     ball.getData('activePowers').delete(type);
                     this.updateBallTint(ball);
                 }
             });
         }
    }

     updateBallTint(ball) {
        if (!ball || !ball.active) return;

        // アイコンが表示されている場合はTintしない
        if (ball.texture.key !== 'ball_image') {
            ball.clearTint();
            return;
        }

        const activePowers = ball.getData('activePowers');
        let targetColor = null;
        if (activePowers && activePowers.size > 0) {
            const lastPower = ball.getData('lastActivatedPower');
            let powerToUse = lastPower;
            if (!lastPower || !activePowers.has(lastPower)) {
                const activePowersArray = Array.from(activePowers);
                if (activePowersArray.length > 0) {
                    powerToUse = activePowersArray[activePowersArray.length - 1];
                    ball.setData('lastActivatedPower', powerToUse);
                } else {
                    powerToUse = null;
                }
            }

            // アンチラとビカラはTintしない
            if (powerToUse && powerToUse !== POWERUP_TYPES.ANCHIRA && powerToUse !== POWERUP_TYPES.BIKARA) {
                 if (powerToUse === POWERUP_TYPES.SINDARA) { // Sindaraの色分け
                    if (ball.getData('isMerging')) targetColor = SINDARA_MERGE_COLOR;
                    else if (ball.getData('isAttracting')) targetColor = SINDARA_ATTRACT_COLOR;
                    else targetColor = POWERUP_COLORS[powerToUse];
                } else {
                    targetColor = POWERUP_COLORS[powerToUse] || null; // 他のパワーアップの色
                }
            }
        }

        if (targetColor !== null) {
            ball.setTint(targetColor);
        } else {
            ball.clearTint();
        }
    }

    // --- 個別パワーアップ効果 ---
    activateKubira(balls) { balls.forEach(b => b.setData('isPenetrating', true)); }
    deactivateKubira(balls) { balls.forEach(b => { if (!b.getData('isSindara') || (!b.getData('isAttracting') && !b.getData('isMerging'))) { if (!b.getData('isBikara') || b.getData('bikaraState') !== 'yang') { b.setData('isPenetrating', false); } } }); }
    applySpeedModifier(ball, type) { if (!ball || !ball.active || !ball.body) return; const modifier = BALL_SPEED_MODIFIERS[type]; if (!modifier) return; const currentVelocity = ball.body.velocity; const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1); const newSpeed = NORMAL_BALL_SPEED * modifier; ball.setVelocity(direction.x * newSpeed, direction.y * newSpeed); }
    resetBallSpeed(ball) { if (!ball || !ball.active || !ball.body) return; if (ball.getData('isFast')) { this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); } else if (ball.getData('isSlow')) { this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); } else { const currentVelocity = ball.body.velocity; const direction = currentVelocity.length() > 0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0, -1); ball.setVelocity(direction.x * NORMAL_BALL_SPEED, direction.y * NORMAL_BALL_SPEED); } }
    activateShatora(balls) { balls.forEach(b => { b.setData({ isFast: true, isSlow: false }); this.applySpeedModifier(b, POWERUP_TYPES.SHATORA); }); }
    deactivateShatora(balls) { balls.forEach(b => { if (b.getData('isFast')) { b.setData('isFast', false); this.resetBallSpeed(b); } }); }
    activateHaira(balls) { balls.forEach(b => { b.setData({ isSlow: true, isFast: false }); this.applySpeedModifier(b, POWERUP_TYPES.HAILA); }); }
    deactivateHaira(balls) { balls.forEach(b => { if (b.getData('isSlow')) { b.setData('isSlow', false); this.resetBallSpeed(b); } }); }

    activateAnchira(sourceBall) {
        if (!sourceBall || !sourceBall.active) return;
        sourceBall.setData({ isAnchira: true, activePowers: sourceBall.getData('activePowers').add(POWERUP_TYPES.ANCHIRA), lastActivatedPower: POWERUP_TYPES.ANCHIRA });
        sourceBall.setTexture('anchira_icon');
        sourceBall.clearTint();
        const x = sourceBall.x; const y = sourceBall.y; const numSplits = 3;
        const ballData = sourceBall.data.getAll();
        for (let i = 0; i < numSplits; i++) {
            const offsetX = Phaser.Math.Between(-5, 5); const offsetY = Phaser.Math.Between(-5, 5);
            const vx = Phaser.Math.Between(-150, 150); const vy = -Math.abs(Phaser.Math.Between(NORMAL_BALL_SPEED * 0.5, NORMAL_BALL_SPEED * 0.8));
            this.createAndAddBall(x + offsetX, y + offsetY, vx, vy, ballData);
        }
        this.setColliders();
    }

    deactivateAnchira(balls) {
        balls.forEach(b => {
            if (b.active && b.getData('isAnchira')) {
                b.setData('isAnchira', false);
                b.getData('activePowers').delete(POWERUP_TYPES.ANCHIRA);
                b.setTexture('ball_image');
                this.updateBallTint(b);
            }
        });
    }

    activateSindara(sourceBall) { /* ... (変更なし) ... */ }
    startSindaraAttraction(ball1, ball2) { /* ... (変更なし) ... */ }
    updateSindaraAttraction(ball) { /* ... (変更なし) ... */ }
    handleBallCollision(ball1, ball2) { /* ... (変更なし) ... */ }
    mergeSindaraBalls(ballToKeep, ballToRemove) { /* ... (変更なし) ... */ }
    finishSindaraMerge(mergedBall) { /* ... (変更なし) ... */ }
    deactivateSindaraPenetration(ball) { /* ... (変更なし) ... */ }
    deactivateSindara(balls) { /* ... (変更なし) ... */ }

    // ★★★ ビカラ: 有効化処理 ★★★
    activateBikara(balls) {
        balls.forEach(ball => {
            if (ball.active) { // 念のため active チェック
                ball.setData({
                    isBikara: true,
                    bikaraState: 'yin', // 最初は陰モード
                    bikaraYangCount: 0,
                    activePowers: ball.getData('activePowers').add(POWERUP_TYPES.BIKARA),
                    lastActivatedPower: POWERUP_TYPES.BIKARA
                });
                ball.setTexture('icon_bikara_yin'); // 陰アイコンに設定
                ball.clearTint(); // アイコンなのでTint解除
                // Bikara発動時に貫通はしない
                if (!ball.getData('activePowers').has(POWERUP_TYPES.KUBIRA) && (!ball.getData('isSindara') || (!ball.getData('isAttracting') && !ball.getData('isMerging')))) {
                    ball.setData('isPenetrating', false);
                }
            }
        });
        this.setColliders(); // コライダー更新が必要
    }

    // ★★★ ビカラ: 無効化処理 ★★★
    deactivateBikara(balls) {
        balls.forEach(ball => {
            if (ball.active && ball.getData('isBikara')) { // active チェックを追加
                ball.setData({
                    isBikara: false,
                    bikaraState: null,
                    bikaraYangCount: 0
                });
                ball.getData('activePowers').delete(POWERUP_TYPES.BIKARA);
                ball.setTexture('ball_image'); // 通常ボール画像に戻す
                // 陰状態で解除されても貫通は解除
                if (!ball.getData('activePowers').has(POWERUP_TYPES.KUBIRA) && (!ball.getData('isSindara') || (!ball.getData('isAttracting') && !ball.getData('isMerging')))) {
                     ball.setData('isPenetrating', false);
                 }
                this.updateBallTint(ball); // 他のパワーアップが残っていればTint
            }
        });
        // Bikaraマークも解除
        this.bricks.getChildren().forEach(br => {
            if (br.getData('isMarkedByBikara')) {
                br.setData('isMarkedByBikara', false);
                br.setTint(br.getData('originalTint') || 0xffffff);
            }
        });
        this.setColliders(); // コライダー更新
    }

    // ★★★ ビカラ: 状態切り替え処理 ★★★
    switchBikaraState(ball) {
        if (!ball || !ball.active || !ball.getData('isBikara')) return;

        const currentState = ball.getData('bikaraState');
        const nextState = (currentState === 'yin') ? 'yang' : 'yin';
        ball.setData('bikaraState', nextState);

        if (nextState === 'yang') {
            ball.setData('bikaraYangCount', 0);
            ball.setTexture('icon_bikara_yang'); // 陽アイコン
            ball.setData('isPenetrating', true); // 陽は貫通(BrickOverlapで処理)
            // this.sound.play('voice_bikara_yang'); // 陽ボイス
            console.log("Bikara switched to Yang");
        } else { // nextState === 'yin'
            ball.setTexture('icon_bikara_yin'); // 陰アイコン
            // 陰は貫通しない（他の貫通効果がなければ）
            if (!ball.getData('activePowers').has(POWERUP_TYPES.KUBIRA) && (!ball.getData('isSindara') || (!ball.getData('isAttracting') && !ball.getData('isMerging')))) {
                ball.setData('isPenetrating', false);
            }
            // this.sound.play('voice_bikara_yin'); // 陰ボイス
            console.log("Bikara switched to Yin");
        }
        ball.clearTint(); // アイコンなので常にTint解除
        this.setColliders(); // コライダー更新 (isPenetratingが変わるため)
    }

    markBrickByBikara(brick) { if (!brick || !brick.active || brick.getData('isMarkedByBikara') || brick.getData('maxHits') === -1) return; brick.setData('isMarkedByBikara', true); brick.setTint(BRICK_MARKED_COLOR); }
    activateIndara(balls) { /* ... (変更なし) ... */ }
    deactivateIndaraForBall(ball) { /* ... (変更なし) ... */ }
    handleWorldBounds(body, up, down, left, right) { /* ... (変更なし) ... */ }
    activateAnila(balls) { /* ... (変更なし) ... */ }
    deactivateAnilaForBall(ball) { /* ... (変更なし) ... */ }
    triggerAnilaBounce(ball) { /* ... (変更なし) ... */ }
    activateVajra() { /* ... (変更なし) ... */ }
    increaseVajraGauge() { /* ... (変更なし) ... */ }
    deactivateVajra() { /* ... (変更なし) ... */ }
    activateMakira() { /* ... (変更なし) ... */ }
    deactivateMakira() { /* ... (変更なし) ... */ }
    createFamiliars() { /* ... (変更なし) ... */ }
    fireMakiraBeam() { /* ... (変更なし) ... */ }

    // --- ゲーム進行関連 ---
    loseLife() {
        if (this.isStageClearing || this.isGameOver || this.lives <= 0) return;
        this.deactivateMakira();
        this.deactivateVajra();
        Object.keys(this.powerUpTimers).forEach(key => { if (this.powerUpTimers[key]) { this.powerUpTimers[key].remove(); this.powerUpTimers[key] = null; } });
        if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null;
        if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null;
        if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
        this.lives--;
        this.events.emit('updateLives', this.lives);
        this.isBallLaunched = false;
        const activeBalls = this.balls.getMatching('active', true);
        if (activeBalls.length > 0) {
            // すべてのパワーアップ状態とテクスチャをリセット
            this.deactivateAnchira(activeBalls);
            this.deactivateBikara(activeBalls); // ★ Bikara解除を追加
            this.deactivateSindara(activeBalls);
            this.deactivateKubira(activeBalls);
            this.deactivateShatora(activeBalls);
            this.deactivateHaira(activeBalls);

            activeBalls.forEach(ball => {
                 if (ball.active) {
                     this.deactivateIndaraForBall(ball);
                     this.deactivateAnilaForBall(ball);
                     ball.setData({
                         isPenetrating: false, isFast: false, isSlow: false,
                         activePowers: new Set(), lastActivatedPower: null
                         // isAnchira, isBikara などは各deactivate関数でfalseになる想定
                     });
                     this.resetBallSpeed(ball);
                     ball.setTexture('ball_image');
                     ball.clearTint();
                 }
            });
        }
        if (this.lives > 0) {
            this.time.delayedCall(500, this.resetForNewLife, [], this);
        } else {
            this.time.delayedCall(500, this.gameOver, [], this);
        }
    }

    resetForNewLife() { /* ... (変更なし) ... */ }
    gameOver() { /* ... (変更なし) ... */ }
    stageClear() {
         if (this.isStageClearing || this.isGameOver) return;
         this.isStageClearing = true;
         this.deactivateMakira();
         this.deactivateVajra();
         try {
             this.physics.pause();
             Object.keys(this.powerUpTimers).forEach(key => { if (this.powerUpTimers[key]) { this.powerUpTimers[key].remove(); this.powerUpTimers[key] = null; } });
             if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null;
             if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null;
             if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
             const activeBalls = this.balls.getMatching('active', true);
             if (activeBalls.length > 0) {
                 // ステージクリア時もボールの状態をリセット
                 this.deactivateAnchira(activeBalls);
                 this.deactivateBikara(activeBalls); // ★ Bikara解除を追加
                 this.deactivateSindara(activeBalls);
                 this.deactivateKubira(activeBalls);
                 this.deactivateShatora(activeBalls);
                 this.deactivateHaira(activeBalls);
                 activeBalls.forEach(ball => {
                     if(ball.active){
                         this.deactivateIndaraForBall(ball);
                         this.deactivateAnilaForBall(ball);
                         ball.setData({ isPenetrating: false, isFast: false, isSlow: false, activePowers: new Set(), lastActivatedPower: null });
                     }
                 });
             }
             if (this.balls) { this.balls.getChildren().forEach(ball => { if (ball.active) { ball.setVelocity(0, 0).setVisible(false).setActive(false); if (ball.body) ball.body.enable = false; } }); }
             if (this.bricks) { this.bricks.getChildren().forEach(br => { if (br.getData('isMarkedByBikara')) br.setData('isMarkedByBikara', false); }); }
             if (this.powerUps) { this.powerUps.clear(true, true); }
             this.currentStage++;
             const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12;
             if (this.currentStage > maxStages) {
                 this.gameComplete();
             } else {
                 this.events.emit('updateStage', this.currentStage);
                 this.time.delayedCall(1000, () => {
                     if (!this.scene || !this.scene.isActive() || this.isGameOver) return;
                     try {
                         this.setupStage();
                         this.isStageClearing = false;
                         this.resetForNewLife();
                         this.physics.resume();
                     } catch (e) {
                         console.error("Error setting up next stage:", e);
                         this.isStageClearing = false;
                         this.gameOver();
                     }
                 }, [], this);
             }
         } catch (e) {
             console.error("Error during stage clear process:", e);
             this.isStageClearing = false;
             this.gameOver();
         }
     }
    gameComplete() { /* ... (変更なし) ... */ }
    returnToTitle() { /* ... (変更なし) ... */ }
    shutdown() { /* ... (変更なし) ... */ }
} // <-- GameScene クラスの終わり

// --- UIScene ---
class UIScene extends Phaser.Scene { /* ... (変更なし) ... */ }

// --- Phaserゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-game-container', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false, // デバッグモードはオフに
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