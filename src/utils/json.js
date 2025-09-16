// 为json数据添加高亮
function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

// 校验是否符合json格式（<a-form>的validator）
async function validateJson(rule, value) {
    if (value) {
        try {
            value = JSON.parse(value);
            if (typeof value === 'object' && value) {
                return Promise.resolve();
            } else {
                return Promise.reject();
            }
        } catch (e) {
            return Promise.reject();
        }
    }
    return Promise.resolve();
}

export {
    syntaxHighlight,
    validateJson,
};
