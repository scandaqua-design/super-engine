/**
 * Deadline Service
 * Сервіс для управління дедлайнами та сповіщеннями
 * ПКМ №1178 - Строки в умовах воєнного стану
 */

import { v4 as uuidv4 } from 'uuid';
import { format, differenceInHours, differenceInMinutes, addHours } from 'date-fns';
import { uk } from 'date-fns/locale';

class DeadlineService {
  /**
   * Створити дедлайн
   */
  async createDeadline(procurementId, deadlineData) {
    try {
      const {
        deadlineType,
        description,
        dueDate,
        qualificationIssueId,
        assignedTo
      } = deadlineData;

      // Визначити час попередження (за типом дедлайну)
      let warningAt = null;
      if (deadlineType === 'QUALIFICATION_24H_RESPONSE') {
        warningAt = addHours(dueDate, -2); // Alert за 2 години
      } else if (deadlineType === 'BIDDING_SUBMISSION') {
        warningAt = addHours(dueDate, -24); // Alert за добу
      }

      const deadline = {
        id: uuidv4(),
        procurementId,
        deadlineType,
        description,
        dueDate,
        warningAt,
        qualificationIssueId,
        status: 'ACTIVE',
        completedAt: null,
        assignedTo,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return {
        success: true,
        data: deadline,
        message: `Дедлайн створений: ${description}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Отримати статус дедлайну
   */
  async getDeadlineStatus(deadline) {
    try {
      const now = new Date();
      const hoursUntilDeadline = differenceInHours(deadline.dueDate, now);
      const minutesUntilDeadline = differenceInMinutes(deadline.dueDate, now);

      let status = deadline.status;
      let alert = null;

      if (deadline.completedAt) {
        status = 'COMPLETED';
      } else if (hoursUntilDeadline < 0) {
        status = 'OVERDUE';
        alert = {
          type: 'OVERDUE',
          severity: 'CRITICAL',
          message: `⚠️ ДЕДЛАЙН ПРОЙШОВ! ${Math.abs(hoursUntilDeadline)} годин тому`
        };
      } else if (hoursUntilDeadline <= 2) {
        alert = {
          type: 'URGENT',
          severity: 'CRITICAL',
          message: `🔴 ТЕРМІНОВО! ${hoursUntilDeadline} годин ${minutesUntilDeadline % 60} хвилин до дедлайну`
        };
      } else if (hoursUntilDeadline <= 24) {
        alert = {
          type: 'COMING_SOON',
          severity: 'WARNING',
          message: `🟡 УВАГА! ${hoursUntilDeadline} годин до дедлайну`
        };
      }

      return {
        success: true,
        data: {
          deadline,
          status,
          hoursUntilDeadline,
          minutesUntilDeadline,
          dueDate: format(deadline.dueDate, 'dd.MM.yyyy HH:mm', { locale: uk }),
          alert
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Створити сповіщення про дедлайн
   */
  async createDeadlineAlert(procurementId, deadlineId, alertData) {
    try {
      const {
        alertType,
        message,
        severity,
        qualificationIssueId
      } = alertData;

      const alert = {
        id: uuidv4(),
        procurementId,
        deadlineId,
        qualificationIssueId,
        alertType,
        message,
        severity,
        status: 'ACTIVE',
        sentAt: new Date(),
        acknowledgedAt: null,
        acknowledgedBy: null,
        createdAt: new Date()
      };

      return {
        success: true,
        data: alert,
        message: 'Сповіщення створено'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Розпізнати сповіщення про дедлайн
   */
  async acknowledgeAlert(alert, acknowledgedByEmail) {
    try {
      alert.status = 'ACKNOWLEDGED';
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedByEmail;

      return {
        success: true,
        data: alert,
        message: 'Сповіщення розпізнано'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Отримати всі активні дедлайни для закупівлі
   */
  async getActiveDealines(procurementId, deadlines) {
    try {
      const now = new Date();
      const active = deadlines.filter(d => 
        d.procurementId === procurementId && 
        d.status === 'ACTIVE' &&
        d.dueDate > now
      );

      const sorted = active.sort((a, b) => a.dueDate - b.dueDate);

      return {
        success: true,
        data: sorted.map(d => ({
          id: d.id,
          description: d.description,
          type: d.deadlineType,
          dueDate: format(d.dueDate, 'dd.MM.yyyy HH:mm', { locale: uk }),
          hoursUntilDeadline: differenceInHours(d.dueDate, now)
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Позначити дедлайн як виконаний
   */
  async completeDeadline(deadline) {
    try {
      deadline.status = 'COMPLETED';
      deadline.completedAt = new Date();
      deadline.updatedAt = new Date();

      return {
        success: true,
        data: deadline,
        message: 'Дедлайн позначений як виконаний'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Сканувати всі дедлайни й видати сповіщення
   * Запускається періодично (кожні 15 хвилин)
   */
  async scanAndAlertDeadlines(procurements, allDeadlines) {
    try {
      const alerts = [];
      const now = new Date();

      for (const procurement of procurements) {
        const procDeadlines = allDeadlines.filter(d => d.procurementId === procurement.id);

        for (const deadline of procDeadlines) {
          if (deadline.status !== 'ACTIVE' || deadline.completedAt) continue;

          const hoursUntil = differenceInHours(deadline.dueDate, now);

          // Перевірити всі типи сповіщень
          let shouldAlert = false;
          let alertType = null;
          let severity = 'INFO';

          if (hoursUntil < 0) {
            shouldAlert = true;
            alertType = 'OVERDUE';
            severity = 'CRITICAL';
          } else if (hoursUntil <= 2) {
            shouldAlert = true;
            alertType = 'URGENT';
            severity = 'CRITICAL';
          } else if (hoursUntil <= 24 && hoursUntil > 20) {
            shouldAlert = true;
            alertType = 'COMING_SOON';
            severity = 'WARNING';
          }

          if (shouldAlert) {
            const alert = {
              id: uuidv4(),
              procurementId: procurement.id,
              deadlineId: deadline.id,
              alertType,
              message: this._generateAlertMessage(deadline, hoursUntil),
              severity,
              status: 'ACTIVE',
              sentAt: now,
              acknowledgedAt: null,
              acknowledgedBy: null
            };

            alerts.push(alert);
          }
        }
      }

      return {
        success: true,
        generatedAlerts: alerts.length,
        data: alerts,
        message: `Відсканено ${alerts.length} дедлайнів, згенеровано ${alerts.length} сповіщень`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Генерувати текст сповіщення
   */
  _generateAlertMessage(deadline, hoursUntil) {
    const description = deadline.description;

    if (hoursUntil < 0) {
      return `⚠️ КРИТИЧНО! Дедлайн пройшов ${Math.abs(hoursUntil)} годин тому: "${description}"`;
    } else if (hoursUntil <= 2) {
      return `🔴 ТЕРМІНОВО! ${Math.round(hoursUntil * 60)} хвилин до дедлайну: "${description}"`;
    } else if (hoursUntil <= 24) {
      return `🟡 УВАГА! ${Math.round(hoursUntil)} годин до дедлайну: "${description}"`;
    }

    return `⏰ "${description}" - ${hoursUntil} годин`;
  }

  /**
   * Сформувати список дедлайнів для УО
   */
  async generateDeadlineReport(procurements, allDeadlines) {
    try {
      const now = new Date();
      const report = {
        generatedAt: now,
        summary: {
          total: 0,
          overdue: 0,
          urgent: 0,
          warning: 0,
          upcoming: 0
        },
        deadlines: []
      };

      for (const procurement of procurements) {
        const procDeadlines = allDeadlines.filter(d => d.procurementId === procurement.id);

        for (const deadline of procDeadlines) {
          if (deadline.status !== 'ACTIVE') continue;

          const hoursUntil = differenceInHours(deadline.dueDate, now);
          let priority = 'LOW';

          if (hoursUntil < 0) {
            priority = 'OVERDUE';
            report.summary.overdue++;
          } else if (hoursUntil <= 2) {
            priority = 'CRITICAL';
            report.summary.urgent++;
          } else if (hoursUntil <= 24) {
            priority = 'HIGH';
            report.summary.warning++;
          } else if (hoursUntil <= 72) {
            priority = 'MEDIUM';
            report.summary.upcoming++;
          }

          report.deadlines.push({
            id: deadline.id,
            procurement: procurement.uaId,
            description: deadline.description,
            type: deadline.deadlineType,
            dueDate: format(deadline.dueDate, 'dd.MM.yyyy HH:mm', { locale: uk }),
            hoursUntil: Math.round(hoursUntil),
            priority,
            assignedTo: deadline.assignedTo
          });

          report.summary.total++;
        }
      }

      // Відсортувати за пріоритетом
      const priorityOrder = { OVERDUE: 0, CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      report.deadlines.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      return {
        success: true,
        data: report
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new DeadlineService();
