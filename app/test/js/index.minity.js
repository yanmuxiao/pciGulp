/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-10-27 13:00:55
 * @version $Id$
 */
var renderCvs = function(parent,max){
	var lazyloadImage = $('.lazyload',parent);
	if(lazyloadImage.length < 1){
		return;
	}
	var max = max || lazyloadImage.length;
	for(var i=0;i<max;i++){
		var imgId = lazyloadImage[i].id;
		var imageCache = GET(imgId);
		if(imageCache){
			lazyloadImage[i].src = imageCache;
			continue;
		}

		var img = new Image();
		img.index = i;
		img.id = imgId;
		img.crossorigin = "anonymous";
		img.onload = function(){
			var _this = this;
			var zCvs = $('#'+this.id);
			var domCvs = ZCvs[0];
			domCvs.src = this.src;
			zCvs.removeClass('lazyload');
			try{
				var cvs = document.createElement('canvas');
				cvs.style.display = 'none';
				document.body.appendChild(cvs);
				var rcvs = cvs.getContext('2d');
				cvs.width = 140;
				cvs.height = 108;
				rcvs.drawImage(this,0,0,140,108);
				setTimeout(function(){
					var data = cvs.toDataURL();
					SET(_this.id,data);
					document.body.removeChild(cvs);
				},200);
			}catch(ex){

			}
		}
		img.src = lazyloadImage[i].getAttribute('data-src');
	}
}

