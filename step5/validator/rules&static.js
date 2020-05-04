const regexs = {

    method: /^(.+?)\((.+)\)$/,
    email:/^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/,
    password: /^[0-9a-zA-Z]{6,30}$/,

}

const notices = {
    
    isEmail: "您还没有输入登录邮箱，无法登录！",
    isPassword: "请输入合法的密码!长度应在6-30位包含数字和字母。",
    isRepassword: "两次密码输入需一致",
    success: "成功！",
    required: "不能为空！"

}

