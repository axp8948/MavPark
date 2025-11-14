package com.mavpark.controller;

import com.mavpark.dto.ParkingUpdateRequest;
import com.mavpark.service.ParkingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/parking")
@CrossOrigin(origins = "*")
public class ParkingController {

    private final ParkingService parkingService;

    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    @PostMapping("/update")
    public String updateParking(@RequestBody ParkingUpdateRequest request) {
        parkingService.updateParkingData(request);
        return "Parking data updated!";
    }

    @GetMapping("/status")
    public ParkingUpdateRequest getParkingStatus() {
        return parkingService.getParkingStatus();
    }
}