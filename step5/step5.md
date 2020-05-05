### todo

- [x] 修复 onblur() 和 onclick()/onsubmit() 冲突 bug
- [x] 遍历 form 处取消写死 // 逻辑从遍历界面表单元素转为遍历绑定好的规则元素
- [x] 重构 validate 函数
- [x] 重新编写直接调用的方法 example: v.check('isEmail', '@qq.com');
- [x] 为自定义需求注册规则
- [x] 为表单做函数验证
- [x] 统一做回调验证

``` js

function passwordIsStrong(value) {
    if(value.length < 10) return false;
    return true;
}
v.registerCallback('check_password', function(value) {
    if (passwordIsStrong(value)) {
        return true;
    }

    return false;
})
v.setMessage('check_password', 'Please choose a stronger password using at least 10 letters.');
```
