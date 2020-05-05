// done: 添加成功状态的处理
// 处理整个表单状态的接口函数
let handleSubmit = function(err) {

    if( DEBUG ) console.log( 'handling error msg' );
    if(err.size === 0) {

        if( DEBUG ) console.log('>>>>>> success：表单没有发现错误！>>>>>>');

    } else {

        for(let errObject of err.values()) {
            console.log(errObject);
            let errmsg;
            if(errObject.rule === 'required') {
                errmsg = notices['required']; 
            } else {
                errmsg = errObject.msg;
            }
            let ele = document.getElementById(`${errObject.id}-span`);
            ele.innerHTML = errmsg;
            ele.style.display = 'inline';
        }
    }

}

// 动态表单验证模块，控件失去焦点时触发
// 处理单个 input 元素状态的接口函数
// fixme: success 不再需要
let handleSingleInput = function( field, errors, success = false, isName = false ) {
    
    if( isName ) {
        let ele = document.getElementsByName(`${nameValue}-span`);
        if( success ) {
            for(let i = 0; i < ele.length; i++) {
                console.log(notices['success']);
                ele[i].innerHTML = notices['success'];
                ele[i].style.display = 'inline';
            }
            return;
        }
        for(let i = 0; i < ele.length; i++) {
            console.log(message);
            ele[i].innerHTML = message;
            ele[i].style.display = 'inline';
        }
    } else {
        

        let ele = document.getElementById(`${field.id}-span`);
        let errObject = errors.get(field.id);
        if( !errObject ) {
            console.log(notices['success']);
            ele.innerHTML = notices['success'];
            ele.style.display = 'inline';
            return;
        }
        console.log(errObject.msg);
        ele.innerHTML = errObject.msg;
        ele.style.display = 'inline';
    }
    return;

}

// 提交表单时，清楚指定 class 的提示信息
let clear = function( noticeClass ){

    console.log('clearing notice');
    let noticeArr = document.getElementsByClassName(noticeClass);
    for( let i = 0; i < noticeArr.length; i++) {
        if(noticeArr[i].innerText !== notices['success']) {
            document.getElementsByClassName(noticeClass)[i].style.display = 'none';
        }
    }

}