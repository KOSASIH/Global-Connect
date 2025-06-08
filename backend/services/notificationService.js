// backend/services/notificationService.js
class NotificationService {
    // Send a notification to a user
    static async sendNotification(userId, message) {
        // In a real application, this could send an email, SMS, or push notification
        console.log(`Notification sent to ${userId}: ${message}`);
        return { userId, message, status: 'sent' };
    }

    // Send transaction success notification
    static async notifyTransactionSuccess(userId, transactionId) {
        const message = `Your transaction with ID ${transactionId} was successful.`;
        return await this.sendNotification(userId, message);
    }

    // Send transaction failure notification
    static async notifyTransactionFailure(userId, transactionId) {
        const message = `Your transaction with ID ${transactionId} failed. Please try again.`;
        return await this.sendNotification(userId, message);
    }
}

module.exports = NotificationService;
