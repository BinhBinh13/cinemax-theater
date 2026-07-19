package fu.se.cinemaxtheaterbe.features.fooddrink.mappers;

import fu.se.cinemaxtheaterbe.entity.theater.TheaterStock;
import fu.se.cinemaxtheaterbe.features.fooddrink.dtos.FoodDrinkResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FoodDrinkMapper {

    FoodDrinkResponse toResponse(TheaterStock stock);
}
