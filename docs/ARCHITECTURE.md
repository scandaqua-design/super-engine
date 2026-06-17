# 🏗️ Архітектура Procurement OS

## Концептуальна модель

```
┌──────────────────────────────────────────────────────────┐
│         PROCUREMENT OPERATING SYSTEM                    │
│          Decision Support System                        │
└──────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────────┐
        │     Frontend Layer (React)           │
        │  - Dashboard                         │
        │  - Qualification Workspace           │
        │  - Decision Queue                    │
        └──────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────────┐
        │     API Layer (Express)              │
        │  - Procurement Routes                │
        │  - Registry Routes                   │
        │  - Qualification Routes              │
        │  - Risk Engine Routes                │
        └──────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────────┐
        │     Business Logic Layer             │
        │  - Controllers                       │
        │  - Services                          │
        │  - Validators                        │
        └──────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────────┐
        │     Data Layer                       │
        │  - PostgreSQL Database               │
        │  - Prisma ORM                        │
        │  - File Storage                      │
        └──────────────────────────────────────────────┘
```

## Основні компоненти

### 1. Master Registry
- Централізований реєстр всіх закупівель
- Кожна закупівля має унікальний ID: `UA-YYYY-MM-DD-XXXXX-a`
- Містить агреговану інформацію з усіх модулів

### 2. Procurement Lifecycle Manager
- Управління етапами закупівлі
- Контроль переходів між етапами
- Валідація дозволених операцій

### 3. Qualification Workspace
- Централізоване місце для перевірки документів
- Інтеграція з Risk Engine
- AI-асистент для аналізу

### 4. Deadline Engine
- Відстеження всіх критичних дат
- Автоматичні спповіщення
- Контроль порушень строків

### 5. Risk Engine
- Виявлення потенційних ризиків
- Класифікація за рівнем серйозності
- Рекомендації для дій

## База даних

### Основні таблиці

```prisma
model Procurement {
  id              String      @id
  title           String
  description     String?
  category        String
  budget          Float
  deadline        DateTime
  status          String      // PLANNING, PUBLISHED, BIDDING, EVALUATION, COMPLETED
  stage           String      // td, participants, 24h, rejections, winner, contract, monitoring, archive
  organizerName   String
  organizerCode   String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  participants    Participant[]
  documents       Document[]
  notifications   Notification[]
  risks           Risk[]
}

model Participant {
  id              String      @id
  procurementId   String
  name            String
  code            String
  email           String
  status          String      // SUBMITTED, QUALIFIED, REJECTED, DISQUALIFIED
  createdAt       DateTime    @default(now())
  
  procurement     Procurement @relation(fields: [procurementId], references: [id])
  documents       ParticipantDocument[]
  qualifications  Qualification[]
}

model Document {
  id              String      @id
  procurementId   String
  name            String
  type            String      // TD, OFFER, CONTRACT, etc
  url             String
  version         Int         @default(1)
  createdAt       DateTime    @default(now())
  
  procurement     Procurement @relation(fields: [procurementId], references: [id])
}

model Risk {
  id              String      @id
  procurementId   String
  type            String      // QUALIFICATION, LEGAL, CONTRACT
  level           String      // LOW, MEDIUM, HIGH, CRITICAL
  description     String
  recommendation  String?
  status          String      // NEW, ACKNOWLEDGED, RESOLVED
  createdAt       DateTime    @default(now())
  
  procurement     Procurement @relation(fields: [procurementId], references: [id])
}
```

## API архітектура

### REST Endpoints

```
Procurement Management:
  GET    /api/procurement
  POST   /api/procurement
  GET    /api/procurement/:id
  PUT    /api/procurement/:id
  DELETE /api/procurement/:id
  PUT    /api/procurement/:id/status
  POST   /api/procurement/:id/participants
  GET    /api/procurement/:id/participants

Registry:
  GET    /api/registry
  GET    /api/registry/stats
  GET    /api/registry/export

Qualification:
  GET    /api/qualification/:procurementId
  POST   /api/qualification/:procurementId/checklist
  PUT    /api/qualification/:procurementId/:participantId

Deadlines:
  GET    /api/deadlines
  GET    /api/deadlines/urgent
  POST   /api/deadlines/check

Risks:
  GET    /api/risks
  GET    /api/risks/:procurementId
  POST   /api/risks/:procurementId
  PUT    /api/risks/:id
```

## Workflow

### Типовий процес закупівлі

```
1. CREATION (Створення)
   ├─ Create procurement record
   ├─ Upload tender documentation
   ├─ Set deadlines
   └─ Assign responsible person

2. PUBLICATION (Публікація)
   ├─ Validate tender documents
   ├─ Check risk factors
   ├─ Publish on Prozorro
   └─ Send notifications

3. BIDDING (Прием пропозиций)
   ├─ Monitor participant submissions
   ├─ Track deadlines
   ├─ Generate alerts for expiring deadlines
   └─ Store all submissions

4. EVALUATION (Оцінка)
   ├─ Start qualification workspace
   ├─ Check documents with AI assistant
   ├─ Identify missing documents
   ├─ Generate 24-hour notices
   └─ Detect risks

5. DECISION (Рішення)
   ├─ Review corrections
   ├─ Make rejection decisions
   ├─ Determine winner
   └─ Create queue of decisions

6. CONTRACT (Договір)
   ├─ Draft contract
   ├─ Sign with KEP
   ├─ Publish contract
   ├─ Monitor execution
   └─ Control amendments

7. COMPLETION (Завершення)
   ├─ Archive documents
   ├─ Store lessons learned
   ├─ Update knowledge base
   └─ Generate statistics
```

## Інтеграції

### Зовнішні системи

1. **Prozorro.UA** - Портал публічних закупівель
   - Публікація тендерів
   - Завантаження даних
   - Інтеграція через API

2. **ДАСУ** - Державна аудиторська служба
   - Моніторинги
   - Звіти
   - Скарги

3. **АМКУ** - Антимонопольний комітет
   - Оскарження
   - Справки
   - Судові рішення

4. **Email/SMS** - Спповіщення
   - Deadline alerts
   - Decision notifications
   - Risk warnings

## Безпека

- JWT authentication
- Role-based access control (RBAC)
- Audit logging
- Data encryption
- Input validation
- Rate limiting

## Масштабованість

- PostgreSQL + connection pooling
- Caching layer (Redis)
- Document storage (S3/Google Drive)
- Load balancing
- Microservices-ready architecture
