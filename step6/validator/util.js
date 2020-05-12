import { DEBUG } from './validator.js'

// 初始化传参验证
function initCheck(formInfo, customRules, callback) {

    checkFormInfo(formInfo);
    checkCustomRules(customRules);
    // 检查 callback 类型
    if( typeof callback !== 'function') {
        throw TypeError( `传入的回调类型不是函数，请检查传参！`);
    }

}
// 校验表单信息
function checkFormInfo(formInfo) {

    const {formId, submitId, onlyValidate} =  formInfo;

    // 检验传入表单名字、提交按钮是否合法
    if ( !document.getElementById(formId)) {
        throw ReferenceError( `指定表单: \[ ${formId} \] 不存在，请检查传参！`);
    }
    if ( !document.getElementById(submitId)) {
        throw ReferenceError( `提交按钮: \[ ${submitId} \] 不存在，请检查传参！`);
    }
    if ( onlyValidate && typeof onlyValidate !== 'boolean') {
        throw TypeError(`onlyValidate 参数不是 boolean 值，请检查传参！`);
    }

}
// 对传入的 customRules 作校验
function checkCustomRules(customRules) {

    for(let i = 0; i < customRules.length; i++) {

        const tmp = customRules[i];
        const nameValue = tmp.id ? tmp.id : tmp.name;
        
        if( !nameValue ) {
            throw ReferenceError( '请至少为每个规则给定元素 id 或者 name！');
        }
        if( !(document.getElementById(nameValue) || document.getElementsByName(nameValue).length !== 0) ) {
            throw ReferenceError( `元素 id 或者 name: \[ ${nameValue} \] 在页面中不存在，请检查传参！`);
        }
        if( !(tmp.rules && typeof(tmp.rules) === 'string' && tmp.rules !== '') ) {
            throw TypeError( `元素: \[ ${nameValue} \] 的规则传递错误，请检查传参！`);
        }

    }

}

function checkCustomHandler(name, handler) {
    if (!(name && typeof name === 'string' && handler && typeof handler === 'function')) {
        throw TypeError('注册回调函数时传参规则错误！');
    }
}

// 获取表单元素的特定属性
function attributeValue(element, attributeName) {
    var i;
    if ((element.length > 0) && (element[0].type === 'radio' || element[0].type === 'checkbox')) {
        for (i = 0; i < element.length; i++) {
            if (element[i].checked) {
                return element[i][attributeName];
            }
        }
        return;
    }
    return element[attributeName];
};

// 为验证组件添加待校验元素，这里称为 field
function addField( self, field ){

    const {id, name, msg} = field;
    const nameValue = field.id ? field.id : field.name;
    const onblur = field.onblur ? field.onblur : true;
    const element = self.form[nameValue];
    const type = (element.length > 0) ? element[0].type : element.type;
    let fieldObject = {

        eleTag: nameValue,
        id: id,
        name: name,
        msg: msg,
        element: element,
        rules: null,
        fieldValue: null,
        type: type,
        checked: null,
        onblur: onblur

    }
    // 下面代码为指定元素绑定规则
    let rules = field.rules.split('|');
    fieldObject.rules = rules;

    // 下面代码绑定 onblur 事件监听器
    if( fieldObject.onblur === true ) {

        if( field.id ) {
            
            if( DEBUG ) console.log(`adding onblur to id: ${field.id}`);
            document.getElementById(field.id).addEventListener("blur", function(evt) {
                // 如果点击了提交按钮，处理提交事件
                if(window.event.relatedTarget && window.event.relatedTarget.id === self.submitId) {
                    // self.validateForm();
                    return;
                }
                self.blurValidate( field.id );
            } , true);

        } else {

            if( DEBUG ) console.log(`adding onblur to name: ${field.name}`);
            let target = document.getElementsByName(field.name);
            for(let i = 0; i < target.length; i++) {
                document.getElementsByName(field.name)[i].addEventListener("blur", function() {
                    if(window.event.relatedTarget && window.event.relatedTarget.id === self.submitId) { 
                        return;
                    }
                    self.blurValidate( field.name, true);
                }, true);
            }

        }
    }

    if( DEBUG ) {
        console.log(`>>>>> adding field: ${nameValue}`);
    }

    self.fields.set(nameValue, fieldObject);

}


export {
    initCheck,
    attributeValue,
    addField,
    checkCustomHandler,
}