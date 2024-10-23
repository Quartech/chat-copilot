variable "resource_group_name" {
  type = string
  description = "The name of the resource group"
}

variable "account_kind" {
  type = string
  description = "The type of cognitive account."
   validation {
    condition     = contains(["OpenAI", "ComputerVision"], var.partition_count)
    error_message = "The partition_count must be one of the following values: 1, 2, 3, 4, 6, 12."
  }
}

variable "account_name" {
  type = string
  description = "The name of the Azure Cognitive Services account."
}

variable "account_location" {
  type = string
  description = "Define the region for this Azure Cognitive Services account."
}

variable "openai_deployments" {
  type = list(object({
    name = string
    model_name = string
    version = string
    sku_name = string
  }))
  default = []
  description = "List of Azure OpenAI deployments to create."
}