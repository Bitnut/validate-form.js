import { initCheck, addField, attributeValue } from './util.js'
import { handleSubmit, handleSingleInput} from './noticeHandler.js'
import { regexs, notices, defaultCallback} from './rules&static.js'

const DEBUG = true;
const INIT_FAILED = -1;

/**
 * 传参：
 * @param {Object} formInfo 用户传入的表单以及提交按钮的 id 属性（必须是id）
 * @param {Object} customRules 用户传入的自定义规则
 * @param {function} callback 用户指定的
 * 
 * 数据结构说明：
 *
 * @param {Object[]} fields             保存所有的待调试 field 信息
 * @param {string} fields.[[entries]]   保存的 field 标识名：eleTag
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
class Validator {
    constructor(formInfo, customRules, callback = defaultCallback) {
        // 不传参的简单用法
        if (!formInfo)
            return this;
        // 初始化校验    
        try {
            initCheck(formInfo, customRules, callback);
        } catch (error) {
            console.error(error)
            return INIT_FAILED;
        }
        

        const {formId, submitId, onlyValidate} = formInfo;
        
        // 保存页面的所有待验证 field 和 错误
        this.fields = new Map();
        this.errors = new Map();
        // 添加表单、 id 提交按钮 id 、验证字段、callback、handlers
        this.formId = formId;
        this.submitId = submitId;
        this.form = document.forms[formId];
        this.handlers = {};
        this.onlyValidate = onlyValidate ? onlyValidate : false;
        for (let item of customRules) {
            addField(this, item);
        }
        this.callback = callback;

        // 提交拦截
        let userOnSubmit = this.form.onsubmit;
        this.form.onsubmit = (function (that) {
            return function (evt) {
                try {
                    return that.validateForm(evt) && ( !userOnSubmit || userOnSubmit());
                }
                catch (e) {
                    console.error(e);
                    evt.preventDefault();
                }
            };
        })(this);

        if (DEBUG) {
            console.log('>>>>>> initalize complete >>>>>>');
            console.log(this.fields);
        }
    }

    // 校验钩子
    _testHooks = {
    
        required: function(field) {
            var value = field.fieldValue;
            if ((field.type === 'checkbox') || (field.type === 'radio')) {
                return (field.checked === true);
            }
    
            return (value !== null && value !== '');
        },
        isUsername: function (field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.username.test( fieldValue );
        },
        isEmail: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.email.test( fieldValue );
        },
        isPassword: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.password.test( fieldValue );
        },
        isNumeric: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.numeric.test( fieldValue );
        },
        isInteger: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.integer.test( fieldValue );
        },
        isNatural: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.natural.test( fieldValue );
        },
        isFloat: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.float.test( fieldValue );
        },
        isAlpha: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.alpha.test( fieldValue );
        },
        isAlphaNumeric: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.alphaNumeric.test( fieldValue );
        },
        isAlphaDash: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.alphaDash.test( fieldValue );
        },
        equal: function (field, newField) {
            let ele = this.form[newField];
            if(ele) {
                return field.fieldValue === ele.value;
            }
            console.log(ele.value, field.fieldValue);
            return false;
        },
        default: function(field, defaultName){
            return field.fieldValue !== defaultName;
        },
        minLength: function(field, length) {
            if (!regexs.numeric.test(length)) {
                return false;
            }

            return (field.fieldValue.length >= parseInt(length, 10));
        },
        maxLength: function(field, length) {
            if (!regexs.numeric.test(length)) {
                return false;
            }

            return (field.fieldValue.length <= parseInt(length, 10));
        },
        exactLength: function(field, length) {
            if (!regexs.numeric.test(length)) {
                return false;
            }

            return (field.fieldValue.length === parseInt(length, 10));
        },
    }
    _validateField(field) {

        let { rules, eleTag, fieldValue, msg, element } = field;
        let failed = false;

        // 如果 field 不是必填项且为空，则直接返回
        // 除非 field 规则中带有外部注册的优先回调：如 !callback_check_password
        let indexOfRequired = rules.indexOf('required');
        let isEmpty = !fieldValue;
        
        if (indexOfRequired === -1 && isEmpty && method.indexOf('!callback_') === -1) {
            return;
        }

        //遍历 field 的所有规则，并解析需要传参的函数
        for (let i = 0; i < rules.length; i++) {   
            
            let method = rules[i];
            let param = null;
            let parts = regexs.method.exec(method);
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
                    if (this.handlers[method].apply(this, [fieldValue, param, field]) === false) {
                        failed = true;
                    }
                } else throw ReferenceError(`试图使用一个未注册的回调函数: ${method} 进行校验`);
            } else {
                throw ReferenceError(`试图使用一个不存在的方法: ${method} 进行校验`);
            }

            // 处理校验错误，写在前面的规则优先级高于后面的规则
            if (failed) {

                let existingError = this.errors.get(eleTag);
                if( existingError ) return;

                let message = "";
                if( msg ) {
                    message = msg[method] || notices[method];
                } else {
                    message = notices[method];
                }
                
                let errorObject = {
                    msg: message,
                    element: element,
                    rule: method
                };
                
                if (!existingError) {
                    console.log(eleTag);
                    this.errors.set(eleTag, errorObject);
                }
                break;

            }
        }

    }
    // 表单验证
    validateForm(evt) {

        this.errors.clear();
        if( DEBUG ) console.log('>>>>> submit event triggered >>>>>>');

        for( let [key, value] of this.fields) {
            let field = value;
            let element = this.form[field.eleTag];

            if( DEBUG ) {
                console.log(`validating ${key}`);
            }

            if (element && element !== undefined) {
                field.fieldValue = attributeValue(element, 'value');
                field.checked = attributeValue(element, 'checked');
                try {
                    this._validateField(field);
                } catch (e) {
                    console.error(e);
                    return;
                }
            }

        }

        if( DEBUG ) console.log('>>>>>> invoking callback! >>>>>>')
        this.callback(this.errors, evt);
        if( !this.onlyValidate ) handleSubmit(this.fields, this.errors);

        if (this.errors.size > 0) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            } else if (event) {
                // 适配 IE 
                event.returnValue = false;
            }
        }
        return;

    }
    // 动态验证
    blurValidate( eleTag, isName = false ) {
        if( DEBUG ) console.log('>>>>> onblur event triggered >>>>>>');

        let field = this.fields.get(eleTag);
        let element = field.element;
        field.fieldValue = attributeValue(element, 'value');
        field.checked = attributeValue(element, 'checked');
        field.element = element;
        this.errors.delete(eleTag);

        try {
            this._validateField(field);
        } catch (e) {
            console.error(e);
            return;
        }

        console.log(this.fields);
        if( this.onlyValidate ) return;

        let nameValue = isName ? field.name : field.id;

        if( this.errors.has(eleTag) ) {
            handleSingleInput(nameValue, this.errors);
        } else {
            handleSingleInput(nameValue, this.errors);
        }
        return;
    }
    // 调用组件作简单验证(一般的正则校验)
    check(rule, stringToValidate) {
        let fun = this._testHooks[rule];
        return fun(stringToValidate, true);
    }
    // 为某个 field 注册自定义回调函数
    registerCallback(name, handler) {
        if (name && typeof name === 'string' && handler && typeof handler === 'function') {
            this.handlers[name] = handler;
        }
        
        // 支持链式调用
        return this;
    }
    // 为某个自定义回调函数注册提示信息
    setMessage(rule, message) {
        notices[rule] = message;
        return this;
    }

}

export {
    DEBUG,
    Validator
};