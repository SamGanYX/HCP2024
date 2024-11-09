function calculateDiet(height, gender, weight, age, weightChangeRate, activity) {
    const heightCm = height;
    const weightKg = weight;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 0) {  // Male
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else if (gender === 1) {  // Female
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    // Set a realistic muscle gain weightChangeRate (e.g., 0.1 - 0.3 kg/week)
    // Typically, 0.1 kg/week = ~100 calorie surplus per day
    const calorieAdjustment = (weightChangeRate / 7) * 7000; // Adds calories based on weight change goal
    // console.log(calorieAdjustment)

    // Calculate total calorie goal with activity multiplier and surplus
    const calorieGoal = (bmr * activity) + calorieAdjustment;

    // Return the daily calorie goal and recommended protein intake
    return Math.round(calorieGoal/10)*10;
}

function calculateBMR(height, gender, weight, age, weightChangeRate, activity) {
    const heightCm = height;
    const weightKg = weight;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 0) {  // Male
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else if (gender === 1) {  // Female
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }



    // Calculate total calorie goal with activity multiplier and surplus
    const calorieGoal = (bmr * activity);

    // Return the daily calorie goal and recommended protein intake
    return Math.round(calorieGoal/10)*10;
}


function adjustDiet(height, gender, weight, age, weightChangeRate, activity, actualWeightChangeRate) {
    const heightCm = height;
    const weightKg = weight;

    // console.log(weightChangeRate)
    // console.log(actualWeightChangeRate)

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 0) {  // Male
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else if (gender === 1) {  // Female
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    // Typically, 0.1 kg/week = ~100 calorie surplus per day
    let calorieAdjustment = (weightChangeRate / 7) * 7000; // Adds calories based on weight change goal
    // Adjust calorie intake if actual weight change rate is significantly lower than the target
    if ((Math.abs(actualWeightChangeRate) < Math.abs(0.8 * weightChangeRate)
        || Math.abs(actualWeightChangeRate) > Math.abs(1.2 * weightChangeRate))
        && actualWeightChangeRate !== 0) {

        // Adjust the calorieAdjustment based on the ratio of target to actual weight change rate
        calorieAdjustment = calorieAdjustment + (weightChangeRate - actualWeightChangeRate) * 100;
        console.log("adj +" + ((weightChangeRate - actualWeightChangeRate) * 100))

    } else if (actualWeightChangeRate === 0) {
        // Handle case where actualWeightChangeRate is 0 to avoid division by zero
        calorieAdjustment += (weightChangeRate / 7) * 7700;
    }

    // Calculate total calorie goal with activity multiplier and adjusted surplus
    const calorieGoal = (bmr * activity) + calorieAdjustment;

    return Math.round(calorieGoal/10)*10;
}
module.exports = {
    calculateDiet,
    adjustDiet,
    calculateBMR,
    // ... other exports if needed
};


calories = calculateDiet(180, 0, 80, 25, 0, 1.55);
adjustedCalories = adjustDiet(180, 0, 80, 25, 0, 1.55, 0);
// console.log(calories);
// console.log(adjustedCalories);