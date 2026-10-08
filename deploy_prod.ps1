$siteId = "2a9fdde7-03f0-45d4-b546-02999d0cd52e"
$token = "nfp_rsJmvMGRW6DFvRf5KEdZkTtHbqosGNBx278f"
$url = "https://api.netlify.com/api/v1/sites/$siteId/deploys"
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/zip" }
Write-Output "Uploading ZIP..."
$response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -InFile dist.zip
$deployId = $response.id
Write-Output "Deployed draft $deployId. Waiting 10 seconds to publish..."
Start-Sleep -Seconds 10
$restoreUrl = "https://api.netlify.com/api/v1/sites/$siteId/deploys/$deployId/restore"
$restoreResponse = Invoke-RestMethod -Uri $restoreUrl -Method Post -Headers @{ "Authorization" = "Bearer $token" }
Write-Output "Published successfully to PROD!"
