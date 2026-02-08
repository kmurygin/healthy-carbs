package org.kmurygin.healthycarbs.dietitian.collaboration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kmurygin.healthycarbs.exception.ForbiddenException;
import org.kmurygin.healthycarbs.exception.ResourceNotFoundException;
import org.kmurygin.healthycarbs.measurements.model.UserMeasurement;
import org.kmurygin.healthycarbs.measurements.repository.UserMeasurementRepository;
import org.kmurygin.healthycarbs.user.model.Role;
import org.kmurygin.healthycarbs.user.model.User;
import org.kmurygin.healthycarbs.user.service.UserService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final CollaborationRepository collaborationRepository;
    private final UserMeasurementRepository measurementRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    public List<User> getActiveClients(User dietitian) {
        return collaborationRepository.findActiveClientsByDietitian(dietitian);
    }

    public List<UserMeasurement> getClientMeasurements(User dietitian, Long clientId) {
        User client = userService.getUserById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", clientId.toString()));

        boolean hasAccess = collaborationRepository.existsByDietitianAndClientAndEndedAtIsNull(dietitian, client);

        if (!hasAccess) {
            throw new ForbiddenException("You do not have an active collaboration with this client.");
        }

        return measurementRepository.findAllByUserIdOrderByDateAsc(client.getId());
    }

    @Transactional
    public void establishCollaboration(Long dietitianId, Long clientId) {
        User dietitian = userService.getUserById(dietitianId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dietitianId.toString()));

        User client = userService.getUserById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", clientId.toString()));

        if (dietitian.getRole() != Role.DIETITIAN) {
            throw new ForbiddenException("Selected user is not a dietitian.");
        }
        if (client.getId().equals(dietitian.getId())) {
            throw new ForbiddenException("You cannot collaborate with yourself.");
        }

        boolean alreadyExists = collaborationRepository
                .existsByDietitianIdAndClientIdAndEndedAtIsNull(dietitianId, clientId);

        if (alreadyExists) {
            log.info("Collaboration between dietitian {} and client {} already exists, skipping", dietitianId, clientId);
            return;
        }

        Collaboration saved = collaborationRepository.save(
                Collaboration.builder()
                        .dietitian(dietitian)
                        .client(client)
                        .startedAt(OffsetDateTime.now())
                        .build()
        );

        eventPublisher.publishEvent(new CollaborationEstablishedEvent(
                saved.getId(),
                dietitian.getId(),
                dietitian.getEmail(),
                client.getId(),
                client.getUsername()
        ));
    }

    public List<Long> getActiveCollaborationDietitianIds(User client) {
        return collaborationRepository.findByClientAndEndedAtIsNull(client)
                .stream()
                .map(c -> c.getDietitian().getId())
                .toList();
    }

    @Transactional
    public void cancelCollaboration(User client, Long dietitianId) {
        User dietitian = userService.getUserById(dietitianId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", dietitianId.toString()));

        Collaboration link = collaborationRepository.findByDietitianAndClientAndEndedAtIsNull(dietitian, client)
                .orElseThrow(() -> new ResourceNotFoundException("Active collaboration not found"));

        link.terminate();
        collaborationRepository.save(link);
    }

    @Transactional
    public void terminateCollaboration(User dietitian, Long clientId) {
        User client = userService.getUserById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", clientId.toString()));

        Collaboration link = collaborationRepository.findByDietitianAndClientAndEndedAtIsNull(dietitian, client)
                .orElseThrow(() -> new ResourceNotFoundException("Active collaboration not found"));

        link.terminate();
        collaborationRepository.save(link);
    }
}