# ER Diagram - Organization & Workspace

```mermaid
erDiagram
  USERS {
    text id PK
    text email UK
    text password_hash
    text name
    text role
    text status
    text profile_photo
    text phone
    text bio
    int is_verified
    text last_login
    text created_at
    text updated_at
  }

  ORGANIZATIONS {
    text id PK
    text name
    text description
    text created_at
    text updated_at
  }

  TEAMS {
    text id PK
    text name
    text org_id FK
    text description
    text created_at
    text updated_at
  }

  ORGANIZATION_USERS {
    text id PK
    text org_id FK
    text user_id FK
    text role_in_org
    text joined_at
  }

  TEAM_USERS {
    text id PK
    text team_id FK
    text user_id FK
    text role_in_team
    text joined_at
  }

  USERS ||--o{ ORGANIZATION_USERS : "belongs to many"
  ORGANIZATIONS ||--o{ ORGANIZATION_USERS : "has many"
  ORGANIZATIONS ||--o{ TEAMS : "has many"
  TEAMS ||--o{ TEAM_USERS : "has many"
  USERS ||--o{ TEAM_USERS : "belongs to many"
```

## Relationships Explained

### One User → Multiple Organizations ✅
- A user can belong to **multiple organizations** through the `organization_users` junction table
- Each mapping has a `role_in_org` (owner, admin, member)

### One Organization → Multiple Teams ✅
- An organization can have **multiple teams** (one-to-many via `org_id` FK)
- When an organization is deleted, all its teams are automatically deleted (CASCADE)

### One User → Multiple Teams ✅
- A user can belong to **multiple teams** through the `team_users` junction table
- Each mapping has a `role_in_team` (lead, member)

### One Team → One Organization ✅
- Each team belongs to **exactly one organization**

## Scalability Considerations

1. **Multi-tenancy Ready**: Users can work across multiple organizations
2. **Flexible Roles**: Separate role systems for org-level and team-level
3. **Clean Deletion**: CASCADE deletes ensure data integrity
4. **Indexed**: Foreign keys are indexed for fast lookups

## API Endpoints

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/organizations | Create organization |
| GET | /api/organizations | List all organizations |
| GET | /api/organizations/:id | Get organization by ID |
| PUT | /api/organizations/:id | Update organization |
| DELETE | /api/organizations/:id | Delete organization |
| POST | /api/organizations/:id/users | Add user to organization |
| GET | /api/organizations/:id/users | List users in organization |
| DELETE | /api/organizations/:id/users/:userId | Remove user from organization |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/teams | Create team |
| GET | /api/teams | List all teams |
| GET | /api/teams/:id | Get team by ID |
| PUT | /api/teams/:id | Update team |
| DELETE | /api/teams/:id | Delete team |
| GET | /api/teams/org/:orgId | Get teams by organization |
| POST | /api/teams/:id/users | Add user to team |
| GET | /api/teams/:id/users | List users in team |
| DELETE | /api/teams/:id/users/:userId | Remove user from team |
