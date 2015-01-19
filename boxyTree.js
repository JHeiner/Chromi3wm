
d3.selection.prototype.selectKids = function( selector ) {
    return this.selectAll( function( d, i ) { return this.children; } )
	.filter( selector ); }

i3.entries = function( obj ) {
    return Object.keys( obj ).map( function( k ) {
	return { key:k, value:obj[k] }; } ); }

i3.keyOrId = function( d, i ) {
    return d.key || d.id; }

i3.fix = function( d, i ) {
    var n = d3.select( this );
    switch ( typeof( d ) ) {
    case 'boolean': case 'number': case 'string':
	var s = d.toString();
	n.append( 'span' ).classed( s ? 'literal' : 'missing', true )
	    .text( s ? s : '(emptystring)' );
	break;
    case 'object':
	if ( ! d ) {
	    n.append( 'span' ).classed( 'missing', true ).text( '(null)' );
	    break; }
	n.classed( Array.isArray( d ) ? 'arr' : 'obj', true );

	var t = d3.select( this ).selectKids( 'div.table' )
	    .data( [''] );
	t.enter().append( 'div' ).classed( 'tbl', true );

	var rs = t.selectKids( 'div.row' )
	    .data( i3.entries( d ), i3.keyOrId );
	rs.enter().append( 'div' ).classed( 'row', true )
	    .attr( 'key', i3.keyOrId )
	    .each( function( d, i ) {
		var r = d3.select( this );
		r.append( 'span' ).classed( 'key', true ).text( d.key );
		r.append( 'div' ).classed( 'val', true ).datum( d.value ); } );

	rs.selectKids( '.val' ).each( i3.fix );

	break;
    default:
	n.append( 'span' ).classed( 'missing', true ).text( '('+typeof(d)+')' );
	break; } }

i3.listener = function( data ) {
    var i3 = window.i3;
    i3.close();
    i3.data = data;
    d3.select( '#time' ).text( Date() )

    i3.root = d3.select( '#boxy' ).selectKids( 'div' )
	.data( [data], i3.keyOrId );
    i3.root.enter().append( 'div' ).attr( 'key', i3.keyOrId );

    i3.root.each( i3.fix );
}
i3.open();
i3.ask(4);

