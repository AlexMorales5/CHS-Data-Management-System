// Global chart variable to destroy previous charts
let currentChart = null;

// Function to load and display general data visualizations
document.addEventListener("DOMContentLoaded", function() {
    // Add event listeners for main tab buttons
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    mainTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mainTabName = this.getAttribute('data-main-tab');
            showMainTab(mainTabName);
        });
    });

    // Add event listener for data category dropdown
    document.getElementById("dataCategory").addEventListener("change", function() {
        const category = this.value;
        if (category) {
            loadGeneralData(category);
        } else {
            // Hide chart and insights if no category selected
            document.getElementById("chartContainer").classList.add("hidden");
            document.getElementById("dataTableContainer").classList.add("hidden");
            document.getElementById("dataInsights").classList.add("hidden");
            document.querySelector(".select-prompt").classList.remove("hidden");
        }
    });

    // Add event listener for graduation year dropdown
    document.getElementById("gradYear").addEventListener("change", function() {
        const category = document.getElementById("dataCategory").value;
        if (category) {
            loadGeneralData(category);
        }
    });
});

// Function to show the main tab
function showMainTab(tabName) {
    // Update active button
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    mainTabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-main-tab') === tabName) {
            button.classList.add('active');
        }
    });
    
    // Hide all main tab content
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    mainTabContents.forEach(content => {
        content.classList.add("hidden");
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-content`).classList.remove("hidden");
    
    // If showing general data, reset the chart
    if (tabName === "general-data") {
        document.getElementById("dataCategory").value = "";
        document.getElementById("chartContainer").classList.add("hidden");
        document.getElementById("dataTableContainer").classList.add("hidden");
        document.getElementById("dataInsights").classList.add("hidden");
        document.querySelector(".select-prompt").classList.remove("hidden");
    }
}

// Function to load general data based on category
async function loadGeneralData(category) {
    // Show loading indicator
    document.querySelector(".select-prompt").innerHTML = "<h3>Loading data...</h3>";
    document.querySelector(".select-prompt").classList.remove("hidden");
    document.getElementById("chartContainer").classList.add("hidden");
    document.getElementById("dataTableContainer").classList.add("hidden");
    document.getElementById("dataInsights").classList.add("hidden");
    
    try {
        switch(category) {
            case "gpa-trends":
                await visualizeGPAData();
                break;
            case "sat-trends":
                await visualizeSATData();
                break;
            case "ap-distribution":
                await visualizeAPData();
                break;
            case "college-readiness":
                await visualizeCollegeReadiness();
                break;
            case "class-comparison":
                await visualizeClassComparison();
                break;
            default:
                document.querySelector(".select-prompt").innerHTML = "<h3>Please select a valid data category</h3>";
                return;
        }
        
        // Hide loading message
        document.querySelector(".select-prompt").classList.add("hidden");
        
    } catch (error) {
        console.error("Error loading general data:", error);
        document.querySelector(".select-prompt").innerHTML = `<h3>Error loading data: ${error.message}</h3>`;
    }
}

// Function to visualize GPA data
async function visualizeGPAData() {
    try {
        const response = await fetch("data_exports/GPAs_data.json");
        const data = await response.json();
        
        // Filter by graduation year if selected
        const selectedYear = document.getElementById("gradYear").value;
        let filteredData = data;
        if (selectedYear !== "all") {
            filteredData = data.filter(student => 
                (student.Sched_YearOfGraduation == selectedYear || 
                 student.SCHED_YEAROFGRADUATION == selectedYear));
        }
        
        // Calculate GPA distribution
        const gpaRanges = {
            "4.0+": 0,
            "3.5-3.99": 0,
            "3.0-3.49": 0,
            "2.5-2.99": 0,
            "2.0-2.49": 0,
            "Below 2.0": 0
        };
        
        let totalGPA = 0;
        let validGPACount = 0;
        
        filteredData.forEach(student => {
            const gpa = parseFloat(student.Cumulative_GPA || student.CUMULATIVE_GPA);
            if (!isNaN(gpa)) {
                if (gpa >= 4.0) gpaRanges["4.0+"]++;
                else if (gpa >= 3.5) gpaRanges["3.5-3.99"]++;
                else if (gpa >= 3.0) gpaRanges["3.0-3.49"]++;
                else if (gpa >= 2.5) gpaRanges["2.5-2.99"]++;
                else if (gpa >= 2.0) gpaRanges["2.0-2.49"]++;
                else gpaRanges["Below 2.0"]++;
                
                totalGPA += gpa;
                validGPACount++;
            }
        });
        
        const averageGPA = validGPACount > 0 ? (totalGPA / validGPACount).toFixed(2) : "N/A";
        
        // Create chart
        createChart(
            'dataChart',
            'GPA Distribution',
            Object.keys(gpaRanges),
            Object.values(gpaRanges),
            'bar',
            'Number of Students',
            'GPA Range'
        );
        
        // Show insights
        document.getElementById("dataInsights").innerHTML = `
            <h3>GPA Insights</h3>
            <p><strong>Total Students:</strong> ${validGPACount}</p>
            <p><strong>Average GPA:</strong> ${averageGPA}</p>
            <p><strong>Highest Concentration:</strong> ${Object.keys(gpaRanges).reduce((a, b) => gpaRanges[a] > gpaRanges[b] ? a : b)} 
               with ${Math.max(...Object.values(gpaRanges))} students</p>
            <p><strong>College Ready (GPA ≥ 3.0):</strong> 
               ${gpaRanges["4.0+"] + gpaRanges["3.5-3.99"] + gpaRanges["3.0-3.49"]} students 
               (${((gpaRanges["4.0+"] + gpaRanges["3.5-3.99"] + gpaRanges["3.0-3.49"]) / validGPACount * 100).toFixed(1)}%)</p>
        `;
        
        // Show chart and insights
        document.getElementById("chartContainer").classList.remove("hidden");
        document.getElementById("dataInsights").classList.remove("hidden");
        
    } catch (error) {
        console.error("Error in GPA visualization:", error);
        throw error;
    }
}

// Function to visualize SAT data
async function visualizeSATData() {
    try {
        const response = await fetch("data_exports/SAT_data.json");
        const data = await response.json();
        
        // Filter by graduation year if selected
        const selectedYear = document.getElementById("gradYear").value;
        let filteredData = data;
        if (selectedYear !== "all") {
            filteredData = data.filter(score => score.SCHED_YEAROFGRADUATION == selectedYear);
        }
        
        // Calculate average scores
        let totalMath = 0;
        let totalERW = 0;
        let totalCombined = 0;
        let validScoreCount = 0;
        
        // Create buckets for score ranges
        const scoreRanges = {
            "1400-1600": 0,
            "1200-1399": 0,
            "1000-1199": 0,
            "800-999": 0,
            "600-799": 0,
            "400-599": 0
        };
        
        filteredData.forEach(score => {
            const mathScore = parseFloat(score.MATH);
            const erwScore = parseFloat(score.ERW);
            const totalScore = parseFloat(score.TOTAL);
            
            if (!isNaN(mathScore) && !isNaN(erwScore) && !isNaN(totalScore)) {
                totalMath += mathScore;
                totalERW += erwScore;
                totalCombined += totalScore;
                validScoreCount++;
                
                // Categorize by score range
                if (totalScore >= 1400) scoreRanges["1400-1600"]++;
                else if (totalScore >= 1200) scoreRanges["1200-1399"]++;
                else if (totalScore >= 1000) scoreRanges["1000-1199"]++;
                else if (totalScore >= 800) scoreRanges["800-999"]++;
                else if (totalScore >= 600) scoreRanges["600-799"]++;
                else scoreRanges["400-599"]++;
            }
        });
        
        const avgMath = validScoreCount > 0 ? Math.round(totalMath / validScoreCount) : "N/A";
        const avgERW = validScoreCount > 0 ? Math.round(totalERW / validScoreCount) : "N/A";
        const avgTotal = validScoreCount > 0 ? Math.round(totalCombined / validScoreCount) : "N/A";
        
        // Create chart
        createChart(
            'dataChart',
            'SAT Score Distribution',
            Object.keys(scoreRanges),
            Object.values(scoreRanges),
            'bar',
            'Number of Students',
            'Score Range'
        );
        
        // Show insights
        document.getElementById("dataInsights").innerHTML = `
            <h3>SAT Insights</h3>
            <p><strong>Total Test Takers:</strong> ${validScoreCount}</p>
            <p><strong>Average Math Score:</strong> ${avgMath}</p>
            <p><strong>Average Reading/Writing Score:</strong> ${avgERW}</p>
            <p><strong>Average Total Score:</strong> ${avgTotal}</p>
            <p><strong>College Ready (1200+):</strong> 
               ${scoreRanges["1400-1600"] + scoreRanges["1200-1399"]} students 
               (${validScoreCount > 0 ? ((scoreRanges["1400-1600"] + scoreRanges["1200-1399"]) / validScoreCount * 100).toFixed(1) : 0}%)</p>
        `;
        
        // Show chart and insights
        document.getElementById("chartContainer").classList.remove("hidden");
        document.getElementById("dataInsights").classList.remove("hidden");
        
    } catch (error) {
        console.error("Error in SAT visualization:", error);
        throw error;
    }
}

// Function to visualize AP data
async function visualizeAPData() {
    try {
        const response = await fetch("data_exports/APs_data.json");
        const data = await response.json();
        
        // Filter by graduation year if selected
        const selectedYear = document.getElementById("gradYear").value;
        let filteredData = data;
        if (selectedYear !== "all") {
            filteredData = data.filter(exam => exam.SCHED_YEAROFGRADUATION == selectedYear);
        }
        
        // Calculate AP score distribution
        const scoreDistribution = {
            "5": 0,
            "4": 0,
            "3": 0,
            "2": 0,
            "1": 0
        };
        
        // Count exams by subject
        const subjectCounts = {};
        
        let totalScore = 0;
        let validScoreCount = 0;
        let passingScores = 0; // Scores of 3, 4, or 5
        
        filteredData.forEach(exam => {
            const score = parseInt(exam.NUMSCORE);
            const subject = exam.NAME;
            
            if (!isNaN(score) && score >= 1 && score <= 5) {
                scoreDistribution[score.toString()]++;
                totalScore += score;
                validScoreCount++;
                
                if (score >= 3) passingScores++;
                
                // Count subjects
                if (subject) {
                    if (subjectCounts[subject]) {
                        subjectCounts[subject]++;
                    } else {
                        subjectCounts[subject] = 1;
                    }
                }
            }
        });
        
        const avgScore = validScoreCount > 0 ? (totalScore / validScoreCount).toFixed(2) : "N/A";
        const passingRate = validScoreCount > 0 ? ((passingScores / validScoreCount) * 100).toFixed(1) : "0";
        
        // Get top 5 subjects by popularity
        const sortedSubjects = Object.entries(subjectCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Create chart
        createChart(
            'dataChart',
            'AP Score Distribution',
            Object.keys(scoreDistribution),
            Object.values(scoreDistribution),
            'bar',
            'Number of Exams',
            'AP Score'
        );
        
        // Show insights
        document.getElementById("dataInsights").innerHTML = `
            <h3>AP Exam Insights</h3>
            <p><strong>Total Exams Taken:</strong> ${validScoreCount}</p>
            <p><strong>Average Score:</strong> ${avgScore}</p>
            <p><strong>Passing Rate (Score ≥ 3):</strong> ${passingRate}%</p>
            <p><strong>Most Popular AP Subjects:</strong></p>
            <ul>
                ${sortedSubjects.map(([subject, count]) => 
                    `<li>${subject}: ${count} exams</li>`).join('')}
            </ul>
        `;
        
        // Show chart and insights
        document.getElementById("chartContainer").classList.remove("hidden");
        document.getElementById("dataInsights").classList.remove("hidden");
        
    } catch (error) {
        console.error("Error in AP visualization:", error);
        throw error;
    }
}

// Function to visualize College Readiness metrics
async function visualizeCollegeReadiness() {
    try {
        // Load all necessary data
        const [gpaData, satData, psatData, apData] = await Promise.all([
            fetch("data_exports/GPAs_data.json").then(res => res.json()),
            fetch("data_exports/SAT_data.json").then(res => res.json()),
            fetch("data_exports/PSAT_data.json").then(res => res.json()),
            fetch("data_exports/APs_data.json").then(res => res.json())
        ]);
        
        // Filter by graduation year if selected
        const selectedYear = document.getElementById("gradYear").value;
        
        // Define college readiness criteria
        const collegeReadyCriteria = {
            "Strong GPA (≥3.5)": 0,
            "Good SAT (≥1200)": 0,
            "AP Success (≥3)": 0,
            "GPA + SAT": 0,
            "GPA + AP": 0,
            "SAT + AP": 0,
            "All Three": 0
        };
        
        // Set to track unique student IDs
        const uniqueStudents = new Set();
        const studentReadiness = {};
        
        // Process GPA data
        gpaData.forEach(student => {
            const gradYear = student.Sched_YearOfGraduation || student.SCHED_YEAROFGRADUATION;
            if (selectedYear !== "all" && gradYear != selectedYear) return;
            
            const studentId = student.Student_Number || student.STUDENT_NUMBER;
            const gpa = parseFloat(student.Cumulative_GPA || student.CUMULATIVE_GPA);
            
            if (studentId && !isNaN(gpa)) {
                uniqueStudents.add(studentId);
                studentReadiness[studentId] = {
                    hasStrongGPA: gpa >= 3.5,
                    hasGoodSAT: false,
                    hasAPSuccess: false
                };
                
                if (gpa >= 3.5) {
                    collegeReadyCriteria["Strong GPA (≥3.5)"]++;
                }
            }
        });
        
        // Process SAT data
        satData.forEach(score => {
            const gradYear = score.SCHED_YEAROFGRADUATION;
            if (selectedYear !== "all" && gradYear != selectedYear) return;
            
            const studentId = score.STUDENT_NUMBER;
            const totalScore = parseFloat(score.TOTAL);
            
            if (studentId && !isNaN(totalScore)) {
                uniqueStudents.add(studentId);
                
                if (!studentReadiness[studentId]) {
                    studentReadiness[studentId] = {
                        hasStrongGPA: false,
                        hasGoodSAT: totalScore >= 1200,
                        hasAPSuccess: false
                    };
                } else {
                    studentReadiness[studentId].hasGoodSAT = totalScore >= 1200;
                }
                
                if (totalScore >= 1200) {
                    collegeReadyCriteria["Good SAT (≥1200)"]++;
                }
            }
        });
        
        // Process AP data to find students with at least one passing score (3+)
        const studentsWithPassingAP = new Set();
        
        apData.forEach(exam => {
            const gradYear = exam.SCHED_YEAROFGRADUATION;
            if (selectedYear !== "all" && gradYear != selectedYear) return;
            
            const studentId = exam.STUDENT_NUMBER;
            const score = parseInt(exam.NUMSCORE);
            
            if (studentId && !isNaN(score) && score >= 3) {
                studentsWithPassingAP.add(studentId);
            }
        });
        
        // Update student readiness with AP success
        studentsWithPassingAP.forEach(studentId => {
            uniqueStudents.add(studentId);
            
            if (!studentReadiness[studentId]) {
                studentReadiness[studentId] = {
                    hasStrongGPA: false,
                    hasGoodSAT: false,
                    hasAPSuccess: true
                };
            } else {
                studentReadiness[studentId].hasAPSuccess = true;
            }
        });
        
        collegeReadyCriteria["AP Success (≥3)"] = studentsWithPassingAP.size;
        
        // Calculate combinations
        Object.values(studentReadiness).forEach(readiness => {
            if (readiness.hasStrongGPA && readiness.hasGoodSAT) {
                collegeReadyCriteria["GPA + SAT"]++;
            }
            
            if (readiness.hasStrongGPA && readiness.hasAPSuccess) {
                collegeReadyCriteria["GPA + AP"]++;
            }
            
            if (readiness.hasGoodSAT && readiness.hasAPSuccess) {
                collegeReadyCriteria["SAT + AP"]++;
            }
            
            if (readiness.hasStrongGPA && readiness.hasGoodSAT && readiness.hasAPSuccess) {
                collegeReadyCriteria["All Three"]++;
            }
        });
        
        // Create chart
        createChart(
            'dataChart',
            'College Readiness Metrics',
            Object.keys(collegeReadyCriteria),
            Object.values(collegeReadyCriteria),
            'bar',
            'Number of Students',
            'Readiness Criteria'
        );
        
        // Calculate percentages based on total student count
        const totalStudents = uniqueStudents.size;
        const percentStrongGPA = totalStudents > 0 ? 
            ((collegeReadyCriteria["Strong GPA (≥3.5)"] / totalStudents) * 100).toFixed(1) : "0";
        const percentGoodSAT = totalStudents > 0 ? 
            ((collegeReadyCriteria["Good SAT (≥1200)"] / totalStudents) * 100).toFixed(1) : "0";
        const percentAPSuccess = totalStudents > 0 ? 
            ((collegeReadyCriteria["AP Success (≥3)"] / totalStudents) * 100).toFixed(1) : "0";
        const percentAllThree = totalStudents > 0 ? 
            ((collegeReadyCriteria["All Three"] / totalStudents) * 100).toFixed(1) : "0";
        
        // Show insights
        document.getElementById("dataInsights").innerHTML = `
            <h3>College Readiness Insights</h3>
            <p><strong>Total Students:</strong> ${totalStudents}</p>
            <p><strong>Students with Strong GPA (≥3.5):</strong> ${collegeReadyCriteria["Strong GPA (≥3.5)"]} (${percentStrongGPA}%)</p>
            <p><strong>Students with Good SAT (≥1200):</strong> ${collegeReadyCriteria["Good SAT (≥1200)"]} (${percentGoodSAT}%)</p>
            <p><strong>Students with AP Success (≥3):</strong> ${collegeReadyCriteria["AP Success (≥3)"]} (${percentAPSuccess}%)</p>
            <p><strong>Students Meeting All Three Criteria:</strong> ${collegeReadyCriteria["All Three"]} (${percentAllThree}%)</p>
            <p><strong>Overall College Readiness Rating:</strong> ${getCollegeReadinessRating(percentAllThree)}</p>
        `;
        
        // Show chart and insights
        document.getElementById("chartContainer").classList.remove("hidden");
        document.getElementById("dataInsights").classList.remove("hidden");
        
    } catch (error) {
        console.error("Error in College Readiness visualization:", error);
        throw error;
    }
}

// Function to visualize Class Comparison (focusing on previous schools)
async function visualizeClassComparison() {
    try {
        const response = await fetch("data_exports/PreviousSchool_data.json");
        const data = await response.json();
        
        // Count students from each previous school
        const schoolCounts = {};
        
        data.forEach(student => {
            const school = student.PREVIOUS_SCHOOL;
            if (school) {
                if (schoolCounts[school]) {
                    schoolCounts[school]++;
                } else {
                    schoolCounts[school] = 1;
                }
            }
        });
        
        // Get the top 25 schools
        const top25Schools = Object.entries(schoolCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 25);
        
        // Prepare data for chart
        const schoolNames = top25Schools.map(school => school[0]);
        const studentCounts = top25Schools.map(school => school[1]);
        
        // Create chart
        createChart(
            'dataChart',
            'Top 25 Previous Schools',
            schoolNames,
            studentCounts,
            'bar',
            'Number of Students',
            'School Name'
        );
        
        // Create table for schools
        let tableHTML = `
            <h3>Top 25 Previous Schools</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>School Name</th>
                        <th>Number of Students</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        const totalStudents = data.length;
        
        top25Schools.forEach((school, index) => {
            const percentage = ((school[1] / totalStudents) * 100).toFixed(1);
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${school[0]}</td>
                    <td>${school[1]}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        // Show table
        document.getElementById("dataTableContainer").innerHTML = tableHTML;
        document.getElementById("dataTableContainer").classList.remove("hidden");
        
        // Show insights
        document.getElementById("dataInsights").innerHTML = `
            <h3>Previous School Insights</h3>
            <p><strong>Total Students with Previous School Data:</strong> ${totalStudents}</p>
            <p><strong>Total Different Schools:</strong> ${Object.keys(schoolCounts).length}</p>
            <p><strong>Most Common School:</strong> ${top25Schools[0][0]} with ${top25Schools[0][1]} students (${((top25Schools[0][1] / totalStudents) * 100).toFixed(1)}%)</p>
            <p><strong>Top 5 Schools Represent:</strong> ${calculateTopSchoolsPercentage(top25Schools, totalStudents, 5)}% of student population</p>
            <p><strong>Top 10 Schools Represent:</strong> ${calculateTopSchoolsPercentage(top25Schools, totalStudents, 10)}% of student population</p>
        `;
        
        // Show chart and insights
        document.getElementById("chartContainer").classList.remove("hidden");
        document.getElementById("dataInsights").classList.remove("hidden");
        
    } catch (error) {
        console.error("Error in Previous Schools visualization:", error);
        throw error;
    }
}

// Helper Functions

// Create a chart
function createChart(canvasId, title, labels, data, type, yLabel, xLabel) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy previous chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Create new chart
    currentChart = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: generateColors(data.length),
                borderColor: 'rgba(255, 215, 0, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: '#FFD700',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yLabel,
                        color: '#F5F5DC'
                    },
                    ticks: {
                        color: '#F5F5DC'
                    },
                    grid: {
                        color: 'rgba(79, 17, 123, 0.2)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: xLabel,
                        color: '#F5F5DC'
                    },
                    ticks: {
                        color: '#F5F5DC',
                        maxRotation: 90,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(79, 17, 123, 0.2)'
                    }
                }
            }
        }
    });
}

// Generate colors for chart
function generateColors(count) {
    const colors = [
        'rgba(26, 71, 42, 0.7)',   // Dark Green
        'rgba(75, 0, 130, 0.7)',   // Indigo
        'rgba(29, 45, 83, 0.7)',   // Dark Blue
        'rgba(139, 69, 19, 0.7)',  // Brown
        'rgba(128, 0, 128, 0.7)',   // Purple
        'rgba(0, 128, 128, 0.7)',   // Teal
        'rgba(220, 20, 60, 0.7)',   // Crimson
        'rgba(205, 133, 63, 0.7)',  // Peru
        'rgba(32, 178, 170, 0.7)',  // Light Sea Green
        'rgba(255, 140, 0, 0.7)'    // Dark Orange
    ];
    
    // If we need more colors than in our predefined list, generate them
    if (count > colors.length) {
        for (let i = colors.length; i < count; i++) {
            const r = Math.floor(Math.random() * 200);
            const g = Math.floor(Math.random() * 200);
            const b = Math.floor(Math.random() * 200);
            colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
    }
    
    return colors.slice(0, count);
}

// Calculate percentage for top N schools
function calculateTopSchoolsPercentage(schools, totalStudents, n) {
    const topNSchools = schools.slice(0, n);
    const topNStudents = topNSchools.reduce((sum, school) => sum + school[1], 0);
    return ((topNStudents / totalStudents) * 100).toFixed(1);
}

// Get college readiness rating based on percentage
function getCollegeReadinessRating(percentage) {
    const pct = parseFloat(percentage);
    if (pct >= 25) return "Excellent";
    if (pct >= 15) return "Very Good";
    if (pct >= 10) return "Good";
    if (pct >= 5) return "Fair";
    return "Needs Improvement";
}