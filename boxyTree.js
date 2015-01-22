
// Copyright © 2015, Jeremy Heiner (github.com/JHeiner).
// All rights reserved. See LICENSE file.

'use strict';

d3.selection.prototype.selectKids = function( selector ) {
	return this.selectAll( function( d, i ) { return this.children; } )
		.filter( selector ); }

i3.diff = false;

i3.fix = function( d, i ) {
	// the trickiest part is handling changes in typeof data values
	// from scalar to aggregate or vice versa...
	var isAggregate = typeof d === 'object' && d !== null;

	// it might be reasonable to assume i3 would never change typeof,
	// but there is really no need to make that assumption. we can
	// just normalize all data values to be aggregate by wrapping any
	// scalar in its own entry under a special key.
	var entries = ( ! isAggregate ) ? [ { key : '', value : d } ]
		: Object.keys( d ).map( function( k ) {
			if ( k === '' ) throw new Error( "empty key found in data" );
			return { key : k, value : d[ k ] }; } );

	// this artifice allows the same d3 update/enter/exit code to
	// handle scalars, aggregates and even typeof changes.

	var node = d3.select( this );
	var isArray = isAggregate && Array.isArray( d );
	node.classed( { 'arr' : isArray, 'obj' : isAggregate && ! isArray } );

	var table = node.selectKids( 'div.tbl' ) .data( [ null ] );
	table.enter().append( 'div' ).classed( 'tbl', true );
	if ( ! table.exit().empty() )
		throw new Error( "table should never exit" );

	var rows = table.selectKids( 'div.row' )
		.data( entries, function( d, i ) { return d.key; } )
		.classed( 'diff', false );
	rows.enter().append( 'div' ).classed( i3.diff ? 'row diff' : 'row', true )
		.each( function( d, i ) {
			var row = d3.select( this );
			if ( d.key !== '' ) row.classed( 'key-'+d.key, true )
				.append( 'span' ).classed( 'key', true ).text( d.key );
			row.append( 'span' ).classed( 'val', true ); } );
	rows.exit().remove();

	rows.each( function( d, i ) {
		var value = d3.select( this ).selectKids( '.val' );
		if ( d.key !== '' )
			value.datum( d.value ).each( i3.fix );
		else {
			var tostr = String( d.value );
			if ( tostr == value.text() )
				value.classed( 'diff', false );
			else {
				value.text( d.value );
				value.classed( 'diff', i3.diff ); } } } ); }

i3.listener = function( data ) {
	i3.data = data; // keep for exploration/debugging
	i3.time = d3.select( '#time' ).text( Date() );
	i3.boxy = d3.select( '#boxy' ).datum( data ).each( i3.fix );
	i3.diff = true; }

window.onload = function( loadEvent ) {
	i3.sheet = Array.prototype.find.call( document.styleSheets,
		function( it ) { return it.title === 'dynamic'; } );
	document.body.onclick = function( clickEvent ) {
		if ( clickEvent.target.className !== 'key' )
			return;
		var hidden = d3.select( '#hidden' );
		if ( ! i3.sheet.rules.length )
			hidden.append( 'span' ).classed( 'unhide', true )
				.text( 'unhide:' )[0][0].onclick = function( unhideEvent ) {
					d3.select( '#hidden' ).html( '' );
					while ( i3.sheet.rules.length )
						i3.sheet.removeRule( 0 ); };
		var name = clickEvent.target.textContent;
		var selector = '.key-'+name;
		hidden[0][0].appendChild( document.createTextNode( ' ' ) );
		hidden.append( 'span' ).classed( 'show', true )
			.text( name )[0][0].onclick = function( showEvent ) {
				var selector = '.key-'+showEvent.target.textContent;
				var index = Array.prototype.findIndex.call( i3.sheet.rules,
					function( it ) { return it.selectorText == selector; } );
				showEvent.target.remove();
				i3.sheet.removeRule( index );
				if ( ! i3.sheet.rules.length )
					d3.select( '#hidden' ).html( '' ); };
		i3.sheet.addRule( selector, 'display: none;' ); };
	for ( var key of ['border','current_border_width','floating','focus',
					  'focused','fullscreen_mode','geometry','last_split_layout',
					  'num','orientation','percent','rect','scratchpad_state',
					  'swallows','type','urgent','window','window_properties',
					  'window_rect','workspace_layout'] )
		document.body.onclick( {target:{className:'key',textContent:key}} );
	i3.open();
	var time = document.getElementById( 'time' );
	time.onclick = function( clickEvent ) { i3.ask( 4 ); }
	time.onclick(); }

// Local Variables:
// tab-width: 4
// End:
