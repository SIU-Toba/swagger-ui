'use strict';

SwaggerUi.Views.GroupResourceView = Backbone.View.extend({
  initialize: function(opts) {
    opts = opts || {};
    this.router = opts.router;
    this.auths = opts.auths;
    this.group_model = opts.model;    
    if ('' === this.group_model.description) {
      this.group_model.description = null;
    }
    if (this.model.description) {
      this.model.summary = this.model.description;
    }
    this.number = 0;
  },

  render: function(){
    var methods = {};
    $(this.el).html(Handlebars.templates.group_resource(this.group_model));

    // Render each resource
	var resources = [];
	var counter = 0;
	for (var i = 0; i < this.group_model.resources.length; i++) {
	  var resource = this.group_model.resources[i];      
	  var id = resource.name;
	  while (typeof resources[id] !== 'undefined') {
		id = id + '_' + counter;
		counter += 1;
	  }
	resource.id = id;
	resource.name = id;
	resource.definitions = this.model.definitions;
	resources[id] = resource;
	  
         this.addResource(resource, this.auths);
    }
	
    $('.toggleResourceList', this.el).click(this.callDocs.bind(this, 'toggleResourceListForGroupResource'));
    $('.collapseGroupResource', this.el).click(this.callDocs.bind(this, 'collapseResourcesForGroupResource'));
    $('.expandGroupResource', this.el).click(this.callDocs.bind(this, 'expandResourcesForGroupResource'));

    return this;
  },

  addResource: function(resource, auths) {

    //resource.number = this.number;
    resource.id = resource.id.replace(/\s/g, '_');
    // Render an resource and add it to resources li
    var resourceView = new SwaggerUi.Views.ResourceView({
      model: resource,
      router: this.router,
      id: 'resource_' + resource.id,
      tagName: 'li',
      className: 'resource',
      swaggerOptions: this.options.swaggerOptions,
      auths: auths,
       parent: this
    });

    $('#resources', $(this.el)).append(resourceView.render().el);
    this.number++;
  },
  
  // Generic Event handler (`Docs` is global)


  callDocs: function(fnName, e) {
    e.preventDefault();
    Docs[fnName](e.currentTarget.getAttribute('data-id'));
  }
});
