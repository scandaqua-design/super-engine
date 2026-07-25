/**
 * Rejection Controller
 * Контролер для управління рішеннями про відхилення учасників
 * Стаття 35 Закону про публічні закупівлі
 */

import documentGenerator from '../utils/documentGenerator.js';

class RejectionController {
  /**
   * POST /api/rejection/:procurementId/create
   * Створити рішення про відхилення
   * 
   * Body:
   * {
   *   "participantId": "part-1",
   *   "rejectionReason": "NON_COMPLIANCE_CRITERIA",
   *   "description": "Учасник не надав необхідні документи",
   *   "legalBasis": "Стаття 35, ч. 1",
   *   "createdByEmail": "manager@hospital.com"
   * }
   */
  async createRejection(req, res) {
    try {
      const { procurementId } = req.params;
      const {
        participantId,
        rejectionReason,
        description,
        legalBasis,
        createdByEmail
      } = req.body;

      // Валідація
      if (!participantId || !rejectionReason) {
        return res.status(400).json({
          success: false,
          error: 'Потрібні participantId та rejectionReason'
        });
      }

      const validReasons = [
        'NON_COMPLIANCE_CRITERIA',
        'DISQUALIFICATION',
        'TECHNICAL_DEFICIENCY',
        'FINANCIAL_DEFICIENCY',
        'LEGAL_STATUS',
        'MISSED_DEADLINE',
        'OTHER'
      ];

      if (!validReasons.includes(rejectionReason)) {
        return res.status(400).json({
          success: false,
          error: `Невідома підстава. Допустимі: ${validReasons.join(', ')}`
        });
      }

      // Імітація створення запису в БД
      const rejection = {
        id: `rej-${Date.now()}`,
        procurementId,
        participantId,
        rejectionReason,
        description,
        legalBasis,
        status: 'DRAFT',
        createdAt: new Date(),
        approvedAt: null,
        approvedByEmail: null,
        sentToParticipantAt: null,
        canBeAppealed: true,
        appealDeadline: null,
        appealedAt: null,
        appealStatus: null,
        protocolUrl: null,
        updatedAt: new Date()
      };

      return res.status(201).json({
        success: true,
        data: rejection,
        message: 'Рішення про відхилення створено (DRAFT)',
        nextStep: 'Затвердити рішення /approve endpoint'
      });
    } catch (error) {
      console.error('❌ Error creating rejection:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/rejection/:rejectionId/approve
   * Затвердити рішення про відхилення
   * 
   * Body:
   * {
   *   "approvedByEmail": "director@hospital.com",
   *   "approvedByName": "Петро Іванов"
   * }
   */
  async approveRejection(req, res) {
    try {
      const { rejectionId } = req.params;
      const { approvedByEmail, approvedByName } = req.body;

      // Імітація отримання рішення з БД
      const rejection = {
        id: rejectionId,
        status: 'DRAFT',
        participantId: 'part-1',
        procurementId: 'proc-1'
      };

      rejection.status = 'APPROVED';
      rejection.approvedAt = new Date();
      rejection.approvedByEmail = approvedByEmail;
      rejection.updatedAt = new Date();

      // Встановити дедлайн для оскарження (10 робочих днів)
      rejection.appealDeadline = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

      return res.status(200).json({
        success: true,
        data: rejection,
        message: 'Рішення затверджено',
        nextStep: 'Надіслати учаснику /send endpoint'
      });
    } catch (error) {
      console.error('❌ Error approving rejection:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/rejection/:rejectionId/send
   * Надіслати рішення про відхилення учаснику
   * Генерує офіційний документ
   */
  async sendRejectionDecision(req, res) {
    try {
      const { rejectionId } = req.params;
      const { sendToEmail, sentByEmail } = req.body;

      // Імітація отримання даних з БД
      const rejection = {
        id: rejectionId,
        status: 'APPROVED',
        participantId: 'part-1',
        procurementId: 'proc-1',
        rejectionReason: 'NON_COMPLIANCE_CRITERIA',
        description: 'Учасник не надав необхідні документи',
        canBeAppealed: true,
        appealDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      };

      const participant = {
        id: 'part-1',
        name: 'ТОВ Компанія',
        code: '12345678',
        email: sendToEmail
      };

      const procurement = {
        id: 'proc-1',
        uaId: 'UA-2026-06-05-001-a',
        title: 'Закупівля медичного обладнання'
      };

      // Генерувати документ
      const docResult = await documentGenerator.generateRejectionDecision(
        rejection,
        participant,
        procurement
      );

      if (!docResult.success) {
        return res.status(500).json(docResult);
      }

      rejection.status = 'SENT';
      rejection.sentToParticipantAt = new Date();
      rejection.protocolUrl = `https://storage.com/${docResult.documentId}.pdf`;

      return res.status(200).json({
        success: true,
        data: rejection,
        document: docResult.data,
        html: docResult.html,
        message: 'Рішення надіслано учаснику',
        documentId: docResult.documentId,
        appealDeadline: rejection.appealDeadline
      });
    } catch (error) {
      console.error('❌ Error sending rejection:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/rejection/:rejectionId/appeal
   * Обробити оскарження рішення про відхилення
   * 
   * Body:
   * {
   *   "appealText": "Учасник не погоджується з відхиленням",
   *   "appealDocument": "https://storage.com/appeal.pdf",
   *   "appearedByEmail": "lawyer@company.com"
   * }
   */
  async handleAppeal(req, res) {
    try {
      const { rejectionId } = req.params;
      const { appealText, appealDocument, appearedByEmail } = req.body;

      // Імітація отримання рішення з БД
      const rejection = {
        id: rejectionId,
        status: 'SENT',
        appealDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        canBeAppealed: true
      };

      const now = new Date();
      if (now > rejection.appealDeadline) {
        return res.status(400).json({
          success: false,
          error: 'Дедлайн для оскарження пройшов',
          appealDeadlineWas: rejection.appealDeadline
        });
      }

      rejection.appealedAt = now;
      rejection.appealStatus = 'PENDING';
      rejection.status = 'CHALLENGED';

      return res.status(200).json({
        success: true,
        data: rejection,
        message: 'Оскарження зареєстровано',
        nextStep: 'Очікування на розгляд АМКУ',
        appealDocumentUrl: appealDocument
      });
    } catch (error) {
      console.error('❌ Error handling appeal:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/rejection/:procurementId/list
   * Отримати всі рішення про відхилення для закупівлі
   */
  async getRejectionsList(req, res) {
    try {
      const { procurementId } = req.params;
      const { status } = req.query; // DRAFT, APPROVED, SENT, CHALLENGED, UPHELD, OVERTURNED

      // Імітація отримання з БД
      const rejections = [
        {
          id: 'rej-1',
          procurementId,
          participantName: 'ТОВ Компанія 1',
          rejectionReason: 'NON_COMPLIANCE_CRITERIA',
          status: status || 'SENT',
          sentToParticipantAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          appealDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          appealedAt: null
        }
      ];

      const filtered = status ? rejections.filter(r => r.status === status) : rejections;

      return res.status(200).json({
        success: true,
        data: filtered,
        total: filtered.length
      });
    } catch (error) {
      console.error('❌ Error getting rejections list:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/rejection/report/appeals
   * Звіт про оскарження рішень
   */
  async getAppealsReport(req, res) {
    try {
      const report = {
        generatedAt: new Date(),
        summary: {
          total: 5,
          pending: 2,
          upheld: 1,
          overturned: 1,
          dismissed: 1
        },
        appeals: [
          {
            rejectionId: 'rej-1',
            participantName: 'ТОВ Компанія',
            appealedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
            appealReason: 'Невідповідна обґрунтованість рішення'
          }
        ]
      };

      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('❌ Error generating appeals report:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new RejectionController();
