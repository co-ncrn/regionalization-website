/*jshint esversion: 6 */



var Menu = (function() {
	// private

	/**
	 *	Build new MSA menu
	 */
	function newMsaMenu(msas) {
		if (Site.debug) console.log(" -> Menu.newMsaMenu()")
		// default option
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
	}

	/**
	 *	Set state of the MSA menu
	 */
	function setMsaMenu(msa){
		$("#msa_select_box").val(msa).trigger('chosen:updated');
	}

	/**
	 *	Build new scenario menu based on MSA selection
	 */
	function newScenarioMenu(msa, scenario, data) {
		if (Site.debug) console.log(" -> Menu.newScenarioMenu()", msa, scenario, data);
		if (Site.debug) $("#rawDataOutput").val(msa + ": \n" + JSON.stringify(msas[msa])); // testing

		//if (Site.debug) console.log(msas[msa][0])
		currentDataForMapColor = msas[msa][0];

		// use msa to update the scenario box
		var scenario_options = "<option val=''></option>";

		// for each scenario
		for (var i = 0, l = msas[msa].length; i < l; i++) {
			//if (Site.debug) console.log( msas[msa][i]);

			var scenario = msas[msa][i].scenario;

			// add optiongroup with scenario
			scenario_options += "<optgroup label='" + dataDict[scenario] + "'>";

			// for each data type
			for (var j = 0; j < msas[msa][i].data.length; j++) {
				//if (Site.debug) console.log( msas[msa][i].data[j]);

				var data = msas[msa][i].data[j];

				// add scenario
				scenario_options += optionHTML(scenario + "-" + data, dataDict[data]);
			}
			scenario_options += "</optgroup>";
		}

		// update options
		$("#scenario_select_box").append(scenario_options).trigger('chosen:updated');

		// if scenario/data then set it
		if (prop(scenario)) {
			//if (Site.debug) console.log("scenario",current.scenario +"-"+ current.data);
			$("#scenario_select_box").val(current.scenario + "-" + current.data).trigger('chosen:updated');
		}
		// otherwise open it for input
		else {
			$('#scenario_select_box').trigger('chosen:open');
		}


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
			dataChange("menu", {"msa":params.selected, "scenario": current.scenario, "data":current.data});
		});
		$('#scenario_select_box').on('change', function(evt, params) {
			if (Site.debug) console.log("params.selected", params.selected);
			// split the params from the dropdown
			var p = params.selected.split("-");
			if (p.length == 2) {
				//if (Site.debug) console.log( p.toString())
				dataChange("menu", {"msa":current.msa, "scenario": p[0], "data":p[1]});
			}
		});

	}




	return {
		setMsaMenu: function(msa) {
			setMsaMenu(msa);
		},
		newMsaMenu: function(msas) {
			newMsaMenu(msas);
		},
		update: function() {

		},
		newScenarioMenu: function(msa, scenario, data){
			newScenarioMenu(msa, scenario, data)
		},
		addListeners: addListeners
	}

})();
