output "cluster_name" { value = module.platform.cluster_name }
output "cluster_endpoint" { value = module.platform.cluster_endpoint }
output "node_group_name" { value = module.platform.node_group_name }
output "github_actions_role_arn" { value = module.github_actions.role_arn }
