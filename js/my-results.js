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

// ITI Logo as inline SVG (more reliable for printing)
const ITI_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" width="120" height="60"><rect x="5" y="5" width="20" height="50" fill="#E85D04"/><rect x="30" y="5" width="25" height="15" fill="#1E3A5F"/><rect x="37" y="25" width="12" height="30" fill="#1E3A5F"/><rect x="60" y="5" width="20" height="50" fill="#2D6A4F"/><rect x="85" y="5" width="30" height="15" fill="#E85D04"/></svg>';

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
    html += '.logo-container { display: flex; justify-content: center; align-items: center; margin-bottom: 10px; }';
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
