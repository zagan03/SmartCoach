# Use Case Diagram

```mermaid
graph LR
    User((User))

    subgraph SmartCoach System
        UC1["Login / Demo Login"]
        UC2["Create Profile"]
        UC3["Edit Profile"]
        UC4["Record Weight"]
        UC5["View Weight Chart"]
        UC6["Edit Weight Entry"]
        UC7["Delete Weight Entry"]
        UC8["Log Workout Session"]
        UC9["View Workout History"]
        UC10["Edit Workout Session"]
        UC11["Delete Workout Session"]
        UC12["Run Nutrition AI Analysis"]
        UC13["Generate Workout Plan (Coach AI)"]
        UC14["View Dashboard"]
        UC15["View Streak Badge"]
    end

    subgraph External Services
        Groq["Groq API<br/>(optional)"]
        PostgreSQL["PostgreSQL<br/>(local)"]
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
    User --> UC10
    User --> UC11
    User --> UC12
    User --> UC13
    User --> UC14
    User --> UC15

    UC12 -.->|"if GROQ_API_KEY"| Groq
    UC13 -.->|"if GROQ_API_KEY"| Groq
    UC1 --> PostgreSQL
    UC2 --> PostgreSQL
    UC4 --> PostgreSQL
    UC8 --> PostgreSQL
    UC12 --> PostgreSQL
    UC13 --> PostgreSQL
```

## Use Cases Description

| Use Case | Actor | Precondition | Postcondition |
|---|---|---|---|
| Login / Demo Login | User | App is running, backend is running | User session stored in localStorage |
| Create Profile | User | User is logged in, no profile exists | Profile saved to `profiles` table |
| Edit Profile | User | User has a profile | Profile updated in DB |
| Record Weight | User | User has a profile | Entry saved to `progress_entries` |
| View Weight Chart | User | User has ≥1 weight entry | Chart rendered with Recharts |
| Log Workout Session | User | User has a profile | Session saved to `workouts` table |
| Run Nutrition AI | User | User has a profile + ≥1 weight entry | Analysis generated, logged in `agent_logs` |
| Generate Workout Plan | User | User has a profile | Plan generated, logged in `agent_logs` |
| View Dashboard | User | User has a profile | Summary of stats, latest data, AI analysis |
