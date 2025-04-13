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
    KUBIRA: 'kubira', SHATORA: 'shatora', HAILA: 'haila', ANCHIRA: 'anchira', SINDARA: 'sindara',
    BIKARA: 'bikara', INDARA: 'indara', ANILA: 'anila', BAISRAVA: 'baisrava',
    VAJRA: 'vajra' // ★ ヴァジラ追加
    // マキラ、マコラ は未実装
};
const POWERUP_COLORS = {
    [POWERUP_TYPES.KUBIRA]: 0x800080, [POWERUP_TYPES.SHATORA]: 0xffa500, [POWERUP_TYPES.HAILA]: 0xadd8e6,
    [POWERUP_TYPES.ANCHIRA]: 0xffc0cb, [POWERUP_TYPES.SINDARA]: 0xd2b48c, [POWERUP_TYPES.BIKARA]: 0xffffff,
    [POWERUP_TYPES.INDARA]: 0x4682b4, [POWERUP_TYPES.ANILA]: 0xffefd5, [POWERUP_TYPES.BAISRAVA]: 0xffd700,
    [POWERUP_TYPES.VAJRA]: 0xffff00, // ★ ヴァジラ追加 (仮: 黄色)
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

// ★ ヴァジラ用定数 ★
const VAJRA_GAUGE_MAX = 100;        // ゲージ最大値
const VAJRA_GAUGE_INCREMENT = 10;   // ブロック破壊ごとの増加量
const VAJRA_DESTROY_COUNT = 5;      // ランダム破壊数

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
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; this.cameras.main.setBackgroundColor('#222222');
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.2, '十二神将ブロック崩し', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(this.gameWidth / 2, this.gameHeight * 0.3, '(仮)', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } }; const buttonHoverStyle = { fill: '#ff0' };
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
        this.powerUpTimers = {}; this.sindaraAttractionTimer = null; this.sindaraMergeTimer = null;
        this.isStageClearing = false; this.isGameOver = false;
        this.isVajraSystemActive = false; this.vajraGauge = 0;
    }

    init(data) {
        this.currentMode = data.mode || GAME_MODE.NORMAL; this.lives = (this.currentMode === GAME_MODE.ALL_STARS) ? 1 : 3;
        this.isBallLaunched = false; this.currentStage = 1; this.score = 0;
        Object.values(this.powerUpTimers).forEach(timer => { if (timer) timer.remove(); }); this.powerUpTimers = {};
        if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null;
        if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null;
        this.isStageClearing = false; this.isGameOver = false;
        this.isVajraSystemActive = false; this.vajraGauge = 0;
        console.log(`GameScene Initialized: Mode=${this.currentMode}, Lives=${this.lives}`);
    }

    preload() { }

    create() {
        console.log("GameScene Create: Start"); this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; this.cameras.main.setBackgroundColor('#222222');
        this.time.delayedCall(50, () => { if (this.scene.isActive('UIScene')) { this.events.emit('updateLives', this.lives); this.events.emit('updateScore', this.score); this.events.emit('updateStage', this.currentStage); } else console.warn("UIScene not active."); });
        this.physics.world.setBoundsCollision(true, true, true, false); this.physics.world.on('worldbounds', this.handleWorldBounds, this);
        const paddleWidth = this.gameWidth * PADDLE_WIDTH_RATIO; this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - PADDLE_Y_OFFSET, null).setDisplaySize(paddleWidth, PADDLE_HEIGHT).setTint(0xffffff).setImmovable(true);
        this.balls = this.physics.add.group({ bounceX: 1, bounceY: 1, collideWorldBounds: true }); this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS); this.createBricks();
        this.gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Game Over\nタップで戻る', { fontSize: '48px', fill: '#f00', align: 'center' }).setOrigin(0.5).setVisible(false).setDepth(1);
        this.powerUps = this.physics.add.group(); this.setColliders(); this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);
        this.input.on('pointermove', (pointer) => { if (!this.isGameOver && this.lives > 0 && this.paddle && !this.isStageClearing) { const pw = this.paddle.displayWidth/2; const tx = Phaser.Math.Clamp(pointer.x, pw, this.gameWidth - pw); this.paddle.x = tx; if (!this.isBallLaunched) { this.balls.getChildren().forEach(b => { if(b.active) b.x = tx; }); } } });
        this.input.on('pointerdown', () => { if (this.isGameOver && this.gameOverText?.visible) this.returnToTitle(); else if (this.lives > 0 && !this.isBallLaunched && !this.isStageClearing) this.launchBall(); });
        this.events.on('shutdown', this.shutdown, this); console.log("GameScene Create: End");
    }

    update() {
        if (this.isGameOver || this.isStageClearing || this.lives <= 0) return;
        let activeBallsCount = 0; let sindaraBallsActive = [];
        this.balls.getChildren().forEach(ball => {
            if (ball.active) { activeBallsCount++;
                if (this.isBallLaunched && !this.isStageClearing && ball.y > this.gameHeight + ball.displayHeight) { if (ball.getData('isAnilaActive')) this.triggerAnilaBounce(ball); else { ball.setActive(false).setVisible(false); if (ball.body) ball.body.enable = false; } }
                if (ball.getData('isSindara')) { sindaraBallsActive.push(ball); if (ball.getData('isAttracting')) this.updateSindaraAttraction(ball); }
                if (ball.body && this.isBallLaunched) { const min=NORMAL_BALL_SPEED*0.1, max=NORMAL_BALL_SPEED*5, sp=ball.body.velocity.length(); if (sp < min && sp > 0) ball.body.velocity.normalize().scale(min); else if (sp > max) ball.body.velocity.normalize().scale(max); }
            }
        });
        if (sindaraBallsActive.length === 1 && this.balls.getTotalUsed() > 1) { const rem = sindaraBallsActive[0]; if (rem.getData('isSindara')) { this.deactivateSindara([rem]); this.updateBallTint(rem); } }
        if (activeBallsCount === 0 && this.isBallLaunched && !this.isStageClearing && this.lives > 0) this.loseLife();
        this.powerUps.children.each(pu => { if (pu.active && pu.y > this.gameHeight + POWERUP_SIZE) pu.destroy(); });
        if (this.balls.countActive(true) === 1) { const lb = this.balls.getFirstAlive(); if (lb && lb.getData('isAnchira')) { this.deactivateAnchira([lb]); this.updateBallTint(lb); } }
    }

    setColliders() {
        if (this.ballPaddleCollider) this.ballPaddleCollider.destroy(); if (this.ballBrickCollider) this.ballBrickCollider.destroy();
        if (this.ballBrickOverlap) this.ballBrickOverlap.destroy(); if (this.ballBallCollider) this.ballBallCollider.destroy();
        if (!this.balls || !this.paddle || !this.bricks) { console.error("SetColliders: Missing objects."); return; }
        this.ballPaddleCollider = this.physics.add.collider(this.paddle, this.balls, this.hitPaddle, null, this);
        this.ballBrickCollider = this.physics.add.collider( this.bricks, this.balls, this.hitBrick,
            (brick, ball) => {
                const isBikaraActive = ball.getData('isBikara'); const isPenetrating = ball.getData('isPenetrating'); const isMerging = ball.getData('isSindara') && ball.getData('isMerging');
                if (isBikaraActive || isPenetrating || isMerging) { return false; } return true;
            }, this );
        this.ballBrickOverlap = this.physics.add.overlap(this.balls, this.bricks, this.handleBallBrickOverlap, (ba, b) => ba.getData('isPenetrating') || (ba.getData('isSindara') && (ba.getData('isAttracting') || ba.getData('isMerging'))) || ba.getData('isBikara'), this);
        this.ballBallCollider = this.physics.add.collider(this.balls, this.balls, this.handleBallCollision, (b1, b2) => b1.getData('isSindara') && b2.getData('isSindara') && b1.getData('isAttracting') && b2.getData('isAttracting'), this);
        console.log("Colliders set/reset (Bikara collider condition updated).");
    }

    createAndAddBall(x, y, vx=0, vy=0, data=null) {
        const ball = this.balls.create(x, y, null).setDisplaySize(BALL_RADIUS*2, BALL_RADIUS*2).setTint(DEFAULT_BALL_COLOR).setCircle(BALL_RADIUS).setCollideWorldBounds(true).setBounce(1);
        if (ball.body) { ball.setVelocity(vx, vy); ball.body.onWorldBounds = true; } else { console.error("CreateBall fail!"); ball.destroy(); return null; }
        ball.setData({ activePowers: data?new Set(data.activePowers):new Set(), lastActivatedPower: data?data.lastActivatedPower:null, isPenetrating: data?data.isPenetrating:false, isFast: data?data.isFast:false, isSlow: data?data.isSlow:false, isAnchira: data?data.isAnchira:false, isSindara: data?data.isSindara:false, sindaraPartner: null, isAttracting: false, isMerging: false, isBikara: data?data.isBikara:false, bikaraState: data?data.bikaraState:null, bikaraYangCount: 0, isIndaraActive: data?data.isIndaraActive:false, indaraHomingCount: data?data.indaraHomingCount:0, isAnilaActive: data?data.isAnilaActive:false });
        if (data) { this.updateBallTint(ball); if (ball.getData('isFast')) this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); else if (ball.getData('isSlow')) this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); } return ball;
    }

    launchBall() { if (!this.isBallLaunched && this.balls) { const fb = this.balls.getFirstAlive(); if (fb) { const vx = Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0], BALL_INITIAL_VELOCITY_X_RANGE[1]); fb.setVelocity(vx, BALL_INITIAL_VELOCITY_Y); this.isBallLaunched = true; console.log("Ball launched!"); } } }

    createBricks() {
        if (this.bricks) { this.bricks.clear(true, true); this.bricks.destroy(); } this.bricks = this.physics.add.staticGroup();
        const bw = this.gameWidth * BRICK_WIDTH_RATIO; const tw = BRICK_COLS*bw + (BRICK_COLS-1)*BRICK_SPACING; const ox = (this.gameWidth - tw) / 2;
        const rows = this.currentMode === GAME_MODE.ALL_STARS ? BRICK_ROWS+2 : BRICK_ROWS;
        for (let i=0; i<rows; i++) { for (let j=0; j<BRICK_COLS; j++) { const bx = ox + j*(bw+BRICK_SPACING) + bw/2; const by = BRICK_OFFSET_TOP + i*(BRICK_HEIGHT+BRICK_SPACING) + BRICK_HEIGHT/2; const rc = Phaser.Utils.Array.GetRandom(BRICK_COLORS); const br = this.bricks.create(bx, by, null).setDisplaySize(bw, BRICK_HEIGHT).setTint(rc); br.setData({ hits: 1, originalTint: rc, isMarkedByBikara: false }); br.refreshBody(); } }
        console.log(`Bricks created: ${this.bricks.getLength()}`);
    }

    hitPaddle(paddle, ball) {
        if (!paddle || !ball || !ball.active || !ball.body) return; let diff = ball.x - paddle.x; const maxDiff = paddle.displayWidth / 2; let influence = diff / maxDiff; influence = Phaser.Math.Clamp(influence, -1, 1); const maxVelX = NORMAL_BALL_SPEED * 0.8; let newVelX = maxVelX * influence; const minVelY = NORMAL_BALL_SPEED * 0.5; let currentVelY = ball.body.velocity.y; let newVelY = -Math.abs(currentVelY); if (Math.abs(newVelY) < minVelY) newVelY = -minVelY; let speedMultiplier = 1.0; if (ball.getData('isFast')) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if (ball.getData('isSlow')) speedMultiplier = BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA]; const targetSpeed = NORMAL_BALL_SPEED * speedMultiplier; const newVelocity = new Phaser.Math.Vector2(newVelX, newVelY).normalize().scale(targetSpeed); ball.setVelocity(newVelocity.x, newVelocity.y);
        if (ball.getData('isBikara')) this.switchBikaraState(ball); if (ball.getData('isIndaraActive')) { console.log("Indara deactivated by paddle."); this.deactivateIndaraForBall(ball); this.updateBallTint(ball); }
    }

    hitBrick(brick, ball) {
         if (!brick || !ball || !brick.active || !ball.active || this.isStageClearing) return; brick.disableBody(true, true);
         this.score += 10; this.events.emit('updateScore', this.score);
         this.increaseVajraGauge(); // ★ ヴァジラゲージ増加
         if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) this.dropPowerUp(brick.x, brick.y);
         if (!this.isStageClearing && this.bricks.countActive(true) === 0) { console.log("Last brick hit!"); this.stageClear(); }
    }

    handleBallBrickOverlap(ball, brick) {
        if (!ball || !brick || !ball.active || !ball.active || this.isStageClearing) return;
        const isKubira = ball.getData('isPenetrating'); const isSindaraAttracting = ball.getData('isSindara') && ball.getData('isAttracting');
        const isSindaraMerging = ball.getData('isSindara') && ball.getData('isMerging'); const isBikara = ball.getData('isBikara');
        const bikaraState = ball.getData('bikaraState');

        if (isBikara) {
            console.log(`>>> handleBallBrickOverlap with Bikara. State: ${bikaraState}`);
            if (bikaraState === 'yin') { console.log(">>> Bikara Yin: Marking brick."); this.markBrickByBikara(brick); return; }
            else if (bikaraState === 'yang') { console.log(">>> Bikara Yang: Calling handleBikaraYangDestroy."); this.handleBikaraYangDestroy(ball, brick); return; } // ゲージ増加は内部で
            else { console.warn(`>>> Bikara unexpected state: ${bikaraState}`); return; }
        }

        if (isKubira || isSindaraAttracting || isSindaraMerging) {
            brick.disableBody(true, true); this.score += 10; this.events.emit('updateScore', this.score);
            this.increaseVajraGauge(); // ★ ヴァジラゲージ増加
            if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) this.dropPowerUp(brick.x, brick.y);
            if (!this.isStageClearing && this.bricks.countActive(true) === 0) { console.log("Last brick penetrated!"); this.stageClear(); }
            return;
        }
    }

    handleBikaraYangDestroy(ball, hitBrick) {
        console.log(">>> handleBikaraYangDestroy ENTERED");
        if (!ball || !ball.active || !ball.getData('isBikara') || ball.getData('bikaraState') !== 'yang') { console.warn(">>> handleBikaraYangDestroy aborted"); return; }
        console.log(">>> handleBikaraYangDestroy processing..."); let destroyedCount = 0; const markedBricksToDestroy = [];
        if (hitBrick.active) { console.log(">>> Adding hitBrick:", hitBrick.x, hitBrick.y); markedBricksToDestroy.push(hitBrick); hitBrick.setData('isMarkedByBikara', false); }
        console.log(">>> Searching marked bricks..."); this.bricks.getChildren().forEach(br => { if (br.active && br.getData('isMarkedByBikara') && !markedBricksToDestroy.includes(br)) { console.log(">>> Adding marked brick:", br.x, br.y); markedBricksToDestroy.push(br); br.setData('isMarkedByBikara', false); } });
        console.log(`>>> Total to destroy: ${markedBricksToDestroy.length}`);
        markedBricksToDestroy.forEach(br => { console.log(">>> Destroying:", br.x, br.y); br.disableBody(true, true); this.score += 10; destroyedCount++;
            this.increaseVajraGauge(); // ★ Bikara破壊でもゲージ増加
            if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) this.dropPowerUp(br.x, br.y);
        });
        if (destroyedCount > 0) { this.events.emit('updateScore', this.score); console.log(`>>> Bikara destroyed ${destroyedCount}.`); }
        let cyc = ball.getData('bikaraYangCount') || 0; cyc++; ball.setData('bikaraYangCount', cyc); console.log(`>>> Bikara Yang count: ${cyc}`);
        if (!this.isStageClearing && this.bricks.countActive(true) === 0) { console.log(">>> Bikara cleared stage!"); this.stageClear(); }
        else if (cyc >= BIKARA_YANG_COUNT_MAX) { console.log(">>> Bikara max count."); this.deactivateBikara([ball]); this.updateBallTint(ball); }
        console.log(">>> handleBikaraYangDestroy END");
    }

    dropPowerUp(x, y) {
        const availableTypes = [POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.BAISRAVA, POWERUP_TYPES.VAJRA];
        // const availableTypes = [ POWERUP_TYPES.VAJRA ]; // Test only Vajra
        const type = Phaser.Utils.Array.GetRandom(availableTypes); const color = POWERUP_COLORS[type] || 0xffffff;
        const powerUp = this.powerUps.create(x, y, null).setDisplaySize(POWERUP_SIZE, POWERUP_SIZE).setTint(color).setData('type', type);
        if (powerUp.body) { powerUp.setVelocity(0, POWERUP_SPEED_Y); powerUp.body.setCollideWorldBounds(false); } else { console.error("Failed powerup body!"); powerUp.destroy(); }
    }

    collectPowerUp(paddle, powerUp) {
         if (!powerUp.active || this.isStageClearing) return; const type = powerUp.getData('type'); powerUp.destroy();
        if (type === POWERUP_TYPES.BAISRAVA) { console.log(">>> Collected BAISRAVA!"); this.activateBaisrava(); return; }
        if (type === POWERUP_TYPES.VAJRA) { console.log(">>> Collected VAJRA!"); this.activateVajra(); return; } // Vajra取得時はactivatePowerを呼ばない
         if (type === POWERUP_TYPES.ANCHIRA || type === POWERUP_TYPES.SINDARA) { if (this.balls.countActive(true) > 1) { console.log("Keeping furthest ball."); this.keepFurthestBall(); } }
        this.activatePower(type); // Vajra以外は通常の能力付与へ
    }

    keepFurthestBall() {
         const activeBalls = this.balls.getMatching('active', true); if (activeBalls.length <= 1) return; let furthestBall = null; let maxDistSq = -1; const pp = new Phaser.Math.Vector2(this.paddle.x, this.paddle.y);
         activeBalls.forEach(b => { const d = Phaser.Math.Distance.Squared(pp.x, pp.y, b.x, b.y); if (d > maxDistSq) { maxDistSq = d; furthestBall = b; } });
         activeBalls.forEach(b => { if (b !== furthestBall) { console.log("Removing closer ball."); b.destroy(); } }); console.log("Kept furthest ball.");
    }

    activatePower(type) {
        console.log(`Activating Power: ${type}`); const targetBalls = this.balls.getMatching('active', true); if (targetBalls.length === 0) { console.warn("No active balls."); return; }
        // Vajra は collectPowerUp で処理されるので、ここには来ない想定
        if (POWERUP_DURATION[type]) { if (this.powerUpTimers[type]) this.powerUpTimers[type].remove(); }
        switch (type) {
            case POWERUP_TYPES.KUBIRA: this.activateKubira(targetBalls); break; case POWERUP_TYPES.SHATORA: this.activateShatora(targetBalls); break;
            case POWERUP_TYPES.HAILA: this.activateHaira(targetBalls); break; case POWERUP_TYPES.ANCHIRA: this.activateAnchira(targetBalls[0]); break;
            case POWERUP_TYPES.SINDARA: this.activateSindara(targetBalls[0]); break; case POWERUP_TYPES.BIKARA: this.activateBikara(targetBalls); break;
            case POWERUP_TYPES.INDARA: this.activateIndara(targetBalls); break; case POWERUP_TYPES.ANILA: this.activateAnila(targetBalls); break;
            default: console.warn(`Unknown power type in activatePower: ${type}`); return;
        }
         targetBalls.forEach(b => { if(b.active) { b.getData('activePowers').add(type); b.setData('lastActivatedPower', type); this.updateBallTint(b); } });
        const duration = POWERUP_DURATION[type]; if (duration) { this.powerUpTimers[type] = this.time.delayedCall(duration, () => { console.log(`Expired: ${type}`); this.deactivatePowerByType(type); this.powerUpTimers[type] = null; }, [], this); console.log(`Timer started for ${type}.`); }
    }

    deactivatePowerByType(type) {
        console.log(`Deactivating Power: ${type}`); const targetBalls = this.balls.getMatching('active', true); if (targetBalls.length === 0) return;
        switch (type) {
            case POWERUP_TYPES.KUBIRA: this.deactivateKubira(targetBalls); break; case POWERUP_TYPES.SHATORA: this.deactivateShatora(targetBalls); break;
            case POWERUP_TYPES.HAILA: this.deactivateHaira(targetBalls); break; default: console.warn(`Cannot deactivate: ${type}`); return;
        }
         targetBalls.forEach(b => { if(b.active) { b.getData('activePowers').delete(type); this.updateBallTint(b); } });
    }

    updateBallTint(ball) {
        if (!ball || !ball.active) return; const ap = ball.getData('activePowers'); let t = DEFAULT_BALL_COLOR;
        if (ap && ap.size > 0) { const lp = ball.getData('lastActivatedPower'); if (lp && ap.has(lp)) { if (lp === POWERUP_TYPES.BIKARA) t = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin; else if (lp === POWERUP_TYPES.SINDARA) { if (ball.getData('isMerging')) t = SINDARA_MERGE_COLOR; else if (ball.getData('isAttracting')) t = SINDARA_ATTRACT_COLOR; else t = POWERUP_COLORS[lp]; } else if (POWERUP_COLORS[lp]) t = POWERUP_COLORS[lp]; } else { const rp = Array.from(ap); if (rp.length > 0) { const nlp = rp[rp.length - 1]; if (nlp === POWERUP_TYPES.BIKARA) t = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin; else if (nlp === POWERUP_TYPES.SINDARA) { if (ball.getData('isMerging')) t = SINDARA_MERGE_COLOR; else if (ball.getData('isAttracting')) t = SINDARA_ATTRACT_COLOR; else t = POWERUP_COLORS[nlp]; } else t = POWERUP_COLORS[nlp] || DEFAULT_BALL_COLOR; ball.setData('lastActivatedPower', nlp); } } } ball.setTint(t);
    }

    // --- 個別能力 (省略なし) ---
    activateKubira(balls) { balls.forEach(b => b.setData('isPenetrating', true)); console.log("Kubira activated."); }
    deactivateKubira(balls) { balls.forEach(b => { if (!b.getData('isSindara') || (!b.getData('isAttracting') && !b.getData('isMerging'))) b.setData('isPenetrating', false); }); console.log("Kubira deactivated."); }
    applySpeedModifier(ball, type) { if (!ball || !ball.active || !ball.body) return; const m = BALL_SPEED_MODIFIERS[type]; if (!m) return; const cv = ball.body.velocity; const d = cv.length() > 0 ? cv.clone().normalize() : new Phaser.Math.Vector2(0, -1); const ns = NORMAL_BALL_SPEED * m; ball.setVelocity(d.x * ns, d.y * ns); }
    resetBallSpeed(ball) { if (!ball || !ball.active || !ball.body) return; if (ball.getData('isFast')) this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); else if (ball.getData('isSlow')) this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); else { const cv = ball.body.velocity; const d = cv.length() > 0 ? cv.clone().normalize() : new Phaser.Math.Vector2(0, -1); ball.setVelocity(d.x * NORMAL_BALL_SPEED, d.y * NORMAL_BALL_SPEED); } }
    activateShatora(balls) { balls.forEach(b => { b.setData({isFast: true, isSlow: false}); this.applySpeedModifier(b, POWERUP_TYPES.SHATORA); }); console.log("Shatora activated."); }
    deactivateShatora(balls) { balls.forEach(b => { if (b.getData('isFast')) { b.setData('isFast', false); this.resetBallSpeed(b); } }); console.log("Shatora deactivated."); }
    activateHaira(balls) { balls.forEach(b => { b.setData({isSlow: true, isFast: false}); this.applySpeedModifier(b, POWERUP_TYPES.HAILA); }); console.log("Haira activated."); }
    deactivateHaira(balls) { balls.forEach(b => { if (b.getData('isSlow')) { b.setData('isSlow', false); this.resetBallSpeed(b); } }); console.log("Haira deactivated."); }
    activateAnchira(sb) { console.log("Activating Anchira"); if (!sb || !sb.active) return; sb.setData('isAnchira', true); const x = sb.x, y = sb.y, n=3; for (let i=0; i<n; i++) { const ox=Phaser.Math.Between(-5,5), oy=Phaser.Math.Between(-5,5), vx=Phaser.Math.Between(-150,150), vy=-Math.abs(Phaser.Math.Between(100,NORMAL_BALL_SPEED*0.8)); const nb = this.createAndAddBall(x+ox, y+oy, vx, vy, sb.data.getAll()); if (!nb) console.error("Anchira split fail."); } console.log(`Anchira spawned ${n}.`); }
    deactivateAnchira(balls) { console.log("Deactivating Anchira"); balls.forEach(b => { if (b.getData('isAnchira')) { b.setData('isAnchira', false); b.getData('activePowers').delete(POWERUP_TYPES.ANCHIRA); } }); }
    activateSindara(sb) { console.log("Activating Sindara"); if (!sb || !sb.active) return; const x = sb.x, y = sb.y; const sBall = this.createAndAddBall(x+Phaser.Math.Between(-5,5), y+Phaser.Math.Between(-5,5), Phaser.Math.Between(-150,150), -Math.abs(Phaser.Math.Between(100, NORMAL_BALL_SPEED*0.8)), sb.data.getAll()); if (sBall) { sb.setData({isSindara: true, sindaraPartner: sBall, isAttracting: false, isMerging: false}); sBall.setData({isSindara: true, sindaraPartner: sb, isAttracting: false, isMerging: false}); if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = this.time.delayedCall(SINDARA_ATTRACTION_DELAY, () => { this.startSindaraAttraction(sb, sBall); }, [], this); console.log("Sindara activated."); } else { console.error("Sindara split fail."); sb.getData('activePowers').delete(POWERUP_TYPES.SINDARA); } }
    startSindaraAttraction(b1, b2) { console.log("Sindara attraction start"); this.sindaraAttractionTimer = null; if (!b1 || !b2 || !b1.active || !b2.active || !b1.getData('isSindara') || !b2.getData('isSindara')) { console.warn("Cannot start attraction."); const ab = this.balls.getMatching('isSindara', true); if(ab.length > 0) { this.deactivateSindara(ab); ab.forEach(b => this.updateBallTint(b)); } return; } b1.setData({isAttracting: true, isPenetrating: true}); b2.setData({isAttracting: true, isPenetrating: true}); this.updateBallTint(b1); this.updateBallTint(b2); console.log("Sindara attracting."); }
    updateSindaraAttraction(ball) { const p = ball.getData('sindaraPartner'); if (p && p.active && ball.active && ball.getData('isAttracting') && p.getData('isAttracting') && !ball.getData('isMerging') && !p.getData('isMerging')) this.physics.moveToObject(ball, p, SINDARA_ATTRACTION_FORCE); }
    handleBallCollision(b1, b2) { if (b1.active && b2.active && b1.getData('sindaraPartner') === b2) { console.log("Sindara collided!"); this.mergeSindaraBalls(b1, b2); } }
    mergeSindaraBalls(b1, b2) { console.log("Merging Sindara"); const bk = b1, br = b2; const mx = (bk.x+br.x)/2, my = (bk.y+br.y)/2; bk.setPosition(mx, my); br.destroy(); bk.setData({ isMerging: true, isAttracting: false, isPenetrating: true, sindaraPartner: null }); this.updateBallTint(bk); if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = this.time.delayedCall(SINDARA_MERGE_DURATION, () => { this.finishSindaraMerge(bk); }, [], this); if (this.sindaraAttractionTimer) { this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; } console.log("Sindara merge initiated."); }
    finishSindaraMerge(mb) { console.log("Finishing merge"); this.sindaraMergeTimer = null; if (!mb || !mb.active) return; mb.setData({ isMerging: false, isPenetrating: false, isSindara: false }); mb.getData('activePowers').delete(POWERUP_TYPES.SINDARA); if (mb.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) mb.setData('isPenetrating', true); this.resetBallSpeed(mb); this.updateBallTint(mb); console.log("Sindara merge finished."); }
    deactivateSindara(balls) { console.log("Deactivating Sindara."); if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; balls.forEach(b => { if (b.active && b.getData('isSindara')) { b.setData({ isSindara: false, sindaraPartner: null, isAttracting: false, isMerging: false }); if (!b.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) b.setData('isPenetrating', false); b.getData('activePowers').delete(POWERUP_TYPES.SINDARA); } }); }
    activateBikara(balls) { console.log("Activating Bikara"); balls.forEach(b => b.setData({ isBikara: true, bikaraState: 'yin', bikaraYangCount: 0 })); console.log("Bikara activated."); }
    deactivateBikara(balls) { console.log("Deactivating Bikara"); balls.forEach(b => { if (b.getData('isBikara')) { b.setData({ isBikara: false, bikaraState: null, bikaraYangCount: 0 }); b.getData('activePowers').delete(POWERUP_TYPES.BIKARA); } }); this.bricks.getChildren().forEach(br => { if (br.getData('isMarkedByBikara')) { br.setData('isMarkedByBikara', false); br.setTint(br.getData('originalTint') || 0xffffff); } }); console.log("Bikara deactivated."); }
    switchBikaraState(ball) { if (!ball || !ball.active || !ball.getData('isBikara')) return; const cs = ball.getData('bikaraState'); const ns = (cs === 'yin') ? 'yang' : 'yin'; ball.setData('bikaraState', ns); this.updateBallTint(ball); console.log(`Bikara state: ${ns}`); }
    markBrickByBikara(brick) { if (!brick || !brick.active || brick.getData('isMarkedByBikara')) return; brick.setData('isMarkedByBikara', true); brick.setTint(BRICK_MARKED_COLOR); }
    activateIndara(balls) { console.log("Activating Indara"); balls.forEach(b => b.setData({ isIndaraActive: true, indaraHomingCount: INDARA_MAX_HOMING_COUNT })); console.log(`Indara activated.`); }
    deactivateIndaraForBall(ball) { if (!ball || !ball.active || !ball.getData('isIndaraActive')) return; ball.setData({ isIndaraActive: false, indaraHomingCount: 0 }); ball.getData('activePowers').delete(POWERUP_TYPES.INDARA); console.log("Deactivated Indara."); }
    handleWorldBounds(body, up, down, left, right) { const ball = body.gameObject; if (!ball || !(ball instanceof Phaser.Physics.Arcade.Image) || !this.balls.contains(ball) || !ball.active) return; if (ball.getData('isIndaraActive') && ball.getData('indaraHomingCount') > 0 && (up || left || right)) { const chc = ball.getData('indaraHomingCount'); console.log(`Indara wall hit. Count: ${chc}`); const ab = this.bricks.getMatching('active', true); if (ab.length > 0) { let cb = null; let md = Infinity; const bc = ball.body.center; ab.forEach(br => { const d = Phaser.Math.Distance.Squared(bc.x, bc.y, br.body.center.x, br.body.center.y); if (d < md) { md = d; cb = br; } }); if (cb) { console.log("Indara homing."); const cs = ball.body.velocity.length(); const a = Phaser.Math.Angle.BetweenPoints(bc, cb.body.center); this.physics.velocityFromAngle(a, cs, ball.body.velocity); const nhc = chc - 1; ball.setData('indaraHomingCount', nhc); console.log(`Indara remaining: ${nhc}`); if (nhc <= 0) { console.log("Indara deactivated."); this.deactivateIndaraForBall(ball); this.updateBallTint(ball); } } } else { console.log("Indara no bricks."); } } }
    activateAnila(balls) { console.log("Activating Anila"); balls.forEach(b => { if (!b.getData('isAnilaActive')) { b.setData('isAnilaActive', true); console.log("Anila activated."); } }); }
    deactivateAnilaForBall(ball) { if (!ball || !ball.active || !ball.getData('isAnilaActive')) return; ball.setData('isAnilaActive', false); ball.getData('activePowers').delete(POWERUP_TYPES.ANILA); console.log("Deactivated Anila."); }
    triggerAnilaBounce(ball) { if (!ball || !ball.active || !ball.getData('isAnilaActive')) return; console.log("Anila bounce!"); const cvy = ball.body.velocity.y; const bvy = -Math.abs(cvy > -10 ? BALL_INITIAL_VELOCITY_Y * 0.7 : cvy); ball.setVelocityY(bvy); ball.y = this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT; this.deactivateAnilaForBall(ball); this.updateBallTint(ball); }
    activateBaisrava() { console.log(">>> activateBaisrava START"); if (this.isStageClearing || this.isGameOver) { console.log(">>> activateBaisrava BLOCKED"); return; } const ab = this.bricks.getMatching('active', true); let dc = 0; console.log(">>> Active bricks:", ab.length); ab.forEach(br => { br.disableBody(true, true); this.score += 10; dc++; }); if (dc > 0) { console.log(`>>> Baisrava destroyed ${dc}. Score: ${this.score}`); this.events.emit('updateScore', this.score); } else { console.log(">>> Baisrava: No bricks."); } console.log(">>> activateBaisrava END, calling stageClear..."); this.stageClear(); }

    // ★★★ ヴァジラ関連の関数 ★★★
    activateVajra() {
        if (!this.isVajraSystemActive) {
            this.isVajraSystemActive = true; this.vajraGauge = 0; console.log(">>> Vajra System Activated!");
            this.events.emit('activateVajraUI', this.vajraGauge, VAJRA_GAUGE_MAX);
        } else { console.log(">>> Vajra System already active."); }
    }
    increaseVajraGauge() {
        if (this.isVajraSystemActive && !this.isStageClearing && !this.isGameOver) {
            this.vajraGauge += VAJRA_GAUGE_INCREMENT; this.vajraGauge = Math.min(this.vajraGauge, VAJRA_GAUGE_MAX);
            console.log(`>>> Vajra Gauge: ${this.vajraGauge} / ${VAJRA_GAUGE_MAX}`); this.events.emit('updateVajraGauge', this.vajraGauge);
            if (this.vajraGauge >= VAJRA_GAUGE_MAX) {
                console.log(">>> Vajra Gauge MAX!"); this.triggerVajraDestroy(); this.vajraGauge = 0; this.events.emit('updateVajraGauge', this.vajraGauge);
            }
        }
    }
    triggerVajraDestroy() {
        if (this.isStageClearing || this.isGameOver) return; const activeBricks = this.bricks.getMatching('active', true);
        if (activeBricks.length === 0) { console.log(">>> Vajra Destroy: No bricks."); return; }
        const countToDestroy = Math.min(activeBricks.length, VAJRA_DESTROY_COUNT); console.log(`>>> Vajra Destroying ${countToDestroy} bricks.`);
        const shuffledBricks = Phaser.Utils.Array.Shuffle(activeBricks); let destroyedCount = 0;
        for (let i = 0; i < countToDestroy; i++) {
            const brick = shuffledBricks[i]; if (brick && brick.active) { console.log(">>> Vajra destroying:", brick.x, brick.y); brick.disableBody(true, true); this.score += 10; destroyedCount++; this.increaseVajraGauge(); /* ドロップは無し */ }
        }
        if (destroyedCount > 0) { console.log(`>>> Vajra destroyed ${destroyedCount}.`); this.events.emit('updateScore', this.score); }
        if (!this.isStageClearing && this.bricks.countActive(true) === 0) { console.log(">>> Vajra cleared stage!"); this.stageClear(); }
    }

    // --- ゲームフロー ---
    loseLife() { if (this.isStageClearing || this.isGameOver || this.lives <= 0) return; console.log("Losing life."); this.lives--; this.events.emit('updateLives', this.lives); this.isBallLaunched = false; Object.keys(this.powerUpTimers).forEach(t => { if(this.powerUpTimers[t]) { this.powerUpTimers[t].remove(); this.powerUpTimers[t] = null; this.deactivatePowerByType(t); } }); if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; const as = this.balls.getMatching('isSindara', true); if(as.length > 0) this.deactivateSindara(as); if (this.lives > 0) this.time.delayedCall(500, this.resetForNewLife, [], this); else this.time.delayedCall(500, this.gameOver, [], this); }
    resetForNewLife() { if (this.isGameOver || this.isStageClearing) { console.log(`>>> resetForNewLife aborted`); return; } console.log(">>> resetForNewLife START"); if (this.balls) { console.log(">>> Clearing balls..."); this.balls.clear(true, true); } if (this.paddle) { console.log(">>> Resetting paddle..."); this.paddle.x = this.gameWidth / 2; this.paddle.y = this.gameHeight - PADDLE_Y_OFFSET; } let nb = null; if (this.paddle) { console.log(">>> Creating ball..."); nb = this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT/2 - BALL_RADIUS); } else { console.error(">>> Paddle not found!"); nb = this.createAndAddBall(this.gameWidth/2, this.gameHeight-PADDLE_Y_OFFSET-PADDLE_HEIGHT/2-BALL_RADIUS); } if (!nb || !nb.active) console.error(">>> Ball creation failed!"); else console.log(">>> Ball created. Active:", nb.active); this.isBallLaunched = false; console.log(">>> Calling setColliders..."); this.setColliders(); console.log(">>> resetForNewLife END"); }
    gameOver() { if (this.isGameOver) return; this.isGameOver = true; console.log("Game Over!"); if(this.gameOverText) this.gameOverText.setVisible(true); this.physics.pause(); if (this.balls) { this.balls.getChildren().forEach(b => { if(b.active) { b.setVelocity(0, 0); if(b.body) b.body.enable = false; } }); } Object.values(this.powerUpTimers).forEach(t => { if (t) t.remove(); }); this.powerUpTimers = {}; if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; }
    stageClear() { if (this.isStageClearing || this.isGameOver) { console.log(`>>> stageClear skipped.`); return; } this.isStageClearing = true; console.log(`>>> Stage ${this.currentStage} Clear! Setting isStageClearing=true.`); try { this.physics.pause(); console.log(">>> Physics paused."); Object.keys(this.powerUpTimers).forEach(t => { if(this.powerUpTimers[t]) { this.powerUpTimers[t].remove(); this.powerUpTimers[t] = null; this.deactivatePowerByType(t); } }); if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer = null; const as=this.balls.getMatching('isSindara', true); if(as.length>0) this.deactivateSindara(as); const abk=this.balls.getMatching('isBikara', true); if(abk.length>0) this.deactivateBikara(abk); const ai=this.balls.getMatching('isIndaraActive', true); ai.forEach(b=>this.deactivateIndaraForBall(b)); const an=this.balls.getMatching('isAnilaActive', true); an.forEach(b=>this.deactivateAnilaForBall(b)); console.log(">>> Powers deactivated."); if(this.balls) { this.balls.getChildren().forEach(b => { if(b.active) { b.setVelocity(0,0).setVisible(false).setActive(false); if(b.body) b.body.enable = false; } }); console.log(">>> Balls cleared."); } if(this.bricks) { this.bricks.getChildren().forEach(br => { if (br.getData('isMarkedByBikara')) br.setData('isMarkedByBikara', false); }); console.log(">>> Marks cleared."); } if(this.powerUps) { this.powerUps.clear(true, true); console.log(">>> Powerups cleared."); } console.log(`>>> Stage clear message (Stage ${this.currentStage})`); this.currentStage++; console.log(`>>> Stage incremented to ${this.currentStage}.`); const maxStages = this.currentMode === GAME_MODE.ALL_STARS ? 10 : 12; console.log(`>>> Check max stages: ${this.currentStage} > ${maxStages}`); if (this.currentStage > maxStages) { console.log(">>> Calling gameComplete..."); this.gameComplete(); } else { console.log(">>> Setting up next stage via delayedCall..."); this.events.emit('updateStage', this.currentStage); this.time.delayedCall(500, () => { console.log(">>> delayedCall START."); if (!this.scene || !this.scene.isActive() || this.isGameOver) { console.warn(`>>> delayedCall aborted.`); return; } try { console.log(">>> delayedCall: createBricks..."); this.createBricks(); console.log(">>> delayedCall: Bricks created."); this.isStageClearing = false; console.log(`>>> delayedCall: isStageClearing set to ${this.isStageClearing} BEFORE resetForNewLife.`); console.log(">>> delayedCall: resetForNewLife..."); this.resetForNewLife(); console.log(">>> delayedCall: resetForNewLife finished."); console.log(">>> delayedCall: physics.resume..."); this.physics.resume(); console.log(">>> delayedCall: Physics resumed."); } catch (error) { console.error("!!!!!!!!!! ERROR inside delayedCall !!!!!!!!!!", error); this.isStageClearing = false; console.error(">>> Set isStageClearing=false after error."); } console.log(">>> delayedCall END."); }, [], this); } } catch (error) { console.error("!!!!!!!!!! ERROR during stageClear !!!!!!!!!!", error); this.isStageClearing = false; console.error(">>> Set isStageClearing=false after error."); } console.log(">>> stageClear function end."); }
    gameComplete() { console.log("Game Complete!"); alert(`ゲームクリア！\nスコア: ${this.score}`); this.returnToTitle(); }
    returnToTitle() { console.log("Returning to TitleScene..."); if (this.physics.world && !this.physics.world.running) this.physics.resume(); if (this.scene.isActive('UIScene')) { this.scene.stop('UIScene'); console.log("UIScene stopped."); } this.time.delayedCall(10, () => { if (this.scene && this.scene.isActive()) { console.log("Starting TitleScene..."); this.scene.start('TitleScene'); } else console.warn("GameScene inactive."); }); }
    shutdown() { console.log("GameScene shutdown."); this.isGameOver = false; this.isStageClearing = false; Object.values(this.powerUpTimers).forEach(t => { if (t) t.remove(false); }); this.powerUpTimers = {}; if (this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(false); this.sindaraAttractionTimer = null; if (this.sindaraMergeTimer) this.sindaraMergeTimer.remove(false); this.sindaraMergeTimer = null; if(this.input) this.input.removeAllListeners(); if(this.time) this.time.removeAllEvents(); if(this.physics.world) this.physics.world.off('worldbounds', this.handleWorldBounds, this); this.events.removeAllListeners(); if (this.balls) this.balls.destroy(true); this.balls = null; if (this.bricks) this.bricks.destroy(true); this.bricks = null; if (this.powerUps) this.powerUps.destroy(true); this.powerUps = null; if (this.paddle) this.paddle.destroy(); this.paddle = null; this.ballPaddleCollider = null; this.ballBrickCollider = null; this.ballBrickOverlap = null; this.ballBallCollider = null; console.log("GameScene cleanup finished."); }

} // ← GameScene クラスの終わり

// --- UIScene ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText = null; this.scoreText = null; this.stageText = null; /* TODO: Vajra UI elements */ }
    create() { console.log("UIScene Create: Start"); this.gameWidth = this.scale.width; const textStyle = { fontSize: '24px', fill: '#fff' }; this.livesText = this.add.text(16, 16, 'ライフ: -', textStyle); this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: -', textStyle).setOrigin(0.5, 0); this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: 0', textStyle).setOrigin(1, 0); try { const gs = this.scene.get('GameScene'); if (gs && gs.events) { console.log("UIScene: GS found."); this.registerGameEventListeners(gs); } else { this.scene.get('GameScene').events.once('create', this.registerGameEventListeners, this); console.log("UIScene: Waiting GS create..."); } } catch (e) { console.error("UIScene: Error getting GS.", e); } this.events.on('shutdown', () => { console.log("UIScene Shutdown."); try { const gs = this.scene.get('GameScene'); if (gs && gs.events) { gs.events.off('updateLives', this.updateLivesDisplay, this); gs.events.off('updateScore', this.updateScoreDisplay, this); gs.events.off('updateStage', this.updateStageDisplay, this); gs.events.off('create', this.registerGameEventListeners, this); gs.events.off('activateVajraUI', this.activateVajraUIDisplay, this); gs.events.off('updateVajraGauge', this.updateVajraGaugeDisplay, this); } } catch (e) { /* Ignore */ } }); console.log("UIScene Create: End"); }
    registerGameEventListeners(gameScene) { console.log("UIScene: Registering listeners."); if (!gameScene || !gameScene.events) { console.error("UIScene Register: Invalid GS."); return; } gameScene.events.off('updateLives', this.updateLivesDisplay, this); gameScene.events.off('updateScore', this.updateScoreDisplay, this); gameScene.events.off('updateStage', this.updateStageDisplay, this); gameScene.events.off('activateVajraUI', this.activateVajraUIDisplay, this); gameScene.events.off('updateVajraGauge', this.updateVajraGaugeDisplay, this); gameScene.events.on('updateLives', this.updateLivesDisplay, this); gameScene.events.on('updateScore', this.updateScoreDisplay, this); gameScene.events.on('updateStage', this.updateStageDisplay, this); gameScene.events.on('activateVajraUI', this.activateVajraUIDisplay, this); gameScene.events.on('updateVajraGauge', this.updateVajraGaugeDisplay, this); try { if (gameScene.hasOwnProperty('lives')) this.updateLivesDisplay(gameScene.lives); if (gameScene.hasOwnProperty('score')) this.updateScoreDisplay(gameScene.score); if (gameScene.hasOwnProperty('currentStage')) this.updateStageDisplay(gameScene.currentStage); console.log("UIScene: Initial state updated."); } catch (e) { console.error("UIScene: Error updating initial state.", e); } }
    updateLivesDisplay(lives) { if (this.livesText) this.livesText.setText(`ライフ: ${lives}`); }
    updateScoreDisplay(score) { if (this.scoreText) this.scoreText.setText(`スコア: ${score}`); }
    updateStageDisplay(stage) { if (this.stageText) this.stageText.setText(`ステージ: ${stage}`); }
    // ★ ヴァジラUI用ダミー関数 ★
    activateVajraUIDisplay(initialValue, maxValue) { console.log(`UIScene: Activate Vajra UI (Initial: ${initialValue}/${maxValue})`); /* TODO: ゲージ描画開始 */ }
    updateVajraGaugeDisplay(currentValue) { console.log(`UIScene: Update Vajra Gauge (${currentValue})`); /* TODO: ゲージ描画更新 */ }
}

// --- Phaserゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-game-container', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { debug: false, gravity: { y: 0 } } },
    scene: [BootScene, TitleScene, GameScene, UIScene],
    input: { activePointers: 3, },
    render: { pixelArt: false, antialias: true, }
};

// --- ゲーム開始 ---
window.onload = () => { const game = new Phaser.Game(config); console.log("Phaser Game instance created."); };