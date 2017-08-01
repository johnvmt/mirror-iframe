# Mirror-Iframe #
A web component that emits interactions with an iframe

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
		<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.0.4/webcomponents-lite.js"></script>

		<link rel="import" href="mirror-iframe.html">
	
	</head>
	<body>
		<div style="width: 500px; height: 500px; display: block; background-color: #00ff00">
			<mirror-iframe src="my-page.html"></mirror-iframe>
		</div>
		<script>
			var mirrorIframe = document.querySelector('mirror-iframe');
			mirrorIframe.addEventListener('mirror', function(event) {
				console.log(event);
			});
		</script>
	</body>
	</html>