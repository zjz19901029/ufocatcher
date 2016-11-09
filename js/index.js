$(function(){
	var gifts = (function(){//记录所有礼物信息
		var giftarr = [];
		$(".gifts p").each(function(){
			var i=$(this).attr("data-id");
			var left = parseFloat($(this).css("left").replace("px",""));
			var top = parseFloat($(this).css("top").replace("px",""));
			var width = $(this).width();
			var height = $(this).height();
			var zindex = parseInt($(this).css("z-index"));
			giftarr.push({
				el:$(this),
				id:i,
				left:left,
				top:top,
				width:width,
				height:height,
				zindex:zindex
			});
			i++;
		});
		return giftarr;
	})();
	var hook = {//钩子对象
		$el:$("#hookwrap"),
		maxRange:$(".main").width()-$("#hookwrap").width(),//左右最多移动的距离
		maxLength:$(".main").height()-$("#hook").height(),//上下最多移动的距离
		movePx:1,
		offset:{
			left:0
		},
		moveInterval:null,
		moveLeft:function(callback,callback2){
			hook.moveInterval&&clearInterval(hook.moveInterval);
			hook.moveInterval = setInterval(function(){
				if(hook.offset.left > 0){
					hook.offset.left-= hook.movePx;
					hook.updateStatus();
					callback&&callback();
				}else{
					callback2&&callback2();
					clearInterval(hook.moveInterval);
				}
			},1000/60);
		},
		moveRight:function(callback,callback2){
			hook.moveInterval&&clearInterval(hook.moveInterval);
			hook.moveInterval = setInterval(function(){
				if(hook.offset.left <hook.maxRange){
					hook.offset.left+=hook.movePx;
					hook.updateStatus();
					callback&&callback();
				}else{
					callback2&&callback2();
					clearInterval(hook.moveInterval);
				}
			},1000/60);
		},
		stopMove:function(){
			hook.moveInterval&&clearInterval(hook.moveInterval);
		},
		updateStatus:function(){
			hook.$el.css("left",hook.offset.left+"px");
		},
		startCatching:function(){
			hook.moveInterval&&clearInterval(hook.moveInterval);
			$("body").addClass("catching").attr("isplaying","true");
			var hookcenter = hook.offset.left+hook.$el.width()/2;
			var x = null;//礼物与钩子的圆心差
			var getGift = null;
			for(var i=0;i<gifts.length;i++){
				var giftcenter = gifts[i].left+gifts[i].width/2;
				x = hook.checkDistances(hookcenter,giftcenter,x);
				if(x){
					getGift = i;
				}
			}
			if(getGift!==null){
				hook.$el.css("height",gifts[getGift].top+10+'px').css("z-index",gifts[getGift].zindex+1);
				setTimeout(function(){
					$("body").addClass("win");
					gifts[getGift].el.addClass('get');
					setTimeout(function(){//回复原位
						$("body").addClass('reset');
						hook.moveLeft(function(){
							gifts[getGift].left-=hook.movePx;
							gifts[getGift].el.css("left",gifts[getGift].left+"px");
						},function(){
							$("body").addClass('release');
							setTimeout(function(){
								gifts[getGift].el.remove();
								gifts.splice(getGift,1);
								$("body").removeAttr("class");
								hook.$el.removeAttr('style');
								hook.offset.left = 0;
								$(".exit").addClass("active");
							},1000);
						});
					},2500);
				},3000);
			}else{
				hook.$el.css("height",hook.maxLength+'px').css("z-index",99);
				setTimeout(function(){
					$("body").addClass("lose");
					setTimeout(function(){
						$("body").addClass('reset');
						hook.moveLeft("",function(){
							$("body").removeAttr("class");
							$("body").attr("isplaying","");
							hook.$el.removeAttr('style');
							hook.offset.left = 0;
						});
					},2500);
				},3000);
			}
		},
		checkDistances:function(hookcenter,giftcenter,x){//判断钩子中心与礼物中心的距离
			var least = 6;
			var y = Math.abs(giftcenter-hookcenter);
			if(y<least&&(!x||y<x)){
				x = y;
				return x;
			}else{
				return null;
			}
		}
	}
	var $getGift = $(".getgift");
	$("div.left").on("touchstart",function(){//移动
		$(this).addClass("active");
		hook.moveLeft();
		event.preventDefault();
	});
	$("div.right").on("touchstart",function(){//移动
		$(this).addClass("active");
		hook.moveRight();
		event.preventDefault();
	});
	$(".start").click(function(){//开始
		hook.startCatching();
		event.preventDefault();
	});
	$(".exit p").click(function(){//领取礼物
		$getGift.css("left",$(this).offset().left+"px");
		$getGift.css("top",$(this).offset().top+"px");
		$(".exit").removeClass("active");
		$getGift.addClass('show');
	});
	$(".getgift button").click(function(){
		$getGift.removeClass("show");
		$("body").attr("isplaying","");
	});
	$(document).on("touchend",function(){
		$("div.left,div.right").removeClass("active");
		hook.stopMove();
	});
	$(document).on('contextmenu', function(e) {
	  e.preventDefault();
	})
	$(window).scrollTop(0);
	window.hook = hook;
});