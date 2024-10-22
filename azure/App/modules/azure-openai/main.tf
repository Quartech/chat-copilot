resource "azurerm_cognitive_account" "example" {
  name = var.name
  location = var.location
  resource_group_name = var.resource_group_name
  kind = "OpenAI"
  sku_name = "S0"
}

resource "azurerm_cognitive_deployment" {
  name = var.name
  coginitive_account_id = var.coginitive_account_id
  model {}
}