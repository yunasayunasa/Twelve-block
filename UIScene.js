import { VAJRA_GAUGE_MAX, POWERUP_ICON_KEYS, POWERUP_TYPES, DROP_POOL_UI_ICON_SIZE, DROP_POOL_UI_SPACING, UI_BOTTOM_OFFSET } from './constants.js';

export default class UIScene extends Phaser.Scene {
     constructor() {
        super({ key: 'UIScene', active: false }); // キー指定、最初は非アクティブ
        // UI要素のプロパティ
        this.livesText = null;
        this.scoreText = null;
        this.stageText = null;
        this.vajraGaugeText = null;
        this.dropPoolIconsGroup = null; // ドロッププール表示用グループ
        this.parentSceneKey = null; // ★ 親シーンのキーを保持するプロパティ
        this.parentScene = null;    // ★ 親シーンへの参照を保持
        this.parentResizeListener = null; // ★ リサイズリスナー参照

        // 状態管理
        this.gameSceneListenerAttached = false; // GameSceneイベントリスナー登録済みフラグ
        this.gameScene = null; // GameSceneへの参照
        this.gameWidth = 0;
        this.gameHeight = 0;
     }
     
     init(data) {
        console.log("--- UIScene INIT ---"); // ★ init が呼ばれたことを確認
        console.log("Received data type in INIT:", typeof data); // ★ 型を確認
        try {
            console.log("Received data in INIT (stringified):", JSON.stringify(data)); // ★ 内容を確認
        } catch (e) { console.error("Error stringifying data in INIT", e); }
        this.parentSceneKey = data?.parentSceneKey; // ここで設定しておく
        console.log("Parent scene key set in INIT:", this.parentSceneKey); // ★ 設定結果を確認
        console.log("--- UIScene INIT End ---");
    }
     create(data) { // ★ data を受け取るように変更
        console.log("--- UIScene CREATE ---"); // ★ create が呼ばれたことを確認
        // this.parentSceneKey の設定は init で行ったので、ここでは確認のみ
        console.log("parentSceneKey available in CREATE:", this.parentSceneKey); // ★ create でキーが使えるか確認
       
        // console.log("UIScene create started", data);
       // this.parentSceneKey = data?.parentSceneKey; // ★ 親キーを取得 (なければnull)
        if (!this.parentSceneKey) {
            console.error("UIScene launched without parentSceneKey! Aborting.");
            this.scene.stop(); // 親が不明なら停止
            return;
        }

        // ★ 親シーンへの参照を取得
        this.parentScene = this.scene.get(this.parentSceneKey);
        if (!this.parentScene) {
            console.error(`UIScene could not find parent scene: ${this.parentSceneKey}! Aborting.`);
            this.scene.stop();
            return;
        }
        console.log(`UIScene linked to parent: ${this.parentSceneKey}`);
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

         // --- ▼ テキストスタイルにカスタムフォントを指定 ▼ ---
         const textStyle = {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'MyGameFont, sans-serif' // ★ CSSで定義したフォント名 + 予備フォント
        };
        // --- ▲ テキストスタイルにカスタムフォントを指定 ▲ ---

        /// ライフ表示 (左上)
        this.livesText = this.add.text(16, 16, 'ライフ: ', textStyle).setOrigin(0, 0);
        // ステージ表示 (上部中央)
        this.stageText = this.add.text(this.gameWidth / 2, 16, 'ステージ: ', textStyle).setOrigin(0.5, 0);
        // スコア表示 (右上)
        this.scoreText = this.add.text(this.gameWidth - 16, 16, 'スコア: ', textStyle).setOrigin(1, 0);
        // ヴァジラゲージ表示 (左下、最初は非表示)
        this.vajraGaugeText = this.add.text(16, this.gameHeight - UI_BOTTOM_OFFSET, '奥義: -/-', { fontSize: '20px', fill: '#fff' })
            .setOrigin(0, 1) // 左下基準
            .setVisible(false);
        // ドロッププール表示用グループ作成 (右下)
        this.dropPoolIconsGroup = this.add.group();
        this.updateDropPoolDisplay([]); // 初期状態は空で表示

        // --- ▼ 親シーンのイベントリスナー登録 ▼ ---
        try {
            // 親シーンのcreate完了を待つ必要はない (UISceneは後から起動されるため)
            this.registerParentEventListeners(this.parentScene);

            // ★ 親シーンのリサイズイベントを購読 ★
            this.parentResizeListener = this.onGameResize.bind(this); // bindしておく
            this.parentScene.events.on('gameResize', this.parentResizeListener);
             console.log(`UIScene listening for resize events from ${this.parentSceneKey}`);

        } catch (e) {
            console.error("Error setting up UIScene listeners for parent:", e);
        }

        // UIScene自体の終了時処理
        this.events.on('shutdown', () => {
            console.log("UIScene shutdown initiated.");
            this.unregisterParentEventListeners(); // ★ 親リスナー解除
            // ★ 親リサイズリスナーも解除 ★
            if (this.parentScene && this.parentScene.events && this.parentResizeListener) {
                this.parentScene.events.off('gameResize', this.parentResizeListener);
                console.log(`UIScene stopped listening for resize events from ${this.parentSceneKey}`);
            }
            this.parentScene = null; // 参照解除
            this.parentSceneKey = null;
            this.parentResizeListener = null;
            console.log("UIScene shutdown complete.");
        });
    }

    // ★ メソッド名を registerParentEventListeners に変更し、引数に親シーンを取る
    registerParentEventListeners(parentScene) {
        if (!parentScene || !parentScene.events || this.gameSceneListenerAttached) return; // 重複防止
        console.log(`Registering event listeners for ${this.parentSceneKey} in UIScene...`);
        this.unregisterParentEventListeners(parentScene); // 念のため既存を解除

        parentScene.events.on('updateLives', this.updateLivesDisplay, this);
        parentScene.events.on('updateScore', this.updateScoreDisplay, this);
        parentScene.events.on('updateStage', this.updateStageDisplay, this);
        parentScene.events.on('activateVajraUI', this.activateVajraUIDisplay, this);
        parentScene.events.on('updateVajraGauge', this.updateVajraGaugeDisplay, this);
        parentScene.events.on('deactivateVajraUI', this.deactivateVajraUIDisplay, this);
        parentScene.events.on('updateDropPoolUI', this.updateDropPoolDisplay, this);

        this.gameSceneListenerAttached = true; // 登録済みフラグ

        // 登録直後に現在の親シーンの状態をUIに反映
        try {
            // ★ parentScene のプロパティを参照する ★
            this.updateLivesDisplay(parentScene.lives);
            this.updateScoreDisplay(parentScene.score);
            this.updateStageDisplay(parentScene.currentStage); // 親がcurrentStageを持つ想定
            if (parentScene.isVajraSystemActive) { // 親がisVajraSystemActiveを持つ想定
                 this.activateVajraUIDisplay(parentScene.vajraGauge, VAJRA_GAUGE_MAX); // 親がvajraGaugeを持つ想定
            } else { this.deactivateVajraUIDisplay(); }
            // ドロッププールは親シーンの適切なプロパティを参照
            // (GameSceneならstageDropPool, BossSceneならbossDropPoolなど、親側で調整が必要かも)
            const dropPool = parentScene.stageDropPool ?? parentScene.bossDropPool ?? [];
            this.updateDropPoolDisplay(dropPool);
        } catch (e) {
            console.error(`Error reflecting initial state from ${this.parentSceneKey} in UIScene:`, e);
        }
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
    activateVajraUIDisplay(initialValue, maxValue) {
        if (this.vajraGaugeText) {
            this.vajraGaugeText.setText(`奥義: ${initialValue}/${maxValue}`).setVisible(true);
            this.updateDropPoolPosition(); // ドロッププール位置再計算
        }
    }
    // ヴァジラゲージ更新
    updateVajraGaugeDisplay(currentValue) {
        if (this.vajraGaugeText && this.vajraGaugeText.visible) { // 表示中のみ更新
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
} // <-- UIScene