### 介绍一下组件：

一个 JavaScript 表单校验库，受到诸多类似项目的启发。实现轻量级的表单校验功能。没有任何外部依赖。

### 为什么要开发这个组件？

###### 开发者：
* 整合页面中表单的验证规则，集中书写方便调试
* 用默认的库减少自己编写校验代码出错的可能
* 更加简洁的规则编写和直观的理解，帮助快速 review 代码中校验表单的部分
* 减轻开发人员对校验敏感层次、校验逻辑的关注，只需要由开发者指定即可（待实现）
* 只需要关心如何处理填写正确的表单数据，无需自己编写校验逻辑和处理异常

###### 项目：
* 将校验功能解耦出来，符合模块化思想
* 维护和编写好的规则，减轻后期维护难度。差缺补漏的时候更快捷，更少涉及校验逻辑
* 只要规则代码和逻辑经过充分测试，那么这个组件的会非常可靠，提升了整个项目的健壮性



### 组件的特点是什么？

1. 每一个表单域支持多个规则的校验，而且内置了规则，开箱即用
2. 提示信息可进行自定义覆盖
3. 可为表单域注册多个自定义回调验证函数
4. 开箱即用的内置错误提示信息
5. 简单的校验用法，为网站提供常用的正则校验

### 组件的优势在哪儿？

* 采用原生 js 编写，使用起来没有对框架的学习成本（无论自己熟悉或者公司使用的框架是哪种都可以使用），只需要遵循简单的几个规则就能开箱即用
* 灵活、易用，支持多个可覆盖的校验规则
* 多层次的交互逻辑，更好的开发体验（待实现）
* 完全可自定义的错误交互方式
* 良好的异常提示

### 使用组件：

##### 一、 简单字符串校验：

```js
// 首先实例化一个 Validator，不需要传入任何参数
// 简单字符串校验，只需要指定校验规则，并将需要验证的字符串传入 check() 函数。
import {Validator} from './validate/validator.js'
let v = new Validator();
v.check('isEmail', '999999999@');  // false
v.check('isPassword','999999999@qq.com');     // true

// 带范围检查的简单用法：
// 提供范围检查，仅需要在规则后像调用函数一样传入上下范围即可。如：isEmail(10,20)
let v_easy = new Validator();
v_easy.check('isEmail(10,20)', '11@qq.comfff')
```

##### 二、 表单校验：

* 基本使用场景：

    * 动态表单验证，每当 input 元素失去焦点的时候，也可以是点击别的按钮的时候，组件会动态得为该表单域校验输入结果。
      如果点击的是 type 为 submit 的按钮，默认会调用整个表单的校验函数。

    * 当然也可以选择不动态验证，虽然组件会默认给所有指定了规则的元素绑上 onblur 事件的监听器，
      但是你也可以显示地指定onblur: 'false' 来阻止这个默认规则生效。

* 使用方法：

1. 编写好一个表单（可以自己给 onsubmit 事件绑定一个无关的回调，同样会执行），然后指定提交按钮，这两者需要带上 id 属性。
```html
<form action="pass.html" method="post" id="example_form"></form>
```
```html
<form action="pass.html" method="post" id="example_form" onsubmit="return myfun()"></form>
```
2. 在 js 代码中引入校验模块，并为每一个需要验证的表单初始化一个校验组件。

```js
// 实例化：Validator(formInfo: object, customRules: array, callback: function)
// 表单基本信息： { formId: string, onlyValidate: boolean}
// 自定义规则：[{},{} ...]
// 表单回调： function(err, evt, callback) {} （可选）
import {Validator} from './validate/validator.js'
var a = new Validator({ formId: "example_form"},[
    {
        // 表单中input元素的 id 字段 ( id/name 应当至少有一个，两者都有也可, 为了避免歧义和不必要的误解，最好只指定一个)
        // 注意！使用name的时候应该时希望能够批量操作一批dom元素，这个时候避免使用id，以免验证功能失效
        id: 'email-1',
        // 表单中input元素的 name 字段
        name: 'hello-email',
        // （可选）
        msg: { check_phone: 'Please enter correct phone number.'},
        // 验证条件，越靠前的规则越优先，直到满足所有条件才不会返回错误
        rules: 'is_email|max_length(12)',
        // （可选）
        onblur: 'true'
    },{
        name: 'sex',
        category: 'sex',
        msg:"请你选择性别{{sex}}|请输入数字",
        rules: 'required',
        onblur: 'false'
    }
])
```


3. 自行注册每个表单组件可能用到的回调函数和提示信息。
```js
function passwordIsStrong(value) {
    if(value.length < 10) return false;
    return true;
}

v.registerCallback('check_password', function(value) {
    if (passwordIsStrong(value)) {
        return true;
    }

    return false;
}).setMessage('check_password', 'Please choose a stronger password using at least 111 letters.');
```


4. 创建实例时指定 onlyValidate 为 true 可以让组件只做验证，不对错误进行处理。修改 DEBUG 为 false 不输出调试信息

```js
let v = new Validator({ formId: "example_form", submitId: "newbutton-1", onlyValidate: false}, [
    {
        id: 'email-1',
        msg: {isEmail: '请输入合法的邮箱地址!'},
        rules: 'required|isEmail(10,20)',
    }
]);
```
```js
// DEBUG 参数位置： /#####/validator.js
// 输出调试信息
const DEBUG = true;
// 输出调试信息
const DEBUG = false;
```

5. 异步校验表单

需要在创建组件实例时，最后一个参数传入异步调用：
```js
let v = new Validator({ formId: "example_form", submitId: "newbutton-1"}, [
    {
        id: 'email-1',
        msg: {isEmail: '请输入合法的邮箱地址!'},
        rules: 'required|isEmail(10,20)',
    }
], function(err, evt, callback){
    // 异步处理
    callback();  // 调用非必要，该 callback 功能是显示错误提示 
});
```

6. 异步校验表单域

```js
// 调用 registerCallback 时，异步判断完成后给 callback 传判断结果 
v.registerCallback('check_phone', function(fieldVaule, length, callback, field) {
    
    if (!v.check('isNumeric', length)) {
        return false;
    }
    setTimeout(() => {
            console.log('fetch data end');
            if (fieldVaule.length === parseInt(length, 10)) {
                // 调用回调，处理错误提示
                callback(true);
            } else {
                
                callback(false);
            }
            
        }, 2000);
    console.log('fetching data'); 

}).setMessage('check_phone', 'Please enter a correct phone number using 11 number.');
```

6. 范围检查
大部分常用的校验规则支持范围检查传参，使用方法如下：
```js
let v = new Validator({ formId: "example_form", submitId: "newbutton-1", async: true}, [
    {
        id: 'score',
        rules: 'required|isFloat(0,100)',
        msg: { isFloat: '成绩须填写0-100间的 float' },
    }
]);
```
* 写法解释

指定范围只需要给定 [函数+范围]，如上例中的：isFloat(0,100)
范围的写法如下，允许只给一个边界或者不给，允许中间插入空格：
(0,1)
(,1)
(0,)
(,)
( 0 , 1 )
(  0  ,  1  )

* 数字规则和字符串规则的差别

数字规则的范围针对数值大小，而字符串规则针对的是字符串长度

数字规则如：isInt/isFloat/isUint 等
字符串规则如：isAlpha/isEmail 等

* 优先级

校验规则本身可能带有范围，范围检查一般不会和规则本身有冲突。
一旦发生冲突，校验结果取所有范围校验的交集。

7. 支持 trim 和可配置 trim
默认情况下，表单中除了 textarea 这种特殊的表单域，用户传入的字符串如果带有首尾空格，首尾空格会被消除之后再进行判断。

但是你也可以自己进行一定的配置，只需要在传入规则的时候，多指定一个 trim 属性即可。如：

```js
{
    id: 'textarea',
    rules: 'required|minLength(10)|maxLength(20)',
    trim: false
}
```
8. 目前支持的所有校验规则和支持的用法如下：
 
 | 规则 | 范围检查 | trim | 传参 |
 |:----:|:----:|:----:|:----:|
 |required | false| false| false|
 | isUsername | true | true | false|
 | isemail | true | true | false|
 | isPassword | true | true | false|
 | isNumeric | false | true | false|
 | isInt | true | true | false|
 | isINT8 | false | true | false|
 | isINT16 | false | true | false|
 | isINT32 | false | true | false|
 | isUint | true | true | false|
 | isUINT8 | false | true | false|
 | isUINT16 | false | true | false|
 | isUINT32 | false | true | false|
 | isFloat | true | true | false|
 | isAlpha | true | true | false|
 | isAlphaNumeric | true | true | false|
 | isAlphaDash | true | true | false|
 | equal | false | true | true|
 | default | false | true | true|
 | minLength | false | true | true|
 | maxLength | false | true | true|
 | exactLength | false | true | true|
 


### 计划中

validate 组件后期添加：
- [ ] 规范化所有提示文本
- [ ] conditional，条件校验：requireIf/requireWith/requireWithout
- [ ] 增加交互层级：aggressive、passive、lazy、eager 参考库文档：[veevalidate](https://logaretm.github.io/vee-validate/guide/interaction-and-ux.html#interaction-modes)
- [ ] 函数式定义提示信息
- [ ] clear 功能函数？（reset）
- [ ] 迁移到 typescript？
