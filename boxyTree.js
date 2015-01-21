
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

i3.open();
i3.ask( 4 );

// Local Variables:
// tab-width: 4
// End:
