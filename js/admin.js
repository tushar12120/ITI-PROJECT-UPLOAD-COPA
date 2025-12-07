// Admin Panel Functions

// Use supabaseDB from supabase-config.js
const supabaseDB = window.supabaseClient;

// ============================================
// ADMIN LOGIN
// ============================================

// Default admin password (hardcoded - no database call)
const ADMIN_PASSWORD = 'ITI@345001';

async function adminLogin(password) {
    // Simple password check - no Supabase call needed
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        return { success: true };
    } else {
        return { success: false, message: 'Invalid password' };
    }
}

// ============================================
// PROJECTS MANAGEMENT
// ============================================

// Get all projects
async function getProjects() {
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

// Create new project
async function createProject(title, description, deadline, file) {
    try {
        let fileUrl = null;
        let fileName = null;

        // Upload file if provided
        if (file) {
            const fileExt = file.name.split('.').pop();
            const filePath = `${Date.now()}_${file.name}`;

            const { data: uploadData, error: uploadError } = await supabaseDB.storage
                .from('project-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabaseDB.storage
                .from('project-files')
                .getPublicUrl(filePath);

            fileUrl = urlData.publicUrl;
            fileName = file.name;
        }

        // Insert project
        // Convert deadline to ISO string with timezone if provided
        let deadlineISO = null;
        if (deadline) {
            // datetime-local gives YYYY-MM-DDTHH:MM format
            // We need to add timezone offset for India (+05:30)
            deadlineISO = deadline + ':00+05:30';
        }

        const { data, error } = await supabaseDB
            .from('projects')
            .insert([{
                title,
                description,
                deadline: deadlineISO,
                file_url: fileUrl,
                file_name: fileName
            }])
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('Error creating project:', err);
        return { success: false, message: err.message };
    }
}

// Update project
async function updateProject(id, title, description, deadline) {
    try {
        // Convert deadline to ISO string with timezone if provided
        let deadlineISO = null;
        if (deadline) {
            deadlineISO = deadline + ':00+05:30';
        }

        const { data, error } = await supabaseDB
            .from('projects')
            .update({
                title,
                description,
                deadline: deadlineISO
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('Error updating project:', err);
        return { success: false, message: err.message };
    }
}

// Delete project
async function deleteProject(id) {
    try {
        const { error } = await supabaseDB
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error('Error deleting project:', err);
        return { success: false, message: err.message };
    }
}

// ============================================
// STUDENTS MANAGEMENT
// ============================================

// Get all students
async function getStudents() {
    try {
        const { data, error } = await supabaseDB
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching students:', err);
        return [];
    }
}

// Delete student
async function deleteStudent(id) {
    try {
        const { error } = await supabaseDB
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error('Error deleting student:', err);
        return { success: false, message: err.message };
    }
}

// Get submissions by student ID
async function getStudentSubmissions(studentId) {
    try {
        const { data, error } = await supabaseDB
            .from('submissions')
            .select(`
                *,
                projects (title)
            `)
            .eq('student_id', studentId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching student submissions:', err);
        return [];
    }
}

// ============================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================

// Get all announcements
async function getAnnouncements() {
    try {
        const { data, error } = await supabaseDB
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching announcements:', err);
        return [];
    }
}

// Create announcement
async function createAnnouncement(title, message, isImportant = false) {
    try {
        const { data, error } = await supabaseDB
            .from('announcements')
            .insert([{
                title,
                message,
                is_important: isImportant
            }])
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('Error creating announcement:', err);
        return { success: false, message: err.message };
    }
}

// Delete announcement
async function deleteAnnouncement(id) {
    try {
        const { error } = await supabaseDB
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error('Error deleting announcement:', err);
        return { success: false, message: err.message };
    }
}

// ============================================
// SUBMISSIONS MANAGEMENT
// ============================================

// Get all submissions with student and project info
async function getSubmissions() {
    try {
        const { data, error } = await supabaseDB
            .from('submissions')
            .select(`
                *,
                students (name, email),
                projects (title)
            `)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching submissions:', err);
        return [];
    }
}

// Update submission status
async function updateSubmissionStatus(submissionId, status, comment = null) {
    try {
        const updateData = { status };
        if (comment) {
            updateData.admin_comment = comment;
        }

        const { data, error } = await supabaseDB
            .from('submissions')
            .update(updateData)
            .eq('id', submissionId)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('Error updating submission:', err);
        return { success: false, message: err.message };
    }
}

// Accept submission
async function acceptSubmission(submissionId, comment = '') {
    return await updateSubmissionStatus(submissionId, 'accepted', comment || 'Project approved by instructor');
}

// Reject submission
async function rejectSubmission(submissionId, comment = '') {
    return await updateSubmissionStatus(submissionId, 'rejected', comment || 'Please review and re-submit');
}

// ============================================
// DASHBOARD STATS
// ============================================

async function getDashboardStats() {
    try {
        const [students, projects, submissions] = await Promise.all([
            supabaseDB.from('students').select('id', { count: 'exact' }),
            supabaseDB.from('projects').select('id', { count: 'exact' }),
            supabaseDB.from('submissions').select('id', { count: 'exact' })
        ]);

        return {
            totalStudents: students.count || 0,
            totalProjects: projects.count || 0,
            totalSubmissions: submissions.count || 0
        };
    } catch (err) {
        console.error('Error fetching stats:', err);
        return { totalStudents: 0, totalProjects: 0, totalSubmissions: 0 };
    }
}

// ============================================
// UI RENDERERS
// ============================================

// Render projects table
function renderProjectsTable(projects, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <h3>No Projects Yet</h3>
                <p>Create your first project to get started</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Deadline</th>
                        <th>File</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(p => `
                        <tr>
                            <td><strong>${p.title}</strong></td>
                            <td>${p.description || '-'}</td>
                            <td>${p.deadline ? formatDateTime(p.deadline) : '-'}</td>
                            <td>
                                ${p.file_url ? `<a href="${p.file_url}" target="_blank" class="btn btn-sm btn-secondary">📥 Download</a>` : '-'}
                            </td>
                            <td>
                                <button onclick="openEditProject('${p.id}', '${p.title.replace(/'/g, "\\'")}', '${(p.description || '').replace(/'/g, "\\'")}', '${p.deadline || ''}')" class="btn btn-sm btn-primary">✏️ Edit</button>
                                <button onclick="handleDeleteProject('${p.id}')" class="btn btn-sm btn-danger">🗑️ Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render students table
function renderStudentsTable(students, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (students.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <h3>No Students Yet</h3>
                <p>Students will appear here after they register</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Trade</th>
                        <th>Registered On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(s => `
                        <tr>
                            <td><strong>${s.name}</strong></td>
                            <td>${s.email}</td>
                            <td><span class="badge badge-primary">${s.trade}</span></td>
                            <td>${formatDate(s.created_at)}</td>
                            <td>
                                <button onclick="viewStudentSubmissions('${s.id}', '${s.name}')" class="btn btn-sm btn-primary">📋 Submissions</button>
                                <button onclick="handleDeleteStudent('${s.id}')" class="btn btn-sm btn-danger">🗑️ Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render submissions table
function renderSubmissionsTable(submissions, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (submissions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📤</div>
                <h3>No Submissions Yet</h3>
                <p>Student submissions will appear here</p>
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
                        <th>Student</th>
                        <th>Project</th>
                        <th>File</th>
                        <th>Review</th>
                        <th>Status</th>
                        <th>Submitted On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${submissions.map(s => {
        // Determine file type icon
        const fileName = s.file_name || '';
        const ext = fileName.split('.').pop().toLowerCase();
        let fileIcon = '📄';
        let fileType = 'File';

        if (['doc', 'docx'].includes(ext)) {
            fileIcon = '📝';
            fileType = 'Word';
        } else if (['xls', 'xlsx'].includes(ext)) {
            fileIcon = '📊';
            fileType = 'Excel';
        } else if (['ppt', 'pptx'].includes(ext)) {
            fileIcon = '📽️';
            fileType = 'PowerPoint';
        } else if (ext === 'pdf') {
            fileIcon = '📕';
            fileType = 'PDF';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            fileIcon = '🖼️';
            fileType = 'Image';
        } else if (['zip', 'rar'].includes(ext)) {
            fileIcon = '📦';
            fileType = 'Archive';
        }

        return `
                        <tr>
                            <td>
                                <strong>${s.students?.name || 'Unknown'}</strong>
                                <br><small class="text-muted">${s.students?.email || ''}</small>
                            </td>
                            <td>${s.projects?.title || 'Unknown Project'}</td>
                            <td>
                                <span class="badge badge-primary">${fileIcon} ${fileType}</span>
                                <br><small class="text-muted">${fileName}</small>
                            </td>
                            <td>
                                ${['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ?
                `<button onclick="openFilePreview('${s.file_url}', '${fileName}')" class="btn btn-sm btn-primary" title="Preview file">
                                        👁️ Preview
                                    </button>` : ''}
                                <a href="${s.file_url}" target="_blank" class="btn btn-sm btn-success" title="Download file">
                                    📥 Download
                                </a>
                            </td>
                            <td>${getStatusBadge(s.status)}</td>
                            <td>${formatDateTime(s.submitted_at)}</td>
                            <td>
                                ${s.status === 'pending' ? `
                                    <button onclick="handleAcceptSubmission('${s.id}')" class="btn btn-sm btn-success">✅ Accept</button>
                                    <button onclick="handleRejectSubmission('${s.id}')" class="btn btn-sm btn-danger">❌ Reject</button>
                                ` : s.status === 'accepted' ? `
                                    <button onclick="handleRejectSubmission('${s.id}')" class="btn btn-sm btn-danger">❌ Reject</button>
                                ` : `
                                    <button onclick="handleAcceptSubmission('${s.id}')" class="btn btn-sm btn-success">✅ Accept</button>
                                `}
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Handle delete project
async function handleDeleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const result = await deleteProject(id);
    if (result.success) {
        showToast('Project deleted successfully', 'success');
        loadProjects(); // Refresh list
    } else {
        showToast('Failed to delete project', 'danger');
    }
}

// Handle delete student
async function handleDeleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    const result = await deleteStudent(id);
    if (result.success) {
        showToast('Student deleted successfully', 'success');
        loadStudents(); // Refresh list
    } else {
        showToast('Failed to delete student', 'danger');
    }
}

// Handle accept submission
async function handleAcceptSubmission(id) {
    const comment = prompt('Optional: Add a comment for the student (or leave empty):');

    const result = await acceptSubmission(id, comment);
    if (result.success) {
        showToast('✅ Submission accepted!', 'success');
        loadSubmissions(); // Refresh list
    } else {
        showToast('Failed to accept submission', 'danger');
    }
}

// Handle reject submission
async function handleRejectSubmission(id) {
    const comment = prompt('Add rejection reason (student can re-upload after this):');
    if (comment === null) return; // User cancelled

    const result = await rejectSubmission(id, comment || 'Please review and re-submit');
    if (result.success) {
        showToast('❌ Submission rejected! Student can now re-upload.', 'warning');
        loadSubmissions(); // Refresh list
    } else {
        showToast('Failed to reject submission', 'danger');
    }
}
