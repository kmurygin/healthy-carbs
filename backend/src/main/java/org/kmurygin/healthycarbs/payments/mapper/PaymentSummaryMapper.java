package org.kmurygin.healthycarbs.payments.mapper;

import org.kmurygin.healthycarbs.payments.dto.PaymentSummaryDTO;
import org.kmurygin.healthycarbs.payments.model.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentSummaryMapper {

    @Mapping(target = "provider", constant = "PayU")
    @Mapping(target = "orderId", source = "order.localOrderId")
    @Mapping(target = "amount", source = "order.totalAmount")
    @Mapping(target = "currency", source = "order.currency")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createdAt", source = "order.createdAt")
    @Mapping(target = "title", source = "order.description")
    PaymentSummaryDTO toDTO(Payment entity);

    List<PaymentSummaryDTO> toListDTO(List<Payment> entities);
}
