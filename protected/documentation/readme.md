# Webpushr.com

# Framework

- create a site in webpushr, if you are using localhost, make sure you generate a self-signed cert with localhost as CN and install it in the authorities section
- copy the public key from the javascript blurb
- configure the public key and the two other facts in your web application fragments

Every time we get a valid sid from webpushr, we push it to the backend for storage.

# Manual test

I created a "site" in webpushr where I set as link "https://localhost:9090/".

The generated script I added to a file "webpushr.js" in public/artifacts, so specifically _not_ to the body. I did have to wrap it in a 

```javascript
window.addEventListener("load", function () {
}
```

Otherwise, from time to time it messed stuff up.

Upon loading the file in chrome I got a popup requesting whether I want to receive updates, this popup is from webpushr itself.
This is because apple and firefox require interaction with a site (e.g. a mouse click) before allowing the popup for notifications. Chrome uses a more complex approach where it punishes sites that do the popup but get refused. So it is standard practice to show a custom popup first.

Once I clicked allow, I got the actual browser popup.

The webworker file has to be available at the root however. I tried messing around with registering an application under /resources etc but that didn't work.
You can _not_ redirect /webpushr-sw.js to /resources/webpushr-sw.js because this is apparently not allowed for workers (redirects that is).

So in the end I added a preprocessing rewrite from /webpushr-sw.js to /resources/webpushr-sw.js 
This did require a tiny change in the event pipeline because pipelines were not recalculated after a rewrite and the filters had to be reevaluated...

## SSL

Getting chrome to accept the self signed cert is...not easy. Even adding it explicitly to trusted keeps prompting an ERR_CERT_COMMON_NAME_INVALID even though I've tried both "localhost" and "localhost:9090". Turns out it is because chrome (58+) no longer looks at CN, but only at SAN (subject alternative names). The keystore logic has been updated to take the CN and also plug it in there...

So the steps are:

- generate self signed with CN "localhost" (not including the port)
- in chrome go to the page, you get a security error
- download the cert from there
- go to settings, search for cert and add it to the authorities section.

Also, apparently you can go to "chrome://flags/#allow-insecure-localhost" and enable that flag. It did let me through without a screen prompting for insecure, but it was still tagged as insecure at the top and it didn't help with the web workers, it kept saying (in console) that there was an SSL problem when loading the workers.

## SID

To get the subscriber id for the current user, you can add an asynchronous method _after_ the bit we copy pasted into the window on load (but also inside the load of course)

```javascript
window.addEventListener("load", function () {
    // the copy pasted bit from the site goes here

    webpushr('fetch_id',function (sid) { 
		console.log("the id is", sid);
	});
}
```