<?php

// handle rewrites
if ($_SERVER['HTTP_HOST'] == "localhost"){
	$rootDir = "http://localhost/RegionalismMap/code/regionalization-website/";
} else {
	$rootDir = "/";
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Boxplot + Table</title>


<!--
<link href="<?php print $rootDir; ?>vendor/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>vendor/chosen/chosen.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>vendor/leaflet/dist/leaflet.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>vendor/Leaflet.EasyButton/src/easy-button.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>assets/css/chart_styles.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>assets/css/styles.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>assets/font-awesome-4.7.0/css/font-awesome.min.css" rel="stylesheet">
 -->



<link href="<?php print $rootDir; ?>node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>node_modules/chosen-jquery/lib/chosen.min.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>node_modules/leaflet/dist/leaflet.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>node_modules/leaflet-easybutton/src/easy-button.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>node_modules/font-awesome/css/font-awesome.min.css" rel="stylesheet">


<link href="<?php print $rootDir; ?>assets/css/chart_styles.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>assets/css/styles.css" rel="stylesheet">





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


<nav class="navbar navbar-toggleable-md navbar-light bg-faded navbar-static-top mb-4">
	<button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>
	<a class="navbar-brand" href="#">Reducing Uncertainty </a>
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

<h2 class="header_callout">Reducing Uncertainty in the American Community Survey Using Data-Driven Regionalization</h2>


	<div id="presentation">
		<div class="row">
			<div class="col-md-7">
				<div id="map"></div>
			</div>
			<div class="col-md-5">
				<div class="sources clearfix">

					<label for="msa_select_box" title="Select a Metropolitan Statistical Area (MSA)" class="dropdown_left">
							<img src="<?php print $rootDir; ?>assets/img/icon_geo_point.png">
					</label>
					<div class="form-group dropdown_right">
						<select id="msa_select_box" data-placeholder="Select a Metropolitan Statistical Area (MSA)"></select>
					</div>

					<label for="scenario_select_box" title="Select an ACS scenario and dataset" class="dropdown_left">
						<img src="<?php print $rootDir; ?>assets/img/icon_bar_graph.png">
					</label>
					<div class="form-group dropdown_right">
						<select id="scenario_select_box" data-placeholder="Select an ACS scenario and dataset"></select>
					</div>

					<div class="dropdown_left">
						<a title="Download data for this Metropolitan Area">
							<img src="<?php print $rootDir; ?>assets/img/icon_download.png"></a></div>
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

	<div class="row">
		<div class="col-md-12">
			<h4>Raw data</h4>
			<textarea class="form-control" rows="20" id="output"></textarea>
		</div>
	</div>

</div>


<!-- <script src="<?php print $rootDir; ?>vendor/jquery/dist/jquery.min.js"></script>
<script src="<?php print $rootDir; ?>vendor/chosen/chosen.jquery.js"></script>
<script src="<?php print $rootDir; ?>vendor/tether/dist/js/tether.min.js"></script>
<script src="<?php print $rootDir; ?>vendor/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="<?php print $rootDir; ?>vendor/leaflet/dist/leaflet.js"></script>
<script src="<?php print $rootDir; ?>vendor/Leaflet.EasyButton/src/easy-button.js"></script>
<script src="<?php print $rootDir; ?>vendor/d3/d3.min.js"></script>

<script src="https://d3js.org/d3-color.v1.min.js"></script>
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>

<script src="<?php print $rootDir; ?>assets/libs/topojson.v1.min.js"></script>
<script src="<?php print $rootDir; ?>assets/libs/d3-axis.v1.min.js"></script>
<script src="<?php print $rootDir; ?>assets/libs/jquery.history.js"></script>


<script src="<?php print $rootDir; ?>node_modules/jquery-history/dist/jquery.history.min.js"></script>


 -->


<script src="<?php print $rootDir; ?>node_modules/jquery/dist/jquery.min.js"></script>
<script src="<?php print $rootDir; ?>node_modules/historyjs/scripts/bundled/html5/jquery.history.js"></script>
<script src="<?php print $rootDir; ?>node_modules/chosen-jquery/lib/chosen.jquery.min.js"></script>
<script src="<?php print $rootDir; ?>node_modules/popper.js/dist/umd/popper.min.js"></script>
<script src="<?php print $rootDir; ?>node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="<?php print $rootDir; ?>node_modules/leaflet/dist/leaflet.js"></script>
<script src="<?php print $rootDir; ?>node_modules/leaflet-easybutton/src/easy-button.js"></script>
<script src="<?php print $rootDir; ?>node_modules/d3/build/d3.min.js"></script>
<script src="<?php print $rootDir; ?>node_modules/d3-color/build/d3-color.min.js"></script>
<script src="<?php print $rootDir; ?>node_modules/d3-scale-chromatic/dist/d3-scale-chromatic.min.js"></script>
<script src="<?php print $rootDir; ?>node_modules/topojson/dist/topojson.min.js"></script>
<script src="<?php print $rootDir; ?>node_modules/d3-axis/build/d3-axis.min.js"></script>





<script src="<?php print $rootDir; ?>data/data_definitions.js"></script>
<script src="<?php print $rootDir; ?>assets/js/config.js"></script>
<script src="<?php print $rootDir; ?>assets/js/functions.js"></script>
<script src="<?php print $rootDir; ?>assets/js/chart.js"></script>
<script src="<?php print $rootDir; ?>assets/js/map.js"></script>
<script src="<?php print $rootDir; ?>assets/js/main.js"></script>


</body>
</html>
