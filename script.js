// DOM Elements
const form = document.querySelector('form');
const metricInputs = document.querySelector('.metric-inputs');
const imperialInputs = document.querySelector('.imperial-inputs');
const heightInput = document.querySelector('.height');
const weightInput = document.querySelector('.weight');
const feetInput = document.querySelector('.feet');
const inchesInput = document.querySelector('.inches');
const poundsInput = document.querySelector('.pounds');
const unitToggle = document.getElementById('unit-toggle');
const metricLabel = document.getElementById('metric');
const imperialLabel = document.getElementById('imperial');
const advancedToggle = document.getElementById('show-advanced');
const advancedOptions = document.querySelector('.advanced-options');
const popup = document.querySelector('.popup');
const closeBtn = document.querySelector('.close-btn');
const saveBtn = document.querySelector('.save-btn');
const exportBtn = document.getElementById('export-history');
const clearHistoryBtn = document.getElementById('clear-history');
const historyItems = document.querySelector('.history-items');
const genderSelect = document.getElementById('gender');
const femaleOnlyFields = document.querySelector('.female-only');

// BMI Categories and their colors
const BMI_CATEGORIES = {
    'Severe Underweight': { range: { min: 0, max: 16 }, color: '#3498db', risk: 'high', classname: 'severe-underweight' },
    'Underweight': { range: { min: 16, max: 18.5 }, color: '#2ecc71', risk: 'moderate', classname: 'underweight' },
    'Normal': { range: { min: 18.5, max: 25 }, color: '#27ae60', risk: 'low', classname: 'normal' },
    'Overweight': { range: { min: 25, max: 30 }, color: '#f39c12', risk: 'moderate', classname: 'overweight' },
    'Obese Class I': { range: { min: 30, max: 35 }, color: '#e67e22', risk: 'high', classname: 'obese-1' },
    'Obese Class II': { range: { min: 35, max: 40 }, color: '#d35400', risk: 'very-high', classname: 'obese-2' },
    'Obese Class III': { range: { min: 40, max: 100 }, color: '#c0392b', risk: 'extremely-high', classname: 'obese-3' }
};

// BMI Recommendations based on category
const BMI_RECOMMENDATIONS = {
    'high-underweight': 'Consider increasing your caloric intake with nutrient-dense foods. Consult with a healthcare provider to rule out underlying conditions. Focus on strength training to build muscle mass.',
    'moderate-underweight': 'Aim to gradually increase your calorie intake with balanced nutrition. Consider adding strength training exercises to build muscle.',
    'low': 'Maintain your current healthy lifestyle with regular physical activity (150+ minutes per week) and a balanced diet rich in fruits, vegetables, whole grains, and lean proteins.',
    'moderate-overweight': 'Focus on portion control and increase physical activity. Aim for 150-300 minutes of moderate exercise weekly. Reduce intake of processed foods and added sugars.',
    'high': 'Consider a gradual weight loss plan of 1-2 pounds per week through calorie reduction and increased physical activity. Consult with healthcare providers for personalized guidance.',
    'very-high': 'Seek professional guidance for a structured weight management plan. Focus on sustainable lifestyle changes rather than quick fixes.',
    'extremely-high': 'Consult with healthcare professionals for comprehensive medical evaluation and weight management strategies. Small, consistent changes can lead to significant health improvements.'
};

// Initialize BMI history from localStorage
let bmiHistory = JSON.parse(localStorage.getItem('bmiHistory')) || [];

// Unit toggle functionality
unitToggle.addEventListener('change', function() {
    if (this.checked) {
        metricInputs.style.display = 'none';
        imperialInputs.style.display = 'block';
        metricLabel.classList.remove('active');
        imperialLabel.classList.add('active');
        
        // Convert values if they exist
        if (heightInput.value && weightInput.value) {
            const cmValue = parseFloat(heightInput.value);
            const kgValue = parseFloat(weightInput.value);
            
            if (!isNaN(cmValue) && !isNaN(kgValue)) {
                // Convert cm to feet/inches
                const totalInches = cmValue / 2.54;
                const feet = Math.floor(totalInches / 12);
                const inches = Math.round(totalInches % 12);
                
                feetInput.value = feet;
                inchesInput.value = inches;
                
                // Convert kg to lbs
                const lbs = Math.round(kgValue * 2.20462);
                poundsInput.value = lbs;
            }
        }
    } else {
        metricInputs.style.display = 'block';
        imperialInputs.style.display = 'none';
        metricLabel.classList.add('active');
        imperialLabel.classList.remove('active');
        
        // Convert values if they exist
        if (feetInput.value && inchesInput.value && poundsInput.value) {
            const feet = parseFloat(feetInput.value);
            const inches = parseFloat(inchesInput.value);
            const pounds = parseFloat(poundsInput.value);
            
            if (!isNaN(feet) && !isNaN(inches) && !isNaN(pounds)) {
                // Convert feet/inches to cm
                const totalInches = (feet * 12) + inches;
                const cm = Math.round(totalInches * 2.54);
                
                // Convert lbs to kg
                const kg = Math.round(pounds / 2.20462);
                
                heightInput.value = cm;
                weightInput.value = kg;
            }
        }
    }
});

// Advanced options toggle
advancedToggle.addEventListener('click', function() {
    if (advancedOptions.style.display === 'none') {
        advancedOptions.style.display = 'block';
        advancedToggle.classList.add('active');
    } else {
        advancedOptions.style.display = 'none';
        advancedToggle.classList.remove('active');
    }
});

// Show/hide hip measurement based on gender
genderSelect.addEventListener('change', function() {
    if (this.value === 'female') {
        femaleOnlyFields.style.display = 'flex';
    } else {
        femaleOnlyFields.style.display = 'none';
    }
});

// Calculate BMI and display results
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let height, weight, bmi, isMetric = !unitToggle.checked;
    
    // Get height and weight based on unit system
    if (isMetric) {
        height = parseFloat(heightInput.value);
        weight = parseFloat(weightInput.value);
        
        if (isNaN(height) || height <= 0) {
            showError("Please enter a valid height in centimeters");
            heightInput.focus();
            return;
        }
        
        if (isNaN(weight) || weight <= 0) {
            showError("Please enter a valid weight in kilograms");
            weightInput.focus();
            return;
        }
        
        // Calculate BMI (metric): weight(kg) / (height(m))²
        bmi = weight / ((height / 100) ** 2);
    } else {
        const feet = parseFloat(feetInput.value);
        const inches = parseFloat(inchesInput.value);
        weight = parseFloat(poundsInput.value);
        
        if (isNaN(feet) || isNaN(inches) || feet < 0 || inches < 0) {
            showError("Please enter a valid height in feet and inches");
            feetInput.focus();
            return;
        }
        
        if (isNaN(weight) || weight <= 0) {
            showError("Please enter a valid weight in pounds");
            poundsInput.focus();
            return;
        }
        
        // Convert height to total inches
        const totalInches = (feet * 12) + inches;
        
        // Calculate BMI (imperial): (weight(lbs) / (height(in))²) * 703
        bmi = (weight / (totalInches ** 2)) * 703;
        
        // Store metric values for additional calculations
        height = totalInches * 2.54;  // Convert to cm
        weight = weight / 2.20462;    // Convert to kg
    }
    
    // Round BMI to 1 decimal place
    bmi = Math.round(bmi * 10) / 10;
    
    // Determine BMI category
    let category = getBmiCategory(bmi);
    
    // Calculate additional metrics
    const additionalMetrics = calculateAdditionalMetrics(height, weight, bmi);
    
    // Show results
    displayResults(bmi, category, additionalMetrics);
    
    // Clear input fields
    clearInputFields();
});

// Helper functions
function showError(message) {
    alert(message);
}

function getBmiCategory(bmi) {
    for (const [category, data] of Object.entries(BMI_CATEGORIES)) {
        if (bmi >= data.range.min && bmi < data.range.max) {
            return {
                name: category,
                risk: data.risk,
                color: data.color,
                classname: data.classname
            };
        }
    }
    return {
        name: 'Unknown',
        risk: 'unknown',
        color: '#95a5a6',
        classname: 'unknown'
    };
}

function calculateAdditionalMetrics(height, weight, bmi) {
    // Get advanced inputs
    const age = document.getElementById('age').value ? parseInt(document.getElementById('age').value) : null;
    const gender = document.getElementById('gender').value;
    const waist = document.getElementById('waist').value ? parseFloat(document.getElementById('waist').value) : null;
    const neck = document.getElementById('neck').value ? parseFloat(document.getElementById('neck').value) : null;
    const hip = document.getElementById('hip').value ? parseFloat(document.getElementById('hip').value) : null;
    
    // Calculate ideal weight range (BMI between 18.5 and 24.9)
    const heightInMeters = height / 100;
    const idealWeightLow = Math.round(18.5 * (heightInMeters ** 2));
    const idealWeightHigh = Math.round(24.9 * (heightInMeters ** 2));
    
    const metrics = {
        idealWeight: `${idealWeightLow}kg - ${idealWeightHigh}kg`
    };
    
    // Body Fat Percentage calculation (Navy Method)
    if (waist && neck && (gender === 'male' || (gender === 'female' && hip))) {
        let bodyFat;
        if (gender === 'male') {
            bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
        } else {
            bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
        }
        metrics.bodyFat = Math.round(bodyFat * 10) / 10;
    }
    
    // Basal Metabolic Rate (BMR) calculation
    if (age && gender) {
        let bmr;
        if (gender === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
        metrics.bmr = Math.round(bmr);
    }
    
    // Waist to Height Ratio
    if (waist) {
        metrics.whr = Math.round((waist / height) * 100) / 100;
    }
    
    return metrics;
}

function getHealthRecommendation(category) {
    let recommendationKey;
    
    if (category.risk === 'high' && category.name.includes('Underweight')) {
        recommendationKey = 'high-underweight';
    } else if (category.risk === 'moderate' && category.name.includes('Underweight')) {
        recommendationKey = 'moderate-underweight';
    } else {
        recommendationKey = category.risk;
    }
    
    return BMI_RECOMMENDATIONS[recommendationKey] || 'Consult with a healthcare professional for personalized advice.';
}

function displayResults(bmi, category, metrics) {
    // Update BMI score and styling
    const bmiScoreElement = document.querySelector('.bmi-score');
    const bmiCategoryElement = document.querySelector('.bmi-category');
    const bmiTextElement = document.querySelector('.bmi-text');
    
    bmiScoreElement.textContent = bmi;
    bmiScoreElement.className = 'bmi-score ' + category.classname;
    
    bmiCategoryElement.textContent = category.name;
    bmiCategoryElement.style.color = category.color;
    
    // Set health risk text
    const healthText = `Your BMI indicates that you are in the ${category.name} category. ` +
                      `This carries a ${category.risk.replace('-', ' ')} health risk.`;
    bmiTextElement.textContent = healthText;
    
    // Update additional metrics
    document.querySelector('.ideal-weight').textContent = metrics.idealWeight;
    
    // Show/hide additional metrics if data is available
    if (metrics.bodyFat !== undefined) {
        document.querySelector('.body-fat-container').style.display = 'flex';
        document.querySelector('.body-fat').textContent = metrics.bodyFat + '%';
    } else {
        document.querySelector('.body-fat-container').style.display = 'none';
    }
    
    if (metrics.bmr !== undefined) {
        document.querySelector('.bmr-container').style.display = 'flex';
        document.querySelector('.bmr').textContent = metrics.bmr + ' calories/day';
    } else {
        document.querySelector('.bmr-container').style.display = 'none';
    }
    
    if (metrics.whr !== undefined) {
        document.querySelector('.whr-container').style.display = 'flex';
        document.querySelector('.whr').textContent = metrics.whr;
    } else {
        document.querySelector('.whr-container').style.display = 'none';
    }
    
    // Set health recommendations
    document.querySelector('.recommendation-text').textContent = getHealthRecommendation(category);
    
    // Show popup
    popup.style.display = 'block';
}

function clearInputFields() {
    heightInput.value = '';
    weightInput.value = '';
    feetInput.value = '';
    inchesInput.value = '';
    poundsInput.value = '';
}

// Save BMI result to history
saveBtn.addEventListener('click', function() {
    const bmiValue = document.querySelector('.bmi-score').textContent;
    const bmiCategory = document.querySelector('.bmi-category').textContent;
    
    // Create a new history entry
    const historyEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        bmi: bmiValue,
        category: bmiCategory,
        details: {
            weight: unitToggle.checked ? poundsInput.value + ' lbs' : weightInput.value + ' kg',
            height: unitToggle.checked ? (feetInput.value + "'" + inchesInput.value + "\"") : (heightInput.value + ' cm')
        }
    };
    
    // Add to history array
    bmiHistory.unshift(historyEntry);
    
    // Save to localStorage (keep only last 20 entries)
    if (bmiHistory.length > 20) {
        bmiHistory = bmiHistory.slice(0, 20);
    }
    localStorage.setItem('bmiHistory', JSON.stringify(bmiHistory));
    
    // Update history display
    updateHistoryDisplay();
    
    // Close popup
    closePopup();
});

// Export BMI history as CSV
exportBtn.addEventListener('click', function() {
    if (bmiHistory.length === 0) {
        alert('No history to export');
        return;
    }
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,Date,BMI,Category,Weight,Height\n';
    
    bmiHistory.forEach(entry => {
        csvContent += `${entry.date},${entry.bmi},${entry.category},${entry.details.weight},${entry.details.height}\n`;
    });
    
    // Create a download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'bmi_history.csv');
    document.body.appendChild(link);
    
    // Trigger download and remove link
    link.click();
    document.body.removeChild(link);
});

// Clear BMI history
clearHistoryBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all BMI history?')) {
        bmiHistory = [];
        localStorage.removeItem('bmiHistory');
        updateHistoryDisplay();
    }
});

// Update history display
function updateHistoryDisplay() {
    // Check if any history exists
    if (bmiHistory.length === 0) {
        historyItems.innerHTML = '<p class="no-history">No history available</p>';
        return;
    }
    
    // Generate HTML for each history item
    let historyHTML = '';
    
    bmiHistory.forEach(entry => {
        // Get category data for color
        const categoryData = Object.entries(BMI_CATEGORIES).find(([name]) => name === entry.category);
        const classname = categoryData ? categoryData[1].classname : '';
        
        historyHTML += `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-data">
                    <div class="history-date">${entry.date}</div>
                    <div class="history-bmi">${entry.bmi} <span class="history-category ${classname}">${entry.category}</span></div>
                </div>
                <div class="history-controls">
                    <button class="history-view" onclick="viewHistoryItem(${entry.id})">View</button>
                    <button class="history-delete" onclick="deleteHistoryItem(${entry.id})">Delete</button>
                </div>
            </div>
        `;
    });
    
    historyItems.innerHTML = historyHTML;
}

// View specific history item
window.viewHistoryItem = function(id) {
    const entry = bmiHistory.find(item => item.id === id);
    if (!entry) return;
    
    // Get category data for styling
    let categoryObj = getBmiCategory(parseFloat(entry.bmi));
    
    // Display result in popup
    const bmiScoreElement = document.querySelector('.bmi-score');
    const bmiCategoryElement = document.querySelector('.bmi-category');
    
    bmiScoreElement.textContent = entry.bmi;
    bmiScoreElement.className = 'bmi-score ' + categoryObj.classname;
    
    bmiCategoryElement.textContent = entry.category;
    bmiCategoryElement.style.color = categoryObj.color;
    
    // Update health risk and recommendations
    document.querySelector('.bmi-text').textContent = `BMI recorded on ${entry.date}. Height: ${entry.details.height}, Weight: ${entry.details.weight}`;
    document.querySelector('.recommendation-text').textContent = getHealthRecommendation(categoryObj);
    
    // Hide additional metrics
    document.querySelector('.body-fat-container').style.display = 'none';
    document.querySelector('.bmr-container').style.display = 'none';
    document.querySelector('.whr-container').style.display = 'none';
    
    // Show ideal weight range
    const height = entry.details.height.includes('cm') 
        ? parseFloat(entry.details.height) 
        : convertImperialHeightToCm(entry.details.height);
    
    if (!isNaN(height)) {
        const heightInMeters = height / 100;
        const idealWeightLow = Math.round(18.5 * (heightInMeters ** 2));
        const idealWeightHigh = Math.round(24.9 * (heightInMeters ** 2));
        document.querySelector('.ideal-weight').textContent = `${idealWeightLow}kg - ${idealWeightHigh}kg`;
    }
    
    // Show popup
    popup.style.display = 'block';
};

// Helper to convert imperial height string to cm
function convertImperialHeightToCm(heightStr) {
    // Parse feet and inches from format like "5'11""
    const match = heightStr.match(/(\d+)'(\d+)"/);
    if (match) {
        const feet = parseInt(match[1]);
        const inches = parseInt(match[2]);
        const totalInches = (feet * 12) + inches;
        return totalInches * 2.54;  // Convert to cm
    }
    return NaN;
}

// Delete specific history item
window.deleteHistoryItem = function(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        bmiHistory = bmiHistory.filter(item => item.id !== id);
        localStorage.setItem('bmiHistory', JSON.stringify(bmiHistory));
        updateHistoryDisplay();
    }
};

// Close popup
function closePopup() {
    popup.style.display = 'none';
}

closeBtn.addEventListener('click', closePopup);

document.addEventListener('click', function(e) {
    const resultsContainer = document.querySelector('.results-container');
    const isClickInsidePopup = resultsContainer && resultsContainer.contains(e.target);
    
    // Check if click is outside popup and not on a history button
    if (popup.style.display === 'block' && 
        !isClickInsidePopup && 
        !e.target.classList.contains('history-view') &&
        !e.target.classList.contains('history-delete')) {
        closePopup();
    }
});

// Initialize history display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHistoryDisplay();
});

