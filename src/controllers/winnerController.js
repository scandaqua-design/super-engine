/**
 * Winner Controller
 * Контролер для управління рішеннями про визначення переможця
 * Стаття 36 Закону про публічні закупівлі
 */

import documentGenerator from '../utils/documentGenerator.js';

class WinnerController {
  /**
   * POST /api/winner/:procurementId/determine
   * Визначити переможця на основі критеріїв
   * 
   * Body:
   * {
   *   "participantId": "part-1",
   *   "selectionCriteria": "LOWEST_PRICE",
   *   "score": 95,
   *   "winningBid": 150000000,
   *   "determinedByEmail": "manager@hospital.com"
   * }
   */
  async determineWinner(req, res) {
    try {
      const { procurementId } = req.params;
      const {
        participantId,
        selectionCriteria,
        score,
        winningBid,
        determinedByEmail
      } = req.body;

      // Валідація
      if (!participantId || !selectionCriteria || !score || !winningBid) {
        return res.status(400).json({
          success: false,
          error: 'Потрібні: participantId, selectionCriteria, score, winningBid'
        });
      }

      const validCriteria = ['LOWEST_PRICE', 'BEST_VALUE', 'COMBINED'];
      if (!validCriteria.includes(selectionCriteria)) {
        return res.status(400).json({
          success: false,
          error: `Невідомий критерій. Допустимі: ${validCriteria.join(', ')}`
        });
      }

      // Імітація створення запису в БД
      const winner = {
        id: `win-${Date.now()}`,
        procurementId,
        participantId,
        selectionCriteria,
        score,
        winningBid,
        status: 'PRELIMINARY',
        determinedAt: new Date(),
        announcedAt: null,
        confirmedAt: null,
        protocolUrl: null,
        canBeAppealed: true,
        appealDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return res.status(201).json({
        success: true,
        data: winner,
        message: 'Переможця визначено (PRELIMINARY)',
        nextStep: 'Видати рішення та надати право на оскарження',
        appealDeadline: winner.appealDeadline
      });
    } catch (error) {
      console.error('❌ Error determining winner:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/winner/:winnerId/announce
   * Оголосити переможця (генерувати офіційне рішення)
   * Зміна статусу: PRELIMINARY → ANNOUNCED
   */
  async announceWinner(req, res) {
    try {
      const { winnerId } = req.params;
      const { announcedByEmail } = req.body;

      // Імітація отримання переможця з БД
      const winner = {
        id: winnerId,
        status: 'PRELIMINARY',
        participantId: 'part-1',
        procurementId: 'proc-1',
        selectionCriteria: 'LOWEST_PRICE',
        score: 95,
        winningBid: 150000000
      };

      const participant = {
        id: 'part-1',
        name: 'ТОВ Переможець',
        code: '12345678'
      };

      const procurement = {
        id: 'proc-1',
        uaId: 'UA-2026-06-05-001-a',
        title: 'Закупівля медичного обладнання',
        budget: 200000000
      };

      // Генерувати документ
      const docResult = await documentGenerator.generateWinnerDecision(
        winner,
        participant,
        procurement
      );

      if (!docResult.success) {
        return res.status(500).json(docResult);
      }

      winner.status = 'ANNOUNCED';
      winner.announcedAt = new Date();
      winner.protocolUrl = `https://storage.com/${docResult.documentId}.pdf`;

      return res.status(200).json({
        success: true,
        data: winner,
        document: docResult.data,
        html: docResult.html,
        message: 'Переможця оголошено (ANNOUNCED)',
        documentId: docResult.documentId,
        nextStep: 'Учасники можуть оскаржити рішення протягом 10 днів'
      });
    } catch (error) {
      console.error('❌ Error announcing winner:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/winner/:winnerId/confirm
   * Підтвердити переможця (після закінчення строку оскарження)
   * Зміна статусу: ANNOUNCED → CONFIRMED або FINAL
   */
  async confirmWinner(req, res) {
    try {
      const { winnerId } = req.params;
      const { confirmedByEmail } = req.body;

      // Імітація отримання переможця з БД
      const winner = {
        id: winnerId,
        status: 'ANNOUNCED',
        appealDeadline: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 днів тому
        appealedAt: null
      };

      const now = new Date();

      // Перевірити, чи пройшов строк оскарження
      if (now < winner.appealDeadline) {
        return res.status(400).json({
          success: false,
          error: 'Строк оскарження ще не закінчився',
          appealDeadlineRemains: winner.appealDeadline
        });
      }

      // Якщо було оскарження - перевірити статус
      if (winner.appealedAt) {
        winner.status = 'CHALLENGED';
        return res.status(400).json({
          success: false,
          error: 'Рішення було оскаржено. Очікування розгляду.',
          status: winner.status
        });
      }

      winner.status = 'FINAL';
      winner.confirmedAt = now;

      return res.status(200).json({
        success: true,
        data: winner,
        message: 'Переможця підтверджено (FINAL)',
        nextStep: 'Укладення контракту'
      });
    } catch (error) {
      console.error('❌ Error confirming winner:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/winner/:winnerId/appeal
   * Обробити оскарження рішення про переможця
   * 
   * Body:
   * {
   *   "appealText": "Оцінка неправильна",
   *   "appealDocument": "https://storage.com/appeal.pdf",
   *   "appearedByEmail": "competitor@company.com"
   * }
   */
  async handleWinnerAppeal(req, res) {
    try {
      const { winnerId } = req.params;
      const { appealText, appealDocument, appearedByEmail } = req.body;

      // Імітація отримання переможця з БД
      const winner = {
        id: winnerId,
        status: 'ANNOUNCED',
        appealDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        appealedAt: null
      };

      const now = new Date();
      if (now > winner.appealDeadline) {
        return res.status(400).json({
          success: false,
          error: 'Дедлайн для оскарження пройшов',
          appealDeadlineWas: winner.appealDeadline
        });
      }

      winner.appealedAt = now;
      winner.status = 'CHALLENGED';

      return res.status(200).json({
        success: true,
        data: winner,
        message: 'Оскарження рішення про переможця зареєстровано',
        nextStep: 'Очікування розгляду АМКУ',
        appealDocumentUrl: appealDocument
      });
    } catch (error) {
      console.error('❌ Error handling winner appeal:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/winner/:procurementId/details
   * Отримати деталі рішення про переможця
   */
  async getWinnerDetails(req, res) {
    try {
      const { procurementId } = req.params;

      // Імітація отримання з БД
      const winner = {
        id: 'win-1',
        procurementId,
        participantName: 'ТОВ Переможець',
        participantCode: '12345678',
        selectionCriteria: 'LOWEST_PRICE',
        score: 95,
        winningBid: 150000000,
        status: 'ANNOUNCED',
        announcedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        appealDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        appealedAt: null
      };

      const hoursUntilDeadline = Math.round(
        (winner.appealDeadline - new Date()) / (1000 * 60 * 60)
      );

      return res.status(200).json({
        success: true,
        data: {
          ...winner,
          hoursUntilAppealDeadline: hoursUntilDeadline,
          canBeAppealed: hoursUntilDeadline > 0
        }
      });
    } catch (error) {
      console.error('❌ Error getting winner details:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/winner/report/status
   * Звіт про статус визначення переможців
   */
  async getWinnerStatusReport(req, res) {
    try {
      const report = {
        generatedAt: new Date(),
        summary: {
          total: 10,
          preliminary: 2,
          announced: 5,
          confirmed: 2,
          challenged: 1
        },
        winners: [
          {
            procurementId: 'UA-2026-06-05-001-a',
            winnerName: 'ТОВ Переможець',
            selectionCriteria: 'LOWEST_PRICE',
            winningBid: 150000000,
            status: 'ANNOUNCED',
            announcedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            appealDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
          }
        ]
      };

      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('❌ Error generating winner report:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/winner/report/appeals
   * Звіт про оскарження рішень про переможців
   */
  async getWinnerAppealsReport(req, res) {
    try {
      const report = {
        generatedAt: new Date(),
        summary: {
          total: 3,
          pending: 2,
          upheld: 0,
          overturned: 1
        },
        appeals: [
          {
            winnerId: 'win-1',
            procurementId: 'UA-2026-06-05-001-a',
            winnerName: 'ТОВ Переможець',
            appearedBy: 'ТОВ Конкурент',
            appealedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
            appealReason: 'Неправильна оцінка пропозиції'
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

export default new WinnerController();
