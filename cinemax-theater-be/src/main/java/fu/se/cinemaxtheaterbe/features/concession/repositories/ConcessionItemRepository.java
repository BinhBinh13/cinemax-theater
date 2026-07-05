package fu.se.cinemaxtheaterbe.features.concession.repositories;

import fu.se.cinemaxtheaterbe.entity.ConcessionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConcessionItemRepository extends JpaRepository<ConcessionItem, Long> {
}
