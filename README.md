# My Component #
Description

## Installation ##

### Bower ###
	
	bower install

### Node ###

	npm install

## Usage ##

	<!DOCTYPE html>
	<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	
		<!-- Polyfill -->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.7/webcomponents.min.js"></script>

		<link rel="import" href="my-component.html">
	
	</head>
	<body>
		<div style="width: 50%; height: 50%; display: block; background-color: #00ff00">
			<my-component title="My title" subtitle="My subtitle"></my-component>
		</div>
	</body>
	</html>