package fu.se.cinemaxtheaterbe.features.booking.repositories;

import fu.se.cinemaxtheaterbe.entity.theater.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByTxnRef(String txnRef);

    List<Booking> findByUser_UsernameOrderByBookingDateDesc(String username);
}
