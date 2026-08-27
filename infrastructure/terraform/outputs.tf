# ============================================================
# S3 OUTPUTS
# ============================================================

output "s3_bucket_name" {
  description = "Name of the PokeDex S3 bucket"
  value       = aws_s3_bucket.pokedex.bucket
}

output "s3_bucket_arn" {
  description = "ARN of the PokeDex S3 bucket"
  value       = aws_s3_bucket.pokedex.arn
}

output "aws_region" {
  description = "AWS region used by Terraform"
  value       = aws_s3_bucket.pokedex.region
}


# ============================================================
# CLOUDFRONT OUTPUTS
# ============================================================

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.pokedex.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.pokedex.domain_name
}

output "cloudfront_url" {
  description = "PokeDex CloudFront URL"
  value       = "https://${aws_cloudfront_distribution.pokedex.domain_name}"
}