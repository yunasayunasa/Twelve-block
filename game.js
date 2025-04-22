// --- 定数 ---
// (変更なし)
const PADDLE_WIDTH_RATIO = 0.2; const PADDLE_HEIGHT = 20; const PADDLE_Y_OFFSET = 50; const BALL_RADIUS = 15; const BALL_INITIAL_VELOCITY_Y = -350; const BALL_INITIAL_VELOCITY_X_RANGE = [-150, 150]; const BRICK_ROWS = 5; const BRICK_COLS = 8; const BRICK_WIDTH_RATIO = 0.1; const BRICK_HEIGHT = 20; const BRICK_SPACING = 4; const BRICK_OFFSET_TOP = 100; const MAX_DURABLE_HITS = 3; const DURABLE_BRICK_COLOR = 0xaaaaaa; const DURABLE_BRICK_HIT_DARKEN = 40; const INDESTRUCTIBLE_BRICK_COLOR = 0x333333; const MAX_STAGE = 12; const GAME_MODE = { NORMAL: 'normal', ALL_STARS: 'all_stars' }; const BRICK_COLORS = [ 0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff ]; const DEFAULT_BALL_TEXTURE = 'ball'; const POWERUP_DROP_RATE = 0.7; const BAISRAVA_DROP_RATE = 0.02; const POWERUP_SIZE = 24; const POWERUP_SPEED_Y = 100; const POWERUP_TYPES = { KUBIRA: 'kubira', SHATORA: 'shatora', HAILA: 'haila', ANCHIRA: 'anchira', SINDARA: 'sindara', BIKARA: 'bikara', INDARA: 'indara', ANILA: 'anila', BAISRAVA: 'baisrava', VAJRA: 'vajra', MAKIRA: 'makira', MAKORA: 'makora' }; const NORMAL_MODE_POWERUP_POOL = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA, POWERUP_TYPES.MAKORA ]; const ALLSTARS_MODE_POWERUP_POOL = [...NORMAL_MODE_POWERUP_POOL]; const MAKORA_COPYABLE_POWERS = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA ]; const POWERUP_DURATION = { [POWERUP_TYPES.KUBIRA]: 10000, [POWERUP_TYPES.SHATORA]: 3000, [POWERUP_TYPES.HAILA]: 10000, [POWERUP_TYPES.MAKIRA]: 6667 }; const BIKARA_YANG_COUNT_MAX = 2; const INDARA_MAX_HOMING_COUNT = 3; const NORMAL_BALL_SPEED = Math.abs(BALL_INITIAL_VELOCITY_Y); const BALL_SPEED_MODIFIERS = { [POWERUP_TYPES.SHATORA]: 3.0, [POWERUP_TYPES.HAILA]: 0.3 }; const SINDARA_ATTRACTION_DELAY = 3000; const SINDARA_ATTRACTION_FORCE = 400; const SINDARA_MERGE_DURATION = 500; const SINDARA_POST_MERGE_PENETRATION_DURATION = 2000; const VAJRA_GAUGE_MAX = 100; const VAJRA_GAUGE_INCREMENT = 10; const VAJRA_DESTROY_COUNT = 5; const MAKIRA_ATTACK_INTERVAL = 1000; const MAKIRA_BEAM_SPEED = 400; const MAKIRA_BEAM_WIDTH = 10; const MAKIRA_BEAM_HEIGHT = 15; const MAKIRA_BEAM_COLOR = 0xff0000; const MAKIRA_FAMILIAR_OFFSET = 40; const MAKIRA_FAMILIAR_SIZE = 15; const BIKARA_MARK_SIZE = 10; const DROP_POOL_UI_ICON_SIZE = 18; const DROP_POOL_UI_SPACING = 5; const UI_BOTTOM_OFFSET = 30;
const SYMBOL_PATTERNS = { '3': [ [1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 1] ], '9': [ [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 1] ], '11': [ [0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0], [0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0], [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0], [0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1], [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1], [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1], [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0] ], };

// --- BootScene (★ テクスチャ生成を一時的に無効化) ---
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    createBorderedTexture(key, width, height, fillColor, borderColor, borderThickness = 1) { /* ... (中身は省略してもOK) ... */ } // 定義は残すが呼ばない

    preload() {
        console.log("BootScene: Preloading assets..."); const imagePath = 'assets/images/'; const audioPath = 'assets/audio/';
        // 画像 (前回と同じ)
        this.load.image('background1', imagePath + 'background1.jpg'); this.load.image('background2', imagePath + 'background2.jpg'); this.load.image('title_background', imagePath + 'title_background.jpg'); this.load.image('title_logo', imagePath + 'title_logo.png'); this.load.image('ball', imagePath + 'ball.png'); this.load.image('bikara_mark', imagePath + 'bikara_mark.png'); this.load.image('makira_familiar', imagePath + 'makira_familiar.png');
        Object.values(POWERUP_TYPES).forEach(type => { if (type === POWERUP_TYPES.BIKARA) { this.load.image('icon_bikara_yin', imagePath + 'icon_bikara_yin.png'); this.load.image('icon_bikara_yang', imagePath + 'icon_bikara_yang.png'); } else { this.load.image(`icon_${type}`, imagePath + `icon_${type}.png`); } });
        // 音声 (前回と同じ)
        this.load.audio('bgm_title', [audioPath + 'bgm_title.ogg', audioPath + 'bgm_title.mp3']); this.load.audio('bgm_game', [audioPath + 'bgm_game.ogg', audioPath + 'bgm_game.mp3']); this.load.audio('bgm_gameover', [audioPath + 'bgm_gameover.ogg', audioPath + 'bgm_gameover.mp3']); this.load.audio('se_bounce_wall', [audioPath + 'se_bounce_wall.wav']); this.load.audio('se_bounce_brick', [audioPath + 'se_bounce_brick.wav']); this.load.audio('se_bounce_paddle', [audioPath + 'se_bounce_paddle.wav']); this.load.audio('se_destroy_brick', [audioPath + 'se_destroy_brick.wav']); this.load.audio('se_life_down', [audioPath + 'se_life_down.wav']); this.load.audio('se_stage_clear', [audioPath + 'se_stage_clear.wav']); this.load.audio('se_game_clear', [audioPath + 'se_game_clear.wav']); this.load.audio('se_title_tap', [audioPath + 'se_title_tap.wav']); this.load.audio('se_makira_beam', [audioPath + 'se_makira_beam.wav']);
        Object.values(POWERUP_TYPES).forEach(type => { this.load.audio(`se_powerup_get_${type}`, [audioPath + `se_powerup_get_${type}.wav`]); });
        this.load.on('progress', (value) => {}); this.load.on('complete', () => { console.log('BootScene: Asset loading complete.'); });
    }

    create() {
        console.log("BootScene: Create START (Texture generation SKIPPED for testing)");

        // ★★★ whitePixel を確実に生成 ★★★
        if (!this.textures.exists('whitePixel')) {
            this.textures.generate('whitePixel', { data: ['1'], pixelWidth: 1 });
            console.log("BootScene: Generated whitePixel texture.");
        } else {
            console.log("BootScene: whitePixel texture already exists.");
        }

        // ★★★ 存在しないテクスチャキーの代わりに whitePixel を使うように仮登録 ★★★
        // これにより GameScene でテクスチャが見つからなくてもエラー停止しにくくなる（見た目は白い四角になる）
        const keysToAlias = ['paddle_texture', 'brick_texture_normal', 'brick_texture_durable', 'brick_texture_indestructible'];
        keysToAlias.forEach(key => {
            if (!this.textures.exists(key)) {
                try {
                    // Phaser 3.60+ では add を使う場合があるが、alias の方が安全か
                    // this.textures.add(key, this.textures.get('whitePixel').getSourceImage());
                    this.textures.addAlias(key, 'whitePixel'); // キーが存在しない場合、whitePixelとして参照させる
                    console.log(`BootScene: Aliased ${key} to whitePixel.`);
                } catch (e) {
                    console.error(`BootScene: Error aliasing texture ${key}`, e);
                }
            }
        });


        console.log("BootScene: Starting TitleScene...");
        this.scene.start('TitleScene');
    }
}

// --- TitleScene ---
class TitleScene extends Phaser.Scene { /* ... (前回と同じ) ... */
    constructor() { super('TitleScene'); } create() { const w = this.scale.width; const h = this.scale.height; this.add.image(w / 2, h / 2, 'title_background').setDisplaySize(w, h); this.add.image(w / 2, h * 0.2, 'title_logo').setScale(0.8); const buttonStyle = { fontSize: '32px', fill: '#fff', backgroundColor: '#555', padding: { x: 20, y: 10 } }; const buttonHoverStyle = { fill: '#ff0' }; const normalButton = this.add.text(w / 2, h * 0.6, '通常モード', buttonStyle).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerover', () => { normalButton.setStyle(buttonHoverStyle) }).on('pointerout', () => { normalButton.setStyle(buttonStyle) }).on('pointerdown', () => { this.sound.play('se_title_tap'); this.scene.start('GameScene', { mode: GAME_MODE.NORMAL }); this.scene.launch('UIScene'); }); const allStarsButton = this.add.text(w / 2, h * 0.8, '全員集合モード', buttonStyle).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerover', () => { allStarsButton.setStyle(buttonHoverStyle) }).on('pointerout', () => { allStarsButton.setStyle(buttonStyle) }).on('pointerdown', () => { this.sound.play('se_title_tap'); this.scene.start('GameScene', { mode: GAME_MODE.ALL_STARS }); this.scene.launch('UIScene'); }); this.sound.stopAll(); this.sound.play('bgm_title', { loop: true, volume: 0.5 }); }
}

// --- GameScene ---
class GameScene extends Phaser.Scene { /* ... (前回と同じ構造) ... */
    constructor() { super('GameScene'); /* ... */ } init(data) { /* ... */ } preload() { }
    create() { /* ... (前回と同じ + パドル/ブロックのテクスチャキー確認) ... */
        this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; const bgIndex = ((this.currentStage - 1) % 2) + 1; this.background = this.add.image(this.gameWidth / 2, this.gameHeight / 2, `background${bgIndex}`).setDisplaySize(this.gameWidth, this.gameHeight).setDepth(-1);
        this.time.delayedCall(50, () => { if (this.scene.isActive('UIScene')) { /* ... UI更新 ... */ } });
        this.physics.world.setBoundsCollision(true, true, true, false); this.physics.world.on('worldbounds', this.handleWorldBounds, this);
        // ★ パドル生成 (テクスチャキー確認 or whitePixel)
        const paddleTextureKey = this.textures.exists('paddle_texture') ? 'paddle_texture' : 'whitePixel';
        this.paddle = this.physics.add.image(this.scale.width / 2, this.scale.height - PADDLE_Y_OFFSET, paddleTextureKey).setImmovable(true).setData('originalWidthRatio', PADDLE_WIDTH_RATIO);
        if(paddleTextureKey === 'whitePixel') this.paddle.setTint(0xffffff); // whitePixelなら色付け
        this.updatePaddleSize();
        this.balls = this.physics.add.group({ bounceX: 1, bounceY: 1, collideWorldBounds: true }); this.createAndAddBall(this.paddle.x, this.paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS);
        this.setupStage();
        this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER\nTap to Restart', { fontSize: '48px', fill: '#f00', align: 'center' }).setOrigin(0.5).setVisible(false).setDepth(1);
        this.powerUps = this.physics.add.group(); this.familiars = this.physics.add.group(); this.makiraBeams = this.physics.add.group(); this.bikaraMarksGroup = this.add.group();
        this.setupParticles(); this.setColliders(); this.physics.add.overlap(this.paddle, this.powerUps, this.collectPowerUp, null, this);
        this.input.on('pointermove', (pointer) => { /* ... */ }); this.input.on('pointerdown', () => { /* ... */ }); this.scale.on('resize', this.handleResize, this); this.events.on('shutdown', this.shutdown, this);
        this.sound.stopAll(); this.sound.play('bgm_game', { loop: true, volume: 0.6 });
    }
    setupParticles() { /* ... */ } updatePaddleSize() { /* ... */ } handleResize(gameSize, baseSize, displaySize, resolution) { /* ... */ } setupStage() { /* ... */ } update() { /* ... */ } setColliders() { /* ... */ }
    createAndAddBall(x, y, vx = 0, vy = 0, data = null) { /* ... (前回と同じ) ... */ }
    launchBall() { /* ... */ }
    createBricks() { /* ... (前回と同じ、createBrickObject呼び出し) ... */ }
    // ★ ブロック生成ヘルパー (テクスチャキー確認 or whitePixel)
    createBrickObject(x, y, width, type, color, maxHits, isDurable) {
        let textureKey;
        switch(type) {
            case 'durable': textureKey = this.textures.exists('brick_texture_durable') ? 'brick_texture_durable' : 'whitePixel'; break;
            case 'indestructible': textureKey = this.textures.exists('brick_texture_indestructible') ? 'brick_texture_indestructible' : 'whitePixel'; break;
            default: textureKey = this.textures.exists('brick_texture_normal') ? 'brick_texture_normal' : 'whitePixel'; break;
        }
        const brick = this.bricks.create(x, y, textureKey).setDisplaySize(width, BRICK_HEIGHT).setTint(color);
        brick.setData({ originalTint: color, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable, type: type, bikaraMark: null });
        brick.refreshBody(); if (maxHits === -1) brick.body.immovable = true;
        return brick;
    }
    createBricksFallbackToNormal() { /* ... (前回と同じ、createBrickObject呼び出し) ... */ }
    handleBrickHit(brick, damage = 1) { /* ... (前回と同じ) ... */ } handleBrickDestruction(brick) { /* ... (前回と同じ) ... */ } hitBrick(brick, ball) { /* ... (前回と同じ) ... */ } handleBallBrickOverlap(ball, brick) { /* ... (前回と同じ) ... */ } handleBikaraYangDestroy(ball, hitBrick) { /* ... (前回と同じ) ... */ } hitBrickWithMakiraBeam(beam, brick) { /* ... (前回と同じ) ... */ } triggerVajraDestroy() { /* ... */ } activateBaisrava() { /* ... */ } getDestroyableBrickCount() { /* ... */ }
    dropSpecificPowerUp(x, y, type) { /* ... (前回と同じテクスチャ存在確認ロジック) ... */ }
    dropPowerUp(x, y) { /* ... */ } hitPaddle(paddle, ball) { /* ... (前回と同じ) ... */ } collectPowerUp(paddle, powerUp) { /* ... (前回と同じ) ... */ } activateMakora() { /* ... */ } keepFurthestBall() { /* ... */ } activatePower(type) { /* ... (前回と同じ) ... */ } deactivatePowerByType(type) { /* ... (前回と同じ) ... */ }
    updateBallTexture(ball) { /* ... (前回と同じテクスチャ存在確認ロジック) ... */ }
    // --- 個別パワーアップ効果 ---
    activateKubira(balls) { /* ... */ } deactivateKubira(balls) { /* ... */ } applySpeedModifier(ball, type) { /* ... */ } resetBallSpeed(ball) { /* ... */ } activateShatora(balls) { /* ... */ } deactivateShatora(balls) { /* ... */ } activateHaira(balls) { /* ... */ } deactivateHaira(balls) { /* ... */ } activateAnchira(sourceBall) { /* ... */ } deactivateAnchira(balls) { /* ... */ } activateSindara(sourceBall) { /* ... */ } startSindaraAttraction(ball1, ball2) { /* ... */ } updateSindaraAttraction(ball) { /* ... */ } handleBallCollision(ball1, ball2) { /* ... */ } mergeSindaraBalls(ballToKeep, ballToRemove) { /* ... */ } finishSindaraMerge(mergedBall) { /* ... */ } deactivateSindaraPenetration(ball) { /* ... */ } deactivateSindara(balls) { /* ... */ } activateBikara(balls) { /* ... */ } deactivateBikara(balls) { /* ... */ } switchBikaraState(ball) { /* ... */ }
    markBrickByBikara(brick) { if (!brick || !brick.active || brick.getData('isMarkedByBikara') || brick.getData('maxHits') === -1) return; brick.setData('isMarkedByBikara', true); const textureKey = 'bikara_mark'; if (!this.textures.exists(textureKey)) { console.warn(`Texture key not found: ${textureKey}`); return; } const mark = this.bikaraMarksGroup.create(brick.x, brick.y, textureKey).setDisplaySize(BIKARA_MARK_SIZE, BIKARA_MARK_SIZE).setDepth(brick.depth + 1); brick.setData('bikaraMark', mark); } // ★ テクスチャ存在確認
    activateIndara(balls) { /* ... */ } deactivateIndaraForBall(ball) { /* ... */ } handleWorldBounds(body, up, down, left, right) { /* ... */ } activateAnila(balls) { /* ... */ } deactivateAnilaForBall(ball) { /* ... */ } triggerAnilaBounce(ball) { /* ... */ } activateVajra() { /* ... */ } increaseVajraGauge() { /* ... */ } deactivateVajra() { /* ... */ } activateMakira() { /* ... */ } deactivateMakira() { /* ... */ }
    createFamiliars() { /* ... (前回と同じテクスチャ存在確認ロジック) ... */ }
    fireMakiraBeam() { /* ... */ }
    // --- ゲーム進行関連 ---
    loseLife() { /* ... (前回と同じ) ... */ } resetForNewLife() { /* ... */ } gameOver() { /* ... */ } stageClear() { /* ... */ } gameComplete() { /* ... */ } returnToTitle() { /* ... */ } shutdown() { /* ... */ }
}

// --- UIScene ---
class UIScene extends Phaser.Scene { /* ... (前回と同じ + ドロッププールUIのテクスチャ存在確認) ... */
    constructor() { super({ key: 'UIScene', active: false }); /* ... */ } create() { /* ... */ } onGameResize() { /* ... */ } registerGameEventListeners(gameScene) { /* ... */ } unregisterGameEventListeners(gameScene = null) { /* ... */ } updateLivesDisplay(lives) { /* ... */ } updateScoreDisplay(score) { /* ... */ } updateStageDisplay(stage) { /* ... */ } activateVajraUIDisplay(initialValue, maxValue) { /* ... */ } updateVajraGaugeDisplay(currentValue) { /* ... */ } deactivateVajraUIDisplay() { /* ... */ }
    updateDropPoolDisplay(dropPoolTypes) { if (!this.dropPoolIconsGroup) return; this.dropPoolIconsGroup.clear(true, true); if (!dropPoolTypes || dropPoolTypes.length === 0) { this.updateDropPoolPosition(); return; } dropPoolTypes.forEach((type, index) => { let iconKey = `icon_${type === POWERUP_TYPES.BIKARA ? 'bikara_yin' : type}`; if (this.textures.exists(iconKey)) { const icon = this.add.image(0, 0, iconKey).setDisplaySize(DROP_POOL_UI_ICON_SIZE, DROP_POOL_UI_ICON_SIZE).setOrigin(0, 0.5); this.dropPoolIconsGroup.add(icon); } else { console.warn(`Texture key not found for drop pool UI: ${iconKey}. Skipping icon.`); } }); this.updateDropPoolPosition(); }
    updateDropPoolPosition() { /* ... */ }
}

// --- Phaserゲーム設定 ---
const config = { /* ... (前回と同じ) ... */ };
// --- ゲーム開始 ---
window.onload = () => { const game = new Phaser.Game(config); };
