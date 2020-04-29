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
        let value1 = field;
        let value2 = this.fields[newField].fieldValue;

        return value1 == value2;
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

let Validator = function(formId, customRules) {
    
  
    // 把默认的验证规则复制一份绑定在实例上
    for (var a in _testHook) {

        if(_testHook.hasOwnProperty(a)) {

            this[camelCase(a)] = _testHook[a];

        }
        
    }

    // 不传参的简单用法
    if (!formId) return this;

    // 保存页面的所有待验证 field 的信息
    this.fields = {}

    // 对传入的 customRules 作校验
    for(let i = 0; i < customRules.length; i++) {

        let tmp = customRules[i];
        let nameValue = tmp.id ? tmp.id : tmp.name;
        
        if( !nameValue ) {
            console.error( '>>>>>> 请至少为一个规则给定元素 id 或者 name！>>>>>>');
            return;
        }
        // todo: 查询一下是否可以查找到非实时页面的元素
        if( !(document.getElementById(nameValue) || document.getElementsByName(nameValue))) {
            console.error( `>>>>>> 元素 id 或者 name: \[ ${nameValue} \] 在页面中不存在，请检查传参！>>>>>>`);
            return;
        }
        if( !(tmp.rules && typeof(tmp.rules) === 'string' && tmp.rules !== '') ) {
            console.error( `>>>>>> 元素: \[ ${nameValue} \] 的规则传递错误，请检查传参！>>>>>>`);
            return;
        }

    }
    // 添加验证字段
    for(let item of customRules) {
        addField(this, item);
    }


    console.log(this.fields);
}

// 为validator 实例绑定函数时对函数名做适当处理
function camelCase(string){ 

    return string.replace( /\_([a-z])/g, function( word, letterToReplace ) {

        return letterToReplace.toUpperCase();

    });

}

function ruleExist(self, rules) {
    console.log("checking rules exist");
    for(let i = 0; i < rules.length; i++) {
        if( typeof(rules[i]) === "string" && !self.hasOwnProperty(rules[i])) {
            return false;
        } else if ( typeof(rules[i]) === "Object" && !self.hasOwnProperty(rules[i].method)) {
            return false;
        }
    }
    return true;
}

function addField( self, field ){
    let nameValue = field.id ? field.id : field.name;
    console.log('>>>>> adding field');
    self.fields[nameValue] = {

        id: field.id ? field.id : null,
        name: field.name ? field.name : null,
        msg: field.msg? field.msg : "",
        category: field.category? field.category : null,
        rules: null,
        fieldValue: null,
        // element: null,
        onblur: field.onblur ? field.onblur : true

    }


    // todo: 目前只支持两种规则，待扩展
    // 下面代码为指定元素绑定规则
    let rules = field.rules.split('|');
    // 处理特殊的带参数函数规则，如：equeal(password)
    if( rules.indexOf('required') !== -1 && rules[1] && !self.hasOwnProperty(rules[1])) {
        
        let parts = regexs.method.exec(rules[1]);
        rules[1] = {
            method: parts[1],
            args: parts[2].split(',')
        }

    } else if ( !self.hasOwnProperty(rules[0])) {

        let parts = regexs.method.exec(rules[0]);
        rules[0] = {
            method: parts[1],
            args: parts[2].split(',')
        }

    }
    // 验证规则是否存在
    let hasRule = ruleExist(self, rules);
    if(!hasRule) {
        console.error('你传递了一个不存在的规则!');
        return;
    }
    self.fields[nameValue].rules = rules;

    
    // 下面代码绑定 onblur 事件监听器
    if( self.fields[nameValue].onblur === true ) {
        if( field.id ) {

            console.log(`>>>>> adding id ${field.id}`);
            document.getElementById(field.id).addEventListener("blur", function() { 
                self.blurValidate( field.id );
            } , true);

        } else {

            console.log(`>>>>> adding name ${field.name}`);
            let target = document.getElementsByName(field.name);
            for(let i = 0; i < target.length; i++) {
                document.getElementsByName(field.name)[i].addEventListener("blur", function() {
                    self.blurValidate( field.name, true);
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


// todo: 添加成功状态的处理
// 处理整个表单状态的接口函数
let handleError = function(err) {

    console.log( 'handling error msg' );
    if(err.length === 0) {

        console.log('err length is 0');
        return;

    } else {

        for(let a in err) {

            console.log(a, err[a]);
            if ( !err[a].isName ) {
                let ele = document.getElementById(`${a}-span`);
                ele.innerHTML = err[a].msg;
                ele.style.display = 'inline';
            } else {
                let eleArr = document.getElementsByName(`${a}-span`);
                console.log(eleArr);
                for( let i = 0; i < eleArr.length; i++ ) {

                    eleArr[i].innerHTML = err[a].msg;
                    eleArr[i].style.display = 'inline';

                }
            }
            
            
        }
        return;

    }

}

Validator.prototype = {

    // 表单验证
    validate: function(form, noticeClass) {

        console.log('>>>>> submit event triggered');
        clear(noticeClass);
        let error = {};
        
        for(let i = 0; i < form.length - 1; i++) {
            
            let ele = form[i];
            let flag = ele.hasAttribute('id');
            let eleTag = flag ? ele.id : ele.name;
            let field = this.fields[eleTag];
            // let eleCategory = flag ? field.category : field.category;
            let rules = field.rules;
            let msg = field.msg;
            let fieldValue = ele.value;

            field.fieldValue = fieldValue;
            
            //带 required 规则的处理逻辑
            if( rules.indexOf('required') !== -1 ) {
                console.log('check required first');
                if( fieldValue === '') {
                    console.log('不能为空!');
                    error[eleTag] = {
                        msg: notices['required'],
                        isName: flag ? false : true
                    };
                    continue;
                } else if ( rules[1] ){

                    let rule = rules[1];
                    if( typeof(rule) === "string" ) {
                        console.log('using regex');
                        if( !this[rule](fieldValue)) {
                            error[eleTag] = {
                                msg: msg,
                                isName: flag ? false : true
                            };
                        }
                    } else {
                        console.log('using method');
                        if (!this[rule.method](fieldValue, rule.args[0])) {
                            error[eleTag] = {
                                msg: msg,
                                isName: flag ? false : true
                            };
                        }
                    }
                    continue;
                }
            } else {
                let rule = rules[0];
                if( typeof(rule) === string) {
                    console.log('using regex');
                    if( !this[rule](fieldValue)) {
                        error[eleTag] = {
                            msg: msg,
                            isName: flag ? false : true
                        };
                    }
                } else {
                    console.log('using method');
                    if (!this[rule.method](fieldValue, rule.args[0])) {
                        error[eleTag] = {
                            msg: msg,
                            isName: flag ? false : true
                        };
                    }
                }
                continue;
            }
            

            // todo: 添加自定义正则的功能
            // if(regexs[eleCategory]) {
    
            //     if (regexs[eleCategory].test(ele.value)) {
    
            //         log('success');
        
            //     } else{
    
            //         error[eleTag] = {
            //             msg: notices[eleCategory],
            //             isName: flag ? false : true
            //         };
        
            //     }
    
            // }
    
            
    
        }
    
        handleError(error, noticeClass);
        
    },
    blurValidate: function( eleTag, isName = false ) {
        console.log('>>>>> onblur event triggered');
        
        let field = this.fields[eleTag];
        let msg = field.msg;
        let rules = field.rules.slice(0);
        let inputName = isName ? field.name : field.id;


        if ( isName ) {

            let eleArr = document.getElementsByName(inputName);
            if( rules.indexOf('required') !== -1 ) {
                for(let i = 0; i < eleArr.length; i++) {
                    console.log(`处理第 ${i} 个 name 元素`);
                    eleValue = eleArr[i].value;
                    // 验证值是否为空
                    if( eleValue === '' ) {
                        console.log(notices['required']);
                        handleSingleErr (inputName, notices['required'], true);
                        continue;
                    }
                    if( rules[1] ) {
                        let secondRule = rules[1];
                        if(typeof(secondRule) === "string") {
                            console.log('using regex');
                            if( !this[secondRule](eleValue) ) {
                                console.log(msg);
                                handleSingleErr (inputName, msg, true);
                                continue;
                            }
                        } else {
                            console.log('using method');
                            if (!this[secondRule.method](eleValue, secondRule.args[0])) {
                                console.log(msg);
                                handleSingleErr (inputName, msg, true);
                                continue;
                            }
                        }
                    }
                }
            } else {
                for(let i = 0; i < eleArr.length; i++) {
                    console.log(`处理第 ${i} 个 name 元素`);
                    eleValue = eleArr[i].value;
                    let rule = rules[0];
                    if(typeof(rule) === "string") {
                        console.log('using regex');
                        if( !this[rule](eleValue) ) {
                            console.log(msg);
                            handleSingleErr (inputName, msg, true);
                            continue;
                        }
                    } else {
                        console.log('using method');
                        if (!this[rule.method](eleValue, rule.args[0])) {
                            console.log(msg);
                            handleSingleErr (inputName, msg, true);
                            continue;
                        }
                    }
                }
            }

        } else {

            eleValue = document.getElementById(inputName).value;
            if(rules.indexOf('required') !== -1) {

                if( eleValue === '' ) {
                    console.log(notices['required']);
                    handleSingleErr (inputName, notices['required']);
                    return;
                }
                if( rules[1] ) {
                    let secondRule = rules[1];
                    if(typeof(secondRule) === "string") {
                        console.log('using regex');
                        if( !this[secondRule](eleValue) ) {
                            console.log(msg);
                            handleSingleErr (inputName, msg);
                            return;
                        }
                    } else {
                        console.log('using method');
                        if (!this[secondRule.method](eleValue, secondRule.args[0])) {
                            console.log(msg);
                            handleSingleErr (inputName, msg);
                            return;
                        }
                    }
                }

            } else {

                let rule = rules[0];
                if(typeof(rule) === "string") {
                    console.log('using regex');
                    if( !this[rule](eleValue) ) {
                        console.log(msg);
                        handleSingleErr (inputName, msg);
                        return;
                    }
                } else {
                    console.log('using method');
                    if (!this[rule.method](eleValue, rule.args[0])) {
                        console.log(msg);
                        handleSingleErr (inputName, msg);
                        return;
                    }
                }

            }
        }

    }

}

// 控件失去焦点时触发
// todo: 添加验证成功的处理
// 处理单个 input 元素状态的接口函数
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