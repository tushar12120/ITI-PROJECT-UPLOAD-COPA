// My Results Page JavaScript
// This file handles exam results display for students

let currentResult = null;

// Search results by student ID
async function searchResults() {
    const studentId = document.getElementById('studentIdInput').value.trim();

    if (!studentId) {
        showToast('Please enter your Student ID', 'danger');
        return;
    }

    if (studentId.length !== 7) {
        showToast('Student ID must be exactly 7 digits', 'danger');
        return;
    }

    const searchBtn = document.getElementById('searchBtn');
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<span class="loader"></span> Searching...';

    document.getElementById('resultsList').innerHTML = '<div class="text-center mt-4"><span class="loader"></span><p class="text-muted mt-2">Searching results...</p></div>';

    const results = await getStudentResultsById(studentId);
    renderResults(results, studentId);

    searchBtn.disabled = false;
    searchBtn.innerHTML = '🔍 Search Results';
}

// Render results
function renderResults(results, studentId) {
    const container = document.getElementById('resultsList');

    if (!results || results.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">❌</div><h3>No Results Found</h3><p>Student ID "' + studentId + '" के लिए कोई result नहीं मिला।</p><p class="text-muted">कृपया अपना Student ID check करें।</p></div>';
        return;
    }

    const passed = results.filter(function (r) { return r.percentage >= 33; }).length;
    const avgScore = Math.round(results.reduce(function (a, b) { return a + (b.percentage || 0); }, 0) / results.length);

    let html = '<div class="stats-grid" style="margin-bottom: 1.5rem;">';
    html += '<div class="stat-card"><div class="stat-icon blue">📝</div><div class="stat-info"><h3>' + results.length + '</h3><p>Total Tests</p></div></div>';
    html += '<div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-info"><h3>' + passed + '</h3><p>Passed</p></div></div>';
    html += '<div class="stat-card"><div class="stat-icon purple">📊</div><div class="stat-info"><h3>' + avgScore + '%</h3><p>Avg Score</p></div></div>';
    html += '</div>';

    html += '<div class="table-container"><table><thead><tr><th>Test Name</th><th>Score</th><th>Percentage</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>';

    for (var i = 0; i < results.length; i++) {
        var r = results[i];
        var pctClass = r.percentage >= 60 ? 'badge-success' : (r.percentage >= 33 ? 'badge-warning' : 'badge-danger');
        var statusBadge = r.percentage >= 33 ? '<span class="badge badge-success">✅ Pass</span>' : '<span class="badge badge-danger">❌ Fail</span>';

        html += '<tr>';
        html += '<td><strong>' + (r.test_name || 'Untitled Test') + '</strong></td>';
        html += '<td>' + (r.score || 0) + ' / ' + (r.total || 0) + '</td>';
        html += '<td><span class="badge ' + pctClass + '">' + (r.percentage || 0) + '%</span></td>';
        html += '<td>' + statusBadge + '</td>';
        html += '<td>' + formatDateTime(r.timestamp) + '</td>';
        html += '<td><button onclick="viewResultDetail(' + i + ')" class="btn btn-sm btn-primary">👁️ View</button> <button onclick="downloadResultDirect(' + i + ')" class="btn btn-sm btn-success">📥 PDF</button></td>';
        html += '</tr>';
    }

    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Store results globally
    window.allResults = results;
}

// View result detail
function viewResultDetail(index) {
    currentResult = window.allResults[index];
    var pct = currentResult.percentage || 0;
    var color = pct >= 60 ? 'var(--success)' : (pct >= 33 ? 'var(--warning)' : 'var(--danger)');
    var statusClass = pct >= 33 ? 'badge-success' : 'badge-danger';
    var statusText = pct >= 33 ? '✅ PASS' : '❌ FAIL';

    document.getElementById('resultModalTitle').textContent = '📝 ' + (currentResult.test_name || 'Test Result');

    var modalHtml = '<div style="text-align: center; padding: 1rem; background: var(--bg-input); border-radius: 8px; margin-bottom: 1rem;">';
    modalHtml += '<h2 style="font-size: 3rem; color: ' + color + ';">' + pct + '%</h2>';
    modalHtml += '<p style="font-size: 1.25rem;">' + (currentResult.score || 0) + ' / ' + (currentResult.total || 0) + '</p>';
    modalHtml += '<span class="badge ' + statusClass + '" style="font-size: 1rem; padding: 0.5rem 1rem;">' + statusText + '</span></div>';
    modalHtml += '<div style="display: grid; gap: 0.75rem;">';
    modalHtml += '<p><strong>👤 Student:</strong> ' + currentResult.student_name + '</p>';
    modalHtml += '<p><strong>🎓 Trade:</strong> ' + currentResult.student_trade + '</p>';
    modalHtml += '<p><strong>📝 Test:</strong> ' + currentResult.test_name + '</p>';
    modalHtml += '<p><strong>📅 Date:</strong> ' + formatDateTime(currentResult.timestamp) + '</p></div>';

    document.getElementById('resultModalContent').innerHTML = modalHtml;
    document.getElementById('resultDetailModal').classList.add('active');
}

// Close modal
function closeResultModal() {
    document.getElementById('resultDetailModal').classList.remove('active');
    currentResult = null;
}

// Download result as PDF
function downloadResult() {
    if (!currentResult) return;
    generateResultPDF(currentResult);
}

function downloadResultDirect(index) {
    var result = window.allResults[index];
    generateResultPDF(result);
}

// Generate PDF
function generateResultPDF(result) {
    var printWindow = window.open('', '_blank');
    var scoreColor = result.percentage >= 60 ? '#10b981' : (result.percentage >= 33 ? '#f59e0b' : '#ef4444');
    var statusColor = result.percentage >= 33 ? '#10b981' : '#ef4444';
    var statusText = result.percentage >= 33 ? 'PASS' : 'FAIL';
    var dateStr = new Date(result.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    var nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    var html = '<!DOCTYPE html><html><head><title>Result - ' + result.student_name + '</title>';
    html += '<style>body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto}';
    html += '.header{text-align:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:30px}';
    html += '.header h1{color:#6366f1;margin:0}.score-box{text-align:center;background:#f5f5f5;padding:30px;border-radius:10px;margin:30px 0}';
    html += '.score-box h2{font-size:48px;margin:0;color:' + scoreColor + '}';
    html += '.status{display:inline-block;padding:10px 30px;border-radius:20px;font-size:18px;font-weight:bold;color:white;background:' + statusColor + '}';
    html += '.details{margin-top:30px}.details p{margin:10px 0;font-size:16px}';
    html += '.footer{text-align:center;margin-top:40px;color:#666;font-size:12px}</style></head><body>';
    html += '<div class="header"><h1>ITI COPA</h1><p>Exam Result Certificate</p></div>';
    html += '<div class="score-box"><h2>' + result.percentage + '%</h2>';
    html += '<p style="font-size:24px;margin:10px 0">' + result.score + ' / ' + result.total + '</p>';
    html += '<div class="status">' + statusText + '</div></div>';
    html += '<div class="details"><p><strong>Student Name:</strong> ' + result.student_name + '</p>';
    html += '<p><strong>Trade:</strong> ' + result.student_trade + '</p>';
    html += '<p><strong>Test Name:</strong> ' + result.test_name + '</p>';
    html += '<p><strong>Date:</strong> ' + dateStr + '</p></div>';
    html += '<div class="footer"><p>This is a computer generated result certificate.</p>';
    html += '<p>Generated on: ' + nowStr + '</p></div></body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = function () { printWindow.print(); };
}

// Initialize page events
document.addEventListener('DOMContentLoaded', function () {
    // Allow Enter key to search
    document.getElementById('studentIdInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') searchResults();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeResultModal();
    });
});
