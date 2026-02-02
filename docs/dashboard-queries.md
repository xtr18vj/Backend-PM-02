# Dashboard Aggregation Queries 

## Total Projects
Fetch all Project records  
Return total count

## Total Tasks
Fetch all Task records  
Return total count

## Completed Tasks
Fetch Task records  
Filter where status is "completed"  
Return count

## Pending Tasks
Fetch Task records  
Filter where status is "pending"  
Return count

## Project-wise Task Count
Fetch Task records  
Group tasks by projectId  
Return count per project

## User-wise Task Count
Fetch Task records  
Group tasks by assignedTo  
Return count per user

## Completed vs Pending Tasks
tasks = getAllTasks()

completedCount = count(tasks where status == "completed")
pendingCount = count(tasks where status == "pending")

return completedCount, pendingCount
