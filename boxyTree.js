
// Copyright © 2015, Jeremy Heiner (github.com/JHeiner).
// All rights reserved. See LICENSE file.

"use strict";

d3.selection.prototype.selectKids = function( selector ) {
	return this.selectAll( function( d, i ) { return this.children; } )
		.filter( selector ); }

i3.fix = function( d, i ) {
	var n = d3.select( this );
	switch ( typeof( d ) ) {
	case 'boolean': case 'number': case 'string':
		var s = d.toString();
		n.classed( s ? 'literal' : 'missing', true );
		n.text( s ? s : '(emptystring)' );
		break;
	case 'object':
		if ( ! d ) {
			n.classed( 'missing', true );
			n.text( '(null)' );
			break; }

		var arr = Array.isArray( d );
		n.classed( arr ? 'arr' : 'obj', true );

		var t = n.selectKids( 'div.tbl' ).data( [''] );
		t.enter().append( 'div' ).classed( 'tbl', true );

		var es = Object.keys( d ).map( function( k ) {
			return { key : k, value : d[k] }; } );

		var rs = t.selectKids( 'div.row' )
			.data( es, function( d, i ) { return d.key; } );
		rs.enter().append( 'div' ).classed( 'row', true )
			.each( function( d, i ) {
				var r = d3.select( this );
				if ( ! arr ) r.classed( 'key-'+d.key, true );
				r.append( 'span' ).classed( 'key', true ).text( d.key );
				r.append( 'span' ).classed( 'val', true ).datum( d.value ); } );
		rs.selectKids( '.val' ).each( i3.fix );

		break;
	default:
		n.classed( 'missing', true );
		n.text( '('+typeof(d)+')' );
		break; } }

i3.listener = function( data ) {
	var i3 = window.i3;
	i3.close();

	i3.data = data;
	i3.time = d3.select( '#time' );
	i3.boxy = d3.select( '#boxy' );

	i3.time.text( Date() );
	i3.boxy.datum( data );
	i3.boxy.each( i3.fix );
}
i3.open();
i3.ask(4);

// Local Variables:
// tab-width: 4
// End:
