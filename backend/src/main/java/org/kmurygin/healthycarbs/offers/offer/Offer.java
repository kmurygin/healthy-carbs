package org.kmurygin.healthycarbs.offers.offer;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.kmurygin.healthycarbs.offers.Currency;
import org.kmurygin.healthycarbs.offers.mealPlanTemplate.MealPlanTemplate;

import java.util.Set;

@Entity
@Table(name = "offers")
@Getter
@Setter
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private int price;

    @Enumerated(EnumType.STRING)
    private Currency currency;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "offer_feature", joinColumns = @JoinColumn(name = "offer_id"))
    @Column(name = "feature")
    private Set<String> features;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "meal_plan_template_id", referencedColumnName = "id")
    private MealPlanTemplate mealPlanTemplate;

    private int durationInDays;

}
