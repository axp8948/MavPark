package com.mavpark.service;

import org.springframework.stereotype.Service;

@Service
public class CarService {
    private int carCount = 0;

    public void updateCarCount(int count) {
        this.carCount = count;
        System.out.println("Updated car count: " + count);
    }

    public int getCarCount() {
        return carCount;
    }
}


