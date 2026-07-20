package fu.se.cinemaxtheaterbe.features.fooddrink.services;

import fu.se.cinemaxtheaterbe.features.fooddrink.dtos.FoodDrinkRequest;
import fu.se.cinemaxtheaterbe.features.fooddrink.dtos.FoodDrinkResponse;

import java.util.List;

public interface FoodDrinkService {

    List<FoodDrinkResponse> getAllItems();

    FoodDrinkResponse getItemById(Long id);

    FoodDrinkResponse createItem(FoodDrinkRequest request);

    FoodDrinkResponse updateItem(Long id, FoodDrinkRequest request);

    void deleteItem(Long id);
}
