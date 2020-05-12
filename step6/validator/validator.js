import { initCheck, addField, attributeValue, checkCustomHandler } from './util.js'
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
        

        const {formId, submitId, onlyValidate, async} = formInfo;
        
        
        // 添加表单、 id 提交按钮 id 、验证字段、callback、handlers
        this.formId = formId;
        this.submitId = submitId;
        this.async = async ? async : true;
        this.onlyValidate = onlyValidate ? onlyValidate : false;

        // 保存页面的所有待验证 field 和 错误
        this.fields = new Map();
        this.errors = new Map();
        
        this.form = document.forms[formId];
        this.handlers = {};
        this.handlerNotice = {};
        
        for (let item of customRules) {
            addField(this, item);
        }
        this.callback = callback;

        // 提交拦截
        let userOnSubmit = this.form.onsubmit;
        this.form.onsubmit = (() => {
            return (evt) => {
                try {
                    !userOnSubmit || userOnSubmit();
                    this.validateForm(evt);
                }
                catch (e) {
                    console.error(e);
                    evt.preventDefault();
                }
            };
        })();

        if (DEBUG) {
            console.log('>>>>>> initalize complete >>>>>>');
            console.log(this.fields);
        }
    }

    // 校验钩子
    _testHooks = {
    
        required: function(field) {
            const {fieldValue, type, checked} = field;
            if ((type === 'checkbox') || (type === 'radio')) {
                return (checked === true);
            }
    
            return (fieldValue !== null && fieldValue !== '');
        },
        isUsername: function (field, param) {
            const regexPassed = regexs.username.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'string');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isEmail: function(field, param) {
            const regexPassed = regexs.email.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'string');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isPassword: function(field, param) {
            const regexPassed = regexs.password.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'string');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isNumeric: function(field, param) {
            const regexPassed = regexs.numeric.test( field.fieldValue ) || regexs.numericNoSymbols.test(field.fieldValue);
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'string');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isInt: function(field, param) {
            const regexPassed = regexs.int.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'int');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isSaveInt: function(field) {
            const fieldValue = parseInt(field.fieldValue, 10);
            return regexs.int.test( fieldValue ) && Number.isSafeInteger( fieldValue ); 
        },
        isINT8: function(field) {
            const fieldValue = parseInt(field.fieldValue, 10);
            return regexs.int.test( fieldValue ) && fieldValue >= -0x80 && fieldValue <= 0x7F;
        },
        isINT16: function(field) {
            const fieldValue = parseInt(field.fieldValue, 10);
            return regexs.int.test( fieldValue ) && fieldValue >= -0x8000 && fieldValue <= 0x7FFF;
        },
        isINT32: function(field) {
            const fieldValue = parseInt(field.fieldValue, 10);
            return regexs.int.test( fieldValue ) && fieldValue >= -0x80000000 && fieldValue <= 0x7FFFFFFF;
        },
        isUint: function(field, param) {
            const regexPassed = regexs.uint.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'int');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isSaveUINT: function(field) {
            const fieldValue = parseInt(field.fieldValue, 10);
            return regexs.unit.test( fieldValue ) && fieldValue >= 0 && fieldValue <= Number.MAX_SAFE_INTEGER;
        },
        isUINT8: function(field) {
            const fieldValue = parseInt(field.fieldValue, 10);
            return regexs.unit.test( fieldValue ) && fieldValue >= 0 && fieldValue <= 0xFF;
        },
        isUINT16: function(field) {
            const fieldValue = parseInt(field.fieldValue, 10);
            return regexs.unit.test( fieldValue ) && fieldValue >= 0 && fieldValue <= 0xFFFF;
        },
        isUINT32: function(field) {
            const fieldValue = parseInt(field.fieldValue, 10);
            return regexs.unit.test( fieldValue ) && fieldValue >= 0 && fieldValue <= 0xFFFFFFFF;
        },
        isFloat: function(field, param) {
            const regexPassed = regexs.float.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'float');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isAlpha: function(field, param) {
            const regexPassed = regexs.alpha.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'string');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isAlphaNumeric: function(field, param) {
            const regexPassed = regexs.alphaNumeric.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'string');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        isAlphaDash: function(field, param) {
            const regexPassed = regexs.alphaDash.test( field.fieldValue );
            if(param) {
                const rangeCheck = this.rangeCheck( field.fieldValue, param, 'string');
                return regexPassed && rangeCheck;
            } else {
                return regexPassed;
            }
        },
        equal: function (field, newField) {
            let ele = this.form[newField];
            if(ele) {
                return field.fieldValue === ele.value;
            }
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

        const { rules, eleTag, fieldValue, msg } = field;
        let failed = false;
        let pending = false;
        let errors = this.errors;
        let message = "";

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
            let funParts = regexs.method.exec(method);
 
            // 如果是传参函数，将函数名和形参分离
            if (funParts) {
                method = funParts[1];
                param = funParts[2];
            }
            
            if (method.charAt(0) === '!') {
                method = method.substring(1, method.length);
            }

            if ( typeof this._testHooks[method] === 'function' ) {

                message = this.getMessage(msg, method);
                if (!this._testHooks[method].apply(this, [field, param])) {
                    failed = true;
                }

            } else if ( method.substring(0, 9) === 'callback_' ) {

                method = method.substring(9, method.length);
                message = this.getMessage(msg, method);
                if ( typeof this.handlers[method] === 'function' ) {
                    
                    if (this.handlers[method].apply(this, [fieldValue, param, field]) === false) {
                        failed = true;
                    }
                    
                } else if( typeof this.handlers[method] === 'object' ) {
                    
                    failed = true;
                    pending = true;
                    
                    let asyncMethod = this.handlers[method].handler;

                    //处理异步
                    asyncMethod.apply( this, [fieldValue, param, function(flag) {
                        if(flag) {
                            if( DEBUG ) console.log('async check success!');
                            errors.delete(eleTag);
                            handleSingleInput(eleTag, errors);
    
                        } else {
                            if( DEBUG ) console.log('async check failed!');
                            pending = false;
    
                            let errorObject = {
                                msg: message,
                                rule: method,
                                pending: pending
                            };
                            errors.set(eleTag, errorObject);
                            handleSingleInput(eleTag, errors);
                        }
                    }], field);

                } else {
                    throw ReferenceError(`试图使用一个未注册的回调函数: ${method} 进行校验`);
                }
            } else {
                throw ReferenceError(`试图使用一个不存在的方法: ${method} 进行校验`);
            }

            // 处理校验错误，写在前面的规则优先级高于后面的规则
            if (failed) {

                let existingError = errors.get(eleTag);
                if( existingError ) return;
                
                let errorObject = {
                    msg: message,
                    rule: method,
                    pending: pending
                };
                
                if (!existingError) {
                    errors.set(eleTag, errorObject);
                }
                break;

            }
        }

    }
    // 表单验证
    validateForm(evt) {

        let errors = this.errors;
        let fields = this.fields;

        errors.clear();
        if( DEBUG ) console.log('>>>>> submit event triggered >>>>>>');

        for( let [key, value] of fields) {
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
        this.callback(errors, evt, handleSubmit.bind(this, fields, errors));
        if( !this.onlyValidate && !this.async ) handleSubmit(fields, errors);
        if (errors.size > 0) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            } else if (event) {
                // 适配 IE 
                event.returnValue = false;
            }
        }
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
        let field = {fieldValue: stringToValidate};
        return fun(field);
    }
    // 为某个 field 注册自定义回调函数
    registerCallback(name, handler, isAsync) {
        try {
            checkCustomHandler(name, handler);
        } catch (e) {
            console.error(e);
            return false;
        }
        if ( isAsync ) {
            this.handlers[name] = {
                isAsync: isAsync,
                handler: handler
            };
        } else {
            this.handlers[name] = handler;
        }

        // 支持链式调用
        return this;
    }
    // 为某个自定义回调函数注册提示信息
    setMessage(rule, message) {
        this.handlerNotice[rule] = message;
        return this;
    }
    getMessage(msg, method) {
        let res;
        if( msg ) {
            res = msg[method] || notices[method] || this.handlerNotice[method];
        } else {
            res = notices[method] || this.handlerNotice[method];
        }
        if( !res && DEBUG ) {
            console.warn(`未找到指定方法: ${method} 的提示信息`);
        }
        
        return res;
    }
    rangeCheck(str, param, type) {

        const range = param.split(',');
        if( type === 'int' ) {

            const fieldValue = parseInt(str, 10);
            const gteCheckPassed = !range[0] || fieldValue >= parseInt(range[0], 10);
            const lteCheckPassed = !range[1] || fieldValue <= parseInt(range[1], 10);
            return gteCheckPassed && lteCheckPassed;

        } else if ( type === 'float') {

            const fieldValue = parseFloat(str, 10);
            const gteCheckPassed = !range[0] || fieldValue >= parseFloat(range[0], 10);
            const lteCheckPassed = !range[1] || fieldValue <= parseFloat(range[1], 10);
            return gteCheckPassed && lteCheckPassed;
    
        } else if ( type === 'string') {
            
            const fieldValue = str;
            const minCheckPassed = !range[0] || fieldValue.length >= parseInt(range[0], 10);
            const maxCheckPassed = !range[1] || fieldValue.length <= parseInt(range[1], 10);
            return minCheckPassed && maxCheckPassed;

        } else {
            if(DEBUG) console.error('passed wrong type!');
        }
        
    }

}

export {
    DEBUG,
    Validator
};