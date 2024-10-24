resource "azurerm_cognitive_account" "cognitive_account" {
  name = var.account_name
  location = var.account_location
  resource_group_name = var.resource_group_name
  kind = var.account_kind
  sku_name = var.sku_name
}

resource "azurerm_cognitive_deployment" "cognitive_deployment" {
  for_each = { for record in var.openai_deployments : record.name => record }
  name = each.key
  cognitive_account_id = azurerm_cognitive_account.cognitive_account.id
  model {
    format = "OpenAI"
    name = each.value.model_name
    version = each.value.version
  }
  scale {
    type = each.value.sku_name
  }
}