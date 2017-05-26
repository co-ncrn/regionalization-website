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



<link href="<?php print $rootDir; ?>vendor/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>vendor/chosen/chosen.css" rel="stylesheet">
<link href="<?php print $rootDir; ?>vendor/leaflet/dist/leaflet.css" rel="stylesheet">
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
<div class="container-fluid">

	<h1>
		Select MSA
		<span class="header_links"></span>
	</h1>

	<div class="row">
		<div class="col-md-8">
			<div id="map"></div>
		</div>
		<div class="col-md-4">
			<div class="sources">
				<div class="form-group">
					<label for="msa_select_box">Select a Metropolitan Statistical Area (MSA):</label>
					<select id="msa_select_box" data-placeholder="Select an MSA"></select>
				</div>
				<div class="form-group">
					<label for="scenario_select_box">Select an ACS scenario/dataset:</label>
					<select id="scenario_select_box" data-placeholder="Select a scenario"></select>
				</div>
				
				
			</div>
			<div class="info"></div>
			<textarea class="form-control" rows="30" id="output"></textarea>
		</div>
	</div>

	<div class="row">
		<div class="col-md-12">
			<div id="table"></div>
		</div>
	</div>	

</div>


<script src="<?php print $rootDir; ?>vendor/jquery/dist/jquery.min.js"></script>
<script src="<?php print $rootDir; ?>vendor/chosen/chosen.jquery.js"></script>
<script src="<?php print $rootDir; ?>vendor/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="<?php print $rootDir; ?>vendor/leaflet/dist/leaflet.js"></script>
<script src="<?php print $rootDir; ?>vendor/d3/d3.min.js"></script>

<script src="<?php print $rootDir; ?>assets/js/topojson.v1.min.js"></script>
<script src="<?php print $rootDir; ?>assets/js/d3-axis.v1.min.js"></script>
<script src="<?php print $rootDir; ?>assets/js/jquery.history.js"></script>

<script src="<?php print $rootDir; ?>data/data_definitions.js"></script>
<script src="<?php print $rootDir; ?>assets/js/config.js"></script>
<script src="<?php print $rootDir; ?>assets/js/functions.js"></script>
<script src="<?php print $rootDir; ?>assets/js/main.js"></script>
<script src="<?php print $rootDir; ?>assets/js/map.js"></script>
<!--<script src="assets/js/chart.js"></script>-->

<script></script>


</body>
</html>