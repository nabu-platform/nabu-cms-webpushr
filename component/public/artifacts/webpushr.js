Vue.service("webpushr", {
	services: ["swagger", "user"],
	data: function() {
		return {
			// waiting for the sync can be expensive in time and generally not necessary
			waitForSync: false
		}
	},
	activate: function(done) {
		var self = this;
		
		(function(w,d, s, id) {if(typeof(w.webpushr)!=='undefined') return;
			w.webpushr=w.webpushr||function(){(w.webpushr.q=w.webpushr.q||[]).push(arguments)};var js, fjs = d.getElementsByTagName(s)[0];js = d.createElement(s); js.id = id;js.async=1;js.src = "https://cdn.webpushr.com/app.min.js";
			fjs.parentNode.appendChild(js);}(window,document, 'script', 'webpushr-jssdk'));
			
		webpushr('setup',{'key':"${configuration('nabu.cms.webpushr.configuration')/publicKey}"});
		
		webpushr('fetch_id',function (sid) { 
			var result = self.$services.swagger.execute("nabu.cms.webpushr.rest.push", {sid: sid});
			if (self.waitForSync) {
				result.then(done, done);
			}
		});
		
		if (!self.waitForSync) {
			done();
		}
	}
});