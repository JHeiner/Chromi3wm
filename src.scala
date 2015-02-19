
import scala.scalajs.js
import js.annotation._
import js.Dynamic.global

@JSExport object Chromi3wm
{
  // http://i3wm.org/docs/ipc.html#_tree_reply

  trait Container extends js.Object {
    val id, current_border_width : Int = js.native
    val name, `type`, border, layout, orientation : String = js.native
    val percent : js.UndefOr[Double] = js.native
    val rect, window_rect, geometry : XYWidthHeight = js.native
    val window : js.UndefOr[Int] = js.native
    val urgent, focused : Boolean = js.native
    val nodes, floating_nodes : js.Array[Container] = js.native }

  trait XYWidthHeight extends js.Object {
    val x, y, width, height : Int = js.native }

  def matches( c:Container, typed:String, named:String, floats:Boolean ) = {
    0 == errors( c, typed, named, floats ).length }

  def require( c:Container, typed:String, named:String, floats:Boolean ) {
    val es = errors( c, typed, named, floats )
    if ( es.length != 0 )
      throw js.JavaScriptException( js.Error( es.join( " && " ) ) ) }

  def errors( c:Container, typed:String, named:String, floats:Boolean ) = {
    val result = new js.Array[String]
    // checking that some impossible stuff didn't happen helps
    // assure that my understanding of I3 IPC is accurate
    if ( null == c )
      result.push( "need object, have null" )
    else if ( "object" != js.typeOf( c ) )
      result.push( "need object, have "+js.typeOf( c ) )
    else {
      val d = c.asInstanceOf[js.Dictionary[js.Any]]
      if ( ! d.contains( "type" ) )
        result.push( "type undefined" )
      else if ( typed != null && typed != c.`type` )
        result.push( "need type "+typed+", have "+c.`type` )
      if ( ! d.contains( "name" ) )
        result.push( "name undefined" )
      else if ( named != null && named != c.name )
        result.push( "need name "+named+", have "+c.name )
      val nodes = d("nodes")
      if ( ! js.Array.isArray( nodes ) )
        result.push( "need nodes array, have "+js.typeOf( nodes ) )
      val floating = d("floating_nodes")
      if ( ! js.Array.isArray( floating ) )
        result.push( "need floats array, have "+js.typeOf( floating ) )
      else if ( ! floats && c.floating_nodes.length > 0 )
        result.push( "floating_nodes not allowed" ) }
    result }

  final val ownerKey = "chromi3wm.owned"
  def ownerView( c:Container ) = c.asInstanceOf[js.Dictionary[Boolean]]
  def isOwned( c:Container ) = ownerView( c ).contains( ownerKey )
  def claimOwned( c:Container ) {
    if ( ! isOwned( c ) ) ownerView( c ).put( ownerKey, true )
    else throw js.JavaScriptException( js.Error( "already owned" ) ) }

  def keyOf( d:js.Dynamic ) = d.key

  // wrap undifferentiated Containers in actual types

  @JSExportAll abstract class WrappedContainer( val c:Container )
  {
    var depth:Int = 0 // these two get filled in for Workspaces
    var parent:js.Any = null // and Tiles by calling d3 hierarchy

    def x1 = c.rect.x ; def dx = c.rect.width ; def x2 = x1 + dx
    def y1 = c.rect.y ; def dy = c.rect.height; def y2 = y1 + dy

    def mark( xm:EdgeMarker, ym:EdgeMarker ) {
      xm.mark( x1, false, depth ) ; xm.mark( x2, true, depth )
      ym.mark( y1, false, depth ) ; ym.mark( y2, true, depth ) }

    def xIn( xf:EdgeFunction ) = x1 + 16 * xf.lo( x1, depth )
    def yIn( yf:EdgeFunction ) = y1 + 16 * yf.lo( y1, depth )
    def wIn( xf:EdgeFunction ) = x2 + 16 * xf.hi( x2, depth ) - xIn( xf )
    def hIn( yf:EdgeFunction ) = y2 + 16 * yf.hi( y2, depth ) - yIn( yf )
  }

  @JSExportAll class Root( c:Container )
      extends WrappedContainer( c )
  {
    require( c, "root", "root", false )
    override def toString = "Root#"+c.id
    val outputs = c.nodes.map{ new Output( _, this ) }
    val workspaces = js.Dictionary.empty[Workspace]
    for ( o <- outputs ; c <- o.content ; w <- c.workspaces )
      workspaces( w.key ) = w

    def render( d3selection:js.Dynamic ) {
      val items = d3selection.selectKids( "li" )
        .data( workspaces.values.to[js.Array], keyOf _ )
      items.exit().remove()
      val added = items.enter().append( "li" )
      added.append( "div" ).classed( "title", true ).text( keyOf _ )
      added.append( "svg" )
      items.each(
        { ( t:js.Any, d:js.Dynamic ) => d.render( t ) }:js.ThisFunction ) }
  }

  @JSExportAll class Output( c:Container, val up:Root )
      extends WrappedContainer( c )
  {
    require( c, "output", null, false )
    override def toString = up+".Output#"+c.id+"'"+c.name+"'"
    val preowned = c.nodes.filter{ isOwned( _ ) }
    val topdock =    unique( "topdock",    { new Dock( _, _ ) } )
    val bottomdock = unique( "bottomdock", { new Dock( _, _ ) } )
    val content    = unique( "content",    { new Content( _, _ ) } )
    val unclaimed = c.nodes.filter{ ! isOwned( _ ) }

    if ( content.isEmpty )
      throw js.JavaScriptException( js.Error( "no content" ) )
    if ( preowned.nonEmpty )
      throw js.JavaScriptException( js.Error( "preowned nodes" ) )
    if ( unclaimed.nonEmpty )
      throw js.JavaScriptException( js.Error( "unclaimed nodes" ) )

    def unique[T]( named:String, build:(Container,Output)=>T ):js.UndefOr[T] = {
      val found = c.nodes.filter{ matches( _, null, named, false ) }
      if ( found.length != 1 ) js.undefined else {
        claimOwned( found(0) ) ; build( found(0), this ) } }
  }

  @JSExportAll class Dock( c:Container, val up:Output )
      extends WrappedContainer( c )
  {
    require( c, "dockarea", null, false )
    override def toString = up+".Dock#"+c.id+"'"+c.name+"'"

    if ( x1 != up.x1 || x2 != up.x2 )
      throw js.JavaScriptException( js.Error( "not full width" ) )
    if ( c.name == "topdock" && ( y1 != up.y1 || y2 >= up.y2 ) )
      throw js.JavaScriptException( js.Error( "topdock not at top" ) )
    if ( c.name == "bottomdock" && ( y1 <= up.y1 || y2 != up.y2 ) )
      throw js.JavaScriptException( js.Error( "bottomdock not at bottom" ) )
  }

  @JSExportAll class Content( c:Container, val up:Output )
      extends WrappedContainer( c )
  {
    require( c, "con", "content", false )
    override def toString = up+".Content#"+c.id+"'"+c.name+"'"
    val workspaces = c.nodes.map{ new Workspace( _, this ) }
  }

  @JSExportAll class Workspace( c:Container, val up:Content )
      extends WrappedContainer( c )
  {
    require( c, "workspace", null, true )
    override def toString = up+".Workspace#"+c.id+"'"+c.name+"'"
    val key = up.up.c.name+"."+c.name
    val tiles = c.nodes.map{ new Tile( _ ) }
    val flat:js.Array[WrappedContainer] = global.d3.layout.hierarchy()
      .children{ p:js.Dynamic => p.tiles }
      .value( null ).sort( null )( this.asInstanceOf[js.Any] )
      .asInstanceOf[js.Array[WrappedContainer]]

    val xMarks, yMarks = new EdgeMarker
    for ( w <- flat ) w.mark( xMarks, yMarks )
    val xFunc = new EdgeFunction( xMarks.compute )
    val yFunc = new EdgeFunction( yMarks.compute )

    def render( liElement:js.Any ) {
      val svg = global.d3.select( liElement ).selectKids( "svg" )
      if ( svg.size() != (1:js.Any) )
        throw js.JavaScriptException( js.Error( "svg" ) )
      val width = wIn( xFunc ) ; val height = hIn( yFunc )
      svg.attr( "width", width / 4 )
        .attr( "height", height / 4 )
        .attr( "viewBox", xIn( xFunc )+" "+yIn( yFunc )+" "+width+" "+height )
      val rs = svg.selectKids( "rect" ).data( flat )
      rs.exit().remove()
      rs.enter().append( "rect" )
      rs.attr( "x", { w:WrappedContainer => w.xIn( xFunc ) } )
        .attr( "y", { w:WrappedContainer => w.yIn( yFunc ) } )
        .attr( "width", { w:WrappedContainer => w.wIn( xFunc ) } )
        .attr( "height", { w:WrappedContainer => w.hIn( yFunc ) } )
    }
  }

  @JSExportAll class Tile( c:Container )
      extends WrappedContainer( c )
  {
    require( c, "con", null, false )
    override def toString = parent+".Tile#"+c.id+"'"+c.name+"'"
    val tiles = c.nodes.map{ new Tile( _ ) }
  }

  @JSExportAll class EdgeDepths( val coord:Int )
  {
    val above, below = js.Dictionary.empty[Int]
    def mark(  hi:Boolean, depth:Int ) {
      ( if ( hi ) below else above )( depth.toString ) = depth }
  }
  @JSExportAll class EdgeNumbers(
    val prev:js.UndefOr[EdgeNumbers],
    depths:EdgeDepths )
  {
    val coord = depths.coord
    val above = depths.above.values.to[js.Array].sort()
    val below = depths.below.values.to[js.Array].sort()

    val first:Int = prev.map{ _.limit }.getOrElse( 0 )
    val origin = first + below.length
    val limit:Int = origin + 1 + above.length
  }
  @JSExportAll class EdgeMarker
  {
    val data = js.Dictionary.empty[EdgeDepths]

    def mark( coord:Int, hi:Boolean, depth:Int ) {
      val key = coord.toString
      data.getOrElseUpdate( key, {
        val edge = new EdgeDepths( coord ) ; data( key ) = edge ; edge
      } ).mark( hi, depth ) }

    def compute = {
      data.values.to[js.Array].sort{
        ( one:EdgeDepths, two:EdgeDepths ) => one.coord - two.coord }
        .scanLeft( js.undefined:js.UndefOr[EdgeNumbers] )
        { new EdgeNumbers( _, _ ) }.jsSlice( 1 )
          .asInstanceOf[js.Array[EdgeNumbers]] }
  }
  @JSExportAll class EdgeFunction( val nums:js.Array[EdgeNumbers] )
  {
    if ( nums.isEmpty )
      throw js.JavaScriptException( js.Error( "no nums" ) )

    def apply( coord:Int, hi:Boolean, depth:Int ):Int = {
      val i = nums.indexWhere{ _.coord >= coord }
      if ( i < 0 || ( i == 0 && nums(0).coord != coord ) )
        throw js.JavaScriptException( js.Error( "out of range" ) )
      val e = nums( i )
      if ( nums.length == 1 ) 0 // empty (e.g. __i3_scratch)
      else if ( coord != e.coord ) e.prev.get.limit // floating between edges
      else if ( depth < 0 ) e.origin // floating exactly on an edge
      else { // normal tile in a non-empty Workspace
        val d = ( if ( hi ) e.below else e.above ).indexOf( depth )
        if ( d < 0 ) throw js.JavaScriptException( js.Error( "out of range" ) )
        if ( hi ) e.origin - d - 1 else e.origin + d + 1 } }

    def lo( coord:Int, depth:Int ) = apply( coord, false, depth )
    def hi( coord:Int, depth:Int ) = apply( coord, true, depth )
  }

  val trampoli3n = "org.i3wm.trampoli3n"

  @JSExportAll class I3
  {
    var port:js.UndefOr[js.Dynamic] = js.undefined
    def close() { port.foreach{ _.disconnect() } ; port = js.undefined }
    def open() { close()
      port = global.chrome.runtime.connectNative( trampoli3n )
      port.get.onDisconnect.addListener( () => port = js.undefined )
      port.get.onMessage.addListener( listener _ ) }

    val menu = global.d3.select( "#menu" )
    val time = global.d3.select( "#time" )
    global.d3.selectAll( js.Array( menu.node(), time.node() ) )
      .on( "click", tree _ )

    val hidden = global.d3.select( "#hidden" )
    val result = global.d3.select( "#result" )
    var data:js.UndefOr[js.Any] = js.undefined
    var root:js.UndefOr[Root] = js.undefined
    var diff = false
    var last = "none"
    var boxy:js.UndefOr[js.ThisFunction] = js.undefined

    def listener( message:js.Any ) {
      data = message ; root = null
      val now = ( new js.Date() ).toJSON()
      global.console.log( "I3.listener", now )
      time.text( now )
      menu.node().value.toString match {
        case "area" =>
          if ( ! js.Array.isArray( message ) )
            global.console.error( "message is not an array", message )
          else {
            val array = message.asInstanceOf[js.Array[js.Any]]
            if ( array.length != 2 || array(0) != (4:js.Any) )
              global.console.error( "unexpected message format", message )
            else {
              if ( last != "area" ) {
	        diff = false
                result.html( "<ul>" )
                hidden.style( "display", "none" )
                last = "area" }
              root = new Root( array(1).asInstanceOf[Container] )
              root.get.render( result.selectKids( "ul" ) ) } }
        case "boxy" =>
          if ( last != "boxy" ) {
            result.html( "<div>" )
            hidden.style( "display", null )
            last = "boxy" }
	  result.selectKids( "div" ).datum( data ).each( boxy )
	  diff = true
        case other =>
          global.console.log( "impossible menu option", other ) } }

    def command( cmd:String )    { ask( 0, cmd ) }
    def subscribe( to:String * ) { ask( 2, to.to[js.Array] ) }
    def bar_config( id:String )  { ask( 6, id ) }

    def workspaces() { ask( 1, "" ) }
    def outputs()    { ask( 3, "" ) }
    def tree()       { ask( 4, "" ) }
    def marks()      { ask( 5, "" ) }
    def bars()       { ask( 6, "" ) }
    def version()    { ask( 7, "" ) }

    def ask( what:Int, payload:js.Any ) {
      if ( port.isEmpty ) open();
      port.get.postMessage( js.Array( what, payload ) ); }

    tree()
  }

  @JSExport val i3 = new I3
}

