package org.kmurygin.healthycarbs.payments.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

public final class CollaborationOrderUtil {

    private static final String COLLABORATION_ORDER_PREFIX = "healthy-carbs-collab-";

    private CollaborationOrderUtil() {
    }

    public static Optional<CollaborationOrderInfo> parse(String localOrderId) {
        try {
            String decoded = new String(Base64.getDecoder().decode(localOrderId), StandardCharsets.UTF_8);
            if (!decoded.startsWith(COLLABORATION_ORDER_PREFIX)) {
                return Optional.empty();
            }
            String[] parts = decoded.split("-");
            return Optional.of(new CollaborationOrderInfo(Long.parseLong(parts[3])));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    public static boolean isCollaborationOrder(String localOrderId) {
        try {
            String decoded = new String(Base64.getDecoder().decode(localOrderId), StandardCharsets.UTF_8);
            return decoded.startsWith(COLLABORATION_ORDER_PREFIX);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public record CollaborationOrderInfo(Long dietitianId) {
    }
}
