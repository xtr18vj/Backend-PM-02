```mermaid
erDiagram
  USERS {
    int id PK
    varchar username
    varchar email
    varchar role
  }

  ORGANIZATIONS {
    int id PK
    varchar name
    datetime created_at
  }

  TEAMS {
    int id PK
    varchar name
    int org_id FK
    datetime created_at
  }

  ORGANIZATION_USERS {
    int id PK
    int org_id FK
    int user_id FK
    varchar role_in_org
  }

  USERS ||--o{ ORGANIZATION_USERS : belongs_to
  ORGANIZATIONS ||--o{ ORGANIZATION_USERS : has
  ORGANIZATIONS ||--o{ TEAMS : has
