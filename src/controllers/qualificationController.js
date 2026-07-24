/**
 * Qualification Controller
 * Контролер для управління кваліфікацією учасників
 * Обробляє всі API запити щодо кваліфікації
 */

import qualificationService from '../services/qualificationService.js';
import deadlineService from '../services/deadlineService.js';

class QualificationController {
  /**
   * POST /api/qualification/:procurementId/:participantId/start
   * Почати кваліфікацію учасника
   */
  async startQualification(req, res) {
    try {
      const { procurementId, participantId } = req.params;
      const { qualifiedByEmail, qualifiedByName } = req.body;

      // Валідація
      if (!procurementId || !participantId) {
        return res.status(400).json({
          success: false,
          error: 'Потрібні procurementId та participantId'
        });
      }

      // Імітація отримання даних з БД
      const participant = { id: participantId, name: 'ТОВ Компанія' };
      const procurement = { id: procurementId, uaId: 'UA-2026-06-05-001-a' };

      const result = await qualificationService.initializeQualification(
        participant,
        procurement,
        qualifiedByEmail
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Error starting qualification:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/qualification/:qualificationId/assess
   * Оцінити критерій кваліфікації
   * Стаття 35 Закону про публічні закупівлі
   */
  async assessCriteria(req, res) {
    try {
      const { qualificationId } = req.params;
      const {
        criteriaName,
        criteriaCode,
        requirementText,
        requirementCategory,
        isCompliant,
        evidence,
        needsClarification,
        clarificationRequest,
        score,
        maxScore,
        assessedByEmail
      } = req.body;

      // Валідація
      if (!criteriaName || !requirementText) {
        return res.status(400).json({
          success: false,
          error: 'Потрібні criteriaName та requirementText'
        });
      }

      // Імітація отримання кваліфікації з БД
      const qualification = {
        id: qualificationId,
        assessmentDetails: [],
        issues: []
      };

      const result = await qualificationService.assessCriteria(
        qualification,
        {
          criteriaName,
          criteriaCode,
          requirementText,
          requirementCategory: requirementCategory || 'technical',
          isCompliant,
          evidence,
          needsClarification,
          clarificationRequest,
          score,
          maxScore
        },
        assessedByEmail
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        requiresIssue: result.requiresIssue,
        issueType: result.issueType,
        message: 'Критерій оцінений'
      });
    } catch (error) {
      console.error('❌ Error assessing criteria:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/qualification/:qualificationId/complete
   * Завершити кваліфікацію та розрахувати результат
   */
  async completeQualification(req, res) {
    try {
      const { qualificationId } = req.params;

      // Імітація отримання кваліфікації з БД
      const qualification = {
        id: qualificationId,
        status: 'IN_PROGRESS',
        assessmentDetails: [
          {
            criteriaName: 'Юридичний статус',
            isCompliant: true,
            score: 100,
            maxScore: 100
          },
          {
            criteriaName: 'Фінансові можливості',
            isCompliant: false,
            score: 0,
            maxScore: 100
          }
        ]
      };

      const result = await qualificationService.completeQualification(qualification);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        status: result.status,
        overallScore: result.overallScore,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Error completing qualification:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/qualification/:qualificationId/issue-requirement
   * Видати вимогу про усунення невідповідностей (24 години)
   * Стаття 37, ч. 3 Закону про публічні закупівлі
   */
  async issueRequirement(req, res) {
    try {
      const { qualificationId } = req.params;
      const {
        issueType,
        description,
        relatedCriteriaCode,
        relatedCriteriaName,
        clarificationRequest,
        issuedByEmail
      } = req.body;

      // Валідація
      if (!description || !clarificationRequest) {
        return res.status(400).json({
          success: false,
          error: 'Потрібні description та clarificationRequest'
        });
      }

      // Імітація отримання даних з БД
      const qualification = { id: qualificationId };
      const participant = { id: 'part-1', name: 'ТОВ Компанія' };
      const procurement = { id: 'proc-1', uaId: 'UA-2026-06-05-001-a' };

      const result = await qualificationService.issueQualificationRequirement(
        qualification,
        participant,
        procurement,
        {
          issueType: issueType || 'FORMAL_DEFICIENCY',
          description,
          relatedCriteriaCode,
          relatedCriteriaName,
          clarificationRequest
        },
        issuedByEmail
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        issuedAt: result.issuedAt,
        deadlineAt: result.deadlineAt,
        hoursToRespond: result.hoursToRespond,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Error issuing requirement:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/qualification/issue/:issueId/respond
   * Обробити відповідь учасника на вимогу про усунення
   */
  async respondToRequirement(req, res) {
    try {
      const { issueId } = req.params;
      const { responseDocument, responseNotes, respondedByEmail } = req.body;

      // Валідація
      if (!responseDocument) {
        return res.status(400).json({
          success: false,
          error: 'Потрібен responseDocument (URL файлу)'
        });
      }

      // Імітація отримання Issue з БД
      const issue = {
        id: issueId,
        deadlineAt: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 годин
        responseStatus: 'AWAITING'
      };

      const result = await qualificationService.processParticipantResponse(
        issue,
        { responseDocument, responseNotes },
        respondedByEmail
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        isWithinDeadline: result.isWithinDeadline,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Error processing response:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/qualification/issue/:issueId/decide
   * Прийняти фінальне рішення щодо вимоги
   * ACCEPTED → Кваліфікація | REJECTED → Відхилення
   */
  async makeFinalDecision(req, res) {
    try {
      const { issueId } = req.params;
      const { finalDecision, reason, decidedByEmail } = req.body;

      // Валідація
      if (!finalDecision || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Потрібні finalDecision та reason'
        });
      }

      // Імітація отримання Issue з БД
      const issue = {
        id: issueId,
        finalDecision: 'PENDING'
      };

      const result = await qualificationService.makeFinalDecision(
        issue,
        { finalDecision, reason },
        decidedByEmail
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        decision: result.decision,
        nextStep: result.nextStep,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Error making decision:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/qualification/:qualificationId/protocol
   * Генерувати протокол кваліфікації
   */
  async generateProtocol(req, res) {
    try {
      const { qualificationId } = req.params;

      // Імітація отримання даних з БД
      const qualification = {
        id: qualificationId,
        status: 'QUALIFIED',
        overallScore: 85,
        assessmentDetails: [
          {
            criteriaName: 'Юридичний статус',
            requirementText: 'Юридична особа повинна бути зареєстрована',
            isCompliant: true,
            score: 100,
            evidence: 'Витяг з ЄДРСР'
          }
        ],
        issues: [],
        startedAt: new Date(),
        completedAt: new Date()
      };

      const participant = { id: 'part-1', name: 'ТОВ Компанія', code: '12345678' };
      const procurement = { uaId: 'UA-2026-06-05-001-a' };

      const result = await qualificationService.generateQualificationProtocol(
        qualification,
        participant,
        procurement
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        protocolId: result.protocolId,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Error generating protocol:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/qualification/:procurementId/deadlines
   * Отримати всі активні дедлайни для закупівлі
   */
  async getDeadlines(req, res) {
    try {
      const { procurementId } = req.params;

      // Імітація отримання дедлайнів з БД
      const deadlines = [
        {
          id: 'dl-1',
          procurementId,
          deadlineType: 'QUALIFICATION_24H_RESPONSE',
          description: 'Усунення невідповідностей - ТОВ Компанія',
          dueDate: new Date(Date.now() + 5 * 60 * 60 * 1000),
          status: 'ACTIVE'
        }
      ];

      const result = await deadlineService.getActiveDealines(procurementId, deadlines);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error getting deadlines:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/qualification/scan-deadlines
   * Сканувати всі дедлайни й видати сповіщення
   * (Запускається як периодичнийJob)
   */
  async scanDeadlines(req, res) {
    try {
      // Імітація отримання всіх закупівель
      const procurements = [
        { id: 'proc-1', uaId: 'UA-2026-06-05-001-a' }
      ];

      // Імітація отримання всіх дедлайнів
      const deadlines = [
        {
          id: 'dl-1',
          procurementId: 'proc-1',
          deadlineType: 'QUALIFICATION_24H_RESPONSE',
          description: 'Усунення невідповідностей',
          dueDate: new Date(Date.now() + 1 * 60 * 60 * 1000),
          status: 'ACTIVE'
        }
      ];

      const result = await deadlineService.scanAndAlertDeadlines(procurements, deadlines);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        generatedAlerts: result.generatedAlerts,
        data: result.data,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Error scanning deadlines:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/qualification/report/deadlines
   * Сформувати звіт про всі дедлайни
   */
  async getDeadlineReport(req, res) {
    try {
      // Імітація отримання даних з БД
      const procurements = [
        { id: 'proc-1', uaId: 'UA-2026-06-05-001-a' }
      ];

      const deadlines = [
        {
          id: 'dl-1',
          procurementId: 'proc-1',
          deadlineType: 'QUALIFICATION_24H_RESPONSE',
          description: 'Усунення невідповідностей',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: 'ACTIVE',
          assignedTo: 'manager@hospital.com'
        }
      ];

      const result = await deadlineService.generateDeadlineReport(procurements, deadlines);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error generating deadline report:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new QualificationController();
