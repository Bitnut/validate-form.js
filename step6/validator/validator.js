// todo: 添加全局调试开关和仅校验开关
const DEBUG = true;
const ONLY_VALIDATE = false;


/**
 * 传参：
 * @param {Object} formInfo 用户传入的表单以及提交按钮的 id 属性（必须是id）
 * @param {Object} customRules 用户传入的自定义规则
 * @param {function} callback 用户指定的
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
class Validator {
    constructor(formInfo, customRules, callback = defaultCallback) {
        // 不传参的简单用法
        if (!formInfo)
            return this;
        // 初始化校验    
        let check = initCheck(formInfo, customRules, callback);
        if (!check) return false;

        const formId = formInfo.formId;
        const submitId = formInfo.submitId;
        // 保存页面的所有待验证 field 和 错误
        this.fields = {};
        this.errors = new Map();
        // 添加表单、 id 提交按钮 id 、验证字段、callback、handler
        this.formId = formId;
        this.submitId = submitId;
        this.form = document.forms[formId];
        this.handlers = {};
        for (let item of customRules) {
            addField(this, item);
        }
        this.callback = callback;

        // 提交拦截
        //let _onsubmit = this.form.onsubmit;
        this.form.onsubmit = (function (that) {
            return function (evt) {
                try {
                    return that.validateForm(evt);
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
            console.log(field);
            if ((field.type === 'checkbox') || (field.type === 'radio')) {
                return (field.checked === true);
            }
    
            return (value !== null && value !== '');
        },
        isEmail: function(field, check = false) {
            let fieldValue = field;
            if( !check ) fieldValue = field.fieldValue;
            return regexs.email.test( fieldValue );
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
}

Object.assign(Validator.prototype, {

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
    // 表单验证
    validateForm: function(evt) {

        this.errors.clear();
        if( DEBUG ) console.log('>>>>> submit event triggered >>>>>>');
        // let form = this.form;
        
        for (let key in this.fields) {
            if(this.fields.hasOwnProperty(key)){
                
                let field = this.fields[key];
                let eleTag = field.id ? field.id : field.name;
                let element = this.form[eleTag];

                if( DEBUG ) {
                    console.log(`validating ${key}`);
                    // console.log(element);
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

        if( DEBUG ) console.log('>>>>>> invoking callback! >>>>>>')
        this.callback(this.errors, evt);
        
        if( !ONLY_VALIDATE ) handleSubmit(this.errors);

        if (this.errors.size > 0) {
            if (evt && evt.preventDefault) {
                evt.preventDefault();
            } else if (event) {
                // 适配 IE 
                event.returnValue = false;
            }
        }
        return true;

    },
    // 动态验证
    blurValidate: function( eleTag, isName = false ) {
        if( DEBUG ) console.log('>>>>> onblur event triggered >>>>>>');

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
        if( this.errors.has(eleTag) ) {
            handleSingleInput(nameValue, this.errors);
        } else {
            handleSingleInput(nameValue, this.errors);
        }
        return;
    },
    // 调用组件作简单验证(一般的正则校验)
    check: function(rule, stringToValidate) {
        let fun = this._testHooks[rule];
        return fun(stringToValidate, true);
    },
    // 为某个 field 注册自定义回调函数
    registerCallback: function(name, handler) {
        if (name && typeof name === 'string' && handler && typeof handler === 'function') {
            this.handlers[name] = handler;
        }
        
        // 支持链式调用
        return this;
    },
    // 为某个自定义回调函数注册提示信息
    setMessage: function(rule, message) {
        notices[rule] = message;
        return this;
    },

})
