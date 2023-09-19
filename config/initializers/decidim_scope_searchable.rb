

Decidim.register_resource(:scope) do |resource|
  resource.model_class_name = "Decidim::Scope"
  #resource.card = "decidim/scope"
  resource.searchable = true
end