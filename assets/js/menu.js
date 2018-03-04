/*jshint esversion: 6 */



var Menu = (function() {
	// private

	/**
	 *	Build the MSA menu when the page loads
	 */
	function createMSA(msas) {
		if (Site.debug) console.log(" --> Menu.createMSA()")
		// default empty value in select menus
		var msa_options = "<option val=''></option>";
		// loop through msas
		for (var key in msas) {
			// skip loop if the property is from prototype
			if (!msas.hasOwnProperty(key)) continue;
			//if (Site.debug) console.log(key,data[key])
			// add MSAs to select options
			msa_options += optionHTML(key, key + " - " + msas[key][0].description);
		}
		$("#msa_select_box").append(msa_options).trigger('chosen:updated'); // update select

		Page.check(); // now that the MSA menu is set, should we display a page based on url?
	}

	function addListeners() {

		// define chosen() options
		$("#msa_select_box").chosen({
			search_contains: true, // start search anywhere in the word
			disable_search_threshold: 10,
			no_results_text: "Oops, nothing found!",
			width: "95%"
		});
		$("#scenario_select_box").chosen({
			search_contains: true,
			disable_search_threshold: 10,
			no_results_text: "Oops, nothing found!",
			width: "95%"
		});
		// on chosen() change events
		$('#msa_select_box').on('change', function(evt, params) {
			dataChange("menu", params.selected, current.scenario, current.data);
		});
		$('#scenario_select_box').on('change', function(evt, params) {
			if (Site.debug) console.log("params.selected", params.selected);
			// split the params from the dropdown
			var p = params.selected.split("-");
			if (p.length == 2) {
				//if (Site.debug) console.log( p.toString())
				dataChange("menu", current.msa, p[0], p[1]);
			}
		});

	}




	return {
		createMSA: function(msas) {
			createMSA(msas);
		},
		update: function() {

		},
		addListeners: addListeners
	}

})();
