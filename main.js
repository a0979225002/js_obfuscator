/**
 * @Author XIAO-LI-PIN
 * @Description 打包後自動將js混淆加密
 * 參考 : https://docs.cocos.com/creator/manual/zh/publish/custom-project-build-template.html
 * @Date 2021-06-30 下午 18:24
 * @Version 1.1
 */

const path = require('path');
const fs = require('fs');
const js_obfuscator = require('javascript-obfuscator');


/*打包版本*/
const VERSION = "1.0.0";

/**
 * 主遊戲js加密
 * @param options
 * @param callback
 */
function onMainBuildFinish(options, callback) {
    let mainJS;
    const mainBuild = options.bundles;
    for(let build of mainBuild){
        if(build.name == "main"){
            mainJS = build.dest;
        }
    }

    //拿取地址
    const mainJsPath = path.join(mainJS, '/index.js');

    //讀取檔案
    const script = fs.readFileSync(mainJsPath, 'utf8');

    //混淆加密
    let ob_res = js_obfuscator.obfuscate(script,
        {
            compact: true,                  //將代碼輸出到一行
            controlFlowFlattening: true,    //控制流平坦化
            debugProtection: true,          //使用開發人員工具的其他功能更加困難
            debugProtectionInterval: true,  //開啟開發人員模式,將暫停整個瀏覽器
            disableConsoleOutput: true,     //禁用控制台輸出
        }
    );

    //添加版本號
    ob_res += '\n' + `window.VERSION = "${VERSION}";`

    //寫入保存
    fs.writeFileSync(mainJsPath, ob_res);
    Editor.log("混淆加密成功");
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