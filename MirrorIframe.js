class MirrorIframe extends HTMLElement {
	constructor() {
		super(); // Always call super first in constructor

		const thisElem = this;

		thisElem._emitEvents = true;

		// Gets content from <template>
		const shadow = thisElem.attachShadow({mode: 'open'});

		shadow.innerHTML = `<style>
		:host {
				display: block;
				height: 100%;
				width: 100%;
			}
		</style>
			<div style="display: block; width: 100%; height: 100%;">
				<iframe scrolling="no" style="width: 1px; min-width: 100%; height: 1px; min-height: 100%; display:block; border: 0; padding: 0; margin: 0;"></iframe>
		</div>`;

		thisElem._elements = {};
		thisElem._elements.iframe = shadow.querySelector('iframe');

		// Emit messages passed from iFrame window
		window.addEventListener('message', function(messageEvent) {
			if(thisElem._emitEvents && thisElem._elements.iframeWindow === messageEvent.source && typeof messageEvent.data.event.type === 'string')
				thisElem.emitMirror(messageEvent.data.tag, 'triggerEvent', [messageEvent.data.event])
		});
	}

	connectedCallback() {
		// Set iFrame src (willa lso be set when src attribute changes)
		let thisElem = this;

		thisElem._elements.iframe.onload = function() {
			thisElem._elements.iframeWindow = thisElem._elements.iframe.contentWindow;
		};

		thisElem._elements.iframe.setAttribute('src', this.getAttribute('src'));
	}

	static get observedAttributes() {
		return ['src'];
	}

	attributeChangedCallback(attr, oldVal, newVal) {
		if(attr === 'src')
			this._elements.iframe.setAttribute('src', newVal);
	};

	emitMirror(mirrorTag, functionName, functionArgs) {
		if(typeof functionArgs == 'undefined')
			functionArgs = [];

		let emitMirrorDetail = {function: functionName, arguments: Array.prototype.slice.call(functionArgs)};
		if(typeof mirrorTag != 'undefined')
			emitMirrorDetail.tag = mirrorTag;

		let event = new CustomEvent('mirror', {detail: emitMirrorDetail});
		this.dispatchEvent(event);
	};

	triggerEvent(event, mirrorTag) {
		this._emitEvents = false;
		this._elements.iframeWindow.postMessage({event: event, tag: mirrorTag}, '*');
		this._emitEvents = true;
	};
}

customElements.define('mirror-iframe', MirrorIframe);

export default MirrorIframe;
