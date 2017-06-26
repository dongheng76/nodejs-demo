$.fn.fileManage = function(config) {
	var cache = {};// 缓存
	var EVENTSUFFIX = "fileManage";// 插件事件后缀
	var $this = $(this);// 定义当前用户节点
	/* 定义默认配置 */
	var option = {
		multiSelect:true,
		imagePrefix : null,
	    callback : {
	        onclickMenu : function(key, selectData, selectElement) {
	        },
	        dblclick : function(e,selectData, selectElement) {
	        }
	    },
	    rightMenu : {
	        notSelect : {
	            "flush" : {
	                name : "刷新",
	                icon : "loading"
	            },
	            "quit" : {
	                name : "关闭",
	                icon : "quit"
	            }
	        },
	        singleSelect : {
	            "move" : {
	                name : "移动所选",
	                icon : "cut"
	            },
	            "download" : {
	                name : "下载所选",
	                icon : "copy"
	            },
	            "delete" : {
	                name : "删除所选",
	                icon : "delete"
	            },
	            "sep1" : "---",
	            "flush" : {
	                name : "刷新",
	                icon : "loading"
	            },
	            "quit" : {
	                name : "关闭",
	                icon : "quit"
	            }
	        },
	        multipleSelect : {
	            "move" : {
	                name : "移动所选",
	                icon : "cut"
	            },
	            "delete" : {
	                name : "删除所选",
	                icon : "delete"
	            },
	            "sep1" : "---",
	            "flush" : {
	                name : "刷新",
	                icon : "loading"
	            },
	            "quit" : {
	                name : "关闭",
	                icon : "quit"
	            }
	        }
	    }
	}
	$.extend(true, option, config);
	/* 创建根节点 */
	var fileList = $('<div class="file_list"><div>').appendTo($this);
	/* 设置图片按比例高宽 */
	var setImageSize = function($img){
		$img.on('load', function(){
			var tw = 150;
			var th = 150;
    		var w = this.width;
    		var h = this.height;
    		var rw = w;
    		var rh = h;
    		var r = w/h;
    		if(w/tw > h/th){
    			if(w/tw>1){
    				rw = tw;
    				rh = tw/r;
    			}
    		}else{
    			if(h/th>1){
    				rh = th;
    				rw = th*r;
    			}
    		}
    		$img.width(rw);
    		$img.height(rh);
    		$img.css({
				'margin-top':(150-rh)/2
			});
    		$img.css({
				'margin-left':(150-rw)/2
			});
    		$(this).show();
    	});
	};
	/* 创建节点元素 */
	var createNode = function(data) {
		fileList.empty();
		cache.data = data;
		var map = {
		    "folder" : function(row) {
			    return '<div class="file_item" data-id="' + row.id + '"><div class="folder_icon"></div><div class="file_title" title="' + row.title + '">' + row.title + '</div></div>';
		    },
		    "image" : function(row) {
		    	var img = new Image();
		    	// var $img = $(img).hide().attr("src",(option.imagePrefix || "") + row.path+row.name+"."+row.suffix);
				var $img = $(img).hide().attr("src","/getfile?id=" + row.id + '&format=150x150');

		    	setImageSize($img);
		    	var n = $('<div class="file_item" data-id="' + row.id + '"><div class="img_wrap"></div><div class="file_title"><div class="file_title_content" title="' + row.title + '">' + row.title + '</div><div class="file_title_suffix">.' + row.suffix + '</div></div>');
		    	n.find(".img_wrap").html($img);
			    return n;
		    },
		    "file" : function(row) {
			    return '<div class="file_item" data-id="' + row.id + '"><div class="file_icon"></div><div class="file_title"><div class="file_title_content" title="' + row.title + '">' + row.title + '</div><div class="file_title_suffix">.' + row.suffix + '</div></div></div>';
		    }
		}
		for (var i = 0; i < data.length; i++) {
			var fileItem = map[data[i].type](data[i]);
			fileList.append(fileItem);
		}
		fileList.append('<div class="auto-height"></div>');
	};
	/* 载入文件夹双击事件 */
	fileList.on('dblclick.' + EVENTSUFFIX, function(e) {
		var n = $(e.target).parents(".file_item");
		if (n.length>0 && n.find(".folder_icon").length>0) {
			var selectData = manage.getSelectedData();
			option.callback.dblclick(e, selectData, n.parent());
		}
	})
	
	var manage = {
	    load : function(data) {
		    createNode(data);
		    /* 载入预览图片 */
		    fileList.viewer("destroy").viewer({
			    customEvent : 'dblclick'
		    });
	    },
	    getSelectedElement : function(){
	    	return $(".file_selected");
	    },
	    getSelectedData : function(){
	    	var _this = this;
	    	var list = [];
	    	var n = $(".file_selected");
	    	n.each(function(){
	    		var id = $(this).attr("data-id");
	    		list.push(_this.getRowData(id));
	    	});
	    	return list;
	    },
	    getRowData : function(id) {
		    for (var i = 0; i < cache.data.length; i++) {
			    if (id == cache.data[i].id) {
				    return cache.data[i];
			    }
		    }
	    }
	};
	if(!option.multiSelect){
		fileList.on("click."+EVENTSUFFIX, function(e) {
			$(this).find(".file_selected").removeClass("file_selected");
			var item = $(e.target).parents(".file_item");
			if(item.length>0){
				item.addClass("file_selected");
			}
		})
		return manage;
	}
	var findTarget = function(e, c) {
		if ($(e).hasClass(c)) {
			return e;
		} else if (e.tagName.toUpperCase() == 'HTML') {
			return null;
		} else {
			return findTarget(e.parentElement, c);
		}
	};
	/* 载入右键菜单 */
	$.contextMenu({
	    selector : '.file_list',
	    events : {
		    show : function() {
			    /*
				 * var length = $(".file_selected").length; if (length == 0) {
				 * return false; }
				 */
			    return true;
		    }
	    },
	    build : function($trigger, e) {
		    // this callback is executed every time the menu is to be shown
		    // its results are destroyed every time the menu is hidden
		    // e is the original contextmenu event, containing e.pageX and
		    // e.pageY (amongst other data)
//	    	var ele = findTarget(e.target,"file_item");
//	    	if(ele){
//	    		ele = $(ele);
//	    		if(!ele.hasClass("file_selected")){
//	    			$(".file_selected").removeClass("file_selected");
//	    			ele.addClass("file_selected");
//	    		}
//	    	}
		    var selectElement = $(".file_selected");
		    var callback = function(key, options) {
		    	var selectData = manage.getSelectedData();
			    option.callback.onclickMenu.call(options, key, selectData, selectElement);
		    }
		    var items = $.extend({},option.rightMenu.notSelect);
		    var length = selectElement.length;
		    if (length == 1) {
			    items = $.extend({},option.rightMenu.singleSelect);
			    // TODO 文件夹暂时不支持下载
			    if (selectElement.find(".folder_icon").length > 0) {
				    delete items.download;
			    }
		    } else if (length > 1) {
			    items = $.extend({},option.rightMenu.multipleSelect);
		    }
		    return {
		        callback : callback,
		        items : items
		    };
	    }
	});
	/* 载入框选 */
	fileList.selectable({
	    classes : {
		    "ui-selected" : "file_selected"
	    },
	    filter : '.file_item'
	});
	return manage;
}
