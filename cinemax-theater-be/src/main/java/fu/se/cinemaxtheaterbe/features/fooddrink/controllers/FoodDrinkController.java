package fu.se.cinemaxtheaterbe.features.fooddrink.controllers;

import fu.se.cinemaxtheaterbe.features.fooddrink.dtos.FoodDrinkRequest;
import fu.se.cinemaxtheaterbe.features.fooddrink.dtos.FoodDrinkResponse;
import fu.se.cinemaxtheaterbe.features.fooddrink.services.FoodDrinkService;
import fu.se.cinemaxtheaterbe.utils.ApiPath;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiPath.FOOD_DRINKS)
@RequiredArgsConstructor
public class FoodDrinkController {

    private final FoodDrinkService foodDrinkService;

    @GetMapping
    public ResponseEntity<List<FoodDrinkResponse>> getAllItems() {
        return ResponseEntity.ok(foodDrinkService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodDrinkResponse> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(foodDrinkService.getItemById(id));
    }

    @PostMapping
    public ResponseEntity<FoodDrinkResponse> createItem(@Valid @ModelAttribute FoodDrinkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foodDrinkService.createItem(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodDrinkResponse> updateItem(@PathVariable Long id,
                                                         @Valid @ModelAttribute FoodDrinkRequest request) {
        return ResponseEntity.ok(foodDrinkService.updateItem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        foodDrinkService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
