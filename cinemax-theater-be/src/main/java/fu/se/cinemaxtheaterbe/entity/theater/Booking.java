package fu.se.cinemaxtheaterbe.entity.theater;

import fu.se.cinemaxtheaterbe.entity.Auditable;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "schedule_id", referencedColumnName = "schedule_id")
    private Schedule schedule;

    @Column(name = "full_name", nullable = false, columnDefinition = "NVARCHAR(150)")
    private String fullName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "booking_date", nullable = false)
    private LocalDateTime bookingDate;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus; // PENDING, PAID, FAILED

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // VNPAY

    @Column(name = "txn_ref", unique = true, length = 100)
    private String txnRef; // Unique transaction reference for VNPAY

    @Column(name = "pay_date", length = 50)
    private String payDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // PENDING, CONFIRMED, CANCELLED

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Ticket> tickets = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingFood> foods = new ArrayList<>();
}
