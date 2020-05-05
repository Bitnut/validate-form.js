// todo: 添加全局调试开关和仅校验开关
const DEBUG = true;
const ONLY_VALIDATE = false;


/**
 * 
 * 数据结构说明：
 * 
 * @param {Object[]} fields             保存所有的待调试 field 信息
 * @param {string} fields.key           保存的 field 标识名：eleTag
 * @param {string} fields[].id          field 的 id 属性
 * @param {string} fields[].name        field 的 name 属性
 * @param {Object} fields[].msg         所有需要自定义的提示信息
 * @param {string} fields[].element     field 的实时 dom 对象
 * @param {string} fields[].rules       指定的规则
 * @param {string} fields[].fieldValue  field 的实时值
 * @param {string} fields[].type        field 的类型
 * @param {string} fields[].checked     是否被选中（处理 CheckBox 和 radio）
 * @param {string} fields[].onblur      是否需要动态验证
 * 
 * @param {Map[]} errors                保存所有实时错误
 * @param {Map[]} errors.key            填写错误的 field 标识名：eleTag
 * @param {Map[]} errors[].msg          需要输出的错误信息
 * @param {Map[]} errors[].element      填写错误的 field 的 dom 对象
 * @param {Map[]} errors[].rule         出错的规则
 * 
 */

let Validator = function(formInfo, customRules, callback = "") {
    
    // 不传参的简单用法
    if (!formInfo) return this;

    // 保存页面的所有待验证 field 的信息
    this.fields = {}
    this.errors = new Map();

    let formId = formInfo.formId;
    let submitId = formInfo.submitId;
    // 检验传入表单名字是否合法
    if ( !document.getElementById(formId)) {
        console.error( `>>>>>> 指定表单: \[ ${formId} \] 不存在，请检查传参！>>>>>>`);
        return;
    }
    if ( !document.getElementById(submitId)) {
        console.error( `>>>>>> 提交按钮 id: \[ ${submitId} \] 不存在，请检查传参！>>>>>>`);
        return;
    }
    // 对传入的 customRules 作校验
    if( !checkCustomRules(customRules)) return;

    // 添加表单、 id 提交按钮 id 、验证字段、callback、handler
    this.formId = formId;
    this.submitId = submitId;
    this.form = document.forms[formId];
    this.handlers = {};
    for(let item of customRules) {
        
        addField(this, item);

    }
    this.callback = callback;
    
    //let _onsubmit = this.form.onsubmit;
    
    this.form.onsubmit = (function(that) {
        return function(evt) {
            try {     
                return that.validateForm(evt);
            } catch(e) {
                console.error(e);
                evt.preventDefault();
            }
        };
    })(this);
    if( DEBUG ) {
        console.log('>>>>>> initalize complete');
        console.log(this.fields);
    } 
    
}

Validator.prototype = {

    // 表单验证
    validateForm: function(evt) {

        this.errors.clear();
        console.log('>>>>> submit event triggered');
        // let form = this.form;
        
        for (let key in this.fields) {
            if(this.fields.hasOwnProperty(key)){
                
                let field = this.fields[key];
                let eleTag = field.id ? field.id : field.name;
                let element = this.form[eleTag];

                if( DEBUG ) {
                    console.log(`validating ${key}`);
                    console.log(element);
                }

                if (element && element !== undefined) {
                    field.element = element;
                    field.type = (element.length > 0) ? element[0].type : element.type;
                    field.fieldValue = attributeValue(element, 'value');
                    field.checked = attributeValue(element, 'checked');
                    this._validateField(field);
                }
            }
        }

        if (typeof this.callback === 'function') {
            console.log('callback invoked!')
            this.callback(this.errors, evt);
        }
       
        if( !ONLY_VALIDATE ) handleSubmit(this.errors);

        if (this.errors.size > 0) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
                return false;
            } else if (event) {
                // 适配 IE 
                event.returnValue = false;
                return false;
            }
        }
        return true;

    },
    blurValidate: function( eleTag, isName = false ) {
        console.log('>>>>> onblur event triggered');

        let field = this.fields[eleTag];
        let element = this.form[eleTag];
        field.type = (element.length > 0) ? element[0].type : element.type;
        field.fieldValue = attributeValue(element, 'value');
        field.checked = attributeValue(element, 'checked');
        field.element = element;
        this.errors.delete(eleTag);
        this._validateField(field);

        if( ONLY_VALIDATE ) return;

        let nameValue = isName ? field.name : field.id;
        console.log(nameValue);
        if( this.errors.has(eleTag) ) {
            handleSingleInput(nameValue, this.errors);
        } else {
            handleSingleInput(nameValue, this.errors, true);
        }
        return;
    },
    _validateField: function(field) {

        let rules = field.rules;
        let indexOfRequired = rules.indexOf('required');
        let eleTag = field.id ? field.id : field.name;
        
        let isEmpty = !field.fieldValue;


        //遍历 field 的所有规则，并解析需要传参的函数
        for (let i = 0; i < rules.length; i++) {   
            
            let method = rules[i];
            let param = null;
            let failed = false;
            let parts = regexs.method.exec(method);

            // 如果 field 不是必填项且为空直接跳过
            // 除非 field 规则中带有外部注册的优先 !callback
            
            
            if (indexOfRequired === -1 && method.indexOf('!callback_') === -1 && isEmpty) {
                continue;
            }
            
            
            // 如果是传参函数，将函数名和形参分离
            if (parts) {
                method = parts[1];
                param = parts[2];   
            }

            if (method.charAt(0) === '!') {
                method = method.substring(1, method.length);
            }

            
            if (typeof this._testHooks[method] === 'function') {
                if (!this._testHooks[method].apply(this, [field, param])) {
                    failed = true;
                }
            } else if (method.substring(0, 9) === 'callback_') {
                // Custom method. Execute the handler if it was registered
                method = method.substring(9, method.length);

                if (typeof this.handlers[method] === 'function') {
                    if (this.handlers[method].apply(this, [field.fieldValue, param, field]) === false) {
                        failed = true;
                    }
                }
            } else {
                console.error('试图使用一个不存在的方法进行校验');
            }

            // 处理校验错误，写在前面的规则优先级高于后面的规则
            if (failed) {

                let existingError = this.errors.get(eleTag);
                if( existingError ) return;

                let message = "";
                if( field.msg ) {
                    message = field.msg[method] || notices[method];
                } else {
                    message = notices[method];
                }
                
                let errorObject = {
                    //id: field.id,
                    msg: message,
                    element: field.element,
                    //name: field.name,
                    rule: method
                };
                
                if (!existingError) {
                    this.errors.set(eleTag, errorObject);
                }
            }
        }
    },
    check: function(rule, stringToValidate) {
        let fun = this._testHooks[rule];
        return fun(stringToValidate, true);
    },
    registerCallback: function(name, handler) {
        if (name && typeof name === 'string' && handler && typeof handler === 'function') {
            this.handlers[name] = handler;
        }
        return this;
    },
    setMessage: function(rule, message) {
        notices[rule] = message;

        // return this for chaining
        return this;
    },

}

Validator.prototype._testHooks = {
    
    required: function(field) {
        var value = field.fieldValue;
        console.log(field);
        if ((field.type === 'checkbox') || (field.type === 'radio')) {
            return (field.checked === true);
        }

        return (value !== null && value !== '');
    },
    isEmail: function(field, check = false) {
        if(check) {
            return regexs.email.test( field );
        } else {
            return regexs.email.test( field.fieldValue );
        }
    },
    isPassword: function(field, check = false) {
        if(check) {
            return regexs.password.test( field );
        } else {
            return regexs.password.test( field.fieldValue );
        }
    },
    equal: function (field, newField) {
        let ele = this.form[newField];
        if(ele) {
            return field.fieldValue === ele.value;
        }
        return false;
    }

}