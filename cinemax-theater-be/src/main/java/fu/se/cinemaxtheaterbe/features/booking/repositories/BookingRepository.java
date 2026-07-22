package fu.se.cinemaxtheaterbe.features.booking.repositories;

import fu.se.cinemaxtheaterbe.entity.booking.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser_UsernameOrderByBookingDateDesc(String username);

    boolean existsBySchedule_Id(Long scheduleId);
}
