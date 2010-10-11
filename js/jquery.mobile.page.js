(function ( $ ) {

$.widget( "mobile.page", $.mobile.widget, {
	options: {},
	
	_create: function() {
		if ( this._trigger( "beforeCreate" ) === false ) {
			return;
		}
		
		//some of the form elements currently rely on the presence of ui-page and ui-content
		// classes so we'll handle page and content roles outside of the main role processing
		// loop below.
		this.element.find( "[data-role=page],[data-role=content]" ).andSelf().each(function() {
			var $this = $( this );
			$this.addClass( "ui-" + $this.data( "role" ) );
		});
		
		this.element.find( "[data-role=nojs]" ).addClass( "ui-nojs" );
		this._enchanceControls();
		
		//pre-find data els
		var $dataEls = this.element.find( "[data-role]" ).andSelf().each(function() {
			var $this = $( this ),
				role = $this.data( "role" ),
				theme = $this.data( "theme" );
			
			//apply theming and markup modifications to page,header,content,footer
			if ( role === "header" || role === "footer" ) {
				$this.addClass( "ui-bar-" + (theme || "a") );
				
				//add ARIA role
				if( role == "header" ){
					$this.attr("role","banner");
				}
				else{
					$this.attr("role","contentinfo");
				}
				
				//right,left buttons
				var $headeranchors = $this.children( "a" ),
					leftbtn = $headeranchors.filter( ".ui-btn-left" ).length,
					rightbtn = $headeranchors.filter( ".ui-btn-right" ).length;
				
				if ( !leftbtn ) {
					leftbtn = $headeranchors.eq( 0 ).addClass( "ui-btn-left" ).length;
				}
				if ( !rightbtn ) {
					rightbtn = $headeranchors.eq( 1 ).addClass( "ui-btn-right" ).length;
				}
				
				//auto-add back btn on pages beyond first view
				if ( $.mobile.addBackBtn && role === "header" && $.mobile.urlStack.length > 1 && !leftbtn && !$this.data( "noBackBtn" ) ) {
					$( "<a href='#' class='ui-btn-left' data-icon='arrow-l'>Back</a>" )
						.tap(function() {
							history.back();
							return false;
						})
						.click(function() {
							return false;
						})
						.prependTo( $this );
				}
				
				$headeranchors.buttonMarkup();
				
				//page title	
				$this.children( ":header" )
					.addClass( "ui-title" )
					.attr( "tabindex" , "0")
					.attr( "role" ,"heading")
					.attr( "aria-level", "1" ); //regardless of h element number in src, it becomes h1 for the enhanced page
			} else if ( role === "page" || role === "content" ) {
				$this.addClass( "ui-body-" + (theme || "c") );
				if( role == "content" ){
					//add ARIA role
					$this.attr("role","main");
				}
			}
			
			switch(role) {
			case "header":
			case "footer":
			case "page":
			case "content":
				$this.addClass( "ui-" + role );
				break;
			case "collapsible":
			case "fieldcontain":
			case "navbar":
			case "listview":
			case "dialog":
			case "ajaxform":
				$this[ role ]();
				break;
			case "controlgroup":
				// FIXME for some reason this has to come before the form control stuff (see above)
				$this.controlgroup();
				break;
			}
		});
		
		//links in bars, or those with data-role become buttons
		$dataEls //MOVETO LINE 
			.filter( "[data-role=button]" )
			.add( ".ui-bar a, .ui-footer a, .ui-header a")
			.not( ".ui-btn" )
			.buttonMarkup();
		
		//links within content areas
		this.element.find( ".ui-body a:not(.ui-btn):not(.ui-link-inherit)" )
			.addClass( "ui-link" );
		
		//fix toolbars
		this.element.fixHeaderFooter();
	},
	
	_enchanceControls: function() {
		// degrade inputs to avoid poorly implemented native functionality
		this.element.find( "input" ).each(function() {
			var type = this.getAttribute( "type" );
			if ( $.mobile.degradeInputs[ type ] ) {
				$( this ).replaceWith(
					$( "<div>" ).html( $(this).clone() ).html()
						.replace( /type="([a-zA-Z]+)"/, "data-type='$1'" ) );
			}
		});
		
		// enchance form controls
		this.element
			.find( ":radio, :checkbox" )
			.customCheckboxRadio();
		this.element
			.find( ":button, :submit, :reset, :image" )
			.not( ".ui-nojs" )
			.customButton();
		this.element
			.find( "input, textarea" )
			.not( ":radio, :checkbox, :button, :submit, :reset, :image" )
			.customTextInput();
		this.element
			.find( "input, select" )
			.filter( "[data-role=slider], [data-type=range]" )
			.slider();
		this.element
			.find( "select" )
			.not( "[data-role=slider]" )
			.customSelect();
	}
});

})( jQuery );
