package fu.se.cinemaxtheaterbe.features.concession.controllers;

import fu.se.cinemaxtheaterbe.features.concession.dtos.ConcessionRequest;
import fu.se.cinemaxtheaterbe.features.concession.dtos.ConcessionResponse;
import fu.se.cinemaxtheaterbe.features.concession.services.ConcessionService;
import fu.se.cinemaxtheaterbe.utils.ApiPath;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPath.CONCESSIONS)
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ConcessionController {

    private final ConcessionService service;

    @GetMapping
    public ResponseEntity<List<ConcessionResponse>> getAllConcessions() {
        return ResponseEntity.ok(service.getAllConcessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConcessionResponse> getConcession(@PathVariable Long id) {
        return ResponseEntity.ok(service.getConcessionById(id));
    }

    @PostMapping
    public ResponseEntity<ConcessionResponse> createConcession(@RequestBody ConcessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createConcession(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConcessionResponse> updateConcession(@PathVariable Long id, @RequestBody ConcessionRequest request) {
        return ResponseEntity.ok(service.updateConcession(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConcession(@PathVariable Long id) {
        service.deleteConcession(id);
        return ResponseEntity.noContent().build();
    }
}
