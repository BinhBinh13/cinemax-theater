package fu.se.cinemaxtheaterbe.config;

import fu.se.cinemaxtheaterbe.entity.movie.Movie;
import fu.se.cinemaxtheaterbe.entity.user.Role;
import fu.se.cinemaxtheaterbe.entity.user.User;
import fu.se.cinemaxtheaterbe.entity.enums.*;
import fu.se.cinemaxtheaterbe.entity.theater.Room;
import fu.se.cinemaxtheaterbe.entity.movie.Schedule;
import fu.se.cinemaxtheaterbe.entity.theater.Seat;
import fu.se.cinemaxtheaterbe.entity.theater.Theater;
import fu.se.cinemaxtheaterbe.features.auth.repositories.RoleRepository;
import fu.se.cinemaxtheaterbe.features.auth.repositories.UserRepository;
import fu.se.cinemaxtheaterbe.features.movie.repositories.MovieRepository;
import fu.se.cinemaxtheaterbe.features.movieschedule.repositories.MovieScheduleRepository;
import fu.se.cinemaxtheaterbe.features.room.repositories.RoomRepository;
import fu.se.cinemaxtheaterbe.features.room.repositories.SeatRepository;
import fu.se.cinemaxtheaterbe.features.theater.repositories.TheaterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // Seeding dependencies
    private final TheaterRepository theaterRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final MovieRepository movieRepository;
    private final MovieScheduleRepository scheduleRepository;

    @Override
    public void run(String... args) {
        log.info("Starting database initialization...");

        // 1. Seed Roles
        Role adminRole = createRoleIfNotFound("ADMIN", "System administrator with full control");
        Role staffRole = createRoleIfNotFound("STAFF", "Theater staff for managing schedules and movies");
        Role customerRole = createRoleIfNotFound("CUSTOMER", "Movie theater customer");

        // 2. Seed Admin User
        if (!userRepository.existsByUsername("admin")) {
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(adminRole);
            adminRoles.add(staffRole); // Admin can also perform staff tasks

            User admin = User.builder()
                    .username("admin")
                    .email("admin@cinemax.com")
                    .passwordHash(passwordEncoder.encode("adminpassword"))
                    .fullName("System Administrator")
                    .phone("0123456789")
                    .status(UserStatus.Active)
                    .roles(adminRoles)
                    .build();

            userRepository.save(admin);
            log.info("Default ADMIN user created: username=admin, password=adminpassword");
        }

        // 3. Seed Staff User
        if (!userRepository.existsByUsername("staff")) {
            Set<Role> staffRoles = new HashSet<>();
            staffRoles.add(staffRole);

            User staff = User.builder()
                    .username("staff")
                    .email("staff@cinemax.com")
                    .passwordHash(passwordEncoder.encode("staffpassword"))
                    .fullName("Theater Staff")
                    .phone("0987654321")
                    .status(UserStatus.Active)
                    .roles(staffRoles)
                    .build();

            userRepository.save(staff);
            log.info("Default STAFF user created: username=staff, password=staffpassword");
        }

        // 4. Seed Customer User
        if (!userRepository.existsByUsername("customer")) {
            Set<Role> customerRoles = new HashSet<>();
            customerRoles.add(customerRole);

            User customer = User.builder()
                    .username("customer")
                    .email("customer@cinemax.com")
                    .passwordHash(passwordEncoder.encode("customerpassword"))
                    .fullName("John Doe")
                    .phone("0111222333")
                    .status(UserStatus.Active)
                    .roles(customerRoles)
                    .build();

            userRepository.save(customer);
            log.info("Default CUSTOMER user created: username=customer, password=customerpassword");
        }

        // 5. Seed Theater
        Theater theater;
        if (theaterRepository.count() == 0) {
            theater = Theater.builder()
                    .name("Cinemax Grand Center")
                    .address("123 Cinema Street, Hanoi")
                    .hotline("19001234")
                    .description("Hệ thống rạp chiếu phim chất lượng hàng đầu Việt Nam")
                    .build();
            theater = theaterRepository.save(theater);
            log.info("Seeded Theater: {}", theater.getName());
        } else {
            theater = theaterRepository.findAll().get(0);
        }

        // 6. Seed Rooms
        Room room1;
        Room room2;
        if (roomRepository.count() == 0) {
            room1 = Room.builder()
                    .name("Phòng Chiếu 1")
                    .rowCount(8)
                    .columnCount(10)
                    .status(RoomStatus.ACTIVE)
                    .theater(theater)
                    .build();
            room1 = roomRepository.save(room1);

            room2 = Room.builder()
                    .name("Phòng Chiếu 2")
                    .rowCount(6)
                    .columnCount(8)
                    .status(RoomStatus.ACTIVE)
                    .theater(theater)
                    .build();
            room2 = roomRepository.save(room2);
            log.info("Seeded 2 Rooms: Phòng Chiếu 1 and Phòng Chiếu 2");
        } else {
            List<Room> rooms = roomRepository.findAll();
            room1 = rooms.get(0);
            room2 = rooms.size() > 1 ? rooms.get(1) : rooms.get(0);
        }

        // 7. Seed Seats
        if (seatRepository.count() == 0) {
            List<Seat> seatsToSave = new ArrayList<>();

            // Seed seats for Room 1 (8x10 = 80 seats)
            for (int r = 1; r <= 8; r++) {
                String rowLabel = String.valueOf((char) ('A' + r - 1));
                for (int c = 1; c <= 10; c++) {
                    SeatType type = SeatType.NORMAL;
                    if (r >= 5 && r <= 8) {
                        type = SeatType.VIP; // Rows E, F, G, H are VIP
                    }
                    Seat seat = Seat.builder()
                            .seatRow(rowLabel)
                            .seatColumn(c)
                            .seatType(type)
                            .status(SeatStatus.ACTIVE)
                            .room(room1)
                            .build();
                    seatsToSave.add(seat);
                }
            }

            // Seed seats for Room 2 (6x8 = 48 seats)
            for (int r = 1; r <= 6; r++) {
                String rowLabel = String.valueOf((char) ('A' + r - 1));
                for (int c = 1; c <= 8; c++) {
                    SeatType type = SeatType.NORMAL;
                    if (r >= 4 && r <= 6) {
                        type = SeatType.VIP; // Rows D, E, F are VIP
                    }
                    Seat seat = Seat.builder()
                            .seatRow(rowLabel)
                            .seatColumn(c)
                            .seatType(type)
                            .status(SeatStatus.ACTIVE)
                            .room(room2)
                            .build();
                    seatsToSave.add(seat);
                }
            }

            seatRepository.saveAll(seatsToSave);
            log.info("Seeded {} seats in total for Room 1 & Room 2", seatsToSave.size());
        }

        // 8. Seed Movies
        Movie movie1;
        Movie movie2;
        Movie movie3;
        if (movieRepository.count() == 0) {
            movie1 = Movie.builder()
                    .title("Inception")
                    .durationMinutes(148)
                    .description("Kẻ trích xuất giấc mơ - Kịch bản khoa học viễn tưởng đỉnh cao của đạo diễn Christopher Nolan.")
                    .posterUrl("https://image.tmdb.org/t/p/original/qmDp59hUgRStpeAfAlsbHGTYMvj.jpg")
                    .releaseDate(LocalDate.now().minusDays(10))
                    .endDate(LocalDate.now().plusDays(20))
                    .status(MovieStatus.NOW_SHOWING)
                    .build();
            movie1 = movieRepository.save(movie1);

            movie2 = Movie.builder()
                    .title("Interstellar")
                    .durationMinutes(169)
                    .description("Hố đen vũ trụ - Hành trình đi tìm hành tinh sống mới ngoài không gian đầy nghẹt thở.")
                    .posterUrl("https://image.tmdb.org/t/p/original/gEU2QvHOm42GCv7et24Jif1jGv1.jpg")
                    .releaseDate(LocalDate.now().minusDays(5))
                    .endDate(LocalDate.now().plusDays(25))
                    .status(MovieStatus.NOW_SHOWING)
                    .build();
            movie2 = movieRepository.save(movie2);

            movie3 = Movie.builder()
                    .title("Avengers: Endgame")
                    .durationMinutes(181)
                    .description("Biệt đội siêu anh hùng: Hồi kết - Trận chiến lịch sử chống lại ác nhân Thanos cứu vũ trụ.")
                    .posterUrl("https://image.tmdb.org/t/p/original/or06seB2lUki45Rb3wwOIU8gcw4.jpg")
                    .releaseDate(LocalDate.now().plusDays(1)) // Upcoming
                    .endDate(LocalDate.now().plusDays(30))
                    .status(MovieStatus.COMING_SOON)
                    .build();
            movie3 = movieRepository.save(movie3);

            log.info("Seeded 3 movies: Inception, Interstellar, Avengers: Endgame");
        } else {
            List<Movie> movies = movieRepository.findAll();
            movie1 = movies.get(0);
            movie2 = movies.size() > 1 ? movies.get(1) : movies.get(0);
            movie3 = movies.size() > 2 ? movies.get(2) : movies.get(0);
        }

        // 9. Seed Schedules
        if (scheduleRepository.count() == 0) {
            Schedule s1 = Schedule.builder()
                    .startTime(LocalDateTime.now().withHour(14).withMinute(0).withSecond(0))
                    .endTime(LocalDateTime.now().withHour(16).withMinute(30).withSecond(0))
                    .price(new BigDecimal("75000"))
                    .status(MovieScheduleStatus.SHOWING)
                    .movie(movie1)
                    .room(room1)
                    .build();
            scheduleRepository.save(s1);

            Schedule s2 = Schedule.builder()
                    .startTime(LocalDateTime.now().withHour(19).withMinute(30).withSecond(0))
                    .endTime(LocalDateTime.now().withHour(22).withMinute(0).withSecond(0))
                    .price(new BigDecimal("85000"))
                    .status(MovieScheduleStatus.SHOWING)
                    .movie(movie1)
                    .room(room2)
                    .build();
            scheduleRepository.save(s2);

            Schedule s3 = Schedule.builder()
                    .startTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0))
                    .endTime(LocalDateTime.now().plusDays(1).withHour(12).withMinute(50).withSecond(0))
                    .price(new BigDecimal("70000"))
                    .status(MovieScheduleStatus.UPCOMING)
                    .movie(movie2)
                    .room(room1)
                    .build();
            scheduleRepository.save(s3);

            log.info("Seeded 3 Schedules for testing showtimes");
        }

        log.info("Database initialization completed successfully.");
    }

    private Role createRoleIfNotFound(String name, String description) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = Role.builder()
                            .name(name)
                            .description(description)
                            .build();
                    Role savedRole = roleRepository.save(role);
                    log.info("Role created: {}", name);
                    return savedRole;
                });
    }
}
