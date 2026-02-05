// Student Portal Functions

// Use supabaseDB from supabaseDB-config.js
const supabaseDB = window.supabaseClient;

// ============================================
// STUDENT AUTHENTICATION
// ============================================

// Register new student
async function registerStudent(name, email, password) {
    try {
        // Check if email already exists
        const { data: existing } = await supabaseDB
            .from('students')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return { success: false, message: 'Email already registered. Please login.' };
        }

        // Create new student
        const { data, error } = await supabaseDB
            .from('students')
            .insert([{
                name,
                email,
                password,
                trade: 'COPA'
            }])
            .select()
            .single();

        if (error) throw error;

        // Auto login after registration
        sessionStorage.setItem('studentLoggedIn', 'true');
        sessionStorage.setItem('studentData', JSON.stringify(data));

        return { success: true, data };
    } catch (err) {
        console.error('Registration error:', err);
        return { success: false, message: err.message };
    }
}

// Student login
async function studentLogin(email, password) {
    try {
        const { data, error } = await supabaseDB
            .from('students')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (error || !data) {
            return { success: false, message: 'Invalid email or password' };
        }

        sessionStorage.setItem('studentLoggedIn', 'true');
        sessionStorage.setItem('studentData', JSON.stringify(data));

        return { success: true, data };
    } catch (err) {
        console.error('Login error:', err);
        return { success: false, message: 'Login failed. Please try again.' };
    }
}

// ============================================
// PROJECTS (Student View)
// ============================================

// Get available projects
async function getAvailableProjects() {
    try {
        const { data, error } = await supabaseDB
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching projects:', err);
        return [];
    }
}

// ============================================
// SUBMISSIONS
// ============================================

// Check submission status for a project
async function getSubmissionStatus(projectId) {
    try {
        const student = getCurrentStudent();
        if (!student) return null;

        const { data, error } = await supabaseDB
            .from('submissions')
            .select('id, status, admin_comment')
            .eq('student_id', student.id)
            .eq('project_id', projectId)
            .order('submitted_at', { ascending: false })
            .limit(1)
            .single();

        return data || null;
    } catch (err) {
        return null;
    }
}

// Submit project
async function submitProject(projectId, file) {
    try {
        const student = getCurrentStudent();
        if (!student) {
            return { success: false, message: 'Please login first' };
        }

        // Validate file type - Only PDF allowed
        if (file.name.split('.').pop().toLowerCase() !== 'pdf') {
            return {
                success: false,
                message: '❌ केवल PDF files allowed हैं! / Only PDF files are allowed!'
            };
        }

        // Check project deadline first
        const { data: project } = await supabaseDB
            .from('projects')
            .select('title, deadline')
            .eq('id', projectId)
            .single();

        if (project && project.deadline) {
            const deadlineDate = new Date(project.deadline);
            const now = new Date();
            if (now > deadlineDate) {
                return {
                    success: false,
                    message: '❌ Deadline समाप्त हो चुकी है! इस project के लिए अब submission नहीं हो सकती।',
                    deadlineExpired: true
                };
            }
        }

        // Check if already submitted with pending or accepted status
        const existingSubmission = await getSubmissionStatus(projectId);
        if (existingSubmission) {
            if (existingSubmission.status === 'pending') {
                return {
                    success: false,
                    message: '⏳ आपने पहले से ही यह project submit कर दिया है। Instructor के review का इंतज़ार करें।',
                    alreadySubmitted: true
                };
            }
            if (existingSubmission.status === 'accepted') {
                return {
                    success: false,
                    message: '✅ आपका project पहले से Accept हो चुका है! दोबारा submit करने की ज़रूरत नहीं।',
                    alreadySubmitted: true
                };
            }
            // If rejected, allow re-submission (we'll delete old one)
            if (existingSubmission.status === 'rejected') {
                await supabaseDB
                    .from('submissions')
                    .delete()
                    .eq('id', existingSubmission.id);
            }
        }

        // Create unique filename: StudentName_ProjectTitle_timestamp.ext
        const fileExt = file.name.split('.').pop();
        const safeName = student.name.replace(/\s+/g, '_');
        const safeTitle = project?.title?.replace(/\s+/g, '_') || 'Project';
        const fileName = `${safeName}_${safeTitle}_${Date.now()}.${file.name.split('.').pop().toLowerCase()}`;

        // Upload file
        const { data: uploadData, error: uploadError } = await supabaseDB.storage
            .from('submissions')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabaseDB.storage
            .from('submissions')
            .getPublicUrl(fileName);

        // Create submission record
        const { data, error } = await supabaseDB
            .from('submissions')
            .insert([{
                student_id: student.id,
                project_id: projectId,
                file_url: urlData.publicUrl,
                file_name: file.name,
                status: 'pending'
            }])
            .select();

        if (error) throw error;

        return { success: true, data };
    } catch (err) {
        console.error('Submission error:', err);
        return { success: false, message: err.message };
    }
}

// Get my submissions
async function getMySubmissions() {
    try {
        const student = getCurrentStudent();
        if (!student) return [];

        const { data, error } = await supabaseDB
            .from('submissions')
            .select(`
                *,
                projects (title)
            `)
            .eq('student_id', student.id)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching submissions:', err);
        return [];
    }
}

// Check if already submitted for a project
async function hasSubmitted(projectId) {
    try {
        const student = getCurrentStudent();
        if (!student) return false;

        const { data, error } = await supabaseDB
            .from('submissions')
            .select('id')
            .eq('student_id', student.id)
            .eq('project_id', projectId);

        return data && data.length > 0;
    } catch (err) {
        return false;
    }
}

// ============================================
// UI RENDERERS
// ============================================

// Render projects grid for students
function renderStudentProjectsGrid(projects, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <h3>No Projects Available</h3>
                <p>Check back later for new assignments</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="projects-grid">
            ${projects.map(p => `
                <div class="project-card">
                    <div class="project-card-header">
                        <h3>📋 ${p.title}</h3>
                    </div>
                    <div class="project-card-body">
                        <p>${p.description || 'No description provided'}</p>
                        <div class="project-meta">
                            ${p.deadline ? (() => {
            const deadlineDate = new Date(p.deadline);
            const now = new Date();
            const isExpired = now > deadlineDate;
            const timeRemaining = deadlineDate - now;

            if (isExpired) {
                return `<span class="badge badge-danger">⏰ Deadline Expired</span>`;
            } else {
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                if (days > 0) {
                    return `<span class="badge badge-success">📅 ${days} days ${hours} hrs left</span>`;
                } else if (hours > 0) {
                    return `<span class="badge badge-warning">⏰ ${hours} hrs left</span>`;
                } else {
                    return `<span class="badge badge-warning">⏰ Less than 1 hr left</span>`;
                }
            }
        })() : ''}
                            ${p.deadline ? `<br><small class="text-muted">📅 ${formatDateTime(p.deadline)}</small>` : ''}
                        </div>
                    </div>
                    <div class="project-card-footer">
                        ${p.file_url ? `<a href="${p.file_url}" target="_blank" class="btn btn-sm btn-secondary">📥 Download</a>` : ''}
                        ${(() => {
            if (p.deadline) {
                const isExpired = new Date() > new Date(p.deadline);
                if (isExpired) {
                    return `<button class="btn btn-sm btn-danger" disabled>❌ Deadline Expired</button>`;
                }
            }
            return `<a href="submit.html?project=${p.id}" class="btn btn-sm btn-primary">📤 Submit</a>`;
        })()}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render my submissions
function renderMySubmissions(submissions, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (submissions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📤</div>
                <h3>No Submissions Yet</h3>
                <p>Submit your first project to see it here</p>
            </div>
        `;
        return;
    }

    // Helper function for status badge
    function getStatusBadge(status) {
        switch (status) {
            case 'accepted':
                return '<span class="badge badge-success">✅ Accepted</span>';
            case 'rejected':
                return '<span class="badge badge-danger">❌ Rejected</span>';
            default:
                return '<span class="badge badge-warning">⏳ Pending</span>';
        }
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>File</th>
                        <th>Status</th>
                        <th>Submitted On</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${submissions.map(s => `
                        <tr>
                            <td><strong>${s.projects?.title || 'Unknown'}</strong></td>
                            <td>
                                <a href="${s.file_url}" target="_blank" class="btn btn-sm btn-secondary">📥 ${s.file_name}</a>
                            </td>
                            <td>
                                ${getStatusBadge(s.status)}
                                ${s.admin_comment ? `<br><small class="text-muted">💬 ${s.admin_comment}</small>` : ''}
                            </td>
                            <td>${formatDateTime(s.submitted_at)}</td>
                            <td>
                                ${s.status === 'rejected' ? `<a href="submit.html?project=${s.project_id}" class="btn btn-sm btn-primary">🔄 Re-Upload</a>` : '-'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Get student dashboard stats
async function getStudentDashboardStats() {
    try {
        const student = getCurrentStudent();
        if (!student) return { totalProjects: 0, mySubmissions: 0 };

        const [projects, submissions] = await Promise.all([
            supabaseDB.from('projects').select('id', { count: 'exact' }),
            supabaseDB.from('submissions').select('id', { count: 'exact' }).eq('student_id', student.id)
        ]);

        return {
            totalProjects: projects.count || 0,
            mySubmissions: submissions.count || 0
        };
    } catch (err) {
        return { totalProjects: 0, mySubmissions: 0 };
    }
}
