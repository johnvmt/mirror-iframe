(function() {
	if(parent != window) { // Only apply on iframes
		var lastEventPosted = null;
		var lastEventDispatched = null;
		var lastEventDispatchedTag = null;
		var validEventTypes = {
			mouse: ['click', 'mouseup', 'mousedown', 'mousemove'],
			keyboard: ['keydown', 'keyup', 'keypress']
		};

		window.addEventListener('message', function(messageEvent) {
			var sourceEvent = messageEvent.data.event;
			var sourceEventType = eventType(sourceEvent.type);

			if(typeof sourceEventType == 'string' && typeof sourceEvent.targetPath == 'string') { // Event will be triggered
				var eventTarget = document.querySelector(sourceEvent.targetPath);

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

				var event;
				switch(sourceEventType) {
					case 'mouse':
						event = new MouseEvent(sourceEvent.type, generatedEvent);
						break;
					case 'keyboard':
						event = new KeyboardEvent(sourceEvent.type, generatedEvent);
						break;
					default:
						return;
						break;
				}

				lastEventDispatchedTag = messageEvent.data.tag; // Get tags passed through
				lastEventDispatched = event;

				eventTarget.dispatchEvent(event);
			}
		});

		// Override event listener
		var defaultAddEventListener = EventTarget.prototype.addEventListener;
		EventTarget.prototype.addEventListener = function(eventName, eventHandler) {

			if(validEventName(eventName)) { // capture this event
				var eventElement = this;
				defaultAddEventListener.call(eventElement, eventName, function(event) {
					postEventParent(event);
					eventHandler.apply(eventElement, Array.prototype.slice.call(arguments));
				});
			}
			else // do not capture this event
				defaultAddEventListener.call(this, eventName, eventHandler);
		};

		function postEventParent(event) {
			if(lastEventPosted != event) {
				lastEventPosted = event;

				var postEvent = {};

				var property;
				for(property in event) {
					if(['boolean', 'number', 'string'].indexOf(typeof event[property]) >= 0)
						postEvent[property] = event[property];
				}

				// Add X, Y percentages for use when mirroing events to differently-sized element
				if(event.clientX !== undefined)
					postEvent.clientPercentageX = event.clientX / window.innerWidth;
				if(event.clientY !== undefined)
					postEvent.clientPercentageY = event.clientY / window.innerHeight;

				postEvent.targetPath = getDomPath(event.target);

				var postTag = (event == lastEventDispatched) ? lastEventDispatchedTag : undefined;

				parent.postMessage({event: postEvent, tag: postTag}, '*');
			}
		}

		function validEventName(eventName) {
			return eventType(eventName) !== undefined;
		}

		// Returns mouse, keyboard or undefined
		function eventType(eventName) {
			var property;
			for(property in validEventTypes) {
				if(validEventTypes[property].indexOf(eventName) >= 0)
					return property;
			}
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
				if(sibCount > 1)
					stack.unshift(nodeName + ':nth-of-type(' + (sibIndex + 1) + ')');
				else
					stack.unshift(nodeName);
				element = element.parentNode;
				if (element.nodeType === 11) {
					isShadow = true;
					element = element.host;
				}
			}
			stack.splice(0, 1); // removes the html element
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