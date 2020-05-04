const Validator = function(formInfo, customRules, callback = "") {
    
    // 不传参的简单用法
    if (!formInfo) return this;

    // 保存页面的所有待验证 field 的信息
    this.fields = {}
    this.errors = []

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
    

    // 添加表单、 id 提交按钮 id 、验证字段、callback
    this.formId = formId;   
    this.submitId = submitId;
    this.form = document.forms[formId];
    for(let item of customRules) {

        addField(this, item);

    }
    this.callback = callback;
    
    let _onsubmit = this.form.onsubmit;
    this.form.onsubmit = (function(that) {
        return function(evt) {
            try {
                console.log('hahhahaha');
                // fixme: 条件拦截改回去
                that.validateForm(evt);
                
                return this.formId === "111" &&(_onsubmit === undefined || _onsubmit());
            } catch(e) {
                evt.preventDefault();
            }
        };
    })(this);
    
    console.log(this.fields);
}

Validator.prototype = {

    // 表单验证
    validateForm: function(evt) {

        this.errors = [];
        console.log('>>>>> submit event triggered');
        // let form = this.form;
        
        for (let key in this.fields) {
            if(this.fields.hasOwnProperty(key)){
                console.log(key);
                let field = this.fields[key];
                let eleTag = field.hasOwnProperty('id') ? field.id : field.name;
                let element = this.form[eleTag];

                if (element && element !== undefined) {
                    field.element = element;
                    field.type = (element.length > 0) ? element[0].type : element.type;
                    field.fieldValue = attributeValue(element, 'value');
                    field.checked = attributeValue(element, 'checked');

                    this._validateField(field);
                }
            }
        }
        
        // if( this.callback === ""){
        //     handleSubmit(error);
        // } else {
        //     this.callback(error, evt);
        // }
        handleSubmit(this.errors);

    },
    _validateField: function(field) {
        let rules = field.rules;
        let indexOfRequired = rules.indexOf('required');
        
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

                var existingError;
                for (let j = 0; j < this.errors.length; j++) {
                    if (field.id === this.errors[j].id) {
                        existingError = this.errors[j];
                    }
                }
                var errorObject = existingError || {
                    id: field.id,
                    msg: field.msg,
                    element: field.element,
                    name: field.name,
                    rule: method
                };
                
                if (!existingError) this.errors.push(errorObject);
            }
        }
    },
    
    blurValidate: function( eleTag, isName = false ) {
        console.log('>>>>> onblur event triggered');

        let field = this.fields[eleTag];
        let element = this.form[eleTag];
        field.fieldValue = attributeValue(element, 'value');
        field.checked = attributeValue(element, 'checked');
        // let msg = field.msg;
        // let rules = field.rules.slice(0);
        // let inputName = isName ? field.name : field.id;
        for(let i = 0; i < this.errors.length; i++) {
            if(this.errors[i].id === eleTag) {
                console.log(this.errors[i].id);
                this.errors.splice(i, 1);
                break;
            }
        }
        this._validateField(field);
        handleSingleInput(field);
        return;
    },

    
    registerCallback: function(name, handler) {
        if (name && typeof name === 'string' && handler && typeof handler === 'function') {
            this.handlers[name] = handler;
        }
        
        return this;
    }

}

Validator.prototype._testHooks = {
    
    required: function(field) {
        var value = field.fieldValue;
        if ((field.type === 'checkbox') || (field.type === 'radio')) {
            return (field.checked === true);
        }

        return (value !== null && value !== '');
    },
    isEmail: function(field) {
        return regexs.email.test( field.fieldValue );
    },
    isPassword: function(field) {
        return regexs.password.test( field.fieldValue );
    },
    equal: function (field, newField) {
        let value1 = field;
        let value2 = this.fields[newField].fieldValue;

        return value1 == value2;
    }

}