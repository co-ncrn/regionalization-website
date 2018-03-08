var Page = (function() {
	"use strict";

	// the default location object
	var location = {
			"msa": "",
			"scenario": "",
			"data": ""
		},
		url;

	function setLocation(newLocation){
		if (prop(newLocation.msa) && newLocation.msa != "")
			location.msa = newLocation.msa;
		if (prop(newLocation.scenario) && newLocation.scenario != "")
			location.scenario = newLocation.scenario;
		if (prop(newLocation.data) && newLocation.data != "")
			location.data = newLocation.data;
		// update page title
		updateTitle();
		// update download link
		Menu.updateDownloadLink(newLocation.msa);
	}

	/**
	 *	Return the params from the current URL
	 */
	function parseUrl() {
		if (Site.debug) console.log(" -> Page.parseUrl() location = ", window.location.href);

		var url = window.location.href,
			page = [],
			location = {};

		// remove hash
		if (url.indexOf("#") != -1){
			url = url.split("#")[0];
		}

		// split on domain (the working directory OR domain name)
		if (url.indexOf(Site.server) != -1) {
			// get everything after domain
			page = url.split(Site.server)[1];
			// remove any trailing slashes
			page = page.replace(/\/$/, "").trim();
			if (Site.debug) console.log(" -> Page.parseUrl() page = ", page);

			// remove
			if(page.substr(0) === '/') {
				page = page.substr(1);
			}

			// if data
			if (page != "") {
				// then there must be msa (and/or scenario and data)
				if (page.indexOf("/") != -1) {
					// split on /
					var pages = page.split("/");
					// set vars
					if (pages[0]) location.msa = pages[0].trim();
					if (pages[1]) location.scenario = pages[1].trim();
					if (pages[2]) location.data = pages[2].trim();
				} else {
					location.msa = page.trim();
				}
			}
		}
		if (Site.debug) console.log(" -> Page.parseUrl()", Site.server, location);
		return location;
	}


	/**
	 *	Checks to see if there is a current page to load
	 */
	function initCheckUrlForScenario() {
		this.location = parseUrl();
		if (Site.debug) console.log(" -> Page.initCheckUrlForScenario() location = ", location);
		location = this.location;
		if (Site.debug) console.log(" -> Page.initCheckUrlForScenario() new location = ", location);
	}


	/**
	 *	update URL - Be careful, because as you do the root of the site changes
	 */
	function updateUrl(change, newLocation) {
		console.log(" -> Page.updateUrl()", change, newLocation);

		// bind to StateChange Event
		History.Adapter.bind(window, 'statechange', function() {
			let State = History.getState();
		});

		let url = returnSafeUrl();
		// change state
		if (change == 'add') {
			// data
			History.pushState({
				state: 1
			}, Site.title + " :: " + url, Site.rootDir + url);
		} else {
			// default
			History.pushState({
				state: 0
			}, Site.title + "", Site.rootDir);
		}

	}

	function returnSafeUrl(){
		let url = "";
		if (prop(location.msa)) {
			url += "" + location.msa;
			if (prop(location.scenario)) {
				url += "/" + location.scenario;
				if (prop(location.data))
					url += "/" + location.data;
			}
		}
		return url;
	}

	/**
	 *	Update Title
	 */
	function updateTitle() {
		let url = returnSafeUrl();
		if (url != "") url = " :: " + url;
		$("title").html(Site.title + url);
	}

	/**
	 *	if user clicks back/forward button then check the page again
	 */
	function addListeners() {

		window.onpopstate = function(event) {
			if (event && event.state) {
				console.log("url changed");
				init();
			}
		};
		// scroll to section and make room at top for image
		// to move out from under the header
		window.addEventListener("hashchange", function () {
		    window.scrollTo(window.scrollX, window.scrollY - 50);
		});


	}


	/**
	 *	Make #presentation fullscreen
	 */
	var toggleFullscreen = function() {
		// if already full screen; exit
		if (
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement
		) {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
		}
		// else go fullscreen
		else {
			let element = $('#presentation').get(0);
			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			} else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
		}
	};



	return {
		initCheckUrlForScenario: initCheckUrlForScenario,
		updateUrl: function(change, newLocation) {
			updateUrl(change, newLocation);
		},
		updateTitle: updateTitle,
		addListeners: addListeners,
		setLocation: function(newLocation){
			setLocation(newLocation);
		},
		toggleFullscreen: function(){
			toggleFullscreen();
		}
	};

})();
