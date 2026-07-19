package fu.se.cinemaxtheaterbe.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;


@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditingConfig {

    private static final Logger log = LoggerFactory.getLogger(JpaAuditingConfig.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.of("system");
            }
            return Optional.of(authentication.getName());
        };
    }

    @PostConstruct
    public void dropOldStatusConstraints() {
        try {
            String sql = """
                DECLARE @cn NVARCHAR(256);
                SELECT @cn = name FROM sys.check_constraints
                WHERE parent_object_id = OBJECT_ID('movies') AND COL_NAME(parent_object_id, parent_column_id) = 'status';
                IF @cn IS NOT NULL EXEC('ALTER TABLE movies DROP CONSTRAINT ' + @cn);
                """;
            jdbcTemplate.execute(sql);
            log.info("Dropped old CHECK constraint on movies.status (if any)");
        } catch (Exception e) {
            log.warn("Could not drop constraint on movies.status: {}", e.getMessage());
        }
    }
}
