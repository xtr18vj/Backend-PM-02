# Dashboard Service Planning

Dashboard data will be fetched via a single service to avoid multiple API calls.

## DashboardService responsibilities
- Fetch project count
- Fetch task counts
- Compute pending vs completed tasks
- Group tasks by project and user

## Performance Notes
- Use indexes on status, projectId, assignedTo
- Cache dashboard response if data is heavy
