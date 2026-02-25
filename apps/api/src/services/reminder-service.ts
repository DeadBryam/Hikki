import { logger } from "@/config/logger";
import type { ReminderRepository } from "@/database/repositories/reminder-repository";
import type { UserRepository } from "@/database/repositories/user-repository";
import { EmailService } from "@/services/email-service";
import {
  isPusherConfigured,
  NotificationEvents,
  triggerUserNotification,
} from "@/services/pusher";
import { reminderEmitter } from "@/services/reminder-events";

interface ReminderServiceDeps {
  reminderRepository: ReminderRepository;
  userRepository: UserRepository;
}

export class ReminderService {
  private readonly reminderRepository: ReminderRepository;
  private readonly userRepository: UserRepository;
  private readonly emailService: EmailService;

  constructor({ reminderRepository, userRepository }: ReminderServiceDeps) {
    this.reminderRepository = reminderRepository;
    this.userRepository = userRepository;
    this.emailService = new EmailService();
  }

  createReminder(item: {
    userId: string;
    message: string;
    type: "one-time" | "recurrent";
    scheduleAt: string;
    repeatPattern?: string;
    channel: "in-app" | "email" | "push" | "all";
  }) {
    const reminder = this.reminderRepository.createReminder(item);
    logger.info(`Reminder created: ${reminder.id} for user ${item.userId}`);
    return reminder;
  }

  async triggerReminder(reminderId: string) {
    const reminder = await this.reminderRepository.getReminderById(reminderId);
    if (!reminder) {
      logger.warn(`Reminder not found: ${reminderId}`);
      return;
    }

    if (reminder.status === "cancelled" || reminder.status === "completed") {
      logger.info(
        `Reminder ${reminderId} is already ${reminder.status}, skipping`
      );
      return;
    }

    const channels =
      reminder.channel === "all"
        ? ["in-app", "email", "push"]
        : [reminder.channel];

    for (const channel of channels) {
      switch (channel) {
        case "in-app":
          await this.sendInAppNotification(reminder.user_id, reminder.message);
          break;
        case "email":
          await this.sendEmailNotification(reminder.user_id, reminder.message);
          break;
        case "push":
          await this.sendPushNotification(reminder.user_id, reminder.message);
          break;
        default:
          logger.warn(`Unknown notification channel: ${channel}`);
      }
    }

    if (reminder.type === "one-time") {
      await this.reminderRepository.markAsTriggered(reminderId);
      reminderEmitter.emitReminderTriggered(reminder.user_id, reminderId);
    } else if (reminder.type === "recurrent" && reminder.repeat_pattern) {
      const nextRun = this.calculateNextRun(reminder.repeat_pattern);
      if (nextRun) {
        await this.reminderRepository.rescheduleReminder(reminderId, nextRun);
      }
    }
  }

  private async sendInAppNotification(userId: string, message: string) {
    if (!isPusherConfigured()) {
      logger.warn("Pusher not configured, skipping in-app notification");
      return;
    }
    await triggerUserNotification(userId, NotificationEvents.NEW_NOTIFICATION, {
      type: "reminder",
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private async sendEmailNotification(userId: string, message: string) {
    const user = await this.userRepository.findById(userId);
    if (!user?.email) {
      logger.warn(`User ${userId} not found or has no email`);
      return;
    }
    await this.emailService.sendReminderEmail(user.email, message);
  }

  private async sendPushNotification(userId: string, message: string) {
    logger.info(`Push notification to ${userId}: ${message}`);
    // TODO: Implement push notification (Web Push API, FCM, etc.)
    await Promise.resolve(); // Placeholder until implemented
  }

  private calculateNextRun(repeatPattern: string): string | null {
    const now = new Date();
    const next = new Date(now);

    switch (repeatPattern) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        logger.warn(`Unknown repeat pattern: ${repeatPattern}`);
        return null;
    }

    return next.toISOString();
  }

  getRemindersByUser(userId: string) {
    return this.reminderRepository.getRemindersByUser(userId);
  }

  getReminders(userId: string) {
    return this.reminderRepository.getRemindersByUser(userId);
  }

  getRemindersByUserAll(userId: string) {
    return this.reminderRepository.getRemindersByUserAll(userId);
  }

  deleteReminder(id: string, userId: string) {
    return this.reminderRepository.deleteReminder(id, userId);
  }

  cancelReminder(id: string, userId: string) {
    return this.reminderRepository.deleteReminder(id, userId);
  }
}
