package fu.se.cinemaxtheaterbe.features.payment.repositories;

import fu.se.cinemaxtheaterbe.entity.booking.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTxnRef(String txnRef);

    Optional<Payment> findByBooking_Id(Long bookingId);
}
