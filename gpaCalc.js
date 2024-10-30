const gradeLegend = {
    'Excellent': 5,
    'Good': 4,
    'Satisfactory': 3,
    'Pass': 2
};

async function processFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                console.log("File successfully parsed.");
                resolve(rows);
            } catch (error) {
                console.error("Error parsing file:", error);
                reject("Error parsing the file.");
            }
        };

        reader.onerror = () => {
            console.error("Error reading file.");
            reject("Error reading file.");
        };

        reader.readAsArrayBuffer(file);
    });
}

function calculateGPA(rows) {

    let completedCredits = 0;
    let numerator = 0;

    rows.forEach(row => {
        subjectGradeText = row['Grades'].split(' ')[0];
        if (row['Grades'] && gradeLegend.hasOwnProperty(subjectGradeText)) {
            const subjectGrade = gradeLegend[subjectGradeText];
            const subjectCredits = parseInt(row["Cr."], 10);


            completedCredits += subjectCredits;
            numerator += subjectCredits * subjectGrade;
        }
    });

   const outputSection = document.getElementById('output');
    if (completedCredits > 0) {
        outputSection.textContent = `CGPA: ${(numerator / completedCredits).toFixed(1)}`;
    } else {
        outputSection.textContent = "No completed credits found to calculate CGPA.";
    }
}

function transformData(rows) {
    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows.map(row => {
        const rowData = {};
        headers.forEach((header, index) => {
            rowData[header] = row[index];
        });
        return rowData;
    });
}

async function handleFileUpload() {
    console.log("handleFileUpload called");
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById('output').textContent = "Error: No file selected. Please upload an XLSX file.";
        console.error("No file selected.");
        return;
    }

    try {
        const parsedContents = await processFile(file);
        const transformedData = transformData(parsedContents)
        calculateGPA(transformedData);
    } catch (error) {
        document.getElementById('output').textContent = error;
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('button').addEventListener('click', handleFileUpload);
});