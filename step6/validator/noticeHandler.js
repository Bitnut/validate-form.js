import { DEBUG } from './validator.js';
import { notices } from './rules&static.js';
// 处理整个表单状态
function handleSubmit (fields, err, key) {
    console.log(fields);
    if (DEBUG) console.log('handling error msg');
    switch (key) {
        case 'default':
            _defaultErrHandler(err, fields);
            break;
        case 'alert':
            _alertErrHandler(err, fields);
            break;
        case 'message':
            _messageErrHandler(err, fields);
            break;
        case 'toast':
            _toastErrHandler(err, fields);
            break;
        case 'notification':
            _notificationErrHandler(err, fields);
            break;
        default:
            break;
    }

    // 表单的错误处理默认调用了提交事件
    if (err.size === 0) {
        console.log('here');
        setTimeout(() => {
            this.form.submit();
        }, 3000);
    }
}

// 动态表单验证模块，控件失去焦点时触发
// 处理单个 input 元素状态
function handleSingleInput (nameValue, errors) {
    const ele = document.getElementById(`${nameValue}-span`);
    const errObject = errors.get(nameValue);
    if (!errObject) {
        if (DEBUG) console.log(notices.success);
        ele.innerHTML = notices.success;
        ele.style.display = 'inline';
        return;
    } else {
        ele.innerHTML = errObject.msg;
        ele.style.display = 'inline';
    }
    if (DEBUG) {
        console.log(errObject);
    }
}

function _defaultErrHandler (err, fields) {
    if (err.size === 0) {
        if (DEBUG) console.log('>>>>>> success：表单没有发现错误！>>>>>>');
    } else {
        for (const eleTag of fields.keys()) {
            const ele = document.getElementById(`${eleTag}-span`);
            let msg;
            if (err.has(eleTag)) {
                const errObject = err.get(eleTag);
                if (errObject.rule === 'required') {
                    msg = notices.required;
                } else {
                    msg = errObject.msg;
                }
                if (!errObject.pending) {
                    ele.innerHTML = msg;
                    ele.style.display = 'inline';
                }
            } else if (ele.innerHTML) {
                msg = notices.success;
                ele.innerHTML = msg;
                ele.style.display = 'inline';
            }
        }
    }
}

// todo: 等待完成的几个错误 handler
function _alertErrHandler (err, fields) {
    _defaultErrHandler(err, fields);
    alert('useing alert!');
}

function _messageErrHandler (err, fields) {
    _defaultErrHandler(err, fields);
    alert('useing message!');
}

function _toastErrHandler (err, fields) {
    _defaultErrHandler(err, fields);
    alert('useing toast!');
}

function _notificationErrHandler (err, fields) {
    _defaultErrHandler(err, fields);
    alert('useing notification!');
}

export {
    handleSubmit,
    handleSingleInput
};
