package com.manish.readme.controller;

import com.manish.readme.dto.GeneralMessageResponseDTO;
import com.manish.readme.dto.GenerateReadmeRequestDTO;
import com.manish.readme.service.ReadMeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ReadMeController {
    private final ReadMeService readMeService;

    @PostMapping(
            value = "/api/v1/readme",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public Flux<ServerSentEvent<String>> generateReadme(
            @RequestBody GenerateReadmeRequestDTO generateReadmeRequestDTO
    ) {
        log.info(" || called generateReadme in ReadMeController with {} ||", generateReadmeRequestDTO);

        return readMeService.generateReadme(generateReadmeRequestDTO)
                .map(chunk -> ServerSentEvent.<String>builder()
                        .data(chunk)
                        .build())
                .doOnComplete(() -> log.info(" || Completed README generation for {} ||", generateReadmeRequestDTO))
                .doOnError(error -> log.error(" || Error generating README: {} ||", error.getMessage()));
    }

    @GetMapping("/api/v1/health-check")
    public ResponseEntity<GeneralMessageResponseDTO> healthCheck() {
        log.info(" || called healthCheck in ReadMeController ||");
        return new ResponseEntity<>(new GeneralMessageResponseDTO("Read Me Service is running"), HttpStatus.OK);
    }
}
