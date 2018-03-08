<?php

//
// // will eventually be domain name
// //domain = "regionalization-website/";	// owen's computer
// //domain = "http://207.38.84.184/";		// remote
//
// // api url
// //api_url = "http://localhost/api/";	// for testing local
// api_url = "http://207.38.84.184/api/";	// remote
// api_url = "https://reducinguncertainty.org/api/";	// remote
//
// // root file directory
// rootDir = "http://localhost/RegionalismMap/code/regionalization-website/";
// //rootDir = "http://207.38.84.184/";	// remote
//
//

$site = array(
    // data path
    'dataDir' => "/data/",
    // to debug or not
    'debug' => 1,
    // description: for meta tags, etc.
    'description' => "Reducing the Margin of Error in the American Community Survey",
    // domain for reference
    'domain' => "reducinguncertainty.org",
    // root directory for assets
    'rootDir' => "/",
    // are we running on local or remote server
    'server' => "https://reducinguncertainty.org/",
    // for meta tags and page
    'title' => "Reducing Uncertainty"
);

// handle rewrites
if ($_SERVER['HTTP_HOST'] == "localhost") {
    $site['rootDir'] = $site['server'] = "http://localhost/RegionalismMap/code/regionalization-website/";
}

?>
<!DOCTYPE html>
<html lang="en">
<head>

<!-- meta -->
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<title>Reducing Uncertainty :: Reducing the Margin of Error in the American Community Survey</title>
<meta name='description' content="<?php print $site['title']; ?> – <?php print $site['description']; ?>">
<meta name="keywords" content="ACS,census,data,maps,margin of error">
<meta name="author" content="Seth Spielman, David Folch, Becky Davies, Owen Mundy">
<link rel="icon" href="<?php print $site['rootDir']; ?>favicon.ico">
<link rel="apple-touch-icon-precomposed" href="<?php print $site['rootDir']; ?>favicon-152x152.png">

<!-- Twitter Card data -->
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@owenmundy">
<meta name="twitter:title" content="<?php print $site['title']; ?>">
<meta name="twitter:description" content="<?php print $site['description']; ?>">
<meta name="twitter:creator" content="@owenmundy">
<meta name="twitter:image" content="https://<?php print $site['domain']; ?>/assets/img/share-600x600.png">

<!-- Open Graph data -->
<meta property="og:title" content="<?php print $site['title']; ?>" />
<meta property="og:type" content="article" />
<meta property="og:url" content="https://<?php print $site['domain']; ?>/" />
<meta property="og:image" content="https://<?php print $site['domain']; ?>/assets/img/share-600x600.png" />
<meta property="og:image:width" content="300" />
<meta property="og:image:height" content="300" />
<meta property="og:description" content="<?php print $site['description']; ?>" />
<meta property="og:site_name" content="<?php print $site['title']; ?>" />
<meta property="fb:app_id" content="833996433457830" />


<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400|Roboto+Slab:100">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/bootstrap/dist/css/bootstrap.min.css">
<!-- <link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/chosen-jquery/lib/chosen.min.css"> -->
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/leaflet/dist/leaflet.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/leaflet-easybutton/src/easy-button.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/font-awesome/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/bootstrap4c-chosen/dist/css/component-chosen.min.css">

<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>assets/css/styles-chart.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>assets/css/styles-map.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>assets/css/styles.css">


<script>
var Site = (function() {

	return {
        dataDir: "<?php print $site['dataDir']; ?>",
        debug: <?php print $site['debug']; ?>,
        description: "<?php print $site['description']; ?>",
        domain: "<?php print $site['domain']; ?>",
		rootDir: "<?php print $site['rootDir']; ?>",
		server: "<?php print $site['server']; ?>",
		title: "<?php print $site['title']; ?>",
	}

})();
</script>


<style>
#map { height: 680px; }
</style>

<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
<!--[if lt IE 9]>
<script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
<![endif]-->
</head>
<body>






<nav class="navbar navbar-expand-lg navbar-light bg-light navbar-light fixed-top">
    <a class="navbar-brand" href="<?php print $site['rootDir']; ?>">Reducing Uncertainty</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarCollapse">
        <ul class="navbar-nav ml-auto">
			<li class="nav-item">
				<a class="nav-link" href="#data-quality">Data Quality</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="#margin-of-error">Margin of Error</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="#regionalization">Regionalization</a>
			</li>
			<li class="nav-item">
				<a class="nav-link" href="#credits">Credits</a>
			</li>
		</ul>
    </div>
</nav>






<div class="container-fluid">
	<div class="header">
		<h2 class="callout">Reducing the Margin of Error in<br>the American Community Survey.</h2>
	</div>
</div>


<div class="container-fluid">
	<div id="presentation">
		<div class="row">

			<div class="col-md-7">
				<div id="map"></div>
			</div>

			<div class="col-md-5">
                <div class="row">
                    <div class="col-12">
                        <form>

                            <div class="form-group">
                                <div class="row">
                                    <div class="col-1 form_icon_col">
                                        <label for="msa_select_box">
                                            <img src="<?php print $site['rootDir']; ?>assets/img/icon-geo-22w.png">
                                        </label>
                                    </div>
                                    <div class="col-11 form_select_col">
                                        <select class="form-control form-control-chosen" id="msa_select_box" data-placeholder="Select a Metropolitan Statistical Area (MSA)"></select>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="row">
                                    <div class="col-1 form_icon_col">
                                        <label for="scenario_select_box">
                                            <img src="<?php print $site['rootDir']; ?>assets/img/icon-bar-graph.png">
                                        </label>
                                    </div>
                                    <div class="col-11 form_select_col">
                                        <select class="form-control form-control-chosen" id="scenario_select_box" data-placeholder="Select an ACS scenario and dataset"></select>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="row">
                                    <div class="col-1 form_icon_col">
                                        <a href="#" title="Download data for this Metropolitan Area" class="download_link" target="_blank">
                                			<img src="<?php print $site['rootDir']; ?>assets/img/icon-download.png">
                                        </a>
                                    </div>
                                    <div class="col-11 form_select_col">
                                        <a href="#" title="Download data for this Metropolitan Area" class="download_link" target="_blank">Download data for this Metropolitan Area</a>
                                        <span class="download_link_meta"></span>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>


                <div class="row">
                    <div class="col-12">
        				<div id="chart-container">
        					<div id="chart">

        						<table class="table-striped table-hover">
        							<thead>
        								<tr>
        									<th class="thTID" title="Tract ID (state.county.tract)">
        										<button class="btn btn-sm btn-outline-secondary">&nbsp;Tract&nbsp;</button>
        									</th>
        									<th class="thRID" title="Region ID">
        										<button class="btn btn-sm btn-light">Region</button>
        									</th>
        									<th class="thEST ">
        										<button class="btn btn-sm btn-outline-secondary">Estimate</button>
        									</th>
        									<th class="thMAR ">
        										<button class="btn btn-sm btn-light">Error</button>
        									</th>
        									<th class="thSVG"></th>
        								</tr>
        							</thead>
                                    <!-- data goes here -->
        							<tbody></tbody>
        						</table>

        					</div>
        				</div>
        			</div>
            	</div>


        	</div>
		</div>
	</div>

    <?php if (0 && site['debug']) { ?>
	<div class="row pt-3 pb-3">
		<div class="col-md-12" id="rawData">
            <h4>Raw data</h4>
            <textarea class="form-control" rows="20" id="rawDataOutput"></textarea>
        </div>
	</div>
    <?php } ?>

</div>




<div class="container">


    <div class="row section" id="data-quality">
        <div class="col-md-6 pt-3 pb-3 max-width-sm">
            <img class="img-fluid" src="<?php print $site['rootDir']; ?>assets/img/section-browser-est-mar.png" alt="Estimate and Margin in the browser">
        </div>
        <div class="col-md-6 pt-3">
            <h3 class="section-title">Data quality and the American Community Survey</h3>

            <p>The <a href="https://www.census.gov/programs-surveys/acs/" target="_blank" title="American Community Survey (ACS)">American Community Survey (ACS)</a> is the largest survey of US households (3.5 million homes contacted each year) and is the principal source for neighborhood scale information about the US population. The ACS is used to allocate billions in federal spending and is a critical input to social scientific research in the US. However, estimates from the ACS can be highly unreliable. For example, in over 72% of census tracts, the estimated number of children under 5 in poverty has a margin of error greater than the estimate (e.g 100 kids in poverty +/- 150). Uncertainty of this magnitude complicates the use of social data in policy making, research, and governance. </p>

            <p>Our project presents a way to reduce the margins of error in survey data via the creation of new geographies, a process called regionalization. Technical details of this paper and example implementations are described in this <a href="http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0115626#abstract0" target="_blank" title="Reducing Uncertainty in the American Community Survey through Data-Driven Regionalization">PLOSOne Paper</a>. This website presents the data from 388 metropolitan statistical areas, before and after the regionalization process, in order to explain, demonstrate, and circulate our <a href="https://github.com/geoss/ACS_Regionalization" target="_blank" title="results and data">results and the data</a>. </p>
        </div>
    </div>




    <div class="row" id="margin-of-error">
        <div class="col-sm-5 order-sm-12 pt-3 pb-3 max-width-sm">
            <img class="img-fluid" src="<?php print $site['rootDir']; ?>assets/img/section-moa.png" alt="Margin of Error">
        </div>
        <div class="col-sm-7 section-text">
            <h3 class="section-title">
                <span class="rwd-line">What is </span>
                <span class="rwd-line">Margin of Error?</span>
            </h3>

            <p>Each ACS estimate has a corresponding margin of error (MOE). The MOE measures how much the estimate might vary relative to the population value, given a certain confidence level. The ACS uses a confidence level of 90%. For example, if the estimate of median household income for a particular census tract is $50,000 with an MOE of $10,000, then we are 90% confident that the actual median household income for that tract is between $40,000 and $60,000. If the MOE was $40,000, than that range would balloon to $10,000 to $90,000, giving us low confidence that the estimate is accurately capturing the actual income level.</p>
        </div>
    </div>



    <div class="row" id="regionalization">
        <div class="col-sm-5 pt-3 pb-3 max-width-sm">
            <img class="img-fluid" src="<?php print $site['rootDir']; ?>assets/img/section-regionalization.png" alt="Regionalization">
        </div>
        <div class="col-sm-7 section-text">
            <h3 class="section-title">Regionalization</h3>

            <p>Regionalization is a process of combining neighboring polygons into “regions” based on a set of goals. In this case the goals are to combine census tracts 1) with similar socioeconomic attributes and 2) so that overall estimate uncertainty is reduced. Joining tracts together increases the sample size and thus generally reduces the overall uncertainty on the estimates for the combined tracts. We continue to combine similar tracts until all the estimates in all the regions have met a data quality threshold.  </p>
        </div>
    </div>


    <div class="row" id="credits">
        <div class="col-sm-5 order-sm-12 pt-3 pb-3 max-width-sm">
            <img class="img-fluid" src="<?php print $site['rootDir']; ?>assets/img/section-code.png" alt="Margin of Error">
        </div>
        <div class="col-sm-7 section-text">
            <h3 class="section-title">
                <span class="rwd-line">Publications</span>
                <span class="rwd-line">& Source code</span>
            </h3>

            <p>Spielman, S., Folch, D. <a href="http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0115626#abstract0" target="_blank" title="Reducing Uncertainty in the American Community Survey through Data-Driven Regionalization">Reducing Uncertainty in the American Community Survey through Data-Driven Regionalization</a>. <em>PLoS ONE</em>, vol. 10, issue 2 (2015) Published by Public Library of Science.</p>

            <p>Data and source code is MIT Licensed and can be accessed at <a href="https://github.com/geoss/ACS_Regionalization" target="_blank" title="results and data">Github</a>.</p>
        </div>
    </div>


</div>




<div class="container-fluid footer-container">
    <div class="container">

        <div class="row section">
            <div class="col-12 pt-3 pb-3">
                <h3 class="section-title">Credits & Support</h3>
            </div>
        </div>

        <div class="row ">
            <div class="col-md-4 pt-3 pb-3">
                <div class="footer-title pb-3">Authors</div>

                <p>Seth E. Spielman, University of Colorado<br>
                David C. Folch, Florida State University<br>
                Becky Davies, data wrangler<br>
                Owen Mundy, website and data visualization</p>

            </div>
            <div class="col-md-4 pt-3 pb-3">
                <div class="footer-title pb-3">Publications</div>

                <p>Spielman, S., Folch, D. <a href="http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0115626#abstract0" target="_blank" title="Reducing Uncertainty in the American Community Survey through Data-Driven Regionalization">Reducing Uncertainty in the American Community Survey through Data-Driven Regionalization</a>. <em>PLoS ONE</em>, vol. 10, issue 2 (2015) Published by Public Library of Science.</p>

            </div>
            <div class="col-md-4 pt-3 pb-3">
                <div class="footer-title pb-3">Source code</div>

                <p>Data and source code is MIT Licensed and can be accessed at <a href="https://github.com/geoss/ACS_Regionalization" target="_blank" title="results and data">Github</a>.</p>

            </div>
        </div>

        <div class="row ">
            <div class="col-12 pt-3">

                <div class="row pt-3">
                    <div class="col-2"></div>
                    <div class="col-3 align-self-center text-right">
                        Produced with support from
                    </div>
                    <div class="col-1 align-self-center">
                        <img class="img-fluid footer-logo" src="<?php print $site['rootDir']; ?>assets/img/footer-logo-nsf.png" alt="CU Boulder">
                    </div>
                    <div class="col-3 align-self-center">
                        <img class="img-fluid footer-logo" src="<?php print $site['rootDir']; ?>assets/img/footer-logo-cu.png" alt="CU Boulder">
                    </div>
                    <div class="col-3"></div>
                </div>

            </div>
        </div>


    </div>
</div>


<script src="<?php print $site['rootDir']; ?>node_modules/jquery/dist/jquery.min.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/historyjs/scripts/bundled/html5/jquery.history.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/chosen-jquery/lib/chosen.jquery.min.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/popper.js/dist/umd/popper.min.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/leaflet/dist/leaflet.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/leaflet-easybutton/src/easy-button.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/d3/build/d3.min.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/d3-color/build/d3-color.min.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/d3-scale-chromatic/dist/d3-scale-chromatic.min.js"></script>
<script src="<?php print $site['rootDir']; ?>node_modules/topojson/dist/topojson.min.js"></script>
<!-- <script src="<?php print $site['rootDir']; ?>node_modules/topojson-client/dist/topojson-client.min.js"></script> -->
<script src="<?php print $site['rootDir']; ?>node_modules/d3-axis/build/d3-axis.min.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/libs/L.TopoJSON.js"></script>

<script src="<?php print $site['rootDir']; ?>data/data-definitions.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/functions.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/config.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/color.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/page.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/menu.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/table.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/data.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/chart-axes.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/chart.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/map.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/main.js"></script>


</body>
</html>
