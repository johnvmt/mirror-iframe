(function() {
	if(parent != window) { // Only apply on iframes
		var lastEvent = null;
		var validEventTypes = ['click', 'mouseup', 'mousedown', 'mousemove'];

		window.onload = function() {
			document.querySelector('body').onclick = function(event) {
				if(event != lastEvent)
					postEvent(event);
				lastEvent = event;
			}
		};

		window.addEventListener('message', function(messageEvent) {
			var sourceEvent = messageEvent.data;

			if(typeof sourceEvent.targetPath == 'string') {
				var target = document.querySelector(sourceEvent.targetPath);

				if(typeof sourceEvent.clientPercentageX != 'undefined')
					sourceEvent.clientX = sourceEvent.clientPercentageX * window.innerWidth;

				if(typeof sourceEvent.clientPercentageY != 'undefined')
					sourceEvent.clientY = sourceEvent.clientPercentageY * window.innerHeight;

				if(target != null && typeof sourceEvent.type == 'string' && validEventTypes.indexOf(sourceEvent.type) >= 0) {
					var event = new MouseEvent(sourceEvent.type, {
						bubbles: true,
						cancelable: true,
						view: window,
						screenX: sourceEvent.screenX,
						screenY: sourceEvent.screenY,
						clientX: sourceEvent.clientX,
						clientY: sourceEvent.clientY
					});

					target.dispatchEvent(event);
				}
			}
		});

		// Override event listener
		var defaultAddEventListener = EventTarget.prototype.addEventListener;
		EventTarget.prototype.addEventListener = function(eventName, eventHandler) {
			defaultAddEventListener.call(this, eventName, function(event) {
				if(lastEvent != event && validEventTypes.indexOf(event.type) >= 0) // In an iframe and valid even type to emit
					postEvent(event);
				lastEvent = event;
				eventHandler(event);
			});
		};

		function postEvent(event) {
			var postMessage = {};
			var property;
			for(property in event) {
				if(property[0] == property[0].toLowerCase() && ['boolean', 'number', 'string'].indexOf(typeof event[property]) >= 0)
					postMessage[property] = event[property];
			}

			// Add X, Y percentages for use when mirroing events to differently-sized element
			postMessage.clientPercentageX = event.clientX / window.innerWidth;
			postMessage.clientPercentageY = event.clientY / window.innerHeight;
			postMessage.targetPath = getDomPath(event.target);

			parent.postMessage(postMessage, '*');
		}

		function getDomPath(element) {
			if (!element)
				return;
			var stack = [];
			var isShadow = false;
			while (element.parentNode != null) {
				// console.log(el.nodeName);
				var sibCount = 0;
				var sibIndex = 0;
				// get sibling indexes
				for (var i = 0; i < element.parentNode.childNodes.length; i++ ) {
					var sib = element.parentNode.childNodes[i];
					if (sib.nodeName == element.nodeName ) {
						if (sib === element )
							sibIndex = sibCount;
						sibCount++;
					}
				}
				var nodeName = element.nodeName.toLowerCase();
				if (isShadow) {
					nodeName += "::shadow";
					isShadow = false;
				}
				if ( sibCount > 1 ) {
					stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
				} else {
					stack.unshift(nodeName);
				}
				element = element.parentNode;
				if (element.nodeType === 11) { // for shadow dom, we
					isShadow = true;
					element = element.host;
				}
			}
			stack.splice(0,1); // removes the html element
			return stack.join(' > ');
		}
	}
})();