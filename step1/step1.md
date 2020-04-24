# 从零开始完成一个轻量级的表单验证模块

## 应该怎么计划我们的开发步骤呢？

可以想想我们可能需要什么功能？

内置的验证器？可定制化的验证器？方便的接口函数？优雅的调用方式？异步验证？

可见一个简单的验证模块实际上想要实现的功能还是挺多的，我们应该尽量从简单的入手。

首先第一步：在一个简单页面上完成一些简单的表单验证，看看我们到底需要一些什么样的功能。

然后再试图吧这些功能抽象出来，作为我们模块的重要组成部分。

下面代码实现了一个简单的表单验证，通过预先配置好的规则来匹配我们的表单项。


    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
        <form action="pass.html" method="post" id="example_form" onsubmit="return myfun('example_form')">
            <div><label for="email">邮箱验证</label><input type="text" id="email" name="email"></div>
            <span style="color:red;font-size: 12px;display: none;" class="tishi">  
                必须两位字符及以上  
            </span>
            <div><label for="password">密码</label><input type="text" id="password" name="password"></div>
            <span style="color:red;font-size: 12px;display: none;" class="tishi">  
                密码格式不正确  
            </span>
            <div><label for="repassword">重复密码</label><input type="text" id="repassword" name="repassword"></div>
            <span style="color:red;font-size: 12px;display: none;" class="tishi">  
                两次密码输入需一致  
            </span>
            <input type="submit" value="提交"/>
        </form>  
    </body>
    <script type="text/javascript">
    var regexs = {

        email:/^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/,
        password: /^[0-9a-zA-Z]{6,30}$/,

    }
    let validate = function(form) {
        
        document.getElementsByClassName('tishi')[0].style.display = 'none';
        document.getElementsByClassName('tishi')[1].style.display = 'none';
        document.getElementsByClassName('tishi')[2].style.display = 'none';

        let error = [];
        console.log(form['email'].value);
        if(email === "") {
            console.log("您还没有输入登录邮箱，无法登录！");
        } else {
            console.log(email);
            if (regexs.email.test(form['email'].value)) {
                console.log('success!');
            }else{  //验证不通过
                console.log("请输入合法的EMAIL地址!");
                error.push(0);
            }
        }
        console.log(form['password'].value);
        if( regexs.password.test(form['password'].value)) {
            console.log('success!');
        } else {
            error.push(1);
        }
        console.log(form['repassword'].value);
        if( form['repassword'].value === form['password'].value) {
            console.log('success!');
        } else {
            error.push(2);
            
        }
        if(error.length === 0) {
            return true;
        } else {
            for(let a of error) {
                document.getElementsByClassName('tishi')[a].style.display = 'inline';
            }
            return false;
        }
    }

    let myfun = function (id) {
        let form = document.forms[id];
        console.log(form);
        var email = document.getElementById('email').value;
        console.log('hi!');
        if( validate(form) ) return true;
        else return false;
    }
    </script>
    </html>

仔细观察可以发现有几个可以抽象出来的功能模块：

1. 已经抽象好的规则模块
2. 已经抽象出来的验证模块，它应该能够返回一个对象，其中包括了出错的字段，甚至应该呢提供出错后对应的反馈信息。
3. 调试模块

应该剥离出模块的功能应该包括：

1. 初始化的时候循环清空所有的提示标签
2. 提交按钮触发的事件。
3. 直接操作dom节点的值

这些应该交由页面编辑人员自由处理。