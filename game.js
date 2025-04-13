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
const BIKARA_YANG_COUNT_MAX = 2; const INDARA_MAX_HOMING_COUNT = 3;
const NORMAL_BALL_SPEED = Math.abs(BALL_INITIAL_VELOCITY_Y); const BALL_SPEED_MODIFIERS = { [POWERUP_TYPES.SHATORA]: 3.0, [POWERUP_TYPES.HAILA]: 0.3 };
const SINDARA_ATTRACTION_DELAY = 3000; const SINDARA_ATTRACTION_FORCE = 400; const SINDARA_MERGE_DURATION = 500; const SINDARA_POST_MERGE_PENETRATION_DURATION = 2000; const SINDARA_ATTRACT_COLOR = 0xa52a2a; const SINDARA_MERGE_COLOR = 0xff4500;
const VAJRA_GAUGE_MAX = 100; const VAJRA_GAUGE_INCREMENT = 10; const VAJRA_DESTROY_COUNT = 5;
const MAKIRA_ATTACK_INTERVAL = 1000; const MAKIRA_BEAM_SPEED = 400; const MAKIRA_BEAM_WIDTH = 10; const MAKIRA_BEAM_HEIGHT = 15; const MAKIRA_BEAM_COLOR = 0xff0000; const MAKIRA_FAMILIAR_OFFSET = 40; const MAKIRA_FAMILIAR_SIZE = 10; const MAKIRA_FAMILIAR_COLOR = 0x00ced1;
const DROP_POOL_UI_ICON_SIZE = 18; const DROP_POOL_UI_SPACING = 5;
const UI_BOTTOM_OFFSET = 30;

// --- BootScene ---
class BootScene extends Phaser.Scene {
    constructor(){super('BootScene');}
    preload(){ this.textures.generate('whitePixel', { data: ['1'], pixelWidth: 1 }); }
    create(){this.scene.start('TitleScene');}
}

// --- TitleScene ---
class TitleScene extends Phaser.Scene { constructor(){super('TitleScene');} create(){const w=this.scale.width,h=this.scale.height;this.cameras.main.setBackgroundColor('#222');this.add.text(w/2,h*0.2,'十二神将',{fontSize:'40px',fill:'#fff',fontStyle:'bold'}).setOrigin(0.5);this.add.text(w/2,h*0.3,'(仮)',{fontSize:'20px',fill:'#fff'}).setOrigin(0.5);const bs={fontSize:'32px',fill:'#fff',backgroundColor:'#555',padding:{x:20,y:10}};const bhs={fill:'#ff0'};const nb=this.add.text(w/2,h*0.5,'通常',bs).setOrigin(0.5).setInteractive({useHandCursor:true}).on('pointerover',()=>{nb.setStyle(bhs)}).on('pointerout',()=>{nb.setStyle(bs)}).on('pointerdown',()=>{this.scene.start('GameScene',{mode:GAME_MODE.NORMAL});this.scene.launch('UIScene');});const asb=this.add.text(w/2,h*0.7,'全員',bs).setOrigin(0.5).setInteractive({useHandCursor:true}).on('pointerover',()=>{asb.setStyle(bhs)}).on('pointerout',()=>{asb.setStyle(bs)}).on('pointerdown',()=>{this.scene.start('GameScene',{mode:GAME_MODE.ALL_STARS});this.scene.launch('UIScene');});} }

// --- GameScene ---
class GameScene extends Phaser.Scene {
    constructor(){
        super('GameScene');
        this.paddle=null; this.balls=null; this.bricks=null; this.powerUps=null; this.lives=0; this.gameOverText=null; this.isBallLaunched=false; this.gameWidth=0; this.gameHeight=0; this.currentMode=null; this.currentStage=1; this.score=0;
        this.ballPaddleCollider=null; this.ballBrickCollider=null; this.ballBrickOverlap=null; this.ballBallCollider=null;
        this.powerUpTimers={};
        this.sindaraAttractionTimer=null; this.sindaraMergeTimer=null; this.sindaraPenetrationTimer = null;
        this.isStageClearing=false; this.isGameOver=false;
        this.isVajraSystemActive=false; this.vajraGauge=0;
        this.isMakiraActive=false; this.familiars=null; this.makiraBeams=null; this.makiraAttackTimer=null; this.makiraBeamBrickOverlap = null;
        this.stageDropPool = [];
    }
    init(data){ /* 省略 (変更なし) */
        this.currentMode=data.mode||GAME_MODE.NORMAL; this.lives=(this.currentMode===GAME_MODE.ALL_STARS)?1:3; this.isBallLaunched=false; this.currentStage=1; this.score=0;
        Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove();}); this.powerUpTimers={};
        if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null;
        if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null;
        if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
        this.isStageClearing=false; this.isGameOver=false;
        this.isVajraSystemActive=false; this.vajraGauge=0;
        this.isMakiraActive=false; if(this.makiraAttackTimer)this.makiraAttackTimer.remove(); this.makiraAttackTimer=null;
        this.stageDropPool = [];
     }
    preload(){}
    create(){
        this.gameWidth=this.scale.width; this.gameHeight=this.scale.height; this.cameras.main.setBackgroundColor('#222');
        this.time.delayedCall(50,()=>{ if(this.scene.isActive('UIScene')){ this.events.emit('updateLives',this.lives); this.events.emit('updateScore',this.score); this.events.emit('updateStage',this.currentStage); if(this.isVajraSystemActive) { this.events.emit('activateVajraUI',this.vajraGauge,VAJRA_GAUGE_MAX); } else { this.events.emit('deactivateVajraUI'); } this.events.emit('updateDropPoolUI', this.stageDropPool); } });
        this.physics.world.setBoundsCollision(true,true,true,false); this.physics.world.on('worldbounds',this.handleWorldBounds,this);

        // ★ パドル生成 (Origin はデフォルトの 0.5, 0.5 のまま)
        this.paddle = this.physics.add.image(this.scale.width/2, this.scale.height-PADDLE_Y_OFFSET, 'whitePixel')
            .setTint(0xffffff)
            .setImmovable(true)
            .setData('originalWidthRatio', PADDLE_WIDTH_RATIO);

        this.updatePaddleSize(); // ★ 初期サイズ設定

        this.balls=this.physics.add.group({bounceX:1,bounceY:1,collideWorldBounds:true}); this.createAndAddBall(this.paddle.x,this.paddle.y-PADDLE_HEIGHT/2-BALL_RADIUS);
        this.setupStage();
        this.gameOverText=this.add.text(this.scale.width/2,this.scale.height/2,'G Over\nTap',{fontSize:'48px',fill:'#f00',align:'center'}).setOrigin(0.5).setVisible(false).setDepth(1);
        this.powerUps=this.physics.add.group(); this.familiars=this.physics.add.group(); this.makiraBeams=this.physics.add.group();
        this.setColliders();
        this.physics.add.overlap(this.paddle,this.powerUps,this.collectPowerUp,null,this);
        this.input.on('pointermove',(p)=>{ if(!this.isGameOver&&this.lives>0&&this.paddle&&!this.isStageClearing){ const tX = p.x; const hW = this.paddle.displayWidth / 2; const cX = Phaser.Math.Clamp(tX, hW, this.scale.width - hW); this.paddle.x = cX; if (!this.isBallLaunched) { this.balls.getChildren().forEach(b => { if(b.active) b.x = cX; }); } } });
        this.input.on('pointerdown',()=>{ if(this.isGameOver&&this.gameOverText?.visible){ this.returnToTitle(); } else if(this.lives>0&&!this.isBallLaunched&&!this.isStageClearing){ this.launchBall(); } });

        this.scale.on('resize', this.handleResize, this);
        this.events.on('shutdown',this.shutdown,this);
    }

    // ★ パドルサイズ更新関数を refreshBody() を使うように変更
    updatePaddleSize() {
        if (!this.paddle) return;
        const newWidth = this.scale.width * this.paddle.getData('originalWidthRatio');
        this.paddle.setDisplaySize(newWidth, PADDLE_HEIGHT);

        // ★ setDisplaySize の後に refreshBody を呼ぶ
        this.paddle.refreshBody();

        // パドルの位置を再クランプ
        const halfWidth = this.paddle.displayWidth / 2; // ★ displayWidth を使う
        this.paddle.x = Phaser.Math.Clamp(this.paddle.x, halfWidth, this.scale.width - halfWidth);
        console.log(`Paddle resized: DisplayWidth=${this.paddle.displayWidth.toFixed(2)}, BodyWidth=${this.paddle.body?.width.toFixed(2)}`); // サイズ確認ログ
    }

    handleResize(gameSize, baseSize, displaySize, resolution) { /* 省略 (変更なし) */
        console.log("Resize event detected!");
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;
        this.updatePaddleSize();
        if (this.scene.isActive('UIScene')) {
            this.events.emit('gameResize');
        }
     }
    setupStage() { /* 省略 (変更なし) */
        console.log(`Setting up stage ${this.currentStage}`);
        if (this.currentMode === GAME_MODE.NORMAL) {
            const shuffledPool = Phaser.Utils.Array.Shuffle([...NORMAL_MODE_POWERUP_POOL]);
            this.stageDropPool = shuffledPool.slice(0, 4);
            console.log(`Normal Mode Drop Pool (Stage ${this.currentStage}):`, this.stageDropPool);
            this.events.emit('updateDropPoolUI', this.stageDropPool);
        } else {
            this.stageDropPool = [...ALLSTARS_MODE_POWERUP_POOL];
            console.log(`All Stars Mode Drop Pool (Stage ${this.currentStage}): All available`);
             this.events.emit('updateDropPoolUI', []);
        }
        this.createBricks();
     }
    update(){ /* 省略 (変更なし) */
        if(this.isGameOver||this.isStageClearing||this.lives<=0){ return; }
        let aBC=0; let sB=[];
        this.balls.getChildren().forEach(b=>{ if(b.active){ aBC++; if(this.isBallLaunched&&!this.isStageClearing&&b.y>this.gameHeight+b.displayHeight){ if(b.getData('isAnilaActive')) { this.triggerAnilaBounce(b); } else { b.setActive(false).setVisible(false); if(b.body) b.body.enable=false; } } if(b.getData('isSindara')){ sB.push(b); if(b.getData('isAttracting')) { this.updateSindaraAttraction(b); } } if(b.body&&this.isBallLaunched){ const minS=NORMAL_BALL_SPEED*0.1; const maxS=NORMAL_BALL_SPEED*5; const sp=b.body.velocity.length(); if(sp<minS&&sp>0) { b.body.velocity.normalize().scale(minS); } else if(sp>maxS) { b.body.velocity.normalize().scale(maxS); } } } });
        if(sB.length===1 && this.balls.getTotalUsed() > 1){ const rB=sB[0]; if(rB.getData('isSindara')){ this.deactivateSindara([rB]); this.updateBallTint(rB); } }
        if(aBC===0&&this.isBallLaunched&&!this.isStageClearing&&this.lives>0){ this.loseLife(); return; }
        this.powerUps.children.each(pu=>{ if(pu.active&&pu.y>this.gameHeight+POWERUP_SIZE) { pu.destroy(); } });
        if(this.balls.countActive(true)===1){ const lB=this.balls.getFirstAlive(); if(lB&&lB.getData('isAnchira')){ this.deactivateAnchira([lB]); this.updateBallTint(lB); } }
        if(this.isMakiraActive&&this.paddle&&this.familiars){ const pX=this.paddle.x; const fY=this.paddle.y-PADDLE_HEIGHT/2-MAKIRA_FAMILIAR_SIZE; const c = this.familiars.getChildren(); if(c.length>=1 && c[0].active) c[0].setPosition(pX-MAKIRA_FAMILIAR_OFFSET, fY); if(c.length>=2 && c[1].active) c[1].setPosition(pX+MAKIRA_FAMILIAR_OFFSET, fY); }
        if(this.makiraBeams){ this.makiraBeams.children.each(bm=>{ if(bm.active&&bm.y<-MAKIRA_BEAM_HEIGHT) { bm.destroy(); } }); }
     }
    setColliders(){ /* 省略 (変更なし) */
        if(this.ballPaddleCollider)this.ballPaddleCollider.destroy(); if(this.ballBrickCollider)this.ballBrickCollider.destroy(); if(this.ballBrickOverlap)this.ballBrickOverlap.destroy(); if(this.ballBallCollider)this.ballBallCollider.destroy(); if(this.makiraBeamBrickOverlap) this.makiraBeamBrickOverlap.destroy();
        if(!this.balls||!this.paddle||!this.bricks) return;
        this.ballPaddleCollider=this.physics.add.collider(this.paddle,this.balls,this.hitPaddle,null,this);
        this.ballBrickCollider=this.physics.add.collider(this.bricks,this.balls,this.hitBrick, (brick, ball)=>{
            const isBikara = ball.getData('isBikara');
            const isPenetrating = ball.getData('isPenetrating');
            const isMerging = ball.getData('isSindara') && ball.getData('isMerging');
            const isAttracting = ball.getData('isSindara') && ball.getData('isAttracting');
            if(isPenetrating || isBikara || isMerging || isAttracting) return false;
            return true;
         },this);
        this.ballBrickOverlap=this.physics.add.overlap(this.balls,this.bricks,this.handleBallBrickOverlap, (ball, brick)=>{
            return ball.getData('isPenetrating') || ball.getData('isBikara') ||
                   (ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging')));
        },this);
        this.ballBallCollider=this.physics.add.collider(this.balls,this.balls,this.handleBallCollision, (b1, b2)=>{ return b1.getData('isSindara') && b2.getData('isSindara') && b1.getData('isAttracting') && b2.getData('isAttracting'); },this);
        if (this.makiraBeams && this.bricks) { this.makiraBeamBrickOverlap = this.physics.add.overlap( this.makiraBeams, this.bricks, this.hitBrickWithMakiraBeam, null, this); }
    }
    createAndAddBall(x,y,vx=0,vy=0,data=null){ /* 省略 (変更なし) */
        const ball=this.balls.create(x,y,null).setDisplaySize(BALL_RADIUS*2,BALL_RADIUS*2).setTint(DEFAULT_BALL_COLOR).setCircle(BALL_RADIUS).setCollideWorldBounds(true).setBounce(1);
        if(ball.body){ ball.setVelocity(vx,vy); ball.body.onWorldBounds=true; } else{ ball.destroy(); return null; }
        ball.setData({ activePowers: data ? new Set(data.activePowers) : new Set(), lastActivatedPower: data ? data.lastActivatedPower : null, isPenetrating: data ? data.isPenetrating : false, isFast: data ? data.isFast : false, isSlow: data ? data.isSlow : false, isAnchira: data ? data.isAnchira : false, isSindara: data ? data.isSindara : false, sindaraPartner: null, isAttracting: false, isMerging: false, isBikara: data ? data.isBikara : false, bikaraState: data ? data.bikaraState : null, bikaraYangCount: 0, isIndaraActive: data ? data.isIndaraActive : false, indaraHomingCount: data ? data.indaraHomingCount : 0, isAnilaActive: data ? data.isAnilaActive : false });
        if(data){ this.updateBallTint(ball); if(ball.getData('isFast')) this.applySpeedModifier(ball,POWERUP_TYPES.SHATORA); else if(ball.getData('isSlow')) this.applySpeedModifier(ball,POWERUP_TYPES.HAILA); } return ball;
     }
    launchBall(){ /* 省略 (変更なし) */ if(!this.isBallLaunched&&this.balls){ const fB=this.balls.getFirstAlive(); if(fB){ const iVx=Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0],BALL_INITIAL_VELOCITY_X_RANGE[1]); fB.setVelocity(iVx,BALL_INITIAL_VELOCITY_Y); this.isBallLaunched=true; } } }
    createBricks(){ /* 省略 (変更なし) */
        if(this.bricks){ this.bricks.clear(true,true); this.bricks.destroy(); }
        this.bricks=this.physics.add.staticGroup();
        const bW=this.gameWidth*BRICK_WIDTH_RATIO; const tW=BRICK_COLS*bW+(BRICK_COLS-1)*BRICK_SPACING; const oX=(this.gameWidth-tW)/2; const rC=this.currentMode===GAME_MODE.ALL_STARS?BRICK_ROWS+2:BRICK_ROWS;
        for(let i=0;i<rC;i++){
            for(let j=0;j<BRICK_COLS;j++){
                const bX=oX+j*(bW+BRICK_SPACING)+bW/2;
                const bY=BRICK_OFFSET_TOP+i*(BRICK_HEIGHT+BRICK_SPACING)+BRICK_HEIGHT/2;
                let maxHits = 1; let isDurable = false; let initialColor = Phaser.Utils.Array.GetRandom(BRICK_COLORS);
                if (Phaser.Math.FloatBetween(0, 1) < DURABLE_BRICK_CHANCE) { maxHits = Phaser.Math.Between(2, MAX_DURABLE_HITS); isDurable = true; initialColor = DURABLE_BRICK_COLOR; }
                const brick = this.bricks.create(bX, bY, 'whitePixel').setDisplaySize(bW, BRICK_HEIGHT).setTint(initialColor);
                brick.setData({ originalTint: initialColor, isMarkedByBikara: false, maxHits: maxHits, currentHits: maxHits, isDurable: isDurable });
                brick.refreshBody();
            }
        }
        this.setColliders();
     }
    handleBrickHit(brick, damage = 1) { /* 省略 (変更なし) */ if (!brick || !brick.active || !brick.getData) return false; let currentHits = brick.getData('currentHits'); const maxHits = brick.getData('maxHits'); const originalTint = brick.getData('originalTint'); const isDurable = brick.getData('isDurable'); currentHits -= damage; brick.setData('currentHits', currentHits); if (currentHits <= 0) { this.handleBrickDestruction(brick); return true; } else if (isDurable) { const darknessFactor = (maxHits - currentHits) * DURABLE_BRICK_HIT_DARKEN; brick.setTint(Phaser.Display.Color.ValueToColor(DURABLE_BRICK_COLOR).darken(darknessFactor).color); return false; } else { return false; } }
    handleBrickDestruction(brick) { /* 省略 (変更なし) */ if (!brick || !brick.active) return false; const brickX = brick.x; const brickY = brick.y; brick.disableBody(true, true); this.score += 10; this.events.emit('updateScore',this.score); this.increaseVajraGauge(); if (Phaser.Math.FloatBetween(0, 1) < BAISRAVA_DROP_RATE) { this.dropSpecificPowerUp(brickX, brickY, POWERUP_TYPES.BAISRAVA); return true; } if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) { this.dropPowerUp(brickX, brickY); } return false; }
    hitBrick(brick, ball){ /* 省略 (変更なし) */ if(!brick||!ball||!brick.active||!ball.active||this.isStageClearing)return; const destroyed = this.handleBrickHit(brick, 1); if(destroyed && !this.isStageClearing && this.bricks.countActive(true) === 0){ this.stageClear(); } }
    handleBallBrickOverlap(ball, brick){ /* 省略 (変更なし) */ if(!ball||!brick||!ball.active||!brick.active||this.isStageClearing)return; const isBikara = ball.getData('isBikara'); const bikaraState = ball.getData('bikaraState'); if(isBikara){ if(bikaraState==='yin'){ this.markBrickByBikara(brick); return; } else if(bikaraState==='yang'){ this.handleBikaraYangDestroy(ball, brick); return; } } else { const destroyed = this.handleBrickHit(brick, brick.getData('maxHits')); if(destroyed && !this.isStageClearing && this.bricks.countActive(true) === 0){ this.stageClear(); } } }
    handleBikaraYangDestroy(ball, hitBrick){ /* 省略 (変更なし) */ if(!ball||!ball.active||!ball.getData('isBikara')||ball.getData('bikaraState')!=='yang') return; let dC=0; const mTD=[]; if(hitBrick.active){ mTD.push(hitBrick); hitBrick.setData('isMarkedByBikara',false); } this.bricks.getChildren().forEach(br=>{ if(br.active && br.getData('isMarkedByBikara') && !mTD.includes(br)){ mTD.push(br); br.setData('isMarkedByBikara',false); } }); mTD.forEach(br=>{ if(br.active){ this.handleBrickHit(br, br.getData('maxHits')); dC++; } }); let cYC=ball.getData('bikaraYangCount')||0; cYC++; ball.setData('bikaraYangCount',cYC); if(!this.isStageClearing&&this.bricks.countActive(true)===0){ this.stageClear(); } else if(cYC>=BIKARA_YANG_COUNT_MAX){ this.deactivateBikara([ball]); this.updateBallTint(ball); } }
    dropSpecificPowerUp(x, y, type) { /* 省略 (変更なし) */ if (!type || !POWERUP_COLORS[type]) return; const color = POWERUP_COLORS[type]; let powerUp = null; try { powerUp = this.powerUps.create(x, y, 'whitePixel'); if (powerUp) { powerUp.setDisplaySize(POWERUP_SIZE, POWERUP_SIZE).setTint(color).setData('type', type); if (powerUp.body) { powerUp.setVelocity(0, POWERUP_SPEED_Y); powerUp.body.setCollideWorldBounds(false); powerUp.body.setAllowGravity(false); } else { console.error(`No physics body for powerup type: ${type}!`); powerUp.destroy(); powerUp = null; } } else { console.error(`Failed to create powerup object for type: ${type}!`); } } catch (error) { console.error(`CRITICAL ERROR in dropSpecificPowerUp (${type}):`, error); if (powerUp && powerUp.active) { powerUp.destroy(); } } }
    dropPowerUp(x,y){ /* 省略 (変更なし) */ let aT = []; if (this.currentMode === GAME_MODE.NORMAL) { aT = this.stageDropPool; } else { aT = ALLSTARS_MODE_POWERUP_POOL; } if (aT.length === 0) return; const type = Phaser.Utils.Array.GetRandom(aT); this.dropSpecificPowerUp(x, y, type); }
    hitPaddle(paddle,ball){ /* 省略 (変更なし) */ if(!paddle||!ball||!ball.active||!ball.body)return; let diff=ball.x-paddle.x; const mD=paddle.displayWidth/2; let inf=diff/mD; inf=Phaser.Math.Clamp(inf,-1,1); const maxVx=NORMAL_BALL_SPEED*0.8; let nVx=maxVx*inf; const minVy=NORMAL_BALL_SPEED*0.5; let cVy=ball.body.velocity.y; let nVy=-Math.abs(cVy); if(Math.abs(nVy)<minVy) nVy=-minVy; let sM=1.0; if(ball.getData('isFast')) sM=BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if(ball.getData('isSlow')) sM=BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA]; const tS=NORMAL_BALL_SPEED*sM; const nV=new Phaser.Math.Vector2(nVx,nVy).normalize().scale(tS); ball.setVelocity(nV.x,nV.y); if(ball.getData('isBikara')) this.switchBikaraState(ball); if(ball.getData('isIndaraActive')){ this.deactivateIndaraForBall(ball); this.updateBallTint(ball); } }
    collectPowerUp(paddle,powerUp){ /* 省略 (変更なし) */ if(!powerUp||!powerUp.active||this.isStageClearing)return; const type = powerUp.getData('type'); if(!type){ powerUp.destroy(); return; } powerUp.destroy(); if(type===POWERUP_TYPES.BAISRAVA){ this.activateBaisrava(); return; } if(type===POWERUP_TYPES.VAJRA){ this.activateVajra(); return; } if(type===POWERUP_TYPES.MAKIRA){ this.activateMakira(); return; } if(type===POWERUP_TYPES.MAKORA){ this.activateMakora(); return; } if(type===POWERUP_TYPES.ANCHIRA||type===POWERUP_TYPES.SINDARA){ if(this.balls.countActive(true)>1){ this.keepFurthestBall(); } } this.activatePower(type); }
    activateMakora() { /* 省略 (変更なし) */ const cPT = Phaser.Utils.Array.GetRandom(MAKORA_COPYABLE_POWERS); console.log(`Makora copy: ${cPT}`); switch(cPT) { case POWERUP_TYPES.KUBIRA: case POWERUP_TYPES.SHATORA: case POWERUP_TYPES.HAILA: case POWERUP_TYPES.BIKARA: case POWERUP_TYPES.INDARA: case POWERUP_TYPES.ANILA: this.activatePower(cPT); break; case POWERUP_TYPES.ANCHIRA: case POWERUP_TYPES.SINDARA: if(this.balls.countActive(true)>1){ this.keepFurthestBall(); } this.activatePower(cPT); break; case POWERUP_TYPES.VAJRA: this.activateVajra(); break; case POWERUP_TYPES.MAKIRA: this.activateMakira(); break; } }
    keepFurthestBall(){ /* 省略 (変更なし) */ const aB = this.balls.getMatching('active',true); if(aB.length<=1) return; let fB = null; let mDSq = -1; const pP = new Phaser.Math.Vector2(this.paddle.x, this.paddle.y); aB.forEach(b=>{ const dSq = Phaser.Math.Distance.Squared(pP.x, pP.y, b.x, b.y); if(dSq > mDSq){ mDSq = dSq; fB = b; } }); aB.forEach(b=>{ if(b !== fB){ b.destroy(); } }); }
    activatePower(type){ /* 省略 (変更なし) */ const tB = this.balls.getMatching('active',true); if(tB.length===0) return; if(POWERUP_DURATION[type]){ if(this.powerUpTimers[type]){ this.powerUpTimers[type].remove(); } } switch(type){ case POWERUP_TYPES.KUBIRA: this.activateKubira(tB); break; case POWERUP_TYPES.SHATORA: this.activateShatora(tB); break; case POWERUP_TYPES.HAILA: this.activateHaira(tB); break; case POWERUP_TYPES.ANCHIRA: if (tB.length === 1) this.activateAnchira(tB[0]); break; case POWERUP_TYPES.SINDARA: if (tB.length === 1) this.activateSindara(tB[0]); break; case POWERUP_TYPES.BIKARA: this.activateBikara(tB); break; case POWERUP_TYPES.INDARA: this.activateIndara(tB); break; case POWERUP_TYPES.ANILA: this.activateAnila(tB); break; } tB.forEach(b=>{ if(b.active){ b.getData('activePowers').add(type); b.setData('lastActivatedPower',type); this.updateBallTint(b); } }); const duration = POWERUP_DURATION[type]; if(duration){ this.powerUpTimers[type]=this.time.delayedCall( duration, ()=>{ this.deactivatePowerByType(type); this.powerUpTimers[type]=null; }, [], this ); } }
    deactivatePowerByType(type){ /* 省略 (変更なし) */ const tB = this.balls.getMatching('active',true); if(tB.length===0 || type===POWERUP_TYPES.MAKIRA || type===POWERUP_TYPES.VAJRA || type === POWERUP_TYPES.MAKORA) return; switch(type){ case POWERUP_TYPES.KUBIRA: this.deactivateKubira(tB); break; case POWERUP_TYPES.SHATORA: this.deactivateShatora(tB); break; case POWERUP_TYPES.HAILA: this.deactivateHaira(tB); break; } tB.forEach(b=>{ if(b.active){ b.getData('activePowers').delete(type); this.updateBallTint(b); } }); }
    updateBallTint(ball){ /* 省略 (変更なし) */ if(!ball||!ball.active)return; const aP = ball.getData('activePowers'); let tC = DEFAULT_BALL_COLOR; if(aP && aP.size > 0){ const lP = ball.getData('lastActivatedPower'); if(lP && aP.has(lP)){ if(lP === POWERUP_TYPES.BIKARA) { tC = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin; } else if(lP === POWERUP_TYPES.SINDARA) { if(ball.getData('isMerging')) tC = SINDARA_MERGE_COLOR; else if(ball.getData('isAttracting')) tC = SINDARA_ATTRACT_COLOR; else tC = POWERUP_COLORS[lP]; } else { tC = POWERUP_COLORS[lP] || DEFAULT_BALL_COLOR; } } else { const rP = Array.from(aP); if(rP.length > 0) { const nLP = rP[rP.length-1]; if(nLP === POWERUP_TYPES.BIKARA) { tC = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin; } else if(nLP === POWERUP_TYPES.SINDARA) { if(ball.getData('isMerging')) tC = SINDARA_MERGE_COLOR; else if(ball.getData('isAttracting')) tC = SINDARA_ATTRACT_COLOR; else tC = POWERUP_COLORS[nLP]; } else { tC = POWERUP_COLORS[nLP] || DEFAULT_BALL_COLOR; } ball.setData('lastActivatedPower', nLP); } } } ball.setTint(tC); }
    activateKubira(balls){ /* 省略 (変更なし) */ balls.forEach(b=>b.setData('isPenetrating',true)); } deactivateKubira(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ if(!b.getData('isSindara')||(!b.getData('isAttracting')&&!b.getData('isMerging'))) { b.setData('isPenetrating',false); } }); } applySpeedModifier(ball,type){ /* 省略 (変更なし) */ if(!ball||!ball.active||!ball.body)return; const m = BALL_SPEED_MODIFIERS[type]; if(!m)return; const cV = ball.body.velocity; const dir = cV.length()>0 ? cV.clone().normalize() : new Phaser.Math.Vector2(0,-1); const nS = NORMAL_BALL_SPEED * m; ball.setVelocity(dir.x * nS, dir.y * nS); } resetBallSpeed(ball){ /* 省略 (変更なし) */ if(!ball||!ball.active||!ball.body)return; if(ball.getData('isFast')) { this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); } else if(ball.getData('isSlow')) { this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); } else { const cV = ball.body.velocity; const dir = cV.length()>0 ? cV.clone().normalize() : new Phaser.Math.Vector2(0,-1); ball.setVelocity(dir.x * NORMAL_BALL_SPEED, dir.y * NORMAL_BALL_SPEED); } } activateShatora(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ b.setData({isFast:true,isSlow:false}); this.applySpeedModifier(b,POWERUP_TYPES.SHATORA); }); } deactivateShatora(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ if(b.getData('isFast')){ b.setData('isFast',false); this.resetBallSpeed(b); } }); } activateHaira(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ b.setData({isSlow:true,isFast:false}); this.applySpeedModifier(b,POWERUP_TYPES.HAILA); }); } deactivateHaira(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ if(b.getData('isSlow')){ b.setData('isSlow',false); this.resetBallSpeed(b); } }); } activateAnchira(sB){ /* 省略 (変更なし) */ if(!sB||!sB.active) return; sB.setData('isAnchira',true); const x=sB.x, y=sB.y; const nS=3; const bD = sB.data.getAll(); for(let i=0;i<nS;i++){ const oX=Phaser.Math.Between(-5,5); const oY=Phaser.Math.Between(-5,5); const vx=Phaser.Math.Between(-150,150); const vy=-Math.abs(Phaser.Math.Between(NORMAL_BALL_SPEED*0.5, NORMAL_BALL_SPEED*0.8)); const nB = this.createAndAddBall(x+oX, y+oY, vx, vy, bD); if(nB) nB.setData('isAnchira', true); } } deactivateAnchira(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ if(b.getData('isAnchira')){ b.setData('isAnchira',false); b.getData('activePowers').delete(POWERUP_TYPES.ANCHIRA); } }); } activateSindara(sB){ /* 省略 (変更なし) */ if(!sB||!sB.active) { sB?.getData('activePowers').delete(POWERUP_TYPES.SINDARA); this.updateBallTint(sB); return; } const x=sB.x, y=sB.y; const bD = sB.data.getAll(); const vx=Phaser.Math.Between(-150,150); const vy=-Math.abs(Phaser.Math.Between(NORMAL_BALL_SPEED*0.5, NORMAL_BALL_SPEED*0.8)); const pB = this.createAndAddBall(x+Phaser.Math.Between(-5,5), y+Phaser.Math.Between(-5,5), vx, vy, bD); if(pB){ sB.setData({ isSindara:true, sindaraPartner:pB, isAttracting:false, isMerging:false }); pB.setData({ isSindara:true, sindaraPartner:sB, isAttracting:false, isMerging:false }); if(this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=this.time.delayedCall( SINDARA_ATTRACTION_DELAY, ()=>{ this.startSindaraAttraction(sB,pB); }, [], this ); } else { sB.getData('activePowers').delete(POWERUP_TYPES.SINDARA); this.updateBallTint(sB); } } startSindaraAttraction(b1,b2){ /* 省略 (変更なし) */ this.sindaraAttractionTimer=null; if(!b1||!b2||!b1.active||!b2.active||!b1.getData('isSindara')||!b2.getData('isSindara')){ const aSB=this.balls.getMatching('isSindara',true); if(aSB.length>0){ this.deactivateSindara(aSB); aSB.forEach(b=>this.updateBallTint(b)); } return; } b1.setData({isAttracting:true, isPenetrating:true}); b2.setData({isAttracting:true, isPenetrating:true}); this.updateBallTint(b1); this.updateBallTint(b2); } updateSindaraAttraction(ball){ /* 省略 (変更なし) */ const p = ball.getData('sindaraPartner'); if(p && p.active && ball.active && ball.getData('isAttracting') && p.getData('isAttracting') && !ball.getData('isMerging') && !p.getData('isMerging')) { this.physics.moveToObject(ball, p, SINDARA_ATTRACTION_FORCE); } } handleBallCollision(b1,b2){ /* 省略 (変更なし) */ if(b1.active && b2.active && b1.getData('sindaraPartner') === b2){ this.mergeSindaraBalls(b1,b2); } } mergeSindaraBalls(bTK,bTR){ /* 省略 (変更なし) */ const mX = (bTK.x + bTR.x)/2; const mY = (bTK.y + bTR.y)/2; bTK.setPosition(mX, mY); bTR.destroy(); bTK.setData({ isMerging:true, isAttracting:false, isPenetrating:true, sindaraPartner:null }); this.updateBallTint(bTK); if(this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraMergeTimer=this.time.delayedCall( SINDARA_MERGE_DURATION, ()=>{ this.finishSindaraMerge(bTK); }, [], this ); if(this.sindaraAttractionTimer){ this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; } } finishSindaraMerge(mB){ /* 省略 (変更なし) */ this.sindaraMergeTimer=null; if(!mB||!mB.active) return; mB.setData({ isMerging:false }); this.updateBallTint(mB); if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = this.time.delayedCall( SINDARA_POST_MERGE_PENETRATION_DURATION, () => { this.deactivateSindaraPenetration(mB); }, [], this ); } deactivateSindaraPenetration(ball) { /* 省略 (変更なし) */ this.sindaraPenetrationTimer = null; if (!ball || !ball.active) return; if (!ball.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) { ball.setData('isPenetrating', false); } if (ball.getData('isSindara')) { ball.setData('isSindara', false); ball.getData('activePowers').delete(POWERUP_TYPES.SINDARA); this.resetBallSpeed(ball); this.updateBallTint(ball); } } deactivateSindara(balls){ /* 省略 (変更なし) */ if(this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; balls.forEach(b=>{ if(b.active && b.getData('isSindara')){ b.setData({ isSindara:false, sindaraPartner:null, isAttracting:false, isMerging:false }); if(!b.getData('activePowers').has(POWERUP_TYPES.KUBIRA)){ b.setData('isPenetrating',false); } b.getData('activePowers').delete(POWERUP_TYPES.SINDARA); } }); } activateBikara(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ b.setData({ isBikara:true, bikaraState:'yin', bikaraYangCount:0 }); this.updateBallTint(b); }); } deactivateBikara(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ if(b.getData('isBikara')){ b.setData({ isBikara:false, bikaraState:null, bikaraYangCount:0 }); b.getData('activePowers').delete(POWERUP_TYPES.BIKARA); } }); this.bricks.getChildren().forEach(br=>{ if(br.getData('isMarkedByBikara')){ br.setData('isMarkedByBikara',false); br.setTint(br.getData('originalTint')||0xffffff); } }); } switchBikaraState(ball){ /* 省略 (変更なし) */ if(!ball||!ball.active||!ball.getData('isBikara')) return; const cS = ball.getData('bikaraState'); const nS = (cS==='yin')?'yang':'yin'; ball.setData('bikaraState',nS); this.updateBallTint(ball); } markBrickByBikara(brick){ /* 省略 (変更なし) */ if(!brick||!brick.active||brick.getData('isMarkedByBikara')) return; brick.setData('isMarkedByBikara',true); brick.setTint(BRICK_MARKED_COLOR); } activateIndara(balls){ /* 省略 (変更なし) */ balls.forEach(b=>b.setData({ isIndaraActive:true, indaraHomingCount:INDARA_MAX_HOMING_COUNT })); } deactivateIndaraForBall(ball){ /* 省略 (変更なし) */ if(!ball||!ball.active||!ball.getData('isIndaraActive')) return; ball.setData({ isIndaraActive:false, indaraHomingCount:0 }); ball.getData('activePowers').delete(POWERUP_TYPES.INDARA); }
    handleWorldBounds(body,up,down,left,right){ /* 省略 (変更なし) */ const ball=body.gameObject; if(!ball||!(ball instanceof Phaser.Physics.Arcade.Image)||!this.balls.contains(ball)||!ball.active) return; if(ball.getData('isIndaraActive') && ball.getData('indaraHomingCount')>0 && (up||left||right)) { const cHC=ball.getData('indaraHomingCount'); const aB = this.bricks.getMatching('active',true); if(aB.length > 0){ let cB = null; let mDSq = Infinity; const bC = ball.body.center; aB.forEach(br=>{ const dSq = Phaser.Math.Distance.Squared( bC.x, bC.y, br.body.center.x, br.body.center.y ); if(dSq < mDSq){ mDSq = dSq; cB = br; } }); if(cB){ const cS = ball.body.velocity.length(); const angle = Phaser.Math.Angle.BetweenPoints(bC, cB.body.center); this.physics.velocityFromAngle(angle, cS, ball.body.velocity); const nHC = cHC - 1; ball.setData('indaraHomingCount',nHC); if(nHC <= 0){ this.deactivateIndaraForBall(ball); this.updateBallTint(ball); } } } } } activateAnila(balls){ /* 省略 (変更なし) */ balls.forEach(b=>{ if(!b.getData('isAnilaActive')){ b.setData('isAnilaActive',true); } }); } deactivateAnilaForBall(ball){ /* 省略 (変更なし) */ if(!ball||!ball.active||!ball.getData('isAnilaActive'))return; ball.setData('isAnilaActive',false); ball.getData('activePowers').delete(POWERUP_TYPES.ANILA); } triggerAnilaBounce(ball){ /* 省略 (変更なし) */ if(!ball||!ball.active||!ball.getData('isAnilaActive')) return; const cVy = ball.body.velocity.y; const bVy = -Math.abs(cVy > -10 ? BALL_INITIAL_VELOCITY_Y * 0.7 : cVy * 0.8); ball.setVelocityY(bVy); ball.y = this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT; this.deactivateAnilaForBall(ball); this.updateBallTint(ball); } activateBaisrava(){ /* 省略 (変更なし) */ if(this.isStageClearing||this.isGameOver) return; const aB = this.bricks.getMatching('active',true); let dC = 0; aB.forEach(b=>{ this.handleBrickHit(b, b.getData('maxHits')); dC++; }); if(dC>0){ console.log(`Baisrava destroyed ${dC}.`); } this.stageClear(); }
    activateVajra(){ /* 省略 (変更なし) */ if(!this.isVajraSystemActive){ this.isVajraSystemActive=true; this.vajraGauge=0; this.events.emit('activateVajraUI',this.vajraGauge,VAJRA_GAUGE_MAX); } }
    increaseVajraGauge(){ /* 省略 (変更なし) */ if(this.isVajraSystemActive && !this.isStageClearing && !this.isGameOver){ this.vajraGauge+=VAJRA_GAUGE_INCREMENT; this.vajraGauge=Math.min(this.vajraGauge,VAJRA_GAUGE_MAX); this.events.emit('updateVajraGauge',this.vajraGauge); if(this.vajraGauge>=VAJRA_GAUGE_MAX){ this.triggerVajraDestroy(); } } }
    triggerVajraDestroy(){ /* 省略 (変更なし) */ if(this.isStageClearing||this.isGameOver) return; if (!this.isVajraSystemActive) return; this.isVajraSystemActive = false; const activeBricks = this.bricks.getMatching('active',true); if(activeBricks.length===0){ this.deactivateVajra(); return; } const countToDestroy = Math.min(activeBricks.length,VAJRA_DESTROY_COUNT); const shuffledBricks = Phaser.Utils.Array.Shuffle(activeBricks); let destroyedCount=0; for(let i=0; i<countToDestroy; i++){ const brick = shuffledBricks[i]; if(brick&&brick.active){ this.handleBrickHit(brick, brick.getData('maxHits')); destroyedCount++; } } const finalActiveCount = this.bricks.countActive(true); if(!this.isStageClearing && finalActiveCount === 0){ this.stageClear(); } else { this.deactivateVajra(); } }
    deactivateVajra() { /* 省略 (変更なし) */ this.isVajraSystemActive = false; this.vajraGauge = 0; this.events.emit('deactivateVajraUI'); }
    activateMakira() { /* 省略 (変更なし) */ if (!this.isMakiraActive) { this.isMakiraActive = true; if (this.familiars) this.familiars.clear(true, true); else this.familiars = this.physics.add.group(); this.createFamiliars(); if (this.makiraBeams) this.makiraBeams.clear(true, true); else this.makiraBeams = this.physics.add.group(); if (this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer = this.time.addEvent({ delay: MAKIRA_ATTACK_INTERVAL, callback: this.fireMakiraBeam, callbackScope: this, loop: true }); } const duration = POWERUP_DURATION[POWERUP_TYPES.MAKIRA]; if (this.powerUpTimers[POWERUP_TYPES.MAKIRA]) this.powerUpTimers[POWERUP_TYPES.MAKIRA].remove(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = this.time.delayedCall( duration, () => { this.deactivateMakira(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = null; }, [], this ); this.setColliders(); }
    deactivateMakira() { /* 省略 (変更なし) */ if (this.isMakiraActive) { this.isMakiraActive = false; if (this.makiraAttackTimer) { this.makiraAttackTimer.remove(); this.makiraAttackTimer = null; } if (this.powerUpTimers[POWERUP_TYPES.MAKIRA]) { this.powerUpTimers[POWERUP_TYPES.MAKIRA].remove(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = null; } if (this.familiars) { this.familiars.clear(true, true); } if (this.makiraBeams) { this.makiraBeams.clear(true, true); } } }
    createFamiliars() { /* 省略 (変更なし) */ if(!this.paddle) return; const pX=this.paddle.x; const fY=this.paddle.y-PADDLE_HEIGHT/2-MAKIRA_FAMILIAR_SIZE; const fL=this.familiars.create(pX-MAKIRA_FAMILIAR_OFFSET, fY, null).setDisplaySize(MAKIRA_FAMILIAR_SIZE*2, MAKIRA_FAMILIAR_SIZE*2).setTint(MAKIRA_FAMILIAR_COLOR); if(fL.body){ fL.body.setAllowGravity(false).setImmovable(true); } const fR=this.familiars.create(pX+MAKIRA_FAMILIAR_OFFSET, fY, null).setDisplaySize(MAKIRA_FAMILIAR_SIZE*2, MAKIRA_FAMILIAR_SIZE*2).setTint(MAKIRA_FAMILIAR_COLOR); if(fR.body){ fR.body.setAllowGravity(false).setImmovable(true); } }
    fireMakiraBeam() { /* 省略 (変更なし) */ if (!this.isMakiraActive || !this.familiars || this.familiars.countActive(true) === 0 || this.isStageClearing || this.isGameOver) return; this.familiars.getChildren().forEach(f => { if (f.active) { const beam = this.makiraBeams.create(f.x, f.y - MAKIRA_FAMILIAR_SIZE, null).setDisplaySize(MAKIRA_BEAM_WIDTH, MAKIRA_BEAM_HEIGHT).setTint(MAKIRA_BEAM_COLOR); if (beam && beam.body) { beam.setVelocity(0, -MAKIRA_BEAM_SPEED); beam.body.setAllowGravity(false); } else { if (beam) beam.destroy(); } } }); }
    hitBrickWithMakiraBeam(beam, brick) { /* 省略 (変更なし) */ if (!beam || !brick || !beam.active || !brick.active || this.isStageClearing || this.isGameOver) return; try { beam.destroy(); const destroyed = this.handleBrickHit(brick, 1); if(destroyed && !this.isStageClearing && this.bricks.countActive(true) === 0){ this.time.delayedCall(10, this.stageClear, [], this); } } catch(error) { if (beam && beam.active) { beam.setActive(false).setVisible(false); if(beam.body) beam.body.enable = false; } } }
    loseLife() { /* 省略 (変更なし) */ if(this.isStageClearing||this.isGameOver||this.lives<=0)return; this.deactivateMakira(); this.deactivateVajra(); this.lives--; this.events.emit('updateLives',this.lives); this.isBallLaunched=false; Object.keys(this.powerUpTimers).forEach(k=>{ if(this.powerUpTimers[k]){ this.powerUpTimers[k].remove(); this.powerUpTimers[k]=null; } }); if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; const aB = this.balls.getMatching('active', true); if(aB.length > 0) { this.deactivateAnchira(aB); this.deactivateSindara(aB); this.deactivateBikara(aB); aB.forEach(b => { this.deactivateIndaraForBall(b); this.deactivateAnilaForBall(b); b.setData({isPenetrating: false, isFast: false, isSlow: false}); b.setData('activePowers', new Set()); b.setData('lastActivatedPower', null); this.resetBallSpeed(b); this.updateBallTint(b); }); } if(this.lives>0){ this.time.delayedCall(500,this.resetForNewLife,[],this); } else { this.time.delayedCall(500,this.gameOver,[],this); } }
    resetForNewLife() { /* 省略 (変更なし) */ if(this.isGameOver||this.isStageClearing) return; if(this.balls){ this.balls.clear(true,true); } if(this.paddle){ this.paddle.x=this.scale.width/2; this.paddle.y=this.scale.height-PADDLE_Y_OFFSET; this.updatePaddleSize(); } let nB = null; if(this.paddle){ nB=this.createAndAddBall(this.paddle.x,this.paddle.y-PADDLE_HEIGHT/2-BALL_RADIUS); } else { nB=this.createAndAddBall(this.scale.width/2,this.scale.height-PADDLE_Y_OFFSET-PADDLE_HEIGHT/2-BALL_RADIUS); } this.isBallLaunched=false; this.setColliders(); }
    gameOver() { /* 省略 (変更なし) */ if(this.isGameOver) return; this.isGameOver=true; this.deactivateMakira(); this.deactivateVajra(); if(this.gameOverText)this.gameOverText.setVisible(true); this.physics.pause(); if(this.balls){ this.balls.getChildren().forEach(b=>{ if(b.active){ b.setVelocity(0,0); if(b.body)b.body.enable=false; } }); } Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove();}); this.powerUpTimers={}; if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove();this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove();this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; if(this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer=null; }
    stageClear() { /* 省略 (変更なし) */ if(this.isStageClearing||this.isGameOver) return; this.isStageClearing=true; this.deactivateMakira(); this.deactivateVajra(); try{ this.physics.pause(); Object.keys(this.powerUpTimers).forEach(k=>{ if(this.powerUpTimers[k]){ this.powerUpTimers[k].remove(); this.powerUpTimers[k]=null; } }); if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; const aB = this.balls.getMatching('active', true); if(aB.length > 0) { this.deactivateAnchira(aB); this.deactivateSindara(aB); this.deactivateBikara(aB); aB.forEach(b => { this.deactivateIndaraForBall(b); this.deactivateAnilaForBall(b); b.setData({isPenetrating: false, isFast: false, isSlow: false}); b.setData('activePowers', new Set()); b.setData('lastActivatedPower', null); }); } if(this.balls){ this.balls.getChildren().forEach(b=>{ if(b.active){ b.setVelocity(0,0).setVisible(false).setActive(false); if(b.body)b.body.enable=false; } }); } if(this.bricks){ this.bricks.getChildren().forEach(br=>{ if(br.getData('isMarkedByBikara'))br.setData('isMarkedByBikara',false); }); } if(this.powerUps){ this.powerUps.clear(true,true); } this.currentStage++; const mS=this.currentMode===GAME_MODE.ALL_STARS?10:12; if(this.currentStage>mS){ this.gameComplete(); } else { this.events.emit('updateStage',this.currentStage); this.time.delayedCall(1000,()=>{ if(!this.scene||!this.scene.isActive()||this.isGameOver) return; try{ this.setupStage(); this.isStageClearing=false; this.resetForNewLife(); this.physics.resume(); }catch(e){ this.isStageClearing=false; this.gameOver(); } },[],this); } }catch(e){ this.isStageClearing=false; this.gameOver(); } }
    gameComplete() { /* 省略 (変更なし) */ alert(`Clear! Score: ${this.score}`); this.returnToTitle(); }
    returnToTitle() { /* 省略 (変更なし) */ if(this.physics.world&&!this.physics.world.running) this.physics.resume(); if(this.scene.isActive('UIScene')){ this.scene.stop('UIScene'); } this.time.delayedCall(10,()=>{ if(this.scene&&this.scene.isActive()){ this.scene.start('TitleScene'); } }); }
    shutdown() { /* 省略 (変更なし) */ if(this.scale) this.scale.off('resize', this.handleResize, this); this.isGameOver=false; this.isStageClearing=false; this.deactivateMakira(); this.deactivateVajra(); Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove(false);}); this.powerUpTimers={}; if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(false); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(false); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(false); this.sindaraPenetrationTimer=null; if(this.makiraAttackTimer) this.makiraAttackTimer.remove(false); this.makiraAttackTimer=null; if(this.time) this.time.removeAllEvents(); if(this.input) this.input.removeAllListeners(); if(this.physics.world) this.physics.world.off('worldbounds',this.handleWorldBounds,this); this.events.removeAllListeners(); if(this.balls)this.balls.destroy(true);this.balls=null; if(this.bricks)this.bricks.destroy(true);this.bricks=null; if(this.powerUps)this.powerUps.destroy(true);this.powerUps=null; if(this.paddle)this.paddle.destroy();this.paddle=null; if(this.familiars)this.familiars.destroy(true);this.familiars=null; if(this.makiraBeams)this.makiraBeams.destroy(true);this.makiraBeams=null; this.ballPaddleCollider=null; this.ballBrickCollider=null; this.ballBrickOverlap=null; this.ballBallCollider=null; this.makiraBeamBrickOverlap = null; }
}


// --- UIScene ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText=null; this.scoreText=null; this.stageText=null; this.vajraGaugeText = null; this.dropPoolIconsGroup = null; this.gameSceneListenerAttached = false; }
    create() { /* 省略 (変更なし) */
        this.gameWidth=this.scale.width; this.gameHeight = this.scale.height;
        const textStyle={fontSize:'24px',fill:'#fff'};
        this.livesText=this.add.text(16,16,'ライフ:',textStyle);
        this.stageText=this.add.text(this.gameWidth/2,16,'ステージ:',textStyle).setOrigin(0.5,0);
        this.scoreText=this.add.text(this.gameWidth-16,16,'スコア:',textStyle).setOrigin(1,0);
        this.vajraGaugeText = this.add.text(16, this.gameHeight - UI_BOTTOM_OFFSET, '奥義: -/-', { fontSize: '20px', fill: '#fff' })
                                     .setOrigin(0, 1)
                                     .setVisible(false);
        this.dropPoolIconsGroup = this.add.group();
        this.updateDropPoolDisplay([]);

        this.gameScene = this.scene.get('GameScene');
        if (this.gameScene) { this.gameScene.events.on('gameResize', this.onGameResize, this); }
        try{ const gS=this.scene.get('GameScene'); if(gS && gS.scene.settings.status === Phaser.Scenes.RUNNING){ this.registerGameEventListeners(gS); } else { this.scene.get('GameScene').events.once('create', this.registerGameEventListeners, this); } }catch(e){}
        this.events.on('shutdown',()=>{ this.unregisterGameEventListeners(); if (this.gameScene && this.gameScene.events) { this.gameScene.events.off('gameResize', this.onGameResize, this); } });
     }
    onGameResize() { /* 省略 (変更なし) */ this.gameWidth = this.scale.width; this.gameHeight = this.scale.height; this.livesText?.setPosition(16, 16); this.stageText?.setPosition(this.gameWidth / 2, 16); this.scoreText?.setPosition(this.gameWidth - 16, 16); this.vajraGaugeText?.setPosition(16, this.gameHeight - UI_BOTTOM_OFFSET); this.updateDropPoolPosition(); }
    registerGameEventListeners(gS) { /* 省略 (変更なし) */ if(!gS||!gS.events || this.gameSceneListenerAttached) return; this.unregisterGameEventListeners(gS); gS.events.on('updateLives',this.updateLivesDisplay,this); gS.events.on('updateScore',this.updateScoreDisplay,this); gS.events.on('updateStage',this.updateStageDisplay,this); gS.events.on('activateVajraUI',this.activateVajraUIDisplay,this); gS.events.on('updateVajraGauge',this.updateVajraGaugeDisplay,this); gS.events.on('deactivateVajraUI', this.deactivateVajraUIDisplay, this); gS.events.on('updateDropPoolUI', this.updateDropPoolDisplay, this); this.gameSceneListenerAttached = true; try{ this.updateLivesDisplay(gS.lives); this.updateScoreDisplay(gS.score); this.updateStageDisplay(gS.currentStage); if(gS.isVajraSystemActive) this.activateVajraUIDisplay(gS.vajraGauge, VAJRA_GAUGE_MAX); else this.deactivateVajraUIDisplay(); this.updateDropPoolDisplay(gS.stageDropPool); }catch(e){} }
    unregisterGameEventListeners(gS = null) { /* 省略 (変更なし) */ const gs = gS || (this.scene.manager ? this.scene.manager.getScene('GameScene') : null); if (gs && gs.events) { gs.events.off('updateLives',this.updateLivesDisplay,this); gs.events.off('updateScore',this.updateScoreDisplay,this); gs.events.off('updateStage',this.updateStageDisplay,this); gs.events.off('activateVajraUI',this.activateVajraUIDisplay,this); gs.events.off('updateVajraGauge',this.updateVajraGaugeDisplay,this); gs.events.off('deactivateVajraUI', this.deactivateVajraUIDisplay, this); gs.events.off('create', this.registerGameEventListeners, this); gs.events.off('updateDropPoolUI', this.updateDropPoolDisplay, this); } this.gameSceneListenerAttached = false; }
    updateLivesDisplay(l){/*省略*/} updateScoreDisplay(s){/*省略*/} updateStageDisplay(st){/*省略*/}
    activateVajraUIDisplay(iV,mV){ /* 省略 (変更なし) */ if(this.vajraGaugeText){ this.vajraGaugeText.setText(`奥義: ${iV}/${mV}`).setVisible(true); this.updateDropPoolPosition(); } }
    updateVajraGaugeDisplay(cV){ /* 省略 (変更なし) */ if(this.vajraGaugeText&&this.vajraGaugeText.visible){ this.vajraGaugeText.setText(`奥義: ${cV}/${VAJRA_GAUGE_MAX}`); this.updateDropPoolPosition(); } }
    deactivateVajraUIDisplay(){ /* 省略 (変更なし) */ if(this.vajraGaugeText){ this.vajraGaugeText.setVisible(false); this.updateDropPoolPosition(); } }
    updateDropPoolDisplay(dropPoolTypes) { /* 省略 (変更なし) */ if (!this.dropPoolIconsGroup) return; this.dropPoolIconsGroup.clear(true, true); if (!dropPoolTypes || dropPoolTypes.length === 0) { this.updateDropPoolPosition(); return; } dropPoolTypes.forEach((type, index) => { const color = POWERUP_COLORS[type] || 0x888888; const icon = this.add.image(0, 0, 'whitePixel').setDisplaySize(DROP_POOL_UI_ICON_SIZE, DROP_POOL_UI_ICON_SIZE).setTint(color).setOrigin(0, 0.5); this.dropPoolIconsGroup.add(icon); }); this.updateDropPoolPosition(); }
    updateDropPoolPosition() { /* 省略 (変更なし) */ if (!this.dropPoolIconsGroup) return; const startX = this.vajraGaugeText.visible ? this.vajraGaugeText.x + this.vajraGaugeText.width + 15 : 16; const startY = this.gameHeight - UI_BOTTOM_OFFSET; let currentX = startX; this.dropPoolIconsGroup.getChildren().forEach(icon => { icon.x = currentX; icon.y = startY; currentX += DROP_POOL_UI_ICON_SIZE + DROP_POOL_UI_SPACING; }); }
}

// --- Phaserゲーム設定 ---
const config = { /* 省略 (変更なし) */
    type: Phaser.AUTO,
    scale: { mode: Phaser.Scale.FIT, parent: 'phaser-game-container', autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
    physics: { default: 'arcade', arcade: { debug: false, gravity: { y: 0 } } },
    scene: [BootScene, TitleScene, GameScene, UIScene],
    input: { activePointers: 3, },
    render: { pixelArt: false, antialias: true, }
 };

// --- ゲーム開始 ---
window.onload = () => { const game = new Phaser.Game(config); };