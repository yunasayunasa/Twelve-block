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

const POWERUP_DROP_RATE = 0.7; // 通常アイテムのドロップ率 (バイシュラ除く)
const BAISRAVA_DROP_RATE = 0.02; // ★ バイシュラの特別ドロップ率 (2%)
const POWERUP_SIZE = 20; // ★ アイテムサイズを大きく
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
    [POWERUP_TYPES.MAKORA]: 0xffffff, // マコラは白
};
const MAKORA_COPYABLE_POWERS = [
    POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA,
    POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA,
    POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA
];

const BIKARA_COLORS = { yin: 0x444444, yang: 0xfffafa };
const POWERUP_DURATION = {
    [POWERUP_TYPES.KUBIRA]: 10000, [POWERUP_TYPES.SHATORA]: 3000, [POWERUP_TYPES.HAILA]: 10000,
    [POWERUP_TYPES.MAKIRA]: 6667 // ★ マキラ効果時間を 10000 * 2/3 に変更
};
const BIKARA_YANG_COUNT_MAX = 2;
const INDARA_MAX_HOMING_COUNT = 3;
const NORMAL_BALL_SPEED = Math.abs(BALL_INITIAL_VELOCITY_Y);
const BALL_SPEED_MODIFIERS = { [POWERUP_TYPES.SHATORA]: 3.0, [POWERUP_TYPES.HAILA]: 0.3 };
const SINDARA_ATTRACTION_DELAY = 3000;
const SINDARA_ATTRACTION_FORCE = 400;
const SINDARA_MERGE_DURATION = 500; // 合体演出（isMerging=true）の時間
const SINDARA_POST_MERGE_PENETRATION_DURATION = 2000; // ★ 合体後の追加貫通時間 (2秒)
const SINDARA_ATTRACT_COLOR = 0xa52a2a;
const SINDARA_MERGE_COLOR = 0xff4500; // isMerging=true の間の色
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
        this.sindaraAttractionTimer=null; this.sindaraMergeTimer=null;
        this.sindaraPenetrationTimer = null; // ★ シンダラ合体後貫通タイマー用
        this.isStageClearing=false; this.isGameOver=false;
        this.isVajraSystemActive=false; this.vajraGauge=0;
        this.isMakiraActive=false; this.familiars=null; this.makiraBeams=null; this.makiraAttackTimer=null; this.makiraBeamBrickOverlap = null;
    }

    init(data){
        this.currentMode=data.mode||GAME_MODE.NORMAL; this.lives=(this.currentMode===GAME_MODE.ALL_STARS)?1:3; this.isBallLaunched=false; this.currentStage=1; this.score=0;
        Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove();}); this.powerUpTimers={};
        if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null;
        if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null;
        if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer = null; // ★ リセット追加
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
        if(activeBallCount===0&&this.isBallLaunched&&!this.isStageClearing&&this.lives>0){ console.log(">>> Update: No active balls, losing life."); this.loseLife(); return; }
        this.powerUps.children.each(pu=>{ if(pu.active&&pu.y>this.gameHeight+POWERUP_SIZE) { pu.destroy(); } });
        if(this.balls.countActive(true)===1){ const lastBall=this.balls.getFirstAlive(); if(lastBall&&lastBall.getData('isAnchira')){ this.deactivateAnchira([lastBall]); this.updateBallTint(lastBall); } }
        if(this.isMakiraActive&&this.paddle&&this.familiars){ const paddleX=this.paddle.x; const familiarY=this.paddle.y-PADDLE_HEIGHT/2-MAKIRA_FAMILIAR_SIZE; const children = this.familiars.getChildren(); if(children.length>=1 && children[0].active) children[0].setPosition(paddleX-MAKIRA_FAMILIAR_OFFSET, familiarY); if(children.length>=2 && children[1].active) children[1].setPosition(paddleX+MAKIRA_FAMILIAR_OFFSET, familiarY); }
        if(this.makiraBeams){ this.makiraBeams.children.each(bm=>{ if(bm.active&&bm.y<-MAKIRA_BEAM_HEIGHT) { bm.destroy(); } }); }
    }

    setColliders(){
        if(this.ballPaddleCollider)this.ballPaddleCollider.destroy(); if(this.ballBrickCollider)this.ballBrickCollider.destroy(); if(this.ballBrickOverlap)this.ballBrickOverlap.destroy(); if(this.ballBallCollider)this.ballBallCollider.destroy(); if(this.makiraBeamBrickOverlap) this.makiraBeamBrickOverlap.destroy();
        if(!this.balls||!this.paddle||!this.bricks){ console.error("SetColliders: Missing objects."); return; }
        this.ballPaddleCollider=this.physics.add.collider(this.paddle,this.balls,this.hitPaddle,null,this);
        this.ballBrickCollider=this.physics.add.collider(this.bricks,this.balls,this.hitBrick, (brick, ball)=>{ const isBikara = ball.getData('isBikara'); const isPenetrating = ball.getData('isPenetrating'); const isMerging = ball.getData('isSindara') && ball.getData('isMerging'); if(isBikara || isPenetrating || isMerging) return false; return true; },this);
        this.ballBrickOverlap=this.physics.add.overlap(this.balls,this.bricks,this.handleBallBrickOverlap, (ball, brick)=>{ return ball.getData('isPenetrating') || (ball.getData('isSindara') && (ball.getData('isAttracting') || ball.getData('isMerging'))) || ball.getData('isBikara'); },this);
        this.ballBallCollider=this.physics.add.collider(this.balls,this.balls,this.handleBallCollision, (ball1, ball2)=>{ return ball1.getData('isSindara') && ball2.getData('isSindara') && ball1.getData('isAttracting') && ball2.getData('isAttracting'); },this);
        if (this.makiraBeams && this.bricks) { this.makiraBeamBrickOverlap = this.physics.add.overlap( this.makiraBeams, this.bricks, this.hitBrickWithMakiraBeam, null, this); console.log(">>> Makira beam overlap SET."); } else { console.warn(">>> Makira beams or bricks not ready for overlap setting."); }
        console.log("Colliders set/reset.");
    }

    createAndAddBall(x,y,vx=0,vy=0,data=null){
        const ball=this.balls.create(x,y,null).setDisplaySize(BALL_RADIUS*2,BALL_RADIUS*2).setTint(DEFAULT_BALL_COLOR).setCircle(BALL_RADIUS).setCollideWorldBounds(true).setBounce(1);
        if(ball.body){ ball.setVelocity(vx,vy); ball.body.onWorldBounds=true; } else{ console.error("Failed to create ball physics body!"); ball.destroy(); return null; }
        ball.setData({ activePowers: data ? new Set(data.activePowers) : new Set(), lastActivatedPower: data ? data.lastActivatedPower : null, isPenetrating: data ? data.isPenetrating : false, isFast: data ? data.isFast : false, isSlow: data ? data.isSlow : false, isAnchira: data ? data.isAnchira : false, isSindara: data ? data.isSindara : false, sindaraPartner: null, isAttracting: false, isMerging: false, isBikara: data ? data.isBikara : false, bikaraState: data ? data.bikaraState : null, bikaraYangCount: 0, isIndaraActive: data ? data.isIndaraActive : false, indaraHomingCount: data ? data.indaraHomingCount : 0, isAnilaActive: data ? data.isAnilaActive : false });
        if(data){ this.updateBallTint(ball); if(ball.getData('isFast')) this.applySpeedModifier(ball,POWERUP_TYPES.SHATORA); else if(ball.getData('isSlow')) this.applySpeedModifier(ball,POWERUP_TYPES.HAILA); } return ball;
    }

    launchBall(){ if(!this.isBallLaunched&&this.balls){ const firstBall=this.balls.getFirstAlive(); if(firstBall){ const initialVx=Phaser.Math.Between(BALL_INITIAL_VELOCITY_X_RANGE[0],BALL_INITIAL_VELOCITY_X_RANGE[1]); firstBall.setVelocity(initialVx,BALL_INITIAL_VELOCITY_Y); this.isBallLaunched=true; console.log("Ball launched!"); } } }

    createBricks(){
        if(this.bricks){ this.bricks.clear(true,true); this.bricks.destroy(); } this.bricks=this.physics.add.staticGroup();
        const brickWidth=this.gameWidth*BRICK_WIDTH_RATIO; const totalBrickWidth=BRICK_COLS*brickWidth+(BRICK_COLS-1)*BRICK_SPACING; const offsetX=(this.gameWidth-totalBrickWidth)/2; const rowsToCreate=this.currentMode===GAME_MODE.ALL_STARS?BRICK_ROWS+2:BRICK_ROWS;
        for(let i=0;i<rowsToCreate;i++){ for(let j=0;j<BRICK_COLS;j++){ const brickX=offsetX+j*(brickWidth+BRICK_SPACING)+brickWidth/2; const brickY=BRICK_OFFSET_TOP+i*(BRICK_HEIGHT+BRICK_SPACING)+BRICK_HEIGHT/2; const randomColor=Phaser.Utils.Array.GetRandom(BRICK_COLORS); const brick=this.bricks.create(brickX,brickY,null).setDisplaySize(brickWidth,BRICK_HEIGHT).setTint(randomColor); brick.setData({ hits:1, originalTint:randomColor, isMarkedByBikara:false }); brick.refreshBody(); } }
        console.log(`Bricks created:${this.bricks.getLength()}`); this.setColliders();
    }

    hitPaddle(paddle,ball){
        if(!paddle||!ball||!ball.active||!ball.body)return; let diff=ball.x-paddle.x; const maxDiff=paddle.displayWidth/2; let influence=diff/maxDiff; influence=Phaser.Math.Clamp(influence,-1,1); const maxVx=NORMAL_BALL_SPEED*0.8; let newVx=maxVx*influence; const minVy=NORMAL_BALL_SPEED*0.5; let currentVy=ball.body.velocity.y; let newVy=-Math.abs(currentVy); if(Math.abs(newVy)<minVy) newVy=-minVy; let speedMultiplier=1.0; if(ball.getData('isFast')) speedMultiplier=BALL_SPEED_MODIFIERS[POWERUP_TYPES.SHATORA]; else if(ball.getData('isSlow')) speedMultiplier=BALL_SPEED_MODIFIERS[POWERUP_TYPES.HAILA]; const targetSpeed=NORMAL_BALL_SPEED*speedMultiplier; const newVelocity=new Phaser.Math.Vector2(newVx,newVy).normalize().scale(targetSpeed); ball.setVelocity(newVelocity.x,newVelocity.y); if(ball.getData('isBikara')) this.switchBikaraState(ball); if(ball.getData('isIndaraActive')){ console.log("Indara deactivated by paddle hit."); this.deactivateIndaraForBall(ball); this.updateBallTint(ball); }
    }

    // ブロック破壊時の共通処理（スコア加算、ゲージ増加、アイテムドロップ判定）
    handleBrickDestruction(brick) {
        const brickX = brick.x;
        const brickY = brick.y;

        brick.disableBody(true, true);
        this.score += 10;
        this.events.emit('updateScore', this.score);
        this.increaseVajraGauge();

        // ★ バイシュラ特別ドロップ判定 (2%)
        if (Phaser.Math.FloatBetween(0, 1) < BAISRAVA_DROP_RATE) {
            console.log(">>> Dropping Baisrava (Special Chance)!");
            this.dropSpecificPowerUp(brickX, brickY, POWERUP_TYPES.BAISRAVA);
            return true; // バイシュラがドロップしたら通常のドロップはしない
        }

        // ★ 通常のパワーアップドロップ判定 (70%)
        if (Phaser.Math.FloatBetween(0, 1) < POWERUP_DROP_RATE) {
            this.dropPowerUp(brickX, brickY); // バイシュラを除いたリストからドロップ
        }

        return false; // 通常ドロップ（またはドロップなし）
    }

    hitBrick(brick,ball){
        if(!brick||!ball||!brick.active||!ball.active||this.isStageClearing)return;
        this.handleBrickDestruction(brick); // ★ 共通処理呼び出し
        if(!this.isStageClearing&&this.bricks.countActive(true)===0){ console.log("Last brick hit (normal collision)!"); this.stageClear(); }
    }

    handleBallBrickOverlap(ball,brick){
        if(!ball||!brick||!ball.active||!brick.active||this.isStageClearing)return;
        const isPenetrating = ball.getData('isPenetrating'); const isSindaraAttracting = ball.getData('isSindara') && ball.getData('isAttracting'); const isSindaraMerging = ball.getData('isSindara') && ball.getData('isMerging'); const isBikara = ball.getData('isBikara'); const bikaraState = ball.getData('bikaraState');
        if(isBikara){ if(bikaraState==='yin'){ this.markBrickByBikara(brick); return; } else if(bikaraState==='yang'){ this.handleBikaraYangDestroy(ball,brick); return; } else { console.warn(`>>> Overlap: Bikara unexpected state:${bikaraState}`); return; } }
        if(isPenetrating || isSindaraAttracting || isSindaraMerging){
            this.handleBrickDestruction(brick); // ★ 共通処理呼び出し
            if(!this.isStageClearing&&this.bricks.countActive(true)===0){ console.log("Last brick hit (overlap collision)!"); this.stageClear(); } return;
        }
    }

    handleBikaraYangDestroy(ball,hitBrick){
        if(!ball||!ball.active||!ball.getData('isBikara')||ball.getData('bikaraState')!=='yang'){ return; }
        let destroyedCount=0; const markedToDestroy=[]; if(hitBrick.active){ markedToDestroy.push(hitBrick); hitBrick.setData('isMarkedByBikara',false); }
        this.bricks.getChildren().forEach(br=>{ if(br.active && br.getData('isMarkedByBikara') && !markedToDestroy.includes(br)){ markedToDestroy.push(br); br.setData('isMarkedByBikara',false); } });
        markedToDestroy.forEach(br=>{
             this.handleBrickDestruction(br); // ★ 共通処理呼び出し（ドロップ判定含む）
             destroyedCount++;
        });
        if(destroyedCount>0){ /* スコア更新は共通処理内 */ }
        let currentYangCount=ball.getData('bikaraYangCount')||0; currentYangCount++; ball.setData('bikaraYangCount',currentYangCount);
        if(!this.isStageClearing&&this.bricks.countActive(true)===0){ this.stageClear(); } else if(currentYangCount>=BIKARA_YANG_COUNT_MAX){ this.deactivateBikara([ball]); this.updateBallTint(ball); }
    }

    // ★ 特定のパワーアップを確実にドロップさせる関数
    dropSpecificPowerUp(x, y, type) {
        if (!type || !POWERUP_COLORS[type]) {
            console.error(`Cannot drop specific powerup: Invalid type ${type}`);
            return;
        }
        const color = POWERUP_COLORS[type];
        const powerUp = this.powerUps.create(x, y, null)
            .setDisplaySize(POWERUP_SIZE, POWERUP_SIZE) // サイズ適用
            .setTint(color)
            .setData('type', type);
        if(powerUp.body){
            powerUp.setVelocity(0, POWERUP_SPEED_Y); powerUp.body.setCollideWorldBounds(false); powerUp.body.setAllowGravity(false);
        } else { console.error("Failed to get specific powerup physics body!"); powerUp.destroy(); }
    }

    // 通常のパワーアップドロップ（バイシュラを除く）
    dropPowerUp(x,y){
        // ★ ドロップ候補リストからバイシュラを除外
        const availableTypes = [
            POWERUP_TYPES.KUBIRA, POWERUP_TYPES.SHATORA, POWERUP_TYPES.HAILA, POWERUP_TYPES.ANCHIRA,
            POWERUP_TYPES.SINDARA, POWERUP_TYPES.BIKARA, POWERUP_TYPES.INDARA, POWERUP_TYPES.ANILA,
            /* BAISRAVA 除外 */ POWERUP_TYPES.VAJRA, POWERUP_TYPES.MAKIRA, POWERUP_TYPES.MAKORA
        ];
        // TODO: モードによる絞り込み (現仕様では未実装)

        const type = Phaser.Utils.Array.GetRandom(availableTypes);
        this.dropSpecificPowerUp(x, y, type); // ★ 特定ドロップ関数を呼び出す
    }

    collectPowerUp(paddle,powerUp){
        if(!powerUp||!powerUp.active||this.isStageClearing)return; const type = powerUp.getData('type'); if(!type){ console.warn("Collected powerup has no type!"); powerUp.destroy(); return; }
        powerUp.destroy(); console.log(`Collected powerup: ${type}`);
        if(type===POWERUP_TYPES.BAISRAVA){ this.activateBaisrava(); return; } if(type===POWERUP_TYPES.VAJRA){ this.activateVajra(); return; } if(type===POWERUP_TYPES.MAKIRA){ this.activateMakira(); return; } if(type===POWERUP_TYPES.MAKORA){ this.activateMakora(); return; }
        if(type===POWERUP_TYPES.ANCHIRA||type===POWERUP_TYPES.SINDARA){ if(this.balls.countActive(true)>1){ console.log("Multiple balls exist. Keeping the furthest one."); this.keepFurthestBall(); } }
        this.activatePower(type);
    }

    activateMakora() {
        console.log("Makora activating (Copycat)..."); const copiedPowerType = Phaser.Utils.Array.GetRandom(MAKORA_COPYABLE_POWERS); console.log(`Makora decided to copy: ${copiedPowerType}`);
        switch(copiedPowerType) {
            case POWERUP_TYPES.KUBIRA: case POWERUP_TYPES.SHATORA: case POWERUP_TYPES.HAILA: case POWERUP_TYPES.BIKARA: case POWERUP_TYPES.INDARA: case POWERUP_TYPES.ANILA: this.activatePower(copiedPowerType); break;
            case POWERUP_TYPES.ANCHIRA: case POWERUP_TYPES.SINDARA: if(this.balls.countActive(true)>1){ this.keepFurthestBall(); } this.activatePower(copiedPowerType); break;
            case POWERUP_TYPES.VAJRA: this.activateVajra(); break; case POWERUP_TYPES.MAKIRA: this.activateMakira(); break; default: console.error(`Makora copied an invalid power type: ${copiedPowerType}`);
        }
    }

    keepFurthestBall(){ const activeBalls = this.balls.getMatching('active',true); if(activeBalls.length<=1) return; let furthestBall = null; let maxDistanceSq = -1; const paddlePos = new Phaser.Math.Vector2(this.paddle.x, this.paddle.y); activeBalls.forEach(ball=>{ const distanceSq = Phaser.Math.Distance.Squared(paddlePos.x, paddlePos.y, ball.x, ball.y); if(distanceSq > maxDistanceSq){ maxDistanceSq = distanceSq; furthestBall = ball; } }); activeBalls.forEach(ball=>{ if(ball !== furthestBall){ ball.destroy(); } }); console.log("Kept the furthest ball."); }

    activatePower(type){
        console.log(`Activating power on ball(s): ${type}`); const targetBalls = this.balls.getMatching('active',true); if(targetBalls.length===0) { console.warn("No active balls to apply power."); return; }
        if(POWERUP_DURATION[type]){ if(this.powerUpTimers[type]){ this.powerUpTimers[type].remove(); } }
        switch(type){
            case POWERUP_TYPES.KUBIRA: this.activateKubira(targetBalls); break; case POWERUP_TYPES.SHATORA: this.activateShatora(targetBalls); break; case POWERUP_TYPES.HAILA: this.activateHaira(targetBalls); break;
            case POWERUP_TYPES.ANCHIRA: if (targetBalls.length === 1) this.activateAnchira(targetBalls[0]); else console.warn("Anchira activation skipped: More than one ball exists."); break;
            case POWERUP_TYPES.SINDARA: if (targetBalls.length === 1) this.activateSindara(targetBalls[0]); else console.warn("Sindara activation skipped: More than one ball exists."); break;
            case POWERUP_TYPES.BIKARA: this.activateBikara(targetBalls); break; case POWERUP_TYPES.INDARA: this.activateIndara(targetBalls); break; case POWERUP_TYPES.ANILA: this.activateAnila(targetBalls); break; default: console.warn(`Unknown power type to activate on ball: ${type}`); return;
        }
        targetBalls.forEach(b=>{ if(b.active){ b.getData('activePowers').add(type); b.setData('lastActivatedPower',type); this.updateBallTint(b); } });
        const duration = POWERUP_DURATION[type]; if(duration){ this.powerUpTimers[type]=this.time.delayedCall( duration, ()=>{ console.log(`Power expired: ${type}`); this.deactivatePowerByType(type); this.powerUpTimers[type]=null; }, [], this ); console.log(`${type} timer started (${duration}ms)`); }
    }

    deactivatePowerByType(type){
        console.log(`Deactivating power by type: ${type}`); const targetBalls = this.balls.getMatching('active',true); if(targetBalls.length===0) return;
        if(type===POWERUP_TYPES.MAKIRA || type===POWERUP_TYPES.VAJRA || type === POWERUP_TYPES.MAKORA){ return; }
        switch(type){
            case POWERUP_TYPES.KUBIRA: this.deactivateKubira(targetBalls); break; case POWERUP_TYPES.SHATORA: this.deactivateShatora(targetBalls); break; case POWERUP_TYPES.HAILA: this.deactivateHaira(targetBalls); break; default: console.warn(`Cannot deactivate power by type (or no timer): ${type}`); return;
        }
        targetBalls.forEach(b=>{ if(b.active){ b.getData('activePowers').delete(type); this.updateBallTint(b); } });
    }

    updateBallTint(ball){
        if(!ball||!ball.active)return; const activePowers = ball.getData('activePowers'); let tintColor = DEFAULT_BALL_COLOR;
        if(activePowers && activePowers.size > 0){
            const lastPower = ball.getData('lastActivatedPower'); if(lastPower && activePowers.has(lastPower)){ if(lastPower === POWERUP_TYPES.BIKARA) { tintColor = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin; } else if(lastPower === POWERUP_TYPES.SINDARA) { if(ball.getData('isMerging')) tintColor = SINDARA_MERGE_COLOR; else if(ball.getData('isAttracting')) tintColor = SINDARA_ATTRACT_COLOR; else tintColor = POWERUP_COLORS[lastPower]; } else { tintColor = POWERUP_COLORS[lastPower] || DEFAULT_BALL_COLOR; } } else { const remainingPowers = Array.from(activePowers); if(remainingPowers.length > 0) { const newLastPower = remainingPowers[remainingPowers.length-1]; if(newLastPower === POWERUP_TYPES.BIKARA) { tintColor = BIKARA_COLORS[ball.getData('bikaraState')] || BIKARA_COLORS.yin; } else if(newLastPower === POWERUP_TYPES.SINDARA) { if(ball.getData('isMerging')) tintColor = SINDARA_MERGE_COLOR; else if(ball.getData('isAttracting')) tintColor = SINDARA_ATTRACT_COLOR; else tintColor = POWERUP_COLORS[newLastPower]; } else { tintColor = POWERUP_COLORS[newLastPower] || DEFAULT_BALL_COLOR; } ball.setData('lastActivatedPower', newLastPower); } }
        } ball.setTint(tintColor);
    }

    // --- 能力別 Activate/Deactivate ---
    activateKubira(balls){ balls.forEach(b=>b.setData('isPenetrating',true)); console.log("Kubira activated (Penetrating ON)."); }
    deactivateKubira(balls){ balls.forEach(b=>{ if(!b.getData('isSindara')||(!b.getData('isAttracting')&&!b.getData('isMerging'))) { b.setData('isPenetrating',false); } }); console.log("Kubira deactivated (Penetrating OFF)."); }
    applySpeedModifier(ball,type){ if(!ball||!ball.active||!ball.body)return; const modifier = BALL_SPEED_MODIFIERS[type]; if(!modifier)return; const currentVelocity = ball.body.velocity; const direction = currentVelocity.length()>0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0,-1); const newSpeed = NORMAL_BALL_SPEED * modifier; ball.setVelocity(direction.x * newSpeed, direction.y * newSpeed); }
    resetBallSpeed(ball){ if(!ball||!ball.active||!ball.body)return; if(ball.getData('isFast')) { this.applySpeedModifier(ball, POWERUP_TYPES.SHATORA); } else if(ball.getData('isSlow')) { this.applySpeedModifier(ball, POWERUP_TYPES.HAILA); } else { const currentVelocity = ball.body.velocity; const direction = currentVelocity.length()>0 ? currentVelocity.clone().normalize() : new Phaser.Math.Vector2(0,-1); ball.setVelocity(direction.x * NORMAL_BALL_SPEED, direction.y * NORMAL_BALL_SPEED); } }
    activateShatora(balls){ balls.forEach(b=>{ b.setData({isFast:true,isSlow:false}); this.applySpeedModifier(b,POWERUP_TYPES.SHATORA); }); console.log("Shatora activated (Fast ON)."); }
    deactivateShatora(balls){ balls.forEach(b=>{ if(b.getData('isFast')){ b.setData('isFast',false); this.resetBallSpeed(b); } }); console.log("Shatora deactivated (Fast OFF)."); }
    activateHaira(balls){ balls.forEach(b=>{ b.setData({isSlow:true,isFast:false}); this.applySpeedModifier(b,POWERUP_TYPES.HAILA); }); console.log("Haira activated (Slow ON)."); }
    deactivateHaira(balls){ balls.forEach(b=>{ if(b.getData('isSlow')){ b.setData('isSlow',false); this.resetBallSpeed(b); } }); console.log("Haira deactivated (Slow OFF)."); }
    activateAnchira(sourceBall){ console.log("Anchira activating..."); if(!sourceBall||!sourceBall.active) return; sourceBall.setData('isAnchira',true); const x=sourceBall.x, y=sourceBall.y; const numToSpawn=3; const ballData = sourceBall.data.getAll(); for(let i=0;i<numToSpawn;i++){ const offsetX=Phaser.Math.Between(-5,5); const offsetY=Phaser.Math.Between(-5,5); const vx=Phaser.Math.Between(-150,150); const vy=-Math.abs(Phaser.Math.Between(NORMAL_BALL_SPEED*0.5, NORMAL_BALL_SPEED*0.8)); const newBall = this.createAndAddBall(x+offsetX, y+offsetY, vx, vy, ballData); if(newBall) newBall.setData('isAnchira', true); } }
    deactivateAnchira(balls){ balls.forEach(b=>{ if(b.getData('isAnchira')){ b.setData('isAnchira',false); b.getData('activePowers').delete(POWERUP_TYPES.ANCHIRA); } }); }
    activateSindara(sourceBall){ console.log("Sindara activating..."); if(!sourceBall||!sourceBall.active) { sourceBall?.getData('activePowers').delete(POWERUP_TYPES.SINDARA); this.updateBallTint(sourceBall); return; } const x=sourceBall.x, y=sourceBall.y; const ballData = sourceBall.data.getAll(); const vx=Phaser.Math.Between(-150,150); const vy=-Math.abs(Phaser.Math.Between(NORMAL_BALL_SPEED*0.5, NORMAL_BALL_SPEED*0.8)); const partnerBall = this.createAndAddBall(x+Phaser.Math.Between(-5,5), y+Phaser.Math.Between(-5,5), vx, vy, ballData); if(partnerBall){ sourceBall.setData({ isSindara:true, sindaraPartner:partnerBall, isAttracting:false, isMerging:false }); partnerBall.setData({ isSindara:true, sindaraPartner:sourceBall, isAttracting:false, isMerging:false }); if(this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=this.time.delayedCall( SINDARA_ATTRACTION_DELAY, ()=>{ this.startSindaraAttraction(sourceBall,partnerBall); }, [], this ); } else { console.error("Sindara: Failed partner."); sourceBall.getData('activePowers').delete(POWERUP_TYPES.SINDARA); this.updateBallTint(sourceBall); } }
    startSindaraAttraction(ball1,ball2){ console.log("Sindara attraction starting..."); this.sindaraAttractionTimer=null; if(!ball1||!ball2||!ball1.active||!ball2.active||!ball1.getData('isSindara')||!ball2.getData('isSindara')){ const activeSindaraBalls=this.balls.getMatching('isSindara',true); if(activeSindaraBalls.length>0){ this.deactivateSindara(activeSindaraBalls); activeSindaraBalls.forEach(b=>this.updateBallTint(b)); } return; } ball1.setData({isAttracting:true, isPenetrating:true}); ball2.setData({isAttracting:true, isPenetrating:true}); this.updateBallTint(ball1); this.updateBallTint(ball2); }
    updateSindaraAttraction(ball){ const partner = ball.getData('sindaraPartner'); if(partner && partner.active && ball.active && ball.getData('isAttracting') && partner.getData('isAttracting') && !ball.getData('isMerging') && !partner.getData('isMerging')) { this.physics.moveToObject(ball, partner, SINDARA_ATTRACTION_FORCE); } }
    handleBallCollision(ball1,ball2){ if(ball1.active && ball2.active && ball1.getData('sindaraPartner') === ball2){ this.mergeSindaraBalls(ball1,ball2); } }
    mergeSindaraBalls(ballToKeep,ballToRemove){ console.log("Sindara merging starting..."); const mergeX = (ballToKeep.x + ballToRemove.x)/2; const mergeY = (ballToKeep.y + ballToRemove.y)/2; ballToKeep.setPosition(mergeX, mergeY); ballToRemove.destroy(); ballToKeep.setData({ isMerging:true, isAttracting:false, isPenetrating:true, sindaraPartner:null }); this.updateBallTint(ballToKeep); if(this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); // ★ 既存の貫通タイマーがあればクリア
        this.sindaraMergeTimer=this.time.delayedCall( SINDARA_MERGE_DURATION, ()=>{ this.finishSindaraMerge(ballToKeep); }, [], this ); if(this.sindaraAttractionTimer){ this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; } }
    finishSindaraMerge(mergedBall){ console.log("Finishing Sindara merge (visual)..."); this.sindaraMergeTimer=null; if(!mergedBall||!mergedBall.active) return;
        mergedBall.setData({ isMerging:false }); // ★ isMerging のみ false に
        // isPenetrating は true のまま！
        this.updateBallTint(mergedBall); // ★ 色を戻す（クビラ効果があれば紫、なければ通常色など）
        // ★ ここで追加の貫通タイマーをセット
        if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove();
        this.sindaraPenetrationTimer = this.time.delayedCall(
            SINDARA_POST_MERGE_PENETRATION_DURATION, // 2秒後
            () => { this.deactivateSindaraPenetration(mergedBall); }, // 貫通解除関数を呼ぶ
            [], this
        );
        console.log(`Sindara post-merge penetration timer started (${SINDARA_POST_MERGE_PENETRATION_DURATION}ms).`);
    }
    // ★ シンダラ合体後の貫通解除用関数
    deactivateSindaraPenetration(ball) {
        console.log("Deactivating Sindara post-merge penetration...");
        this.sindaraPenetrationTimer = null;
        if (!ball || !ball.active) return;
        // クビラが有効でなければ貫通解除
        if (!ball.getData('activePowers').has(POWERUP_TYPES.KUBIRA)) {
            ball.setData('isPenetrating', false);
            console.log("Sindara penetration deactivated.");
        } else {
            console.log("Kubira is active, penetration remains.");
        }
         // シンダラ能力自体もここで解除する？ -> いや、分裂した時点で isSindara=true にしているので、合体完了（貫通解除）で isSindara=false にすべき
        if (ball.getData('isSindara')) {
             ball.setData('isSindara', false);
             ball.getData('activePowers').delete(POWERUP_TYPES.SINDARA);
             console.log("Sindara power fully deactivated.");
             this.resetBallSpeed(ball); // 念のため速度リセット
             this.updateBallTint(ball); // 色更新
        }
    }
    deactivateSindara(balls){ console.log("Deactivating Sindara for ball(s)..."); if(this.sindaraAttractionTimer) this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer) this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; // ★ 貫通タイマーもクリア
        balls.forEach(b=>{ if(b.active && b.getData('isSindara')){ b.setData({ isSindara:false, sindaraPartner:null, isAttracting:false, isMerging:false }); if(!b.getData('activePowers').has(POWERUP_TYPES.KUBIRA)){ b.setData('isPenetrating',false); } b.getData('activePowers').delete(POWERUP_TYPES.SINDARA); } }); }
    activateBikara(balls){ balls.forEach(b=>{ b.setData({ isBikara:true, bikaraState:'yin', bikaraYangCount:0 }); this.updateBallTint(b); }); console.log("Bikara activated (State: yin)."); }
    deactivateBikara(balls){ balls.forEach(b=>{ if(b.getData('isBikara')){ b.setData({ isBikara:false, bikaraState:null, bikaraYangCount:0 }); b.getData('activePowers').delete(POWERUP_TYPES.BIKARA); } }); this.bricks.getChildren().forEach(br=>{ if(br.getData('isMarkedByBikara')){ br.setData('isMarkedByBikara',false); br.setTint(br.getData('originalTint')||0xffffff); } }); }
    switchBikaraState(ball){ if(!ball||!ball.active||!ball.getData('isBikara')) return; const currentState = ball.getData('bikaraState'); const newState = (currentState==='yin')?'yang':'yin'; ball.setData('bikaraState',newState); this.updateBallTint(ball); console.log(`Bikara state switched to: ${newState}`); }
    markBrickByBikara(brick){ if(!brick||!brick.active||brick.getData('isMarkedByBikara')) return; brick.setData('isMarkedByBikara',true); brick.setTint(BRICK_MARKED_COLOR); }
    activateIndara(balls){ balls.forEach(b=>b.setData({ isIndaraActive:true, indaraHomingCount:INDARA_MAX_HOMING_COUNT })); console.log(`Indara activated. Homing count: ${INDARA_MAX_HOMING_COUNT}`); }
    deactivateIndaraForBall(ball){ if(!ball||!ball.active||!ball.getData('isIndaraActive')) return; ball.setData({ isIndaraActive:false, indaraHomingCount:0 }); ball.getData('activePowers').delete(POWERUP_TYPES.INDARA); console.log("Indara deactivated for a ball."); }
    handleWorldBounds(body,up,down,left,right){ const ball=body.gameObject; if(!ball||!(ball instanceof Phaser.Physics.Arcade.Image)||!this.balls.contains(ball)||!ball.active) return; if(ball.getData('isIndaraActive') && ball.getData('indaraHomingCount')>0 && (up||left||right)) { const currentHomingCount=ball.getData('indaraHomingCount'); const activeBricks = this.bricks.getMatching('active',true); if(activeBricks.length > 0){ let closestBrick = null; let minDistanceSq = Infinity; const ballCenter = ball.body.center; activeBricks.forEach(brick=>{ const distanceSq = Phaser.Math.Distance.Squared( ballCenter.x, ballCenter.y, brick.body.center.x, brick.body.center.y ); if(distanceSq < minDistanceSq){ minDistanceSq = distanceSq; closestBrick = brick; } }); if(closestBrick){ console.log("Indara Homing! Ignoring physics, redirecting to nearest brick."); const currentSpeed = ball.body.velocity.length(); // 現在の速度を維持
                        const angle = Phaser.Math.Angle.BetweenPoints(ballCenter, closestBrick.body.center); // ★ 最近接ブロックへの角度計算
                        // ★ 物理法則無視っぽく、直接方向を設定
                        this.physics.velocityFromAngle(angle, currentSpeed, ball.body.velocity);
                        const newHomingCount = currentHomingCount - 1; ball.setData('indaraHomingCount',newHomingCount); console.log(`Indara homing used. Remaining: ${newHomingCount}`); if(newHomingCount <= 0){ this.deactivateIndaraForBall(ball); this.updateBallTint(ball); } } } } }
    activateAnila(balls){ balls.forEach(b=>{ if(!b.getData('isAnilaActive')){ b.setData('isAnilaActive',true); } }); }
    deactivateAnilaForBall(ball){ if(!ball||!ball.active||!ball.getData('isAnilaActive'))return; ball.setData('isAnilaActive',false); ball.getData('activePowers').delete(POWERUP_TYPES.ANILA); }
    triggerAnilaBounce(ball){ if(!ball||!ball.active||!ball.getData('isAnilaActive')) return; console.log("Anila bounce!"); const currentVy = ball.body.velocity.y; const bounceVy = -Math.abs(currentVy > -10 ? BALL_INITIAL_VELOCITY_Y * 0.7 : currentVy * 0.8); ball.setVelocityY(bounceVy); ball.y = this.gameHeight - PADDLE_Y_OFFSET - PADDLE_HEIGHT; this.deactivateAnilaForBall(ball); this.updateBallTint(ball); }
    activateBaisrava(){ if(this.isStageClearing||this.isGameOver) return; console.log("Baisrava activating (Destroy all bricks)..."); const activeBricks = this.bricks.getMatching('active',true); let destroyedCount = 0; activeBricks.forEach(brick=>{ this.handleBrickDestruction(brick); destroyedCount++; }); if(destroyedCount>0){ console.log(`Baisrava destroyed ${destroyedCount} bricks.`); } this.stageClear(); }
    activateVajra(){ if(!this.isVajraSystemActive){ this.isVajraSystemActive=true; this.vajraGauge=0; this.events.emit('activateVajraUI',this.vajraGauge,VAJRA_GAUGE_MAX); } }
    increaseVajraGauge(){ if(this.isVajraSystemActive && !this.isStageClearing && !this.isGameOver){ this.vajraGauge+=VAJRA_GAUGE_INCREMENT; this.vajraGauge=Math.min(this.vajraGauge,VAJRA_GAUGE_MAX); this.events.emit('updateVajraGauge',this.vajraGauge); if(this.vajraGauge>=VAJRA_GAUGE_MAX){ this.triggerVajraDestroy(); this.deactivateVajra(); } } }
    triggerVajraDestroy(){ if(this.isStageClearing||this.isGameOver) return; const activeBricks = this.bricks.getMatching('active',true); if(activeBricks.length===0){ return; } const countToDestroy = Math.min(activeBricks.length,VAJRA_DESTROY_COUNT); const shuffledBricks = Phaser.Utils.Array.Shuffle(activeBricks); let destroyedCount=0; for(let i=0;i<countToDestroy;i++){ const brick = shuffledBricks[i]; if(brick&&brick.active){ this.handleBrickDestruction(brick); destroyedCount++; } } if(destroyedCount>0){ console.log(`Vajra destroyed ${destroyedCount}.`); } if(!this.isStageClearing && this.bricks.countActive(true)===0){ this.stageClear(); } }
    deactivateVajra() { if (this.isVajraSystemActive) { this.isVajraSystemActive = false; this.vajraGauge = 0; this.events.emit('deactivateVajraUI'); } }
    activateMakira() { console.log(">>> Activating Makira!"); if (!this.isMakiraActive) { this.isMakiraActive = true; if (this.familiars) this.familiars.clear(true, true); else this.familiars = this.physics.add.group(); this.createFamiliars(); if (this.makiraBeams) this.makiraBeams.clear(true, true); else this.makiraBeams = this.physics.add.group(); if (this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer = this.time.addEvent({ delay: MAKIRA_ATTACK_INTERVAL, callback: this.fireMakiraBeam, callbackScope: this, loop: true }); } const duration = POWERUP_DURATION[POWERUP_TYPES.MAKIRA]; if (this.powerUpTimers[POWERUP_TYPES.MAKIRA]) this.powerUpTimers[POWERUP_TYPES.MAKIRA].remove(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = this.time.delayedCall( duration, () => { this.deactivateMakira(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = null; }, [], this ); console.log(`>>> Makira timer started/restarted (${duration}ms).`); this.setColliders(); }
    deactivateMakira() { if (this.isMakiraActive) { this.isMakiraActive = false; if (this.makiraAttackTimer) { this.makiraAttackTimer.remove(); this.makiraAttackTimer = null; } if (this.powerUpTimers[POWERUP_TYPES.MAKIRA]) { this.powerUpTimers[POWERUP_TYPES.MAKIRA].remove(); this.powerUpTimers[POWERUP_TYPES.MAKIRA] = null; } if (this.familiars) { this.familiars.clear(true, true); } if (this.makiraBeams) { this.makiraBeams.clear(true, true); } } }
    createFamiliars() { if(!this.paddle) return; const paddleX=this.paddle.x; const familiarY=this.paddle.y-PADDLE_HEIGHT/2-MAKIRA_FAMILIAR_SIZE; const fL=this.familiars.create(paddleX-MAKIRA_FAMILIAR_OFFSET, familiarY, null).setDisplaySize(MAKIRA_FAMILIAR_SIZE*2, MAKIRA_FAMILIAR_SIZE*2).setTint(MAKIRA_FAMILIAR_COLOR); if(fL.body){ fL.body.setAllowGravity(false).setImmovable(true); } const fR=this.familiars.create(paddleX+MAKIRA_FAMILIAR_OFFSET, familiarY, null).setDisplaySize(MAKIRA_FAMILIAR_SIZE*2, MAKIRA_FAMILIAR_SIZE*2).setTint(MAKIRA_FAMILIAR_COLOR); if(fR.body){ fR.body.setAllowGravity(false).setImmovable(true); } }
    fireMakiraBeam() { if (!this.isMakiraActive || !this.familiars || this.familiars.countActive(true) === 0 || this.isStageClearing || this.isGameOver) return; this.familiars.getChildren().forEach(f => { if (f.active) { const beam = this.makiraBeams.create(f.x, f.y - MAKIRA_FAMILIAR_SIZE, null).setDisplaySize(MAKIRA_BEAM_WIDTH, MAKIRA_BEAM_HEIGHT).setTint(MAKIRA_BEAM_COLOR); if (beam && beam.body) { beam.setVelocity(0, -MAKIRA_BEAM_SPEED); beam.body.setAllowGravity(false); } else { if (beam) beam.destroy(); } } }); }
    hitBrickWithMakiraBeam(beam, brick) { if (!beam || !brick || !beam.active || !brick.active || this.isStageClearing || this.isGameOver) return; try { beam.destroy(); this.handleBrickDestruction(brick); // ★ 共通処理呼び出し
        if (!this.isStageClearing && this.bricks.countActive(true) === 0) { this.time.delayedCall(10, this.stageClear, [], this); } } catch(error) { console.error("ERROR in hitBrickWithMakiraBeam", error); if (beam && beam.active) { beam.setActive(false).setVisible(false); if(beam.body) beam.body.enable = false; } } }

    // --- ゲームフロー ---
    loseLife() {
        if(this.isStageClearing||this.isGameOver||this.lives<=0)return; console.log("Losing life.");
        this.deactivateMakira(); this.deactivateVajra(); this.lives--; this.events.emit('updateLives',this.lives); this.isBallLaunched=false;
        Object.keys(this.powerUpTimers).forEach(typeKey=>{ if(this.powerUpTimers[typeKey]){ this.powerUpTimers[typeKey].remove(); this.powerUpTimers[typeKey]=null; } });
        if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null;
        if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null;
        if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; // ★ クリア追加
        const activeBalls = this.balls.getMatching('active', true);
        if(activeBalls.length > 0) {
            this.deactivateAnchira(activeBalls); this.deactivateSindara(activeBalls); this.deactivateBikara(activeBalls);
            activeBalls.forEach(b => { this.deactivateIndaraForBall(b); this.deactivateAnilaForBall(b); b.setData({isPenetrating: false, isFast: false, isSlow: false}); b.setData('activePowers', new Set()); b.setData('lastActivatedPower', null); this.resetBallSpeed(b); this.updateBallTint(b); });
        }
        if(this.lives>0){ this.time.delayedCall(500,this.resetForNewLife,[],this); } else { this.time.delayedCall(500,this.gameOver,[],this); }
    }
    resetForNewLife() {
        if(this.isGameOver||this.isStageClearing) return; console.log(">>> resetForNewLife START");
        if(this.balls){ this.balls.clear(true,true); } if(this.paddle){ this.paddle.x=this.gameWidth/2; this.paddle.y=this.gameHeight-PADDLE_Y_OFFSET; const oW = this.paddle.getData('originalWidth'); if(oW) { this.paddle.setDisplaySize(oW, PADDLE_HEIGHT); if(this.paddle.body) this.paddle.body.setSize(oW, PADDLE_HEIGHT); } }
        let nB = null; if(this.paddle){ nB=this.createAndAddBall(this.paddle.x,this.paddle.y-PADDLE_HEIGHT/2-BALL_RADIUS); } else { nB=this.createAndAddBall(this.gameWidth/2,this.gameHeight-PADDLE_Y_OFFSET-PADDLE_HEIGHT/2-BALL_RADIUS); }
        if(!nB||!nB.active) console.error(">>> Failed new ball!"); this.isBallLaunched=false; this.setColliders(); console.log(">>> resetForNewLife END");
    }
    gameOver() {
        if(this.isGameOver) return; this.isGameOver=true; console.log("Game Over!"); this.deactivateMakira(); this.deactivateVajra();
        if(this.gameOverText)this.gameOverText.setVisible(true); this.physics.pause(); if(this.balls){ this.balls.getChildren().forEach(b=>{ if(b.active){ b.setVelocity(0,0); if(b.body)b.body.enable=false; } }); }
        Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove();}); this.powerUpTimers={};
        if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove();this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove();this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; // ★ クリア追加
        if(this.makiraAttackTimer) this.makiraAttackTimer.remove(); this.makiraAttackTimer=null;
    }
    stageClear() {
        if(this.isStageClearing||this.isGameOver) return; this.isStageClearing=true; console.log(`>>> Stage ${this.currentStage} Clear!`); this.deactivateMakira(); this.deactivateVajra();
        try{
            this.physics.pause(); Object.keys(this.powerUpTimers).forEach(k=>{ if(this.powerUpTimers[k]){ this.powerUpTimers[k].remove(); this.powerUpTimers[k]=null; } });
            if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(); this.sindaraPenetrationTimer=null; // ★ クリア追加
            const activeBalls = this.balls.getMatching('active', true); if(activeBalls.length > 0) { this.deactivateAnchira(activeBalls); this.deactivateSindara(activeBalls); this.deactivateBikara(activeBalls); activeBalls.forEach(b => { this.deactivateIndaraForBall(b); this.deactivateAnilaForBall(b); b.setData({isPenetrating: false, isFast: false, isSlow: false}); b.setData('activePowers', new Set()); b.setData('lastActivatedPower', null); }); }
            if(this.balls){ this.balls.getChildren().forEach(b=>{ if(b.active){ b.setVelocity(0,0).setVisible(false).setActive(false); if(b.body)b.body.enable=false; } }); }
            if(this.bricks){ this.bricks.getChildren().forEach(br=>{ if(br.getData('isMarkedByBikara'))br.setData('isMarkedByBikara',false); }); } if(this.powerUps){ this.powerUps.clear(true,true); }
            this.currentStage++; const maxStages=this.currentMode===GAME_MODE.ALL_STARS?10:12;
            if(this.currentStage>maxStages){ this.gameComplete(); } else { this.events.emit('updateStage',this.currentStage); this.time.delayedCall(1000,()=>{ if(!this.scene||!this.scene.isActive()||this.isGameOver) return; try{ this.createBricks(); this.isStageClearing=false; this.resetForNewLife(); this.physics.resume(); }catch(e){ console.error("E stage clear delay",e); this.isStageClearing=false; this.gameOver(); } },[],this); }
        }catch(e){ console.error("E stageClear",e); this.isStageClearing=false; this.gameOver(); }
    }
    gameComplete() { console.log("Game Complete!"); alert(`Game Clear! Score: ${this.score}`); this.returnToTitle(); }
    returnToTitle() {
        if(this.physics.world&&!this.physics.world.running) this.physics.resume(); if(this.scene.isActive('UIScene')){ this.scene.stop('UIScene'); }
        this.time.delayedCall(10,()=>{ if(this.scene&&this.scene.isActive()){ this.scene.start('TitleScene'); } });
    }
    shutdown() {
        console.log("GS shutdown"); this.isGameOver=false; this.isStageClearing=false; this.deactivateMakira(); this.deactivateVajra();
        Object.values(this.powerUpTimers).forEach(t=>{if(t)t.remove(false);}); this.powerUpTimers={};
        if(this.sindaraAttractionTimer)this.sindaraAttractionTimer.remove(false); this.sindaraAttractionTimer=null; if(this.sindaraMergeTimer)this.sindaraMergeTimer.remove(false); this.sindaraMergeTimer=null; if(this.sindaraPenetrationTimer) this.sindaraPenetrationTimer.remove(false); this.sindaraPenetrationTimer=null; // ★ クリア追加
        if(this.makiraAttackTimer) this.makiraAttackTimer.remove(false); this.makiraAttackTimer=null; if(this.time) this.time.removeAllEvents(); if(this.input) this.input.removeAllListeners(); if(this.physics.world) this.physics.world.off('worldbounds',this.handleWorldBounds,this); this.events.removeAllListeners();
        if(this.balls)this.balls.destroy(true);this.balls=null; if(this.bricks)this.bricks.destroy(true);this.bricks=null; if(this.powerUps)this.powerUps.destroy(true);this.powerUps=null; if(this.paddle)this.paddle.destroy();this.paddle=null; if(this.familiars)this.familiars.destroy(true);this.familiars=null; if(this.makiraBeams)this.makiraBeams.destroy(true);this.makiraBeams=null;
        this.ballPaddleCollider=null; this.ballBrickCollider=null; this.ballBrickOverlap=null; this.ballBallCollider=null; this.makiraBeamBrickOverlap = null; console.log("GS cleanup finished.");
    }
}

// --- UIScene ---
class UIScene extends Phaser.Scene {
    constructor() { super({ key: 'UIScene', active: false }); this.livesText=null; this.scoreText=null; this.stageText=null; this.vajraGaugeText = null; this.gameSceneListenerAttached = false; }
    create() {
        console.log("UIScene Create"); this.gameWidth=this.scale.width; const textStyle={fontSize:'24px',fill:'#fff'}; this.livesText=this.add.text(16,16,'ライフ:',textStyle); this.stageText=this.add.text(this.gameWidth/2,16,'ステージ:',textStyle).setOrigin(0.5,0); this.scoreText=this.add.text(this.gameWidth-16,16,'スコア:',textStyle).setOrigin(1,0); this.vajraGaugeText = this.add.text(16, this.scale.height - 30, '奥義: -/-', { fontSize: '20px', fill: '#fff' }).setVisible(false);
        try{ const gameScene=this.scene.get('GameScene'); if(gameScene && gameScene.scene.settings.status === Phaser.Scenes.RUNNING){ this.registerGameEventListeners(gameScene); } else { this.scene.get('GameScene').events.once('create', this.registerGameEventListeners, this); } }catch(e){console.error("UIScene setup fail.",e);} this.events.on('shutdown',()=>{ this.unregisterGameEventListeners(); });
    }
    registerGameEventListeners(gameScene) {
        if(!gameScene||!gameScene.events || this.gameSceneListenerAttached) return; console.log("UIScene Registering listeners..."); this.unregisterGameEventListeners(gameScene); // Clean first
        gameScene.events.on('updateLives',this.updateLivesDisplay,this); gameScene.events.on('updateScore',this.updateScoreDisplay,this); gameScene.events.on('updateStage',this.updateStageDisplay,this); gameScene.events.on('activateVajraUI',this.activateVajraUIDisplay,this); gameScene.events.on('updateVajraGauge',this.updateVajraGaugeDisplay,this); gameScene.events.on('deactivateVajraUI', this.deactivateVajraUIDisplay, this);
        this.gameSceneListenerAttached = true; console.log("UIScene Listeners registered.");
        try{ this.updateLivesDisplay(gameScene.lives); this.updateScoreDisplay(gameScene.score); this.updateStageDisplay(gameScene.currentStage); if(gameScene.isVajraSystemActive) this.activateVajraUIDisplay(gameScene.vajraGauge, VAJRA_GAUGE_MAX); else this.deactivateVajraUIDisplay(); }catch(e){console.error("UIScene initial update fail.",e);}
    }
    unregisterGameEventListeners(gameScene = null) {
         const gs = gameScene || (this.scene.manager ? this.scene.manager.getScene('GameScene') : null); if (gs && gs.events) { gs.events.off('updateLives',this.updateLivesDisplay,this); gs.events.off('updateScore',this.updateScoreDisplay,this); gs.events.off('updateStage',this.updateStageDisplay,this); gs.events.off('activateVajraUI',this.activateVajraUIDisplay,this); gs.events.off('updateVajraGauge',this.updateVajraGaugeDisplay,this); gs.events.off('deactivateVajraUI', this.deactivateVajraUIDisplay, this); gs.events.off('create', this.registerGameEventListeners, this); } this.gameSceneListenerAttached = false;
     }
    updateLivesDisplay(lives){if(this.livesText)this.livesText.setText(`ライフ: ${lives}`);} updateScoreDisplay(score){if(this.scoreText)this.scoreText.setText(`スコア: ${score}`);} updateStageDisplay(stage){if(this.stageText)this.stageText.setText(`ステージ: ${stage}`);}
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
window.onload = () => { const game = new Phaser.Game(config); console.log("Phaser Game instance created."); };