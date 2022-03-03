const path = require('path');
const fs = require('fs');
const js_obfuscator = require('javascript-obfuscator');


/*預設版本*/
const DEFAULT = "1.0.0";

/*遊戲 ID*/
const GAME_ID = "game405(財神)";

/*版本資料保存位置*/
const FILE = "D:\\VERSION\\VERSION.txt";


/**
 * @Author XIAO-LI-PIN
 * @Description 打包後自動將js混淆加密
 * 參考 : https://docs.cocos.com/creator/manual/zh/publish/custom-project-build-template.html
 * @Date 2021-06-30 下午 18:24
 * @Version 1.1
 */


/**
 * 主遊戲js加密
 * @param options
 * @param callback
 */
async function onMainBuildFinish(options, callback) {

    const nio = new NIO();
    //拿取主遊戲 JS檔位置
    const mainPath = nio.getMainJSPath(options);
    //是否加密主遊戲JS
    let mainJS = nio.obfuscatorAction(mainPath, true);
    //更新版本號
    const version = nio.updateVersionAction(FILE);
    //對主遊戲寫入版本號
    const newMainJS = nio.mainJSWriteVersion(mainJS, version);
    //寫入保存
    fs.writeFileSync(mainPath, newMainJS);
    Editor.log("版本更新成功 - " + "當前版本: " + version);
    callback();
}

module.exports = {
    load() {
        Editor.Builder.on('before-change-files', onMainBuildFinish);
    },

    unload() {
        Editor.Builder.removeListener('before-change-files', onMainBuildFinish);
    }
};

class NIO {

    /**
     * 對主遊戲JS檔案寫入版本號
     * @param mainJS
     * @param version
     */
    mainJSWriteVersion(mainJS, version) {
        //添加版本號
        mainJS += '\n' + `window.VERSION = "${version}";`
        return mainJS;
    }

    /**
     * 獲取主遊戲檔案位置
     * @param options
     * @return {string}
     */
    getMainJSPath(options) {
        let mainJS;
        const mainBuild = options.bundles;
        for (let build of mainBuild) {
            if (build.name === "main") {
                mainJS = build.dest;
            }
        }
        //拿取地址
        return path.join(mainJS, '/index.js');
    }

    /**
     * 混淆加密
     * @param mainJsPath - 主遊戲 JS 位置
     * @param canObfuscator - 是否需要加密
     * @return {ObfuscationResult || string}
     */
    obfuscatorAction(mainJsPath, canObfuscator) {
        if (!mainJsPath) return null;
        //讀取檔案
        const script = fs.readFileSync(mainJsPath, 'utf8');
        if (canObfuscator) {
            //混淆加密
            return js_obfuscator.obfuscate(script,
                {
                    compact: true,                  //將代碼輸出到一行
                    controlFlowFlattening: true,    //控制流平坦化
                }
            );
        } else {
            return script;
        }
    }

    updateVersionAction(filePath) {
        const data = this.readVersionFile(filePath);
        const listData = data.split(/\r\n|\n/);
        const data2 = this.getVersion(listData);
        let version;
        let key;
        if (data2) {
            key = Array.from(data2.keys())[0];
            const data3 = data2.get(key);
            version = this.updateVersion(data3[key]);
            this.writeVersion(data3, key, version);
        } else {
            version = DEFAULT;
            this.writeVersion(listData);
        }
        return version;
    }

    /**
     * 讀取自己的VERSION版本
     * @return {string}
     */
    readVersionFile(filePath) {
        const data = fs.readFileSync(filePath, 'utf8')
        return data.toString();
    }

    /**
     * 寫入版本號
     * @param data
     * @param index
     * @param version
     */
    writeVersion(data, index, version) {
        let st = "";
        if (version) {
            data[index] = version;
            for (let i = 0; i < data.length; i++) {
                if (i !== 0) {
                    st = st + '\n' + data[i];
                } else {
                    st = data[i];
                }
            }
        } else {
            for (let i = 0; i < data.length; i++) {
                if (i !== 0) {
                    st = st + '\n' + data[i];
                } else {
                    st = data[i];
                }

            }
            if (data.length > 0) {
                st = st + '\n' + GAME_ID + " : " + DEFAULT;
            } else {
                st = GAME_ID + " : " + DEFAULT;
            }
        }
        fs.writeFileSync(FILE, st);
    }

    /**
     * 保存版本號
     * @param listData
     * @return {null|*}
     */
    getVersion(listData) {
        if (listData.length > 0) {
            for (let i = 0; i < listData.length; i++) {
                if (listData[i].includes(GAME_ID)) {
                    return new Map([[i, listData]]);
                }
            }
        }
        return null;
    }

    /**
     * 更新版本號
     * @param data
     */
    updateVersion(data) {
        const vs = data.split(" ")[2];
        const vr = vs.split(".");
        let version = "";
        for (let n of vr) {
            version += n;
        }
        version = Number(version);
        version++;
        version = String(version);
        const vr2 = version.split("");
        let newVersionString
        for (let i = 0; i < vr2.length; i++) {
            if (i !== 0) {
                newVersionString = newVersionString + "." + vr2[i];
            } else {
                newVersionString = vr2[i];
            }
        }
        const gameID = data.split(" ");
        let newVersion = "";
        for (let i = 0; i < gameID.length - 1; i++) {
            if (i !== 0) {
                newVersion = newVersion + " " + gameID[i];
            } else {
                newVersion = gameID[i];
            }
        }
        newVersion = newVersion + " " + newVersionString;
        return newVersion;
    }
}
