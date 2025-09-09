package org.kmurygin.healthycarbs.payu.repository;

import org.kmurygin.healthycarbs.payu.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByLocalOrderId(String localOrderId);
}

