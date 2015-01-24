
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
		this.port.onDisconnect.addListener( this.disconnected.bind( this ) );
		this.port.onMessage.addListener( this.listener.bind( this ) ); },

	disconnected: function() {
		delete this.port;
		console.log( 'i3 disconnected' ); },
	listener: function( message ) {
		console.log( 'i3', message ); },

	command:    function( cmd ) { this.ask( [ 0, cmd ] ); },
	subscribe:  function( to )  { this.ask( [ 2, to ] ); },
	bar_config: function( id )  { this.ask( [ 6, id ] ); },

	workspaces: function() { this.ask( [ 1, '' ] ); },
	outputs:    function() { this.ask( [ 3, '' ] ); },
	tree:       function() { this.ask( [ 4, '' ] ); },
	marks:      function() { this.ask( [ 5, '' ] ); },
	bars:       function() { this.ask( [ 6, '' ] ); },
	version:    function() { this.ask( [ 7, '' ] ); },

	ask: function( message ) {
		if ( ! this.port ) this.open();
		this.port.postMessage( message ); }
};

var i3 = new I3();
i3.trampoli3n = 'org.i3wm.trampoli3n';

// Local Variables:
// tab-width: 4
// End:
