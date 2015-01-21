
// Copyright © 2015, Jeremy Heiner (github.com/JHeiner).
// All rights reserved. See LICENSE file.

"use strict";

d3.selection.prototype.selectKids = function( selector ) {
	return this.selectAll( function( d, i ) { return this.children; } )
		.filter( selector ); }

i3.fix = function( d, i ) {
	var isKeyed = typeof d === 'object' && d !== null;
	var isPlain = isKeyed && ! Array.isArray( d );
	var entries = ( ! isKeyed )
		? [ { key : '_NeVeR_UsE_ThIs_As_A_KeY_', value : d } ]
		: Object.keys( d ).map( function( k ) {
			if ( k === '_NeVeR_UsE_ThIs_As_A_KeY_' )
				throw new Error( "forbidden key found in data" );
			return { key : k, value : d[k] }; } );

	var table = d3.select( this ).selectKids( 'div.tbl' )
		.data( [ null ] );
	table.enter().append( 'div' ).classed( 'tbl', true );
	if ( ! table.exit().empty() )
		throw new Error( "table should never exit" );
	table.classed( { 'obj' : isPlain, 'arr' : isKeyed && ! isPlain } );

	var rows = table.selectKids( 'div.row' )
		.data( entries, function( d, i ) { return d.key; } );
	rows.each( function( d, i ) {
		if ( d.key === '_NeVeR_UsE_ThIs_As_A_KeY_' )
			d3.select( this ).selectKids( '.val' ).text( d.value );
		else
			d3.select( this ).selectKids( '.val' ).datum( d.value ).each( i3.fix ); } );
	rows.enter().append( 'div' ).classed( 'row', true ).each( function( d, i ) {
		var row = d3.select( this );
		if ( isPlain ) row.classed( 'key-'+d.key, true );
		if ( d.key === '_NeVeR_UsE_ThIs_As_A_KeY_' ) {
			row.append( 'span' ).classed( 'val', true ).text( d.value ); }
		else {
			row.append( 'span' ).classed( 'key', true ).text( d.key );
			row.append( 'span' ).classed( 'val', true ).datum( d.value ).each( i3.fix ); } } );
	rows.exit().remove(); }

i3.listener = function( data ) {
	var i3 = window.i3;

	i3.data = data;
	i3.time = d3.select( '#time' );
	i3.boxy = d3.select( '#boxy' );

	i3.time.text( Date() );
	i3.boxy.datum( data );
	i3.boxy.each( i3.fix ); }

i3.open();
i3.ask( 4 );

// Local Variables:
// tab-width: 4
// End:
