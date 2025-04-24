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
const POWERUP_SIZE = 40; // アイテムサイズ
const POWERUP_SPEED_Y = 100;
const POWERUP_TYPES = { KUBIRA: 'kubira', SHATORA: 'shatora', HAILA: 'haila', ANCHIRA: 'anchira', SINDARA: 'sindara', BIKARA: 'bikara', INDARA: 'indara', ANILA: 'anila', BAISRAVA: 'baisrava', VAJRA: 'vajra', MAKIRA: 'makira', MAKORA: 'makora' };
const NORMAL_MODE_POWERUP_POOL = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA, POWERUP_TYPES.MAKORA ];
const ALLSTARS_MODE_POWERUP_POOL = [...NORMAL_MODE_POWERUP_POOL];
const POWERUP_COLORS = { [POWERUP_TYPES.KUBIRA]: 0x800080, [POWERUP_TYPES.SHATORA]: 0xffa500, [POWERUP_TYPES.HAILA]: 0xadd8e6, /*[POWERUP_TYPES.ANCHIRA]: 0xffc0cb,*/ /*[POWERUP_TYPES.SINDARA]: 0xd2b48c,*/ /*[POWERUP_TYPES.BIKARA]: 0xffffff,*/ [POWERUP_TYPES.INDARA]: 0x4682b4, [POWERUP_TYPES.ANILA]: 0xffefd5, [POWERUP_TYPES.BAISRAVA]: 0xffd700, [POWERUP_TYPES.VAJRA]: 0xffff00, [POWERUP_TYPES.MAKIRA]: 0x008080, [POWERUP_TYPES.MAKORA]: 0xffffff, }; // アイコン使うものは色不要
const MAKORA_COPYABLE_POWERS = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA ];
// const BIKARA_COLORS = { yin: 0x444444, yang: 0xfffafa };
const POWERUP_DURATION = { [POWERUP_TYPES.KUBIRA]: 10000, [POWERUP_TYPES.SHATORA]: 3000, [POWERUP_TYPES.HAILA]: 10000, [POWERUP_TYPES.MAKIRA]: 6667 };
const BIKARA_YANG_COUNT_MAX = 2;
const INDARA_MAX_HOMING_COUNT = 3;
const NORMAL_BALL_SPEED = Math.abs(BALL_INITIAL_VELOCITY_Y);
const BALL_SPEED_MODIFIERS = { [POWERUP_TYPES.SHATORA]: 3.0, [POWERUP_TYPES.HAILA]: 0.3 };
const SINDARA_ATTRACTION_DELAY = 3000;
const SINDARA_ATTRACTION_FORCE = 400;
const SINDARA_MERGE_DURATION = 500;
const SINDARA_POST_MERGE_PENETRATION_DURATION = 2000;
// const SINDARA_ATTRACT_COLOR = 0xa52a2a; // アイコン使うので不要
// const SINDARA_MERGE_COLOR = 0xff4500; // アイコン使うので不要
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
        // this.load.audio('voice_anchira', 'assets/voice_anchira.m4a');
        // ビカラ
        this.load.image('icon_bikara_yin', 'assets/icon_bikara_yin.png');
        this.load.image('icon_bikara_yang', 'assets/icon_bikara_yang.png');
        // this.load.audio('voice_bikara_yin', 'assets/voice_bikara_yin.m4a');
        // this.load.audio('voice_bikara_yang', 'assets/voice_bikara_yang.m4a');
        // ★ シンダラ
        this.load.image('icon_sindara', 'assets/icon_sindara.png');
        this.load.image('icon_super_sindara', 'assets/icon_super_sindara.png');
        // this.load.audio('voice_sindara', 'assets/voice_sindara.m4a');
        // this.load.audio('voice_sindara_merge', 'assets/voice_sindara_merge.m4a');
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
        this.balls.getChildren().forEach(ball => { if (ball.active) { activeBallCount++; if (this.isBallLaunched && !this.isStageClearing && ball.y > this.gameHeight + ball.displayHeight) { if (ball.getData('isAnilaActive')) { this.triggerAnilaBounce(ball); } else { ball.setActive(false).setVisible(false); if (ball.body) ball.body.enable = false; } }
            // ★ シンダラ状態チェックと処理
            if (ball.getData('isSindara')) {
                 sindaraBalls.push(ball);
                 if (ball.getData('isAttracting')) {
                     this.updateSindaraAttraction(ball);
                 }
             }
             if (ball.body && this.isBallLaunched) { const minSpeed = NORMAL_BALL_SPEED * 0.1; const maxSpeed = NORMAL_BALL_SPEED * 5; const speed = ball.body.velocity.length(); if (speed < minSpeed && speed > 0) { ball.body.velocity.normalize().scale(minSpeed); } else if (speed > maxSpeed) { ball.body.velocity.normalize().scale(maxSpeed); } } } });
        // ★ シンダラが1球だけ残った場合の処理
        if (sindaraBalls.length === 1 && this.balls.getTotalUsed() > 1) { // 複数ボールあった状況から1球になった場合
             const remainingBall = sindaraBalls[0];
             if (remainingBall.getData('isSindara')) { // かつそれがシンダラボールだったら
                this.deactivateSindara([remainingBall]); // シンダラ状態解除
                // updateBallTint は deactivateSindara 内で呼ばれる
            }
         }
        if (activeBallCount === 0 && this.isBallLaunched && !this.isStageClearing && this.lives > 0) { this.loseLife(); return; }
        this.powerUps.children.each(powerUp => { if (powerUp.active && powerUp.y > this.gameHeight + POWERUP_SIZE) { powerUp.destroy(); } });
        if (this.isMakiraActive && this.paddle && this.familiars) { const paddleX = this.paddle.x; const familiarY = this.paddle.y - PADDLE_HEIGHT / 2 - MAKIRA_FAMILIAR_SIZE; const children = this.familiars.getChildren(); if (children.length >= 1 && children[0].active) children[0].setPosition(paddleX - MAKIRA_FAMILIAR_OFFSET, familiarY); if (children.length >= 2 && children[1].active) children[1].setPosition(paddleX + MAKIRA_FAMILIAR_OFFSET, familiarY); }
        if (this.makiraBeams) { this.makiraBeams.children.each(beam => { if (beam.active && beam.y < -MAKIRA_BEAM_HEIGHT) { beam.destroy(); } }); }
    }

    setColliders() {
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy();
        if (this.ballBrickCollider) this.ballBrickCollider.destroy();
        if (this.ballBrickOverlap) this.ballBrickOverlap.destroy();
        if (this.ballBallCollider) this.ballBallCollider.destroy();
        if (this.makiraBeamBrickOverlap) this.makiraBeamBrickOverlap.destroy();

        if (!this.balls || !this.paddle || !this.bricks) return;

        this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this);

        // Collider: 貫通中でなく、Bikara(陰)でもなく、Sindara特殊状態でもない場合に衝突
        this.ballBrickCollider = this.physics.add.collider(this.bricks, this.balls, this.hitBrick, (brick, ball) => {
            const isBikaraYin = ball.getData('isBikara') && ball.getData('bikaraState') === 'yin';
            const isPenetrating = ball.getData('isPenetrating');
            // ★ シンダラの吸引・合体中も貫通扱い (衝突しない)
            const isSindaraSpecial = ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'));
            return !isPenetrating && !isBikaraYin && !isSindaraSpecial;
        }, this);

        // Overlap: Bikara(陰) または Sindara特殊状態の時にコールバック
        this.ballBrickOverlap = this.physics.add.overlap(this.balls, this.bricks, this.handleBallBrickOverlap, (ball, brick) => {
            const isBikaraYin = ball.getData('isBikara') && ball.getData('bikaraState') === 'yin';
            // ★ シンダラの吸引・合体中も Overlap で処理（色変えなど）
             const isSindaraSpecial = ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'));
             // ★ Kubiraなど単純な貫通もOverlapで破壊処理させるならここに isPenetrating も追加
             const isPenetrating = ball.getData('isPenetrating');

            return isBikaraYin || isSindaraSpecial || isPenetrating;
        }, this);

        // Ball-Ball Collider: シンダラ引き寄せ中のみ
        this.ballBallCollider = this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, (ball1, ball2) => {
            return ball1.getData('isSindara') && ball2.getData('isSindara') && ball1.getData('isAttracting') && ball2.getData('isAttracting');
        }, this);
        if (this.makiraBeams && this.bricks) { this.makiraBeamBrickOverlap = this.physics.add.overlap(this.makiraBeams, this.bricks, this.hitBrickWithMakiraBeam, null, this); }
    }

    createAndAddBall(x, y, vx = 0, vy = 0, data = null) {
        let initialTexture = 'ball_image';
        if (data) {
            if (data.isBikara) { initialTexture = (data.bikaraState === 'yang' ? 'icon_bikara_yang' : 'icon_bikara_yin'); }
            else if (data.isAnchira) { initialTexture = 'anchira_icon'; }
            else if (data.isSindara) { initialTexture = 'icon_sindara'; } // ★ シンダラ初期アイコン
            // 他のアイコンパワーアップもここに追加
        }

        const ball = this.balls.create(x, y, initialTexture)
                         .setOrigin(0.5, 0.5)
                         .setDisplaySize(BALL_RADIUS * 2, BALL_RADIUS * 2)
                         .setCircle(PHYSICS_BALL_RADIUS)
                         .setCollideWorldBounds(true)
                         .setBounce(1);

        if (ball.body) {
             ball.setVelocity(vx, vy);
             ball.body.onWorldBounds = true;
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
            isAttracting: false, // Sindara状態管理フラグ
            isMerging: false,    // Sindara状態管理フラグ
            isBikara: data ? data.isBikara : false,
            bikaraState: data ? data.bikaraState : null, // null初期化。activateBikaraで'yin'に
            bikaraYangCount: 0,
            isIndaraActive: data ? data.isIndaraActive : false,
            indaraHomingCount: data ? data.indaraHomingCount : 0,
            isAnilaActive: data ? data.isAnilaActive : false
        });

        this.updateBallTint(ball); // Tint/Clear処理

        if (data) {
             if (ball.getData('isFast')) this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA);
             else if (ball.getData('isSlow')) this.applySpeedModifier(ball, POWERUP_TYPES.HAILA);
        }
        return ball;
    }

    launchBall() { if (!this.isBallLaunched && this.balls) { const firstBall = this.balls.getFirstAlive(); if (firstBall) { const initialVelocityX = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]); firstBall.setVelocity(initialVelocityX, BALL_INITIAL_VELOCITY_Y); this.isBallLaunched = true; } } }
    createBricks() { /* ... (変更なし) ... */ }
    createBricksFallbackToNormal() { /* ... (変更なし) ... */ }
    handleBrickHit(brick, damage = 1) { /* ... (変更なし) ... */ }
    handleBrickDestruction(brick) { /* ... (変更なし) ... */ }

    hitBrick(brick, ball) {
        if (!brick || !ball || !brick.active || !ball.active || this.isStageClearing) return;
        if (brick.getData('maxHits') === -1) { return; }

        const isBikara = ball.getData('isBikara');
        const bikaraState = ball.getData('bikaraState');

        if (isBikara && bikaraState === 'yang') {
            this.handleBikaraYangDestroy(ball, brick);
            if (!this.isStageClearing && this.getDestroyableBrickCount() === 0) {
               this.time.delayedCall(10, this.stageClear, [], this);
            }
            return;
        }
        // 通常衝突 (Bikara陰、貫通、Sindara特殊状態以外がここにくる)
        const destroyed = this.handleBrickHit(brick, 1);
        if (destroyed && !this.isStageClearing && this.getDestroyableBrickCount() === 0) {
            this.stageClear();
        }
    }

    handleBallBrickOverlap(ball, brick) {
        if (!ball || !brick || !ball.active || !brick.active || this.isStageClearing) return;
        const isBikaraYin = ball.getData('isBikara') && ball.getData('bikaraState') === 'yin';
        const isPenetrating = ball.getData('isPenetrating');
        const isSindaraSpecial = ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'));

        // Bikara(陰) のマーキング
        if (isBikaraYin) {
            if (brick.getData('maxHits') !== -1) { this.markBrickByBikara(brick); }
        }
        // Kubiraなどの単純貫通による破壊
        else if (isPenetrating && !isSindaraSpecial) { // Sindara特殊状態でない貫通
             if (brick.getData('maxHits') !== -1) { // 不壊ブロック以外
                 const destroyed = this.handleBrickHit(brick, Infinity); // 貫通は一撃破壊
                 if (destroyed && !this.isStageClearing && this.getDestroyableBrickCount() === 0) {
                    this.time.delayedCall(10, this.stageClear, [], this);
                 }
             }
        }
         // Sindara特殊状態の処理は特にここでは不要（色などはupdateBallTintで対応）
    }

    handleBikaraYangDestroy(ball, hitBrick) { /* ... (変更なし) ... */ }
    hitBrickWithMakiraBeam(beam, brick) { /* ... (変更なし) ... */ }
    triggerVajraDestroy() { /* ... (変更なし) ... */ }
    activateBaisrava() { /* ... (変更なし) ... */ }
    getDestroyableBrickCount() { /* ... (変更なし) ... */ }

    dropSpecificPowerUp(x, y, type) {
        let textureKey = 'whitePixel';
        let tintColor = POWERUP_COLORS[type] || null;
        let displaySize = POWERUP_SIZE;

        if (type === POWERUP_TYPES.ANCHIRA) { textureKey = 'anchira_icon'; tintColor = null; }
        else if (type === POWERUP_TYPES.BIKARA) { textureKey = 'icon_bikara_yang'; tintColor = null; }
        else if (type === POWERUP_TYPES.SINDARA) { textureKey = 'icon_sindara'; tintColor = null; } // ★ シンダラアイテム

        if (!type || (tintColor === null && textureKey === 'whitePixel' && type !== POWERUP_TYPES.MAKORA)) {
             // console.warn(`Attempted to drop invalid or uncolored powerup type: ${type}`);
             // return;
         }

        let powerUp = null;
        try {
            powerUp = this.powerUps.create(x, y, textureKey);
            if (powerUp) {
                powerUp.setDisplaySize(displaySize, displaySize).setData('type', type);
                if (tintColor !== null) { powerUp.setTint(tintColor); }
                else { powerUp.clearTint(); }
                if (powerUp.body) { powerUp.setVelocity(0, POWERUP_SPEED_Y); powerUp.body.setCollideWorldBounds(false); powerUp.body.setAllowGravity(false); }
                else { console.error(`No physics body for powerup type: ${type}! Destroying.`); powerUp.destroy(); powerUp = null; }
            } else { console.error(`Failed to create powerup object for type: ${type}!`); }
        } catch (error) { console.error(`CRITICAL ERROR in dropSpecificPowerUp (${type}):`, error); if (powerUp && powerUp.active) { powerUp.destroy(); } }
    }

    dropPowerUp(x, y) { let availableTypes = []; if (this.currentMode === GAME_MODE.NORMAL) { availableTypes = this.stageDropPool; } else { availableTypes = ALLSTARS_MODE_POWERUP_POOL; } if (availableTypes.length === 0) return; const type = Phaser.Utils.Array.GetRandom(availableTypes); this.dropSpecificPowerUp(x, y, type); }

    hitPaddle(paddle, ball) {
        if (!paddle || !ball || !ball.active || !ball.body) return;
        let diff = ball.x - paddle.x; const maxDiff = paddle.displayWidth / 2; let influence = diff / maxDiff; influence = Phaser.Math.Clamp(influence, -1, 1); const maxVx = NORMAL_BALL_SPEED * 0.8; let newVx = maxVx * influence; const minVy = NORMAL_BALL_SPEED * 0.5; let currentVy = ball.body.velocity.y; let newVy = -Math.abs(currentVy); if (Math.abs(newVy) < minVy) newVy = -minVy; let speedMultiplier = 1.0; if (ball.getData('isFast')) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if (ball.getData('isSlow')) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA]; const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier; const newVelocity = new Phaser.Math.Vector2(newVx, newVy).normalize().scale(targetSpeed); ball.setVelocity(newVelocity.x, newVelocity.y);

        if (ball.getData('isBikara')) { this.switchBikaraState(ball); }
        if (ball.getData('isIndaraActive')) { this.deactivateIndaraForBall(ball); this.updateBallTint(ball); }
    }

    collectPowerUp(paddle, powerUp) {
        if (!powerUp || !powerUp.active || this.isStageClearing) return;
        const type = powerUp.getData('type');
        if (!type) { console.warn("Collected powerup with no type data!"); powerUp.destroy(); return; }

        powerUp.destroy();

        if (type === POWERUP_TYPES.ANCHIRA) { /* this.sound.play('voice_anchira'); */ }
        else if (type === POWERUP_TYPES.BIKARA) { /* this.sound.play('voice_bikara_yin'); */ }
        else if (type === POWERUP_TYPES.SINDARA) { /* this.sound.play('voice_sindara'); */ } // ★ シンダラ取得ボイス

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

        if (POWERUP_DURATION[type]) { if (this.powerUpTimers[type]) { this.powerUpTimers[type].remove(); } }

        switch (type) {
            case POWERUP_TYPES.KUBIRA: this.activateKubira(targetBalls); break;
            case POWERUP_TYPES.SHATORA: this.activateShatora(targetBalls); break;
            case POWERUP_TYPES.HAILA: this.activateHaira(targetBalls); break;
            case POWERUP_TYPES.ANCHIRA: if (targetBalls.length === 1) this.activateAnchira(targetBalls[0]); break;
            case POWERUP_TYPES.SINDARA: if (targetBalls.length === 1) this.activateSindara(targetBalls[0]); break; // ★ シンダラ有効化
            case POWERUP_TYPES.BIKARA: this.activateBikara(targetBalls); break;
            case POWERUP_TYPES.INDARA: this.activateIndara(targetBalls); break;
            case POWERUP_TYPES.ANILA: this.activateAnila(targetBalls); break;
        }

        // アンチラ、ビカラ、シンダラは個別の関数でデータ設定・テクスチャ変更
        if (type !== POWERUP_TYPES.ANCHIRA && type !== POWERUP_TYPES.BIKARA && type !== POWERUP_TYPES.SINDARA) {
             targetBalls.forEach(ball => { if (ball.active) { ball.getData('activePowers').add(type); ball.setData('lastActivatedPower', type); this.updateBallTint(ball); } });
         }

        const duration = POWERUP_DURATION[type];
        if (duration) { this.powerUpTimers[type] = this.time.delayedCall(duration, () => { this.deactivatePowerByType(type); this.powerUpTimers[type] = null; }, [], this); }
    }

    deactivatePowerByType(type) {
        const targetBalls = this.balls.getMatching('active', true);
        if (targetBalls.length === 0 || type === POWERUP_TYPES.MAKIRA || type === POWERUP_TYPES.VAJRA || type === POWERUP_TYPES.MAKORA) return;

        switch (type) {
            case POWERUP_TYPES.KUBIRA: this.deactivateKubira(targetBalls); break;
            case POWERUP_TYPES.SHATORA: this.deactivateShatora(targetBalls); break;
            case POWERUP_TYPES.HAILA: this.deactivateHaira(targetBalls); break;
            case POWERUP_TYPES.ANCHIRA: this.deactivateAnchira(targetBalls); break;
            case POWERUP_TYPES.BIKARA: this.deactivateBikara(targetBalls); break;
            case POWERUP_TYPES.SINDARA: this.deactivateSindara(targetBalls); break; // ★ シンダラ解除
            case POWERUP_TYPES.INDARA: targetBalls.forEach(b => this.deactivateIndaraForBall(b)); break;
            case POWERUP_TYPES.ANILA: targetBalls.forEach(b => this.deactivateAnilaForBall(b)); break;
        }

        // アイコンを使わないパワーアップの共通解除処理
        if (type !== POWERUP_TYPES.ANCHIRA && type !== POWERUP_TYPES.BIKARA && type !== POWERUP_TYPES.SINDARA) {
             targetBalls.forEach(ball => { if (ball.active) { ball.getData('activePowers').delete(type); this.updateBallTint(ball); } });
         }
    }

     updateBallTint(ball) {
        if (!ball || !ball.active) return;
        // アイコンが表示されている場合はTintしない
        if (ball.texture.key !== 'ball_image') { ball.clearTint(); return; }
        const activePowers = ball.getData('activePowers');
        let targetColor = null;
        if (activePowers && activePowers.size > 0) {
            const lastPower = ball.getData('lastActivatedPower');
            let powerToUse = lastPower;
            if (!lastPower || !activePowers.has(lastPower)) { const activePowersArray = Array.from(activePowers); if (activePowersArray.length > 0) { powerToUse = activePowersArray[activePowersArray.length - 1]; ball.setData('lastActivatedPower', powerToUse); } else { powerToUse = null; } }
            // アイコンを使うパワーアップは除外
            if (powerToUse && powerToUse !== POWERUP_TYPES.ANCHIRA && powerToUse !== POWERUP_TYPES.BIKARA && powerToUse !== POWERUP_TYPES.SINDARA) {
                 targetColor = POWERUP_COLORS[powerToUse] || null;
            }
        }
        if (targetColor !== null) { ball.setTint(targetColor); }
        else { ball.clearTint(); }
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
        sourceBall.setTexture('anchira_icon'); sourceBall.clearTint();
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
                b.setTexture('ball_image'); this.updateBallTint(b);
            }
        });
    }

    // ★★★ シンダラ: 有効化 ★★★
    activateSindara(sourceBall) {
        if (!sourceBall || !sourceBall.active) return;

        // 他のボールをクリア
        if (this.balls.countActive(true) > 1) {
            this.keepFurthestBall(); // 念のため activatePower 前にも呼ぶ
        }
        // 再度 targetBalls を取得し直す (keepFurthestBall で変わる可能性があるため)
        const targetBalls = this.balls.getMatching('active', true);
        if (targetBalls.length !== 1) {
             console.warn("Sindara activation failed: Could not isolate one ball.");
             return; // 1球に絞れていない場合は中止
        }
        const theBall = targetBalls[0]; // 唯一のボールのはず

        theBall.setData({
            isSindara: true,
            activePowers: theBall.getData('activePowers').add(POWERUP_TYPES.SINDARA),
            lastActivatedPower: POWERUP_TYPES.SINDARA
        });
        theBall.setTexture('icon_sindara'); // シンダラアイコンに
        theBall.clearTint();

        const x = theBall.x; const y = theBall.y;
        const ballData = theBall.data.getAll(); // isSindara: true を含むデータを取得
        const vx = Phaser.Math.Between(-150, 150);
        const vy = -Math.abs(Phaser.Math.Between(NORMAL_BALL_SPEED * 0.5, NORMAL_BALL_SPEED * 0.8));
        const partnerBall = this.createAndAddBall(x + Phaser.Math.Between(-5, 5), y + Phaser.Math.Between(-5, 5), vx, vy, ballData); // パートナーもシンダラアイコンになる

        if (partnerBall) {
            theBall.setData({ sindaraPartner: partnerBall, isAttracting: false, isMerging: false });
            partnerBall.setData({ sindaraPartner: theBall, isAttracting: false, isMerging: false });

            if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove();
            this.sindaraAttractionTimer = this.time.delayedCall(SINDARA_ATTRACTION_DELAY, () => {
                this.startSindaraAttraction(theBall, partnerBall);
            }, [], this);
            this.setColliders();
        } else {
            // パートナー生成失敗時はシンダラ状態を解除
            theBall.setData('isSindara', false);
            theBall.getData('activePowers').delete(POWERUP_TYPES.SINDARA);
            theBall.setTexture('ball_image');
            this.updateBallTint(theBall);
        }
    }

    // ★★★ シンダラ: 引き寄せ開始 (アイコンはそのまま、貫通開始) ★★★
    startSindaraAttraction(ball1, ball2) {
        this.sindaraAttractionTimer = null;
        if (!ball1 || !ball2 || !ball1.active || !ball2.active || !ball1.getData('isSindara') || !ball2.getData('isSindara')) {
            const activeSindaraBalls = this.balls.getMatching('isSindara', true);
            if (activeSindaraBalls.length > 0) { this.deactivateSindara(activeSindaraBalls); }
            return;
        }
        ball1.setData({ isAttracting: true, isPenetrating: true });
        ball2.setData({ isAttracting: true, isPenetrating: true });
        // アイコンは icon_sindara のままなので setTexture は不要
        // Tintもしないので updateBallTint も不要
        this.setColliders(); // isPenetrating が変わるので更新
    }

    updateSindaraAttraction(ball) { /* ... (変更なし) ... */ }
    handleBallCollision(ball1, ball2) { /* ... (変更なし) ... */ }

    // ★★★ シンダラ: 合体 (音声準備) ★★★
    mergeSindaraBalls(ballToKeep, ballToRemove) {
        // this.sound.play('voice_sindara_merge'); // ★ 合体ボイス
        const mergeX = (ballToKeep.x + ballToRemove.x) / 2; const mergeY = (ballToKeep.y + ballToRemove.y) / 2;
        ballToKeep.setPosition(mergeX, mergeY);
        ballToRemove.destroy();
        ballToKeep.setData({ isMerging: true, isAttracting: false, isPenetrating: true, sindaraPartner: null });
        // アイコンは icon_sindara のまま
        // Tint も不要
        if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove();
        if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove();
        this.sindaraMergeTimer = this.time.delayedCall(SINDARA_MERGE_DURATION, () => { this.finishSindaraMerge(ballToKeep); }, [], this);
        if (this.sindaraAttractionTimer) { this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; }
        this.setColliders(); // isMerging などが変わるので更新
    }

    // ★★★ シンダラ: 合体完了 (スーパーシンダラアイコンに変更) ★★★
    finishSindaraMerge(mergedBall) {
        this.sindaraMergeTimer = null;
        if (!mergedBall || !mergedBall.active) return;
        mergedBall.setData({ isMerging: false }); // isPenetrating は true のまま
        mergedBall.setTexture('icon_super_sindara'); // ★ スーパーアイコンに変更
        mergedBall.clearTint();

        if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove();
        this.sindaraPenetrationTimer = this.time.delayedCall(SINDARA_POST_MERGE_PENETRATION_DURATION, () => {
            this.deactivateSindaraPenetration(mergedBall);
        }, [], this);
        this.setColliders(); // isMerging が変わるので更新
    }

    // ★★★ シンダラ: 貫通終了 (通常ボール画像に戻す) ★★★
    deactivateSindaraPenetration(ball) {
        this.sindaraPenetrationTimer = null;
        if (!ball || !ball.active) return;
        // 他の貫通効果がなければ貫通解除
        if (!ball.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) {
             if (!ball.getData('isBikara') || ball.getData('bikaraState') !== 'yang') {
                 ball.setData('isPenetrating', false);
             }
        }
        if (ball.getData('isSindara')) {
            ball.setData('isSindara', false);
            ball.getData('activePowers').delete(POWERUP_TYPES.SINDARA);
            ball.setTexture('ball_image'); // ★ 通常ボール画像に戻す
            this.resetBallSpeed(ball);
            this.updateBallTint(ball); // 他のパワーが残っていればTint
        }
        this.setColliders(); // isPenetrating が変わる可能性があるので更新
    }

    // ★★★ シンダラ: 完全解除 (通常ボール画像に戻す) ★★★
    deactivateSindara(balls) {
        if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null;
        if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null;
        if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
        balls.forEach(b => {
            if (b.active && b.getData('isSindara')) {
                b.setData({ isSindara: false, sindaraPartner: null, isAttracting: false, isMerging: false });
                // 他の貫通効果がなければ貫通解除
                if (!b.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) {
                     if (!b.getData('isBikara') || b.getData('bikaraState') !== 'yang') {
                         b.setData('isPenetrating', false);
                     }
                 }
                b.getData('activePowers').delete(POWERUP_TYPES.SINDARA);
                b.setTexture('ball_image'); // ★ 通常ボール画像に戻す
                this.updateBallTint(b); // 他のパワーが残っていればTint
            }
        });
        this.setColliders(); // isPenetrating が変わる可能性があるので更新
    }

    activateBikara(balls) { /* ... (変更なし) ... */ }
    deactivateBikara(balls) { /* ... (変更なし) ... */ }
    switchBikaraState(ball) { /* ... (変更なし) ... */ }
    markBrickByBikara(brick) { /* ... (変更なし) ... */ }
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

    loseLife() {
        if (this.isStageClearing || this.isGameOver || this.lives <= 0) return;
        this.deactivateMakira(); this.deactivateVajra();
        Object.keys(this.powerUpTimers).forEach(key => { if (this.powerUpTimers[key]) { this.powerUpTimers[key].remove(); this.powerUpTimers[key] = null; } });
        if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null;
        if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null;
        if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
        this.lives--; this.events.emit('updateLives', this.lives);
        this.isBallLaunched = false;
        const activeBalls = this.balls.getMatching('active', true);
        if (activeBalls.length > 0) {
            const ballDeactivationFunctions = [ this.deactivateAnchira, this.deactivateBikara, this.deactivateSindara, this.deactivateKubira, this.deactivateShatora, this.deactivateHaira ];
            ballDeactivationFunctions.forEach(func => func.call(this, activeBalls));
            activeBalls.forEach(ball => {
                 if (ball.active) {
                     this.deactivateIndaraForBall(ball); this.deactivateAnilaForBall(ball);
                     ball.setData({ isPenetrating: false, isFast: false, isSlow: false, activePowers: new Set(), lastActivatedPower: null });
                     this.resetBallSpeed(ball); ball.setTexture('ball_image'); ball.clearTint();
                 }
            });
        }
        if (this.lives > 0) { this.time.delayedCall(500, this.resetForNewLife, [], this); }
        else { this.time.delayedCall(500, this.gameOver, [], this); }
    }

    resetForNewLife() {
        if (this.isGameOver || this.isStageClearing) return;
        if (this.balls) { this.balls.clear(true, true); }
        if (this.paddle) { this.paddle.x = this.scale.width / 2; this.paddle.y = this.scale.height - PADDLE_Y_OFFSET; this.updatePaddleSize(); }
        let newBall = null;
        if (this.paddle) { newBall = this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS); }
        else { newBall = this.createAndAddBall(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET - PADDLE_HEIGHT / 2 - BALL_RADIUS); }
        this.isBallLaunched = false;
        this.setColliders();
    }

    gameOver() {
        if (this.isGameOver) return; this.isGameOver = true;
        this.deactivateMakira(); this.deactivateVajra();
        if (this.gameOverText) this.gameOverText.setVisible(true);
        this.physics.pause();
        if (this.balls) { this.balls.getChildren().forEach(ball => { if (ball.active) { ball.setVelocity(0, 0); if (ball.body) ball.body.enable = false; } }); }
        Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(); }); this.powerUpTimers = {};
        if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null;
        if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null;
        if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
        if (this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer = null;
    }

    stageClear() {
         if (this.isStageClearing || this.isGameOver) return;
         this.isStageClearing = true; this.deactivateMakira(); this.deactivateVajra();
         try {
             this.physics.pause();
             Object.keys(this.powerUpTimers).forEach(key => { if (this.powerUpTimers[key]) { this.powerUpTimers[key].remove(); this.powerUpTimers[key] = null; } });
             if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null;
             if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null;
             if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
             const activeBalls = this.balls.getMatching('active', true);
             if (activeBalls.length > 0) {
                 const ballDeactivationFunctions = [ this.deactivateAnchira, this.deactivateBikara, this.deactivateSindara, this.deactivateKubira, this.deactivateShatora, this.deactivateHaira ];
                 ballDeactivationFunctions.forEach(func => func.call(this, activeBalls));
                 activeBalls.forEach(ball => {
                     if(ball.active){
                         this.deactivateIndaraForBall(ball); this.deactivateAnilaForBall(ball);
                         ball.setData({ isPenetrating: false, isFast: false, isSlow: false, activePowers: new Set(), lastActivatedPower: null });
                         ball.setTexture('ball_image'); ball.clearTint();
                     }
                 });
             }
             if (this.balls) { this.balls.getChildren().forEach(ball => { if (ball.active) { ball.setVelocity(0, 0).setVisible(false).setActive(false); if (ball.body) ball.body.enable = false; } }); }
             if (this.bricks) { this.bricks.getChildren().forEach(br => { if (br.getData('isMarkedByBikara')) br.setData('isMarkedByBikara', false); }); }
             if (this.powerUps) { this.powerUps.clear(true, true); }
             this.currentStage++;
             const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12;
             if (this.currentStage > maxStages) { this.gameComplete(); }
             else {
                 this.events.emit('updateStage', this.currentStage);
                 this.time.delayedCall(1000, () => {
                     if (!this.scene || !this.scene.isActive() || this.isGameOver) return;
                     try { this.setupStage(); this.isStageClearing = false; this.resetForNewLife(); this.physics.resume(); }
                     catch (e) { console.error("Error setting up next stage:", e); this.isStageClearing = false; this.gameOver(); }
                 }, [], this);
             }
         } catch (e) { console.error("Error during stage clear process:", e); this.isStageClearing = false; this.gameOver(); }
     }

    gameComplete() { alert(`ゲームクリア！ スコア: ${this.score}`); this.returnToTitle(); }
    returnToTitle() { if (this.physics.world && !this.physics.world.running) this.physics.resume(); if (this.scene.isActive('UIScene')) { this.scene.stop('UIScene'); } this.time.delayedCall(10, () => { if (this.scene && this.scene.isActive()) { this.scene.start('TitleScene'); } }); }
    shutdown() { if (this.scale) this.scale.off('resize', this.handleResize, this); if (this.physics.world) this.physics.world.off('worldbounds', this.handleWorldBounds, this); this.events.removeAllListeners(); if (this.input) this.input.removeAllListeners(); this.isGameOver = false; this.isStageClearing = false; this.deactivateMakira(); this.deactivateVajra(); Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(false); }); this.powerUpTimers = {}; if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(false); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(false); this.sindaraMergeTimer = null; if (this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(false); this.sindaraPenetrationTimer = null; if (this.makiraAttackTimer) this.makiraAttackTimer.remove(false); this.makiraAttackTimer = null; if (this.time) this.time.removeAllEvents(); if (this.balls) this.balls.destroy(true); this.balls = null; if (this.bricks) this.bricks.destroy(true); this.bricks = null; if (this.powerUps) this.powerUps.destroy(true); this.powerUps = null; if (this.paddle) this.paddle.destroy(); this.paddle = null; if (this.familiars) this.familiars.destroy(true); this.familiars = null; if (this.makiraBeams) this.makiraBeams.destroy(true); this.makiraBeams = null; if (this.gameOverText) this.gameOverText.destroy(); this.gameOverText = null; this.ballPaddleCollider = null; this.ballBrickCollider = null; this.ballBrickOverlap = null; this.ballBallCollider = null; this.makiraBeamBrickOverlap = null; }
} // <-- GameScene クラスの終わり

// --- UIScene ---
class UIScene extends Phaser.Scene {
     constructor() { super({ key: 'UIScene', active: false }); this.livesText = null; this.scoreText = null; this.stageText = null; this.vajraGaugeText = null; this.dropPoolIconsGroup = null; this.gameSceneListenerAttached = false; this.gameScene = null; }
    create() {
        console.log("UIScene create started");
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; const textStyle = { fontSize: '24px', fill: '#fff' };
        this.livesText = this.add.text(16, 16, 'ライフ: ', textStyle); this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: ', textStyle).setOrigin(0.5, 0); this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: ', textStyle).setOrigin(1, 0); this.vajraGaugeText = this.add.text(16, this.gameHeight - UI_BOTTOM_OFFSET, '奥義: -/-', { fontSize: '20px', fill: '#fff' }).setOrigin(0, 1).setVisible(false); this.dropPoolIconsGroup = this.add.group(); this.updateDropPoolDisplay([]); this.gameScene = this.scene.get('GameScene'); if (this.gameScene) { this.gameScene.events.on('gameResize', this.onGameResize, this); } try { const gameScene = this.scene.get('GameScene'); if (gameScene && gameScene.scene.settings.status === Phaser.Scenes.RUNNING) { this.registerGameEventListeners(gameScene); } else { this.scene.get('GameScene').events.once('create', this.registerGameEventListeners, this); } } catch (e) { console.error("Error setting up UIScene listeners:", e); } this.events.on('shutdown', () => { this.unregisterGameEventListeners(); if (this.gameScene && this.gameScene.events) { this.gameScene.events.off('gameResize', this.onGameResize, this); } });
         console.log("UIScene create finished");
    }
    onGameResize() { this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; this.livesText?.setPosition(16, 16); this.stageText?.setPosition(this.gameWidth / 2, 16); this.scoreText?.setPosition(this.gameWidth - 16, 16); this.vajraGaugeText?.setPosition(16, this.gameHeight - UI_BOTTOM_OFFSET); this.updateDropPoolPosition(); }
    registerGameEventListeners(gameScene) { if (!gameScene || !gameScene.events || this.gameSceneListenerAttached) return; this.unregisterGameEventListeners(gameScene); gameScene.events.on('updateLives', this.updateLivesDisplay, this); gameScene.events.on('updateScore', this.updateScoreDisplay, this); gameScene.events.on('updateStage', this.updateStageDisplay, this); gameScene.events.on('activateVajraUI', this.activateVajraUIDisplay, this); gameScene.events.on('updateVajraGauge', this.updateVajraGaugeDisplay, this); gameScene.events.on('deactivateVajraUI', this.deactivateVajraUIDisplay, this); gameScene.events.on('updateDropPoolUI', this.updateDropPoolDisplay, this); this.gameSceneListenerAttached = true; try { this.updateLivesDisplay(gameScene.lives); this.updateScoreDisplay(gameScene.score); this.updateStageDisplay(gameScene.currentStage); if (gameScene.isVajraSystemActive) this.activateVajraUIDisplay(gameScene.vajraGauge, VAJRA_GAUGE_MAX); else this.deactivateVajraUIDisplay(); this.updateDropPoolDisplay(gameScene.stageDropPool); } catch (e) { console.error("Error reflecting initial state in UIScene:", e); } }
    unregisterGameEventListeners(gameScene = null) { const gs = gameScene || this.gameScene || (this.scene.manager ? this.scene.manager.getScene('GameScene') : null); if (gs && gs.events) { gs.events.off('updateLives', this.updateLivesDisplay, this); gs.events.off('updateScore', this.updateScoreDisplay, this); gs.events.off('updateStage', this.updateStageDisplay, this); gs.events.off('activateVajraUI', this.activateVajraUIDisplay, this); gs.events.off('updateVajraGauge', this.updateVajraGaugeDisplay, this); gs.events.off('deactivateVajraUI', this.deactivateVajraUIDisplay, this); gs.events.off('create', this.registerGameEventListeners, this); gs.events.off('updateDropPoolUI', this.updateDropPoolDisplay, this); } this.gameSceneListenerAttached = false; }
    updateLivesDisplay(lives) { if (this.livesText) this.livesText.setText(`ライフ: ${lives}`); } updateScoreDisplay(score) { if (this.scoreText) this.scoreText.setText(`スコア: ${score}`); } updateStageDisplay(stage) { if (this.stageText) this.stageText.setText(`ステージ: ${stage}`); }
    activateVajraUIDisplay(initialValue, maxValue) { if (this.vajraGaugeText) { this.vajraGaugeText.setText(`奥義: ${initialValue}/${maxValue}`).setVisible(true); this.updateDropPoolPosition(); } }
    updateVajraGaugeDisplay(currentValue) { if (this.vajraGaugeText && this.vajraGaugeText.visible) { this.vajraGaugeText.setText(`奥義: ${currentValue}/${VAJRA_GAUGE_MAX}`); this.updateDropPoolPosition(); } }
    deactivateVajraUIDisplay() { if (this.vajraGaugeText) { this.vajraGaugeText.setVisible(false); this.updateDropPoolPosition(); } }
    updateDropPoolDisplay(dropPoolTypes) { if (!this.dropPoolIconsGroup) return; this.dropPoolIconsGroup.clear(true, true); if (!dropPoolTypes || dropPoolTypes.length === 0) { this.updateDropPoolPosition(); return; } dropPoolTypes.forEach((type, index) => { const color = POWERUP_COLORS[type] || 0x888888; const icon = this.add.image(0, 0, 'whitePixel').setDisplaySize(DROP_POOL_UI_ICON_SIZE, DROP_POOL_UI_ICON_SIZE).setTint(color).setOrigin(0, 0.5); this.dropPoolIconsGroup.add(icon); }); this.updateDropPoolPosition(); }
    updateDropPoolPosition() { if (!this.dropPoolIconsGroup || !this.vajraGaugeText) return; const startX = this.vajraGaugeText.visible ? this.vajraGaugeText.x + this.vajraGaugeText.width + 15 : 16; const startY = this.gameHeight - UI_BOTTOM_OFFSET; let currentX = startX; this.dropPoolIconsGroup.getChildren().forEach(icon => { icon.x = currentX; icon.y = startY; currentX += DROP_POOL_UI_ICON_SIZE + DROP_POOL_UI_SPACING; }); }
} // <-- UIScene クラスの終わり

// --- Phaserゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-game-container', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
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