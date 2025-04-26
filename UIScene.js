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

        // 状態管理
        this.gameSceneListenerAttached = false; // GameSceneイベントリスナー登録済みフラグ
        this.gameScene = null; // GameSceneへの参照
        this.gameWidth = 0;
        this.gameHeight = 0;
     }

    create() {
        console.log("UIScene create started");
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // --- UI要素作成 ---
        const textStyle = { fontSize: '24px', fill: '#fff' }; // 基本テキストスタイル
        // ライフ表示 (左上)
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

        // --- GameSceneイベントリスナー登録 ---
        this.gameScene = this.scene.get('GameScene'); // GameSceneへの参照を取得
        if (this.gameScene) {
            // GameSceneのリサイズイベントにも反応するように登録
            this.gameScene.events.on('gameResize', this.onGameResize, this);
        }
        try {
            const gameScene = this.scene.get('GameScene');
            // GameSceneが既に実行中か確認
            if (gameScene && gameScene.scene.settings.status === Phaser.Scenes.RUNNING) {
                 // 実行中ならすぐにリスナー登録
                this.registerGameEventListeners(gameScene);
            } else {
                // まだ準備中なら、create完了イベントを待ってからリスナー登録
                // (GameSceneのcreate完了前にUISceneのcreateが完了する場合があるため)
                this.scene.get('GameScene').events.once('create', () => {
                     this.registerGameEventListeners(this.scene.get('GameScene'));
                 }, this);
            }
        } catch (e) {
            console.error("Error setting up UIScene listeners:", e);
        }

        // UIScene自体の終了時処理
        this.events.on('shutdown', () => {
            console.log("UIScene shutdown initiated.");
            this.unregisterGameEventListeners(); // GameSceneリスナー解除
             // GameSceneリサイズリスナーも解除
             if (this.gameScene && this.gameScene.events) {
                 this.gameScene.events.off('gameResize', this.onGameResize, this);
             }
             console.log("UIScene shutdown complete.");
        });
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

    // GameSceneのイベントリスナーを登録する
    registerGameEventListeners(gameScene) {
        if (!gameScene || !gameScene.events || this.gameSceneListenerAttached) return; // 重複登録防止
        console.log("Registering GameScene event listeners in UIScene...");
        this.unregisterGameEventListeners(gameScene); // 念のため既存を解除

        gameScene.events.on('updateLives', this.updateLivesDisplay, this);
        gameScene.events.on('updateScore', this.updateScoreDisplay, this);
        gameScene.events.on('updateStage', this.updateStageDisplay, this);
        gameScene.events.on('activateVajraUI', this.activateVajraUIDisplay, this);
        gameScene.events.on('updateVajraGauge', this.updateVajraGaugeDisplay, this);
        gameScene.events.on('deactivateVajraUI', this.deactivateVajraUIDisplay, this);
        gameScene.events.on('updateDropPoolUI', this.updateDropPoolDisplay, this); // ドロッププール更新

        this.gameSceneListenerAttached = true; // 登録済みフラグを立てる

        // 登録直後に現在のゲーム状態をUIに反映
        try {
            this.updateLivesDisplay(gameScene.lives);
            this.updateScoreDisplay(gameScene.score);
            this.updateStageDisplay(gameScene.currentStage);
            if (gameScene.isVajraSystemActive) this.activateVajraUIDisplay(gameScene.vajraGauge, VAJRA_GAUGE_MAX);
            else this.deactivateVajraUIDisplay();
            this.updateDropPoolDisplay(gameScene.stageDropPool);
        } catch (e) {
            console.error("Error reflecting initial state in UIScene:", e);
        }
    }

    // GameSceneのイベントリスナーを解除する
    unregisterGameEventListeners(gameScene = null) {
        console.log("Unregistering GameScene event listeners from UIScene...");
        // 引数で渡されなければ、保持している参照を使う
        const gs = gameScene || this.gameScene || (this.scene.manager ? this.scene.manager.getScene('GameScene') : null);
        if (gs && gs.events) {
            gs.events.off('updateLives', this.updateLivesDisplay, this);
            gs.events.off('updateScore', this.updateScoreDisplay, this);
            gs.events.off('updateStage', this.updateStageDisplay, this);
            gs.events.off('activateVajraUI', this.activateVajraUIDisplay, this);
            gs.events.off('updateVajraGauge', this.updateVajraGaugeDisplay, this);
            gs.events.off('deactivateVajraUI', this.deactivateVajraUIDisplay, this);
            gs.events.off('create', this.registerGameEventListeners, this); // onceで登録したリスナーも解除
            gs.events.off('updateDropPoolUI', this.updateDropPoolDisplay, this);
        }
        this.gameSceneListenerAttached = false; // 未登録状態に
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