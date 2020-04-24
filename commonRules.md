##默认规则

常用的验证规则：

规则名 | 用途|用法举例
------------ | -------------| -------------
required | 值必须存在（兼容radio/checkbox/select的处理）| required required-msg="用户名必须存在！"
pattern | 配置一个正则对值进行验证| pattern="s$" pattern-msg="email错误！"
max | 最大值校验（兼容checkbox的处理）| max="3" max-msg="最多选择3项！"
min | 最小值校验（兼容checkbox的处理）| min="3" min-msg="最小选择3项！"
equal | value是否等于配置的值 | equalTo="明河" equalTo-msg="请填写明河！"
equal-field | 校验二个字段的值是否相同 | equal-field="password" equal-field-msg="密码输入不一致！"
number | 是否是数字  | number number-msg="必须是数字"
mobile | 是否符合手机号码格式 | mobile mobile-msg="手机号码不合法！"
email | 是否符合email格式  |
date | 是否符合日期格式 |