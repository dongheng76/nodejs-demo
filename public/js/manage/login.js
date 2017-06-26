/**
 * Created by Administrator on 2017/4/27.
 */
(function ($, window) {
    $(function () {
        // bg switcher
        var $btns = $('.bg-switch .bg');
        $btns.click(function (e) {
            e.preventDefault();
            $btns.removeClass('active');
            $(this).addClass('active');
            var bg = $(this).data('img');

            $('html').css('background-image', "url('/plugin/theme/default/img/bgs/" + bg + "')");
        });
    });
}(this.jQuery, this));

$("form[name='login']").validate({
    rules: {
        login_name: 'required',
        password: {
            required: true,
            minlength: 2,
            maxlength: 16
        }
    },
    messages: {
        login_name: '你必须填写一个登录名!',
        name: {
            required: '密码必须填写',
            minlength: '密码至少2位字符',
            maxlength: '密码最多16位字符'
        }
    },
    submitHandler: function (form) {
        $.post('/manage/signin', $('form[name="login"]').serialize(), function (data) {
            if (data.result) {
                window.location.href = '/manage/panel';
            } else {
                noticeInfo('fail', data.message);
            }
        }).error(function (data) {
            noticeInfo('fail', '登录失败请检查您的网络!');
        });
    }
});