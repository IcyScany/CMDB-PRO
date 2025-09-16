import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';
import core from 'crypto-js/core';
import padPkcs7 from 'crypto-js/pad-pkcs7';
import encHex from 'crypto-js/enc-hex';
import encBase64 from 'crypto-js/enc-base64';
import http from '@/utils/axios';
// 密码加密
async function encodePasswd(plainPwd) {
    let result = false;
    // 获取随机key，加密密码
    await http.get('public/random/key').then(res => {
        result = encrypt(plainPwd, res.key);
    });
    return result;
}
function encrypt(str, key) {
    // 初始向量 initial vector 16 位
    let iv = key;
    // key 和 iv 可以一致
    key = encUtf8.parse(key);
    iv = encUtf8.parse(iv);
    let encrypted = AES.encrypt(str, key, {
        iv: iv,
        mode: core.mode.CBC,
        padding: padPkcs7,
    });
    // 转换为字符串
    encrypted = encrypted.ciphertext.toString();
    return encrypted;
}
// 密码解密
function decodePasswd(res) {
    const keys = encUtf8.parse(res.param["what_this"]);  //十六位十六进制数作为密钥
    const iv = encUtf8.parse(res.param["what_this"]);   //十六位十六进制数作为密钥偏移量
    let encryptedHexStr = encHex.parse(res.param["know"]);
    let srcs = encBase64.stringify(encryptedHexStr);
    let decrypt = AES.decrypt(srcs, keys, { iv: iv, mode: core.mode.CBC, padding: padPkcs7 });
    let decryptedStr = decrypt.toString(encUtf8);
    decryptedStr = [decryptedStr.toString()];
    decryptedStr = decryptedStr[0];
    if (decryptedStr.indexOf('\u0000') != -1) {
        decryptedStr = decryptedStr.substring(0, decryptedStr.indexOf('\u0000'));
    }
    return decryptedStr;
}

export {
    encrypt,
    encodePasswd,
    decodePasswd,
};
