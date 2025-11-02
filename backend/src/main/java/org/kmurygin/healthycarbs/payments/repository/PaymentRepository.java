package org.kmurygin.healthycarbs.payments.repository;

import org.kmurygin.healthycarbs.payments.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByLocalOrderId(String localOrderId);
}
