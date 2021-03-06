const Validator = function(formId, customRules) {

    // 保存页面的所有待验证 field 的信息
    this.fields = {}
    // 把默认的验证规则复制一份绑定在实例上
    for (var a in _testHook) {

        if(_testHook.hasOwnProperty(a)) {
            this[camelCase(a)] = _testHook[a];
        }
        
    }
    
    // 不传参的简单用法
    if (!formId) return this;

    // 检验传入表单名字是否合法
    if ( !document.getElementById(formId)) {
        console.error( `>>>>>> 指定表单: \[ ${formId} \] 不存在，请检查传参！>>>>>>`);
        return;
    }
    
    // 对传入的 customRules 作校验
    if( !checkCustomRules(customRules)) return;
    
    // 添加验证字段
    for(let item of customRules) {
        addField(this, item);
    }

    console.log(this.fields);
}

Validator.prototype = {

    // 表单验证
    validate: function(form) {

        console.log('>>>>> submit event triggered');
        let error = [];
        
        for(let i = 0; i < form.length - 1; i++) {
            
            let ele = form[i];
            let flag = ele.hasAttribute('id');
            let eleTag = flag ? ele.id : ele.name;
            let field = this.fields[eleTag];
            // let eleCategory = flag ? field.category : field.category;
            let rules = field.rules;
            let msg = field.msg;
            let fieldValue = ele.value;

            //field.fieldValue = fieldValue;
            
            //带 required 规则的处理逻辑
            if( rules.indexOf('required') !== -1 ) {
                console.log('check required first');
                if( fieldValue === '') {
                    console.log('不能为空!');
                    error.push ({
                        eleTag: eleTag,
                        msg: notices['required'],
                        isName: flag ? false : true
                    });
                    continue;
                } else if ( rules[1] ){

                    let rule = rules[1];
                    if( typeof(rule) === "string" ) {
                        console.log('using regex');
                        if( !this[rule](fieldValue)) {
                            error.push({
                                eleTag: eleTag,
                                msg: msg,
                                isName: flag ? false : true
                            });
                        }
                    } else {
                        console.log('using method');
                        if (!this[rule.method](fieldValue, rule.args[0])) {
                            error.push({
                                eleTag: eleTag,
                                msg: msg,
                                isName: flag ? false : true
                            });
                        }
                    }
                    continue;
                }
            } else {
                let rule = rules[0];
                if( typeof(rule) === string) {
                    console.log('using regex');
                    if( !this[rule](fieldValue)) {
                        error.push({
                            eleTag: eleTag,
                            msg: msg,
                            isName: flag ? false : true
                        });
                    }
                } else {
                    console.log('using method');
                    if (!this[rule.method](fieldValue, rule.args[0])) {
                        error.push({
                            eleTag: eleTag,
                            msg: msg,
                            isName: flag ? false : true
                        });
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
    
        handleSubmit(error);
        if( error.length === 0) {
            return true;
        } else {
            return false;
        }
        
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
                    field.fieldValue = eleValue;
                    // 验证值是否为空
                    if( eleValue === '' ) {
                        handleSingleInput (inputName, notices['required'], false, true);
                        continue;
                    }
                    if( rules[1] ) {
                        let secondRule = rules[1];
                        if(typeof(secondRule) === "string") {
                            console.log('using regex');
                            handleSingleInput (inputName, msg, this[secondRule](eleValue), true);
                            continue;
                        } else {
                            console.log('using method');
                            handleSingleInput (inputName, msg, this[secondRule.method](eleValue, secondRule.args[0]), true);
                            continue;
                        }
                    }
                }
            } else {
                for(let i = 0; i < eleArr.length; i++) {
                    console.log(`处理第 ${i} 个 name 元素`);
                    eleValue = eleArr[i].value;
                    field.fieldValue = eleValue;
                    let rule = rules[0];
                    if(typeof(rule) === "string") {
                        console.log('using regex');
                        handleSingleInput (inputName, msg, this[rule](eleValue), true);
                        continue;
                    } else {
                        console.log('using method');
                        handleSingleInput (inputName, msg, this[rule.method](eleValue, rule.args[0]), true);
                        continue;
                    }
                }
            }

        } else {

            eleValue = document.getElementById(inputName).value;
            field.fieldValue = eleValue;
            if(rules.indexOf('required') !== -1) {

                if( eleValue === '' ) {
                    handleSingleInput (inputName, notices['required'], false);
                    return;
                }
                if( rules[1] ) {
                    let secondRule = rules[1];
                    if(typeof(secondRule) === "string") {
                        console.log('using regex');
                        handleSingleInput (inputName, msg, this[secondRule](eleValue));
                        return;
                    } else {
                        console.log('using method');
                        handleSingleInput (inputName, msg, this[secondRule.method](eleValue, secondRule.args[0]));
                        return;
                    }
                }

            } else {

                let rule = rules[0];
                if(typeof(rule) === "string") {
                    console.log('using regex');
                    handleSingleInput (inputName, msg, this[rule](eleValue));
                    return;
                } else {
                    console.log('using method');
                    handleSingleInput (inputName, msg, this[rule.method](eleValue, rule.args[0]));
                    return;
                }

            }
        }

    }

}