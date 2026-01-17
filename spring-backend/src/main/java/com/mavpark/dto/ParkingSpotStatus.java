package com.mavpark.dto;

public class ParkingSpotStatus {

    private String spotId;
    private String status; // FREE or OCCUPIED

    public String getSpotId() {
        return spotId;
    }

    public void setSpotId(String spotId) {
        this.spotId = spotId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
