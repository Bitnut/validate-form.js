// 初始化传参验证
function initCheck (formInfo, customRules, callback) {
    checkFormInfo(formInfo);
    checkCustomRules(customRules);
    // 检查 callback 类型
    if (typeof (callback) !== 'function') {
        throw TypeError('传入的回调类型不是函数，请检查传参！');
    }
}
// 校验表单信息
function checkFormInfo (formInfo) {
    const { formId, onlyValidate } = formInfo;

    // 检验传入表单名字、提交按钮是否合法
    if (!document.getElementById(formId)) {
        throw ReferenceError(`指定表单: [ ${formId} ] 不存在，请检查传参！`);
    }
    if (onlyValidate && typeof (onlyValidate) !== 'boolean') {
        throw TypeError('onlyValidate 参数不是 boolean 值，请检查传参！');
    }
}

// 对传入的 customRules 作校验
function checkCustomRules (customRules) {
    for (let i = 0; i < customRules.length; i++) {
        const tmp = customRules[i];
        const nameValue = tmp.id ? tmp.id : tmp.name;

        if (!nameValue) {
            throw ReferenceError('请至少为每个规则给定元素 id 或者 name！');
        }
        if (!(document.getElementById(nameValue) || document.getElementsByName(nameValue).length !== 0)) {
            throw ReferenceError(`元素 id 或者 name: [ ${nameValue} ] 在页面中不存在，请检查传参！`);
        }
        if (!(tmp.rules && typeof (tmp.rules) === 'string' && tmp.rules !== '')) {
            throw TypeError(`元素: [ ${nameValue} ] 的规则传递错误，请检查传参！`);
        }
    }
}

function checkCustomHandler (name, handler) {
    if (!(name && typeof (name) === 'string' && handler && typeof (handler) === 'function')) {
        throw TypeError('注册回调函数时传参规则错误！');
    }
}

function trim (str) {
    str = str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+/, '');
    const ws = /\s/;
    let i = str.length;
    while (ws.test(str.charAt(--i)));
    return str.slice(0, i + 1);
}

export {
    initCheck,
    checkCustomHandler,
    trim
};
