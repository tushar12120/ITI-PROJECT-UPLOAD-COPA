// Exam Site Supabase Configuration
// This connects to the exam/test system database

const EXAM_SUPABASE_URL = 'https://ovdqugnzhbagsjnjgljs.supabase.co';
const EXAM_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZHF1Z256aGJhZ3NqbmpnbGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjQxNzksImV4cCI6MjA3OTg0MDE3OX0.b9BizXHK-3cMHmMOh3N7oKHowXOMpg8YTMVrm_C3uZo';

// Initialize Exam Supabase client
const examSupabase = window.supabase.createClient(EXAM_SUPABASE_URL, EXAM_SUPABASE_KEY);

// Fetch student results from exam database by name
async function getStudentResults(studentName) {
    try {
        const { data, error } = await examSupabase
            .from('results')
            .select('*')
            .ilike('student_name', studentName)
            .eq('status', 'completed')
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching exam results:', err);
        return [];
    }
}

// Fetch student results from exam database by student_id
async function getStudentResultsById(studentId) {
    try {
        const { data, error } = await examSupabase
            .from('results')
            .select('*')
            .eq('student_id', studentId)
            .eq('status', 'completed')
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching exam results by ID:', err);
        return [];
    }
}
