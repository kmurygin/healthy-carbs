package org.kmurygin.healthycarbs.dietitian.collaboration;

public record CollaborationEstablishedEvent(
        Long collaborationId,
        Long dietitianId,
        String dietitianEmail,
        Long clientId,
        String clientUsername
) {
}
