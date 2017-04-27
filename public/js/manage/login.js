/**
 * Created by Administrator on 2017/4/27.
 */
$(function () {
    // bg switcher
    var $btns = $(".bg-switch .bg");
    $btns.click(function (e) {
        e.preventDefault();
        $btns.removeClass("active");
        $(this).addClass("active");
        var bg = $(this).data("img");

        $("html").css("background-image", "url('/plugin/theme/default/img/bgs/" + bg + "')");
    });

    $('#login').click(function(){
        $.post('/manage/signin',$('form[name="login"]').serialize(),function(data){
            alert(data);
        });
    });
});