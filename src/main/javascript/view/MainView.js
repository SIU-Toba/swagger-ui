'use strict';

SwaggerUi.Views.MainView = Backbone.View.extend({
  apisSorter : {
    alpha   : function(a,b){ return a.name.localeCompare(b.name); }
  },
  operationsSorters : {
    alpha   : function(a,b){ return a.path.localeCompare(b.path); },
    method  : function(a,b){ return a.method.localeCompare(b.method); }
  },
  initialize: function(opts){
    var sorterOption, sorterFn, key, value;
    opts = opts || {};

    this.router = opts.router;

    // Sort APIs
    if (opts.swaggerOptions.apisSorter) {
      sorterOption = opts.swaggerOptions.apisSorter;
      if (_.isFunction(sorterOption)) {
        sorterFn = sorterOption;
      } else {
        sorterFn = this.apisSorter[sorterOption];
      }
      if (_.isFunction(sorterFn)) {
        this.model.apisArray.sort(sorterFn);
      }
    }
    // Sort operations of each API
    if (opts.swaggerOptions.operationsSorter) {
      sorterOption = opts.swaggerOptions.operationsSorter;
      if (_.isFunction(sorterOption)) {
        sorterFn = sorterOption;
      } else {
        sorterFn = this.operationsSorters[sorterOption];
      }
      if (_.isFunction(sorterFn)) {
        for (key in this.model.apisArray) {
          this.model.apisArray[key].operationsArray.sort(sorterFn);
        }
      }
    }

    // set up the UI for input
    this.model.auths = [];

    for (key in this.model.securityDefinitions) {
      value = this.model.securityDefinitions[key];

      this.model.auths.push({
        name: key,
        type: value.type,
        value: value
      });
    }

    if ('validatorUrl' in opts.swaggerOptions) {
      // Validator URL specified explicitly
      this.model.validatorUrl = opts.swaggerOptions.validatorUrl;
    } else if (this.model.url.indexOf('localhost') > 0 || this.model.url.indexOf('127.0.0.1') > 0) {
      // Localhost override
      this.model.validatorUrl = null;
    } else {
      this.model.validatorUrl = '//online.swagger.io/validator';
    }

    // JSonEditor requires type='object' to be present on defined types, we add it if it's missing
    // is there any valid case were it should not be added ?
    var def;
    for(def in this.model.definitions){
      if (!this.model.definitions[def].type){
        this.model.definitions[def].type = 'object';
      }
    }

  },

  render: function () {
    $(this.el).html(Handlebars.templates.main(this.model));
    this.info = this.$('.info')[0];

    if (this.info) {
      this.info.addEventListener('click', this.onLinkClick, true);
    }

    this.model.securityDefinitions = this.model.securityDefinitions || {};


   var group_resources = [];    
   var arreglo_group_resources = this.getGroupResource();
   var counter_g = 0;
   
    // Render each resource
    for (var i=0; i < arreglo_group_resources.length; i++) {
	var group_resource = arreglo_group_resources[i];
	var id = group_resource.name;
	while (typeof group_resources[id] !== 'undefined') {
		id = id + '_' + counter_g;
		counter_g += 1;
	}
	group_resource.id = id;
	group_resource.definitions = this.model.definitions;
	group_resources[id] = group_resource;
	this.addGroupResource(group_resource, this.model.auths);
	return this;
   }

    $('.propWrap').hover(function onHover(){
      $('.optionsWrapper', $(this)).show();
    }, function offhover(){
      $('.optionsWrapper', $(this)).hide();
    });
    return this;
  },

  addGroupResource: function(group_resource, auths) {
    // Render a resource and add it to resources li
    group_resource.id = group_resource.id.replace(/[^a-zA-Z\d]/g, function(str) { return str.charCodeAt(0); });

    // Make all definitions available at the root of the resource so that they can
    // be loaded by the JSonEditor
    group_resource.definitions = this.model.definitions;
    var groupResourceView = new SwaggerUi.Views.GroupResourceView({
      model: group_resource,
      router: this.router,
      tagName: 'li',
      id: 'group_resource_' + group_resource.id,
      className: 'group_resource',
      auths: auths,
      swaggerOptions: this.options.swaggerOptions
    });
    
    $('#group_resources', this.el).append(groupResourceView.render().el);
  },

  clear: function(){
    $(this.el).html('');
  },

  onLinkClick: function (e) {
    var el = e.target;

    if (el.tagName === 'A' && el.href && !el.target) {
        e.preventDefault();
        window.open(el.href, '_blank');
    }
  },
  
 getGroupResource: function() {
	  // arreglo que contiene los grupos de recursos
	  var arreglo_group_resources = [];
	  for (var i = 0; i < this.model.apisArray.length; i++) {
		var resource = this.model.apisArray[i];
		var id = resource.name.replace(/\s/g, '_');
		var group_name = id.split('/');
		if (typeof group_name[0] !== 'undefined') {
			// busco si ya se encuentra en la lista de grupos
			var index = 0, resource_count=0;
			var enc = false;
			var cant = arreglo_group_resources.length;
			while (index < cant && ! enc) {
				if (arreglo_group_resources[index].name == group_name[0])
					enc = true;
				else
					index +=1;
			}
			if (!enc) { // si el recurso no esta en un grupo entonces creo el grupo y agrego el recurso
				resource_count = 0;
				arreglo_group_resources[index] = {};
				arreglo_group_resources[index].name = group_name[0];
				arreglo_group_resources[index].resources = [];				
			} else { // agrego el recurso al grupo ya creado
				resource_count = arreglo_group_resources[index].resources.length;				
			}
			arreglo_group_resources[index].resources[resource_count] = resource;
		};		
	  };
	  return arreglo_group_resources;
  }
});
