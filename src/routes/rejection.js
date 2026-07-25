/**
 * Rejection Routes
 * REST API endpoints для рішень про відхилення учасників
 * Базовий URL: /api/rejection
 * 
 * Стаття 35 Закону України «Про публічні закупівлі»
 */

import express from 'express';
import rejectionController from '../controllers/rejectionController.js';

const router = express.Router();

/**
 * ============================================================================
 * УПРАВЛІННЯ РІШЕННЯМИ ПРО ВІДХИЛЕННЯ
 * ============================================================================
 */

/**
 * POST /api/rejection/:procurementId/create
 * Створити рішення про відхилення
 * 
 * Body:
 * {
 *   "participantId": "part-1",
 *   "rejectionReason": "NON_COMPLIANCE_CRITERIA",
 *   "description": "Учасник не надав необхідні документи в строк",
 *   "legalBasis": "Стаття 35, ч. 1 Закону про публічні закупівлі",
 *   "createdByEmail": "manager@hospital.com"
 * }
 * 
 * Response: 201
 * {
 *   "success": true,
 *   "data": {
 *     "id": "rej-1624xxx",
 *     "status": "DRAFT",
 *     "participantId": "part-1"
 *   },
 *   "nextStep": "Затвердити рішення /approve endpoint"
 * }
 */
router.post('/:procurementId/create', (req, res) => {
  rejectionController.createRejection(req, res);
});

/**
 * POST /api/rejection/:rejectionId/approve
 * Затвердити рішення про відхилення
 * Зміна статусу: DRAFT → APPROVED
 * 
 * Body:
 * {
 *   "approvedByEmail": "director@hospital.com",
 *   "approvedByName": "Петро Іванов"
 * }
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": {
 *     "status": "APPROVED",
 *     "approvedAt": "2026-06-09T12:00:00Z",
 *     "appealDeadline": "2026-06-19T23:59:59Z"
 *   },
 *   "nextStep": "Надіслати учаснику /send endpoint"
 * }
 */
router.post('/:rejectionId/approve', (req, res) => {
  rejectionController.approveRejection(req, res);
});

/**
 * POST /api/rejection/:rejectionId/send
 * Надіслати рішення про відхилення учаснику
 * Зміна статусу: APPROVED → SENT
 * 
 * Генерує офіційний PDF документ:
 * - Вимога про усунення невідповідностей
 * - Юридична основа (Стаття 35)
 * - Право на оскарження (10 робочих днів)
 * 
 * Body:
 * {
 *   "sendToEmail": "participant@company.com",
 *   "sentByEmail": "manager@hospital.com"
 * }
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": {
 *     "status": "SENT",
 *     "sentToParticipantAt": "2026-06-09T12:30:00Z",
 *     "protocolUrl": "https://storage.com/РВ-UA-2026-06-05-001-a-090626.pdf"
 *   },
 *   "document": { ... },
 *   "html": "<html>...</html>",
 *   "documentId": "РВ-UA-2026-06-05-001-a-090626",
 *   "appealDeadline": "2026-06-19T23:59:59Z"
 * }
 */
router.post('/:rejectionId/send', (req, res) => {
  rejectionController.sendRejectionDecision(req, res);
});

/**
 * ============================================================================
 * ПРАВО НА ОСКАРЖЕННЯ
 * ============================================================================
 */

/**
 * POST /api/rejection/:rejectionId/appeal
 * Обробити оскарження рішення про відхилення
 * Учасник може оскаржити рішення в АМКУ (Антимонопольний комітет)
 * 
 * Дедлайн оскарження: 10 робочих днів від отримання рішення
 * Орган: АМКУ
 * Процедура: Адміністративне судочинство
 * 
 * Body:
 * {
 *   "appealText": "Учасник не погоджується з відхиленням, оскільки...",
 *   "appealDocument": "https://storage.com/appeal.pdf",
 *   "appearedByEmail": "lawyer@company.com",
 *   "appealReason": "INCORRECT_EVALUATION"
 * }
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": {
 *     "status": "CHALLENGED",
 *     "appealStatus": "PENDING",
 *     "appealedAt": "2026-06-15T10:30:00Z"
 *   },
 *   "message": "Оскарження зареєстровано",
 *   "nextStep": "Очікування на розгляд АМКУ"
 * }
 */
router.post('/:rejectionId/appeal', (req, res) => {
  rejectionController.handleAppeal(req, res);
});

/**
 * ============================================================================
 * ЗВІТИ ТА ПЕРЕГЛЯД
 * ============================================================================
 */

/**
 * GET /api/rejection/:procurementId/list
 * Отримати всі рішення про відхилення для закупівлі
 * 
 * Query parameters:
 * - status: DRAFT | APPROVED | SENT | CHALLENGED | UPHELD | OVERTURNED
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "rej-1",
 *       "procurementId": "proc-1",
 *       "participantName": "ТОВ Компанія",
 *       "rejectionReason": "NON_COMPLIANCE_CRITERIA",
 *       "status": "SENT",
 *       "sentToParticipantAt": "2026-06-09T12:30:00Z",
 *       "appealDeadline": "2026-06-19T23:59:59Z",
 *       "appealedAt": null
 *     }
 *   ],
 *   "total": 1
 * }
 */
router.get('/:procurementId/list', (req, res) => {
  rejectionController.getRejectionsList(req, res);
});

/**
 * GET /api/rejection/report/appeals
 * Звіт про оскарження рішень про відхилення
 * 
 * Response: 200
 * {
 *   "success": true,
 *   "data": {
 *     "generatedAt": "2026-06-09T15:00:00Z",
 *     "summary": {
 *       "total": 5,
 *       "pending": 2,
 *       "upheld": 1,
 *       "overturned": 1,
 *       "dismissed": 1
 *     },
 *     "appeals": [
 *       {
 *         "rejectionId": "rej-1",
 *         "participantName": "ТОВ Компанія",
 *         "appealedAt": "2026-06-15T10:30:00Z",
 *         "status": "PENDING",
 *         "appealReason": "Невідповідна обґрунтованість рішення"
 *       }
 *     ]
 *   }
 * }
 */
router.get('/report/appeals', (req, res) => {
  rejectionController.getAppealsReport(req, res);
});

/**
 * ============================================================================
 * ДОКУМЕНТАЦІЯ API
 * ============================================================================
 */

/**
 * GET /api/rejection/docs
 * Отримати документацію по API
 */
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Rejection Decisions API',
      version: '1.0.0',
      baseUrl: '/api/rejection',
      legalBasis: 'Стаття 35 Закону України «Про публічні закупівлі»',
      endpoints: {
        create: {
          method: 'POST',
          path: '/:procurementId/create',
          description: 'Створити рішення про відхилення',
          status: 'DRAFT'
        },
        approve: {
          method: 'POST',
          path: '/:rejectionId/approve',
          description: 'Затвердити рішення',
          status: 'APPROVED'
        },
        send: {
          method: 'POST',
          path: '/:rejectionId/send',
          description: 'Надіслати рішення учаснику',
          status: 'SENT',
          generates: 'PDF документ'
        },
        appeal: {
          method: 'POST',
          path: '/:rejectionId/appeal',
          description: 'Зареєструвати оскарження',
          authority: 'АМКУ',
          deadline: '10 робочих днів'
        },
        list: {
          method: 'GET',
          path: '/:procurementId/list',
          description: 'Отримати рішення для закупівлі'
        },
        appeals_report: {
          method: 'GET',
          path: '/report/appeals',
          description: 'Звіт про оскарження'
        }
      },
      rejectionReasons: [
        'NON_COMPLIANCE_CRITERIA - Невідповідність критеріям',
        'DISQUALIFICATION - Дискримінація/спотворення конкуренції',
        'TECHNICAL_DEFICIENCY - Технічні дефекти',
        'FINANCIAL_DEFICIENCY - Фінансові недоліки',
        'LEGAL_STATUS - Юридичний статус неприйнятний',
        'MISSED_DEADLINE - Пропуск дедлайну',
        'OTHER - Інші причини'
      ],
      statuses: [
        'DRAFT - Чернетка',
        'APPROVED - Затверджено',
        'SENT - Надіслано учаснику',
        'CHALLENGED - Оскаржено',
        'UPHELD - Рішення підтримано',
        'OVERTURNED - Рішення скасовано'
      ]
    }
  });
});

export default router;
