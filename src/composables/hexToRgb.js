/**
 * 十六进制color转为rgb
 * 可以处理包含透明度的16进制颜色代码，并将透明度值从0-255的范围转换为0-1的范围，以适应CSS中透明度的表示方式。
 * **/

function hexToRgbWithAlpha(hex) {
    // 移除前缀（如果存在）
    hex = hex.replace(/^#/, '');

    // 检查是否包含透明度
    let hasAlpha = hex.length === 8;
    let r, g, b, a;

    if (hasAlpha) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        a = parseInt(hex.substring(6, 8), 16) / 255; // 将透明度从0-255转换为0-1
    } else {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        a = 1; // 默认透明度为1
    }

    // 返回RGB格式，可选包含透明度
    return hasAlpha ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
}

// // 使用示例
// console.log(hexToRgbWithAlpha('#FFFFFF')); // 输出: rgb(255, 255, 255)
// console.log(hexToRgbWithAlpha('#FFFFFF80')); // 输出: rgba(255, 255, 255, 0.5)

export default hexToRgbWithAlpha;