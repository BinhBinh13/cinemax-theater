package fu.se.cinemaxtheaterbe.features.booking.repositories;

import fu.se.cinemaxtheaterbe.entity.theater.BookingFood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingFoodRepository extends JpaRepository<BookingFood, Long> {
}
