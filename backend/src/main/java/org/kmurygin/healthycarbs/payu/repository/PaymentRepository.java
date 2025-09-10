package org.kmurygin.healthycarbs.payu.repository;

import org.kmurygin.healthycarbs.payu.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByLocalOrderId(String localOrderId);
}
