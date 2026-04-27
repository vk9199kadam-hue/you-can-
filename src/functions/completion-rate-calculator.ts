import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

export const calculateCompletionRate = functions.https.onRequest(async (request, response) => {
    const { scheduleId } = request.body;
    if (!scheduleId) {
        return response.status(400).send('Missing scheduleId in request body.');
    }

    try {
        // Fetch homework submissions and test scores linked to the schedule entry
        const submissionsSnapshot = await admin.firestore().collection('submissions').where('scheduleId', '==', scheduleId).get();
        const scoresSnapshot = await admin.firestore().collection('scores').where('scheduleId', '==', scheduleId).get();

        const totalSubmissions = submissionsSnapshot.size;
        const totalScores = scoresSnapshot.size;

        // Calculate completion rate
        const completionRate = (totalSubmissions + totalScores) > 0 ? (totalSubmissions / (totalSubmissions + totalScores)) * 100 : 0;

        return response.status(200).send({ completionRate });
    } catch (error) {
        console.error('Error calculating completion rate:', error);
        return response.status(500).send('Internal server error');
    }
});