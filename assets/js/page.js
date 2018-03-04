/*jshint esversion: 6 */


const Page = (function() {
	// private
	var location = {},
		url;

	/**
	 *	Checks to see if there is a current page to load
	 */
	//console.log("getScenarioFromUrl()",JSON.stringify(getScenarioFromUrl()) )
	function checkForCurrentPage() {
		var path = getScenarioFromUrl();
		if (Site.debug) console.log(" -> Page.check() path = ", JSON.stringify(path))

		if (path.msa && path.scenario && path.data) {
			dataChange("load", path.msa, path.scenario, path.data);
		}
		// only the msa is set
		else if (path.msa) {
			dataChange("load", path.msa);
		}
	}



	/**
	 *	update URL - Be careful, because as you do the root of the site changes
	 */
	function updateUrl(change) {
		console.log("updateUrl()", change);

		// bind to StateChange Event
		History.Adapter.bind(window, 'statechange', function() {
			let State = History.getState();
		});

		let url = "";

		if (prop(current.msa))
			url += "" + current.msa;
		if (prop(current.scenario))
			url += "/" + current.scenario;
		if (prop(current.data))
			url += "/" + current.data;

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
				//location.reload();
				Page.check();
			}
		};
	}




	/**
	 *	Return the params from the current URL
	 */
	function getScenarioFromUrl() {
		var url = window.location.href.replace("#", ""),
			page = [];


			console.log("url",url)

		// split on domain (the working directory OR domain name)
		if (url.indexOf(Site.server) != -1) {
			// get everything after domain
			page = url.split(Site.server)[1];
				console.log("page",page)
			// remove any trailing slashes
			page = page.replace(/\/$/, "").trim();
			// if data there
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
		if (Site.debug) console.log(" -> Page.getScenarioFromUrl()", Site.server, url, page, location);
		return location;
	}



	return {
		check: checkForCurrentPage,
		updateUrl: function(change) {
			updateUrl(change)
		},
		getScenarioFromUrl: getScenarioFromUrl,
		addListeners: addListeners
	}

})();
