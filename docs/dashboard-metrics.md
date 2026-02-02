Metric	Model / Collection	              Fields                           Used
Total Projects	                          Project	                       _id
Total Tasks	                               Task	                           _id
Completed Tasks	                           Task	                          status
Pending Tasks	                           Task	                          status
Project-wise Tasks	                       Task	                         projectId
User-wise Tasks	                           Task	                        assignedTo

# Dashboard Metrics Planning 

## Total Projects
- Source: Project model
- Logic: count all project records

## Total Tasks
- Source: Task model
- Logic: count all task records

## Completed Tasks
- Source: Task model
- Filter: status = completed

## Pending Tasks
- Source: Task model
- Filter: status = pending

## Project-wise Task Count
- Source: Task model
- Group by: projectId

## User-wise Task Count
- Source: Task model
- Group by: assignedTo
