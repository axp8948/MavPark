package com.mavpark.service;

import com.mavpark.dto.ParkingUpdateRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ParkingService {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private ParkingUpdateRequest currentStatus = new ParkingUpdateRequest();

    public ParkingService(SimpMessagingTemplate simpMessagingTemplate) {
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    public void updateParkingData(ParkingUpdateRequest request) {
        this.currentStatus = request;

        simpMessagingTemplate.convertAndSend("/topic/parking", request);
    }

    public ParkingUpdateRequest getParkingStatus() {
        return currentStatus;
    }
}