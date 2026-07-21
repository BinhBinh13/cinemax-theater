package fu.se.cinemaxtheaterbe.config;

import fu.se.cinemaxtheaterbe.entity.Movie;
import fu.se.cinemaxtheaterbe.entity.Role;
import fu.se.cinemaxtheaterbe.entity.User;
import fu.se.cinemaxtheaterbe.entity.enums.*;
import fu.se.cinemaxtheaterbe.entity.theater.Room;
import fu.se.cinemaxtheaterbe.entity.theater.Schedule;
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
                    if (r >= 5 && r <= 7) {
                        type = SeatType.VIP; // Rows E, F, G are VIP
                    } else if (r == 8) {
                        type = SeatType.COUPLE; // Row H is Couple
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
                    if (r >= 4 && r <= 5) {
                        type = SeatType.VIP; // Rows D, E are VIP
                    } else if (r == 6) {
                        type = SeatType.COUPLE; // Row F is Couple
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

        // 8. Seed 20 Movies
        Movie movie1 = createMovieIfNotFound("Inception", 148, 
                "Kẻ trích xuất giấc mơ - Kịch bản khoa học viễn tưởng đỉnh cao của đạo diễn Christopher Nolan.", 
                "/images/Inception_poster_1.jpg", LocalDate.now().minusDays(10), LocalDate.now().plusDays(20), MovieStatus.NOW_SHOWING);
        Movie movie2 = createMovieIfNotFound("Interstellar", 169, 
                "Hố đen vũ trụ - Hành trình đi tìm hành tinh sống mới ngoài không gian đầy nghẹt thở.", 
                "/images/Interstellar_poster.jpg", LocalDate.now().minusDays(5), LocalDate.now().plusDays(25), MovieStatus.NOW_SHOWING);
        Movie movie3 = createMovieIfNotFound("Avengers: Endgame", 181, 
                "Biệt đội siêu anh hùng: Hồi kết - Trận chiến lịch sử chống lại ác nhân Thanos cứu vũ trụ.", 
                "/images/Avengers_Endgame_bia_teaser.jpg", LocalDate.now().plusDays(1), LocalDate.now().plusDays(30), MovieStatus.COMING_SOON);

        createMovieIfNotFound("Dune: Part Two", 166, 
                "Hành Tinh Cát 2 - Paul Atreides hợp lực cùng Chani và người Fremen để trả thù những kẻ hủy hoại gia đình anh.", 
                "/images/dune2.jpg", LocalDate.now().minusDays(3), LocalDate.now().plusDays(27), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Oppenheimer", 180, 
                "Câu chuyện về nhà vật lý lý thuyết J. Robert Oppenheimer và vai trò của ông trong Dự án Manhattan.", 
                "/images/oppenheimer.jpg", LocalDate.now().minusDays(12), LocalDate.now().plusDays(18), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Spider-Man: Across the Spider-Verse", 140, 
                "Miles Morales du hành qua đa vũ trụ nhện và đối mặt với một đội ngũ Người Nhện bảo vệ sự tồn vong của thực tại.", 
                "/images/spidermanverse.jpg", LocalDate.now().minusDays(8), LocalDate.now().plusDays(22), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Avatar: The Way of Water", 192, 
                "Jake Sully và Neytiri khám phá các vùng biển của Pandora để bảo vệ gia đình trước mối đe dọa mới.", 
                "/images/avatarwayofwater.jpg", LocalDate.now().minusDays(15), LocalDate.now().plusDays(15), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Top Gun: Maverick", 130, 
                "Pete 'Maverick' Mitchell huấn luyện một đội phi công trẻ cho một nhiệm vụ chuyên biệt nguy hiểm.", 
                "/images/topgunmaverick.jpg", LocalDate.now().minusDays(20), LocalDate.now().plusDays(10), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("The Batman", 176, 
                "Hiệp sĩ bóng đêm điều tra vụ án giết người hàng loạt bí ẩn tại thành phố Gotham.", 
                "/images/thebatman.jpg", LocalDate.now().minusDays(14), LocalDate.now().plusDays(16), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Joker: Folie à Deux", 138, 
                "Cuộc hành trình điên rộn mới của Arthur Fleck và Harleen Quinzel.", 
                "/images/JOKER_FOLIE_À_DEUX_-_Vietnam_poster.jpg", LocalDate.now().plusDays(2), LocalDate.now().plusDays(32), MovieStatus.COMING_SOON);
        createMovieIfNotFound("Deadpool & Wolverine", 127, 
                "Deadpool hợp lực cùng Wolverine trong cuộc phiêu lưu xuyên đa vũ trụ vô cùng hài hước và kịch tính.", 
                "/images/deadpoolwoverine.jpg", LocalDate.now().minusDays(4), LocalDate.now().plusDays(26), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Inside Out 2", 96, 
                "Trở lại với tâm trí của Riley khi cô bước vào tuổi dậy thì với những cảm xúc mới xuất hiện.", 
                "/images/insideout2.jpg", LocalDate.now().minusDays(7), LocalDate.now().plusDays(23), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Kung Fu Panda 4", 94, 
                "Po phải tìm và huấn luyện một Thần Long Đại Hiệp mới trong khi đối đầu với Tắc Kè Bông.", 
                "/images/kungfupanda4.jpg", LocalDate.now().minusDays(18), LocalDate.now().plusDays(12), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Godzilla x Kong: The New Empire", 115, 
                "Godzilla và Kong phải tái hợp để chống lại một mối đe dọa khổng lồ ẩn giấu trong Trái Đất Rỗng.", 
                "/images/godzillavskongnewempire.jpg", LocalDate.now().minusDays(6), LocalDate.now().plusDays(24), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Transformers One", 104, 
                "Câu chuyện nguồn gốc chưa từng kể về tình bạn giữa Orion Pax và D-16 trước khi trở thành kình địch.", 
                "/images/Transformers_One_Official_Poster.jpg", LocalDate.now().plusDays(5), LocalDate.now().plusDays(35), MovieStatus.COMING_SOON);
        createMovieIfNotFound("Despicable Me 4", 95, 
                "Gru và gia đình đón thành viên mới Gru Jr. và đối mặt với kẻ thù mới Maxime Le Mal.", 
                "/images/despicableme4.jpeg", LocalDate.now().minusDays(9), LocalDate.now().plusDays(21), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Moana 2", 100, 
                "Moana và Maui tái hợp trong một chuyến đại hành trình mới vượt đại dương cùng những người đồng hành mới.", 
                "/images/Moana_2_poster.jpg", LocalDate.now().plusDays(10), LocalDate.now().plusDays(40), MovieStatus.COMING_SOON);
        createMovieIfNotFound("Kingdom of the Planet of the Apes", 145, 
                "Nhiều thế hệ sau triều đại của Caesar, một chú khỉ trẻ bắt đầu hành trình quyết định tương lai khỉ và người.", 
                "/images/Kingdom_of_Planet_of_Apes_VN_poster.jpg", LocalDate.now().minusDays(11), LocalDate.now().plusDays(19), MovieStatus.NOW_SHOWING);
        createMovieIfNotFound("Alien: Romulus", 119, 
                "Nhóm thanh niên khám phá một trạm vũ trụ bỏ hoang và đối mặt với hình thái sống đáng sợ nhất vũ trụ.", 
                "/images/ALIEN_ROMULUS_–_Vietnam_poster.jpg", LocalDate.now().plusDays(7), LocalDate.now().plusDays(37), MovieStatus.COMING_SOON);
        createMovieIfNotFound("Gladiator II", 148, 
                "Lucius bước vào Đấu trường La Mã để khôi phục vinh quang cho Rome.", 
                "/images/gladiator2.jpg", LocalDate.now().plusDays(12), LocalDate.now().plusDays(42), MovieStatus.COMING_SOON);

        log.info("Database initialized with 20 movies in total.");

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

    private Movie createMovieIfNotFound(String title, int duration, String description, String posterUrl, 
                                        LocalDate releaseDate, LocalDate endDate, MovieStatus status) {
        return movieRepository.findAll().stream()
                .filter(m -> m.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .map(existing -> {
                    existing.setDurationMinutes(duration);
                    existing.setDescription(description);
                    if (posterUrl != null && !posterUrl.isEmpty()) {
                        existing.setPosterUrl(posterUrl);
                    }
                    existing.setReleaseDate(releaseDate);
                    existing.setEndDate(endDate);
                    existing.setStatus(status);
                    return movieRepository.save(existing);
                })
                .orElseGet(() -> {
                    Movie movie = Movie.builder()
                            .title(title)
                            .durationMinutes(duration)
                            .description(description)
                            .posterUrl(posterUrl)
                            .releaseDate(releaseDate)
                            .endDate(endDate)
                            .status(status)
                            .build();
                    Movie saved = movieRepository.save(movie);
                    log.info("Movie created: {}", title);
                    return saved;
                });
    }
}
