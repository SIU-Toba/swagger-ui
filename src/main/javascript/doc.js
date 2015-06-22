$(function() {

	// Helper function for vertically aligning DOM elements
	// http://www.seodenver.com/simple-vertical-align-plugin-for-jquery/
	$.fn.vAlign = function() {
		return this.each(function(i){
		var ah = $(this).height();
		var ph = $(this).parent().height();
		var mh = (ph - ah) / 2;
		$(this).css('margin-top', mh);
		});
	};

	$.fn.stretchFormtasticInputWidthToParent = function() {
		return this.each(function(i){
		var p_width = $(this).closest("form").innerWidth();
		var p_padding = parseInt($(this).closest("form").css('padding-left') ,10) + parseInt($(this).closest("form").css('padding-right'), 10);
		var this_padding = parseInt($(this).css('padding-left'), 10) + parseInt($(this).css('padding-right'), 10);
		$(this).css('width', p_width - p_padding - this_padding);
		});
	};

	$('form.formtastic li.string input, form.formtastic textarea').stretchFormtasticInputWidthToParent();

	// Vertically center these paragraphs
	// Parent may need a min-height for this to work..
	$('ul.downplayed li div.content p').vAlign();

	// When a sandbox form is submitted..
	$("form.sandbox").submit(function(){

		var error_free = true;

		// Cycle through the forms required inputs
 		$(this).find("input.required").each(function() {

			// Remove any existing error styles from the input
			$(this).removeClass('error');

			// Tack the error style on if the input is empty..
			if ($(this).val() == '') {
				$(this).addClass('error');
				$(this).wiggle();
				error_free = false;
			}

		});

		return error_free;
	});

});

function clippyCopiedCallback(a) {
  $('#api_key_copied').fadeIn().delay(1000).fadeOut();

  // var b = $("#clippy_tooltip_" + a);
  // b.length != 0 && (b.attr("title", "copied!").trigger("tipsy.reload"), setTimeout(function() {
  //   b.attr("title", "copy to clipboard")
  // },
  // 500))
}

// Logging function that accounts for browsers that don't have window.console
log = function(){
  log.history = log.history || [];
  log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments)[0] );
  }
};

// Handle browsers that do console incorrectly (IE9 and below, see http://stackoverflow.com/a/5539378/7913)
if (Function.prototype.bind && console && typeof console.log == "object") {
    [
      "log","info","warn","error","assert","dir","clear","profile","profileEnd"
    ].forEach(function (method) {
        console[method] = this.bind(console[method], console);
    }, Function.prototype.call);
}

var Docs = {

	shebang: function() {

		// If shebang has an operation nickname in it..
		// e.g. /docs/#!/words/get_search
		var fragments = $.param.fragment().split('/');
		fragments.shift(); // get rid of the bang

		switch (fragments.length) {
			case 1:
                                // Expand all resources for the group resource and scroll to it
				var resource = fragments[0].replace(/\s/g, '_');
                                var group = resource.split('/')
                                var dom_idg = 'group_resource_' + group[0];
                                
				Docs.expandResourceListForGroupResource(group[0]);
				$("#"+dom_idg).slideto({highlight: false});
                                
				// Expand all operations for the resource and scroll to it
				var dom_id = 'resource_' + fragments[0];

				Docs.expandEndpointListForResource(fragments[0]);
				$("#"+dom_id).slideto({highlight: false});
				break;
			case 2:
				// Refer to the endpoint DOM element, e.g. #words_get_search
                                
                                // Expand all resources for the group resource and scroll to it
				var resource = fragments[0].replace(/\s/g, '_');
                                var group = resource.split('/')
                                var dom_idg = 'group_resource_' + group[0];
                                
				Docs.expandResourceListForGroupResource(group[0]);
				$("#"+dom_idg).slideto({highlight: false});
                                
                                // Expand Resource
                                Docs.expandEndpointListForResource(fragments[0]);
                                $("#"+dom_id).slideto({highlight: false});

                                // Expand operation
				var li_dom_id = fragments.join('_');
				var li_content_dom_id = li_dom_id + "_content";
                                
				Docs.expandOperation($('#'+li_content_dom_id));
				$('#'+li_dom_id).slideto({highlight: false});
				break;
                        case 3:
				// Refer to the endpoint DOM element with subresources, e.g. #words_get_search
                                
                                // Expand all resources for the group resource and scroll to it
				var resource = fragments[0].replace(/\s/g, '_');
                                var group = resource.split('/')
                                var dom_idg = 'group_resource_' + group[0];
                                
				Docs.expandResourceListForGroupResource(group[0]);
				$("#"+dom_idg).slideto({highlight: false});
                                
                                // Expand Resource
                                //var dom_id = 'resource_' + fragments[0] + '\/' + fragments[1];
                                Docs.expandEndpointListForResource(fragments[0] + '/' + fragments[1]);
                                $("#"+dom_id).slideto({highlight: false});
                                
                                // Expand operation
				var li_dom_id = Docs.escapeResourceName(fragments[0] + '/' + fragments[1]) + '_' + fragments[2];
                                var li_content_dom_id = li_dom_id + "_content";
                                
				Docs.expandOperation($('#'+li_content_dom_id));
				$('#'+li_dom_id).slideto({highlight: false});
				break;
		}

	},
        
        toggleResourceListForGroupResource: function(group_resource) {
		var elem = $('li#group_resource_' + Docs.escapeGroupResourceName(group_resource) + ' ul.resources');
                if (elem.is(':visible')) {
			Docs.collapseResourceListForGroupResource(group_resource);
		} else {
        		Docs.expandResourceListForGroupResource(group_resource);
		}
	},

	// Expand Group resource
	expandResourceListForGroupResource: function(group_resource) {
		var group_resource = Docs.escapeGroupResourceName(group_resource);
                if (group_resource == '') {
			$('.group_resource ul.resources').slideDown();
			return;
		}
		
		$('li#group_resource_' + group_resource).addClass('group_active');

		var elem = $('li#group_resource_' + group_resource + ' ul.resources');
		elem.slideDown();
	},

	// Collapse Group resource and mark as explicitly closed
	collapseResourceListForGroupResource: function(group_resource) {
		var group_resource = Docs.escapeGroupResourceName(group_resource);
		if (group_resource == '') {
			$('.group_resource ul.resources').slideUp();
			return;
		}

		$('li#group_resource_' + group_resource).removeClass('group_active');

		var elem = $('li#group_resource_' + group_resource + ' ul.resources');
		elem.slideUp();
	},

	expandResourcesForGroupResource: function(group_resource) {
		// Make sure the Group resource container is open..
		Docs.expandResourceListForGroupResource(group_resource);
		
		if (group_resource == '') {
			$('.group_resource ul.resources li.resource div.content').slideDown();
			return;
		}

		$('li#group_resource_' + Docs.escapeGroupResourceName(group_resource) + ' ul.resources div.content').each(function() {
			Docs.expandEndpointListForResource($(this));
		});
	},

	collapseResourcesForGroupResource: function(group_resource) {
		// Make sure the resource container is open..
		Docs.expandResourceListForGroupResource(group_resource);

		if (group_resource == '') {
			$('.group_resource ul.resources li.resource div.content').slideUp();
			return;
		}

		$('li#group_resource_' + Docs.escapeGroupResourceName(group_resource) + ' ul.resources div.content').each(function() {
			Docs.collapseEndpointListForResource($(this));
		});
	},

	escapeGroupResourceName: function(group_resource) {
		return group_resource.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~]/g, "\\$&");
	},

	toggleEndpointListForResource: function(resource) {
		var elem = $('li#resource_' + Docs.escapeResourceName(resource) + ' ul.endpoints');
		if (elem.is(':visible')) {
			Docs.collapseEndpointListForResource(resource);
		} else {
			Docs.expandEndpointListForResource(resource);
		}
	},

	// Expand resource
	expandEndpointListForResource: function(resource) {
		var resource = Docs.escapeResourceName(resource);
                if (resource == '') {
			$('.resource ul.endpoints').slideDown();
			return;
		}
		
		$('li#resource_' + resource).addClass('active');

		var elem = $('li#resource_' + resource + ' ul.endpoints');
		elem.slideDown();
	},

	// Collapse resource and mark as explicitly closed
	collapseEndpointListForResource: function(resource) {
		var resource = Docs.escapeResourceName(resource);
		if (resource == '') {
			$('.resource ul.endpoints').slideUp();
			return;
		}

		$('li#resource_' + resource).removeClass('active');

		var elem = $('li#resource_' + resource + ' ul.endpoints');
		elem.slideUp();
	},

	expandOperationsForResource: function(resource) {
		// Make sure the resource container is open..
		Docs.expandEndpointListForResource(resource);
		
		if (resource == '') {
			$('.resource ul.endpoints li.operation div.content').slideDown();
			return;
		}

		$('li#resource_' + Docs.escapeResourceName(resource) + ' li.operation div.content').each(function() {
			Docs.expandOperation($(this));
		});
	},

	collapseOperationsForResource: function(resource) {
		// Make sure the resource container is open..
		Docs.expandEndpointListForResource(resource);

		if (resource == '') {
			$('.resource ul.endpoints li.operation div.content').slideUp();
			return;
		}

		$('li#resource_' + Docs.escapeResourceName(resource) + ' li.operation div.content').each(function() {
			Docs.collapseOperation($(this));
		});
	},

	escapeResourceName: function(resource) {
            return resource.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~]/g, "\\$&");
	},

	expandOperation: function(elem) {
		elem.slideDown();
	},

	collapseOperation: function(elem) {
		elem.slideUp();
	}
};
