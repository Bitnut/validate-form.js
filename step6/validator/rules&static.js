const regexs = {

    method: /^(.+?)\((.+)\)$/,
    email:/^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/,
    password: /^[0-9a-zA-Z]{6,30}$/,
    numeric: /^[0-9]+$/,
    integer: /^\-?[0-9]+$/,
    alpha: /^[a-z]+$/i,
    alphaNumeric: /^[a-z0-9]+$/i,
    alphaDash: /^[a-z0-9_\-]+$/i,

}

const notices = {
    
    isEmail: "您还没有输入登录邮箱，无法登录！",
    isPassword: "请输入合法的密码!长度应在6-30位包含数字和字母。",
    equal: "两次密码输入需一致",
    success: "成功！",
    required: "不能为空！",
    default: "您需要选择一个非默认项"

}
 
function defaultCallback(errors) {

}

