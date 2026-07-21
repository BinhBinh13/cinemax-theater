package fu.se.cinemaxtheaterbe.features.concession.services;

import fu.se.cinemaxtheaterbe.features.concession.dtos.ConcessionRequest;
import fu.se.cinemaxtheaterbe.features.concession.dtos.ConcessionResponse;

import java.util.List;

public interface ConcessionService {

    List<ConcessionResponse> getAllConcessions();

    ConcessionResponse getConcessionById(Long id);

    ConcessionResponse createConcession(ConcessionRequest request);

    ConcessionResponse updateConcession(Long id, ConcessionRequest request);

    void deleteConcession(Long id);
}
