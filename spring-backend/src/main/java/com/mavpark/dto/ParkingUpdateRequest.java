package com.mavpark.dto;

import java.util.List;

public class ParkingUpdateRequest {

    private String parkingLotName;
    private int totalSpots;
    private int freeSpots;
    private int occupiedSpots;

    // NEW
    private List<ParkingSpotStatus> spots;

    public String getParkingLotName() {
        return parkingLotName;
    }

    public void setParkingLotName(String parkingLotName) {
        this.parkingLotName = parkingLotName;
    }

    public int getTotalSpots() {
        return totalSpots;
    }

    public void setTotalSpots(int totalSpots) {
        this.totalSpots = totalSpots;
    }

    public int getFreeSpots() {
        return freeSpots;
    }

    public void setFreeSpots(int freeSpots) {
        this.freeSpots = freeSpots;
    }

    public int getOccupiedSpots() {
        return occupiedSpots;
    }

    public void setOccupiedSpots(int occupiedSpots) {
        this.occupiedSpots = occupiedSpots;
    }

    // NEW
    public List<ParkingSpotStatus> getSpots() {
        return spots;
    }

    public void setSpots(List<ParkingSpotStatus> spots) {
        this.spots = spots;
    }
}
