/**
 * Created by Administrator on 2017/3/8.
 */
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

// 打开一个窗体
function windowOpen(url, name, width, height) {
    var top = parseInt((window.screen.height - height) / 2, 10), left = parseInt((window.screen.width - width) / 2, 10),
        options = "location=no,menubar=no,toolbar=no,dependent=yes,minimizable=no,modal=yes,alwaysRaised=yes," +
            "resizable=yes,scrollbars=yes," + "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left;
    window.open(url, name, options);
}

//打开操作成功通知
function noticeInfo(type, title, callback) {
    switch (type) {
        case 'notice':
            new jBox('Notice', {
                theme: 'NoticeFancy',
                attributes: {
                    x: 'right',
                    y: 'bottom'
                },
                color: '#FF5300',
                content: title,
                audio: '/plugin/jBox-0.4.8/Source/audio/bling2',
                volume: 100,
                animation: { open: 'slide:bottom', close: 'slide:left' },
                onClose: callback
            });
            break;
        case 'success':
            new jBox('Notice', {
                theme: 'NoticeFancy',
                attributes: {
                    x: 'right',
                    y: 'bottom'
                },
                color: 'green',
                content: title,
                audio: '/plugin/jBox-0.4.8/Source/audio/bling2',
                volume: 100,
                animation: { open: 'slide:bottom', close: 'slide:left' },
                onClose: callback
            });
            break;
        case 'fail':
            new jBox('Notice', {
                theme: 'NoticeFancy',
                attributes: {
                    x: 'right',
                    y: 'bottom'
                },
                color: 'red',
                content: title,
                audio: '/plugin/jBox-0.4.8/Source/audio/blop',
                volume: 100,
                animation: { open: 'slide:bottom', close: 'slide:left' },
                onClose: callback
            });
            break;
        default:
            new jBox('Notice', {
                theme: 'NoticeFancy',
                attributes: {
                    x: 'right',
                    y: 'bottom'
                },
                color: '#FF5300',
                content: title,
                audio: '/plugin/jBox-0.4.8/Source/audio/bling2',
                volume: 100,
                animation: { open: 'slide:bottom', close: 'slide:left' },
                onClose: callback
            });
            break;
    }
}

function changeParam (name, value, url) {
    var newUrl = "";
    var reg = new RegExp("(^|)" + name + "=([^&]*)(|$)");
    var tmp = name + "=" + value;
    if (url.match(reg) != null) {
        newUrl = url.replace(eval(reg), tmp);
    }
    else {
        if (url.match("[\?]")) {
            newUrl = url + "&" + tmp;
        }
        else {
            newUrl = url + "?" + tmp;
        }
    }
    return newUrl;
}

// 把json图片数组输出图片到html上
function jsonImgPrint (imgStr, imgFormat, className) {
    if (imgStr && imgStr != '') {
        var img_json = JSON.parse(imgStr);
        var id = genNonDuplicateID();
        window.document.write('<img id="' + id + '" src="' + img_json[0].path + img_json[0].name + imgFormat + '.' + img_json[0].suffix + '" class="' + (className ? className : '') + '"/>');
        return {
            src:img_json[0].path + img_json[0].name + '.' + img_json[0].suffix,
            id:id
        };
    }
}

// 把json图片数组输出图片到html上(只需要src)
function jsonImgPrintOnlySrc (imgStr, imgFormat) {
    if (imgStr && imgStr != '') {
        var img_json = JSON.parse(imgStr);
        window.document.write(img_json[0].path + img_json[0].name + imgFormat + '.' + img_json[0].suffix);
    }
}

/**
 * 生成一个用不重复的ID
 */
function genNonDuplicateID (randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
}