import {DEBUG} from './validator.js'
import {notices } from './rules&static.js'
// 处理整个表单状态
let handleSubmit = function(fields, err) {

    if( DEBUG ) console.log( 'handling error msg' );
    if(err.size === 0) {

        if( DEBUG ) console.log('>>>>>> success：表单没有发现错误！>>>>>>');

    } else {

        for(let eleTag of fields.keys()){
            let ele = document.getElementById(`${eleTag}-span`);
            let msg;
            if( err.has(eleTag) ) {
                let errObject = err.get(eleTag);
                if(errObject.rule === 'required') {
                    msg = notices['required']; 
                } else {
                    msg = errObject.msg;
                }
                ele.innerHTML = msg;
                ele.style.display = 'inline';
            } else if ( ele.innerHTML ) {
                console.log('hahahhaha')
                msg = notices['success'];
                ele.innerHTML = msg;
                ele.style.display = 'inline';
            }
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