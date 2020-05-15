import { initCheck, checkCustomHandler, trim } from './util.js';
import { handleSubmit, handleSingleInput } from './noticeHandler.js';
import { regexs, notices, defaultCallback } from './rules&static.js';

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
 * @param {Map[]} errors[].pending      是否需要等待异步处理
 *
 */
class Validator {
    constructor (formInfo, customRules, callback = defaultCallback) {
        // 校验钩子
        this._testHooks = {

            required: (field) => {
                const { fieldValue, type, checked } = field;
                if ((type === 'checkbox') || (type === 'radio')) {
                    return (checked === true);
                }

                return (fieldValue !== null && fieldValue !== '');
            },
            isUsername: (field, param) => {
                const regexPassed = regexs.username.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'string');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            isEmail: (field, param) => {
                const regexPassed = regexs.email.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'string');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            isPassword: (field, param) => {
                const regexPassed = regexs.password.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'string');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            isNumeric: (field) => {
                return regexs.numeric.test(field.fieldValue) || regexs.numericNoSymbols.test(field.fieldValue);
            },
            isInt: (field, param) => {
                const regexPassed = regexs.int.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'int');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            isSaveInt: (field) => {
                const fieldValue = parseInt(field.fieldValue, 10);
                return regexs.int.test(fieldValue) && Number.isSafeInteger(fieldValue);
            },
            isINT8: (field) => {
                const fieldValue = parseInt(field.fieldValue, 10);
                return regexs.int.test(fieldValue) && fieldValue >= -0x80 && fieldValue <= 0x7F;
            },
            isINT16: (field) => {
                const fieldValue = parseInt(field.fieldValue, 10);
                return regexs.int.test(fieldValue) && fieldValue >= -0x8000 && fieldValue <= 0x7FFF;
            },
            isINT32: (field) => {
                const fieldValue = parseInt(field.fieldValue, 10);
                return regexs.int.test(fieldValue) && fieldValue >= -0x80000000 && fieldValue <= 0x7FFFFFFF;
            },
            isUint: (field, param) => {
                const regexPassed = regexs.uint.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'int');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            isSaveUINT: (field) => {
                const fieldValue = parseInt(field.fieldValue, 10);
                return regexs.unit.test(fieldValue) && fieldValue >= 0 && fieldValue <= Number.MAX_SAFE_INTEGER;
            },
            isUINT8: (field) => {
                const fieldValue = parseInt(field.fieldValue, 10);
                return regexs.unit.test(fieldValue) && fieldValue >= 0 && fieldValue <= 0xFF;
            },
            isUINT16: (field) => {
                const fieldValue = parseInt(field.fieldValue, 10);
                return regexs.unit.test(fieldValue) && fieldValue >= 0 && fieldValue <= 0xFFFF;
            },
            isUINT32: (field) => {
                const fieldValue = parseInt(field.fieldValue, 10);
                return regexs.unit.test(fieldValue) && fieldValue >= 0 && fieldValue <= 0xFFFFFFFF;
            },
            isFloat: (field, param) => {
                const regexPassed = regexs.float.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'float');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            isAlpha: (field, param) => {
                const regexPassed = regexs.alpha.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'string');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            isAlphaNumeric: (field, param) => {
                const regexPassed = regexs.alphaNumeric.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'string');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            isAlphaDash: (field, param) => {
                const regexPassed = regexs.alphaDash.test(field.fieldValue);
                if (param && regexPassed) {
                    const rangeCheck = this._rangeCheck(field.fieldValue, param, 'string');
                    return rangeCheck;
                } else {
                    return regexPassed;
                }
            },
            equal: (field, newField) => {
                const ele = this.form[newField];
                if (ele) {
                    return field.fieldValue === ele.value;
                }
                return false;
            },
            default: (field, defaultName) => {
                return field.fieldValue !== defaultName;
            },
            minLength: (field, length) => {
                if (!regexs.numeric.test(length)) {
                    return false;
                }
                return (field.fieldValue.length >= parseInt(length, 10));
            },
            maxLength: (field, length) => {
                if (!regexs.numeric.test(length)) {
                    return false;
                }
                return (field.fieldValue.length <= parseInt(length, 10));
            },
            exactLength: (field, length) => {
                if (!regexs.numeric.test(length)) {
                    return false;
                }
                return (field.fieldValue.length === parseInt(length, 10));
            }
        };
        // 不传参的简单用法
        if (!formInfo) {
            return this;
        }
        // 初始化校验
        try {
            initCheck(formInfo, customRules, callback);
        } catch (error) {
            console.error(error);
            return INIT_FAILED;
        }

        const { formId, submitId, onlyValidate } = formInfo;

        // 添加表单、 id 提交按钮 id 、验证字段、callback、handlers
        this.formId = formId;
        this.submitId = submitId;
        this.onlyValidate = onlyValidate || false;

        // 保存页面的所有待验证 field 和 错误
        this.fields = new Map();
        this.errors = new Map();

        this.form = document.forms[formId];
        this.handlers = {};
        this.handlerNotice = {};

        for (const item of customRules) {
            this._addField(item);
        }
        this.callback = callback;

        // 提交拦截
        const userOnSubmit = this.form.onsubmit;
        this.form.onsubmit = (() => {
            return (evt) => {
                try {
                    this.validateForm(evt) && (!userOnSubmit || userOnSubmit());
                } catch (e) {
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

    // 表单验证
    validateForm (evt) {
        const errors = this.errors;
        const fields = this.fields;

        errors.clear();
        if (DEBUG) console.log('>>>>> submit event triggered >>>>>>');

        for (const [key, value] of fields) {
            const field = value;
            const element = this.form[field.eleTag];

            if (DEBUG) {
                console.log(`validating ${key}`);
            }

            if (element && element !== undefined) {
                if (field.trim) {
                    field.fieldValue = trim(attributeValue(element, 'value'));
                } else {
                    field.fieldValue = attributeValue(element, 'value');
                }
                field.checked = attributeValue(element, 'checked');
                try {
                    this._validateField(field);
                } catch (e) {
                    console.error(e);
                    return;
                }
            }
        }

        if (DEBUG) console.log('>>>>>> invoking callback! >>>>>>');

        if (evt && evt.preventDefault) {
            evt.preventDefault();
        } else if (event) {
            // 适配 IE
            event.returnValue = false;
        }

        this.callback(errors, evt, handleSubmit.bind(this, fields, errors));

        if (!this.onlyValidate && this.callback === defaultCallback) {
            console.log('validating');

            handleSubmit.call(this, fields, errors);
        }
    }

    // 动态验证
    blurValidate (eleTag, isName = false) {
        if (DEBUG) console.log('>>>>> onblur event triggered >>>>>>');

        const field = this.fields.get(eleTag);
        const element = field.element;
        if (field.trim) {
            field.fieldValue = trim(attributeValue(element, 'value'));
        } else {
            field.fieldValue = attributeValue(element, 'value');
        }
        field.checked = attributeValue(element, 'checked');
        field.element = element;
        this.errors.delete(eleTag);

        try {
            this._validateField(field);
        } catch (e) {
            console.error(e);
            return;
        }

        if (this.onlyValidate) return;

        const nameValue = isName ? field.name : field.id;

        if (this.errors.has(eleTag)) {
            handleSingleInput(nameValue, this.errors);
        } else {
            handleSingleInput(nameValue, this.errors);
        }
    }

    // 调用组件作简单验证(一般的正则校验)
    check (rule, stringToValidate) {
        const funParts = regexs.method.exec(rule);
        if (funParts) {
            const fun = this._testHooks[funParts[1]];
            const field = { fieldValue: stringToValidate };
            return fun(field, funParts[2]);
        } else {
            const fun = this._testHooks[rule];
            const field = { fieldValue: stringToValidate };
            return fun(field);
        }
    }

    // 为某个 field 注册自定义回调函数
    registerCallback (name, handler, isAsync) {
        try {
            checkCustomHandler(name, handler);
        } catch (e) {
            console.error(e);
            return false;
        }
        if (isAsync) {
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
    setMessage (rule, message) {
        this.handlerNotice[rule] = message;
        return this;
    }

    // 获取校验规则的提示信息
    getMessage (msg, method) {
        let res;
        if (msg) {
            res = msg[method] || notices[method] || this.handlerNotice[method];
        } else {
            res = notices[method] || this.handlerNotice[method];
        }
        if (!res && DEBUG) {
            console.warn(`未找到指定方法: ${method} 的提示信息`);
        }

        return res;
    }

    _validateField (field) {
        const { rules, eleTag, fieldValue, msg } = field;
        let failed = false;
        let pending = false;
        const errors = this.errors;
        let message = '';

        // 如果 field 不是必填项且为空，则直接返回
        // 除非 field 规则中带有外部注册的优先回调：如 !callback_check_password
        if (rules.indexOf('required') === -1 && !fieldValue) {
            for (let i = 0; i < rules.length; i++) {
                if (rules[i].indexOf('!callback_') === -1) {
                    return;
                }
            }
        }

        // 遍历 field 的所有规则，并解析需要传参的函数
        for (let i = 0; i < rules.length; i++) {
            let method = rules[i];
            let param = null;
            const funParts = regexs.method.exec(method);

            // 如果是传参函数，将函数名和形参分离
            if (funParts) {
                method = funParts[1];
                param = funParts[2];
            }

            if (method.charAt(0) === '!') {
                method = method.substring(1, method.length);
            }

            if (typeof (this._testHooks[method]) === 'function') {
                message = this.getMessage(msg, method);
                if (!this._testHooks[method].apply(this, [field, param])) {
                    failed = true;
                }
            } else if (method.substring(0, 9) === 'callback_') {
                method = method.substring(9, method.length);
                message = this.getMessage(msg, method);
                if (typeof (this.handlers[method]) === 'function') {
                    if (this.handlers[method].apply(this, [fieldValue, param, field]) === false) {
                        failed = true;
                    }
                } else if (typeof (this.handlers[method]) === 'object') {
                    failed = true;
                    pending = true;

                    const asyncMethod = this.handlers[method].handler;

                    // 处理异步
                    asyncMethod.apply(this, [fieldValue, param, function (flag) {
                        if (flag) {
                            if (DEBUG) console.log('async check success!');
                            errors.delete(eleTag);
                            handleSingleInput(eleTag, errors);
                        } else {
                            if (DEBUG) console.log('async check failed!');
                            pending = false;

                            const errorObject = {
                                msg: message,
                                rule: method,
                                pending: pending
                            };
                            errors.set(eleTag, errorObject);
                            handleSingleInput(eleTag, errors);
                        }
                    }]);
                } else {
                    throw ReferenceError(`试图使用一个未注册的回调函数: ${method} 进行校验`);
                }
            } else {
                throw ReferenceError(`试图使用一个不存在的方法: ${method} 进行校验`);
            }

            // 处理校验错误，写在前面的规则优先级高于后面的规则
            if (failed) {
                const existingError = errors.get(eleTag);
                if (existingError) return;

                const errorObject = {
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

    // 为验证组件添加待校验元素，这里称为 field
    _addField (field) {
        const { id, name, msg } = field;
        const nameValue = field.id ? field.id : field.name;
        const onblur = field.onblur ? field.onblur : true;
        const element = this.form[nameValue];
        const type = (element.length > 0) ? element[0].type : element.type;
        let trim = field.trim ? field.trim : true;
        if (type === 'textarea' || type === 'radio' || type === 'checkbox') {
            trim = false;
        }
        const fieldObject = {

            eleTag: nameValue,
            id: id,
            name: name,
            msg: msg,
            element: element,
            rules: null,
            fieldValue: null,
            type: type,
            checked: null,
            onblur: onblur,
            trim: trim

        };
        // 下面代码为指定元素绑定规则
        const rules = field.rules.split('|');
        fieldObject.rules = rules;

        // 下面代码绑定 onblur 事件监听器
        if (fieldObject.onblur === true) {
            if (field.id) {
                if (DEBUG) console.log(`adding onblur to id: ${field.id}`);
                document.getElementById(field.id).addEventListener('blur', () => {
                    // 如果点击了提交按钮，处理提交事件
                    if (window.event.relatedTarget && window.event.relatedTarget.id === this.submitId) {
                        // this.validateForm();
                        return;
                    }
                    this.blurValidate(field.id);
                }, true);
            } else {
                if (DEBUG) console.log(`adding onblur to name: ${field.name}`);
                const target = document.getElementsByName(field.name);
                for (let i = 0; i < target.length; i++) {
                    document.getElementsByName(field.name)[i].addEventListener('blur', () => {
                        if (window.event.relatedTarget && window.event.relatedTarget.id === this.submitId) {
                            return;
                        }
                        this.blurValidate(field.name, true);
                    }, true);
                }
            }
        }

        if (DEBUG) {
            console.log(`>>>>> adding field: ${nameValue}`);
        }

        this.fields.set(nameValue, fieldObject);
    }

    // 范围校验
    _rangeCheck (str, param, type) {
        const range = param.split(',');

        if (type === 'int') {
            const fieldValue = parseInt(str, 10);
            const gteCheckPassed = !range[0] || fieldValue >= parseInt(range[0], 10);
            const lteCheckPassed = !range[1] || fieldValue <= parseInt(range[1], 10);
            return gteCheckPassed && lteCheckPassed;
        } else if (type === 'float') {
            const fieldValue = parseFloat(str, 10);
            const gteCheckPassed = !range[0] || fieldValue >= parseFloat(range[0], 10);
            const lteCheckPassed = !range[1] || fieldValue <= parseFloat(range[1], 10);
            return gteCheckPassed && lteCheckPassed;
        } else if (type === 'string') {
            const fieldValue = str;
            const minCheckPassed = !range[0] || fieldValue.length >= parseInt(range[0], 10);
            const maxCheckPassed = !range[1] || fieldValue.length <= parseInt(range[1], 10);
            return minCheckPassed && maxCheckPassed;
        } else {
            if (DEBUG) console.error('passed wrong type!');
        }
    }
}

// 获取表单元素的特定属性
function attributeValue (element, attributeName) {
    if ((element.length > 0) && (element[0].type === 'radio' || element[0].type === 'checkbox')) {
        for (let i = 0; i < element.length; i++) {
            if (element[i].checked) {
                return element[i][attributeName];
            }
        }
        return;
    }
    return element[attributeName];
};

export {
    DEBUG,
    Validator
};
