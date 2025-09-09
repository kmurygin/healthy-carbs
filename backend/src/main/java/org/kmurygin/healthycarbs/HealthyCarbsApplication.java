package org.kmurygin.healthycarbs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan("org.kmurygin.healthycarbs")
public class HealthyCarbsApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthyCarbsApplication.class, args);
    }

}
