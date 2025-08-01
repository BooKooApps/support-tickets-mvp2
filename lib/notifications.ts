import { whopSdk } from '@/lib/whop-api';
import { prisma } from '@/lib/prisma';

export type NotificationType =
  | 'NEW_TICKET'
  | 'TICKET_CLAIMED'
  | 'TICKET_CLOSED'
  | 'NEW_MESSAGE';

interface TicketInfo {
  id: string;
  title: string;
  creatorId: string;
}

interface CompanyInfo {
  id: string;
  title: string;
}

// New Ticket Notifications
export async function sendNewTicketNotifications(
  ticket: TicketInfo,
  company: CompanyInfo,
  experienceId: string
) {
  try {
    // Get admin user IDs for this company
    const adminUserRoles = await prisma.userRole.findMany({
      where: {
        companyId: company.id,
        role: 'admin',
      },
    });

    const adminUserIds = adminUserRoles.map(userRole => userRole.userId);

    // Admin notification
    const adminNotificationInfo = {
      title: 'New Ticket',
      subtitle: ticket.title || '',
      content: `${company.title}`,
    };

    // Creator notification
    const creatorNotificationInfo = {
      title: 'New Ticket Confirmed',
      subtitle: company.title || '',
      content: `Thank you for opening a ticket. We will get back to you as soon as possible.`,
    };

    // Send notification to admins
    if (adminUserIds.length > 0) {
      await whopSdk.notifications.sendPushNotification({
        ...adminNotificationInfo,
        experienceId: experienceId,
        externalId: ticket.id,
        isMention: true,
        restPath: `/customer?tab=TICKETS`,
        senderUserId: ticket.creatorId,
        userIds: adminUserIds,
      });
    }

    // Send notification to creator
    await whopSdk.notifications.sendPushNotification({
      ...creatorNotificationInfo,
      experienceId: experienceId,
      externalId: ticket.id,
      isMention: true,
      restPath: `/customer?tab=TICKETS`,
      senderUserId: ticket.creatorId,
      userIds: [ticket.creatorId],
    });

    console.log(`New ticket notifications sent for ticket ${ticket.id}`);
  } catch (error) {
    console.error('Error sending new ticket notifications:', error);
  }
}

// Ticket Claimed Notifications
export async function sendTicketClaimedNotifications(
  ticket: TicketInfo,
  company: CompanyInfo,
  experienceId: string
) {
  try {
    // Get admin user IDs for this company
    const adminUserRoles = await prisma.userRole.findMany({
      where: {
        companyId: company.id,
        role: 'admin',
      },
    });

    const adminUserIds = adminUserRoles.map(userRole => userRole.userId);

    // Admin notification
    const adminNotificationInfo = {
      title: company.title || '',
      subtitle: 'Ticket Claimed',
      content: ticket.title,
    };

    // Creator notification
    const creatorNotificationInfo = {
      title: company.title || '',
      subtitle: 'Ticket claimed',
      content: ticket.title,
    };

    // Send notification to admins
    if (adminUserIds.length > 0) {
      await whopSdk.notifications.sendPushNotification({
        ...adminNotificationInfo,
        experienceId: experienceId,
        externalId: ticket.id,
        isMention: true,
        restPath: `/customer?tab=TICKETS`,
        userIds: adminUserIds,
      });
    }

    // Send notification to creator
    await whopSdk.notifications.sendPushNotification({
      ...creatorNotificationInfo,
      experienceId: experienceId,
      externalId: ticket.id,
      isMention: true,
      restPath: `/customer?tab=TICKETS`,
      userIds: [ticket.creatorId],
    });

    console.log(`Ticket claimed notifications sent for ticket ${ticket.id}`);
  } catch (error) {
    console.error('Error sending ticket claimed notifications:', error);
  }
}

// Ticket Closed Notifications
export async function sendTicketClosedNotifications(
  ticket: TicketInfo,
  company: CompanyInfo,
  experienceId: string
) {
  try {
    // Get admin user IDs for this company
    const adminUserRoles = await prisma.userRole.findMany({
      where: {
        companyId: company.id,
        role: 'admin',
      },
    });

    const adminUserIds = adminUserRoles.map(userRole => userRole.userId);

    // Admin notification
    const adminNotificationInfo = {
      title: 'Ticket Closed',
      subtitle: ticket.title || '',
      content: `${company.title}`,
    };

    // Creator notification
    const creatorNotificationInfo = {
      title: 'Ticket Closed',
      subtitle: company.title || '',
      content: `Your ticket has been closed. Thank you for reaching out!`,
    };

    // Send notification to admins
    if (adminUserIds.length > 0) {
      await whopSdk.notifications.sendPushNotification({
        ...adminNotificationInfo,
        experienceId: experienceId,
        externalId: ticket.id,
        isMention: true,
        restPath: `/customer?tab=TICKETS`,
        userIds: adminUserIds,
      });
    }

    // Send notification to creator
    await whopSdk.notifications.sendPushNotification({
      ...creatorNotificationInfo,
      experienceId: experienceId,
      externalId: ticket.id,
      isMention: true,
      restPath: `/customer?tab=TICKETS`,
      userIds: [ticket.creatorId],
    });

    console.log(`Ticket closed notifications sent for ticket ${ticket.id}`);
  } catch (error) {
    console.error('Error sending ticket closed notifications:', error);
  }
}

// New Message Notifications
export async function sendNewMessageNotifications(
  messageContent: string,
  ticket: TicketInfo,
  senderId: string,
  companyId: string,
  experienceId: string
) {
  try {
    const notification_content =
      messageContent.length > 100
        ? messageContent.slice(0, 100) + '...'
        : messageContent;

    if (senderId === ticket.creatorId) {
      // Message sent by creator, notify admins
      const adminUserRoles = await prisma.userRole.findMany({
        where: {
          companyId: companyId,
          role: 'admin',
        },
      });

      // Send notification to all admins except the sender (if sender is also admin)
      const adminRecipientIds = adminUserRoles
        .map(userRole => userRole.userId)
        .filter(id => id !== senderId);

      if (adminRecipientIds.length > 0) {
        await whopSdk.notifications.sendPushNotification({
          title: 'New Message',
          subtitle: ticket.title || '',
          content: notification_content,
          experienceId: experienceId,
          externalId: ticket.id,
          isMention: true,
          restPath: `/customer?tab=TICKETS`,
          userIds: adminRecipientIds,
        });
      }
    } else {
      // Message sent by admin, notify ticket creator
      if (ticket.creatorId && ticket.creatorId !== senderId) {
        await whopSdk.notifications.sendPushNotification({
          title: 'New Message',
          subtitle: ticket.title || '',
          content: notification_content,
          experienceId: experienceId,
          externalId: ticket.id,
          isMention: true,
          restPath: `/customer?tab=TICKETS`,
          userIds: [ticket.creatorId],
        });
      }
    }

    console.log(`New message notifications sent for ticket ${ticket.id}`);
  } catch (error) {
    console.error('Error sending new message notifications:', error);
  }
}
