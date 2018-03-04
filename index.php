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
    // location of all data for site
    'dataDir' => "/data/",
    // to debug or not
    'debug' => true,
    // description: for meta tags, etc.
    'description' => "Reducing the Margin of Error in the American Community Survey",
    // domain for reference
    'domain' => "reducinguncertainty.org",
    // root directory for assets
    'rootDir' => "/",
    // are we running on local or remote server
    'server' => "reducinguncertainty.org",
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
<title>Reducing Uncertainty &ndash; Reducing the Margin of Error in the American Community Survey</title>
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


<!--
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>vendor/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>vendor/chosen/chosen.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>vendor/leaflet/dist/leaflet.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>vendor/Leaflet.EasyButton/src/easy-button.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>assets/css/chart_styles.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>assets/css/styles.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>assets/font-awesome-4.7.0/css/font-awesome.min.css">
 -->

<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400|Roboto+Slab:100">

<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/chosen-jquery/lib/chosen.min.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/leaflet/dist/leaflet.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/leaflet-easybutton/src/easy-button.css">
<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>node_modules/font-awesome/css/font-awesome.min.css">



<link rel="stylesheet" type="text/css" href="<?php print $site['rootDir']; ?>assets/css/chart_styles.css">
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






<nav class="navbar navbar-expand-lg navbar-light bg-light navbar-light">
    <a class="navbar-brand" href="#">Reducing Uncertainty</a>
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

	<div id="presentation">
		<div class="row">
			<div class="col-md-7">
				<div id="map"></div>
			</div>
			<div class="col-md-5">
				<div class="sources clearfix">

					<label for="msa_select_box" title="Select a Metropolitan Statistical Area (MSA)" class="dropdown_left">
							<img src="<?php print $site['rootDir']; ?>assets/img/icon_geo_point.png">
					</label>
					<div class="form-group dropdown_right">
						<select id="msa_select_box" data-placeholder="Select a Metropolitan Statistical Area (MSA)"></select>
					</div>

					<label for="scenario_select_box" title="Select an ACS scenario and dataset" class="dropdown_left">
						<img src="<?php print $site['rootDir']; ?>assets/img/icon_bar_graph.png">
					</label>
					<div class="form-group dropdown_right">
						<select id="scenario_select_box" data-placeholder="Select an ACS scenario and dataset"></select>
					</div>

					<div class="dropdown_left">
						<a title="Download data for this Metropolitan Area">
							<img src="<?php print $site['rootDir']; ?>assets/img/icon_download.png"></a></div>
					<div class="form-group dropdown_right">
						<a href="#" title="placeholder" class="download_link">Download data for this Metropolitan Area</a>

						<!--<a href="#" id="toggle_fullscreen"><i class="fa fa-arrows-alt fa-lg" aria-hidden="true" title="Toggle Fullscreen"></i></a>-->
					</div>

				</div>

				<!--
				<div class=" clearfix">
					<pre class="debug ">

					</pre>
				</div>
				-->

				<div id="chart-container">
					<div id="chart">

						<table class="table-striped table-hover">
							<thead>
								<tr>
									<th class="thTID" title="Tract ID (state.county.tract)">
										<button class="btn btn-sm btn-primary">&nbsp;Tract&nbsp;</button>
									</th>
									<th class="thRID" title="Region ID">
										<button class="btn btn-sm btn-secondary">Region</button>
									</th>
									<th class="thEST ">
										<button class="btn btn-sm btn-primary">Estimate</button>
									</th>
									<th class="thMAR ">
										<button class="btn btn-sm btn-secondary">Error</button>
									</th>
									<th class="thSVG"></th>
								</tr>
							</thead>
							<tbody></tbody>
						</table>

					</div>
				</div>
				<div class="info"></div>

			</div>
		</div>
	</div>

    <?php if (site['debug']) { ?>
	<div class="row">
		<div class="col-md-12" id="rawData">
            <h4>Raw data</h4>
            <textarea class="form-control" rows="20" id="rawDataOutput"></textarea>
        </div>
	</div>
    <?php } ?>

</div>


<!-- <script src="<?php print $site['rootDir']; ?>vendor/jquery/dist/jquery.min.js"></script>
<script src="<?php print $site['rootDir']; ?>vendor/chosen/chosen.jquery.js"></script>
<script src="<?php print $site['rootDir']; ?>vendor/tether/dist/js/tether.min.js"></script>
<script src="<?php print $site['rootDir']; ?>vendor/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="<?php print $site['rootDir']; ?>vendor/leaflet/dist/leaflet.js"></script>
<script src="<?php print $site['rootDir']; ?>vendor/Leaflet.EasyButton/src/easy-button.js"></script>
<script src="<?php print $site['rootDir']; ?>vendor/d3/d3.min.js"></script>

<script src="https://d3js.org/d3-color.v1.min.js"></script>
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>

<script src="<?php print $site['rootDir']; ?>assets/libs/topojson.v1.min.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/libs/d3-axis.v1.min.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/libs/jquery.history.js"></script>


<script src="<?php print $site['rootDir']; ?>node_modules/jquery-history/dist/jquery.history.min.js"></script>


 -->


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
<script src="<?php print $site['rootDir']; ?>node_modules/d3-axis/build/d3-axis.min.js"></script>





<script src="<?php print $site['rootDir']; ?>data/data_definitions.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/config.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/scenario.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/page.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/menu.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/table.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/functions.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/chart-axes.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/chart.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/map.js"></script>
<script src="<?php print $site['rootDir']; ?>assets/js/main.js"></script>


</body>
</html>
