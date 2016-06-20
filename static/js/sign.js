/**
 * Created by flyingkite on 6/13/16.
 */


$(function () {
    $("#nickname").blur(checkNickname);
    $("#email").blur(checkEmail);
    $("#password").blur(checkPassword);
    $("#passwordAgain").blur(checkPasswordAgain);
    $("#signupBtn").click(signup);
    $("#loginBtn").click(login);

});

function checkNickname() {
    $("#nickname_warning").html("");
    var user_nickname = $("#nickname").val();
    if(mbStringLength(user_nickname)==0){
        $("#nickname_warning").html("昵称不能为空");
        return false;
    }
    else if (mbStringLength(user_nickname)< 6) {
        $("#nickname_warning").html("昵称长度请不短于6字节");
        return false;
    }
    else if (mbStringLength(user_nickname)> 40) {
        $("#nickname_warning").html("昵称长度请不超过40字节")
        return false;
    }
    return true;
}

function checkEmail() {
    $("#email_warning").html("");
    var user_email=$("#email").val();
    var pattern = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
    if (mbStringLength(user_email)==0)
    {
        $("#email_warning").html("邮箱不能为空");
        return false
    }
    else if(!pattern.test(user_email))
    {
        $("#email_warning").html("请输入合法的邮箱地址");
        return false
    }
    return true
}


function checkPassword() {
    $("#password_warning").html("");
    var user_password=$("#password").val();
    if (mbStringLength(user_password)==0)
    {
        $("#password_warning").html("密码不能为空");
        return false
    }
    else if (mbStringLength(user_password)<6)
    {
        $("#password_warning").html("密码长度不能少于6字节");
        return false
    }
    else if (mbStringLength(user_password)>24)
    {
        $("#password_warning").html("密码长度不能大于字节");
        return false
    }
    return true
}

function checkPasswordAgain() {
    $("#passwordAgain_warning").html("");
    var user_passwordAgain=$("#passwordAgain").val();
    if (mbStringLength(user_passwordAgain)==0) {
        $("#passwordAgain_warning").html("密码验证不能为空");
        return false
    }
    else if(user_passwordAgain!=$("#password").val())
    {
        $("#passwordAgain_warning").html("两次输入的密码不一致");
        return false
    }
    return true
}

function mbStringLength(s) {
    var totalLength = 0;
    var i;
    var charCode;
    for (i = 0; i < s.length; i++) {
        charCode = s.charCodeAt(i);
        if (charCode < 0x007f) {
            totalLength = totalLength + 1;
        } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
            totalLength += 2;
        } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
            totalLength += 3;
        }
    }
    return totalLength;
}

function login(){
    var url="/login";
    var data= {
        login_name: $("#login_name").val(),
        login_password: $("#login_password").val()
    };
    $.post(url,data,function(data){
        if(data.result=="success")
            window.location="/main";
        else
            $("#login_warning").html("用户名或密码错误")

    },"json")

}

function signup(){
    if(checkNickname()&&checkEmail()&&checkPassword()&&checkPasswordAgain())
    {
        var url="/signup";
        var data= {
            nickname: $("#nickname").val(),
            email: $("#email").val(),
            password: $("#password").val(),
            pic_id: $("input:radio[name='photo']:checked").val()
        };
        $.post(url,data,function(data){
            if(data.result=="success")
                window.location="/main";
            else if(data.result=="dup_nickname")
                $("#nickname_warning").html("昵称已被使用")
            else if(data.result=="dup_email")
                $("#email_warning").html("邮箱已被使用")
        },"json")
    }
}