// Timetable templates for Class 11/12 PCM/PCB aligned with Maharashtra Board, NEET, and JEE syllabi

const timetableTemplates = {
    pcm: {
        class11: {
            subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
            slots: [
                { day: "Monday", time: "9:00 AM - 10:00 AM", subject: "Physics" },
                { day: "Monday", time: "10:00 AM - 11:00 AM", subject: "Chemistry" },
                // Additional slots...
            ]
        },
        class12: {
            subjects: ["Physics", "Chemistry", "Mathematics"],
            slots: [
                { day: "Tuesday", time: "9:00 AM - 10:00 AM", subject: "Mathematics" },
                { day: "Tuesday", time: "10:00 AM - 11:00 AM", subject: "Physics" },
                // Additional slots...
            ]
        }
    },
    pcb: {
        class11: {
            subjects: ["Physics", "Chemistry", "Biology", "Mathematics"],
            slots: [
                { day: "Wednesday", time: "9:00 AM - 10:00 AM", subject: "Biology" },
                { day: "Wednesday", time: "10:00 AM - 11:00 AM", subject: "Physics" },
                // Additional slots...
            ]
        },
        class12: {
            subjects: ["Physics", "Chemistry", "Biology"],
            slots: [
                { day: "Thursday", time: "9:00 AM - 10:00 AM", subject: "Chemistry" },
                { day: "Thursday", time: "10:00 AM - 11:00 AM", subject: "Biology" },
                // Additional slots...
            ]
        }
    }
};

export default timetableTemplates;