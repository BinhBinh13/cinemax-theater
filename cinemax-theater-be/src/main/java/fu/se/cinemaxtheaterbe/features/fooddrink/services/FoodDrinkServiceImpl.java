package fu.se.cinemaxtheaterbe.features.fooddrink.services;

import fu.se.cinemaxtheaterbe.entity.theater.Theater;
import fu.se.cinemaxtheaterbe.entity.theater.TheaterStock;
import fu.se.cinemaxtheaterbe.features.fooddrink.dtos.FoodDrinkRequest;
import fu.se.cinemaxtheaterbe.features.fooddrink.dtos.FoodDrinkResponse;
import fu.se.cinemaxtheaterbe.features.fooddrink.mappers.FoodDrinkMapper;
import fu.se.cinemaxtheaterbe.features.fooddrink.repositories.TheaterStockRepository;
import fu.se.cinemaxtheaterbe.features.theater.repositories.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodDrinkServiceImpl implements FoodDrinkService {

    private final TheaterStockRepository stockRepository;
    private final TheaterRepository theaterRepository;
    private final FoodDrinkMapper foodDrinkMapper;

    @Override
    public List<FoodDrinkResponse> getAllItems() {
        return stockRepository.findByDeletedFalse().stream()
                .map(foodDrinkMapper::toResponse)
                .toList();
    }

    @Override
    public FoodDrinkResponse getItemById(Long id) {
        return foodDrinkMapper.toResponse(findItemOrThrow(id));
    }

    @Override
    @Transactional
    public FoodDrinkResponse createItem(FoodDrinkRequest request) {
        validateNameUnique(request.getItemName(), null);
        Theater theater = findTheaterOrThrow();

        TheaterStock stock = TheaterStock.builder()
                .itemName(request.getItemName())
                .price(request.getPrice())
                .quantityInStock(request.getQuantityInStock())
                .imageURL(request.getImageURL())
                .itemType(request.getItemType())
                .status(request.getStatus())
                .theater(theater)
                .build();

        return foodDrinkMapper.toResponse(stockRepository.save(stock));
    }

    @Override
    @Transactional
    public FoodDrinkResponse updateItem(Long id, FoodDrinkRequest request) {
        TheaterStock stock = findItemOrThrow(id);
        validateNameUnique(request.getItemName(), id);

        stock.setItemName(request.getItemName());
        stock.setPrice(request.getPrice());
        stock.setQuantityInStock(request.getQuantityInStock());
        stock.setImageURL(request.getImageURL());
        stock.setItemType(request.getItemType());
        stock.setStatus(request.getStatus());

        return foodDrinkMapper.toResponse(stockRepository.save(stock));
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        TheaterStock stock = findItemOrThrow(id);
        stock.setDeleted(true);
        stock.setDeletedAt(LocalDateTime.now());
        stockRepository.save(stock);
    }

    private void validateNameUnique(String itemName, Long excludeId) {
        boolean exists = excludeId == null
                ? stockRepository.existsByItemNameIgnoreCaseAndDeletedFalse(itemName)
                : stockRepository.existsByItemNameIgnoreCaseAndDeletedFalseAndIdNot(itemName, excludeId);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An item with this name already exists");
        }
    }

    private Theater findTheaterOrThrow() {
        return theaterRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "No theater configured"));
    }

    private TheaterStock findItemOrThrow(Long id) {
        return stockRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found: " + id));
    }
}
