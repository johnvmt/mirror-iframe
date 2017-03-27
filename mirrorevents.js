(function() {
	if(parent != window) { // Only apply on iframes
		var lastEventPosted = null;
		var lastEventDispatched = null;
		var lastEventDispatchedTag = null;
		var validEventTypes = ['click', 'mouseup', 'mousedown', 'mousemove'];

		window.onload = function() {
			document.querySelector('body').onclick = function(event) {
				if(event != lastEventPosted)
					postEvent(event);
				lastEventPosted = event;
			}
		};

		window.addEventListener('message', function(messageEvent) {
			var sourceEvent = messageEvent.data.event;

			if(typeof sourceEvent.targetPath == 'string') {
				var target = document.querySelector(sourceEvent.targetPath);

				var generatedEvent = {
					bubbles: true,
					cancelable: true,
					view: window
				};

				if(typeof sourceEvent.clientPercentageX != 'undefined')
					generatedEvent.clientX = sourceEvent.clientPercentageX * window.innerWidth;

				if(typeof sourceEvent.clientPercentageY != 'undefined')
					generatedEvent.clientY = sourceEvent.clientPercentageY * window.innerHeight;

				generatedEvent = objectMerge(sourceEvent, generatedEvent);

				if(target != null && typeof sourceEvent.type == 'string' && validEventTypes.indexOf(sourceEvent.type) >= 0) {
					var event = new MouseEvent(sourceEvent.type, generatedEvent);

					lastEventDispatchedTag = messageEvent.data.tag; // Get tags passed through
					lastEventDispatched = event;

					target.dispatchEvent(event);
				}
			}
		});

		// Override event listener
		var defaultAddEventListener = EventTarget.prototype.addEventListener;
		EventTarget.prototype.addEventListener = function(eventName, eventHandler) {
			defaultAddEventListener.call(this, eventName, function(event) {
				if(lastEventPosted != event && validEventTypes.indexOf(event.type) >= 0)// In an iframe and valid even type to emit
					postEventParent(event);
				lastEventPosted = event;
				eventHandler(event);
			});
		};

		function postEventParent(event) {
			var postEvent = {};
			var postTag = (event == lastEventDispatched) ? lastEventDispatchedTag : undefined;

			var property;
			for(property in event) {
				if(property[0] == property[0].toLowerCase() && ['boolean', 'number', 'string'].indexOf(typeof event[property]) >= 0)
					postEvent[property] = event[property];
			}

			// Add X, Y percentages for use when mirroing events to differently-sized element
			postEvent.clientPercentageX = event.clientX / window.innerWidth;
			postEvent.clientPercentageY = event.clientY / window.innerHeight;
			postEvent.targetPath = getDomPath(event.target);

			parent.postMessage({event: postEvent, tag: postTag}, '*');
		}

		function getDomPath(element) {
			if (!element)
				return;
			var stack = [];
			var isShadow = false;
			while (element.parentNode != null) {
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

		function objectMerge() {
			var merged = {};
			objectForEach(arguments, function(argument) {
				for (var attrname in argument) {
					if(argument.hasOwnProperty(attrname))
						merged[attrname] = argument[attrname];
				}
			});
			return merged;
		}

		function objectForEach (object, callback) {
			// run function on each property (child) of object
			var property;
			for(property in object) { // pull keys before looping through?
				if (object.hasOwnProperty(property))
					callback(object[property], property, object);
			}
		}
	}
})();