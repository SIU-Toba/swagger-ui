class ParameterContentTypeView extends Backbone.View
  initialize: ->

  render: ->
    template = @template()
    $(@el).html(template(@model))

    $('label[for=parameterContentType]', $(@el)).text('Content type del parámetro:')

    @

  template: ->
    Handlebars.templates.parameter_content_type

