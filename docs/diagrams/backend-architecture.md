# Backend Architecture

This document describes the SmartCoach backend architecture.

The backend is built with:

* Node.js
* Express
* TypeScript
* PostgreSQL
* Optional Groq API integration for the two AI agents

---

## Database schema

```mermaid
erDiagram
    USERS {
        string id PK
        string email
        string password_hash
        datetime created_at
    }

    PROFILES {
        string user_id PK
        string name
        string gender
        float weight
        float height
        int age
        string activity_level
        string goal
        float target_weight
        datetime created_at
    }

    WORKOUTS {
        string id PK
        string user_id
        date workout_date
        string exercises_json
        string notes
        datetime created_at
    }

    PROGRESS_ENTRIES {
        string id PK
        string user_id
        date entry_date
        float weight
        datetime created_at
    }

    AGENT_LOGS {
        string id PK
        string user_id
        string agent_type
        string request_json
        string response_json
        datetime created_at
    }

    USERS ||--|| PROFILES : has_profile
    USERS ||--o{ WORKOUTS : has_workouts
    USERS ||--o{ PROGRESS_ENTRIES : tracks_progress
    USERS ||--o{ AGENT_LOGS : has_agent_logs
```

### Database tables

| Table              | Purpose                                |
| ------------------ | -------------------------------------- |
| `users`            | Stores local authentication data       |
| `profiles`         | Stores user profile and fitness goal   |
| `workouts`         | Stores workout history                 |
| `progress_entries` | Stores weight tracking entries         |
| `agent_logs`       | Stores AI agent requests and responses |

---

## Backend layers

```mermaid
flowchart TD
    Client["React frontend"]

    subgraph Backend["Express backend"]
        Server["server.ts"]
        Routes["Routes"]
        Controllers["Controllers"]
        Services["Services"]
        DbClient["db.ts PostgreSQL pool"]
    end

    Database[("PostgreSQL")]
    Groq["Groq API optional"]

    Client -->|"HTTP JSON requests"| Server
    Server --> Routes
    Routes --> Controllers
    Controllers --> Services
    Controllers --> DbClient
    Services --> DbClient

    DbClient --> Database
    Services -->|"Only for AI agents if key exists"| Groq
```

### Layer responsibilities

| Layer       | Responsibility                                 |
| ----------- | ---------------------------------------------- |
| `server.ts` | Starts Express, configures middleware and CORS |
| Routes      | Defines REST API endpoints                     |
| Controllers | Handles request and response logic             |
| Services    | Contains business logic and AI agent logic     |
| `db.ts`     | Provides the PostgreSQL connection pool        |
| PostgreSQL  | Stores application data                        |
| Groq API    | Optional external LLM provider                 |

---

## Backend modules

```mermaid
flowchart TD
    Routes["Routes layer"]
    Controllers["Controllers layer"]
    Services["Services layer"]
    Database[("PostgreSQL")]
    Groq["Groq API optional"]

    Routes --> AuthRoute["auth.routes.ts"]
    Routes --> ProfileRoute["profile.routes.ts"]
    Routes --> WorkoutsRoute["workouts.routes.ts"]
    Routes --> ProgressRoute["progress.routes.ts"]
    Routes --> AgentsRoute["agents.routes.ts"]

    AuthRoute --> AuthController["auth.controller.ts"]
    ProfileRoute --> ProfileController["profile.controller.ts"]
    WorkoutsRoute --> WorkoutsController["workouts.controller.ts"]
    ProgressRoute --> ProgressController["progress.controller.ts"]
    AgentsRoute --> AgentsController["agents.controller.ts"]

    AuthController --> Database
    ProfileController --> Database
    WorkoutsController --> Database
    ProgressController --> Database

    AgentsController --> WorkoutAgent["workout-agent.service.ts"]
    AgentsController --> NutritionAgent["nutrition-agent.service.ts"]

    WorkoutAgent --> Database
    NutritionAgent --> Database

    WorkoutAgent --> Groq
    NutritionAgent --> Groq
```

---

## REST API endpoints

| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| GET    | `/api/health`                    | Health check                   |
| POST   | `/api/auth/demo-login`           | Demo authentication            |
| POST   | `/api/auth/register`             | Create local account           |
| POST   | `/api/auth/login`                | Local login                    |
| GET    | `/api/profile/:userId`           | Get user profile               |
| PUT    | `/api/profile/:userId`           | Create or update profile       |
| GET    | `/api/workouts/:userId`          | List workout sessions          |
| POST   | `/api/workouts`                  | Create workout session         |
| PUT    | `/api/workouts/:id`              | Update workout session         |
| DELETE | `/api/workouts/:id`              | Delete workout session         |
| GET    | `/api/progress/:userId`          | List weight entries            |
| POST   | `/api/progress`                  | Add weight entry               |
| PATCH  | `/api/progress/:id`              | Update weight entry            |
| DELETE | `/api/progress/:id`              | Delete weight entry            |
| POST   | `/api/agents/workout-coach`      | Run Workout Coach Agent        |
| POST   | `/api/agents/nutrition-progress` | Run Nutrition / Progress Agent |

---

## Request and response flow

```mermaid
flowchart LR
    Frontend["React frontend localhost 5173"]
    Backend["Express backend localhost 3001"]
    Database[("PostgreSQL localhost 5432")]
    Groq["Groq API optional"]

    Frontend -->|"HTTP JSON request"| Backend
    Backend -->|"SQL query"| Database
    Database -->|"Rows"| Backend
    Backend -->|"Optional HTTPS request"| Groq
    Groq -->|"LLM response"| Backend
    Backend -->|"JSON response"| Frontend
```

---

## AI agent backend flow

```mermaid
flowchart TD
    Request["Agent request"]
    Controller["agents.controller"]
    ProfileData["Load profile data"]
    HistoryData["Load history data"]
    Service["Agent service"]
    Decision{"API key available?"}
    Groq["Groq API"]
    Fallback["Local fallback"]
    Logs[("agent_logs")]
    Response["Structured JSON response"]

    Request --> Controller
    Controller --> ProfileData
    Controller --> HistoryData
    ProfileData --> Service
    HistoryData --> Service

    Service --> Decision
    Decision -->|"Yes"| Groq
    Decision -->|"No"| Fallback

    Groq --> Service
    Fallback --> Service

    Service --> Logs
    Service --> Response
```

---

## Summary

The backend follows a simple layered architecture:

1. The React frontend sends HTTP requests to the Express backend.
2. The backend routes each request to a controller.
3. Controllers read and write data through PostgreSQL.
4. Agent controllers call dedicated services for AI functionality.
5. Agent services optionally call Groq when an API key exists.
6. If no API key exists, deterministic fallback logic keeps the demo working.
7. Agent requests and responses are stored in `agent_logs`.

This structure supports both the live demo and the MDS requirement for testable AI agents.