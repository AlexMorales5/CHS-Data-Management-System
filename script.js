// Global variables to store student data
let studentData = {
    profile: null,
    gpa: null,
    sat: [],
    psat: null,
    nwea: [],
    placement: null,
    previousSchool: null,
    ap: []
};

let activeTab = 'overview';

// Function to search and display student data
async function searchStudent() {
    const studentNumber = document.getElementById("studentNumber").value;
    
    if (!studentNumber) {
        alert("Please enter a student ID number");
        return;
    }
    
    // Reset previous data
    resetStudentData();
    
    try {
        // Load all relevant data
        await Promise.all([
            loadGPAData(studentNumber),
            loadSATData(studentNumber),
            loadPSATData(studentNumber),
            loadAPData(studentNumber),
            loadPlacementExamData(studentNumber),
            loadPreviousSchoolData(studentNumber),
            loadNWEAData(studentNumber)
        ]);
        
        displayStudentInfo(studentNumber);
        
        // Show tabs and default tab content
        document.getElementById("dataTabs").classList.remove("hidden");
        document.getElementById("tabContent").classList.remove("hidden");
        showTab('overview');
    } catch (error) {
        console.error("Error loading student data:", error);
        document.getElementById("studentInfo").innerHTML = `<p>Error loading student data: ${error.message}</p>`;
        document.getElementById("studentInfo").classList.remove("hidden");
    }
}

// Reset all student data
function resetStudentData() {
    studentData = {
        profile: null,
        gpa: null,
        sat: [],
        psat: null,
        nwea: [],
        placement: null,
        previousSchool: null,
        ap: []
    };
    
    document.getElementById("studentInfo").classList.add("hidden");
    document.getElementById("dataTabs").classList.add("hidden");
    document.getElementById("tabContent").classList.add("hidden");
}

// Load GPA data
async function loadGPAData(studentNumber) {
    try {
        const response = await fetch("data_exports/GPAs_data.json");
        const data = await response.json();
        
        // Find the student by student number
        studentData.gpa = data.find(student => student.Student_Number == studentNumber || student.STUDENT_NUMBER == studentNumber);
        
        if (studentData.gpa) {
            studentData.profile = {
                studentNumber: studentData.gpa.Student_Number || studentData.gpa.STUDENT_NUMBER,
                graduationYear: studentData.gpa.Sched_YearOfGraduation || studentData.gpa.SCHED_YEAROFGRADUATION
            };
        }
    } catch (error) {
        console.error("Error loading GPA data:", error);
    }
}

// Load SAT data
async function loadSATData(studentNumber) {
    try {
        const response = await fetch("data_exports/SAT_data.json");
        const data = await response.json();
        
        // Find all SAT scores for this student
        studentData.sat = data.filter(score => score.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.sat.length > 0) {
            studentData.profile = {
                studentNumber: studentData.sat[0].STUDENT_NUMBER,
                graduationYear: studentData.sat[0].SCHED_YEAROFGRADUATION
            };
        }
    } catch (error) {
        console.error("Error loading SAT data:", error);
    }
}

// Load PSAT data
async function loadPSATData(studentNumber) {
    try {
        const response = await fetch("data_exports/PSAT_data.json");
        const data = await response.json();
        
        // Find the PSAT data for this student
        studentData.psat = data.find(score => score.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.psat) {
            studentData.profile = {
                studentNumber: studentData.psat.STUDENT_NUMBER,
                graduationYear: null // PSAT data doesn't include graduation year
            };
        }
    } catch (error) {
        console.error("Error loading PSAT data:", error);
    }
}

// Load AP exam data
async function loadAPData(studentNumber) {
    try {
        const response = await fetch("data_exports/APs_data.json");
        const data = await response.json();
        
        // Find all AP scores for this student
        studentData.ap = data.filter(score => score.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.ap.length > 0) {
            studentData.profile = {
                studentNumber: studentData.ap[0].STUDENT_NUMBER,
                graduationYear: studentData.ap[0].SCHED_YEAROFGRADUATION
            };
        }
    } catch (error) {
        console.error("Error loading AP data:", error);
    }
}

// Load Placement Exam data
async function loadPlacementExamData(studentNumber) {
    try {
        const response = await fetch("data_exports/PlacementExam_data.json");
        const data = await response.json();
        
        // Find the placement exam data for this student
        studentData.placement = data.find(exam => exam.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.placement) {
            studentData.profile = {
                studentNumber: studentData.placement.STUDENT_NUMBER,
                graduationYear: null // Placement data doesn't include graduation year
            };
        }
    } catch (error) {
        console.error("Error loading Placement Exam data:", error);
    }
}

// Load Previous School data
async function loadPreviousSchoolData(studentNumber) {
    try {
        const response = await fetch("data_exports/PreviousSchool_data.json");
        const data = await response.json();
        
        // Find the previous school data for this student
        studentData.previousSchool = data.find(school => school.STUDENT_NUMBER == studentNumber);
        
        // Update profile if not set yet
        if (!studentData.profile && studentData.previousSchool) {
            studentData.profile = {
                studentNumber: studentData.previousSchool.STUDENT_NUMBER,
                graduationYear: null // Previous school data doesn't include graduation year
            };
        }
    } catch (error) {
        console.error("Error loading Previous School data:", error);
    }
}

// Load NWEA data
async function loadNWEAData(studentNumber) {
    try {
        const response = await fetch("data_exports/NWEA_data.json");
        const data = await response.json();
        
        // Find all NWEA scores for this student
        studentData.nwea = data.filter(score => score.StudentID == studentNumber);
    } catch (error) {
        console.error("Error loading NWEA data:", error);
    }
}

function displayStudentInfo(studentNumber) {
    console.log("displayStudentInfo called for student:", studentNumber); // ADD THIS LINE
    const studentInfoDiv = document.getElementById("studentInfo");
    
    // Check if we have any data for this student
    if (!studentData.profile && !studentData.gpa && studentData.sat.length === 0 && 
        !studentData.psat && studentData.ap.length === 0 && !studentData.placement && 
        !studentData.previousSchool && studentData.nwea.length === 0) {
        
        studentInfoDiv.innerHTML = `<p>No data found for student ID: ${studentNumber}</p>`;
        studentInfoDiv.classList.remove("hidden");
        document.getElementById("dataTabs").classList.add("hidden");
        document.getElementById("tabContent").classList.add("hidden");
        return;
    }
    
    // Basic student info
    let html = `<h2>Student ID: ${studentNumber}</h2>`;
    
    if (studentData.profile && studentData.profile.graduationYear) {
        html += `<p><strong>Year of Graduation:</strong> ${studentData.profile.graduationYear}</p>`;
    }
    
    if (studentData.previousSchool) {
        html += `<p><strong>Previous School:</strong> ${studentData.previousSchool.PREVIOUS_SCHOOL}</p>`;
    }
    
    if (studentData.gpa && studentData.gpa.Cumulative_GPA) {
        html += `<p><strong>Cumulative GPA:</strong> ${studentData.gpa.Cumulative_GPA}</p>`;
    }
    
    studentInfoDiv.innerHTML = html;
    studentInfoDiv.classList.remove("hidden");
    
    // Display loading message for AI recommendations
    const loadingHTML = `
        <div class="ai-recommendations" style="margin-top: 30px; padding-top: 30px; border-top: 2px solid rgba(255, 215, 0, 0.3);">
            <div class="recommendation-section">
                <h4 style="font-size: 1.5em; color: #FFD700; margin-bottom: 20px;">🤖 Automated Analysis & Suggestions</h4>
                <div class="loading-recommendations">
                    <p style="font-size: 1.1em;">Analyzing student data and generating personalized analysis & suggestions...</p>
                    <div class="loading-spinner"></div>
                </div>
            </div>
        </div>
    `;
    studentInfoDiv.innerHTML += loadingHTML;
    
    // Generate and display AI-powered recommendations asynchronously
    generateAIRecommendations().then(recommendations => {
        console.log("AI Recommendations received:", recommendations);
        const recommendationsHTML = formatRecommendations(recommendations);
        const recommendationsDiv = studentInfoDiv.querySelector('.ai-recommendations');
        if (recommendationsDiv) {
            recommendationsDiv.innerHTML = recommendationsHTML;
        } else {
            console.error("Could not find .ai-recommendations div");
        }
    }).catch(error => {
        console.error("Error loading recommendations:", error);
        const recommendationsDiv = studentInfoDiv.querySelector('.ai-recommendations');
        if (recommendationsDiv) {
            recommendationsDiv.innerHTML = `
                <div class="recommendation-section">
                    <h4>⚠️ Automated Analysis & Suggestions</h4>
                    <div class="error-message">
                        <p><strong>Error:</strong> ${error.message}</p>
                        <p>Please check:</p>
                        <ul>
                            <li>Your OpenAI API key is set in script.js (line 729)</li>
                            <li>You have credits in your OpenAI account</li>
                            <li>Check the browser console (F12) for more details</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    });
}

// Show the selected tab content
function showTab(tabName) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase().includes(tabName.toLowerCase())) {
            button.classList.add('active');
        }
    });
    
    // Set the active tab
    activeTab = tabName;
    
    // Display tab content
    const tabContent = document.getElementById('tabContent');
    
    switch(tabName) {
        case 'overview':
            displayOverviewTab();
            break;
        case 'gpa':
            displayGPATab();
            break;
        case 'standardized':
            displayStandardizedTestsTab();
            break;
        case 'ap':
            displayAPTab();
            break;
        case 'background':
            displayBackgroundTab();
            break;
        default:
            tabContent.innerHTML = '<p>Tab content not available</p>';
    }
}

// Display Overview tab content
function displayOverviewTab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>Student Overview</h3>`;
    
    // GPA Summary
    if (studentData.gpa) {
        html += `
            <div class="test-score">
                <h4>GPA Summary</h4>
                <p><strong>Cumulative GPA:</strong> ${studentData.gpa.Cumulative_GPA}</p>
            </div>
        `;
    }
    
    // SAT Summary
    if (studentData.sat && studentData.sat.length > 0) {
        // Find highest total score
        const highestSAT = studentData.sat.reduce((prev, current) => 
            (prev.TOTAL > current.TOTAL) ? prev : current);
            
        html += `
            <div class="test-score">
                <h4>SAT Summary</h4>
                <p><strong>Best Score:</strong> ${highestSAT.TOTAL}</p>
                <p><strong>Math:</strong> ${highestSAT.MATH}, <strong>Reading/Writing:</strong> ${highestSAT.ERW}</p>
                <p><strong>Test Date:</strong> ${formatDate(highestSAT.TESTDATE)}</p>
            </div>
        `;
    }
    
    // AP Summary
    if (studentData.ap && studentData.ap.length > 0) {
        html += `
            <div class="test-score">
                <h4>AP Summary</h4>
                <p><strong>Number of AP Exams:</strong> ${studentData.ap.length}</p>
                <p><strong>Average Score:</strong> ${calculateAverageAPScore()}</p>
            </div>
        `;
    }
    
    tabContent.innerHTML = html;
}

// Display GPA tab content
function displayGPATab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>GPA Information</h3>`;
    
    if (studentData.gpa) {
        html += `
            <p><strong>Cumulative GPA:</strong> ${studentData.gpa.Cumulative_GPA}</p>
            
            <h4>GPA by Grade Level</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Grade</th>
                        <th>Semester 1</th>
                        <th>Semester 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Grade 9</td>
                        <td>${studentData.gpa["S1 grade=9"] || "N/A"}</td>
                        <td>${studentData.gpa["S2 grade=9"] || "N/A"}</td>
                    </tr>
                    <tr>
                        <td>Grade 10</td>
                        <td>${studentData.gpa["S1 grade=10"] || "N/A"}</td>
                        <td>${studentData.gpa["S2 grade=10"] || "N/A"}</td>
                    </tr>
                    <tr>
                        <td>Grade 11</td>
                        <td>${studentData.gpa["S1 grade=11"] || "N/A"}</td>
                        <td>${studentData.gpa["S2 grade=11"] || "N/A"}</td>
                    </tr>
                    <tr>
                        <td>Grade 12</td>
                        <td>${studentData.gpa["S1 grade=12"] || "N/A"}</td>
                        <td>${studentData.gpa["S2 grade=12"] || "N/A"}</td>
                    </tr>
                </tbody>
            </table>
        `;
    } else {
        html += `<div class="no-data">No GPA data available for this student</div>`;
    }
    
    tabContent.innerHTML = html;
}

// Display Standardized Tests tab content
function displayStandardizedTestsTab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>Standardized Test Scores</h3>`;
    let hasData = false;
    
    // SAT Scores
    if (studentData.sat && studentData.sat.length > 0) {
        hasData = true;
        html += `
            <h4>SAT Scores</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Test Date</th>
                        <th>Math</th>
                        <th>Reading/Writing</th>
                        <th>Total</th>
                        <th>Grade Level</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Sort by date, newest first
        const sortedSAT = studentData.sat.sort((a, b) => 
            new Date(b.TESTDATE) - new Date(a.TESTDATE));
            
        sortedSAT.forEach(score => {
            html += `
                <tr>
                    <td>${formatDate(score.TESTDATE)}</td>
                    <td>${score.MATH || "N/A"}</td>
                    <td>${score.ERW || "N/A"}</td>
                    <td>${score.TOTAL || "N/A"}</td>
                    <td>${score["Grade Level"] || "N/A"}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    // PSAT Scores
    if (studentData.psat && hasPSATScores()) {
        hasData = true;
        html += `
            <h4>PSAT Scores</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Test Date</th>
                        <th>Math</th>
                        <th>Reading/Writing</th>
                        <th>Total</th>
                        <th>Grade Level</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Check for 10th grade scores
        if (studentData.psat.NUMSCOREC10) {
            html += `
                <tr>
                    <td>${formatDate(studentData.psat.TESTDATEC10)}</td>
                    <td>${studentData.psat.NUMSCOREW10 || "N/A"}</td>
                    <td>${studentData.psat.NUMSCOREM10 || "N/A"}</td>
                    <td>${studentData.psat.NUMSCOREC10 || "N/A"}</td>
                    <td>${studentData.psat.TESTGRADEC10 || "N/A"}</td>
                </tr>
            `;
        }
        
        // Check for 11th grade scores
        if (studentData.psat.NUMSCOREC11) {
            html += `
                <tr>
                    <td>${formatDate(studentData.psat.TESTDATEC11)}</td>
                    <td>${studentData.psat.NUMSCOREW11 || "N/A"}</td>
                    <td>${studentData.psat.NUMSCOREM11 || "N/A"}</td>
                    <td>${studentData.psat.NUMSCOREC11 || "N/A"}</td>
                    <td>${studentData.psat.TESTGRADEC11 || "N/A"}</td>
                </tr>
            `;
        }
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    // Placement Exam Scores
    if (studentData.placement) {
        hasData = true;
        html += `
            <h4>Placement Exam Scores</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Test Date</th>
                        <th>Verbal</th>
                        <th>Quantitative</th>
                        <th>Reading</th>
                        <th>Math</th>
                        <th>Language</th>
                        <th>Composite</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${formatDate(studentData.placement.TESTDATE)}</td>
                        <td>${studentData.placement.VERBAL || "N/A"}</td>
                        <td>${studentData.placement.QUANT || "N/A"}</td>
                        <td>${studentData.placement.READ || "N/A"}</td>
                        <td>${studentData.placement.MATH || "N/A"}</td>
                        <td>${studentData.placement.LANG || "N/A"}</td>
                        <td>${studentData.placement.COMP || "N/A"}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }
    
    // NWEA Scores
    if (studentData.nwea && studentData.nwea.length > 0) {
        hasData = true;
        html += `
            <h4>NWEA Test Scores</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Test Date</th>
                        <th>Subject</th>
                        <th>RIT Score</th>
                        <th>Percentile</th>
                        <th>Term</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Sort by date, newest first
        const sortedNWEA = studentData.nwea.sort((a, b) => 
            new Date(b.TestStartDate) - new Date(a.TestStartDate));
            
        sortedNWEA.forEach(score => {
            html += `
                <tr>
                    <td>${formatDate(score.TestStartDate)}</td>
                    <td>${score.MeasurementScale || "N/A"}</td>
                    <td>${score.TestRITScore || "N/A"}</td>
                    <td>${score.TestPercentile || "N/A"}</td>
                    <td>${score.TermName} ${score["Term Year"] || ""}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    if (!hasData) {
        html += `<div class="no-data">No standardized test scores available for this student</div>`;
    }
    
    tabContent.innerHTML = html;
}

// Display AP tab content
function displayAPTab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>AP Exam Scores</h3>`;
    
    if (studentData.ap && studentData.ap.length > 0) {
        html += `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Exam Name</th>
                        <th>Score</th>
                        <th>Test Date</th>
                        <th>Grade Level</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        // Sort by date, newest first
        const sortedAP = studentData.ap.sort((a, b) => 
            new Date(b.TEST_DATE) - new Date(a.TEST_DATE));
            
        sortedAP.forEach(exam => {
            html += `
                <tr>
                    <td>${exam.NAME || "N/A"}</td>
                    <td>${exam.NUMSCORE || "N/A"}</td>
                    <td>${formatDate(exam.TEST_DATE)}</td>
                    <td>${exam.GRADE_LEVEL || "N/A"}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    } else {
        html += `<div class="no-data">No AP exam scores available for this student</div>`;
    }
    
    tabContent.innerHTML = html;
}

// Display Background tab content
function displayBackgroundTab() {
    const tabContent = document.getElementById('tabContent');
    let html = `<h3>Student Background Information</h3>`;
    let hasData = false;
    
    // Previous School Information
    if (studentData.previousSchool) {
        hasData = true;
        html += `
            <div class="info-section">
                <h4>Previous School Information</h4>
                <p><strong>School Name:</strong> ${studentData.previousSchool.PREVIOUS_SCHOOL || "N/A"}</p>
                <p><strong>GPA from Previous School:</strong> ${studentData.previousSchool.PREVIOUS_SCHOOL_GPA || "N/A"}</p>
                <p><strong>Transfer Year:</strong> ${studentData.previousSchool.TRANSFER_YEAR || "N/A"}</p>
                <p><strong>Notes:</strong> ${studentData.previousSchool.NOTES || "None"}</p>
            </div>
        `;
    }
    
    // Placement Test Information
    if (studentData.placement) {
        hasData = true;
        html += `
            <div class="info-section">
                <h4>Placement Test Information</h4>
                <p><strong>Test Date:</strong> ${formatDate(studentData.placement.TESTDATE)}</p>
                <p><strong>Verbal:</strong> ${studentData.placement.VERBAL || "N/A"}</p>
                <p><strong>Quantitative:</strong> ${studentData.placement.QUANT || "N/A"}</p>
                <p><strong>Reading:</strong> ${studentData.placement.READ || "N/A"}</p>
                <p><strong>Math:</strong> ${studentData.placement.MATH || "N/A"}</p>
                <p><strong>Language:</strong> ${studentData.placement.LANG || "N/A"}</p>
                <p><strong>Composite:</strong> ${studentData.placement.COMP || "N/A"}</p>
            </div>
        `;
    }
    
    if (!hasData) {
        html += `<div class="no-data">No background information available for this student</div>`;
    }
    
    tabContent.innerHTML = html;
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return "N/A";
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
    }
}

function calculateAverageAPScore() {
    if (!studentData.ap || studentData.ap.length === 0) return "N/A";
    
    let totalScore = 0;
    let validScoreCount = 0;
    
    studentData.ap.forEach(exam => {
        if (exam.NUMSCORE && !isNaN(exam.NUMSCORE)) {
            totalScore += parseFloat(exam.NUMSCORE);
            validScoreCount++;
        }
    });
    
    if (validScoreCount === 0) return "N/A";
    
    return (totalScore / validScoreCount).toFixed(1);
}

function hasPSATScores() {
    if (!studentData.psat) return false;
    
    return (
        studentData.psat.NUMSCOREC10 || 
        studentData.psat.NUMSCOREC11 ||
        studentData.psat.NUMSCOREW10 ||
        studentData.psat.NUMSCOREW11 ||
        studentData.psat.NUMSCOREM10 ||
        studentData.psat.NUMSCOREM11
    );
}
// AI-Powered Recommendation System using Anthropic Claude API
async function generateAIRecommendations() {
    try {
        // Compile student data for AI analysis
        const studentProfile = compileStudentProfile();
        
        // Generate prompt for Claude
        const prompt = createRecommendationPrompt(studentProfile);
        
        // Call Anthropic API
        const response = await callClaude(prompt);
        
        // Parse and return recommendations
        return parseAIResponse(response);
    } catch (error) {
        console.error("Error generating AI recommendations:", error);
        // Return fallback recommendations if API fails
        return getFallbackRecommendations();
    }
}

function compileStudentProfile() {
    const gpa = parseFloat(studentData.gpa?.Cumulative_GPA || studentData.gpa?.CUMULATIVE_GPA || 0);
    const gradYear = studentData.profile?.graduationYear || null;
    const currentGrade = calculateCurrentGrade(gradYear);
    
    // Get best SAT score
    let bestSAT = 0;
    let satDetails = [];
    if (studentData.sat && studentData.sat.length > 0) {
        bestSAT = Math.max(...studentData.sat.map(s => parseFloat(s.TOTAL) || 0));
        const bestSATRecord = studentData.sat.find(s => parseFloat(s.TOTAL) === bestSAT);
        satDetails = [{
            total: bestSAT,
            math: parseFloat(bestSATRecord?.MATH) || 0,
            erw: parseFloat(bestSATRecord?.ERW) || 0,
            date: bestSATRecord?.TESTDATE || 'N/A'
        }];
    }
    
    // Get PSAT score
    let psatScore = 0;
    if (studentData.psat) {
        psatScore = Math.max(
            parseFloat(studentData.psat.NUMSCOREC10) || 0,
            parseFloat(studentData.psat.NUMSCOREC11) || 0
        );
    }
    
    // Get AP performance
    const apExams = studentData.ap?.map(exam => ({
        name: exam.NAME || 'N/A',
        score: parseInt(exam.NUMSCORE) || 0,
        date: exam.TEST_DATE || 'N/A',
        gradeLevel: exam.GRADE_LEVEL || 'N/A'
    })) || [];
    const avgAPScore = calculateAverageAPScore();
    
    // Get GPA by grade level
    const gpaByGrade = {};
    if (studentData.gpa) {
        gpaByGrade.grade9 = {
            s1: studentData.gpa["S1 grade=9"] || null,
            s2: studentData.gpa["S2 grade=9"] || null
        };
        gpaByGrade.grade10 = {
            s1: studentData.gpa["S1 grade=10"] || null,
            s2: studentData.gpa["S2 grade=10"] || null
        };
        gpaByGrade.grade11 = {
            s1: studentData.gpa["S1 grade=11"] || null,
            s2: studentData.gpa["S2 grade=11"] || null
        };
        gpaByGrade.grade12 = {
            s1: studentData.gpa["S1 grade=12"] || null,
            s2: studentData.gpa["S2 grade=12"] || null
        };
    }
    
    // Get NWEA performance
    const nweaScores = analyzeNWEAPerformance();
    
    // Get placement exam
    const placementExam = studentData.placement ? {
        verbal: parseFloat(studentData.placement.VERBAL) || 0,
        quantitative: parseFloat(studentData.placement.QUANT) || 0,
        reading: parseFloat(studentData.placement.READ) || 0,
        math: parseFloat(studentData.placement.MATH) || 0,
        language: parseFloat(studentData.placement.LANG) || 0,
        composite: parseFloat(studentData.placement.COMP) || 0
    } : null;
    
    return {
        studentNumber: studentData.profile?.studentNumber || 'Unknown',
        graduationYear: gradYear,
        currentGrade: currentGrade,
        cumulativeGPA: gpa,
        gpaByGrade: gpaByGrade,
        satScores: satDetails,
        bestSAT: bestSAT,
        psatScore: psatScore,
        apExams: apExams,
        apCount: apExams.length,
        averageAPScore: parseFloat(avgAPScore) || 0,
        nweaScores: nweaScores,
        placementExam: placementExam,
        previousSchool: studentData.previousSchool?.PREVIOUS_SCHOOL || null
    };
}

function createRecommendationPrompt(profile) {
    return `You are an expert academic counselor at Cathedral High School analyzing a student's academic profile. Provide highly personalized, specific, and actionable recommendations in JSON format.

Student Profile:
- Student ID: ${profile.studentNumber}
- Graduation Year: ${profile.graduationYear || 'Unknown'}
- Current Grade: ${profile.currentGrade || 'Unknown'}
- Cumulative GPA: ${profile.cumulativeGPA.toFixed(2)}
- Best SAT Score: ${profile.bestSAT} (Math: ${profile.satScores[0]?.math || 'N/A'}, Reading/Writing: ${profile.satScores[0]?.erw || 'N/A'})
- PSAT Score: ${profile.psatScore || 'N/A'}
- AP Exams Taken: ${profile.apCount}
- Average AP Score: ${profile.averageAPScore.toFixed(1)}
- Previous School: ${profile.previousSchool || 'N/A'}

GPA by Grade Level:
${JSON.stringify(profile.gpaByGrade, null, 2)}

AP Exams:
${JSON.stringify(profile.apExams, null, 2)}

NWEA Scores:
${profile.nweaScores ? JSON.stringify(profile.nweaScores, null, 2) : 'No NWEA data available'}

Provide recommendations in this EXACT JSON format:
{
  "courses": [
    {
      "name": "Specific Course Name (e.g., AP Calculus BC, Honors English Literature)",
      "rigor": "Remedial|Regular|Honors|AP",
      "reason": "2-3 sentences explaining specifically why this course matches their abilities, what skills they'll develop, and how it connects to their academic trajectory"
    }
  ],
  "colleges": [
    {
      "name": "Specific University Name (e.g., University of Notre Dame, Purdue University)",
      "type": "Highly Selective|Selective|Moderately Selective|Open Access",
      "match": "Excellent|Strong|Good",
      "examples": "List 3-5 SPECIFIC university names that match this tier",
      "reason": "2-3 sentences explaining why this specific university is a good fit based on their GPA, test scores, and academic profile. Mention specific programs or opportunities at these schools."
    }
  ],
  "nextSteps": [
    {
      "priority": "High|Medium|Low",
      "action": "Specific action title (e.g., Schedule SAT Retake for March, Meet with College Counselor)",
      "details": "3-4 sentences with concrete, actionable steps. Include specific resources, timelines, and exactly what the student should do. Be detailed about HOW to accomplish this step.",
      "timeline": "Specific timeframe (e.g., 'By February 15th', 'During Winter Break', 'Before end of semester')"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. COURSES: Recommend 6-8 SPECIFIC courses (not generic categories). Use actual course names like "AP Biology", "Honors Pre-Calculus", "English 12 Composition". Base rigor on their actual performance.

2. COLLEGES: Recommend 4-6 SPECIFIC, REAL universities by name. Consider:
   - GPA 3.8+, SAT 1400+: Notre Dame, Northwestern, University of Chicago, Vanderbilt, Georgetown
   - GPA 3.5-3.8, SAT 1300-1400: Indiana University, Purdue, University of Illinois, Ohio State, Miami University
   - GPA 3.0-3.5, SAT 1200-1300: Ball State, Butler, DePauw, Xavier, Loyola Chicago
   - GPA 2.5-3.0: Indiana State, IUPUI, University of Indianapolis
   Match recommendations to ACTUAL student performance, not aspirational.

3. NEXT STEPS: Provide 5-7 DETAILED, specific action items with exact steps. Examples:
   - "Register for May SAT by April 12th at collegeboard.org, aim for 1350+ to strengthen applications to target schools"
   - "Schedule meeting with college counselor before February break to discuss early decision options and finalize college list"
   - "Complete common app essay draft by March 1st focusing on leadership experience in [specific activity mentioned in profile]"

4. BE HONEST about academic standing. If GPA/scores are lower, recommend appropriate matches, not reach schools.

5. All recommendations must be personalized to THIS student's specific data - reference their actual GPA, test scores, and grade level trends.

IMPORTANT: Return ONLY valid JSON, no additional text before or after.`;
}

async function callClaude(prompt) {
    console.log("Calling Claude API...");
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || response.statusText;
        console.error("Claude API Error:", errorData);
        throw new Error(`Claude API error (${response.status}): ${errorMsg}`);
    }
    
    const data = await response.json();
    console.log("Claude API Response received");
    
    // Extract text from Claude's response
    const textContent = data.content.find(item => item.type === 'text');
    return textContent ? textContent.text : '';
}

function parseAIResponse(responseText) {
    try {
        console.log("Parsing AI response...");
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No JSON found in response. Full response:", responseText);
            throw new Error("No JSON found in AI response. The AI may not have followed the format.");
        }
        
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("Parsed recommendations:", parsed);
        
        // Validate structure
        const recommendations = {
            courses: parsed.courses || [],
            colleges: parsed.colleges || [],
            nextSteps: parsed.nextSteps || []
        };
        
        if (recommendations.courses.length === 0 && recommendations.colleges.length === 0 && recommendations.nextSteps.length === 0) {
            console.warn("AI returned empty recommendations");
        }
        
        return recommendations;
    } catch (error) {
        console.error("Error parsing AI response:", error);
        console.error("Response text:", responseText);
        throw new Error(`Failed to parse AI response: ${error.message}`);
    }
}

function getFallbackRecommendations() {
    // Simple fallback if API fails
    const gpa = parseFloat(studentData.gpa?.Cumulative_GPA || studentData.gpa?.CUMULATIVE_GPA || 0);
    return {
        courses: [
            { name: "Core Mathematics", rigor: gpa >= 3.5 ? "Honors" : gpa >= 3.0 ? "Regular" : "Remedial", reason: "Based on current GPA performance" },
            { name: "English Literature", rigor: gpa >= 3.5 ? "Honors" : "Regular", reason: "Essential for college readiness" },
            { name: "Science Course", rigor: gpa >= 3.5 ? "AP" : gpa >= 3.0 ? "Honors" : "Regular", reason: "Continue building STEM foundation" }
        ],
        colleges: [
            { 
                name: gpa >= 3.7 ? "Highly Selective Universities" : gpa >= 3.3 ? "Selective Universities" : "State Universities", 
                type: gpa >= 3.7 ? "Highly Selective" : gpa >= 3.3 ? "Selective" : "Moderately Selective", 
                match: gpa >= 3.5 ? "Strong" : "Good", 
                examples: gpa >= 3.7 ? "Top tier universities" : gpa >= 3.3 ? "Strong state flagships" : "Various state schools", 
                reason: "Match based on current academic profile" 
            }
        ],
        nextSteps: [
            { priority: "High", action: "Review Academic Performance", details: "Meet with counselor to discuss academic trajectory and course selection", timeline: "This month" },
            { priority: "Medium", action: "Standardized Test Preparation", details: "Begin SAT/ACT preparation if not already started", timeline: "Next semester" },
            { priority: "Medium", action: "Explore Extracurriculars", details: "Engage in meaningful extracurricular activities that align with interests", timeline: "Ongoing" }
        ]
    };
}

function calculateCurrentGrade(gradYear) {
    if (!gradYear) return null;
    const currentYear = new Date().getFullYear();
    const yearsUntilGrad = parseInt(gradYear) - currentYear;
    if (yearsUntilGrad >= 0 && yearsUntilGrad <= 4) {
        return 12 - yearsUntilGrad;
    }
    return null;
}

function analyzeNWEAPerformance() {
    if (!studentData.nwea || studentData.nwea.length === 0) return null;
    
    const latestScores = {};
    studentData.nwea.forEach(score => {
        const subject = score.MeasurementScale;
        const rit = parseFloat(score.TestRITScore);
        if (!latestScores[subject] || new Date(score.TestStartDate) > new Date(latestScores[subject].date)) {
            latestScores[subject] = { rit, percentile: parseFloat(score.TestPercentile), date: score.TestStartDate };
        }
    });
    
    return latestScores;
}
// END OF AI

function formatRecommendations(recommendations) {
    let html = '<div class="ai-recommendations">';
    
    // Course Recommendations
    if (recommendations.courses.length > 0) {
        html += `
            <div class="recommendation-section">
                <h4>📚 Recommended Courses</h4>
                <div class="courses-grid">
        `;
        recommendations.courses.forEach(course => {
            const rigorClass = course.rigor.toLowerCase();
            html += `
                <div class="course-card ${rigorClass}">
                    <div class="course-name">${course.name}</div>
                    <div class="course-rigor">${course.rigor}</div>
                    ${course.reason ? `<div class="course-reason">${course.reason}</div>` : ''}
                </div>
            `;
        });
        html += `</div></div>`;
    }
    
    // College Recommendations
    if (recommendations.colleges.length > 0) {
        html += `
            <div class="recommendation-section">
                <h4>🎓 College Recommendations</h4>
        `;
        recommendations.colleges.forEach(college => {
            html += `
                <div class="college-card">
                    <div class="college-header">
                        <span class="college-type">${college.type}</span>
                        <span class="college-match ${college.match.toLowerCase()}">${college.match} Match</span>
                    </div>
                    <div class="college-name">${college.name}</div>
                    <div class="college-examples">Examples: ${college.examples}</div>
                    ${college.reason ? `<div class="college-reason">${college.reason}</div>` : ''}
                </div>
            `;
        });
        html += `</div>`;
    }
    
    // Next Steps
    if (recommendations.nextSteps.length > 0) {
        html += `
            <div class="recommendation-section">
                <h4>🎯 Personalized Next Steps</h4>
        `;
        recommendations.nextSteps.forEach((step, index) => {
            const priorityClass = step.priority.toLowerCase();
            html += `
                <div class="next-step-card ${priorityClass}">
                    <div class="step-header">
                        <span class="step-number">${index + 1}</span>
                        <span class="step-priority ${priorityClass}">${step.priority} Priority</span>
                    </div>
                    <div class="step-action">${step.action}</div>
                    <div class="step-details">${step.details}</div>
                    <div class="step-timeline">⏰ ${step.timeline}</div>
                </div>
            `;
        });
        html += `</div>`;
    }
    
    html += '</div>';
    return html;
}

// Event listener for page load
document.addEventListener("DOMContentLoaded", function() {
    // Add event listeners for tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    // Add event listener for search button
    document.getElementById("searchButton").addEventListener("click", searchStudent);
    
    // Add event listener for Enter key in search input
    document.getElementById("studentNumber").addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            searchStudent();
        }
    });
});

// Function to export student data to CSV
function exportToCSV() {
    if (!studentData.profile) {
        alert("Please search for a student first");
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add student basic info
    csvContent += "Student Number," + (studentData.profile.studentNumber || "") + "\r\n";
    csvContent += "Graduation Year," + (studentData.profile.graduationYear || "") + "\r\n\r\n";
    
    // Add GPA data
    if (studentData.gpa) {
        csvContent += "GPA Data\r\n";
        csvContent += "Cumulative GPA," + (studentData.gpa.Cumulative_GPA || "") + "\r\n";
        csvContent += "9th Grade S1," + (studentData.gpa["S1 grade=9"] || "") + "\r\n";
        csvContent += "9th Grade S2," + (studentData.gpa["S2 grade=9"] || "") + "\r\n";
        csvContent += "10th Grade S1," + (studentData.gpa["S1 grade=10"] || "") + "\r\n";
        csvContent += "10th Grade S2," + (studentData.gpa["S2 grade=10"] || "") + "\r\n";
        csvContent += "11th Grade S1," + (studentData.gpa["S1 grade=11"] || "") + "\r\n";
        csvContent += "11th Grade S2," + (studentData.gpa["S2 grade=11"] || "") + "\r\n";
        csvContent += "12th Grade S1," + (studentData.gpa["S1 grade=12"] || "") + "\r\n";
        csvContent += "12th Grade S2," + (studentData.gpa["S2 grade=12"] || "") + "\r\n\r\n";
    }
    
    // Add SAT data
    if (studentData.sat && studentData.sat.length > 0) {
        csvContent += "SAT Scores\r\n";
        csvContent += "Test Date,Math,Reading/Writing,Total,Grade Level\r\n";
        
        studentData.sat.forEach(score => {
            csvContent += `${score.TESTDATE || ""},${score.MATH || ""},${score.ERW || ""},${score.TOTAL || ""},${score["Grade Level"] || ""}\r\n`;
        });
        csvContent += "\r\n";
    }
    
    // Add AP data
    if (studentData.ap && studentData.ap.length > 0) {
        csvContent += "AP Exam Scores\r\n";
        csvContent += "Exam Name,Score,Test Date,Grade Level\r\n";
        
        studentData.ap.forEach(exam => {
            csvContent += `${exam.NAME || ""},${exam.NUMSCORE || ""},${exam.TEST_DATE || ""},${exam.GRADE_LEVEL || ""}\r\n`;
        });
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_${studentData.profile.studentNumber}_data.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
}

// Add the export button functionality
document.addEventListener("DOMContentLoaded", function() {
    // Add export button if it exists
    const exportButton = document.getElementById("exportButton");
    if (exportButton) {
        exportButton.addEventListener("click", exportToCSV);
    }
});


