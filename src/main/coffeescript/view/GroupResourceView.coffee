class GroupResourceView extends Backbone.View
  initialize: (opts={}) ->
    @auths = opts.auths
    @group_model = opts.model
    if "" is @group_model.description 
      @group_model.description = null
    
    
  render: ->
    methods = {}

    #if @model.description?
      #@model.summary = @model.description

    $(@el).html(Handlebars.templates.group_resource(@group_model))
    
    # Render each resource
    resources = {}
    counter = 0
    for resource in @group_model['resources']
      id = resource.name
      while typeof resources[id] isnt 'undefined'
        id = id + "_" + counter
        counter += 1
      resource.id = id
      resources[id] = resource
      @addResource resource, @group_model.auths
    
    $('.toggleResourceList', @el).click(this.callDocs.bind(this, 'toggleResourceListForGroupResource'))
    $('.collapseGroupResource', @el).click(this.callDocs.bind(this, 'collapseResourcesForGroupResource'))
    $('.expandGroupResource', @el).click(this.callDocs.bind(this, 'expandResourcesForGroupResource'))
    
    return @
  
  addResource: (resource, auths) ->
    # Render a resource and add it to resources li
    resource.id = resource.id.replace(/\s/g, '_')
    resourceView = new ResourceView({
      model: resource, 
      tagName: 'li', 
      id: 'resource_' + resource.id, 
      className: 'resource', 
      auths: auths,
      swaggerOptions: @options.swaggerOptions
    })
    $('#resources', $(@el)).append resourceView.render().el
  
  #
  # Generic Event handler (`Docs` is global)
  #

  callDocs: (fnName, e) ->
    e.preventDefault()
    Docs[fnName](e.currentTarget.getAttribute('data-id'))
