// エンドポイントへのURL
const BACKEND_URL =
    "https://script.googleusercontent.com/a/macros/hcs.ac.jp/echo?user_content_key=8XfvghXJycrOB1s2S_tCrfpxyWB48X83Tc-HHFANrWvoJpcgUyZf9uobG2RrrCCn1Svel2ajSAhryHyUuKDB_4XIbu8Yp6N-m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_nRPgeZU6HP_0zTYnA2sIrbgNqs4pb6vdYrhDVdJHZ3aJgDn8SMcIIgMH7X1wvUugR_odCISApmPVbRb9wm_ZF_cFk67j67M6qNKzKmJYTfnqo3rqovr9Qkp5PMA1PTgSGGaU2pP6Ntk&lib=MNRcDDr6CKhMyhUqZEMsPBu8x4UygFT0t";
const FIN_URL =
    "https://script.googleusercontent.com/a/macros/hcs.ac.jp/echo?user_content_key=JpvuGs7aqqXrlaZA6f-tdaz8CwiUh2GnZpJpQ4e_8kREo-xQwGPPNFa4MVwyqtOPnqrxYva1UjfbMnSHShXsw2lI7l12Mqkhm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_nRPgeZU6HP_0zTYnA2sIrbgNqs4pb6vdJL4a0UIBVfY5lseUpeEfmRMhgLqIYYyv3vHi5wj6yeSD_di_bLQeyIapsiBXtLrQpWfDmVwujvLmfzNjljUlT2wkCCkfoMrqGGaU2pP6Ntk&lib=MNMplxJEkdMxbYd8qePoG8-8x4UygFT0t";
// 背景に映る画像のリスト
let letbackgroundimageList = [];
// 写真生成インターバル
let createPicInterval = 20000;
// バッチ生成インターバル
let createBadgeInterval = 6500;
// 笑顔数値の高い画像を格納
let smileMax = [];
// 初期表示時のstarボタン制御フラグ
let readyFlg = true;
// はじめに表示される写真たち
let image_list = [
    {
        url: "https://1.bp.blogspot.com/-l4fWuSze_MI/YHDkJRsVYzI/AAAAAAABdlM/4lid3iHq_aMFybNb9PYCOpNIEtOwgwRFwCNcBGAsYHQ/s755/hengao_mabuta_uragaesu.png",
        smile: "[[1853.485390625,433.0812413641747,0.7354134249687195]]",
    },
];

let inputSliderResult = document.querySelector("#inputSliderResult");

let section = document.querySelector(".photo-shower-container");
// 左右交互に写真を表示させるため
let field = "right";
// 表示画像リストの指標
let count = 0;
// どこまで表示したかを表す指標
let showIndicatorCount = 1000;
// 戻り状態の可否(一周して戻っているか)
let backflg = false;
// 戻り状態から復帰する際の退避指標
let backedShowIndicatorCount = 0;

let createId = null;

// 画像の配置順番
let directionCount = 0;

// startボタン無効化
disabledStartButton();
// 画像の取得
fetchData();

// 5秒おきに画像の取得
window.setInterval(() => {
    fetchData();
}, 5000);

// 写真を生成する関数
function createPic() {
    // image_listを更新されているかチェック
    if ((showIndicatorCount < image_list.length) & backflg) {
        // 現状の指標を退避
        backedShowIndicatorCount = count;
        // 退避していた指標を取り出す
        count = showIndicatorCount;
        // 戻り状態を初期化
        backflg = false;
    }

    // 写真コンポーネントの生成
    const pictureEl = document.createElement("span");
    // 写真タグの生成
    let image = document.createElement("img");
    image.addEventListener("load", (e) => {
        pictureEl.className = "picture";
        console.log(image_list[count]["url"]);
    });
    image.className = "pic";
    image.src = image_list[count]["url"];
    const smile_json = image_list[count]["smile"];

    // 写真の長辺の長さを指定
    const minSize = 800;
    const maxSize = 1000;
    let size = Math.random() * (maxSize + 1 - minSize) + minSize;

    // ここで写真のむきを取得。
    getPictureDirection(image.src)
        // dataにはwidthかheight。長い方がstringで入っている。
        .then((data) => {
            if (data === "width") {
                image.style.width = size + "px";
                image.style.height = "auto";
            } else {
                image.style.height = size + "px";
                image.style.weight = "auto";
            }
            pictureEl.appendChild(image);

            // スコアの生成
            const parsed = JSON.parse(smile_json);
            for (i = 0; i < parsed.length; i++) {
                // スコア画像の生成
                const panel = document.createElement("img");
                panel.src = "panel.png";
                panel.style.width = "130px";

                // スコアパーセントの生成
                const percent = document.createElement("p");
                percent.className = "percent";
                percent.textContent = "%";
                // スコアコンポーネントの生成
                const score = document.createElement("div");
                score.className = "score";

                score.appendChild(percent);
                const num = document.createElement("p");
                num.className = "num";
                const newContent = document.createTextNode(
                    Math.round(parsed[i][2] * 100)
                );
                num.appendChild(newContent);
                score.appendChild(num);
                score.appendChild(panel);
                score.style.left = parsed[i][0];
                score.style.top = parsed[i][1];

                pictureEl.appendChild(score);
            }

            // 左右の順番に写真が表示されるように
            if (field === "right") {
                field = "left";
            } else {
                field = "right";
            }
            section.appendChild(pictureEl);
        })
        .catch((err) => {
            console.log("error", err);
        });

    // 一定時間が経てば写真を消す
    setTimeout(() => {
        pictureEl.remove();
    }, createPicInterval);

    // 全て背景にしたら、背景画像の追加を行わない
    if (letbackgroundimageList.length < image_list.length) {
        setTimeout(() => {
            createBackPic();
        }, createPicInterval - 1000);
    }

    // バッジの表示タイミング
    setTimeout(() => {
        const select = document.getElementsByClassName("score");
        Array.prototype.forEach.call(select, function (item) {
            item.style.visibility = "visible";
            item.classList.add("fadeIn");
        });
    }, createBadgeInterval);

    // リストの最初に戻っていた場合は追加しない
    if (image_list.length > letbackgroundimageList.length) {
        letbackgroundimageList.push(image_list[count]["url"]);
    }

    count += 1;

    // image_listを全て表示したらもとに戻る
    if (count >= image_list.length) {
        // 一旦現状の指標を退避
        showIndicatorCount = count;
        // 退避していた指標を設定
        count = backedShowIndicatorCount;
        // 戻り状態をONへ
        backflg = true;
    }
}
// 写真を読み込んでから向きの判定
const loadImg = function (src) {
    return new Promise(function (resolve, reject) {
        const image = new Image();
        image.src = src;
        image.onload = function () {
            resolve(image);
        };
        image.onerror = function (error) {
            reject(error);
        };
    });
};

// 写真の向きを取得
let getPictureDirection = function getDirection(src) {
    return new Promise(function (resolve, reject) {
        loadImg(src)
            //読み込みが完了した（画像が設定された）Imageオブジェクトを受け取って処理
            .then(function (res) {
                if (res.width > res.height) {
                    resolve("width");
                } else {
                    resolve("height");
                }
            })
            //読み込みエラー時の処理
            .catch(function (error) {
                console.log(error);
            });
    });
};

// 上下左右中央に配置する位置の取得
function getInclent() {
    directionCount++;
    if (directionCount > 5) {
        directionCount = 1;
    }
    return directionCount;
}

// 背景写真を生成する関数
function createBackPic() {

    // 写真コンポーネントの生成
    const pictureEl = document.createElement("span");
    pictureEl.className = "backgound";

    // 左右は0％〜70%
    // 上下は-140％〜10%
    pictureEl.classList.add("fadeUp");
    switch (getInclent()) {
        case 1:
            // 左上
            pictureEl.style.left = getRandomInt(0, 30) + "%";
            pictureEl.style.setProperty(
                "--height",
                getRandomInt(-160, -85) + "%"
            );
            break;
        case 2:
            // 右上
            pictureEl.style.left = getRandomInt(50, 80) + "%";
            pictureEl.style.setProperty(
                "--height",
                getRandomInt(-160, -85) + "%"
            );
            break;
        case 3:
            // 右下
            pictureEl.style.left = getRandomInt(50, 80) + "%";
            pictureEl.style.setProperty("--height", getRandomInt(-20, 10) + "%");
            break;
        case 4:
            // 左下
            pictureEl.style.left = getRandomInt(0, 30) + "%";
            pictureEl.style.setProperty("--height", getRandomInt(-20, 10) + "%");
            break;
        default:
            // 中央
            pictureEl.style.left = getRandomInt(30, 40) + "%";
            pictureEl.style.setProperty("--height", getRandomInt(-95, -30) + "%");
    }
    pictureEl.addEventListener("animationend", () => {
        // アニメーション終了後に実行する内容
        pictureEl.classList.add("anime-fuwafuwa");
    });

    // 写真タグの生成
    let image = document.createElement("img");
    image.className = "pic";
    image.src = letbackgroundimageList[letbackgroundimageList.length - 1];

    // 写真の長辺の長さを指定
    const minSize = 200;
    const maxSize = 350;
    let size = Math.random() * (maxSize + 1 - minSize) + minSize;

    // ここで写真のむきを取得。
    getPictureDirection(image.src)
        // dataにはwidthかheight。長い方がstringで入っている。
        .then((data) => {
            if (data === "width") {
                image.style.width = size + "px";
                image.style.height = "auto";
            } else {
                image.style.height = size + "px";
                image.style.weight = "auto";
            }
            pictureEl.appendChild(image);

            // 左右の順番に写真が表示されるように
            if (field === "right") {
                field = "left";
            } else {
                field = "right";
            }
            section.appendChild(pictureEl);
        })
        .catch((err) => {
            console.log("error", err);
        });
}

// スライダーのリスナー
inputSliderResult.addEventListener("input", (e) => {
    // 20秒をベースに10メモリ分の初期値が５なので、1メモリあたり４秒計算
    const baseSpeed = 4;
    const newSpeed = Number(e.target.value) * baseSpeed;

    // 写真生成インターバルの変更
    createPicInterval = newSpeed * 1000;
    // バッチインターバルの変更
    createBadgeInterval = Math.ceil(createPicInterval / 3);

    // CSSアニメーションの変更
    const root = document.querySelector(":root");
    root.style.setProperty("--pictureAnimate", newSpeed + "s");
});

// -140から10までのランダムな整数を生成する関数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// リザルトの関数
function onClickStart() {
    disabledSliderResult();
    disabledStartButton();
    disabledEndutton();
    enabledPauseButton();

    // 写真を生成する間隔をミリ秒で指定
    createId = setInterval(function () {
        createPic();
    }, createPicInterval);

    // 初回だけ待たない
    createPic();
}

// ポーズボタン押下時の処理
function onClickPause() {
    disabledPauseButton();
    clearInterval(createId);
    enabledStartButton();
    enabledSliderResult();
    enabledEndutton();
}

// スライダー有効化
function enabledSliderResult() {
    const inputSliderResult = document.querySelector("#inputSliderResult");
    inputSliderResult.disabled = false;
}

// スライダー無効化
function disabledSliderResult() {
    const inputSliderResult = document.querySelector("#inputSliderResult");
    inputSliderResult.disabled = true;
}

// スタートボタン有効化
function enabledStartButton() {
    const inputStartButton = document.querySelector("#inputStartButton");
    inputStartButton.style.background = "transparent";
    inputStartButton.style.color = "#FFF";
    inputStartButton.disabled = false;
}

// スタートボタン無効化
function disabledStartButton() {
    const inputStartButton = document.querySelector("#inputStartButton");
    inputStartButton.style.background = "#FFF";
    inputStartButton.style.color = "#000";
    inputStartButton.disabled = true;
}

// ポーズボタン有効化
function enabledPauseButton() {
    const inputPauseButton = document.querySelector("#inputPauseButton");
    inputPauseButton.style.background = "transparent";
    inputPauseButton.style.color = "#FFF";
    inputPauseButton.disabled = false;
}

// ポーズボタン無効化
function disabledPauseButton() {
    const inputPauseButton = document.querySelector("#inputPauseButton");
    inputPauseButton.style.background = "#FFF";
    inputPauseButton.style.color = "#000";
    inputPauseButton.disabled = true;
}

// エンドボタン有効化
function enabledEndutton() {
    const inputEndButton = document.querySelector("#inputEndButton");
    inputEndButton.style.background = "transparent";
    inputEndButton.style.color = "#FFF";
    inputEndButton.disabled = false;
}

// エンドボタン有効化
function disabledEndutton() {
    const inputEndButton = document.querySelector("#inputEndButton");
    inputEndButton.style.background = "transparent";
    inputEndButton.style.color = "#FFF";
    inputEndButton.disabled = true;
}

// データの取得
function fetchData() {
    // XMLHttpRequestオブジェクトを作成
    let xhr = new XMLHttpRequest();

    // リクエストの設定
    xhr.open("GET", BACKEND_URL, true);

    // リクエストが完了したときの処理
    xhr.onload = function () {
        if (xhr.status === 200) {
            // レスポンスが成功の場合の処理
            image_list = JSON.parse(xhr.responseText);
            if (readyFlg) {
                enabledStartButton();
                readyFlg = false;
            }
        } else {
            // エラーが発生した場合の処理
            console.error("リクエストエラー:", xhr.status);
        }
    };

    // リクエスト送信
    xhr.send();
    console.log("送信");
}

// Endボタン押下時の処理
function onClickEnd() {
    onClickPause();
    // 入力部分を消す
    const inputField = document.querySelector("#inputField");
    inputField.style.display = "none";
    endroll();
    window.setTimeout(() => {
        console.log("ほげ");
    }, createPicInterval);
}

// 終了処理
function endroll() {
    // XMLHttpRequestオブジェクトを作成
    let xhr = new XMLHttpRequest();

    // 透過用のレイヤーを追加
    const createElement = document.createElement("div");
    inputField.parentNode.insertBefore(createElement, inputField);
    createElement.classList.add("finishLayer");

    // ドラムロールの再生
    const music = new Audio("./roll.mp3");
    music.play();

    // リクエストの設定
    xhr.open("GET", FIN_URL, true);

    // リクエストが完了したときの処理
    xhr.onload = function () {
        if (xhr.status === 200) {
            // レスポンスが成功の場合の処理
            smileMax = JSON.parse(xhr.responseText);
            startFlgShow();
            startCrackerShow();
            endPic();
        } else {
            // エラーが発生した場合の処理
            console.error("リクエストエラー:", xhr.status);
        }
    };

    // リクエスト送信
    xhr.send();
    console.log("送信");

    // 背景の画像をフェードアウト
    const select = document.getElementsByClassName("anime-fuwafuwa");
    Array.prototype.forEach.call(select, function (item) {
        item.classList.add("fadeout");
    });
}

// 写真を生成する関数
function endPic() {
    // 写真コンポーネントの生成
    const pictureEl = document.createElement("span");
    pictureEl.className = "end-picture";
    // 写真タグの生成
    let image = document.createElement("img");
    image.className = "pic";
    image.src = smileMax[0]["url"];
    const smile_json = smileMax[0]["smile"];

    // 写真の長辺の長さを指定
    const minSize = 800;
    const maxSize = 1000;
    let size = Math.random() * (maxSize + 1 - minSize) + minSize;

    // ここで写真のむきを取得。
    getPictureDirection(image.src)
        // dataにはwidthかheight。長い方がstringで入っている。
        .then((data) => {
            if (data === "width") {
                image.style.width = size + "px";
                image.style.height = "auto";
            } else {
                image.style.height = size + "px";
                image.style.weight = "auto";
            }
            pictureEl.appendChild(image);

            // スコアの生成
            const parsed = JSON.parse(smile_json);
            for (i = 0; i < parsed.length; i++) {
                // スコア画像の生成
                const panel = document.createElement("img");
                panel.src = "panel.png";
                panel.style.width = "130px";

                // スコアパーセントの生成
                const percent = document.createElement("p");
                percent.className = "percent";
                percent.textContent = "%";
                // スコアコンポーネントの生成
                const score = document.createElement("div");
                score.className = "score";

                score.appendChild(percent);
                const num = document.createElement("p");
                num.className = "num";
                const smile = smile_json;
                const newContent = document.createTextNode(
                    Math.round(parsed[i][2] * 100)
                );
                num.appendChild(newContent);
                score.appendChild(num);
                score.appendChild(panel);
                score.style.left = parsed[i][0];
                score.style.top = parsed[i][1];

                pictureEl.appendChild(score);
            }

            // 左右の順番に写真が表示されるように
            if (field === "right") {
                field = "left";
            } else {
                field = "right";
            }
            section.appendChild(pictureEl);
        })
        .catch((err) => {
            console.log("error", err);
        });

    // バッジの表示タイミング
    setTimeout(() => {
        const select = document.getElementsByClassName("score");
        Array.prototype.forEach.call(select, function (item) {
            item.style.visibility = "visible";
            item.classList.add("fadeIn");
        });
    }, createBadgeInterval);
}

// 飾りつけ上部の表示
function startFlgShow() {
    const finishFlags = document.querySelector("#finishFlags");
    finishFlags.style.display = "block";
    finishFlags.classList.add("fadeIn");
}

// 飾りつけクラッカーの表示
function startCrackerShow() {
    const finishFlags = document.querySelector("#cracker");
    finishFlags.style.display = "block";
    finishFlags.classList.add("fadeIn");
}