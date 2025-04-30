// UIScene.js
// ▼▼▼ constants から VAJRA_GAUGE_MAX をインポート ▼▼▼
import { VAJRA_GAUGE_MAX, POWERUP_ICON_KEYS, POWERUP_TYPES, DROP_POOL_UI_ICON_SIZE, DROP_POOL_UI_SPACING, UI_BOTTOM_OFFSET } from './constants.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false });
        this.livesText = null;
        this.scoreText = null;
        this.stageText = null;
        this.vajraGaugeText = null;
        this.dropPoolIconsGroup = null;
        this.parentSceneKey = null;
        this.parentScene = null;
        this.parentResizeListener = null;
        this.gameSceneListenerAttached = false; // リスナー登録フラグを初期化
        this.gameWidth = 0;
        this.gameHeight = 0;
    }

    init(data) {
        console.log("--- UIScene INIT ---");
        console.log("Received data type in INIT:", typeof data);
        try {
            console.log("Received data in INIT (stringified):", JSON.stringify(data));
        } catch (e) { console.error("Error stringifying data in INIT", e); }
        this.parentSceneKey = data?.parentSceneKey;
        console.log("Parent scene key set in INIT:", this.parentSceneKey);
        console.log("--- UIScene INIT End ---");
    }

    create(data) { // data引数はあってもなくても良いが、混乱避けるため残す
        console.log("--- UIScene CREATE ---");
        console.log("parentSceneKey available in CREATE:", this.parentSceneKey);

        if (!this.parentSceneKey) {
            console.error("UIScene cannot proceed without parentSceneKey! Aborting.");
            this.scene.stop();
            return;
        }

        // ▼▼▼ try...catch で create 全体を囲む ▼▼▼
        try {
            this.parentScene = this.scene.get(this.parentSceneKey);
            if (!this.parentScene) {
                console.error(`UIScene could not find parent scene: ${this.parentSceneKey}! Aborting.`);
                this.scene.stop();
                return;
            }
            console.log(`UIScene linked to parent: ${this.parentSceneKey}`);

            this.gameWidth = this.scale.width;
            this.gameHeight = this.scale.height;

            const textStyle = {
                fontSize: '24px',
                fill: '#fff',
                fontFamily: 'MyGameFont, sans-serif'
            };

            // --- 1. UI 要素の生成 (ライフだけ確実に生成) ---
            console.log("[UIScene Create] Creating LivesText...");
            // 既存のがあれば削除 (念のため)
            if (this.livesText) this.livesText.destroy();
            this.livesText = this.add.text(16, 16, 'ライフ: ?', textStyle).setOrigin(0, 0); // 初期テキストは '?' に
             if (this.livesText) { console.log("LivesText created successfully."); } else { console.error("!!! Failed to create LivesText !!!"); }

            // ▼▼▼ ★★★ 直接参照してライフ表示 ★★★ ▼▼▼
            console.log("[UIScene Create] Attempting to set initial life directly...");
            if (this.parentScene && typeof this.parentScene.lives !== 'undefined') {
                const initialLives = this.parentScene.lives;
                console.log(`  - Reading 'lives' directly from parent: ${initialLives}`);
                if (this.livesText) {
                     this.livesText.setText(`ライフ: ${initialLives}`);
                     console.log(`  - LivesText updated directly. Current text: '${this.livesText.text}'`);
                } else { console.log("  - LivesText not available to update directly."); }
            } else {
                 console.log("  - Could not read 'lives' directly from parent scene.");
            }
            // ▲▲▲ ★★★ 直接参照してライフ表示 ★★★ ▲▲▲

            // --- 2. イベントリスナー登録 (UI要素生成後に実行) ---
            /*console.log("[UIScene Create] Registering parent event listeners...");
            this.registerParentEventListeners(this.parentScene); // ★ UI生成後に移動したことを確認
            this.parentResizeListener = this.onGameResize.bind(this);
            this.parentScene.events.on('gameResize', this.parentResizeListener);
            console.log(`[UIScene Create] Registered listeners and listening for resize from ${this.parentSceneKey}`);

            // --- 3. UI要素状態チェック (delayedCall) ---
            this.time.delayedCall(100, () => {
                console.log('--- UI Element Status Check ---');
                if (this.livesText) { console.log(`Lives Text: Pos=(${this.livesText.x.toFixed(0)}, ${this.livesText.y.toFixed(0)}), Visible=${this.livesText.visible}, Alpha=${this.livesText.alpha}, Text='${this.livesText.text}'`); } else { console.log("Lives Text not found after delay."); } //ログ変更
                if (this.scoreText) { console.log(`Score Text: Pos=(${this.scoreText.x.toFixed(0)}, ${this.scoreText.y.toFixed(0)}), Visible=${this.scoreText.visible}, Alpha=${this.scoreText.alpha}, Text='${this.scoreText.text}'`); } else { console.log("Score Text not found after delay."); } //ログ変更
                if (this.stageText) { console.log(`Stage Text: Pos=(${this.stageText.x.toFixed(0)}, ${this.stageText.y.toFixed(0)}), Visible=${this.stageText.visible}, Alpha=${this.stageText.alpha}, Text='${this.stageText.text}'`); } else { console.log("Stage Text not found after delay."); } //ログ変更
                if (this.vajraGaugeText) { console.log(`Vajra Text: Pos=(${this.vajraGaugeText.x.toFixed(0)}, ${this.vajraGaugeText.y.toFixed(0)}), Visible=${this.vajraGaugeText.visible}, Alpha=${this.vajraGaugeText.alpha}, Text='${this.vajraGaugeText.text}'`); } else { console.log("Vajra Text not found after delay."); } //ログ変更
                console.log('--- Status Check End ---');
            }, [], this);*/

            // --- 4. UIScene 終了時処理 ---
            this.events.on('shutdown', () => {
                console.log("UIScene shutdown initiated.");
                this.unregisterParentEventListeners();
                if (this.parentScene && this.parentScene.events && this.parentResizeListener) {
                    this.parentScene.events.off('gameResize', this.parentResizeListener);
                    console.log(`UIScene stopped listening for resize events from ${this.parentSceneKey}`);
                }
                // プロパティクリアを追加
                this.livesText = null; this.scoreText = null; this.stageText = null; this.vajraGaugeText = null; this.dropPoolIconsGroup = null;
                this.parentScene = null; this.parentSceneKey = null; this.parentResizeListener = null; this.gameSceneListenerAttached = false;
                console.log("UIScene shutdown complete.");
            });

        } catch (e_create) { // create全体のcatch
            console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.error("!!! CRITICAL ERROR during UIScene CREATE !!!", e_create.message, e_create.stack);
            console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            this.scene.stop(); // エラー発生時はシーン停止
            return;
        }
         // ▲▲▲ try...catch で create 全体を囲む ▲▲▲

        console.log("--- UIScene CREATE End ---");
    } // create メソッドの終わり

    // registerParentEventListeners メソッド (ログ追加済み)
    registerParentEventListeners(parentScene) {
        if (!parentScene || !parentScene.events || this.gameSceneListenerAttached) return;
        console.log(`Registering event listeners for ${this.parentSceneKey} in UIScene...`);
        this.unregisterParentEventListeners(parentScene);

        parentScene.events.on('updateLives', this.updateLivesDisplay, this);
        parentScene.events.on('updateScore', this.updateScoreDisplay, this);
        parentScene.events.on('updateStage', this.updateStageDisplay, this);
        parentScene.events.on('activateVajraUI', this.activateVajraUIDisplay, this);
        parentScene.events.on('updateVajraGauge', this.updateVajraGaugeDisplay, this);
        parentScene.events.on('deactivateVajraUI', this.deactivateVajraUIDisplay, this);
        parentScene.events.on('updateDropPoolUI', this.updateDropPoolDisplay, this);

        this.gameSceneListenerAttached = true;

        // 初期値反映の try...catch とログ (再掲)
        try {
            console.log(`[UIScene Init Reflect] Reading initial data from ${this.parentSceneKey}:`);
            const parentLives = parentScene.lives;
            const parentScore = parentScene.score;
            const parentStage = parentScene.currentStage;
            console.log(`  - Lives from Parent: ${parentLives}`);
            console.log(`  - Score from Parent: ${parentScore}`);
            console.log(`  - Stage from Parent: ${parentStage}`);
            this.updateLivesDisplay(parentLives);
            this.updateScoreDisplay(parentScore);
            this.updateStageDisplay(parentStage);
            if (parentScene.isVajraSystemActive) {
                 this.activateVajraUIDisplay(parentScene.vajraGauge, VAJRA_GAUGE_MAX); // ★ VAJRA_GAUGE_MAX 使用箇所
                 console.log(`  - Vajra UI: Active (Gauge: ${parentScene.vajraGauge})`);
            } else { this.deactivateVajraUIDisplay(); console.log(`  - Vajra UI: Inactive`); }
            const dropPool = parentScene.stageDropPool ?? parentScene.bossDropPool ?? [];
            this.updateDropPoolDisplay(dropPool); console.log(`  - Drop Pool: [${dropPool.join(', ')}]`);
        } catch (e) { console.error(`!!! ERROR reflecting initial state from ${this.parentSceneKey} in UIScene:`, e.message, e.stack); }
    }

    // registerParentEventListeners メソッド (ログ追加済み)
    registerParentEventListeners(parentScene) {
        if (!parentScene || !parentScene.events || this.gameSceneListenerAttached) return;
        console.log(`Registering event listeners for ${this.parentSceneKey} in UIScene...`);
        this.unregisterParentEventListeners(parentScene);

        parentScene.events.on('updateLives', this.updateLivesDisplay, this);
        parentScene.events.on('updateScore', this.updateScoreDisplay, this);
        parentScene.events.on('updateStage', this.updateStageDisplay, this);
        parentScene.events.on('activateVajraUI', this.activateVajraUIDisplay, this);
        parentScene.events.on('updateVajraGauge', this.updateVajraGaugeDisplay, this);
        parentScene.events.on('deactivateVajraUI', this.deactivateVajraUIDisplay, this);
        parentScene.events.on('updateDropPoolUI', this.updateDropPoolDisplay, this);

        this.gameSceneListenerAttached = true;

        // 初期値反映の try...catch とログ (再掲)
        try {
            console.log(`[UIScene Init Reflect] Reading initial data from ${this.parentSceneKey}:`);
            const parentLives = parentScene.lives;
            const parentScore = parentScene.score;
            const parentStage = parentScene.currentStage;
            console.log(`  - Lives from Parent: ${parentLives}`);
            console.log(`  - Score from Parent: ${parentScore}`);
            console.log(`  - Stage from Parent: ${parentStage}`);
            this.updateLivesDisplay(parentLives);
            this.updateScoreDisplay(parentScore);
            this.updateStageDisplay(parentStage);
            if (parentScene.isVajraSystemActive) {
                 this.activateVajraUIDisplay(parentScene.vajraGauge, VAJRA_GAUGE_MAX); // ★ VAJRA_GAUGE_MAX 使用箇所
                 console.log(`  - Vajra UI: Active (Gauge: ${parentScene.vajraGauge})`);
            } else { this.deactivateVajraUIDisplay(); console.log(`  - Vajra UI: Inactive`); }
            const dropPool = parentScene.stageDropPool ?? parentScene.bossDropPool ?? [];
            this.updateDropPoolDisplay(dropPool); console.log(`  - Drop Pool: [${dropPool.join(', ')}]`);
        } catch (e) { console.error(`!!! ERROR reflecting initial state from ${this.parentSceneKey} in UIScene:`, e.message, e.stack); }
    }

    

    // ★ メソッド名を unregisterParentEventListeners に変更
    unregisterParentEventListeners(parentScene = null) {
        console.log(`Unregistering event listeners for ${this.parentSceneKey} from UIScene...`);
        const ps = parentScene || this.parentScene; // 引数がなければ保持している参照を使う
        if (ps && ps.events) {
            ps.events.off('updateLives', this.updateLivesDisplay, this);
            ps.events.off('updateScore', this.updateScoreDisplay, this);
            ps.events.off('updateStage', this.updateStageDisplay, this);
            ps.events.off('activateVajraUI', this.activateVajraUIDisplay, this);
            ps.events.off('updateVajraGauge', this.updateVajraGaugeDisplay, this);
            ps.events.off('deactivateVajraUI', this.deactivateVajraUIDisplay, this);
            ps.events.off('updateDropPoolUI', this.updateDropPoolDisplay, this);
        }
        this.gameSceneListenerAttached = false;
    }


    // GameSceneのリサイズイベントを受けたときの処理
    onGameResize() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        // 各UI要素の位置を再計算
        this.livesText?.setPosition(16, 16);
        this.stageText?.setPosition(this.gameWidth / 2, 16);
        this.scoreText?.setPosition(this.gameWidth - 16, 16);
        this.vajraGaugeText?.setPosition(16, this.gameHeight - UI_BOTTOM_OFFSET);
        this.updateDropPoolPosition(); // ドロッププールアイコンの位置も更新
    }

    
    

    // --- UI更新メソッド ---
    updateLivesDisplay(lives) { if (this.livesText) this.livesText.setText(`ライフ: ${lives}`); }
    updateScoreDisplay(score) { if (this.scoreText) this.scoreText.setText(`スコア: ${score}`); }
    updateStageDisplay(stage) { if (this.stageText) this.stageText.setText(`ステージ: ${stage}`); }

    // ヴァジラUI表示
    activateVajraUIDisplay(initialValue, maxValue) { // maxValue は VAJRA_GAUGE_MAX を期待
        if (this.vajraGaugeText) {
            this.vajraGaugeText.setText(`奥義: ${initialValue}/${maxValue}`).setVisible(true); // ★ maxValue を使用
            this.updateDropPoolPosition();
        }
    }

    // ヴァジラゲージ更新
    updateVajraGaugeDisplay(currentValue) {
        if (this.vajraGaugeText && this.vajraGaugeText.visible) {
            // ★ VAJRA_GAUGE_MAX を使用 ★
            this.vajraGaugeText.setText(`奥義: ${currentValue}/${VAJRA_GAUGE_MAX}`);
        }
    }
    // ヴァジラUI非表示
    deactivateVajraUIDisplay() {
        if (this.vajraGaugeText) {
            this.vajraGaugeText.setVisible(false);
            this.updateDropPoolPosition(); // ドロッププール位置再計算
        }
    }

    // ドロッププールUI更新
    updateDropPoolDisplay(dropPoolTypes) {
        if (!this.dropPoolIconsGroup) return; // グループがなければ何もしない
        this.dropPoolIconsGroup.clear(true, true); // 既存のアイコンを削除

        if (!dropPoolTypes || dropPoolTypes.length === 0) {
            this.updateDropPoolPosition(); // 空でも位置計算は実行
            return;
        }

        // プール内の各タイプに対応するアイコンを作成してグループに追加
        dropPoolTypes.forEach((type) => {
            let iconKey = POWERUP_ICON_KEYS[type] || 'whitePixel'; // キー取得、なければ白四角
            let tintColor = null;
            if (iconKey === 'whitePixel') {
                tintColor = (type === POWERUP_TYPES.BAISRAVA) ? 0xffd700 : 0xcccccc;
            }

            const icon = this.add.image(0, 0, iconKey) // 初期位置は(0,0)で後で調整
                .setDisplaySize(DROP_POOL_UI_ICON_SIZE, DROP_POOL_UI_ICON_SIZE)
                .setOrigin(0, 0.5); // 左端・垂直中央基準

            if (tintColor !== null) { icon.setTint(tintColor); }
            else { icon.clearTint(); }

            this.dropPoolIconsGroup.add(icon); // グループに追加
        });

        this.updateDropPoolPosition(); // アイコンの位置を整列
    }

    // ドロッププールアイコンの位置を調整する
    updateDropPoolPosition() {
        if (!this.dropPoolIconsGroup || !this.vajraGaugeText) return; // 必要な要素がなければ中断

        // 開始X座標: Vajraゲージが表示されていればその右隣、なければ左端から
        const startX = this.vajraGaugeText.visible
            ? this.vajraGaugeText.x + this.vajraGaugeText.width + 15 // ゲージの右に少しスペース
            : 16; // 左端から
        const startY = this.gameHeight - UI_BOTTOM_OFFSET; // Y座標は固定 (画面下部)

        let currentX = startX;
        // グループ内の各アイコンを横に並べる
        this.dropPoolIconsGroup.getChildren().forEach(icon => {
            icon.x = currentX;
            icon.y = startY;
            currentX += DROP_POOL_UI_ICON_SIZE + DROP_POOL_UI_SPACING; // 次のアイコンの位置へ
        });
    }

    // UIScene.js

create(data) {
    // ...(createメソッドの他の処理)...

    // ▼▼▼ この delayedCall ブロックを create の最後に追加 ▼▼▼
    this.time.delayedCall(100, () => { // 少し待ってからログ出力
         console.log('--- UI Element Status Check ---');
         if (this.livesText) {
             console.log(`Lives Text: Pos=(${this.livesText.x.toFixed(0)}, ${this.livesText.y.toFixed(0)}), Visible=${this.livesText.visible}, Alpha=${this.livesText.alpha}, Text='${this.livesText.text}'`);
         } else { console.log("Lives Text not found."); }
         if (this.scoreText) {
             console.log(`Score Text: Pos=(${this.scoreText.x.toFixed(0)}, ${this.scoreText.y.toFixed(0)}), Visible=${this.scoreText.visible}, Alpha=${this.scoreText.alpha}, Text='${this.scoreText.text}'`);
         } else { console.log("Score Text not found."); }
         if (this.stageText) {
             console.log(`Stage Text: Pos=(${this.stageText.x.toFixed(0)}, ${this.stageText.y.toFixed(0)}), Visible=${this.stageText.visible}, Alpha=${this.stageText.alpha}, Text='${this.stageText.text}'`);
         } else { console.log("Stage Text not found."); }
         // 必要なら Vajra Gauge や Drop Pool の情報も追加
         if (this.vajraGaugeText) {
              console.log(`Vajra Text: Pos=(${this.vajraGaugeText.x.toFixed(0)}, ${this.vajraGaugeText.y.toFixed(0)}), Visible=${this.vajraGaugeText.visible}, Alpha=${this.vajraGaugeText.alpha}, Text='${this.vajraGaugeText.text}'`);
         } else { console.log("Vajra Text not found."); }
         console.log('--- Status Check End ---');
    }, [], this);
    // ▲▲▲ この delayedCall ブロックを create の最後に追加 ▲▲▲

    console.log("--- UIScene CREATE End ---");
} // create メソッドの終わり
} // <-- UIScene