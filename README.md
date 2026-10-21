# Lab reproduction, security research

Not a product. This repository reproduces one decision path from
`elastic/terraform-provider-elasticstack` so that a reported approval-eligibility
gap can be demonstrated end to end without touching Elastic infrastructure.

`.github/scripts/workflows/lib/classify-pr.js` and `select-change.js` are copied
verbatim at commit b26cfcc426523f629b6a8604861932b519f1a517. Nothing in them is
modified. See `.github/workflows/openspec-verify-label.yml` for what is faithful
and what is substituted.
