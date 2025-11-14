package com.mavpark.controller;

import com.mavpark.service.CarService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "*")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @PostMapping("/update")
    public String updateCount(@RequestParam int count) {
        carService.updateCarCount(count);
        return "Car count updated to " + count;
    }

    @GetMapping("/count")
    public int getCount() {
        return carService.getCarCount();
    }
}
