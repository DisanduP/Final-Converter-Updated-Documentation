# Test Fixtures

This directory contains sample Mermaid diagrams and test data used for testing the converter.

## Simple Flowchart

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
```

## Complex Flowchart

```mermaid
flowchart TD
    A[User Request] --> B[Validate Input]
    B --> C{Valid?}
    C -->|Yes| D[Process Request]
    C -->|No| E[Return Error]

    D --> F{Requires Auth?}
    F -->|Yes| G[Check Permissions]
    F -->|No| H[Execute Action]

    G --> I{Has Permission?}
    I -->|Yes| H
    I -->|No| J[Access Denied]

    H --> K{Action Successful?}
    K -->|Yes| L[Return Success]
    K -->|No| M[Handle Error]

    E --> N[Log Error]
    J --> N
    M --> N
    L --> O[End]
    N --> O
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant D as Database
    participant C as Cache

    U->>A: POST /convert
    A->>A: Validate request
    A->>C: Check cache
    C-->>A: Cache miss

    A->>D: Store conversion job
    D-->>A: Job ID

    A->>A: Start conversion
    A->>A: Render with Playwright
    A->>A: Generate Draw.io XML

    A->>D: Update job status
    A->>C: Cache result

    A-->>U: Return Draw.io file
```

## Class Diagram

```mermaid
classDiagram
    class Converter {
        +convert(input: string): Promise<DrawioResult>
        +validate(input: string): boolean
        -renderDiagram(): Promise<string>
        -generateXML(): string
    }

    class FileProcessor {
        +processFile(inputPath: string, outputPath: string): Promise<void>
        +processDirectory(inputDir: string, outputDir: string): Promise<void>
        -validatePaths(): boolean
    }

    class BatchProcessor {
        +processBatch(files: string[]): Promise<BatchResult>
        -manageConcurrency(): void
        -handleErrors(): void
    }

    Converter <|-- FileProcessor
    Converter <|-- BatchProcessor

    class DrawioResult {
        +content: string
        +metadata: object
        +success: boolean
    }

    Converter --> DrawioResult
```

## Gantt Chart

```mermaid
gantt
    title Mermaid to Draw.io Converter Development
    dateFormat YYYY-MM-DD
    section Planning
    Requirements gathering    :done, req, 2024-01-01, 2024-01-15
    Architecture design       :done, arch, after req, 10d
    Technology selection      :done, tech, after arch, 5d

    section Development
    Core converter            :done, core, 2024-01-20, 2024-02-15
    File processor            :done, file, 2024-02-01, 2024-02-20
    Batch processing          :done, batch, after file, 10d
    Web interface             :active, web, 2024-02-15, 2024-03-15

    section Testing
    Unit tests                :done, unit, 2024-02-10, 2024-02-25
    Integration tests         :done, integ, after unit, 10d
    E2E tests                 :active, e2e, after integ, 15d

    section Deployment
    CI/CD setup              :done, ci, 2024-02-20, 2024-03-01
    Documentation            :active, docs, 2024-02-25, 2024-03-20
    Production deployment    :planned, prod, after docs, 5d
```

## Pie Chart

```mermaid
pie title Conversion Success Rates
    "Successful" : 85
    "Failed - Syntax Error" : 10
    "Failed - Timeout" : 3
    "Failed - Browser Error" : 2
```

## State Diagram

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing : convert()
    Processing --> Success : conversion_complete
    Processing --> Error : conversion_failed

    Success --> [*]
    Error --> Idle : retry()
    Error --> [*] : cancel()

    note right of Processing
        Conversion in progress
        Using Playwright browser
    end note

    note right of Error
        Handle different error types:
        - Syntax errors
        - Timeout errors
        - Browser errors
    end note
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ CONVERSION_JOB : creates
    CONVERSION_JOB ||--|| CONVERSION_RESULT : produces
    CONVERSION_JOB {
        string id PK
        string user_id FK
        string input_format
        string output_format
        datetime created_at
        datetime updated_at
        string status
    }
    CONVERSION_RESULT {
        string id PK
        string job_id FK
        text content
        json metadata
        bigint file_size
        datetime created_at
    }
    USER {
        string id PK
        string email
        string name
        datetime created_at
    }
```

## Mind Map

```mermaid
mindmap
  root((Mermaid Converter))
    Features
      Multiple Formats
        Flowchart
        Sequence
        Class
        Gantt
        Pie
        State
        ER
      Batch Processing
        Directory Scan
        Concurrent Conversion
        Progress Tracking
      Validation
        Syntax Check
        Auto-fix
        Error Reporting
    Technologies
      Node.js
        Express
        File System
      Playwright
        Browser Automation
        Multiple Browsers
      Mermaid.js
        Diagram Parsing
        Rendering Engine
    Deployment
      Docker
        Containerization
        Multi-platform
      CI/CD
        GitHub Actions
        Automated Testing
      Cloud
        AWS
        Vercel
        Railway
```

## Kanban Board

```mermaid
kanban
    Todo
        Add error handling
        Implement caching
        Write documentation
        Create tests
    In Progress
        Optimize performance
        Add new diagram types
    Done
        Basic conversion
        File upload
        Web interface
        API endpoints
```

## User Journey

```mermaid
journey
    title User Conversion Journey
    section Discovery
      User finds converter : 5: User
      Reads documentation : 4: User
      Downloads tool : 5: User
    section Setup
      Installs dependencies : 3: User, Developer
      Configures settings : 4: User
      Tests basic conversion : 5: User
    section Usage
      Converts first diagram : 5: User
      Discovers batch mode : 4: User
      Integrates into workflow : 5: User
    section Advanced
      Uses watch mode : 3: User
      Customizes themes : 4: User
      Contributes back : 2: User, Developer
```

## Timeline

```mermaid
timeline
    title Project Milestones
        2024-Q1 : Project inception and planning
                 : Core architecture designed
        2024-Q2 : MVP development completed
                 : Basic flowchart and sequence support
                 : Web interface launched
        2024-Q3 : Advanced features added
                 : Batch processing and watch mode
                 : Multiple diagram types supported
        2024-Q4 : Production ready
                 : Comprehensive testing
                 : Documentation completed
                 : Community building
```

## Invalid Syntax Examples

### Missing Bracket
```mermaid
flowchart TD
    A[Start --> B[End
```

### Invalid Arrow
```mermaid
flowchart TD
    A[Start] ==> B[End]
```

### Wrong Diagram Type
```mermaid
invalidDiagram
    A --> B
```

### Empty Diagram
```mermaid
flowchart TD
```

### Malformed Connection
```mermaid
flowchart TD
    A[Start] -->>
    B[End]
```

## Large Diagram (Performance Test)

```mermaid
flowchart TD
    subgraph "Input Processing"
        A1[Receive Request] --> A2[Validate Input]
        A2 --> A3[Parse Mermaid]
        A3 --> A4[Check Syntax]
    end

    subgraph "Conversion Engine"
        B1[Initialize Browser] --> B2[Load Mermaid.js]
        B2 --> B3[Render Diagram]
        B3 --> B4[Capture SVG]
        B4 --> B5[Convert to Draw.io XML]
    end

    subgraph "Output Generation"
        C1[Apply Theme] --> C2[Add Metadata]
        C2 --> C3[Compress Content]
        C3 --> C4[Generate File]
    end

    subgraph "Error Handling"
        D1[Syntax Error] --> D2[Report Error]
        D2 --> D3[Suggest Fix]
        D3 --> D4[Log Issue]
    end

    A4 --> B1
    B5 --> C1
    A4 -.-> D1

    E1[Success] --> F1[Return Result]
    E2[Error] --> F2[Return Error]

    C4 --> E1
    D4 --> E2
```

## Special Characters Test

```mermaid
flowchart TD
    A["Start (with parens)"] --> B["Process: step #1"]
    B --> C["End - success!"]
    D["Error: 404 not found"] --> C
    B -.-> D
```

## Unicode Support Test

```mermaid
flowchart TD
    A[🚀 Start] --> B[⚙️ Process]
    B --> C[✅ Success]
    B --> D[❌ Error]
    D --> E[🔄 Retry]
    E --> B
    C --> F[🎉 Complete]
```
