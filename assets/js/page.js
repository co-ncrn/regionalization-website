/*jshint esversion: 6 */


var Page = (function() {
	// private

	// the default location object
	var location = {
			"msa": "",
			"scenario": "",
			"data": ""
		},
		url;

	/**
	 *	Return the params from the current URL
	 */
	function parseUrl() {
		var url = window.location.href.replace("#", ""),
			page = [],
			loc = {};

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

		dataChange("load", location);
	}




	/**
	 *	update URL - Be careful, because as you do the root of the site changes
	 */
	function updateUrl(change, newLocation) {
		console.log("updateUrl()", change, newLocation);

		// bind to StateChange Event
		History.Adapter.bind(window, 'statechange', function() {
			let State = History.getState();
		});

		let url = "";

		if (prop(newLocation.msa)) {
			url += "" + newLocation.msa;
			if (prop(newLocation.scenario)) {
				url += "/" + newLocation.scenario;
				if (prop(newLocation.data))
					url += "/" + newLocation.data;
			}
		}
		// change state
		if (change == 'add') {
			// data
			History.pushState({
				state: 1
			}, Site.title + " &ndash; " + url, Site.rootDir + url);
		} else {
			// default
			History.pushState({
				state: 0
			}, Site.title + "", Site.rootDir);
		}

	}

	/**
	 *	if user clicks back/forward button then check the page again
	 */
	function addListeners() {
		window.onpopstate = function(event) {
			if (event && event.state) {
				console.log("url changed")
				init();
			}
		};
	}


	return {
		initCheckUrlForScenario: initCheckUrlForScenario,
		updateUrl: function(change, newLocation) {
			updateUrl(change, newLocation)
		},
		addListeners: addListeners
	}

})();
