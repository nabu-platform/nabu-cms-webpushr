Vue.service("webpushr", {
	services: ["swagger", "user"],
	data: function() {
		return {
			// waiting for the sync can be expensive in time and generally not necessary
			waitForSync: false,
			sid: null
		}
	},
	activate: function(done) {
		var self = this;
		
		if (nabu && nabu.page && nabu.page.provide) {
			var acceptCookies = ${configuration('nabu.cms.webpushr.configuration')/acceptCookies == true};
			nabu.page.provide("page-cookies", { 
				group: "webpushr",
				name: "_webpushrEndPoint",
				accept: acceptCookies,
				description: "Without this cookie, push notifications to mobile do not work"
			});
			nabu.page.provide("page-cookies", { 
				group: "webpushr",
				name: "_webpushrLastVisit",
				accept: acceptCookies
			});
		}
		
		(function(w,d, s, id) {if(typeof(w.webpushr)!=='undefined') return;
			w.webpushr=w.webpushr||function(){(w.webpushr.q=w.webpushr.q||[]).push(arguments)};var js, fjs = d.getElementsByTagName(s)[0];js = d.createElement(s); js.id = id;js.async=1;js.src = "https://cdn.webpushr.com/app.min.js";
			fjs.parentNode.appendChild(js);}(window,document, 'script', 'webpushr-jssdk'));
			
		webpushr('setup',{'key':"${configuration('nabu.cms.webpushr.configuration')/publicKey}"});
		this.pushSid();
		
		if (!self.waitForSync) {
			done();
		}
	},
	methods: {
		pushSid: function() {
			var self = this;
			webpushr('fetch_id',function (sid) { 
				var result = self.$services.swagger.execute("nabu.cms.webpushr.rest.push", {sid: sid});
				self.sid = sid;
				if (self.waitForSync) {
					result.then(done, done);
				}
			});
		}
	},
	clear: function(done) {
		this.pushSid();
		done();
	}
});