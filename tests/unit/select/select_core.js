/*
 * mobile select unit tests
 */

(function($){
	var libName = "jquery.mobile.forms.select.js",
		originalDefaultDialogTrans = $.mobile.defaultDialogTransition,
		originalDefTransitionHandler = $.mobile.defaultTransitionHandler,
		resetHash, closeDialog;

	resetHash = function(timeout){
		$.testHelper.openPage( location.hash.indexOf("#default") >= 0 ? "#" : "#default" );
	};

	closeDialog = function(timeout){
		$.mobile.activePage.find("li a").first().click();
	};

	module(libName, {
		teardown: function(){
			$.mobile.defaultDialogTransition = originalDefaultDialogTrans;
			$.mobile.defaultTransitionHandler = originalDefTransitionHandler;
		}
	});

	asyncTest( "firing a click at least 400 ms later on the select screen overlay does close it", function(){
		$.testHelper.sequence([
			function(){
				// bring up the smaller choice menu
				ok($("#select-choice-few-container a").length > 0, "there is in fact a button in the page");
				$("#select-choice-few-container a").trigger("click");
			},

			function(){
				//select the first menu item
				$("#select-choice-few-menu a:first").click();
			},

			function(){
				same($("#select-choice-few-menu").parent(".ui-selectmenu-hidden").length, 1);
				start();
			}
		], 1000);
	});

	asyncTest( "a large select menu should use the default dialog transition", function(){
		var select;

		$.testHelper.pageSequence([
			resetHash,

			function(timeout){
				select = $("#select-choice-many-container-1 a");

				//set to something else
				$.mobile.defaultTransitionHandler = $.testHelper.decorate({
					fn: $.mobile.defaultTransitionHandler,

					before: function(name){
						same(name, $.mobile.defaultDialogTransition);
					}
				});

				// bring up the dialog
				select.trigger("click");
			},

			closeDialog,

			start
		]);
	});

	asyncTest( "custom select menu always renders screen from the left", function(){
		var select;

		expect( 1 );

		$.testHelper.sequence([
			resetHash,

			function(){
				select = $("ul#select-offscreen-menu");
				$("#select-offscreen-container a").trigger("click");
			},

			function(){
				ok(select.offset().left >= 30, "offset from the left is greater than or equal to 30px" );
				start();
			}
		], 1000);
	});

	asyncTest( "selecting an item from a dialog sized custom select menu leaves no dialog hash key", function(){
		var dialogHashKey = "ui-state=dialog";

		$.testHelper.pageSequence([
			resetHash,

			function(timeout){
				$("#select-choice-many-container-hash-check a").click();
			},

			function(){
				ok(location.hash.indexOf(dialogHashKey) > -1);
				closeDialog();
			},

			function(){
				same(location.hash.indexOf(dialogHashKey), -1);
				start();
			}
		]);
	});

	asyncTest( "dialog sized select menu opened many times remains a dialog", function(){
		var dialogHashKey = "ui-state=dialog",

				openDialogSequence = [
					resetHash,

					function(){
						$("#select-choice-many-container-many-clicks a").click();
					},

					function(){
						ok(location.hash.indexOf(dialogHashKey) > -1, "hash should have the dialog hash key");
						closeDialog();
					}
				],

				sequence = openDialogSequence.concat(openDialogSequence).concat([start]);

		$.testHelper.sequence(sequence, 1000);
	});

	test( "make sure the label for the select gets the ui-select class", function(){
		ok( $( "#native-select-choice-few-container label" ).hasClass( "ui-select" ), "created label has ui-select class" );
	});

	module("Non native menus", {
		setup: function() {
			$.mobile.selectmenu.prototype.options.nativeMenu = false;
		},
		teardown: function() {
			$.mobile.selectmenu.prototype.options.nativeMenu = true;
		}
	});

	asyncTest( "a large select option should not overflow", function(){
		// https://github.com/jquery/jquery-mobile/issues/1338
		var menu, select;

		$.testHelper.sequence([
			resetHash,

			function(){
				select = $("#select-long-option-label");
				// bring up the dialog
				select.trigger("click");
			},

			function() {
				menu = $(".ui-selectmenu-list");

				equal(menu.width(), menu.find("li:nth-child(2) .ui-btn-text").width(), "ui-btn-text element should not overflow");
				start();
			}
		], 500);
	});

	asyncTest( "using custom refocuses the button after close", function() {
		var select, button, triggered = false;

		expect( 1 );

		$.testHelper.sequence([
			resetHash,

			function() {
				select = $("#select-choice-focus-test");
				button = select.find( "a" );
				button.trigger( "click" );
			},

			function() {
				// NOTE this is called twice per triggered click
				button.focus(function() {
					triggered = true;
				});

				$(".ui-selectmenu-screen:not(.ui-screen-hidden)").trigger("click");
			},

			function(){
				ok(triggered, "focus is triggered");
				start();
			}
		], 5000);
	});

	asyncTest( "selected items are highlighted", function(){
		$.testHelper.sequence([
			resetHash,

			function(){
				// bring up the smaller choice menu
				ok($("#select-choice-few-container a").length > 0, "there is in fact a button in the page");
				$("#select-choice-few-container a").trigger("click");
			},

			function(){
				var firstMenuChoice = $("#select-choice-few-menu li:first");
				ok( firstMenuChoice.hasClass( $.mobile.activeBtnClass ),
						"default menu choice has the active button class" );

				$("#select-choice-few-menu a:last").click();
			},

			function(){
				// bring up the menu again
				$("#select-choice-few-container a").trigger("click");
			},

			function(){
				var lastMenuChoice = $("#select-choice-few-menu li:last");
				ok( lastMenuChoice.hasClass( $.mobile.activeBtnClass ),
						"previously slected item has the active button class" );

				// close the dialog
				lastMenuChoice.find( "a" ).click();
			},

			start
		], 1000);
	});

	test( "enabling and disabling", function(){
		var select = $( "select" ).first(), button;

		button = select.siblings( "a" ).first();

		select.selectmenu( 'disable' );
		same( select.attr('disabled'), "disabled", "select is disabled" );
		ok( button.hasClass("ui-disabled"), "disabled class added" );
		same( button.attr('aria-disabled'), "true", "select is disabled" );
		same( select.selectmenu( 'option', 'disabled' ), true, "disbaled option set" );

		select.selectmenu( 'enable' );
		same( select.attr('disabled'), undefined, "select is disabled" );
		ok( !button.hasClass("ui-disabled"), "disabled class added" );
		same( button.attr('aria-disabled'), "false", "select is disabled" );
		same( select.selectmenu( 'option', 'disabled' ), false, "disbaled option set" );
	});

	// https://github.com/jquery/jquery-mobile/issues/2181
	asyncTest( "dialog sized select should alter the value of its parent select", function(){
		var selectButton, value;

		$.testHelper.pageSequence([
			resetHash,

			function(){
				$.mobile.changePage( "cached.html" );
			},

			function(){
				selectButton = $( "#cached-page-select" ).siblings( 'a' );
				selectButton.click();
			},

			function(){
				ok( $.mobile.activePage.hasClass('ui-dialog'), "the dialog came up" );
				var option = $.mobile.activePage.find( "li a" ).not(":contains('" + selectButton.text() + "')").last();
				value = option.text();
				option.click();
			},

			function(){
				same( value, selectButton.text(), "the selected value is propogated back to the button text" );
				start();
			}
		]);
	});

	// https://github.com/jquery/jquery-mobile/issues/2181
	asyncTest( "dialog sized select should prevent the removal of its parent page from the dom", function(){
		var selectButton, parentPageId;

		expect( 2 );

		$.testHelper.pageSequence([
			resetHash,

			function(){
				$.mobile.changePage( "cached.html" );
			},

			function(){
				selectButton = $.mobile.activePage.find( "#cached-page-select" ).siblings( 'a' );
				parentPageId = $.mobile.activePage.attr( 'id' );
				same( $("#" + parentPageId).length, 1, "establish the parent page exists" );
				selectButton.click();
			},

			function(){
				same( $( "#" + parentPageId).length, 1, "make sure parent page is still there after opening the dialog" );
				$.mobile.activePage.find( "li a" ).last().click();
			},

			start
		]);
	});
})(jQuery);
