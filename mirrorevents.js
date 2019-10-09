(function() {
	if(parent !== window) { // Only apply on iframes
		let lastEventPosted = null;
		let lastEventDispatched = null;
		let lastEventDispatchedTag = null;
		let validEventTypes = {
			mouse: ['click', 'mouseup', 'mousedown', 'mousemove'],
			keyboard: ['keydown', 'keyup', 'keypress']
		};

		window.addEventListener('message', function(messageEvent) {
			const sourceEvent = messageEvent.data.event;
			const sourceEventType = eventType(sourceEvent.type);

			if(typeof sourceEventType == 'string' && typeof sourceEvent.targetPath == 'string') { // Event will be triggered
				let eventTarget = document.querySelector(sourceEvent.targetPath);

				let generatedEvent = {
					bubbles: true,
					cancelable: true,
					view: window
				};

				if(typeof sourceEvent.clientPercentageX != 'undefined')
					generatedEvent.clientX = sourceEvent.clientPercentageX * window.innerWidth;

				if(typeof sourceEvent.clientPercentageY != 'undefined')
					generatedEvent.clientY = sourceEvent.clientPercentageY * window.innerHeight;

				generatedEvent = Object.assign({}, sourceEvent, generatedEvent);

				let event;
				switch(sourceEventType) {
					case 'mouse':
						event = new MouseEvent(sourceEvent.type, generatedEvent);
						break;
					case 'keyboard':
						event = new KeyboardEvent(sourceEvent.type, generatedEvent);
						break;
					default:
						return;
				}

				lastEventDispatchedTag = messageEvent.data.tag; // Get tags passed through
				lastEventDispatched = event;

				eventTarget.dispatchEvent(event);
			}
		});

		// Override event listener
		let defaultAddEventListener = EventTarget.prototype.addEventListener;
		EventTarget.prototype.addEventListener = function(eventName, eventHandler) {

			if(validEventName(eventName)) { // capture this event
				let eventElement = this;
				defaultAddEventListener.call(eventElement, eventName, function(event) {
					postEventParent(event);
					eventHandler.apply(eventElement, Array.prototype.slice.call(arguments));
				});
			}
			else // do not capture this event
				defaultAddEventListener.call(this, eventName, eventHandler);
		};

		function postEventParent(event) {
			if(lastEventPosted !== event) {
				lastEventPosted = event;

				let postEvent = {};

				for(let property in event) {
					if(['boolean', 'number', 'string'].indexOf(typeof event[property]) >= 0)
						postEvent[property] = event[property];
				}

				// Add X, Y percentages for use when mirroing events to differently-sized element
				if(event.clientX !== undefined)
					postEvent.clientPercentageX = event.clientX / window.innerWidth;
				if(event.clientY !== undefined)
					postEvent.clientPercentageY = event.clientY / window.innerHeight;

				postEvent.targetPath = getDomPath(event.target);

				let postTag = (event === lastEventDispatched) ? lastEventDispatchedTag : undefined;

				parent.postMessage({event: postEvent, tag: postTag}, '*');
			}
		}

		function validEventName(eventName) {
			return eventType(eventName) !== undefined;
		}

		// Returns mouse, keyboard or undefined
		function eventType(eventName) {
			for(let property in validEventTypes) {
				if(validEventTypes[property].indexOf(eventName) >= 0)
					return property;
			}
		}

		function getDomPath(element) {
			if(!element)
				return;
			let stack = [];
			let isShadow = false;
			while (element.parentNode != null) {
				let sibCount = 0;
				let sibIndex = 0;
				// get sibling indexes
				for(let i = 0; i < element.parentNode.childNodes.length; i++ ) {
					var sib = element.parentNode.childNodes[i];
					if(sib.nodeName === element.nodeName ) {
						if (sib === element )
							sibIndex = sibCount;
						sibCount++;
					}
				}
				let nodeName = element.nodeName.toLowerCase();
				if(isShadow) {
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
	}
})();
