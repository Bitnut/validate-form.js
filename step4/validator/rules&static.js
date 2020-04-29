const regexs = {

    method: /^(.+?)\((.+)\)$/,
    email:/^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/,
    password: /^[0-9a-zA-Z]{6,30}$/,

}

const notices = {
    
    email: "您还没有输入登录邮箱，无法登录！",
    password: "请输入合法的密码!长度应在6-30位包含数字和字母。",
    repassword: "两次密码输入需一致",
    success: "成功！",
    required: "不能为空！"

}

const _testHook = {
    
    is_email: function(field){return regexs.email.test( field );},
    is_password: function(field){return regexs.password.test( field );},
    required: function(field){return field !== '' && field !== null},
    equal: function (field, newField) {
        let value1 = field;
        let value2 = this.fields[newField].fieldValue;

        return value1 == value2;
    }

}