class MainView extends Backbone.View
  sorters = {
    'alpha'   : (a,b) -> return a.path.localeCompare(b.path)
    'method'  : (a,b) -> return a.method.localeCompare(b.method)
  }

  initialize: (opts={}) ->
    # set up the UI for input
    @model.auths = []
    for key, value of @model.securityDefinitions
      auth = {name: key, type: value.type, value: value}
      @model.auths.push auth

    if @model.swaggerVersion is "2.0"
      if "validatorUrl" of opts.swaggerOptions
        # Validator URL specified explicitly
        @model.validatorUrl = opts.swaggerOptions.validatorUrl
      else if @model.url.indexOf("localhost") > 0
        # Localhost override
        @model.validatorUrl = null
      else
        # Default validator
        @model.validatorUrl = "http://online.swagger.io/validator"
 
  render: ->
    if @model.securityDefinitions
      for name of @model.securityDefinitions
        auth = @model.securityDefinitions[name]
        if auth.type is "apiKey" and $("#apikey_button").length is 0
          button = new ApiKeyButton({model: auth}).render().el
          $('.auth_main_container').append button
        if auth.type is "basicAuth" and $("#basic_auth_button").length is 0
          button = new BasicAuthButton({model: auth}).render().el
          $('.auth_main_container').append button

    # Render the outer container for resources
    $(@el).html(Handlebars.templates.main(@model))
    
    # Render each Group resource
    group_resources = []
    
    arreglo_group_resources = @getGroupResource()
    
    counter_g = 0
    for clave, group_resource of arreglo_group_resources
      id = group_resource['name']
      while typeof group_resources[id] isnt 'undefined'
        id = id + "_" + counter_g
        counter_g += 1
      group_resource['id'] = id
      group_resources[id] = group_resource
      @addGroupResource group_resource, @model.auths

    $('.propWrap').hover(
      ->
        $('.optionsWrapper', $(this)).show()
      ,->
        $('.optionsWrapper', $(this)).hide()
    )
    @
    
  addGroupResource: (group_resource, auths) ->
    # Render a group resource and add it to groups resources li
    group_resource['id'] = group_resource['id'].replace(/\s/g, '_')
    groupResourceView = new GroupResourceView({
      model: group_resource, 
      tagName: 'li', 
      id: 'group_resource_' + group_resource['id'], 
      className: 'group_resource', 
      auths: auths,
      swaggerOptions: @options.swaggerOptions
    })
    $('#group_resources').append groupResourceView.render().el

  getGroupResource: ->
    # arreglo que contiene los grupos de recursos
    arreglo_group_resources = []
    
    # recorro los recursos
    for resource in @model.apisArray
      id = resource.name.replace(/\s/g, '_')
      group_name = id.split('/')
      
      if typeof group_name[0] isnt 'undefined'
        # busco si ya se encuentra en la lista de grupos
        i = 0
        enc = false
        cant = arreglo_group_resources.length
        while i < cant && !enc
          if arreglo_group_resources[i]['name'] == group_name[0]
            enc = true
          else
            i +=1
        if !enc # si el recurso no esta en un grupo entonces creo el grupo y agrego el recurso
          arreglo_group_resources[i] = []
          arreglo_group_resources[i]['name'] = group_name[0]
          arreglo_group_resources[i]['resources'] = []
          arreglo_group_resources[i]['resources'][arreglo_group_resources[i]['resources'].length] = resource
        else # agrego el recurso al grupo ya creado
          arreglo_group_resources[i]['resources'][arreglo_group_resources[i]['resources'].length] = resource
    
    arreglo_group_resources
    
  clear: ->
    $(@el).html ''
