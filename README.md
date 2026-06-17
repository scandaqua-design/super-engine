# 🏥 Procurement Operating System (MVP)

**Інтелектуальна система підтримки прийняття рішень у сфері публічних закупівель**

Розроблено для: **КНТ «Броварська багатопрофільна клінічна лікарня»**

## 📋 Концепція

Procurement OS — це комплексна цифрова екосистема управління закупівельним циклом, яка трансформує фрагментарний документообіг та ручне адміністрування в централізовану інтелектуальну платформу.

### Ключові проблеми, що вирішує система:

- ❌ Розрізнені електронні таблиці → ✅ Централізована база даних
- ❌ Ручний контроль строків → ✅ Автоматизовані deadline alerts
- ❌ Пропуск невідповідностей → ✅ AI-асистент для аналізу документів
- ❌ Неструктурована практика → ✅ Knowledge Base
- ❌ Відсутність контролю ризиків → ✅ Risk Engine

## 🎯 MVP (Мінімально Життєздатний Продукт)

Перша версія включає базову функціональність:

### Модулі MVP:

1. **✅ Master Registry** - Реєстр закупівель
2. **✅ Procurement Lifecycle** - Управління етапами закупівлі
3. **✅ Participant Management** - Облік учасників
4. **🔄 Qualification Workspace** (у розробці)
5. **🔄 Deadline Engine** (у розробці)
6. **🔄 Risk Engine** (у розробці)

## 📦 Структура проекту

```
procurement-os/
├── src/
│   ├── index.js              # Головний сервер
│   ├── routes/
│   │   ├── health.js         # Health check
│   │   ├── procurement.js    # Procurement endpoints
│   │   ├── registry.js       # Registry endpoints
│   │   ├── qualification.js  # Qualification workspace
│   │   └── deadline.js       # Deadline engine
│   ├── controllers/          # Бізнес-логіка
│   ├── models/               # Data models
│   ├── services/             # Business services
│   └── utils/                # Утиліти
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── seed.js               # DB seed script
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
│   ├── API.md                # API documentation
│   ├── ARCHITECTURE.md       # System architecture
│   └── PROCUREMENT_FLOW.md   # Procurement workflow
├── package.json
├── .env.example
└── README.md
```

## 🚀 Встановлення

### 1. Клонування репозиторію

```bash
git clone https://github.com/scandaqua-design/procurement-os.git
cd procurement-os
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Налаштування змінних оточення

```bash
cp .env.example .env
# Відредагуйте .env за потребою
```

### 4. Запуск

```bash
# Development режим
npm run dev

# Production
npm start
```

Сервер буде запущений на `http://localhost:3000`

## 💡 API Endpoints (MVP)

### Health Check
```bash
GET /api/health
```

### Procurement Management

**Список закупівель**
```bash
GET /api/procurement?status=PLANNING&category=equipment
```

**Створити закупівлю**
```bash
POST /api/procurement
Body: {
  "title": "Ендоскопічна стійка в комплекті",
  "category": "equipment",
  "budget": 11047796,
  "organizerName": "КНТ Броварська лікарня",
  "organizerCode": "01994497"
}
```

**Отримати деталі закупівлі**
```bash
GET /api/procurement/UA-2026-06-05-001-a
```

**Оновити статус**
```bash
PUT /api/procurement/:id/status
Body: { "status": "PUBLISHED" }
```

**Додати учасника**
```bash
POST /api/procurement/:id/participants
Body: {
  "name": "ТОВ Компанія",
  "code": "12345678",
  "email": "contact@company.com"
}
```

### Registry

**Master Registry**
```bash
GET /api/registry
```

**Статистика**
```bash
GET /api/registry/stats
```

## 📊 Procurement Lifecycle

```
Планування
    ↓
Оголошення
    ↓
Подання пропозицій
    ↓
Аукціон
    ↓
Кваліфікація (24 години)
    ↓
Відхилення/Визначення переможця
    ↓
Укладення договору
    ↓
Виконання договору
    ↓
Додаткові угоди
    ↓
Архівування
```

## 📝 Статуси закупівлі

| Статус | Опис |
|--------|------|
| `PLANNING` | На етапі планування |
| `PUBLISHED` | Оголошена закупівля |
| `BIDDING` | Період прийому пропозицій |
| `EVALUATION` | На етапі оцінки пропозицій |
| `COMPLETED` | Завершена закупівля |

## 🔄 Етапи закупівлі

| Етап | Код | Опис |
|------|-----|------|
| Тендерна документація | `td` | Розробка ТД |
| Учасники | `participants` | Управління учасниками |
| 24 години | `24h` | Повідомлення про усунення |
| Відхилення | `rejections` | Рішення про відхилення |
| Переможець | `winner` | Визначення переможця |
| Договір | `contract` | Укладення і супровід договору |
| Моніторинг | `monitoring` | ДАСУ моніторинги |
| Архів | `archive` | Завершена процедура |

## 🛠️ Технологічний стек (MVP)

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database (буде додано)
- **Prisma** - ORM (буде додано)

### Frontend (наступна фаза)
- React + TypeScript
- Tailwind CSS
- React Query

## 📚 Документація

- [API Documentation](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Procurement Flow](./docs/PROCUREMENT_FLOW.md)

## 🚧 Roadmap

### Phase 1 (MVP) - В розробці
- ✅ Procurement Registry
- ✅ Participant Management
- 🔄 Qualification Workspace
- 🔄 Deadline Engine
- 🔄 Risk Detection

### Phase 2 - Запланована
- 24H Generator
- Rejection Engine
- Contract Management
- Monitoring Module

### Phase 3 - Запланована
- AI Qualification Assistant
- Knowledge Base
- Analytics Dashboard
- Mobile App

## 👥 Контрибютори

Проект розроблюється для КНТ «Броварська багатопрофільна клінічна лікарня»

## 📄 Ліцензія

MIT

## 📞 Контакти

**Організація:** КНТ Броварська багатопрофільна клінічна лікарня  
**Email:** knt_bbkr@ukr.net  
**Веб-сайт:** http://www.bbkl.com.ua

---

**Status:** 🔄 MVP Development  
**Last Updated:** 2026-06-05
