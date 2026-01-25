package org.kmurygin.healthycarbs;

import org.junit.jupiter.api.Test;
import org.kmurygin.healthycarbs.storage.StorageProvider;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@ActiveProfiles("test")
@SpringBootTest
class HealthyCarbsApplicationTests {

    @MockitoBean
    private StorageProvider storageProvider;

    @Test
    void contextLoads() {
    }

}
