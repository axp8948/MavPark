package com.mavpark.dto;

public class ParkingUpdateRequest {

    private String parkingLotName;
    private int totalSpots;
    private int freeSpots;
    private int occupiedSpots;

    // Getters and Setters
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
}
