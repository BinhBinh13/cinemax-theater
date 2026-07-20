package fu.se.cinemaxtheaterbe.config;

import fu.se.cinemaxtheaterbe.entity.Genre;
import fu.se.cinemaxtheaterbe.entity.theater.Theater;
import fu.se.cinemaxtheaterbe.features.genre.repositories.GenreRepository;
import fu.se.cinemaxtheaterbe.features.theater.repositories.TheaterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final GenreRepository genreRepository;
    private final TheaterRepository theaterRepository;

    @Override
    public void run(String... args) {
        seedGenres();
        seedTheater();
    }

    private void seedGenres() {
        if (genreRepository.count() > 0) {
            log.info("Genres already seeded, skipping.");
            return;
        }

        List<Genre> genres = List.of(
                Genre.builder().name("Action").build(),
                Genre.builder().name("Adventure").build(),
                Genre.builder().name("Animation").build(),
                Genre.builder().name("Comedy").build(),
                Genre.builder().name("Crime").build(),
                Genre.builder().name("Documentary").build(),
                Genre.builder().name("Drama").build(),
                Genre.builder().name("Family").build(),
                Genre.builder().name("Fantasy").build(),
                Genre.builder().name("History").build(),
                Genre.builder().name("Horror").build(),
                Genre.builder().name("Music").build(),
                Genre.builder().name("Mystery").build(),
                Genre.builder().name("Romance").build(),
                Genre.builder().name("Science Fiction").build(),
                Genre.builder().name("Thriller").build(),
                Genre.builder().name("War").build(),
                Genre.builder().name("Western").build()
        );

        genreRepository.saveAll(genres);
        log.info("Seeded {} genres.", genres.size());
    }

    private void seedTheater() {
        if (theaterRepository.count() > 0) {
            log.info("Theater already seeded, skipping.");
            return;
        }

        Theater theater = Theater.builder()
                .name("Cinemax Theater")
                .address("123 Main Street, City Center")
                .hotline("1900-1234")
                .description("Premium cinema experience")
                .build();

        theaterRepository.save(theater);
        log.info("Seeded theater: {}", theater.getName());
    }
}
