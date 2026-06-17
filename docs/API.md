# 💡 API Reference - Procurement OS

## Base URL
```
http://localhost:3000/api
```

## Authentication
Текущо MVP без аутентифікації. В Phase 2 буде JWT.

## Error Handling

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Health Check

#### GET /health
Перевірка статусу сервісу.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-06-05T10:30:00.000Z",
  "service": "Procurement OS",
  "version": "1.0.0-mvp"
}
```

---

### Procurement

#### GET /procurement
Отримати список всіх закупівель.

**Query Parameters:**
- `status` (optional): PLANNING, PUBLISHED, BIDDING, EVALUATION, COMPLETED
- `category` (optional): equipment, services, works
- `limit` (optional): default 50
- `offset` (optional): default 0

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "UA-2026-06-05-001-a",
      "title": "Ендоскопічна стійка",
      "category": "equipment",
      "budget": 11047796,
      "status": "PLANNING",
      "stage": "td",
      "createdAt": "2026-06-05T10:00:00.000Z"
    }
  ]
}
```

#### POST /procurement
Створити нову закупівлю.

**Request Body:**
```json
{
  "title": "Ендоскопічна стійка в комплекті",
  "description": "За кодом СРV за ДК 021:2015",
  "category": "equipment",
  "budget": 11047796,
  "deadline": "2026-09-30",
  "organizerName": "КНТ Броварська багатопрофільна клінічна лікарня",
  "organizerCode": "01994497"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "UA-2026-06-05-001-a",
    "title": "Ендоскопічна стійка в комплекті",
    "category": "equipment",
    "budget": 11047796,
    "status": "PLANNING",
    "stage": "td",
    "createdAt": "2026-06-05T10:30:00.000Z"
  }
}
```

#### GET /procurement/:id
Отримати деталі конкретної закупівлі.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "UA-2026-06-05-001-a",
    "title": "Ендоскопічна стійка",
    "description": "...",
    "category": "equipment",
    "budget": 11047796,
    "deadline": "2026-09-30",
    "status": "PLANNING",
    "stage": "td",
    "organizerName": "КНТ Броварська лікарня",
    "organizerCode": "01994497",
    "participants": [],
    "documents": [],
    "createdAt": "2026-06-05T10:00:00.000Z",
    "updatedAt": "2026-06-05T10:30:00.000Z"
  }
}
```

#### PUT /procurement/:id/status
Оновити статус закупівлі.

**Request Body:**
```json
{
  "status": "PUBLISHED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "UA-2026-06-05-001-a",
    "status": "PUBLISHED",
    "updatedAt": "2026-06-05T11:00:00.000Z"
  }
}
```

#### POST /procurement/:id/participants
Додати учасника до закупівлі.

**Request Body:**
```json
{
  "name": "ТОВ Компанія",
  "code": "12345678",
  "email": "contact@company.com"
}
```

**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "ТОВ Компанія",
    "code": "12345678",
    "email": "contact@company.com",
    "status": "SUBMITTED",
    "createdAt": "2026-06-05T11:30:00.000Z"
  }
}
```

---

### Registry

#### GET /registry
Отримати Master Registry.

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Master Procurement Registry",
    "fields": [
      "UA-ID",
      "Subject",
      "CPV",
      "Expected Value",
      "Organizer",
      "Winner",
      "Status",
      "Stage",
      "Risk Level"
    ],
    "procurements": []
  }
}
```

#### GET /registry/stats
Отримати статистику по закупівлям.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "byStatus": {
      "PLANNING": 2,
      "PUBLISHED": 1,
      "BIDDING": 1,
      "EVALUATION": 1,
      "COMPLETED": 0
    },
    "totalBudget": 50000000,
    "averageBudget": 10000000,
    "riskCases": 2
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|----------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

Текущо без обмежень. В Phase 2 буде реалізовано.

## Pagination

Запити, які повертають списки, підтримують пагінацію:

```
?limit=50&offset=0
```

## Sorting

```
?sort=createdAt:desc
?sort=budget:asc
```
