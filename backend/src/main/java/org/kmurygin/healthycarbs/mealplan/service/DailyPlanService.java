package org.kmurygin.healthycarbs.mealplan.service;

import org.kmurygin.healthycarbs.mealplan.model.DailyPlan;
import org.kmurygin.healthycarbs.mealplan.repository.DailyPlanRepository;import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DailyPlanService {

    private final DailyPlanRepository dailyPlanRepository;

    public DailyPlanService(DailyPlanRepository dailyPlanRepository) {
        this.dailyPlanRepository = dailyPlanRepository;
    }

    public List<DailyPlan> findAll() {
        return dailyPlanRepository.findAll();
    }

    public DailyPlan findById(Long id) {
        return dailyPlanRepository.findById(id).orElse(null);
    }

    public DailyPlan save(DailyPlan dailyPlan) {
        return dailyPlanRepository.save(dailyPlan);
    }

    public void deleteById(Long id) {
        dailyPlanRepository.deleteById(id);
    }

}
