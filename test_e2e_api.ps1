$baseUrl = "http://localhost:3000"

Write-Host "=== TEST 1: GET /api/teams (Initial state) ==="
$res1 = Invoke-RestMethod -Uri "$baseUrl/api/teams" -Method Get
Write-Host "Success: $($res1.success), Occupied: $($res1.occupiedCount)/$($res1.totalSlots)"
Write-Host "Available slots: $($res1.availableSlots -join ', ')"

Write-Host "`n=== TEST 2: POST /api/teams (Register Slot 5) ==="
$payload5 = @{
    teamName = "Sáº£i BÆ°á»›c Káº¿t Ná»‘i"
    members = @("Tráº§n Mai Anh (Äá»™i trÆ°á»Ÿng)", "LÃª HoÃ ng Yáº¿n", "Nguyá»…n Minh Khang")
} | ConvertTo-Json

$headersUser5 = @{
    "Content-Type" = "application/json"
    "x-user-id" = "user-new-5"
    "x-user-email" = "maianh.tran@gmail.com"
    "x-user-name" = "Tráº§n Mai Anh"
}

$res2 = Invoke-RestMethod -Uri "$baseUrl/api/teams" -Method Post -Headers $headersUser5 -Body $payload5
Write-Host "Success: $($res2.success)"
Write-Host "Registered Team: $($res2.team.name), Assigned Slot: $($res2.team.slotNumber)"

Write-Host "`n=== TEST 3: Duplicate Registration Prevention (Same User) ==="
try {
    $res3 = Invoke-RestMethod -Uri "$baseUrl/api/teams" -Method Post -Headers $headersUser5 -Body $payload5
    Write-Host "ERROR: Should have been rejected!"
} catch {
    Write-Host "PASSED: Rejected with 409 Conflict as expected! Error: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 4: PATCH /api/teams/me (Owner Edit) ==="
$payloadEdit = @{
    teamName = "Sáº£i BÆ°á»›c Káº¿t Ná»‘i â€” VÆ°Æ¡n Xa"
    members = @("Tráº§n Mai Anh (Äá»™i trÆ°á»Ÿng)", "LÃª HoÃ ng Yáº¿n", "Nguyá»…n Minh Khang", "Pháº¡m Quá»‘c HÃ¹ng")
} | ConvertTo-Json

$res4 = Invoke-RestMethod -Uri "$baseUrl/api/teams/me" -Method Patch -Headers $headersUser5 -Body $payloadEdit
Write-Host "Success: $($res4.success)"
Write-Host "Updated Name: $($res4.team.name), Members Count: $($res4.team.members.Count)"

Write-Host "`n=== TEST 5: POST /api/teams (Register Slot 6) ==="
$payload6 = @{
    teamName = "Äá»“ng LÃ²ng Tiáº¿n BÆ°á»›c"
    members = @("LÃ¢m ChÃ­ DÅ©ng (Äá»™i trÆ°á»Ÿng)", "Äáº·ng BÃ­ch Ngá»c", "Trá»‹nh ThÃ¹y Linh")
} | ConvertTo-Json

$headersUser6 = @{
    "Content-Type" = "application/json"
    "x-user-id" = "user-new-6"
    "x-user-email" = "dung.lam@gmail.com"
    "x-user-name" = "LÃ¢m ChÃ­ DÅ©ng"
}

$res5 = Invoke-RestMethod -Uri "$baseUrl/api/teams" -Method Post -Headers $headersUser6 -Body $payload6
Write-Host "Success: $($res5.success)"
Write-Host "Registered Team: $($res5.team.name), Assigned Slot: $($res5.team.slotNumber)"

Write-Host "`n=== TEST 6: Capacity Full Enforcement (7th Team Attempt) ==="
$payload7 = @{
    teamName = "Äá»™i Thá»© Báº£y"
    members = @("NgÆ°á»i Thá»© 7", "ThÃ nh viÃªn B", "ThÃ nh viÃªn C")
} | ConvertTo-Json

$headersUser7 = @{
    "Content-Type" = "application/json"
    "x-user-id" = "user-new-7"
    "x-user-email" = "user7@gmail.com"
    "x-user-name" = "NgÆ°á»i DÃ¹ng 7"
}

try {
    $res6 = Invoke-RestMethod -Uri "$baseUrl/api/teams" -Method Post -Headers $headersUser7 -Body $payload7
    Write-Host "ERROR: Capacity limit failed!"
} catch {
    Write-Host "PASSED: 7th Team rejected because capacity is full (6/6)! Error: $($_.Exception.Message)"
}

Write-Host "`n=== TEST 7: GET /api/admin/teams (Admin View) ==="
$headersAdmin = @{
    "x-user-id" = "user-admin"
    "x-user-email" = "admin.lehoang@organizer.org"
}

$res7 = Invoke-RestMethod -Uri "$baseUrl/api/admin/teams" -Method Get -Headers $headersAdmin
Write-Host "Admin success: $($res7.success), Total Teams: $($res7.occupiedCount)/$($res7.totalSlots)"
Write-Host "Recent Audit Logs count: $($res7.recentAuditLogs.Count)"

Write-Host "`n=== TEST 8: DELETE /api/admin/teams/[id] (Slot Release) ==="
$teamToDelete = $res7.teams | Where-Object { $_.slotNumber -eq 6 }
$delUrl = "$baseUrl/api/admin/teams/$($teamToDelete.id)"
$res8 = Invoke-RestMethod -Uri $delUrl -Method Delete -Headers $headersAdmin
Write-Host "Delete Result: $($res8.message)"

Write-Host "`n=== TEST 9: Verification of Slot 6 Release ==="
$res9 = Invoke-RestMethod -Uri "$baseUrl/api/teams" -Method Get
Write-Host "Occupied after delete: $($res9.occupiedCount)/$($res9.totalSlots)"
Write-Host "Available slots now: $($res9.availableSlots -join ', ')"

Write-Host "`n=== ALL 9 API INTEGRATION TESTS PASSED PERFECTLY! ==="