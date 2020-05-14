const regexs = {

    username: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{3,16}$/,
    method: /^(.+)\((.+)\)$/,
    start2End: /^(.+)\[(\d?,\d?)\]$/,
    email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(\w+\.)+\w+$/,
    password: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{6,30}$/,
    numeric: /^[+-]?([0-9]*[.])?[0-9]+$/,
    numericNoSymbols: /^[0-9]+$/,
    int: /^[-+]?(0|[1-9]\d*)$/,
    uint: /^(0|[1-9]\d*)$/,
    float: /^([+-]?((0|[1-9]\d*)\.[0-9]*))|([+-]?(0|[1-9]\d*))$/,
    alpha: /^[a-zA-Z]+$/,
    alphaNumeric: /^[a-zA-Z0-9]+$/,
    alphaDash: /^[a-zA-Z0-9_-]+$/

};

const notices = {

    isEmail: '您还没有输入登录邮箱，无法登录！',
    isPassword: '请输入合法的密码!长度应在6-30位包含数字和字母。',
    equal: '两次密码输入需一致',
    success: '成功！',
    required: '不能为空！',
    default: '您需要选择一个非默认项'

};

function defaultCallback (errors) {

}

export {
    regexs,
    notices,
    defaultCallback
};
