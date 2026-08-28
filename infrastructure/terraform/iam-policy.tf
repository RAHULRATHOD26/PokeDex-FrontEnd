# ============================================================
# GITHUB ACTIONS DEPLOYMENT POLICY
# ============================================================

resource "aws_iam_role_policy" "github_actions_deploy" {
  name = "PokeDex-GitHubActions-Deploy-Policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      # ------------------------------------------------------
      # S3 BUCKET ACCESS
      # ------------------------------------------------------

      {
        Sid    = "ListPokeDexBucket"
        Effect = "Allow"

        Action = [
          "s3:ListBucket"
        ]

        Resource = aws_s3_bucket.pokedex.arn
      },

      # ------------------------------------------------------
      # S3 OBJECT ACCESS
      # ------------------------------------------------------

      {
        Sid    = "ManagePokeDexObjects"
        Effect = "Allow"

        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]

        Resource = "${aws_s3_bucket.pokedex.arn}/*"
      },

      # ------------------------------------------------------
      # CLOUDFRONT CACHE INVALIDATION
      # ------------------------------------------------------

      {
        Sid    = "InvalidateCloudFront"
        Effect = "Allow"

        Action = [
          "cloudfront:CreateInvalidation"
        ]

        Resource = aws_cloudfront_distribution.pokedex.arn
      }
    ]
  })
}