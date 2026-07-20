package fu.se.cinemaxtheaterbe.features.fooddrink.repositories;

import fu.se.cinemaxtheaterbe.entity.theater.TheaterStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TheaterStockRepository extends JpaRepository<TheaterStock, Long> {

    List<TheaterStock> findByDeletedFalse();

    Optional<TheaterStock> findByIdAndDeletedFalse(Long id);

    boolean existsByItemNameIgnoreCaseAndDeletedFalse(String itemName);

    boolean existsByItemNameIgnoreCaseAndDeletedFalseAndIdNot(String itemName, Long id);
}
