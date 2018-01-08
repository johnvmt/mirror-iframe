# Mirror-Iframe #
A web component that emits interactions with an iframe

## Installation ##

### Bower ###
	
	bower install

### Node ###

	npm install

## Usage ##

	You must include mirrorevents.js in the page whose evnts you want to mirror

	<!DOCTYPE html>
	<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	
		<!-- Polyfill -->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.0.4/webcomponents-lite.js"></script>

		<link rel="import" href="mirror-iframe.html">
	
	</head>
	<body>
		SOURCE
		<div style="width: 500px; height: 300px; display: block; background-color: #00ff00">
			<mirror-iframe id="mirrorsrc" src="my-page.html"></mirror-iframe>
		</div>
		<br />
		SINK
		<div style="width: 500px; height: 300px; display: block; background-color: #00ff00">
			<mirror-iframe id="mirrorsink" src="my-page.html"></mirror-iframe>
		</div>
		<script>
			var mirrorSrc = document.querySelector('#mirrorsrc');
			var mirrorSink = document.querySelector('#mirrorsink');

			mirrorSrc.addEventListener('mirror', function(event) {
				let capturedEvent = event.detail;
				mirrorSink[capturedEvent.function].apply(mirrorSink, capturedEvent.arguments);
			});
		</script>
	</body>
	</html>