package fu.se.cinemaxtheaterbe.features.concession.services;

import fu.se.cinemaxtheaterbe.entity.ConcessionItem;
import fu.se.cinemaxtheaterbe.features.concession.dtos.ConcessionRequest;
import fu.se.cinemaxtheaterbe.features.concession.dtos.ConcessionResponse;
import fu.se.cinemaxtheaterbe.features.concession.mappers.ConcessionMapper;
import fu.se.cinemaxtheaterbe.features.concession.repositories.ConcessionItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConcessionServiceImpl implements ConcessionService {

    private final ConcessionItemRepository repository;
    private final ConcessionMapper mapper;

    @Override
    public List<ConcessionResponse> getAllConcessions() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public ConcessionResponse getConcessionById(Long id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Concession item not found: " + id));
    }

    @Override
    public ConcessionResponse createConcession(ConcessionRequest request) {
        ConcessionItem item = mapper.toEntity(request);
        if (item.getStatus() == null) {
            item.setStatus("ACTIVE");
        }
        item = repository.save(item);
        return mapper.toResponse(item);
    }

    @Override
    public ConcessionResponse updateConcession(Long id, ConcessionRequest request) {
        ConcessionItem item = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Concession item not found: " + id));
        mapper.updateEntityFromRequest(request, item);
        item = repository.save(item);
        return mapper.toResponse(item);
    }

    @Override
    public void deleteConcession(Long id) {
        ConcessionItem item = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Concession item not found: " + id));
        item.setStatus("INACTIVE");
        repository.save(item);
    }
}
