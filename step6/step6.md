### todo

- [x] 支持 radio 和 checkbox
- [x] 添加 JSDoc 注释
- [x] 支持 select
- [x] 完善正则和测试钩子
- [x] 调试和自定义操作开关
- [x] 模块封装

### 版本2.0

1. 简单用法：

简单字符串验证，需要自己取得需要验证的字符串传入。
import {Validator} from './validate/validator.js'
let v = new Validator();
v.check('isEmail', '940095072@');
v.check('isPassword','94009');

2. 表单验证：

* 基本使用场景：

    动态表单验证，触发时机可以时input元素失去焦点的时候，也可以时点击提交按钮的时候
    默认会在点击提交按钮的时候调用表单验证。

    当然也可以选择不动态验证，默认会给所有规定了规则的元素绑上 onblur 事件的监听器，可以显示地指定onblur: 'false' 来阻止这个默认规则生效。

* 使用方法：

    1. 编写好一个表单（可以自己给 onsubmit 事件绑定一个无关的回调，同样会执行），然后指定提交按钮，这两者需要带上 id 属性。
    ```html
    <form action="pass.html" method="post" id="example_form"></form>
    ```
    ```html
    <form action="pass.html" method="post" id="example_form" onsubmit="return myfun()"></form>

    </form>
    ```
    2. 在 js 代码中引入校验模块，并为每一个需要验证的表单初始化一个校验组件。

    ```js
    // 传参：
    // 表单基本信息： { formId: "example_form", submitId: "newbutton-1"}
    // 自定义规则：[{},{} ...]
    // 表单回调： function() {} （可选）
    var a = new validator({ formId: "example_form", submitId: "newbutton-1"},[
        {
            // 表单中input元素的 id 字段 ( id/name 应当至少有一个，两者都有也可, 为了避免歧义和不必要的误解，最好只指定一个)
            // 注意！使用name的时候应该时希望能够批量操作一批dom元素，这个时候避免使用id，以免验证功能失效
            id: 'email-1',
            // 表单中input元素的 name 字段
            name: 'hello-email',
            // （可选）
            msg: { check_phone: 'Please enter correct phone number.'},
            // 验证条件，越靠前的规则越优先，直到满足所有条件才不会输出错误
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
    ]， )
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
    4. 修改 ONLY_VALIDATE 为 true 可以让组件只做验证，不对错误进行处理。修改 DEBUG 为 false 不输出调试信息

* bug & 不支持的用法
    1. 不支持图片、文件拖拽/上传组件验证
    2. 未内置日期、信用卡等校验规则，需要自己提供回调验证
    3. 需要呈现想要的效果需要自己写回调或者修改 noticeHandler 组件
    4. 暂时么有支持不同语言的内置提示文案