azure_subscription_id = "b2cba309-26dd-459c-a021-54cb56fe6c49"
azure_tenant_id       = "898fdc18-1bd2-4a3b-84a7-2efb988e3b90"

location = {
  name = "canadacentral",
  region_code = "cnc"
}
location_openai = {
  name = "canadaeast",
  region_code = "cne"
}

project_code = "copilot"

environment = "dev"

kubernetes_azure_subscription_id = "55e460fd-3416-40f4-b548-a6cae492f532"
kubernetes_azure_tenant_id       = "898fdc18-1bd2-4a3b-84a7-2efb988e3b90"
kubernetes_cluster_name          = "aks-pegasus-cnc-shared"
kubernetes_resource_group_name   = "rg-pegasus-cnc-shared-aks"


//database_names = ["UserManagement", "SupervisorNotes", "SystemAdministration", "PersonsSearch"]
cosmosdb_sql_containers = [
  { name = "chatsessions", partition_key_path = "/id" },
  { name = "chatmessages", partition_key_path = "/chatId" },
  { name = "chatmemorysources", partition_key_path = "/chatId" },
  { name = "chatparticipants", partition_key_path = "/chatId" },
  { name = "specialization", partition_key_path = "/id" },
  { name = "chatuser", partition_key_path = "/id" },
  { name = "specializationindex", partition_key_path = "/id" }
]

openai_deployments = [
  {
    name = "gpt-4o-mini",
    model_name = "gpt-4o-mini",
    version = "2024-07-18",
    sku_name = "GlobalStandard",
    capacity = 10
  },
  {
    name = "gpt-4o",
    model_name = "gpt-4o",
    version = "2024-05-13",
    sku_name = "GlobalStandard",
    capacity = 24000
  },
  {
    name = "text-embedding-ada-002",
    model_name = "text-embedding-ada-002",
    version = 2,
    sku_name = "Standard",
    capacity = 120
  }
]

container_names = ["specialization"]
