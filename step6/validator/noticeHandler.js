// done: 添加成功状态的处理
// 处理整个表单状态的接口函数
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
// 处理单个 input 元素状态的接口函数
// fixme: success 不再需要
let handleSingleInput = function( nameValue, errors, success = false, isName = false ) {

    console.log(errors);
    let ele = document.getElementById(`${nameValue}-span`);
    let errObject = errors.get(nameValue);
    if( !errObject ) {
        console.log(notices['success']);
        ele.innerHTML = notices['success'];
        ele.style.display = 'inline';
        return;
    }
    console.log(errObject);
    ele.innerHTML = errObject.msg;
    ele.style.display = 'inline';
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