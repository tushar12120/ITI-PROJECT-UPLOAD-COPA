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

// ITI Logo as Base64
const ITI_LOGO_BASE64 = 'data:image/png;base64,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';

// Generate PDF with Professional Design
function generateResultPDF(result) {
    var printWindow = window.open('', '_blank');
    var pct = result.percentage || 0;
    var scoreColor = pct >= 60 ? '#10b981' : (pct >= 33 ? '#f59e0b' : '#ef4444');
    var statusColor = pct >= 33 ? '#10b981' : '#ef4444';
    var statusText = pct >= 33 ? 'PASS' : 'FAIL';
    var dateStr = new Date(result.timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    var nowStr = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    var html = '<!DOCTYPE html><html><head><title>Result Certificate - ' + result.student_name + '</title>';
    html += '<style>';
    html += '@page { size: A4; margin: 15mm; }';
    html += '@media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }';
    html += 'body { font-family: "Segoe UI", Arial, sans-serif; padding: 0; margin: 0; background: white; color: #333; }';
    html += '.certificate { max-width: 700px; margin: 0 auto; padding: 30px; border: 3px solid #1e3a5f; position: relative; }';
    html += '.certificate::before { content: ""; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid #1e3a5f; pointer-events: none; }';
    html += '.header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #1e3a5f; margin-bottom: 25px; }';
    html += '.logo { width: 80px; height: auto; margin-bottom: 10px; }';
    html += '.institute-name { font-size: 28px; font-weight: bold; color: #1e3a5f; margin: 5px 0; letter-spacing: 1px; }';
    html += '.trade-name { font-size: 14px; color: #666; margin: 5px 0; }';
    html += '.cert-title { font-size: 22px; color: #1e3a5f; margin: 25px 0 15px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }';
    html += '.score-box { text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 15px; margin: 20px 0; border: 2px solid ' + scoreColor + '; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }';
    html += '.percentage { font-size: 56px; font-weight: bold; color: ' + scoreColor + '; margin: 0; line-height: 1; }';
    html += '.score-fraction { font-size: 20px; color: #555; margin: 10px 0; }';
    html += '.status-badge { display: inline-block; padding: 10px 40px; border-radius: 25px; font-size: 18px; font-weight: bold; color: white; background: ' + statusColor + '; margin-top: 10px; letter-spacing: 2px; }';
    html += '.details-section { margin: 25px 0; }';
    html += '.details-table { width: 100%; border-collapse: collapse; }';
    html += '.details-table tr { border-bottom: 1px solid #e2e8f0; }';
    html += '.details-table tr:last-child { border-bottom: none; }';
    html += '.details-table td { padding: 12px 15px; font-size: 15px; }';
    html += '.details-table td:first-child { font-weight: 600; color: #1e3a5f; width: 40%; background: #f8fafc; }';
    html += '.details-table td:last-child { color: #333; }';
    html += '.footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }';
    html += '.footer p { margin: 5px 0; color: #888; font-size: 11px; }';
    html += '.watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 100px; color: rgba(0,0,0,0.03); font-weight: bold; pointer-events: none; z-index: 0; }';
    html += '</style></head><body>';

    html += '<div class="certificate">';
    html += '<div class="watermark">ITI</div>';

    // Header with Logo
    html += '<div class="header">';
    html += '<img src="' + ITI_LOGO_BASE64 + '" class="logo" alt="ITI Logo">';
    html += '<div class="institute-name">Industrial Training Institute</div>';
    html += '<div class="trade-name">COPA Trade - Computer Operator & Programming Assistant</div>';
    html += '</div>';

    // Certificate Title
    html += '<div class="cert-title">Examination Result Certificate</div>';

    // Score Box
    html += '<div class="score-box">';
    html += '<div class="percentage">' + pct + '%</div>';
    html += '<div class="score-fraction">' + (result.score || 0) + ' out of ' + (result.total || 0) + ' marks</div>';
    html += '<div class="status-badge">' + statusText + '</div>';
    html += '</div>';

    // Student Details Table
    html += '<div class="details-section">';
    html += '<table class="details-table">';
    html += '<tr><td>Student Name</td><td>' + (result.student_name || 'N/A') + '</td></tr>';
    html += '<tr><td>Student ID</td><td>' + (result.student_id || 'N/A') + '</td></tr>';
    html += '<tr><td>Trade</td><td>' + (result.student_trade || 'COPA') + '</td></tr>';
    html += '<tr><td>Examination</td><td>' + (result.test_name || 'N/A') + '</td></tr>';
    html += '<tr><td>Examination Date</td><td>' + dateStr + '</td></tr>';
    html += '</table>';
    html += '</div>';

    // Footer
    html += '<div class="footer">';
    html += '<p>This is a computer-generated certificate and does not require a signature.</p>';
    html += '<p>Generated on: ' + nowStr + '</p>';
    html += '</div>';

    html += '</div>';
    html += '</body></html>';

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = function () {
        setTimeout(function () {
            printWindow.print();
        }, 500);
    };
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
