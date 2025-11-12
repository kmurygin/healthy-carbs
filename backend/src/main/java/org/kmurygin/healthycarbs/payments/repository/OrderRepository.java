package org.kmurygin.healthycarbs.payments.repository;

import org.kmurygin.healthycarbs.payments.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByLocalOrderId(String localOrderId);
}

