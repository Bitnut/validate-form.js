const regexs = {

    method: /^(.+?)\((.+)\)$/,
    email:/^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/,
    password: /^[0-9a-zA-Z]{6,30}$/,

}

const notices = {
    
    email: "您还没有输入登录邮箱，无法登录！",
    password: "请输入合法的密码!长度应在6-30位包含数字和字母。",
    repassword: "两次密码输入需一致",
    success: "成功"

}

const customRules = [

    {
        name: 'email',
        msg: '请输入正确的邮件地址',
        rule: 'required|is_email',
    },
    {
        name: 'password',
        msg: '请输入合法的密码!长度应在6-30位包含数字和字母。',
        rule: 'required|is_password',
    },
    {
        name: 'repassword',
        msg: '两次密码输入需一致',
        rule: 'required|equal(password)',
    }

]

const _testHook = {
    
    is_email: function(field){return regexs.email.test( field );},
    is_password: function(field){return regexs.password.test( field );},
    required: function(field){return field !== '' && field !== null},
    equal: function (field, newField) {
        return field === newField;
    }

}

let clear = function( noticeClass ){

    console.log('clearing notice');
    for( let i = 0; i < document.getElementsByClassName(noticeClass).length; i++) {
        document.getElementsByClassName(noticeClass)[i].style.display = 'none';
    }

}

let log = function (type) {

    console.log( notices[type] );

}

let validator = function(formId, customRules) {
    
  
    // 把默认的验证规则复制一份绑定在实例上
    for (var a in _testHook) {

        if(_testHook.hasOwnProperty(a)) {

            this[camelCase(a)] = _testHook[a];

        }
        
    }

    // 传参为 0 时的简单用法,在这里直接返回
    if (!formId) return this;

    // 保存页面的所有待验证 field 的信息
    this.fields = {}

    // 对 customRules 作处理
    for(let i = 0; i < customRules.length; i++) {

        let tmp = customRules[i];

        // 保证一个规则至少包括名字或者 id 和规则
        if( !(tmp.name && tmp.id) ) {
            
            console.warn( 'skiped a rule without a name or id');

        }
        if( !tmp.rules && typeof(tmp.rules) === 'string' && tmp.rules !== '' ) {

            console.warn( `skiped a rule with name: \[ ${tmp.name} \] since you have passed a rule without \' rules \' attribute`);

        }

        // 添加验证字段
        addField(this, tmp);

    }
    
}

// 为validator 实例绑定函数时对函数名做适当处理
function camelCase(string){ 

    return string.replace( /\_([a-z])/g, function( word, letterToReplace ) {

        return letterToReplace.toUpperCase();

    });

}

function addField( self, field ){
    let nameValue = field.id ? field.id : field.name;
    console.log('>>>>> adding field');
    self.fields[nameValue] = {

        id: field.id ? field.id : null,
        name: field.name ? field.name : null,
        msg: field.msg? field.msg : "",
        category: field.category? field.category : null,
        rules: field.rules,
        // element: null,
        onblur: field.onblur ? field.onblur : true

    }
    // 绑定 onblur 事件监听器
    if( self.fields[nameValue].onblur === true ) {
        if( field.id ) {

            console.log(`>>>>> adding id ${field.id}`);
            document.getElementById(field.id).addEventListener("blur", function() { 
                blurValidate(field.category, field.id);
            } , true);

        } else {

            console.log(`>>>>> adding name ${field.name}`);
            let target = document.getElementsByName(field.name);
            for(let i = 0; i < target.length; i++) {
                document.getElementsByName(field.name)[i].addEventListener("blur", function() {
                    blurValidate(field.category, field.name, true);
                }, true);
            }
            
        }
    }
    

    // todo: 传入自定义的正则匹配规则
    // for (var a in field) {

    //   if (field.hasOwnProperty(a) && /^regexp\_/.test(a)) {

    //     regexs[a] = field[a];

    //   }

    // }

}

// 提交表单时触发
let handleError = function(err) {

    console.log( 'handling error msg' );

    if(err.length === 0) {

        console.log('err length is 0');
        return;

    } else {

        for(let a in err) {

            console.log(a, err[a]);
            var ele = document.getElementById(`${a}-span`);
            ele.innerHTML = err[a];
            ele.style.display = 'inline';
            
        }
        return;

    }
    return;

}

validator.prototype.validate = function(form, noticeClass) {

    clear(noticeClass);
    let error = {};

    
    for(let i = 0; i < form.length - 1; i++) {
        let target = this.fields[form[i].name].category;

        if (regexs[target].test(form[i].value)) {

            log('success');

        } else{

            let name = target;
            log(name);
            error[name] = notices[name];

        }

    }

    handleError(error, noticeClass);
    
}

// 控件失去焦点时触发
// todo: 添加验证成功的处理
let handleSingleErr = function( name, message, isName = false ) {
    
    if( isName ) {
        var ele = document.getElementsByName(`${name}-span`);
        console.log(ele);
        for(let i = 0; i < ele.length; i++) {
            ele[i].innerHTML = message;
            ele[i].style.display = 'inline';
        }
    } else {
        var ele = document.getElementById(`${name}-span`);
        ele.innerHTML = message;
        ele.style.display = 'inline';
    }
    
    

}

let blurValidate = function( category, inputName, isName = false ) {
    console.log('>>>>> onblur event triggered')
    let flag = false;
    let rule;
    for( let item of customRules) {
        if(item.name === category) {
            flag = true;
            rule = item;
            break;
        }
    }
    if(flag) {
         
        let msg = rule.msg;
        let rules = rule.rule.split('|');

        let field;
        if ( isName ) {
            let targetArr = document.getElementsByName(inputName);
            for(let i = 0; i < targetArr.length; i++) {
                field = targetArr[i].value;
                
                if(rules.indexOf('required') !== -1 && field === '') {
                    console.log('必填');
                    handleSingleErr (inputName, '必填!', true);
                    return;
                }
                let index = _testHook.hasOwnProperty(rules[1]);
                if( index && !_testHook[rules[1]](field) ) {
                    console.log(msg);
                    handleSingleErr (inputName, msg, true);
                    return;
                } 
                // 解析函数规则
                var parts = regexs.method.exec(rules[1]);
                let method, args;
                if(parts) {
                    method = parts[1];
                    args = parts[2].split(',');
                    let hasMethod = _testHook.hasOwnProperty(method);
                    if( hasMethod && !_testHook[method]( document.getElementById(args[0]).value, field) ) {
                        console.log(msg);
                        handleSingleErr (inputName, msg, true);
                        return;
                    }
                }
            }

        } else {
            field = document.getElementById(inputName).value;
            if(rules.indexOf('required') !== -1 && field === '') {
                console.log('必填');
                handleSingleErr (inputName, '必填!');
                return;
            }
            let index = _testHook.hasOwnProperty(rules[1]);
            if( index && !_testHook[rules[1]](field) ) {
                console.log(msg);
                handleSingleErr (inputName, msg);
                return;
            } 
            // 解析函数规则
            var parts = regexs.method.exec(rules[1]);
            let method, args;
            if(parts) {
                method = parts[1];
                args = parts[2].split(',');
                let hasMethod = _testHook.hasOwnProperty(method);
                if( hasMethod && !_testHook[method]( document.getElementById(args[0]).value, field) ) {
                    console.log(msg);
                    handleSingleErr (inputName, msg);
                    return;
                }
            }
        }

    } else {

        console.log('符合条件的规则不存在，请检查传参');

    }

}