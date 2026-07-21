package fu.se.cinemaxtheaterbe.features.concession.mappers;

import fu.se.cinemaxtheaterbe.entity.ConcessionItem;
import fu.se.cinemaxtheaterbe.features.concession.dtos.ConcessionRequest;
import fu.se.cinemaxtheaterbe.features.concession.dtos.ConcessionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ConcessionMapper {

    ConcessionResponse toResponse(ConcessionItem item);

    ConcessionItem toEntity(ConcessionRequest request);

    void updateEntityFromRequest(ConcessionRequest request, @MappingTarget ConcessionItem item);
}
