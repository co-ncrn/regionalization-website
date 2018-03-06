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
	}

	/**
	 *	Return the params from the current URL
	 */
	function parseUrl() {
		var url = window.location.href,
			page = [],
			loc = {};

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
			// if data
			if (page != "") {
				// then there must be msa (and/or scenario and data)
				if (page.indexOf("/") != -1) {
					// split on /
					var pages = page.split("/");
					// set vars
					if (pages[0]) loc.msa = pages[0].trim();
					if (pages[1]) loc.scenario = pages[1].trim();
					if (pages[2]) loc.data = pages[2].trim();
				} else {
					loc.msa = page.trim();
				}
			}
		}
		//if (Site.debug) console.log(" -> Page.parseUrl()", Site.server, loc);
		return loc;
	}


	/**
	 *	Checks to see if there is a current page to load
	 */
	function initCheckUrlForScenario() {
		this.location = parseUrl();
		if (Site.debug) console.log(" -> Page.initCheckUrlForScenario() location = ", location);
		location = this.location;
		//this.location = loc;
		if (Site.debug) console.log(" -> Page.initCheckUrlForScenario() location = ", location);

		// move to Mns.createMap() after map loads
		//dataChange("load", location);
	}


	/**
	 *	update URL - Be careful, because as you do the root of the site changes
	 */
	function updateUrl(change, newLocation) {
		//console.log("updateUrl()", change, newLocation);

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
