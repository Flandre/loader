/**
 * @author bh-lay
 * @git : https://github.com/bh-lay/loader
 * 
 * @demo
 * var require = new loader({ 
 * 	'lanternJS' : '/src/js/lantern.js',
 * 	'lanterncss' : '/src/css/lantern.css',
 * 	'lofox' : '/src/js/lofox.js'
 * });
 * require.load('lanternJS',callBack);
 * require.load('lanternCSS,lofox',callBack);
 * require.load('/src/js/lantern.js,/src/js/lofox.js',callBack);
 */
function loader(config){
	this.CONF = config;
}

(function(exports){
	var loadHistory = {};
	
	function loadJS(url,fn){		
		$.getScript(url,function(){
			fn&&fn();
		});
	}
	function loadCSS(url,callback){
		$('head').append('<link href="' + url + '" type="text/css" rel="stylesheet">');
		callback&&callback();
	}
	//��ʼ�����ļ�
	function load_start(url,callback){
		var ext = url.match(/\..+$/)[0];
		if(ext == '.css'){
			loadCSS(url,function(){
				callback&&callback(null);
			});
		}else if(ext == '.js'){
			loadJS(url,function(){
				callback&&callback(null);
			});
		}else{
			callback&&callback('could not support this type file');
		}
	}
	//��������ʷ������Ӧ����
	function loading(url,callback){
//		console.log('loader','load check:',url);
		loadHistory[url] = loadHistory[url] || 'waiting';
		switch (loadHistory[url]){
			case 'done':
				//�Ѿ����ع����ļ�
				callback&&callback(null);
			break
			case 'loading':
				//���ڼ���,�ȴ��������
				var wait = setInterval(function(){
					if(loadHistory[url] = 'done'){
						clearInterval(wait);
						callback&&callback(null);
					}
				},100);
			break
			case 'waiting':
//				console.log('loader','loading:',url);
				//׼������
				loadHistory[url] = 'loading';
				load_start(url,function(err){
//					console.log('loader','loaded:',url);
					loadHistory[url] = 'done';
					callback&&callback(err);
				});
			break
		}
	}
	var filter_url = function(str,callback){
		//����url search����
		var str = str ? str.split(/\?/)[0] : '';
		
		if(str.match(/\..+$/)){
			//����Ϊ��ַ
			callback&&callback(null,url);
		}else{
			//����Ϊģ����
			var modName = str;
			var url = this.CONF[modName] || null;
			if(!url){
				callback&&callback('could not find module please check mod spell');
			}else{
				callback&&callback(null,url);
			}
		}
	};
	exports.prototype.load = function(str,callback){
		//���������ڻ�Ϊ��ʱ��������ʽ
		if(!str || str.length < 1){
			return
		}
		var callback = callback || null;
		//���Բ�ֲ���
		var list = str.split(/\,/),
			 len = list.length;
		//�����
		var complete_num = 0;
		//������
		var error_num = 0;
		for(var i = 0;i<len;i++){
			filter_url.call(this,list[i],function(err,url){
				loading(url,function(err){
					if(err){
						error_num++;
					}
					complete_num++;
					console.log(url,complete_num);
					if(complete_num == len){
						callback&&callback(error_num);
					}
				});
			});
		}
	};
}(loader));