variable "resource_group_name" {
  type = string
  description = "The name of the resource group"
}

variable "account_kind" {
  type = string
  description = "The type of cognitive account."
}

variable "account_name" {
  type = string
  description = "The name of the Azure Cognitive Services account."
}

variable "account_location" {
  type = string
  description = "Define the region for this Azure Cognitive Services account."
}

variable "sku_name" {
  type = string
  description = "Define SKU name, like free (F0), standard (S0), etc."
}

variable "openai_deployments" {
  type = list(object({
    name = string
    model_name = string
    version = string
    sku_name = string
    capacity = number
  }))
  default = []
  description = "List of Azure OpenAI deployments to create."
}