# ============================================================
# S3 BUCKET
# ============================================================

resource "aws_s3_bucket" "pokedex" {
  bucket = "pokedex-frontend-rahul-dev"

  tags = {
    Name        = "PokeDex Frontend"
    Environment = "dev"
    Project     = "PokeDex"
    ManagedBy   = "Terraform"
  }
}


# ============================================================
# S3 VERSIONING
# ============================================================

resource "aws_s3_bucket_versioning" "pokedex" {
  bucket = aws_s3_bucket.pokedex.id

  versioning_configuration {
    status = "Enabled"
  }
}


# ============================================================
# S3 SERVER-SIDE ENCRYPTION
# ============================================================

resource "aws_s3_bucket_server_side_encryption_configuration" "pokedex" {
  bucket = aws_s3_bucket.pokedex.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}


# ============================================================
# S3 PUBLIC ACCESS BLOCK
# ============================================================

resource "aws_s3_bucket_public_access_block" "pokedex" {
  bucket = aws_s3_bucket.pokedex.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


# ============================================================
# CLOUDFRONT ORIGIN ACCESS CONTROL
# ============================================================

resource "aws_cloudfront_origin_access_control" "pokedex" {
  name                              = "pokedex-s3-oac"
  description                       = "Origin Access Control for PokeDex S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}


# ============================================================
# CLOUDFRONT DISTRIBUTION
# ============================================================

resource "aws_cloudfront_distribution" "pokedex" {
  enabled = true

  comment = "PokeDex Frontend Distribution"

  default_root_object = "index.html"

  # ----------------------------------------------------------
  # S3 ORIGIN
  # ----------------------------------------------------------

  origin {
    domain_name              = aws_s3_bucket.pokedex.bucket_regional_domain_name
    origin_id                = "pokedex-s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.pokedex.id
  }

  # ----------------------------------------------------------
  # DEFAULT CACHE BEHAVIOR
  # ----------------------------------------------------------

  default_cache_behavior {
    target_origin_id = "pokedex-s3-origin"

    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  # ----------------------------------------------------------
  # GEO RESTRICTION
  # ----------------------------------------------------------

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # ----------------------------------------------------------
  # HTTPS CERTIFICATE
  # ----------------------------------------------------------

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # ----------------------------------------------------------
  # TAGS
  # ----------------------------------------------------------

  tags = {
    Name        = "PokeDex CloudFront"
    Environment = "dev"
    Project     = "PokeDex"
    ManagedBy   = "Terraform"
  }
}


# ============================================================
# S3 BUCKET POLICY
# Allow CloudFront to read objects from the private S3 bucket
# ============================================================

data "aws_iam_policy_document" "pokedex_bucket_policy" {
  statement {
    sid    = "AllowCloudFrontServicePrincipalReadOnly"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.pokedex.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"

      values = [
        aws_cloudfront_distribution.pokedex.arn
      ]
    }
  }
}


resource "aws_s3_bucket_policy" "pokedex" {
  bucket = aws_s3_bucket.pokedex.id
  policy = data.aws_iam_policy_document.pokedex_bucket_policy.json
}