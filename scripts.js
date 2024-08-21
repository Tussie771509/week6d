// Handling file upload and data parsing
document.getElementById('upload').addEventListener('change', handleFile, false);

function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assuming the first sheet is the one we want
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        // Clean and process data
        processData(jsonData);
    };

    reader.readAsArrayBuffer(file);
}

function processData(data) {
    const headers = data[0];
    const rows = data.slice(1);

    // Calculate metrics and populate the table
    const metrics = calculateMetrics(rows);
    populateTable(headers, rows);
    populateMetrics(metrics);

    // Create charts
    createBarChart(metrics);
    createLineChart(metrics);
    createPieChart(metrics);
}

function calculateMetrics(rows) {
    let totalExpenses = 0;
    let totalIncome = 0;
    let totalFinancialAid = 0;

    rows.forEach(row => {
        // Assuming row[6] to row[15] are expense categories (adjust indices as needed)
        const expenses = row.slice(6, 16).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
        totalExpenses += expenses;
        totalIncome += parseFloat(row[4]) || 0;
        totalFinancialAid += parseFloat(row[5]) || 0;
    });

    const avgMonthlyIncome = totalIncome / rows.length;

    return {
        totalExpenses,
        avgMonthlyIncome,
        totalFinancialAid,
        rows
    };
}

function populateTable(headers, rows) {
    const tbody = document.querySelector('#expenseTable tbody');
    tbody.innerHTML = ''; // Clear existing table rows

    rows.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData || ''; // Fill with data or empty string if undefined
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function populateMetrics(metrics) {
    document.getElementById('totalExpenses').textContent = metrics.totalExpenses.toFixed(2);
    document.getElementById('avgMonthlyIncome').textContent = metrics.avgMonthlyIncome.toFixed(2);
    document.getElementById('totalFinancialAid').textContent = metrics.totalFinancialAid.toFixed(2);
}

// Creating charts
function createBarChart(metrics) {
    const ctx = document.getElementById('barChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Tuition', 'Housing', 'Food', 'Transportation', 'Books & Supplies', 'Entertainment', 'Personal Care', 'Technology', 'Health & Wellness', 'Miscellaneous'],
            datasets: [{
                label: 'Total Expenses by Category',
                data: metrics.rows.reduce((acc, row) => {
                    for (let i = 6; i <= 15; i++) {
                        acc[i - 6] += parseFloat(row[i]) || 0;
                    }
                    return acc;
                }, new Array(10).fill(0)),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function createLineChart(metrics) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: metrics.rows.map((row, index) => `Student ${index + 1}`),
            datasets: [
                {
                    label: 'Monthly Income',
                    data: metrics.rows.map(row => parseFloat(row[4]) || 0),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false
                },
                {
                    label: 'Total Expenses',
                    data: metrics.rows.map(row => row.slice(6, 16).reduce((sum, value) => sum + (parseFloat(value) || 0), 0)),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function createPieChart(metrics) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Tuition', 'Housing', 'Food', 'Transportation', 'Books & Supplies', 'Entertainment', 'Personal Care', 'Technology', 'Health & Wellness', 'Miscellaneous'],
            datasets: [{
                label: 'Expense Distribution by Category',
                data: metrics.rows.reduce((acc, row) => {
                    for (let i = 6; i <= 15; i++) {
                        acc[i - 6] += parseFloat(row[i]) || 0;
                    }
                    return acc;
                }, new Array(10).fill(0)),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                    'rgba(83, 102, 255, 0.6)',
                    'rgba(255, 152, 213, 0.6)',
                    'rgba(104, 159, 56, 0.6)'
                ]
            }]
        }
    });
}
