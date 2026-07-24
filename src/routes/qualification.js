/**
 * Qualification Routes
 * REST API endpoints для управління кваліфікацією учасників
 * Базовий URL: /api/qualification
 */

import express from 'express';
import qualificationController from '../controllers/qualificationController.js';

const router = express.Router();

/**
 * ============================================================================
 * КВАЛІФІКАЦІЯ УЧАСНИКІВ
 * ============================================================================
 */

/**
 * POST /api/qualification/:procurementId/:participantId/start
 * Почати кваліфікацію учасника
 * 
 * Body:
 * {
 *   "qualifiedByEmail": "manager@hospital.com",
 *   "qualifiedByName": "Іван Петренко"
 * }
 */
router.post('/:procurementId/:participantId/start', (req, res) => {
  qualificationController.startQualification(req, res);
});

/**
 * POST /api/qualification/:qualificationId/assess
 * Оцінити критерій кваліфікації (Стаття 35)
 * 
 * Body:
 * {
 *   "criteriaName": "Юридичний статус",
 *   "criteriaCode": "LEGAL_1",
 *   "requirementText": "Учасник повинен бути юридичною особою",
 *   "requirementCategory": "legal",
 *   "isCompliant": true,
 *   "evidence": "Витяг з ЄДРСР",
 *   "needsClarification": false,
 *   "score": 100,
 *   "maxScore": 100,
 *   "assessedByEmail": "manager@hospital.com"
 * }
 */
router.post('/:qualificationId/assess', (req, res) => {
  qualificationController.assessCriteria(req, res);
});

/**
 * POST /api/qualification/:qualificationId/complete
 * Завершити кваліфікацію та розрахувати результат
 */
router.post('/:qualificationId/complete', (req, res) => {
  qualificationController.completeQualification(req, res);
});

/**
 * ============================================================================
 * ВИМОГИ ПРО УСУНЕННЯ НЕВІДПОВІДНОСТЕЙ (24 ГОДИНИ)
 * ============================================================================
 */

/**
 * POST /api/qualification/:qualificationId/issue-requirement
 * Видати вимогу про усунення невідповідностей (Стаття 37, ч. 3)
 * Дедлайн: 24 години
 * 
 * Body:
 * {
 *   "issueType": "FORMAL_DEFICIENCY",
 *   "description": "Не надано витяг з ЄДРСР",
 *   "relatedCriteriaCode": "LEGAL_1",
 *   "relatedCriteriaName": "Юридичний статус",
 *   "clarificationRequest": "Надайте витяг з ЄДРСР на дату публікації оголошення",
 *   "issuedByEmail": "manager@hospital.com"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "issue": { ... },
 *     "deadline": { ... }
 *   },
 *   "deadlineAt": "2026-06-10T18:00:00Z",
 *   "hoursToRespond": 24
 * }
 */
router.post('/:qualificationId/issue-requirement', (req, res) => {
  qualificationController.issueRequirement(req, res);
});

/**
 * POST /api/qualification/issue/:issueId/respond
 * Обробити відповідь учасника на вимогу про усунення
 * 
 * Body:
 * {
 *   "responseDocument": "https://storage.com/vytyag-z-edrsr.pdf",
 *   "responseNotes": "Витяг додається відповідно до вимоги",
 *   "respondedByEmail": "participant@company.com"
 * }
 */
router.post('/issue/:issueId/respond', (req, res) => {
  qualificationController.respondToRequirement(req, res);
});

/**
 * POST /api/qualification/issue/:issueId/decide
 * Прийняти фінальне рішення щодо вимоги
 * 
 * Можливі рішення:
 * - ACCEPTED: Усунення дефекту прийнято → учасник КВАЛІФІКОВАНИЙ
 * - REJECTED: Усунення дефекту не прийнято → видати РІШЕННЯ ПРО ВІДХИЛЕННЯ
 * - ESCALATED: Передати до комісії
 * 
 * Body:
 * {
 *   "finalDecision": "ACCEPTED",
 *   "reason": "Витяг відповідає вимогам, усі дані актуальні",
 *   "decidedByEmail": "manager@hospital.com"
 * }
 */
router.post('/issue/:issueId/decide', (req, res) => {
  qualificationController.makeFinalDecision(req, res);
});

/**
 * ============================================================================
 * ПРОТОКОЛИ ТА ЗВІТИ
 * ============================================================================
 */

/**
 * GET /api/qualification/:qualificationId/protocol
 * Генерувати протокол кваліфікації
 * Для документування в ДАСУ
 */
router.get('/:qualificationId/protocol', (req, res) => {
  qualificationController.generateProtocol(req, res);
});

/**
 * ============================================================================
 * УПРАВЛІННЯ ДЕДЛАЙНАМИ
 * ============================================================================
 */

/**
 * GET /api/qualification/:procurementId/deadlines
 * Отримати всі активні дедлайни для закупівлі
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "dl-1",
 *       "description": "Усунення невідповідностей - ТОВ Компанія",
 *       "type": "QUALIFICATION_24H_RESPONSE",
 *       "dueDate": "09.06.2026 18:00",
 *       "hoursUntilDeadline": 5,
 *       "priority": "HIGH"
 *     }
 *   ]
 * }
 */
router.get('/:procurementId/deadlines', (req, res) => {
  qualificationController.getDeadlines(req, res);
});

/**
 * POST /api/qualification/scan-deadlines
 * Сканувати всі дедлайни й видати сповіщення
 * (Запускається як периодичний Job кожні 15 хвилин)
 * 
 * Response:
 * {
 *   "success": true,
 *   "generatedAlerts": 3,
 *   "data": [
 *     {
 *       "id": "alert-1",
 *       "alertType": "URGENT",
 *       "severity": "CRITICAL",
 *       "message": "🔴 ТЕРМІНОВО! 2 години до дедлайну..."
 *     }
 *   ]
 * }
 */
router.post('/scan-deadlines', (req, res) => {
  qualificationController.scanDeadlines(req, res);
});

/**
 * GET /api/qualification/report/deadlines
 * Сформувати звіт про всі дедлайни з пріоритизацією
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "generatedAt": "2026-06-09T12:00:00Z",
 *     "summary": {
 *       "total": 5,
 *       "overdue": 1,
 *       "urgent": 2,
 *       "warning": 1,
 *       "upcoming": 1
 *     },
 *     "deadlines": [
 *       {
 *         "id": "dl-1",
 *         "procurement": "UA-2026-06-05-001-a",
 *         "description": "Усунення невідповідностей",
 *         "dueDate": "09.06.2026 18:00",
 *         "hoursUntil": 5,
 *         "priority": "CRITICAL",
 *         "assignedTo": "manager@hospital.com"
 *       }
 *     ]
 *   }
 * }
 */
router.get('/report/deadlines', (req, res) => {
  qualificationController.getDeadlineReport(req, res);
});

/**
 * ============================================================================
 * ДОКУМЕНТАЦІЯ API
 * ============================================================================
 */

/**
 * GET /api/qualification/docs
 * Отримати документацію по API
 */
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'Qualification Workspace API',
      version: '1.0.0',
      baseUrl: '/api/qualification',
      endpoints: {
        qualifications: {
          start: {
            method: 'POST',
            path: '/:procurementId/:participantId/start',
            description: 'Почати кваліфікацію учасника'
          },
          assess: {
            method: 'POST',
            path: '/:qualificationId/assess',
            description: 'Оцінити критерій (Стаття 35)'
          },
          complete: {
            method: 'POST',
            path: '/:qualificationId/complete',
            description: 'Завершити кваліфікацію'
          }
        },
        requirements: {
          issue: {
            method: 'POST',
            path: '/:qualificationId/issue-requirement',
            description: 'Видати вимогу про усунення (24 години)'
          },
          respond: {
            method: 'POST',
            path: '/issue/:issueId/respond',
            description: 'Обробити відповідь учасника'
          },
          decide: {
            method: 'POST',
            path: '/issue/:issueId/decide',
            description: 'Прийняти фінальне рішення'
          }
        },
        reports: {
          protocol: {
            method: 'GET',
            path: '/:qualificationId/protocol',
            description: 'Генерувати протокол кваліфікації'
          }
        },
        deadlines: {
          list: {
            method: 'GET',
            path: '/:procurementId/deadlines',
            description: 'Отримати активні дедлайни'
          },
          scan: {
            method: 'POST',
            path: '/scan-deadlines',
            description: 'Сканувати й видати сповіщення'
          },
          report: {
            method: 'GET',
            path: '/report/deadlines',
            description: 'Звіт про дедлайни з пріоритизацією'
          }
        }
      }
    }
  });
});

export default router;
