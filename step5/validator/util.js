// 为validator 实例绑定函数时对函数名做适当处理
let camelCase = function(string){ 

    return string.replace( /\_([a-z])/g, function( word, letterToReplace ) {

        return letterToReplace.toUpperCase();

    });

}

// 为传入函数名作 testhook 匹配
let underscoreCase = function(string){ 

    return string.replace( /[A-Z]/g, function( letter ) {

        return '_'+letter.toLowerCase();

    });

}
// 校验调用者传入的规则
let checkCustomRules = function(customRules) {

    for(let i = 0; i < customRules.length; i++) {

        let tmp = customRules[i];
        let nameValue = tmp.id ? tmp.id : tmp.name;
        
        if( !nameValue ) {
            console.error( '>>>>>> 请至少为每个规则给定元素 id 或者 name！>>>>>>');
            return false;
        }

        if( !(document.getElementById(nameValue) || document.getElementsByName(nameValue).length !== 0) ) {
            console.error( `>>>>>> 元素 id 或者 name: \[ ${nameValue} \] 在页面中不存在，请检查传参！>>>>>>`);
            return false;
        }
        if( !(tmp.rules && typeof(tmp.rules) === 'string' && tmp.rules !== '') ) {
            console.error( `>>>>>> 元素: \[ ${nameValue} \] 的规则传递错误，请检查传参！>>>>>>`);
            return false;
        }

    }
    return true;
    
}

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
let addField = function( self, field ){
    let nameValue = field.id ? field.id : field.name;
    console.log('>>>>> adding field');
    self.fields[nameValue] = {

        id: field.id ? field.id : null,
        name: field.name ? field.name : null,
        msg: field.msg,
        rules: null,
        fieldValue: null,
        element: null,
        type: null,
        checked: null,
        onblur: field.onblur ? field.onblur : true

    }
    
    // 下面代码为指定元素绑定规则
    let rules = field.rules.split('|');
    self.fields[nameValue].rules = rules;

    
    // 下面代码绑定 onblur 事件监听器
    if( self.fields[nameValue].onblur === true ) {

        if( field.id ) {
            
            console.log(`>>>>> adding id ${field.id}`);
            document.getElementById(field.id).addEventListener("blur", function(evt) {
                console.log('here');
                console.log(window.event, event, evt);
                self.blurValidate( field.id );
                // 如果点击了提交按钮，处理提交事件
                if(window.event.relatedTarget && window.event.relatedTarget.id === self.submitId) {
                    self.validateForm();
                }
            } , true);

        } else {

            console.log(`>>>>> adding name ${field.name}`);
            let target = document.getElementsByName(field.name);
            for(let i = 0; i < target.length; i++) {
                document.getElementsByName(field.name)[i].addEventListener("blur", function() {
                    self.blurValidate( field.name, true);
                }, true);
            }
            if(window.event.relatedTarget && window.event.relatedTarget.id === submitId) {
                self.validateForm();
            }
            
        }
    }
    

    // todo: 传入自定义的正则匹配规则
    // for (let a in field) {

    //   if (field.hasOwnProperty(a) && /^regexp\_/.test(a)) {

    //     regexs[a] = field[a];

    //   }

    // }

}



