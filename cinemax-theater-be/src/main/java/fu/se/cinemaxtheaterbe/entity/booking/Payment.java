package fu.se.cinemaxtheaterbe.entity.booking;

import fu.se.cinemaxtheaterbe.entity.Auditable;
import jakarta.persistence.*;
import lombok.*;

/**
 * Payment-gateway record for a {@link Booking}: everything VNPAY (or any future
 * gateway) reports back about a transaction, kept separate from the booking's
 * own seat/food/customer details.
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", referencedColumnName = "booking_id", unique = true)
    private Booking booking;

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus; // PENDING, PAID, FAILED

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // VNPAY

    @Column(name = "txn_ref", unique = true, length = 100)
    private String txnRef; // Unique transaction reference reported by the gateway

    @Column(name = "pay_date", length = 50)
    private String payDate; // Raw vnp_PayDate returned by VNPAY
}
