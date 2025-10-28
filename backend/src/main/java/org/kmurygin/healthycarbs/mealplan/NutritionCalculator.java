package org.kmurygin.healthycarbs.mealplan;

public class NutritionCalculator {
    private static final double PROTEIN_CALORIES_PER_GRAM = 4.0;
    private static final double CARBS_CALORIES_PER_GRAM = 4.0;
    private static final double FAT_CALORIES_PER_GRAM = 9.0;

    private static final double CALORIE_ADJUSTMENT_AMOUNT = 500.0;

    public static DailyTargets calculate(CalculatorInput input) {
        double bmr = calculateBmr(input.weight, input.height, input.age, input.gender);
        double tdee = calculateTdee(bmr, input.activityLevel);
        double finalCalories = adjustCaloriesForGoal(tdee, input.dietGoal);

        MacronutrientRatios ratios = getMacronutrientRatiosForProfile();

        double proteinGrams = (finalCalories * ratios.proteinRatio) / PROTEIN_CALORIES_PER_GRAM;
        double carbsGrams = (finalCalories * ratios.carbsRatio) / CARBS_CALORIES_PER_GRAM;
        double fatGrams = (finalCalories * ratios.fatRatio) / FAT_CALORIES_PER_GRAM;

        return new DailyTargets(finalCalories, proteinGrams, carbsGrams, fatGrams);
    }

    private static double calculateBmr(double weight, double height, int age, Gender gender) {
        return switch (gender) {
            case MALE -> 10 * weight + 6.25 * height - 5 * age + 5;
            case FEMALE -> 10 * weight + 6.25 * height - 5 * age - 161;
        };
    }

    private static double calculateTdee(double bmr, ActivityLevel activityLevel) {
        double activityFactor = switch (activityLevel) {
            case SEDENTARY -> 1.2;
            case LIGHT -> 1.375;
            case MODERATE -> 1.55;
            case HIGH -> 1.725;
            case EXTREME -> 1.9;
        };
        return bmr * activityFactor;
    }

    private static double adjustCaloriesForGoal(double tdee, DietGoal dietGoal) {
        return switch (dietGoal) {
            case LOSE -> tdee - CALORIE_ADJUSTMENT_AMOUNT;
            case GAIN -> tdee + CALORIE_ADJUSTMENT_AMOUNT;
            case MAINTAIN -> tdee;
        };
    }

    private static MacronutrientRatios getMacronutrientRatiosForProfile() {
        return new MacronutrientRatios(0.20, 0.50, 0.30);
    }

    public record CalculatorInput(
            Double weight,
            Double height,
            Integer age,
            ActivityLevel activityLevel,
            Gender gender,
            DietGoal dietGoal
    ) {
    }

    public record DailyTargets(
            double calories,
            double proteinGrams,
            double carbsGrams,
            double fatGrams
    ) {
    }

    private record MacronutrientRatios(
            double proteinRatio,
            double carbsRatio,
            double fatRatio
    ) {
    }

}
