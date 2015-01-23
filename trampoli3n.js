
// Copyright © 2015, Jeremy Heiner (github.com/JHeiner).
// All rights reserved. See LICENSE file.

"use strict";

function I3() {}
I3.prototype = {
	close: function() {
		if ( ! this.port ) return false;
		this.port.disconnect();
		return delete this.port; },
	open: function() {
		this.close();
		this.port = chrome.runtime.connectNative( this.trampoli3n );
		this.port.onMessage.addListener( this.listener.bind( this ) ); },
	listener: function( message ) {
		console.log( 'i3', message ); },
	ask: function( message ) {
		this.port.postMessage( message ); }
};

var i3 = new I3();
i3.trampoli3n = 'org.i3wm.trampoli3n';

// Local Variables:
// tab-width: 4
// End:
