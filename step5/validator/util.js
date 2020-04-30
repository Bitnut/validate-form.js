// 为validator 实例绑定函数时对函数名做适当处理
let camelCase = function(string){ 

    return string.replace( /\_([a-z])/g, function( word, letterToReplace ) {

        return letterToReplace.toUpperCase();

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

let ruleExist = function(self, rules) {
    console.log("checking whether rules exist");
    for(let i = 0; i < rules.length; i++) {
        if( typeof(rules[i]) === "string" && !self.hasOwnProperty(rules[i])) {
            return false;
        } else if ( typeof(rules[i]) === "Object" && !self.hasOwnProperty(rules[i].method)) {
            return false;
        }
    }
    return true;
}
// 为验证组件添加待校验元素，这里称为 field
let addField = function( self, field ){
    let nameValue = field.id ? field.id : field.name;
    console.log('>>>>> adding field');
    self.fields[nameValue] = {

        id: field.id ? field.id : null,
        name: field.name ? field.name : null,
        msg: field.msg? field.msg : notices[field.category],
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
    if( rules.indexOf('required') !== -1 && rules[1] && regexs.method.test(rules[1])) {
        
        let parts = regexs.method.exec(rules[1]);
        rules[1] = {
            method: parts[1],
            args: parts[2].split(',')
        }

    } else if ( regexs.method.test(rules[1])) {

        let parts = regexs.method.exec(rules[0]);
        rules[0] = {
            method: parts[1],
            args: parts[2].split(',')
        }

    }
    // 验证规则是否存在
    let hasRule = ruleExist(self, rules);
    if(!hasRule) {
        console.error('>>>>>> 传递了一个不存在的规则！请检查传参。>>>>>>');
        return;
    }
    self.fields[nameValue].rules = rules;

    
    // 下面代码绑定 onblur 事件监听器
    if( self.fields[nameValue].onblur === true ) {

        // 校验拦截
        let submitBtn = document.getElementById("newbutton");

        if( field.id ) {
            
            console.log(`>>>>> adding id ${field.id}`);
            document.getElementById(field.id).addEventListener("blur", function() {
                
                self.blurValidate( field.id );
                if(window.event.relatedTarget.id === 'newbutton') {
                    self.validate();
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
            if(window.event.relatedTarget.id === 'newbutton') {
                self.validate();
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
