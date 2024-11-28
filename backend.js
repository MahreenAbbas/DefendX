const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB (Replace with your MongoDB URI if using MongoDB Atlas)
mongoose.connect('mongodb://localhost:27017/defendx', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// Consultation Schema
const consultationSchema = new mongoose.Schema({
    user_name: { type: String, required: true },
    consultation_date: { type: Date, required: true },
    consultation_time: { type: String, required: true },
    feedback: { type: String, default: '' },
    status: { type: String, default: 'Scheduled' }, // E.g., Scheduled, Completed, Canceled
    follow_up: { type: Boolean, default: false },
    reminder: { type: Date, default: null }
});

// Model for consultations
const Consultation = mongoose.model('Consultation', consultationSchema);

// Routes

// UC-1: Consultation Scheduling
app.post('/schedule-consultation', async (req, res) => {
    const { user_name, consultation_date, consultation_time } = req.body;

    const consultation = new Consultation({
        user_name,
        consultation_date,
        consultation_time
    });

    try {
        await consultation.save();
        res.status(201).send('Consultation scheduled successfully');
    } catch (error) {
        res.status(400).send('Error scheduling consultation: ' + error.message);
    }
});

// UC-2: Security Stack Submission
app.post('/submit-security-stack', async (req, res) => {
    const { user_name, security_stack } = req.body;

    // Here you would process the security stack data (this is just a mockup)
    console.log(`${user_name}'s security stack: `, security_stack);

    res.send('Security stack submitted successfully');
});

// UC-3: Real-Time Chat/Video Call (Mock route for now)
app.get('/start-chat/:consultationId', (req, res) => {
    const consultationId = req.params.consultationId;
    // This would initiate a chat or video call in a real application
    res.send(`Starting chat for consultation ID: ${consultationId}`);
});

// UC-4: Post-Consultation Feedback
app.post('/submit-feedback', async (req, res) => {
    const { consultation_id, feedback } = req.body;

    try {
        const consultation = await Consultation.findById(consultation_id);
        if (consultation) {
            consultation.feedback = feedback;
            consultation.status = 'Completed';
            await consultation.save();
            res.send('Feedback submitted successfully');
        } else {
            res.status(404).send('Consultation not found');
        }
    } catch (error) {
        res.status(400).send('Error submitting feedback: ' + error.message);
    }
});

// UC-5: Consultation History
app.get('/consultation-history/:userName', async (req, res) => {
    const { userName } = req.params;
    try {
        const consultations = await Consultation.find({ user_name: userName });
        res.status(200).json(consultations);
    } catch (error) {
        res.status(400).send('Error retrieving consultation history: ' + error.message);
    }
});

// UC-6: Consultation Reminders
app.post('/set-reminder', async (req, res) => {
    const { consultation_id, reminder_date } = req.body;

    try {
        const consultation = await Consultation.findById(consultation_id);
        if (consultation) {
            consultation.reminder = new Date(reminder_date);
            await consultation.save();
            res.send(`Reminder set for consultation ID: ${consultation_id}`);
        } else {
            res.status(404).send('Consultation not found');
        }
    } catch (error) {
        res.status(400).send('Error setting reminder: ' + error.message);
    }
});

// UC-7: Follow-Up Consultations
app.post('/request-follow-up', async (req, res) => {
    const { consultation_id, follow_up_request } = req.body;

    try {
        const consultation = await Consultation.findById(consultation_id);
        if (consultation) {
            consultation.follow_up = true;
            await consultation.save();
            res.send(`Follow-up request sent for consultation ID: ${consultation_id}`);
        } else {
            res.status(404).send('Consultation not found');
        }
    } catch (error) {
        res.status(400).send('Error requesting follow-up: ' + error.message);
    }
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
