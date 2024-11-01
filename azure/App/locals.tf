locals {
  standard_name = "${var.project_code}-${var.location.region_code}-app-${var.environment}"
  standard_name_openai = "${var.project_code}-${var.location_openai.region_code}-app-${var.environment}"
  short_name    = "${var.project_code}app${var.environment}"
}