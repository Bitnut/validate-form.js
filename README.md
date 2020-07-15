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

1. 编写好一个表单（默认情况下，组件接管了 onsubmit 事件，但是也可以自己给 onsubmit 事件绑定一个无关的回调，同样会执行），然后指定提交按钮，这两者需要带上 id 属性。
```html
<form action="pass.html" method="post" id="example_form"></form>
```
```html
<form action="pass.html" method="post" id="example_form" onsubmit="return myfun()"></form>
```
2. 在 js 代码中引入校验模块。

* 使用方式：

构造函数：Validator(formInfo, customRules, callback);

* 参数解释：

1. 表单基本信息： { formId: string, onlyValidate: boolean }

    - formId: 指定当前 validator 实例校验的表单，为 form 标签的 id 属性。
    - onlyValidate: (可选) console 打印开关，默认为 false。
    
2. 表单域校验信息数组：[{},{} ...]

    数组元素：多个对象，对象包含需要校验的表单域校验信息。

    对象属性：
    - id: 指定表单域 id，是 input 标签的 id 属性。
    - rules: 按优先级从前往后排列的校验规则组。越靠前的规则优先级越高。必须全部满足才不会返回错误信息。
    - msg: (可选) 自定义的规则错误提示信息，用于覆盖默认提示信息。
    - onblur: (可选) 指定表单域的校验时机，默认为 onblur 事件触发时校验。置为 false 可以让表单域在提交时校验。
    - trim: (可选) 指定是否去掉提交内容首尾空格，具体规则见下表一。


3. 表单回调： function(err, evt, callback) {} （可选）表单提交时调用

    err: 由校验模块生成的错误数组，是一个 Map 对象，全部校验成功时为空。每一个错误最多包括 2 个属性：
        @param {Map[]} errors.key            校验错误的表单域 id
        @param {Map[]} errors[].msg          返回的错误信息
        @param {Map[]} errors[].rule         校验出错的规则名
    evt：浏览器提交表单事件。
    callback: 错误处理回调，需要使用内置错误处理的时候调用，不需要传参。
     
    目前支持的所有校验规则和支持的用法如下： 
    
    | 规则 | 支持范围检查 | 默认支持 trim | 需要传参 | 解释 | 例子 |
    |:----|:----:|:----:|:----:|:----|:----|
    | required | no| no| no| 表单域不能为空 |
    | isUsername | yes | yes | no| 符合内置用户名规则 |
    | isEmail | yes | yes | no| 符合内置用户名规则 |
    | isPassword | yes | yes | no|符合内置用户名规则 |
    | isNumeric | no | yes | no| 任意实数或是数字串|
    | isInt | yes | yes | no| 整数 |
    | isINT8 | no | yes | no| int8 类型整数 |
    | isINT16 | no | yes | no| int16 类型整数 |
    | isINT32 | no | yes | no| int32 类型整数 |
    | isUint | yes | yes | no| uint 类型整数 |
    | isUINT8 | no | yes | no| uint8 类型整数 |
    | isUINT16 | no | yes | no| uint16 类型整数 |
    | isUINT32 | no | yes | no| uint32 类型整数 |
    | isFloat | yes | yes | no| 浮点数 |
    | isAlpha | yes | yes | no| 英文字母串 |
    | isAlphaNumeric | yes | yes | no| 包含英文字母和数字的字符串 |
    | isAlphaDash | yes | yes | no| 包含英文字母、数字、下划线、短横杠的字符串 |
    | equal | no | yes | yes| 和指定表单域值相同| equal(other_element_id)|
    | default | no | yes | yes| 等于默认值| default(default_string)|
    | minLength | no | yes | yes| 最小长度| minLength(6)|
    | maxLength | no | yes | yes| 最大长度| maxLength(20)|
    | exactLength | no | yes | yes| 指定长度| exactLength(4)|

示例代码：
```js

import {Validator} from './validate/validator.js'
var a = new Validator({ formId: "example_form"},[
    {
        id: 'gender',
        rules: 'required',
    }, {
        id: 'email-1',
        msg: { isEmail: 'Please enter correct phone number.'},
        rules: 'isEmail|max_length(12)',
        trim: false
        onblur: false
    }
])
```


3. 自行注册每个表单组件可能用到的回调函数和提示信息

    1. 首先在表单域规则后加入注册规则：
    
            rules: 'required|callback_check_password'
    在添加注册规则时，需要在规则名前添加 'callback_' 开头，以便让校验模块知道这是一个用户自行注册的规则。
    2. 然后注册校验回调： 
    registerCallback(rule_name, callback);
    - rule_name: 规则名称，规则名称不需要加 'callback_'
    - callback: 规则校验回调方法，接受三个参数：function(fieldVaule, callback, fieldId) { // ...}
        - fieldValue 用户输入
        - callback 模块默认错误处理回调，接受一个可选参数： function([msg]){ // ...}
            - 当传入参数为空时，视为校验成功，否则将 msg 作为错误提示信息处理
        - fieldId 表单域 id

*NOTICE*: 
* 不要试图用注册规则覆盖内置规则，这样做是无效的。       
* 添加规则一定记得在规则名前加上 'callback_' 开头。

```js
// 构造函数内，指定规则
{
    rules: 'required|callback_check_password'
}

function passwordIsStrong(value) {
    if(value.length < 10) return false;
    return true;
}
// 注册校验回调
v.registerCallback('check_password', function(fieldVaule, callback, fieldId) {
    if (passwordIsStrong(value)) {
        callback();
    }
    callback('xxxxxxxxxxxxxxxxxxxxxx failed');
})

或：

v.registerCallback('check_password', function(fieldVaule, callback, fieldId) {
    if (passwordIsStrong(value)) {
        callback();
    }
    callback('xxxxxxxxxxxxxxxxxxxxxx failed');
})

```

// 如果 field 不是必填项(未指定 required)且为空，默认不做任何校验
// field 规则中带有注册的优先回调(函数名以'!'开头)可以绕开默认规则。例如：注册回调名为：'!callback_check_password'

6. 异步校验表单域

用法和同步校验类似
```js
v.registerCallback('check_phone', function(fieldVaule, callback, fieldId) {
    const length = 10;
    if (!v.check('isNumeric', length)) {
        return false;
    }
    setTimeout(() => {
            if (fieldVaule.length === parseInt(length, 10)) {
                callback();
            } else {
                
                callback('xxxxxxxxxxxxxxxxxx failed');
            }
            
        }, 2000);
}).setMessage('check_phone', 'Please enter a correct phone number using 11 number.');

```


4. 创建实例时指定 onlyValidate 为 true 可以让组件只做验证，而不调用默认错误处理方法。修改 DEBUG 为 false 可以不输出调试信息

```js
let v = new Validator({ formId: "example_form" }, [
    {
        id: 'email-1',
        msg: {isEmail: '请输入合法的邮箱地址!'},
        rules: 'required|isEmail(10,20)',
    }
]);
```
```js
// DEBUG 参数位置： /validator 模块文件夹/validator.js
// 输出调试信息
const DEBUG = true;
// 输出调试信息
const DEBUG = false;
```

5. 异步校验表单

需要在创建组件实例时，最后一个参数传入异步调用：
```js
let v = new Validator({ formId: "example_form" }, [
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
6. 范围检查
常用的校验规则支持范围检查传参，使用方法如下：
```js
let v = new Validator({ formId: "example_form" }, [
    {
        id: 'score',
        rules: 'required|isFloat(0,100)',
        msg: { isFloat: '成绩须填写0-100间的 float' },
    }
]);
```
* 写法解释

指定范围只需要给定 函数(范围)，如上例中的：isFloat(0,100)，范围包括边界值。
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


### 计划中

validate 组件后期添加：
- [ ] 规范化所有提示文本
- [ ] 完成错误提示处理模块
- [ ] conditional，条件校验：requireIf/requireWith/requireWithout
- [ ] 增加交互层级：aggressive、passive、lazy、eager 参考库文档：[veevalidate](https://logaretm.github.io/vee-validate/guide/interaction-and-ux.html#interaction-modes)
- [ ] 函数式定义提示信息
- [ ] clear 功能函数？（reset）
- [ ] 迁移到 typescript？
