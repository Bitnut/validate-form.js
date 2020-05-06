import {DEBUG} from './validator.js'
import {notices } from './rules&static.js'
// 处理整个表单状态
let handleSubmit = function(err) {

    if( DEBUG ) console.log( 'handling error msg' );
    if(err.size === 0) {

        if( DEBUG ) console.log('>>>>>> success：表单没有发现错误！>>>>>>');

    } else {

        for(let [eleTag, errObject] of err) {
            if( DEBUG ) console.log(errObject);
            let errmsg;
            if(errObject.rule === 'required') {
                errmsg = notices['required']; 
            } else {
                errmsg = errObject.msg;
            }
            let ele = document.getElementById(`${eleTag}-span`);
            ele.innerHTML = errmsg;
            ele.style.display = 'inline';
        }
    }

}

// 动态表单验证模块，控件失去焦点时触发
// 处理单个 input 元素状态
let handleSingleInput = function( nameValue, errors ) {

    
    let ele = document.getElementById(`${nameValue}-span`);
    let errObject = errors.get(nameValue);
    if( !errObject ) {
        console.log(notices['success']);
        ele.innerHTML = notices['success'];
        ele.style.display = 'inline';
        return;
    }
    if( DEBUG ) {
        console.log(errors);
        console.log(errObject);
    }
    ele.innerHTML = errObject.msg;
    ele.style.display = 'inline';
    return;

}

export {
    handleSubmit,
    handleSingleInput
}