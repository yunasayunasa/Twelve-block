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

const POWERUP_DROP_RATE = 0.7;
const BAISRAVA_DROP_RATE = 0.02;
const POWERUP_SIZE = 20;
const POWERUP_SPEED_Y = 100;
const POWERUP_TYPES = {
    KUBIRA: 'kubira', SHATORA: 'shatora', HAILA: 'haila', ANCHIRA: 'anchira', SINDARA: 'sindara',
    BIKARA: 'bikara', INDARA: 'indara', ANILA: 'anila', BAISRAVA: 'baisrava', VAJRA: 'vajra',
    MAKIRA: 'makira', MAKORA: 'makora'
};
const POWERUP_COLORS = {
    [POWERUP_TYPES.KUBIRA]: 0x800080, [POWERUP_TYPES.SHATORA]: 0xffa500, [POWERUP_TYPES.HAILA]: 0xadd8e6,
    [POWERUP_TYPES.ANCHIRA]: 0xffc0cb, [POWERUP_TYPES.SINDARA]: 0xd2b48c, [POWERUP_TYPES.BIKARA]: 0xffffff,
    [POWERUP_TYPES.INDARA]: 0x4682b4, [POWERUP_TYPES.ANILA]: 0xffefd5, [POWERUP_TYPES.BAISRAVA]: 0xffd700,
    [POWERUP_TYPES.VAJRA]: 0xffff00, [POWERUP_TYPES.MAKIRA]: 0x008080,
    [POWERUP_TYPES.MAKORA]: 0xffffff,
};
const MAKORA_COPYABLE_POWERS = [
    POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA,
    POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA,
    POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA
];

const BIKARA_COLORS = { yin: 0x444444, yang: 0xfffafa };
const POWERUP_DURATION = {
    [POWERUP_TYPES.KUBIRA]: 10000, [POWERUP_TYPES.SHATORA]: 3000, [POWERUP_TYPES.HAILA]: 10000,
    [POWERUP_TYPES.MAKIRA]: 6667
};
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

// --- BootScene ---
class BootScene extends Phaser.Scene { constructor(){super('BootScene');} preload(){console.log("B:Load");} create(){console.log("B:Create");this.scene.start('TitleScene');} }

// --- TitleScene ---
class TitleScene extends Phaser.Scene { constructor(){super('TitleScene');} create(){const w=this.scale.width,h=this.scale.height;this.cameras.main.setBackgroundColor('#222');this.add.text(w/2,h*0.2,'十二神将',{fontSize:'40px',fill:'#fff',fontStyle:'bold'}).setOrigin(0.5);this.add.text(w/2,h*0.3,'(仮)',{fontSize:'20px',fill:'#fff'}).setOrigin(0.5);const bs={fontSize:'32px',fill:'#fff',backgroundColor:'#555',padding:{x:20,y:10}};const bhs={fill:'#ff0'};const nb=this.add.text(w/2,h*0.5,'通常',bs).setOrigin(0.5).setInteractive({useHandCursor:true}).on('pointerover',()=>{nb.setStyle(bhs)}).on('pointerout',()=>{nb.setStyle(bs)}).on('pointerdown',()=>{console.log("通常");this.scene.start('GameScene',{mode:GAME_MODE.NORMAL});this.scene.launch('UIScene');});const asb=this.add.text(w/2,h*0.7,'全員',bs).setOrigin(0.5).setInteractive({useHandCursor:true}).on('pointerover',()=>{asb.setStyle(bhs)}).on('pointerout',()=>{asb.setStyle(bs)}).on('pointerdown',()=>{console.log("全員");this.scene.start('GameScene',{mode:GAME_MODE.ALL_STARS});this.scene.launch('UIScene');});} }

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
    }

    init(data){
        this.currentMode=data.mode||GAME_MODE.NORMAL; this.lives=(this.currentMode===GAME_MODE.ALL_STARS)?1:3; this.isBallLaunched=false; this.currentStage=1; this.score=0;
        Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove();}); this.powerUpTimers={};
        if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null;
        if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null;
        if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null;
        this.isStageClearing=false; this.isGameOver=false;
        this.isVajraSystemActive=false; this.vajraGauge=0;
        this.isMakiraActive=false; if(this.makiraAttackTimer)this.makiraAttackTimer.remove(); this.makiraAttackTimer=null;
        console.log(`GS:Init ${this.currentMode} L:${this.lives}`);
    }

    preload(){}

    create(){
        console.log("GS:Create Start");
        this.gameWidth=this.scale.width; this.gameHeight=this.scale.height; this.cameras.main.setBackgroundColor('#222');
        this.time.delayedCall(50,()=>{ if(this.scene.isActive('UIScene')){ this.events.emit('updateLives',this.lives); this.events.emit('updateScore',this.score); this.events.emit('updateStage',this.currentStage); if(this.isVajraSystemActive) { this.events.emit('activateVajraUI',this.vajraGauge,VAJRA_GAUGE_MAX); } else { this.events.emit('deactivateVajraUI'); } } else { console.warn("UI not active at init time"); } });
        this.physics.world.setBoundsCollision(true,true,true,false); this.physics.world.on('worldbounds',this.handleWorldBounds,this);
        const initialPaddleWidth=this.gameWidth*PADDLE_WIDTH_RATIO; this.paddle=this.physics.add.image(this.gameWidth/2,this.gameHeight-PADDLE_Y_OFFSET,null).setDisplaySize(initialPaddleWidth,PADDLE_HEIGHT).setTint(0xffffff).setImmovable(true).setData('originalWidth',initialPaddleWidth);
        this.balls=this.physics.add.group({bounceX:1,bounceY:1,collideWorldBounds:true}); this.createAndAddBall(this.paddle.x,this.paddle.y-PADDLE_HEIGHT/2-BALL_RADIUS);
        this.createBricks();
        this.gameOverText=this.add.text(this.gameWidth/2,this.gameHeight/2,'G Over\nTap',{fontSize:'48px',fill:'#f00',align:'center'}).setOrigin(0.5).setVisible(false).setDepth(1);
        this.powerUps=this.physics.add.group(); this.familiars=this.physics.add.group(); this.makiraBeams=this.physics.add.group();
        this.setColliders();
        this.physics.add.overlap(this.paddle,this.powerUps,this.collectPowerUp,null,this);
        this.input.on('pointermove',(p)=>{ if(!this.isGameOver&&this.lives>0&&this.paddle&&!this.isStageClearing){ const targetX = p.x; const halfWidth = this.paddle.displayWidth / 2; const clampedTargetX = Phaser.Math.Clamp(targetX, halfWidth, this.gameWidth - halfWidth); this.paddle.x = clampedTargetX; if (!this.isBallLaunched) { this.balls.getChildren().forEach(b => { if(b.active) b.x = clampedTargetX; }); } } });
        this.input.on('pointerdown',()=>{ if(this.isGameOver&&this.gameOverText?.visible){ this.returnToTitle(); } else if(this.lives>0&&!this.isBallLaunched&&!this.isStageClearing){ this.launchBall(); } });
        this.events.on('shutdown',this.shutdown,this); console.log("GS:Create End");
    }

    update(){
        if(this.isGameOver||this.isStageClearing||this.lives<=0){ return; }
        let activeBallCount=0; let sindaraBalls=[];
        this.balls.getChildren().forEach(b=>{ if(b.active){ activeBallCount++; if(this.isBallLaunched&&!this.isStageClearing&&b.y>this.gameHeight+b.displayHeight){ if(b.getData('isAnilaActive')) { this.triggerAnilaBounce(b); } else { b.setActive(false).setVisible(false); if(b.body) b.body.enable=false; } } if(b.getData('isSindara')){ sindaraBalls.push(b); if(b.getData('isAttracting')) { this.updateSindaraAttraction(b); } } if(b.body&&this.isBallLaunched){ const minSpeed=NORMAL_BALL_SPEED*0.1; const maxSpeed=NORMAL_BALL_SPEED*5; const speed=b.body.velocity.length(); if(speed<minSpeed&&speed>0) { b.body.velocity.normalize().scale(minSpeed); } else if(speed>maxSpeed) { b.body.velocity.normalize().scale(maxSpeed); } } } });
        if(sindaraBalls.length===1 && this.balls.getTotalUsed() > 1){ const remainingBall=sindaraBalls[0]; if(remainingBall.getData('isSindara')){ this.deactivateSindara([remainingBall]); this.updateBallTint(remainingBall); } }
        if(activeBallCount===0&&this.isBallLaunched&&!this.isStageClearing&&this.lives>0){ this.loseLife(); return; }
        this.powerUps.children.each(pu=>{ if(pu.active&&pu.y>this.gameHeight+POWERUP_SIZE) { pu.destroy(); } });
        if(this.balls.countActive(true)===1){ const lastBall=this.balls.getFirstAlive(); if(lastBall&&lastBall.getData('isAnchira')){ this.deactivateAnchira([lastBall]); this.updateBallTint(lastBall); } }
        if(this.isMakiraActive&&this.paddle&&this.familiars){ const paddleX=this.paddle.x; const familiarY=this.paddle.y-PADDLE_HEIGHT/2-MAKIRA_FAMILIAR_SIZE; const children = this.familiars.getChildren(); if(children.length>=1 && children[0].active) children[0].setPosition(paddleX-MAKIRA_FAMILIAR_OFFSET, familiarY); if(children.length>=2 && children[1].active) children[1].setPosition(paddleX+MAKIRA_FAMILIAR_OFFSET, familiarY); }
        if(this.makiraBeams){ this.makiraBeams.children.each(bm=>{ if(bm.active&&bm.y<-MAKIRA_BEAM_HEIGHT) { bm.destroy(); } }); }
    }

    setColliders(){
        if(this.ballPaddleCollider)this.ballPaddleCollider.destroy(); if(this.ballBrickCollider)this.ballBrickCollider.destroy(); if(this.ballBrickOverlap)this.ballBrickOverlap.destroy(); if(this.ballBallCollider)this.ballBallCollider.destroy(); if(this.makiraBeamBrickOverlap) this.makiraBeamBrickOverlap.destroy();
        if(!this.balls||!this.paddle||!this.bricks) return;
        this.ballPaddleCollider=this.physics.add.collider(this.paddle,this.balls,this.hitPaddle,null,this);
        this.ballBrickCollider=this.physics.add.collider(this.bricks,this.balls,this.hitBrick, (b, ball)=>{ const iB = ball.getData('isBikara'); const iP = ball.getData('isPenetrating'); const iM = ball.getData('isSindara') && ball.getData('isMerging'); return !(iB || iP || iM); },this);
        this.ballBrickOverlap=this.physics.add.overlap(this.balls,this.bricks,this.handleBallBrickOverlap, (ball, b)=>{ return ball.getData('isPenetrating') || (ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'))) || ball.getData('isBikara'); },this);
        this.ballBallCollider=this.physics.add.collider(this.balls,this.balls,this.handleBallCollision, (b1, b2)=>{ return b1.getData('isSindara') && b2.getData('isSindara') && b1.getData('isAttracting') && b2.getData('isAttracting'); },this);
        if (this.makiraBeams && this.bricks) { this.makiraBeamBrickOverlap = this.physics.add.overlap( this.makiraBeams, this.bricks, this.hitBrickWithMakiraBeam, null, this); }
    }

    createAndAddBall(x,y,vx=0,vy=0,data=null){
        const ball=this.balls.create(x,y,null).setDisplaySize(BALL_RADIUS*2,BALL_RADIUS*2).setTint(DEFAULT_BALL_COLOR).setCircle(BALL_RADIUS).setCollideWorldBounds(true).setBounce(1);
        if(ball.body){ ball.setVelocity(vx,vy); ball.body.onWorldBounds=true; } else{ ball.destroy(); return null; }
        ball.setData({ activePowers: data ? new Set(data.activePowers) : new Set(), lastActivatedPower: data ? data.lastActivatedPower : null, isPenetrating: data ? data.isPenetrating : false, isFast: data ? data.isFast : false, isSlow: data ? data.isSlow : false, isAnchira: data ? data.isAnchira : false, isSindara: data ? data.isSindara : false, sindaraPartner: null, isAttracting: false, isMerging: false, isBikara: data ? data.isBikara : false, bikaraState: data ? data.bikaraState : null, bikaraYangCount: 0, isIndaraActive: data ? data.isIndaraActive : false, indaraHomingCount: data ? data.indaraHomingCount : 0, isAnilaActive: data ? data.isAnilaActive : false });
        if(data){ this.updateBallTint(ball); if(ball.getData('isFast')) this.applySpeedModifier(ball,POWERUP_TYPES.SHATORA); else if(ball.getData('isSlow')) this.applySpeedModifier(ball,POWERUP_TYPES.HAILA); } return ball;
    }

    launchBall(){ if(!this.isBallLaunched&&this.balls){ const fB=this.balls.getFirstAlive(); if(fB){ const iVx=Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0],BALL_INITIAL_VELOCITY_X_RANGE[1]); fB.setVelocity(iVx,BALL_INITIAL_VELOCITY_Y); this.isBallLaunched=true; } } }

    createBricks(){
        if(this.bricks){ this.bricks.clear(true,true); this.bricks.destroy(); } this.bricks=this.physics.add.staticGroup();
        const bW=this.gameWidth*BRICK_WIDTH_RATIO; const tW=BRICK_COLS*bW+(BRICK_COLS-1)*BRICK_SPACING; const oX=(this.gameWidth-tW)/2; const rC=this.currentMode===GAME_MODE.ALL_STARS?BRICK_ROWS+2:BRICK_ROWS;
        for(let i=0;i<rC;i++){ for(let j=0;j<BRICK_COLS;j++){ const bX=oX+j*(bW+BRICK_SPACING)+bW/2; const bY=BRICK_OFFSET_TOP+i*(BRICK_HEIGHT+BRICK_SPACING)+BRICK_HEIGHT/2; const rCo=Phaser.Utils.Array.GetRandom(BRICK_COLORS); const b=this.bricks.create(bX,bY,null).setDisplaySize(bW,BRICK_HEIGHT).setTint(rCo); b.setData({ hits:1, originalTint:rCo, isMarkedByBikara:false }); b.refreshBody(); } }
        this.setColliders();
    }

    hitPaddle(paddle,ball){
        if(!paddle||!ball||!ball.active||!ball.body)return; let diff=ball.x-paddle.x; const mD=paddle.displayWidth/2; let inf=diff/mD; inf=Phaser.Math.Clamp(inf,-1,1); const maxVx=NORMAL_BALL_SPEED*0.8; let nVx=maxVx*inf; const minVy=NORMAL_BALL_SPEED*0.5; let cVy=ball.body.velocity.y; let nVy=-Math.abs(cVy); if(Math.abs(nVy)<minVy) nVy=-minVy; let sM=1.0; if(ball.getData('isFast')) sM=BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if(ball.getData('isSlow')) sM=BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA]; const tS=NORMAL_BALL_SPEED*sM; const nV=new Phaser.Math.Vector2(nVx,nVy).normalize().scale(tS); ball.setVelocity(nV.x,nV.y); if(ball.getData('isBikara')) this.switchBikaraState(ball); if(ball.getData('isIndaraActive')){ this.deactivateIndaraForBall(ball); this.updateBallTint(ball); }
    }

    handleBrickDestruction(brick) {
        // ★ デバッグログ追加: 破壊前のブロック数を記録
        const activeBricksBefore = this.bricks.countActive(true);
        console.log(`[DEBUG] handleBrickDestruction called. Active bricks BEFORE: ${activeBricksBefore}`);

        if (!brick || !brick.active) {
             console.log("[DEBUG] handleBrickDestruction: Brick invalid or inactive.");
             return false; // ドロップ処理へ進まない
        }
        const brickX = brick.x; const brickY = brick.y;

        brick.disableBody(true, true);
        this.score += 10; this.events.emit('updateScore',this.score); this.increaseVajraGauge();

        // ★ デバッグログ追加: 破壊後のブロック数を記録
        const activeBricksAfter = this.bricks.countActive(true);
        console.log(`[DEBUG] handleBrickDestruction: Brick disabled. Active bricks AFTER: ${activeBricksAfter}`);


        if (Phaser.Math.FloatBetween(0, 1) < BAISRAVA_DROP_RATE) {
            console.log(">>> Dropping Baisrava (Special Chance)!");
            this.dropSpecificPowerUp(brickX, brickY, POWERUP_TYPES.BAISRAVA);
            return true;
        }
        if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) {
            this.dropPowerUp(brickX, brickY);
        }
        return false;
    }

    hitBrick(brick,ball){ if(!brick||!ball||!brick.active||!ball.active||this.isStageClearing)return; this.handleBrickDestruction(brick); if(!this.isStageClearing&&this.bricks.countActive(true)===0){ this.stageClear(); } }
    handleBallBrickOverlap(ball,brick){ if(!ball||!brick||!ball.active||!brick.active||this.isStageClearing)return; const iP=ball.getData('isPenetrating'); const iSA=ball.getData('isSindara') && ball.getData('isAttracting'); const iSM=ball.getData('isSindara') && ball.getData('isMerging'); const iB=ball.getData('isBikara'); const bS=ball.getData('bikaraState'); if(iB){ if(bS==='yin'){ this.markBrickByBikara(brick); return; } else if(bS==='yang'){ this.handleBikaraYangDestroy(ball,brick); return; } else return; } if(iP || iSA || iSM){ this.handleBrickDestruction(brick); if(!this.isStageClearing&&this.bricks.countActive(true)===0){ this.stageClear(); } return; } }
    handleBikaraYangDestroy(ball,hitBrick){ if(!ball||!ball.active||!ball.getData('isBikara')||ball.getData('bikaraState')!=='yang') return; let dC=0; const mTD=[]; if(hitBrick.active){ mTD.push(hitBrick); hitBrick.setData('isMarkedByBikara',false); } this.bricks.getChildren().forEach(br=>{ if(br.active && br.getData('isMarkedByBikara') && !mTD.includes(br)){ mTD.push(br); br.setData('isMarkedByBikara',false); } }); mTD.forEach(br=>{ this.handleBrickDestruction(br); dC++; }); let cYC=ball.getData('bikaraYangCount')||0; cYC++; ball.setData('bikaraYangCount',cYC); if(!this.isStageClearing&&this.bricks.countActive(true)===0){ this.stageClear(); } else if(cYC>=BIKARA_YANG_COUNT_MAX){ this.deactivateBikara([ball]); this.updateBallTint(ball); } }

    dropSpecificPowerUp(x, y, type) {
        if (!type || !POWERUP_COLORS[type]) return; const color = POWERUP_COLORS[type]; const pU = this.powerUps.create(x, y, null).setDisplaySize(POWERUP_SIZE, POWERUP_SIZE).setTint(color).setData('type', type); if(pU.body){ pU.setVelocity(0, POWERUP_SPEED_Y); pU.body.setCollideWorldBounds(false); pU.body.setAllowGravity(false); } else { pU.destroy(); }
    }
    dropPowerUp(x,y){ const aT = [ POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA, POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA, POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA, POWERUP_TYPES.MAKORA ]; const type = Phaser.Utils.Array.GetRandom(aT); this.dropSpecificPowerUp(x, y, type); }

    collectPowerUp(paddle,powerUp){ if(!powerUp||!powerUp.active||this.isStageClearing)return; const type = powerUp.getData('type'); if(!type){ powerUp.destroy(); return; } powerUp.destroy();
        if(type===POWERUP_TYPES.BAISRAVA){ this.activateBaisrava(); return; } if(type===POWERUP_TYPES.VAJRA){ this.activateVajra(); return; } if(type===POWERUP_TYPES.MAKIRA){ this.activateMakira(); return; } if(type===POWERUP_TYPES.MAKORA){ this.activateMakora(); return; }
        if(type===POWERUP_TYPES.ANCHIRA||type===POWERUP_TYPES.SINDARA){ if(this.balls.countActive(true)>1){ this.keepFurthestBall(); } } this.activatePower(type);
    }
    activateMakora() { const cPT = Phaser.Utils.Array.GetRandom(MAKORA_COPYABLE_POWERS); console.log(`Makora copy: ${cPT}`); switch(cPT) { case POWERUP_TYPES.KUBIRA: case POWERUP_TYPES.SHATORA: case POWERUP_TYPES.HAILA: case POWERUP_TYPES.BIKARA: case POWERUP_TYPES.INDARA: case POWERUP_TYPES.ANILA: this.activatePower(cPT); break; case POWERUP_TYPES.ANCHIRA: case POWERUP_TYPES.SINDARA: if(this.balls.countActive(true)>1){ this.keepFurthestBall(); } this.activatePower(cPT); break; case POWERUP_TYPES.VAJRA: this.activateVajra(); break; case POWERUP_TYPES.MAKIRA: this.activateMakira(); break; } }
    keepFurthestBall(){ const aB = this.balls.getMatching('active',true); if(aB.length<=1) return; let fB = null; let mDSq = -1; const pP = new Phaser.Math.Vector2(this.paddle.x, this.paddle.y); aB.forEach(b=>{ const dSq = Phaser.Math.Distance.Squared(pP.x, pP.y, b.x, b.y); if(dSq > mDSq){ mDSq = dSq; fB = b; } }); aB.forEach(b=>{ if(b !== fB){ b.destroy(); } }); }

    activatePower(type){ const tB = this.balls.getMatching('active',true); if(tB.length===0) return; if(POWERUP_DURATION[type]){ if(this.powerUpTimers[type]){ this.powerUpTimers[type].remove(); } } switch(type){ case POWERUP_TYPES.KUBIRA: this.activateKubira(tB); break; case POWERUP_TYPES.SHATORA: this.activateShatora(tB); break; case POWERUP_TYPES.HAILA: this.activateHaira(tB); break; case POWERUP_TYPES.ANCHIRA: if (tB.length === 1) this.activateAnchira(tB[0]); break; case POWERUP_TYPES.SINDARA: if (tB.length === 1) this.activateSindara(tB[0]); break; case POWERUP_TYPES.BIKARA: this.activateBikara(tB); break; case POWERUP_TYPES.INDARA: this.activateIndara(tB); break; case POWERUP_TYPES.ANILA: this.activateAnila(tB); break; } tB.forEach(b=>{ if(b.active){ b.getData('activePowers').add(type); b.setData('lastActivatedPower',type); this.updateBallTint(b); } }); const duration = POWERUP_DURATION[type]; if(duration){ this.powerUpTimers[type]=this.time.delayedCall( duration, ()=>{ this.deactivatePowerByType(type); this.powerUpTimers[type]=null; }, [], this ); } }
    deactivatePowerByType(type){ const tB = this.balls.getMatching('active',true); if(tB.length===0 || type===POWERUP_TYPES.MAKIRA || type===POWERUP_TYPES.VAJRA || type === POWERUP_TYPES.MAKORA) return; switch(type){ case POWERUP_TYPES.KUBIRA: this.deactivateKubira(tB); break; case POWERUP_TYPES.SHATORA: this.deactivateShatora(tB); break; case POWERUP_TYPES.HAILA: this.deactivateHaira(tB); break; } tB.forEach(b=>{ if(b.active){ b.getData('activePowers').delete(type); this.updateBallTint(b); } }); }
    updateBallTint(ball){ if(!ball||!ball.active)return; const aP = ball.getData('activePowers'); let tC = DEFAULT_BALL_COLOR; if(aP && aP.size > 0){ const lP = ball.getData('lastActivatedPower'); if(lP && aP.has(lP)){ if(lP === POWERUP_TYPES.BIKARA) { tC = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin; } else if(lP === POWERUP_TYPES.SINDARA) { if(ball.getData('isMerging')) tC = SINDARA_MERGE_COLOR; else if(ball.getData('isAttracting')) tC = SINDARA_ATTRACT_COLOR; else tC = POWERUP_COLORS[lP]; } else { tC = POWERUP_COLORS[lP] || DEFAULT_BALL_COLOR; } } else { const rP = Array.from(aP); if(rP.length > 0) { const nLP = rP[rP.length-1]; if(nLP === POWERUP_TYPES.BIKARA) { tC = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin; } else if(nLP === POWERUP_TYPES.SINDARA) { if(ball.getData('isMerging')) tC = SINDARA_MERGE_COLOR; else if(ball.getData('isAttracting')) tC = SINDARA_ATTRACT_COLOR; else tC = POWERUP_COLORS[nLP]; } else { tC = POWERUP_COLORS[nLP] || DEFAULT_BALL_COLOR; } ball.setData('lastActivatedPower', nLP); } } } ball.setTint(tC); }
    activateKubira(balls){ balls.forEach(b=>b.setData('isPenetrating',true)); } deactivateKubira(balls){ balls.forEach(b=>{ if(!b.getData('isSindara')||(!b.getData('isAttracting')&&!b.getData('isMerging'))) { b.setData('isPenetrating',false); } }); } applySpeedModifier(ball,type){ if(!ball||!ball.active||!ball.body)return; const m = BALL_SPEED_MODIFIERS[type]; if(!m)return; const cV = ball.body.velocity; const dir = cV.length()>0 ? cV.clone().normalize() : new Phaser.Math.Vector2(0,-1); const nS = NORMAL_BALL_SPEED * m; ball.setVelocity(dir.x * nS, dir.y * nS); } resetBallSpeed(ball){ if(!ball||!ball.active||!ball.body)return; if(ball.getData('isFast')) { this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); } else if(ball.getData('isSlow')) { this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); } else { const cV = ball.body.velocity; const dir = cV.length()>0 ? cV.clone().normalize() : new Phaser.Math.Vector2(0,-1); ball.setVelocity(dir.x * NORMAL_BALL_SPEED, dir.y * NORMAL_BALL_SPEED); } } activateShatora(balls){ balls.forEach(b=>{ b.setData({isFast:true,isSlow:false}); this.applySpeedModifier(b,POWERUP_TYPES.SHATORA); }); } deactivateShatora(balls){ balls.forEach(b=>{ if(b.getData('isFast')){ b.setData('isFast',false); this.resetBallSpeed(b); } }); } activateHaira(balls){ balls.forEach(b=>{ b.setData({isSlow:true,isFast:false}); this.applySpeedModifier(b,POWERUP_TYPES.HAILA); }); } deactivateHaira(balls){ balls.forEach(b=>{ if(b.getData('isSlow')){ b.setData('isSlow',false); this.resetBallSpeed(b); } }); } activateAnchira(sB){ if(!sB||!sB.active) return; sB.setData('isAnchira',true); const x=sB.x, y=sB.y; const nS=3; const bD = sB.data.getAll(); for(let i=0;i<nS;i++){ const oX=Phaser.Math.Between(-5,5); const oY=Phaser.Math.Between(-5,5); const vx=Phaser.Math.Between(-150,150); const vy=-Math.abs(Phaser.Math.Between(NORMAL_BALL_SPEED*0.5, NORMAL_BALL_SPEED*0.8)); const nB = this.createAndAddBall(x+oX, y+oY, vx, vy, bD); if(nB) nB.setData('isAnchira', true); } } deactivateAnchira(balls){ balls.forEach(b=>{ if(b.getData('isAnchira')){ b.setData('isAnchira',false); b.getData('activePowers').delete(POWERUP_TYPES.ANCHIRA); } }); } activateSindara(sB){ if(!sB||!sB.active) { sB?.getData('activePowers').delete(POWERUP_TYPES.SINDARA); this.updateBallTint(sB); return; } const x=sB.x, y=sB.y; const bD = sB.data.getAll(); const vx=Phaser.Math.Between(-150,150); const vy=-Math.abs(Phaser.Math.Between(NORMAL_BALL_SPEED*0.5, NORMAL_BALL_SPEED*0.8)); const pB = this.createAndAddBall(x+Phaser.Math.Between(-5,5), y+Phaser.Math.Between(-5,5), vx, vy, bD); if(pB){ sB.setData({ isSindara:true, sindaraPartner:pB, isAttracting:false, isMerging:false }); pB.setData({ isSindara:true, sindaraPartner:sB, isAttracting:false, isMerging:false }); if(this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=this.time.delayedCall( SINDARA_ATTRACTION_DELAY, ()=>{ this.startSindaraAttraction(sB,pB); }, [], this ); } else { sB.getData('activePowers').delete(POWERUP_TYPES.SINDARA); this.updateBallTint(sB); } } startSindaraAttraction(b1,b2){ this.sindaraAttractionTimer=null; if(!b1||!b2||!b1.active||!b2.active||!b1.getData('isSindara')||!b2.getData('isSindara')){ const aSB=this.balls.getMatching('isSindara',true); if(aSB.length>0){ this.deactivateSindara(aSB); aSB.forEach(b=>this.updateBallTint(b)); } return; } b1.setData({isAttracting:true, isPenetrating:true}); b2.setData({isAttracting:true, isPenetrating:true}); this.updateBallTint(b1); this.updateBallTint(b2); } updateSindaraAttraction(ball){ const p = ball.getData('sindaraPartner'); if(p && p.active && ball.active && ball.getData('isAttracting') && p.getData('isAttracting') && !ball.getData('isMerging') && !p.getData('isMerging')) { this.physics.moveToObject(ball, p, SINDARA_ATTRACTION_FORCE); } } handleBallCollision(b1,b2){ if(b1.active && b2.active && b1.getData('sindaraPartner') === b2){ this.mergeSindaraBalls(b1,b2); } } mergeSindaraBalls(bTK,bTR){ const mX = (bTK.x + bTR.x)/2; const mY = (bTK.y + bTR.y)/2; bTK.setPosition(mX, mY); bTR.destroy(); bTK.setData({ isMerging:true, isAttracting:false, isPenetrating:true, sindaraPartner:null }); this.updateBallTint(bTK); if(this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraMergeTimer=this.time.delayedCall( SINDARA_MERGE_DURATION, ()=>{ this.finishSindaraMerge(bTK); }, [], this ); if(this.sindaraAttractionTimer){ this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; } } finishSindaraMerge(mB){ this.sindaraMergeTimer=null; if(!mB||!mB.active) return; mB.setData({ isMerging:false }); this.updateBallTint(mB); if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = this.time.delayedCall( SINDARA_POST_MERGE_PENETRATION_DURATION, () => { this.deactivateSindaraPenetration(mB); }, [], this ); } deactivateSindaraPenetration(ball) { this.sindaraPenetrationTimer = null; if (!ball || !ball.active) return; if (!ball.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) { ball.setData('isPenetrating', false); } if (ball.getData('isSindara')) { ball.setData('isSindara', false); ball.getData('activePowers').delete(POWERUP_TYPES.SINDARA); this.resetBallSpeed(ball); this.updateBallTint(ball); } } deactivateSindara(balls){ if(this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; balls.forEach(b=>{ if(b.active && b.getData('isSindara')){ b.setData({ isSindara:false, sindaraPartner:null, isAttracting:false, isMerging:false }); if(!b.getData('activePowers').has(POWERUP_TYPES.KUBIRA)){ b.setData('isPenetrating',false); } b.getData('activePowers').delete(POWERUP_TYPES.SINDARA); } }); } activateBikara(balls){ balls.forEach(b=>{ b.setData({ isBikara:true, bikaraState:'yin', bikaraYangCount:0 }); this.updateBallTint(b); }); } deactivateBikara(balls){ balls.forEach(b=>{ if(b.getData('isBikara')){ b.setData({ isBikara:false, bikaraState:null, bikaraYangCount:0 }); b.getData('activePowers').delete(POWERUP_TYPES.BIKARA); } }); this.bricks.getChildren().forEach(br=>{ if(br.getData('isMarkedByBikara')){ br.setData('isMarkedByBikara',false); br.setTint(br.getData('originalTint')||0xffffff); } }); } switchBikaraState(ball){ if(!ball||!ball.active||!ball.getData('isBikara')) return; const cS = ball.getData('bikaraState'); const nS = (cS==='yin')?'yang':'yin'; ball.setData('bikaraState',nS); this.updateBallTint(ball); } markBrickByBikara(brick){ if(!brick||!brick.active||brick.getData('isMarkedByBikara')) return; brick.setData('isMarkedByBikara',true); brick.setTint(BRICK_MARKED_COLOR); } activateIndara(balls){ balls.forEach(b=>b.setData({ isIndaraActive:true, indaraHomingCount:INDARA_MAX_HOMING_COUNT })); } deactivateIndaraForBall(ball){ if(!ball||!ball.active||!ball.getData('isIndaraActive')) return; ball.setData({ isIndaraActive:false, indaraHomingCount:0 }); ball.getData('activePowers').delete(POWERUP_TYPES.INDARA); }
    handleWorldBounds(body,up,down,left,right){ const ball=body.gameObject; if(!ball||!(ball instanceof Phaser.Physics.Arcade.Image)||!this.balls.contains(ball)||!ball.active) return; if(ball.getData('isIndaraActive') && ball.getData('indaraHomingCount')>0 && (up||left||right)) { const cHC=ball.getData('indaraHomingCount'); const aB = this.bricks.getMatching('active',true); if(aB.length > 0){ let cB = null; let mDSq = Infinity; const bC = ball.body.center; aB.forEach(br=>{ const dSq = Phaser.Math.Distance.Squared( bC.x, bC.y, br.body.center.x, br.body.center.y ); if(dSq < mDSq){ mDSq = dSq; cB = br; } }); if(cB){ console.log("Indara Homing! Ignoring physics, redirecting."); const cS = ball.body.velocity.length(); const angle = Phaser.Math.Angle.BetweenPoints(bC, cB.body.center); this.physics.velocityFromAngle(angle, cS, ball.body.velocity); const nHC = cHC - 1; ball.setData('indaraHomingCount',nHC); if(nHC <= 0){ this.deactivateIndaraForBall(ball); this.updateBallTint(ball); } } } } } activateAnila(balls){ balls.forEach(b=>{ if(!b.getData('isAnilaActive')){ b.setData('isAnilaActive',true); } }); } deactivateAnilaForBall(ball){ if(!ball||!ball.active||!ball.getData('isAnilaActive'))return; ball.setData('isAnilaActive',false); ball.getData('activePowers').delete(POWERUP_TYPES.ANILA); } triggerAnilaBounce(ball){ if(!ball||!ball.active||!ball.getData('isAnilaActive')) return; const cVy = ball.body.velocity.y; const bVy = -Math.abs(cVy > -10 ? BALL_INITIAL_VELOCITY_Y * 0.7 : cVy * 0.8); ball.setVelocityY(bVy); ball.y = this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT; this.deactivateAnilaForBall(ball); this.updateBallTint(ball); } activateBaisrava(){ if(this.isStageClearing||this.isGameOver) return; const aB = this.bricks.getMatching('active',true); let dC = 0; aB.forEach(b=>{ this.handleBrickDestruction(b); dC++; }); if(dC>0){ console.log(`Baisrava destroyed ${dC}.`); } this.stageClear(); } activateVajra(){ if(!this.isVajraSystemActive){ this.isVajraSystemActive=true; this.vajraGauge=0; this.events.emit('activateVajraUI',this.vajraGauge,VAJRA_GAUGE_MAX); } }
    increaseVajraGauge(){
        if(this.isVajraSystemActive && !this.isStageClearing && !this.isGameOver){
            this.vajraGauge+=VAJRA_GAUGE_INCREMENT;
            this.vajraGauge=Math.min(this.vajraGauge,VAJRA_GAUGE_MAX);
            this.events.emit('updateVajraGauge',this.vajraGauge);
            if(this.vajraGauge>=VAJRA_GAUGE_MAX){
                // ★★★ ゲージMAX時のログ追加 ★★★
                console.log("[DEBUG] Vajra Gauge MAX! Calling triggerVajraDestroy...");
                this.triggerVajraDestroy();
                // ★★★ triggerVajraDestroy 直後のログ追加 ★★★
                console.log("[DEBUG] triggerVajraDestroy finished. Calling deactivateVajra...");
                this.deactivateVajra(); // 奥義発動後にシステムOFF
            }
        }
    }
    triggerVajraDestroy(){
        if(this.isStageClearing||this.isGameOver) return;
        // ★ デバッグログ追加: 関数開始時
        console.log("[DEBUG] === triggerVajraDestroy START ===");
        const activeBricks = this.bricks.getMatching('active',true);
        // ★ デバッグログ追加: 取得したブロック数
        console.log(`[DEBUG] triggerVajraDestroy: Initial active bricks: ${activeBricks.length}`);
        if(activeBricks.length===0){ console.log("[DEBUG] triggerVajraDestroy: No active bricks, exiting."); return; }

        const countToDestroy = Math.min(activeBricks.length,VAJRA_DESTROY_COUNT);
        console.log(`[DEBUG] Vajra effect: Planning to destroy ${countToDestroy} random bricks.`);
        const shuffledBricks = Phaser.Utils.Array.Shuffle(activeBricks);
        let destroyedCount=0;

        console.log("[DEBUG] triggerVajraDestroy: Starting destruction loop...");
        for(let i=0; i<countToDestroy; i++){
            const brick = shuffledBricks[i];
            // ★ デバッグログ追加: ループ内の情報
            console.log(`[DEBUG] triggerVajraDestroy: Loop ${i+1}/${countToDestroy}. Attempting to destroy brick at (${brick?.x?.toFixed(0)}, ${brick?.y?.toFixed(0)}). Active: ${brick?.active}`);
            if(brick&&brick.active){
                this.handleBrickDestruction(brick); // 破壊とドロップ判定 (内部にログあり)
                destroyedCount++;
            } else {
                console.log(`[DEBUG] triggerVajraDestroy: Loop ${i+1}/${countToDestroy}. Brick already inactive or invalid.`);
            }
             // ★ デバッグログ追加: ループ各回の後のブロック数
             console.log(`[DEBUG] triggerVajraDestroy: Loop ${i+1}/${countToDestroy}. Active bricks after handleBrickDestruction: ${this.bricks.countActive(true)}`);
        }
        console.log("[DEBUG] triggerVajraDestroy: Destruction loop finished.");

        if(destroyedCount>0){ console.log(`[DEBUG] Vajra effect actually destroyed ${destroyedCount} bricks.`); }

        // ★ デバッグログ追加: ステージクリア判定前のブロック数
        const finalActiveCount = this.bricks.countActive(true);
        console.log(`[DEBUG] triggerVajraDestroy: Active bricks before stage clear check: ${finalActiveCount}`);
        if(!this.isStageClearing && finalActiveCount === 0){
            console.log("[DEBUG] triggerVajraDestroy: Vajra effect cleared the stage! Calling stageClear...");
            this.stageClear();
        }
        // ★ デバッグログ追加: 関数終了時
        console.log("[DEBUG] === triggerVajraDestroy END ===");
    }
    deactivateVajra() { if (this.isVajraSystemActive) { this.isVajraSystemActive = false; this.vajraGauge = 0; this.events.emit('deactivateVajraUI'); } }
    activateMakira() { if (!this.isMakiraActive) { this.isMakiraActive = true; if (this.familiars) this.familiars.clear(true, true); else this.familiars = this.physics.add.group(); this.createFamiliars(); if (this.makiraBeams) this.makiraBeams.clear(true, true); else this.makiraBeams = this.physics.add.group(); if (this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer = this.time.addEvent({ delay: MAKIRA_ATTACK_INTERVAL, callback: this.fireMakiraBeam, callbackScope: this, loop: true }); } const duration = POWERUP_DURATION[POWERUP_TYPES.MAKIRA]; if (this.powerUpTimers[POWERUP_TYPES.MAKIRA]) this.powerUpTimers[POWERUP_TYPES.MAKIRA].remove(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = this.time.delayedCall( duration, () => { this.deactivateMakira(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = null; }, [], this ); this.setColliders(); }
    deactivateMakira() { if (this.isMakiraActive) { this.isMakiraActive = false; if (this.makiraAttackTimer) { this.makiraAttackTimer.remove(); this.makiraAttackTimer = null; } if (this.powerUpTimers[POWERUP_TYPES.MAKIRA]) { this.powerUpTimers[POWERUP_TYPES.MAKIRA].remove(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = null; } if (this.familiars) { this.familiars.clear(true, true); } if (this.makiraBeams) { this.makiraBeams.clear(true, true); } } }
    createFamiliars() { if(!this.paddle) return; const pX=this.paddle.x; const fY=this.paddle.y-PADDLE_HEIGHT/2-MAKIRA_FAMILIAR_SIZE; const fL=this.familiars.create(pX-MAKIRA_FAMILIAR_OFFSET, fY, null).setDisplaySize(MAKIRA_FAMILIAR_SIZE*2, MAKIRA_FAMILIAR_SIZE*2).setTint(MAKIRA_FAMILIAR_COLOR); if(fL.body){ fL.body.setAllowGravity(false).setImmovable(true); } const fR=this.familiars.create(pX+MAKIRA_FAMILIAR_OFFSET, fY, null).setDisplaySize(MAKIRA_FAMILIAR_SIZE*2, MAKIRA_FAMILIAR_SIZE*2).setTint(MAKIRA_FAMILIAR_COLOR); if(fR.body){ fR.body.setAllowGravity(false).setImmovable(true); } }
    fireMakiraBeam() { if (!this.isMakiraActive || !this.familiars || this.familiars.countActive(true) === 0 || this.isStageClearing || this.isGameOver) return; this.familiars.getChildren().forEach(f => { if (f.active) { const beam = this.makiraBeams.create(f.x, f.y - MAKIRA_FAMILIAR_SIZE, null).setDisplaySize(MAKIRA_BEAM_WIDTH, MAKIRA_BEAM_HEIGHT).setTint(MAKIRA_BEAM_COLOR); if (beam && beam.body) { beam.setVelocity(0, -MAKIRA_BEAM_SPEED); beam.body.setAllowGravity(false); } else { if (beam) beam.destroy(); } } }); }
    hitBrickWithMakiraBeam(beam, brick) { if (!beam || !brick || !beam.active || !brick.active || this.isStageClearing || this.isGameOver) return; try { beam.destroy(); this.handleBrickDestruction(brick); if (!this.isStageClearing && this.bricks.countActive(true) === 0) { this.time.delayedCall(10, this.stageClear, [], this); } } catch(error) { console.error("E MakiraHit", error); if (beam && beam.active) { beam.setActive(false).setVisible(false); if(beam.body) beam.body.enable = false; } } }

    loseLife() { if(this.isStageClearing||this.isGameOver||this.lives<=0)return; this.deactivateMakira(); this.deactivateVajra(); this.lives--; this.events.emit('updateLives',this.lives); this.isBallLaunched=false; Object.keys(this.powerUpTimers).forEach(k=>{ if(this.powerUpTimers[k]){ this.powerUpTimers[k].remove(); this.powerUpTimers[k]=null; } }); if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; const aB = this.balls.getMatching('active', true); if(aB.length > 0) { this.deactivateAnchira(aB); this.deactivateSindara(aB); this.deactivateBikara(aB); aB.forEach(b => { this.deactivateIndaraForBall(b); this.deactivateAnilaForBall(b); b.setData({isPenetrating: false, isFast: false, isSlow: false}); b.setData('activePowers', new Set()); b.setData('lastActivatedPower', null); this.resetBallSpeed(b); this.updateBallTint(b); }); } if(this.lives>0){ this.time.delayedCall(500,this.resetForNewLife,[],this); } else { this.time.delayedCall(500,this.gameOver,[],this); } }
    resetForNewLife() { if(this.isGameOver||this.isStageClearing) return; if(this.balls){ this.balls.clear(true,true); } if(this.paddle){ this.paddle.x=this.gameWidth/2; this.paddle.y=this.gameHeight-PADDLE_Y_OFFSET; const oW = this.paddle.getData('originalWidth'); if(oW) { this.paddle.setDisplaySize(oW, PADDLE_HEIGHT); if(this.paddle.body) this.paddle.body.setSize(oW, PADDLE_HEIGHT); } } let nB = null; if(this.paddle){ nB=this.createAndAddBall(this.paddle.x,this.paddle.y-PADDLE_HEIGHT/2-BALL_RADIUS); } else { nB=this.createAndAddBall(this.gameWidth/2,this.gameHeight-PADDLE_Y_OFFSET-PADDLE_HEIGHT/2-BALL_RADIUS); } this.isBallLaunched=false; this.setColliders(); }
    gameOver() { if(this.isGameOver) return; this.isGameOver=true; this.deactivateMakira(); this.deactivateVajra(); if(this.gameOverText)this.gameOverText.setVisible(true); this.physics.pause(); if(this.balls){ this.balls.getChildren().forEach(b=>{ if(b.active){ b.setVelocity(0,0); if(b.body)b.body.enable=false; } }); } Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove();}); this.powerUpTimers={}; if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove();this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove();this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; if(this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer=null; }
    stageClear() { if(this.isStageClearing||this.isGameOver) return; this.isStageClearing=true; this.deactivateMakira(); this.deactivateVajra(); try{ this.physics.pause(); Object.keys(this.powerUpTimers).forEach(k=>{ if(this.powerUpTimers[k]){ this.powerUpTimers[k].remove(); this.powerUpTimers[k]=null; } }); if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; const aB = this.balls.getMatching('active', true); if(aB.length > 0) { this.deactivateAnchira(aB); this.deactivateSindara(aB); this.deactivateBikara(aB); aB.forEach(b => { this.deactivateIndaraForBall(b); this.deactivateAnilaForBall(b); b.setData({isPenetrating: false, isFast: false, isSlow: false}); b.setData('activePowers', new Set()); b.setData('lastActivatedPower', null); }); } if(this.balls){ this.balls.getChildren().forEach(b=>{ if(b.active){ b.setVelocity(0,0).setVisible(false).setActive(false); if(b.body)b.body.enable=false; } }); } if(this.bricks){ this.bricks.getChildren().forEach(br=>{ if(br.getData('isMarkedByBikara'))br.setData('isMarkedByBikara',false); }); } if(this.powerUps){ this.powerUps.clear(true,true); } this.currentStage++; const mS=this.currentMode===GAME_MODE.ALL_STARS?10:12; if(this.currentStage>mS){ this.gameComplete(); } else { this.events.emit('updateStage',this.currentStage); this.time.delayedCall(1000,()=>{ if(!this.scene||!this.scene.isActive()||this.isGameOver) return; try{ this.createBricks(); this.isStageClearing=false; this.resetForNewLife(); this.physics.resume(); }catch(e){ this.isStageClearing=false; this.gameOver(); } },[],this); } }catch(e){ this.isStageClearing=false; this.gameOver(); } }
    gameComplete() { alert(`Clear! Score: ${this.score}`); this.returnToTitle(); }
    returnToTitle() { if(this.physics.world&&!this.physics.world.running) this.physics.resume(); if(this.scene.isActive('UIScene')){ this.scene.stop('UIScene'); } this.time.delayedCall(10,()=>{ if(this.scene&&this.scene.isActive()){ this.scene.start('TitleScene'); } }); }
    shutdown() { this.isGameOver=false; this.isStageClearing=false; this.deactivateMakira(); this.deactivateVajra(); Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove(false);}); this.powerUpTimers={}; if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(false); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(false); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(false); this.sindaraPenetrationTimer=null; if(this.makiraAttackTimer) this.makiraAttackTimer.remove(false); this.makiraAttackTimer=null; if(this.time) this.time.removeAllEvents(); if(this.input) this.input.removeAllListeners(); if(this.physics.world) this.physics.world.off('worldbounds',this.handleWorldBounds,this); this.events.removeAllListeners(); if(this.balls)this.balls.destroy(true);this.balls=null; if(this.bricks)this.bricks.destroy(true);this.bricks=null; if(this.powerUps)this.powerUps.destroy(true);this.powerUps=null; if(this.paddle)this.paddle.destroy();this.paddle=null; if(this.familiars)this.familiars.destroy(true);this.familiars=null; if(this.makiraBeams)this.makiraBeams.destroy(true);this.makiraBeams=null; this.ballPaddleCollider=null; this.ballBrickCollider=null; this.ballBrickOverlap=null; this.ballBallCollider=null; this.makiraBeamBrickOverlap = null; }
}

// --- UIScene ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText=null; this.scoreText=null; this.stageText=null; this.vajraGaugeText = null; this.gameSceneListenerAttached = false; }
    create() { this.gameWidth=this.scale.width; const tS={fontSize:'24px',fill:'#fff'}; this.livesText=this.add.text(16,16,'ライフ:',tS); this.stageText=this.add.text(this.gameWidth/2,16,'ステージ:',tS).setOrigin(0.5,0); this.scoreText=this.add.text(this.gameWidth-16,16,'スコア:',tS).setOrigin(1,0); this.vajraGaugeText = this.add.text(16, this.scale.height - 30, '奥義: -/-', { fontSize: '20px', fill: '#fff' }).setVisible(false); try{ const gS=this.scene.get('GameScene'); if(gS && gS.scene.settings.status === Phaser.Scenes.RUNNING){ this.registerGameEventListeners(gS); } else { this.scene.get('GameScene').events.once('create', this.registerGameEventListeners, this); } }catch(e){} this.events.on('shutdown',()=>{ this.unregisterGameEventListeners(); }); }
    registerGameEventListeners(gS) { if(!gS||!gS.events || this.gameSceneListenerAttached) return; this.unregisterGameEventListeners(gS); gS.events.on('updateLives',this.updateLivesDisplay,this); gS.events.on('updateScore',this.updateScoreDisplay,this); gS.events.on('updateStage',this.updateStageDisplay,this); gS.events.on('activateVajraUI',this.activateVajraUIDisplay,this); gS.events.on('updateVajraGauge',this.updateVajraGaugeDisplay,this); gS.events.on('deactivateVajraUI', this.deactivateVajraUIDisplay, this); this.gameSceneListenerAttached = true; try{ this.updateLivesDisplay(gS.lives); this.updateScoreDisplay(gS.score); this.updateStageDisplay(gS.currentStage); if(gS.isVajraSystemActive) this.activateVajraUIDisplay(gS.vajraGauge, VAJRA_GAUGE_MAX); else this.deactivateVajraUIDisplay(); }catch(e){} }
    unregisterGameEventListeners(gS = null) { const gs = gS || (this.scene.manager ? this.scene.manager.getScene('GameScene') : null); if (gs && gs.events) { gs.events.off('updateLives',this.updateLivesDisplay,this); gs.events.off('updateScore',this.updateScoreDisplay,this); gs.events.off('updateStage',this.updateStageDisplay,this); gs.events.off('activateVajraUI',this.activateVajraUIDisplay,this); gs.events.off('updateVajraGauge',this.updateVajraGaugeDisplay,this); gs.events.off('deactivateVajraUI', this.deactivateVajraUIDisplay, this); gs.events.off('create', this.registerGameEventListeners, this); } this.gameSceneListenerAttached = false; }
    updateLivesDisplay(l){if(this.livesText)this.livesText.setText(`ライフ: ${l}`);} updateScoreDisplay(s){if(this.scoreText)this.scoreText.setText(`スコア: ${s}`);} updateStageDisplay(st){if(this.stageText)this.stageText.setText(`ステージ: ${st}`);}
    activateVajraUIDisplay(iV,mV){ if(this.vajraGaugeText){ this.vajraGaugeText.setText(`奥義: ${iV}/${mV}`).setVisible(true); } } updateVajraGaugeDisplay(cV){ if(this.vajraGaugeText&&this.vajraGaugeText.visible){ this.vajraGaugeText.setText(`奥義: ${cV}/${VAJRA_GAUGE_MAX}`); } } deactivateVajraUIDisplay(){ if(this.vajraGaugeText){ this.vajraGaugeText.setVisible(false); } }
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
window.onload = () => { const game = new Phaser.Game(config); };